import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export const API = `${environment.apiUrl}/api`;
const TOKEN_KEY = 'lingora.token';

type Params = Record<string, string | number | boolean | null | undefined>;

/** The app JWT (kept in localStorage so the session survives reloads). */
@Injectable({ providedIn: 'root' })
export class TokenStore {
  readonly token = signal<string | null>(readToken());
  /** Called when the API rejects the token (expired, account locked or deleted). */
  onRejected: ((code: string | null) => void) | null = null;

  set(token: string | null): void {
    this.token.set(token);
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Private mode: the session simply won't survive a reload.
    }
  }
}

/** `/api` requests in flight; lets the UI wait until a screen has finished loading. */
@Injectable({ providedIn: 'root' })
export class ApiActivity {
  readonly pending = signal(0);

  /**
   * Resolves once no request has been in flight for `quietMs` (or after `maxMs`). Waits a frame
   * first so requests started by effects of a state change that just happened are counted.
   */
  async idle(maxMs = 3000, quietMs = 150): Promise<void> {
    const deadline = performance.now() + maxMs;
    await sleep(50);
    let quietSince = performance.now();
    while (performance.now() < deadline) {
      if (this.pending() > 0) quietSince = performance.now();
      else if (performance.now() - quietSince >= quietMs) return;
      await sleep(40);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function readToken(): string | null {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return t;
  } catch {
    return null;
  }
}

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Adds the bearer token and the learner's time zone (used for "today" / streaks) to API calls. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API)) return next(req);
  const store = inject(TokenStore);
  const activity = inject(ApiActivity);
  const token = store.token();
  const setHeaders: Record<string, string> = { 'X-Timezone': timeZone() };
  if (token) setHeaders['Authorization'] = `Bearer ${token}`;
  activity.pending.update((n) => n + 1);
  return next(req.clone({ setHeaders })).pipe(
    tap({
      error: (e: unknown) => {
        if (e instanceof HttpErrorResponse && e.status === 401 && token && store.token() === token) {
          store.onRejected?.((e.error as { code?: string } | null)?.code ?? null);
        }
      },
    }),
    finalize(() => activity.pending.update((n) => Math.max(0, n - 1))),
  );
};

/** Thin promise-based wrapper over HttpClient for `/api/**`. */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: Params): Promise<T> {
    return firstValueFrom(this.http.get<T>(API + path, { params: toParams(params) }));
  }

  post<T = void>(path: string, body: unknown = {}, params?: Params): Promise<T> {
    return firstValueFrom(this.http.post<T>(API + path, body, { params: toParams(params) }));
  }

  put<T = void>(path: string, body: unknown = {}): Promise<T> {
    return firstValueFrom(this.http.put<T>(API + path, body));
  }

  patch<T = void>(path: string, body: unknown = {}): Promise<T> {
    return firstValueFrom(this.http.patch<T>(API + path, body));
  }

  delete<T = void>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(API + path));
  }
}

function toParams(params?: Params): HttpParams | undefined {
  if (!params) return undefined;
  let p = new HttpParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
  return p;
}

/** Encodes one path segment (ids may contain `:` or `.`). */
export function seg(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Human-readable message the server attached to a 4xx answer (validation messages are
 * written for end users), or null for transport / unexpected errors.
 */
export function serverMessage(e: unknown): string | null {
  if (!(e instanceof HttpErrorResponse) || e.status < 400 || e.status >= 500) return null;
  const body = e.error as { detail?: string; title?: string } | string | null;
  if (typeof body === 'string') return body.length < 300 ? body : null;
  const detail = body?.detail;
  return detail && detail.length < 300 && !/exception|java\.|org\./i.test(detail) ? detail : null;
}

export function httpStatus(e: unknown): number {
  return e instanceof HttpErrorResponse ? e.status : -1;
}
