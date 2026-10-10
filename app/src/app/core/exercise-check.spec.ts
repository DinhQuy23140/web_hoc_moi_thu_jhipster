import { checkAnswer, expectedAnswer } from './exercise-check';
import { Exercise } from './models';

const instruction = { vi: '', en: '' };
const ex = (e: Omit<Exercise, 'id' | 'instruction'>): Exercise => ({ id: 'x', instruction, ...e });

describe('checkAnswer', () => {
  it('accepts any listed answer ignoring case, punctuation and full-width characters', () => {
    const e = ex({ type: 'TRANSLATE', answers: ['家族', 'かぞく', 'kazoku'] });
    expect(checkAnswer(e, 'Kazoku').correct).toBe(true);
    expect(checkAnswer(e, 'かぞく。').correct).toBe(true);
    expect(checkAnswer(e, 'ｋａｚｏｋｕ').correct).toBe(true);
    expect(checkAnswer(e, 'kazuko').correct).toBe(false);
  });

  it('checks multiple choice against canonical option values', () => {
    const e = ex({ type: 'MULTIPLE_CHOICE', options: ['friend', 'family'], answers: ['friend'] });
    expect(checkAnswer(e, 'friend')).toEqual({ correct: true, score: 1, expected: 'friend' });
    expect(checkAnswer(e, 'family').correct).toBe(false);
    expect(checkAnswer(e, null).correct).toBe(false);
  });

  it('handles true / false', () => {
    const e = ex({ type: 'TRUE_FALSE', correct: false });
    expect(checkAnswer(e, false).correct).toBe(true);
    expect(checkAnswer(e, true).correct).toBe(false);
    expect(expectedAnswer(e)).toBe('False');
  });

  it('gives partial credit for matching', () => {
    const e = ex({ type: 'MATCHING', pairs: [['犬', 'dog'], ['猫', 'cat']] });
    expect(checkAnswer(e, [['犬', 'dog'], ['猫', 'cat']]).correct).toBe(true);
    const half = checkAnswer(e, [['犬', 'dog'], ['猫', 'bird']]);
    expect(half).toMatchObject({ correct: false, score: 0.5 });
  });

  it('compares Japanese word order without whitespace', () => {
    const e = ex({ type: 'ORDER_WORD', options: ['です。', '私は', '学生'], answers: ['私は学生です。'] });
    expect(checkAnswer(e, ['私は', '学生', 'です。']).correct).toBe(true);
    expect(checkAnswer(e, ['学生', '私は', 'です。']).correct).toBe(false);
  });

  it('compares English word order', () => {
    const e = ex({ type: 'ORDER_WORD', options: ['a', 'I', 'student.', 'am'], answers: ['I am a student.'] });
    expect(checkAnswer(e, ['I', 'am', 'a', 'student.']).correct).toBe(true);
    expect(checkAnswer(e, ['am', 'I', 'a', 'student.']).correct).toBe(false);
  });

  it('passes speaking at 70% similarity', () => {
    const e = ex({ type: 'SPEAKING', audioText: 'Nice to meet you' });
    expect(checkAnswer(e, 'nice to meet you!').correct).toBe(true);
    expect(checkAnswer(e, 'nice to meat you').correct).toBe(true);
    expect(checkAnswer(e, 'good morning').correct).toBe(false);
  });
});
        