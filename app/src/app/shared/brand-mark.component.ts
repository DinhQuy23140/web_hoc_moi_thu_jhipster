import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

const PATH = {
  hands: 'M38 86c5 11 15 16 26 16s21-5 26-16',
  stem: 'M64 94V64',
  smallLeaf: 'M62 70c-5-15-18-23-36-22 2 17 15 26 36 22z',
  bigLeaf: 'M66 62c4-21 19-34 42-35-1 22-16 37-42 35z',
  vein: 'M67 61c9-11 20-20 31-25',
};

/** Standalone SVG of the mark with the current theme colors resolved, for the favicon. */
export function brandMarkDataUrl(css: CSSStyleDeclaration): string {
  const v = (name: string) => css.getPropertyValue(name).trim();
  const ink = v('--logo-ink');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>` +
    `<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${v('--logo-bg-a')}"/><stop offset="1" style="stop-color:${v('--logo-bg-b')}"/></linearGradient>` +
    `<linearGradient id="l" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:${v('--logo-leaf-a')}"/><stop offset="1" style="stop-color:${v('--logo-leaf-b')}"/></linearGradient></defs>` +
    `<rect width="128" height="128" rx="30" fill="url(#b)" style="stroke:${v('--logo-edge')};stroke-width:8"/>` +
    `<path d="${PATH.hands}" fill="none" stroke-opacity=".5" stroke-width="7" stroke-linecap="round" style="stroke:${ink}"/>` +
    `<path d="${PATH.stem}" fill="none" stroke-width="8" stroke-linecap="round" style="stroke:${ink}"/>` +
    `<path d="${PATH.smallLeaf}" style="fill:${ink}"/>` +
    `<path d="${PATH.bigLeaf}" fill="url(#l)"/>` +
    `<path d="${PATH.vein}" fill="none" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round" style="stroke:${ink}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * The Mầm sprout mark drawn inline so it takes its colors from the theme variables
 * (`--logo-*` in styles.css) and follows mode and palette changes.
 */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 128 128" width="100%" height="100%" [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null" [attr.aria-hidden]="label() ? null : 'true'">
      <defs>
        <!-- Ids are per instance: a gradient inside a display:none copy (e.g. the hidden sidebar) would blank the others. -->
        <linearGradient [attr.id]="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style="stop-color: var(--logo-bg-a)" />
          <stop offset="1" style="stop-color: var(--logo-bg-b)" />
        </linearGradient>
        <linearGradient [attr.id]="leaf" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style="stop-color: var(--logo-leaf-a)" />
          <stop offset="1" style="stop-color: var(--logo-leaf-b)" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="30" [attr.fill]="'url(#' + bg + ')'" style="stroke: var(--logo-edge); stroke-width: 8" />
      <path [attr.d]="path.hands" fill="none" stroke-opacity=".5" stroke-width="7" stroke-linecap="round" style="stroke: var(--logo-ink)" />
      <path [attr.d]="path.stem" fill="none" stroke-width="8" stroke-linecap="round" style="stroke: var(--logo-ink)" />
      <path [attr.d]="path.smallLeaf" style="fill: var(--logo-ink)" />
      <path [attr.d]="path.bigLeaf" [attr.fill]="'url(#' + leaf + ')'" />
      <path [attr.d]="path.vein" fill="none" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round" style="stroke: var(--logo-ink)" />
    </svg>
  `,
  host: { class: 'inline-block shrink-0', '[style.line-height]': '0' },
})
export class BrandMarkComponent {
  /** Accessible name; leave empty when the mark sits next to the visible "Mầm" wordmark. */
  readonly label = input('');
  protected readonly path = PATH;
  protected readonly bg = `mam-bg-${nextId}`;
  protected readonly leaf = `mam-leaf-${nextId++}`;
}
