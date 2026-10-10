import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { Certificate, ContentType, Course, CourseOutline, CourseProgress } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { SessionService, SessionSummary } from '../../core/session.service';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, ProgressBarComponent, SpinnerComponent } from '../../shared/ui';

export const KIND_ICON: Record<ContentType, string> = {
  VOCABULARY: 'cards',
  GRAMMAR: 'pen',
  READING: 'file',
  LISTENING: 'headphones',
  SPEAKING: 'mic',
  VIDEO: 'video',
  EXERCISE: 'target',
};

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, IconComponent, ProgressBarComponent, SpinnerComponent, EmptyComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (course(); as c) {
      <div class="page space-y-6">
        <a routerLink="/courses" class="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg">
          <app-icon name="chevronLeft" [size]="16" /> {{ 'courses.title' | t }}
        </a>
        <section class="card overflow-hidden">
          <div class="flex flex-col gap-5 p-6 sm:flex-row sm:items-center" [style.background]="'linear-gradient(135deg,' + c.color + '2a, transparent)'">
            <div class="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-surface text-5xl shadow-sm">{{ c.emoji }}</div>
            <div class="flex-1">
              <div class="flex flex-wrap gap-2">
                <span class="chip-primary">{{ c.level }}</span>
                @if (c.cefr) { <span class="chip">CEFR {{ c.cefr }}</span> }
                @if (cert(); as ct) { <a [routerLink]="['/certificates', ct.id]" class="chip hover:text-fg"><app-icon name="award" [size]="12" /> {{ ct.name }}</a> }
              </div>
              <h1 class="page-title mt-2">{{ c.title | loc }}</h1>
              <p class="mt-1 text-muted">{{ c.description | loc }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
            @for (s of facts(); track s.label) {
              <div class="bg-surface p-4 text-center">
                <p class="font-display text-xl font-black">{{ s.value }}</p>
                <p class="text-xs font-semibold text-muted">{{ s.label | t }}</p>
              </div>
            }
          </div>
          <div class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div class="flex flex-1 items-center gap-3">
              <app-progress-bar class="flex-1" [value]="progress()?.percent ?? 0" />
              <span class="text-sm font-bold">{{ progress()?.percent ?? 0 }}%</span>
            </div>
            @if (nextLessonId(); as id) {
              <a [routerLink]="['/lessons', id]" class="btn-primary !px-6">
                <app-icon name="play" [size]="18" /> {{ (progress() ? 'common.continue' : 'courses.start') | t }}
              </a>
            }
          </div>
        </section>

       <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_25rem]">
        @if (c.outcomes.length) {
          <section class="card p-5 xl:sticky xl:top-20 xl:col-start-2 xl:row-start-1">
            <h2 class="mb-3 font-display text-lg font-black">{{ 'courses.outcomes' | t }}</h2>
            <ul class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 xl:gap-3">
              @for (o of c.outcomes; track $index) {
                <li class="flex gap-2"><span class="mt-0.5 text-success"><app-icon name="checkCircle" [size]="18" /></span>{{ o | loc }}</li>
              }
            </ul>
          </section>
        }

        <section class="min-w-0 space-y-3 xl:col-start-1 xl:row-start-1">
          <h2 class="font-display text-lg font-black">{{ 'courses.curriculum' | t }}</h2>
          @for (u of outline()?.units ?? []; track u.id; let ui = $index) {
            <div class="card overflow-hidden">
              <button class="flex w-full items-center gap-4 p-4 text-left" (click)="toggle(u.id)" [attr.aria-expanded]="isOpen(u.id)">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft font-display font-black text-primary">{{ ui + 1 }}</span>
                <div class="min-w-0 flex-1">
                  <p class="font-bold">{{ u.title | loc }}</p>
                  <p class="truncate text-sm text-muted">{{ u.description | loc }}</p>
                </div>
                <span class="text-sm font-semibold text-muted">{{ doneIn(u.id) }}/{{ u.lessons.length }}</span>
                <span class="transition" [class.rotate-180]="isOpen(u.id)"><app-icon name="chevronDown" /></span>
              </button>
              @if (isOpen(u.id)) {
                <ul class="border-t border-line">
                  @for (l of u.lessons; track l.id; let li = $index) {
                    <li>
                      <a [routerLink]="['/lessons', l.id]" class="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2">
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold"
                          [class]="done().has(l.id) ? 'bg-success text-white' : 'bg-surface-2 text-muted'">
                          @if (done().has(l.id)) { <app-icon name="check" [size]="16" /> } @else { {{ li + 1 }} }
                        </span>
                        <div class="min-w-0 flex-1">
                          <p class="truncate font-semibold">{{ l.title | loc }}</p>
                          <div class="mt-0.5 flex gap-1.5 text-muted">
                            @for (k of l.kinds; track k) { <span [title]="'content.' + k | t"><app-icon [name]="kindIcon[k]" [size]="14" /></span> }
                          </div>
                        </div>
                        @if (inProgress().get(l.id); as s) {
                          <span class="chip-primary" [title]="'resume.inProgress' | t"><app-icon name="pause" [size]="12" /> {{ s.percent }}%</span>
                        } @else if (progress()?.scores?.[l.id] !== undefined) {
                          <span class="chip">{{ progress()!.scores[l.id] }}%</span>
                        }
                        <span class="hidden text-xs font-semibold text-muted sm:inline">{{ l.minutes }} {{ 'common.min' | t }} · +{{ l.xp }} XP</span>
                      </a>
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </section>
       </div>
      </div>
    } @else {
      <app-empty icon="book" [text]="'courses.notFound' | t" />
    }
  `,
})
export class CourseDetailPage implements OnInit {
  private readonly content = inject(ContentService);
  private readonly progressSvc = inject(ProgressService);
  private readonly sessions = inject(SessionService);
  readonly id = input.required<string>();

  protected readonly kindIcon = KIND_ICON;
  protected readonly loading = signal(true);
  protected readonly course = signal<Course | undefined>(undefined);
  protected readonly cert = signal<Certificate | undefined>(undefined);
  protected readonly outline = signal<CourseOutline | undefined>(undefined);
  protected readonly progress = signal<CourseProgress | null>(null);
  private readonly open = signal<Set<string>>(new Set());

  protected readonly done = computed(() => new Set(this.progress()?.completed ?? []));
  /** Lessons of this course left unfinished (resumable), by lesson id. */
  protected readonly inProgress = signal<Map<string, SessionSummary>>(new Map());
  protected readonly nextLessonId = computed(() => {
    const all = this.outline()?.units.flatMap((u) => u.lessons) ?? [];
    const unfinished = all.find((l) => this.inProgress().has(l.id));
    return (unfinished ?? all.find((l) => !this.done().has(l.id)) ?? all[0])?.id;
  });
  protected readonly facts = computed(() => {
    const c = this.course();
    if (!c) return [];
    return [
      { label: 'courses.units', value: c.unitCount },
      { label: 'courses.lessons', value: c.lessonCount },
      { label: 'courses.words', value: c.vocabCount },
      { label: 'courses.hours', value: c.estimatedHours + 'h' },
    ];
  });

  async ngOnInit(): Promise<void> {
    try {
      const [course, outline, progress, sessions] = await Promise.all([
        this.content.course(this.id()),
        this.content.outline(this.id()),
        this.progressSvc.courseProgress(this.id()).catch(() => null),
        this.sessions.list('lesson', 30).catch(() => [] as SessionSummary[]),
      ]);
      this.course.set(course);
      this.outline.set(outline);
      this.progress.set(progress);
      this.inProgress.set(new Map(sessions.filter((s) => s.courseId === this.id()).map((s) => [s.refId, s])));
      if (course?.certificateId) this.cert.set(await this.content.certificate(course.certificateId));
      const firstOpen = outline?.units.find((u) => u.lessons.some((l) => !this.done().has(l.id))) ?? outline?.units[0];
      if (firstOpen) this.open.set(new Set([firstOpen.id]));
    } finally {
      this.loading.set(false);
    }
  }

  protected toggle(id: string): void {
    this.open.update((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  protected isOpen(id: string): boolean {
    return this.open().has(id);
  }

  protected doneIn(unitId: string): number {
    const u = this.outline()?.units.find((x) => x.id === unitId);
    return u ? u.lessons.filter((l) => this.done().has(l.id)).length : 0;
  }
}
