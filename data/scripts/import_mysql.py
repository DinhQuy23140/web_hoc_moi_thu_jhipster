"""Import lexicon JSONL files into the app database (lingora).

Usage:
    pip install pymysql
    python data/scripts/import_mysql.py data/jsonl            # every *.jsonl in the folder
    python data/scripts/import_mysql.py data/jsonl/ja.n5.vocab.daily_life.jsonl

The lex_* tables are created by Liquibase (changelog 20261010000002_lexicon_schema.xml), so the
backend must have started once, or run: mvnw process-resources liquibase:update.

Connection settings come from environment variables or data/.env:
    MYSQL_HOST (127.0.0.1)  MYSQL_PORT (3306)  MYSQL_USER (root)  MYSQL_PASSWORD  MYSQL_DATABASE (lingora)
Entries whose content_hash is unchanged are skipped; changed entries are rewritten in one transaction.
lex_entry.vocabulary_id is (re)linked on every run to the matching row of the app's vocabulary table.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ("id", "node_id", "language", "entry_type", "headword", "senses", "learning", "search", "sources", "status", "version")
CHILD_TABLES = ("lex_form", "lex_example", "lex_sense", "lex_relation", "lex_tag", "lex_search_key", "lex_source", "lex_conflict")


def load_env() -> None:
    p = ROOT / ".env"
    if not p.exists():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*([A-Z_]+)\s*=\s*(.*)\s*$", line)
        if m and m.group(1) not in os.environ:
            os.environ[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def connect() -> pymysql.connections.Connection:
    return pymysql.connect(
        host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
        port=int(os.environ.get("MYSQL_PORT", "3306")),
        user=os.environ.get("MYSQL_USER", "root"),
        password=os.environ.get("MYSQL_PASSWORD", ""),
        database=os.environ.get("MYSQL_DATABASE", "lingora"),
        charset="utf8mb4",
        autocommit=False,
    )


def ensure_schema(conn) -> None:
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lex_entry'")
        if cur.fetchone()[0] == 0:
            raise SystemExit("lex_entry table not found: start the backend once or run `mvnw process-resources liquibase:update`.")


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)


def content_hash(entry: dict) -> str:
    return hashlib.sha256(json.dumps(entry, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def node_parts(node_id: str) -> tuple[str, str, str, str]:
    parts = node_id.split(".")
    if len(parts) != 4:
        raise ValueError(f"node_id must be lang.level.skill.topic, got {node_id!r}")
    return parts[0], parts[1], parts[2], parts[3]


def find_vocabulary_id(cur, e: dict) -> str | None:
    if e["entry_type"] != "word":
        return None
    for word in [e["headword"], *(e.get("variants") or [])]:
        cur.execute(
            """SELECT id FROM vocabulary
               WHERE language_id = %s AND word = %s COLLATE utf8mb4_bin
                 AND (reading = %s COLLATE utf8mb4_bin OR reading IS NULL OR reading = '')
               ORDER BY id LIMIT 1""",
            (e["language"], word, e.get("reading") or ""),
        )
        row = cur.fetchone()
        if row:
            return row[0]
    return None


def write_entry(cur, e: dict, h: str) -> None:
    lang, level, skill, topic = node_parts(e["node_id"])
    cur.execute(
        "INSERT IGNORE INTO lex_node (node_id, language_id, level, skill, topic) VALUES (%s,%s,%s,%s,%s)",
        (e["node_id"], lang, level, skill, topic),
    )
    lr, ex, tm, sr = e["learning"], e.get("exam") or {}, e.get("translation_meta") or {}, e["search"]
    cur.execute(
        """INSERT INTO lex_entry
             (id, node_id, language_id, vocabulary_id, entry_type, headword, reading, romaji, pos, level,
              cefr_equiv, difficulty, frequency_rank, skill, audio_url, exam_level, boost, do_not_translate,
              glossary, preferred_vi, needs_review, status, version, doc, content_hash)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           ON DUPLICATE KEY UPDATE
             node_id=VALUES(node_id), language_id=VALUES(language_id), vocabulary_id=VALUES(vocabulary_id),
             entry_type=VALUES(entry_type), headword=VALUES(headword), reading=VALUES(reading),
             romaji=VALUES(romaji), pos=VALUES(pos), level=VALUES(level), cefr_equiv=VALUES(cefr_equiv),
             difficulty=VALUES(difficulty), frequency_rank=VALUES(frequency_rank), skill=VALUES(skill),
             audio_url=VALUES(audio_url), exam_level=VALUES(exam_level), boost=VALUES(boost),
             do_not_translate=VALUES(do_not_translate), glossary=VALUES(glossary),
             preferred_vi=VALUES(preferred_vi), needs_review=VALUES(needs_review), status=VALUES(status),
             version=VALUES(version), doc=VALUES(doc), content_hash=VALUES(content_hash)""",
        (
            e["id"], e["node_id"], e["language"], find_vocabulary_id(cur, e), e["entry_type"], e["headword"],
            e.get("reading") or "", e.get("romaji") or None, e.get("pos") or "", lr["level"], lr.get("cefr_equiv"),
            lr.get("difficulty"), lr.get("frequency_rank"), lr["skill"], lr.get("audio_url"), ex.get("exam_level"),
            sr.get("boost", 1.0), bool(tm.get("do_not_translate")), bool(tm.get("glossary")),
            tm.get("preferred_vi") or None, bool(e.get("needs_review")), e["status"], e["version"],
            json.dumps(e, ensure_ascii=False), h,
        ),
    )
    eid = e["id"]
    for table in CHILD_TABLES:
        cur.execute(f"DELETE FROM {table} WHERE entry_id=%s", (eid,))

    forms = [(eid, "inflection", f, i) for i, f in enumerate(e.get("inflections") or []) if f]
    forms += [(eid, "variant", f, i) for i, f in enumerate(e.get("variants") or []) if f]
    cur.executemany("INSERT IGNORE INTO lex_form (entry_id, form_type, form, position) VALUES (%s,%s,%s,%s)", forms)

    for i, s in enumerate(e["senses"], 1):
        cur.execute(
            """INSERT INTO lex_sense (sense_id, entry_id, position, definition_native, register, domain,
                                      usage_notes_vi, false_friend_note) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
            (s["sense_id"], eid, i, s["definition_native"], s["register"],
             json.dumps([d for d in s.get("domain") or [] if d], ensure_ascii=False),
             s.get("usage_notes_vi") or None, s.get("false_friend_note")),
        )
        cur.executemany(
            """INSERT INTO lex_sense_translation (sense_id, target, text, equivalence, context_hint, priority)
               VALUES (%s,%s,%s,%s,%s,%s)""",
            [(s["sense_id"], t["target"], t["text"], t["equivalence"], t.get("context_hint"), t["priority"])
             for t in s.get("translations") or []],
        )

    cur.executemany(
        """INSERT INTO lex_example (entry_id, sense_id, position, text, reading, tr_vi, tr_en, tr_ja,
                                    alignment_verified, source, license)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(eid, x.get("sense_id") or None, i, x["text"], x.get("reading") or None,
          (x.get("translations") or {}).get("vi"), (x.get("translations") or {}).get("en"),
          (x.get("translations") or {}).get("ja"), bool(x.get("alignment_verified")),
          x.get("source"), x.get("license"))
         for i, x in enumerate(e.get("examples") or [])],
    )

    rels = []
    for rel_type, key in (("collocation", "collocations"), ("synonym", "synonyms"), ("antonym", "antonyms"),
                          ("related", "related_ids")):
        rels += [(eid, rel_type, v, i) for i, v in enumerate(e.get(key) or []) if v]
    rels += [(eid, "prerequisite", v, i) for i, v in enumerate(lr.get("prerequisite_ids") or []) if v]
    cur.executemany("INSERT IGNORE INTO lex_relation (entry_id, rel_type, value, position) VALUES (%s,%s,%s,%s)", rels)

    tags = [(eid, "topic", v) for v in lr.get("topic_tags") or [] if v]
    tags += [(eid, "exercise_hint", v) for v in lr.get("exercise_hints") or [] if v]
    tags += [(eid, "exam", v) for v in ex.get("exam_tags") or [] if v]
    tags += [(eid, "exam_section", v) for v in ex.get("common_in_sections") or [] if v]
    cur.executemany("INSERT IGNORE INTO lex_tag (entry_id, tag_type, value) VALUES (%s,%s,%s)", tags)

    keys = []
    for key_type, field in (("primary", "primary_keys"), ("reading", "reading_keys"), ("vi", "vi_keys"),
                            ("vi_ascii", "vi_keys_no_diacritics"), ("alias", "alias_keys")):
        keys += [(eid, key_type, k, sr.get("boost", 1.0)) for k in sr.get(field) or [] if k]
    cur.executemany(
        "INSERT IGNORE INTO lex_search_key (entry_id, key_type, key_norm, boost) VALUES (%s,%s,%s,%s)", keys)

    cur.executemany(
        """INSERT INTO lex_source (entry_id, position, name, url, license, retrieved_at, share_alike, attribution)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(eid, i, s["name"], s.get("url"), s["license"], parse_dt(s.get("retrieved_at")),
          bool(s.get("share_alike")), s.get("attribution")) for i, s in enumerate(e["sources"])],
    )

    cur.executemany(
        "INSERT INTO lex_conflict (entry_id, field, detail, resolution, resolved) VALUES (%s,%s,%s,%s,%s)",
        [(eid, c.get("field", ""), c.get("detail", json.dumps(c, ensure_ascii=False)), c.get("resolution"),
          bool(c.get("resolved"))) for c in e.get("conflicts") or [] if isinstance(c, dict)],
    )


