import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, PASSWORD_RULE } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { SpinnerComponent } from '../../shared/ui';
import { AuthLayoutComponent } from './auth-layout.component';
import { STRENGTH_COLORS, passwordStrength } from './password-strength';

/**
 * Landing page of the links emailed by the backend:
 * `/account/activate?key=` (activation) and `/account/reset/finish?key=` (new password).
 */
@Component({
  selector: 'app-action',
  imports: [FormsModule, RouterLink, AuthLayoutComponent, IconComponent, SpinnerComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout [heading]="(mode() === 'resetPassword' ? 'auth.resetTitle' : 'auth.verifyTitle') | t">
      @switch (state()) {
        @case ('loading') { <app-spinner /> }
        @case ('error') {
          <p class="alert-danger" role="alert"><app-icon name="xCircle" [size]="18" /><span>{{ error() }}</span></p>
          <a routerLink="/login" class="btn-primary mt-6 w-full">{{ 'auth.backToLogin' | t }}</a>
        }
        @case ('done') {
          <p class="alert-success" role="status">
            <app-icon name="checkCircle" [size]="18" [draw]="true" />
            <span>{{ (mode() === 'resetPassword' ? 'auth.resetDone' : 'auth.activatedOk') | t }}</span>
          </p>
          <a [routerLink]="auth.user() ? '/dashboard' : '/login'" class="btn-primary mt-6 w-full">{{ 'common.continue' | t }}</a>
        }
        @case ('form') {
          <form (ngSubmit)="reset()" class="space-y-4">
            <div>
              <label class="label" for="pw">{{ 'auth.newPassword' | t }}</label>
              <input id="pw" class="input" type="password" name="pw" autocomplete="new-password" maxlength="128" [placeholder]="'ph.newPassword' | t" [(ngModel)]="password" />
              <div class="mt-2 flex gap-1">
                @for (i of [1, 2, 3, 4]; track i) {
                  <span class="h-1.5 flex-1 rounded-full" [class]="strength() >= i ? colors[strength()] : 'bg-surface-2'"></span>
                }
              </div>
              <p class="mt-1 text-xs text-muted">{{ 'auth.passwordHint' | t }}</p>
            </div>
            <div>
              <label class="label" for="pw2">{{ 'auth.confirmPassword' | t }}</label>
              <input id="pw2" class="input" type="password" name="pw2" autocomplete="new-password" maxlength="128" [placeholder]="'ph.confirmPassword' | t" [(ngModel)]="confirm" />
            </div>
            @if (error()) { <p class="text-sm font-semibold text-error" role="alert">{{ error() }}</p> }
            <button class="btn-primary w-full" [disabled]="busy()">{{ 'auth.resetSubmit' | t }}</button>
          </form>
        }
      }
    </app-auth-layout>
  `,
})
export class ActionPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  /** Set by the route data: `verifyEmail` or `resetPassword`. */
  readonly mode = input<string>('');
  readonly key = input<string>('');

  protected readonly state = signal<'loading' | 'form' | 'done' | 'error'>('loading');
  protected readonly error = signal('');
  protected readonly password = signal('');
  protected readonly confirm = signal('');
  protected readonly busy = signal(false);
  protected readonly strength = computed(() => passwordStrength(this.password()));
  protected readonly colors = STRENGTH_COLORS;

  async ngOnInit(): Promise<void> {
    if (!this.key()) {
      this.error.set(this.i18n.t('auth.errors.invalid-action-code'));
      this.state.set('error');
      return;
    }
    if (this.mode() === 'resetPassword') {
      this.state.set('form');
      return;
    }
    try {
      await this.auth.activate(this.key());
      this.state.set('done');
    } catch (e) {
      this.error.set(this.auth.errorMessage(e));
      this.state.set('error');
    }
  }

  protected async reset(): Promise<void> {
    if (!PASSWORD_RULE.test(this.password())) {
      this.error.set(this.i18n.t('auth.errors.weak-password'));
      return;
    }
    if (this.password() !== this.confirm()) {
      this.error.set(this.i18n.t('auth.errors.password-mismatch'));
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.confirmReset(this.key(), this.password());
      this.state.set('done');
    } catch (e) {
      this.error.set(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
