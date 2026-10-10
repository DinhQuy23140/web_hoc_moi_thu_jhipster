/**
 * Romaji → kana conversion (Hepburn + common IME spellings) so learners without a
 * Japanese keyboard can still type answers. Greedy longest match, like an IME.
 */
const TABLE: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  la: 'ら', li: 'り', lu: 'る', le: 'れ', lo: 'ろ',
  wa: 'わ', wo: 'を', "n'": 'ん',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', she: 'しぇ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', je: 'じぇ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', che: 'ちぇ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', thi: 'てぃ', dhi: 'でぃ', wi: 'うぃ', we: 'うぇ', va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
  xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', xtu: 'っ', xtsu: 'っ', ltu: 'っ',
  '-': 'ー', ',': '、', '.': '。', '?': '？', '!': '！',
};

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

/**
 * Converts romaji to hiragana. Already-typed kana and unknown characters pass through.
 * A trailing single "n" stays latin while typing (it may become な/に...) unless `final`.
 */
export function romajiToHiragana(input: string, final = true): string {
  const s = input.toLowerCase();
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const next = s[i + 1];
    // Doubled consonant → small tsu (except "nn").
    if (next && c === next && /[bcdfghjklmpqrstvwxyz]/.test(c) && c !== 'n') {
      out += 'っ';
      i++;
      continue;
    }
    // "nn" before a vowel is ん + な行 (konnichiha → こんにちは), otherwise a single ん.
    if (c === 'n' && next === 'n') {
      const after = s[i + 2];
      out += 'ん';
      i += after && (VOWELS.has(after) || after === 'y') ? 1 : 2;
      continue;
    }
    if (c === 'n' && next && !VOWELS.has(next) && next !== 'y' && next !== "'") {
      out += 'ん';
      i++;
      continue;
    }
    if (c === 'n' && !next) {
      out += final ? 'ん' : 'n';
      i++;
      continue;
    }
    let matched = false;
    for (const len of [4, 3, 2, 1]) {
      const chunk = s.slice(i, i + len);
      const kana = TABLE[chunk];
      if (kana) {
        out += kana;
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += input[i];
      i++;
    }
  }
  return out;
}

export function hiraganaToKatakana(s: string): string {
  return s.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

export function katakanaToHiragana(s: string): string {
  return s.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** True when the text is only latin letters (so it should be converted before comparing). */
export function looksLikeRomaji(s: string): boolean {
  return /^[a-z' \-.,!?]+$/i.test(s.trim());
}

/**
 * Compares a typed answer with a Japanese target, accepting romaji, hiragana or katakana
 * input for a kana target (e.g. "sensei", "せんせい" and "センセイ" all match せんせい).
 */
export function kanaEquals(typed: string, target: string): boolean {
  const norm = (x: string) => katakanaToHiragana(x.normalize('NFKC').replace(/[\s・]/g, '')).toLowerCase();
  const t = looksLikeRomaji(typed) ? romajiToHiragana(typed) : typed;
  return norm(t) === norm(target);
}
