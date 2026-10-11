"""Build the full vocabulary bank (JLPT N5-N1 words and kanji, CEFR A1-C2 English words) for seed/bank/.

Usage:
    python data/scripts/bank.py fetch    # download open sources into data/raw/cache/dl (git-ignored)
    python data/scripts/bank.py todo     # write data/bank/todo/<set>.<nn>.txt, the lines to translate
    python data/scripts/bank.py build    # merge data/bank/vi/*.txt, Tatoeba examples and IPA into seed/bank/*.json

Translation files mirror the todo chunks line by line as "headword|Vietnamese meaning"; build checks the headword
and only emits translated items, so the bank can be filled chunk by chunk.
Words already written by hand in seed/data are skipped (run `node seed/build.mjs` first so seed/out is current).

Sources:
    open-anki-jlpt-decks (word lists by JLPT level, MIT; glosses from JMdict)
    JMdict via jmdict-simplified (part of speech, CC BY-SA 4.0, EDRDG)
    kanji-data (new JLPT level per kanji, MIT) + KANJIDIC2 (Han-Viet readings, CC BY-SA 4.0, EDRDG)
    CEFR-J Vocabulary Profile 1.5 (A1-B2) + Octanove Vocabulary Profile C1/C2 1.0 (CC BY-SA 4.0)
    Tatoeba (example sentences and translations, CC BY 2.0 FR)
    CMU Pronouncing Dictionary (US pronunciation, BSD-style licence), converted to IPA
"""

from __future__ import annotations

import bz2
import csv
import gzip
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
CACHE = ROOT / "raw" / "cache"
DL = CACHE / "dl"
TODO = ROOT / "bank" / "todo"
VI = ROOT / "bank" / "vi"
OUT = REPO / "seed" / "bank"
CHUNK = 250

JA_LEVELS = ("n5", "n4", "n3", "n2", "n1")
EN_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
TATOEBA = "https://downloads.tatoeba.org/exports/per_language"
SOURCES = {
    **{f"jlpt-{lv}.csv": f"https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/{lv}.csv" for lv in JA_LEVELS},
    "kanji-data.json": "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json",
    "cmudict.dict": "https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict",
    "jpn_sentences.tsv.bz2": f"{TATOEBA}/jpn/jpn_sentences.tsv.bz2",
    "eng_sentences.tsv.bz2": f"{TATOEBA}/eng/eng_sentences.tsv.bz2",
    "vie_sentences.tsv.bz2": f"{TATOEBA}/vie/vie_sentences.tsv.bz2",
    "jpn-eng_links.tsv.bz2": f"{TATOEBA}/jpn/jpn-eng_links.tsv.bz2",
    "jpn-vie_links.tsv.bz2": f"{TATOEBA}/jpn/jpn-vie_links.tsv.bz2",
    "eng-vie_links.tsv.bz2": f"{TATOEBA}/eng/eng-vie_links.tsv.bz2",
    "jpn_transcriptions.tsv.bz2": f"{TATOEBA}/jpn/jpn_transcriptions.tsv.bz2",
}


# ----------------------------------------------------------------------------------------------- fetch


def download(name: str, url: str) -> None:
    path = DL / name
    if path.exists():
        return
    print("downloading", name, flush=True)
    with requests.get(url, stream=True, timeout=120, headers={"User-Agent": "mam-data-bank/1.0 (educational)"}) as r:
        r.raise_for_status()
        tmp = path.with_suffix(path.suffix + ".part")
        with tmp.open("wb") as f:
            for block in r.iter_content(1 << 20):
                f.write(block)
        tmp.replace(path)


def fetch() -> None:
    DL.mkdir(parents=True, exist_ok=True)
    for name, url in SOURCES.items():
        download(name, url)
    if not list(DL.glob("jmdict-eng-*.json.zip")):
        rel = requests.get("https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest", timeout=60).json()
        asset = next(a for a in rel["assets"] if re.match(r"jmdict-eng-\d.*\.json\.zip$", a["name"]))
        download(asset["name"], asset["browser_download_url"])
    print("sources ready in", DL)


