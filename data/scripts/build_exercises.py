"""EXERCISES: build exam-format multiple-choice items from reviewed lexicon entries only.

Usage:
    python data/scripts/build_exercises.py <set_id> [...]   [--db]
    python data/scripts/build_exercises.py --all            [--db]
    python data/scripts/build_exercises.py --all --preview      (data/review/<set_id>.preview.md, ignores review state)

Input:  data/editorial/exercises/<set_id>.json  (stems, options and Vietnamese rationales written from scratch;
        the first option is the key) + data/jsonl/*.jsonl (lexicon entries).
Output: data/exercises/<set_id>.jsonl, and with --db the lex_exercise / lex_exercise_entry tables.

An item is built only when every entry it targets or draws distractors from has status="reviewed"; other items are
reported as blocked. Checks: 4 unique options, one key, a rationale per distractor, explanation, skill tag,
difficulty 1-5, the key matches the target entry, EN stem/options within the CEFR level (CEFR-J), JA kanji within
the JLPT level or followed by furigana written as 漢字《かんじ》 (orthography distractors are exempt by design).
"""

from __future__ import annotations

import hashlib
import json
import random
import re
import sys
from datetime import datetime, timezone

from build_en_vocab import above_level, cefrj_index
from build_ja_vocab import ROOT, load_registry, save_registry
from review import apply_reviews, exercise_lines

KANA = re.compile(r"^[\u3040-\u309f\u30a0-\u30ffー]+$")
KANJI = re.compile(r"[\u4e00-\u9fff々]")
JLPT_NEW = {"N5": 5, "N4": 4, "N3": 3, "N2": 2, "N1": 1}


def load_entries() -> dict[str, dict]:
    out = {}
    for f in sorted((ROOT / "jsonl").glob("*.jsonl")):
        for line in f.read_text(encoding="utf-8").splitlines():
            if line.strip():
                e = json.loads(line)
                out[e["id"]] = e
    return out


def format_source(slug: str) -> dict:
    src = json.loads((ROOT / "plan" / "plan.json").read_text(encoding="utf-8"))["sources"][slug]
    return {"name": src["name"], "url": src["url"], "license": src["license"], "retrieved_at": src["retrieved_at"],
            "used_for": "exam format only (item type names, number of options)"}


def kanji_levels() -> dict[str, int]:
    p = ROOT / "raw" / "cache" / "dl" / "kanji-data.json"
    if not p.exists():
        raise SystemExit(f"{p} missing: run `python data/scripts/bank.py fetch` first.")
    data = json.loads(p.read_text(encoding="utf-8"))
    return {k: v["jlpt_new"] for k, v in data.items() if v.get("jlpt_new")}


def stem_of(headword: str) -> str:
    return re.sub(r"[\u3040-\u309f]+$", "", headword) or headword


def ja_level_errors(text: str, level: str, levels: dict[str, int]) -> list[str]:
    limit, bad = JLPT_NEW[level], []
    plain = re.sub(r"\[\[|\]\]", "", text)
    for m in re.finditer(r"[\u4e00-\u9fff々]+", plain):
        has_ruby = plain[m.end():m.end() + 1] == "《"
        for ch in m.group():
            if levels.get(ch, 0) < limit and not has_ruby:
                bad.append(ch)
    return bad


