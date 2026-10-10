import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContentService } from '../../core/content.service';
import { QuestDef, QuestMetric, dailyQuests, levelFromXp, questValue, visibleStreak } from '../../core/gamification';
import { ToastService } from '../../core/toast.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService, PLACEMENT_KEY } from '../../core/learn-context.service';
import { Course, CourseProgress, LessonSummary, Vocabulary } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SessionService, SessionSummary } from '../../core/session.service';
import { SpeechService } from '../../core/speech.service';
import { addDays, dateKey, seededRandom } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent, RingComponent } from '../../shared/ui';

function questKey(day: string, id: string): string {
  return `lingora.quest.${day}.${id}`;
}

interface ContinueItem {
  course: Course;
  progress: CourseProgress;
  next: LessonSummary | null;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, IconComponent, ProgressBarComponent, RingComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Below xl both columns use display:contents, so their children share one flow ordered by order-*. -->
    <div class="page flex flex-col gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_25rem]">
     <div class="contents xl:col-start-1 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
      <section class="order-1 flex flex-wrap items-end justify-between gap-4 lg:col-span-2">
        <div>
          <p class="text-muted">{{ greeting() | t }},</p>
          <h1 class="page-title">{{ auth.profile()?.displayName }} 👋</h1>
        </div>
        <div class="w-full max-w-xs">
          <div class="mb-1 flex justify-between text-sm font-semibold">
            <span>{{ 'dashboard.level' | t }} {{ level().level }}</span>
            <span class="text-muted">{{ level().current }}/{{ level().needed }} XP</span>
          </div>
          <app-progress-bar [value]="(level().current / level().needed) * 100" />
        </div>
      </section>

      @if (showPlacement()) {
        <a routerLink="/placement" class="card card-hover group order-2 flex items-center gap-4 border-primary/40 bg-primary-soft p-4 lg:col-span-2">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary transition-transform group-hover:rotate-12"><app-icon name="target" [size]="24" /></span>
          <div class="flex-1"><p class="font-bold text-primary">{{ 'placement.bannerTitle' | t }}</p><p class="text-sm text-muted">{{ 'placement.bannerSub' | t }}</p></div>
          <app-icon name="chevronRight" class="transition-transform group-hover:translate-x-1" />
        </a>
      }

      @if (unfinished().length) {
        <!-- Unfinished lessons / exams (resume where the learner stopped) -->
        <section class="card order-3 border-primary/30 p-5 lg:col-span-2">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-display text-lg font-black">{{ 'resume.dashboardTitle' | t }}</h2>
            <span class="text-xs font-semibold text-muted">{{ 'resume.dashboardSub' | t }}</span>
          </div>
          <ul class="grid gap-3 md:grid-cols-2">
            @for (s of unfinished(); track s.kind + s.refId) {
              <li class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><app-icon [name]="s.kind === 'exam' ? 'file' : 'book'" [size]="22" /></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-bold">{{ s.title || s.refId }}</p>
                  <div class="mt-1 flex items-center gap-2">
                    <app-progress-bar class="flex-1" [value]="s.percent" />
                    <span class="text-xs font-semibold text-muted">{{ s.percent }}% · {{ s.updatedAt | ago }}</span>
                  </div>
                </div>
                <a [routerLink]="[s.kind === 'exam' ? '/exams' : '/lessons', s.refId]" class="btn-primary !min-h-9 !px-3 text-sm">
                  <app-icon name="play" [size]="16" /> {{ 'common.continue' | t }}
                </a>
                <button class="btn-ghost !min-h-9 !px-2 text-muted" (click)="discard(s)" [attr.aria-label]="'resume.discard' | t" [title]="'resume.discard' | t">
                  <app-icon name="close" [size]="16" />
                </button>
              </li>
            }
          </ul>
        </section>
      }

