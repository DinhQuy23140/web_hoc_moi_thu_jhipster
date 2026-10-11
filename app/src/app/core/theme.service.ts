import { Injectable, effect, signal } from '@angular/core';
import { brandMarkDataUrl } from '../shared/brand-mark.component';
import { Palette, ThemeMode } from './models';

interface ThemeSettings {
  mode: ThemeMode;
  palette: Palette;
  fontScale: number;
}

const KEY = 'lingora.theme';
const THEME_COLORS: Record<Palette, string> = {
  indigo: '#4f46e5',
  sakura: '#db2777',
  ocean: '#0369a1',
  forest: '#15803d',
  sunset: '#c2410c',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly modes: ThemeMode[] = ['light', 'dark', 'system', 'sepia', 'contrast'];
  readonly palettes: { id: Palette; color: string }[] = Object.entries(THEME_COLORS).map(([id, color]) => ({
    id: id as Palette,
    color,
  }));
  readonly fontScales = [0.9, 1, 1.125, 1.25];

  readonly settings = signal<ThemeSettings>(this.read());
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media.matches);

  constructor() {
    this.media.addEventListener('change', (e) => this.systemDark.set(e.matches));
    effect(() => {
      const s = this.settings();
      const mode = s.mode === 'system' ? (this.systemDark() ? 'dark' : 'light') : s.mode;
      const root = document.documentElement;
      root.setAttribute('data-mode', mode);
      root.setAttribute('data-palette', s.palette);
      root.style.setProperty('--font-scale', String(s.fontScale));
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[s.palette]);
      document.querySelector('link[rel="icon"]')?.setAttribute('href', brandMarkDataUrl(getComputedStyle(root)));
      localStorage.setItem(KEY, JSON.stringify(s));
    });
  }

  setMode(mode: ThemeMode): void {
    this.settings.update((s) => ({ ...s, mode }));
  }

  setPalette(palette: Palette): void {
    this.settings.update((s) => ({ ...s, palette }));
  }

  setFontScale(fontScale: number): void {
    this.settings.update((s) => ({ ...s, fontScale }));
  }

  cycleMode(): void {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const i = order.indexOf(this.settings().mode);
    this.setMode(order[(i + 1) % order.length]);
  }

  private read(): ThemeSettings {
    const def: ThemeSettings = { mode: 'system', palette: 'indigo', fontScale: 1 };
    try {
      return { ...def, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
      return def;
    }
  }
}
