// Builds the Lingora content dataset (languages, certificates, courses, outlines, lessons,
// vocabularies, exams) from the hand-written sources in ./data and writes it to ./out/*.json.
// Usage: node build.mjs

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CERTIFICATES, COURSES, EXAM_SPECS, LANGUAGES, LINKED_COURSES } from './data/catalog.mjs';
import { EN_BEGINNER } from './data/en-vocab-beginner.mjs';
import { EN_EXAM } from './data/en-vocab-exam.mjs';
import { EN_GENERAL } from './data/en-vocab-general.mjs';
import { EN_GRAMMAR_PLUS, JA_GRAMMAR_PLUS } from './data/grammar-beginner.mjs';
import { EN_GRAMMAR } from './data/grammar-en.mjs';
import { JA_GRAMMAR } from './data/grammar-ja.mjs';
import { JA_BEGINNER } from './data/ja-vocab-beginner.mjs';
import { JA_VOCAB } from './data/ja-vocab.mjs';
import { EN_TEXTS_PLUS, JA_TEXTS_PLUS } from './data/texts-beginner.mjs';
import { TEXTS_VI } from './data/texts-vi.mjs';
import { EN_TEXTS, JA_TEXTS } from './data/texts.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');

/** Text pools whose lesson questions are shown in Vietnamese (beginner levels). */
const BEGINNER_POOLS = new Set(['A1', 'A2', 'N5', 'N4']);

/* ------------------------------------------------------------------ helpers */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG so every build produces identical content. */
function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Up to `n` distinct values from `pool` (by `key`) excluding `exclude`. */
function pickDistinct(pool, n, key, exclude, rand) {
  const seen = new Set([].concat(exclude).map((x) => String(x).toLowerCase()));
  const out = [];
  for (const item of shuffle(pool, rand)) {
    const k = key(item);
    if (!k || seen.has(String(k).toLowerCase())) continue;
    seen.add(String(k).toLowerCase());
    out.push(k);
    if (out.length === n) break;
  }
  return out;
}

const slug = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const L = (vi, en, ja) => ({ vi, en, ...(ja ? { ja } : {}) });
const sumBy = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Concatenates per-level arrays of two `{ LEVEL: [...] }` maps. */
function concatLevels(base, extra) {
  const keys = [...new Set([...Object.keys(base), ...Object.keys(extra)])];
  return Object.fromEntries(keys.map((k) => [k, [...(base[k] ?? []), ...(extra[k] ?? [])]]));
}

/* --------------------------------------------------------------- vocabulary */

const usedIds = new Set();
function uniqueId(base) {
  let id = base;
  for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
  usedIds.add(id);
  return id;
}

function parseEnUnit(level, unit) {
  const words = unit.words.trim().split('\n').map((line) => {
    const f = line.split('|');
    if (f.length !== 7) throw new Error(`EN ${unit.key}: expected 7 fields, got ${f.length}: ${line}`);
    const [word, ipa, pos, vi, en, example, exampleVi] = f.map((x) => x.trim());
    return {
      id: uniqueId(`en-${level.toLowerCase()}-${slug(word)}`),
      word, ipa, pos,
      meaning: { vi, en },
      example,
      exampleMeaning: { vi: exampleVi, en: '' },
      level,
      topic: unit.topic.en,
    };
  });
  return { ...unit, level, words };
}

function parseJaUnit(level, unit) {
  const words = unit.words.trim().split('\n').map((line) => {
    const f = line.split('|');
    if (f.length !== 10) throw new Error(`JA ${unit.key}: expected 10 fields, got ${f.length}: ${line}`);
    const [word, reading, romaji, pos, vi, en, example, exampleReading, exampleVi, exampleEn] = f.map((x) => x.trim());
    return {
      id: uniqueId(`ja-${level.toLowerCase()}-${slug(romaji)}`),
      word,
      ...(reading && reading !== word ? { reading } : {}),
      romaji, pos,
      meaning: { vi, en },
      example,
      ...(exampleReading && exampleReading !== example ? { exampleReading } : {}),
      exampleMeaning: { vi: exampleVi, en: exampleEn },
      level,
      topic: unit.topic.en,
    };
  });
  return { ...unit, level, words };
}

const POOLS = { en: {}, ja: {} };
for (const [level, units] of Object.entries(concatLevels({ ...EN_GENERAL, ...EN_EXAM }, EN_BEGINNER))) {
  POOLS.en[level] = units.map((u) => parseEnUnit(level, u));
}
for (const [level, units] of Object.entries(concatLevels(JA_VOCAB, JA_BEGINNER))) {
  POOLS.ja[level] = units.map((u) => parseJaUnit(level, u));
}

