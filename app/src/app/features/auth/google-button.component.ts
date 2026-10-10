import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { FirebaseWebConfig, PublicConfigService } from '../../core/public-config.service';
import { IconComponent } from '../../shared/icon.component';

interface GsiApi {
  accounts: {
    id: {
      initialize(opts: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }): void;
      renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
    };
  };
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiScript: Promise<GsiApi> | null = null;

function loadGsi(): Promise<GsiApi> {
  gsiScript ??= new Promise<GsiApi>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.onload = () => {
      const g = (window as unknown as { google?: GsiApi }).google;
      if (g) resolve(g);
      else reject(new Error('gsi'));
    };
    s.onerror = () => {
      gsiScript = null;
      reject(new Error('gsi'));
    };
    document.head.appendChild(s);
  });
  return gsiScript;
}

let firebaseAuth: Promise<{ auth: typeof import('firebase/auth'); instance: import('firebase/auth').Auth }> | null = null;

/** Loads the Firebase Auth SDK on first use (keeps it out of the initial bundle). */
function loadFirebaseAuth(config: FirebaseWebConfig) {
  firebaseAuth ??= Promise.all([import('firebase/app'), import('firebase/auth')])
    .then(([{ initializeApp }, auth]) => ({
      auth,
      instance: auth.initializeAuth(initializeApp(config, 'lingora-google'), {
        persistence: auth.inMemoryPersistence,
        popupRedirectResolver: auth.browserPopupRedirectResolver,
      }),
    }))
    .catch((e: unknown) => {
      firebaseAuth = null;
      throw e;
    });
  return firebaseAuth;
}

/**
 * Signs in with Google through a Firebase Authentication popup and returns the Firebase ID token.
 * Firebase keeps no session (in-memory persistence, signed out right away): the backend verifies
 * the token once and issues the app's own JWT.
 */
async function firebaseGoogleToken(config: FirebaseWebConfig, locale: string): Promise<string> {
  const { auth, instance: fbAuth } = await loadFirebaseAuth(config);
  fbAuth.languageCode = locale;
  const provider = new auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await auth.signInWithPopup(fbAuth, provider);
  try {
    return await result.user.getIdToken();
  } finally {
    void auth.signOut(fbAuth);
  }
}

/** Firebase error codes look like `auth/popup-blocked`; the i18n keys are `auth.errors.popup-blocked`. */
function firebaseCode(e: unknown): string {
  const code = (e as { code?: string } | null)?.code ?? '';
  return code.startsWith('auth/') ? code.slice(5) : 'unknown';
}

/**
 * "Continue with Google". Emits a Google credential the backend verifies: a Firebase ID token when
 * Firebase is configured, otherwise a Google Identity Services ID token. Renders nothing when the
 * backend has neither configured.
 */
@Component({
  selector: 'app-google-button',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class.hidden]="mode() === 'none'">
      @if (mode() === 'firebase') {
        <button type="button" class="btn-outline w-full gap-2" [disabled]="disabled() || busy()" (click)="firebaseSignIn()">
          <app-icon name="google" [size]="18" />
          {{ busy() ? ('common.loading' | t) : ('auth.withGoogle' | t) }}
        </button>
        @if (error()) {
          <p class="mt-2 rounded-xl bg-error/10 px-3 py-2 text-sm font-semibold text-error" role="alert">{{ error() }}</p>
        }
      }
      <div #host class="flex min-h-[44px] justify-center" [class.hidden]="mode() !== 'gsi'"
        [class.pointer-events-none]="disabled()" [class.opacity-60]="disabled()"></div>
      <div class="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-muted">
        <span class="h-px flex-1 bg-line"></span>{{ 'auth.or' | t }}<span class="h-px flex-1 bg-line"></span>
      </div>
    </div>
  `,
})
export class GoogleButtonComponent {
  private readonly config = inject(PublicConfigService);
  private readonly i18n = inject(I18nService);
  private readonly zone = inject(NgZone);

  readonly text = input<'signin_with' | 'signup_with' | 'continue_with'>('continue_with');
  readonly disabled = input(false);
  readonly credential = output<string>();

  protected readonly mode = signal<'none' | 'firebase' | 'gsi'>('none');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  private firebase: FirebaseWebConfig | null = null;
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  constructor() {
    afterNextRender(() => void this.init());
  }

  protected async firebaseSignIn(): Promise<void> {
    if (!this.firebase || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      this.credential.emit(await firebaseGoogleToken(this.firebase, this.i18n.locale()));
    } catch (e) {
      const code = firebaseCode(e);
      if (code !== 'popup-closed-by-user' && code !== 'cancelled-popup-request') {
        const key = `auth.errors.${code}`;
        const msg = this.i18n.t(key);
        this.error.set(msg === key ? this.i18n.t('auth.errors.unknown') : msg);
      }
    } finally {
      this.busy.set(false);
    }
  }

  private async init(): Promise<void> {
    const { firebase, googleClientId } = await this.config.get();
    if (firebase) {
      this.firebase = firebase;
      this.mode.set('firebase');
      return;
    }
    if (!googleClientId) return;
    try {
      const google = await loadGsi();
      google.accounts.id.initialize({
        client_id: googleClientId,
        ux_mode: 'popup',
        callback: (r) => this.zone.run(() => this.credential.emit(r.credential)),
      });
      const el = this.host().nativeElement;
      google.accounts.id.renderButton(el, {
        type: 'standard',
        theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: this.text(),
        locale: this.i18n.locale(),
        width: Math.min(400, Math.max(200, el.clientWidth || 320)),
      });
      this.mode.set('gsi');
    } catch {
      this.mode.set('none');
    }
  }
}
