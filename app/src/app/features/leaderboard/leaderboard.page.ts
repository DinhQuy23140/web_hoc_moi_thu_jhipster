import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LEAGUES, League, leagueFor } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { LeaderboardEntry } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { weekId } from '../../core/utils';
import { avatarUrl } from '../../layout/shell.component';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';

@Component({
  selector: 'app-leaderboard',
  imports: [RouterLink, IconComponent, SpinnerComponent, EmptyComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ 'leaderboard.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'leaderboard.sub' | t: { week: week } }}</p>

     <div class="mt-6 grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)]">
      <!-- My league -->
      <section class="card p-5 lg:sticky lg:top-20">
        <div class="flex items-center gap-4">
          <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl" [style.background]="myLeague().league.color + '22'">{{ myLeague().league.icon }}</div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold uppercase tracking-wide text-muted">{{ 'leagues.yours' | t }}</p>
            <p class="font-display text-2xl font-black" [style.color]="myLeague().league.color">{{ 'leagues.' + myLeague().league.id | t }}</p>
            <p class="text-sm text-muted">{{ myXp() | num }} XP {{ 'leagues.thisWeek' | t }}</p>
          </div>
        </div>
        @if (myLeague().next; as next) {
          <div class="mt-4">
            <app-progress-bar [value]="nextProgress()" />
            <p class="mt-1 text-xs text-muted">{{ 'leagues.toNext' | t: { xp: next.min - myXp(), league: ('leagues.' + next.id | t) } }}</p>
          </div>
        } @else {
          <p class="mt-3 text-sm font-semibold text-success">{{ 'leagues.top' | t }}</p>
        }
        <div class="mt-4 flex flex-wrap gap-1.5 lg:hidden">
          @for (l of leagues; track l.id) {
            <span class="chip !text-xs" [style.opacity]="l.min <= myXp() ? 1 : 0.45" [title]="l.min + ' XP'">{{ l.icon }} {{ 'leagues.' + l.id | t }} · {{ l.min }}+</span>
          }
        </div>
        <ol class="mt-5 hidden space-y-1 lg:block">
          @for (l of leagues; track l.id) {
            <li class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition"
              [class]="l.id === myLeague().league.id ? 'bg-primary-soft font-bold text-primary' : l.min <= myXp() ? '' : 'text-muted'">
              <span class="grid h-8 w-8 place-items-center rounded-lg text-lg" [style.background]="l.color + '22'" [style.opacity]="l.min <= myXp() ? 1 : 0.5">{{ l.icon }}</span>
              <span class="flex-1">{{ 'leagues.' + l.id | t }}</span>
              <span class="text-xs font-semibold tabular-nums">{{ l.min }}+ XP</span>
            </li>
          }
        </ol>
        <p class="mt-3 text-xs text-muted">{{ 'leagues.note' | t }}</p>
      </section>

      <div class="min-w-0">
      @if (loading()) {
        <app-spinner />
      } @else if (entries().length) {
        <div class="flex gap-2">
          <button class="chip-toggle !min-h-9" [attr.aria-pressed]="tab() === 'all'" (click)="tab.set('all')">{{ 'leagues.all' | t }}</button>
          <button class="chip-toggle !min-h-9" [attr.aria-pressed]="tab() === 'mine'" (click)="tab.set('mine')">{{ myLeague().league.icon }} {{ 'leagues.mine' | t }}</button>
        </div>
        @if (tab() === 'all') {
          <div class="mx-auto mt-8 grid max-w-xl grid-cols-3 items-end gap-3 text-center">
            @for (p of podium(); track p.e.uid) {
              <div class="animate-rise row-start-1" [class]="p.order">
                <img [src]="avatar(p.e)" alt="" class="mx-auto h-14 w-14 rounded-full border-4 object-cover" [style.border-color]="p.color" referrerpolicy="no-referrer" />
                <p class="mt-1 truncate text-sm font-bold">{{ p.e.displayName }}</p>
                <div class="mt-2 rounded-t-2xl pt-3 font-display font-black text-white" [style.background]="p.color" [style.height.px]="p.h">
                  <p class="text-2xl">{{ p.rank }}</p><p class="text-xs">{{ p.e.xp | num }} XP</p>
                </div>
              </div>
            }
          </div>
        }
        <ol class="card stagger mt-6 divide-y divide-line overflow-hidden">
          @for (r of shown(); track r.e.uid) {
            <li class="flex items-center gap-3 px-4 py-3" [class.bg-primary-soft]="r.e.uid === me()">
              <span class="w-7 text-center font-display font-black text-muted">{{ r.rank }}</span>
              <img [src]="avatar(r.e)" alt="" class="h-9 w-9 rounded-full object-cover" referrerpolicy="no-referrer" />
              <span class="flex-1 truncate font-semibold">{{ r.e.displayName }} @if (r.e.uid === me()) { <span class="chip-primary ml-1">{{ 'leaderboard.you' | t }}</span> }</span>
              <span class="text-lg" [title]="'leagues.' + r.league.id | t">{{ r.league.icon }}</span>
              <span class="font-display font-black">{{ r.e.xp | num }} XP</span>
            </li>
          } @empty {
            <li class="px-4 py-6 text-center text-sm text-muted">{{ 'leaderboard.empty' | t }}</li>
          }
        </ol>
      } @else {
        <app-empty icon="trophy" [text]="'leaderboard.empty' | t" />
      }
      @if (!loading() && shown().length < 10) {
        <section class="card mt-6 p-5">
          <h2 class="font-display text-lg font-black">{{ 'leaderboard.earn.title' | t }}</h2>
          <p class="text-sm text-muted">{{ 'leaderboard.earn.sub' | t }}</p>
          <div class="stagger mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            @for (w of earnWays; track w.key) {
              <a [routerLink]="w.link" class="group flex items-center gap-3 rounded-2xl border border-line p-4 transition hover:border-primary hover:bg-primary-soft/50">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl" [class]="w.tone"><app-icon [name]="w.icon" [size]="22" /></span>
                <span class="min-w-0 flex-1">
                  <span class="block font-bold">{{ 'leaderboard.earn.' + w.key | t }}</span>
                  <span class="block text-xs text-muted">{{ 'leaderboard.earn.' + w.key + 'Sub' | t }}</span>
                </span>
                <app-icon name="chevronRight" [size]="18" class="text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            }
          </div>
        </section>
      }
      </div>
     </div>
    </div>
  `,
})
export class LeaderboardPage {
  private readonly progress = inject(ProgressService);
  private readonly auth = inject(AuthService);
  protected readonly week = weekId();
  protected readonly leagues = LEAGUES;
  protected readonly earnWays = [
    { key: 'lesson', icon: 'book', link: '/courses', tone: 'bg-primary-soft text-primary' },
    { key: 'review', icon: 'cards', link: '/vocabulary/review', tone: 'bg-success/15 text-success' },
    { key: 'challenge', icon: 'target', link: '/practice/challenge', tone: 'bg-accent/15 text-accent' },
    { key: 'game', icon: 'gamepad', link: '/practice', tone: 'bg-warning/15 text-warning' },
  ];
  protected readonly loading = signal(true);
  protected readonly entries = signal<LeaderboardEntry[]>([]);
  protected readonly tab = signal<'all' | 'mine'>('all');
  protected readonly me = computed(() => this.auth.user()?.uid);

  protected readonly myXp = computed(() => {
    const mine = this.entries().find((e) => e.uid === this.me());
    if (mine) return mine.xp;
    const p = this.auth.profile();
    return p && p.weekId === this.week ? p.weeklyXp : 0;
  });
  protected readonly myLeague = computed(() => leagueFor(this.myXp()));
  protected readonly nextProgress = computed(() => {
    const { league, next } = this.myLeague();
    if (!next) return 100;
    return ((this.myXp() - league.min) / (next.min - league.min)) * 100;
  });

  private readonly ranked = computed(() =>
    this.entries().map((e, i) => ({ e, rank: i + 1, league: leagueFor(e.xp).league as League })),
  );
  protected readonly shown = computed(() => {
    const rows = this.ranked();
    if (this.tab() === 'all') return rows;
    const id = this.myLeague().league.id;
    return rows.filter((r) => r.league.id === id);
  });
  protected readonly podium = computed(() => {
    const e = this.entries();
    const spots = [
      { idx: 1, rank: 2, color: '#94a3b8', h: 90, order: 'col-start-1' },
      { idx: 0, rank: 1, color: '#f59e0b', h: 130, order: 'col-start-2' },
      { idx: 2, rank: 3, color: '#c2410c', h: 64, order: 'col-start-3' },
    ];
    return spots.filter((s) => e[s.idx]).map((s) => ({ ...s, e: e[s.idx] }));
  });

  constructor() {
    this.progress.leaderboard().then((e) => this.entries.set(e)).catch(() => undefined).finally(() => this.loading.set(false));
  }

  protected avatar(e: LeaderboardEntry): string {
    return avatarUrl(e.photoURL, e.displayName);
  }
}