/* Kana: basic gojūon, voiced (dakuten / handakuten) and combined (yōon) sounds. */
const KANA_ROWS = [
  ['a', 'あ い う え お', 'ア イ ウ エ オ', 'a i u e o'],
  ['k', 'か き く け こ', 'カ キ ク ケ コ', 'ka ki ku ke ko'],
  ['s', 'さ し す せ そ', 'サ シ ス セ ソ', 'sa shi su se so'],
  ['t', 'た ち つ て と', 'タ チ ツ テ ト', 'ta chi tsu te to'],
  ['n', 'な に ぬ ね の', 'ナ ニ ヌ ネ ノ', 'na ni nu ne no'],
  ['h', 'は ひ ふ へ ほ', 'ハ ヒ フ ヘ ホ', 'ha hi fu he ho'],
  ['m', 'ま み む め も', 'マ ミ ム メ モ', 'ma mi mu me mo'],
  ['y', 'や ゆ よ', 'ヤ ユ ヨ', 'ya yu yo'],
  ['r', 'ら り る れ ろ', 'ラ リ ル レ ロ', 'ra ri ru re ro'],
  ['w', 'わ を ん', 'ワ ヲ ン', 'wa wo n'],
  ['g', 'が ぎ ぐ げ ご', 'ガ ギ グ ゲ ゴ', 'ga gi gu ge go'],
  ['z', 'ざ じ ず ぜ ぞ', 'ザ ジ ズ ゼ ゾ', 'za ji zu ze zo'],
  ['d', 'だ ぢ づ で ど', 'ダ ヂ ヅ デ ド', 'da ji zu de do'],
  ['b', 'ば び ぶ べ ぼ', 'バ ビ ブ ベ ボ', 'ba bi bu be bo'],
  ['p', 'ぱ ぴ ぷ ぺ ぽ', 'パ ピ プ ペ ポ', 'pa pi pu pe po'],
  ['ky', 'きゃ きゅ きょ', 'キャ キュ キョ', 'kya kyu kyo'],
  ['sh', 'しゃ しゅ しょ', 'シャ シュ ショ', 'sha shu sho'],
  ['ch', 'ちゃ ちゅ ちょ', 'チャ チュ チョ', 'cha chu cho'],
  ['ny', 'にゃ にゅ にょ', 'ニャ ニュ ニョ', 'nya nyu nyo'],
  ['hy', 'ひゃ ひゅ ひょ', 'ヒャ ヒュ ヒョ', 'hya hyu hyo'],
  ['my', 'みゃ みゅ みょ', 'ミャ ミュ ミョ', 'mya myu myo'],
  ['ry', 'りゃ りゅ りょ', 'リャ リュ リョ', 'rya ryu ryo'],
  ['gy', 'ぎゃ ぎゅ ぎょ', 'ギャ ギュ ギョ', 'gya gyu gyo'],
  ['j', 'じゃ じゅ じょ', 'ジャ ジュ ジョ', 'ja ju jo'],
  ['by', 'びゃ びゅ びょ', 'ビャ ビュ ビョ', 'bya byu byo'],
  ['py', 'ぴゃ ぴゅ ぴょ', 'ピャ ピュ ピョ', 'pya pyu pyo'],
];
const KANA_EXAMPLES = {
  あ: ['あめ', 'mưa', 'rain'], か: ['かさ', 'cái ô', 'umbrella'], さ: ['さかな', 'cá', 'fish'], た: ['たまご', 'trứng', 'egg'],
  な: ['なつ', 'mùa hè', 'summer'], は: ['はな', 'hoa', 'flower'], ま: ['まど', 'cửa sổ', 'window'], や: ['やま', 'núi', 'mountain'],
  ら: ['らいねん', 'năm sau', 'next year'], わ: ['わたし', 'tôi', 'I'],
  が: ['がっこう', 'trường học', 'school'], ざ: ['ざっし', 'tạp chí', 'magazine'], だ: ['だいがく', 'đại học', 'university'],
  ば: ['ばんごはん', 'bữa tối', 'dinner'], ぱ: ['かんぱい', 'cạn ly', 'cheers'],
  きゃ: ['おきゃくさん', 'khách hàng', 'customer'], しゃ: ['しゃしん', 'ảnh', 'photo'], ちゃ: ['おちゃ', 'trà', 'tea'],
  ぎゅ: ['ぎゅうにゅう', 'sữa bò', 'milk'], じゅ: ['じゅぎょう', 'giờ học', 'class'], りょ: ['りょこう', 'du lịch', 'travel'],
  ア: ['アイス', 'kem', 'ice cream'], カ: ['カメラ', 'máy ảnh', 'camera'], サ: ['サラダ', 'salad', 'salad'], タ: ['タクシー', 'taxi', 'taxi'],
  ナ: ['ナイフ', 'con dao', 'knife'], ハ: ['ハンバーガー', 'bánh hamburger', 'hamburger'], マ: ['マスク', 'khẩu trang', 'mask'],
  ヤ: ['ヤクルト', 'Yakult', 'Yakult'], ラ: ['ラーメン', 'mì ramen', 'ramen'], ワ: ['ワイン', 'rượu vang', 'wine'],
  ガ: ['ガム', 'kẹo cao su', 'chewing gum'], ザ: ['ピザ', 'bánh pizza', 'pizza'], ダ: ['ダンス', 'nhảy', 'dance'],
  バ: ['バス', 'xe buýt', 'bus'], パ: ['パン', 'bánh mì', 'bread'],
  キャ: ['キャンプ', 'cắm trại', 'camping'], シャ: ['シャツ', 'áo sơ mi', 'shirt'], チャ: ['チャンス', 'cơ hội', 'chance'],
  ニュ: ['ニュース', 'tin tức', 'news'], ジュ: ['ジュース', 'nước ép', 'juice'], ショ: ['ショッピング', 'mua sắm', 'shopping'],
};

function kanaItems(script) {
  return KANA_ROWS.map(([row, hira, kata, romaji]) => {
    const chars = (script === 'hiragana' ? hira : kata).split(' ');
    const readings = romaji.split(' ');
    const items = chars.map((ch, i) => {
      const ex = KANA_EXAMPLES[ch];
      return {
        id: uniqueId(`ja-kana-${script === 'hiragana' ? 'h' : 'k'}-${readings[i]}`),
        word: ch,
        romaji: readings[i],
        pos: script,
        meaning: { vi: `Chữ "${readings[i]}" (${script})`, en: `${script} "${readings[i]}"` },
        ...(ex ? { example: ex[0], exampleMeaning: { vi: ex[1], en: ex[2] } } : {}),
        level: 'KANA',
        topic: script,
      };
    });
    return { row, items };
  });
}
const KANA = { hiragana: kanaItems('hiragana'), katakana: kanaItems('katakana') };

/* ------------------------------------------------------------- grammar & texts */

function enGrammar(g) {
  return {
    id: g.id, title: g.title, structure: g.structure,
    explanation: { vi: g.vi, en: g.en },
    examples: g.ex.map(([text, vi]) => ({ text, meaning: { vi, en: '' } })),
    ...(g.note ? { note: g.note } : {}),
  };
}
function jaGrammar(g) {
  return {
    id: g.id, title: g.title, structure: g.structure,
    explanation: { vi: g.vi, en: g.en },
    examples: g.ex.map(([tokens, reading, vi, en]) => ({ text: tokens.replaceAll('|', ''), reading, meaning: { vi, en } })),
    ...(g.note ? { note: g.note } : {}),
  };
}
const GRAMMAR = { en: concatLevels(EN_GRAMMAR, EN_GRAMMAR_PLUS), ja: concatLevels(JA_GRAMMAR, JA_GRAMMAR_PLUS) };

