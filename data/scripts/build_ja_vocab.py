"""Build schema-conformant JSONL from an editorial spec plus cached raw source data.

Usage:
    python data/scripts/build_ja_vocab.py ja.n5.vocab.daily_life

Inputs (offline, produced by collect_ja.py and manual review):
    data/editorial/<node_id>.json
    data/raw/<node_id>.raw.json
    data/raw/tatoeba_selected.raw.json
Outputs:
    data/jsonl/<node_id>.jsonl
    data/registry/ids.json   (stable id + version registry, commit it)
Exit code 1 if any checklist rule fails.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ----------------------------------------------------------------------------- kana / romaji

_KANA = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "o", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o", "ゔ": "vu",
}
_SMALL_Y = {"ゃ": "a", "ゅ": "u", "ょ": "o"}
_MACRON = {"a": "ā", "i": "ii", "u": "ū", "e": "ē", "o": "ō"}


def kata_to_hira(s: str) -> str:
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)


def hira_to_kata(s: str) -> str:
    return "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)


def _syllables(kana: str) -> list[str]:
    """Split hiragana into romaji syllables (no long-vowel merging)."""
    kana = kata_to_hira(kana)
    out: list[str] = []
    i = 0
    while i < len(kana):
        c = kana[i]
        nxt = kana[i + 1] if i + 1 < len(kana) else ""
        if c == "っ":
            out.append("っ")
        elif c == "ー":
            out.append("ー")
        elif nxt in _SMALL_Y and c in _KANA:
            base = _KANA[c]
            out.append(base[:-1] + _SMALL_Y[nxt] if base in ("shi", "chi", "ji") else base[:-1] + "y" + _SMALL_Y[nxt])
            i += 1
        elif c in _KANA:
            out.append(_KANA[c])
        else:
            out.append(c)
        i += 1
    # resolve sokuon / ん
    res: list[str] = []
    for j, syl in enumerate(out):
        after = out[j + 1] if j + 1 < len(out) else ""
        if syl == "っ":
            res.append("t" if after.startswith("ch") else (after[:1] if after[:1].isalpha() else ""))
        elif syl == "n" and after[:1] in ("a", "i", "u", "e", "o", "y"):
            res.append("n'")
        else:
            res.append(syl)
    return res


def romaji_wapuro(kana: str) -> str:
    """Kana-by-kana transliteration as typed in an IME (gakkou, sensei)."""
    s = "".join(_syllables(kana))
    return s.replace("ー", "-").replace("n'", "n")


def romaji_hepburn(kana: str) -> str:
    """Modified Hepburn with macrons (gakkō, sensei)."""
    syl = _syllables(kana)
    res = ""
    for part in syl:
        last = res[-1:] if res else ""
        if part == "ー" and last in _MACRON:
            res = res[:-1] + _MACRON[last]
        elif (part == "u" and last in ("o", "u")) or (part == "o" and last == "o") or (part == "a" and last == "a") or (part == "e" and last == "e"):
            res = res[:-1] + _MACRON[last]
        else:
            res += part
    return res


def romaji_keys(kana: str) -> list[str]:
    hep = romaji_hepburn(kana)
    plain = hep.translate(str.maketrans("āēīōū", "aeiou")).replace("'", "")
    doubled = hep.translate(str.maketrans({"ā": "aa", "ē": "ee", "ō": "oo", "ū": "uu"})).replace("'", "")
    return [hep, romaji_wapuro(kana), plain, doubled]


# ----------------------------------------------------------------------------- text utils

def norm_key(s: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", s).strip().lower())


def strip_vi(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def uniq(items) -> list[str]:
    seen, out = set(), []
    for x in items:
        k = norm_key(x) if isinstance(x, str) else x
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


def vi_terms(text: str) -> list[str]:
    text = re.sub(r"\([^)]*\)", " ", text)
    return [t.strip() for t in re.split(r"[,;/]", text) if t.strip() and "..." not in t]


def plain_reading(transcription: str) -> str:
    """'[学校|がっ|こう]は[好|す]き？' -> 'がっこうはすき？'"""
    return re.sub(r"\[([^|\]]+)\|([^\]]+)\]", lambda m: m.group(2).replace("|", ""), transcription)


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


# ----------------------------------------------------------------------------- registry

def load_registry() -> dict:
    p = ROOT / "registry" / "ids.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"ids": {}, "counters": {}, "versions": {}}


def save_registry(reg: dict) -> None:
    p = ROOT / "registry" / "ids.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(reg, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")


def stable_id(reg: dict, lang: str, level: str, skill: str, headword: str, reading: str, pos: str) -> str:
    key = f"{lang}|{headword}|{reading}|{pos}"
    if key not in reg["ids"]:
        prefix = f"{lang}.{level.lower()}.{skill}"
        reg["counters"][prefix] = reg["counters"].get(prefix, 0) + 1
        reg["ids"][key] = f"{prefix}.{reg['counters'][prefix]:05d}"
    return reg["ids"][key]


# ----------------------------------------------------------------------------- build

def build(node_id: str) -> int:
    spec = json.loads((ROOT / "editorial" / f"{node_id}.json").read_text(encoding="utf-8"))
    raw = json.loads((ROOT / "raw" / f"{node_id}.raw.json").read_text(encoding="utf-8"))["items"]
    tat = json.loads((ROOT / "raw" / "tatoeba_selected.raw.json").read_text(encoding="utf-8"))
    tr_lic = tat["translation_licenses"]
    reg = load_registry()
    lang, level, skill = spec["language"], spec["level"], spec["skill"]
    errors: list[str] = []
    entries = []

    for e in spec["entries"]:
        hw = e["headword"]
        eid = stable_id(reg, lang, level, skill, hw, e["reading"], e["pos"])
        e["_id"] = eid
    by_headword = {e["headword"]: e["_id"] for e in spec["entries"]}
    by_headword.update({k.split("|")[1]: v for k, v in reg["ids"].items() if k.startswith(f"{lang}|")})

    for e in spec["entries"]:
        hw, eid = e["headword"], e["_id"]
        r = raw.get(hw)
        if r is None:
            errors.append(f"{hw}: missing raw data")
            continue
        jisho = r["jisho"]
        jentry = jisho["entries"][0] if jisho["entries"] else None
        wikt = r["wiktionary"]
        jlpt_tags = jentry.get("jlpt", []) if jentry else []

        # ---- senses
        senses = []
        for i, s in enumerate(e["senses"], 1):
            senses.append({
                "sense_id": f"{eid}.s{i}",
                "definition_native": s["definition_native"],
                "register": s["register"],
                "domain": s["domain"],
                "usage_notes_vi": s["usage_notes_vi"],
                "translations": s["translations"],
                "false_friend_note": s["false_friend_note"],
            })

        # ---- examples
        examples, tatoeba_ids = [], []
        for ex in e["examples"]:
            ja = tat.get(str(ex["ja"]))
            if ja is None:
                errors.append(f"{hw}: tatoeba #{ex['ja']} not cached")
                continue
            trans, refs = {}, [f"ja #{ex['ja']}"]
            tatoeba_ids.append(ex["ja"])
            for tl in ("vi", "en"):
                if ex.get(tl):
                    t = tr_lic.get(str(ex[tl]))
                    if t is None:
                        errors.append(f"{hw}: translation #{ex[tl]} not cached")
                        continue
                    if t["license"] not in ("CC BY 2.0 FR", "CC0 1.0"):
                        errors.append(f"{hw}: translation #{ex[tl]} has license {t['license']}")
                    trans[tl] = t["text"]
                    refs.append(f"{tl} #{ex[tl]}")
                    tatoeba_ids.append(ex[tl])
                elif ex.get(f"{tl}_editorial"):
                    trans[tl] = ex[f"{tl}_editorial"]
                    refs.append(f"{tl}: editorial")
            reading = plain_reading(ja["transcriptions"][0]) if ja["transcriptions"] else ""
            examples.append({
                "sense_id": f"{eid}.s{ex['sense']}",
                "text": ja["text"],
                "reading": reading,
                "translations": trans,
                "alignment_verified": True,
                "source": f"Tatoeba ({', '.join(refs)}) https://tatoeba.org/en/sentences/show/{ex['ja']}",
                "license": ja["license"],
            })

        # ---- search keys
        variants = e["variants"]
        inflections = e["inflections"]
        readings = [e["reading"], *e.get("alt_readings", []), *[v[1] for v in variants], *[f[1] for f in inflections]]
        reading_keys = []
        for rd in readings:
            reading_keys += [rd, hira_to_kata(rd), *romaji_keys(rd)]
        if e.get("romaji_segments"):
            segs = e["romaji_segments"]
            reading_keys += [" ".join(segs), "-".join(segs)]
        vi_keys = []
        for s in e["senses"]:
            for t in s["translations"]:
                if t["target"] == "vi" and t["equivalence"] in ("exact", "close"):
                    vi_keys += vi_terms(t["text"])
        vi_keys += e.get("vi_keys_extra", [])
        primary = uniq([hw, *[v[0] for v in variants], *[f[0] for f in inflections]])
        reading_keys = [k for k in uniq(reading_keys) if k not in primary]
        vi_keys = uniq(vi_keys)
        vi_ascii = uniq(strip_vi(k) for k in vi_keys)
        taken = set(primary) | set(reading_keys) | set(vi_keys) | set(vi_ascii)
        alias = [k for k in uniq(e.get("alias_keys", [])) if k not in taken]

        # ---- sources
        retrieved = jisho["retrieved_at"]
        sources = [
            {"name": "JMdict (EDRDG) via Jisho.org API", "url": jisho["url"], "license": "CC BY-SA 4.0",
             "retrieved_at": retrieved, "share_alike": True,
             "attribution": "JMdict © Electronic Dictionary Research and Development Group (edrdg.org)"},
            {"name": "Wiktionary (English)", "url": wikt["url"], "license": "CC BY-SA 4.0",
             "retrieved_at": wikt["retrieved_at"], "share_alike": True, "attribution": "Wiktionary contributors"},
            {"name": "open-anki-jlpt-decks n5.csv (unofficial JLPT list)",
             "url": "https://github.com/jamsinclair/open-anki-jlpt-decks/blob/main/src/n5.csv", "license": "MIT",
             "retrieved_at": r["jlpt_list"]["retrieved_at"], "share_alike": False, "attribution": "Jamie Sinclair"},
            {"name": "Jonathan Waller JLPT Resources (via Jisho JLPT tags, unofficial)",
             "url": "http://www.tanos.co.uk/jlpt/", "license": "unknown", "retrieved_at": retrieved,
             "share_alike": False, "attribution": "Jonathan Waller; site unreachable at retrieval, licence not verified"},
        ]
        if examples:
            sources.append({
                "name": "Tatoeba", "url": "https://tatoeba.org", "license": "CC BY 2.0 FR",
                "retrieved_at": max(tat[str(x["ja"])]["retrieved_at"] for x in e["examples"] if str(x["ja"]) in tat),
                "share_alike": False,
                "attribution": "Tatoeba contributors, sentences #" + ", #".join(str(i) for i in tatoeba_ids),
            })
        sources.append({"name": "web_ngon_ngu editorial (definitions, vi translations, notes)", "url": None,
                        "license": "own-work", "retrieved_at": retrieved[:10], "share_alike": False,
                        "attribution": spec["editor"]})

        # ---- level cross-check
        level_evidence = {
            "jisho_jlpt_tags": jlpt_tags,
            "open_anki_levels": sorted(r["jlpt_list"]["matches"]),
        }
        conflicts = list(e.get("conflicts", []))
        needs_review = any(s["license"] == "unknown" for s in sources) or any(not c.get("resolved") for c in conflicts)

        entry = {
            "id": eid,
            "node_id": spec["node_id"],
            "language": lang,
            "entry_type": spec["entry_type"],
            "headword": hw,
            "reading": e["reading"],
            "romaji": romaji_hepburn(e["reading"]),
            "pos": e["pos"],
            "inflections": [f[0] for f in inflections],
            "variants": [v[0] for v in variants],
            "senses": senses,
            "examples": examples,
            "collocations": e["collocations"],
            "synonyms": e["synonyms"],
            "antonyms": e["antonyms"],
            "related_ids": [by_headword[h] for h in e["related"] if h in by_headword and by_headword[h] != eid],
            "learning": {
                "level": level,
                "cefr_equiv": spec["cefr_equiv"],
                "difficulty": 1,
                "frequency_rank": None,
                "topic_tags": e["topic_tags"],
                "prerequisite_ids": [],
                "skill": skill,
                "exercise_hints": e["exercise_hints"],
                "audio_url": None,
            },
            "exam": {"exam_tags": ["JLPT"], "exam_level": level, "common_in_sections": ["言語知識（文字・語彙）"]},
            "search": {
                "primary_keys": primary,
                "reading_keys": reading_keys,
                "vi_keys": vi_keys,
                "vi_keys_no_diacritics": vi_ascii,
                "alias_keys": alias,
                "normalization": "NFKC",
                "boost": 1.5 if (jentry or {}).get("is_common") else 1.0,
            },
            "translation_meta": {"do_not_translate": False, "glossary": False, "preferred_vi": None},
            "sources": sources,
            "conflicts": conflicts,
            "needs_review": needs_review,
            "status": "draft",
            "version": 1,
        }

        # ---- version bump on content change (ignores retrieval timestamps)
        hashable = json.loads(json.dumps(entry))
        for s in hashable["sources"]:
            s.pop("retrieved_at", None)
        hashable.pop("version")
        h = hashlib.sha256(json.dumps(hashable, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        prev = reg["versions"].get(eid)
        if prev is None:
            reg["versions"][eid] = {"version": 1, "hash": h}
        elif prev["hash"] != h:
            reg["versions"][eid] = {"version": prev["version"] + 1, "hash": h}
        entry["version"] = reg["versions"][eid]["version"]

        errors += check(entry, e, level_evidence)
        entries.append(entry)

    seen_ids, seen_hp = set(), set()
    for en in entries:
        if en["id"] in seen_ids:
            errors.append(f"duplicate id {en['id']}")
        if (en["headword"], en["pos"]) in seen_hp:
            errors.append(f"duplicate headword+pos {en['headword']} {en['pos']}")
        seen_ids.add(en["id"])
        seen_hp.add((en["headword"], en["pos"]))

    out = ROOT / "jsonl" / f"{node_id}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("".join(json.dumps(en, ensure_ascii=False) + "\n" for en in entries), encoding="utf-8")
    save_registry(reg)

    print(f"wrote {out} ({len(entries)} entries, {sum(en['needs_review'] for en in entries)} needs_review)")
    for err in errors:
        print("CHECK FAIL:", err)
    return 1 if errors else 0


def check(entry: dict, spec_entry: dict, level_evidence: dict) -> list[str]:
    hw = entry["headword"]
    errs = []
    if not entry["sources"] or any(not s["license"] for s in entry["sources"]):
        errs.append(f"{hw}: missing source/license")
    lvl = entry["learning"]["level"].lower()
    if f"jlpt-{lvl}" not in level_evidence["jisho_jlpt_tags"]:
        errs.append(f"{hw}: Jisho JLPT tag does not confirm {lvl}")
    if lvl not in level_evidence["open_anki_levels"]:
        errs.append(f"{hw}: open-anki-jlpt-decks does not confirm {lvl}")
    if not all("\u3041" <= c <= "\u309f" or c == "ー" for c in entry["reading"]):
        errs.append(f"{hw}: reading is not pure hiragana")
    surfaces = [hw, *entry["variants"], *entry["inflections"]]
    readings = [entry["reading"], *spec_entry.get("alt_readings", []), *[f[1] for f in spec_entry["inflections"]]]
    for ex in entry["examples"]:
        if not any(s in ex["text"] for s in surfaces):
            errs.append(f"{hw}: example '{ex['text']}' does not contain headword/variant/inflection")
        if not any(r in ex["reading"] for r in readings):
            errs.append(f"{hw}: example reading '{ex['reading']}' does not contain entry reading")
        if set(ex["translations"]) - {"vi", "en"}:
            errs.append(f"{hw}: example has translation outside TRANSLATION_PAIRS")
        if not ex["translations"].get("vi"):
            errs.append(f"{hw}: example '{ex['text']}' missing vi")
    for s in entry["senses"]:
        for tgt in ("vi", "en"):
            pr = [t["priority"] for t in s["translations"] if t["target"] == tgt]
            if 1 not in pr:
                errs.append(f"{s['sense_id']}: no priority-1 {tgt} translation")
        if not all(t.get("context_hint") for t in s["translations"]):
            errs.append(f"{s['sense_id']}: translation without context_hint")
    srch = entry["search"]
    for k in ("primary_keys", "reading_keys", "vi_keys", "vi_keys_no_diacritics", "alias_keys"):
        keys = srch[k]
        if any(not x for x in keys) or len(keys) != len(set(keys)):
            errs.append(f"{hw}: empty/duplicate {k}")
        if any(unicodedata.normalize("NFKC", x).lower() != x for x in keys):
            errs.append(f"{hw}: {k} not NFKC-lowercase")
    if not srch["reading_keys"] or not any(re.fullmatch(r"[a-z' -]+", k) for k in srch["reading_keys"]):
        errs.append(f"{hw}: no ascii romaji key")
    return errs


if __name__ == "__main__":
    sys.exit(build(sys.argv[1]))
