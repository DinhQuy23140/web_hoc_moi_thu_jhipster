/**
 * Handwriting stroke checking in KanjiVG's 109×109 coordinate space. A drawn stroke is
 * accepted when, after resampling both polylines to the same number of points, it stays
 * close to the reference stroke and goes in the same direction (stroke order + direction
 * are what teachers grade, not exact shape).
 */
export interface Pt {
  x: number;
  y: number;
}

export interface StrokeCheck {
  ok: boolean;
  /** Mean point distance to the reference (viewBox units). */
  distance: number;
  /** The shape matches but was drawn backwards. */
  reversed: boolean;
}

const SAMPLES = 24;
/** Mean distance accepted, in units of the 109 px KanjiVG box. */
const MAX_MEAN_DISTANCE = 15;
const MAX_ENDPOINT_DISTANCE = 26;

export function pathLength(pts: Pt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
  return len;
}

/** Resamples a polyline into `n` points evenly spaced along its length. */
export function resample(pts: Pt[], n = SAMPLES): Pt[] {
  if (!pts.length) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => ({ ...pts[0] }));
  const total = pathLength(pts);
  if (total === 0) return Array.from({ length: n }, () => ({ ...pts[0] }));
  const step = total / (n - 1);
  const out: Pt[] = [{ ...pts[0] }];
  let acc = 0;
  let prev = pts[0];
  for (let i = 1; i < pts.length && out.length < n; i++) {
    let cur = pts[i];
    let d = dist(prev, cur);
    while (acc + d >= step && out.length < n) {
      const t = (step - acc) / d;
      const p = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) };
      out.push(p);
      prev = p;
      d = dist(prev, cur);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out;
}

function meanDistance(a: Pt[], b: Pt[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += dist(a[i], b[i]);
  return sum / a.length;
}

/** Checks one drawn stroke against the reference stroke (both in viewBox coordinates). */
export function checkStroke(drawn: Pt[], reference: Pt[], leniency = 1): StrokeCheck {
  const a = resample(drawn);
  const b = resample(reference);
  if (a.length < 2 || b.length < 2) return { ok: false, distance: Infinity, reversed: false };
  const refLen = pathLength(reference);
  const drawnLen = pathLength(drawn);
  const forward = meanDistance(a, b);
  const backward = meanDistance(a.slice().reverse(), b);
  const maxMean = MAX_MEAN_DISTANCE * leniency;
  const maxEnd = MAX_ENDPOINT_DISTANCE * leniency;
  // Dots and short ticks are hard to draw precisely, so only the length ratio of longer strokes counts.
  const lengthOk = refLen < 20 || (drawnLen >= refLen * 0.35 && drawnLen <= refLen * 2.6);
  const endsOk = dist(a[0], b[0]) <= maxEnd && dist(a[a.length - 1], b[b.length - 1]) <= maxEnd;
  const ok = lengthOk && endsOk && forward <= maxMean;
  const reversed = !ok && lengthOk && backward <= maxMean && backward < forward;
  return { ok, distance: forward, reversed };
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Characters for which KanjiVG has stroke data: kana and CJK ideographs. */
export function isWritable(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (c >= 0x3041 && c <= 0x3096) || (c >= 0x30a1 && c <= 0x30fa) || c === 0x30fc || (c >= 0x4e00 && c <= 0x9fff) || c === 0x3005;
}