/** Merges texts.mjs with texts-beginner.mjs and attaches the Vietnamese question translations. */
function mergeTexts(lang, base, extra) {
  const out = {};
  for (const pool of new Set([...Object.keys(base), ...Object.keys(extra)])) {
    out[pool] = {};
    for (const kind of ['readings', 'dialogues']) {
      const own = (base[pool]?.[kind] ?? []).map((t, i) => ({ ...t, questionsVi: TEXTS_VI[lang]?.[pool]?.[kind]?.[i] }));
      out[pool][kind] = [...own, ...(extra[pool]?.[kind] ?? [])];
      for (const t of out[pool][kind]) {
        const vi = t.questionsVi;
        if (!vi) throw new Error(`Missing Vietnamese questions: ${lang} ${pool} ${kind} "${t.title.en}"`);
        if (vi.length !== t.questions.length || vi.some((q, i) => q.length !== t.questions[i].length)) {
          throw new Error(`Vietnamese questions misaligned: ${lang} ${pool} ${kind} "${t.title.en}"`);
        }
      }
    }
  }
  return out;
}
const TEXTS = { en: mergeTexts('en', EN_TEXTS, EN_TEXTS_PLUS), ja: mergeTexts('ja', JA_TEXTS, JA_TEXTS_PLUS) };

/* -------------------------------------------------------------- explanations */

const POS_VI = {
  noun: 'danh từ', verb: 'động từ', adjective: 'tính từ', adverb: 'trạng từ', pronoun: 'đại từ', preposition: 'giới từ',
  conjunction: 'liên từ', interjection: 'thán từ', determiner: 'từ hạn định', phrase: 'cụm từ', 'phrasal verb': 'cụm động từ',
  'i-adjective': 'tính từ đuôi い', 'na-adjective': 'tính từ đuôi な', greeting: 'lời chào', counter: 'từ đếm', number: 'số từ',
  expression: 'thành ngữ', suffix: 'hậu tố', prefix: 'tiền tố', kanji: 'chữ Hán', particle: 'trợ từ', 'suru-verb': 'động từ する',
  hiragana: 'chữ Hiragana', katakana: 'chữ Katakana', question: 'từ để hỏi',
  auxiliary: 'trợ động từ', 'modal verb': 'động từ khuyết thiếu',
};
const unknownPos = new Set();
function posVi(pos) {
  const parts = pos.split(/\s*[/,]\s*/).map((p) => POS_VI[p] ?? (unknownPos.add(p), p));
  return parts.join(', ');
}

function pron(v) {
  const p = [v.reading, v.romaji].filter(Boolean);
  if (p.length) return ` (${p.join(' · ')})`;
  return v.ipa ? ` ${v.ipa}` : '';
}

/** "word (reading) — part of speech: meaning" + example with its translation. */
function wordExpl(v) {
  const head = { vi: `${v.word}${pron(v)} — ${posVi(v.pos)}: ${v.meaning.vi}`, en: `${v.word}${pron(v)} — ${v.pos}: ${v.meaning.en}` };
  if (!v.example) return head;
  return {
    vi: `${head.vi}\nVí dụ: ${v.example}${v.exampleMeaning?.vi ? ` → ${v.exampleMeaning.vi}` : ''}`,
    en: `${head.en}\nExample: ${v.example}${v.exampleMeaning?.en ? ` → ${v.exampleMeaning.en}` : ''}`,
  };
}

function kanaExpl(it) {
  const ex = it.example
    ? { vi: `\nVí dụ: ${it.example} → ${it.exampleMeaning.vi}`, en: `\nExample: ${it.example} → ${it.exampleMeaning.en}` }
    : { vi: '', en: '' };
  return { vi: `「${it.word}」 đọc là "${it.romaji}".${ex.vi}`, en: `「${it.word}」 is read "${it.romaji}".${ex.en}` };
}

function grammarExpl(g, question, correct) {
  const full = question.replace('___', correct);
  return {
    vi: `Câu đúng: ${full}\n${g.title} (${g.structure}): ${g.vi}`,
    en: `Correct: ${full}\n${g.title} (${g.structure}): ${g.en}`,
  };
}

/* ----------------------------------------------------------- exercise makers */

const I = {
  meaning: L('Chọn nghĩa đúng của từ', 'Choose the correct meaning', '正しい意味を選んでください'),
  word: L('Chọn từ phù hợp với nghĩa', 'Choose the word for this meaning', '意味に合う言葉を選んでください'),
  listen: L('Nghe và chọn từ bạn nghe được', 'Listen and choose the word you hear', '聞いて正しい言葉を選んでください'),
  dictation: L('Nghe và viết lại từ bạn nghe được', 'Listen and type the word you hear', '聞いた言葉を書いてください'),
  listenSentence: L('Nghe và chọn câu bạn nghe được', 'Listen and choose the sentence you hear', '聞いた文を選んでください'),
  blank: L('Chọn từ thích hợp điền vào chỗ trống', 'Choose the word that fills the gap', '（　）に入る言葉を選んでください'),
  translate: L('Viết từ tiếng nước ngoài cho nghĩa sau', 'Type the word for this meaning', 'この意味の言葉を書いてください'),
  speak: L('Đọc to từ sau', 'Say this word aloud', '声に出して読んでください'),
  speakSentence: L('Đọc to câu sau', 'Read this sentence aloud', 'この文を声に出して読んでください'),
  match: L('Nối từ với nghĩa đúng', 'Match each word with its meaning', '言葉と意味を合わせてください'),
  grammar: L('Chọn đáp án đúng ngữ pháp', 'Choose the grammatically correct answer', '文法的に正しいものを選んでください'),
  order: L('Sắp xếp các từ thành câu đúng', 'Put the words in the correct order', '正しい順番に並べてください'),
  truefalse: L('Nghĩa này đúng hay sai?', 'Is this meaning correct?', 'この意味は正しいですか'),
  reading: L('Chọn từ có cách đọc đúng', 'Choose the correct reading', '正しい読み方を選んでください'),
  definition: L('Chọn từ phù hợp với định nghĩa', 'Choose the word that matches the definition', '定義に合う言葉を選んでください'),
  romaji: L('Chữ này đọc là gì?', 'How is this character read?', 'この文字の読み方は？'),
  kanaListen: L('Nghe và chọn chữ đúng', 'Listen and choose the character', '聞いて正しい文字を選んでください'),
  kanaDictation: L('Nghe và gõ cách đọc (romaji)', 'Listen and type the reading (romaji)', '聞いてローマ字で書いてください'),
  kanaType: L('Gõ cách đọc (romaji)', 'Type the reading (romaji)', 'ローマ字で書いてください'),
  kanaMatch: L('Nối chữ với cách đọc', 'Match characters with readings', '文字と読み方を合わせてください'),
  comprehension: L('Chọn câu trả lời đúng', 'Choose the correct answer', '正しい答えを選んでください'),
};

const meaningKey = (v) => v.meaning.en || v.meaning.vi;

function labelsFor(words) {
  const out = {};
  for (const w of words) out[meaningKey(w)] = w.meaning;
  return out;
}

