import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Api, seg } from './api';
import { Certificate, Course, CourseOutline, Exam, Exercise, Language, Lesson, Page, Vocabulary } from './models';

const HOUR = 3_600_000;
const CACHE_PREFIX = 'lingora.c.';
const CACHE_VERSION = 6;

interface CacheEntry<T> {
  v: number;
  at: number;
  data: T;
}

/**
 * Read-only access to learning content. Content changes rarely and is read by every
 * learner, so catalog data is cached in memory + localStorage (stale-while-revalidate)
 * on top of the HTTP caching headers sent by the backend.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly api = inject(Api);
  private readonly memory = new Map<string, Promise<unknown>>();

  languages(): Promise<Language[]> {
    return this.cached('languages', 6 * HOUR, () => this.api.get<Language[]>('/content/languages'));
  }

  certificates(): Promise<Certificate[]> {
    return this.cached('certificates', 6 * HOUR, () => this.api.get<Certificate[]>('/content/certificates'));
  }

  async certificate(id: string): Promise<Certificate | undefined> {
    return (await this.certificates()).find((c) => c.id === id);
  }

  courses(): Promise<Course[]> {
    return this.cached('courses', HOUR, () => this.api.get<Course[]>('/content/courses'));
  }

  async course(id: string): Promise<Course | undefined> {
    const found = (await this.courses()).find((c) => c.id === id);
    return found ?? orUndefined(this.api.get<Course>(`/content/courses/${seg(id)}`));
  }

  outline(courseId: string): Promise<CourseOutline | undefined> {
    return this.cached(`outline.${courseId}`, HOUR, () => orUndefined(this.api.get<CourseOutline>(`/content/outlines/${seg(courseId)}`)));
  }

  lesson(id: string): Promise<Lesson | undefined> {
    return this.cached(
      `lesson.${id}`,
      HOUR,
      async () => {
        const l = await orUndefined(this.api.get<Lesson>(`/content/lessons/${seg(id)}`));
        return l ? normalizeLesson(l) : undefined;
      },
      false,
    );
  }

  exams(certificateId: string): Promise<Exam[]> {
    return this.cached(
      `exams.${certificateId}`,
      HOUR,
      async () => (await this.api.get<Exam[]>('/content/exams', { certificateId })).map(normalizeExam),
      false,
    );
  }

  exam(id: string): Promise<Exam | undefined> {
    return this.cached(
      `exam.${id}`,
      HOUR,
      async () => {
        const e = await orUndefined(this.api.get<Exam>(`/content/exams/${seg(id)}`));
        return e ? normalizeExam(e) : undefined;
      },
      false,
    );
  }

  /** Paginated vocabulary search; `cursor` is the next page number returned by the previous call. */
  async vocabPage(opts: {
    languageId: string;
    level?: string;
    keyword?: string;
    pageSize?: number;
    cursor?: unknown;
  }): Promise<Page<Vocabulary>> {
    const page = typeof opts.cursor === 'number' ? opts.cursor : 0;
    const res = await this.api.get<{ items: Vocabulary[]; page: number; hasMore: boolean }>('/content/vocab', {
      languageId: opts.languageId,
      level: opts.level,
      keyword: opts.keyword?.trim().toLowerCase(),
      page,
      size: opts.pageSize ?? 30,
    });
    return { items: res.items, cursor: res.hasMore ? res.page + 1 : null, hasMore: res.hasMore };
  }

  vocab(id: string): Promise<Vocabulary | undefined> {
    return this.cached(`vocab.${id}`, 6 * HOUR, () => orUndefined(this.api.get<Vocabulary>(`/content/vocab/${seg(id)}`)), false);
  }

  /** A pool of words for games / daily challenge; cached because it's read often. */
  vocabPool(languageId: string, level?: string): Promise<Vocabulary[]> {
    return this.cached(`pool.${languageId}.${level ?? 'all'}`, 6 * HOUR, () =>
      this.api.get<Vocabulary[]>('/content/vocab/pool', { languageId, level }),
    );
  }

  /**
   * Dictionary lookup for tap-to-translate: the first candidate (e.g. surface form, then
   * base forms) that exists in the vocabulary. Checks the cached pool first.
   */
  async lookup(languageId: string, candidates: string[]): Promise<Vocabulary | null> {
    const list = [...new Set(candidates.map((c) => c.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
    if (!list.length) return null;
    const pool = await this.vocabPool(languageId).catch(() => [] as Vocabulary[]);
    const local = list.map((w) => pool.find((v) => v.wordLc === w || v.reading === w)).find(Boolean);
    if (local) return local;
    return this.cached(
      `lookup.${languageId}.${list.join('|')}`,
      6 * HOUR,
      async () => (await orUndefined(this.api.get<Vocabulary>('/content/vocab/lookup', { languageId, words: list.join(',') }))) ?? null,
      false,
    );
  }

  invalidate(prefix = ''): void {
    for (const k of [...this.memory.keys()]) if (k.startsWith(prefix)) this.memory.delete(k);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX + prefix)) localStorage.removeItem(k);
    }
  }

  private cached<T>(key: string, ttl: number, loader: () => Promise<T>, persist = true): Promise<T> {
    const hit = this.memory.get(key) as Promise<T> | undefined;
    if (hit) return hit;

    if (persist) {
      const stored = readStore<T>(key);
      if (stored) {
        const fresh = Date.now() - stored.at < ttl;
        const p = Promise.resolve(stored.data);
        this.memory.set(key, p);
        if (!fresh) this.refresh(key, loader, persist);
        return p;
      }
    }
    return this.refresh(key, loader, persist);
  }

  private refresh<T>(key: string, loader: () => Promise<T>, persist: boolean): Promise<T> {
    const p = loader().then(
      (data) => {
        if (persist) writeStore(key, data);
        return data;
      },
      (err) => {
        this.memory.delete(key);
        throw err;
      },
    );
    this.memory.set(key, p);
    return p;
  }
}

