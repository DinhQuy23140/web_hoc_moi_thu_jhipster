import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { AuthLayoutComponent } from './auth-layout.component';

/** Shown after registration: the account must be activated from the emailed link. */
@Component({
  selector: 'app-verify-email',
  imports: [FormsModule, RouterLink, AuthLayoutComponent, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout [heading]="'auth.verifyTitle' | t">
      <div class="mb-5 flex justify-center text-primary"><app-icon name="mail" [size]="56" [stroke]="1.5" /></div>
      @if (auth.pendingEmail()) {
        <p class="text-center text-muted">{{ 'auth.verifySub' | t: { email: auth.pendingEmail() } }}</p>
      } @else {
        <p class="text-center text-muted">{{ 'auth.verifyAsk' | t }}</p>
        <label class="label mt-4" for="email">{{ 'auth.email' | t }}</label>
        <input id="email" class="input" type="email" name="email" autocomplete="email" maxlength="254" [placeholder]="'ph.email' | t" [(ngModel)]="email" />
      }
      <div class="mt-6 space-y-3">
        <a routerLink="/login" class="btn-primary w-full">{{ 'auth.verifiedLogin' | t }}</a>
        <button class="btn-outline w-full" (click)="resend()" [disabled]="cooldown() > 0 || busy()">
          {{ cooldown() > 0 ? ('auth.resendIn' | t: { s: cooldown() }) : ('auth.resend' | t) }}
        </button>
        <a routerLink="/register" class="btn-ghost w-full">{{ 'auth.useAnother' | t }}</a>
      </div>
    </app-auth-layout>
  `,
})
export class VerifyEmailPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly busy = signal(false);
  protected readonly cooldown = signal(0);
  protected readonly email = signal('');
  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.router.navigateByUrl('/dashboard');
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  protected async resend(): Promise<void> {
    const email = (this.auth.pendingEmail() || this.email()).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.error(this.i18n.t('auth.errors.invalid-email'));
      return;
    }
    this.busy.set(true);
    try {
      await this.auth.resendVerification(email);
      this.toast.success(this.i18n.t('auth.verificationSent'));
      this.cooldown.set(60);
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.cooldown.update((c) => c - 1);
        if (this.cooldown() <= 0) clearInterval(this.timer);
      }, 1000);
    } catch (e) {
      this.toast.error(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
