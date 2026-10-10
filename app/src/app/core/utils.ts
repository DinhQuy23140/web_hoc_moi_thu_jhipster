import { L10n, UiLocale } from './models';

/** Local calendar date key, e.g. 2026-10-10. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return dateKey(date);
}

/** Whole calendar days from `from` to `to` (both date keys). */
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** ISO-8601 week id, e.g. 2026-W41. Used to bucket the weekly leaderboard. */
export function weekId(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function pickL10n(value: L10n | string | undefined | null, locale: UiLocale): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  // An empty string is a deliberate "no translation needed" (e.g. English example for English UI).
  return value[locale] ?? value.en ?? value.vi ?? '';
}

export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(items: readonly T[], n: number, rand: () => number = Math.random): T[] {
  return shuffle(items, rand).slice(0, n);
}

/** Deterministic PRNG so that "daily challenge" is identical for everyone on the same day. */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 0..100 similarity between two strings after normalization. */
export function similarity(a: string, b: string): number {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  const max = Math.max(x.length, y.length);
  if (!max) return 100;
  return Math.round((1 - levenshtein(x, y) / max) * 100);
}

/**
 * Normalizes free-text answers: case, width (full-width → half-width), punctuation
 * (both ASCII and Japanese) and whitespace are ignored.
 */
export function normalizeAnswer(s: string): string {
  return (s ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:"()\[\]{}。、！？「」『』・…〜~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DiffToken {
  text: string;
  ok: boolean;
}

/**
 * Word-level comparison for dictation feedback: returns the expected text split into
 * tokens, each flagged as heard correctly or not (LCS on normalized tokens). Japanese
 * has no spaces, so it is compared character by character.
 */
export function diffWords(expected: string, given: string): DiffToken[] {
  const cjk = /[\u3040-\u30ff\u4e00-\u9fff]/.test(expected);
  const split = (s: string) => (cjk ? [...s.replace(/\s+/g, '')] : s.split(/\s+/).filter(Boolean));
  const exp = split(expected);
  const got = split(given).map(normalizeAnswer);
  const e = exp.map(normalizeAnswer);
  const dp = Array.from({ length: e.length + 1 }, () => new Array<number>(got.length + 1).fill(0));
  for (let i = e.length - 1; i >= 0; i--) {
    for (let j = got.length - 1; j >= 0; j--) {
      dp[i][j] = e[i] && e[i] === got[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < e.length) {
    if (!e[i]) {
      out.push({ text: exp[i++], ok: true });
    } else if (j < got.length && e[i] === got[j]) {
      out.push({ text: exp[i++], ok: true });
      j++;
    } else if (j < got.length && dp[i][j + 1] >= dp[i + 1][j]) {
      j++;
    } else {
      out.push({ text: exp[i++], ok: false });
    }
  }
  return out;
}

export function formatMinutes(min: number, locale: UiLocale): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const units = { vi: ['g', 'p'], en: ['h', 'm'], ja: ['時間', '分'] }[locale];
  return h ? `${h}${units[0]} ${m}${units[1]}` : `${m}${units[1]}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
