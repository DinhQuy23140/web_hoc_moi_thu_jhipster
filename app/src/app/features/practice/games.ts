import { Exercise, L10n, UiLocale, Vocabulary } from '../../core/models';
import { pickL10n, sample, seededRandom, shuffle } from '../../core/utils';
import { KANA } from './kana';

export interface QuizQuestion {
  prompt: string;
  sub?: string;
  audio?: string;
  options: string[];
  answer: string;
  jpPrompt: boolean;
  jpOptions: boolean;
}

export type GameId = 'challenge' | 'match' | 'speed' | 'listen' | 'scramble' | 'dictation' | 'kana' | 'writing';

export const GAMES: { id: GameId; icon: string; color: string; only?: 'ja' }[] = [
  { id: 'challenge', icon: 'target', color: '#fb923c' },
  { id: 'writing', icon: 'edit', color: '#7c3aed', only: 'ja' },
  { id: 'dictation', icon: 'headphones', color: '#0d9488' },
  { id: 'match', icon: 'layers', color: '#4f46e5' },
  { id: 'speed', icon: 'zap', color: '#eab308' },
  { id: 'listen', icon: 'volume', color: '#0ea5e9' },
  { id: 'scramble', icon: 'shuffle', color: '#22c55e' },
  { id: 'kana', icon: 'pen', color: '#db2777', only: 'ja' },
];

/** Words with a usable example sentence for dictation. */
function dictationCandidates(pool: Vocabulary[], jp: boolean): Vocabulary[] {
  return pool.filter((v) => {
    const s = v.example?.trim();
    if (!s) return false;
    return jp ? [...s].length >= 4 && [...s].length <= 22 : s.split(/\s+/).length >= 3 && s.split(/\s+/).length <= 14;
  });
}

function dictationExercise(v: Vocabulary, id: string): Exercise {
  return {
    id,
    type: 'DICTATION',
    instruction: { vi: 'Nghe và chép lại câu', en: 'Listen and write the sentence', ja: '聞いて文を書いてください' },
    audioText: v.example!,
    answers: [v.example!, ...(v.exampleReading ? [v.exampleReading] : [])],
    ...(v.exampleMeaning ? { explanation: v.exampleMeaning } : {}),
  };
}

/** Sentence dictation built from vocabulary example sentences. */
export function dictationExercises(pool: Vocabulary[], n: number, jp: boolean): Exercise[] {
  return sample(dictationCandidates(pool, jp), n).map((v, i) => dictationExercise(v, `d${i}-${v.id}`));
}

function distractors(pool: Vocabulary[], correct: Vocabulary, n: number, key: (v: Vocabulary) => string, rand = Math.random): string[] {
  const target = key(correct);
  const seen = new Set([target]);
  const out: string[] = [];
  for (const v of shuffle(pool, rand)) {
    const k = key(v);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
    if (out.length >= n) break;
  }
  return out;
}

/** Word → meaning (or reverse) multiple-choice questions. */
export function meaningQuiz(pool: Vocabulary[], n: number, loc: UiLocale, jp: boolean): QuizQuestion[] {
  const m = (v: Vocabulary) => pickL10n(v.meaning, loc);
  return sample(pool, n).map((v, i) => {
    const reverse = i % 3 === 2;
    if (reverse) {
      const opts = shuffle([v.word, ...distractors(pool, v, 3, (x) => x.word)]);
      return { prompt: m(v), options: opts, answer: v.word, jpPrompt: false, jpOptions: jp };
    }
    const opts = shuffle([m(v), ...distractors(pool, v, 3, m)]);
    return { prompt: v.word, sub: v.reading || v.ipa, options: opts, answer: m(v), jpPrompt: jp, jpOptions: false };
  });
}

