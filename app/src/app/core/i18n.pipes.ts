import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { L10n } from './models';

/** `{{ 'nav.home' | t }}` — UI string in the current interface language. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}

/** `{{ course.title | loc }}` — picks the localized variant of content text. */
@Pipe({ name: 'loc', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: L10n | string | undefined | null): string {
    return this.i18n.l(value);
  }
}

@Pipe({ name: 'num', pure: false })
export class NumberLocalePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number | null | undefined): string {
    return this.i18n.number(value ?? 0);
  }
}

/** `{{ epochMs | ago }}` — "5 minutes ago" in the interface language. */
@Pipe({ name: 'ago', pure: false })
export class AgoPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number | null | undefined): string {
    if (!value) return '';
    const diff = (value - Date.now()) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['week', 604_800],
      ['day', 86_400],
      ['hour', 3_600],
      ['minute', 60],
    ];
    const rtf = new Intl.RelativeTimeFormat(this.i18n.intlLocale(), { numeric: 'auto' });
    for (const [unit, secs] of units) if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
    return rtf.format(0, 'minute');
  }
}

/** `{{ epochMs | dt }}` — short date + time in the interface language. */
@Pipe({ name: 'dt', pure: false })
export class DateTimePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number | null | undefined, withTime = true): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat(this.i18n.intlLocale(), {
      dateStyle: 'medium',
      ...(withTime ? { timeStyle: 'short' as const } : {}),
    }).format(new Date(value));
  }
}

export const I18N_PIPES = [TranslatePipe, LocalizePipe, NumberLocalePipe, AgoPipe, DateTimePipe] as const;
