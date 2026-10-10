import { Injectable, inject, signal } from '@angular/core';
import { Api, seg } from './api';
import { AuthService } from './auth.service';
import { normalizeExercise, toStorable } from './content.service';
import { ACHIEVEMENTS, XP } from './gamification';
import { I18nService } from './i18n.service';
import {
  Attempt,
  CourseProgress,
  DayStat,
  Exercise,
  LeaderboardEntry,
  Mistake,
  MistakeSource,
  UserProfile,
  UserVocab,
  VocabItem,
  VocabStatus,
  YearStats,
} from './models';
import { Grade } from './srs';
import { ToastService } from './toast.service';
import { dateKey } from './utils';

export interface ActivityInput {
  xp?: number;
  minutes?: number;
  lessons?: number;
  exercises?: number;
  words?: number;
}

export interface ActivityResult {
  xpGained: number;
  streak: number;
  goalReached: boolean;
  unlocked: string[];
}

export interface MistakeInput {
  exercise: Exercise;
  source: MistakeSource;
  refId: string;
  title: string;
  languageId: string;
}

/** A mistake leaves the notebook after this many consecutive correct answers. */
export const MISTAKE_CLEAR_STREAK = 2;

/** Server answer of every call that records activity (streak, XP, goal, achievements). */
interface ActivityResponse extends ActivityResult {
  usedFreezes: number;
  freezeEarned: boolean;
  day: string;
  profile: UserProfile;
}

const EMPTY: ActivityResult = { xpGained: 0, streak: 0, goalReached: false, unlocked: [] };

