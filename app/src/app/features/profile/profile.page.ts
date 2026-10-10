import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../core/api';
import { AuthService, PASSWORD_RULE } from '../../core/auth.service';
import { levelFromXp } from '../../core/gamification';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService, UI_LOCALES } from '../../core/i18n.service';
import { LearnContextService, TARGETS, TargetLang } from '../../core/learn-context.service';
import { ThemeMode, UiLocale } from '../../core/models';
import { ReminderService } from '../../core/reminder.service';
import { StorageService, UploadError } from '../../core/storage.service';
import { ThemeService } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { avatarUrl } from '../../layout/shell.component';
import { IconComponent } from '../../shared/icon.component';
import { setSfx, sfxEnabled } from '../../shared/sfx';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page max-w-6xl space-y-6 2xl:max-w-(--page-w)">
      <h1 class="page-title">{{ 'profile.title' | t }}</h1>

      <section class="card grid gap-6 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:p-6">
        <div class="flex flex-col items-center gap-5 sm:flex-row">
          <div class="relative">
            <img [src]="avatar()" alt="" class="h-24 w-24 rounded-full object-cover" referrerpolicy="no-referrer" />
            <label class="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-primary text-on-primary shadow"
              [attr.aria-label]="'profile.changeAvatar' | t">
              <app-icon name="upload" [size]="16" />
              <input type="file" class="sr-only" accept="image/png,image/jpeg,image/webp" [attr.aria-label]="'profile.changeAvatar' | t" (change)="uploadAvatar($event)" />
            </label>
          </div>
          <div class="w-full flex-1 space-y-3">
            <div>
              <label class="label" for="name">{{ 'auth.name' | t }}</label>
              <div class="flex gap-2">
                <input id="name" class="input" maxlength="60" autocomplete="name" [placeholder]="'ph.name' | t" [(ngModel)]="name" />
                <button class="btn-primary" (click)="saveName()" [disabled]="!name().trim() || name() === auth.profile()?.displayName">{{ 'common.save' | t }}</button>
              </div>
            </div>
            <p class="flex items-center gap-2 text-sm text-muted">
              <app-icon name="mail" [size]="16" /> {{ auth.user()?.email }}
              @if (auth.isVerified()) { <span class="chip-success"><app-icon name="checkCircle" [size]="14" /> {{ 'profile.verified' | t }}</span> }
            </p>
          </div>
        </div>
        @if (auth.profile(); as p) {
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
            <div class="rounded-2xl bg-primary-soft p-3"><p class="flex items-center gap-1.5 text-xs font-semibold text-muted"><app-icon name="award" [size]="14" class="text-primary" /> {{ 'dashboard.level' | t }}</p><p class="font-display text-xl font-black">{{ level().level }}</p></div>
            <div class="rounded-2xl bg-warning/10 p-3"><p class="flex items-center gap-1.5 text-xs font-semibold text-muted"><app-icon name="zap" [size]="14" class="text-warning" /> XP</p><p class="font-display text-xl font-black">{{ p.xp | num }}</p></div>
            <div class="rounded-2xl bg-success/10 p-3"><p class="flex items-center gap-1.5 text-xs font-semibold text-muted"><app-icon name="book" [size]="14" class="text-success" /> {{ 'stats.lessons' | t }}</p><p class="font-display text-xl font-black">{{ p.lessonsCompleted | num }}</p></div>
            <div class="rounded-2xl bg-accent/10 p-3"><p class="flex items-center gap-1.5 text-xs font-semibold text-muted"><app-icon name="cards" [size]="14" class="text-accent" /> {{ 'stats.words' | t }}</p><p class="font-display text-xl font-black">{{ p.wordsLearned | num }}</p></div>
          </div>
        }
      </section>

     <div class="gap-6 xl:columns-2 2xl:columns-3 [&>section]:mb-6 [&>section]:break-inside-avoid">
      <section class="card space-y-5 p-5">
        <h2 class="font-display text-lg font-black">{{ 'profile.learning' | t }}</h2>
        <div>
          <p class="label">{{ 'profile.target' | t }}</p>
          <div class="flex gap-2">
            @for (c of targetCodes; track c) {
              <button class="btn" [class]="ctx.target() === c ? 'btn-primary' : 'btn-outline'" (click)="ctx.switchTo(c)">{{ targets[c].flag }} {{ targets[c].label }}</button>
            }
          </div>
        </div>
        <div>
          <p class="label">{{ 'profile.dailyGoal' | t }}</p>
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
            @for (g of goals; track g) {
              <button class="btn" [class]="auth.profile()?.dailyGoal === g ? 'btn-primary' : 'btn-outline'" (click)="setGoal(g)">{{ g }}′</button>
            }
          </div>
        </div>
      </section>

      <section class="card space-y-5 p-5">
        <h2 class="font-display text-lg font-black">{{ 'settings.display' | t }}</h2>
        <div>
          <p class="label">{{ 'settings.uiLanguage' | t }}</p>
          <div class="grid grid-cols-3 gap-2">
            @for (l of locales; track l.code) {
              <button class="btn" [class]="i18n.locale() === l.code ? 'btn-primary' : 'btn-outline'" (click)="setLocale(l.code)">{{ l.flag }} {{ l.label }}</button>
            }
          </div>
        </div>
        <div>
          <p class="label">{{ 'settings.theme' | t }}</p>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
            @for (m of theme.modes; track m) {
              <button class="btn text-sm" [class]="theme.settings().mode === m ? 'btn-primary' : 'btn-outline'" (click)="theme.setMode(m)">
                <app-icon [name]="modeIcon[m]" [size]="16" /> {{ 'settings.mode.' + m | t }}
              </button>
            }
          </div>
        </div>
        <div>
          <p class="label">{{ 'settings.palette' | t }}</p>
          <div class="flex gap-3">
            @for (p of theme.palettes; track p.id) {
              <button class="h-10 w-10 rounded-full border-4 transition" [style.background]="p.color"
                [class]="theme.settings().palette === p.id ? 'scale-110 border-fg' : 'border-transparent'" (click)="theme.setPalette(p.id)" [attr.aria-label]="p.id"></button>
            }
          </div>
        </div>
        <div>
          <p class="label">{{ 'settings.fontSize' | t }}</p>
          <div class="grid grid-cols-4 gap-2">
            @for (f of theme.fontScales; track f) {
              <button class="btn" [class]="theme.settings().fontScale === f ? 'btn-primary' : 'btn-outline'" (click)="theme.setFontScale(f)">{{ Math.round(f * 100) }}%</button>
            }
          </div>
        </div>
        <label class="flex items-center justify-between gap-3">
          <span class="font-semibold">{{ 'profile.sfx' | t }}</span>
          <input type="checkbox" class="switch" role="switch" [checked]="sfx()" (change)="toggleSfx()" />
        </label>
      </section>

      <section class="card space-y-4 p-5">
        <div>
          <h2 class="font-display text-lg font-black">{{ 'reminder.section' | t }}</h2>
          <p class="text-sm text-muted">{{ 'reminder.sectionSub' | t }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="label !mb-0" for="remind-time">{{ 'reminder.time' | t }}</label>
          <input id="remind-time" type="time" class="input !w-36" [ngModel]="reminder.settings().time" (ngModelChange)="reminder.setTime($event)" />
          @if (reminder.supported) {
            <label class="flex items-center gap-2 font-semibold">
              <input type="checkbox" class="switch" role="switch" [checked]="reminder.settings().enabled" (change)="toggleReminder()" /> {{ 'reminder.browser' | t }}
            </label>
          }
        </div>
        @if (reminder.permission() === 'denied' && reminder.supported) { <p class="text-sm text-error">{{ 'reminder.denied' | t }}</p> }
        <div class="flex flex-wrap gap-2">
          <button class="btn-outline text-sm" (click)="reminder.downloadCalendar()"><app-icon name="clock" [size]="16" /> {{ 'reminder.calendar' | t }}</button>
          @if (reminder.settings().enabled) { <button class="btn-ghost text-sm" (click)="reminder.test()">{{ 'reminder.test' | t }}</button> }
        </div>
        <p class="text-xs text-muted">{{ 'reminder.hint' | t }}</p>
      </section>

      @if (auth.hasPasswordProvider()) {
        <section class="card space-y-3 p-5">
          <h2 class="font-display text-lg font-black">{{ 'profile.security' | t }}</h2>
          <div>
            <label class="label" for="pw-current">{{ 'profile.currentPassword' | t }}</label>
            <input id="pw-current" class="input" type="password" autocomplete="current-password" maxlength="128" [placeholder]="'ph.currentPassword' | t" [(ngModel)]="current" />
          </div>
          <div>
            <label class="label" for="pw-next">{{ 'auth.newPassword' | t }}</label>
            <input id="pw-next" class="input" type="password" autocomplete="new-password" maxlength="128" [placeholder]="'ph.newPassword' | t" [(ngModel)]="next" />
            <p class="mt-1 text-xs text-muted">{{ 'auth.passwordHint' | t }}</p>
          </div>
          <button class="btn-primary" (click)="changePassword()" [disabled]="!current() || !next() || busy()">{{ 'profile.changePassword' | t }}</button>
        </section>
      }

      <section class="card flex flex-wrap gap-3 p-5">
        <button class="btn-outline" (click)="exportData()"><app-icon name="file" [size]="18" /> {{ 'profile.export' | t }}</button>
        <button class="btn-danger" (click)="logout()"><app-icon name="logout" [size]="18" /> {{ 'profile.logout' | t }}</button>
      </section>
     </div>
    </div>
  `,
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  protected readonly ctx = inject(LearnContextService);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  protected readonly Math = Math;
  protected readonly locales = UI_LOCALES;
  protected readonly targets = TARGETS;
  protected readonly targetCodes = Object.keys(TARGETS) as TargetLang[];
  protected readonly goals = [5, 10, 15, 20, 30, 60];
  protected readonly modeIcon: Record<ThemeMode, string> = { light: 'sun', dark: 'moon', system: 'monitor', sepia: 'book', contrast: 'eye' };
  protected readonly name = signal(this.auth.profile()?.displayName ?? '');
  protected readonly current = signal('');
  protected readonly next = signal('');
  protected readonly busy = signal(false);
  protected readonly sfx = signal(sfxEnabled());
  protected readonly avatar = computed(() => avatarUrl(this.auth.profile()?.photoURL, this.auth.profile()?.displayName));
  protected readonly level = computed(() => levelFromXp(this.auth.profile()?.xp ?? 0));
  protected readonly reminder = inject(ReminderService);

  protected async toggleReminder(): Promise<void> {
    if (this.reminder.settings().enabled) {
      this.reminder.disable();
      return;
    }
    const ok = await this.reminder.enable(this.reminder.settings().time);
    if (ok) this.toast.success(this.i18n.t('reminder.enabled', { time: this.reminder.settings().time }));
  }

  protected async saveName(): Promise<void> {
    await this.auth.updateProfileData({ displayName: this.name().trim().slice(0, 60) });
    this.toast.success(this.i18n.t('common.saved'));
  }

  protected async setGoal(g: number): Promise<void> {
    await this.auth.updateProfileData({ dailyGoal: g });
  }

  protected async setLocale(code: UiLocale): Promise<void> {
    await this.i18n.use(code);
    await this.auth.updateProfileData({ uiLocale: code });
  }

  protected toggleSfx(): void {
    this.sfx.set(!this.sfx());
    setSfx(this.sfx());
  }

  protected async uploadAvatar(ev: Event): Promise<void> {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const url = await this.storage.upload(file, 'image', `avatars/${this.auth.user()!.uid}`);
      await this.auth.updateProfileData({ photoURL: url });
      this.toast.success(this.i18n.t('common.saved'));
    } catch (e) {
      const code = e instanceof UploadError ? e.code : 'upload';
      this.toast.error(this.i18n.t(`upload.${code}`));
    }
  }

  protected async changePassword(): Promise<void> {
    if (!PASSWORD_RULE.test(this.next())) {
      this.toast.error(this.i18n.t('auth.errors.weak-password'));
      return;
    }
    this.busy.set(true);
    try {
      await this.auth.changePassword(this.current(), this.next());
      this.current.set('');
      this.next.set('');
      this.toast.success(this.i18n.t('profile.passwordChanged'));
    } catch (e) {
      this.toast.error(this.auth.errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }

  /** Lets learners download everything stored about them (data portability). */
  protected async exportData(): Promise<void> {
    const uid = this.auth.user()!.uid;
    let data: unknown;
    try {
      data = await this.api.get('/me/export');
    } catch {
      this.toast.error(this.i18n.t('auth.errors.unknown'));
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mam-${uid}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