/** Hear a word, pick what was said. */
export function listenQuiz(pool: Vocabulary[], n: number, loc: UiLocale, jp: boolean): QuizQuestion[] {
  return sample(pool, n).map((v) => ({
    prompt: '🔊',
    audio: v.word,
    sub: pickL10n(v.meaning, loc),
    options: shuffle([v.word, ...distractors(pool, v, 3, (x) => x.word)]),
    answer: v.word,
    jpPrompt: false,
    jpOptions: jp,
  }));
}

export function kanaQuiz(n: number, script: 'hira' | 'kata' | 'mix'): QuizQuestion[] {
  return sample(KANA, n).map((k, i) => {
    const s = script === 'mix' ? (i % 2 ? 'kata' : 'hira') : script;
    const others = sample(KANA.filter((x) => x.romaji !== k.romaji), 3).map((x) => x.romaji);
    return { prompt: k[s], audio: k.hira, options: shuffle([k.romaji, ...others]), answer: k.romaji, jpPrompt: true, jpOptions: false };
  });
}

/** Deterministic daily challenge: same 10 questions for everyone on a given day. */
export function dailyChallenge(pool: Vocabulary[], day: string, lang: string, loc: UiLocale): Exercise[] {
  const rand = seededRandom(`${day}:${lang}`);
  const words = shuffle(pool, rand).slice(0, 10);
  const instr = (vi: string, en: string, ja: string): L10n => ({ vi, en, ja });
  const jp = lang === 'ja';
  return words.map((v, i): Exercise => {
    const meaning = pickL10n(v.meaning, loc);
    if (i === 9 && dictationCandidates([v], jp).length) return dictationExercise(v, `c${i}`);
    switch (i % 5) {
      case 0:
        return {
          id: `c${i}`,
          type: 'MULTIPLE_CHOICE',
          instruction: instr('Chọn nghĩa đúng', 'Choose the correct meaning', '正しい意味を選んでください'),
          question: v.word,
          hint: v.reading,
          options: [meaning, ...distractors(pool, v, 3, (x) => pickL10n(x.meaning, loc), rand)],
          answers: [meaning],
        };
      case 1:
        return {
          id: `c${i}`,
          type: 'LISTENING',
          instruction: instr('Nghe và chọn từ đúng', 'Listen and choose the word', '聞いて正しい言葉を選んでください'),
          audioText: v.word,
          options: [v.word, ...distractors(pool, v, 3, (x) => x.word, rand)],
          answers: [v.word],
        };
      case 2:
        return {
          id: `c${i}`,
          type: 'TRANSLATE',
          instruction: instr('Viết từ có nghĩa sau', 'Write the word that means', '次の意味の言葉を書いてください'),
          question: meaning,
          answers: [v.word, ...(v.reading ? [v.reading] : []), ...(v.romaji ? [v.romaji] : [])],
        };
      case 3: {
        const other = shuffle(pool.filter((x) => x.id !== v.id), rand)[0];
        const truth = rand() > 0.5;
        return {
          id: `c${i}`,
          type: 'TRUE_FALSE',
          instruction: instr('Đúng hay sai?', 'True or false?', '正しいですか？'),
          question: `${v.word} = ${truth ? meaning : pickL10n(other.meaning, loc)}`,
          correct: truth,
        };
      }
      default: {
        const group = [v, ...shuffle(pool.filter((x) => x.id !== v.id), rand).slice(0, 3)];
        return {
          id: `c${i}`,
          type: 'MATCHING',
          instruction: instr('Nối từ với nghĩa', 'Match words with meanings', '言葉と意味を合わせてください'),
          pairs: group.map((x) => [x.word, pickL10n(x.meaning, loc)] as [string, string]),
        };
      }
    }
  });
}

/** Letters (English) or kana (Japanese reading) to unscramble. */
export function scrambleTiles(v: Vocabulary, jp: boolean): string[] {
  const base = jp ? (v.reading || v.word) : v.word;
  const chars = [...base];
  let s = shuffle(chars);
  for (let i = 0; i < 5 && s.join('') === base && chars.length > 1; i++) s = shuffle(chars);
  return s;
}
