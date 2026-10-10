import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService, PLACEMENT_KEY, TARGETS, TargetLang } from '../../core/learn-context.service';
import { Certificate, Course } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { MedalComponent, SpinnerComponent } from '../../shared/ui';
import { GameScore, QuizGameComponent } from '../practice/game-components';
import { QuizQuestion, meaningQuiz } from '../practice/games';

/** Levels probed by the adaptive test, easiest first. */
const TEST_LEVELS: Record<TargetLang, string[]> = { en: ['A1', 'A2', 'B1', 'B2', 'C1'], ja: ['N5', 'N4', 'N3', 'N2', 'N1'] };
const PER_LEVEL = 5;
const PASS = 4;

/**
 * Onboarding + adaptive placement test: the learner picks a goal, then answers 5
 * vocabulary questions per level, moving up while they get at least 4/5 right. The
 * highest level passed decides which courses are recommended.
 */
@Component({
  selector: 'app-placement',
  imports: [RouterLink, IconComponent, SpinnerComponent, MedalComponent, QuizGameComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page max-w-6xl 2xl:max-w-7xl">
      <h1 class="page-title">{{ 'placement.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'placement.sub' | t }}</p>

      @switch (step()) {
        @case ('goal') {
         <div class="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section class="card space-y-5 p-5 lg:p-7">
            <div>
              <p class="label">{{ 'placement.language' | t }}</p>
              <div class="grid grid-cols-2 gap-2">
                @for (c of targetCodes; track c) {
                  <button class="btn" [class]="lang() === c ? 'btn-primary' : 'btn-outline'" (click)="setLang(c)">{{ targets[c].flag }} {{ targets[c].label }}</button>
                }
              </div>
            </div>
            <div>
              <p class="label">{{ 'placement.goal' | t }}</p>
              <div class="flex flex-wrap gap-2">
                <button class="chip-toggle !min-h-9" [attr.aria-pressed]="goal() === 'general'" (click)="goal.set('general')"><app-icon name="globe" [size]="14" /> {{ 'placement.general' | t }}</button>
                @for (c of certs(); track c.id) {
                  <button class="chip-toggle !min-h-9" [attr.aria-pressed]="goal() === c.id" (click)="goal.set(c.id)"><app-icon name="award" [size]="14" /> {{ c.code }}</button>
                }
              </div>
            </div>
            <div>
              <p class="label">{{ 'profile.dailyGoal' | t }}</p>
              <div class="grid grid-cols-5 gap-2">
                @for (g of goals; track g) {
                  <button class="btn !min-h-9 text-sm" [class]="dailyGoal() === g ? 'btn-primary' : 'btn-outline'" (click)="dailyGoal.set(g)">{{ g }}′</button>
                }
              </div>
            </div>
            @if (lang() === 'ja') {
              <div>
                <p class="label">{{ 'placement.kanaQ' | t }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <button class="btn text-sm" [class]="knowsKana() ? 'btn-primary' : 'btn-outline'" (click)="knowsKana.set(true)">{{ 'placement.kanaYes' | t }}</button>
                  <button class="btn text-sm" [class]="!knowsKana() ? 'btn-primary' : 'btn-outline'" (click)="knowsKana.set(false)">{{ 'placement.kanaNo' | t }}</button>
                </div>
              </div>
            }
            <button class="btn-primary w-full" (click)="begin()" [disabled]="busy()">{{ (lang() === 'ja' && !knowsKana() ? 'placement.seeCourses' : 'placement.startTest') | t }} <app-icon name="chevronRight" [size]="18" /></button>
          </section>

          <aside class="card bg-primary-soft/60 p-6 lg:sticky lg:top-20 lg:p-7">
            <h2 class="font-display text-lg font-black">{{ 'placement.how.title' | t }}</h2>
            <ol class="mt-5 space-y-5">
              @for (s of howSteps; track s.key; let i = $index) {
                <li class="flex gap-3">
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"><app-icon [name]="s.icon" [size]="20" [duotone]="false" /></span>
                  <div>
                    <p class="font-bold">{{ i + 1 }}. {{ 'placement.how.' + s.key + 't' | t }}</p>
                    <p class="text-sm text-muted">{{ 'placement.how.' + s.key + 'd' | t }}</p>
                  </div>
                </li>
              }
            </ol>
          </aside>
         </div>
        }
        @case ('test') {
          @if (busy()) {
            <app-spinner />
          } @else {
           <div class="mx-auto max-w-3xl">
            <div class="mt-6 mb-3 flex items-center justify-between">
              <span class="chip-primary">{{ 'placement.level' | t }} {{ levels()[levelIndex()] }}</span>
              <span class="text-sm font-semibold text-muted">{{ levelIndex() + 1 }}/{{ levels().length }}</span>
            </div>
            @for (k of [round()]; track k) {
              <app-quiz-game [questions]="quiz()" [speechLang]="targets[lang()].speech" (finished)="onRound($event)" />
            }
           </div>
          }
        }
        @case ('result') {
         <div class="mt-6 grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div class="space-y-4 lg:sticky lg:top-20">
          <section class="card animate-pop p-6 text-center">
            <app-medal icon="target" tone="primary" />
            <p class="mt-3 text-muted">{{ 'placement.yourLevel' | t }}</p>
            <p class="font-display text-5xl font-black text-primary">{{ resultLevel() }}</p>
            @if (lang() === 'en') { <p class="mt-1 text-sm text-muted">CEFR</p> }
            <p class="mt-3 text-sm text-muted">{{ 'placement.resultNote' | t }}</p>
          </section>
          <div class="flex flex-wrap gap-3">
            <button class="btn-outline" (click)="step.set('goal')"><app-icon name="refresh" [size]="16" /> {{ 'placement.retake' | t }}</button>
            <a routerLink="/dashboard" class="btn-ghost">{{ 'common.backHome' | t }}</a>
          </div>
          </div>
          <div>
          <h2 class="font-display text-lg font-black">{{ 'placement.recommended' | t }}</h2>
          <div class="stagger mt-3 grid gap-3 xl:grid-cols-2">
            @for (c of recommended(); track c.id) {
              <a [routerLink]="['/courses', c.id]" class="card flex items-center gap-4 p-4 card-hover">
                <div class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl" [style.background]="c.color + '22'">{{ c.emoji }}</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-bold">{{ c.title | loc }}</p>
                  <p class="line-clamp-2 text-sm text-muted">{{ c.subtitle | loc }}</p>
                  <p class="mt-1 text-xs font-semibold text-muted">{{ c.lessonCount }} {{ 'courses.lessons' | t }} · {{ c.level }} · {{ c.cefr }}</p>
                </div>
                <app-icon name="chevronRight" />
              </a>
            } @empty {
              <a routerLink="/courses" class="btn-primary">{{ 'dashboard.pickCourse' | t }}</a>
            }
          </div>
          </div>
         </div>
        }
      }
    </div>
  `,
})
export class PlacementPage {
  protected readonly howSteps = [
    { key: 's1', icon: 'target' },
    { key: 's2', icon: 'layers' },
    { key: 's3', icon: 'sparkles' },
  ];
  private readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  private readonly ctx = inject(LearnContextService);

  protected readonly targets = TARGETS;
  protected readonly targetCodes = Object.keys(TARGETS) as TargetLang[];
  protected readonly goals = [5, 10, 15, 20, 30];

  protected readonly step = signal<'goal' | 'test' | 'result'>('goal');
  protected readonly lang = signal<TargetLang>(this.ctx.target());
  protected readonly goal = signal<string>('general');
  protected readonly dailyGoal = signal(this.auth.profile()?.dailyGoal ?? 15);
  protected readonly knowsKana = signal(true);
  protected readonly busy = signal(false);
  protected readonly allCerts = signal<Certificate[]>([]);
  protected readonly courses = signal<Course[]>([]);
  protected readonly levelIndex = signal(0);
  protected readonly passed = signal(0);
  protected readonly quiz = signal<QuizQuestion[]>([]);
  protected readonly round = signal(0);
  protected readonly resultLevel = signal('');

  protected readonly levels = computed(() => TEST_LEVELS[this.lang()]);
  protected readonly certs = computed(() => this.allCerts().filter((c) => c.languageId === this.lang()));
  protected readonly recommended = computed(() => {
    const lvl = this.resultLevel();
    const mine = this.courses().filter((c) => c.languageId === this.lang());
    const goal = this.goal();
    const sameLevel = mine.filter((c) => c.level === lvl || c.cefr === cefrOf(lvl, this.lang()));
    const forGoal = goal === 'general' ? [] : sameLevel.filter((c) => c.certificateId === goal);
    const general = sameLevel.filter((c) => !c.certificateId || c.level === lvl);
    return [...new Map([...forGoal, ...general, ...sameLevel].map((c) => [c.id, c])).values()].slice(0, 3);
  });

  constructor() {
    this.content.certificates().then((c) => this.allCerts.set(c)).catch(() => undefined);
    this.content.courses().then((c) => this.courses.set(c)).catch(() => undefined);
  }

  protected setLang(l: TargetLang): void {
    this.lang.set(l);
    this.goal.set('general');
  }

  protected async begin(): Promise<void> {
    const lang = this.lang();
    if (this.ctx.target() !== lang) this.ctx.set(lang);
    if (this.auth.profile() && this.dailyGoal() !== this.auth.profile()!.dailyGoal) {
      this.auth.updateProfileData({ dailyGoal: this.dailyGoal() }).catch(() => undefined);
    }
    if (lang === 'ja' && !this.knowsKana()) {
      this.finish('KANA');
      return;
    }
    this.levelIndex.set(0);
    this.passed.set(0);
    this.step.set('test');
    await this.loadRound();
  }

  private async loadRound(): Promise<void> {
    this.busy.set(true);
    try {
      const pool = await this.content.vocabPool(this.lang(), this.levels()[this.levelIndex()]);
      this.quiz.set(meaningQuiz(pool, PER_LEVEL, this.i18n.locale(), this.lang() === 'ja'));
      this.round.update((r) => r + 1);
    } finally {
      this.busy.set(false);
    }
    if (this.quiz().length < PER_LEVEL) this.finish(this.levels()[Math.max(0, this.passed() - 1)] ?? this.levels()[0]);
  }

  protected async onRound(s: GameScore): Promise<void> {
    const levels = this.levels();
    if (s.correct >= PASS) {
      this.passed.update((p) => p + 1);
      if (this.levelIndex() + 1 < levels.length) {
        this.levelIndex.update((i) => i + 1);
        await this.loadRound();
        return;
      }
    }
    // Recommend the first level not yet mastered (or the top level if all were passed).
    this.finish(levels[Math.min(this.passed(), levels.length - 1)]);
  }

  private finish(level: string): void {
    this.resultLevel.set(level);
    localStorage.setItem(PLACEMENT_KEY + this.lang(), level);
    this.step.set('result');
  }
}

function cefrOf(level: string, lang: TargetLang): string {
  if (lang === 'en') return level;
  return { KANA: 'Pre-A1', N5: 'A1', N4: 'A2', N3: 'B1', N2: 'B2', N1: 'C1' }[level] ?? level;
}
