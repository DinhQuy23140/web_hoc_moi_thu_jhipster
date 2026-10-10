import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { LearnContextService } from '../../core/learn-context.service';
import { SpeechService } from '../../core/speech.service';
import { dateKey } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { GAMES } from './games';
import { KANA_ROWS } from './kana';

@Component({
  selector: 'app-practice',
  imports: [RouterLink, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ 'practice.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'practice.sub' | t }}</p>

      <div class="stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (g of games(); track g.id) {
          <a [routerLink]="['/practice', g.id]" class="card card-hover group flex flex-col p-5">
            <div class="flex items-start justify-between">
              <div class="rounded-2xl p-3 text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" [style.background]="g.color"><app-icon [name]="g.icon" [size]="26" [duotone]="false" /></div>
              @if (g.id === 'challenge') {
                @if (challengeDone()) {
                  <span class="chip-success"><app-icon name="checkCircle" [size]="12" /> {{ 'practice.doneToday' | t }}</span>
                } @else {
                  <span class="chip-accent chip-live">{{ 'practice.new' | t }}</span>
                }
              }
            </div>
            <h2 class="mt-4 font-display text-xl font-black">{{ 'practice.games.' + g.id + '.t' | t }}</h2>
            <p class="mt-1 flex-1 text-sm text-muted">{{ 'practice.games.' + g.id + '.d' | t }}</p>
            @if (best(g.id); as b) { <p class="mt-3 flex items-center gap-1 text-xs font-semibold text-muted"><app-icon name="award" [size]="14" class="text-accent" /> {{ 'practice.best' | t }}: {{ b }}</p> }
          </a>
        }
      </div>

      @if (ctx.target() === 'ja') {
        <section class="card mt-8 p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-display text-xl font-black">{{ 'practice.kanaChart' | t }}</h2>
            <div class="inline-flex rounded-xl bg-surface-2 p-1">
              @for (s of scripts; track s) {
                <button class="min-h-9 rounded-lg px-3 text-sm font-bold" [class]="script() === s ? 'bg-surface shadow-sm' : 'text-muted'" (click)="script.set(s)">
                  {{ 'practice.' + s | t }}
                </button>
              }
            </div>
          </div>
          <div class="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
            @for (row of rows; track $index) {
              @for (k of row; track $index) {
                @if (k[0]) {
                  <button class="rounded-xl bg-surface-2 py-2 text-center transition hover:bg-primary-soft" (click)="say(k[0])">
                    <span class="jp block text-2xl font-bold sm:text-3xl">{{ script() === 'hira' ? k[0] : k[1] }}</span>
                    <span class="text-xs text-muted">{{ k[2] }}</span>
                  </button>
                } @else { <span></span> }
              }
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class PracticePage {
  protected readonly ctx = inject(LearnContextService);
  private readonly speech = inject(SpeechService);
  protected readonly rows = KANA_ROWS;
  protected readonly scripts = ['hira', 'kata'] as const;
  protected readonly script = signal<'hira' | 'kata'>('hira');
  protected readonly games = computed(() => GAMES.filter((g) => !g.only || g.only === this.ctx.target()));
  protected readonly challengeDone = computed(() => localStorage.getItem(`lingora.challenge.${this.ctx.target()}`) === dateKey());

  protected best(id: string): string | null {
    return localStorage.getItem(`lingora.best.${id}.${this.ctx.target()}`);
  }

  protected say(k: string): void {
    this.speech.speak(k, 'ja-JP', 0.8);
  }
}
