import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { Vocabulary } from '../../core/models';
import { SpeechService } from '../../core/speech.service';
import { normalizeAnswer, shuffle } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { ProgressBarComponent } from '../../shared/ui';
import { QuizQuestion, scrambleTiles } from './games';

export interface GameScore {
  correct: number;
  total: number;
}

/** Fast multiple-choice quiz: optional global timer (speed mode). */
@Component({
  selector: 'app-quiz-game',
  imports: [IconComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (q(); as cur) {
      <div class="mb-6 flex items-center gap-3">
        @if (timeLimit()) {
          <span class="!text-sm" [class]="left() <= 10 ? 'chip-danger animate-pulse' : 'chip'"><app-icon name="timer" [size]="16" /> {{ left() }}s</span>
        }
        <app-progress-bar class="flex-1" [value]="timeLimit() ? (left() / timeLimit()) * 100 : (i() / questions().length) * 100" />
        @for (c of [correct()]; track c) { <span class="chip-success animate-pop !text-sm"><app-icon name="checkCircle" [size]="16" /> {{ c }}</span> }
      </div>
      <div class="card p-6 text-center">
        @if (cur.audio) {
          <button class="btn-primary mx-auto mb-3 h-16 w-16 !rounded-full !p-0" (click)="speak(cur.audio)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" [size]="28" /></button>
        }
        @if (cur.prompt !== '🔊') { <p class="font-display text-4xl font-black break-words" [class.jp]="cur.jpPrompt">{{ cur.prompt }}</p> }
        @if (cur.sub && (!cur.audio || picked())) { <p class="mt-2 text-muted">{{ cur.sub }}</p> }
      </div>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        @for (o of cur.options; track o) {
          <button class="min-h-14 rounded-2xl border-2 px-4 py-3 text-lg font-semibold transition" [class.jp]="cur.jpOptions"
            [class]="cls(o)" [disabled]="!!picked()" (click)="choose(o)">{{ o }}</button>
        }
      </div>
    }
  `,
})
export class QuizGameComponent implements OnInit {
  private readonly speech = inject(SpeechService);
  readonly questions = input.required<QuizQuestion[]>();
  readonly timeLimit = input(0);
  readonly speechLang = input('en-US');
  readonly finished = output<GameScore>();

  protected readonly i = signal(0);
  protected readonly correct = signal(0);
  protected readonly picked = signal<string | null>(null);
  protected readonly left = signal(0);
  protected readonly q = computed(() => this.questions()[this.i()]);
  private answered = 0;
  private ended = false;

  constructor() {
    const t = setInterval(() => {
      if (!this.timeLimit() || this.ended) return;
      this.left.update((s) => s - 1);
      if (this.left() <= 0) this.end();
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }

  ngOnInit(): void {
    this.left.set(this.timeLimit());
    const first = this.q();
    if (first?.audio && first.prompt === '🔊') setTimeout(() => this.speak(first.audio!), 300);
  }

  protected speak(text: string): void {
    this.speech.speak(text, this.speechLang(), 0.9);
  }

  protected choose(o: string): void {
    const cur = this.q();
    this.picked.set(o);
    this.answered++;
    const ok = o === cur.answer;
    if (ok) this.correct.update((c) => c + 1);
    playSfx(ok ? 'correct' : 'wrong');
    if (cur.audio && cur.prompt !== '🔊' && ok) this.speak(cur.audio);
    setTimeout(() => {
      this.picked.set(null);
      if (this.i() + 1 >= this.questions().length) this.end();
      else {
        this.i.update((x) => x + 1);
        const next = this.q();
        if (next.audio && next.prompt === '🔊') this.speak(next.audio);
      }
    }, ok ? 450 : 1100);
  }

  protected cls(o: string): string {
    const p = this.picked();
    if (!p) return 'border-line bg-surface hover:border-primary/50';
    if (o === this.q().answer) return 'border-success bg-success/10 text-success';
    if (o === p) return 'border-error bg-error/10 text-error';
    return 'border-line opacity-50';
  }

  private end(): void {
    if (this.ended) return;
    this.ended = true;
    this.finished.emit({ correct: this.correct(), total: this.timeLimit() ? this.answered : this.questions().length });
  }
}

/** Memory-style matching: flip two tiles, find word ↔ meaning pairs. */
@Component({
  selector: 'app-match-game',
  imports: [...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 flex justify-between text-sm font-semibold text-muted">
      <span>{{ 'practice.moves' | t }}: {{ moves() }}</span><span>⏱ {{ seconds() }}s</span>
    </div>
    <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
      @for (t of tiles(); track t.id) {
        <button class="flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 text-center font-bold transition lg:min-h-32 lg:text-lg"
          [class]="t.matched ? 'border-success bg-success/10 text-success opacity-70' : open().includes(t.id) ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface hover:border-primary/40'"
          [disabled]="t.matched" (click)="flip(t.id)" [class.jp]="t.jp">
          {{ t.matched || open().includes(t.id) ? t.text : '?' }}
        </button>
      }
    </div>
  `,
})
export class MatchGameComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly speech = inject(SpeechService);
  readonly words = input.required<Vocabulary[]>();
  readonly speechLang = input('en-US');
  readonly finished = output<GameScore>();

  protected readonly tiles = signal<{ id: number; key: string; text: string; jp: boolean; matched: boolean }[]>([]);
  protected readonly open = signal<number[]>([]);
  protected readonly moves = signal(0);
  protected readonly seconds = signal(0);
  private mistakes = 0;

  constructor() {
    const t = setInterval(() => this.seconds.update((s) => s + 1), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }

  ngOnInit(): void {
    const jp = this.speechLang().startsWith('ja');
    const list = this.words().flatMap((w, i) => [
      { id: i * 2, key: w.id, text: w.word, jp, matched: false },
      { id: i * 2 + 1, key: w.id, text: this.i18n.l(w.meaning), jp: false, matched: false },
    ]);
    this.tiles.set(shuffle(list));
  }

  protected flip(id: number): void {
    const open = this.open();
    if (open.length === 2 || open.includes(id)) return;
    const next = [...open, id];
    this.open.set(next);
    const tile = this.tiles().find((t) => t.id === id)!;
    if (tile.id % 2 === 0) this.speech.speak(tile.text, this.speechLang());
    if (next.length < 2) return;
    this.moves.update((m) => m + 1);
    const [a, b] = next.map((x) => this.tiles().find((t) => t.id === x)!);
    if (a.key === b.key) {
      playSfx('correct');
      setTimeout(() => {
        this.tiles.update((ts) => ts.map((t) => (t.key === a.key ? { ...t, matched: true } : t)));
        this.open.set([]);
        if (this.tiles().every((t) => t.matched)) {
          this.finished.emit({ correct: this.words().length, total: this.words().length + this.mistakes });
        }
      }, 350);
    } else {
      this.mistakes++;
      playSfx('wrong');
      setTimeout(() => this.open.set([]), 900);
    }
  }
}

/** Rebuild the word from shuffled letters (EN) or kana (JA) using the meaning as a hint. */
@Component({
  selector: 'app-scramble-game',
  imports: [IconComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (word(); as w) {
      <div class="mb-6 flex items-center gap-3">
        <app-progress-bar class="flex-1" [value]="(i() / words().length) * 100" />
        @for (c of [correct()]; track c) { <span class="chip-success animate-pop !text-sm"><app-icon name="checkCircle" [size]="16" /> {{ c }}</span> }
      </div>
      <div class="card p-6 text-center">
        <p class="text-sm font-bold uppercase text-muted">{{ 'practice.hint' | t }}</p>
        <p class="mt-1 font-display text-2xl font-black">{{ w.meaning | loc }}</p>
        <button class="btn-soft mt-3" (click)="speech.speak(w.word, speechLang())"><app-icon name="volume" [size]="18" /> {{ 'common.listen' | t }}</button>
      </div>
      <div class="mt-5 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3"
        [class]="state() === 'ok' ? 'border-success' : state() === 'bad' ? 'border-error animate-shake' : 'border-line'">
        @for (c of built(); track $index) {
          <button class="h-12 min-w-11 rounded-xl bg-primary-soft px-2 text-xl font-bold text-primary" [class.jp]="jp()" (click)="remove($index)">{{ c.ch }}</button>
        }
      </div>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        @for (t of tiles(); track t.id) {
          <button class="h-12 min-w-11 rounded-xl border border-line bg-surface px-2 text-xl font-bold shadow-sm" [class.invisible]="t.used" [class.jp]="jp()" (click)="add(t.id)">{{ t.ch }}</button>
        }
      </div>
      @if (state() === 'bad') { <p class="mt-3 text-center font-semibold text-error">{{ 'exercise.answerIs' | t }} <span [class.jp]="jp()">{{ target() }}</span></p> }
      <div class="mt-5 grid grid-cols-2 gap-3">
        <button class="btn-outline" (click)="skip()">{{ 'practice.skip' | t }}</button>
        <button class="btn-primary" [disabled]="!built().length || state() !== 'idle'" (click)="check()">{{ 'exercise.check' | t }}</button>
      </div>
    }
  `,
})
export class ScrambleGameComponent {
  protected readonly speech = inject(SpeechService);
  readonly words = input.required<Vocabulary[]>();
  readonly speechLang = input('en-US');
  readonly finished = output<GameScore>();

  protected readonly i = signal(0);
  protected readonly correct = signal(0);
  protected readonly tiles = signal<{ id: number; ch: string; used: boolean }[]>([]);
  protected readonly built = signal<{ id: number; ch: string }[]>([]);
  protected readonly state = signal<'idle' | 'ok' | 'bad'>('idle');
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));
  protected readonly word = computed(() => this.words()[this.i()]);
  protected readonly target = computed(() => {
    const w = this.word();
    return this.jp() ? w.reading || w.word : w.word;
  });

  constructor() {
    queueMicrotask(() => this.setup());
  }

  protected add(id: number): void {
    const t = this.tiles().find((x) => x.id === id);
    if (!t || t.used || this.state() !== 'idle') return;
    this.tiles.update((ts) => ts.map((x) => (x.id === id ? { ...x, used: true } : x)));
    this.built.update((b) => [...b, { id, ch: t.ch }]);
  }

  protected remove(index: number): void {
    if (this.state() !== 'idle') return;
    const c = this.built()[index];
    this.built.update((b) => b.filter((_, i) => i !== index));
    this.tiles.update((ts) => ts.map((x) => (x.id === c.id ? { ...x, used: false } : x)));
  }

  protected check(): void {
    const ok = normalizeAnswer(this.built().map((b) => b.ch).join('')) === normalizeAnswer(this.target());
    this.state.set(ok ? 'ok' : 'bad');
    playSfx(ok ? 'correct' : 'wrong');
    if (ok) this.correct.update((c) => c + 1);
    setTimeout(() => this.next(), ok ? 700 : 1600);
  }

  protected skip(): void {
    this.state.set('bad');
    setTimeout(() => this.next(), 1400);
  }

  private next(): void {
    if (this.i() + 1 >= this.words().length) {
      this.finished.emit({ correct: this.correct(), total: this.words().length });
      return;
    }
    this.i.update((x) => x + 1);
    this.setup();
  }

  private setup(): void {
    const w = this.word();
    if (!w) return;
    this.state.set('idle');
    this.built.set([]);
    this.tiles.set(scrambleTiles(w, this.jp()).map((ch, id) => ({ id, ch, used: false })));
  }
}
