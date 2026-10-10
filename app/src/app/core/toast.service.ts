import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info' | 'reward';
  text: string;
  ms: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(text: string, kind: Toast['kind'] = 'info', ms = 3500): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t.slice(-3), { id, kind, text, ms }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error', 5000);
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  reward(text: string): void {
    this.show(text, 'reward', 4000);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
