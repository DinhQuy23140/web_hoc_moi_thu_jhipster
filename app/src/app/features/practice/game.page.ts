import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { CheckResult } from '../../core/exercise-check';
import { XP } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService } from '../../core/learn-context.service';
import { Exercise, Vocabulary } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { dateKey, sample } from '../../core/utils';
import { confetti } from '../../shared/confetti';
import { IconComponent } from '../../shared/icon.component';
import { playSfx } from '../../shared/sfx';
import { EmptyComponent, MedalComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';
import { ExerciseComponent } from '../lesson/exercise.component';
import { GameScore, MatchGameComponent, QuizGameComponent, ScrambleGameComponent } from './game-components';
import { GAMES, GameId, QuizQuestion, dailyChallenge, dictationExercises, kanaQuiz, listenQuiz, meaningQuiz } from './games';

@Component({
  selector: 'app-game',
  imports: [
    RouterLink,
    IconComponent,
    SpinnerComponent,
    EmptyComponent,
    ProgressBarComponent,
    MedalComponent,
    ExerciseComponent,
    QuizGameComponent,
    MatchGameComponent,
    ScrambleGameComponent,
    ...I18N_PIPES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page max-w-6xl 2xl:max-w-7xl">
      <a routerLink="/practice" class="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg">
        <app-icon name="chevronLeft" [size]="16" /> {{ 'practice.title' | t }}
      </a>
      <h1 class="page-title mb-6 mt-2">{{ 'practice.games.' + game() + '.t' | t }}</h1>

     <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="min-w-0">
      @if (loading()) {
        <app-spinner />
      } @else if (score(); as s) {
        <div class="card animate-pop p-8 text-center">
          <app-medal [icon]="s.correct / Math.max(1, s.total) >= 0.8 ? 'trophy' : 'gamepad'" [tone]="s.correct / Math.max(1, s.total) >= 0.8 ? 'gold' : 'accent'" />
          <p class="mt-4 font-display text-4xl font-black">{{ s.correct }} / {{ s.total }}</p>
          <p class="mt-1 text-muted">+{{ xp() }} XP</p>
          @if (newBest()) { <p class="chip-primary animate-pop mt-3"><app-icon name="award" [size]="14" /> {{ 'practice.newBest' | t }}</p> }
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            @if (game() !== 'challenge') { <button class="btn-primary" (click)="start()"><app-icon name="refresh" [size]="18" /> {{ 'practice.playAgain' | t }}</button> }
            <a routerLink="/practice" class="btn-outline">{{ 'practice.otherGames' | t }}</a>
          </div>
        </div>
      } @else if (!pool().length && game() !== 'kana') {
        <app-empty icon="gamepad" [text]="'practice.noData' | t" />
      } @else if (game() === 'challenge' || game() === 'dictation') {
        @if (game() === 'challenge' && challengeDone() && !replay()) {
          <div class="card p-6 text-center">
            <span class="animate-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><app-icon name="checkCircle" [size]="36" [draw]="true" /></span>
            <p class="mt-2 font-bold">{{ 'practice.challengeDone' | t }}</p>
            <button class="btn-outline mt-4" (click)="replay.set(true)">{{ 'practice.playAgain' | t }}</button>
          </div>
        } @else if (exercises()[exIndex()]; as ex) {
          <div class="mb-5 flex items-center gap-3">
            <app-progress-bar class="flex-1" [value]="(exIndex() / exercises().length) * 100" />
            <span class="text-sm font-semibold text-muted">{{ exIndex() + 1 }}/{{ exercises().length }}</span>
          </div>
          @for (k of [ex.id]; track k) {
            <app-exercise [exercise]="ex" [speechLang]="ctx.info().speech" (done)="onExercise(ex, $event)" />
          }
        } @else {
          <app-empty icon="headphones" [text]="'practice.noData' | t" />
        }
      } @else {
        @switch (game()) {
          @case ('match') {
            @for (k of [round()]; track k) { <app-match-game [words]="words()" [speechLang]="ctx.info().speech" (finished)="finish($event)" /> }
          }
          @case ('scramble') {
            @for (k of [round()]; track k) { <app-scramble-game [words]="words()" [speechLang]="ctx.info().speech" (finished)="finish($event)" /> }
          }
          @case ('kana') {
            <div class="mb-4 inline-flex rounded-xl bg-surface-2 p-1">
              @for (s of kanaScripts; track s) {
                <button class="min-h-9 rounded-lg px-3 text-sm font-bold" [class]="kanaScript() === s ? 'bg-surface shadow-sm' : 'text-muted'" (click)="setKana(s)">{{ 'practice.' + s | t }}</button>
              }
            </div>
            @for (k of [round()]; track k) { <app-quiz-game [questions]="quiz()" speechLang="ja-JP" (finished)="finish($event)" /> }
          }
          @default {
            @for (k of [round()]; track k) { <app-quiz-game [questions]="quiz()" [timeLimit]="game() === 'speed' ? 60 : 0" [speechLang]="ctx.info().speech" (finished)="finish($event)" /> }
          }
        }
      }
      </div>

      <aside class="space-y-4 lg:sticky lg:top-20">
        @if (info(); as g) {
          <section class="card p-5">
            <div class="flex items-center gap-3">
              <span class="rounded-2xl p-3 text-white" [style.background]="g.color"><app-icon [name]="g.icon" [size]="24" [duotone]="false" /></span>
              <p class="font-display text-lg font-black">{{ 'practice.games.' + g.id + '.t' | t }}</p>
            </div>
            <p class="mt-3 text-sm text-muted">{{ 'practice.games.' + g.id + '.d' | t }}</p>
            @if (bestScore(); as b) {
              <p class="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm font-bold text-accent"><app-icon name="award" [size]="18" /> {{ 'practice.best' | t }}: {{ b }}</p>
            }
          </section>
        }
        <section class="card hidden p-3 lg:block">
          <p class="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-muted">{{ 'practice.otherGames' | t }}</p>
          @for (o of others(); track o.id) {
            <a [routerLink]="['/practice', o.id]" class="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition hover:bg-surface-2">
              <span class="rounded-lg p-1.5 text-white transition-transform group-hover:scale-110" [style.background]="o.color"><app-icon [name]="o.icon" [size]="16" [duotone]="false" /></span>
              <span class="flex-1">{{ 'practice.games.' + o.id + '.t' | t }}</span>
              <app-icon name="chevronRight" [size]="16" class="text-muted transition-transform group-hover:translate-x-0.5" />
            </a>
          }
        </section>
      </aside>
     </div>
    </div>
  `,
})
export class GamePage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly i18n = inject(I18nService);
  protected readonly ctx = inject(LearnContextService);
  readonly game = input.required<GameId>();
  protected readonly Math = Math;

  protected readonly loading = signal(true);
  protected readonly pool = signal<Vocabulary[]>([]);
  protected readonly quiz = signal<QuizQuestion[]>([]);
  protected readonly words = signal<Vocabulary[]>([]);
  protected readonly exercises = signal<Exercise[]>([]);
  protected readonly exIndex = signal(0);
  protected readonly score = signal<GameScore | null>(null);
  protected readonly xp = signal(0);
  protected readonly newBest = signal(false);
  protected readonly round = signal(0);
  protected readonly replay = signal(false);
  protected readonly kanaScripts = ['hira', 'kata', 'mix'] as const;
  protected readonly kanaScript = signal<'hira' | 'kata' | 'mix'>('hira');
  private challengeCorrect = 0;
  private started = Date.now();

  protected readonly challengeDone = computed(() => localStorage.getItem(`lingora.challenge.${this.ctx.target()}`) === dateKey());
  protected readonly info = computed(() => GAMES.find((g) => g.id === this.game()));
  protected readonly others = computed(() => GAMES.filter((g) => g.id !== this.game() && (!g.only || g.only === this.ctx.target())));
  protected readonly bestScore = computed(() => {
    this.score();
    return localStorage.getItem(`lingora.best.${this.game()}.${this.ctx.target()}`);
  });

  constructor() {
    effect(() => {
      const lang = this.ctx.target();
      this.game();
      untracked(() => this.load(lang));
    });
  }

  protected setKana(s: 'hira' | 'kata' | 'mix'): void {
    this.kanaScript.set(s);
    this.start();
  }

  private async load(lang: string): Promise<void> {
    this.loading.set(true);
    try {
      this.pool.set(await this.content.vocabPool(lang));
      this.start();
    } finally {
      this.loading.set(false);
    }
  }

  protected start(): void {
    const pool = this.pool();
    const jp = this.ctx.target() === 'ja';
    const loc = this.i18n.locale();
    this.score.set(null);
    this.newBest.set(false);
    this.started = Date.now();
    this.round.update((r) => r + 1);
    switch (this.game()) {
      case 'challenge':
        this.exercises.set(dailyChallenge(pool, dateKey(), this.ctx.target(), loc));
        this.exIndex.set(0);
        this.challengeCorrect = 0;
        break;
      case 'dictation':
        this.exercises.set(dictationExercises(pool, 8, jp));
        this.exIndex.set(0);
        this.challengeCorrect = 0;
        break;
      case 'match':
        this.words.set(sample(pool.filter((w) => w.word.length <= 14), 6));
        break;
      case 'scramble':
        this.words.set(
          sample(
            pool.filter((w) => {
              const s = jp ? w.reading || w.word : w.word;
              return /^[^\s]+$/.test(s) && s.length >= (jp ? 2 : 3) && s.length <= (jp ? 6 : 9);
            }),
            8,
          ),
        );
        break;
      case 'kana':
        this.quiz.set(kanaQuiz(15, this.kanaScript()));
        break;
      case 'listen':
        this.quiz.set(listenQuiz(pool, 10, loc, jp));
        break;
      default:
        this.quiz.set(meaningQuiz(pool, 60, loc, jp));
    }
  }

  protected onExercise(ex: Exercise, r: CheckResult): void {
    if (r.correct) this.challengeCorrect++;
    else {
      const game = this.game();
      this.progress
        .recordMistake({
          exercise: ex,
          source: game === 'challenge' ? 'challenge' : 'game',
          refId: game === 'challenge' ? `challenge.${this.ctx.target()}.${dateKey()}` : `dictation.${this.ctx.target()}`,
          title: this.i18n.t(`practice.games.${game}.t`),
          languageId: this.ctx.target(),
        })
        .catch(() => undefined);
    }
    if (this.exIndex() + 1 >= this.exercises().length) {
      this.finish({ correct: this.challengeCorrect, total: this.exercises().length });
    } else {
      this.exIndex.update((i) => i + 1);
    }
  }

  protected async finish(s: GameScore): Promise<void> {
    this.score.set(s);
    playSfx('finish');
    const ratio = s.correct / Math.max(1, s.total);
    if (ratio >= 0.8) confetti(70);
    const game = this.game();
    const lang = this.ctx.target();

    let xp = game === 'dictation' ? s.correct * XP.exerciseCorrect : s.correct;
    if (ratio >= 0.8) xp += XP.gameWin;
    if (game === 'challenge') {
      xp = s.correct * XP.exerciseCorrect;
      if (!this.challengeDone()) {
        xp += XP.dailyChallenge;
        localStorage.setItem(`lingora.challenge.${lang}`, dateKey());
      }
    }
    this.xp.set(xp);

    const bestKey = `lingora.best.${game}.${lang}`;
    const prev = Number(localStorage.getItem(bestKey) ?? 0);
    if (s.correct > prev) {
      localStorage.setItem(bestKey, String(s.correct));
      this.newBest.set(prev > 0);
    }

    const seconds = Math.round((Date.now() - this.started) / 1000);
    await this.progress.recordActivity({ xp, minutes: seconds / 60, exercises: s.total }).catch(console.error);
    await this.progress
      .logAttempt({
        kind: game === 'challenge' ? 'challenge' : 'game',
        refId: `${game}.${lang}`,
        title: this.i18n.t(`practice.games.${game}.t`),
        score: Math.round(ratio * 100),
        correct: s.correct,
        total: s.total,
        durationSec: seconds,
      })
      .catch(() => undefined);
  }
}