/** 404 → undefined; other errors propagate. */
async function orUndefined<T>(p: Promise<T>): Promise<T | undefined> {
  try {
    return (await p) ?? undefined;
  } catch (e) {
    if (e instanceof HttpErrorResponse && e.status === 404) return undefined;
    throw e;
  }
}

/** Matching pairs may be stored as `{ a, b }` maps (legacy import format) or `[a, b]` tuples. */
type StoredPair = { a: string; b: string } | [string, string];

/** Deeply converts `pairs: [a, b][]` into `{ a, b }[]` (the format accepted by the content API). */
export function toStorable<T>(value: T): T {
  if (Array.isArray(value)) return value.map(toStorable) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] =
        k === 'pairs' && Array.isArray(v) && v.every(Array.isArray)
          ? (v as [string, string][]).map(([a, b]) => ({ a, b }))
          : toStorable(v);
    }
    return out as T;
  }
  return value;
}

export function normalizeExercise(ex: Exercise): Exercise {
  const pairs = ex.pairs as StoredPair[] | undefined;
  if (!pairs?.length) return ex;
  return { ...ex, pairs: pairs.map((p) => (Array.isArray(p) ? p : ([p.a, p.b] as [string, string]))) };
}

function normalizeLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    contents: (lesson.contents ?? []).map((c) => {
      if (c.type === 'EXERCISE') return { ...c, exercises: c.exercises.map(normalizeExercise) };
      if (c.type === 'READING' || c.type === 'LISTENING') return { ...c, questions: c.questions.map(normalizeExercise) };
      return c;
    }),
  };
}

function normalizeExam(exam: Exam): Exam {
  return { ...exam, sections: (exam.sections ?? []).map((s) => ({ ...s, questions: s.questions.map(normalizeExercise) })) };
}

function readStore<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry.v === CACHE_VERSION ? entry : null;
  } catch {
    return null;
  }
}

function writeStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: CACHE_VERSION, at: Date.now(), data }));
  } catch {
    // Quota exceeded: memory cache still works.
  }
}
