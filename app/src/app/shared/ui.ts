import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '../core/i18n.pipes';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full w-full overflow-hidden rounded-full bg-line" role="progressbar"
      [attr.aria-valuenow]="safe()" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="label()">
      <div class="gradient-bar h-full rounded-full transition-[width] duration-500" [style.width.%]="safe()"></div>
    </div>
  `,
  host: { class: 'block h-2.5' },
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly label = input('');
  protected readonly safe = computed(() => Math.max(0, Math.min(100, this.value())));
}

@Component({
  selector: 'app-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 36 36" class="-rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-surface-2)" stroke-width="3.2" />
      <circle cx="18" cy="18" r="15.9" fill="none" [attr.stroke]="color()" stroke-width="3.2" stroke-linecap="round"
        [attr.stroke-dasharray]="dash()" class="transition-all duration-700" />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
      <ng-content />
    </div>
  `,
  host: { class: 'relative inline-flex' },
})
export class RingComponent {
  readonly value = input(0);
  readonly size = input(96);
  readonly color = input('var(--c-primary)');
  protected readonly dash = computed(() => `${Math.max(0, Math.min(100, this.value()))} 100`);
}

@Component({
  selector: 'app-toasts',
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast pointer-events-auto relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface py-3 pl-3 pr-2 text-sm font-semibold text-fg" role="status">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" [class]="badges[t.kind]">
            <app-icon [name]="icons[t.kind]" [size]="20" [draw]="t.kind === 'success'" />
          </span>
          <span class="flex-1">{{ t.text }}</span>
          <button class="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg" (click)="toast.dismiss(t.id)" [attr.aria-label]="'common.close' | t">
            <app-icon name="x" [size]="16" />
          </button>
          <span class="toast-timer absolute inset-x-0 bottom-0 h-1 origin-left" [class]="bars[t.kind]" [style.animation-duration.ms]="t.ms"></span>
        </div>
      }
    </div>
  `,
  styles: `
    .toast { box-shadow: var(--shadow-lift); animation: toast-in 0.4s var(--ease-spring) both; }
    .toast-timer { animation: toast-timer linear forwards; opacity: 0.55; }
  `,
})
export class ToastsComponent {
  protected readonly toast = inject(ToastService);
  protected readonly badges = {
    success: 'bg-success/15 text-success',
    error: 'bg-error/15 text-error',
    info: 'bg-info/15 text-info',
    reward: 'bg-accent/15 text-accent animate-wiggle',
  };
  protected readonly bars = { success: 'bg-success', error: 'bg-error', info: 'bg-info', reward: 'bg-accent' };
  protected readonly icons = { success: 'checkCircle', error: 'alert', info: 'info', reward: 'trophy' };
}

const MEDAL_TONES = {
  gold: '#f59e0b',
  primary: 'var(--c-primary)',
  accent: 'var(--c-accent)',
  success: 'var(--c-success)',
} as const;

/** Round celebratory badge used on result screens (replaces large emoji). */
@Component({
  selector: 'app-medal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="medal" [style.--medal]="color()" [style.width.px]="size()" [style.height.px]="size()">
      <app-icon [name]="icon()" [size]="size() * 0.48" [stroke]="2.2" [duotone]="false" [draw]="true" />
    </span>
  `,
  host: { class: 'inline-flex justify-center' },
})
export class MedalComponent {
  readonly icon = input('trophy');
  readonly tone = input<keyof typeof MEDAL_TONES>('gold');
  readonly size = input(88);
  protected readonly color = computed(() => MEDAL_TONES[this.tone()]);
}

@Component({
  selector: 'app-spinner',
  template: `<div class="loader" role="status" aria-label="Loading"><span></span><span></span><span></span></div>`,
  host: { class: 'flex justify-center py-10' },
})
export class SpinnerComponent {}

@Component({
  selector: 'app-empty',
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center gap-3 py-12 text-center text-muted">
      <div class="rounded-full bg-surface-2 p-4"><app-icon [name]="icon()" [size]="28" /></div>
      <p class="max-w-sm">{{ text() }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyComponent {
  readonly icon = input('sparkles');
  readonly text = input('');
}
