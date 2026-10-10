import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, input, output, signal, viewChild } from '@angular/core';
import { I18N_PIPES } from '../core/i18n.pipes';
import { CharStrokes } from '../core/kanjivg.service';
import { Pt, checkStroke } from '../core/stroke-match';
import { IconComponent } from './icon.component';
import { playSfx } from './sfx';

export type PadMode = 'watch' | 'trace' | 'recall';

export interface PadResult {
  strokes: number;
  mistakes: number;
}

type Feedback = 'ok' | 'shape' | 'reversed' | 'order' | 'auto' | null;

const AUTO_FILL_AFTER = 3;

/**
 * Handwriting pad for one kana / kanji. In `watch` mode it animates the stroke order;
 * in `trace` mode the character is shown faintly with the start of the next stroke;
 * in `recall` mode the learner writes from memory. Every stroke is checked for shape,
 * direction and order as soon as the pen is lifted.
 */
@Component({
  selector: 'app-stroke-pad',
  imports: [IconComponent, ...I18N_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = data();
    <div class="relative mx-auto aspect-square w-full max-w-[22rem] overflow-hidden rounded-3xl border-2 bg-surface"
      [class]="finished() ? 'border-success' : feedback() && feedback() !== 'ok' ? 'border-error' : 'border-line'">
      <svg #pad viewBox="0 0 109 109" class="h-full w-full touch-none select-none" [class.cursor-crosshair]="mode() !== 'watch'"
        (pointerdown)="down($event)" (pointermove)="move($event)" (pointerup)="up()" (pointercancel)="up()" role="img"
        [attr.aria-label]="('writing.padLabel' | t) + ' ' + d.char">
        <g class="text-line" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2">
          <line x1="54.5" y1="2" x2="54.5" y2="107" /><line x1="2" y1="54.5" x2="107" y2="54.5" />
        </g>
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          @if (mode() === 'trace' || (mode() === 'recall' && finished())) {
            @for (p of d.paths; track $index) { <path [attr.d]="p" class="text-muted" stroke-opacity="0.22" stroke-width="3.2" /> }
          }
          @if (mode() === 'watch') {
            @for (p of d.paths; track replayKey() + '-' + $index; let i = $index) {
              <path [attr.d]="p" class="text-muted" stroke-opacity="0.18" stroke-width="3.2" />
              <path [attr.d]="p" pathLength="1" class="kvg-anim text-fg" stroke-width="3.6" [style.animation-delay.s]="i * strokeDelay" />
            }
          } @else {
            @for (p of donePaths(); track $index) { <path [attr.d]="p" class="text-fg" stroke-width="3.6" /> }
            @if (hint() !== null) {
              @for (k of [hintKey()]; track k) {
                <path [attr.d]="d.paths[hint()!]" pathLength="1" class="kvg-anim text-primary" stroke-width="3.6" />
              }
            }
            @if (wrongInk()) { <polyline [attr.points]="wrongInk()" class="text-error" stroke-opacity="0.7" stroke-width="3.4" /> }
            @if (inkPoints()) { <polyline [attr.points]="inkPoints()" class="text-primary" stroke-width="3.6" /> }
          }
        </g>
        @if (mode() === 'trace' && nextStart(); as s) {
          <circle [attr.cx]="s.x" [attr.cy]="s.y" r="2.6" class="animate-pulse fill-primary" />
        }
        @if (mode() === 'watch' || finished()) {
          <g class="fill-muted" font-size="6" font-weight="700">
            @for (p of d.points; track $index; let i = $index) {
              <text [attr.x]="p[0].x - 6" [attr.y]="p[0].y - 1.5">{{ i + 1 }}</text>
            }
          </g>
        }
      </svg>
    </div>

    <div class="mx-auto mt-3 flex min-h-10 max-w-[22rem] items-center justify-between gap-2">
      <p class="text-sm font-semibold" [class]="feedback() === 'ok' || finished() ? 'text-success' : 'text-error'" aria-live="polite">
        @if (finished()) { <span class="animate-pop inline-flex items-center gap-1"><app-icon name="checkCircle" [size]="16" [draw]="true" /> {{ 'writing.charDone' | t }}</span> }
        @else if (feedback() && feedback() !== 'ok') { {{ 'writing.fb.' + feedback() | t }} }
        @else if (mode() !== 'watch') { <span class="text-muted">{{ 'writing.strokeOf' | t: { n: index() + 1, total: d.paths.length } }}</span> }
      </p>
      <div class="flex gap-1.5">
        @if (mode() === 'watch') {
          <button type="button" class="btn-soft !min-h-9 text-sm" (click)="replay()"><app-icon name="refresh" [size]="16" /> {{ 'writing.replay' | t }}</button>
        } @else {
          @if (!finished()) {
            <button type="button" class="btn-outline !min-h-9 text-sm" (click)="showHint()"><app-icon name="eye" [size]="16" /> {{ 'writing.hint' | t }}</button>
          }
          <button type="button" class="btn-outline !min-h-9 text-sm" (click)="reset()" [attr.aria-label]="'writing.clear' | t"><app-icon name="trash" [size]="16" /></button>
        }
      </div>
    </div>
  `,
})
export class StrokePadComponent implements OnDestroy {
  readonly data = input.required<CharStrokes>();
  readonly mode = input<PadMode>('trace');
  readonly done = output<PadResult>();

  private readonly pad = viewChild.required<ElementRef<SVGSVGElement>>('pad');
  protected readonly strokeDelay = 0.75;

  protected readonly index = signal(0);
  protected readonly ink = signal<Pt[]>([]);
  protected readonly wrongInk = signal('');
  protected readonly hint = signal<number | null>(null);
  protected readonly hintKey = signal(0);
  protected readonly feedback = signal<Feedback>(null);
  protected readonly replayKey = signal(0);
  protected readonly finished = signal(false);
  private mistakes = 0;
  private strokeMisses = 0;
  private drawing = false;
  private timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly donePaths = computed(() => this.data().paths.slice(0, this.index()));
  protected readonly inkPoints = computed(() => toPoints(this.ink()));
  protected readonly nextStart = computed(() => (this.finished() ? null : (this.data().points[this.index()]?.[0] ?? null)));

  protected replay(): void {
    this.replayKey.update((k) => k + 1);
  }

  reset(): void {
    this.index.set(0);
    this.ink.set([]);
    this.wrongInk.set('');
    this.hint.set(null);
    this.feedback.set(null);
    this.finished.set(false);
    this.mistakes = 0;
    this.strokeMisses = 0;
  }

  protected showHint(): void {
    if (this.finished()) return;
    this.mistakes++;
    this.flashHint();
  }

  protected down(e: PointerEvent): void {
    if (this.mode() === 'watch' || this.finished()) return;
    e.preventDefault();
    this.pad().nativeElement.setPointerCapture(e.pointerId);
    this.drawing = true;
    this.wrongInk.set('');
    this.ink.set([this.toPad(e)]);
  }

  protected move(e: PointerEvent): void {
    if (!this.drawing) return;
    const p = this.toPad(e);
    const pts = this.ink();
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) >= 0.8) this.ink.set([...pts, p]);
  }

  protected up(): void {
    if (!this.drawing) return;
    this.drawing = false;
    const drawn = this.ink();
    this.ink.set([]);
    const d = this.data();
    const i = this.index();
    const res = checkStroke(drawn, d.points[i]);
    if (res.ok) {
      this.accept();
      this.feedback.set('ok');
      return;
    }
    this.mistakes++;
    this.strokeMisses++;
    const later = d.points.slice(i + 1).some((ref) => checkStroke(drawn, ref).ok);
    this.feedback.set(later ? 'order' : res.reversed ? 'reversed' : 'shape');
    this.wrongInk.set(toPoints(drawn));
    this.later(() => this.wrongInk.set(''), 700);
    playSfx('wrong');
    if (this.strokeMisses >= AUTO_FILL_AFTER) {
      this.feedback.set('auto');
      this.accept();
    } else if (this.strokeMisses >= 2 || this.mode() === 'trace') {
      this.flashHint();
    }
  }

  private accept(): void {
    const next = this.index() + 1;
    this.index.set(next);
    this.strokeMisses = 0;
    this.hint.set(null);
    if (next >= this.data().paths.length) {
      this.finished.set(true);
      playSfx('correct');
      this.done.emit({ strokes: this.data().paths.length, mistakes: this.mistakes });
    }
  }

  private flashHint(): void {
    this.hint.set(this.index());
    this.hintKey.update((k) => k + 1);
  }

  private toPad(e: PointerEvent): Pt {
    const r = this.pad().nativeElement.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 109, y: ((e.clientY - r.top) / r.height) * 109 };
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
  }
}

function toPoints(pts: Pt[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}
