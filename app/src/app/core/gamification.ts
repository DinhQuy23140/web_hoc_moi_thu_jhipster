import { L10n, UserProfile } from './models';
import { addDays, daysBetween, seededRandom, shuffle } from './utils';

export const XP = {
  lessonComplete: 20,
  perfectLesson: 10,
  exerciseCorrect: 2,
  reviewCard: 1,
  dailyGoal: 30,
  streak7: 100,
  examPass: 50,
  gameWin: 10,
  dailyChallenge: 40,
  mistakeFixed: 3,
} as const;

/** Learner level: each level needs 50 XP more than the previous one. */
export function levelFromXp(xp: number): { level: number; current: number; needed: number } {
  let level = 1;
  let need = 100;
  let rest = Math.max(0, Math.floor(xp));
  while (rest >= need) {
    rest -= need;
    level++;
    need += 50;
  }
  return { level, current: rest, needed: need };
}

export const MAX_STREAK_FREEZES = 2;

export interface StreakUpdate {
  streak: number;
  changed: boolean;
  /** Freezes left after this update. */
  freezes: number;
  /** Freezes spent to cover missed days. */
  usedFreezes: number;
}

/**
 * Streak rule: learning again today keeps the streak, learning the day after the last
 * active day increases it. Missed days are covered by streak freezes when the learner
 * owns enough of them; otherwise the streak resets to 1. One freeze is earned at every
 * 7-day milestone (max 2).
 */
export function nextStreak(lastActiveDate: string | null, streak: number, today: string, freezes = 0): StreakUpdate {
  if (lastActiveDate === today) return { streak: Math.max(streak, 1), changed: false, freezes, usedFreezes: 0 };
  let next = 1;
  let used = 0;
  if (lastActiveDate) {
    const missed = daysBetween(lastActiveDate, today) - 1;
    if (missed === 0) next = streak + 1;
    else if (missed > 0 && missed <= freezes && streak > 0) {
      next = streak + 1;
      used = missed;
    }
  }
  let left = freezes - used;
  if (next % 7 === 0) left = Math.min(MAX_STREAK_FREEZES, left + 1);
  return { streak: next, changed: true, freezes: left, usedFreezes: used };
}

/** Streak displayed to the user: becomes 0 once more days were missed than freezes can cover. */
export function visibleStreak(lastActiveDate: string | null, streak: number, today: string, freezes = 0): number {
  if (!lastActiveDate) return 0;
  if (lastActiveDate === today || addDays(lastActiveDate, 1) === today) return streak;
  return daysBetween(lastActiveDate, today) - 1 <= freezes ? streak : 0;
}

/* ------------------------------ daily quests ------------------------------ */

export type QuestMetric = 'xp' | 'exercises' | 'lessons' | 'minutes';

export interface QuestDef {
  id: string;
  metric: QuestMetric;
  goal: number;
  reward: number;
  icon: string;
}

const QUEST_POOL: QuestDef[] = [
  { id: 'xp-30', metric: 'xp', goal: 30, reward: 10, icon: '⚡' },
  { id: 'xp-80', metric: 'xp', goal: 80, reward: 20, icon: '💥' },
  { id: 'ex-15', metric: 'exercises', goal: 15, reward: 10, icon: '✅' },
  { id: 'ex-40', metric: 'exercises', goal: 40, reward: 20, icon: '🎯' },
  { id: 'lesson-1', metric: 'lessons', goal: 1, reward: 10, icon: '📘' },
  { id: 'lesson-2', metric: 'lessons', goal: 2, reward: 20, icon: '📚' },
  { id: 'min-10', metric: 'minutes', goal: 10, reward: 10, icon: '⏱️' },
  { id: 'min-20', metric: 'minutes', goal: 20, reward: 20, icon: '⏳' },
];

/** Three quests per day, the same for everyone (one per metric family, seeded by date). */
export function dailyQuests(day: string): QuestDef[] {
  const rand = seededRandom(`quests:${day}`);
  const byMetric = new Map<QuestMetric, QuestDef[]>();
  for (const q of QUEST_POOL) byMetric.set(q.metric, [...(byMetric.get(q.metric) ?? []), q]);
  const metrics = shuffle([...byMetric.keys()], rand).slice(0, 3);
  return metrics.map((m) => {
    const opts = byMetric.get(m)!;
    return opts[Math.floor(rand() * opts.length)];
  });
}

export function questValue(q: QuestDef, day: { m: number; xp: number; l: number; e: number } | undefined): number {
  if (!day) return 0;
  return { xp: day.xp, exercises: day.e, lessons: day.l, minutes: Math.floor(day.m) }[q.metric];
}

/* ------------------------------ leagues ------------------------------ */

