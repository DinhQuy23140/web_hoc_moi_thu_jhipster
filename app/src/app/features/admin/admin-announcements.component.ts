import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, Announcement, AnnouncementInput, AnnouncementLevel } from '../../core/admin.service';
import { serverMessage } from '../../core/api';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { DialogService } from '../../core/dialog.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { LEVEL_CLASS } from '../../layout/announcement-banner.component';
import { IconComponent } from '../../shared/icon.component';
import { SpinnerComponent } from '../../shared/ui';

interface Draft {
  id: number | null;
  vi: string;
  en: string;
  ja: string;
  level: AnnouncementLevel;
  linkUrl: string;
  active: boolean;
  /** `datetime-local` values (local time), empty = no limit. */
  startsAt: string;
  endsAt: string;
}

const EMPTY: Draft = { id: null, vi: '', en: '', ja: '', level: 'info', linkUrl: '', active: true, startsAt: '', endsAt: '' };

@Component({
  selector: 'app-admin-announcements',
  imports: [FormsModule, IconComponent, SpinnerComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-sm text-muted">{{ 'adminx.annSub' | t }}</p>
    <div class="grid gap-4 lg:grid-cols-[1fr_24rem]">
      <div class="space-y-3">
        @for (a of items(); track a.id) {
          <article class="card space-y-2 border p-4" [class]="levelClass[a.level]">
            <div class="flex flex-wrap items-center gap-2">
              <span class="chip">{{ 'adminx.level.' + a.level | t }}</span>
              @if (!a.active) { <span class="chip chip-dot">{{ 'adminx.inactive' | t }}</span> }
              @else if (status(a) === 'scheduled') { <span class="chip-info chip-dot">{{ 'adminx.scheduled' | t }}</span> }
              @else if (status(a) !== 'live') { <span class="chip chip-dot">{{ 'adminx.' + status(a) | t }}</span> }
              @else { <span class="chip-success chip-live">{{ 'adminx.live' | t }}</span> }
              <span class="flex-1"></span>
              <button class="btn-ghost !min-h-8 !px-2" (click)="edit(a)" [attr.aria-label]="'admin.edit' | t"><app-icon name="edit" [size]="16" /></button>
              <button class="btn-ghost !min-h-8 !px-2 text-error" (click)="remove(a)" [attr.aria-label]="'admin.delete' | t"><app-icon name="trash" [size]="16" /></button>
            </div>
            <p class="font-semibold text-fg">{{ a.message | loc }}</p>
            <p class="text-xs text-muted">
              {{ a.startsAt ? (a.startsAt | dt) : '…' }} → {{ a.endsAt ? (a.endsAt | dt) : '∞' }}
              @if (a.linkUrl) { · <span class="font-mono">{{ a.linkUrl }}</span> }
            </p>
          </article>
        } @empty {
          @if (loading()) { <app-spinner /> } @else { <p class="card p-6 text-center text-muted">{{ 'adminx.noAnn' | t }}</p> }
        }
      </div>

      <form class="card h-fit space-y-3 p-5" (ngSubmit)="save()">
        <h3 class="font-display text-lg font-black">{{ (draft().id ? 'adminx.editAnn' : 'adminx.newAnn') | t }}</h3>
        @for (loc of locales; track loc) {
          <div>
            <label class="label" [for]="'msg-' + loc">{{ 'adminx.message' | t }} — {{ 'adminx.langs.' + loc | t }}</label>
            <textarea class="input min-h-16" [id]="'msg-' + loc" [name]="'msg-' + loc" maxlength="500" [ngModel]="draft()[loc]" (ngModelChange)="patch(loc, $event)"
              [placeholder]="'ph.annMessage' | t: { lang: ('adminx.langs.' + loc | t) }"></textarea>
          </div>
        }
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="ann-level">{{ 'adminx.levelLabel' | t }}</label>
            <select id="ann-level" name="level" class="input" [ngModel]="draft().level" (ngModelChange)="patch('level', $event)">
              @for (l of levels; track l) { <option [value]="l">{{ 'adminx.level.' + l | t }}</option> }
            </select>
          </div>
          <label class="mt-6 flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="active" class="switch" role="switch" [ngModel]="draft().active" (ngModelChange)="patch('active', $event)" /> {{ 'adminx.activeLabel' | t }}
          </label>
        </div>
        <div>
          <label class="label" for="ann-link">{{ 'adminx.link' | t }}</label>
          <input id="ann-link" name="link" class="input" [placeholder]="'ph.annLink' | t" maxlength="500" [ngModel]="draft().linkUrl" (ngModelChange)="patch('linkUrl', $event)" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="ann-start">{{ 'adminx.startsAt' | t }}</label>
            <input id="ann-start" name="start" type="datetime-local" class="input" [ngModel]="draft().startsAt" (ngModelChange)="patch('startsAt', $event)" />
          </div>
          <div>
            <label class="label" for="ann-end">{{ 'adminx.endsAt' | t }}</label>
            <input id="ann-end" name="end" type="datetime-local" class="input" [ngModel]="draft().endsAt" (ngModelChange)="patch('endsAt', $event)" />
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary flex-1" type="submit" [disabled]="busy()">{{ 'common.save' | t }}</button>
          @if (draft().id) { <button class="btn-ghost" type="button" (click)="draft.set(empty)">{{ 'common.cancel' | t }}</button> }
        </div>
      </form>
    </div>
  `,
  host: { class: 'block space-y-4' },
})
export class AdminAnnouncementsComponent {
  private readonly admin = inject(AdminService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  protected readonly locales = ['vi', 'en', 'ja'] as const;
  protected readonly levels: AnnouncementLevel[] = ['info', 'success', 'warning'];
  protected readonly levelClass = LEVEL_CLASS;
  protected readonly empty = EMPTY;
  protected readonly items = signal<Announcement[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly draft = signal<Draft>(EMPTY);

  constructor() {
    this.load();
  }

  protected status(a: Announcement): 'live' | 'scheduled' | 'expired' {
    const now = Date.now();
    if (a.startsAt && a.startsAt > now) return 'scheduled';
    if (a.endsAt && a.endsAt <= now) return 'expired';
    return 'live';
  }

  protected patch<K extends keyof Draft>(key: K, value: Draft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected edit(a: Announcement): void {
    this.draft.set({
      id: a.id,
      vi: a.message.vi ?? '',
      en: a.message.en ?? '',
      ja: a.message.ja ?? '',
      level: a.level,
      linkUrl: a.linkUrl ?? '',
      active: a.active,
      startsAt: toLocalInput(a.startsAt),
      endsAt: toLocalInput(a.endsAt),
    });
  }

  protected async save(): Promise<void> {
    const d = this.draft();
    if (!d.vi.trim() && !d.en.trim() && !d.ja.trim()) {
      this.toast.error(this.i18n.t('adminx.annEmpty'));
      return;
    }
    const body: AnnouncementInput = {
      message: { vi: d.vi.trim(), en: d.en.trim(), ja: d.ja.trim() },
      level: d.level,
      linkUrl: d.linkUrl.trim(),
      active: d.active,
      startsAt: d.startsAt ? new Date(d.startsAt).getTime() : 0,
      endsAt: d.endsAt ? new Date(d.endsAt).getTime() : 0,
    };
    this.busy.set(true);
    try {
      if (d.id) await this.admin.updateAnnouncement(d.id, body);
      else await this.admin.createAnnouncement(body);
      this.toast.success(this.i18n.t('common.saved'));
      this.draft.set(EMPTY);
      await this.load();
    } catch (e) {
      this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(a: Announcement): Promise<void> {
    if (!(await this.dialog.confirm({ message: this.i18n.t('adminx.confirmDeleteAnn'), tone: 'danger', confirmText: this.i18n.t('admin.delete') }))) return;
    try {
      await this.admin.deleteAnnouncement(a.id);
      this.items.update((list) => list.filter((x) => x.id !== a.id));
      if (this.draft().id === a.id) this.draft.set(EMPTY);
    } catch (e) {
      this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.items.set(await this.admin.announcements());
    } catch (e) {
      this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}

function toLocalInput(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
