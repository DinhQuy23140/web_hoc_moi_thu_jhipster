import { Injectable, signal } from '@angular/core';

export type DialogTone = 'primary' | 'warning' | 'danger';

export interface DialogOptions {
  message: string;
  title?: string;
  tone?: DialogTone;
  confirmText?: string;
  cancelText?: string;
}

export interface PromptOptions extends DialogOptions {
  placeholder?: string;
  /** Text the user must type exactly before the confirm button unlocks (type-to-confirm). */
  expect?: string;
  maxLength?: number;
}

export interface DialogRequest extends PromptOptions {
  kind: 'confirm' | 'prompt';
  resolve: (value: string | null) => void;
}

/** In-app replacement for window.confirm / window.prompt, rendered by DialogHostComponent. */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<DialogRequest | null>(null);

  confirm(options: DialogOptions): Promise<boolean> {
    return this.open({ ...options, kind: 'confirm' }).then((v) => v !== null);
  }

  /** Resolves to the entered text, or null when cancelled. */
  prompt(options: PromptOptions): Promise<string | null> {
    return this.open({ ...options, kind: 'prompt' });
  }

  close(value: string | null): void {
    const req = this.current();
    if (!req) return;
    this.current.set(null);
    req.resolve(value);
  }

  private open(options: Omit<DialogRequest, 'resolve'>): Promise<string | null> {
    this.current()?.resolve(null);
    return new Promise((resolve) => this.current.set({ ...options, resolve }));
  }
}