def import_file(conn, path: Path) -> dict:
    started = datetime.now()
    stats = {"total": 0, "inserted": 0, "updated": 0, "unchanged": 0, "linked_vocabulary": 0}
    with conn.cursor() as cur:
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                continue
            e = json.loads(line)
            missing = [k for k in REQUIRED if k not in e]
            if missing:
                raise ValueError(f"{path.name}:{n}: missing fields {missing}")
            stats["total"] += 1
            h = content_hash(e)
            cur.execute("SELECT content_hash FROM lex_entry WHERE id=%s", (e["id"],))
            row = cur.fetchone()
            try:
                if row and row[0] == h:
                    cur.execute("UPDATE lex_entry SET vocabulary_id=%s WHERE id=%s", (find_vocabulary_id(cur, e), e["id"]))
                    stats["unchanged"] += 1
                else:
                    write_entry(cur, e, h)
                    stats["updated" if row else "inserted"] += 1
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            cur.execute("SELECT vocabulary_id IS NOT NULL FROM lex_entry WHERE id=%s", (e["id"],))
            stats["linked_vocabulary"] += cur.fetchone()[0]
        cur.execute(
            """INSERT INTO lex_import_batch (file_name, total, inserted, updated, unchanged, started_at, finished_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (path.name, stats["total"], stats["inserted"], stats["updated"], stats["unchanged"], started,
             datetime.now()),
        )
    conn.commit()
    return stats


def expand(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for p in paths:
        path = Path(p)
        if path.is_dir():
            files += sorted(path.glob("*.jsonl"))
        elif any(c in p for c in "*?["):
            files += sorted(Path().glob(p))
        else:
            files.append(path)
    if not files:
        raise SystemExit(f"no .jsonl files found in {paths}")
    return files


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="+", help="JSONL files, directories or glob patterns")
    args = ap.parse_args()
    load_env()
    conn = connect()
    try:
        ensure_schema(conn)
        for f in expand(args.paths):
            print(f.name, import_file(conn, f))
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
