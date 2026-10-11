import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { levelFromXp, visibleStreak } from '../core/gamification';
import { I18N_PIPES } from '../core/i18n.pipes';
import { LearnContextService, TARGETS, TargetLang } from '../core/learn-context.service';
import { ReminderService } from '../core/reminder.service';
import { dateKey } from '../core/utils';
import { IconComponent } from '../shared/icon.component';
import { AnnouncementBannerComponent } from './announcement-banner.component';
import { SettingsMenuComponent } from './settings-menu.component';

/** How long the content keeps the reveal class (longest stagger delay + animation). */
const REVEAL_MS = 1400;

interface NavItem {
  path: string;
  icon: string;
  label: string;
  mobile?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, SettingsMenuComponent, AnnouncementBannerComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 btn-primary">{{ 'nav.skip' | t }}</a>
    <div class="flex min-h-dvh">
      <!-- Desktop / tablet-landscape sidebar -->
      <aside class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <a routerLink="/dashboard" class="mb-6 flex items-center gap-2 px-3">
          <img src="brand/mam-mark.svg" alt="" class="h-9 w-9" width="36" height="36" />
          <span class="font-display text-xl font-black tracking-tight">Mầm<span class="text-accent" aria-hidden="true">.</span></span>
        </a>
        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
          @for (item of nav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="!bg-primary-soft !text-primary"
              class="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold text-muted transition hover:bg-surface-2 hover:text-fg">
              <app-icon [name]="item.icon" />
              <span>{{ item.label | t }}</span>
            </a>
          }
        </nav>
        @if (auth.profile(); as p) {
          <a routerLink="/profile" class="mt-4 flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
            <img [src]="avatar()" alt="" class="h-10 w-10 rounded-full object-cover" referrerpolicy="no-referrer" />
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ p.displayName }}</p>
              <p class="text-xs text-muted">Lv {{ level().level }} · {{ p.xp | num }} XP</p>
            </div>
          </a>
        }
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur" style="padding-top: env(safe-area-inset-top)">
          <div class="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-6 lg:px-8 2xl:max-w-[100rem] 2xl:px-10">
            <a routerLink="/dashboard" class="flex items-center gap-2 lg:hidden" aria-label="Mầm">
              <img src="brand/mam-mark.svg" alt="" class="h-9 w-9" width="36" height="36" />
            </a>
            <div class="flex rounded-xl bg-surface-2 p-1" role="group" [attr.aria-label]="'nav.learning' | t">
              @for (code of targetCodes; track code) {
                <button class="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold transition"
                  [class]="ctx.target() === code ? 'bg-surface text-fg shadow-sm' : 'text-muted'"
                  (click)="ctx.switchTo(code)" [attr.aria-pressed]="ctx.target() === code">
                  <span>{{ targets[code].flag }}</span><span class="hidden sm:inline">{{ targets[code].label }}</span>
                </button>
              }
            </div>
            <div class="flex-1"></div>
            @if (auth.profile(); as p) {
              <a routerLink="/progress" class="chip !bg-transparent !px-1.5 !text-sm hover:!bg-surface-2" [title]="'stats.streak' | t">
                <span class="text-accent" [class.animate-flicker]="streak() > 0"><app-icon name="flame" [size]="20" /></span>
                <span class="font-display font-black text-fg">{{ streak() }}</span>
              </a>
              <a routerLink="/leaderboard" class="chip hidden !bg-transparent !px-1.5 !text-sm hover:!bg-surface-2 sm:inline-flex" title="XP">
                <span class="text-warning"><app-icon name="zap" [size]="20" /></span>
                <span class="font-display font-black text-fg">{{ p.xp | num }}</span>
              </a>
            }
            <app-settings-menu />
            <a routerLink="/profile" class="lg:hidden" [attr.aria-label]="'nav.profile' | t">
              <img [src]="avatar()" alt="" class="h-9 w-9 rounded-full object-cover" referrerpolicy="no-referrer" />
            </a>
          </div>
        </header>

        <app-announcement-banner />
        <main id="main" class="flex-1 pb-24 lg:pb-8" [class.lang-reveal]="revealing()" [attr.aria-busy]="!!ctx.switching()">
          <router-outlet />
        </main>
        <!-- Cover shown while switching the learning language (hides the swap, then the page reveals itself). -->
        <div class="fixed inset-0 z-30 grid place-items-center bg-surface transition-[opacity,visibility] duration-200 ease-out lg:left-64"
          [class.opacity-0]="!ctx.switching()" [class.invisible]="!ctx.switching()" [class.pointer-events-none]="!ctx.switching()"
          [attr.aria-hidden]="!ctx.switching()" role="status" aria-live="polite">
          @if (cover(); as c) {
            <div class="flex flex-col items-center gap-4 text-center" [class.lang-cover-in]="!!ctx.switching()">
              <img src="brand/mam-mark.svg" alt="" class="animate-breathe h-16 w-16 rounded-[23%]" width="64" height="64" />
              <p class="font-display text-xl font-black">
                <span class="mr-1">{{ c.flag }}</span>{{ c.label }}
              </p>
              <div class="h-1.5 w-40 overflow-hidden rounded-full bg-surface-2">
                <div class="lang-cover-bar h-full w-1/3 rounded-full bg-primary"></div>
              </div>
              <p class="text-sm text-muted">{{ 'common.loading' | t }}</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Mobile / tablet bottom navigation -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style="padding-bottom: env(safe-area-inset-bottom)" aria-label="Mobile">
      <div class="mx-auto grid max-w-lg grid-cols-5">
        @for (item of mobileNav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="!text-primary"
            class="flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-bold text-muted">
            <app-icon [name]="item.icon" [size]="22" />
            <span>{{ item.label | t }}</span>
          </a>
        }
      </div>
    </nav>
  `,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly ctx = inject(LearnContextService);
  protected readonly router = inject(Router);
  protected readonly targets = TARGETS;
  protected readonly targetCodes = Object.keys(TARGETS) as TargetLang[];

  private readonly baseNav: NavItem[] = [
    { path: '/dashboard', icon: 'home', label: 'nav.home' },
    { path: '/courses', icon: 'book', label: 'nav.courses' },
    { path: '/certificates', icon: 'award', label: 'nav.certificates' },
    { path: '/vocabulary', icon: 'cards', label: 'nav.vocabulary' },
    { path: '/mistakes', icon: 'bookmark', label: 'nav.mistakes' },
    { path: '/practice', icon: 'gamepad', label: 'nav.practice' },
    { path: '/progress', icon: 'chart', label: 'nav.progress' },
    { path: '/leaderboard', icon: 'trophy', label: 'nav.leaderboard' },
    { path: '/profile', icon: 'settings', label: 'nav.profile' },
  ];

  protected readonly nav = computed(() =>
    this.auth.isAdmin() ? [...this.baseNav, { path: '/admin', icon: 'shield', label: 'nav.admin' }] : this.baseNav,
  );

  protected readonly mobileNav: NavItem[] = [
    { path: '/dashboard', icon: 'home', label: 'nav.home' },
    { path: '/courses', icon: 'book', label: 'nav.courses' },
    { path: '/vocabulary', icon: 'cards', label: 'nav.words' },
    { path: '/practice', icon: 'gamepad', label: 'nav.practice' },
    { path: '/progress', icon: 'chart', label: 'nav.progress' },
  ];

  protected readonly level = computed(() => levelFromXp(this.auth.profile()?.xp ?? 0));
  protected readonly streak = computed(() => {
    const p = this.auth.profile();
    return p ? visibleStreak(p.lastActiveDate, p.streak, dateKey(), p.streakFreezes ?? 0) : 0;
  });

  /** Language shown on the switch cover (kept while the cover fades out). */
  protected readonly cover = computed(() => TARGETS[this.ctx.switching() ?? this.ctx.target()]);
  protected readonly revealing = signal(false);
  private revealTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(ReminderService).start();
    effect(() => {
      if (this.ctx.revealed() === 0) return;
      clearTimeout(this.revealTimer);
      // Restart the staggered animation even if a previous reveal is still running.
      this.revealing.set(false);
      requestAnimationFrame(() => {
        this.revealing.set(true);
        this.revealTimer = setTimeout(() => this.revealing.set(false), REVEAL_MS);
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.revealTimer));
  }
  protected readonly avatar = computed(() => avatarUrl(this.auth.profile()?.photoURL, this.auth.profile()?.displayName));
}

export function avatarUrl(photo: string | null | undefined, name: string | undefined): string {
  if (photo) return photo;
  const first = Array.from((name || '').trim())[0] ?? '?';
  const letter = first.toUpperCase().replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const hue = [...(name || '?')].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(${hue} 65% 55%)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="700" fill="#fff">${letter}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
