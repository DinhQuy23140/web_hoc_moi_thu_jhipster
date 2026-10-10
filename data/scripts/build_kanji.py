"""Build schema-conformant kanji JSONL from an editorial spec plus cached raw data.

Usage:
    python data/scripts/build_kanji.py ja.n5.kanji.core

Inputs:
    data/editorial/<node_id>.json            (Hán Việt pick, search readings, senses, example refs)
    data/raw/<node_id>.raw.json              (collect_kanji.py: KANJIDIC2 + kanji-data)
    data/jsonl/<examples_from>.jsonl         (examples are reused from an already-built vocab batch)
Outputs:
    data/jsonl/<node_id>.jsonl, data/registry/ids.json
Exit code 1 if any checklist rule fails.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata

from build_ja_vocab import (
    ROOT, hira_to_kata, kata_to_hira, load_registry, norm_key, romaji_keys, save_registry, stable_id, strip_vi, uniq,
    vi_terms,
)


def kana_forms(reading: str) -> str:
    """'た.べる' / '-ゆ.き' / 'ショク' -> plain hiragana."""
    return kata_to_hira(reading.replace(".", "").replace("-", ""))


def tatoeba_examples(node_id: str) -> dict[str, dict]:
    out = {}
    for line in (ROOT / "jsonl" / f"{node_id}.jsonl").read_text(encoding="utf-8").splitlines():
        for ex in json.loads(line)["examples"]:
            m = re.search(r"/show/(\d+)", ex["source"])
            out[m.group(1)] = ex
    return out


def build(node_id: str) -> int:
    spec = json.loads((ROOT / "editorial" / f"{node_id}.json").read_text(encoding="utf-8"))
    raw = json.loads((ROOT / "raw" / f"{node_id}.raw.json").read_text(encoding="utf-8"))["items"]
    pool = tatoeba_examples(spec["examples_from"])
    reg = load_registry()
    lang, level, skill = spec["language"], spec["level"], spec["skill"]
    errors: list[str] = []
    entries = []
    vocab_ids = {k.split("|")[1]: v for k, v in reg["ids"].items() if k.startswith(f"{lang}|") and ".vocab." in v}

    for e in spec["entries"]:
        hw = e["headword"]
        eid = stable_id(reg, lang, level, skill, hw, "", "kanji")
        r = raw.get(hw)
        kd = (r or {}).get("kanjidic2", {}).get("data")
        kx = (r or {}).get("kanji_data", {}).get("data")
        if not kd or not kx:
            errors.append(f"{hw}: missing KANJIDIC2 or kanji-data record")
            continue

        senses = [{
            "sense_id": f"{eid}.s{i}", "definition_native": s["definition_native"], "register": s["register"],
            "domain": s["domain"], "usage_notes_vi": s["usage_notes_vi"], "translations": s["translations"],
            "false_friend_note": s["false_friend_note"],
        } for i, s in enumerate(e["senses"], 1)]

        examples, tatoeba_ids = [], []
        for ex in e["examples"]:
            src = pool.get(str(ex["ja"]))
            if src is None:
                errors.append(f"{hw}: example #{ex['ja']} not in {spec['examples_from']}")
                continue
            if hw not in ex["word"] or ex["word"] not in src["text"] or ex["word_reading"] not in src["reading"]:
                errors.append(f"{hw}: example #{ex['ja']} word/reading mismatch")
            tatoeba_ids += re.findall(r"#(\d+)", src["source"])
            examples.append({**src, "sense_id": f"{eid}.s{ex['sense']}", "focus_word": ex["word"],
                             "focus_reading": ex["word_reading"]})

        all_readings = {kana_forms(x) for x in kd["on"] + kd["kun"]}
        bad = [x for x in e["search_readings"] if x not in all_readings]
        if bad:
            errors.append(f"{hw}: search_readings not in KANJIDIC2 on/kun: {bad}")
        reading_keys = []
        for rd in e["search_readings"]:
            reading_keys += [rd, hira_to_kata(rd), *romaji_keys(rd)]
        hv = unicodedata.normalize("NFC", e["han_viet"])
        if hv not in [unicodedata.normalize("NFC", x).lower() for x in kd["vietnam"]]:
            errors.append(f"{hw}: Hán Việt '{hv}' not in KANJIDIC2 {kd['vietnam']}")
        vi_keys = [hv]
        for s in e["senses"]:
            vi_keys += [x for t in s["translations"] if t["target"] == "vi" and t["equivalence"] in ("exact", "close")
                        for x in vi_terms(t["text"])]
        primary = uniq([hw])
        reading_keys = [k for k in uniq(reading_keys) if k not in primary]
        vi_keys = uniq(vi_keys)
        vi_ascii = uniq(strip_vi(k) for k in vi_keys)

        conflicts = []
        for field in ("strokes", "grade", "freq"):
            if kd[field] != kx[field]:
                conflicts.append({"field": f"kanji_info.{field}", "detail": f"KANJIDIC2={kd[field]} kanji-data={kx[field]}",
                                  "resolution": "KANJIDIC2 value kept", "resolved": True})
        conflicts.append({
            "field": "learning.level",
            "detail": (f"Only one source gives the new JLPT level (kanji-data jlpt_new={kx['jlpt_new']}); "
                       f"KANJIDIC2 has only the pre-2010 4-level JLPT ({kd['jlpt_old']}), which does not separate N5 from N4. "
                       "kanji-data strokes/grade/freq are copied from KANJIDIC, so they are not independent evidence."),
            "resolution": None, "resolved": False,
        })

        sources = [
            {"name": "KANJIDIC2 (EDRDG)", "url": r["kanjidic2"]["url"], "license": "CC BY-SA 4.0",
             "retrieved_at": r["kanjidic2"]["retrieved_at"], "share_alike": True,
             "attribution": "KANJIDIC2 © Electronic Dictionary Research and Development Group (edrdg.org)"},
            {"name": "kanji-data (jlpt_new, grade, strokes, freq)", "url": "https://github.com/davidluzgouveia/kanji-data",
             "license": "MIT", "retrieved_at": r["kanji_data"]["retrieved_at"], "share_alike": False,
             "attribution": "David Gouveia"},
        ]
        if examples:
            sources.append({"name": "Tatoeba", "url": "https://tatoeba.org", "license": "CC BY 2.0 FR",
                            "retrieved_at": r["kanji_data"]["retrieved_at"], "share_alike": False,
                            "attribution": "Tatoeba contributors, sentences #" + ", #".join(dict.fromkeys(tatoeba_ids))})
        sources.append({"name": "web_ngon_ngu editorial (Hán Việt pick, vi meanings, notes)", "url": None,
                        "license": "own-work", "retrieved_at": r["kanji_data"]["retrieved_at"][:10],
                        "share_alike": False, "attribution": spec["editor"]})

        entry = {
            "id": eid, "node_id": spec["node_id"], "language": lang, "entry_type": spec["entry_type"],
            "headword": hw, "reading": "", "romaji": None, "pos": "kanji",
            "inflections": [], "variants": [],
            "kanji_info": {
                "han_viet": hv.upper(), "han_viet_all": kd["vietnam"], "on": kd["on"], "kun": kd["kun"],
                "strokes": kd["strokes"], "grade": kd["grade"], "jlpt_new": kx["jlpt_new"], "jlpt_old": kd["jlpt_old"],
                "meanings_en": kd["meanings_en"],
            },
            "senses": senses, "examples": examples,
            "collocations": [], "synonyms": [], "antonyms": [],
            "related_ids": [v for w, v in vocab_ids.items() if hw in w],
            "learning": {
                "level": level, "cefr_equiv": spec["cefr_equiv"], "difficulty": 1, "frequency_rank": kd["freq"],
                "topic_tags": e["topic_tags"], "prerequisite_ids": [], "skill": skill,
                "exercise_hints": ["reading_choice", "meaning_choice", "kanji_from_reading"], "audio_url": None,
            },
            "exam": {"exam_tags": ["JLPT"], "exam_level": level, "common_in_sections": ["言語知識（文字・語彙）"]},
            "search": {
                "primary_keys": primary, "reading_keys": reading_keys, "vi_keys": vi_keys,
                "vi_keys_no_diacritics": vi_ascii, "alias_keys": [], "normalization": "NFKC",
                "boost": 1.5 if (kd["freq"] or 9999) <= 500 else 1.0,
            },
            "translation_meta": {"do_not_translate": False, "glossary": False, "preferred_vi": None},
            "sources": sources, "conflicts": conflicts,
            "needs_review": any(s["license"] == "unknown" for s in sources) or any(not c["resolved"] for c in conflicts),
            "status": "draft", "version": 1,
        }

        hashable = json.loads(json.dumps(entry))
        for s in hashable["sources"]:
            s.pop("retrieved_at", None)
        hashable.pop("version")
        h = hashlib.sha256(json.dumps(hashable, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        prev = reg["versions"].get(eid)
        if prev is None or prev["hash"] != h:
            reg["versions"][eid] = {"version": (prev or {"version": 0})["version"] + 1, "hash": h}
        entry["version"] = reg["versions"][eid]["version"]

        errors += check(entry)
        entries.append(entry)

    if len({en["id"] for en in entries}) != len(entries):
        errors.append("duplicate id")
    out = ROOT / "jsonl" / f"{node_id}.jsonl"
    out.write_text("".join(json.dumps(en, ensure_ascii=False) + "\n" for en in entries), encoding="utf-8")
    save_registry(reg)
    print(f"wrote {out} ({len(entries)} entries, {sum(en['needs_review'] for en in entries)} needs_review)")
    for err in errors:
        print("CHECK FAIL:", err)
    return 1 if errors else 0


def check(entry: dict) -> list[str]:
    hw, errs = entry["headword"], []
    if len(hw) != 1 or not "\u4e00" <= hw <= "\u9fff":
        errs.append(f"{hw}: headword is not a single CJK ideograph")
    if entry["kanji_info"]["jlpt_new"] != int(entry["learning"]["level"][1:]):
        errs.append(f"{hw}: kanji-data jlpt_new does not confirm {entry['learning']['level']}")
    if not entry["examples"]:
        errs.append(f"{hw}: no example")
    for ex in entry["examples"]:
        if hw not in ex["text"]:
            errs.append(f"{hw}: example '{ex['text']}' lacks the kanji")
        if not ex["translations"].get("vi"):
            errs.append(f"{hw}: example missing vi")
    for s in entry["senses"]:
        for tgt in ("vi", "en"):
            if 1 not in [t["priority"] for t in s["translations"] if t["target"] == tgt]:
                errs.append(f"{s['sense_id']}: no priority-1 {tgt}")
        if not all(t.get("context_hint") for t in s["translations"]):
            errs.append(f"{s['sense_id']}: translation without context_hint")
    srch = entry["search"]
    for k in ("primary_keys", "reading_keys", "vi_keys", "vi_keys_no_diacritics", "alias_keys"):
        keys = srch[k]
        if any(not x for x in keys) or len(keys) != len(set(keys)):
            errs.append(f"{hw}: empty/duplicate {k}")
        if any(norm_key(x) != x or unicodedata.normalize("NFKC", x) != x for x in keys):
            errs.append(f"{hw}: {k} not NFKC-lowercase")
    if not any(re.fullmatch(r"[a-z' -]+", k) for k in srch["reading_keys"]):
        errs.append(f"{hw}: no ascii romaji key")
    return errs


if __name__ == "__main__":
    sys.exit(build(sys.argv[1]))
