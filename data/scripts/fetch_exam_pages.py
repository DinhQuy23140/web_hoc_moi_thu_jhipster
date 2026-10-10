"""Save official exam-information pages as plain text for fact extraction.

Usage: python data/scripts/fetch_exam_pages.py [slug ...]
Writes data/raw/exams/<slug>.txt (first line: URL, status, retrieved_at).
Only facts (levels, sections, timing, score ranges) are taken from these pages; no text is republished.
"""

from __future__ import annotations

import html
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; web-ngon-ngu-data-collector/0.1; educational)"}
PAGES = {
    "jlpt_levelsummary": "https://www.jlpt.jp/e/about/levelsummary.html",
    "jlpt_testsections": "https://www.jlpt.jp/e/guideline/testsections.html",
    "jlpt_results": "https://www.jlpt.jp/e/guideline/results.html",
    "jlpt_cefr": "https://www.jlpt.jp/e/about/cefr_reference.html",
    "jtest_cefr": "https://j-test.jp/cefr-jtest",
    "jtest_home": "https://j-test.jp/",
    "natest_home": "https://www.natest.jp/",
    "ielts_academic": "https://ielts.org/take-a-test/test-types/ielts-academic-test",
    "ielts_scoring": "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail",
    "ielts_cefr": "https://ielts.org/organisations/ielts-for-organisations/compare-ielts/ielts-and-the-cefr",
    "ielts_listening": "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening",
    "toeic_lr": "https://www.ets.org/toeic/test-takers/about/listening-reading.html",
    "toeic_lr_format": "https://www.iibc-global.org/english/toeic/test/lr/about/format.html",
    "toeic_lr_about": "https://www.iibc-global.org/english/toeic/test/lr/about.html",
    "toeic_lr_guide01": "https://www.iibc-global.org/english/toeic/test/lr/guide01.html",
    "toeic_lr_guide02": "https://www.iibc-global.org/english/toeic/test/lr/guide02.html",
    "toeic_lr_guide03": "https://www.iibc-global.org/english/toeic/test/lr/guide03.html",
    "toeic_lr_guide04": "https://www.iibc-global.org/english/toeic/test/lr/guide04.html",
    "toeic_lr_guide05": "https://www.iibc-global.org/english/toeic/test/lr/guide05.html",
    "toefl_content": "https://www.ets.org/toefl/test-takers/ibt/about/content.html",
    "toefl_scores": "https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html",
    "coe_cefr_levels": "https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale",
}


def to_text(raw: bytes) -> str:
    s = raw.decode("utf-8", errors="replace")
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<(br|/p|/tr|/li|/h\d|/div)[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    return re.sub(r"\n\s*\n+", "\n", s).strip()


def main(only: list[str]) -> None:
    out = ROOT / "raw" / "exams"
    out.mkdir(parents=True, exist_ok=True)
    for slug, url in PAGES.items():
        if only and slug not in only:
            continue
        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            body = to_text(r.content) if r.ok else ""
            status = str(r.status_code)
        except requests.RequestException as e:
            body, status = "", f"ERR {type(e).__name__}"
        (out / f"{slug}.txt").write_text(f"{url}\t{status}\t{now}\n{body}", encoding="utf-8")
        print(slug, status, len(body))
        time.sleep(0.5)


if __name__ == "__main__":
    main(sys.argv[1:])
