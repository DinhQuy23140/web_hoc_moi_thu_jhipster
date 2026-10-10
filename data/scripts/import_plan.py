"""Import the PLAN content map (data/plan/plan.json) into the lingora MySQL schema.

Usage: python data/scripts/import_plan.py [data/plan/plan.json]
Tables come from Liquibase changeset 20261010000003-lexicon-plan. Idempotent: rows are upserted by id,
child rows (can-do, mappings, prerequisites, roadmap steps) are rewritten, all in one transaction.
Nodes referenced by lex_entry or not in the plan are never deleted.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

from import_mysql import connect, load_env, parse_dt

ROOT = Path(__file__).resolve().parents[1]


def js(value) -> str | None:
    return None if value is None else json.dumps(value, ensure_ascii=False)


def upsert(cur, table: str, row: dict, key: str) -> int:
    cols = list(row)
    sql = (f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(['%s'] * len(cols))}) "
           f"ON DUPLICATE KEY UPDATE {', '.join(f'{c} = VALUES({c})' for c in cols if c != key)}")
    return cur.execute(sql, list(row.values()))


def import_plan(conn, plan: dict) -> dict:
    stats = {"inserted": 0, "updated": 0, "unchanged": 0}

    def count(rc: int) -> None:
        stats[{1: "inserted", 2: "updated"}.get(rc, "unchanged")] += 1

    with conn.cursor() as cur:
        for sid, s in plan["sources"].items():
            count(upsert(cur, "lex_plan_source", {
                "id": sid, "name": s["name"], "url": s["url"], "license": s["license"], "reliability": s["reliability"],
                "retrieved_at": parse_dt(s["retrieved_at"]), "share_alike": int(s["share_alike"]),
                "attribution": s["attribution"], "reachable": int(s["reachable"])}, "id"))
        for t in plan["topics"]:
            count(upsert(cur, "lex_topic", {"id": t["id"], "title_vi": t["vi"], "min_order": t["min_order"]}, "id"))

        for lv in plan["levels"]:
            doc = {k: lv[k] for k in ("est_new_item_days", "est_basis")}
            count(upsert(cur, "lex_level", {
                "id": lv["id"], "language_id": lv["lang"], "code": lv["code"], "framework": lv["framework"], "name": lv["name"],
                "position": lv["position"], "cefr_ref": lv["cefr_ref"], "cefr_basis": lv["cefr_basis"], "summary_vi": lv["summary_vi"],
                "volumes": js(lv["volumes"]), "est_weeks": lv["est_weeks"], "needs_review": int(lv["needs_review"]), "doc": js(doc)}, "id"))
            cur.execute("DELETE FROM lex_level_can_do WHERE level_id = %s", (lv["id"],))
            cur.executemany(
                "INSERT INTO lex_level_can_do (level_id, position, skill, text_vi, basis, source_id) VALUES (%s, %s, %s, %s, %s, %s)",
                [(lv["id"], i, c["skill"], c["vi"], c["basis"], c["source"]) for i, c in enumerate(lv["can_do"], 1)])

        for n in plan["nodes"]:
            count(upsert(cur, "lex_node", {
                "node_id": n["node_id"], "language_id": n["lang"], "level": n["level"], "skill": n["skill"], "topic": n["topic"],
                "title_vi": n["title_vi"], "position": n["position"], "exam_tags": js(n["exam_tags"])}, "node_id"))
        ids = [n["node_id"] for n in plan["nodes"]]
        cur.execute(f"DELETE FROM lex_node_prereq WHERE node_id IN ({', '.join(['%s'] * len(ids))})", ids)
        cur.executemany("INSERT INTO lex_node_prereq (node_id, requires_node_id) VALUES (%s, %s)",
                        [(n["node_id"], r) for n in plan["nodes"] for r in n["prerequisites"]])

        for e in plan["exams"]:
            count(upsert(cur, "lex_exam", {
                "id": e["id"], "language_id": e["lang"], "name": e["name"], "levels": js(e["levels"]),
                "total_minutes": e.get("total_minutes"), "sections": js(e["sections"]), "scoring": js(e["scoring"]),
                "pass_rule_vi": e["pass_rule_vi"], "notes_vi": e["notes_vi"], "source_ids": js(e["sources"]),
                "needs_review": int(e["needs_review"])}, "id"))
            cur.execute("DELETE FROM lex_exam_mapping WHERE exam_id = %s", (e["id"],))
            rows = [m for m in plan["mappings"] if m["exam"] == e["id"]]
            cur.executemany(
                "INSERT INTO lex_exam_mapping (exam_id, position, exam_level, score_min, score_max, cefr, basis, condition_vi, source_id) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [(e["id"], i, m["exam_level"], m["score_min"], m["score_max"], m["cefr"], m["basis"], m["condition_vi"], m["source"])
                 for i, m in enumerate(rows, 1)])

        for r in plan["roadmaps"]:
            count(upsert(cur, "lex_roadmap", {
                "id": r["id"], "language_id": r["lang"], "kind": r["kind"], "exam_id": r["exam"], "target": r["target"],
                "title_vi": r["title_vi"], "params": js(r["params"]), "phases": js(r["phases"]),
                "status": plan["status"], "version": plan["version"]}, "id"))
            cur.execute("DELETE FROM lex_roadmap_step WHERE roadmap_id = %s", (r["id"],))
            cur.executemany(
                "INSERT INTO lex_roadmap_step (roadmap_id, position, phase, node_id, note_vi) VALUES (%s, %s, %s, %s, %s)",
                [(r["id"], s["position"], s["phase"], s["node_id"], s["note_vi"]) for s in r["steps"]])
    return stats


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "plan" / "plan.json"
    plan = json.loads(path.read_text(encoding="utf-8"))
    load_env()
    conn = connect()
    started = datetime.now()
    try:
        stats = import_plan(conn, plan)
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO lex_import_batch (file_name, total, inserted, updated, unchanged, started_at, finished_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (path.name, sum(stats.values()), stats["inserted"], stats["updated"], stats["unchanged"], started, datetime.now()))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    print(path.name, stats)
    return 0


if __name__ == "__main__":
    sys.exit(main())
