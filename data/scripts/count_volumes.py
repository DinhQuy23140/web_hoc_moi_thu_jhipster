"""Count per-level reference volumes from openly licensed lists.

Usage: python data/scripts/count_volumes.py
Writes data/raw/volumes.raw.json. Counts are facts about the lists, not official JLPT figures
(JLPT has published no official vocabulary/kanji lists since 2010), so the plan marks them "estimated".
"""

from __future__ import annotations

import csv
import io
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "web-ngon-ngu-data-collector/0.1 (educational)"}
VOCAB_CSV = "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/{lvl}.csv"
KANJI_JSON = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"
OLP = "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/"
EN_VOCAB = [OLP + "cefrj-vocabulary-profile-1.5.csv", OLP + "octanove-vocabulary-profile-c1c2-1.0.csv"]
EN_GRAMMAR = OLP + "cefrj-grammar-profile-20180315.csv"
REPOS = ["jamsinclair/open-anki-jlpt-decks", "davidluzgouveia/kanji-data", "openlanguageprofiles/olp-en-cefrj"]
OLP_TERMS = {
    "cefrj-vocabulary-profile-1.5.csv": "CEFR-J terms: free for research and commercial use with citation; (c) Tono Laboratory, TUFS",
    "cefrj-grammar-profile-20180315.csv": "CEFR-J terms: free for research and commercial use with citation; (c) Tono Laboratory, TUFS",
    "octanove-vocabulary-profile-c1c2-1.0.csv": "CC BY-SA 4.0 (Octanove Labs)",
}


def rows(url: str) -> list[dict]:
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    return list(csv.DictReader(io.StringIO(r.content.decode("utf-8-sig"))))


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def repo_license(repo: str) -> dict:
    r = requests.get(f"https://api.github.com/repos/{repo}/license", headers=HEADERS, timeout=30)
    if not r.ok:
        return {"repo": repo, "license": "unknown", "status": r.status_code}
    info = r.json().get("license") or {}
    return {"repo": repo, "license": info.get("spdx_id") or "unknown", "url": r.json().get("html_url")}


def main() -> None:
    vocab = {lvl: len(rows(VOCAB_CSV.format(lvl=lvl))) for lvl in ["n5", "n4", "n3", "n2", "n1"]}

    r = requests.get(KANJI_JSON, headers=HEADERS, timeout=60)
    r.raise_for_status()
    kanji = Counter(f"n{v['jlpt_new']}" for v in r.json().values() if v.get("jlpt_new"))

    en_vocab: Counter = Counter()
    for url in EN_VOCAB:
        en_vocab.update(x["CEFR"] for x in rows(url))
    en_grammar = Counter((x["CEFR-J Level"] or "unassigned")[:2] for x in rows(EN_GRAMMAR))

    out = {
        "retrieved_at": now(),
        "licenses": [repo_license(x) for x in REPOS],
        "olp_terms": OLP_TERMS,
        "ja_vocab_per_level": {"source": VOCAB_CSV.format(lvl="{lvl}"), "unit": "rows", "counts": vocab},
        "ja_kanji_per_level": {"source": KANJI_JSON, "field": "jlpt_new", "counts": dict(sorted(kanji.items(), reverse=True))},
        "en_vocab_per_level": {"source": EN_VOCAB, "unit": "headword+pos", "counts": dict(sorted(en_vocab.items()))},
        "en_grammar_per_level": {"source": EN_GRAMMAR, "field": "CEFR-J Level (sublevels merged)", "counts": dict(sorted(en_grammar.items()))},
    }
    path = ROOT / "raw" / "volumes.raw.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
