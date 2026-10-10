import { Injectable, computed, signal } from '@angular/core';
import { L10n, UiLocale } from './models';
import { pickL10n } from './utils';

type Dict = Record<string, unknown>;

export const UI_LOCALES: { code: UiLocale; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

const STORAGE_KEY = 'lingora.locale';
const FALLBACK: UiLocale = 'en';

/**
 * Runtime UI translation (interface language). Dictionaries are lazy-loaded JSON files
 * from /i18n, so switching language is instant and needs no reload. Missing keys fall
 * back to English, then to the key itself.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly dicts = signal<Partial<Record<UiLocale, Dict>>>({});
  readonly locale = signal<UiLocale>(this.initialLocale());
  readonly ready = computed(() => !!this.dicts()[this.locale()]);
  readonly intlLocale = computed(() => ({ vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' })[this.locale()]);

  async init(): Promise<void> {
    await Promise.all([this.load(this.locale()), this.locale() === FALLBACK ? null : this.load(FALLBACK)]);
    this.applyDocumentLang(this.locale());
  }

  async use(locale: UiLocale): Promise<void> {
    await this.load(locale);
    this.locale.set(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    this.applyDocumentLang(locale);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const loc = this.locale();
    const all = this.dicts();
    let value = lookup(all[loc], key) ?? lookup(all[FALLBACK], key) ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) value = value.replaceAll(`{{${k}}}`, String(v));
    }
    return value;
  }

  l(value: L10n | string | undefined | null): string {
    return pickL10n(value, this.locale());
  }

  number(n: number): string {
    return new Intl.NumberFormat(this.intlLocale()).format(n);
  }

  date(value: number | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
    return new Intl.DateTimeFormat(this.intlLocale(), opts).format(value);
  }

  private async load(locale: UiLocale): Promise<void> {
    if (this.dicts()[locale]) return;
    const res = await fetch(`i18n/${locale}.json`);
    const dict = (await res.json()) as Dict;
    this.dicts.update((d) => ({ ...d, [locale]: dict }));
  }

  private initialLocale(): UiLocale {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'vi' || saved === 'en' || saved === 'ja') return saved;
    const nav = (typeof navigator !== 'undefined' ? navigator.language : 'vi').slice(0, 2);
    return nav === 'en' || nav === 'ja' ? nav : 'vi';
  }

  private applyDocumentLang(locale: UiLocale): void {
    document.documentElement.setAttribute('lang', locale);
  }
}

function lookup(dict: Dict | undefined, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object') cur = (cur as Dict)[part];
    else return undefined;
  }
  return typeof cur === 'string' ? cur : undefined;
}
