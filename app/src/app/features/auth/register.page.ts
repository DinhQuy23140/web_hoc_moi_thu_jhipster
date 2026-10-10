import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, PASSWORD_RULE } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { PublicConfigService } from '../../core/public-config.service';
import { IconComponent } from '../../shared/icon.component';
import { AuthLayoutComponent } from './auth-layout.component';
import { GoogleButtonComponent } from './google-button.component';
import { STRENGTH_COLORS, passwordStrength } from './password-strength';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, AuthLayoutComponent, GoogleButtonComponent, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout [heading]="'auth.registerTitle' | t" [sub]="'auth.registerSub' | t">
      <app-google-button text="signup_with" [disabled]="busy()" (credential)="google($event)" />
      <form (ngSubmit)="submit()" class="space-y-4" novalidate>
        <div>
          <label class="label" for="name">{{ 'auth.name' | t }}</label>
          <input id="name" class="input" name="name" autocomplete="name" required maxlength="60" [placeholder]="'ph.name' | t" [(ngModel)]="name" />
        </div>
        <div>
          <label class="label" for="email">{{ 'auth.email' | t }}</label>
          <input id="email" class="input" type="email" name="email" autocomplete="email" required maxlength="254" [placeholder]="'ph.email' | t" [(ngModel)]="email" />
        </div>
        <div>
          <label class="label" for="password">{{ 'auth.password' | t }}</label>
          <input id="password" class="input" type="password" name="password" autocomplete="new-password" required
            maxlength="128" [placeholder]="'ph.newPassword' | t" [(ngModel)]="password" aria-describedby="pw-hint" />
          <div class="mt-2 flex gap-1" aria-hidden="true">
            @for (i of [1, 2, 3, 4]; track i) {
              <span class="h-1.5 flex-1 rounded-full" [class]="strength() >= i ? colors[strength()] : 'bg-surface-2'"></span>
            }
          </div>
          <p id="pw-hint" class="mt-1 text-xs text-muted">{{ 'auth.passwordHint' | t }}</p>
        </div>
        <div>
          <label class="label" for="confirm">{{ 'auth.confirmPassword' | t }}</label>
          <input id="confirm" class="input" type="password" name="confirm" autocomplete="new-password" required
            maxlength="128" [placeholder]="'ph.confirmPassword' | t" [(ngModel)]="confirm" />
        </div>
        <label class="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" class="mt-1 h-4 w-4 accent-[var(--c-primary)]" name="terms" [(ngModel)]="terms" />
          <span>{{ 'auth.terms' | t }}</span>
        </label>
        @if (error()) {
          <p class="alert-danger animate-shake" role="alert"><app-icon name="alertCircle" [size]="18" /><span>{{ error() }}</span></p>
        }
        <button class="btn-primary w-full" type="submit" [disabled]="busy()">
          {{ busy() ? ('common.loading' | t) : ('auth.createAccount' | t) }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-muted">
        {{ 'auth.haveAccount' | t }} <a routerLink="/login" class="font-bold text-primary">{{ 'auth.login' | t }}</a>
      </p>
    </app-auth-layout>
  `,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly config = inject(PublicConfigService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirm = signal('');
  protected readonly terms = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly strength = computed(() => passwordStrength(this.password()));
  protected readonly colors = STRENGTH_COLORS;

  protected async submit(): Promise<void> {
    const err = this.validate();
    if (err) {
      this.error.set(this.i18n.t(`auth.errors.${err}`));
      return;
    }
    await this.run(async () => {
      await this.auth.register(this.name(), this.email(), this.password());
      const { requireActivation } = await this.config.get();
      if (requireActivation === false) {
        await this.auth.login(this.email(), this.password());
        await this.router.navigateByUrl('/dashboard');
      } else {
        await this.router.navigateByUrl('/verify-email');
      }
    });
  }

  protected google(credential: string): Promise<void> {
    return this.run(async () => {
      await this.auth.loginWithGoogle(credential);
      await this.router.navigateByUrl('/dashboard');
    });
  }

  private validate(): string | null {
    if (!this.name().trim() || !this.email().trim() || !this.password()) return 'missing-fields';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim())) return 'invalid-email';
    if (!PASSWORD_RULE.test(this.password())) return 'weak-password';
    if (this.password() !== this.confirm()) return 'password-mismatch';
    if (!this.terms()) return 'terms';
    return null;
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await fn();
    } catch (e) {
      this.error.set(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
