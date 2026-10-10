"""Build the PLAN content map (levels, nodes, prerequisites, exams, mappings, roadmaps).

Usage: python data/scripts/build_plan.py
Inputs : data/editorial/plan.json, data/raw/exams/*.txt, data/raw/volumes.raw.json
Output : data/plan/plan.json (exit code 1 when a check fails)
"""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "editorial" / "plan.json"
VOLUMES = ROOT / "raw" / "volumes.raw.json"
OUT = ROOT / "plan" / "plan.json"
LEVEL_ORDER = {"ja": ["n5", "n4", "n3", "n2", "n1"], "en": ["a1", "a2", "b1", "b2", "c1", "c2"]}
TOPICAL_ORDER = ["vocab", "listening", "reading", "speaking", "writing"]


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def resolve_sources(spec: dict, volumes: dict) -> dict:
    out = {}
    for sid, s in spec["sources"].items():
        src = {"name": s["name"], "url": s.get("url"), "license": s["license"], "reliability": s["reliability"],
               "retrieved_at": None, "share_alike": bool(s.get("share_alike")), "attribution": s.get("attribution")}
        if "raw" in s:
            path = ROOT / "raw" / s["raw"]
            if path.exists():
                url, status, retrieved = path.read_text(encoding="utf-8").split("\n", 1)[0].split("\t")
                src.update(url=url, retrieved_at=retrieved)
                if status != "200":
                    src.update(license="unknown", reliability=f"unreachable ({status})")
            else:
                src.update(license="unknown", reliability="unreachable (not fetched)")
        elif "volumes" in s:
            src["retrieved_at"] = volumes["retrieved_at"]
        src["reachable"] = not src["reliability"].startswith("unreachable")
        out[sid] = src
    return out


def topics_for(spec: dict, order: int) -> list[str]:
    return [t["id"] for t in spec["topics"] if t["min_order"] <= order]


def build_levels(spec: dict, volumes: dict) -> list[dict]:
    p = spec["params"]
    levels = []
    for lang, items in spec["levels"].items():
        for pos, lv in enumerate(items, 1):
            vol = {}
            for kind, sid in spec["volumes"][lang].items():
                key = spec["sources"][sid]["volumes"] if sid else None
                count = volumes[key]["counts"].get(lv["code"].lower() if lang == "ja" else lv["code"].upper()) if key else None
                vol[kind] = {"count": count, "basis": "estimated" if count is not None else None, "source": sid}
            per_day = {"vocab": p["new_words_per_day"], "kanji": p["new_kanji_per_day"], "grammar": p["new_grammar_per_day"]}
            days = sum(math.ceil(v["count"] / per_day[k]) for k, v in vol.items() if v["count"] is not None)
            levels.append({
                "id": f"{lang}.{lv['code']}", "lang": lang, "code": lv["code"], "position": pos,
                "framework": lv["framework"], "name": lv["name"],
                "cefr_ref": lv["cefr_ref"], "cefr_basis": lv["cefr_basis"],
                "summary_vi": lv["summary_vi"], "can_do": lv["can_do"], "volumes": vol,
                "est_new_item_days": days, "est_weeks": math.ceil(days / p["study_days_per_week"]),
                "est_basis": f"estimated: {p['basis']}; bỏ qua mục có count=null",
                "needs_review": any(c["basis"].startswith("own-work") for c in lv["can_do"]) or any(v["count"] is None for v in vol.values()),
            })
    return levels


def build_nodes(spec: dict) -> dict[str, dict]:
    names = spec["skills"]["names_vi"]
    topic_vi = {t["id"]: t["vi"] for t in spec["topics"]}
    level_name = {f"{lang}.{lv['code']}": lv["name"] for lang, items in spec["levels"].items() for lv in items}
    exams_by_lang = {}
    for e in spec["exams"]:
        exams_by_lang.setdefault(e["lang"], []).append(e["id"])
    nodes: dict[str, dict] = {}
    for lang, codes in LEVEL_ORDER.items():
        skills = spec["skills"][lang]
        for order, code in enumerate(codes, 1):
            pos = 0
            for skill in [s for s in skills if s in spec["skills"]["core_only"]]:
                pos += 1
                nid = f"{lang}.{code}.{skill}.core"
                nodes[nid] = {"node_id": nid, "lang": lang, "level": code, "skill": skill, "topic": "core", "position": pos,
                              "title_vi": f"{names[skill]} {level_name[f'{lang}.{code}']}"}
            for topic in topics_for(spec, order):
                for skill in TOPICAL_ORDER:
                    if skill not in skills:
                        continue
                    pos += 1
                    nid = f"{lang}.{code}.{skill}.{topic}"
                    nodes[nid] = {"node_id": nid, "lang": lang, "level": code, "skill": skill, "topic": topic, "position": pos,
                                  "title_vi": f"{names[skill]} — {topic_vi[topic]} ({level_name[f'{lang}.{code}']})"}
    for n in nodes.values():
        n["exam_tags"] = [e for e in exams_by_lang.get(n["lang"], []) if n["skill"] in spec["exam_skills"][e]]
        n["prerequisites"] = prerequisites(n, nodes)
    return nodes