function mcMeaning(id, v, pool, rand) {
  const opts = [meaningKey(v), ...pickDistinct(pool, 3, meaningKey, [meaningKey(v)], rand)];
  const optWords = pool.filter((w) => opts.includes(meaningKey(w)));
  return {
    id, type: 'MULTIPLE_CHOICE', instruction: I.meaning,
    question: v.word, ...(v.reading || v.ipa ? { hint: v.reading ?? v.ipa } : {}),
    options: shuffle(opts, rand), answers: [meaningKey(v)],
    labels: labelsFor([v, ...optWords]),
    explanation: wordExpl(v),
  };
}

function mcWord(id, v, pool, rand) {
  return {
    id, type: 'MULTIPLE_CHOICE', instruction: I.word, prompt: v.meaning,
    options: shuffle([v.word, ...pickDistinct(pool, 3, (w) => w.word, [v.word], rand)], rand), answers: [v.word],
    explanation: wordExpl(v),
  };
}

function listenWord(id, v, pool, rand) {
  return {
    id, type: 'LISTENING', instruction: I.listen, audioText: v.reading ?? v.word,
    options: shuffle([v.word, ...pickDistinct(pool, 3, (w) => w.word, [v.word], rand)], rand), answers: [v.word],
    explanation: wordExpl(v),
  };
}

/** Listening without options: the learner types what they hear. */
function dictation(id, v) {
  const answers = [...new Set([v.word, v.reading, v.romaji].filter(Boolean))];
  return { id, type: 'LISTENING', instruction: I.dictation, audioText: v.reading ?? v.word, answers, explanation: wordExpl(v) };
}

function translateWord(id, v) {
  const answers = [...new Set([v.word, v.reading, v.romaji].filter(Boolean))];
  return { id, type: 'TRANSLATE', instruction: I.translate, prompt: v.meaning, answers, explanation: wordExpl(v) };
}

function speakWord(id, v) {
  return {
    id, type: 'SPEAKING', instruction: I.speak, audioText: v.word, ...(v.reading ? { hint: v.reading } : {}),
    explanation: wordExpl(v),
  };
}

function trueFalse(id, v, pool, rand) {
  const truth = rand() < 0.5;
  const other = shuffle(pool.filter((w) => meaningKey(w) !== meaningKey(v)), rand)[0];
  const shown = truth || !other ? v : other;
  return {
    id, type: 'TRUE_FALSE', instruction: I.truefalse, question: v.word, prompt: shown.meaning, correct: shown === v,
    explanation: wordExpl(v),
  };
}

function matching(id, words) {
  return {
    id, type: 'MATCHING', instruction: I.match,
    pairs: words.map((w) => ({ a: w.word, b: meaningKey(w) })),
    labels: labelsFor(words),
    explanation: {
      vi: words.map((w) => `${w.word}${pron(w)} = ${w.meaning.vi}`).join('\n'),
      en: words.map((w) => `${w.word}${pron(w)} = ${w.meaning.en}`).join('\n'),
    },
  };
}

/** Gap-fill from the word's example sentence, or null if the word isn't used verbatim. */
function fillBlank(id, v, pool, lang, rand) {
  if (!v.example) return null;
  let match;
  let question;
  if (lang === 'en') {
    const re = new RegExp(`\\b${escapeRe(v.word)}\\b`, 'i');
    const m = v.example.match(re);
    if (!m) return null;
    match = m[0];
    question = v.example.replace(re, '___');
  } else {
    if (!v.example.includes(v.word)) return null;
    match = v.word;
    question = v.example.replace(match, '___');
  }
  const cap = lang === 'en' && match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase();
  const distract = pickDistinct(pool, 3, (w) => (w.pos === v.pos ? w.word : null), [v.word], rand);
  const extra = distract.length < 3 ? pickDistinct(pool, 3 - distract.length, (w) => w.word, [v.word, ...distract], rand) : [];
  const options = [match, ...[...distract, ...extra].map((w) => (cap ? capitalize(w) : w))];
  const sentence = v.exampleReading ? `${v.example} (${v.exampleReading})` : v.example;
  return {
    id, type: 'FILL_BLANK', instruction: I.blank,
    question,
    options: shuffle(options, rand), answers: [match],
    explanation: {
      vi: `Câu đầy đủ: ${sentence}${v.exampleMeaning?.vi ? ` → ${v.exampleMeaning.vi}` : ''}\n${v.word}${pron(v)}: ${v.meaning.vi}`,
      en: `Full sentence: ${sentence}${v.exampleMeaning?.en ? ` → ${v.exampleMeaning.en}` : ''}\n${v.word}${pron(v)}: ${v.meaning.en}`,
    },
  };
}

function listenSentence(id, v, pool, rand) {
  if (!v.example) return null;
  const others = pickDistinct(pool, 3, (w) => w.example, [v.example], rand);
  if (others.length < 3) return null;
  return {
    id, type: 'LISTENING', instruction: I.listenSentence, audioText: v.example,
    options: shuffle([v.example, ...others], rand), answers: [v.example],
    explanation: {
      vi: `Câu bạn nghe: ${v.example}${v.exampleMeaning?.vi ? ` → ${v.exampleMeaning.vi}` : ''}`,
      en: `You heard: ${v.example}${v.exampleMeaning?.en ? ` → ${v.exampleMeaning.en}` : ''}`,
    },
  };
}

function grammarQuiz(id, q, point, rand) {
  const [question, correct, ...wrong] = q;
  return {
    id, type: 'MULTIPLE_CHOICE', instruction: I.grammar, question, options: shuffle([correct, ...wrong], rand), answers: [correct],
    explanation: grammarExpl(point, question, correct),
  };
}

function orderWords(id, example, lang, point, rand) {
  const tokens = lang === 'ja' ? example.tokens.split('|') : example.text.split(/\s+/);
  if (tokens.length < 3 || tokens.length > 10) return null;
  const sentence = lang === 'ja' ? tokens.join('') : example.text;
  return {
    id, type: 'ORDER_WORD', instruction: I.order, prompt: example.meaning,
    options: shuffle(tokens, rand), answers: [sentence],
    explanation: {
      vi: `Câu đúng: ${sentence}${example.reading ? ` (${example.reading})` : ''} → ${example.meaning.vi}\nCấu trúc: ${point.structure}`,
      en: `Correct: ${sentence} → ${example.meaning.en || sentence}\nPattern: ${point.structure}`,
    },
  };
}

