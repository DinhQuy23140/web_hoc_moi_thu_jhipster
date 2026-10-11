import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api, TokenStore } from './api';
import { I18nService } from './i18n.service';
import { UserProfile } from './models';

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

const PENDING_EMAIL_KEY = 'lingora.pendingEmail';

/** The signed-in account as returned by `GET /api/me`. */
export interface AppUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string | null;
  providers: string[];
}

interface MeResponse {
  user: AppUser;
  profile: UserProfile;
  admin: boolean;
}

/** Error with a stable code, mapped to `auth.errors.<code>` by {@link AuthService.errorMessage}. */
export class AuthError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/**
 * Session against the Spring Boot backend: email/password or Google sign-in returns a JWT,
 * the profile comes from `/api/me`. New email accounts must be activated through the link
 * emailed by the backend before they can sign in.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly tokens = inject(TokenStore);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly user = signal<AppUser | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly isAdmin = signal(false);
  /** True once a persisted session has been restored (or ruled out). */
  readonly ready = signal(false);
  readonly isLoggedIn = computed(() => !!this.user());
  readonly isVerified = computed(() => !!this.user()?.emailVerified);
  /** Email of a registration waiting for activation (shown on the verify page). */
  readonly pendingEmail = signal<string>(readPendingEmail());

  private readyResolve!: () => void;
  private readonly readyPromise = new Promise<void>((r) => (this.readyResolve = r));

  constructor() {
    this.tokens.onRejected = (code) => {
      this.clear();
      const url = this.router.url;
      if (!/^\/(login|register|forgot|account|verify-email)/.test(url)) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: url, ...(code === 'account-locked' ? { locked: 1 } : {}) } });
      }
    };
    const restore = this.tokens.token() ? this.loadMe().catch(() => this.clear()) : Promise.resolve();
    restore.finally(() => {
      this.ready.set(true);
      this.readyResolve();
    });
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  /** Creates the account; the backend emails an activation link (no session until activated). */
  async register(name: string, email: string, password: string): Promise<void> {
    const mail = email.trim().toLowerCase();
    await this.api.post('/register', {
      login: loginFor(mail),
      email: mail,
      password,
      firstName: name.trim().slice(0, 50),
      langKey: this.i18n.locale(),
    });
    this.setPendingEmail(mail);
  }

  async login(email: string, password: string): Promise<void> {
    const mail = email.trim();
    try {
      const res = await this.api.post<{ id_token: string }>('/authenticate', { username: mail, password, rememberMe: true });
      await this.startSession(res.id_token);
    } catch (e) {
      if (isNotActivated(e)) {
        this.setPendingEmail(mail.toLowerCase());
        throw new AuthError('not-activated');
      }
      throw e;
    }
  }

  /** Exchanges a Google Identity Services credential (ID token) for an app session. */
  async loginWithGoogle(credential: string): Promise<void> {
    const res = await this.api.post<{ id_token: string }>('/authenticate/google', { credential, langKey: this.i18n.locale() });
    await this.startSession(res.id_token);
  }

  async logout(): Promise<void> {
    this.clear();
  }

  sendPasswordReset(email: string): Promise<void> {
    return this.api.post('/account/reset-password/init', email.trim());
  }

  async confirmReset(key: string, password: string): Promise<void> {
    try {
      await this.api.post('/account/reset-password/finish', { key, newPassword: password });
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status >= 400 && !isPasswordError(e)) throw new AuthError('invalid-action-code');
      throw e;
    }
  }

  /** Activates a new account from the emailed link. */
  async activate(key: string): Promise<void> {
    try {
      await this.api.get('/activate', { key });
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status >= 400) throw new AuthError('invalid-action-code');
      throw e;
    }
    this.setPendingEmail('');
  }

  resendVerification(email = this.pendingEmail()): Promise<void> {
    if (!email) return Promise.reject(new AuthError('missing-fields'));
    return this.api.post('/account/resend-activation', email.trim());
  }

  /** Changing the password revokes every existing token, so this session signs in again with the new one. */
  async changePassword(current: string, next: string): Promise<void> {
    try {
      await this.api.post('/account/change-password', { currentPassword: current, newPassword: next });
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && !isPasswordError(e)) throw new AuthError('wrong-password');
      throw e;
    }
    const email = this.user()?.email;
    if (email) await this.login(email, next);
  }

  hasPasswordProvider(): boolean {
    return !!this.user()?.providers.includes('password');
  }

  async updateProfileData(
    data: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'uiLocale' | 'targetLanguage' | 'dailyGoal'>>,
  ): Promise<void> {
    if (!this.user()) return;
    const profile = await this.api.patch<UserProfile>('/me/profile', data);
    this.setProfile(profile);
  }

  /** Applies a profile returned by the server (after activity, lessons, profile edits). */
  setProfile(profile: UserProfile | null | undefined): void {
    if (!profile) return;
    this.profile.set(profile);
    this.user.update((u) => (u ? { ...u, displayName: profile.displayName, photoURL: profile.photoURL ?? null } : u));
  }

  /** Maps API / auth errors to localized, user-friendly messages. */
  errorMessage(e: unknown): string {
    const key = `auth.errors.${errorCode(e)}`;
    const msg = this.i18n.t(key);
    return msg === key ? this.i18n.t('auth.errors.unknown') : msg;
  }

  private async startSession(token: string): Promise<void> {
    this.tokens.set(token);
    try {
      await this.loadMe();
    } catch (e) {
      this.clear();
      if (e instanceof HttpErrorResponse && e.status === 401) throw new AuthError('user-disabled');
      throw e;
    }
    this.setPendingEmail('');
  }

  private async loadMe(): Promise<void> {
    const me = await this.api.get<MeResponse>('/me');
    this.user.set(me.user);
    this.profile.set(me.profile);
    this.isAdmin.set(me.admin);
  }

  private clear(): void {
    this.tokens.set(null);
    this.user.set(null);
    this.profile.set(null);
    this.isAdmin.set(false);
  }

  private setPendingEmail(email: string): void {
    this.pendingEmail.set(email);
    try {
      if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
      else sessionStorage.removeItem(PENDING_EMAIL_KEY);
    } catch {
      // ignore
    }
  }
}

