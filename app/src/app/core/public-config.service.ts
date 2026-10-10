import { Injectable, inject } from '@angular/core';
import { Api } from './api';

/** Public Firebase web config (no secrets); used only for the Google sign-in popup. */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId?: string;
}

export interface PublicConfig {
  /** Set when Google sign-in goes through Firebase Authentication. */
  firebase: FirebaseWebConfig | null;
  /** Google Identity Services client id (used when Firebase is not configured). */
  googleClientId: string;
  storageEnabled: boolean;
  /** False when new accounts are active right away (no activation email). */
  requireActivation: boolean;
}

/** Runtime configuration published by the backend (`/api/public/config`). */
@Injectable({ providedIn: 'root' })
export class PublicConfigService {
  private readonly api = inject(Api);
  private cached: Promise<PublicConfig> | null = null;

  get(): Promise<PublicConfig> {
    this.cached ??= this.api.get<PublicConfig>('/public/config').catch(() => {
      this.cached = null;
      return { firebase: null, googleClientId: '', storageEnabled: false, requireActivation: true };
    });
    return this.cached;
  }
}