        <!-- Continue learning -->
        <section class="card order-4 p-5 lg:col-span-2">
          <h2 class="mb-4 font-display text-lg font-black">{{ 'dashboard.continue' | t }}</h2>
          @if (loading()) {
            <div class="skeleton h-28"></div>
          } @else if (cont(); as c) {
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl" [style.background]="c.course.color + '22'">{{ c.course.emoji }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-lg font-bold">{{ c.course.title | loc }}</p>
                <p class="truncate text-sm text-muted">{{ c.next ? (c.next.title | loc) : ('dashboard.courseDone' | t) }}</p>
                <div class="mt-2 flex items-center gap-3">
                  <app-progress-bar class="flex-1" [value]="c.progress.percent" />
                  <span class="text-sm font-bold">{{ c.progress.percent }}%</span>
                </div>
              </div>
              @if (c.next) {
                <a [routerLink]="['/lessons', c.next.id]" class="btn-primary">
                  <app-icon name="play" [size]="18" /> {{ 'common.continue' | t }}
                </a>
              } @else {
                <a [routerLink]="['/courses', c.course.id]" class="btn-soft">{{ 'common.view' | t }}</a>
              }
            </div>
          } @else {
            <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-muted">{{ 'dashboard.noCourse' | t }}</p>
              <a routerLink="/courses" class="btn-primary">{{ 'dashboard.pickCourse' | t }}</a>
            </div>
          }
        </section>

      <!-- Stats -->
      <section class="order-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-2">
        @for (s of stats(); track s.label) {
          <div class="card p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-muted">
              <span [class]="s.color"><app-icon [name]="s.icon" [size]="18" /></span>{{ s.label | t }}
            </div>
            <p class="mt-1 font-display text-2xl font-black">{{ s.value | num }}
              @if (s.label === 'stats.streak' && freezes()) { <span class="ml-1 align-middle text-sm" [title]="'dashboard.freezes' | t">🧊×{{ freezes() }}</span> }
            </p>
          </div>
        }
      </section>

      <!-- Daily quests -->
      <section class="card order-7 p-5 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-lg font-black">{{ 'quests.title' | t }}</h2>
          <span class="text-xs font-semibold text-muted">{{ 'quests.reset' | t }}</span>
        </div>
        <ul class="grid gap-3 sm:grid-cols-3">
          @for (q of quests(); track q.def.id) {
            <li class="rounded-2xl bg-surface-2 p-3">
              <div class="flex items-center gap-2">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" [class]="q.claimed ? 'bg-success/15 text-success' : 'bg-primary-soft text-primary'"><app-icon [name]="questIcon[q.def.metric]" [size]="18" /></span>
                <p class="flex-1 text-sm font-bold">{{ 'quests.' + q.def.metric | t: { n: q.def.goal } }}</p>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <app-progress-bar class="flex-1" [value]="(q.value / q.def.goal) * 100" />
                <span class="text-xs font-semibold text-muted">{{ Math.min(q.value, q.def.goal) }}/{{ q.def.goal }}</span>
              </div>
              @if (q.claimed) {
                <p class="animate-pop mt-2 flex items-center gap-1 text-xs font-bold text-success"><app-icon name="checkCircle" [size]="14" [draw]="true" /> {{ 'quests.claimed' | t }}</p>
              } @else if (q.value >= q.def.goal) {
                <button class="btn-primary mt-2 !min-h-8 w-full text-xs" (click)="claim(q.def)" [disabled]="claiming()"><app-icon name="gift" [size]="14" class="animate-wiggle" /> {{ 'quests.claim' | t: { xp: q.def.reward } }}</button>
              } @else {
                <p class="mt-2 flex items-center gap-1 text-xs text-muted"><app-icon name="gift" [size]="14" /> +{{ q.def.reward }} XP</p>
              }
            </li>
          }
        </ul>
      </section>

