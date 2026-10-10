import { ChangeDetectionStrategy, Component, Injectable, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { ContentService } from '../core/content.service';
import { I18N_PIPES } from '../core/i18n.pipes';
import { I18nService } from '../core/i18n.service';
import { Vocabulary } from '../core/models';
import { ProgressService } from '../core/progress.service';
import { SpeechService } from '../core/speech.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

interface Token {
  text: string;
  word: boolean;
}

interface LookupState {
  owner: number;
  index: number;
  text: string;
  lang: 'en' | 'ja';
  loading: boolean;
  entry: Vocabulary | null;
}

/** Only one lookup sheet is open at a time across all text blocks on the page. */
@Injectable({ providedIn: 'root' })
export class LookupService {
  readonly current = signal<LookupState | null>(null);
  private seq = 0;
  nextId(): number {
    return ++this.seq;
  }
}

/** English base-form guesses so "studies", "played", "running" find their dictionary entry. */
export function englishCandidates(word: string): string[] {
  const w = word.toLowerCase().replace(/[’']s$/, '').replace(/[^a-z'-]/g, '');
  const out = [w];
  if (w.endsWith('ies')) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) out.push(w.slice(0, -2));
  if (w.endsWith('s')) out.push(w.slice(0, -1));
  if (w.endsWith('ied')) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) out.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith('ing')) out.push(w.slice(0, -3), w.slice(0, -3) + 'e');
  if (/(.)\1(ed|ing)$/.test(w)) out.push(w.replace(/(.)\1(ed|ing)$/, '$1'));
  if (w.endsWith('er')) out.push(w.slice(0, -2));
  if (w.endsWith('est')) out.push(w.slice(0, -3));
  if (w.endsWith('ly')) out.push(w.slice(0, -2));
  return [...new Set(out.filter((x) => x.length > 1))];
}

export function japaneseCandidates(token: string): string[] {
  const stem = token.replace(/[\u3041-\u3096]+$/, '');
  return [...new Set([token, stem].filter(Boolean))];
}

export function tokenize(text: string, lang: 'en' | 'ja'): Token[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment(s: string): Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter;
  if (Seg) {
    return [...new Seg(lang, { granularity: 'word' }).segment(text)].map((s) => ({ text: s.segment, word: !!s.isWordLike }));
  }
  if (lang === 'ja') return [...text].map((c) => ({ text: c, word: /[\u3040-\u30ff\u4e00-\u9fff]/.test(c) }));
  return text.split(/(\s+|[.,!?;:"()])/).filter(Boolean).map((t) => ({ text: t, word: /[a-z]/i.test(t) }));
}

/**
 * Renders text where every word can be tapped to see its meaning (from the course
 * vocabulary), hear it, and save it to the learner's deck.
 */
@Component({
  selector: 'app-lookup-text',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class.jp]="lang() === 'ja'">@for (t of tokens(); track $index; let i = $index) {@if (t.word) {<span role="button" tabindex="0"
      class="cursor-pointer rounded decoration-primary/40 decoration-dotted underline-offset-4 hover:bg-primary-soft hover:underline"
      [class.bg-primary-soft]="isSelected(i)" (click)="open(i, t.text, $event)" (keydown.enter)="open(i, t.text, $event)">{{ t.text }}</span>} @else {{{ t.text }}}}</span>
    @if (mine(); as s) {
      <div class="animate-pop fixed inset-x-0 bottom-0 z-50 p-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96" style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))" role="dialog" [attr.aria-label]="s.text">
        <div class="card p-4 shadow-xl">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <p class="font-display text-2xl font-black" [class.jp]="s.lang === 'ja'">{{ s.entry?.word ?? s.text }}</p>
              @if (s.entry; as e) {
                <p class="text-sm text-muted" [class.jp]="s.lang === 'ja'">{{ e.reading || e.ipa }} @if (e.romaji) { · {{ e.romaji }} } · {{ e.pos }}</p>
              }
            </div>
            <button class="btn-soft !min-h-9 !px-2" (click)="say(s.entry?.word ?? s.text, s.lang)" [attr.aria-label]="'common.listen' | t"><app-icon name="volume" [size]="18" /></button>
            <button class="btn-ghost !min-h-9 !px-2" (click)="close()" [attr.aria-label]="'common.close' | t"><app-icon name="close" [size]="18" /></button>
          </div>
          @if (s.loading) {
            <div class="skeleton mt-3 h-6"></div>
          } @else if (s.entry; as e) {
            <p class="mt-2 text-lg font-semibold">{{ e.meaning | loc }}</p>
            @if (e.example) { <p class="mt-1 text-sm italic text-muted" [class.jp]="s.lang === 'ja'">{{ e.example }}</p> }
            <button class="btn-primary mt-3 w-full !min-h-10 text-sm" (click)="add(e, s.lang)" [disabled]="added()"><app-icon [name]="added() ? 'check' : 'plus'" [size]="16" /> {{ (added() ? 'vocab.saved' : 'vocabDetail.add') | t }}</button>
          } @else {
            <p class="mt-2 text-sm text-muted">{{ 'lookup.notFound' | t }}</p>
            <a class="btn-outline mt-3 w-full !min-h-10 text-sm" target="_blank" rel="noopener" [href]="translateUrl(s.text, s.lang)">{{ 'lookup.translate' | t }}</a>
          }
        </div>
      </div>
    }
  `,
})
export class LookupTextComponent implements OnDestroy {
  private readonly service = inject(LookupService);
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly speech = inject(SpeechService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly text = input.required<string>();
  readonly lang = input<'en' | 'ja'>('en');
  private readonly id = this.service.nextId();
  protected readonly added = signal(false);

  protected readonly tokens = computed(() => tokenize(this.text(), this.lang()));
  protected readonly mine = computed(() => {
    const s = this.service.current();
    return s && s.owner === this.id ? s : null;
  });

  protected isSelected(i: number): boolean {
    const s = this.mine();
    return !!s && s.index === i;
  }

  protected async open(index: number, text: string, e: Event): Promise<void> {
    e.stopPropagation();
    const lang = this.lang();
    this.added.set(false);
    const state: LookupState = { owner: this.id, index, text, lang, loading: true, entry: null };
    this.service.current.set(state);
    const candidates = lang === 'ja' ? japaneseCandidates(text) : englishCandidates(text);
    const entry = await this.content.lookup(lang, candidates).catch(() => null);
    if (this.service.current() !== state) return;
    this.service.current.set({ ...state, loading: false, entry });
  }

  protected close(): void {
    this.service.current.set(null);
  }

  ngOnDestroy(): void {
    if (this.mine()) this.close();
  }

  protected say(text: string, lang: 'en' | 'ja'): void {
    this.speech.speak(text, lang === 'ja' ? 'ja-JP' : 'en-US', 0.9);
  }

  protected translateUrl(text: string, lang: 'en' | 'ja'): string {
    return `https://translate.google.com/?sl=${lang}&tl=${this.i18n.locale()}&text=${encodeURIComponent(text)}`;
  }

  protected async add(v: Vocabulary, lang: 'en' | 'ja'): Promise<void> {
    try {
      await this.progress.addWord(v, lang, 'learning');
      this.added.set(true);
      this.toast.success(this.i18n.t('vocab.saved'));
    } catch {
      this.toast.error(this.i18n.t('common.error'));
    }
  }
}