def check_item(item: dict, spec: dict, entries: dict, ctx: dict) -> list[str]:
    errs, key = [], item["key"]
    opts = item["options"]
    texts = [o["text"] for o in opts]
    if len(opts) != 4 or len(set(texts)) != 4:
        errs.append(f"{key}: need 4 unique options")
    if any(not o.get("why_vi") for o in opts[1:]) or opts[0].get("why_vi"):
        errs.append(f"{key}: every distractor (and only distractors) needs why_vi")
    if not item.get("explanation_vi") or not item.get("stem_vi"):
        errs.append(f"{key}: missing explanation_vi/stem_vi")
    if item["difficulty"] not in range(1, 6):
        errs.append(f"{key}: difficulty must be 1-5")
    t, stem, answer = item["type"], item["stem"], texts[0]
    target = entries[item["targets"][0]]
    marked = re.findall(r"\[\[(.+?)\]\]", stem)

    if t == "kanji_reading":
        if len(marked) != 1 or not KANA.match(answer):
            errs.append(f"{key}: kanji_reading needs one [[...]] and a kana key")
        elif stem_of(target["headword"]) not in marked[0]:
            errs.append(f"{key}: marked text does not contain target {target['headword']}")
        elif target.get("reading") and not answer.startswith(stem_of(target["reading"])[:-1] or target["reading"]):
            errs.append(f"{key}: key {answer} does not match reading {target['reading']}")
    elif t == "orthography":
        if len(marked) != 1 or not KANA.match(marked[0]) or stem_of(target["headword"]) not in answer:
            errs.append(f"{key}: orthography needs kana [[...]] and a key containing {target['headword']}")
    elif t == "context":
        forms = {target["headword"], target.get("reading") or "", *target.get("inflections", [])}
        if "（　）" not in stem or not (answer in forms or stem_of(target["headword"]) in answer):
            errs.append(f"{key}: context needs （　） and a key matching {target['headword']}")
    elif t == "incomplete_sentence":
        forms = {target["headword"], *target.get("inflections", [])}
        if "____" not in stem or answer not in forms:
            errs.append(f"{key}: incomplete_sentence needs ____ and a key in {sorted(forms)}")
    else:
        errs.append(f"{key}: unknown type {t}")

    level = spec["level"]
    if spec["language"] == "en":
        bad = above_level(" ".join([stem, *texts]), level, ctx["cefrj"], set(spec.get("allow", [])))
        if bad:
            errs.append(f"{key}: above {level}: {sorted(set(bad))}")
    else:
        checked = [stem, answer] + ([] if t == "orthography" else texts[1:])
        bad = [c for x in checked for c in ja_level_errors(x, level, ctx["kanji"])]
        if bad:
            errs.append(f"{key}: kanji above {level} without furigana: {sorted(set(bad))}")
    return errs


