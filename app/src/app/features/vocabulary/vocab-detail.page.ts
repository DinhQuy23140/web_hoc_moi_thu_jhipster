import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { TARGETS, TargetLang } from '../../core/learn-context.service';
import { UserVocab, VocabStatus, Vocabulary } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SpeechService } from '../../core/speech.service';
import { mastery } from '../../core/srs';
import { ToastService } from '../../core/toast.service';
import { similarity } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, SpinnerComponent } from '../../shared/ui';
import { VoiceRecorderComponent } from '../../shared/voice-recorder.component';

@Component({
  selector: 'app-vocab-detail',
  imports: [FormsModule, RouterLink, IconComponent, EmptyComponent, SpinnerComponent, VoiceRecorderComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (word(); as v) {
      <div class="page max-w-6xl">
        <a routerLink="/vocabulary" class="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg">
          <app-icon name="chevronLeft" [size]="16" /> {{ 'vocab.title' | t }}
        </a>

       <div class="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div class="min-w-0 space-y-5">
        <section class="card overflow-hidden">
          @if (v.imageUrl) { <img class="aspect-[16/7] w-full object-cover" [src]="v.imageUrl" [alt]="v.word" loading="lazy" /> }
          <div class="p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 class="font-display text-5xl font-black" [class.jp]="jp()">{{ v.word }}</h1>
                <p class="mt-2 flex flex-wrap gap-x-3 text-lg text-muted">
                  @if (v.reading) { <span class="jp">{{ v.reading }}</span> }
                  @if (v.romaji) { <span>{{ v.romaji }}</span> }
                  @if (v.ipa) { <span>{{ v.ipa }}</span> }
                </p>
              </div>
              <div class="flex gap-2">
                <button type="button" class="btn-primary h-12 w-12 !p-0" (click)="say(v.word)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" /></button>
                <button type="button" class="btn-soft h-12 !px-3 text-sm" (click)="say(v.word, 0.6)" [attr.aria-label]="'lesson.slow' | t"><app-icon name="timer" [size]="16" /> 0.6x</button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span class="chip">{{ v.level }}</span>
              <span class="chip">{{ v.pos }}</span>
              @if (v.topic) { <span class="chip">{{ v.topic }}</span> }
            </div>
            <dl class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-surface-2 p-4">
                <dt class="text-xs font-bold uppercase text-muted">Tiếng Việt</dt>
                <dd class="mt-1 text-xl font-bold">{{ v.meaning.vi }}</dd>
              </div>
              @if (v.meaning.en) {
                <div class="rounded-xl bg-surface-2 p-4">
                  <dt class="text-xs font-bold uppercase text-muted">English</dt>
                  <dd class="mt-1 text-xl font-bold">{{ v.meaning.en }}</dd>
                </div>
              }
            </dl>
          </div>
        </section>

        @if (v.example) {
          <section class="card p-5">
            <h2 class="mb-3 font-display text-lg font-black">{{ 'vocabDetail.example' | t }}</h2>
            <div class="flex items-start gap-3">
              <button type="button" class="mt-1 text-primary" (click)="say(v.example)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" /></button>
              <div>
                <p class="text-lg font-semibold" [class.jp]="jp()">{{ v.example }}</p>
                @if (v.exampleReading) { <p class="jp text-sm text-muted">{{ v.exampleReading }}</p> }
                @if (v.exampleMeaning | loc; as m) { <p class="mt-1 text-muted">{{ m }}</p> }
              </div>
            </div>
          </section>
        }

        <section class="card p-5">
          <h2 class="mb-1 font-display text-lg font-black">{{ 'vocabDetail.practice' | t }}</h2>
          <p class="mb-4 text-sm text-muted">{{ 'vocabDetail.practiceSub' | t }}</p>
          <div class="flex flex-wrap items-center gap-3">
            @if (speech.sttSupported) {
              <button type="button" class="btn text-white" [class]="speech.listening() ? 'bg-error animate-pulse' : 'bg-primary'" (click)="check(v.word)">
                <app-icon name="mic" [size]="18" /> {{ (speech.listening() ? 'exercise.listening' : 'exercise.tapToSpeak') | t }}
              </button>
            }
            <app-voice-recorder />
          </div>
          @if (heard() !== null) {
            <p class="mt-3 flex flex-wrap items-center gap-1"><app-icon name="mic" [size]="16" class="text-muted" /> “{{ heard() || '…' }}”
              <span class="ml-1" [class]="score() >= 70 ? 'chip-success' : 'chip-warning'">{{ score() }}%</span>
            </p>
          }
        </section>
        </div>

        <div class="space-y-5">
        <section class="card p-5">
          <h2 class="mb-3 font-display text-lg font-black">{{ 'vocabDetail.deck' | t }}</h2>
          @if (mine(); as w) {
            <div class="flex flex-wrap items-center gap-4">
              <span class="flex gap-1" [title]="'vocab.mastery' | t">
                @for (i of [1, 2, 3, 4, 5]; track i) { <span class="h-2.5 w-2.5 rounded-full" [class]="mastery(w) >= i ? 'bg-success' : 'bg-surface-2'"></span> }
              </span>
              <span class="text-sm text-muted">{{ 'vocabDetail.stats' | t: { correct: w.correct, wrong: w.wrong } }}</span>
              <span class="text-sm text-muted">{{ 'vocabDetail.due' | t }}: {{ dueText(w) }}</span>
              <select class="input !min-h-10 !w-40 text-sm" [ngModel]="w.status" (ngModelChange)="setStatus($event)" [attr.aria-label]="'vocab.mastery' | t">
                @for (s of statuses; track s) { <option [value]="s">{{ 'vocab.status.' + s | t }}</option> }
              </select>
            </div>
          } @else {
            <button type="button" class="btn-primary" (click)="add(v)"><app-icon name="plus" [size]="18" /> {{ 'vocabDetail.add' | t }}</button>
          }
        </section>

        @if (related().length) {
          <section>
            <h2 class="mb-3 font-display text-lg font-black">{{ 'vocabDetail.related' | t }}</h2>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              @for (r of related(); track r.id) {
                <a [routerLink]="['/vocabulary', r.id]" class="card flex items-center justify-between gap-3 p-4 card-hover">
                  <span class="min-w-0">
                    <b class="font-display text-lg" [class.jp]="jp()">{{ r.word }}</b>
                    <span class="ml-2 text-sm text-muted" [class.jp]="!!r.reading">{{ r.reading || r.ipa }}</span>
                    <span class="block truncate text-sm text-muted">{{ r.meaning | loc }}</span>
                  </span>
                  <app-icon name="chevronRight" [size]="18" />
                </a>
              }
            </div>
          </section>
        }
        </div>
       </div>
      </div>
    } @else {
      <app-empty icon="search" [text]="'common.notFound' | t" />
    }
  `,
})
export class VocabDetailPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  protected readonly speech = inject(SpeechService);

  readonly id = input.required<string>();
  protected readonly loading = signal(true);
  protected readonly word = signal<Vocabulary | undefined>(undefined);
  protected readonly mine = signal<UserVocab | null>(null);
  protected readonly related = signal<Vocabulary[]>([]);
  protected readonly heard = signal<string | null>(null);
  protected readonly statuses: VocabStatus[] = ['learning', 'difficult', 'known'];
  protected readonly mastery = mastery;

  protected readonly jp = computed(() => this.word()?.languageId === 'ja');
  protected readonly score = computed(() => similarity(this.heard() ?? '', this.word()?.word ?? ''));
  private readonly lang = computed(() => TARGETS[(this.word()?.languageId ?? 'en') as TargetLang]?.speech ?? 'en-US');

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  protected say(text: string, rate?: number): void {
    const v = this.word();
    if (v?.audioUrl && text === v.word) {
      const a = new Audio(v.audioUrl);
      if (rate) a.playbackRate = rate;
      a.play().catch(() => undefined);
      return;
    }
    this.speech.speak(text, this.lang(), rate);
  }

  protected async check(target: string): Promise<void> {
    if (this.speech.listening()) {
      this.speech.stopListening();
      return;
    }
    try {
      this.heard.set(await this.speech.listen(this.lang()));
    } catch {
      this.heard.set('');
    }
    if (target === this.word()?.word && this.score() >= 70) this.toast.success(this.i18n.t('exercise.correct'));
  }

  protected dueText(w: UserVocab): string {
    if (w.due <= Date.now()) return this.i18n.t('vocabDetail.dueNow');
    return new Intl.DateTimeFormat(this.i18n.locale(), { day: 'numeric', month: 'short' }).format(w.due);
  }

  protected async add(v: Vocabulary): Promise<void> {
    await this.progress.addWord(v, v.languageId, 'learning');
    this.toast.success(this.i18n.t('vocab.saved'));
    this.mine.set(await this.progress.myWord(v.id).catch(() => null));
  }

  protected async setStatus(s: VocabStatus): Promise<void> {
    const w = this.mine();
    if (!w) return;
    await this.progress.setWordStatus(w.vocabId, s);
    this.mine.set({ ...w, status: s });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.heard.set(null);
    try {
      const v = await this.content.vocab(id);
      this.word.set(v);
      if (!v) return;
      const [mine, pool] = await Promise.all([
        this.progress.myWord(id).catch(() => null),
        this.content.vocabPool(v.languageId, v.level).catch(() => []),
      ]);
      this.mine.set(mine);
      this.related.set(pool.filter((w) => w.id !== v.id && w.topic === v.topic).slice(0, 8));
    } finally {
      this.loading.set(false);
    }
  }
}
