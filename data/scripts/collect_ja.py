"""Fetch raw source data for a batch of Japanese headwords.

Usage:
    python data/scripts/collect_ja.py ja.n5.vocab.daily_life 食べる 飲む ...

Writes data/raw/<node_id>.raw.json containing, per headword:
  - jisho:     JMdict-derived entry from the Jisho API (+ JLPT tags)
  - wiktionary: raw wikitext of the en.wiktionary page (Japanese section only)
  - jlpt_list: matching rows from open-anki-jlpt-decks n5..n1 CSVs
  - tatoeba:   jpn sentences that have vie and/or eng translations
"""

from __future__ import annotations

import csv
import io
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "web-ngon-ngu-data-collector/0.1 (educational, non-scraping)"}
JLPT_CSV = "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/{lvl}.csv"


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def get(url: str) -> requests.Response:
    r = requests.get(url, headers=HEADERS, timeout=30)
    time.sleep(0.5)
    return r


def load_jlpt_lists() -> dict[str, list[dict]]:
    lists: dict[str, list[dict]] = {}
    for lvl in ("n5", "n4", "n3", "n2", "n1"):
        r = get(JLPT_CSV.format(lvl=lvl))
        r.raise_for_status()
        lists[lvl] = list(csv.DictReader(io.StringIO(r.text)))
    return lists


def jisho(word: str) -> dict:
    url = f"https://jisho.org/api/v1/search/words?keyword={quote(word)}"
    r = get(url)
    data = r.json().get("data", []) if r.ok else []
    exact = [d for d in data if any(j.get("word") == word or j.get("reading") == word for j in d["japanese"])]
    return {"url": url, "status": r.status_code, "retrieved_at": now(), "entries": exact[:2]}


def wiktionary(word: str, follow: bool = True) -> dict:
    url = f"https://en.wiktionary.org/w/index.php?title={quote(word)}&action=raw"
    r = get(url)
    text = r.text if r.ok else ""
    m = re.search(r"==Japanese==(.*?)(?=\n==[^=]|\Z)", text, re.S)
    section = m.group(1).strip() if m else None
    see = re.search(r"\{\{ja-see\|([^|}]+)", section or "")
    if follow and see and not re.search(r"^# ", section, re.M):
        target = wiktionary(see.group(1), follow=False)
        target["redirected_from"] = word
        return target
    return {
        "url": f"https://en.wiktionary.org/wiki/{quote(word)}",
        "status": r.status_code,
        "retrieved_at": now(),
        "japanese_section": section,
    }


def tatoeba(word: str, to: str, limit: int = 10) -> dict:
    url = f"https://tatoeba.org/en/api_v0/search?from=jpn&to={to}&query={quote(word)}&orphans=no&unapproved=no&sort=words"
    r = get(url)
    out = []
    if r.ok:
        for s in r.json().get("results", [])[:limit]:
            trans = [t for group in s.get("translations", []) for t in group if t.get("lang") == to]
            if not trans:
                continue
            out.append({
                "id": s["id"],
                "text": s["text"],
                "owner": (s.get("user") or {}).get("username"),
                "translations": [{"id": t["id"], "text": t["text"], "direct": t.get("isDirect", None)} for t in trans],
            })
    return {"url": url, "status": r.status_code, "retrieved_at": now(), "sentences": out}


def main() -> None:
    node_id, words = sys.argv[1], sys.argv[2:]
    lists = load_jlpt_lists()
    result = {"node_id": node_id, "retrieved_at": now(), "items": {}}
    for w in words:
        print("fetching", w, flush=True)
        js = jisho(w)
        forms = {w} | {j["word"] for e in js["entries"][:1] for j in e["japanese"] if j.get("word")}
        rows = {
            lvl: [row for row in rows if forms & {x.strip() for x in row["expression"].split(";")} or row["reading"] == w]
            for lvl, rows in lists.items()
        }
        result["items"][w] = {
            "jisho": js,
            "wiktionary": wiktionary(w),
            "jlpt_list": {
                "url": "https://github.com/jamsinclair/open-anki-jlpt-decks",
                "retrieved_at": now(),
                "matches": {k: v for k, v in rows.items() if v},
            },
            "tatoeba_vie": tatoeba(w, "vie"),
            "tatoeba_eng": tatoeba(w, "eng", limit=5),
        }
    out = ROOT / "raw" / f"{node_id}.raw.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