# ------------------------------------------------------------------------------------------- helpers

ROMAJI = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o", "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so", "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no", "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo", "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro", "わ": "wa", "ゐ": "i", "ゑ": "e", "を": "wo", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go", "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do", "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po", "ゔ": "vu",
    "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o", "ゃ": "ya", "ゅ": "yu", "ょ": "yo", "ゎ": "wa",
}
DIGRAPH = {"ゃ": "a", "ゅ": "u", "ょ": "o"}
SPECIAL = {"しゃ": "sha", "しゅ": "shu", "しょ": "sho", "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho", "じゃ": "ja", "じゅ": "ju",
           "じょ": "jo", "ぢゃ": "ja", "ぢゅ": "ju", "ぢょ": "jo", "ふぁ": "fa", "ふぃ": "fi", "ふぇ": "fe", "ふぉ": "fo",
           "てぃ": "ti", "でぃ": "di", "とぅ": "tu", "どぅ": "du", "うぃ": "wi", "うぇ": "we", "うぉ": "wo", "ゔぁ": "va",
           "ゔぃ": "vi", "ゔぇ": "ve", "ゔぉ": "vo", "しぇ": "she", "じぇ": "je", "ちぇ": "che", "つぁ": "tsa", "つぇ": "tse",
           "つぉ": "tso", "いぇ": "ye", "くぁ": "kwa"}


def to_hira(s: str) -> str:
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)


def to_kata(s: str) -> str:
    return "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)


def romaji(reading: str) -> str:
    s = to_hira(re.sub(r"[～〜~・、\s]", "", reading))
    out: list[str] = []
    i = 0
    while i < len(s):
        two, c = s[i:i + 2], s[i]
        if two in SPECIAL:
            out.append(SPECIAL[two]); i += 2; continue
        if len(two) == 2 and two[1] in DIGRAPH and c in ROMAJI and c not in "いぃ" and ROMAJI[c].endswith("i"):
            out.append(ROMAJI[c][:-1] + "y" + DIGRAPH[two[1]]); i += 2; continue
        if c == "っ":
            nxt = romaji(s[i + 1:i + 3])[:1] if i + 1 < len(s) else ""
            out.append("t" if nxt == "c" else nxt); i += 1; continue
        if c == "ー":
            prev = "".join(out)
            out.append(next((ch for ch in reversed(prev) if ch in "aeiou"), "")); i += 1; continue
        out.append(ROMAJI.get(c, c if c.isascii() else "")); i += 1
    return "".join(out)


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower())
    s = re.sub(r"[\u0300-\u036f]", "", s).replace("đ", "d")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def has_kanji(s: str) -> bool:
    return any("\u4e00" <= c <= "\u9fff" or c == "々" for c in s)


def chunks(items: list, size: int = CHUNK) -> list[list]:
    return [items[i:i + size] for i in range(0, len(items), size)]


def clean_field(s: str) -> str:
    return re.sub(r"\s+", " ", s.replace("|", "/")).strip()


# --------------------------------------------------------------------------------------- source lists

JM_POS = [
    (re.compile(r"^(v1|v5|vk|vz|v2|v4|vr|vs-i|vs-s|vs-c)"), "verb"),
    (re.compile(r"^vs$"), "suru-verb"),
    (re.compile(r"^adj-ix?$"), "i-adjective"),
    (re.compile(r"^adj-na$"), "na-adjective"),
    (re.compile(r"^(adj-no|adj-pn|adj-t|adj-f|adj-kari|adj-ku|adj-shiku|adj-nari)$"), "adjective"),
    (re.compile(r"^(n|n-adv|n-t|n-pref|n-pr)$"), "noun"),
    (re.compile(r"^(adv|adv-to)$"), "adverb"),
    (re.compile(r"^pn$"), "pronoun"),
    (re.compile(r"^conj$"), "conjunction"),
    (re.compile(r"^int$"), "interjection"),
    (re.compile(r"^exp$"), "expression"),
    (re.compile(r"^ctr$"), "counter"),
    (re.compile(r"^num$"), "number"),
    (re.compile(r"^prt$"), "particle"),
    (re.compile(r"^(suf|n-suf)$"), "suffix"),
    (re.compile(r"^pref$"), "prefix"),
    (re.compile(r"^(aux|aux-v|aux-adj|cop)$"), "auxiliary"),
]


