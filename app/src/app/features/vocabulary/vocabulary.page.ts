import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService } from '../../core/learn-context.service';
import { UserVocab, VocabStatus, Vocabulary } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SpeechService } from '../../core/speech.service';
import { mastery } from '../../core/srs';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, SpinnerComponent } from '../../shared/ui';

const LEVELS: Record<string, string[]> = {
  en: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  ja: ['KANA', 'N5', 'N4', 'N3', 'N2', 'N1'],
};

@Component({
  selector: 'app-vocabulary',
  imports: [FormsModule, RouterLink, IconComponent, EmptyComponent, SpinnerComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="page-title">{{ 'vocab.title' | t }}</h1>
          <p class="mt-1 text-muted">{{ 'vocab.sub' | t }}</p>
        </div>
        <a routerLink="/vocabulary/review" class="btn-primary"><app-icon name="cards" /> {{ 'vocab.review' | t }}</a>
      </div>

      <div class="mt-6 inline-flex rounded-xl bg-surface-2 p-1" role="tablist">
        @for (t of tabs; track t) {
          <button role="tab" class="min-h-10 rounded-lg px-4 text-sm font-bold" [attr.aria-selected]="tab() === t"
            [class]="tab() === t ? 'bg-surface shadow-sm' : 'text-muted'" (click)="tab.set(t)">{{ 'vocab.tab.' + t | t }}</button>
        }
      </div>

      @if (tab() === 'library') {
        <div class="mt-4 flex flex-col gap-3 sm:flex-row">
          <label class="relative flex-1">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"><app-icon name="search" [size]="18" /></span>
            <input class="input !pl-10" type="search" [placeholder]="'vocab.search' | t" [ngModel]="keyword()" (ngModelChange)="onKeyword($event)" />
          </label>
          <div class="flex flex-wrap gap-2">
            <button class="chip-toggle !min-h-10" [attr.aria-pressed]="!level()" (click)="setLevel('')">{{ 'common.all' | t }}</button>
            @for (lv of levels(); track lv) {
              <button class="chip-toggle !min-h-10" [attr.aria-pressed]="level() === lv" (click)="setLevel(lv)">{{ lv }}</button>
            }
          </div>
        </div>
        <ul class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          @for (v of items(); track v.id) {
            <li class="card flex items-start gap-3 p-4">
              <button class="mt-1 text-primary" (click)="say(v.word)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" /></button>
              <div class="min-w-0 flex-1">
                <p class="flex flex-wrap items-baseline gap-x-2">
                  <a [routerLink]="['/vocabulary', v.id]" class="font-display text-xl font-black hover:text-primary hover:underline" [class.jp]="ctx.target() === 'ja'">{{ v.word }}</a>
                  <span class="text-sm text-muted" [class.jp]="!!v.reading">{{ v.reading || v.ipa }}</span>
                  @if (v.romaji) { <span class="text-sm text-muted">· {{ v.romaji }}</span> }
                </p>
                <p class="font-semibold">{{ v.meaning | loc }}</p>
                @if (v.example) { <p class="mt-1 text-sm text-muted" [class.jp]="ctx.target() === 'ja'">{{ v.example }}</p> }
                <div class="mt-2 flex gap-1.5"><span class="chip">{{ v.level }}</span><span class="chip">{{ v.pos }}</span></div>
              </div>
              <button class="btn-outline !min-h-9 !px-2.5 text-sm" (click)="add(v)" [disabled]="deckIds().has(v.id)">
                <app-icon [name]="deckIds().has(v.id) ? 'check' : 'plus'" [size]="16" />
              </button>
            </li>
          } @empty {
            @if (!loading()) { <app-empty class="col-span-full" icon="search" [text]="'vocab.empty' | t" /> }
          }
        </ul>
        @if (loading()) { <app-spinner /> }
        @if (hasMore() && !loading()) {
          <div class="mt-4 text-center"><button class="btn-outline" (click)="more()">{{ 'common.loadMore' | t }}</button></div>
        }
      } @else {
        <div class="mt-4 grid grid-cols-3 gap-3">
          @for (s of statusTabs; track s) {
            <button class="card p-3 text-left transition" [class.!border-primary]="status() === s" (click)="status.set(s)">
              <p class="font-display text-2xl font-black">{{ counts()[s] }}</p>
              <p class="text-xs font-semibold text-muted">{{ 'vocab.status.' + s | t }}</p>
            </button>
          }
        </div>
        <ul class="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          @for (w of myFiltered(); track w.vocabId) {
            <li class="flex items-center gap-3 px-4 py-3">
              <button class="text-primary" (click)="say(w.word)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" [size]="18" /></button>
              <div class="min-w-0 flex-1">
                <p class="truncate"><a [routerLink]="['/vocabulary', w.vocabId]" class="font-bold hover:text-primary hover:underline" [class.jp]="ctx.target() === 'ja'">{{ w.word }}</a> <span class="text-sm text-muted">{{ w.reading }}</span></p>
                <p class="truncate text-sm text-muted">{{ w.meaning | loc }}</p>
              </div>
              <span class="hidden gap-0.5 sm:flex" [title]="'vocab.mastery' | t">
                @for (i of [1, 2, 3, 4, 5]; track i) { <span class="h-2 w-2 rounded-full" [class]="mastery(w) >= i ? 'bg-success' : 'bg-surface-2'"></span> }
              </span>
              <select class="input !min-h-9 !w-32 text-sm" [ngModel]="w.status" (ngModelChange)="setStatus(w, $event)" [attr.aria-label]="'vocab.mastery' | t">
                @for (s of statusTabs; track s) { <option [value]="s">{{ 'vocab.status.' + s | t }}</option> }
              </select>
            </li>
          } @empty {
            <li><app-empty icon="cards" [text]="'vocab.deckEmpty' | t" /></li>
          }
        </ul>
      }
    </div>
  `,
})
export class VocabularyPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly speech = inject(SpeechService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  protected readonly ctx = inject(LearnContextService);

  protected readonly tabs = ['library', 'mine'] as const;
  protected readonly statusTabs: VocabStatus[] = ['learning', 'difficult', 'known'];
  protected readonly tab = signal<'library' | 'mine'>('library');
  protected readonly keyword = signal('');
  protected readonly level = signal('');
  protected readonly items = signal<Vocabulary[]>([]);
  protected readonly loading = signal(false);
  protected readonly hasMore = signal(false);
  protected readonly mine = signal<UserVocab[]>([]);
  protected readonly status = signal<VocabStatus>('learning');
  private cursor: unknown = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly levels = computed(() => LEVELS[this.ctx.target()] ?? []);
  protected readonly deckIds = computed(() => new Set(this.mine().map((w) => w.vocabId)));
  protected readonly myFiltered = computed(() => this.mine().filter((w) => w.status === this.status()));
  protected readonly counts = computed(() => {
    const c: Record<VocabStatus, number> = { learning: 0, difficult: 0, known: 0 };
    for (const w of this.mine()) c[w.status]++;
    return c;
  });
  protected readonly mastery = mastery;

  constructor() {
    effect(() => {
      this.ctx.target();
      untracked(() => {
        this.level.set('');
        this.search(true);
        this.loadMine();
      });
    });
  }

  protected say(t: string): void {
    this.speech.speak(t, this.ctx.info().speech);
  }

  protected onKeyword(v: string): void {
    this.keyword.set(v);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search(true), 300);
  }

  protected setLevel(lv: string): void {
    this.level.set(lv);
    this.search(true);
  }

  protected more(): void {
    this.search(false);
  }

  protected async add(v: Vocabulary): Promise<void> {
    await this.progress.addWord(v, v.languageId, 'learning');
    this.toast.success(this.i18n.t('vocab.saved'));
    this.loadMine();
  }

  protected async setStatus(w: UserVocab, s: VocabStatus): Promise<void> {
    await this.progress.setWordStatus(w.vocabId, s);
    this.mine.update((list) => list.map((x) => (x.vocabId === w.vocabId ? { ...x, status: s } : x)));
  }

  private async search(reset: boolean): Promise<void> {
    if (reset) {
      this.cursor = null;
      this.items.set([]);
    }
    this.loading.set(true);
    try {
      const page = await this.content.vocabPage({
        languageId: this.ctx.target(),
        level: this.level() || undefined,
        keyword: this.keyword(),
        cursor: this.cursor ?? undefined,
      });
      this.items.update((list) => (reset ? page.items : [...list, ...page.items]));
      this.cursor = page.cursor;
      this.hasMore.set(page.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadMine(): Promise<void> {
    this.mine.set(await this.progress.myWords(this.ctx.target()).catch(() => []));
  }
}
