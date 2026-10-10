import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, errorCode } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { AuthLayoutComponent } from './auth-layout.component';
import { GoogleButtonComponent } from './google-button.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent, AuthLayoutComponent, GoogleButtonComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout [heading]="'auth.loginTitle' | t" [sub]="'auth.loginSub' | t">
      @if (locked()) {
        <p class="alert-danger mb-4" role="alert"><app-icon name="lock" [size]="18" /><span>{{ 'auth.errors.user-disabled' | t }}</span></p>
      }
      <app-google-button text="signin_with" [disabled]="busy()" (credential)="google($event)" />
      <form (ngSubmit)="submit()" class="space-y-4" novalidate>
        <div>
          <label class="label" for="email">{{ 'auth.email' | t }}</label>
          <input id="email" class="input" type="email" name="email" autocomplete="email" required maxlength="254"
            [placeholder]="'ph.email' | t" [(ngModel)]="email" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label class="label" for="password">{{ 'auth.password' | t }}</label>
            <a routerLink="/forgot-password" class="mb-1.5 text-sm font-semibold text-primary">{{ 'auth.forgot' | t }}</a>
          </div>
          <div class="relative">
            <input id="password" class="input pr-12" [type]="show() ? 'text' : 'password'" name="password"
              autocomplete="current-password" required maxlength="128" [placeholder]="'ph.password' | t" [(ngModel)]="password" />
            <button type="button" class="absolute right-1 top-1 grid h-9 w-10 place-items-center text-muted"
              (click)="show.set(!show())" [attr.aria-label]="'auth.togglePassword' | t">
              <app-icon [name]="show() ? 'eyeOff' : 'eye'" [size]="18" />
            </button>
          </div>
        </div>
        @if (error()) {
          <p class="alert-danger animate-shake" role="alert">
            <app-icon name="alertCircle" [size]="18" />
            <span>
              {{ error() }}
              @if (notActivated()) {
                <a routerLink="/verify-email" class="ml-1 underline">{{ 'auth.resend' | t }}</a>
              }
            </span>
          </p>
        }
        <button class="btn-primary w-full" type="submit" [disabled]="busy()">
          {{ busy() ? ('common.loading' | t) : ('auth.login' | t) }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-muted">
        {{ 'auth.noAccount' | t }} <a routerLink="/register" class="font-bold text-primary">{{ 'auth.register' | t }}</a>
      </p>
    </app-auth-layout>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  readonly returnUrl = input<string>('');
  readonly locked = input(false, { transform: (v: unknown) => !!v && v !== '0' });

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly show = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly notActivated = signal(false);

  protected async submit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.error.set(this.i18n.t('auth.errors.missing-fields'));
      return;
    }
    await this.run(() => this.auth.login(this.email(), this.password()));
  }

  protected google(credential: string): Promise<void> {
    return this.run(() => this.auth.loginWithGoogle(credential));
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    this.notActivated.set(false);
    try {
      await fn();
      const target = this.returnUrl()?.startsWith('/') && !this.returnUrl().startsWith('//') ? this.returnUrl() : '/dashboard';
      await this.router.navigateByUrl(target);
    } catch (e) {
      this.notActivated.set(errorCode(e) === 'not-activated');
      this.error.set(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
