"""Human review workflow: review sheets, approvals bound to content hashes, and applying them to JSONL.

Usage:
    python data/scripts/review.py sheet   data/jsonl/<node>.jsonl          -> data/review/<node>.md
    python data/scripts/review.py approve data/jsonl/<node>.jsonl --reviewer NAME [--ids ID ...] [--note TEXT]
    python data/scripts/review.py revoke  ID [ID ...]
    python data/scripts/review.py apply   [data/jsonl]                       (also called by every builder)

An approval stores the entry's content hash from data/registry/ids.json. It only applies while that hash is
unchanged, so any rebuild that changes content sends the entry back to draft. Applying an approval sets
status="reviewed", needs_review=false and marks open conflicts as accepted by the reviewer.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEWS = ROOT / "registry" / "reviews.json"
IDS = ROOT / "registry" / "ids.json"


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_reviews() -> dict:
    return json.loads(REVIEWS.read_text(encoding="utf-8")) if REVIEWS.exists() else {}


def save_reviews(reviews: dict) -> None:
    REVIEWS.write_text(json.dumps(reviews, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def write_jsonl(path: Path, entries: list[dict]) -> None:
    path.write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in entries), encoding="utf-8")


ACCEPTED = "accepted at review by "


def unknown_licenses(e: dict) -> list[str]:
    return [s["name"] for s in e.get("sources", []) if s.get("license") == "unknown"]


def clear_review(e: dict) -> None:
    """Undo apply_reviews so a revoked or stale approval leaves the builder's draft state."""
    if "review" not in e:
        return
    e.pop("review")
    e["status"] = "draft"
    for c in e.get("conflicts", []):
        if (c.get("resolution") or "").startswith(ACCEPTED):
            c["resolved"], c["resolution"] = False, None
    e["needs_review"] = "options" in e or bool(unknown_licenses(e)) or any(not c.get("resolved") for c in e.get("conflicts", []))


def apply_reviews(entries: list[dict], registry: dict) -> int:
    """Mutates entries in place; returns how many are reviewed."""
    reviews, n = load_reviews(), 0
    for e in entries:
        rv = reviews.get(e["id"])
        current = registry["versions"].get(e["id"], {}).get("hash")
        if not rv or rv["hash"] != current:
            continue
        e["status"] = "reviewed"
        e["needs_review"] = False
        for c in e.get("conflicts", []):
            if not c.get("resolved"):
                c["resolved"] = True
                c["resolution"] = f"{ACCEPTED}{rv['reviewer']} ({rv['reviewed_at'][:10]})"
        e["review"] = {"reviewer": rv["reviewer"], "reviewed_at": rv["reviewed_at"], "note": rv.get("note")}
        n += 1
    return n


def cmd_apply(paths: list[str]) -> None:
    registry = json.loads(IDS.read_text(encoding="utf-8"))
    roots = paths or [str(ROOT / "jsonl"), str(ROOT / "exercises")]
    files = [f for p in roots for f in (sorted(Path(p).glob("*.jsonl")) if Path(p).is_dir() else [Path(p)])]
    for f in files:
        entries = read_jsonl(f)
        for e in entries:
            clear_review(e)
        n = apply_reviews(entries, registry)
        write_jsonl(f, entries)
        print(f"{f.name}: {n}/{len(entries)} reviewed")


def cmd_approve(path: str, reviewer: str, ids: list[str] | None, note: str | None) -> None:
    registry = json.loads(IDS.read_text(encoding="utf-8"))
    reviews = load_reviews()
    entries = read_jsonl(Path(path))
    chosen = [e for e in entries if not ids or e["id"] in ids]
    missing = set(ids or []) - {e["id"] for e in chosen}
    if missing:
        raise SystemExit(f"unknown ids: {sorted(missing)}")
    for e in chosen:
        reviews[e["id"]] = {"hash": registry["versions"][e["id"]]["hash"], "reviewer": reviewer,
                            "reviewed_at": now(), "note": note, "headword": e.get("headword") or e.get("stem")}
    save_reviews(reviews)
    print(f"approved {len(chosen)} entries by {reviewer}")
    cmd_apply([path])


