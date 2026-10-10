import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n.service';
import { ThemeService } from './core/theme.service';
import { DialogHostComponent } from './shared/dialog-host.component';
import { ToastsComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, DialogHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (i18n.ready()) {
      <router-outlet />
    } @else {
      <div class="grid min-h-dvh place-items-center">
        <img src="brand/mam-mark.svg" alt="Mầm" class="animate-breathe h-14 w-14 rounded-[23%]" width="56" height="56" />
      </div>
    }
    <app-toasts />
    <app-dialog-host />
  `,
})
export class App {
  protected readonly i18n = inject(I18nService);
  // Instantiated eagerly so the saved theme is applied and kept in sync.
  private readonly theme = inject(ThemeService);
}