def build_set(set_id: str, entries: dict, ctx: dict, reg: dict, preview: bool = False) -> tuple[list[dict], list[str], list[str]]:
    spec = json.loads((ROOT / "editorial" / "exercises" / f"{set_id}.json").read_text(encoding="utf-8"))
    fmt = format_source(spec["format_source"])
    retrieved = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    items, errors, blocked = [], [], []
    prefix = f"{spec['language']}.{spec['level'].lower()}.exercise"
    slots = (list(range(4)) * (len(spec["items"]) // 4 + 1))[:len(spec["items"])]
    random.Random(set_id).shuffle(slots)

    for pos, it in enumerate(spec["items"], 1):
        refs = it["targets"] + it.get("distractor_refs", [])
        missing = [r for r in refs if r not in entries]
        if missing:
            errors.append(f"{it['key']}: unknown entries {missing}")
            continue
        errs = check_item(it, spec, entries, ctx)
        if errs:
            errors += errs
            continue
        pending = [r for r in refs if entries[r]["status"] != "reviewed"]
        if pending:
            blocked.append(f"{it['key']}: waiting for review of {pending}")
            if not preview:
                continue

        rkey = f"ex|{set_id}|{it['key']}"
        if rkey not in reg["ids"]:
            reg["counters"][prefix] = reg["counters"].get(prefix, 0) + 1
            reg["ids"][rkey] = f"{prefix}.{reg['counters'][prefix]:05d}"
        xid = reg["ids"][rkey]
        order = sorted(range(1, 4), key=lambda i: hashlib.sha256(f"{xid}|{i}".encode()).hexdigest())
        order.insert(slots[pos - 1], 0)
        options = [{"label": spec["labels"][n], "text": it["options"][i]["text"], "correct": i == 0,
                    "rationale_vi": it["options"][i].get("why_vi")} for n, i in enumerate(order)]
        answer = order.index(0)
        tp = spec["types"][it["type"]]
        item = {
            "id": xid, "set_id": set_id, "node_id": spec["node_id"], "language": spec["language"],
            "level": spec["level"], "position": pos, "exam": spec["exam"], "exam_section": spec["exam_section"],
            "exam_part": tp["exam_part"], "item_type": it["type"],
            "instruction": tp["instruction"], "instruction_vi": tp["instruction_vi"],
            "stem": it["stem"], "stem_vi": it["stem_vi"], "options": options,
            "answer_index": answer, "answer_label": spec["labels"][answer],
            "explanation_vi": it["explanation_vi"], "skill_tag": tp["skill_tag"], "difficulty": it["difficulty"],
            "target_ids": it["targets"], "distractor_ids": it.get("distractor_refs", []),
            "entry_versions": {r: entries[r]["version"] for r in refs},
            "sources": [
                {"name": "web_ngon_ngu editorial (item written from scratch)", "url": None, "license": "own-work",
                 "retrieved_at": retrieved, "used_for": "stem, options, rationales, explanation"},
                fmt,
            ],
            "status": "draft", "needs_review": True,
        }
        hashable = json.loads(json.dumps(item))
        for s in hashable["sources"]:
            s.pop("retrieved_at", None)
        h = hashlib.sha256(json.dumps(hashable, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        prev = reg["versions"].get(xid)
        reg["versions"][xid] = {"version": 1 if prev is None else prev["version"] + (prev["hash"] != h), "hash": h}
        item["version"] = reg["versions"][xid]["version"]
        items.append(item)

    apply_reviews(items, reg)
    return items, errors, blocked


def write_db(set_id: str, items: list[dict]) -> int:
    """Syncs one set: upserts built items and deletes rows whose entries are no longer reviewed."""
    from import_mysql import connect, load_env

    load_env()
    conn = connect()
    with conn.cursor() as cur:
        keep = [x["id"] for x in items] or [""]
        cur.execute(f"DELETE FROM lex_exercise WHERE set_id=%s AND id NOT IN ({','.join(['%s'] * len(keep))})",
                    (set_id, *keep))
        removed = cur.rowcount
        for x in items:
            doc = json.dumps(x, ensure_ascii=False)
            h = hashlib.sha256(doc.encode()).hexdigest()
            cur.execute(
                """INSERT INTO lex_exercise (id, set_id, node_id, language_id, level, exam, exam_part, item_type,
                       position, skill_tag, difficulty, instruction, stem, options, answer_index, explanation_vi,
                       status, needs_review, version, doc, content_hash)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   ON DUPLICATE KEY UPDATE set_id=VALUES(set_id), node_id=VALUES(node_id), level=VALUES(level),
                       exam=VALUES(exam), exam_part=VALUES(exam_part), item_type=VALUES(item_type),
                       position=VALUES(position), skill_tag=VALUES(skill_tag), difficulty=VALUES(difficulty),
                       instruction=VALUES(instruction), stem=VALUES(stem), options=VALUES(options),
                       answer_index=VALUES(answer_index), explanation_vi=VALUES(explanation_vi),
                       status=VALUES(status), needs_review=VALUES(needs_review), version=VALUES(version),
                       doc=VALUES(doc), content_hash=VALUES(content_hash)""",
                (x["id"], x["set_id"], x["node_id"], x["language"], x["level"], x["exam"], x["exam_part"],
                 x["item_type"], x["position"], x["skill_tag"], x["difficulty"], x["instruction"], x["stem"],
                 json.dumps(x["options"], ensure_ascii=False), x["answer_index"], x["explanation_vi"],
                 x["status"], x["needs_review"], x["version"], doc, h))
            cur.execute("DELETE FROM lex_exercise_entry WHERE exercise_id=%s", (x["id"],))
            cur.executemany(
                "INSERT INTO lex_exercise_entry (exercise_id, entry_id, role) VALUES (%s,%s,%s)",
                [(x["id"], r, "target") for r in x["target_ids"]]
                + [(x["id"], r, "distractor") for r in x["distractor_ids"]])
    conn.commit()
    conn.close()
    return removed


def write_preview(set_id: str, items: list[dict]) -> None:
    lines = [f"# Xem trước câu hỏi — {set_id}", "",
             "Bản xem trước, chưa phải dữ liệu chính thức: câu hỏi chỉ được xuất ra data/exercises/ khi mọi mục nó dùng",
             "đã ở trạng thái reviewed. Mã câu (id) là tạm thời.", ""]
    for x in items:
        lines += exercise_lines(x)
    out = ROOT / "review" / f"{set_id}.preview.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print("  wrote", out.relative_to(ROOT))


def main(argv: list[str]) -> int:
    use_db, preview = "--db" in argv, "--preview" in argv
    args = [a for a in argv if not a.startswith("--")]
    if "--all" in argv:
        args = sorted(p.stem for p in (ROOT / "editorial" / "exercises").glob("*.json"))
    if not args:
        print(__doc__)
        return 2
    entries = load_entries()
    ctx = {"cefrj": cefrj_index(), "kanji": kanji_levels()}
    reg = load_registry()
    failed = False
    for set_id in args:
        items, errors, blocked = build_set(set_id, entries, ctx, reg, preview)
        for e in errors:
            print("  ERROR", e)
        failed |= bool(errors)
        if preview:
            print(f"{set_id}: {len(items)} items pass checks ({len(blocked)} still need entry review)")
            write_preview(set_id, items)
            continue
        for b in blocked:
            print("  BLOCKED", b)
        out = ROOT / "exercises" / f"{set_id}.jsonl"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text("".join(json.dumps(x, ensure_ascii=False) + "\n" for x in items), encoding="utf-8")
        print(f"{set_id}: {len(items)} built, {len(blocked)} blocked, {len(errors)} errors -> {out.relative_to(ROOT)}")
        if use_db:
            removed = write_db(set_id, items)
            print(f"  lex_exercise: {len(items)} upserted, {removed} removed")
    if not preview:
        save_registry(reg)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
