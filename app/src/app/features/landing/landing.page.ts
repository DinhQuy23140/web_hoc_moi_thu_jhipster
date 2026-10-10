import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { Certificate } from '../../core/models';
import { SettingsMenuComponent } from '../../layout/settings-menu.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, IconComponent, SettingsMenuComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <a routerLink="/" class="flex items-center gap-2">
          <img src="brand/mam-mark.svg" alt="" class="h-9 w-9" width="36" height="36" />
          <span class="font-display text-xl font-black">Mầm<span class="text-accent" aria-hidden="true">.</span></span>
        </a>
        <div class="flex-1"></div>
        <app-settings-menu />
        @if (auth.user()) {
          <a routerLink="/dashboard" class="btn-primary">{{ 'landing.goDashboard' | t }}</a>
        } @else {
          <a routerLink="/login" class="btn-ghost hidden sm:inline-flex">{{ 'auth.login' | t }}</a>
          <a routerLink="/register" class="btn-primary">{{ 'landing.start' | t }}</a>
        }
      </div>
    </header>

    <main>
      <section class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <span class="chip-primary mb-4">🇬🇧 English · 🇯🇵 日本語</span>
          <h1 class="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {{ 'landing.heroTitle' | t }}
          </h1>
          <p class="mt-4 text-lg text-muted">{{ 'landing.heroSub' | t }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a [routerLink]="auth.user() ? '/dashboard' : '/register'" class="btn-primary !px-6 text-lg">{{ 'landing.start' | t }}</a>
            <a href="#certs" class="btn-outline !px-6 text-lg">{{ 'landing.explore' | t }}</a>
          </div>
          <div class="mt-8 flex flex-wrap gap-6 text-sm text-muted">
            <span class="flex items-center gap-2"><app-icon name="check" [size]="18" /> {{ 'landing.free' | t }}</span>
            <span class="flex items-center gap-2"><app-icon name="check" [size]="18" /> {{ 'landing.anyDevice' | t }}</span>
            <span class="flex items-center gap-2"><app-icon name="check" [size]="18" /> {{ 'landing.offline' | t }}</span>
          </div>
        </div>
        <div class="relative">
          <div class="card animate-pop mx-auto max-w-sm p-6">
            <div class="flex items-center justify-between text-sm text-muted">
              <span>JLPT N5 · Unit 1</span><span class="chip-primary">+20 XP</span>
            </div>
            <p class="jp mt-6 text-center font-display text-5xl font-black">学校</p>
            <p class="mt-2 text-center text-muted">がっこう · gakkou</p>
            <p class="mt-4 text-center text-xl font-bold">{{ 'landing.demoMeaning' | t }}</p>
            <div class="mt-6 grid grid-cols-2 gap-3">
              <span class="btn-outline">{{ 'review.again' | t }}</span>
              <span class="btn-primary">{{ 'review.good' | t }}</span>
            </div>
          </div>
          <div class="card absolute -left-2 top-4 hidden items-center gap-2 px-3 py-2 sm:flex">
            <span class="text-accent"><app-icon name="flame" /></span><b>12</b> {{ 'landing.days' | t }}
          </div>
          <div class="card absolute -right-2 bottom-6 hidden items-center gap-2 px-3 py-2 sm:flex">
            <span class="text-success"><app-icon name="check" /></span> IELTS 6.5
          </div>
        </div>
      </section>

      <section class="border-y border-line bg-surface py-14">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 class="text-center font-display text-3xl font-black">{{ 'landing.featuresTitle' | t }}</h2>
          <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            @for (f of features; track f.key) {
              <div class="rounded-2xl bg-surface-2 p-5">
                <div class="mb-3 inline-flex rounded-xl bg-primary-soft p-2.5 text-primary"><app-icon [name]="f.icon" /></div>
                <h3 class="font-bold">{{ 'landing.f.' + f.key + '.t' | t }}</h3>
                <p class="mt-1 text-sm text-muted">{{ 'landing.f.' + f.key + '.d' | t }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <section id="certs" class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 class="text-center font-display text-3xl font-black">{{ 'landing.certsTitle' | t }}</h2>
        <p class="mx-auto mt-2 max-w-2xl text-center text-muted">{{ 'landing.certsSub' | t }}</p>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of certs(); track c.id) {
            <div class="card flex gap-4 p-5">
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-black text-white" [style.background]="c.color">
                {{ c.code.slice(0, 5) }}
              </div>
              <div>
                <h3 class="font-bold">{{ c.name }}</h3>
                <p class="line-clamp-2 text-sm text-muted">{{ c.description | loc }}</p>
                <p class="mt-2 text-xs font-semibold text-primary">{{ c.levels.length }} {{ 'certs.levels' | t }}</p>
              </div>
            </div>
          } @empty {
            @for (i of [1, 2, 3]; track i) { <div class="skeleton h-28"></div> }
          }
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div class="rounded-3xl bg-primary p-8 text-center text-on-primary sm:p-12">
          <h2 class="font-display text-3xl font-black">{{ 'landing.ctaTitle' | t }}</h2>
          <p class="mt-2 opacity-90">{{ 'landing.ctaSub' | t }}</p>
          <a routerLink="/register" class="btn mt-6 bg-surface !px-8 text-lg text-primary">{{ 'landing.start' | t }}</a>
        </div>
      </section>
    </main>
    <footer class="border-t border-line py-6 text-center text-sm text-muted">© {{ year }} Mầm</footer>
  `,
})
export class LandingPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  protected readonly certs = signal<Certificate[]>([]);
  protected readonly year = new Date().getFullYear();
  protected readonly features = [
    { key: 'path', icon: 'layers' },
    { key: 'srs', icon: 'cards' },
    { key: 'speak', icon: 'mic' },
    { key: 'games', icon: 'gamepad' },
    { key: 'exam', icon: 'timer' },
    { key: 'stats', icon: 'chart' },
    { key: 'themes', icon: 'palette' },
    { key: 'pwa', icon: 'monitor' },
  ];

  async ngOnInit(): Promise<void> {
    this.certs.set(await this.content.certificates().catch(() => []));
  }
}