/**
 * Comprehension questions. `vietnamese` shows the question and options in the learner's
 * language (beginner lessons); otherwise they stay in the target language with a Vietnamese explanation.
 */
function textQuestions(prefix, text, rand, { audioText, vietnamese = false } = {}) {
  return text.questions.map(([question, correct, ...wrong], i) => {
    const vi = text.questionsVi[i];
    const options = [correct, ...wrong];
    const ex = {
      id: `${prefix}-q${i + 1}`,
      type: audioText ? 'LISTENING' : 'MULTIPLE_CHOICE',
      instruction: I.comprehension,
      ...(audioText ? { audioText } : {}),
      options: shuffle(options, rand),
      answers: [correct],
      explanation: {
        vi: `Câu hỏi: ${vi[0]}\nĐáp án đúng: ${vi[1]}${vi[1] !== correct ? ` (${correct})` : ''}`,
        en: `Answer: ${correct}`,
      },
    };
    if (vietnamese) {
      ex.prompt = { vi: vi[0], en: question };
      ex.labels = Object.fromEntries(options.map((o, k) => [o, { vi: vi[k + 1], en: o }]));
    } else {
      ex.question = question;
    }
    return ex;
  });
}

/* ------------------------------------------------------------------ lessons */

const T = {
  vocab: L('Từ vựng mới', 'New words', '新しい言葉'),
  grammar: L('Ngữ pháp', 'Grammar', '文法'),
  practice: L('Luyện tập', 'Practice', '練習'),
  review: L('Ôn tập tổng hợp', 'Unit review', 'まとめの練習'),
  speaking: L('Luyện nói', 'Speaking practice', 'スピーキング練習'),
  kana: (s) => L(`Bảng chữ ${s}`, `${s} chart`, s === 'hiragana' ? 'ひらがな' : 'カタカナ'),
};

function vocabLesson({ lessonId, course, unitId, order, unit, words, grammar, lang, pool }) {
  const rand = rng(lessonId);
  const distractPool = unit.words.length >= 8 ? unit.words : pool;
  const ex = [];
  const n = (k) => `${lessonId}-e${k}`;
  let k = 1;
  const [w0, w1, w2, w3, w4, w5] = words;
  if (w0) ex.push(mcMeaning(n(k++), w0, distractPool, rand));
  if (w1) ex.push(mcWord(n(k++), w1, distractPool, rand));
  if (w2) ex.push(listenWord(n(k++), w2, distractPool, rand));
  for (const w of [w3, w0, w4, w1]) {
    const fb = w && fillBlank(n(k), w, distractPool, lang, rand);
    if (fb) { ex.push(fb); k++; break; }
  }
  if (w3) ex.push(mcMeaning(n(k++), w3, distractPool, rand));
  if (words.length >= 4) ex.push(matching(n(k++), shuffle(words, rand).slice(0, Math.min(5, words.length))));
  if (w4) ex.push(translateWord(n(k++), w4));
  if (w5) ex.push(dictation(n(k++), w5));
  if (w5) ex.push(trueFalse(n(k++), w5, distractPool, rand));
  if (grammar) {
    for (const q of grammar.source.quiz.slice(0, 2)) ex.push(grammarQuiz(n(k++), q, grammar.source, rand));
    const sample = grammar.source.ex[0];
    const exObj = lang === 'ja'
      ? { tokens: sample[0], reading: sample[1], meaning: { vi: sample[2], en: sample[3] } }
      : { text: sample[0], meaning: { vi: sample[1], en: '' } };
    const ow = orderWords(n(k), exObj, lang, grammar.source, rand);
    if (ow) { ex.push(ow); k++; }
  }
  if (w2) ex.push(speakWord(n(k++), w2));

  const contents = [{ type: 'VOCABULARY', title: T.vocab, items: words }];
  if (grammar) contents.push({ type: 'GRAMMAR', title: T.grammar, points: [grammar.point] });
  contents.push({ type: 'EXERCISE', title: T.practice, exercises: ex });

  const g = grammar ? ` · ${grammar.point.title}` : '';
  const title = L(`${unit.topic.vi} ${order}${g}`, `${unit.topic.en} ${order}${g}`, `${unit.topic.ja ?? unit.topic.en} ${order}${g}`);
  const minutes = 6 + Math.round(ex.length * 0.6) + (grammar ? 3 : 0);
  return { id: lessonId, courseId: course.id, languageId: course.languageId, unitId, order, title, minutes, xp: 20, contents };
}

const textCursor = {};
function nextText(lang, poolName, kind) {
  const pool = TEXTS[lang][poolName]?.[kind] ?? [];
  if (!pool.length) return null;
  const key = `${lang}.${poolName}.${kind}`;
  const i = textCursor[key] ?? 0;
  textCursor[key] = i + 1;
  return pool[i % pool.length];
}

function skillsLesson({ lessonId, course, unitId, order, unit, lang, unitIndex }) {
  const rand = rng(lessonId);
  const contents = [];
  const wantReading = unitIndex % 2 === 0;
  const vietnamese = BEGINNER_POOLS.has(unit.level);
  const reading = wantReading ? nextText(lang, unit.level, 'readings') : null;
  const dialogue = !reading ? nextText(lang, unit.level, 'dialogues') : null;
  let skill = 'speaking';

  if (reading) {
    skill = 'reading';
    contents.push({
      type: 'READING', title: reading.title, passage: reading.passage,
      ...(reading.passageReading ? { passageReading: reading.passageReading } : {}),
      translation: reading.translation,
      questions: textQuestions(`${lessonId}-r`, reading, rand, { vietnamese }),
    });
  } else if (dialogue) {
    skill = 'listening';
    contents.push({
      type: 'LISTENING', title: dialogue.title,
      script: dialogue.lines.map(([speaker, text, vi, en]) => ({ speaker, text, meaning: { vi, en: en ?? '' } })),
      questions: textQuestions(`${lessonId}-l`, dialogue, rand, { vietnamese }),
    });
  }

  const withExamples = unit.words.filter((w) => w.example);
  const prompts = shuffle(withExamples, rand).slice(0, 3).map((w) => ({
    text: w.example, ...(w.exampleReading ? { reading: w.exampleReading } : {}), meaning: w.exampleMeaning,
  }));
  if (prompts.length) contents.push({ type: 'SPEAKING', title: T.speaking, prompts });

  const n = (k) => `${lessonId}-e${k}`;
  let k = 1;
  const review = [];
  const picks = shuffle(unit.words, rand);
  review.push(matching(n(k++), picks.slice(0, 5)));
  for (const w of picks.slice(5, 7)) {
    const ls = listenSentence(n(k), w, unit.words, rand);
    if (ls) { review.push(ls); k++; }
  }
  for (const w of picks.slice(7, 9)) review.push(translateWord(n(k++), w));
  if (picks[9]) review.push(dictation(n(k++), picks[9]));
  for (const w of picks.slice(10, 12)) review.push(mcMeaning(n(k++), w, unit.words, rand));
  if (prompts[0]) {
    review.push({
      id: n(k++), type: 'SPEAKING', instruction: I.speakSentence, audioText: prompts[0].text,
      ...(prompts[0].reading ? { hint: prompts[0].reading } : {}),
      explanation: { vi: `Nghĩa: ${prompts[0].meaning.vi}`, en: prompts[0].meaning.en ? `Meaning: ${prompts[0].meaning.en}` : '' },
    });
  }
  contents.push({ type: 'EXERCISE', title: T.review, exercises: review });

  const skillName = {
    reading: L('Đọc hiểu', 'Reading', '読解'),
    listening: L('Nghe hiểu', 'Listening', '聴解'),
    speaking: L('Nói', 'Speaking', '会話'),
  }[skill];
  const subject = (reading ?? dialogue)?.title ?? unit.topic;
  const title = L(`${skillName.vi}: ${subject.vi}`, `${skillName.en}: ${subject.en}`, `${skillName.ja}：${subject.ja ?? subject.en}`);
  const questionCount = sumBy(contents, (c) => (c.questions?.length ?? 0) + (c.exercises?.length ?? 0));
  return { id: lessonId, courseId: course.id, languageId: course.languageId, unitId, order, title, minutes: 8 + Math.round(questionCount * 0.7), xp: 25, contents };
}

