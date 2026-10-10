import { addDays, daysBetween, diffWords, normalizeAnswer, pickL10n, seededRandom, similarity, weekId } from './utils';

describe('utils', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('computes ISO week ids', () => {
    expect(weekId(new Date(2026, 9, 10))).toBe('2026-W41');
    expect(weekId(new Date(2027, 0, 1))).toBe('2026-W53');
  });

  it('picks the UI locale with English fallback and respects empty translations', () => {
    expect(pickL10n({ vi: 'xin chào', en: 'hello' }, 'ja')).toBe('hello');
    expect(pickL10n({ vi: 'xin chào', en: 'hello', ja: 'こんにちは' }, 'ja')).toBe('こんにちは');
    expect(pickL10n({ vi: 'câu ví dụ', en: '' }, 'en')).toBe('');
    expect(pickL10n(undefined, 'vi')).toBe('');
  });

  it('normalizes answers', () => {
    expect(normalizeAnswer('  Hello,   World! ')).toBe('hello world');
    expect(normalizeAnswer('「こんにちは。」')).toBe('こんにちは');
    expect(normalizeAnswer('don’t')).toBe("don't");
  });

  it('scores similarity 0..100', () => {
    expect(similarity('abc', 'abc')).toBe(100);
    expect(similarity('abcd', 'abcx')).toBe(75);
  });

  it('counts days between date keys', () => {
    expect(daysBetween('2026-10-08', '2026-10-10')).toBe(2);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2026-10-10', '2026-10-10')).toBe(0);
  });

  it('diffs dictation answers word by word (and per character for Japanese)', () => {
    expect(diffWords('I like green tea.', 'i like tea')).toEqual([
      { text: 'I', ok: true },
      { text: 'like', ok: true },
      { text: 'green', ok: false },
      { text: 'tea.', ok: true },
    ]);
    expect(diffWords('おちゃ', 'おみゃ').map((t) => t.ok)).toEqual([true, false, true]);
  });

  it('produces the same sequence for the same seed', () => {
    const a = seededRandom('2026-10-10');
    const b = seededRandom('2026-10-10');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