/**
 * All learner progress goes through the backend, which applies the gamification rules
 * (XP caps, streaks, freezes, achievements) atomically; this service mirrors the results
 * into the UI (profile signal, today's stats, reward toasts).
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly yearStats = signal<YearStats | null>(null);
  private statsYear = '';

  /* ------------------------------ activity ------------------------------ */

  async loadYear(year = String(new Date().getFullYear())): Promise<YearStats> {
    if (this.statsYear === year && this.yearStats()) return this.yearStats()!;
    const data = await this.api.get<YearStats>(`/me/stats/${seg(year)}`);
    this.statsYear = year;
    this.yearStats.set(data ?? { days: {} });
    return this.yearStats()!;
  }

  async today(): Promise<DayStat> {
    const stats = await this.loadYear();
    return stats.days[dateKey()] ?? { m: 0, xp: 0, l: 0, e: 0 };
  }

  async recordActivity(input: ActivityInput): Promise<ActivityResult> {
    if (!this.auth.profile()) return EMPTY;
    const res = await this.api.post<ActivityResponse>('/me/activity', input);
    return this.apply(res, input);
  }

  logAttempt(a: Omit<Attempt, 'createdAt'>): Promise<unknown> {
    return this.api.post('/me/attempts', a);
  }

  recentAttempts(n = 20): Promise<Attempt[]> {
    return this.api.get<Attempt[]>('/me/attempts', { limit: n });
  }

  /* ------------------------------ courses ------------------------------ */

  async courseProgress(courseId: string): Promise<CourseProgress | null> {
    return (await this.api.get<CourseProgress | null>(`/me/courses/${seg(courseId)}`)) ?? null;
  }

  allCourseProgress(): Promise<CourseProgress[]> {
    return this.api.get<CourseProgress[]>('/me/courses');
  }

  async completeLesson(opts: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    totalLessons: number;
    correct: number;
    total: number;
    minutes: number;
    vocab: VocabItem[];
    languageId: string;
  }): Promise<ActivityResult & { percent: number; firstTime: boolean }> {
    const res = await this.api.post<ActivityResponse & { percent: number; firstTime: boolean }>(
      `/me/lessons/${seg(opts.lessonId)}/complete`,
      { correct: opts.correct, total: opts.total, minutes: opts.minutes, title: opts.lessonTitle },
    );
    const result = this.apply(res, { minutes: opts.minutes, lessons: res.firstTime ? 1 : 0, exercises: opts.total });
    return { ...result, percent: res.percent, firstTime: res.firstTime };
  }

  /* ------------------------------ vocabulary / SRS ------------------------------ */

  /** Adds words to the learner's deck (skipping existing ones). Returns how many were new. */
  async addWords(items: VocabItem[], _languageId: string, status: VocabStatus = 'learning'): Promise<number> {
    if (!items.length) return 0;
    if (status !== 'learning') {
      let added = 0;
      for (const v of items) if (await this.addOne(v.id, status)) added++;
      return added;
    }
    const res = await this.api.post<{ added: number; activity?: ActivityResponse }>('/me/vocab', { vocabIds: items.map((v) => v.id) });
    if (res.activity) this.apply(res.activity, { words: res.added });
    return res.added;
  }

  async addWord(item: VocabItem, _languageId: string, status: VocabStatus): Promise<void> {
    await this.addOne(item.id, status);
  }

  async setWordStatus(vocabId: string, status: VocabStatus): Promise<void> {
    await this.api.put(`/me/vocab/${seg(vocabId)}/status`, { status });
  }

  gradeWord(word: UserVocab, grade: Grade): Promise<UserVocab> {
    return this.api.post<UserVocab>(`/me/vocab/${seg(word.vocabId)}/review`, { grade });
  }

  dueWords(languageId: string, max = 30): Promise<UserVocab[]> {
    return this.api.get<UserVocab[]>('/me/vocab/due', { languageId, limit: max });
  }

  async myWord(vocabId: string): Promise<UserVocab | null> {
    return (await this.api.get<UserVocab | null>(`/me/vocab/${seg(vocabId)}`)) ?? null;
  }

  myWords(languageId: string, status?: VocabStatus, max = 300): Promise<UserVocab[]> {
    return this.api.get<UserVocab[]>('/me/vocab', { languageId, status, limit: max });
  }

  private async addOne(vocabId: string, status: VocabStatus): Promise<boolean> {
    const res = await this.api.post<{ added: boolean; activity?: ActivityResponse }>('/me/vocab', { vocabId, status });
    if (res.activity) this.apply(res.activity, { words: 1 });
    return res.added;
  }

  /* ------------------------------ mistakes notebook ------------------------------ */

  /** Saves wrong answers (same question = same entry, so repeats bump the counter). */
  async recordMistakes(items: MistakeInput[]): Promise<void> {
    if (!items.length) return;
    await this.api.post(
      '/me/mistakes',
      items.slice(0, 100).map((it) => ({
        languageId: it.languageId,
        source: it.source,
        refId: it.refId.slice(0, 200),
        title: it.title.slice(0, 200),
        exercise: JSON.parse(JSON.stringify(toStorable(it.exercise))),
      })),
    );
  }

  recordMistake(item: MistakeInput): Promise<void> {
    return this.recordMistakes([item]);
  }

  async mistakes(languageId: string, max = 200): Promise<Mistake[]> {
    const list = await this.api.get<Mistake[]>('/me/mistakes', { languageId, limit: max });
    return list.map((m) => ({ ...m, exercise: normalizeExercise(m.exercise) }));
  }

  async mistakeCount(languageId: string): Promise<number> {
    return (await this.api.get<{ count: number }>('/me/mistakes/count', { languageId })).count;
  }

  /** Returns true when the mistake was cleared from the notebook. */
  async resolveMistake(m: Mistake, correct: boolean): Promise<boolean> {
    return (await this.api.post<{ cleared: boolean }>(`/me/mistakes/${seg(m.id)}/resolve`, { correct })).cleared;
  }

  deleteMistake(id: string): Promise<void> {
    return this.api.delete(`/me/mistakes/${seg(id)}`);
  }

  /* ------------------------------ leaderboard ------------------------------ */

  leaderboard(wk?: string, n = 50): Promise<LeaderboardEntry[]> {
    return this.api.get<LeaderboardEntry[]>('/leaderboard', { week: wk, limit: n });
  }

  /* ------------------------------ helpers ------------------------------ */

  private apply(res: ActivityResponse, input: ActivityInput): ActivityResult {
    this.auth.setProfile(res.profile);
    const day = res.day || dateKey();
    if (this.statsYear === day.slice(0, 4)) {
      this.yearStats.update((s) => {
        const days = { ...(s?.days ?? {}) };
        const d = days[day] ?? { m: 0, xp: 0, l: 0, e: 0 };
        days[day] = {
          m: Math.round((d.m + Math.max(0, input.minutes ?? 0)) * 10) / 10,
          xp: d.xp + res.xpGained,
          l: d.l + (input.lessons ?? 0),
          e: d.e + (input.exercises ?? 0),
        };
        return { days };
      });
    }

    if (res.usedFreezes) this.toast.info(this.i18n.t('toast.freezeUsed', { n: res.usedFreezes }));
    if (res.freezeEarned) this.toast.reward(this.i18n.t('toast.freezeEarned'));
    if (res.goalReached) this.toast.reward(this.i18n.t('toast.goalReached', { xp: XP.dailyGoal }));
    for (const id of res.unlocked ?? []) {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) this.toast.reward(`${a.icon} ${this.i18n.t('toast.achievement')}: ${this.i18n.l(a.title)}`);
    }
    return { xpGained: res.xpGained, streak: res.streak, goalReached: res.goalReached, unlocked: res.unlocked ?? [] };
  }
}
