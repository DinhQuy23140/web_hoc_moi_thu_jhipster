import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminService, AuditEntry } from '../../core/admin.service';
import { serverMessage } from '../../core/api';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { SpinnerComponent } from '../../shared/ui';

const METHOD_CLASS: Record<string, string> = {
  POST: 'bg-success/15 text-success',
  PUT: 'bg-primary/15 text-primary',
  PATCH: 'bg-primary/15 text-primary',
  DELETE: 'bg-error/15 text-error',
};

@Component({
  selector: 'app-admin-audit',
  imports: [SpinnerComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-sm text-muted">{{ 'adminx.auditSub' | t }}</p>
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-muted">
            <th class="p-3">{{ 'adminx.time' | t }}</th><th>{{ 'adminx.actor' | t }}</th><th>{{ 'adminx.action' | t }}</th><th>{{ 'adminx.result' | t }}</th><th class="hidden md:table-cell">IP</th>
          </tr>
        </thead>
        <tbody>
          @for (a of items(); track a.id) {
            <tr class="border-t border-line align-top">
              <td class="whitespace-nowrap p-3">{{ a.createdAt | dt }}</td>
              <td class="pr-2">{{ a.actorLogin || '—' }}</td>
              <td class="pr-2"><span class="chip mr-1 font-mono" [class]="methodClass[a.method] ?? ''">{{ a.method }}</span><span class="break-all font-mono text-xs">{{ a.path }}</span></td>
              <td><span class="font-semibold" [class]="a.status >= 400 ? 'text-error' : 'text-success'">{{ a.status }}</span></td>
              <td class="hidden font-mono text-xs md:table-cell">{{ a.ip }}</td>
            </tr>
          } @empty {
            @if (!loading()) { <tr><td colspan="5" class="p-6 text-center text-muted">{{ 'adminx.noData' | t }}</td></tr> }
          }
        </tbody>
      </table>
      @if (loading()) { <app-spinner /> }
      @if (hasMore() && !loading()) { <div class="p-3"><button class="btn-outline w-full" (click)="load(false)">{{ 'common.loadMore' | t }}</button></div> }
    </div>
  `,
  host: { class: 'block space-y-4' },
})
export class AdminAuditComponent {
  private readonly admin = inject(AdminService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly methodClass = METHOD_CLASS;
  protected readonly items = signal<AuditEntry[]>([]);
  protected readonly loading = signal(false);
  protected readonly hasMore = signal(false);
  private page = 0;

  constructor() {
    this.load(true);
  }

  protected async load(reset: boolean): Promise<void> {
    this.page = reset ? 0 : this.page + 1;
    this.loading.set(true);
    try {
      const res = await this.admin.audit(this.page);
      this.items.update((list) => (reset ? res.items : [...list, ...res.items]));
      this.hasMore.set(res.hasMore);
    } catch (e) {
      this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
