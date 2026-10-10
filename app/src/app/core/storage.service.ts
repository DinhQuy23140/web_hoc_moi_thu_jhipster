import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';
import { PublicConfigService } from './public-config.service';

export type MediaKind = 'image' | 'audio' | 'video';

const LIMITS: Record<MediaKind, { mime: RegExp; maxMb: number }> = {
  image: { mime: /^image\/(png|jpe?g|webp|gif|avif|svg\+xml)$/, maxMb: 5 },
  audio: { mime: /^audio\/(mpeg|mp3|wav|ogg|webm|mp4|aac|x-m4a)$/, maxMb: 20 },
  video: { mime: /^video\/(mp4|webm|ogg|quicktime)$/, maxMb: 200 },
};

export class UploadError extends Error {
  constructor(public readonly code: 'not-configured' | 'type' | 'size' | 'auth' | 'upload', message?: string) {
    super(message ?? code);
  }
}

/**
 * Media (images, audio, video) lives in Supabase Storage. The backend checks who may write
 * where and hands out a one-time signed upload URL; the file then goes straight from the
 * browser to Supabase, so large videos never pass through the API server.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly api = inject(Api);
  private readonly config = inject(PublicConfigService);
  private readonly enabled = signal(false);

  constructor() {
    this.config.get().then((c) => this.enabled.set(c.storageEnabled));
  }

  get configured(): boolean {
    return this.enabled();
  }

  validate(file: File, kind: MediaKind): void {
    const rule = LIMITS[kind];
    if (!rule.mime.test(file.type)) throw new UploadError('type');
    if (file.size > rule.maxMb * 1024 * 1024) throw new UploadError('size', String(rule.maxMb));
  }

  /** Uploads under `folder/` with a random, non-guessable name and returns the public URL. */
  async upload(file: File, kind: MediaKind, folder: string): Promise<string> {
    if (!(await this.config.get()).storageEnabled) throw new UploadError('not-configured');
    this.validate(file, kind);
    let signed: { uploadUrl: string; publicUrl: string };
    try {
      signed = await this.api.post('/media/sign-upload', {
        kind,
        contentType: file.type,
        size: file.size,
        folder: folder.replace(/^\/+|\/+$/g, ''),
        fileName: file.name,
      });
    } catch (e) {
      if (e instanceof HttpErrorResponse && (e.status === 401 || e.status === 403)) throw new UploadError('auth');
      throw new UploadError('upload', (e as { error?: { detail?: string } }).error?.detail);
    }
    const form = new FormData();
    form.append('cacheControl', '31536000');
    form.append('', file);
    const res = await fetch(signed.uploadUrl, { method: 'PUT', body: form, headers: { 'x-upsert': 'false' } }).catch(() => null);
    if (!res?.ok) throw new UploadError('upload', res ? `${res.status}` : 'network');
    return signed.publicUrl;
  }

  async list(folder: string): Promise<{ name: string; url: string; size: number }[]> {
    if (!(await this.config.get()).storageEnabled) return [];
    return this.api.get<{ name: string; url: string; size: number }[]>('/admin/media', { folder });
  }
}
