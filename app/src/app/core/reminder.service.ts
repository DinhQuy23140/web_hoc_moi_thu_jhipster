import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { ProgressService } from './progress.service';
import { dateKey } from './utils';

export interface ReminderSettings {
  enabled: boolean;
  /** Local time, HH:MM. */
  time: string;
}

const KEY = 'lingora.reminder';
const SENT_KEY = 'lingora.reminder.sent';

/**
 * Study reminders without a push server: while the app (or an installed PWA window) is
 * open, a browser notification is shown at the chosen time if today's goal isn't met yet.
 * For reminders when the app is closed, learners can add a daily event with an alarm
 * to their calendar (.ics), which every phone and desktop calendar supports.
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressService);
  private readonly i18n = inject(I18nService);

  readonly supported = typeof window !== 'undefined' && 'Notification' in window;
  readonly settings = signal<ReminderSettings>(readSettings());
  readonly permission = signal<NotificationPermission>(this.supported ? Notification.permission : 'denied');
  private timer: ReturnType<typeof setInterval> | undefined;

  start(): void {
    if (this.timer || !this.supported) return;
    this.timer = setInterval(() => this.tick(), 60_000);
    setTimeout(() => this.tick(), 5_000);
  }

  async enable(time: string): Promise<boolean> {
    if (!this.supported) return false;
    const perm = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    this.permission.set(perm);
    this.save({ enabled: perm === 'granted', time });
    return perm === 'granted';
  }

  disable(): void {
    this.save({ ...this.settings(), enabled: false });
  }

  setTime(time: string): void {
    this.save({ ...this.settings(), time });
  }

  async test(): Promise<void> {
    await this.notify(this.i18n.t('reminder.title'), this.i18n.t('reminder.body', { min: this.auth.profile()?.dailyGoal ?? 15 }));
  }

  /** Downloads a daily recurring calendar event with an alarm at the reminder time. */
  downloadCalendar(): void {
    const [h, m] = this.settings().time.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const end = new Date(start.getTime() + 15 * 60_000);
    const url = location.origin + '/dashboard';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mam//Study reminder//EN',
      'BEGIN:VEVENT',
      `UID:lingora-reminder-${Date.now()}@lingora`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${local(start)}`,
      `DTEND:${local(end)}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeIcs(this.i18n.t('reminder.title'))}`,
      `DESCRIPTION:${escapeIcs(this.i18n.t('reminder.body', { min: this.auth.profile()?.dailyGoal ?? 15 }) + ' ' + url)}`,
      `URL:${url}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcs(this.i18n.t('reminder.title'))}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'mam-reminder.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  private async tick(): Promise<void> {
    const s = this.settings();
    if (!s.enabled || Notification.permission !== 'granted' || !this.auth.profile()) return;
    const now = new Date();
    const [h, m] = s.time.split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    const today = dateKey();
    if (localStorage.getItem(SENT_KEY) === today) return;
    const goal = this.auth.profile()?.dailyGoal ?? 15;
    const done = (await this.progress.today().catch(() => null))?.m ?? 0;
    localStorage.setItem(SENT_KEY, today);
    if (done >= goal) return;
    await this.notify(this.i18n.t('reminder.title'), this.i18n.t('reminder.body', { min: Math.max(1, Math.ceil(goal - done)) }));
  }

  private async notify(title: string, body: string): Promise<void> {
    if (!this.supported || Notification.permission !== 'granted') return;
    const options: NotificationOptions & { data?: unknown } = {
      body,
      icon: 'icons/icon-192x192.png',
      tag: 'lingora-reminder',
      data: { onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url: '/dashboard' } } },
    };
    const reg = await navigator.serviceWorker?.getRegistration().catch(() => undefined);
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  }

  private save(s: ReminderSettings): void {
    this.settings.set(s);
    localStorage.setItem(KEY, JSON.stringify(s));
  }
}

function readSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { enabled: false, time: '20:00', ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    // ignore
  }
  return { enabled: false, time: '20:00' };
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
