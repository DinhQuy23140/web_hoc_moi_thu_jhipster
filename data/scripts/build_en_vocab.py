"""Build schema-conformant English JSONL from an editorial spec plus cached raw source data.

Usage:
    python data/scripts/build_en_vocab.py en.a1.vocab.daily_life

Inputs (offline):
    data/editorial/<node_id>.json
    data/raw/<node_id>.raw.json                      (collect_en.py)
    data/raw/cache/cefrj-vocabulary-profile-1.5.csv  (example level check)
Outputs:
    data/jsonl/<node_id>.jsonl, data/registry/ids.json
Exit code 1 if any checklist rule fails.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import re
import sys
import unicodedata

from build_ja_vocab import ROOT, load_registry, norm_key, save_registry, stable_id, strip_vi, uniq, vi_terms

CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]
OK_LICENSES = ("CC BY 2.0 FR", "CC0 1.0")
IRREGULAR = {"had": "have", "has": "have", "went": "go", "gone": "go", "saw": "see", "seen": "see", "ate": "eat",
             "eaten": "eat", "drank": "drink", "drunk": "drink", "'s": "be", "'re": "be", "'m": "be", "n't": "not",
             "am": "be", "is": "be", "are": "be", "was": "be", "were": "be"}


def cefrj_index() -> dict[str, str]:
    """headword -> lowest CEFR level over all parts of speech."""
    text = (ROOT / "raw" / "cache" / "cefrj-vocabulary-profile-1.5.csv").read_bytes().decode("utf-8-sig")
    idx: dict[str, str] = {}
    for row in csv.DictReader(io.StringIO(text)):
        for h in row["headword"].split("/"):
            h = h.strip().lower()
            if h and (h not in idx or CEFR_ORDER.index(row["CEFR"]) < CEFR_ORDER.index(idx[h])):
                idx[h] = row["CEFR"]
    return idx


def lemma_candidates(tok: str) -> list[str]:
    c = [tok, IRREGULAR.get(tok, tok)]
    for suf, rep in (("ies", "y"), ("es", ""), ("s", ""), ("ing", ""), ("ing", "e"), ("ed", ""), ("ed", "e"), ("d", "")):
        if tok.endswith(suf) and len(tok) > len(suf) + 1:
            c.append(tok[: -len(suf)] + rep)
    if re.search(r"(.)\1(ing|ed)$", tok):
        c.append(re.sub(r"(.)\1(ing|ed)$", r"\1", tok))
    return c


def tokens(text: str) -> list[str]:
    text = text.lower().replace("’", "'")
    return re.findall(r"[a-z]+|'[a-z]+|n't", re.sub(r"n't\b", " n't", text))


def above_level(text: str, level: str, idx: dict[str, str], allow: set[str]) -> list[str]:
    limit = CEFR_ORDER.index(level)
    bad = []
    for tok in tokens(text):
        if tok in allow:
            continue
        levels = [idx[c] for c in lemma_candidates(tok) if c in idx]
        if not levels or min(CEFR_ORDER.index(x) for x in levels) > limit:
            bad.append(tok)
    return bad


def build(node_id: str) -> int:
    spec = json.loads((ROOT / "editorial" / f"{node_id}.json").read_text(encoding="utf-8"))
    raw_all = json.loads((ROOT / "raw" / f"{node_id}.raw.json").read_text(encoding="utf-8"))
    raw = raw_all["items"]
    idx = cefrj_index()
    reg = load_registry()
    lang, level, skill = spec["language"], spec["level"], spec["skill"]
    allow = set(spec.get("proper_nouns", []))
    ja_ids = {k.split("|")[1]: v for k, v in reg["ids"].items() if k.startswith("ja|") and ".vocab." in v}
    errors: list[str] = []
    entries = []

    for e in spec["entries"]:
        hw, pos = e["headword"], e["pos"]
        r = raw.get(hw)
        if r is None:
            errors.append(f"{hw}: missing raw data")
            continue
        eid = stable_id(reg, lang, level, skill, hw, e["ipa"]["uk"], pos)

        senses = [{
            "sense_id": f"{eid}.s{i}", "definition_native": s["definition_native"], "register": s["register"],
            "domain": s["domain"], "usage_notes_vi": s["usage_notes_vi"], "translations": s["translations"],
            "false_friend_note": s["false_friend_note"],
        } for i, s in enumerate(e["senses"], 1)]

        cands = {s["id"]: s for s in r["tatoeba"]["sentences"]}
        examples, tatoeba_ids = [], []
        for ex in e["examples"]:
            s = cands.get(ex["en"])
            if s is None:
                errors.append(f"{hw}: tatoeba eng #{ex['en']} not in collected candidates")
                continue
            if s["license"] not in OK_LICENSES:
                errors.append(f"{hw}: eng #{s['id']} licence {s['license']}")
            trans, refs = {}, [f"en #{s['id']}"]
            tatoeba_ids.append(s["id"])
            by_id = {t["id"]: t for t in s["translations"]}
            for tl in ("vi", "ja"):
                if ex.get(tl):
                    t = by_id.get(ex[tl])
                    if t is None:
                        errors.append(f"{hw}: #{ex[tl]} is not a {tl} translation of eng #{s['id']}")
                        continue
                    if t["license"] not in OK_LICENSES:
                        errors.append(f"{hw}: {tl} #{t['id']} licence {t['license']}")
                    trans[tl] = t["text"]
                    refs.append(f"{tl} #{t['id']}{'' if t['direct'] else ' (indirect)'}")
                    tatoeba_ids.append(t["id"])
                elif ex.get(f"{tl}_editorial"):
                    trans[tl] = ex[f"{tl}_editorial"]
                    refs.append(f"{tl}: editorial")
            examples.append({
                "sense_id": f"{eid}.s{ex['sense']}", "text": s["text"], "reading": None, "translations": trans,
                "alignment_verified": True,
                "source": f"Tatoeba ({', '.join(refs)}) https://tatoeba.org/en/sentences/show/{s['id']}",
                "license": s["license"],
            })
            bad = above_level(s["text"], level, idx, allow)
            if bad:
                errors.append(f"{hw}: example '{s['text']}' has words above {level} in CEFR-J: {bad}")

        wk = r["wiktionary"]
        for variety, ipa in e["ipa"].items():
            if not any(ipa in t for t in wk["ipa"]):
                errors.append(f"{hw}: IPA {variety} {ipa} not found in Wiktionary")

        vi_keys = [x for s in e["senses"] for t in s["translations"] if t["target"] == "vi" and t["equivalence"] in ("exact", "close")
                   for x in vi_terms(t["text"])]
        primary = uniq([hw, *e["inflections"]])
        vi_keys = uniq(vi_keys)
        vi_ascii = uniq(strip_vi(k) for k in vi_keys)
        taken = set(primary) | set(vi_keys) | set(vi_ascii)
        alias = [k for k in uniq(e.get("alias_keys", [])) if k not in taken]

        cefrj_rows = [x for x in r["cefrj"]["rows"] if x["pos"] == pos]
        ngsl_rank = r["ngsl"]["rows"][0]["rank"] if r["ngsl"]["rows"] else None
        conflicts = [{
            "field": "learning.level",
            "detail": (f"Only one open source gives a CEFR level (CEFR-J: {[x['CEFR'] for x in cefrj_rows]}); "
                       f"NGSL rank {ngsl_rank} supports high frequency but is not a level list."),
            "resolution": None, "resolved": False,
        }]
        other = [f"{x['pos']}={x['CEFR']}" for x in r["cefrj"]["rows"] if x["pos"] != pos]
        if other:
            conflicts.append({"field": "pos", "detail": f"CEFR-J also lists {', '.join(other)}; only {pos} is in scope for {level}",
                              "resolution": f"entry limited to {pos}", "resolved": True})

        sources = [
            {"name": "CEFR-J Vocabulary Profile 1.5", "url": r["cefrj"]["url"],
             "license": "CEFR-J terms (free for research/commercial use with citation)", "retrieved_at": r["cefrj"]["retrieved_at"],
             "share_alike": False, "attribution": "The CEFR-J Wordlist Version 1.5, compiled by Yukio Tono, Tokyo University of Foreign Studies"},
            {"name": "New General Service List 1.2 (stats)", "url": r["ngsl"]["url"], "license": "CC BY-SA 4.0",
             "retrieved_at": r["ngsl"]["retrieved_at"], "share_alike": True, "attribution": "Browne, C., Culligan, B. & Phillips, J., NGSL 1.2"},
            {"name": "Wiktionary (English)", "url": wk["url"], "license": "CC BY-SA 4.0", "retrieved_at": wk["retrieved_at"],
             "share_alike": True, "attribution": "Wiktionary contributors (IPA)"},
        ]
        if examples:
            sources.append({"name": "Tatoeba", "url": "https://tatoeba.org", "license": "CC BY 2.0 FR",
                            "retrieved_at": r["tatoeba"]["retrieved_at"], "share_alike": False,
                            "attribution": "Tatoeba contributors, sentences #" + ", #".join(str(i) for i in dict.fromkeys(tatoeba_ids))})
        sources.append({"name": "web_ngon_ngu editorial (definitions, vi/ja translations, notes)", "url": None,
                        "license": "own-work", "retrieved_at": r["tatoeba"]["retrieved_at"][:10], "share_alike": False,
                        "attribution": spec["editor"]})

        entry = {
            "id": eid, "node_id": spec["node_id"], "language": lang, "entry_type": spec["entry_type"],
            "headword": hw, "reading": e["ipa"]["uk"], "romaji": None, "pos": pos,
            "ipa": e["ipa"],
            "inflections": e["inflections"], "variants": [],
            "senses": senses, "examples": examples,
            "collocations": e["collocations"], "synonyms": e["synonyms"], "antonyms": e["antonyms"],
            "related_ids": [ja_ids[e["ja_link"]]] if e.get("ja_link") in ja_ids else [],
            "learning": {
                "level": level, "cefr_equiv": spec["cefr_equiv"], "difficulty": 1, "frequency_rank": ngsl_rank,
                "topic_tags": e["topic_tags"], "prerequisite_ids": [], "skill": skill,
                "exercise_hints": e["exercise_hints"], "audio_url": None,
            },
            "exam": {"exam_tags": [], "exam_level": None, "common_in_sections": []},
            "search": {
                "primary_keys": primary, "reading_keys": [], "vi_keys": vi_keys, "vi_keys_no_diacritics": vi_ascii,
                "alias_keys": alias, "normalization": "NFKC", "boost": 1.5 if ngsl_rank and ngsl_rank <= 1000 else 1.0,
            },
            "translation_meta": {"do_not_translate": False, "glossary": False, "preferred_vi": None},
            "sources": sources, "conflicts": conflicts,
            "needs_review": any(not c["resolved"] for c in conflicts),
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

        errors += check(entry, cefrj_rows)
        entries.append(entry)

    if len({en["id"] for en in entries}) != len(entries) or len({(en["headword"], en["pos"]) for en in entries}) != len(entries):
        errors.append("duplicate id or headword+pos")
    out = ROOT / "jsonl" / f"{node_id}.jsonl"
    out.write_text("".join(json.dumps(en, ensure_ascii=False) + "\n" for en in entries), encoding="utf-8")
    save_registry(reg)
    print(f"wrote {out} ({len(entries)} entries, {sum(en['needs_review'] for en in entries)} needs_review)")
    for err in errors:
        print("CHECK FAIL:", err)
    return 1 if errors else 0


def check(entry: dict, cefrj_rows: list[dict]) -> list[str]:
    hw, errs = entry["headword"], []
    if not any(x["CEFR"] == entry["learning"]["level"] for x in cefrj_rows):
        errs.append(f"{hw}: CEFR-J does not confirm {entry['learning']['level']} for pos {entry['pos']}")
    forms = [hw, *entry["inflections"]]
    for ex in entry["examples"]:
        if not any(re.search(rf"\b{re.escape(f)}\b", ex["text"], re.I) for f in forms):
            errs.append(f"{hw}: example '{ex['text']}' lacks headword/inflection")
        if set(ex["translations"]) - {"vi", "ja"}:
            errs.append(f"{hw}: example translation outside TRANSLATION_PAIRS (en-vi, en-ja)")
        if not ex["translations"].get("vi"):
            errs.append(f"{hw}: example '{ex['text']}' missing vi")
    for s in entry["senses"]:
        for tgt in ("vi", "ja"):
            if 1 not in [t["priority"] for t in s["translations"] if t["target"] == tgt]:
                errs.append(f"{s['sense_id']}: no priority-1 {tgt}")
        if not all(t.get("context_hint") for t in s["translations"]):
            errs.append(f"{s['sense_id']}: translation without context_hint")
    srch = entry["search"]
    for k in ("primary_keys", "vi_keys", "vi_keys_no_diacritics", "alias_keys"):
        keys = srch[k]
        if any(not x for x in keys) or len(keys) != len(set(keys)):
            errs.append(f"{hw}: empty/duplicate {k}")
        if any(norm_key(x) != x or unicodedata.normalize("NFKC", x) != x for x in keys):
            errs.append(f"{hw}: {k} not NFKC-lowercase")
    return errs


if __name__ == "__main__":
    sys.exit(build(sys.argv[1]))
