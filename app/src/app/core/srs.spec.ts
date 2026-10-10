import { isDue, mastery, newSrsState, retrievability, review } from './srs';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 10);

describe('srs (FSRS-5)', () => {
  it('uses the default initial stabilities for a new card', () => {
    const s = newSrsState(NOW);
    expect(review(s, 'hard', NOW).interval).toBe(1);
    expect(review(s, 'good', NOW)).toMatchObject({ interval: 3, reps: 1, due: NOW + 3 * DAY, lastReview: NOW });
    expect(review(s, 'easy', NOW).interval).toBe(16);
  });

  it('grows the interval when a card is recalled on its due date', () => {
    let s = review(newSrsState(NOW), 'good', NOW);
    let prev = s.interval;
    for (let i = 0; i < 4; i++) {
      s = review(s, 'good', s.due);
      expect(s.interval).toBeGreaterThan(prev);
      prev = s.interval;
    }
  });

  it('gives easier cards a lower difficulty', () => {
    const easy = review(newSrsState(NOW), 'easy', NOW);
    const hard = review(newSrsState(NOW), 'hard', NOW);
    expect(easy.difficulty!).toBeLessThan(hard.difficulty!);
  });

  it('sends a lapsed card back to relearning in 10 minutes and lowers stability', () => {
    const learned = review(review(newSrsState(NOW), 'good', NOW), 'good', NOW + 3 * DAY);
    const t = learned.due;
    const lapsed = review(learned, 'again', t);
    expect(lapsed).toMatchObject({ interval: 0, reps: 0, lapses: 1, due: t + 10 * 60_000 });
    expect(lapsed.stability!).toBeLessThan(learned.stability!);
    expect(lapsed.ease).toBe(learned.ease);
  });

  it('migrates SM-2 cards using their previous interval', () => {
    const old = { ease: 2.5, interval: 10, reps: 3, lapses: 0, due: NOW };
    const next = review(old, 'good', NOW);
    expect(next.interval).toBeGreaterThan(10);
    expect(next.stability).toBeDefined();
  });

  it('caps intervals at one year', () => {
    let s = newSrsState(NOW);
    for (let i = 0; i < 20; i++) s = review(s, 'easy', NOW);
    expect(s.interval).toBe(365);
  });

  it('computes retrievability (90% at t = stability)', () => {
    expect(retrievability(0, 5)).toBe(1);
    expect(retrievability(5, 5)).toBeCloseTo(0.9, 5);
    expect(retrievability(20, 5)).toBeLessThan(0.9);
  });

  it('reports due cards and mastery levels', () => {
    expect(isDue({ due: NOW }, NOW)).toBe(true);
    expect(isDue({ due: NOW + 1 }, NOW)).toBe(false);
    expect(mastery({ interval: 0, reps: 0 })).toBe(0);
    expect(mastery({ interval: 1, reps: 1 })).toBe(1);
    expect(mastery({ interval: 30, reps: 5 })).toBe(4);
    expect(mastery({ interval: 90, reps: 8 })).toBe(5);
  });
});