function kanaLesson({ lessonId, course, unitId, order, script, rows }) {
  const rand = rng(lessonId);
  const items = rows.flatMap((r) => r.items);
  const all = KANA[script].flatMap((r) => r.items);
  const n = (k) => `${lessonId}-e${k}`;
  let k = 1;
  const ex = [];
  for (const it of shuffle(items, rand).slice(0, 10)) {
    ex.push({
      id: n(k++), type: 'MULTIPLE_CHOICE', instruction: I.romaji, question: it.word,
      options: shuffle([it.romaji, ...pickDistinct(all, 3, (x) => x.romaji, [it.romaji], rand)], rand), answers: [it.romaji],
      explanation: kanaExpl(it),
    });
  }
  for (const it of shuffle(items, rand).slice(0, 4)) {
    const sameSound = all.filter((x) => x.romaji === it.romaji).map((x) => x.word);
    ex.push({
      id: n(k++), type: 'LISTENING', instruction: I.kanaListen, audioText: it.word,
      options: shuffle([it.word, ...pickDistinct(all, 3, (x) => x.word, sameSound, rand)], rand), answers: [it.word],
      explanation: kanaExpl(it),
    });
  }
  const pairs = [];
  for (const it of shuffle(items, rand)) {
    if (pairs.length < 5 && !pairs.some((p) => p.b === it.romaji)) pairs.push({ a: it.word, b: it.romaji });
  }
  ex.push({
    id: n(k++), type: 'MATCHING', instruction: I.kanaMatch, pairs,
    explanation: { vi: pairs.map((p) => `${p.a} = ${p.b}`).join(' · '), en: pairs.map((p) => `${p.a} = ${p.b}`).join(' · ') },
  });
  for (const it of shuffle(items, rand).slice(0, 2)) {
    ex.push({ id: n(k++), type: 'LISTENING', instruction: I.kanaDictation, audioText: it.word, answers: [it.romaji, it.word], explanation: kanaExpl(it) });
  }
  for (const it of shuffle(items, rand).slice(0, 3)) {
    ex.push({ id: n(k++), type: 'TRANSLATE', instruction: I.kanaType, question: it.word, answers: [it.romaji], explanation: kanaExpl(it) });
  }
  const label = items.map((i) => i.word).join(' ');
  const name = script === 'hiragana' ? 'Hiragana' : 'Katakana';
  const title = L(`${name}: ${label}`, `${name}: ${label}`, `${script === 'hiragana' ? 'ひらがな' : 'カタカナ'}：${label}`);
  return {
    id: lessonId, courseId: course.id, languageId: 'ja', unitId, order, title, minutes: 5 + Math.round(ex.length * 0.4), xp: 15,
    contents: [{ type: 'VOCABULARY', title: T.kana(script), items }, { type: 'EXERCISE', title: T.practice, exercises: ex }],
  };
}

/* ------------------------------------------------------------------ courses */

const outlines = [];
const lessons = [];
const courseDocs = [];

function summary(lesson) {
  const kinds = [...new Set(lesson.contents.map((c) => c.type))];
  return { id: lesson.id, title: lesson.title, minutes: lesson.minutes, xp: lesson.xp, kinds };
}

function buildKanaCourse(course) {
  const KANA_UNITS = [
    [['a', 'k'], ['s', 't'], ['n', 'h']],
    [['m', 'y'], ['r', 'w']],
    [['g', 'z'], ['d', 'b', 'p']],
    [['ky', 'sh', 'ch', 'ny'], ['hy', 'my', 'ry'], ['gy', 'j', 'by', 'py']],
  ];
  const UNIT_NAMES = [
    (s, j) => L(`${s} 1 · Hàng あ–は`, `${s} 1 · Rows a–ha`, `${j} 1`),
    (s, j) => L(`${s} 2 · Hàng ま–ん`, `${s} 2 · Rows ma–n`, `${j} 2`),
    (s, j) => L(`${s} 3 · Âm đục (dakuten)`, `${s} 3 · Voiced sounds (dakuten)`, `${j} 3・濁音`),
    (s, j) => L(`${s} 4 · Âm ghép (yōon)`, `${s} 4 · Combined sounds (yōon)`, `${j} 4・拗音`),
  ];
  const units = [];
  let vocabCount = 0;
  for (const script of ['hiragana', 'katakana']) {
    const name = script === 'hiragana' ? 'Hiragana' : 'Katakana';
    const jaName = script === 'hiragana' ? 'ひらがな' : 'カタカナ';
    KANA_UNITS.forEach((lessonRows, gi) => {
      const unitId = `${course.id}-u${units.length + 1}`;
      const unitLessons = lessonRows.map((rowKeys, li) => {
        const rows = KANA[script].filter((r) => rowKeys.includes(r.row));
        const lesson = kanaLesson({ lessonId: `${unitId}-l${li + 1}`, course, unitId, order: li + 1, script, rows });
        lessons.push(lesson);
        return lesson;
      });
      const count = sumBy(unitLessons, (l) => l.contents[0].items.length);
      vocabCount += count;
      units.push({
        id: unitId,
        title: UNIT_NAMES[gi](name, jaName),
        description: L(`${count} chữ ${name}`, `${count} ${name} characters`, `${jaName} ${count}文字`),
        lessons: unitLessons.map(summary),
      });
    });
  }
  return { units, vocabCount };
}

