import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { XP } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { kanaEquals, romajiToHiragana } from '../../core/kana-convert';
import { CharStrokes, KanjiVgService } from '../../core/kanjivg.service';
import { L10n } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SpeechService } from '../../core/speech.service';
import { isWritable } from '../../core/stroke-match';
import { normalizeAnswer, sample } from '../../core/utils';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { PadMode, PadResult, StrokePadComponent } from '../../shared/stroke-pad.component';
import { EmptyComponent, MedalComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';
import { KANA, KANA_ROWS } from '../practice/kana';

type Source = 'hira' | 'kata' | 'vocab' | 'deck';
type WMode = PadMode | 'type';

interface WItem {
  text: string;
  reading?: string;
  romaji?: string;
  meaning?: L10n;
  audio: string;
}

interface CharState {
  char: string;
  strokes: CharStrokes | null | undefined;
  mistakes: number;
  total: number;
  done: boolean;
}

const MASTERED_KEY = 'lingora.writing.mastered';
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Japanese writing practice: stroke-order animation, tracing and writing from memory
 * with per-stroke checking (KanjiVG data), plus a typing mode that accepts romaji.
 */
@Component({
  selector: 'app-writing',
  imports: [FormsModule, RouterLink, IconComponent, SpinnerComponent, EmptyComponent, MedalComponent, ProgressBarComponent, StrokePadComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page max-w-6xl 2xl:max-w-7xl">
      <a routerLink="/practice" class="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg">
        <app-icon name="chevronLeft" [size]="16" /> {{ 'practice.title' | t }}
      </a>
      <h1 class="page-title mt-2">{{ 'writing.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'writing.sub' | t }}</p>

      @if (phase() === 'setup') {
        <section class="card mt-6 grid gap-6 p-5 lg:grid-cols-2 lg:gap-8 lg:p-7">
         <div class="space-y-5">
          <div>
            <p class="label">{{ 'writing.source' | t }}</p>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              @for (s of sources; track s) {
                <button class="btn text-sm" [class]="source() === s ? 'btn-primary' : 'btn-outline'" (click)="setSource(s)">{{ 'writing.src.' + s | t }}</button>
              }
            </div>
          </div>
          @if (source() === 'vocab') {
            <div>
              <p class="label">{{ 'writing.level' | t }}</p>
              <div class="flex flex-wrap gap-2">
                @for (l of levels; track l) {
                  <button class="chip-toggle !min-h-9" [attr.aria-pressed]="level() === l" (click)="level.set(l)">{{ l }}</button>
                }
              </div>
            </div>
          }
          <div>
            <p class="label">{{ 'writing.count' | t }}</p>
            <div class="flex gap-2">
              @for (n of counts; track n) {
                <button class="chip-toggle !min-h-9 min-w-12 justify-center" [attr.aria-pressed]="count() === n" (click)="count.set(n)">{{ n }}</button>
              }
            </div>
          </div>
          <div class="rounded-2xl bg-surface-2 p-4">
            <p class="flex items-center gap-2 text-sm font-bold"><app-icon name="award" [size]="18" class="text-warning" /> {{ 'writing.mastered' | t: { n: masteredCount() } }}</p>
            <p class="mt-1 text-xs text-muted"><a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener" class="underline">{{ 'writing.attribution' | t }}</a></p>
          </div>
         </div>
         <div class="flex flex-col gap-5">
          <div>
            <p class="label">{{ 'writing.modeLabel' | t }}</p>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              @for (m of availableModes(); track m) {
                <button class="flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition" [class]="mode() === m ? 'border-primary bg-primary-soft' : 'border-line hover:border-primary/40'" [attr.aria-pressed]="mode() === m" (click)="mode.set(m)">
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition" [class]="mode() === m ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted'"><app-icon [name]="modeIcon[m]" [size]="20" /></span>
                  <span><b class="block">{{ 'writing.mode.' + m | t }}</b><span class="text-sm text-muted">{{ 'writing.modeHint.' + m | t }}</span></span>
                </button>
              }
            </div>
          </div>
          <div class="mt-auto space-y-2">
            <button class="btn-primary w-full" (click)="start()" [disabled]="loading()"><app-icon name="pen" [size]="18" /> {{ 'writing.start' | t }}</button>
            @if (error()) { <p class="text-sm text-error">{{ error() | t }}</p> }
          </div>
         </div>
        </section>

        <section class="card mt-6 p-5 lg:p-7">
          <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-black">{{ 'practice.kanaChart' | t }} · {{ (chartKata() ? 'practice.kata' : 'practice.hira') | t }}</h2>
              <p class="text-sm text-muted">{{ 'writing.chartHint' | t }}</p>
            </div>
            <span class="chip-success"><app-icon name="checkCircle" [size]="14" /> {{ chartMastered() }} / {{ kanaCount }}</span>
          </div>
          <div class="grid grid-cols-5 gap-2 lg:grid-flow-col lg:grid-cols-none lg:grid-rows-5">
            @for (k of kanaCells; track $index) {
              @if (k[0]) {
                <div class="jp flex aspect-square flex-col items-center justify-center rounded-xl border transition lg:aspect-auto lg:py-2"
                  [class]="mastered().has(chartKata() ? k[1] : k[0]) ? 'border-success/40 bg-success/10 text-success' : 'border-line bg-surface-2/60'">
                  <span class="text-2xl font-bold leading-none">{{ chartKata() ? k[1] : k[0] }}</span>
                  <span class="mt-1 text-[10px] font-semibold text-muted">{{ k[2] }}</span>
                </div>
              } @else {
                <span aria-hidden="true"></span>
              }
            }
          </div>
        </section>
      } @else if (phase() === 'result') {
        <div class="card animate-pop mx-auto mt-6 max-w-2xl p-8 text-center">
          <app-medal [icon]="correct() / Math.max(1, items().length) >= 0.8 ? 'trophy' : 'pen'" [tone]="correct() / Math.max(1, items().length) >= 0.8 ? 'gold' : 'primary'" />
          <p class="mt-3 font-display text-4xl font-black">{{ correct() }} / {{ items().length }}</p>
          <p class="mt-1 text-muted">+{{ xp() }} XP</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <button class="btn-primary" (click)="start()"><app-icon name="refresh" [size]="18" /> {{ 'practice.playAgain' | t }}</button>
            <button class="btn-outline" (click)="phase.set('setup')">{{ 'writing.changeSettings' | t }}</button>
          </div>
        </div>
      } @else if (current(); as item) {
        <div class="mt-6 flex items-center gap-3">
          <app-progress-bar class="flex-1" [value]="(index() / items().length) * 100" />
          <span class="text-sm font-semibold text-muted">{{ index() + 1 }}/{{ items().length }}</span>
          <button class="btn-ghost !min-h-9 !px-2" (click)="phase.set('setup')" [attr.aria-label]="'common.close' | t"><app-icon name="close" [size]="18" /></button>
        </div>

       <div class="mt-4 grid items-start gap-6 lg:grid-cols-2">
        <div class="space-y-5 lg:sticky lg:top-20">
        <section class="card p-5 text-center lg:p-8">
          @if (mode() === 'recall' || mode() === 'type') {
            @if (item.meaning) { <p class="font-display text-2xl font-black">{{ item.meaning | loc }}</p> }
            @if (item.reading && mode() === 'recall') { <p class="jp mt-1 text-lg text-muted">{{ item.reading }}</p> }
            @if (!item.meaning) { <p class="font-display text-3xl font-black">{{ item.romaji }}</p> }
          } @else {
            <p class="jp font-display text-4xl font-black">{{ item.text }}</p>
            <p class="mt-1 text-muted"><span class="jp">{{ item.reading }}</span> @if (item.romaji) { · {{ item.romaji }} } @if (item.meaning) { · {{ item.meaning | loc }} }</p>
          }
          <button class="btn-soft mt-3 !min-h-9 text-sm" (click)="say(item.audio)"><app-icon name="volume" [size]="16" /> {{ 'common.listen' | t }}</button>
        </section>
        @if (mode() !== 'type') {
          <div class="flex flex-wrap justify-center gap-2" aria-hidden="true">
            @for (c of chars(); track $index; let i = $index) {
              <span class="jp grid h-12 w-12 place-items-center rounded-xl border-2 text-2xl font-bold transition"
                [class]="c.done ? (c.mistakes ? 'border-warning text-warning' : 'border-success text-success') : i === charIndex() ? 'border-primary text-primary' : 'border-line text-muted'">
                {{ c.done || mode() !== 'recall' ? c.char : '?' }}
              </span>
            }
          </div>
        }
        </div>

        <div>
        @if (mode() === 'type') {
          <section class="space-y-3">
            <input class="input jp !min-h-14 text-center text-2xl" [ngModel]="typed()" (ngModelChange)="typed.set($event)" [disabled]="!!typeResult()"
              (keydown.enter)="typeResult() ? next() : checkTyped()" [placeholder]="'writing.typeHere' | t" autocomplete="off" autocapitalize="off" spellcheck="false" />
            @if (typed() && preview() !== typed()) { <p class="jp text-center text-lg text-muted">→ {{ preview() }}</p> }
            @if (typeResult(); as r) {
              <div class="animate-pop rounded-2xl p-4 text-center" [class]="r === 'ok' ? 'bg-success/12 text-success' : 'bg-error/12 text-error'">
                <p class="font-display text-lg font-black">{{ (r === 'ok' ? 'exercise.correct' : 'exercise.incorrect') | t }}</p>
                <p class="jp mt-1 text-2xl font-bold text-fg">{{ item.text }} @if (item.reading && item.reading !== item.text) { <span class="text-base text-muted">（{{ item.reading }}）</span> }</p>
              </div>
              <button class="btn-primary w-full" (click)="next()">{{ 'common.continue' | t }}</button>
            } @else {
              <div class="grid grid-cols-2 gap-3">
                <button class="btn-outline" (click)="revealFirst()"><app-icon name="lightbulb" [size]="18" class="text-warning" /> {{ 'writing.firstChar' | t }}</button>
                <button class="btn-primary" (click)="checkTyped()" [disabled]="!typed().trim()">{{ 'exercise.check' | t }}</button>
              </div>
            }
          </section>
        } @else {
          <div class="card p-4">
            @if (currentChar(); as c) {
              @if (c.strokes === undefined) {
                <app-spinner />
              } @else if (c.strokes === null) {
                <app-empty icon="pen" [text]="'writing.noStrokes' | t"><button class="btn-outline" (click)="skipChar()">{{ 'practice.skip' | t }}</button></app-empty>
              } @else {
                @for (k of [padKey()]; track k) {
                  <app-stroke-pad [data]="c.strokes" [mode]="padMode()" (done)="onCharDone($event)" />
                }
              }
            }
          </div>

          @if (mode() === 'watch') {
            <button class="btn-primary mt-4 w-full" (click)="advanceChar()">{{ 'common.next' | t }}</button>
          } @else if (wordDone()) {
            <div class="animate-pop mt-4 rounded-2xl p-4 text-center" [class]="wordOk() ? 'bg-success/12' : 'bg-warning/12'">
              <p class="font-display text-lg font-black" [class]="wordOk() ? 'text-success' : 'text-warning'">
                {{ (wordOk() ? 'writing.wordGood' : 'writing.wordPractice') | t }} · {{ 'writing.accuracy' | t }} {{ wordAccuracy() }}%
              </p>
            </div>
            <button class="btn-primary mt-3 w-full" (click)="next()">{{ 'common.continue' | t }}</button>
          }
        }
        </div>
       </div>
      } @else {
        <app-spinner />
      }
    </div>
  `,
})
export class WritingPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly kvg = inject(KanjiVgService);
  private readonly speech = inject(SpeechService);
  private readonly i18n = inject(I18nService);
  protected readonly Math = Math;

  protected readonly sources: Source[] = ['hira', 'kata', 'vocab', 'deck'];
  protected readonly levels = LEVELS;
  protected readonly counts = [5, 10, 15];
  protected readonly modeIcon: Record<WMode, string> = { watch: 'eye', trace: 'pen', recall: 'sparkles', type: 'edit' };

  protected readonly phase = signal<'setup' | 'play' | 'result'>('setup');
  protected readonly source = signal<Source>('hira');
  protected readonly level = signal('N5');
  protected readonly mode = signal<WMode>('trace');
  protected readonly count = signal(10);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly items = signal<WItem[]>([]);
  protected readonly index = signal(0);
  protected readonly chars = signal<CharState[]>([]);
  protected readonly charIndex = signal(0);
  protected readonly padKey = signal(0);
  protected readonly correct = signal(0);
  protected readonly xp = signal(0);
  protected readonly typed = signal('');
  protected readonly typeResult = signal<'ok' | 'bad' | null>(null);
  protected readonly mastered = signal(readMastered());
  protected readonly masteredCount = computed(() => this.mastered().size);
  protected readonly kanaCells = KANA_ROWS.flat();
  protected readonly kanaCount = KANA.length;
  protected readonly chartKata = computed(() => this.source() === 'kata');
  protected readonly chartMastered = computed(() => {
    const set = this.mastered();
    return KANA.filter((k) => set.has(this.chartKata() ? k.kata : k.hira)).length;
  });
  private started = Date.now();

  protected readonly current = computed(() => this.items()[this.index()]);
  protected readonly currentChar = computed(() => this.chars()[this.charIndex()]);
  protected readonly padMode = computed<PadMode>(() => (this.mode() === 'type' ? 'recall' : (this.mode() as PadMode)));
  protected readonly availableModes = computed<WMode[]>(() =>
    this.source() === 'hira' || this.source() === 'kata' ? ['watch', 'trace', 'recall'] : ['watch', 'trace', 'recall', 'type'],
  );
  protected readonly wordDone = computed(() => this.chars().length > 0 && this.chars().every((c) => c.done));
  protected readonly wordAccuracy = computed(() => {
    const cs = this.chars().filter((c) => c.total > 0);
    const total = cs.reduce((s, c) => s + c.total, 0);
    const miss = cs.reduce((s, c) => s + c.mistakes, 0);
    return total ? Math.max(0, Math.round((1 - miss / total) * 100)) : 100;
  });
  protected readonly wordOk = computed(() => this.wordAccuracy() >= 70);
  protected readonly preview = computed(() => romajiToHiragana(this.typed(), false));

  protected setSource(s: Source): void {
    this.source.set(s);
    if (!this.availableModes().includes(this.mode())) this.mode.set('trace');
  }

  protected say(text: string): void {
    this.speech.speak(text, 'ja-JP', 0.85);
  }

  protected async start(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      const items = await this.buildItems();
      if (!items.length) {
        this.error.set(this.source() === 'deck' ? 'writing.deckEmpty' : 'practice.noData');
        return;
      }
      this.items.set(items);
      this.index.set(0);
      this.correct.set(0);
      this.started = Date.now();
      this.phase.set('play');
      this.setupItem();
    } catch {
      this.error.set('common.error');
    } finally {
      this.loading.set(false);
    }
  }

  private async buildItems(): Promise<WItem[]> {
    const n = this.count();
    const src = this.source();
    if (src === 'hira' || src === 'kata') {
      return sample(KANA, n).map((k) => ({ text: src === 'hira' ? k.hira : k.kata, romaji: k.romaji, audio: k.hira }));
    }
    const fits = (w: string) => [...w].length <= 4 && [...w].every(isWritable);
    if (src === 'deck') {
      const mine = await this.progress.myWords('ja', undefined, 300);
      return sample(mine.filter((w) => fits(w.word)), n).map((w) => ({ text: w.word, reading: w.reading, meaning: w.meaning, audio: w.word }));
    }
    const pool = await this.content.vocabPool('ja', this.level());
    return sample(pool.filter((w) => fits(w.word)), n).map((w) => ({
      text: w.word,
      reading: w.reading && w.reading !== w.word ? w.reading : undefined,
      romaji: w.romaji,
      meaning: w.meaning,
      audio: w.word,
    }));
  }

  private setupItem(): void {
    const item = this.current();
    if (!item) return;
    this.typed.set('');
    this.typeResult.set(null);
    this.charIndex.set(0);
    this.padKey.update((k) => k + 1);
    const chars: CharState[] = [...item.text].map((char) => ({ char, strokes: undefined, mistakes: 0, total: 0, done: false }));
    this.chars.set(chars);
    if (this.mode() === 'type') return;
    if (this.mode() !== 'recall') this.say(item.audio);
    chars.forEach((c, i) => {
      this.kvg
        .load(c.char)
        .catch(() => null)
        .then((strokes) => {
          if (this.current() !== item) return;
          this.chars.update((cs) => cs.map((x, j) => (j === i ? { ...x, strokes, total: strokes?.paths.length ?? 0 } : x)));
        });
    });
  }

  protected onCharDone(r: PadResult): void {
    const i = this.charIndex();
    this.chars.update((cs) => cs.map((c, j) => (j === i ? { ...c, mistakes: r.mistakes, total: r.strokes, done: true } : c)));
    if (this.mode() === 'recall' && r.mistakes === 0) this.markMastered(this.chars()[i].char);
    if (i + 1 < this.chars().length) setTimeout(() => this.moveChar(i + 1), 650);
    else this.finishWord();
  }

  protected skipChar(): void {
    const i = this.charIndex();
    this.chars.update((cs) => cs.map((c, j) => (j === i ? { ...c, done: true } : c)));
    if (i + 1 < this.chars().length) this.moveChar(i + 1);
    else this.finishWord();
  }

  /** Watch mode: step through characters without scoring. */
  protected advanceChar(): void {
    const i = this.charIndex();
    if (i + 1 < this.chars().length) this.moveChar(i + 1);
    else {
      this.correct.update((c) => c + 1);
      this.next();
    }
  }

  private moveChar(i: number): void {
    this.charIndex.set(i);
    this.padKey.update((k) => k + 1);
  }

  private finishWord(): void {
    if (this.wordOk()) this.correct.update((c) => c + 1);
    this.say(this.current()!.audio);
  }

  protected checkTyped(): void {
    const item = this.current();
    const t = this.typed().trim();
    if (!item || !t || this.typeResult()) return;
    const ok = kanaEquals(t, item.reading ?? item.text) || kanaEquals(t, item.text) || normalizeAnswer(t) === normalizeAnswer(item.text);
    this.typeResult.set(ok ? 'ok' : 'bad');
    playSfx(ok ? 'correct' : 'wrong');
    if (ok) this.correct.update((c) => c + 1);
    this.say(item.audio);
  }

  protected revealFirst(): void {
    const item = this.current();
    if (!item) return;
    const target = item.reading ?? item.text;
    if (!this.typed().startsWith(target[0])) this.typed.set(target[0]);
  }

  protected next(): void {
    if (this.index() + 1 >= this.items().length) {
      this.finish();
      return;
    }
    this.index.update((i) => i + 1);
    this.setupItem();
  }

  private async finish(): Promise<void> {
    this.phase.set('result');
    playSfx('finish');
    const total = this.items().length;
    const ratio = this.correct() / Math.max(1, total);
    if (ratio >= 0.8) confetti(70);
    const xp = this.correct() * XP.exerciseCorrect + (ratio >= 0.8 ? XP.gameWin : 0);
    this.xp.set(xp);
    const seconds = Math.round((Date.now() - this.started) / 1000);
    await this.progress.recordActivity({ xp, minutes: seconds / 60, exercises: total }).catch(console.error);
    await this.progress
      .logAttempt({
        kind: 'game',
        refId: `writing.${this.source()}.${this.mode()}`,
        title: this.i18n.t('writing.title'),
        score: Math.round(ratio * 100),
        correct: this.correct(),
        total,
        durationSec: seconds,
      })
      .catch(() => undefined);
  }

  private markMastered(char: string): void {
    const set = readMastered();
    if (set.has(char)) return;
    set.add(char);
    localStorage.setItem(MASTERED_KEY, JSON.stringify([...set]));
    this.mastered.set(set);
  }
}

function readMastered(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}
