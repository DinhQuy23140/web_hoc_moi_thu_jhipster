import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { Certificate, Course, Exam } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { EmptyComponent, SpinnerComponent } from '../../shared/ui';
import { CourseCardComponent } from '../courses/course-card.component';

@Component({
  selector: 'app-certificate-detail',
  imports: [RouterLink, IconComponent, SpinnerComponent, EmptyComponent, CourseCardComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (cert(); as c) {
      <div class="page space-y-6">
        <a routerLink="/certificates" class="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg">
          <app-icon name="chevronLeft" [size]="16" /> {{ 'certs.title' | t }}
        </a>
        <section class="card p-6" [style.background]="'linear-gradient(135deg,' + c.color + '22, transparent 60%)'">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-center font-display text-sm font-black text-white" [style.background]="c.color">{{ c.code }}</div>
            <div>
              <h1 class="page-title">{{ c.name }}</h1>
              <p class="font-semibold text-muted">{{ c.fullName }} · {{ c.organizer }}</p>
            </div>
          </div>
          <p class="mt-4 leading-relaxed">{{ c.description | loc }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-sm">
            <span class="chip !text-sm"><app-icon name="clock" [size]="14" /> {{ c.durationMinutes }} {{ 'common.min' | t }}</span>
            <span class="chip !text-sm"><app-icon name="calendar" [size]="14" /> {{ c.validity | loc }}</span>
            @if (c.website) { <a class="chip-primary !text-sm hover:brightness-95" [href]="c.website" target="_blank" rel="noopener noreferrer"><app-icon name="external" [size]="14" /> {{ 'certs.website' | t }}</a> }
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card p-5">
            <h2 class="mb-3 font-display text-lg font-black">{{ 'certs.format' | t }}</h2>
            <table class="w-full text-sm">
              <thead><tr class="text-left text-muted"><th class="py-2">{{ 'certs.section' | t }}</th><th>{{ 'common.min' | t }}</th><th>{{ 'certs.questions' | t }}</th></tr></thead>
              <tbody>
                @for (s of c.sections; track $index) {
                  <tr class="border-t border-line"><td class="py-2 font-semibold">{{ s.name | loc }}</td><td>{{ s.minutes || '—' }}</td><td>{{ s.questions || '—' }}</td></tr>
                }
              </tbody>
            </table>
            <p class="mt-4 text-sm text-muted"><b>{{ 'certs.scoring' | t }}:</b> {{ c.scoring | loc }}</p>
          </section>
          <section class="card p-5">
            <h2 class="mb-3 font-display text-lg font-black">{{ 'certs.levelsTitle' | t }}</h2>
            <ul class="space-y-2">
              @for (l of c.levels; track l.code) {
                <li class="flex gap-3 rounded-xl bg-surface-2 p-3">
                  <span class="chip-primary h-fit shrink-0">{{ l.label }}</span>
                  <div class="text-sm">
                    @if (l.cefr) { <span class="font-semibold">CEFR {{ l.cefr }} · </span> }
                    <span class="text-muted">{{ l.description | loc }}</span>
                  </div>
                </li>
              }
            </ul>
          </section>
        </div>

        <section>
          <h2 class="mb-3 font-display text-lg font-black">{{ 'certs.mockTests' | t }}</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            @for (e of exams(); track e.id) {
              <a [routerLink]="['/exams', e.id]" class="card flex items-center gap-4 p-4 card-hover">
                <div class="rounded-xl bg-accent/15 p-3 text-accent"><app-icon name="timer" /></div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-bold">{{ e.title | loc }}</p>
                  <p class="text-xs font-semibold text-muted">{{ e.questionCount }} {{ 'certs.questions' | t }} · {{ e.durationMinutes }} {{ 'common.min' | t }}</p>
                </div>
                <app-icon name="chevronRight" />
              </a>
            } @empty {
              <p class="text-muted">{{ 'certs.noExams' | t }}</p>
            }
          </div>
        </section>

        <section>
          <h2 class="mb-3 font-display text-lg font-black">{{ 'certs.prepCourses' | t }}</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            @for (co of courses(); track co.id) { <app-course-card [course]="co" /> }
          </div>
        </section>

        @if (c.tips.length) {
          <section class="card p-5">
            <h2 class="mb-3 flex items-center gap-2 font-display text-lg font-black"><app-icon name="lightbulb" [size]="22" class="text-warning" /> {{ 'certs.tips' | t }}</h2>
            <ul class="list-disc space-y-1.5 pl-5">
              @for (tip of c.tips; track $index) { <li>{{ tip | loc }}</li> }
            </ul>
          </section>
        }
      </div>
    } @else {
      <app-empty icon="award" [text]="'common.notFound' | t" />
    }
  `,
})
export class CertificateDetailPage implements OnInit {
  private readonly content = inject(ContentService);
  readonly id = input.required<string>();
  protected readonly loading = signal(true);
  protected readonly cert = signal<Certificate | undefined>(undefined);
  protected readonly courses = signal<Course[]>([]);
  protected readonly exams = signal<Exam[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const cert = await this.content.certificate(this.id());
      this.cert.set(cert);
      if (!cert) return;
      const [courses, exams] = await Promise.all([this.content.courses(), this.content.exams(cert.id)]);
      const linked = new Set(cert.courseIds ?? []);
      this.courses.set(courses.filter((c) => c.certificateId === cert.id || linked.has(c.id)));
      this.exams.set(exams);
    } finally {
      this.loading.set(false);
    }
  }
}