function buildCourse(course) {
  const lang = course.languageId;
  const grammarList = course.grammar.flatMap((lvl) => GRAMMAR[lang][lvl].map((source) => ({ source, point: (lang === 'ja' ? jaGrammar : enGrammar)(source) })));
  let gi = 0;
  let vocabCount = 0;
  const units = course.units.map((ref, ui) => {
    const [poolName, idx] = ref.split(':');
    const unit = POOLS[lang][poolName]?.[Number(idx)];
    if (!unit) throw new Error(`${course.id}: unknown unit ${ref}`);
    vocabCount += unit.words.length;
    const unitId = `${course.id}-u${ui + 1}`;
    const pool = POOLS[lang][poolName].flatMap((u) => u.words);
    const per = Math.ceil(unit.words.length / 3);
    const unitLessons = [0, 1, 2].map((li) =>
      vocabLesson({
        lessonId: `${unitId}-l${li + 1}`, course, unitId, order: li + 1, unit,
        words: unit.words.slice(li * per, li * per + per), grammar: grammarList.length ? grammarList[gi++ % grammarList.length] : null, lang, pool,
      }),
    );
    unitLessons.push(skillsLesson({ lessonId: `${unitId}-l4`, course, unitId, order: 4, unit, lang, unitIndex: ui }));
    lessons.push(...unitLessons);
    const grammarTitles = unitLessons.flatMap((l) => l.contents.filter((c) => c.type === 'GRAMMAR').map((c) => c.points[0].title));
    return {
      id: unitId,
      title: unit.topic,
      description: L(
        `${unit.words.length} từ vựng · Ngữ pháp: ${grammarTitles.join(', ')}`,
        `${unit.words.length} words · Grammar: ${grammarTitles.join(', ')}`,
        `単語${unit.words.length}語・文法：${grammarTitles.join('、')}`,
      ),
      lessons: unitLessons.map(summary),
    };
  });
  if (gi > grammarList.length) console.warn(`! ${course.id}: ${gi} grammar slots but only ${grammarList.length} points (some repeat)`);
  return { units, vocabCount };
}

COURSES.forEach((course, i) => {
  const { units, vocabCount } = course.kana ? buildKanaCourse(course) : buildCourse(course);
  outlines.push({ courseId: course.id, units });
  const all = units.flatMap((u) => u.lessons);
  const { units: _u, grammar: _g, kana: _k, ...meta } = course;
  courseDocs.push({
    ...meta,
    unitCount: units.length,
    lessonCount: all.length,
    vocabCount,
    estimatedHours: Math.max(1, Math.round((sumBy(all, (l) => l.minutes) * 1.5) / 60)),
    order: i + 1,
    published: true,
  });
});

/* -------------------------------------------------------------------- exams */

const SECTION = {
  vocabulary: L('Từ vựng', 'Vocabulary', '文字・語彙'),
  grammar: L('Ngữ pháp', 'Grammar', '文法'),
  reading: (n) => L(`Đọc hiểu ${n}`, `Reading ${n}`, `読解 ${n}`),
  listening: L('Nghe hiểu', 'Listening', '聴解'),
};

function examVocabQuestions(prefix, words, lang, rand, count) {
  const out = [];
  const chosen = shuffle(words, rand);
  let i = 0;
  for (const v of chosen) {
    if (out.length >= count) break;
    const id = `${prefix}-v${++i}`;
    const mode = out.length % 3;
    if (mode === 0 && lang === 'ja' && v.reading && /\p{Script=Han}/u.test(v.word)) {
      const readings = pickDistinct(words, 3, (w) => w.reading, [v.reading], rand);
      if (readings.length === 3) {
        out.push({
          id, type: 'MULTIPLE_CHOICE', instruction: I.reading, question: v.word,
          options: shuffle([v.reading, ...readings], rand), answers: [v.reading], explanation: wordExpl(v),
        });
        continue;
      }
    }
    if (mode === 0 && lang === 'en') {
      out.push({
        id, type: 'MULTIPLE_CHOICE', instruction: I.definition, question: v.meaning.en,
        options: shuffle([v.word, ...pickDistinct(words, 3, (w) => w.word, [v.word], rand)], rand), answers: [v.word],
        explanation: wordExpl(v),
      });
      continue;
    }
    if (mode === 1) {
      const fb = fillBlank(id, v, words, lang, rand);
      if (fb) { out.push(fb); continue; }
    }
    out.push(mcMeaning(id, v, words, rand));
  }
  return out;
}

const examDocs = [];
const examsByCert = {};
EXAM_SPECS.forEach((spec, si) => {
  const cert = CERTIFICATES.find((c) => c.id === spec.certificateId);
  const lang = cert.languageId;
  const words = spec.vocab.flatMap((p) => POOLS[lang][p].flatMap((u) => u.words));
  const quizItems = spec.grammar.flatMap((lvl) => GRAMMAR[lang][lvl].flatMap((g) => g.quiz.map((q) => ({ q, g }))));
  const texts = TEXTS[lang][spec.texts];
  for (let v = 0; v < spec.variants; v++) {
    const id = `${spec.certificateId}-${slug(spec.level)}-${v + 1}`;
    const rand = rng(id);
    const sections = [];
    sections.push({ title: SECTION.vocabulary, kind: 'vocabulary', questions: examVocabQuestions(id, words, lang, rand, 12) });
    const quiz = shuffle(quizItems, rand).slice(0, 10);
    sections.push({ title: SECTION.grammar, kind: 'grammar', questions: quiz.map(({ q, g }, i) => grammarQuiz(`${id}-g${i + 1}`, q, g, rand)) });

    const readings = texts.readings;
    const picked = [...new Set([v % readings.length, (v + 1) % readings.length])].map((i) => readings[i]);
    picked.forEach((r, ri) => {
      sections.push({
        title: SECTION.reading(ri + 1), kind: 'reading', passage: r.passage,
        questions: textQuestions(`${id}-r${ri + 1}`, r, rand),
      });
    });

    const dialogues = texts.dialogues;
    const listening = [];
    [...new Set([v % dialogues.length, (v + 1) % dialogues.length])].forEach((di, n) => {
      const d = dialogues[di];
      const audio = d.lines.map((l) => l[1]).join(lang === 'ja' ? '　' : ' ');
      listening.push(...textQuestions(`${id}-l${n + 1}`, d, rand, { audioText: audio }));
    });
    for (const w of shuffle(words.filter((x) => x.example), rand).slice(0, 4)) {
      const ls = listenSentence(`${id}-ls${listening.length + 1}`, w, words, rand);
      if (ls) listening.push(ls);
    }
    sections.push({ title: SECTION.listening, kind: 'listening', questions: listening });

    const questionCount = sumBy(sections, (s) => s.questions.length);
    const exam = {
      id, certificateId: cert.id, languageId: lang, level: spec.level,
      title: L(`${cert.code} ${spec.label} — Đề thi thử ${v + 1}`, `${cert.code} ${spec.label} — Mock test ${v + 1}`, `${cert.code} ${spec.label} 模擬試験 ${v + 1}`),
      durationMinutes: spec.minutes, passPercent: spec.pass, sections, questionCount, order: si * 10 + v + 1,
    };
    examDocs.push(exam);
    (examsByCert[cert.id] ??= []).push(id);
  }
});

