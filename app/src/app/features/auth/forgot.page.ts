import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { IconComponent } from '../../shared/icon.component';
import { AuthLayoutComponent } from './auth-layout.component';

@Component({
  selector: 'app-forgot',
  imports: [FormsModule, RouterLink, AuthLayoutComponent, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout [heading]="'auth.forgotTitle' | t" [sub]="'auth.forgotSub' | t">
      @if (sent()) {
        <p class="alert-success" role="status"><app-icon name="mail" [size]="18" /><span>{{ 'auth.resetSent' | t }}</span></p>
      } @else {
        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="label" for="email">{{ 'auth.email' | t }}</label>
            <input id="email" class="input" type="email" name="email" autocomplete="email" required maxlength="254" [placeholder]="'ph.email' | t" [(ngModel)]="email" />
          </div>
          @if (error()) {
            <p class="alert-danger animate-shake" role="alert"><app-icon name="alertCircle" [size]="18" /><span>{{ error() }}</span></p>
          }
          <button class="btn-primary w-full" [disabled]="busy() || !email()">{{ 'auth.sendReset' | t }}</button>
        </form>
      }
      <p class="mt-6 text-center text-sm"><a routerLink="/login" class="font-bold text-primary">← {{ 'auth.backToLogin' | t }}</a></p>
    </app-auth-layout>
  `,
})
export class ForgotPage {
  private readonly auth = inject(AuthService);
  protected readonly email = signal('');
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.sendPasswordReset(this.email());
      this.sent.set(true);
    } catch (e) {
      const code = (e as { code?: string }).code;
      // Don't reveal whether an account exists for this email.
      if (code === 'auth/user-not-found') this.sent.set(true);
      else this.error.set(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