def cmd_revoke(ids: list[str]) -> None:
    reviews = load_reviews()
    for i in ids:
        reviews.pop(i, None)
    save_reviews(reviews)
    cmd_apply([])


def exercise_lines(x: dict) -> list[str]:
    lines = [f"## [ ] {x['id']} · {x['exam']} {x['exam_part']} · {x['skill_tag']} · độ khó {x['difficulty']} · v{x['version']} · {x['status']}",
             "", f"{x['instruction']}  ", f"_{x['instruction_vi']}_", "",
             f"**{re.sub(r'\[\[(.+?)\]\]', r'<u>\1</u>', x['stem'])}**  ", f"_{x['stem_vi']}_", ""]
    for o in x["options"]:
        mark = "✅" if o["correct"] else "❌"
        lines.append(f"- {o['label']} {o['text']} {mark}" + (f" — {o['rationale_vi']}" if o["rationale_vi"] else ""))
    lines += ["", f"Giải thích: {x['explanation_vi']}", f"Mục dùng: {', '.join(x['target_ids'] + x['distractor_ids'])}", ""]
    return lines


def cmd_sheet(path: str) -> None:
    entries = read_jsonl(Path(path))
    node = (entries[0].get("set_id") or entries[0]["node_id"]) if entries else Path(path).stem
    lines = [f"# Phiếu duyệt — {node}", "",
             "Đánh dấu [x] mục đạt, ghi chú mục cần sửa, rồi chạy:",
             f"`python data/scripts/review.py approve {Path(path).as_posix()} --reviewer \"Tên\" [--ids ...]`", ""]
    for e in entries:
        if "options" in e:
            lines += exercise_lines(e)
            continue
        info = e.get("kanji_info") or {}
        head = f"{e['headword']}" + (f" 【{e['reading']}】" if e.get("reading") else "") + (f" — Hán Việt {info['han_viet']}" if info else "")
        lines += [f"## [ ] {e['id']} · {head} · {e['pos']} · {e['learning']['level']} · v{e['version']} · {e['status']}", ""]
        for s in e["senses"]:
            tr = "; ".join(f"{t['target']}: {t['text']} ({t['equivalence']}, p{t['priority']})" for t in s["translations"])
            lines.append(f"- **{s['sense_id']}** {s['definition_native']} → {tr}")
            if s.get("usage_notes_vi"):
                lines.append(f"  - Ghi chú: {s['usage_notes_vi']}")
            if s.get("false_friend_note"):
                lines.append(f"  - Bẫy nghĩa: {s['false_friend_note']}")
        for x in e["examples"]:
            tr = " | ".join(f"{k}: {v}" for k, v in x["translations"].items())
            lines.append(f"- Ví dụ: {x['text']}" + (f" 〔{x['reading']}〕" if x.get("reading") else "") + f" — {tr}")
            lines.append(f"  - Nguồn: {x['source']} · {x['license']}")
        open_c = [c for c in e.get("conflicts", []) if not c.get("resolved")]
        for c in open_c:
            lines.append(f"- ⚠ Xung đột mở ({c['field']}): {c['detail']}")
        for name in unknown_licenses(e):
            lines.append(f"- ⚠ License chưa rõ: {name} — chỉ dùng làm dữ kiện, kiểm tra trước khi duyệt")
        lines.append(f"- Nguồn: " + "; ".join(f"{s['name']} [{s['license']}]" for s in e["sources"]))
        lines.append("")
    out = ROOT / "review" / f"{node}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", out)


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sheet"); s.add_argument("path")
    a = sub.add_parser("approve"); a.add_argument("path"); a.add_argument("--reviewer", required=True)
    a.add_argument("--ids", nargs="*"); a.add_argument("--note")
    r = sub.add_parser("revoke"); r.add_argument("ids", nargs="+")
    p = sub.add_parser("apply"); p.add_argument("paths", nargs="*")
    args = ap.parse_args()
    if args.cmd == "sheet":
        cmd_sheet(args.path)
    elif args.cmd == "approve":
        cmd_approve(args.path, args.reviewer, args.ids, args.note)
    elif args.cmd == "revoke":
        cmd_revoke(args.ids)
    else:
        cmd_apply(args.paths)


if __name__ == "__main__":
    sys.exit(main())