def prerequisites(n: dict, nodes: dict) -> list[str]:
    lang, code, skill, topic = n["lang"], n["level"], n["skill"], n["topic"]
    idx = LEVEL_ORDER[lang].index(code)
    prev = LEVEL_ORDER[lang][idx - 1] if idx else None
    same = lambda s, t: f"{lang}.{code}.{s}.{t}"  # noqa: E731
    reqs = []
    if prev:
        reqs.append(f"{lang}.{prev}.{skill}.{topic}")
    if skill == "vocab":
        reqs += [same("kanji", "core")]
        if prev and f"{lang}.{prev}.vocab.{topic}" not in nodes:
            reqs.append(f"{lang}.{prev}.grammar.core")
    elif skill in ("reading", "listening"):
        reqs += [same("vocab", topic), same("grammar", "core")] + ([same("kanji", "core")] if skill == "reading" else [])
    elif skill == "speaking":
        reqs.append(same("listening", topic))
    elif skill == "writing":
        reqs.append(same("reading", topic))
    return [r for r in dict.fromkeys(reqs) if r in nodes]


def build_roadmaps(spec: dict, nodes: dict, levels: list[dict]) -> list[dict]:
    p = spec["params"]
    level_by_id = {lv["id"]: lv for lv in levels}
    roadmaps = []
    for lang, codes in LEVEL_ORDER.items():
        steps = []
        for code in codes:
            for n in sorted((n for n in nodes.values() if n["lang"] == lang and n["level"] == code), key=lambda x: x["position"]):
                steps.append({"phase": code, "node_id": n["node_id"], "note_vi": None})
        roadmaps.append({
            "id": f"{lang}.foundation", "lang": lang, "kind": "foundation", "exam": None, "target": codes[-1],
            "title_vi": "Lộ trình nền tảng " + ("tiếng Nhật N5→N1" if lang == "ja" else "tiếng Anh A1→C2"),
            "params": {k: p[k] for k in ("basis", "new_words_per_day", "new_kanji_per_day", "new_grammar_per_day", "study_days_per_week")},
            "phases": [{"phase": c, "est_weeks": level_by_id[f"{lang}.{c}"]["est_weeks"], "basis": "estimated"} for c in codes],
            "steps": steps,
        })
    exams = {e["id"]: e for e in spec["exams"]}
    for s in spec["sprints"]:
        tested = spec["exam_skills"][s["exam"]]
        topics = s.get("focus_topics")
        pick = lambda skill: sorted(  # noqa: E731
            (n for n in nodes.values() if n["lang"] == s["lang"] and n["level"] == s["target"] and n["skill"] == skill
             and (n["topic"] == "core" or topics is None or n["topic"] in topics)),
            key=lambda x: x["position"])
        minutes = exams[s["exam"]].get("total_minutes")
        steps = [{"phase": "diagnostic", "node_id": None, "note_vi": f"Kiểm tra đầu vào theo cấu trúc {s['exam']} để xác định kỹ năng yếu."}]
        for skill in ("kanji", "grammar", "vocab"):
            if skill in tested:
                steps += [{"phase": "core", "node_id": n["node_id"], "note_vi": None} for n in pick(skill)]
        for skill in ("reading", "listening", "speaking", "writing"):
            if skill in tested:
                steps += [{"phase": "skills", "node_id": n["node_id"], "note_vi": None} for n in pick(skill)]
        steps.append({"phase": "mock", "node_id": None,
                      "note_vi": f"Thi thử trọn bộ, đúng thời gian ({minutes} phút)" if minutes else "Thi thử trọn bộ, đúng thời gian từng phần"})
        roadmaps.append({
            "id": s["id"], "lang": s["lang"], "kind": "sprint", "exam": s["exam"], "target": s["target"], "title_vi": s["title_vi"],
            "params": {"basis": p["basis"], "sprint_weeks": p["sprint_weeks"], "focus_topics": topics,
                       "assumes_vi": "Đã hoàn thành các node cấp dưới trong lộ trình nền tảng."},
            "phases": [{"phase": ph, "est_weeks": None, "basis": None} for ph in ("diagnostic", "core", "skills", "mock")],
            "steps": steps,
        })
    for r in roadmaps:
        for i, st in enumerate(r["steps"], 1):
            st["position"] = i
    return roadmaps


