import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import {
  GrammarContent,
  ListeningContent,
  ReadingContent,
  SpeakingContent,
  VideoContent,
  VocabItem,
  VocabStatus,
  VocabularyContent,
} from '../../core/models';
import { SpeechService } from '../../core/speech.service';
import { similarity } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { LookupTextComponent } from '../../shared/lookup-text.component';
import { VoiceRecorderComponent } from '../../shared/voice-recorder.component';

@Component({
  selector: 'app-vocab-block',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let w = current();
    <div class="mx-auto max-w-lg">
      <p class="mb-3 text-center text-sm font-semibold text-muted">{{ index() + 1 }} / {{ content().items.length }}</p>
      <button type="button" class="card relative block min-h-80 w-full p-6 text-center transition hover:shadow-lg" (click)="flipped.set(!flipped())"
        [attr.aria-label]="'lesson.flip' | t" [style.perspective]="'1000px'">
        @if (w.imageUrl) { <img [src]="w.imageUrl" alt="" loading="lazy" class="mx-auto mb-4 h-28 w-28 rounded-2xl object-cover" /> }
        @if (!flipped()) {
          <div class="animate-flip">
            <p class="font-display text-5xl font-black break-words" [class.jp]="jp()">{{ w.word }}</p>
            @if (w.reading) { <p class="jp mt-2 text-xl text-muted">{{ w.reading }}</p> }
            <p class="mt-1 text-muted">{{ w.ipa || w.romaji }}</p>
            <span class="chip mt-3">{{ w.pos }}</span>
            <p class="mt-8 text-sm text-muted">{{ 'lesson.tapToFlip' | t }}</p>
          </div>
        } @else {
          <div class="animate-flip">
            <p class="font-display text-3xl font-black">{{ w.meaning | loc }}</p>
            @if (w.example) {
              <p class="mt-6 text-lg" [class.jp]="jp()">{{ w.example }}</p>
              @if (w.exampleReading) { <p class="jp text-sm text-muted">{{ w.exampleReading }}</p> }
              <p class="mt-1 text-muted">{{ w.exampleMeaning | loc }}</p>
            }
          </div>
        }
      </button>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button type="button" class="btn-outline !px-3" (click)="prev()" [disabled]="index() === 0" [attr.aria-label]="'common.back' | t"><app-icon name="chevronLeft" /></button>
        <button type="button" class="btn-soft" (click)="say(w.word)"><app-icon name="volume" /> {{ 'common.listen' | t }}</button>
        @if (w.example) { <button type="button" class="btn-soft" (click)="say(w.example)"><app-icon name="play" [size]="16" /> {{ 'lesson.example' | t }}</button> }
        <button type="button" class="btn-outline !px-3" (click)="next()" [disabled]="index() === content().items.length - 1" [attr.aria-label]="'common.next' | t"><app-icon name="chevronRight" /></button>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button type="button" class="btn-outline text-sm" [class.!border-warning]="marks()[w.id] === 'difficult'" [class.!text-warning]="marks()[w.id] === 'difficult'" [attr.aria-pressed]="marks()[w.id] === 'difficult'" (click)="mark(w, 'difficult')">
          <app-icon name="alert" [size]="16" class="text-warning" /> {{ 'vocab.difficult' | t }}
        </button>
        <button type="button" class="btn-outline text-sm" [class.!border-success]="marks()[w.id] === 'known'" [class.!text-success]="marks()[w.id] === 'known'" [attr.aria-pressed]="marks()[w.id] === 'known'" (click)="mark(w, 'known')">
          <app-icon name="checkCircle" [size]="16" class="text-success" [draw]="marks()[w.id] === 'known'" /> {{ 'vocab.known' | t }}
        </button>
      </div>
      <button type="button" class="btn-primary mt-6 w-full" (click)="index() < content().items.length - 1 ? next() : finished.emit()">
        {{ (index() < content().items.length - 1 ? 'common.next' : 'common.continue') | t }}
      </button>
    </div>
  `,
})
export class VocabBlockComponent {
  private readonly speech = inject(SpeechService);
  readonly content = input.required<VocabularyContent>();
  readonly speechLang = input('en-US');
  readonly finished = output<void>();
  readonly marked = output<{ item: VocabItem; status: VocabStatus }>();
  protected readonly index = signal(0);
  protected readonly flipped = signal(false);
  protected readonly marks = signal<Record<string, VocabStatus>>({});
  protected readonly current = computed(() => this.content().items[this.index()]);
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));

  protected say(text: string): void {
    this.speech.speak(text, this.speechLang());
  }
  protected next(): void {
    this.index.update((i) => Math.min(i + 1, this.content().items.length - 1));
    this.flipped.set(false);
  }
  protected prev(): void {
    this.index.update((i) => Math.max(i - 1, 0));
    this.flipped.set(false);
  }
  protected mark(item: VocabItem, status: VocabStatus): void {
    this.marks.update((m) => ({ ...m, [item.id]: status }));
    this.marked.emit({ item, status });
  }
}

@Component({
  selector: 'app-grammar-block',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      @for (g of content().points; track g.id) {
        <article class="card p-5">
          <h3 class="font-display text-xl font-black" [class.jp]="jp()">{{ g.title }}</h3>
          <p class="mt-3 rounded-xl bg-primary-soft px-4 py-3 font-mono text-sm font-semibold text-primary" [class.jp]="jp()">{{ g.structure }}</p>
          <p class="mt-3 leading-relaxed">{{ g.explanation | loc }}</p>
          <ul class="mt-4 space-y-3">
            @for (e of g.examples; track $index) {
              <li class="flex items-start gap-3 rounded-xl bg-surface-2 p-3">
                <button type="button" class="mt-0.5 text-primary" (click)="say(e.text)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" [size]="18" /></button>
                <div>
                  <p class="font-semibold" [class.jp]="jp()">{{ e.text }}</p>
                  @if (e.reading) { <p class="jp text-sm text-muted">{{ e.reading }}</p> }
                  <p class="text-sm text-muted">{{ e.meaning | loc }}</p>
                </div>
              </li>
            }
          </ul>
          @if (g.note) { <p class="mt-3 flex gap-1.5 text-sm text-muted"><app-icon name="lightbulb" [size]="16" class="mt-0.5 shrink-0 text-warning" /><span>{{ g.note | loc }}</span></p> }
        </article>
      }
      <button type="button" class="btn-primary w-full" (click)="finished.emit()">{{ 'common.continue' | t }}</button>
    </div>
  `,
})
export class GrammarBlockComponent {
  private readonly speech = inject(SpeechService);
  readonly content = input.required<GrammarContent>();
  readonly speechLang = input('en-US');
  readonly finished = output<void>();
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));
  protected say(text: string): void {
    this.speech.speak(text, this.speechLang());
  }
}

