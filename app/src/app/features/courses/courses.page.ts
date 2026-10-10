import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { I18nService } from '../../core/i18n.service';
import { LearnContextService } from '../../core/learn-context.service';
import { Certificate, Course } from '../../core/models';
import { ProgressService } from '../../core/progress.service';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent } from '../../shared/ui';
import { CourseCardComponent } from './course-card.component';

@Component({
  selector: 'app-courses',
  imports: [FormsModule, IconComponent, EmptyComponent, CourseCardComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ 'courses.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'courses.sub' | t }}</p>

      <div class="mt-6 flex flex-col gap-3 md:flex-row">
        <label class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"><app-icon name="search" [size]="18" /></span>
          <input class="input !pl-10" type="search" [placeholder]="'courses.search' | t" [ngModel]="keyword()"
            (ngModelChange)="onKeyword($event)" [attr.aria-label]="'courses.search' | t" />
        </label>
        <select class="input md:!w-56" [ngModel]="cert()" (ngModelChange)="cert.set($event)" [attr.aria-label]="'courses.certificate' | t">
          <option value="">{{ 'courses.allCerts' | t }}</option>
          @for (c of certsForLang(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
        </select>
        <select class="input md:!w-40" [ngModel]="level()" (ngModelChange)="level.set($event)" [attr.aria-label]="'courses.level' | t">
          <option value="">{{ 'courses.allLevels' | t }}</option>
          @for (l of levels(); track l) { <option [value]="l">{{ l }}</option> }
        </select>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        @for (c of certsForLang(); track c.id) {
          <button class="chip-toggle" [attr.aria-pressed]="cert() === c.id" (click)="cert.set(cert() === c.id ? '' : c.id)">
            {{ c.name }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) { <div class="skeleton h-64"></div> }
        </div>
      } @else {
        <div class="stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          @for (c of filtered(); track c.id) {
            <app-course-card [course]="c" [percent]="progress()[c.id] ?? null" />
          } @empty {
            <app-empty class="col-span-full" icon="search" [text]="'courses.empty' | t" />
          }
        </div>
      }
    </div>
  `,
})
export class CoursesPage {
  private readonly content = inject(ContentService);
  private readonly progressSvc = inject(ProgressService);
  private readonly i18n = inject(I18nService);
  protected readonly ctx = inject(LearnContextService);

  protected readonly loading = signal(true);
  protected readonly courses = signal<Course[]>([]);
  protected readonly certs = signal<Certificate[]>([]);
  protected readonly progress = signal<Record<string, number>>({});
  protected readonly keyword = signal('');
  private readonly debounced = signal('');
  protected readonly cert = signal('');
  protected readonly level = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly certsForLang = computed(() => this.certs().filter((c) => c.languageId === this.ctx.target()));
  protected readonly levels = computed(() => [
    ...new Set(this.courses().filter((c) => c.languageId === this.ctx.target()).map((c) => c.level)),
  ]);
  protected readonly filtered = computed(() => {
    const kw = this.debounced().trim().toLowerCase();
    return this.courses().filter(
      (c) =>
        c.languageId === this.ctx.target() &&
        (!this.cert() || c.certificateId === this.cert()) &&
        (!this.level() || c.level === this.level()) &&
        (!kw ||
          [c.title.vi, c.title.en, c.title.ja ?? '', c.level, ...c.tags].some((s) => s.toLowerCase().includes(kw))),
    );
  });

  constructor() {
    this.load();
  }

  protected onKeyword(v: string): void {
    this.keyword.set(v);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.debounced.set(v), 200);
  }

  private async load(): Promise<void> {
    try {
      const [courses, certs, prog] = await Promise.all([
        this.content.courses(),
        this.content.certificates(),
        this.progressSvc.allCourseProgress().catch(() => []),
      ]);
      this.courses.set(courses);
      this.certs.set(certs);
      this.progress.set(Object.fromEntries(prog.map((p) => [p.courseId, p.percent])));
    } finally {
      this.loading.set(false);
    }
  }
}
