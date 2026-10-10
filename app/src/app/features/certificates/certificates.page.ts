import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { I18N_PIPES } from '../../core/i18n.pipes';
import { LearnContextService, TARGETS, TargetLang } from '../../core/learn-context.service';
import { Certificate } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-certificates',
  imports: [RouterLink, IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ 'certs.title' | t }}</h1>
      <p class="mt-1 text-muted">{{ 'certs.sub' | t }}</p>
      @for (lang of langs(); track lang) {
        <section class="mt-8">
          <h2 class="mb-3 flex items-center gap-2 font-display text-xl font-black">{{ targets[lang].flag }} {{ targets[lang].label }}</h2>
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (c of byLang()[lang] ?? []; track c.id) {
              <a [routerLink]="['/certificates', c.id]" class="card flex gap-4 p-5 card-hover">
                <div class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-center font-display text-xs font-black leading-tight text-white" [style.background]="c.color">{{ c.code }}</div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-lg font-black">{{ c.name }}</h3>
                  <p class="text-xs font-semibold text-muted">{{ c.organizer }}</p>
                  <p class="mt-1 line-clamp-2 text-sm text-muted">{{ c.description | loc }}</p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    @for (l of c.levels.slice(0, 6); track l.code) { <span class="chip">{{ l.label }}</span> }
                  </div>
                  <p class="mt-2 flex gap-4 text-xs font-semibold text-muted">
                    <span class="flex items-center gap-1"><app-icon name="book" [size]="14" /> {{ c.courseIds.length }} {{ 'certs.courses' | t }}</span>
                    <span class="flex items-center gap-1"><app-icon name="timer" [size]="14" /> {{ c.examIds.length }} {{ 'certs.mockTests' | t }}</span>
                  </p>
                </div>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class CertificatesPage {
  private readonly content = inject(ContentService);
  private readonly ctx = inject(LearnContextService);
  protected readonly targets = TARGETS;
  protected readonly certs = signal<Certificate[]>([]);
  protected readonly langs = computed<TargetLang[]>(() => (this.ctx.target() === 'ja' ? ['ja', 'en'] : ['en', 'ja']));
  protected readonly byLang = computed(() => {
    const m: Record<string, Certificate[]> = {};
    for (const c of this.certs()) (m[c.languageId] ??= []).push(c);
    return m;
  });

  constructor() {
    this.content.certificates().then((c) => this.certs.set(c));
  }
}
