import { Exercise, L10n } from './models';
import { normalizeAnswer, similarity } from './utils';

export type UserAnswer = string | boolean | string[] | [string, string][] | null;

export interface CheckResult {
  correct: boolean;
  /** 0..1, partial credit (matching / speaking). */
  score: number;
  expected: string;
}

const SPEAKING_PASS = 70;

export function expectedAnswer(ex: Exercise): string {
  switch (ex.type) {
    case 'TRUE_FALSE':
      return ex.correct ? 'True' : 'False';
    case 'MATCHING':
      return (ex.pairs ?? []).map(([a, b]) => `${a} = ${b}`).join(', ');
    case 'SPEAKING':
      return ex.audioText ?? ex.answers?.[0] ?? '';
    case 'DICTATION':
      return ex.answers?.[0] ?? ex.audioText ?? '';
    default:
      return ex.answers?.[0] ?? '';
  }
}

/**
 * Expected answer as shown to the learner: canonical values are replaced by their localized
 * labels and True/False uses the UI translation.
 */
export function expectedDisplay(ex: Exercise, l: (v: L10n) => string, t: (key: string) => string): string {
  const label = (v: string) => (ex.labels?.[v] ? l(ex.labels[v]) : v);
  switch (ex.type) {
    case 'TRUE_FALSE':
      return t(ex.correct ? 'exercise.true' : 'exercise.false');
    case 'MATCHING':
      return (ex.pairs ?? []).map(([a, b]) => `${a} = ${label(b)}`).join(' · ');
    default:
      return label(expectedAnswer(ex));
  }
}

/** Pure answer validation shared by lessons, exams, games and the daily challenge. */
export function checkAnswer(ex: Exercise, answer: UserAnswer): CheckResult {
  const expected = expectedAnswer(ex);
  const fail = { correct: false, score: 0, expected };
  if (answer == null) return fail;

  switch (ex.type) {
    case 'TRUE_FALSE': {
      const ok = answer === ex.correct;
      return { correct: ok, score: ok ? 1 : 0, expected };
    }
    case 'MATCHING': {
      const pairs = ex.pairs ?? [];
      if (!Array.isArray(answer) || !pairs.length) return fail;
      const given = new Map((answer as [string, string][]).map(([l, r]) => [l, r]));
      const hits = pairs.filter(([l, r]) => given.get(l) === r).length;
      return { correct: hits === pairs.length, score: hits / pairs.length, expected };
    }
    case 'ORDER_WORD': {
      const text = Array.isArray(answer) ? (answer as string[]).join(' ') : String(answer);
      const ok = (ex.answers ?? []).some((a) => compact(a) === compact(text));
      return { correct: ok, score: ok ? 1 : 0, expected };
    }
    case 'SPEAKING': {
      const s = similarity(String(answer), expected);
      return { correct: s >= SPEAKING_PASS, score: s / 100, expected };
    }
    case 'DICTATION': {
      const text = String(answer);
      const best = Math.max(0, ...(ex.answers ?? [expected]).map((a) => (compact(a) === compact(text) ? 100 : similarity(text, a))));
      return { correct: best === 100, score: best / 100, expected };
    }
    default: {
      const text = String(answer);
      const ok = (ex.answers ?? []).some((a) => normalizeAnswer(a) === normalizeAnswer(text));
      return { correct: ok, score: ok ? 1 : 0, expected };
    }
  }
}

/** Japanese sentences have no spaces, so word-order answers are compared without whitespace. */
function compact(s: string): string {
  return normalizeAnswer(s).replace(/\s+/g, '');
}
