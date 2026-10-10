import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { CheckResult } from '../../core/exercise-check';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { TARGETS, TargetLang } from '../../core/learn-context.service';
import { Exercise, Lesson, LessonContent, LessonSummary, VocabItem, VocabStatus } from '../../core/models';
import { ActivityResult, ProgressService } from '../../core/progress.service';
import { Session, SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { EmptyComponent, MedalComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';
import {
  GrammarBlockComponent,
  ListeningBlockComponent,
  ReadingBlockComponent,
  SpeakingBlockComponent,
  VideoBlockComponent,
  VocabBlockComponent,
} from './content-blocks';
import { ExerciseComponent } from './exercise.component';

type Step =
  | { kind: 'content'; content: LessonContent; title: string }
  | { kind: 'exercise'; exercise: Exercise; retry: boolean; key: string };

@Component({
  selector: 'app-lesson-player',
  imports: [
    RouterLink,
    IconComponent,
    ProgressBarComponent,
    SpinnerComponent,
    EmptyComponent,
    MedalComponent,
    ExerciseComponent,
    VocabBlockComponent,
    GrammarBlockComponent,
    ReadingBlockComponent,
    ListeningBlockComponent,
    SpeakingBlockComponent,
    VideoBlockComponent,
    ...I18N_PIPES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (lesson(); as l) {
      <div class="flex min-h-dvh flex-col">
        <header class="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur" style="padding-top: env(safe-area-inset-top)">
          <div class="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
            <button class="btn-ghost !px-2" (click)="exit()" [attr.aria-label]="'common.close' | t"><app-icon name="close" /></button>
            <app-progress-bar class="flex-1" [value]="percent()" [label]="'lesson.progress' | t" />
            <span class="chip"><app-icon name="clock" [size]="14" /> {{ elapsedLabel() }}</span>
          </div>
        </header>

        <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          @if (resumeOffer(); as r) {
            <section class="animate-pop card mx-auto max-w-md p-6 text-center" role="dialog" aria-modal="false" aria-labelledby="resume-title">
              <app-medal icon="book" tone="primary" [size]="72" />
              <h1 id="resume-title" class="mt-3 font-display text-xl font-black">{{ 'resume.title' | t }}</h1>
              <p class="mt-2 text-muted">{{ 'resume.lessonAt' | t: { n: r.state.index + 1, total: steps().length } }}</p>
              <app-progress-bar class="mt-4 block" [value]="(r.state.index / Math.max(1, steps().length)) * 100" [label]="'lesson.progress' | t" />
              <div class="mt-6 grid gap-3">
                <button class="btn-primary" (click)="resume()">{{ 'resume.continue' | t }}</button>
                <button class="btn-outline" (click)="startOver()">{{ 'resume.startOver' | t }}</button>
              </div>
            </section>
          } @else if (finished()) {
            <section class="animate-pop mx-auto max-w-md text-center">
              <app-medal [icon]="score() >= 80 ? 'trophy' : score() >= 50 ? 'star' : 'zap'" [tone]="score() >= 80 ? 'gold' : score() >= 50 ? 'primary' : 'accent'" [size]="96" />
              <h1 class="page-title mt-3">{{ 'lesson.complete' | t }}</h1>
              <p class="mt-1 text-muted">{{ l.title | loc }}</p>
              <div class="mt-6 grid grid-cols-3 gap-3">
                <div class="card p-3"><p class="font-display text-2xl font-black text-primary">{{ score() }}%</p><p class="text-xs text-muted">{{ 'lesson.accuracy' | t }}</p></div>
                <div class="card p-3"><p class="font-display text-2xl font-black text-warning">+{{ result()?.xpGained ?? 0 }}</p><p class="text-xs text-muted">XP</p></div>
                <div class="card p-3"><p class="flex items-center justify-center gap-1 font-display text-2xl font-black text-accent">{{ result()?.streak ?? 0 }} <app-icon name="flame" [size]="22" class="animate-flicker" /></p><p class="text-xs text-muted">{{ 'stats.streak' | t }}</p></div>
              </div>
              <p class="mt-4 text-sm text-muted">{{ 'lesson.timeSpent' | t }}: {{ elapsedLabel() }} · {{ correct() }}/{{ scored() }} {{ 'lesson.correct' | t }}</p>
              <div class="mt-8 grid gap-3">
                @if (nextLesson(); as n) {
                  <a [routerLink]="['/lessons', n.id]" class="btn-primary">{{ 'lesson.next' | t }}: {{ n.title | loc }}</a>
                }
                <button class="btn-outline" (click)="restart()">{{ 'lesson.retry' | t }}</button>
                <a [routerLink]="['/courses', l.courseId]" class="btn-ghost">{{ 'lesson.backToCourse' | t }}</a>
              </div>
            </section>
          } @else if (step(); as current) {
            @for (s of [current]; track s) {
            @if (s.kind === 'content') {
              <h1 class="mb-1 text-sm font-bold uppercase tracking-wide text-primary">{{ 'content.' + s.content.type | t }}</h1>
              <h2 class="mb-5 font-display text-2xl font-black">{{ s.title }}</h2>
              @switch (s.content.type) {
                @case ('VOCABULARY') { <app-vocab-block [content]="$any(s.content)" [speechLang]="speechLang()" (marked)="onMark($event)" (finished)="advance()" /> }
                @case ('GRAMMAR') { <app-grammar-block [content]="$any(s.content)" [speechLang]="speechLang()" (finished)="advance()" /> }
                @case ('READING') { <app-reading-block [content]="$any(s.content)" [speechLang]="speechLang()" (finished)="advance()" /> }
                @case ('LISTENING') { <app-listening-block [content]="$any(s.content)" [speechLang]="speechLang()" (finished)="advance()" /> }
                @case ('SPEAKING') { <app-speaking-block [content]="$any(s.content)" [speechLang]="speechLang()" (finished)="advance()" /> }
                @case ('VIDEO') { <app-video-block [content]="$any(s.content)" (finished)="advance()" /> }
              }
            } @else {
              @if (s.retry) { <p class="chip-warning mb-3"><app-icon name="refresh" [size]="12" /> {{ 'lesson.retryMistake' | t }}</p> }
              <app-exercise [exercise]="s.exercise" [speechLang]="speechLang()" (done)="onAnswer(s, $event)" />
            }
            }
          }
        </main>
      </div>
    } @else {
      <app-empty icon="book" [text]="'lesson.notFound' | t"><a routerLink="/courses" class="btn-primary">{{ 'courses.title' | t }}</a></app-empty>
    }
  `,
})
export class LessonPlayerPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly sessions = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly lesson = signal<Lesson | undefined>(undefined);
  protected readonly steps = signal<Step[]>([]);
  protected readonly index = signal(0);
  protected readonly finished = signal(false);
  protected readonly correct = signal(0);
  protected readonly scored = signal(0);
  protected readonly result = signal<ActivityResult | null>(null);
  protected readonly nextLesson = signal<LessonSummary | null>(null);
  protected readonly seconds = signal(0);
  protected readonly resumeOffer = signal<Session<LessonState> | null>(null);
  protected readonly Math = Math;
  private totalLessons = 0;
  private saved = false;
  private retried = new Set<string>();
  /** Study seconds already reported to the server (time is reported when leaving mid-lesson). */
  private reported = 0;

  protected readonly step = computed(() => this.steps()[this.index()]);
  protected readonly percent = computed(() => (this.finished() ? 100 : (this.index() / Math.max(1, this.steps().length)) * 100));
  protected readonly score = computed(() => (this.scored() ? Math.round((this.correct() / this.scored()) * 100) : 100));
  protected readonly speechLang = computed(() => TARGETS[(this.lesson()?.languageId as TargetLang) ?? 'en']?.speech ?? 'en-US');
  protected readonly elapsedLabel = computed(() => {
    const s = this.seconds();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  constructor() {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !this.finished() && !this.resumeOffer() && this.lesson()) {
        this.seconds.update((s) => s + 1);
        if (this.seconds() % 15 === 0) this.persist();
      }
    }, 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      const l = this.lesson();
      if (!l || this.saved || this.resumeOffer()) return;
      // Count study time even when the learner leaves before finishing.
      const unreported = this.seconds() - this.reported;
      if (unreported >= 60) {
        this.progress.recordActivity({ minutes: unreported / 60 }).catch(() => undefined);
        this.reported = this.seconds();
      }
      this.persist();
      this.sessions.flush('lesson', l.id);
    });
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.reset();
    try {
      const lesson = await this.content.lesson(id);
      this.lesson.set(lesson);
      if (!lesson) return;
      this.steps.set(buildSteps(lesson, this.i18n));
      const [outline, saved] = await Promise.all([
        this.content.outline(lesson.courseId),
        this.sessions.get<LessonState>('lesson', lesson.id).catch(() => null),
      ]);
      const all = outline?.units.flatMap((u) => u.lessons) ?? [];
      this.totalLessons = all.length;
      const i = all.findIndex((x) => x.id === lesson.id);
      this.nextLesson.set(i >= 0 ? (all[i + 1] ?? null) : null);
      if (saved && isValidState(saved.state, this.steps().length) && saved.state.index > 0) this.resumeOffer.set(saved);
    } finally {
      this.loading.set(false);
    }
  }

  private reset(): void {
    this.index.set(0);
    this.finished.set(false);
    this.correct.set(0);
    this.scored.set(0);
    this.result.set(null);
    this.seconds.set(0);
    this.resumeOffer.set(null);
    this.saved = false;
    this.reported = 0;
    this.retried.clear();
  }

  protected restart(): void {
    const l = this.lesson();
    this.reset();
    if (l) {
      this.steps.set(buildSteps(l, this.i18n));
      this.sessions.clear('lesson', l.id);
    }
  }

  /** Continues where the learner stopped last time (possibly on another device). */
  protected resume(): void {
    const offer = this.resumeOffer();
    const l = this.lesson();
    if (!offer || !l) return;
    const st = offer.state;
    const base = buildSteps(l, this.i18n);
    const retries = st.retried
      .map((key) => base.find((s) => s.kind === 'exercise' && s.key === key))
      .filter((s): s is Step & { kind: 'exercise' } => !!s)
      .map((s) => ({ ...s, retry: true }));
    this.steps.set([...base, ...retries]);
    this.retried = new Set(st.retried);
    this.index.set(Math.min(st.index, this.steps().length - 1));
    this.correct.set(st.correct);
    this.scored.set(st.scored);
    this.seconds.set(st.seconds);
    this.reported = st.reported;
    this.resumeOffer.set(null);
  }

  protected startOver(): void {
    this.restart();
  }

  protected advance(): void {
    if (this.index() + 1 >= this.steps().length) this.finish();
    else {
      this.index.update((i) => i + 1);
      this.persist();
    }
    window.scrollTo({ top: 0 });
  }

  /** Saves the current position so the lesson can be resumed later. */
  private persist(): void {
    const l = this.lesson();
    if (!l || this.finished() || this.resumeOffer() || this.index() === 0) return;
    this.sessions.save<LessonState>('lesson', l.id, {
      courseId: l.courseId,
      languageId: l.languageId,
      title: this.i18n.l(l.title).slice(0, 200),
      position: this.index(),
      total: this.steps().length,
      state: {
        index: this.index(),
        correct: this.correct(),
        scored: this.scored(),
        seconds: this.seconds(),
        reported: this.reported,
        retried: [...this.retried],
      },
    });
  }

  protected onAnswer(s: Step & { kind: 'exercise' }, r: CheckResult): void {
    if (!s.retry) {
      this.scored.update((n) => n + 1);
      if (r.correct) this.correct.update((n) => n + 1);
    }
    if (!r.correct && !s.retry) {
      const l = this.lesson()!;
      this.progress
        .recordMistake({ exercise: s.exercise, source: 'lesson', refId: l.id, title: this.i18n.l(l.title), languageId: l.languageId })
        .catch(() => undefined);
    }
    // Wrong answers come back once at the end of the lesson for a second (unscored) try.
    if (!r.correct && !s.retry && !this.retried.has(s.key)) {
      this.retried.add(s.key);
      this.steps.update((st) => [...st, { ...s, retry: true }]);
    }
    this.advance();
  }

  protected async onMark(e: { item: VocabItem; status: VocabStatus }): Promise<void> {
    try {
      await this.progress.addWord(e.item, this.lesson()!.languageId, e.status);
      this.toast.success(this.i18n.t('vocab.saved'));
    } catch {
      this.toast.error(this.i18n.t('common.error'));
    }
  }

  protected exit(): void {
    const l = this.lesson();
    this.router.navigate(l ? ['/courses', l.courseId] : ['/courses']);
  }

  private async finish(): Promise<void> {
    this.finished.set(true);
    playSfx('finish');
    if (this.score() >= 80) confetti();
    const l = this.lesson()!;
    const vocab = l.contents.flatMap((c) => (c.type === 'VOCABULARY' ? c.items : []));
    try {
      this.saved = true;
      const r = await this.progress.completeLesson({
        courseId: l.courseId,
        lessonId: l.id,
        lessonTitle: this.i18n.l(l.title),
        totalLessons: this.totalLessons || 1,
        correct: this.correct(),
        total: this.scored(),
        minutes: Math.max((this.seconds() - this.reported) / 60, 0.5),
        vocab,
        languageId: l.languageId,
      });
      this.result.set(r);
      this.sessions.clear('lesson', l.id);
    } catch (e) {
      this.saved = false;
      console.error(e);
      this.toast.error(this.i18n.t('lesson.saveFailed'));
    }
  }
}

/** What is saved to resume a lesson (steps are rebuilt from the lesson itself). */
interface LessonState {
  index: number;
  correct: number;
  scored: number;
  seconds: number;
  reported: number;
  /** Keys of the exercises answered wrong, in the order their retry steps were appended. */
  retried: string[];
}

function isValidState(s: LessonState | null | undefined, baseSteps: number): s is LessonState {
  if (!s || typeof s !== 'object') return false;
  const nums = [s.index, s.correct, s.scored, s.seconds, s.reported ?? 0];
  if (!nums.every((n) => Number.isFinite(n) && n >= 0)) return false;
  if (!Array.isArray(s.retried) || s.retried.some((k) => typeof k !== 'string')) return false;
  s.reported ??= 0;
  return s.index < baseSteps + s.retried.length && s.correct <= s.scored;
}

function buildSteps(lesson: Lesson, i18n: I18nService): Step[] {
  const steps: Step[] = [];
  lesson.contents.forEach((c, ci) => {
    const title = i18n.l(c.title);
    if (c.type === 'EXERCISE') {
      c.exercises.forEach((ex, i) => steps.push({ kind: 'exercise', exercise: ex, retry: false, key: `${ci}-${i}` }));
      return;
    }
    steps.push({ kind: 'content', content: c, title });
    if (c.type === 'READING' || c.type === 'LISTENING') {
      c.questions.forEach((ex, i) => steps.push({ kind: 'exercise', exercise: ex, retry: false, key: `${ci}-${i}` }));
    }
  });
  return steps;
}