/* ------------------------------------------------- certificates & languages */

const certDocs = CERTIFICATES.map((c) => ({
  ...c,
  courseIds: [...new Set([...courseDocs.filter((co) => co.certificateId === c.id).map((co) => co.id), ...(LINKED_COURSES[c.id] ?? [])])],
  examIds: examsByCert[c.id] ?? [],
}));

const languageDocs = LANGUAGES.map((l) => ({ ...l, courseCount: courseDocs.filter((c) => c.languageId === l.id).length }));

const courseVocab = [
  ...Object.values(POOLS.en).flat().flatMap((u) => u.words.map((w) => ({ ...w, languageId: 'en' }))),
  ...Object.values(POOLS.ja).flat().flatMap((u) => u.words.map((w) => ({ ...w, languageId: 'ja' }))),
  ...Object.values(KANA).flat().flatMap((r) => r.items.map((w) => ({ ...w, languageId: 'ja' }))),
];

/* Vocabulary bank generated by data/scripts/bank.py: lookup, SRS and games only, never part of a lesson. */
const BANK_DIR = join(dirname(fileURLToPath(import.meta.url)), 'bank');
const bankKey = (w) => `${w.languageId}:${w.pos === 'kanji' ? 'kanji:' : ''}${w.word.toLowerCase()}`;
const handwritten = new Set(courseVocab.map(bankKey));
const bankVocab = [];
for (const file of existsSync(BANK_DIR) ? readdirSync(BANK_DIR).filter((f) => f.endsWith('.json')).sort() : []) {
  const languageId = file.startsWith('en-') ? 'en' : 'ja';
  for (const w of JSON.parse(readFileSync(join(BANK_DIR, file), 'utf8'))) {
    const doc = { ...w, languageId };
    if (handwritten.has(bankKey(doc))) continue;
    bankVocab.push({ ...doc, id: uniqueId(w.id) });
  }
}

const vocabDocs = [...courseVocab, ...bankVocab]
  .map((w) => ({ ...w, wordLc: w.word.toLowerCase(), tags: [w.level.toLowerCase(), slug(w.topic ?? '')].filter(Boolean) }));

/* ------------------------------------------------------------------- checks */

function assertUnique(name, docs, key = (d) => d.id) {
  const seen = new Set();
  for (const d of docs) {
    const k = key(d);
    if (seen.has(k)) throw new Error(`Duplicate ${name} id: ${k}`);
    seen.add(k);
  }
}
assertUnique('lesson', lessons);
assertUnique('vocabulary', vocabDocs);
assertUnique('exam', examDocs);
assertUnique('course', courseDocs);
assertUnique('grammar', Object.values(GRAMMAR).flatMap((g) => Object.values(g).flat()));

for (const l of lessons) {
  for (const c of l.contents) {
    for (const ex of c.exercises ?? c.questions ?? []) {
      if (['MULTIPLE_CHOICE', 'LISTENING', 'FILL_BLANK'].includes(ex.type) && ex.options) {
        if (!ex.answers?.every((a) => ex.options.includes(a))) throw new Error(`${ex.id}: answer not in options`);
        if (new Set(ex.options).size !== ex.options.length) throw new Error(`${ex.id}: duplicate options ${ex.options}`);
      }
    }
  }
}

const dupWords = {};
for (const w of courseVocab.filter((x) => x.level !== 'KANA')) (dupWords[`${w.languageId}:${w.word.toLowerCase()}`] ??= []).push(w.level);
const repeated = Object.entries(dupWords).filter(([, lv]) => lv.length > 1);
if (repeated.length) console.warn(`! ${repeated.length} words appear in more than one unit: ${repeated.map(([w, lv]) => `${w} (${lv.join('/')})`).join(', ')}`);
if (unknownPos.size) console.warn(`! Parts of speech without a Vietnamese label: ${[...unknownPos].join(', ')}`);

/* ------------------------------------------------------------------- output */

mkdirSync(OUT, { recursive: true });
const files = {
  languages: languageDocs,
  certificates: certDocs,
  courses: courseDocs,
  outlines: outlines.map((o) => ({ id: o.courseId, ...o })),
  lessons,
  vocabularies: vocabDocs,
  exams: examDocs,
};
for (const [name, docs] of Object.entries(files)) {
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(docs));
}

const exercises = sumBy(lessons, (l) => sumBy(l.contents, (c) => (c.exercises?.length ?? 0) + (c.questions?.length ?? 0)));
console.table({
  languages: languageDocs.length,
  certificates: certDocs.length,
  courses: courseDocs.length,
  units: sumBy(outlines, (o) => o.units.length),
  lessons: lessons.length,
  exercises,
  vocabularies: vocabDocs.length,
  bankVocabularies: bankVocab.length,
  grammarPoints: sumBy(Object.values(GRAMMAR), (g) => sumBy(Object.values(g), (x) => x.length)),
  readingsAndDialogues: sumBy(Object.values(TEXTS), (t) => sumBy(Object.values(t), (p) => p.readings.length + p.dialogues.length)),
  exams: examDocs.length,
  examQuestions: sumBy(examDocs, (e) => e.questionCount),
});
