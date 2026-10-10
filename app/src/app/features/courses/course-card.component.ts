import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { Course } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent } from '../../shared/ui';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink, IconComponent, ProgressBarComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/courses', course().id]" class="card card-hover group flex h-full flex-col overflow-hidden">
      <div class="relative flex h-28 items-center justify-between px-5" [style.background]="'linear-gradient(135deg,' + course().color + '33,' + course().color + '0d)'">
        <span class="text-5xl drop-shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">{{ course().emoji }}</span>
        <div class="flex flex-col items-end gap-1">
          <span class="chip-glass !font-black">{{ course().level }}</span>
          @if (course().cefr) { <span class="chip-glass">CEFR {{ course().cefr }}</span> }
        </div>
      </div>
      <div class="flex flex-1 flex-col p-4">
        <h3 class="font-display text-lg font-black leading-snug">{{ course().title | loc }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-muted">{{ course().subtitle | loc }}</p>
        <div class="mt-auto pt-4">
          @if (percent() !== null) {
            <div class="mb-3 flex items-center gap-2">
              <app-progress-bar class="flex-1" [value]="percent()!" />
              <span class="text-xs font-bold">{{ percent() }}%</span>
            </div>
          }
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
            <span class="flex items-center gap-1"><app-icon name="layers" [size]="14" />{{ course().unitCount }} {{ 'courses.units' | t }}</span>
            <span class="flex items-center gap-1"><app-icon name="book" [size]="14" />{{ course().lessonCount }} {{ 'courses.lessons' | t }}</span>
            <span class="flex items-center gap-1"><app-icon name="clock" [size]="14" />{{ course().estimatedHours }}h</span>
          </div>
        </div>
      </div>
    </a>
  `,
  host: { class: 'block' },
})
export class CourseCardComponent {
  readonly course = input.required<Course>();
  readonly percent = input<number | null>(null);
}
