import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { XP } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { LearnContextService } from '../../core/learn-context.service';
import { UserVocab } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SpeechService } from '../../core/speech.service';
import { Grade, review } from '../../core/srs';
import { kanaEquals, looksLikeRomaji, romajiToHiragana } from '../../core/kana-convert';
import { normalizeAnswer } from '../../core/utils';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { MedalComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';

type ReviewMode = 'flip' | 'type' | 'listen';
const MODE_KEY = 'lingora.review.mode';

@Component({
  selector: 'app-review',
  imports: [FormsModule, RouterLink, IconComponent, ProgressBarComponent, SpinnerComponent, MedalComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page max-w-6xl 2xl:max-w-7xl">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="page-title">{{ 'review.title' | t }}</h1>
        @if (mode() === 'flip') {
          <label class="flex items-center gap-2 text-sm font-semibold text-muted">
            <input type="checkbox" class="switch" role="switch" [checked]="reverse()" (change)="reverse.set(!reverse())" /> {{ 'review.reverse' | t }}
          </label>
        }
      </div>
      <div class="mt-3 inline-flex rounded-xl bg-surface-2 p-1" role="group" [attr.aria-label]="'review.mode' | t">
        @for (m of modes; track m) {
          <button class="min-h-9 rounded-lg px-3 text-sm font-bold transition" [class]="mode() === m ? 'bg-surface shadow-sm' : 'text-muted hover:text-fg'" [attr.aria-pressed]="mode() === m" (click)="setMode(m)">{{ 'review.modes.' + m | t }}</button>
        }
      </div>
      @if (card()) { <p class="mt-2 text-xs text-muted lg:hidden">{{ 'review.fsrsHint' | t }}</p> }

      @if (loading()) {
        <app-spinner />
      } @else if (done()) {
        <div class="card animate-pop mx-auto mt-6 max-w-2xl p-8 text-center">
          <app-medal icon="sparkles" tone="success" />
          <h2 class="mt-3 font-display text-2xl font-black">{{ 'review.done' | t }}</h2>
          <p class="mt-1 text-muted">{{ 'review.doneSub' | t: { n: reviewed(), xp: reviewed() * xpPer } }}</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <a routerLink="/vocabulary" class="btn-outline">{{ 'nav.vocabulary' | t }}</a>
            <a routerLink="/practice" class="btn-primary">{{ 'nav.practice' | t }}</a>
          </div>
        </div>
      } @else if (card(); as c) {
       <div class="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="min-w-0">
        <div class="flex items-center gap-3">
          <app-progress-bar class="flex-1" [value]="(index() / queue().length) * 100" />
          <span class="text-sm font-semibold text-muted">{{ index() + 1 }}/{{ queue().length }}</span>
        </div>
        @if (mode() !== 'flip') {
          <div class="card mt-6 flex min-h-64 w-full lg:min-h-80 flex-col items-center justify-center p-6 text-center">
            @if (mode() === 'type') {
              <p class="text-sm font-bold uppercase tracking-wide text-muted">{{ 'review.typePrompt' | t }}</p>
              <p class="mt-2 font-display text-3xl font-black">{{ c.meaning | loc }}</p>
            } @else {
              <p class="text-sm font-bold uppercase tracking-wide text-muted">{{ 'review.listenPrompt' | t }}</p>
              <button class="btn-primary mt-3 h-16 w-16 !rounded-full !p-0" (click)="speak(c.word)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" [size]="28" /></button>
            }
            @if (shown()) {
              <div class="animate-flip mt-6 w-full border-t border-line pt-6">
                <p class="font-display text-2xl font-black" [class]="typedOk() ? 'text-success' : 'text-error'">{{ (typedOk() ? 'exercise.correct' : 'exercise.incorrect') | t }}</p>
                <p class="mt-2 font-display text-4xl font-black text-primary" [class.jp]="jp()">{{ c.word }}</p>
                @if (c.reading) { <p class="text-muted" [class.jp]="jp()">{{ c.reading }}</p> }
                @if (mode() === 'listen') { <p class="mt-1 font-semibold">{{ c.meaning | loc }}</p> }
                @if (c.example) { <p class="mt-3 text-muted" [class.jp]="jp()">{{ c.example }}</p> }
              </div>
            } @else {
              <input class="input mt-6 !min-h-14 text-center text-xl" [class.jp]="jp()" [ngModel]="typed()" (ngModelChange)="typed.set($event)"
                (keydown.enter)="checkTyped()" [placeholder]="'exercise.typeAnswer' | t" autocomplete="off" autocapitalize="off" spellcheck="false" />
              @if (kanaPreview()) { <p class="jp mt-2 text-muted">→ {{ kanaPreview() }}</p> }
            }
          </div>
        } @else {
        <button class="card mt-6 flex min-h-80 w-full lg:min-h-96 flex-col items-center justify-center p-6 text-center" (click)="reveal()">
          @if (!reverse()) {
            <p class="font-display text-5xl font-black" [class.jp]="jp()">{{ c.word }}</p>
            @if (c.reading) { <p class="mt-2 text-lg text-muted" [class.jp]="jp()">{{ c.reading }}</p> }
          } @else {
            <p class="font-display text-3xl font-black">{{ c.meaning | loc }}</p>
          }
          @if (shown()) {
            <div class="animate-flip mt-6 border-t border-line pt-6">
              @if (!reverse()) {
                <p class="font-display text-2xl font-black text-primary">{{ c.meaning | loc }}</p>
              } @else {
                <p class="font-display text-4xl font-black text-primary" [class.jp]="jp()">{{ c.word }}</p>
                @if (c.reading) { <p class="text-muted" [class.jp]="jp()">{{ c.reading }}</p> }
              }
              @if (c.example) { <p class="mt-3 text-muted" [class.jp]="jp()">{{ c.example }}</p> }
            </div>
          } @else {
            <p class="mt-8 text-sm text-muted">{{ 'review.showHint' | t }}</p>
          }
        </button>
        <div class="mt-3 flex justify-center">
          <button class="btn-soft" (click)="speak(c.word)"><app-icon name="volume" /> {{ 'common.listen' | t }}</button>
        </div>
        }
        @if (shown()) {
          <div class="mt-5 grid grid-cols-4 gap-2">
            @for (g of grades; track g.id; let i = $index) {
              <button class="btn flex-col !gap-0 !py-2 text-white" [class]="g.cls" [style.outline]="suggested() === g.id ? '3px solid var(--c-fg)' : null" style="outline-offset: 2px" (click)="grade(g.id)">
                <span>{{ 'review.' + g.id | t }}</span>
                <span class="text-xs opacity-80">{{ preview(c, g.id) }}</span>
              </button>
            }
          </div>
        } @else if (mode() === 'flip') {
          <button class="btn-primary mt-5 w-full" (click)="reveal()">{{ 'review.show' | t }}</button>
        } @else {
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button class="btn-outline" (click)="giveUp()">{{ 'review.dontKnow' | t }}</button>
            <button class="btn-primary" (click)="checkTyped()" [disabled]="!typed().trim()">{{ 'exercise.check' | t }}</button>
          </div>
        }
        </div>

        <aside class="space-y-4 lg:sticky lg:top-20">
          <section class="card p-5">
            <h2 class="font-display text-lg font-black">{{ 'review.side.title' | t }}</h2>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-success/10 p-3"><p class="font-display text-2xl font-black text-success">{{ reviewed() }}</p><p class="text-xs font-semibold text-muted">{{ 'review.side.reviewed' | t }}</p></div>
              <div class="rounded-2xl bg-primary-soft p-3"><p class="font-display text-2xl font-black text-primary">{{ queue().length - index() }}</p><p class="text-xs font-semibold text-muted">{{ 'review.side.left' | t }}</p></div>
            </div>
          </section>
          <section class="card hidden p-5 lg:block">
            <h2 class="flex items-center gap-2 text-sm font-bold"><app-icon name="zap" [size]="16" class="text-warning" /> {{ 'review.side.keys' | t }}</h2>
            <ul class="mt-3 space-y-2 text-sm">
              @if (mode() === 'flip') { <li class="flex items-center justify-between gap-2"><span class="text-muted">{{ 'review.side.flip' | t }}</span><span class="flex gap-1"><kbd class="kbd">Space</kbd><kbd class="kbd">Enter</kbd></span></li> }
              <li class="flex items-center justify-between gap-2"><span class="text-muted">{{ 'review.side.grade' | t }}</span><span class="flex gap-1"><kbd class="kbd">1</kbd><kbd class="kbd">2</kbd><kbd class="kbd">3</kbd><kbd class="kbd">4</kbd></span></li>
            </ul>
            <p class="mt-4 border-t border-line pt-3 text-xs text-muted">{{ 'review.fsrsHint' | t }}</p>
          </section>
        </aside>
       </div>
      } @else {
        <section class="card animate-rise mt-6 grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div class="flex flex-col items-center justify-center gap-4 p-8 text-center lg:p-12">
            <app-medal icon="cards" tone="primary" [size]="96" />
            <p class="max-w-sm text-lg font-bold">{{ 'review.nothingDue' | t }}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/vocabulary" class="btn-primary"><app-icon name="plus" [size]="18" /> {{ 'review.addWords' | t }}</a>
              <a routerLink="/courses" class="btn-outline"><app-icon name="book" [size]="18" /> {{ 'courses.title' | t }}</a>
            </div>
          </div>
          <div class="border-t border-line bg-surface-2/60 p-8 lg:border-l lg:border-t-0 lg:p-12">
            <h2 class="font-display text-lg font-black">{{ 'review.mode' | t }}</h2>
            <ul class="mt-4 space-y-4">
              @for (m of modes; track m) {
                <li class="flex gap-3">
                  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><app-icon [name]="modeIcon[m]" [size]="18" /></span>
                  <div><p class="text-sm font-bold">{{ 'review.modes.' + m | t }}</p><p class="text-sm text-muted">{{ 'review.modeHint.' + m | t }}</p></div>
                </li>
              }
            </ul>
            <p class="mt-6 border-t border-line pt-4 text-xs text-muted">{{ 'review.fsrsHint' | t }}</p>
          </div>
        </section>
      }
    </div>
  `,
})
export class ReviewPage {
  protected readonly speech = inject(SpeechService);
  protected readonly ctx = inject(LearnContextService);
  private readonly progress = inject(ProgressService);

  protected readonly loading = signal(true);
  protected readonly queue = signal<UserVocab[]>([]);
  protected readonly index = signal(0);
  protected readonly shown = signal(false);
  protected readonly reverse = signal(false);
  protected readonly reviewed = signal(0);
  protected readonly done = signal(false);
  protected readonly xpPer = XP.reviewCard;
  private started = Date.now();

  protected readonly modes: ReviewMode[] = ['flip', 'type', 'listen'];
  protected readonly modeIcon: Record<ReviewMode, string> = { flip: 'cards', type: 'edit', listen: 'headphones' };
  protected readonly mode = signal<ReviewMode>((localStorage.getItem(MODE_KEY) as ReviewMode) || 'flip');
  protected readonly typed = signal('');
  protected readonly typedOk = signal(false);

  protected readonly card = computed(() => this.queue()[this.index()]);
  protected readonly jp = computed(() => this.ctx.target() === 'ja');
  protected readonly kanaPreview = computed(() => {
    const t = this.typed();
    return this.jp() && t && looksLikeRomaji(t) ? romajiToHiragana(t, false) : '';
  });
  /** In typing modes the answer suggests a grade (the learner can still pick another). */
  protected readonly suggested = computed<Grade | null>(() => (this.mode() === 'flip' || !this.shown() ? null : this.typedOk() ? 'good' : 'again'));
  protected readonly grades: { id: Grade; cls: string }[] = [
    { id: 'again', cls: 'bg-error' },
    { id: 'hard', cls: 'bg-warning' },
    { id: 'good', cls: 'bg-success' },
    { id: 'easy', cls: 'bg-primary !text-on-primary' },
  ];

  constructor() {
    effect(() => {
      const lang = this.ctx.target();
      untracked(() => this.load(lang));
    });
    inject(DestroyRef).onDestroy(() => this.save());
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (!this.card() || this.done() || (e.target as HTMLElement)?.tagName === 'INPUT') return;
    if ((e.key === ' ' || e.key === 'Enter') && this.mode() === 'flip') {
      e.preventDefault();
      this.reveal();
    } else if (this.shown() && ['1', '2', '3', '4'].includes(e.key)) {
      this.grade(this.grades[Number(e.key) - 1].id);
    } else if (this.shown() && e.key === 'Enter' && this.suggested()) {
      this.grade(this.suggested()!);
    }
  }

  protected setMode(m: ReviewMode): void {
    this.mode.set(m);
    localStorage.setItem(MODE_KEY, m);
    this.resetCard();
    if (m === 'listen' && this.card()) this.speak(this.card()!.word);
  }

  protected speak(text: string): void {
    this.speech.speak(text, this.ctx.info().speech);
  }

  protected reveal(): void {
    if (!this.shown()) {
      this.shown.set(true);
      if (!this.reverse()) this.speak(this.card()!.word);
    }
  }

  protected checkTyped(): void {
    const c = this.card();
    const t = this.typed().trim();
    if (!c || !t || this.shown()) return;
    const ok = (!!c.reading && kanaEquals(t, c.reading)) || kanaEquals(t, c.word) || normalizeAnswer(t) === normalizeAnswer(c.word);
    this.typedOk.set(ok);
    this.shown.set(true);
    playSfx(ok ? 'correct' : 'wrong');
    this.speak(c.word);
  }

  protected giveUp(): void {
    const c = this.card();
    if (!c || this.shown()) return;
    this.typedOk.set(false);
    this.shown.set(true);
    this.speak(c.word);
  }

  private resetCard(): void {
    this.shown.set(false);
    this.typed.set('');
    this.typedOk.set(false);
  }

  protected preview(c: UserVocab, g: Grade): string {
    const next = review(c, g);
    if (g === 'again') return '10m';
    return next.interval >= 30 ? `${Math.round(next.interval / 30)}mo` : `${next.interval}d`;
  }

  protected async grade(g: Grade): Promise<void> {
    const c = this.card();
    if (!c) return;
    this.reviewed.update((n) => n + 1);
    this.progress.gradeWord(c, g).catch(console.error);
    this.resetCard();
    if (this.index() + 1 >= this.queue().length) {
      this.done.set(true);
      confetti(60);
      await this.save();
    } else {
      this.index.update((i) => i + 1);
      if (this.mode() === 'listen') this.speak(this.card()!.word);
    }
  }

  private async load(lang: string): Promise<void> {
    this.loading.set(true);
    this.done.set(false);
    this.index.set(0);
    try {
      let words = await this.progress.dueWords(lang, 30);
      if (!words.length) words = (await this.progress.myWords(lang, 'difficult', 20)).slice(0, 20);
      this.queue.set(words);
      this.started = Date.now();
    } finally {
      this.loading.set(false);
    }
  }

  private savedCount = 0;
  private async save(): Promise<void> {
    const n = this.reviewed() - this.savedCount;
    if (n <= 0) return;
    this.savedCount += n;
    const seconds = Math.round((Date.now() - this.started) / 1000);
    this.started = Date.now();
    await this.progress
      .recordActivity({ xp: n * XP.reviewCard, minutes: seconds / 60, exercises: n })
      .catch(() => undefined);
    await this.progress
      .logAttempt({ kind: 'review', refId: this.ctx.target(), title: 'SRS review', score: 100, correct: n, total: n, durationSec: seconds })
      .catch(() => undefined);
  }
}
