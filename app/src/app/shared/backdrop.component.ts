import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative page backdrop telling what Mầm is about: English and Japanese scripts, chat
 * bubbles, flashcards, listening, a dashed certificate roadmap with level milestones, and a
 * row of sprouts growing on hills at the bottom. Every color comes from the `--bd-*` theme
 * variables, so it follows mode and palette.
 */
@Component({
  selector: 'app-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="bd-layer bd-pattern" width="100%" height="100%">
      <defs>
        <pattern id="bd-tile" width="960" height="640" patternUnits="userSpaceOnUse">
          <!-- Roadmaps: each starts and ends at the same height and slope so tiles join seamlessly. -->
          <path class="bd-road" d="M0 200C160 160 320 240 480 200S800 160 960 200" />
          <path class="bd-road" d="M0 440C160 480 320 400 480 440S800 480 960 440" />
          <g class="bd-pill" transform="translate(240 200)">
            <rect x="-22" y="-14" width="44" height="28" rx="14" /><text y="5.5">A1</text>
          </g>
          <g class="bd-pill" transform="translate(720 200)">
            <rect x="-22" y="-14" width="44" height="28" rx="14" /><text y="5.5">N5</text>
          </g>
          <g class="bd-pill" transform="translate(240 440)">
            <rect x="-22" y="-14" width="44" height="28" rx="14" /><text y="5.5">N3</text>
          </g>
          <g class="bd-pill" transform="translate(720 440)">
            <rect x="-32" y="-14" width="64" height="28" rx="14" /><text y="5.5">IELTS</text>
          </g>

          <!-- Scripts: kanji, kana and Latin letters. -->
          <g transform="translate(120 100) rotate(-10)"><text class="bd-glyph bd-jp" y="27" font-size="76">学</text></g>
          <g transform="translate(600 100) rotate(8)"><text class="bd-glyph bd-jp" y="22" font-size="64">あ</text></g>
          <g transform="translate(840 330) rotate(6)"><text class="bd-glyph bd-latin" y="20" font-size="58">Aa</text></g>
          <g transform="translate(120 545) rotate(-6)"><text class="bd-glyph bd-jp" y="17" font-size="50">カ</text></g>
          <g transform="translate(840 545) rotate(10)"><text class="bd-glyph bd-jp" y="20" font-size="56">語</text></g>
          <g transform="translate(600 552) rotate(-5)"><text class="bd-glyph bd-latin" y="10" font-size="30">abc</text></g>
          <g transform="translate(480 100) rotate(-8)"><text class="bd-glyph bd-jp" y="11" font-size="32">日</text></g>
          <g transform="translate(240 325) rotate(-12)"><text class="bd-glyph bd-latin" y="10" font-size="30">Z</text></g>
          <g transform="translate(480 325) rotate(10)"><text class="bd-glyph bd-latin" y="10" font-size="32">?</text></g>
          <g transform="translate(480 560) rotate(6)"><text class="bd-glyph bd-jp" y="10" font-size="30">ん</text></g>

          <!-- Chat bubbles: speaking practice in both languages. -->
          <g class="bd-line" transform="translate(360 100) rotate(-4)">
            <path d="M-48-30h96a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14h-62l-18 16 4-16h-20a14 14 0 0 1-14-14v-28a14 14 0 0 1 14-14z" />
            <text class="bd-glyph bd-latin" y="5" font-size="22">Hello!</text>
          </g>
          <g class="bd-line" transform="translate(360 540) rotate(5)">
            <path d="M-66-26h132a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14h-22l4 16-18-16h-96a14 14 0 0 1-14-14v-26a14 14 0 0 1 14-14z" />
            <text class="bd-glyph bd-jp" y="8" font-size="19">こんにちは</text>
          </g>

          <!-- Flashcard: word on the front, meaning underneath. -->
          <g class="bd-line" transform="translate(120 320) rotate(-7)">
            <rect x="-48" y="-34" width="96" height="68" rx="10" />
            <rect x="-40" y="-42" width="96" height="68" rx="10" class="bd-ghost" />
            <text class="bd-glyph bd-jp" y="0" font-size="22">ねこ</text>
            <path d="M-20 10h40" />
            <text class="bd-glyph bd-latin" y="26" font-size="12">cat</text>
          </g>

          <!-- Listening and speaking. -->
          <g class="bd-line" transform="translate(840 92) rotate(-8)">
            <path d="M-24 6v-6a24 24 0 0 1 48 0v6" />
            <rect x="-30" y="2" width="12" height="22" rx="5" />
            <rect x="18" y="2" width="12" height="22" rx="5" />
          </g>
          <g class="bd-line" transform="translate(720 330) rotate(8)">
            <rect x="-8" y="-22" width="16" height="28" rx="8" />
            <path d="M-15-2a15 15 0 0 0 30 0M0 13v9M-8 22h16" />
          </g>

          <!-- Certificate medal. -->
          <g class="bd-line" transform="translate(600 315) rotate(6)">
            <path d="M-12 16l-8 30 10-6 8 9 6-30M12 16l8 30-10-6-8 9" />
            <circle r="24" />
            <path class="bd-fill-accent" d="M0-11l3.3 6.8 7.4 1-5.4 5.2 1.3 7.4L0 5.9l-6.6 3.5 1.3-7.4-5.4-5.2 7.4-1z" />
          </g>

          <!-- Sprout from the logo. -->
          <g transform="translate(360 345) scale(.9)">
            <path class="bd-line" d="M0 0v-34" />
            <path class="bd-fill-ink" d="M-1-22c-5-12-14-18-28-17 2 13 12 20 28 17z" />
            <path class="bd-fill-accent" d="M1-30c3-16 15-26 33-27-1 17-12 28-33 27z" />
          </g>

          <!-- Sparkles and dots. -->
          <path class="bd-fill-accent" d="M240 100l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          <path class="bd-fill-accent" d="M720 95l2.5 7.5 7.5 2.5-7.5 2.5-2.5 7.5-2.5-7.5-7.5-2.5 7.5-2.5z" />
          <path class="bd-fill-accent" d="M240 560l2.5 7.5 7.5 2.5-7.5 2.5-2.5 7.5-2.5-7.5-7.5-2.5 7.5-2.5z" />
          <path class="bd-fill-accent" d="M720 545l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          <path class="bd-fill-accent" d="M40 425l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          <circle class="bd-fill-ink" cx="30" cy="30" r="3" />
          <circle class="bd-fill-ink" cx="930" cy="250" r="3" />
          <circle class="bd-fill-ink" cx="540" cy="250" r="2.5" />
          <circle class="bd-fill-ink" cx="60" cy="230" r="2.5" />
          <circle class="bd-fill-ink" cx="930" cy="610" r="2.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bd-tile)" />
    </svg>

    <svg class="bd-layer bd-garden" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
      <defs>
        <g id="bd-sprout">
          <path d="M0 8V-30" class="bd-stem" />
          <path d="M-1-16c-4-10-12-15-23-14 1 11 10 17 23 14z" class="bd-leaf" />
          <path d="M1-26c3-13 12-21 27-22-1 14-10 23-27 22z" class="bd-leaf-accent" />
        </g>
      </defs>
      <path class="bd-hill-back" d="M0 118C240 70 420 150 720 104S1200 58 1440 108V200H0z" />
      @for (s of sprouts; track $index) {
        <g [attr.transform]="'translate(' + s.x + ' ' + s.y + ') scale(' + s.k + ')'">
          <g class="bd-sway" [style.animation-delay]="s.d + 's'"><use href="#bd-sprout" /></g>
        </g>
      }
      <path class="bd-hill-front" d="M0 160C300 120 520 176 820 150S1260 118 1440 154V200H0z" />
    </svg>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }
    :host-context([data-mode='contrast']) { display: none; }
    @media print { :host { display: none; } }

    .bd-layer { position: absolute; left: 0; width: 100%; }
    .bd-pattern {
      top: 0;
      height: 100%;
      /* Quieter in the middle where the content sits, fuller toward the edges. */
      mask-image: radial-gradient(ellipse 65% 60% at 50% 45%, rgb(0 0 0 / 0.4), #000 85%);
    }
    .bd-garden { bottom: 0; height: clamp(110px, 20vh, 210px); }

    .bd-glyph { fill: var(--bd-ink); font-weight: 800; text-anchor: middle; }
    .bd-latin { font-family: var(--font-display); }
    .bd-jp { font-family: var(--font-jp); font-weight: 700; }
    .bd-line, .bd-line * { fill: none; stroke: var(--bd-ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .bd-line text { stroke: none; fill: var(--bd-ink); }
    .bd-line .bd-ghost { stroke-dasharray: 4 6; }
    .bd-line .bd-fill-accent { fill: var(--bd-accent); stroke: none; }
    .bd-fill-ink { fill: var(--bd-ink); }
    .bd-fill-accent { fill: var(--bd-accent); }
    .bd-road { fill: none; stroke: var(--bd-ink); stroke-width: 3; stroke-dasharray: 2 12; stroke-linecap: round; }
    .bd-pill rect { fill: var(--bd-pill); stroke: var(--bd-ink); stroke-width: 2.5; }
    .bd-pill text { fill: var(--bd-ink-strong); font: 800 14px var(--font-display); text-anchor: middle; }

    .bd-hill-back { fill: var(--bd-hill-back); }
    .bd-hill-front { fill: var(--bd-hill-front); }
    .bd-stem { fill: none; stroke: var(--bd-sprout); stroke-width: 4; stroke-linecap: round; }
    .bd-leaf { fill: var(--bd-sprout); }
    .bd-leaf-accent { fill: var(--bd-sprout-accent); }
    .bd-sway {
      transform-box: fill-box;
      transform-origin: 50% 100%;
      animation: bd-sway 6s ease-in-out infinite alternate;
    }
    @keyframes bd-sway {
      from { transform: rotate(-4deg); }
      to { transform: rotate(4deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .bd-sway { animation: none; }
    }
  `,
})
export class BackdropComponent {
  protected readonly sprouts = [
    { x: 70, y: 152, k: 0.8, d: 0 },
    { x: 210, y: 140, k: 1.25, d: -2.1 },
    { x: 395, y: 150, k: 0.9, d: -4.3 },
    { x: 560, y: 158, k: 1.5, d: -1.2 },
    { x: 760, y: 154, k: 1, d: -3.4 },
    { x: 930, y: 146, k: 1.35, d: -5.1 },
    { x: 1110, y: 136, k: 0.85, d: -0.6 },
    { x: 1270, y: 132, k: 1.2, d: -2.8 },
    { x: 1400, y: 146, k: 0.9, d: -4.7 },
  ];
}
