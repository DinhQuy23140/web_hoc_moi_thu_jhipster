"""Collect raw English source data for one node into data/raw/<node_id>.raw.json.

Usage: python data/scripts/collect_en.py en.a1.vocab.daily_life eat drink water ...

Per word:
  - cefrj:      matching rows of CEFR-J Vocabulary Profile 1.5 / Octanove C1-C2 (level + pos)
  - ngsl:       NGSL 1.2 stats row (frequency rank), CC BY-SA 4.0
  - wiktionary: raw wikitext of the en.wiktionary English section (IPA, headword templates)
  - tatoeba:    eng sentences that have a vie translation, with their jpn translations and per-sentence licences
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
HEADERS = {"User-Agent": "web-ngon-ngu-data-collector/0.1 (educational)"}
OLP = "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/"
CEFRJ = [OLP + "cefrj-vocabulary-profile-1.5.csv", OLP + "octanove-vocabulary-profile-c1c2-1.0.csv"]
NGSL = "https://www.newgeneralservicelist.com/s/NGSL_12_stats.csv"
TATOEBA = "https://tatoeba.org/en/api_v0"


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def get(url: str) -> requests.Response:
    r = requests.get(url, headers=HEADERS, timeout=30)
    time.sleep(0.4)
    return r


def csv_rows(url: str) -> list[dict]:
    """Fetch a CSV once into data/raw/cache/ (the builder reads the cached CEFR-J list for level checks)."""
    cache = ROOT / "raw" / "cache" / url.rsplit("/", 1)[1]
    if not cache.exists():
        r = get(url)
        r.raise_for_status()
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_bytes(r.content)
    return list(csv.DictReader(io.StringIO(cache.read_bytes().decode("utf-8-sig", errors="replace"))))


def wiktionary(word: str) -> dict:
    r = get(f"https://en.wiktionary.org/w/index.php?title={quote(word)}&action=raw")
    m = re.search(r"==English==(.*?)(?=\n==[^=]|\Z)", r.text if r.ok else "", re.S)
    section = m.group(1) if m else ""
    return {
        "url": f"https://en.wiktionary.org/wiki/{quote(word)}#English",
        "status": r.status_code,
        "retrieved_at": now(),
        "ipa": re.findall(r"\{\{IPA\|en\|[^}]*\}\}[^\n]*", section),
        "headword_templates": re.findall(r"\{\{en-(?:verb|noun|adj|adv)[^}]*\}\}", section),
        "pos_headers": re.findall(r"^===+\s*([A-Z][a-z]+(?: [a-z]+)?)\s*===+", section, re.M),
    }


def sentence(sid: int) -> dict | None:
    r = get(f"{TATOEBA}/sentence/{sid}")
    return r.json() if r.ok else None


def tatoeba(word: str, limit: int = 6) -> dict:
    url = f"{TATOEBA}/search?from=eng&to=vie&query={quote(word)}&orphans=no&unapproved=no&sort=words"
    r = get(url)
    out = []
    for s in (r.json().get("results", []) if r.ok else [])[:limit]:
        detail = sentence(s["id"]) or {}
        trans = [t for g in detail.get("translations", []) for t in g if t.get("lang") in ("vie", "jpn")]
        items = []
        for t in trans:
            td = sentence(t["id"]) or {}
            items.append({"id": t["id"], "lang": t["lang"], "text": t["text"], "direct": t.get("isDirect"),
                          "license": td.get("license"), "owner": (td.get("user") or {}).get("username"),
                          "transcriptions": [x.get("text") for x in td.get("transcriptions", [])]})
        out.append({"id": s["id"], "text": s["text"], "license": detail.get("license"),
                    "owner": (detail.get("user") or {}).get("username"), "translations": items})
    return {"url": url, "status": r.status_code, "retrieved_at": now(), "sentences": out}


def main() -> None:
    node_id, words = sys.argv[1], sys.argv[2:]
    cefrj = [row for url in CEFRJ for row in csv_rows(url)]
    ngsl = csv_rows(NGSL)
    ngsl_key = next(k for k in ngsl[0] if k.strip().lower() in ("lemma", "word", "headword"))
    result = {"node_id": node_id, "retrieved_at": now(), "ngsl_columns": list(ngsl[0]), "items": {}}
    for w in words:
        print("fetching", w, flush=True)
        result["items"][w] = {
            "cefrj": {"url": "https://github.com/openlanguageprofiles/olp-en-cefrj", "retrieved_at": now(),
                      "rows": [row for row in cefrj if row["headword"].strip().lower() == w]},
            "ngsl": {"url": NGSL, "retrieved_at": now(),
                     "rows": [{"rank": i, **row} for i, row in enumerate(ngsl, 1) if row[ngsl_key].strip().lower() == w]},
            "wiktionary": wiktionary(w),
            "tatoeba": tatoeba(w),
        }
    out = ROOT / "raw" / f"{node_id}.raw.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