export interface League {
  id: string;
  icon: string;
  color: string;
  /** Weekly XP needed to enter the league. */
  min: number;
}

export const LEAGUES: League[] = [
  { id: 'bronze', icon: '🥉', color: '#c2410c', min: 0 },
  { id: 'silver', icon: '🥈', color: '#94a3b8', min: 150 },
  { id: 'gold', icon: '🥇', color: '#f59e0b', min: 400 },
  { id: 'sapphire', icon: '💠', color: '#2563eb', min: 800 },
  { id: 'ruby', icon: '♦️', color: '#e11d48', min: 1400 },
  { id: 'diamond', icon: '💎', color: '#06b6d4', min: 2200 },
];

/** League reached with the given weekly XP, plus the next league (if any). */
export function leagueFor(weeklyXp: number): { league: League; next: League | null } {
  let i = 0;
  while (i + 1 < LEAGUES.length && weeklyXp >= LEAGUES[i + 1].min) i++;
  return { league: LEAGUES[i], next: LEAGUES[i + 1] ?? null };
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: L10n;
  description: L10n;
  test: (p: UserProfile) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-lesson', icon: '🎯', title: { vi: 'Khởi đầu', en: 'First step', ja: 'はじめの一歩' }, description: { vi: 'Hoàn thành bài học đầu tiên', en: 'Complete your first lesson', ja: '最初のレッスンを完了' }, test: (p) => p.lessonsCompleted >= 1 },
  { id: 'lessons-10', icon: '📘', title: { vi: 'Chăm chỉ', en: 'Diligent', ja: '勤勉' }, description: { vi: 'Hoàn thành 10 bài học', en: 'Complete 10 lessons', ja: '10レッスン完了' }, test: (p) => p.lessonsCompleted >= 10 },
  { id: 'lessons-50', icon: '🏛️', title: { vi: 'Học giả', en: 'Scholar', ja: '学者' }, description: { vi: 'Hoàn thành 50 bài học', en: 'Complete 50 lessons', ja: '50レッスン完了' }, test: (p) => p.lessonsCompleted >= 50 },
  { id: 'streak-3', icon: '🔥', title: { vi: 'Nóng máy', en: 'Warming up', ja: 'ウォームアップ' }, description: { vi: 'Chuỗi 3 ngày học', en: '3-day streak', ja: '3日連続' }, test: (p) => p.longestStreak >= 3 },
  { id: 'streak-7', icon: '⚡', title: { vi: 'Một tuần bền bỉ', en: 'Week warrior', ja: '一週間の戦士' }, description: { vi: 'Chuỗi 7 ngày học', en: '7-day streak', ja: '7日連続' }, test: (p) => p.longestStreak >= 7 },
  { id: 'streak-30', icon: '🌋', title: { vi: 'Không thể cản', en: 'Unstoppable', ja: '止まらない' }, description: { vi: 'Chuỗi 30 ngày học', en: '30-day streak', ja: '30日連続' }, test: (p) => p.longestStreak >= 30 },
  { id: 'words-50', icon: '🧠', title: { vi: 'Kho từ vựng', en: 'Word collector', ja: '単語コレクター' }, description: { vi: 'Học 50 từ', en: 'Learn 50 words', ja: '50語を学習' }, test: (p) => p.wordsLearned >= 50 },
  { id: 'words-300', icon: '📚', title: { vi: 'Từ điển sống', en: 'Walking dictionary', ja: '生き字引' }, description: { vi: 'Học 300 từ', en: 'Learn 300 words', ja: '300語を学習' }, test: (p) => p.wordsLearned >= 300 },
  { id: 'xp-1000', icon: '💎', title: { vi: 'Nghìn điểm', en: 'XP 1000', ja: '1000XP' }, description: { vi: 'Đạt 1.000 XP', en: 'Earn 1,000 XP', ja: '1,000XP獲得' }, test: (p) => p.xp >= 1000 },
  { id: 'xp-5000', icon: '👑', title: { vi: 'Bậc thầy', en: 'Master', ja: 'マスター' }, description: { vi: 'Đạt 5.000 XP', en: 'Earn 5,000 XP', ja: '5,000XP獲得' }, test: (p) => p.xp >= 5000 },
  { id: 'time-600', icon: '⏳', title: { vi: '10 giờ học', en: '10 hours in', ja: '10時間学習' }, description: { vi: 'Tổng thời gian học 10 giờ', en: 'Study for 10 hours in total', ja: '合計10時間学習' }, test: (p) => p.totalMinutes >= 600 },
];

/** Returns ids of achievements newly unlocked by the given profile. */
export function newAchievements(p: UserProfile): string[] {
  const owned = new Set(p.achievements ?? []);
  return ACHIEVEMENTS.filter((a) => !owned.has(a.id) && a.test(p)).map((a) => a.id);
}