def check(plan: dict) -> list[str]:
    errs = []
    nodes = {n["node_id"]: n for n in plan["nodes"]}
    if len(nodes) != len(plan["nodes"]):
        errs.append("duplicate node_id")
    if "ja.n5.vocab.daily_life" not in nodes:
        errs.append("existing node ja.n5.vocab.daily_life missing")
    for n in plan["nodes"]:
        errs += [f"{n['node_id']}: unknown prerequisite {r}" for r in n["prerequisites"] if r not in nodes]
    srcs = plan["sources"]
    for lv in plan["levels"]:
        errs += [f"{lv['id']}: unknown source {c['source']}" for c in lv["can_do"] if c["source"] not in srcs]
    for e in plan["exams"]:
        errs += [f"{e['id']}: unknown source {s}" for s in e["sources"] if s not in srcs]
        if any(srcs[s]["license"] == "unknown" for s in e["sources"] if s in srcs) and not e["needs_review"]:
            errs.append(f"{e['id']}: unknown-license source without needs_review")
    for m in plan["mappings"]:
        if m["source"] not in srcs:
            errs.append(f"mapping {m['exam']} {m['exam_level']}: unknown source")
        if m["cefr"] is not None and not srcs[m["source"]]["reachable"]:
            errs.append(f"mapping {m['exam']}: value from unreachable source")
    for r in plan["roadmaps"]:
        seen: set[str] = set()
        for st in r["steps"]:
            nid = st["node_id"]
            if nid is None:
                continue
            if nid not in nodes:
                errs.append(f"{r['id']}: unknown node {nid}")
                continue
            if r["kind"] == "foundation":
                errs += [f"{r['id']}: {nid} before prerequisite {q}" for q in nodes[nid]["prerequisites"] if q not in seen]
            elif r["exam"] not in nodes[nid]["exam_tags"]:
                errs.append(f"{r['id']}: {nid} not tested by {r['exam']}")
            seen.add(nid)
    jlpt = next(e for e in plan["exams"] if e["id"] == "JLPT")
    if sorted(jlpt["scoring"]["overall_pass_mark"]) != sorted(jlpt["levels"]) or sorted(jlpt["sections"]) != sorted(jlpt["levels"]):
        errs.append("JLPT: sections/pass marks do not cover every level")
    return errs


def main() -> None:
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    volumes = json.loads(VOLUMES.read_text(encoding="utf-8"))
    sources = resolve_sources(spec, volumes)
    levels = build_levels(spec, volumes)
    nodes = build_nodes(spec)
    exams = []
    for e in spec["exams"]:
        e = dict(e)
        e["needs_review"] = e.get("sections") is None or any(sources[s]["license"] == "unknown" for s in e["sources"])
        exams.append(e)
    plan = {
        "generated_at": now(), "status": "draft", "version": 1, "params": spec["params"], "sources": sources,
        "topics": spec["topics"], "levels": levels, "nodes": list(nodes.values()),
        "exams": exams, "mappings": spec["mappings"], "roadmaps": build_roadmaps(spec, nodes, levels),
    }
    errs = check(plan)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
    by_lang = {lang: sum(1 for n in plan["nodes"] if n["lang"] == lang) for lang in LEVEL_ORDER}
    print(f"levels={len(levels)} nodes={by_lang} exams={len(exams)} mappings={len(plan['mappings'])} "
          f"roadmaps={len(plan['roadmaps'])} steps={sum(len(r['steps']) for r in plan['roadmaps'])}")
    for lv in levels:
        print(f"  {lv['id']:6} vol={ {k: v['count'] for k, v in lv['volumes'].items()} } est_weeks={lv['est_weeks']}")
    print(f"needs_review: levels={sum(lv['needs_review'] for lv in levels)} exams={sum(e['needs_review'] for e in exams)}")
    print("unreachable sources:", [k for k, s in sources.items() if not s["reachable"]])
    if errs:
        print("CHECK FAILED:", *errs[:30], sep="\n  ")
        sys.exit(1)
    print("checks: OK")


if __name__ == "__main__":
    main()