function readPendingEmail(): string {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Login names are limited to 50 characters; long emails get a derived login (sign-in still uses the email). */
function loginFor(email: string): string {
  if (email.length <= 50) return email;
  const local = email.split('@')[0].replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 36) || 'user';
  return `${local}_${Math.random().toString(36).slice(2, 10)}`;
}

function problem(e: HttpErrorResponse): { type?: string; message?: string; detail?: string; code?: string } {
  return (e.error && typeof e.error === 'object' ? e.error : {}) as { type?: string; message?: string; detail?: string; code?: string };
}

function isNotActivated(e: unknown): boolean {
  return e instanceof HttpErrorResponse && /not activated/i.test(problem(e).detail ?? '');
}

function isPasswordError(e: HttpErrorResponse): boolean {
  return /invalid-password/.test(problem(e).type ?? '');
}

/** Stable error code for `auth.errors.*`. */
export function errorCode(e: unknown): string {
  if (e instanceof AuthError) return e.code;
  if (e instanceof HttpErrorResponse) {
    const p = problem(e);
    if (e.status === 0) return 'network-request-failed';
    if (e.status === 429) return 'too-many-requests';
    if (p.code === 'account-locked') return 'user-disabled';
    if (isNotActivated(e)) return 'not-activated';
    if (p.message === 'error.emailexists' || p.message === 'error.userexists' || /email-already-used|login-already-used/.test(p.type ?? '')) {
      return 'email-already-in-use';
    }
    if (isPasswordError(e)) return 'weak-password';
    if (p.message === 'error.validation') return 'invalid-email';
    if (e.status === 401) return 'invalid-credential';
    return 'unknown';
  }
  return (e as { code?: string })?.code ?? 'unknown';
}
