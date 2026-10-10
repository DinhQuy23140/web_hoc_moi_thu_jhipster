import { SkillStat, aggregateSkills, estimateScore, ieltsBand, ieltsOverall, weakestSkills } from './exam-score';

const stats = (v: number, g: number, r: number, l: number): SkillStat[] => [
  { kind: 'vocabulary', correct: v, total: 10 },
  { kind: 'grammar', correct: g, total: 10 },
  { kind: 'reading', correct: r, total: 10 },
  { kind: 'listening', correct: l, total: 10 },
];

describe('exam-score', () => {
  it('aggregates sections of the same skill', () => {
    expect(
      aggregateSkills([
        { kind: 'reading', correct: 3, total: 5 },
        { kind: 'reading', correct: 4, total: 5 },
        { kind: 'listening', correct: 2, total: 5 },
      ]),
    ).toEqual([
      { kind: 'reading', correct: 7, total: 10 },
      { kind: 'listening', correct: 2, total: 5 },
    ]);
  });

  it('maps IELTS raw scores to bands and rounds the overall band', () => {
    expect(ieltsBand(40)).toBe(9);
    expect(ieltsBand(30)).toBe(7);
    expect(ieltsBand(23)).toBe(6);
    expect(ieltsBand(0)).toBe(2);
    expect(ieltsOverall([6, 6.5])).toBe(6.5);
    expect(ieltsOverall([6.5, 7])).toBe(7);
    expect(ieltsOverall([6, 6])).toBe(6);
  });

  it('estimates IELTS against the target band', () => {
    const e = estimateScore('IELTS', '6.5', stats(8, 8, 8, 8))!;
    expect(e.total).toBe('7.0');
    expect(e.passed).toBe(true);
    expect(e.noteKey).toBe('examScore.noteNoWS');
  });

  it('estimates TOEIC on the 990 scale', () => {
    const full = estimateScore('TOEIC', '650', stats(10, 10, 10, 10))!;
    expect(full.total).toBe('990');
    const half = estimateScore('TOEIC', '650', stats(5, 5, 5, 5))!;
    expect(Number(half.total)).toBeGreaterThan(450);
    expect(half.passed).toBe(false);
  });

  it('applies JLPT section minimums', () => {
    const ok = estimateScore('JLPT', 'N3', stats(7, 7, 7, 7))!;
    expect(ok.max).toBe('180');
    expect(ok.passed).toBe(true);
    // High total but listening below the 19/60 minimum.
    const failListening = estimateScore('JLPT', 'N3', stats(10, 10, 10, 2))!;
    expect(Number(failListening.total)).toBeGreaterThanOrEqual(95);
    expect(failListening.passed).toBe(false);
    expect(estimateScore('NAT', '4Q', stats(8, 8, 8, 8))!.scaleKey).toBe('examScore.scale.nat');
  });

  it('assigns Cambridge grades and J.TEST levels', () => {
    expect(estimateScore('CAMB', 'PET', stats(10, 10, 10, 10))!.grade).toBe('B2 (Grade A)');
    expect(estimateScore('CAMB', 'PET', stats(1, 1, 1, 1))!.passed).toBe(false);
    expect(estimateScore('J.TEST', 'AD', stats(10, 10, 10, 10))!.grade).toBe('Special A');
    expect(estimateScore('UNKNOWN', 'X', stats(1, 1, 1, 1))).toBeNull();
  });

  it('sorts skills from weakest to strongest', () => {
    expect(weakestSkills(stats(9, 4, 7, 6)).map((s) => s.kind)).toEqual(['grammar', 'listening', 'reading', 'vocabulary']);
  });
});