@Component({
  selector: 'app-reading-block',
  imports: [IconComponent, LookupTextComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card p-5 sm:p-7">
      <div class="mb-3 flex flex-wrap gap-2">
        <button type="button" class="btn-soft !min-h-9 text-sm" (click)="toggleRead()"><app-icon [name]="speech.speaking() ? 'pause' : 'volume'" [size]="16" /> {{ 'lesson.readAloud' | t }}</button>
        @if (content().passageReading) {
          <button type="button" class="btn-outline !min-h-9 text-sm" (click)="showReading.set(!showReading())">{{ 'lesson.showReading' | t }}</button>
        }
        @if (content().translation) {
          <button type="button" class="btn-outline !min-h-9 text-sm" (click)="showTrans.set(!showTrans())">{{ 'lesson.showTranslation' | t }}</button>
        }
      </div>
      <p class="mb-2 text-xs text-muted">👆 {{ 'lookup.hint' | t }}</p>
      <p class="whitespace-pre-line text-lg leading-loose" [class.jp]="jp()"><app-lookup-text [text]="content().passage" [lang]="jp() ? 'ja' : 'en'" /></p>
      @if (showReading()) { <p class="jp mt-4 whitespace-pre-line text-muted">{{ content().passageReading }}</p> }
      @if (showTrans()) { <p class="mt-4 whitespace-pre-line border-t border-line pt-4 text-muted">{{ content().translation | loc }}</p> }
    </article>
    <button type="button" class="btn-primary mt-5 w-full" (click)="speech.stopSpeaking(); finished.emit()">{{ 'lesson.toQuestions' | t }}</button>
  `,
})
export class ReadingBlockComponent implements OnDestroy {
  protected readonly speech = inject(SpeechService);
  readonly content = input.required<ReadingContent>();
  readonly speechLang = input('en-US');
  readonly finished = output<void>();
  protected readonly showTrans = signal(false);
  protected readonly showReading = signal(false);
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));
  protected toggleRead(): void {
    if (this.speech.speaking()) this.speech.stopSpeaking();
    else this.speech.speak(this.content().passage, this.speechLang(), 0.9);
  }
  ngOnDestroy(): void {
    this.speech.stopSpeaking();
  }
}

@Component({
  selector: 'app-listening-block',
  imports: [IconComponent, LookupTextComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-5 sm:p-7">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-3">
          <button type="button" class="btn-outline h-12 w-12 !p-0" (click)="restart()" [attr.aria-label]="'lesson.replay' | t"><app-icon name="refresh" /></button>
          <button type="button" class="btn-primary h-16 w-16 !rounded-full !p-0" (click)="toggle()" [attr.aria-label]="(playing() ? 'lesson.pause' : 'lesson.play') | t">
            <app-icon [name]="playing() ? 'pause' : 'play'" [size]="28" />
          </button>
        </div>
        <div class="w-full max-w-md">
          <div class="h-2 overflow-hidden rounded-full bg-surface-2"><div class="gradient-bar h-full transition-all" [style.width.%]="progress()"></div></div>
        </div>
        <div class="flex gap-1.5" role="group" [attr.aria-label]="'lesson.speed' | t">
          @for (r of rates; track r) {
            <button type="button" class="chip-toggle" [attr.aria-pressed]="rate() === r" (click)="setRate(r)">{{ r }}x</button>
          }
        </div>
      </div>
      <button type="button" class="mt-6 text-sm font-semibold text-primary" (click)="showScript.set(!showScript())">
        {{ (showScript() ? 'lesson.hideScript' : 'lesson.showScript') | t }}
      </button>
      @if (showScript()) {
        <ul class="mt-3 space-y-2">
          @for (line of content().script; track $index; let i = $index) {
            <li class="rounded-xl p-3 transition" [class]="i === line$() && playing() ? 'bg-primary-soft' : 'bg-surface-2'">
              @if (line.speaker) { <b class="mr-1">{{ line.speaker }}:</b> }
              <app-lookup-text [text]="line.text" [lang]="jp() ? 'ja' : 'en'" />
              @if (line.meaning) { <p class="text-sm text-muted">{{ line.meaning | loc }}</p> }
            </li>
          }
        </ul>
      }
    </div>
    <button type="button" class="btn-primary mt-5 w-full" (click)="stop(); finished.emit()">{{ 'lesson.toQuestions' | t }}</button>
  `,
})
export class ListeningBlockComponent implements OnDestroy {
  private readonly speech = inject(SpeechService);
  readonly content = input.required<ListeningContent>();
  readonly speechLang = input('en-US');
  readonly finished = output<void>();
  protected readonly rates = [0.75, 1, 1.25, 1.5];
  protected readonly rate = signal(1);
  protected readonly playing = signal(false);
  protected readonly line$ = signal(0);
  protected readonly showScript = signal(false);
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));
  protected readonly progress = computed(() => (this.line$() / Math.max(1, this.content().script.length)) * 100);
  private audio: HTMLAudioElement | null = null;
  private token = 0;

  protected setRate(r: number): void {
    this.rate.set(r);
    if (this.audio) this.audio.playbackRate = r;
  }

  protected toggle(): void {
    if (this.playing()) this.stop();
    else this.playFrom(this.line$() >= this.content().script.length ? 0 : this.line$());
  }

  protected restart(): void {
    this.stop();
    this.playFrom(0);
  }

  protected stop(): void {
    this.token++;
    this.playing.set(false);
    this.speech.stopSpeaking();
    this.audio?.pause();
  }

  private async playFrom(start: number): Promise<void> {
    const my = ++this.token;
    this.playing.set(true);
    const url = this.content().audioUrl;
    if (url) {
      this.audio ??= new Audio(url);
      this.audio.playbackRate = this.rate();
      this.audio.ontimeupdate = () => this.line$.set(Math.floor((this.audio!.currentTime / (this.audio!.duration || 1)) * this.content().script.length));
      this.audio.onended = () => this.playing.set(false);
      await this.audio.play().catch(() => this.playing.set(false));
      return;
    }
    for (let i = start; i < this.content().script.length; i++) {
      if (my !== this.token) return;
      this.line$.set(i);
      await this.speech.speak(this.content().script[i].text, this.speechLang(), this.rate() * 0.95);
      await new Promise((r) => setTimeout(r, 350));
    }
    if (my === this.token) {
      this.line$.set(this.content().script.length);
      this.playing.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

@Component({
  selector: 'app-speaking-block',
  imports: [IconComponent, VoiceRecorderComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      @if (!speech.sttSupported) { <p class="alert-warning"><app-icon name="mic" [size]="18" /><span>{{ 'exercise.noMic' | t }}</span></p> }
      @for (p of content().prompts; track $index; let i = $index) {
        <div class="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div class="flex-1">
            <p class="text-lg font-bold" [class.jp]="jp()">{{ p.text }}</p>
            @if (p.reading) { <p class="jp text-sm text-muted">{{ p.reading }}</p> }
            <p class="text-sm text-muted">{{ p.meaning | loc }}</p>
            @if (heard()[i] !== undefined) {
              <p class="mt-2 flex flex-wrap items-center gap-1 text-sm"><app-icon name="mic" [size]="14" class="text-muted" /> “{{ heard()[i] || '…' }}”
                <span class="ml-1" [class]="score(i) >= 70 ? 'chip-success' : 'chip-warning'">{{ score(i) }}%</span>
              </p>
            }
            <app-voice-recorder class="mt-2 block" />
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-soft !px-3" (click)="speech.speak(p.text, speechLang())" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" /></button>
            @if (speech.sttSupported) {
              <button type="button" class="btn !px-3 text-white" [class]="active() === i ? 'bg-error animate-pulse' : 'bg-primary'" (click)="record(i)" [attr.aria-label]="'exercise.record' | t">
                <app-icon name="mic" />
              </button>
            }
          </div>
        </div>
      }
      <button type="button" class="btn-primary w-full" (click)="finished.emit()">{{ 'common.continue' | t }}</button>
    </div>
  `,
})
export class SpeakingBlockComponent {
  protected readonly speech = inject(SpeechService);
  readonly content = input.required<SpeakingContent>();
  readonly speechLang = input('en-US');
  readonly finished = output<void>();
  protected readonly heard = signal<Record<number, string>>({});
  protected readonly active = signal<number | null>(null);
  protected readonly jp = computed(() => this.speechLang().startsWith('ja'));

  protected score(i: number): number {
    return similarity(this.heard()[i] ?? '', this.content().prompts[i].text);
  }

  protected async record(i: number): Promise<void> {
    if (this.active() === i) {
      this.speech.stopListening();
      return;
    }
    this.active.set(i);
    try {
      const t = await this.speech.listen(this.speechLang());
      this.heard.update((h) => ({ ...h, [i]: t }));
    } catch {
      this.heard.update((h) => ({ ...h, [i]: '' }));
    } finally {
      this.active.set(null);
    }
  }
}

@Component({
  selector: 'app-video-block',
  imports: [...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card overflow-hidden">
      <video class="aspect-video w-full bg-black" [src]="content().videoUrl" [poster]="content().posterUrl ?? ''" controls playsinline preload="metadata"></video>
      @if (content().description) { <p class="p-4 text-muted">{{ content().description | loc }}</p> }
    </div>
    <button type="button" class="btn-primary mt-5 w-full" (click)="finished.emit()">{{ 'common.continue' | t }}</button>
  `,
})
export class VideoBlockComponent {
  readonly content = input.required<VideoContent>();
  readonly finished = output<void>();
  protected readonly i18n = inject(I18nService);
}
