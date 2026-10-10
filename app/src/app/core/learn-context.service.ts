import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ApiActivity } from './api';
import { AuthService } from './auth.service';

export type TargetLang = 'en' | 'ja';

export const TARGETS: Record<TargetLang, { flag: string; speech: string; label: string }> = {
  en: { flag: '🇬🇧', speech: 'en-US', label: 'English' },
  ja: { flag: '🇯🇵', speech: 'ja-JP', label: '日本語' },
};

/** localStorage prefix for the level found by the placement test, per target language. */
export const PLACEMENT_KEY = 'lingora.placement.';

/** Fade-in time of the cover before the content underneath is swapped. */
const COVER_IN_MS = 180;
/** Minimum time the cover stays up, so a fast switch still reads as one deliberate transition. */
const MIN_COVER_MS = 450;
/** Upper bound for waiting on the new language's data. */
const MAX_LOAD_MS = 3000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** The language currently being learned (separate from the UI language). */
@Injectable({ providedIn: 'root' })
export class LearnContextService {
  private readonly auth = inject(AuthService);
  private readonly activity = inject(ApiActivity);
  readonly target = signal<TargetLang>((localStorage.getItem('lingora.target') as TargetLang) || 'en');
  readonly info = computed(() => TARGETS[this.target()]);
  /** Language being switched to while the switch cover is shown. */
  readonly switching = signal<TargetLang | null>(null);
  /** Bumped when the switch is done and the screen should reveal its content step by step. */
  readonly revealed = signal(0);

  private saving: Promise<unknown> = Promise.resolve();
  private pendingSaves = 0;

  constructor() {
    effect(() => {
      const p = this.auth.profile();
      // While our own saves are in flight the server copy may be older than the local choice.
      if (this.pendingSaves > 0) return;
      if (p && (p.targetLanguage === 'en' || p.targetLanguage === 'ja') && p.targetLanguage !== untracked(this.target)) {
        this.target.set(p.targetLanguage);
      }
    });
  }

  set(lang: TargetLang): void {
    this.target.set(lang);
    localStorage.setItem('lingora.target', lang);
    if (!this.auth.profile()) return;
    this.pendingSaves++;
    this.saving = this.saving
      .then(() => this.auth.updateProfileData({ targetLanguage: lang }))
      .catch(() => undefined)
      .finally(() => this.pendingSaves--);
  }

  /**
   * Switches the learning language behind a cover: the cover fades in, the language changes, the
   * cover stays until the new data has loaded, then it fades out and the screen reveals its content.
   */
  async switchTo(lang: TargetLang): Promise<void> {
    if (lang === this.target() || this.switching()) return;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.switching.set(lang);
    try {
      await sleep(calm ? 0 : COVER_IN_MS);
      window.scrollTo({ top: 0, behavior: 'instant' });
      const started = performance.now();
      this.set(lang);
      await this.activity.idle(MAX_LOAD_MS);
      const rest = MIN_COVER_MS - (performance.now() - started);
      if (rest > 0 && !calm) await sleep(rest);
      this.revealed.update((n) => n + 1);
    } finally {
      this.switching.set(null);
    }
  }
}
