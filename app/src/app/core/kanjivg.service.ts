import { Injectable } from '@angular/core';
import { Pt } from './stroke-match';

/** Pinned KanjiVG release (CC BY-SA 3.0, https://kanjivg.tagaini.net) served by jsDelivr. */
const KANJIVG_BASE = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@r20260714/kanji/';
const STORE_PREFIX = 'lingora.kvg.';
const SVG_NS = 'http://www.w3.org/2000/svg';

export interface CharStrokes {
  char: string;
  /** SVG path data per stroke, in stroke order. */
  paths: string[];
  /** Each stroke sampled as a polyline (viewBox 0..109). */
  points: Pt[][];
}

/**
 * Loads stroke-order data for kana / kanji. Results are cached in memory and in
 * localStorage (a character is ~1–3 KB), and the service worker caches the CDN files,
 * so practice keeps working offline for characters seen before.
 */
@Injectable({ providedIn: 'root' })
export class KanjiVgService {
  private readonly memory = new Map<string, Promise<CharStrokes | null>>();
  private sampler: SVGPathElement | null = null;

  load(char: string): Promise<CharStrokes | null> {
    const hit = this.memory.get(char);
    if (hit) return hit;
    const p = this.fetchPaths(char).then((paths) => (paths ? { char, paths, points: paths.map((d) => this.sample(d)) } : null));
    p.catch(() => this.memory.delete(char));
    this.memory.set(char, p);
    return p;
  }

  private async fetchPaths(char: string): Promise<string[] | null> {
    const code = (char.codePointAt(0) ?? 0).toString(16).padStart(5, '0');
    try {
      const stored = localStorage.getItem(STORE_PREFIX + code);
      if (stored) return JSON.parse(stored) as string[];
    } catch {
      // ignore corrupt cache
    }
    const res = await fetch(`${KANJIVG_BASE}${code}.svg`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`kanjivg ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const paths = [...doc.querySelectorAll('path')]
      .map((el) => ({ d: el.getAttribute('d') ?? '', n: Number(/-s(\d+)$/.exec(el.id)?.[1] ?? 0) }))
      .filter((p) => p.d)
      .sort((a, b) => a.n - b.n)
      .map((p) => p.d);
    if (!paths.length) return null;
    try {
      localStorage.setItem(STORE_PREFIX + code, JSON.stringify(paths));
    } catch {
      // quota exceeded: memory cache still works
    }
    return paths;
  }

  /** Samples an SVG path into points using the browser's geometry engine. */
  private sample(d: string): Pt[] {
    const path = this.samplerPath();
    path.setAttribute('d', d);
    const len = path.getTotalLength();
    const n = Math.max(8, Math.min(48, Math.round(len / 3)));
    return Array.from({ length: n + 1 }, (_, i) => {
      const p = path.getPointAtLength((len * i) / n);
      return { x: p.x, y: p.y };
    });
  }

  private samplerPath(): SVGPathElement {
    if (this.sampler) return this.sampler;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    const path = document.createElementNS(SVG_NS, 'path');
    svg.appendChild(path);
    document.body.appendChild(svg);
    this.sampler = path;
    return path;
  }
}
