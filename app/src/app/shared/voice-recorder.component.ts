import { ChangeDetectionStrategy, Component, OnDestroy, input, signal } from '@angular/core';
import { I18N_PIPES } from '../core/i18n.pipes';
import { IconComponent } from './icon.component';

type RecState = 'idle' | 'recording' | 'ready' | 'denied';

/**
 * Records the learner's voice with MediaRecorder so they can play it back, compare it with
 * the model pronunciation and try again. Recordings stay in memory and are never uploaded.
 */
@Component({
  selector: 'app-voice-recorder',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (supported) {
      <div class="flex flex-wrap items-center gap-2">
        @switch (state()) {
          @case ('recording') {
            <button type="button" class="btn !min-h-10 bg-error text-sm text-white" (click)="stop()">
              <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-white"></span> {{ 'rec.stop' | t }} · {{ seconds() }}s
            </button>
          }
          @case ('ready') {
            <audio class="h-10 max-w-full" [src]="url()" controls></audio>
            <button type="button" class="btn-soft !min-h-10 text-sm" (click)="start()"><app-icon name="refresh" [size]="16" /> {{ 'rec.retry' | t }}</button>
          }
          @default {
            <button type="button" class="btn-outline !min-h-10 text-sm" (click)="start()"><app-icon name="mic" [size]="16" /> {{ 'rec.start' | t }}</button>
            @if (state() === 'denied') { <span class="text-sm text-error">{{ 'rec.denied' | t }}</span> }
          }
        }
      </div>
    }
  `,
})
export class VoiceRecorderComponent implements OnDestroy {
  readonly maxSeconds = input(15);

  protected readonly supported =
    typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
  protected readonly state = signal<RecState>('idle');
  protected readonly url = signal<string>('');
  protected readonly seconds = signal(0);

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private destroyed = false;

  async start(): Promise<void> {
    this.reset();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.state.set('denied');
      return;
    }
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(this.stream);
    this.recorder = rec;
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      this.release();
      if (this.destroyed || !chunks.length) return this.state.set('idle');
      this.url.set(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
      this.state.set('ready');
    };
    rec.start();
    this.state.set('recording');
    this.seconds.set(0);
    this.timer = setInterval(() => {
      this.seconds.update((s) => s + 1);
      if (this.seconds() >= this.maxSeconds()) this.stop();
    }, 1000);
  }

  stop(): void {
    clearInterval(this.timer);
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stop();
    this.release();
    this.reset();
  }

  private reset(): void {
    if (this.url()) URL.revokeObjectURL(this.url());
    this.url.set('');
    this.state.set('idle');
  }

  private release(): void {
    clearInterval(this.timer);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
  }
}