def jm_pos(tags: list[str]) -> str:
    out: list[str] = []
    for t in tags:
        for rx, label in JM_POS:
            if rx.match(t) and label not in out:
                out.append(label)
                break
    if "suru-verb" in out and "noun" not in out:
        out.insert(0, "noun")
    return ", ".join(out[:2])


def load_jmdict() -> tuple[dict, dict]:
    """(kanji, kana) -> pos and kana -> pos, from the first matching JMdict entry."""
    path = next(DL.glob("jmdict-eng-*.json.zip"))
    with zipfile.ZipFile(path) as z:
        data = json.loads(z.read(z.namelist()[0]))
    by_pair: dict[tuple[str, str], str] = {}
    ranked: dict[str, tuple[int, str]] = {}
    for w in data["words"]:
        senses = w["sense"]
        usually_kana = any("uk" in s.get("misc", []) for s in senses)
        for k in w["kanji"] or [{"text": None}]:
            for r in w["kana"]:
                if k["text"] and r["appliesToKanji"] not in (["*"], []) and k["text"] not in r["appliesToKanji"]:
                    continue
                tags = [t for s in senses
                        if (s["appliesToKanji"] in (["*"], []) or k["text"] in s["appliesToKanji"])
                        and (s["appliesToKana"] in (["*"], []) or r["text"] in s["appliesToKana"])
                        for t in s["partOfSpeech"]][:6]
                pos = jm_pos(tags)
                if not pos:
                    continue
                if k["text"]:
                    by_pair.setdefault((k["text"], r["text"]), pos)
                # kana-only lookup: kana-only entries first, then "usually written in kana", then any reading match
                rank = (0 if not k["text"] else 1 if usually_kana else 4) + (0 if r.get("common") else 2)
                if rank < ranked.get(r["text"], (99, ""))[0]:
                    ranked[r["text"]] = (rank, pos)
    return by_pair, {kana: pos for kana, (_, pos) in ranked.items()}


def seed_words() -> tuple[set, set]:
    """Hand-written seed words (language:word[:reading]) and their ids, excluding previous bank output."""
    bank_ids = {d["id"] for f in OUT.glob("*.json") for d in json.loads(f.read_text(encoding="utf-8"))}
    docs = json.loads((REPO / "seed" / "out" / "vocabularies.json").read_text(encoding="utf-8"))
    keys, ids = set(), set()
    for d in docs:
        if d["id"] in bank_ids:
            continue
        ids.add(d["id"])
        if d.get("level") == "KANA":
            continue
        if d["languageId"] == "ja":
            keys.add(f"ja:{d['word']}:{d.get('reading') or d['word']}")
            keys.add(f"ja:{d['word']}")
        else:
            keys.add(f"en:{d['word'].lower()}")
    return keys, ids


def ja_items(seed_keys: set) -> list[dict]:
    by_pair, by_kana = load_jmdict()
    seen: set[str] = set()
    items = []
    for lv in JA_LEVELS:
        with (DL / f"jlpt-{lv}.csv").open(encoding="utf-8") as f:
            for row in csv.DictReader(f):
                word = re.sub(r"\s*[（(].*?[)）]", "", row["expression"].split(";")[0]).strip()
                reading = re.sub(r"\s*[（(].*?[)）]", "", row["reading"].split(";")[0]).strip()
                if not reading and not has_kanji(word):
                    reading = word
                key = f"{word}:{reading}"
                if key in seen or f"ja:{word}:{reading}" in seed_keys or (not has_kanji(word) and f"ja:{word}" in seed_keys):
                    continue
                seen.add(key)
                bare, bare_r = word.strip("～〜"), reading.strip("～〜")
                pos = (by_pair.get((bare, bare_r)) or by_kana.get(bare_r)
                       or ("suffix" if word.startswith(("～", "〜")) else "expression"))
                items.append({"set": f"ja-{lv}", "level": lv.upper(), "word": word, "reading": reading, "pos": pos,
                              "en": clean_field(row["meaning"])})
    return items


