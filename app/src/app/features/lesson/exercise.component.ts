import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckResult, UserAnswer, checkAnswer, expectedDisplay } from '../../core/exercise-check';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { Exercise } from '../../core/models';
import { SpeechService } from '../../core/speech.service';
import { looksLikeRomaji, romajiToHiragana } from '../../core/kana-convert';
import { diffWords, shuffle, similarity } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { VoiceRecorderComponent } from '../../shared/voice-recorder.component';

/**
 * Generic exercise renderer for every ExerciseType. In `practice` mode it checks the
 * answer itself and shows feedback; in `exam` mode it only reports the answer upward.
 */
@Component({
  selector: 'app-exercise',
  imports: [FormsModule, IconComponent, VoiceRecorderComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let ex = exercise();
    <div class="space-y-5" [class.animate-shake]="shake()">
      <p class="text-sm font-bold uppercase tracking-wide text-muted">{{ ex.instruction | loc }}</p>

      @if (needsAudio()) {
        <div class="flex items-center gap-3">
          <button type="button" class="btn-primary h-16 w-16 !rounded-2xl !p-0" (click)="play()" [attr.aria-label]="'common.listen' | t">
            <app-icon name="volume" [size]="28" />
          </button>
          <button type="button" class="btn-soft h-12 !px-3 text-sm" (click)="play(0.7)" [attr.aria-label]="'lesson.slow' | t">🐢 0.7x</button>
          @if (ex.type === 'SPEAKING') {
            <p class="font-display text-2xl font-black" [class.jp]="jp()">{{ ex.audioText }}</p>
          }
        </div>
      }

      @if (ex.prompt; as prompt) {
        @if (prompt | loc; as p) {
          <p class="font-display text-2xl font-black leading-snug sm:text-3xl">{{ p }}</p>
        }
      }
      @if (ex.question && ex.type !== 'SPEAKING') {
        <p class="font-display text-2xl font-black leading-snug sm:text-3xl" [class.jp]="jp()">{{ ex.question }}</p>
      }
      @if (ex.hint) { <p class="-mt-3 whitespace-pre-line text-muted" [class.jp]="jp()">{{ ex.hint }}</p> }

      @switch (kind()) {
        @case ('choice') {
          <div class="grid gap-3 sm:grid-cols-2">
            @for (opt of options(); track opt; let i = $index) {
              <button type="button" class="flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition"
                [class]="optionClass(opt)" [disabled]="locked()" (click)="choose(opt)" [class.jp]="jp() && !ex.labels?.[opt]">
                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line text-xs text-muted">{{ i + 1 }}</span>
                <span class="flex-1">{{ label(opt) }}</span>
              </button>
            }
          </div>
        }
        @case ('truefalse') {
          <div class="grid grid-cols-2 gap-3">
            @for (v of [true, false]; track v) {
              <button type="button" class="min-h-16 rounded-2xl border-2 text-lg font-bold transition" [class]="tfClass(v)"
                [disabled]="locked()" (click)="choose(v)">
                {{ (v ? 'exercise.true' : 'exercise.false') | t }}
              </button>
            }
          </div>
        }
        @case ('text') {
          <input class="input !min-h-14 text-lg" [class.jp]="jp()" [ngModel]="text()" (ngModelChange)="setText($event)"
            [disabled]="locked()" [placeholder]="(ex.type === 'DICTATION' ? 'exercise.typeHeard' : 'exercise.typeAnswer') | t" autocomplete="off" autocapitalize="off"
            spellcheck="false" (keydown.enter)="mode() === 'practice' && check()" [attr.aria-label]="'exercise.typeAnswer' | t" />
          @if (kanaPreview(); as kp) { <p class="jp -mt-3 text-muted">→ {{ kp }}</p> }
        }
        @case ('order') {
          <div class="min-h-16 rounded-2xl border-2 border-dashed border-line p-3">
            <div class="flex flex-wrap gap-2">
              @for (t of picked(); track $index) {
                <button type="button" class="rounded-xl bg-primary-soft px-3 py-2 font-semibold text-primary" [class.jp]="jp()"
                  [disabled]="locked()" (click)="unpick($index)">{{ t.text }}</button>
              }
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (t of bank(); track t.id) {
              <button type="button" class="rounded-xl border border-line bg-surface px-3 py-2 font-semibold shadow-sm transition"
                [class.invisible]="t.used" [class.jp]="jp()" [disabled]="locked()" (click)="pick(t.id)">{{ t.text }}</button>
            }
          </div>
        }
        @case ('match') {
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              @for (l of leftItems(); track l) {
                <button type="button" class="w-full rounded-xl border-2 px-3 py-3 text-left font-semibold transition" [class.jp]="jp()"
                  [class]="matchClass('l', l)" [disabled]="locked()" (click)="selectLeft(l)">{{ l }}</button>
              }
            </div>
            <div class="space-y-2">
              @for (r of rightItems(); track r) {
                <button type="button" class="w-full rounded-xl border-2 px-3 py-3 text-left font-semibold transition"
                  [class]="matchClass('r', r)" [disabled]="locked()" (click)="selectRight(r)">{{ label(r) }}</button>
              }
            </div>
          </div>
        }
        @case ('speak') {
          <div class="flex flex-col items-center gap-3 py-2">
            @if (speech.sttSupported) {
              <button type="button" class="grid h-20 w-20 place-items-center rounded-full text-white shadow-lg transition"
                [class]="speech.listening() ? 'bg-error animate-pulse' : 'bg-primary'" (click)="record()" [disabled]="locked()"
                [attr.aria-label]="'exercise.record' | t">
                <app-icon name="mic" [size]="34" />
              </button>
              <p class="text-sm text-muted">{{ (speech.listening() ? 'exercise.listening' : 'exercise.tapToSpeak') | t }}</p>
              @if (text()) {
                <p class="text-center text-lg" [class.jp]="jp()">“{{ text() }}”
                  <span class="ml-2" [class]="speakScore() >= 70 ? 'chip-success' : 'chip-warning'">{{ speakScore() }}%</span>
                </p>
              }
            }
            @if (!speech.sttSupported || (sttFailed() && !text())) {
              <p class="text-center text-sm text-muted" role="status">{{ (speech.sttSupported ? 'exercise.micError' : 'exercise.noMic') | t }}</p>
              <div class="flex gap-2">
                <button type="button" class="btn-outline" (click)="selfGrade(false)" [disabled]="locked()">{{ 'exercise.selfRetry' | t }}</button>
                <button type="button" class="btn-primary" (click)="selfGrade(true)" [disabled]="locked()">{{ 'exercise.selfOk' | t }}</button>
              </div>
            }
            @if (mode() === 'practice') {
              <div class="mt-2 w-full rounded-2xl bg-surface-2 p-3 text-center">
                <p class="mb-2 text-xs font-semibold text-muted">{{ 'rec.hint' | t }}</p>
                <app-voice-recorder class="flex justify-center" />
              </div>
            }
          </div>
        }
      }
    </div>

    @if (mode() === 'practice') {
      @if (result(); as r) {
        <div class="animate-pop mt-6 rounded-2xl p-4" [class]="r.correct ? 'bg-success/12' : 'bg-error/12'" role="status">
          <p class="flex items-center gap-2 font-display text-lg font-black" [class]="r.correct ? 'text-success' : 'text-error'">
            <app-icon [name]="r.correct ? 'check' : 'x'" /> {{ (r.correct ? 'exercise.correct' : 'exercise.incorrect') | t }}
          </p>
          @if (ex.type === 'DICTATION' && !r.correct) {
            <p class="mt-1 text-sm text-muted">{{ 'exercise.dictationScore' | t: { n: Math.round(r.score * 100) } }}</p>
            <p class="mt-1 text-lg leading-relaxed" [class.jp]="jp()">
              @for (tk of diff(); track $index) {
                <span [class]="tk.ok ? 'text-success' : 'rounded bg-error/15 px-0.5 font-bold text-error underline decoration-dotted'">{{ tk.text }}</span>{{ jp() ? '' : ' ' }}
              }
            </p>
          } @else if (!r.correct && r.expected) {
            <p class="mt-1">{{ 'exercise.answerIs' | t }} <b [class.jp]="jp() && !ex.labels?.[r.expected] && ex.type !== 'TRUE_FALSE'">{{ expectedText() }}</b></p>
          }
          @if (ex.explanation | loc; as expl) {
            <p class="mt-2 flex gap-2 text-sm leading-relaxed"><app-icon name="lightbulb" [size]="18" class="shrink-0 text-warning" /><span class="whitespace-pre-line">{{ expl }}</span></p>
          }
          <button type="button" class="mt-3 w-full" [class]="r.correct ? 'btn bg-success text-white' : 'btn bg-error text-white'"
            (click)="done.emit(r)">{{ 'common.continue' | t }}</button>
        </div>
      } @else if (kind() !== 'speak' || text()) {
        <button type="button" class="btn-primary mt-6 w-full" [disabled]="!hasAnswer()" (click)="check()">{{ 'exercise.check' | t }}</button>
      }
    }
  `,
})
export class ExerciseComponent implements OnInit {
  protected readonly speech = inject(SpeechService);
  private readonly i18n = inject(I18nService);

  readonly exercise = input.required<Exercise>();
  readonly speechLang = input('en-US');
  readonly mode = input<'practice' | 'exam'>('practice');
  readonly initial = input<UserAnswer>(null);
  readonly done = output<CheckResult>();
  readonly answerChange = output<UserAnswer>();

  protected readonly answer = signal<UserAnswer>(null);
  protected readonly text = signal('');
  protected readonly sttFailed = signal(false);
  protected readonly result = signal<CheckResult | null>(null);
  protected readonly shake = signal(false);
  protected readonly bank = signal<{ id: number; text: string; used: boolean }[]>([]);
  protected readonly picked = signal<{ id: number; text: string }[]>([]);
  protected readonly leftItems = signal<string[]>([]);
  protected readonly rightItems = signal<string[]>([]);
  protected readonly pairs = signal<Map<string, string>>(new Map());
  protected readonly activeLeft = signal<string | null>(null);

  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));
  protected readonly locked = computed(() => this.mode() === 'practice' && !!this.result());
  protected readonly options = signal<string[]>([]);
  protected readonly kind = computed(() => {
    const ex = this.exercise();
    switch (ex.type) {
      case 'TRUE_FALSE':
        return 'truefalse';
      case 'MATCHING':
        return 'match';
      case 'ORDER_WORD':
        return 'order';
      case 'SPEAKING':
        return 'speak';
      default:
        return ex.options?.length ? 'choice' : 'text';
    }
  });
  protected readonly needsAudio = computed(() => {
    const ex = this.exercise();
    return ex.type === 'LISTENING' || ex.type === 'SPEAKING' || (!!ex.audioText && ex.type !== 'MATCHING');
  });
  protected readonly speakScore = computed(() => similarity(this.text(), this.exercise().audioText ?? ''));
  protected readonly Math = Math;
  /** Japanese dictation accepts romaji: show (and grade) the kana it converts to. */
  protected readonly kanaPreview = computed(() => {
    const t = this.text();
    if (!this.jp() || this.exercise().type !== 'DICTATION' || !t || !looksLikeRomaji(t)) return '';
    return romajiToHiragana(t, false);
  });
  protected readonly diff = computed(() => {
    const r = this.result();
    if (!r || this.exercise().type !== 'DICTATION') return [];
    const given = String(this.gradedAnswer() ?? '');
    const answers = this.exercise().answers?.length ? this.exercise().answers! : [r.expected];
    const closest = answers.reduce((best, a) => (similarity(given, a) > similarity(given, best) ? a : best), answers[0]);
    return diffWords(closest, given);
  });

  ngOnInit(): void {
    const ex = this.exercise();
    this.options.set(ex.options?.length ? shuffle(ex.options) : []);
    if (ex.type === 'ORDER_WORD') {
      const source = ex.options?.length ? ex.options : (ex.answers?.[0] ?? '').split(/\s+/);
      this.bank.set(shuffle(source).map((t, i) => ({ id: i, text: t, used: false })));
      this.options.set([]);
    }
    if (ex.type === 'MATCHING') {
      this.leftItems.set(shuffle((ex.pairs ?? []).map((p) => p[0])));
      this.rightItems.set(shuffle((ex.pairs ?? []).map((p) => p[1])));
    }
    this.restore(this.initial());
    if ((ex.type === 'LISTENING' || ex.type === 'DICTATION') && this.mode() === 'practice') setTimeout(() => this.play(), 300);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (this.mode() !== 'practice' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
    const r = this.result();
    if (e.key === 'Enter') {
      e.preventDefault();
      if (r) this.done.emit(r);
      else if (this.hasAnswer()) this.check();
      return;
    }
    const n = Number(e.key);
    if (!r && this.kind() === 'choice' && n >= 1 && n <= this.options().length) this.choose(this.options()[n - 1]);
  }

  protected play(rate?: number): void {
    const ex = this.exercise();
    if (ex.audioUrl) {
      const a = new Audio(ex.audioUrl);
      if (rate) a.playbackRate = rate;
      a.play().catch(() => undefined);
    } else {
      this.speech.speak(ex.audioText ?? ex.question ?? '', this.speechLang(), rate ?? 0.95);
    }
  }

  protected expectedText(): string {
    return expectedDisplay(this.exercise(), (v) => this.i18n.l(v), (k) => this.i18n.t(k));
  }

  protected label(value: string): string {
    const l = this.exercise().labels?.[value];
    return l ? this.i18n.l(l) : value;
  }

  protected choose(v: string | boolean): void {
    this.setAnswer(v);
  }

  protected setText(v: string): void {
    this.text.set(v);
    this.setAnswer(v.trim() ? v : null);
  }

  protected pick(id: number): void {
    const t = this.bank().find((x) => x.id === id);
    if (!t || t.used) return;
    this.bank.update((b) => b.map((x) => (x.id === id ? { ...x, used: true } : x)));
    this.picked.update((p) => [...p, { id, text: t.text }]);
    this.syncOrder();
  }

  protected unpick(index: number): void {
    const t = this.picked()[index];
    this.picked.update((p) => p.filter((_, i) => i !== index));
    this.bank.update((b) => b.map((x) => (x.id === t.id ? { ...x, used: false } : x)));
    this.syncOrder();
  }

  protected selectLeft(l: string): void {
    this.activeLeft.set(this.activeLeft() === l ? null : l);
  }

  protected selectRight(r: string): void {
    const l = this.activeLeft();
    if (!l) return;
    const m = new Map(this.pairs());
    for (const [k, v] of m) if (v === r) m.delete(k);
    m.set(l, r);
    this.pairs.set(m);
    this.activeLeft.set(null);
    this.setAnswer(m.size === this.leftItems().length ? [...m.entries()] : m.size ? [...m.entries()] : null);
  }

  protected async record(): Promise<void> {
    if (this.speech.listening()) {
      this.speech.stopListening();
      return;
    }
    try {
      const t = await this.speech.listen(this.speechLang());
      this.text.set(t);
      this.setAnswer(t || null);
      if (!t) this.sttFailed.set(true);
    } catch {
      this.text.set('');
      this.sttFailed.set(true);
    }
  }

  protected selfGrade(ok: boolean): void {
    const r: CheckResult = { correct: ok, score: ok ? 1 : 0, expected: this.exercise().audioText ?? '' };
    this.result.set(r);
    playSfx(ok ? 'correct' : 'wrong');
    if (this.mode() === 'exam') this.answerChange.emit(ok ? (this.exercise().audioText ?? '') : '');
  }

  protected hasAnswer(): boolean {
    const a = this.answer();
    if (a == null) return false;
    if (this.kind() === 'match') return (a as unknown[]).length === this.leftItems().length;
    return Array.isArray(a) ? a.length > 0 : a !== '';
  }

  private gradedAnswer(): UserAnswer {
    const a = this.answer();
    if (typeof a === 'string' && this.kanaPreview()) return romajiToHiragana(a, true);
    return a;
  }

  check(): void {
    if (!this.hasAnswer() || this.result()) return;
    const r = checkAnswer(this.exercise(), this.gradedAnswer());
    this.result.set(r);
    playSfx(r.correct ? 'correct' : 'wrong');
    if (!r.correct) {
      this.shake.set(true);
      setTimeout(() => this.shake.set(false), 350);
    }
  }

  protected optionClass(opt: string): string {
    const r = this.result();
    const selected = this.answer() === opt;
    if (r) {
      if ((this.exercise().answers ?? []).includes(opt)) return 'border-success bg-success/10 text-success';
      if (selected) return 'border-error bg-error/10 text-error';
      return 'border-line opacity-60';
    }
    return selected ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface hover:border-primary/50';
  }

  protected tfClass(v: boolean): string {
    const r = this.result();
    const selected = this.answer() === v;
    if (r) {
      if (this.exercise().correct === v) return 'border-success bg-success/10 text-success';
      if (selected) return 'border-error bg-error/10 text-error';
      return 'border-line opacity-60';
    }
    return selected ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface hover:border-primary/50';
  }

  protected matchClass(side: 'l' | 'r', value: string): string {
    const m = this.pairs();
    const r = this.result();
    const paired = side === 'l' ? m.has(value) : [...m.values()].includes(value);
    if (r) {
      const left = side === 'l' ? value : [...m.entries()].find(([, v]) => v === value)?.[0];
      const ok = (this.exercise().pairs ?? []).some(([a, b]) => a === left && b === m.get(left!));
      return ok ? 'border-success bg-success/10' : 'border-error bg-error/10';
    }
    if (side === 'l' && this.activeLeft() === value) return 'border-primary bg-primary-soft text-primary';
    if (paired) {
      const idx = side === 'l' ? [...m.keys()].indexOf(value) : [...m.values()].indexOf(value);
      return PAIR_COLORS[idx % PAIR_COLORS.length];
    }
    return 'border-line bg-surface hover:border-primary/50';
  }

  private syncOrder(): void {
    const words = this.picked().map((p) => p.text);
    this.setAnswer(words.length ? words : null);
  }

  private setAnswer(a: UserAnswer): void {
    this.answer.set(a);
    if (this.mode() === 'exam') this.answerChange.emit(a);
  }

  private restore(a: UserAnswer): void {
    if (a == null) return;
    this.answer.set(a);
    if (typeof a === 'string') this.text.set(a);
    if (this.kind() === 'match' && Array.isArray(a)) this.pairs.set(new Map(a as [string, string][]));
    if (this.kind() === 'order' && Array.isArray(a)) {
      const bank = this.bank().slice();
      const picked: { id: number; text: string }[] = [];
      for (const w of a as string[]) {
        const t = bank.find((x) => x.text === w && !x.used);
        if (t) {
          t.used = true;
          picked.push({ id: t.id, text: t.text });
        }
      }
      this.bank.set(bank);
      this.picked.set(picked);
    }
  }
}

const PAIR_COLORS = [
  'border-sky-400 bg-sky-400/10',
  'border-amber-400 bg-amber-400/10',
  'border-fuchsia-400 bg-fuchsia-400/10',
  'border-emerald-400 bg-emerald-400/10',
  'border-rose-400 bg-rose-400/10',
  'border-violet-400 bg-violet-400/10',
];