      <!-- Recommended -->
      <section class="order-11 lg:col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg font-black">{{ 'dashboard.recommended' | t }}</h2>
          <a routerLink="/courses" class="text-sm font-semibold text-primary">{{ 'common.seeAll' | t }}</a>
        </div>
        <div class="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of recommended(); track c.id) {
            <a [routerLink]="['/courses', c.id]" class="card card-hover flex gap-4 p-4">
              <div class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl" [style.background]="c.color + '22'">{{ c.emoji }}</div>
              <div class="min-w-0">
                <p class="truncate font-bold">{{ c.title | loc }}</p>
                <p class="line-clamp-2 text-sm text-muted">{{ c.subtitle | loc }}</p>
                <p class="mt-1 text-xs font-semibold text-muted">{{ c.lessonCount }} {{ 'courses.lessons' | t }} · {{ c.level }}</p>
              </div>
            </a>
          }
        </div>
      </section>
     </div>

     <div class="contents xl:col-start-2 xl:row-start-1 xl:flex xl:flex-col xl:gap-6">
        <!-- Daily goal -->
        <section class="card order-5 flex items-center gap-5 p-5 lg:col-span-2">
          <app-ring [value]="goalPercent()" [size]="104" color="var(--c-accent)">
            <span class="font-display text-2xl font-black">{{ todayMinutes() }}</span>
            <span class="text-xs text-muted">/ {{ auth.profile()?.dailyGoal }} {{ 'common.min' | t }}</span>
          </app-ring>
          <div>
            <h2 class="font-display text-lg font-black">{{ 'dashboard.dailyGoal' | t }}</h2>
            <p class="text-sm text-muted">{{ (goalPercent() >= 100 ? 'dashboard.goalDone' : 'dashboard.goalKeep') | t }}</p>
            <a routerLink="/profile" class="mt-2 inline-block text-sm font-semibold text-primary">{{ 'dashboard.changeGoal' | t }}</a>
          </div>
        </section>

        <!-- Week streak -->
        <section class="card order-8 p-5">
          <h2 class="mb-4 font-display text-lg font-black">{{ 'dashboard.thisWeek' | t }}</h2>
          <div class="grid grid-cols-7 gap-1.5 text-center">
            @for (d of week(); track d.key) {
              <div>
                <p class="text-xs font-semibold text-muted">{{ d.label }}</p>
                <div class="mx-auto mt-1 grid h-9 w-9 place-items-center rounded-full text-sm font-bold"
                  [class]="d.done ? 'bg-accent text-white' : d.today ? 'border-2 border-dashed border-accent text-accent' : 'bg-surface-2 text-muted'">
                  @if (d.done) { <app-icon name="check" [size]="16" /> } @else { {{ d.day }} }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Word of the day -->
        <section class="card order-9 p-5">
          <h2 class="mb-3 font-display text-lg font-black">{{ 'dashboard.wordOfDay' | t }}</h2>
          @if (wotd(); as w) {
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-3xl font-black" [class.jp]="ctx.target() === 'ja'">{{ w.word }}</p>
                <p class="text-sm text-muted">{{ w.reading || w.ipa }} @if (w.romaji) { · {{ w.romaji }} }</p>
              </div>
              <button class="btn-soft !px-3" (click)="speak(w.word)" [attr.aria-label]="'common.listen' | t">
                <app-icon name="volume" />
              </button>
            </div>
            <p class="mt-2 font-semibold">{{ w.meaning | loc }}</p>
            @if (w.example) { <p class="mt-2 text-sm italic text-muted" [class.jp]="ctx.target() === 'ja'">{{ w.example }}</p> }
          } @else {
            <div class="skeleton h-24"></div>
          }
        </section>

        <!-- Quick actions -->
        <section class="order-10 grid gap-3 lg:col-span-2 lg:grid-cols-2 xl:grid-cols-1">
          <a routerLink="/practice/challenge" class="card flex items-center gap-4 p-4 card-hover">
            <div class="rounded-xl bg-accent/15 p-3 text-accent"><app-icon name="target" /></div>
            <div class="flex-1"><p class="font-bold">{{ 'dashboard.challenge' | t }}</p><p class="text-sm text-muted">{{ 'dashboard.challengeSub' | t }}</p></div>
            <app-icon name="chevronRight" />
          </a>
          <a routerLink="/vocabulary/review" class="card flex items-center gap-4 p-4 card-hover">
            <div class="rounded-xl bg-primary-soft p-3 text-primary"><app-icon name="cards" /></div>
            <div class="flex-1"><p class="font-bold">{{ 'dashboard.review' | t }}</p><p class="text-sm text-muted">{{ 'dashboard.dueCount' | t: { n: due() } }}</p></div>
            <app-icon name="chevronRight" />
          </a>
          <a routerLink="/mistakes" class="card flex items-center gap-4 p-4 card-hover">
            <div class="rounded-xl bg-error/15 p-3 text-error"><app-icon name="bookmark" /></div>
            <div class="flex-1"><p class="font-bold">{{ 'mistakes.title' | t }}</p><p class="text-sm text-muted">{{ 'dashboard.mistakesCount' | t: { n: mistakes() } }}</p></div>
            <app-icon name="chevronRight" />
          </a>
          <a routerLink="/practice" class="card flex items-center gap-4 p-4 card-hover">
            <div class="rounded-xl bg-success/15 p-3 text-success"><app-icon name="gamepad" /></div>
            <div class="flex-1"><p class="font-bold">{{ 'dashboard.games' | t }}</p><p class="text-sm text-muted">{{ 'dashboard.gamesSub' | t }}</p></div>
            <app-icon name="chevronRight" />
          </a>
        </section>
     </div>
    </div>
  `,
})
export class DashboardPage {
  protected readonly auth = inject(AuthService);
  protected readonly ctx = inject(LearnContextService);
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly sessions = inject(SessionService);
  private readonly speech = inject(SpeechService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly cont = signal<ContinueItem | null>(null);
  protected readonly recommended = signal<Course[]>([]);
  protected readonly wotd = signal<Vocabulary | null>(null);
  protected readonly due = signal(0);
  protected readonly mistakes = signal(0);
  protected readonly claiming = signal(false);
  protected readonly unfinished = signal<SessionSummary[]>([]);
  private readonly claimedTick = signal(0);
  protected readonly Math = Math;
  protected readonly questIcon: Record<QuestMetric, string> = { xp: 'zap', exercises: 'target', lessons: 'book', minutes: 'timer' };

  protected readonly freezes = computed(() => this.auth.profile()?.streakFreezes ?? 0);
  protected readonly showPlacement = computed(
    () => !this.loading() && !this.cont() && !localStorage.getItem(PLACEMENT_KEY + this.ctx.target()),
  );
  protected readonly quests = computed(() => {
    this.claimedTick();
    const today = dateKey();
    const day = this.progress.yearStats()?.days[today];
    return dailyQuests(today).map((def) => ({
      def,
      value: questValue(def, day),
      claimed: localStorage.getItem(questKey(today, def.id)) === '1',
    }));
  });

  protected readonly level = computed(() => levelFromXp(this.auth.profile()?.xp ?? 0));
  protected readonly todayMinutes = computed(() => Math.round(this.progress.yearStats()?.days[dateKey()]?.m ?? 0));
  protected readonly goalPercent = computed(() =>
    Math.min(100, (this.todayMinutes() / Math.max(1, this.auth.profile()?.dailyGoal ?? 15)) * 100),
  );
  protected readonly greeting = computed(() => {
    const h = new Date().getHours();
    return h < 11 ? 'dashboard.morning' : h < 18 ? 'dashboard.afternoon' : 'dashboard.evening';
  });
  protected readonly stats = computed(() => {
    const p = this.auth.profile();
    return [
      { label: 'stats.streak', value: p ? visibleStreak(p.lastActiveDate, p.streak, dateKey(), p.streakFreezes ?? 0) : 0, icon: 'flame', color: 'text-accent' },
      { label: 'stats.xp', value: p?.xp ?? 0, icon: 'zap', color: 'text-warning' },
      { label: 'stats.lessons', value: p?.lessonsCompleted ?? 0, icon: 'book', color: 'text-primary' },
      { label: 'stats.words', value: p?.wordsLearned ?? 0, icon: 'cards', color: 'text-success' },
    ];
  });
  protected readonly week = computed(() => {
    const days = this.progress.yearStats()?.days ?? {};
    const today = dateKey();
    const dow = (new Date().getDay() + 6) % 7;
    const monday = addDays(today, -dow);
    const fmt = new Intl.DateTimeFormat(this.i18n.intlLocale(), { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDays(monday, i);
      const [y, m, d] = key.split('-').map(Number);
      return { key, day: d, label: fmt.format(new Date(y, m - 1, d)), done: (days[key]?.m ?? 0) > 0 || (days[key]?.xp ?? 0) > 0, today: key === today };
    });
  });

  constructor() {
    this.progress.loadYear().catch(() => undefined);
    // Only sign-in matters here: profile updates (XP, saved language…) must not reload the page.
    const signedIn = computed(() => !!this.auth.profile());
    effect(() => {
      const lang = this.ctx.target();
      if (signedIn()) this.load(lang);
    });
  }

  protected speak(text: string): void {
    this.speech.speak(text, this.ctx.info().speech);
  }

  protected async claim(q: QuestDef): Promise<void> {
    const key = questKey(dateKey(), q.id);
    if (localStorage.getItem(key)) return;
    this.claiming.set(true);
    try {
      localStorage.setItem(key, '1');
      this.claimedTick.update((n) => n + 1);
      await this.progress.recordActivity({ xp: q.reward });
      this.toast.reward(this.i18n.t('quests.rewarded', { xp: q.reward }));
    } catch {
      localStorage.removeItem(key);
      this.claimedTick.update((n) => n + 1);
    } finally {
      this.claiming.set(false);
    }
  }

  protected discard(s: SessionSummary): void {
    this.unfinished.update((list) => list.filter((x) => !(x.kind === s.kind && x.refId === s.refId)));
    this.sessions.clear(s.kind, s.refId);
  }

  private async load(lang: string): Promise<void> {
    this.loading.set(true);
    this.sessions
      .list(undefined, 10)
      .then((list) => this.unfinished.set(list.filter((s) => !s.languageId || s.languageId === lang).slice(0, 4)))
      .catch(() => this.unfinished.set([]));
    try {
      const [courses, progress, pool, due] = await Promise.all([
        this.content.courses(),
        this.progress.allCourseProgress(),
        this.content.vocabPool(lang),
        this.progress.dueWords(lang, 99).catch(() => []),
      ]);
      const mine = courses.filter((c) => c.languageId === lang);
      const started = new Set(progress.map((p) => p.courseId));
      this.recommended.set(mine.filter((c) => !started.has(c.id)).slice(0, 3));
      this.due.set(due.length);
      this.progress.mistakeCount(lang).then((n) => this.mistakes.set(n)).catch(() => undefined);
      if (pool.length) this.wotd.set(pool[Math.floor(seededRandom(dateKey() + lang)() * pool.length)]);

      const last = progress.find((p) => mine.some((c) => c.id === p.courseId));
      if (last) {
        const course = mine.find((c) => c.id === last.courseId)!;
        const outline = await this.content.outline(course.id);
        const done = new Set(last.completed);
        const next = outline?.units.flatMap((u) => u.lessons).find((l) => !done.has(l.id)) ?? null;
        this.cont.set({ course, progress: last, next });
      } else {
        this.cont.set(null);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