def load_kanjidic() -> dict[str, dict]:
    out = {}
    with gzip.open(CACHE / "kanjidic2.xml.gz") as f:
        for _, el in ET.iterparse(f):
            if el.tag != "character":
                continue
            lit = el.findtext("literal")
            out[lit] = {
                "vi": [r.text for r in el.iter("reading") if r.get("r_type") == "vietnam"],
                "en": [m.text for m in el.iter("meaning") if m.get("m_lang") is None],
            }
            el.clear()
    return out


def kanji_items() -> list[dict]:
    data = json.loads((DL / "kanji-data.json").read_text(encoding="utf-8"))
    kd = load_kanjidic()
    items = []
    for lvl in (5, 4, 3, 2, 1):
        rows = [(k, v) for k, v in data.items() if v.get("jlpt_new") == lvl]
        rows.sort(key=lambda kv: (kv[1].get("freq") or 9999, kv[1].get("strokes") or 99))
        for k, v in rows:
            meanings = [m for m in v.get("meanings") or kd.get(k, {}).get("en", []) if "radical" not in m.lower()]
            hv = [x.upper() for x in kd.get(k, {}).get("vi", [])]
            items.append({"set": f"kanji-n{lvl}", "level": f"N{lvl}", "word": k,
                          "hanviet": ", ".join(dict.fromkeys(hv)),
                          "on": [to_kata(x) for x in v.get("readings_on") or []],
                          "kun": v.get("readings_kun") or [],
                          "strokes": v.get("strokes"),
                          "en": clean_field(", ".join(meanings[:4]))})
    return items


EN_POS = {"be-verb": "verb", "do-verb": "verb", "have-verb": "verb", "vern": "verb", "modal auxiliary": "modal verb",
          "infinitive-to": "particle"}


