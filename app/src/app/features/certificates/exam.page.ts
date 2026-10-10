import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { UserAnswer, checkAnswer, expectedDisplay } from '../../core/exercise-check';
import { XP } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { DialogService } from '../../core/dialog.service';
import { I18nService } from '../../core/i18n.service';
import { TARGETS, TargetLang } from '../../core/learn-context.service';
import { SkillKind, aggregateSkills, estimateScore, weakestSkills } from '../../core/exam-score';
import { Certificate, Exam, Exercise } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { Session, SessionService } from '../../core/session.service';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, MedalComponent, SpinnerComponent } from '../../shared/ui';
import { ExerciseComponent } from '../lesson/exercise.component';

interface SectionResult {
  title: string;
  kind: SkillKind;
  correct: number;
  total: number;
}

@Component({
  selector: 'app-exam',
  imports: [RouterLink, IconComponent, SpinnerComponent, EmptyComponent, MedalComponent, ExerciseComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (exam(); as e) {
      <div class="min-h-dvh">
        <header class="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div class="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
            <a [routerLink]="['/certificates', e.certificateId]" class="btn-ghost !px-2" [attr.aria-label]="'common.close' | t"><app-icon name="close" /></a>
            <p class="flex-1 truncate font-bold">{{ e.title | loc }}</p>
            @if (phase() === 'running') {
              <span class="!text-base font-mono" [class]="left() < 120 ? 'chip-danger animate-pulse' : 'chip'"><app-icon name="timer" [size]="16" /> {{ clock() }}</span>
            }
          </div>
        </header>
        <main class="mx-auto max-w-4xl px-4 py-6">
          @switch (phase()) {
            @case ('intro') {
              <div class="card mx-auto max-w-lg p-6 text-center">
                <app-medal icon="file" tone="primary" [size]="72" />
                <h1 class="page-title mt-3">{{ e.title | loc }}</h1>
                <div class="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div class="rounded-xl bg-surface-2 p-3"><p class="font-display text-xl font-black">{{ e.questionCount }}</p>{{ 'certs.questions' | t }}</div>
                  <div class="rounded-xl bg-surface-2 p-3"><p class="font-display text-xl font-black">{{ e.durationMinutes }}</p>{{ 'common.min' | t }}</div>
                  <div class="rounded-xl bg-surface-2 p-3"><p class="font-display text-xl font-black">{{ e.passPercent }}%</p>{{ 'exam.pass' | t }}</div>
                </div>
                <ul class="mt-5 space-y-1 text-left text-sm text-muted">
                  <li>• {{ 'exam.rule1' | t }}</li><li>• {{ 'exam.rule2' | t }}</li><li>• {{ 'exam.rule3' | t }}</li>
                </ul>
                @if (saved(); as sv) {
                  <p class="mt-5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                    {{ 'resume.examAt' | t: { n: sv.position, total: sv.total, min: savedMinutesLeft() } }}
                  </p>
                }
                <button class="btn-primary mt-6 w-full" (click)="start()">{{ (hasSaved() ? 'exam.resume' : 'exam.start') | t }}</button>
                @if (hasSaved()) {
                  <button class="btn-ghost mt-2 w-full" (click)="discard()">{{ 'resume.startOver' | t }}</button>
                }
              </div>
            }
            @case ('running') {
              <div class="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                @for (s of e.sections; track $index; let i = $index) {
                  <button class="chip-toggle shrink-0 !min-h-10 !px-4" [attr.aria-pressed]="section() === i" (click)="section.set(i)">
                    {{ s.title | loc }} ({{ answeredIn(i) }}/{{ s.questions.length }})
                  </button>
                }
              </div>
              @let s = e.sections[section()];
              @if (s.passage) {
                <article class="card mb-5 p-5"><p class="whitespace-pre-line text-lg leading-loose" [class.jp]="jp()">{{ s.passage }}</p></article>
              }
              @for (q of s.questions; track q.id; let qi = $index) {
                <div class="card mb-4 p-5" [id]="'q-' + q.id">
                  <p class="mb-3 text-sm font-bold text-primary">{{ 'exam.question' | t }} {{ number(section(), qi) }}</p>
                  <app-exercise [exercise]="q" mode="exam" [speechLang]="speechLang()" [initial]="answers()[q.id] ?? null" (answerChange)="setAnswer(q.id, $event)" />
                </div>
              }
              <div class="mt-6 flex flex-wrap justify-between gap-3">
                <button class="btn-outline" [disabled]="section() === 0" (click)="go(-1)"><app-icon name="chevronLeft" /> {{ 'common.back' | t }}</button>
                @if (section() < e.sections.length - 1) {
                  <button class="btn-primary" (click)="go(1)">{{ 'common.next' | t }} <app-icon name="chevronRight" /></button>
                } @else {
                  <button class="btn-primary" (click)="submit()">{{ 'exam.submit' | t }} ({{ answeredCount() }}/{{ e.questionCount }})</button>
                }
              </div>
            }
            @case ('result') {
              <div class="card animate-pop mx-auto max-w-lg p-6 text-center">
                <p class="text-5xl">{{ passed() ? '🎓' : '📚' }}</p>
                <h1 class="page-title mt-2">{{ (passed() ? 'exam.passed' : 'exam.failed') | t }}</h1>
                <p class="mt-2 font-display text-5xl font-black" [class]="passed() ? 'text-success' : 'text-error'">{{ percent() }}%</p>
                <p class="text-muted">{{ totalCorrect() }}/{{ e.questionCount }} · {{ 'exam.pass' | t }} {{ e.passPercent }}%</p>
                @if (estimate(); as est) {
                  <div class="mt-5 rounded-2xl bg-primary-soft p-4 text-left">
                    <p class="text-xs font-bold uppercase tracking-wide text-primary">{{ 'examScore.estimated' | t }} · {{ est.scaleKey | t }}</p>
                    <p class="mt-1 font-display text-3xl font-black text-primary">{{ est.total }} <span class="text-base font-bold text-muted">/ {{ est.max }}</span>
                      @if (est.grade) { <span class="chip-primary ml-1 align-middle">{{ est.grade }}</span> }
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      @for (p of est.parts; track p.key) { <span class="chip !bg-surface">{{ p.key | t }}: <b class="text-fg">{{ p.value }}</b>/{{ p.max }}</span> }
                    </div>
                    @if (est.noteKey) { <p class="mt-2 text-xs text-muted">{{ est.noteKey | t }}</p> }
                  </div>
                }
                <ul class="mt-5 space-y-2 text-left">
                  @for (s of skills(); track s.kind; let first = $first) {
                    <li class="rounded-xl bg-surface-2 px-3 py-2 text-sm">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold">{{ 'examScore.skill.' + s.kind | t }} @if (first && s.percent < 80) { <span class="chip-warning ml-1"><app-icon name="target" [size]="12" /> {{ 'examScore.weakest' | t }}</span> }</span>
                        <span>{{ s.correct }}/{{ s.total }} · {{ s.percent }}%</span>
                      </div>
                      <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface"><div class="h-full rounded-full" [class]="s.percent >= 80 ? 'bg-success' : s.percent >= 50 ? 'bg-warning' : 'bg-error'" [style.width.%]="s.percent"></div></div>
                      @if (first && s.percent < 80) {
                        <a [routerLink]="skillLink[s.kind]" class="mt-2 inline-block text-xs font-semibold text-primary">{{ 'examScore.improve.' + s.kind | t }} →</a>
                      }
                    </li>
                  }
                </ul>
                @if (mistakesSaved()) {
                  <a routerLink="/mistakes" class="btn-soft mt-3 w-full text-sm"><app-icon name="bookmark" [size]="16" /> {{ 'examScore.mistakesSaved' | t: { n: mistakesSaved() } }}</a>
                }
                <div class="mt-6 grid gap-2">
                  <button class="btn-outline" (click)="showReview.set(!showReview())">{{ 'exam.review' | t }}</button>
                  <button class="btn-primary" (click)="restart()">{{ 'exam.retake' | t }}</button>
                  <a [routerLink]="['/certificates', e.certificateId]" class="btn-ghost">{{ 'common.back' | t }}</a>
                </div>
              </div>
              @if (showReview()) {
                <div class="mx-auto mt-6 max-w-2xl space-y-3">
                  @for (item of review(); track item.q.id) {
                    <div class="card p-4" [class]="item.ok ? '!border-success/50' : '!border-error/50'">
                      <p class="text-sm font-semibold text-muted">{{ item.q.instruction | loc }}</p>
                      @if (item.q.prompt) { <p class="font-bold">{{ item.q.prompt | loc }}</p> }
                      @if (item.q.question) { <p class="font-bold" [class.jp]="jp()">{{ item.q.question }}</p> }
                      @if (item.q.audioText && !item.q.question) { <p class="flex items-center gap-1.5 font-bold" [class.jp]="jp()"><app-icon name="volume" [size]="16" class="text-primary" /> {{ item.q.audioText }}</p> }
                      <p class="mt-1 flex items-center gap-1.5 text-sm">
                        <app-icon [name]="item.ok ? 'checkCircle' : 'xCircle'" [size]="16" [class]="item.ok ? 'text-success' : 'text-error'" />
                        <span>{{ 'exercise.answerIs' | t }} <b [class.jp]="jp() && !item.q.labels?.[item.expected] && item.q.type !== 'TRUE_FALSE'">{{ item.shown }}</b></span>
                      </p>
                      @if (item.q.explanation | loc; as expl) {
                        <p class="mt-1 flex gap-1.5 text-sm text-muted"><app-icon name="lightbulb" [size]="16" class="mt-0.5 text-warning" /><span class="whitespace-pre-line">{{ expl }}</span></p>
                      }
                    </div>
                  }
                </div>
              }
            }
          }
        </main>
      </div>
    } @else {
      <app-empty icon="timer" [text]="'common.notFound' | t" />
    }
  `,
})
export class ExamPage implements OnInit {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly sessions = inject(SessionService);
  private readonly i18n = inject(I18nService);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly exam = signal<Exam | undefined>(undefined);
  protected readonly phase = signal<'intro' | 'running' | 'result'>('intro');
  protected readonly section = signal(0);
  protected readonly answers = signal<Record<string, UserAnswer>>({});
  protected readonly left = signal(0);
  protected readonly results = signal<SectionResult[]>([]);
  protected readonly review = signal<{ q: Exercise; ok: boolean; expected: string; shown: string }[]>([]);
  protected readonly showReview = signal(false);
  protected readonly certificate = signal<Certificate | undefined>(undefined);
  protected readonly mistakesSaved = signal(0);
  protected readonly skillLink: Record<SkillKind, string> = {
    vocabulary: '/vocabulary/review',
    grammar: '/mistakes',
    reading: '/courses',
    listening: '/practice/dictation',
  };
  /** Saved attempt that can be resumed (the timer pauses while the learner is away). */
  protected readonly saved = signal<Session<ExamState> | null>(null);
  /** Seconds spent in earlier visits + the time the current visit started. */
  private elapsedBefore = 0;
  private resumedAt = 0;

  protected readonly savedMinutesLeft = computed(() => {
    const s = this.saved();
    const e = this.exam();
    return s && e ? Math.max(1, Math.ceil((e.durationMinutes * 60 - s.state.elapsed) / 60)) : 0;
  });

  protected readonly skillStats = computed(() => aggregateSkills(this.results()));
  protected readonly skills = computed(() => weakestSkills(this.skillStats()));
  protected readonly estimate = computed(() => {
    const c = this.certificate();
    const e = this.exam();
    return c && e && this.results().length ? estimateScore(c.code, e.level, this.skillStats()) : null;
  });

  protected readonly speechLang = computed(() => TARGETS[(this.exam()?.languageId as TargetLang) ?? 'en'].speech);
  protected readonly jp = computed(() => this.exam()?.languageId === 'ja');
  protected readonly answeredCount = computed(() => Object.values(this.answers()).filter((a) => a != null && a !== '').length);
  protected readonly totalCorrect = computed(() => this.results().reduce((s, r) => s + r.correct, 0));
  protected readonly percent = computed(() => Math.round((this.totalCorrect() / Math.max(1, this.exam()?.questionCount ?? 1)) * 100));
  protected readonly passed = computed(() => this.percent() >= (this.exam()?.passPercent ?? 60));
  protected readonly clock = computed(() => {
    const s = Math.max(0, this.left());
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  });

  constructor() {
    let ticks = 0;
    const t = setInterval(() => {
      if (this.phase() !== 'running') return;
      this.left.set(Math.round((this.exam()?.durationMinutes ?? 0) * 60 - this.elapsed()));
      if (this.left() <= 0) this.grade();
      else if (++ticks % 15 === 0) this.persist();
    }, 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(t);
      if (this.phase() === 'running') {
        this.persist();
        this.sessions.flush('exam', this.id());
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const [exam, saved] = await Promise.all([
        this.content.exam(this.id()),
        this.sessions.get<ExamState>('exam', this.id()).catch(() => null),
      ]);
      this.exam.set(exam);
      if (exam && saved && isValidExamState(saved.state) && saved.state.elapsed < exam.durationMinutes * 60) this.saved.set(saved);
      if (exam) this.content.certificate(exam.certificateId).then((c) => this.certificate.set(c)).catch(() => undefined);
    } finally {
      this.loading.set(false);
    }
  }

  protected hasSaved(): boolean {
    return !!this.saved();
  }

  private elapsed(): number {
    return this.elapsedBefore + (Date.now() - this.resumedAt) / 1000;
  }

  protected start(): void {
    const saved = this.saved();
    const sections = this.exam()!.sections.length;
    this.elapsedBefore = saved?.state.elapsed ?? 0;
    this.answers.set(saved?.state.answers ?? {});
    this.section.set(Math.min(Math.max(0, saved?.state.section ?? 0), sections - 1));
    this.resumedAt = Date.now();
    this.left.set(Math.round(this.exam()!.durationMinutes * 60 - this.elapsed()));
    this.phase.set('running');
    this.persist();
  }

  /** Throws the saved attempt away and starts from a blank sheet. */
  protected discard(): void {
    this.sessions.clear('exam', this.id());
    this.saved.set(null);
  }

  protected restart(): void {
    this.sessions.clear('exam', this.id());
    this.saved.set(null);
    this.showReview.set(false);
    this.mistakesSaved.set(0);
    this.section.set(0);
    this.phase.set('intro');
  }

  protected setAnswer(id: string, a: UserAnswer): void {
    this.answers.update((m) => ({ ...m, [id]: a }));
    this.persist();
  }

  protected answeredIn(i: number): number {
    const a = this.answers();
    return this.exam()!.sections[i].questions.filter((q) => a[q.id] != null && a[q.id] !== '').length;
  }

  protected number(si: number, qi: number): number {
    return this.exam()!.sections.slice(0, si).reduce((n, s) => n + s.questions.length, 0) + qi + 1;
  }

  protected go(d: number): void {
    this.section.update((s) => s + d);
    this.persist();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected async submit(): Promise<void> {
    const missing = this.exam()!.questionCount - this.answeredCount();
    if (missing > 0) {
      const ok = await this.dialog.confirm({ message: this.i18n.t('exam.confirmSubmit', { n: missing }), tone: 'warning', confirmText: this.i18n.t('dialog.submit') });
      if (!ok) return;
    }
    this.grade();
  }

  private async grade(): Promise<void> {
    if (this.phase() !== 'running') return;
    const e = this.exam()!;
    const a = this.answers();
    const review: { q: Exercise; ok: boolean; expected: string; shown: string }[] = [];
    const results = e.sections.map((s) => {
      let correct = 0;
      for (const q of s.questions) {
        const r = checkAnswer(q, a[q.id] ?? null);
        if (r.correct) correct++;
        const shown = expectedDisplay(q, (v) => this.i18n.l(v), (k) => this.i18n.t(k));
        review.push({ q, ok: r.correct, expected: r.expected, shown });
      }
      return { title: this.i18n.l(s.title), kind: s.kind, correct, total: s.questions.length };
    });
    this.results.set(results);
    this.review.set(review);
    const seconds = Math.round(this.elapsed());
    this.phase.set('result');
    this.sessions.clear('exam', e.id);
    this.saved.set(null);
    window.scrollTo({ top: 0 });
    if (this.passed()) confetti();

    const title = this.i18n.l(e.title);
    const wrong = new Set(review.filter((r) => !r.ok && a[r.q.id] != null && a[r.q.id] !== '').map((r) => r.q.id));
    this.mistakesSaved.set(wrong.size);
    this.progress
      .recordMistakes(
        e.sections.flatMap((s) =>
          s.questions
            .filter((q) => wrong.has(q.id))
            // Reading questions need their passage to make sense on their own.
            .map((q) => ({
              exercise: s.passage ? { ...q, hint: [s.passage, q.hint].filter(Boolean).join('\n\n') } : q,
              source: 'exam' as const,
              refId: e.id,
              title,
              languageId: e.languageId,
            })),
        ),
      )
      .catch(() => undefined);
    await this.progress
      .recordActivity({
        xp: this.totalCorrect() * XP.exerciseCorrect + (this.passed() ? XP.examPass : 0),
        minutes: Math.min(seconds, e.durationMinutes * 60) / 60,
        exercises: e.questionCount,
      })
      .catch(console.error);
    await this.progress
      .logAttempt({ kind: 'exam', refId: e.id, title: this.i18n.l(e.title), score: this.percent(), correct: this.totalCorrect(), total: e.questionCount, durationSec: seconds })
      .catch(() => undefined);
  }

  private persist(): void {
    const e = this.exam();
    if (!e || this.phase() !== 'running') return;
    this.sessions.save<ExamState>('exam', e.id, {
      languageId: e.languageId,
      title: this.i18n.l(e.title).slice(0, 200),
      position: this.answeredCount(),
      total: e.questionCount,
      state: { elapsed: Math.round(this.elapsed()), answers: this.answers(), section: this.section() },
    });
  }
}

/** What is saved to resume a mock exam. */
interface ExamState {
  /** Seconds spent so far (the clock is paused between visits). */
  elapsed: number;
  answers: Record<string, UserAnswer>;
  section: number;
}

function isValidExamState(s: ExamState | null | undefined): s is ExamState {
  return (
    !!s &&
    Number.isFinite(s.elapsed) &&
    s.elapsed >= 0 &&
    !!s.answers &&
    typeof s.answers === 'object' &&
    !Array.isArray(s.answers) &&
    Number.isInteger(s.section ?? 0)
  );
}
