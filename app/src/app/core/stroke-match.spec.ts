import { Pt, checkStroke, isWritable, pathLength, resample } from './stroke-match';

const line = (x1: number, y1: number, x2: number, y2: number, n = 10): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => ({ x: x1 + ((x2 - x1) * i) / n, y: y1 + ((y2 - y1) * i) / n }));

describe('stroke-match', () => {
  it('resamples a polyline evenly', () => {
    const pts = resample([{ x: 0, y: 0 }, { x: 100, y: 0 }], 5);
    expect(pts.map((p) => Math.round(p.x))).toEqual([0, 25, 50, 75, 100]);
    expect(pathLength(pts)).toBeCloseTo(100);
  });

  it('accepts a stroke drawn close to the reference', () => {
    const ref = line(20, 50, 90, 50);
    const drawn = line(22, 54, 87, 48, 7);
    expect(checkStroke(drawn, ref)).toMatchObject({ ok: true, reversed: false });
  });

  it('flags a stroke drawn in the wrong direction', () => {
    const ref = line(20, 50, 90, 50);
    expect(checkStroke(line(90, 50, 20, 50), ref)).toMatchObject({ ok: false, reversed: true });
  });

  it('rejects a stroke in the wrong place or with the wrong shape', () => {
    const ref = line(20, 50, 90, 50);
    expect(checkStroke(line(20, 90, 90, 90), ref).ok).toBe(false);
    expect(checkStroke(line(55, 10, 55, 100), ref).ok).toBe(false);
    expect(checkStroke(line(20, 50, 35, 50), ref).ok).toBe(false);
  });

  it('is lenient with short strokes such as dots', () => {
    const dot = line(50, 20, 54, 26);
    expect(checkStroke(line(51, 21, 60, 30), dot).ok).toBe(true);
  });

  it('knows which characters have stroke data', () => {
    expect(isWritable('あ')).toBe(true);
    expect(isWritable('ア')).toBe(true);
    expect(isWritable('ー')).toBe(true);
    expect(isWritable('学')).toBe(true);
    expect(isWritable('a')).toBe(false);
    expect(isWritable('、')).toBe(false);
  });
});
