"""Collect raw kanji data from two independent sources into data/raw/<node_id>.raw.json.

Usage: python data/scripts/collect_kanji.py ja.n5.kanji.core 食 水 学 ...

Sources:
  - kanjidic2: KANJIDIC2 XML (EDRDG, CC BY-SA 4.0), cached at data/raw/cache/kanjidic2.xml.gz
               grade, strokes, freq, old 4-level JLPT, on/kun readings, Vietnamese (Hán Việt) readings, English meanings
  - kanji_data: davidluzgouveia/kanji-data kanji.json (MIT); only the JLPT (new N-levels), grade, strokes, freq,
               meanings and readings fields are kept (wk_* fields come from WaniKani and are not used)
"""

from __future__ import annotations

import gzip
import json
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "web-ngon-ngu-data-collector/0.1 (educational)"}
KANJIDIC_URL = "http://www.edrdg.org/kanjidic/kanjidic2.xml.gz"
KANJI_DATA_URL = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"
KANJI_DATA_FIELDS = ("strokes", "grade", "freq", "jlpt_old", "jlpt_new", "meanings", "readings_on", "readings_kun")


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def kanjidic(targets: set[str]) -> tuple[dict, str]:
    cache = ROOT / "raw" / "cache" / "kanjidic2.xml.gz"
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        r = requests.get(KANJIDIC_URL, headers=HEADERS, timeout=120)
        r.raise_for_status()
        cache.write_bytes(r.content)
    retrieved = datetime.fromtimestamp(cache.stat().st_mtime, timezone.utc).replace(microsecond=0).isoformat()
    out = {}
    with gzip.open(cache) as f:
        for _, el in ET.iterparse(f):
            if el.tag != "character":
                continue
            lit = el.findtext("literal")
            if lit in targets:
                misc = el.find("misc")
                readings: dict[str, list[str]] = {}
                for r in el.iter("reading"):
                    readings.setdefault(r.get("r_type"), []).append(r.text)
                out[lit] = {
                    "grade": int(misc.findtext("grade")) if misc.findtext("grade") else None,
                    "strokes": int(misc.findtext("stroke_count")),
                    "freq": int(misc.findtext("freq")) if misc.findtext("freq") else None,
                    "jlpt_old": int(misc.findtext("jlpt")) if misc.findtext("jlpt") else None,
                    "on": readings.get("ja_on", []),
                    "kun": readings.get("ja_kun", []),
                    "vietnam": readings.get("vietnam", []),
                    "meanings_en": [m.text for m in el.iter("meaning") if m.get("m_lang") is None],
                }
            el.clear()
    return out, retrieved


def main(node_id: str, chars: list[str]) -> None:
    targets = set(chars)
    kd, kd_retrieved = kanjidic(targets)
    r = requests.get(KANJI_DATA_URL, headers=HEADERS, timeout=60)
    r.raise_for_status()
    kdata = r.json()
    kd_now = now()
    items = {}
    for c in chars:
        items[c] = {
            "kanjidic2": {"url": KANJIDIC_URL, "retrieved_at": kd_retrieved, "data": kd.get(c)},
            "kanji_data": {"url": KANJI_DATA_URL, "retrieved_at": kd_now,
                           "data": {k: kdata[c].get(k) for k in KANJI_DATA_FIELDS} if c in kdata else None},
        }
    out = ROOT / "raw" / f"{node_id}.raw.json"
    out.write_text(json.dumps({"node_id": node_id, "items": items}, ensure_ascii=False, indent=1), encoding="utf-8")
    for c, it in items.items():
        a, b = it["kanjidic2"]["data"] or {}, it["kanji_data"]["data"] or {}
        print(c, "jlpt_new", b.get("jlpt_new"), "old", a.get("jlpt_old"), "grade", a.get("grade"), b.get("grade"),
              "strokes", a.get("strokes"), b.get("strokes"), "freq", a.get("freq"), b.get("freq"),
              "HV", a.get("vietnam"), "on", a.get("on"), "kun", a.get("kun"))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
