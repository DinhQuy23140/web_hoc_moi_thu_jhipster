import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContentService } from '../../core/content.service';
import { ACHIEVEMENTS, levelFromXp, visibleStreak } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { Attempt, Course, CourseProgress } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { addDays, dateKey, formatMinutes } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent } from '../../shared/ui';

@Component({
  selector: 'app-progress',
  imports: [RouterLink, IconComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page space-y-6">
      <h1 class="page-title">{{ 'progress.title' | t }}</h1>

      <section class="stagger grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        @for (s of summary(); track s.label) {
          <div class="card p-4">
            <p class="flex items-center gap-1.5 text-xs font-semibold text-muted"><app-icon [name]="s.icon" [size]="16" [class]="s.tone" /> {{ s.label | t }}</p>
            <p class="mt-1 font-display text-2xl font-black">{{ s.value }}</p>
          </div>
        }
      </section>

      <div class="grid gap-6 lg:grid-cols-3">
        <section class="card p-5 lg:col-span-2">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-display text-lg font-black">{{ 'progress.minutes' | t }}</h2>
            <div class="inline-flex rounded-xl bg-surface-2 p-1">
              @for (r of [7, 30]; track r) {
                <button class="min-h-8 rounded-lg px-3 text-sm font-bold" [class]="range() === r ? 'bg-surface shadow-sm' : 'text-muted'" (click)="range.set(r)">{{ r }}d</button>
              }
            </div>
          </div>
          <div class="flex h-48 items-end gap-1" role="img" [attr.aria-label]="'progress.minutes' | t">
            @for (b of bars(); track b.key) {
              <div class="group relative flex flex-1 flex-col items-center justify-end">
                <div class="w-full rounded-t-md bg-primary/80 transition-all group-hover:bg-primary" [style.height.%]="b.pct" [style.min-height.px]="b.m ? 4 : 0"></div>
                <span class="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-fg px-1.5 py-0.5 text-xs text-bg group-hover:block">{{ b.m }}′ · {{ b.xp }}xp</span>
                @if (range() === 7 || $index % 5 === 0) { <span class="mt-1 text-[10px] text-muted">{{ b.label }}</span> }
              </div>
            }
          </div>
          <div class="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-xl bg-surface-2 p-2"><p class="font-bold">{{ time().today }}</p><p class="text-xs text-muted">{{ 'progress.today' | t }}</p></div>
            <div class="rounded-xl bg-surface-2 p-2"><p class="font-bold">{{ time().week }}</p><p class="text-xs text-muted">{{ 'progress.week' | t }}</p></div>
            <div class="rounded-xl bg-surface-2 p-2"><p class="font-bold">{{ time().month }}</p><p class="text-xs text-muted">{{ 'progress.month' | t }}</p></div>
          </div>
        </section>

        <section class="card flex flex-col p-5">
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="font-display text-lg font-black">{{ 'progress.courses' | t }}</h2>
            <a routerLink="/courses" class="text-sm font-semibold text-primary">{{ 'common.seeAll' | t }}</a>
          </div>
          <ul class="mb-4 space-y-4">
            @for (cp of courseRows(); track cp.course.id) {
              <li>
                <a [routerLink]="['/courses', cp.course.id]" class="mb-1 flex justify-between gap-2 text-sm font-semibold hover:text-primary">
                  <span class="truncate">{{ cp.course.emoji }} {{ cp.course.title | loc }}</span><span>{{ cp.p.percent }}%</span>
                </a>
                <app-progress-bar [value]="cp.p.percent" />
              </li>
            } @empty {
              <li class="text-sm text-muted">{{ 'dashboard.noCourse' | t }}</li>
            }
          </ul>
          @if (courseRows().length < 4) {
            <a routerLink="/courses" class="mt-auto flex items-center gap-3 rounded-2xl border border-dashed border-line p-4 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary">
              <span class="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><app-icon name="plus" [size]="20" /></span>
              {{ 'dashboard.pickCourse' | t }}
            </a>
          }
        </section>
      </div>

      <section class="card p-5">
        <h2 class="mb-4 font-display text-lg font-black">{{ 'progress.heatmap' | t }} {{ year }}</h2>
        <div class="overflow-x-auto pb-2">
          <div class="grid min-w-[44rem] auto-cols-fr grid-flow-col grid-rows-7 gap-[3px] 2xl:gap-1">
            @for (c of heat(); track c.key) {
              <span class="aspect-square rounded-[3px] transition hover:ring-2 hover:ring-primary/50" [style.background]="c.color" [title]="c.key + ': ' + c.m + '′'"></span>
            }
          </div>
        </div>
        <div class="mt-2 flex items-center gap-1 text-xs text-muted">
          {{ 'progress.less' | t }}
          @for (c of scale; track c) { <span class="h-3 w-3 rounded-[3px]" [style.background]="c"></span> }
          {{ 'progress.more' | t }}
        </div>
      </section>

      <section>
        <h2 class="mb-3 font-display text-lg font-black">{{ 'progress.achievements' | t }}</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          @for (a of achievements(); track a.id) {
            <div class="card flex items-center gap-3 p-4" [class.opacity-45]="!a.owned" [class.grayscale]="!a.owned">
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent/15 text-2xl">{{ a.icon }}</span>
              <div class="min-w-0">
                <p class="truncate font-bold">{{ a.title | loc }}</p>
                <p class="text-xs text-muted">{{ a.description | loc }}</p>
              </div>
            </div>
          }
        </div>
      </section>

      <section class="card p-5">
        <h2 class="mb-3 font-display text-lg font-black">{{ 'progress.history' | t }}</h2>
        <ul class="divide-y divide-line">
          @for (a of attempts(); track a.id) {
            <li class="flex items-center gap-3 py-3">
              <span class="rounded-lg bg-surface-2 p-2 text-muted"><app-icon [name]="kindIcon[a.kind]" [size]="18" /></span>
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold">{{ a.title }}</p>
                <p class="text-xs text-muted">{{ when(a.createdAt) }} · {{ Math.round(a.durationSec / 60) }}′</p>
              </div>
              <span [class]="a.score >= 80 ? 'chip-success' : a.score >= 50 ? 'chip-warning' : 'chip-danger'">{{ a.correct }}/{{ a.total }}</span>
            </li>
          } @empty {
            <li class="py-6 text-center text-sm text-muted">{{ 'progress.noHistory' | t }}</li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class ProgressPage {
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressService);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  protected readonly Math = Math;
  protected readonly year = new Date().getFullYear();
  protected readonly range = signal(7);
  protected readonly attempts = signal<Attempt[]>([]);
  protected readonly courseRows = signal<{ course: Course; p: CourseProgress }[]>([]);
  protected readonly scale = ['var(--c-surface-2)', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'];
  protected readonly kindIcon: Record<Attempt['kind'], string> = { lesson: 'book', exam: 'timer', game: 'gamepad', review: 'cards', challenge: 'target' };

  private readonly days = computed(() => this.progress.yearStats()?.days ?? {});

  protected readonly summary = computed(() => {
    const p = this.auth.profile();
    if (!p) return [];
    return [
      { label: 'progress.totalTime', value: formatMinutes(p.totalMinutes, this.i18n.locale()), icon: 'clock', tone: 'text-info' },
      { label: 'stats.lessons', value: this.i18n.number(p.lessonsCompleted), icon: 'book', tone: 'text-primary' },
      { label: 'stats.words', value: this.i18n.number(p.wordsLearned), icon: 'cards', tone: 'text-success' },
      { label: 'stats.xp', value: this.i18n.number(p.xp), icon: 'zap', tone: 'text-warning' },
      { label: 'stats.streak', value: visibleStreak(p.lastActiveDate, p.streak, dateKey()), icon: 'flame', tone: 'text-accent animate-flicker' },
      { label: 'dashboard.level', value: levelFromXp(p.xp).level, icon: 'award', tone: 'text-primary' },
    ];
  });

  protected readonly bars = computed(() => {
    const n = this.range();
    const today = dateKey();
    const list = Array.from({ length: n }, (_, i) => {
      const key = addDays(today, i - n + 1);
      const d = this.days()[key];
      return { key, m: Math.round(d?.m ?? 0), xp: d?.xp ?? 0, label: key.slice(8) };
    });
    const max = Math.max(10, ...list.map((b) => b.m));
    return list.map((b) => ({ ...b, pct: (b.m / max) * 100 }));
  });

  protected readonly time = computed(() => {
    const today = dateKey();
    const sum = (n: number) => Array.from({ length: n }, (_, i) => this.days()[addDays(today, -i)]?.m ?? 0).reduce((a, b) => a + b, 0);
    const dow = (new Date().getDay() + 6) % 7;
    const loc = this.i18n.locale();
    return { today: formatMinutes(sum(1), loc), week: formatMinutes(sum(dow + 1), loc), month: formatMinutes(sum(new Date().getDate()), loc) };
  });

  protected readonly heat = computed(() => {
    const start = `${this.year}-01-01`;
    const first = new Date(this.year, 0, 1);
    const pad = (first.getDay() + 6) % 7;
    const cells: { key: string; m: number; color: string }[] = [];
    for (let i = 0; i < pad; i++) cells.push({ key: `pad${i}`, m: 0, color: 'transparent' });
    const today = dateKey();
    for (let key = start; key <= today && key.startsWith(String(this.year)); key = addDays(key, 1)) {
      const m = Math.round(this.days()[key]?.m ?? 0);
      const lvl = m === 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 40 ? 3 : 4;
      cells.push({ key, m, color: this.scale[lvl] });
    }
    return cells;
  });

  protected readonly achievements = computed(() => {
    const owned = new Set(this.auth.profile()?.achievements ?? []);
    return ACHIEVEMENTS.map((a) => ({ ...a, owned: owned.has(a.id) }));
  });

  constructor() {
    this.progress.loadYear().catch(() => undefined);
    this.progress.recentAttempts(20).then((a) => this.attempts.set(a)).catch(() => undefined);
    Promise.all([this.content.courses(), this.progress.allCourseProgress()]).then(([courses, prog]) => {
      const map = new Map(courses.map((c) => [c.id, c]));
      this.courseRows.set(prog.filter((p) => map.has(p.courseId)).map((p) => ({ course: map.get(p.courseId)!, p })));
    }).catch(() => undefined);
  }

  protected when(ts: number): string {
    return this.i18n.date(ts, { dateStyle: 'medium', timeStyle: 'short' });
  }
}
