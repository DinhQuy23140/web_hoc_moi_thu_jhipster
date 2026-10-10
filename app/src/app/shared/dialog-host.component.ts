import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService, DialogTone } from '../core/dialog.service';
import { I18N_PIPES } from '../core/i18n.pipes';
import { IconComponent } from './icon.component';

const TONE: Record<DialogTone, { icon: string; badge: string; button: string }> = {
  primary: { icon: 'info', badge: 'bg-primary-soft text-primary', button: 'btn-primary' },
  warning: { icon: 'alert', badge: 'bg-warning/15 text-warning', button: 'btn-primary' },
  danger: { icon: 'alert', badge: 'bg-error/15 text-error animate-wiggle', button: 'btn-danger' },
};

@Component({
  selector: 'app-dialog-host',
  imports: [FormsModule, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="app-dialog" (cancel)="$event.preventDefault(); close(null)" (click)="backdrop($event)" aria-labelledby="dlg-title">
      @if (dialogs.current(); as d) {
        <form class="card space-y-4 p-6" (ngSubmit)="submit()">
          <div class="flex items-start gap-4">
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" [class]="tone().badge">
              <app-icon [name]="tone().icon" [size]="26" />
            </span>
            <div class="min-w-0 flex-1 pt-1">
              <h2 id="dlg-title" class="font-display text-lg font-black">{{ d.title || (('dialog.title.' + (d.tone ?? 'primary')) | t) }}</h2>
              <p class="mt-1 whitespace-pre-line text-sm text-muted">{{ d.message }}</p>
            </div>
          </div>
          @if (d.kind === 'prompt') {
            <div>
              @if (d.expect) {
                <label class="label" for="dlg-input">{{ 'dialog.typeToConfirm' | t }} <code class="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-fg">{{ d.expect }}</code></label>
              }
              <input #field id="dlg-input" name="value" class="input" autocomplete="off" [maxlength]="d.maxLength ?? 500"
                [placeholder]="d.placeholder ?? (d.expect ?? '')" [attr.aria-label]="d.expect ? null : d.message" [ngModel]="value()" (ngModelChange)="value.set($event)" />
            </div>
          }
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="btn-ghost" (click)="close(null)">{{ d.cancelText || ('common.cancel' | t) }}</button>
            <button type="submit" [class]="tone().button" [disabled]="!canConfirm()">{{ d.confirmText || ('dialog.confirm' | t) }}</button>
          </div>
        </form>
      }
    </dialog>
  `,
})
export class DialogHostComponent {
  protected readonly dialogs = inject(DialogService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  protected readonly value = signal('');

  protected readonly tone = computed(() => TONE[this.dialogs.current()?.tone ?? 'primary']);
  protected readonly canConfirm = computed(() => {
    const d = this.dialogs.current();
    if (!d || d.kind !== 'prompt' || !d.expect) return true;
    return this.value().trim() === d.expect;
  });

  constructor() {
    effect(() => {
      const d = this.dialogs.current();
      const el = this.dlg().nativeElement;
      if (d && !el.open) {
        this.value.set('');
        el.showModal();
        queueMicrotask(() => this.field()?.nativeElement.focus());
      } else if (!d && el.open) {
        el.close();
      }
    });
  }

  protected submit(): void {
    if (!this.canConfirm()) return;
    const d = this.dialogs.current();
    this.close(d?.kind === 'prompt' ? this.value().trim() : '');
  }

  protected close(value: string | null): void {
    this.dialogs.close(value);
  }

  protected backdrop(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.close(null);
  }
}
