import { Injectable, inject } from '@angular/core';
import { API, Api, TokenStore, seg } from './api';
import { AuthService } from './auth.service';

export type SessionKind = 'lesson' | 'exam';

/** A resumable lesson / mock exam (as listed on the dashboard). */
export interface SessionSummary {
  kind: SessionKind;
  refId: string;
  courseId?: string;
  languageId?: string;
  title?: string;
  position: number;
  total: number;
  percent: number;
  updatedAt: number;
}

export interface Session<S> extends SessionSummary {
  state: S;
}

export interface SessionInput<S> {
  courseId?: string;
  languageId?: string;
  title?: string;
  position: number;
  total: number;
  state: S;
}

const LOCAL_PREFIX = 'lingora.s.';
const SAVE_DELAY = 1500;
/** Same retention as the backend (sessions untouched for 30 days are purged). */
const TTL = 30 * 86_400_000;

interface Pending {
  timer: ReturnType<typeof setTimeout>;
  body: SessionInput<unknown>;
}

/**
 * Saves where the learner stopped in a lesson or exam so it can be resumed later, on any
 * device. Writes are debounced and mirrored to localStorage first, so progress also
 * survives a lost connection or a closed tab; the newest copy wins when resuming.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly tokens = inject(TokenStore);
  private readonly pending = new Map<string, Pending>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => this.flushAll(true));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flushAll(true);
      });
    }
  }

  /** Most recently touched unfinished lessons / exams. */
  async list(kind?: SessionKind, limit = 10): Promise<SessionSummary[]> {
    return this.api.get<SessionSummary[]>('/me/sessions', { kind, limit });
  }

  /** The saved state for one lesson / exam, or null when there is nothing to resume. */
  async get<S>(kind: SessionKind, refId: string): Promise<Session<S> | null> {
    const local = this.readLocal<S>(kind, refId);
    let remote: Session<S> | null = null;
    try {
      remote = (await this.api.get<Session<S> | null>(`/me/sessions/${kind}/${seg(refId)}`)) ?? null;
    } catch {
      return local;
    }
    if (local && (!remote || local.updatedAt > remote.updatedAt + 1000)) {
      this.save(kind, refId, local);
      return local;
    }
    return remote;
  }

  /** Debounced save; call on every meaningful step. */
  save<S>(kind: SessionKind, refId: string, input: SessionInput<S>): void {
    if (!this.auth.user()) return;
    const key = this.key(kind, refId);
    this.writeLocal(kind, refId, input);
    const existing = this.pending.get(key);
    if (existing) clearTimeout(existing.timer);
    this.pending.set(key, {
      body: input,
      timer: setTimeout(() => this.flush(kind, refId), SAVE_DELAY),
    });
  }

  /** Sends a pending save right away (e.g. when leaving the page). */
  flush(kind: SessionKind, refId: string, keepalive = false): void {
    const key = this.key(kind, refId);
    const p = this.pending.get(key);
    if (!p) return;
    clearTimeout(p.timer);
    this.pending.delete(key);
    const url = `/me/sessions/${kind}/${seg(refId)}`;
    if (keepalive) {
      const token = this.tokens.token();
      if (!token) return;
      fetch(API + url, {
        method: 'PUT',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(p.body),
      }).catch(() => undefined);
      return;
    }
    this.api.put(url, p.body).catch(() => undefined);
  }

  /** Forgets the session (lesson finished, exam submitted or learner chose to restart). */
  async clear(kind: SessionKind, refId: string): Promise<void> {
    const key = this.key(kind, refId);
    const p = this.pending.get(key);
    if (p) clearTimeout(p.timer);
    this.pending.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    await this.api.delete(`/me/sessions/${kind}/${seg(refId)}`).catch(() => undefined);
  }

  private flushAll(keepalive: boolean): void {
    for (const key of [...this.pending.keys()]) {
      const [kind, ...rest] = key.slice(this.prefix().length).split('.');
      this.flush(kind as SessionKind, rest.join('.'), keepalive);
    }
  }

  private prefix(): string {
    return `${LOCAL_PREFIX}${this.auth.user()?.uid ?? 'anon'}.`;
  }

  private key(kind: SessionKind, refId: string): string {
    return `${this.prefix()}${kind}.${refId}`;
  }

  private writeLocal<S>(kind: SessionKind, refId: string, input: SessionInput<S>): void {
    const s: Session<S> = {
      kind,
      refId,
      ...input,
      percent: Math.round((input.position * 100) / Math.max(1, input.total)),
      updatedAt: Date.now(),
    };
    try {
      localStorage.setItem(this.key(kind, refId), JSON.stringify(s));
    } catch {
      // Quota exceeded: the server copy is still saved.
    }
  }

  private readLocal<S>(kind: SessionKind, refId: string): Session<S> | null {
    try {
      const raw = localStorage.getItem(this.key(kind, refId));
      if (!raw) return null;
      const s = JSON.parse(raw) as Session<S>;
      if (Date.now() - s.updatedAt > TTL) {
        localStorage.removeItem(this.key(kind, refId));
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
}
