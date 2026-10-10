import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminAccount, AdminAccountDetail, AdminService } from '../../core/admin.service';
import { serverMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { DialogService } from '../../core/dialog.service';
import { ToastService } from '../../core/toast.service';
import { avatarUrl } from '../../layout/shell.component';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent, SpinnerComponent } from '../../shared/ui';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, IconComponent, SpinnerComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="flex gap-2" (ngSubmit)="search()">
      <input class="input flex-1" type="search" name="q" [placeholder]="'adminx.searchUsers' | t" [attr.aria-label]="'adminx.searchUsers' | t" [(ngModel)]="query" />
      <button class="btn-primary" type="submit" [attr.aria-label]="'adminx.search' | t"><app-icon name="search" [size]="16" /></button>
    </form>
    <p class="text-sm text-muted">{{ 'adminx.usersTotal' | t: { n: total() } }}</p>

    <div class="grid gap-4" [class]="detail() ? 'xl:grid-cols-[1fr_26rem]' : ''">
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted">
              <th class="p-3">{{ 'auth.name' | t }}</th><th>{{ 'adminx.status' | t }}</th><th>XP</th>
              <th class="hidden md:table-cell">{{ 'adminx.lastActive' | t }}</th><th class="hidden md:table-cell">{{ 'admin.joined' | t }}</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.userId) {
              <tr class="cursor-pointer border-t border-line hover:bg-surface-2" [class.bg-primary-soft]="detail()?.userId === u.userId" (click)="open(u)">
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <img [src]="avatar(u)" alt="" class="h-8 w-8 rounded-full object-cover" referrerpolicy="no-referrer" />
                    <div class="min-w-0"><p class="truncate font-semibold">{{ u.displayName }}</p><p class="truncate text-xs text-muted">{{ u.email }}</p></div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @if (u.admin) { <span class="chip-primary"><app-icon name="shield" [size]="12" /> admin</span> }
                    @if (u.locked) { <span class="chip-danger"><app-icon name="lock" [size]="12" /> {{ 'adminx.locked' | t }}</span> }
                    @else if (!u.activated) { <span class="chip-warning chip-dot">{{ 'adminx.pending' | t }}</span> }
                    @else { <span class="chip-success chip-dot">{{ 'adminx.active' | t }}</span> }
                    @if (u.googleLinked) { <span class="chip" title="Google"><app-icon name="google" [size]="12" /></span> }
                  </div>
                </td>
                <td>{{ u.xp | num }}</td>
                <td class="hidden md:table-cell">{{ u.lastActiveDate || '—' }}</td>
                <td class="hidden md:table-cell">{{ u.registeredAt | dt: false }}</td>
              </tr>
            } @empty {
              @if (!loading()) { <tr><td colspan="5" class="p-6 text-center text-muted">{{ 'adminx.noData' | t }}</td></tr> }
            }
          </tbody>
        </table>
        @if (loading()) { <app-spinner /> }
        @if (hasMore() && !loading()) { <div class="p-3"><button class="btn-outline w-full" (click)="more()">{{ 'common.loadMore' | t }}</button></div> }
      </div>

      @if (detail(); as d) {
        <aside class="card h-fit space-y-4 p-5 xl:sticky xl:top-20" aria-live="polite">
          <div class="flex items-start gap-3">
            <img [src]="avatar(d)" alt="" class="h-14 w-14 rounded-full object-cover" referrerpolicy="no-referrer" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-lg font-bold">{{ d.displayName }}</p>
              <p class="truncate text-sm text-muted">{{ d.email }}</p>
              <p class="text-xs text-muted">ID {{ d.userId }} · {{ 'admin.joined' | t }} {{ d.registeredAt | dt: false }}</p>
            </div>
            <button class="btn-ghost !px-2" (click)="detail.set(null)" [attr.aria-label]="'common.close' | t"><app-icon name="close" [size]="18" /></button>
          </div>

          @if (d.locked) {
            <p class="alert-danger">
              <app-icon name="lock" [size]="18" />
              <span>{{ 'adminx.lockedSince' | t: { date: (d.lockedAt | dt) } }}@if (d.lockReason) { — {{ d.lockReason }} }</span>
            </p>
          }

          <dl class="grid grid-cols-3 gap-2 text-center text-sm">
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">XP</dt><dd class="font-bold">{{ d.xp | num }}</dd></div>
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'stats.streak' | t }}</dt><dd class="flex items-center justify-center gap-1 font-bold">{{ d.streak }} <app-icon name="flame" [size]="14" class="text-accent" /></dd></div>
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'adminx.activeDays30' | t }}</dt><dd class="font-bold">{{ d.activeDays30 }}</dd></div>
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'stats.lessons' | t }}</dt><dd class="font-bold">{{ d.lessonsCompleted }}</dd></div>
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'stats.words' | t }}</dt><dd class="font-bold">{{ d.vocabCount }}</dd></div>
            <div class="rounded-xl bg-surface-2 p-2"><dt class="text-xs text-muted">{{ 'mistakes.title' | t }}</dt><dd class="font-bold">{{ d.mistakeCount }}</dd></div>
          </dl>

          <div>
            <h4 class="mb-2 text-sm font-bold">{{ 'adminx.courseProgress' | t }}</h4>
            <ul class="space-y-2">
              @for (c of d.courses; track c.courseId) {
                <li class="text-sm">
                  <div class="flex justify-between"><span class="truncate font-mono text-xs">{{ c.courseId }}</span><span class="text-xs text-muted">{{ c.updatedAt | ago }}</span></div>
                  <app-progress-bar [value]="c.percent" />
                </li>
              } @empty { <li class="text-sm text-muted">{{ 'adminx.noData' | t }}</li> }
            </ul>
          </div>

          @if (d.sessions.length) {
            <div>
              <h4 class="mb-2 text-sm font-bold">{{ 'resume.dashboardTitle' | t }}</h4>
              <ul class="space-y-1 text-sm">
                @for (s of d.sessions; track s.kind + s.refId) {
                  <li class="flex justify-between gap-2"><span class="flex min-w-0 items-center gap-1.5"><app-icon [name]="s.kind === 'exam' ? 'file' : 'book'" [size]="14" class="text-primary" /><span class="truncate">{{ s.title || s.refId }}</span></span><span class="shrink-0 text-xs text-muted">{{ s.percent }}% · {{ s.updatedAt | ago }}</span></li>
                }
              </ul>
            </div>
          }

          <div>
            <h4 class="mb-2 text-sm font-bold">{{ 'adminx.recentAttempts' | t }}</h4>
            <ul class="max-h-48 space-y-1 overflow-y-auto text-sm">
              @for (a of d.attempts; track a.id) {
                <li class="flex justify-between gap-2"><span class="truncate">{{ 'adminx.kind.' + a.kind | t }} · {{ a.title }}</span><span class="shrink-0 font-semibold">{{ a.score }}%</span></li>
              } @empty { <li class="text-muted">{{ 'adminx.noData' | t }}</li> }
            </ul>
          </div>

          <div class="grid gap-2 border-t border-line pt-4">
            @if (busy()) { <app-spinner /> }
            @if (!d.activated) {
              <button class="btn-soft" (click)="act('activate')" [disabled]="busy()"><app-icon name="check" [size]="16" /> {{ 'adminx.activate' | t }}</button>
              <button class="btn-outline" (click)="act('resend')" [disabled]="busy()"><app-icon name="send" [size]="16" /> {{ 'adminx.resendActivation' | t }}</button>
            } @else {
              <button class="btn-outline" (click)="act('reset')" [disabled]="busy()"><app-icon name="key" [size]="16" /> {{ 'adminx.sendReset' | t }}</button>
            }
            @if (!isSelf(d)) {
              @if (d.locked) {
                <button class="btn-soft" (click)="act('unlock')" [disabled]="busy()"><app-icon name="unlock" [size]="16" /> {{ 'adminx.unlock' | t }}</button>
              } @else {
                <button class="btn-danger-soft" (click)="act('lock')" [disabled]="busy()"><app-icon name="lock" [size]="16" /> {{ 'adminx.lock' | t }}</button>
              }
              <button class="btn-outline" (click)="act(d.admin ? 'demote' : 'promote')" [disabled]="busy()">
                <app-icon name="shield" [size]="16" /> {{ (d.admin ? 'adminx.revokeAdmin' : 'adminx.grantAdmin') | t }}
              </button>
              <button class="btn-danger" (click)="act('delete')" [disabled]="busy()"><app-icon name="trash" [size]="16" /> {{ 'adminx.deleteAccount' | t }}</button>
            } @else {
              <p class="text-xs text-muted">{{ 'adminx.selfHint' | t }}</p>
            }
          </div>
        </aside>
      }
    </div>
  `,
  host: { class: 'block space-y-4' },
})
export class AdminUsersComponent {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  protected readonly query = signal('');
  protected readonly users = signal<AdminAccount[]>([]);
  protected readonly total = signal(0);
  protected readonly hasMore = signal(false);
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly detail = signal<AdminAccountDetail | null>(null);
  private page = 0;
  private readonly myUid = computed(() => this.auth.user()?.uid);

  constructor() {
    this.search();
  }

  protected avatar(u: AdminAccount): string {
    return avatarUrl(u.photoURL, u.displayName);
  }

  protected isSelf(u: AdminAccount): boolean {
    return String(u.userId) === this.myUid();
  }

  protected async search(): Promise<void> {
    this.page = 0;
    await this.fetch(true);
  }

  protected async more(): Promise<void> {
    this.page++;
    await this.fetch(false);
  }

  private async fetch(reset: boolean): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.admin.accounts(this.query(), this.page);
      this.users.update((u) => (reset ? res.items : [...u, ...res.items]));
      this.total.set(res.total);
      this.hasMore.set(res.hasMore);
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading.set(false);
    }
  }

  protected async open(u: AdminAccount): Promise<void> {
    try {
      this.detail.set(await this.admin.account(u.userId));
    } catch (e) {
      this.fail(e);
    }
  }

  protected async act(action: 'activate' | 'resend' | 'reset' | 'lock' | 'unlock' | 'promote' | 'demote' | 'delete'): Promise<void> {
    const d = this.detail();
    if (!d) return;
    const t = (k: string) => this.i18n.t(k, { email: d.email });
    let reason = '';
    if (action === 'lock') {
      const r = await this.dialog.prompt({ message: t('adminx.lockReason'), tone: 'warning', confirmText: t('adminx.lock'), placeholder: t('ph.lockReason'), maxLength: 500 });
      if (r === null) return;
      reason = r;
    }
    if (action === 'promote' && !(await this.dialog.confirm({ message: t('adminx.confirmPromote'), confirmText: t('adminx.grantAdmin') }))) return;
    if (action === 'demote' && !(await this.dialog.confirm({ message: t('adminx.confirmDemote'), tone: 'warning', confirmText: t('adminx.revokeAdmin') }))) return;
    if (action === 'delete') {
      const typed = await this.dialog.prompt({ message: t('adminx.confirmDelete'), tone: 'danger', expect: d.email, confirmText: t('adminx.deleteAccount') });
      if (typed !== d.email) return;
    }

    this.busy.set(true);
    try {
      let updated: AdminAccountDetail | null = d;
      switch (action) {
        case 'activate': updated = await this.admin.activate(d.userId); break;
        case 'resend': await this.admin.resendActivation(d.userId); break;
        case 'reset': await this.admin.sendPasswordReset(d.userId); break;
        case 'lock': updated = await this.admin.setLocked(d.userId, true, reason); break;
        case 'unlock': updated = await this.admin.setLocked(d.userId, false); break;
        case 'promote': updated = await this.admin.setAdmin(d.userId, true); break;
        case 'demote': updated = await this.admin.setAdmin(d.userId, false); break;
        case 'delete': await this.admin.deleteAccount(d.userId); updated = null; break;
      }
      this.toast.success(this.i18n.t(action === 'resend' || action === 'reset' ? 'adminx.emailSent' : 'common.saved'));
      this.detail.set(updated);
      if (updated) this.users.update((list) => list.map((u) => (u.userId === updated!.userId ? { ...u, ...updated } : u)));
      else {
        this.users.update((list) => list.filter((u) => u.userId !== d.userId));
        this.total.update((n) => Math.max(0, n - 1));
      }
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }

  private fail(e: unknown): void {
    this.toast.error(serverMessage(e) ?? this.i18n.t('common.error'));
  }
}
