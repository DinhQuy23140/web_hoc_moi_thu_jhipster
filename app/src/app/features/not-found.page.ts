import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES } from '../core/i18n.pipes';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p class="font-display text-7xl font-black text-primary" aria-hidden="true">404</p>
        <h1 class="mt-2 text-lg text-muted">{{ 'common.notFound' | t }}</h1>
        <a routerLink="/" class="btn-primary mt-6">{{ 'common.backHome' | t }}</a>
      </div>
    </div>
  `,
})
export class NotFoundPage {}
