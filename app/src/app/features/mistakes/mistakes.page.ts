import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckResult } from '../../core/exercise-check';
import { XP } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService } from '../../core/learn-context.service';
import { Mistake, MistakeSource } from '../../core/models';
import { MISTAKE_CLEAR_STREAK, ProgressService } from '../../core/progress.service';
import { ToastService } from '../../core/toast.service';
import { shuffle } from '../../core/utils';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { MedalComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';
import { ExerciseComponent } from '../lesson/exercise.component';

const SESSION_SIZE = 15;

/**
 * Mistakes notebook: every wrong answer from lessons, mock exams and practice is kept
 * here and comes back for targeted review until it is answered correctly twice in a row.
 */
@Component({
  selector: 'app-mistakes',
  imports: [NgTemplateOutlet, RouterLink, IconComponent, SpinnerComponent, MedalComponent, ProgressBarComponent, ExerciseComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (phase() === 'practice') {
        @if (queue()[index()]; as m) {
         <div class="mx-auto max-w-3xl">
          <div class="mb-5 flex items-center gap-3">
            <button class="btn-ghost !px-2" (click)="stop()" [attr.aria-label]="'common.close' | t"><app-icon name="close" /></button>
            <app-progress-bar class="flex-1" [value]="(index() / queue().length) * 100" />
            <span class="text-sm font-semibold text-muted">{{ index() + 1 }}/{{ queue().length }}</span>
          </div>
          <p class="chip mb-3">{{ 'mistakes.src.' + m.source | t }} · {{ m.title }} · <app-icon name="xCircle" [size]="12" class="text-error" /> {{ m.wrong }}</p>
          @for (k of [m.id + index()]; track k) {
            <app-exercise [exercise]="m.exercise" [speechLang]="ctx.info().speech" (done)="onAnswer(m, $event)" />
          }
         </div>
        }
      } @else if (phase() === 'result') {
        <div class="card animate-pop mx-auto max-w-2xl p-8 text-center">
          <app-medal [icon]="cleared() ? 'sparkles' : 'zap'" [tone]="cleared() ? 'success' : 'accent'" />
          <h1 class="mt-3 font-display text-2xl font-black">{{ 'mistakes.sessionDone' | t }}</h1>
          <p class="mt-1 text-muted">{{ 'mistakes.sessionSub' | t: { correct: sessionCorrect(), total: answered(), cleared: cleared() } }}</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            @if (items().length) { <button class="btn-primary" (click)="startPractice()">{{ 'mistakes.again' | t }}</button> }
            <button class="btn-outline" (click)="phase.set('list')">{{ 'mistakes.backToList' | t }}</button>
          </div>
        </div>
      } @else {
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="page-title">{{ 'mistakes.title' | t }}</h1>
            <p class="mt-1 text-muted">{{ 'mistakes.sub' | t: { n: clearStreak } }}</p>
          </div>
          @if (items().length) {
            <button class="btn-primary" (click)="startPractice()"><app-icon name="refresh" [size]="18" /> {{ 'mistakes.practice' | t: { n: Math.min(sessionSize, filtered().length) } }}</button>
          }
        </div>

        @if (loading()) {
          <app-spinner />
        } @else if (!items().length) {
          <section class="card animate-rise mt-6 grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div class="flex flex-col items-center justify-center gap-4 p-8 text-center lg:p-12">
              <app-medal icon="checkCircle" tone="success" [size]="96" />
              <p class="max-w-sm text-lg font-bold">{{ 'mistakes.empty' | t }}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a routerLink="/courses" class="btn-primary"><app-icon name="book" [size]="18" /> {{ 'courses.title' | t }}</a>
                <a routerLink="/practice" class="btn-outline"><app-icon name="gamepad" [size]="18" /> {{ 'nav.practice' | t }}</a>
              </div>
            </div>
            <div class="border-t border-line bg-surface-2/60 p-8 lg:border-l lg:border-t-0 lg:p-12">
              <ng-container *ngTemplateOutlet="howItWorks" />
            </div>
          </section>
        } @else {
         <div class="mt-6 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[21rem_minmax(0,1fr)]">
          <aside class="space-y-4 lg:sticky lg:top-20">
            <section class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
              <button class="card flex items-center justify-between gap-3 p-4 text-left transition" [class.!border-primary]="filter() === 'all'" [class.bg-primary-soft]="filter() === 'all'" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">
                <span class="text-sm font-semibold text-muted">{{ 'common.all' | t }}</span><span class="font-display text-2xl font-black">{{ items().length }}</span>
              </button>
              @for (s of sources; track s) {
                @if (countBy()[s]) {
                  <button class="card flex items-center justify-between gap-3 p-4 text-left transition" [class.!border-primary]="filter() === s" [class.bg-primary-soft]="filter() === s" [attr.aria-pressed]="filter() === s" (click)="filter.set(s)">
                    <span class="text-sm font-semibold text-muted">{{ 'mistakes.src.' + s | t }}</span><span class="font-display text-2xl font-black">{{ countBy()[s] }}</span>
                  </button>
                }
              }
            </section>
            <section class="card hidden p-5 lg:block">
              <ng-container *ngTemplateOutlet="howItWorks" />
            </section>
          </aside>

          <ul class="stagger grid gap-3 xl:grid-cols-2">
            @for (m of filtered(); track m.id) {
              <li class="card card-hover flex items-start gap-3 p-4">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-error/15 text-error"><app-icon [name]="srcIcon[m.source]" [size]="20" /></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-xs font-semibold uppercase tracking-wide text-muted">{{ 'mistakes.src.' + m.source | t }} · {{ m.title }}</p>
                  <p class="mt-1 truncate font-bold" [class.jp]="jp()">{{ preview(m) }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span class="chip-danger !text-xs"><app-icon name="xCircle" [size]="12" /> {{ m.wrong }}</span>
                    <span class="chip !text-xs">{{ 'mistakes.progress' | t: { n: m.streak, total: clearStreak } }}</span>
                    <span>{{ date(m.lastWrong) }}</span>
                  </div>
                </div>
                <button class="btn-ghost !min-h-9 !px-2 text-muted hover:!text-error" (click)="remove(m)" [attr.aria-label]="'admin.delete' | t"><app-icon name="trash" [size]="16" /></button>
              </li>
            }
          </ul>
         </div>
        }
      }
    </div>

    <ng-template #howItWorks>
      <h2 class="font-display text-lg font-black">{{ 'mistakes.how.title' | t }}</h2>
      <ol class="mt-4 space-y-4">
        @for (step of howSteps; track step.key; let i = $index) {
          <li class="flex gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><app-icon [name]="step.icon" [size]="18" /></span>
            <div>
              <p class="text-sm font-bold">{{ i + 1 }}. {{ 'mistakes.how.' + step.key + 't' | t }}</p>
              <p class="text-sm text-muted">{{ 'mistakes.how.' + step.key + 'd' | t: { n: clearStreak, size: sessionSize } }}</p>
            </div>
          </li>
        }
      </ol>
    </ng-template>
  `,
})
export class MistakesPage {
  private readonly progress = inject(ProgressService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  protected readonly ctx = inject(LearnContextService);
  protected readonly Math = Math;
  protected readonly sessionSize = SESSION_SIZE;
  protected readonly clearStreak = MISTAKE_CLEAR_STREAK;
  protected readonly sources: MistakeSource[] = ['lesson', 'exam', 'challenge', 'game'];
  protected readonly srcIcon: Record<MistakeSource, string> = { lesson: 'book', exam: 'file', challenge: 'target', game: 'gamepad' };
  protected readonly howSteps = [
    { key: 's1', icon: 'bookmark' },
    { key: 's2', icon: 'refresh' },
    { key: 's3', icon: 'checkCircle' },
  ];

  protected readonly loading = signal(true);
  protected readonly items = signal<Mistake[]>([]);
  protected readonly filter = signal<MistakeSource | 'all'>('all');
  protected readonly phase = signal<'list' | 'practice' | 'result'>('list');
  protected readonly queue = signal<Mistake[]>([]);
  protected readonly index = signal(0);
  protected readonly sessionCorrect = signal(0);
  protected readonly cleared = signal(0);
  protected readonly answered = signal(0);
  private started = Date.now();

  protected readonly jp = computed(() => this.ctx.target() === 'ja');
  protected readonly filtered = computed(() => (this.filter() === 'all' ? this.items() : this.items().filter((m) => m.source === this.filter())));
  protected readonly countBy = computed(() => {
    const out: Partial<Record<MistakeSource, number>> = {};
    for (const m of this.items()) out[m.source] = (out[m.source] ?? 0) + 1;
    return out;
  });

  constructor() {
    effect(() => {
      const lang = this.ctx.target();
      untracked(() => this.load(lang));
    });
  }

  private async load(lang: string): Promise<void> {
    this.loading.set(true);
    this.phase.set('list');
    try {
      this.items.set(await this.progress.mistakes(lang));
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected preview(m: Mistake): string {
    const ex = m.exercise;
    return ex.question || this.i18n.l(ex.prompt) || ex.audioText || ex.pairs?.map((p) => p[0]).join(' · ') || this.i18n.l(ex.instruction);
  }

  protected remove(m: Mistake): void {
    this.items.update((list) => list.filter((x) => x.id !== m.id));
    this.progress.deleteMistake(m.id).catch(() => {
      this.items.update((list) => [...list, m].sort((a, b) => b.lastWrong - a.lastWrong));
      this.toast.error(this.i18n.t('common.error'));
    });
  }

  protected date(ms: number): string {
    return this.i18n.date(ms);
  }

  protected startPractice(): void {
    // Most-missed first, then a bit of shuffling so sessions don't feel identical.
    const pool = this.filtered().slice().sort((a, b) => b.wrong - a.wrong);
    this.queue.set(shuffle(pool.slice(0, SESSION_SIZE)));
    this.index.set(0);
    this.sessionCorrect.set(0);
    this.cleared.set(0);
    this.answered.set(0);
    this.started = Date.now();
    this.phase.set('practice');
  }

  protected async onAnswer(m: Mistake, r: CheckResult): Promise<void> {
    if (r.correct) this.sessionCorrect.update((n) => n + 1);
    this.answered.update((n) => n + 1);
    this.progress
      .resolveMistake(m, r.correct)
      .then((gone) => {
        if (gone) {
          this.cleared.update((n) => n + 1);
          this.items.update((list) => list.filter((x) => x.id !== m.id));
        } else {
          this.items.update((list) =>
            list.map((x) => (x.id === m.id ? { ...x, streak: r.correct ? x.streak + 1 : 0, wrong: r.correct ? x.wrong : x.wrong + 1 } : x)),
          );
        }
      })
      .catch(() => undefined);
    if (this.index() + 1 >= this.queue().length) await this.finish();
    else this.index.update((i) => i + 1);
  }

  protected stop(): void {
    if (this.answered() > 0) this.finish();
    else this.phase.set('list');
  }

  private async finish(): Promise<void> {
    this.phase.set('result');
    playSfx('finish');
    const answered = Math.max(1, this.answered());
    if (this.sessionCorrect() / answered >= 0.8) confetti(60);
    const seconds = Math.round((Date.now() - this.started) / 1000);
    const xp = this.sessionCorrect() * XP.mistakeFixed;
    await this.progress.recordActivity({ xp, minutes: seconds / 60, exercises: answered }).catch(() => undefined);
    await this.progress
      .logAttempt({
        kind: 'review',
        refId: `mistakes.${this.ctx.target()}`,
        title: this.i18n.t('mistakes.title'),
        score: Math.round((this.sessionCorrect() / answered) * 100),
        correct: this.sessionCorrect(),
        total: answered,
        durationSec: seconds,
      })
      .catch(() => undefined);
    if (this.cleared()) this.toast.success(this.i18n.t('mistakes.clearedToast', { n: this.cleared() }));
  }
}
