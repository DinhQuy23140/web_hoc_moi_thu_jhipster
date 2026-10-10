import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Announcement, AnnouncementLevel } from '../core/admin.service';
import { Api } from '../core/api';
import { I18N_PIPES } from '../core/i18n.pipes';
import { IconComponent } from '../shared/icon.component';

const DISMISSED_KEY = 'lingora.ann.dismissed';

export const LEVEL_CLASS: Record<AnnouncementLevel, string> = {
  info: 'bg-primary/10 text-primary border-primary/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/40',
};

function readDismissed(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]');
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** Site-wide announcements published by admins; each one can be dismissed. */
@Component({
  selector: 'app-announcement-banner',
  imports: [RouterLink, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (a of visible(); track a.id) {
      <div class="flex items-start gap-3 border-b px-4 py-2.5 text-sm font-semibold sm:px-6 lg:px-8" [class]="levelClass[a.level]" role="status">
        <app-icon name="megaphone" [size]="18" />
        <p class="flex-1">
          {{ a.message | loc }}
          @if (a.linkUrl; as link) {
            @if (link.startsWith('/')) {
              <a [routerLink]="link" class="ml-1 underline">{{ 'adminx.learnMore' | t }}</a>
            } @else {
              <a [href]="link" target="_blank" rel="noopener noreferrer" class="ml-1 underline">{{ 'adminx.learnMore' | t }}</a>
            }
          }
        </p>
        <button class="-my-1 rounded-lg p-1 opacity-70 hover:opacity-100" (click)="dismiss(a)" [attr.aria-label]="'common.close' | t">
          <app-icon name="close" [size]="16" />
        </button>
      </div>
    }
  `,
})
export class AnnouncementBannerComponent {
  private readonly api = inject(Api);
  protected readonly levelClass = LEVEL_CLASS;
  private readonly items = signal<Announcement[]>([]);
  private readonly dismissed = signal<string[]>(readDismissed());

  protected readonly visible = computed(() => this.items().filter((a) => !this.dismissed().includes(String(a.id))).slice(0, 2));

  constructor() {
    this.api
      .get<Announcement[]>('/public/announcements')
      .then((list) => this.items.set(list ?? []))
      .catch(() => undefined);
  }

  protected dismiss(a: Announcement): void {
    const ids = [...this.dismissed(), String(a.id)].slice(-50);
    this.dismissed.set(ids);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }
}
