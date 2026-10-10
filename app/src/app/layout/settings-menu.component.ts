import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { I18N_PIPES } from '../core/i18n.pipes';
import { I18nService, UI_LOCALES } from '../core/i18n.service';
import { ThemeMode, UiLocale } from '../core/models';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon.component';

/** 🌐 Interface language + theme switcher, available on every page including login. */
@Component({
  selector: 'app-settings-menu',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="btn-ghost !px-2.5" (click)="open.set(!open())" [attr.aria-expanded]="open()"
      [attr.aria-label]="'settings.display' | t">
      <app-icon name="globe" />
      <span class="hidden text-sm sm:inline">{{ currentFlag() }}</span>
      <app-icon name="palette" [size]="18" />
    </button>
    @if (open()) {
      <div class="card animate-pop absolute right-0 top-12 z-50 w-[19rem] p-4 text-sm" role="dialog">
        <p class="label">{{ 'settings.uiLanguage' | t }}</p>
        <div class="mb-4 grid grid-cols-3 gap-2">
          @for (l of locales; track l.code) {
            <button class="btn !min-h-10 !px-2 text-xs" [class]="i18n.locale() === l.code ? 'btn-primary' : 'btn-outline'"
              (click)="setLocale(l.code)">{{ l.flag }} {{ l.label }}</button>
          }
        </div>
        <p class="label">{{ 'settings.theme' | t }}</p>
        <div class="mb-4 grid grid-cols-3 gap-2">
          @for (m of theme.modes; track m) {
            <button class="btn !min-h-10 !px-2 text-xs" [class]="theme.settings().mode === m ? 'btn-primary' : 'btn-outline'"
              (click)="theme.setMode(m)">
              <app-icon [name]="modeIcon[m]" [size]="16" /> {{ 'settings.mode.' + m | t }}
            </button>
          }
        </div>
        <p class="label">{{ 'settings.palette' | t }}</p>
        <div class="mb-4 flex gap-2">
          @for (p of theme.palettes; track p.id) {
            <button class="h-9 w-9 rounded-full border-4 transition"
              [style.background]="p.color"
              [class]="theme.settings().palette === p.id ? 'border-fg scale-110' : 'border-transparent'"
              (click)="theme.setPalette(p.id)" [attr.aria-label]="p.id" [title]="p.id"></button>
          }
        </div>
        <p class="label">{{ 'settings.fontSize' | t }}</p>
        <div class="grid grid-cols-4 gap-2">
          @for (f of theme.fontScales; track f) {
            <button class="btn !min-h-10 !px-1" [class]="theme.settings().fontScale === f ? 'btn-primary' : 'btn-outline'"
              [style.font-size.px]="12 * f" (click)="theme.setFontScale(f)">Aa</button>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'relative' },
})
export class SettingsMenuComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly el = inject(ElementRef<HTMLElement>);
  protected readonly open = signal(false);
  protected readonly locales = UI_LOCALES;
  protected readonly modeIcon: Record<ThemeMode, string> = {
    light: 'sun',
    dark: 'moon',
    system: 'monitor',
    sepia: 'book',
    contrast: 'eye',
  };

  protected currentFlag(): string {
    return UI_LOCALES.find((l) => l.code === this.i18n.locale())?.flag ?? '';
  }

  protected async setLocale(code: UiLocale): Promise<void> {
    await this.i18n.use(code);
    if (this.auth.profile()) this.auth.updateProfileData({ uiLocale: code }).catch(() => undefined);
  }

  @HostListener('document:click', ['$event'])
  protected onDocClick(e: MouseEvent): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    this.open.set(false);
  }
}
