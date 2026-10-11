import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n.service';
import { ThemeService } from './core/theme.service';
import { BackdropComponent } from './shared/backdrop.component';
import { BrandMarkComponent } from './shared/brand-mark.component';
import { DialogHostComponent } from './shared/dialog-host.component';
import { ToastsComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, DialogHostComponent, BrandMarkComponent, BackdropComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-backdrop />
    @if (i18n.ready()) {
      <router-outlet />
    } @else {
      <div class="grid min-h-dvh place-items-center">
        <app-brand-mark label="Mầm" class="animate-breathe h-14 w-14 rounded-[23%]" />
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
