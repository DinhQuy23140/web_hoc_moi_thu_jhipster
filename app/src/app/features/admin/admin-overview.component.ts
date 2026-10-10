import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AdminOverview, AdminService } from '../../core/admin.service';
import { serverMessage } from '../../core/api';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent, SpinnerComponent } from '../../shared/ui';

/** Minimal responsive SVG bar chart with hover titles. */
@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="h-40 w-full" preserveAspectRatio="none" role="img" [attr.aria-label]="label()">
      @for (b of bars(); track $index) {
        <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="1.5" [attr.fill]="color()" [attr.opacity]="b.h ? 0.9 : 0.15">
          <title>{{ b.title }}</title>
        </rect>
      }
    </svg>
    <div class="mt-1 flex justify-between text-[10px] font-semibold text-muted">
      <span>{{ labels()[0] }}</span><span>{{ labels()[labels().length - 1] }}</span>
    </div>
  `,
})
export class BarChartComponent {
  readonly values = input.required<number[]>();
  readonly labels = input.required<string[]>();
  readonly color = input('var(--c-primary)');
  readonly label = input('');
  protected readonly width = 300;
  protected readonly height = 100;

  protected readonly bars = computed(() => {
    const v = this.values();
    const max = Math.max(1, ...v);
    const slot = this.width / Math.max(1, v.length);
    const w = Math.max(1, slot * 0.7);
    return v.map((n, i) => {
      const h = n > 0 ? Math.max(2, (n / max) * (this.height - 4)) : 2;
      return { x: i * slot + (slot - w) / 2, y: this.height - h, w, h: n > 0 ? h : 2, title: `${this.labels()[i]}: ${n}` };
    });
  });
}

@Component({
  selector: 'app-admin-overview',
  imports: [IconComponent, SpinnerComponent, ProgressBarComponent, BarChartComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted">{{ 'adminx.overviewSub' | t }}</p>
      <div class="flex rounded-xl bg-surface-2 p-1" role="group">
        @for (d of ranges; track d) {
          <button class="min-h-9 rounded-lg px-3 text-sm font-bold" [class]="days() === d ? 'bg-surface shadow-sm' : 'text-muted'" (click)="load(d)">
            {{ 'adminx.lastDays' | t: { n: d } }}
          </button>
        }
        <button class="min-h-9 rounded-lg px-2 text-muted" (click)="load(days())" [attr.aria-label]="'adminx.refresh' | t"><app-icon name="refresh" [size]="16" /></button>
      </div>
    </div>

    @if (data(); as o) {
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        @for (k of kpis(); track k.label) {
          <div class="card p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-muted"><span [class]="k.color"><app-icon [name]="k.icon" [size]="18" /></span>{{ k.label | t }}</div>
            <p class="mt-1 font-display text-3xl font-black">{{ k.value | num }}</p>
            @if (k.sub) { <p class="text-xs text-muted">{{ k.sub }}</p> }
          </div>
        }
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <section class="card p-4">
          <h3 class="mb-2 text-sm font-bold">{{ 'adminx.chartActive' | t }}</h3>
          <app-bar-chart [values]="col('active')" [labels]="dayLabels()" [label]="'adminx.chartActive' | t" />
        </section>
        <section class="card p-4">
          <h3 class="mb-2 text-sm font-bold">{{ 'adminx.chartMinutes' | t }}</h3>
          <app-bar-chart [values]="col('minutes')" [labels]="dayLabels()" color="var(--c-accent)" [label]="'adminx.chartMinutes' | t" />
        </section>
        <section class="card p-4">
          <h3 class="mb-2 text-sm font-bold">{{ 'adminx.chartSignups' | t }}</h3>
          <app-bar-chart [values]="col('signups')" [labels]="dayLabels()" color="var(--c-success)" [label]="'adminx.chartSignups' | t" />
        </section>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <section class="card overflow-x-auto p-4 lg:col-span-2">
          <h3 class="mb-3 text-sm font-bold">{{ 'adminx.topCourses' | t }}</h3>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-xs text-muted"><th class="pb-2">{{ 'adminx.course' | t }}</th><th>{{ 'adminx.learners' | t }}</th><th class="w-40">{{ 'adminx.avgProgress' | t }}</th><th>{{ 'adminx.completed' | t }}</th></tr></thead>
            <tbody>
              @for (c of o.topCourses; track c.courseId) {
                <tr class="border-t border-line">
                  <td class="py-2 pr-2"><span class="mr-1">{{ c.emoji }}</span><span class="font-semibold">{{ c.title | loc }}</span> <span class="chip ml-1">{{ 'adminx.langs.' + c.languageId | t }}</span></td>
                  <td>{{ c.learners | num }}</td>
                  <td><div class="flex items-center gap-2"><app-progress-bar class="flex-1" [value]="c.avgPercent" /><span class="text-xs">{{ c.avgPercent }}%</span></div></td>
                  <td>{{ c.completed | num }}</td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="py-4 text-center text-muted">{{ 'adminx.noData' | t }}</td></tr>
              }
            </tbody>
          </table>
        </section>
        <section class="card space-y-4 p-4">
          <div>
            <h3 class="mb-3 text-sm font-bold">{{ 'adminx.attempts30' | t }}</h3>
            <ul class="space-y-2 text-sm">
              @for (a of o.attempts; track a.kind) {
                <li class="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <span class="font-semibold">{{ 'adminx.kind.' + a.kind | t }}</span>
                  <span class="text-muted">{{ a.count | num }} · {{ 'adminx.avgScore' | t }} {{ a.avgScore }}%</span>
                </li>
              } @empty { <li class="text-muted">{{ 'adminx.noData' | t }}</li> }
            </ul>
          </div>
          <div>
            <h3 class="mb-3 text-sm font-bold">{{ 'adminx.content' | t }}</h3>
            <dl class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'adminx.coursesPublished' | t }}</dt><dd class="font-bold">{{ o.totals.publishedCourses }}/{{ o.totals.courses }}</dd></div>
              <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'admin.lessons' | t }}</dt><dd class="font-bold">{{ o.totals.lessons | num }}</dd></div>
              <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'nav.vocabulary' | t }}</dt><dd class="font-bold">{{ o.totals.vocabularies | num }}</dd></div>
              <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'adminx.exams' | t }}</dt><dd class="font-bold">{{ o.totals.exams | num }}</dd></div>
            </dl>
          </div>
        </section>
      </div>
    } @else {
      <app-spinner />
    }
  `,
  host: { class: 'block space-y-4' },
})
export class AdminOverviewComponent {
  private readonly admin = inject(AdminService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly ranges = [7, 30, 90];
  protected readonly days = signal(30);
  protected readonly data = signal<AdminOverview | null>(null);

  protected readonly dayLabels = computed(() =>
    (this.data()?.series ?? []).map((s) => {
      const [y, m, d] = s.day.split('-').map(Number);
      return this.i18n.date(new Date(y, m - 1, d), { day: 'numeric', month: 'short' });
    }),
  );

  protected readonly kpis = computed(() => {
    const o = this.data();
    if (!o) return [];
    const t = this.i18n;
    return [
      { label: 'adminx.kpiUsers', value: o.totals.users, icon: 'users', color: 'text-primary', sub: t.t('adminx.kpiUsersSub', { n: o.activity.newUsers7d, a: o.totals.admins }) },
      { label: 'adminx.kpiActiveToday', value: o.activity.activeToday, icon: 'flame', color: 'text-accent', sub: t.t('adminx.kpiActiveSub', { w: o.activity.active7d, m: o.activity.active30d }) },
      { label: 'adminx.kpiLessons7d', value: o.activity.lessons7d, icon: 'book', color: 'text-success', sub: t.t('adminx.kpiMinutesSub', { n: Math.round(o.activity.minutes7d) }) },
      { label: 'adminx.kpiInProgress', value: o.activity.inProgressSessions, icon: 'pause', color: 'text-warning', sub: t.t('adminx.kpiMistakesSub', { n: o.totals.mistakes }) },
    ];
  });

  constructor() {
    this.load(30);
  }

  protected col(key: 'active' | 'minutes' | 'signups' | 'lessons' | 'xp'): number[] {
    return (this.data()?.series ?? []).map((s) => Math.round(s[key]));
  }

  protected async load(days: number): Promise<void> {
    this.days.set(days);
    try {
      this.data.set(await this.admin.overview(days));
    } catch (e) {
      this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
    }
  }
}
