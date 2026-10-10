/**
 * Spaced repetition with FSRS-5 (Free Spaced Repetition Scheduler, the default in Anki
 * since 23.10) using its published default parameters and a 90 % target retention.
 * Pure functions so the scheduling logic is unit-testable.
 *
 * Cards last reviewed with the previous SM-2 scheduler have no stability/difficulty yet;
 * their memory state is estimated from interval and ease on the next review.
 */
export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  /** Kept for backwards compatibility with SM-2 cards and the security rules. */
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: number;
  stability?: number;
  difficulty?: number;
  lastReview?: number;
}

const DAY = 86_400_000;
const RELEARN_MS = 10 * 60_000;
const MAX_INTERVAL = 365;
const DECAY = -0.5;
const FACTOR = 19 / 81;
/** FSRS-5 default weights. */
const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605,
  2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];
const G: Record<Grade, number> = { again: 1, hard: 2, good: 3, easy: 4 };

export function newSrsState(now = Date.now()): SrsState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now };
}

/** Probability of recalling a card `elapsedDays` after the last review. */
export function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

function initStability(g: number): number {
  return Math.max(W[g - 1], 0.1);
}

function initDifficulty(g: number): number {
  return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);
}

function nextDifficulty(d: number, g: number): number {
  const delta = -W[6] * (g - 3);
  const damped = d + (delta * (10 - d)) / 9;
  return clamp(W[7] * initDifficulty(4) + (1 - W[7]) * damped, 1, 10);
}

function recallStability(d: number, s: number, r: number, g: number): number {
  const hardPenalty = g === 2 ? W[15] : 1;
  const easyBonus = g === 4 ? W[16] : 1;
  return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hardPenalty * easyBonus + 1);
}

function forgetStability(d: number, s: number, r: number): number {
  const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
  return Math.min(sf, s);
}

function shortTermStability(s: number, g: number): number {
  return s * Math.exp(W[17] * (g - 3 + W[18]));
}

/** Memory state for a card, estimating it from SM-2 fields when FSRS data is missing. */
function memoryState(state: SrsState): { s: number; d: number; last: number } | null {
  if (!state.reps && !state.lapses && state.stability == null) return null;
  if (state.stability != null && state.difficulty != null) {
    return { s: state.stability, d: state.difficulty, last: state.lastReview ?? state.due - state.interval * DAY };
  }
  return {
    s: Math.max(state.interval, 0.5),
    d: clamp(10 - (state.ease - 1.3) * 4, 1, 10),
    last: state.due - state.interval * DAY,
  };
}

export function review(state: SrsState, grade: Grade, now = Date.now()): SrsState {
  const g = G[grade];
  const mem = memoryState(state);
  let s: number;
  let d: number;
  if (!mem) {
    s = initStability(g);
    d = initDifficulty(g);
  } else {
    const elapsed = (now - mem.last) / DAY;
    const r = retrievability(elapsed, mem.s);
    d = nextDifficulty(mem.d, g);
    if (elapsed < 1) s = shortTermStability(mem.s, g);
    else s = g === 1 ? forgetStability(mem.d, mem.s, r) : recallStability(mem.d, mem.s, r, g);
  }
  s = round2(Math.max(s, 0.1));
  d = round2(d);

  const base = { ease: state.ease, stability: s, difficulty: d, lastReview: now };
  if (grade === 'again') {
    return { ...base, interval: 0, reps: 0, lapses: state.lapses + 1, due: now + RELEARN_MS };
  }
  // With 90 % target retention the optimal interval equals the stability (in days).
  let interval = clamp(Math.round(s), 1, MAX_INTERVAL);
  if (grade === 'easy') interval = Math.max(interval, Math.min(MAX_INTERVAL, (state.interval || 1) + 1));
  return { ...base, interval, reps: state.reps + 1, lapses: state.lapses, due: now + interval * DAY };
}

export function isDue(state: Pick<SrsState, 'due'>, now = Date.now()): boolean {
  return state.due <= now;
}

/** Mastery 0..5 derived from the interval, used for the "vocabulary mastery" stat. */
export function mastery(state: Pick<SrsState, 'interval' | 'reps'>): number {
  if (!state.reps) return 0;
  if (state.interval >= 60) return 5;
  if (state.interval >= 21) return 4;
  if (state.interval >= 7) return 3;
  if (state.interval >= 3) return 2;
  return 1;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
