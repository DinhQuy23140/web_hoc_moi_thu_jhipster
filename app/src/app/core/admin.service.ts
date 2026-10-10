import { Injectable, inject } from '@angular/core';
import { Api, seg } from './api';
import { ContentService, toStorable } from './content.service';
import { Attempt, Course, CourseOutline, CourseProgress, L10n, Lesson, Page, UserProfile, Vocabulary } from './models';
import { SessionSummary } from './session.service';

export type AdminCollection = 'courses' | 'lessons' | 'vocabularies' | 'certificates' | 'languages' | 'exams' | 'outlines';

export interface AdminOverview {
  days: number;
  totals: Record<'users' | 'activatedUsers' | 'admins' | 'courses' | 'publishedCourses' | 'lessons' | 'vocabularies' | 'exams' | 'mistakes', number>;
  activity: Record<'activeToday' | 'active7d' | 'active30d' | 'newUsers7d' | 'lessons7d' | 'minutes7d' | 'inProgressSessions', number>;
  series: { day: string; active: number; xp: number; lessons: number; minutes: number; signups: number }[];
  topCourses: { courseId: string; title: L10n; emoji: string; languageId: string; learners: number; avgPercent: number; completed: number }[];
  attempts: { kind: string; count: number; avgScore: number }[];
}

export interface AdminAccount extends UserProfile {
  userId: number;
  login: string;
  activated: boolean;
  locked: boolean;
  lockReason?: string;
  lockedAt?: number;
  admin: boolean;
  pendingActivation: boolean;
  registeredAt: number;
  googleLinked: boolean;
}

export interface AdminAccountDetail extends AdminAccount {
  courses: CourseProgress[];
  attempts: Attempt[];
  sessions: SessionSummary[];
  vocabCount: number;
  mistakeCount: number;
  activeDays30: number;
}

export interface AdminPage<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total: number;
}

export type AnnouncementLevel = 'info' | 'success' | 'warning';

export interface Announcement {
  id: number;
  message: L10n;
  level: AnnouncementLevel;
  linkUrl: string | null;
  active: boolean;
  /** Epoch ms, 0 = no limit. */
  startsAt: number;
  endsAt: number;
  createdAt: number;
  updatedAt: number;
}

export type AnnouncementInput = Pick<Announcement, 'message' | 'level' | 'linkUrl' | 'active' | 'startsAt' | 'endsAt'>;

export interface AuditEntry {
  id: number;
  actorId?: number;
  actorLogin: string | null;
  method: string;
  path: string;
  status: number;
  ip: string | null;
  createdAt: number;
}

/** Admin API (`/api/admin/**`, ROLE_ADMIN enforced by the backend). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(Api);
  private readonly content = inject(ContentService);

  /* ------------------------------ content ------------------------------ */

  counts(): Promise<Record<string, number>> {
    return this.api.get<Record<string, number>>('/admin/stats/counts');
  }

  allCourses(): Promise<Course[]> {
    return this.api.get<Course[]>('/admin/content/all-courses');
  }

  async outline(courseId: string): Promise<CourseOutline | null> {
    return (await this.getRaw('outlines', courseId)) as CourseOutline | null;
  }

  async lesson(id: string): Promise<Lesson | null> {
    const l = (await this.getRaw('lessons', id)) as Lesson | null;
    return l ? { ...l, id } : null;
  }

  async getRaw(col: AdminCollection, id: string): Promise<Record<string, unknown> | null> {
    try {
      return await this.api.get<Record<string, unknown>>(`/admin/content/${col}/${seg(id)}`);
    } catch (e) {
      if ((e as { status?: number }).status === 404) return null;
      throw e;
    }
  }

  async save(col: AdminCollection, id: string, data: object): Promise<void> {
    await this.api.put(`/admin/content/${col}/${seg(id)}`, toStorable(data));
    this.content.invalidate();
  }

  async remove(col: AdminCollection, id: string): Promise<void> {
    await this.api.delete(`/admin/content/${col}/${seg(id)}`);
    this.content.invalidate();
  }

  /** Publishes / unpublishes a course without opening the editor. */
  async setPublished(courseId: string, published: boolean): Promise<void> {
    const raw = await this.getRaw('courses', courseId);
    if (!raw) throw new Error('not-found');
    await this.save('courses', courseId, { ...raw, published });
  }

  vocabPage(languageId: string, keyword: string, cursor?: unknown): Promise<Page<Vocabulary>> {
    return this.content.vocabPage({ languageId, keyword, cursor, pageSize: 25 });
  }

  /* ------------------------------ analytics ------------------------------ */

  overview(days = 30): Promise<AdminOverview> {
    return this.api.get<AdminOverview>('/admin/stats/overview', { days });
  }

  /* ------------------------------ accounts ------------------------------ */

  accounts(query: string, page = 0, size = 20): Promise<AdminPage<AdminAccount>> {
    return this.api.get<AdminPage<AdminAccount>>('/admin/accounts', { q: query.trim(), page, size });
  }

  account(userId: number): Promise<AdminAccountDetail> {
    return this.api.get<AdminAccountDetail>(`/admin/accounts/${userId}`);
  }

  setLocked(userId: number, locked: boolean, reason = ''): Promise<AdminAccountDetail> {
    return this.api.put<AdminAccountDetail>(`/admin/accounts/${userId}/lock`, { locked, reason });
  }

  activate(userId: number): Promise<AdminAccountDetail> {
    return this.api.post<AdminAccountDetail>(`/admin/accounts/${userId}/activate`);
  }

  setAdmin(userId: number, admin: boolean): Promise<AdminAccountDetail> {
    return this.api.put<AdminAccountDetail>(`/admin/accounts/${userId}/role`, { admin });
  }

  sendPasswordReset(userId: number): Promise<void> {
    return this.api.post(`/admin/accounts/${userId}/password-reset`);
  }

  resendActivation(userId: number): Promise<void> {
    return this.api.post(`/admin/accounts/${userId}/resend-activation`);
  }

  deleteAccount(userId: number): Promise<void> {
    return this.api.delete(`/admin/accounts/${userId}`);
  }

  /* ------------------------------ announcements ------------------------------ */

  announcements(): Promise<Announcement[]> {
    return this.api.get<Announcement[]>('/admin/announcements');
  }

  createAnnouncement(a: AnnouncementInput): Promise<Announcement> {
    return this.api.post<Announcement>('/admin/announcements', a);
  }

  updateAnnouncement(id: number, a: AnnouncementInput): Promise<Announcement> {
    return this.api.put<Announcement>(`/admin/announcements/${id}`, a);
  }

  deleteAnnouncement(id: number): Promise<void> {
    return this.api.delete(`/admin/announcements/${id}`);
  }

  /* ------------------------------ audit log ------------------------------ */

  audit(page = 0, size = 30): Promise<AdminPage<AuditEntry>> {
    return this.api.get<AdminPage<AuditEntry>>('/admin/audit', { page, size });
  }
}
