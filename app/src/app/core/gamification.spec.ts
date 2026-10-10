import { LEAGUES, dailyQuests, leagueFor, levelFromXp, newAchievements, nextStreak, questValue, visibleStreak } from './gamification';
import { UserProfile } from './models';

describe('gamification', () => {
  it('computes levels with growing XP requirements', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, current: 0, needed: 100 });
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100)).toEqual({ level: 2, current: 0, needed: 150 });
    expect(levelFromXp(250)).toEqual({ level: 3, current: 0, needed: 200 });
    expect(levelFromXp(-5).level).toBe(1);
  });

  it('keeps, increases or resets the streak', () => {
    expect(nextStreak('2026-10-10', 4, '2026-10-10')).toMatchObject({ streak: 4, changed: false });
    expect(nextStreak('2026-10-09', 4, '2026-10-10')).toMatchObject({ streak: 5, changed: true });
    expect(nextStreak('2026-10-07', 4, '2026-10-10')).toMatchObject({ streak: 1, changed: true });
    expect(nextStreak(null, 0, '2026-10-10')).toMatchObject({ streak: 1, changed: true });
    expect(nextStreak('2026-09-30', 9, '2026-10-01').streak).toBe(10);
  });

  it('uses streak freezes to cover missed days', () => {
    expect(nextStreak('2026-10-08', 4, '2026-10-10', 1)).toEqual({ streak: 5, changed: true, freezes: 0, usedFreezes: 1 });
    expect(nextStreak('2026-10-07', 4, '2026-10-10', 2)).toEqual({ streak: 5, changed: true, freezes: 0, usedFreezes: 2 });
    // Not enough freezes: the streak resets and freezes are kept.
    expect(nextStreak('2026-10-06', 4, '2026-10-10', 2)).toMatchObject({ streak: 1, freezes: 2, usedFreezes: 0 });
  });

  it('earns a freeze every 7 days, up to 2', () => {
    expect(nextStreak('2026-10-09', 6, '2026-10-10', 0)).toMatchObject({ streak: 7, freezes: 1 });
    expect(nextStreak('2026-10-09', 13, '2026-10-10', 2)).toMatchObject({ streak: 14, freezes: 2 });
    expect(nextStreak('2026-10-09', 7, '2026-10-10', 1)).toMatchObject({ streak: 8, freezes: 1 });
  });

  it('shows a broken streak as 0 unless freezes can cover it', () => {
    expect(visibleStreak('2026-10-09', 5, '2026-10-10')).toBe(5);
    expect(visibleStreak('2026-10-08', 5, '2026-10-10')).toBe(0);
    expect(visibleStreak('2026-10-08', 5, '2026-10-10', 1)).toBe(5);
    expect(visibleStreak(null, 5, '2026-10-10')).toBe(0);
  });

  it('unlocks only new achievements', () => {
    const profile = {
      lessonsCompleted: 12, longestStreak: 3, wordsLearned: 10, xp: 1200, totalMinutes: 30, achievements: ['first-lesson'],
    } as UserProfile;
    expect(newAchievements(profile)).toEqual(['lessons-10', 'streak-3', 'xp-1000']);
  });

  it('picks 3 deterministic daily quests with different metrics', () => {
    const a = dailyQuests('2026-10-10');
    expect(a).toHaveLength(3);
    expect(new Set(a.map((q) => q.metric)).size).toBe(3);
    expect(dailyQuests('2026-10-10')).toEqual(a);
    const day = { m: 12.7, xp: 45, l: 1, e: 20 };
    for (const q of a) expect(questValue(q, day)).toBe({ xp: 45, exercises: 20, lessons: 1, minutes: 12 }[q.metric]);
    expect(questValue(a[0], undefined)).toBe(0);
  });

  it('maps weekly XP to leagues', () => {
    expect(leagueFor(0)).toEqual({ league: LEAGUES[0], next: LEAGUES[1] });
    expect(leagueFor(150).league.id).toBe('silver');
    expect(leagueFor(399).league.id).toBe('silver');
    expect(leagueFor(5000)).toEqual({ league: LEAGUES[LEAGUES.length - 1], next: null });
  });
});
