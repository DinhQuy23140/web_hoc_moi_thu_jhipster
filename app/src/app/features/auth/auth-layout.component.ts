import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsMenuComponent } from '../../layout/settings-menu.component';
import { BrandMarkComponent } from '../../shared/brand-mark.component';
import { IconComponent } from '../../shared/icon.component';

/** Learning-themed stickers that sit around the auth card so the page is not just a lone form. */
const ORNAMENTS: { icon: string; chip: string; pos: string; rot: string; delay: string }[] = [
  { icon: 'book', chip: 'chip-primary', pos: '-left-3 -top-3 sm:top-10 md:-left-16', rot: '-8deg', delay: '0s' },
  { icon: 'headphones', chip: 'chip-info', pos: '-right-3 -top-2 sm:top-16 md:-right-16', rot: '10deg', delay: '-1.1s' },
  { icon: 'cards', chip: 'chip-accent', pos: 'hidden sm:flex -left-3 top-[38%] md:-left-[4.75rem]', rot: '-6deg', delay: '-2.2s' },
  { icon: 'mic', chip: 'chip-success', pos: 'hidden sm:flex -right-3 top-[42%] md:-right-[4.75rem]', rot: '7deg', delay: '-3s' },
  { icon: 'bookmark', chip: 'chip-primary', pos: 'hidden md:flex -left-[4.25rem] top-[62%]', rot: '9deg', delay: '-1.9s' },
  { icon: 'pen', chip: 'chip-info', pos: 'hidden md:flex -right-[4.25rem] top-[68%]', rot: '-9deg', delay: '-5s' },
  { icon: 'award', chip: 'chip-warning', pos: '-left-3 -bottom-3 sm:bottom-16 md:-left-14', rot: '12deg', delay: '-0.7s' },
  { icon: 'sparkles', chip: 'chip-accent', pos: '-right-3 -bottom-2 sm:bottom-20 md:-right-14', rot: '-10deg', delay: '-3.8s' },
  { icon: 'globe', chip: 'chip-info', pos: 'hidden md:flex left-[12%] -top-8', rot: '5deg', delay: '-1.6s' },
  { icon: 'flame', chip: 'chip-accent', pos: 'hidden md:flex right-[14%] -top-7', rot: '-14deg', delay: '-2.6s' },
  { icon: 'trophy', chip: 'chip-warning', pos: 'hidden md:flex left-[14%] -bottom-8', rot: '8deg', delay: '-3.4s' },
  { icon: 'gamepad', chip: 'chip-primary', pos: 'hidden md:flex right-[12%] -bottom-9', rot: '-5deg', delay: '-4.6s' },
  { icon: 'star', chip: 'chip-warning', pos: 'hidden lg:flex -left-8 top-[24%]', rot: '16deg', delay: '-0.3s' },
  { icon: 'target', chip: 'chip-success', pos: 'hidden lg:flex -right-8 bottom-[28%]', rot: '-12deg', delay: '-4.2s' },
];

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, SettingsMenuComponent, BrandMarkComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col">
      <header class="relative z-20 flex h-16 items-center justify-between px-4 sm:px-8">
        <a routerLink="/" class="flex items-center gap-2">
          <app-brand-mark class="h-9 w-9" />
          <span class="font-display text-xl font-black">Mầm<span class="text-accent" aria-hidden="true">.</span></span>
        </a>
        <app-settings-menu />
      </header>
      <main class="flex flex-1 items-center justify-center overflow-x-clip px-5 py-12 sm:px-8 sm:py-14">
        <div class="relative w-full max-w-md">
          <div class="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            @for (o of ornaments; track o.icon) {
              <span class="absolute {{ o.pos }}">
                <span class="auth-float grid h-11 w-11 place-items-center rounded-2xl shadow-sm sm:h-12 sm:w-12 {{ o.chip }}"
                  [style.--r]="o.rot" [style.animation-delay]="o.delay">
                  <app-icon [name]="o.icon" [size]="22" />
                </span>
              </span>
            }
          </div>
          <div class="card animate-pop relative z-10 w-full p-6 sm:p-8">
            <h1 class="font-display text-2xl font-black">{{ heading() }}</h1>
            @if (sub()) {
              <p class="mt-1 text-muted">{{ sub() }}</p>
            }
            <div class="mt-6"><ng-content /></div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    .auth-float {
      transform: rotate(var(--r, 0deg));
      animation: auth-float 5.5s ease-in-out infinite alternate;
    }
    @keyframes auth-float {
      from { transform: translateY(0) rotate(var(--r, 0deg)); }
      to { transform: translateY(-0.55rem) rotate(var(--r, 0deg)); }
    }
  `,
})
export class AuthLayoutComponent {
  readonly heading = input('');
  readonly sub = input('');
  protected readonly ornaments = ORNAMENTS;
}
