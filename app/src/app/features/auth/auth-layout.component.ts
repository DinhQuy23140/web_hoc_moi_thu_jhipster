import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsMenuComponent } from '../../layout/settings-menu.component';
import { BrandMarkComponent } from '../../shared/brand-mark.component';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, SettingsMenuComponent, BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col">
      <header class="flex h-16 items-center justify-between px-4 sm:px-8">
        <a routerLink="/" class="flex items-center gap-2">
          <app-brand-mark class="h-9 w-9" />
          <span class="font-display text-xl font-black">Mầm<span class="text-accent" aria-hidden="true">.</span></span>
        </a>
        <app-settings-menu />
      </header>
      <main class="flex flex-1 items-center justify-center px-4 py-8">
        <div class="card animate-pop w-full max-w-md p-6 sm:p-8">
          <h1 class="font-display text-2xl font-black">{{ heading() }}</h1>
          @if (sub()) {
            <p class="mt-1 text-muted">{{ sub() }}</p>
          }
          <div class="mt-6"><ng-content /></div>
        </div>
      </main>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly heading = input('');
  readonly sub = input('');
}