def en_items(seed_keys: set) -> list[dict]:
    rows: dict[str, dict] = {}
    order = {lv: i for i, lv in enumerate(EN_LEVELS)}
    for name in ("cefrj-vocabulary-profile-1.5.csv", "octanove-vocabulary-profile-c1c2-1.0.csv"):
        with (CACHE / name).open(encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                word = r["headword"].split("/")[0].strip()
                pos = EN_POS.get(r["pos"], r["pos"])
                if not word or not pos or r["CEFR"] not in order:
                    continue
                cur = rows.setdefault(word.lower(), {"word": word, "level": r["CEFR"], "pos": []})
                if order[r["CEFR"]] < order[cur["level"]]:
                    cur["level"] = r["CEFR"]
                if pos not in cur["pos"]:
                    cur["pos"].append(pos)
    items = []
    for lv in EN_LEVELS:
        for key, r in rows.items():
            if r["level"] == lv and f"en:{key}" not in seed_keys:
                items.append({"set": f"en-{lv.lower()}", "level": lv, "word": r["word"], "pos": ", ".join(r["pos"][:3])})
    return items


# ------------------------------------------------------------------------------------------------ todo


def todo_line(it: dict) -> str:
    if it["set"].startswith("ja-"):
        return f"{it['word']}|{it['reading']}|{it['pos']}|{it['en']}"
    if it["set"].startswith("kanji-"):
        return f"{it['word']}|{it['hanviet']}|{it['en']}"
    return f"{it['word']}|{it['pos']}"


def all_items() -> list[dict]:
    seed_keys, _ = seed_words()
    return ja_items(seed_keys) + kanji_items() + en_items(seed_keys)


def write_todo() -> None:
    TODO.mkdir(parents=True, exist_ok=True)
    by_set: dict[str, list] = defaultdict(list)
    for it in all_items():
        by_set[it["set"]].append(it)
    total = 0
    for name, items in by_set.items():
        for n, part in enumerate(chunks(items), 1):
            path = TODO / f"{name}.{n:02d}.txt"
            if (VI / path.name).exists() and path.exists():
                continue  # already translated: keep the chunk the translation was written against
            path.write_text("\n".join(todo_line(it) for it in part) + "\n", encoding="utf-8")
        total += len(items)
        print(f"{name:10} {len(items):5} items, {len(chunks(items))} chunks")
    print("total", total)


# ----------------------------------------------------------------------------------------------- build

ARPA = {
    "AA": "ɑ", "AE": "æ", "AH": "ʌ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ", "EH": "ɛ", "ER": "ɝ", "EY": "eɪ", "IH": "ɪ",
    "IY": "i", "OW": "oʊ", "OY": "ɔɪ", "UH": "ʊ", "UW": "u", "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f",
    "G": "ɡ", "HH": "h", "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "r", "S": "s",
    "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
}
ONSETS = {"pl", "pr", "bl", "br", "tr", "dr", "kl", "kr", "ɡl", "ɡr", "fl", "fr", "θr", "ʃr", "sp", "st", "sk", "sm",
          "sn", "sl", "sw", "tw", "kw", "spl", "spr", "str", "skr", "skw", "dw", "θw", "mj", "nj", "pj", "bj", "fj",
          "vj", "kj", "hj", "lj"}


def load_cmudict() -> dict[str, str]:
    prons: dict[str, str] = {}
    with (DL / "cmudict.dict").open(encoding="utf-8") as f:
        for line in f:
            parts = line.split("#")[0].split()
            if not parts or "(" in parts[0]:
                continue
            prons.setdefault(parts[0], " ".join(parts[1:]))
    return prons


def ipa_for(word: str, prons: dict[str, str]) -> str | None:
    pieces = []
    for w in re.split(r"[\s-]+", word.lower().strip(".")):
        p = prons.get(w) or prons.get(w.replace("'", ""))
        if not p:
            return None
        pieces.append(simple_ipa(p.split()))
    return "/" + " ".join(pieces) + "/"


def simple_ipa(phones: list[str]) -> str:
    """ARPAbet -> IPA with the stress mark placed before the onset of the stressed syllable."""
    syms = []
    for p in phones:
        base, stress = re.match(r"([A-Z]+)(\d?)", p).groups()
        ipa = "ə" if (base, stress) == ("AH", "0") else "ɚ" if (base, stress) == ("ER", "0") else ARPA[base]
        syms.append([ipa, stress])
    vowels = [i for i, (_, s) in enumerate(syms) if s]
    marks: dict[int, str] = {}
    if len(vowels) > 1:
        prev_v = -1
        for v in vowels:
            if syms[v][1] in ("1", "2"):
                start = v
                for k in range(1, v - prev_v):
                    cluster = "".join(syms[j][0] for j in range(v - k, v))
                    if k > 1 and cluster not in ONSETS:
                        break
                    start = v - k
                marks[start] = "ˈ" if syms[v][1] == "1" else "ˌ"
            prev_v = v
    return "".join(marks.get(i, "") + x[0] for i, x in enumerate(syms))


def read_tsv_bz2(name: str):
    with bz2.open(DL / name, "rt", encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n").split("\t")


def furigana_to_hira(t: str) -> str:
    return re.sub(r"\[([^|\]]+)\|([^\]]+)\]", lambda m: m.group(2).replace("|", ""), t)


class JaExamples:
    def __init__(self) -> None:
        eng_links, vie_links = defaultdict(list), defaultdict(list)
        for a, b in read_tsv_bz2("jpn-eng_links.tsv.bz2"):
            eng_links[int(a)].append(int(b))
        for a, b in read_tsv_bz2("jpn-vie_links.tsv.bz2"):
            vie_links[int(a)].append(int(b))
        need_eng = {e for v in eng_links.values() for e in v}
        self.eng = {int(i): t for i, _, t in read_tsv_bz2("eng_sentences.tsv.bz2") if int(i) in need_eng}
        self.vie = {int(i): t for i, _, t in read_tsv_bz2("vie_sentences.tsv.bz2")}
        self.trans = {}
        for i, _, _, user, t in read_tsv_bz2("jpn_transcriptions.tsv.bz2"):
            self.trans[int(i)] = (furigana_to_hira(t), bool(user))
        self.rows = []
        for i, _, text in read_tsv_bz2("jpn_sentences.tsv.bz2"):
            sid = int(i)
            eng = next((self.eng[e] for e in eng_links.get(sid, []) if e in self.eng), None)
            vie = next((self.vie[v] for v in vie_links.get(sid, []) if v in self.vie), None)
            if not eng or not 4 <= len(text) <= 32 or sid not in self.trans:
                continue
            self.rows.append((sid, text, eng, vie))
        self.index = defaultdict(list)
        for n, (_, text, _, _) in enumerate(self.rows):
            for g in {text[k:k + 2] for k in range(len(text) - 1)}:
                self.index[g].append(n)
        self.used = defaultdict(int)
        print(f"tatoeba jpn: {len(self.rows)} sentences with English translation and reading", flush=True)

    def candidates(self, key: str) -> list[int]:
        if len(key) == 1:
            return [n for n, row in enumerate(self.rows) if key in row[1]]
        grams = [key[k:k + 2] for k in range(len(key) - 1)]
        rare = min(grams, key=lambda g: len(self.index.get(g, [])))
        return [n for n in self.index.get(rare, []) if key in self.rows[n][1]]

    def read_ok(self, n: int, reading: str) -> bool:
        """The sentence reading contains the word's reading, so a kanji word is not read another way."""
        return to_hira(reading) in to_hira(self.trans[self.rows[n][0]][0])

    def pick(self, word: str, reading: str, pos: str) -> dict | None:
        bare, bare_r = word.strip("～〜"), reading.strip("～〜")
        if not bare:
            return None
        check = has_kanji(bare)
        found = [n for n in self.candidates(bare) if not check or self.read_ok(n, bare_r)]
        if not found and ("verb" in pos or "i-adjective" in pos) and check and len(bare) >= 2:
            stem, stem_r = bare[:-1], bare_r[:-1]
            found = [n for n in self.candidates(stem)
                     if re.search(re.escape(stem) + r"[\u3041-\u309f]", self.rows[n][1]) and self.read_ok(n, stem_r)]
        if not found:
            return None

        def score(n: int) -> float:
            sid, text, _, vie = self.rows[n]
            return (60 if vie else 0) + (15 if self.trans[sid][1] else 0) - abs(len(text) - 14) - 25 * self.used[sid]

        best = max(found, key=score)
        sid, text, eng, vie = self.rows[best]
        self.used[sid] += 1
        return {"example": text, "exampleReading": self.trans[sid][0], "exampleMeaning": {"vi": vie or "", "en": eng}}


class EnExamples:
    def __init__(self) -> None:
        vie_links = defaultdict(list)
        for a, b in read_tsv_bz2("eng-vie_links.tsv.bz2"):
            vie_links[int(a)].append(int(b))
        jpn_linked = {int(b) for _, b in read_tsv_bz2("jpn-eng_links.tsv.bz2")}
        vie = {int(i): t for i, _, t in read_tsv_bz2("vie_sentences.tsv.bz2")}
        self.rows = []
        for i, _, text in read_tsv_bz2("eng_sentences.tsv.bz2"):
            sid = int(i)
            if sid not in vie_links and sid not in jpn_linked:
                continue
            words = re.findall(r"[a-z']+", text.lower())
            if not 3 <= len(words) <= 14:
                continue
            v = next((vie[x] for x in vie_links.get(sid, []) if x in vie), None)
            self.rows.append((sid, text, v, words))
        self.index = defaultdict(list)
        for n, (_, _, _, words) in enumerate(self.rows):
            for w in set(words):
                self.index[w].append(n)
        self.used = defaultdict(int)
        print(f"tatoeba eng: {len(self.rows)} sentences", flush=True)

    @staticmethod
    def forms(w: str) -> set[str]:
        f = {w, w + "s", w + "es", w + "ed", w + "d", w + "ing", w + "'s"}
        if w.endswith("e"):
            f |= {w[:-1] + "ing"}
        if w.endswith("y") and len(w) > 2:
            f |= {w[:-1] + "ies", w[:-1] + "ied"}
        if re.search(r"[^aeiou][aeiou][bdgmnprt]$", w):
            f |= {w + w[-1] + "ed", w + w[-1] + "ing"}
        return f

    def pick(self, word: str) -> dict | None:
        w = word.lower()
        toks = re.findall(r"[a-z']+", w)
        if not toks:
            return None
        if len(toks) == 1:
            found = {n for f in self.forms(toks[0]) for n in self.index.get(f, [])}
        else:
            rx = re.compile(r"\b" + r"\s+".join(map(re.escape, toks)) + r"\b", re.I)
            found = {n for n in self.index.get(toks[0], []) if rx.search(self.rows[n][1])}
        if not found:
            return None

        def score(n: int) -> float:
            sid, _, vie, words = self.rows[n]
            return (60 if vie else 0) - 3 * abs(len(words) - 8) - 25 * self.used[sid] - sid / 1e9

        best = max(found, key=score)
        sid, text, vie, _ = self.rows[best]
        self.used[sid] += 1
        return {"example": text, "exampleMeaning": {"vi": vie or "", "en": ""}}


def load_translations() -> dict[str, list[tuple[dict, str]]]:
    """set name -> [(todo fields, vi)] for every chunk that has a translation file."""
    out: dict[str, list] = defaultdict(list)
    errors = []
    for todo in sorted(TODO.glob("*.txt")):
        vi_path = VI / todo.name
        if not vi_path.exists():
            continue
        t_lines = [l for l in todo.read_text(encoding="utf-8").splitlines() if l.strip()]
        v_lines = [l for l in vi_path.read_text(encoding="utf-8").splitlines() if l.strip()]
        if len(t_lines) != len(v_lines):
            errors.append(f"{todo.name}: {len(t_lines)} todo lines but {len(v_lines)} translations")
            continue
        name = todo.name.rsplit(".", 2)[0]
        for n, (t, v) in enumerate(zip(t_lines, v_lines), 1):
            head, _, vi = v.partition("|")
            word = t.split("|")[0]
            if head.strip() != word or not vi.strip():
                errors.append(f"{vi_path.name}:{n}: expected '{word}|...', got '{v}'")
                continue
            out[name].append((t.split("|"), vi.strip()))
    if errors:
        raise SystemExit("translation errors:\n  " + "\n  ".join(errors[:40]))
    return out


def build() -> None:
    seed_keys, reserved = seed_words()
    items = ja_items(seed_keys) + kanji_items() + en_items(seed_keys)
    tr = load_translations()
    # stable ids for every source item, translated or not
    used = set(reserved)

    def make_id(base: str) -> str:
        i, n = base, 2
        while i in used:
            i, n = f"{base}-{n}", n + 1
        used.add(i)
        return i

    lookup: dict[tuple[str, str], str] = {}
    for name, rows in tr.items():
        for fields, vi in rows:
            lookup[(name, "|".join(fields))] = vi

    ja_ex, en_ex, prons = None, None, None
    by_set: dict[str, list] = defaultdict(list)
    ja_meaning: dict[str, tuple[dict, str, str]] = {}
    for d in json.loads((REPO / "seed" / "out" / "vocabularies.json").read_text(encoding="utf-8")):
        if d["languageId"] == "ja" and d.get("level") != "KANA" and d["id"] in reserved:
            ja_meaning.setdefault(d["word"], (d["meaning"], d.get("reading") or d["word"], d["level"]))

    for it in items:
        vi = lookup.get((it["set"], todo_line(it)))
        kind = it["set"].split("-")[0]
        if kind == "ja":
            doc_id = make_id(f"ja-{it['level'].lower()}-{slug(romaji(it['reading'])) or slug(it['word']) or 'w'}")
        elif kind == "kanji":
            doc_id = make_id(f"ja-{it['level'].lower()}-kanji-{ord(it['word']):x}")
        else:
            doc_id = make_id(f"en-{it['level'].lower()}-{slug(it['word']) or 'w'}")
        if not vi:
            continue
        if kind == "ja":
            ja_ex = ja_ex or JaExamples()
            doc = {"id": doc_id, "word": it["word"], "romaji": romaji(it["reading"]), "pos": it["pos"],
                   "meaning": {"vi": vi, "en": it["en"]}, "level": it["level"], "topic": f"JLPT {it['level']}"}
            if it["reading"] != it["word"]:
                doc["reading"] = it["reading"]
            ex = ja_ex.pick(it["word"], it["reading"], it["pos"])
            if ex:
                if ex["exampleReading"] == ex["example"]:
                    del ex["exampleReading"]
                doc.update(ex)
            ja_meaning.setdefault(it["word"], (doc["meaning"], it["reading"], it["level"]))
        elif kind == "en":
            en_ex = en_ex or EnExamples()
            prons = prons or load_cmudict()
            doc = {"id": doc_id, "word": it["word"], "pos": it["pos"], "meaning": {"vi": vi},
                   "level": it["level"], "topic": f"CEFR {it['level']}"}
            ipa = ipa_for(it["word"], prons)
            if ipa:
                doc["ipa"] = ipa
            ex = en_ex.pick(it["word"])
            if ex:
                doc.update(ex)
        else:
            reading = " / ".join(x for x in ("・".join(it["on"]), "・".join(it["kun"])) if x)
            doc = {"id": doc_id, "word": it["word"], "pos": "kanji",
                   "meaning": {"vi": f"{it['hanviet']} — {vi}" if it["hanviet"] else vi, "en": it["en"]},
                   "level": it["level"], "topic": "Kanji"}
            if reading:
                doc["reading"] = reading
            it["doc"] = doc
        by_set[it["set"]].append(doc)

    # kanji examples: the easiest known word that contains the kanji
    rank = {f"N{n}": 6 - n for n in range(1, 6)}
    words_by_char: dict[str, list] = defaultdict(list)
    for w, (meaning, reading, level) in ja_meaning.items():
        for c in set(w):
            if has_kanji(c):
                words_by_char[c].append((rank.get(level, 9), len(w) != 2, len(w), w, meaning, reading))
    for it in items:
        doc = it.get("doc")
        if not doc or not words_by_char.get(it["word"]):
            continue
        _, _, _, w, meaning, reading = min(words_by_char[it["word"]])
        doc["example"] = w
        if reading != w:
            doc["exampleReading"] = reading
        doc["exampleMeaning"] = {"vi": meaning.get("vi", ""), "en": meaning.get("en", "")}

    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob("*.json"):
        f.unlink()
    total = 0
    for name, docs in by_set.items():
        (OUT / f"{name}.json").write_text(json.dumps(docs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        with_ex = sum(1 for d in docs if d.get("example"))
        print(f"{name:10} {len(docs):5} words, {with_ex} with example")
        total += len(docs)
    print("bank total", total)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "fetch":
        fetch()
    elif cmd == "todo":
        write_todo()
    elif cmd == "build":
        build()
    else:
        print(__doc__)
