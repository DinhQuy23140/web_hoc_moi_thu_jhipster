import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCollection, AdminService } from '../../core/admin.service';
import { serverMessage } from '../../core/api';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { DialogService } from '../../core/dialog.service';
import { I18nService } from '../../core/i18n.service';
import { Course, CourseOutline, Vocabulary } from '../../core/models';
import { MediaKind, StorageService, UploadError } from '../../core/storage.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { SpinnerComponent } from '../../shared/ui';
import { AdminAnnouncementsComponent } from './admin-announcements.component';
import { AdminAuditComponent } from './admin-audit.component';
import { AdminOverviewComponent } from './admin-overview.component';
import { AdminUsersComponent } from './admin-users.component';

type Tab = 'overview' | 'users' | 'courses' | 'vocab' | 'media' | 'announcements' | 'audit';

const ID_RULE = /^[a-z0-9][a-z0-9-_.]{1,80}$/;

@Component({
  selector: 'app-admin',
  imports: [
    FormsModule,
    IconComponent,
    SpinnerComponent,
    AdminOverviewComponent,
    AdminUsersComponent,
    AdminAnnouncementsComponent,
    AdminAuditComponent,
    ...I18N_PIPES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page space-y-6">
      <h1 class="page-title">{{ 'admin.title' | t }}</h1>
      <div class="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1" role="tablist">
        @for (t of tabs; track t) {
          <button role="tab" class="min-h-10 shrink-0 rounded-lg px-4 text-sm font-bold" [class]="tab() === t ? 'bg-surface shadow-sm' : 'text-muted'" (click)="open(t)">{{ 'admin.tab.' + t | t }}</button>
        }
      </div>

      @switch (tab()) {
        @case ('overview') { <app-admin-overview /> }
        @case ('users') { <app-admin-users /> }
        @case ('announcements') { <app-admin-announcements /> }
        @case ('audit') { <app-admin-audit /> }

        @case ('courses') {
          <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
            <div class="card max-h-[70vh] overflow-y-auto p-2">
              <button class="btn-soft mb-2 w-full" (click)="newCourse()"><app-icon name="plus" [size]="16" /> {{ 'admin.newCourse' | t }}</button>
              @for (c of courses(); track c.id) {
                <div class="flex items-center gap-1 rounded-lg hover:bg-surface-2" [class.bg-primary-soft]="selectedCourse() === c.id">
                  <button class="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm" (click)="selectCourse(c)">
                    <span>{{ c.emoji }}</span><span class="flex-1 truncate">{{ c.title | loc }}</span>
                  </button>
                  <button class="chip-dot !min-h-7 shrink-0 cursor-pointer" [class]="c.published ? 'chip-success' : 'chip'" [disabled]="busy()"
                    (click)="togglePublish(c)" [title]="(c.published ? 'adminx.unpublish' : 'adminx.publish') | t">
                    {{ (c.published ? 'adminx.published' : 'adminx.draft') | t }}
                  </button>
                </div>
              }
            </div>
            <div class="space-y-4">
              @if (outline(); as o) {
                <div class="card p-4">
                  <p class="label">{{ 'admin.lessons' | t }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    @for (u of o.units; track u.id) {
                      @for (l of u.lessons; track l.id) {
                        <button class="chip !min-h-8 hover:text-fg" (click)="edit('lessons', l.id)">{{ l.id }}</button>
                      }
                    }
                  </div>
                  <button class="btn-outline mt-3 !min-h-9 text-sm" (click)="edit('outlines', o.courseId)">{{ 'admin.editOutline' | t }}</button>
                </div>
              }
              @if (editing(); as ed) {
                <div class="card space-y-3 p-4">
                  <div>
                    <label class="label" for="doc-id"><span class="chip-primary mr-2">{{ 'adminx.col.' + ed.col | t }}</span>{{ 'admin.docId' | t }}</label>
                    <input id="doc-id" class="input !min-h-9 max-w-md font-mono text-sm" [(ngModel)]="editId" [disabled]="!ed.isNew" [placeholder]="'ph.docId' | t" />
                  </div>
                  <div>
                    <label class="label" for="doc-json">{{ 'admin.json' | t }}</label>
                    <textarea id="doc-json" class="input min-h-[50vh] font-mono text-xs" spellcheck="false" [(ngModel)]="json" [placeholder]="'ph.json' | t"></textarea>
                  </div>
                  @if (jsonError()) { <p class="text-sm font-semibold text-error">{{ jsonError() }}</p> }
                  <div class="flex flex-wrap gap-2">
                    <button class="btn-primary" (click)="save()" [disabled]="busy()">{{ 'common.save' | t }}</button>
                    @if (!ed.isNew) { <button class="btn-danger" (click)="remove()" [disabled]="busy()"><app-icon name="trash" [size]="16" /> {{ 'admin.delete' | t }}</button> }
                    <button class="btn-ghost" (click)="editing.set(null)">{{ 'common.cancel' | t }}</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @case ('vocab') {
          <div class="flex flex-col gap-3 sm:flex-row">
            <select class="input sm:!w-44" [(ngModel)]="vocabLang" (ngModelChange)="searchVocab(true)" [attr.aria-label]="'adminx.vocabLang' | t">
              <option value="en">{{ 'adminx.langs.en' | t }}</option><option value="ja">{{ 'adminx.langs.ja' | t }}</option>
            </select>
            <input class="input flex-1" type="search" [placeholder]="'vocab.search' | t" [attr.aria-label]="'vocab.search' | t" [(ngModel)]="vocabKw" (keyup.enter)="searchVocab(true)" />
            <button class="btn-primary" (click)="searchVocab(true)" [attr.aria-label]="'adminx.search' | t"><app-icon name="search" [size]="16" /></button>
            <button class="btn-soft" (click)="newVocab()"><app-icon name="plus" [size]="16" /> {{ 'admin.newWord' | t }}</button>
          </div>
          @if (editing()?.col === 'vocabularies') {
            <div class="card space-y-3 p-4">
              <div>
                <label class="label" for="vocab-id">{{ 'admin.docId' | t }}</label>
                <input id="vocab-id" class="input !min-h-9 max-w-md font-mono text-sm" [(ngModel)]="editId" [disabled]="!editing()!.isNew" [placeholder]="'ph.vocabId' | t" />
              </div>
              <div>
                <label class="label" for="vocab-json">{{ 'admin.json' | t }}</label>
                <textarea id="vocab-json" class="input min-h-72 font-mono text-xs" spellcheck="false" [(ngModel)]="json" [placeholder]="'ph.json' | t"></textarea>
              </div>
              @if (jsonError()) { <p class="text-sm font-semibold text-error">{{ jsonError() }}</p> }
              <div class="flex gap-2">
                <button class="btn-primary" (click)="save()">{{ 'common.save' | t }}</button>
                @if (!editing()!.isNew) { <button class="btn-danger" (click)="remove()">{{ 'admin.delete' | t }}</button> }
                <button class="btn-ghost" (click)="editing.set(null)">{{ 'common.cancel' | t }}</button>
              </div>
            </div>
          }
          <div class="card overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="text-left text-muted"><th class="p-3">{{ 'adminx.word' | t }}</th><th>{{ 'adminx.reading' | t }}</th><th>{{ 'adminx.meaningVi' | t }}</th><th>{{ 'adminx.levelCol' | t }}</th><th></th></tr></thead>
              <tbody>
                @for (v of vocab(); track v.id) {
                  <tr class="border-t border-line">
                    <td class="p-3 font-bold">{{ v.word }}</td><td>{{ v.reading || v.ipa }}</td><td>{{ v.meaning.vi }}</td><td>{{ v.level }}</td>
                    <td class="pr-3 text-right"><button class="btn-ghost !min-h-8 !px-2" (click)="edit('vocabularies', v.id)" [attr.aria-label]="'admin.edit' | t"><app-icon name="edit" [size]="16" /></button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (vocabMore()) { <button class="btn-outline" (click)="searchVocab(false)">{{ 'common.loadMore' | t }}</button> }
        }

        @case ('media') {
          @if (!storage.configured) {
            <p class="alert-warning"><app-icon name="alert" [size]="18" /><span><strong>{{ 'adminx.storageOff' | t }}</strong> <span class="font-normal">{{ 'adminx.storageHint' | t }}</span></span></p>
          }
          <div class="card space-y-3 p-5">
            <div class="flex flex-wrap gap-2">
              @for (k of kinds; track k) {
                <button class="btn" [class]="mediaKind() === k ? 'btn-primary' : 'btn-outline'" (click)="mediaKind.set(k); listMedia()">{{ 'adminx.media.' + k | t }}</button>
              }
            </div>
            <label class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-8 text-center text-muted hover:border-primary">
              <app-icon name="upload" [size]="32" />
              <span>{{ 'admin.dropFile' | t }} — {{ 'adminx.media.' + mediaKind() | t }}</span>
              <input type="file" class="sr-only" [accept]="accept[mediaKind()]" [attr.aria-label]="'admin.dropFile' | t" (change)="upload($event)" [disabled]="busy()" />
            </label>
            @if (busy()) { <app-spinner /> }
          </div>
          <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (m of media(); track m.url) {
              <li class="card overflow-hidden">
                @if (mediaKind() === 'image') { <img [src]="m.url" alt="" loading="lazy" class="h-36 w-full object-cover" /> }
                @if (mediaKind() === 'audio') { <audio [src]="m.url" controls preload="none" class="w-full p-2"></audio> }
                @if (mediaKind() === 'video') { <video [src]="m.url" controls preload="metadata" playsinline class="h-36 w-full bg-black"></video> }
                <div class="flex items-center gap-2 p-3 text-xs">
                  <span class="flex-1 truncate font-mono">{{ m.name }}</span>
                  <button class="btn-soft !min-h-8 !px-2" (click)="copy(m.url)">{{ 'admin.copyUrl' | t }}</button>
                </div>
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
})
export class AdminPage {
  private readonly admin = inject(AdminService);
  protected readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly dialog = inject(DialogService);

  protected readonly tabs: Tab[] = ['overview', 'users', 'courses', 'vocab', 'media', 'announcements', 'audit'];
  protected readonly kinds: MediaKind[] = ['image', 'audio', 'video'];
  protected readonly accept: Record<MediaKind, string> = { image: 'image/*', audio: 'audio/*', video: 'video/*' };
  protected readonly tab = signal<Tab>('overview');
  protected readonly courses = signal<Course[]>([]);
  protected readonly selectedCourse = signal<string | null>(null);
  protected readonly outline = signal<CourseOutline | null>(null);
  protected readonly editing = signal<{ col: AdminCollection; isNew: boolean } | null>(null);
  protected readonly editId = signal('');
  protected readonly json = signal('');
  protected readonly jsonError = signal('');
  protected readonly busy = signal(false);
  protected readonly vocab = signal<Vocabulary[]>([]);
  protected readonly vocabMore = signal(false);
  protected readonly vocabLang = signal('en');
  protected readonly vocabKw = signal('');
  protected readonly mediaKind = signal<MediaKind>('image');
  protected readonly media = signal<{ name: string; url: string; size: number }[]>([]);
  private vocabCursor: unknown = null;

  protected async open(t: Tab): Promise<void> {
    this.tab.set(t);
    this.editing.set(null);
    try {
      if (t === 'courses') this.courses.set(await this.admin.allCourses());
      if (t === 'vocab') await this.searchVocab(true);
      if (t === 'media') await this.listMedia();
    } catch (e) {
      this.toast.error(this.message(e));
    }
  }

  protected async togglePublish(c: Course): Promise<void> {
    this.busy.set(true);
    try {
      await this.admin.setPublished(c.id, !c.published);
      this.courses.update((list) => list.map((x) => (x.id === c.id ? { ...x, published: !c.published } : x)));
      this.toast.success(this.i18n.t(c.published ? 'adminx.unpublished' : 'adminx.publishedOk'));
    } catch (e) {
      this.toast.error(this.message(e));
    } finally {
      this.busy.set(false);
    }
  }

  private message(e: unknown): string {
    return serverMessage(e) ?? this.i18n.t('common.error');
  }

  protected async selectCourse(c: Course): Promise<void> {
    this.selectedCourse.set(c.id);
    this.outline.set(await this.admin.outline(c.id));
    await this.edit('courses', c.id);
  }

  protected newCourse(): void {
    const template: Omit<Course, 'id'> = {
      languageId: 'en', certificateId: null, level: 'A1', cefr: 'A1',
      title: { vi: '', en: '', ja: '' }, subtitle: { vi: '', en: '' }, description: { vi: '', en: '' }, outcomes: [],
      emoji: '📘', color: '#4f46e5', tags: [], unitCount: 0, lessonCount: 0, vocabCount: 0, estimatedHours: 1, difficulty: 1, order: 999, published: false,
    };
    this.startEdit('courses', '', template, true);
  }

  protected newVocab(): void {
    const template = {
      languageId: this.vocabLang(), word: '', wordLc: '', reading: '', romaji: '', ipa: '', pos: 'noun',
      meaning: { vi: '', en: '', ja: '' }, example: '', exampleMeaning: { vi: '', en: '' }, level: this.vocabLang() === 'ja' ? 'N5' : 'A1', topic: '', tags: [],
    };
    this.startEdit('vocabularies', '', template, true);
  }

  protected async edit(col: AdminCollection, id: string): Promise<void> {
    const data = await this.admin.getRaw(col, id);
    this.startEdit(col, id, data ?? {}, false);
  }

  private startEdit(col: AdminCollection, id: string, data: unknown, isNew: boolean): void {
    this.editing.set({ col, isNew });
    this.editId.set(id);
    this.json.set(JSON.stringify(data, null, 2));
    this.jsonError.set('');
  }

  protected async save(): Promise<void> {
    const ed = this.editing();
    if (!ed) return;
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(this.json());
      if (typeof data !== 'object' || Array.isArray(data) || data === null) throw new Error('Root must be an object');
    } catch (e) {
      this.jsonError.set(`JSON: ${(e as Error).message}`);
      return;
    }
    const id = this.editId().trim();
    if (!ID_RULE.test(id)) {
      this.jsonError.set(this.i18n.t('admin.badId'));
      return;
    }
    if (ed.col === 'vocabularies' && typeof data['word'] === 'string') data['wordLc'] = (data['word'] as string).toLowerCase();
    delete data['id'];
    this.busy.set(true);
    try {
      await this.admin.save(ed.col, id, data);
      this.toast.success(this.i18n.t('common.saved'));
      this.editing.update((e) => (e ? { ...e, isNew: false } : e));
      if (ed.col === 'courses') this.courses.set(await this.admin.allCourses());
      if (ed.col === 'outlines' && this.selectedCourse()) this.outline.set(await this.admin.outline(this.selectedCourse()!));
      if (ed.col === 'vocabularies') await this.searchVocab(true);
    } catch (e) {
      this.jsonError.set(this.message(e));
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const ed = this.editing();
    if (!ed) return;
    const ok = await this.dialog.confirm({ message: this.i18n.t('admin.confirmDelete', { id: this.editId() }), tone: 'danger', confirmText: this.i18n.t('admin.delete') });
    if (!ok) return;
    try {
      await this.admin.remove(ed.col, this.editId());
    } catch (e) {
      this.toast.error(this.message(e));
      return;
    }
    this.editing.set(null);
    this.toast.success(this.i18n.t('common.saved'));
    if (ed.col === 'courses') this.courses.set(await this.admin.allCourses());
    if (ed.col === 'vocabularies') await this.searchVocab(true);
  }

  protected async searchVocab(reset: boolean): Promise<void> {
    if (reset) this.vocabCursor = null;
    const page = await this.admin.vocabPage(this.vocabLang(), this.vocabKw(), this.vocabCursor ?? undefined);
    this.vocab.update((v) => (reset ? page.items : [...v, ...page.items]));
    this.vocabCursor = page.cursor;
    this.vocabMore.set(page.hasMore);
  }

  protected async listMedia(): Promise<void> {
    try {
      this.media.set(await this.storage.list(`content/${this.mediaKind()}`));
    } catch {
      this.media.set([]);
    }
  }

  protected async upload(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.busy.set(true);
    try {
      const url = await this.storage.upload(file, this.mediaKind(), `content/${this.mediaKind()}`);
      await navigator.clipboard?.writeText(url).catch(() => undefined);
      this.toast.success(this.i18n.t('admin.uploaded'));
      await this.listMedia();
    } catch (e) {
      const code = e instanceof UploadError ? e.code : 'upload';
      this.toast.error(this.i18n.t(`upload.${code}`) + (e instanceof UploadError && e.code === 'size' ? ` (≤ ${e.message} MB)` : ''));
    } finally {
      this.busy.set(false);
      input.value = '';
    }
  }

  protected copy(url: string): void {
    navigator.clipboard?.writeText(url);
    this.toast.success(this.i18n.t('admin.copied'));
  }
}
