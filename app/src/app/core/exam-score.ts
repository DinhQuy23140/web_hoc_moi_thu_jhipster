/**
 * Converts mock-exam results into the official score scales (IELTS band, TOEIC 990,
 * JLPT 180 with section minimums, ...). These are estimates: the mock exams only cover
 * vocabulary, grammar, reading and listening, so writing/speaking are not scored.
 */
export type SkillKind = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export interface SkillStat {
  kind: SkillKind;
  correct: number;
  total: number;
}

export interface ScorePart {
  /** i18n key of the part name. */
  key: string;
  value: string;
  max: string;
}

export interface ScoreEstimate {
  /** i18n key of the scale name. */
  scaleKey: string;
  total: string;
  max: string;
  parts: ScorePart[];
  passed: boolean | null;
  /** Optional level/grade reached on that scale (e.g. "B1", "Grade C"). */
  grade?: string;
  /** i18n key with extra caveats. */
  noteKey?: string;
}

export function aggregateSkills(sections: { kind: SkillKind; correct: number; total: number }[]): SkillStat[] {
  const map = new Map<SkillKind, SkillStat>();
  for (const s of sections) {
    const cur = map.get(s.kind) ?? { kind: s.kind, correct: 0, total: 0 };
    cur.correct += s.correct;
    cur.total += s.total;
    map.set(s.kind, cur);
  }
  return [...map.values()];
}

function ratio(stats: SkillStat[], kinds: SkillKind[]): number {
  const sel = stats.filter((s) => kinds.includes(s.kind));
  const total = sel.reduce((n, s) => n + s.total, 0);
  return total ? sel.reduce((n, s) => n + s.correct, 0) / total : 0;
}

const IELTS_BANDS: [number, number][] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [20, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3], [3, 2.5],
];

export function ieltsBand(rawOutOf40: number): number {
  for (const [min, band] of IELTS_BANDS) if (rawOutOf40 >= min) return band;
  return 2;
}

/** IELTS overall rounding: .25 rounds up to .5 and .75 rounds up to the next band. */
export function ieltsOverall(bands: number[]): number {
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  const whole = Math.floor(avg);
  const frac = avg - whole;
  return frac < 0.25 ? whole : frac < 0.75 ? whole + 0.5 : whole + 1;
}

const round5 = (n: number) => Math.round(n / 5) * 5;
const JLPT_PASS: Record<string, number> = { N1: 100, N2: 90, N3: 95, N4: 90, N5: 80 };
const NAT_TO_JLPT: Record<string, string> = { '1Q': 'N1', '2Q': 'N2', '3Q': 'N3', '4Q': 'N4', '5Q': 'N5' };
const CAMBRIDGE: Record<string, { min: number; max: number; pass: number; cefr: string; above: string; below: string }> = {
  KET: { min: 100, max: 150, pass: 120, cefr: 'A2', above: 'B1', below: 'A1' },
  PET: { min: 120, max: 170, pass: 140, cefr: 'B1', above: 'B2', below: 'A2' },
  FCE: { min: 140, max: 190, pass: 160, cefr: 'B2', above: 'C1', below: 'B1' },
  CAE: { min: 160, max: 210, pass: 180, cefr: 'C1', above: 'C2', below: 'B2' },
};

export function estimateScore(certCode: string, level: string, stats: SkillStat[]): ScoreEstimate | null {
  const listening = ratio(stats, ['listening']);
  const reading = ratio(stats, ['vocabulary', 'grammar', 'reading']);
  const language = ratio(stats, ['vocabulary', 'grammar']);
  const readOnly = ratio(stats, ['reading']);

  switch (certCode) {
    case 'IELTS': {
      const l = ieltsBand(Math.round(listening * 40));
      const r = ieltsBand(Math.round(reading * 40));
      const overall = ieltsOverall([l, r]);
      return {
        scaleKey: 'examScore.scale.ielts',
        total: overall.toFixed(1),
        max: '9.0',
        parts: [
          { key: 'examScore.part.listening', value: l.toFixed(1), max: '9.0' },
          { key: 'examScore.part.reading', value: r.toFixed(1), max: '9.0' },
        ],
        passed: overall >= Number(level),
        noteKey: 'examScore.noteNoWS',
      };
    }
    case 'TOEIC': {
      const l = Math.min(495, Math.max(5, round5(5 + listening * 490)));
      const r = Math.min(495, Math.max(5, round5(5 + reading * 490)));
      return {
        scaleKey: 'examScore.scale.toeic',
        total: String(l + r),
        max: '990',
        parts: [
          { key: 'examScore.part.listening', value: String(l), max: '495' },
          { key: 'examScore.part.reading', value: String(r), max: '495' },
        ],
        passed: l + r >= Number(level),
      };
    }
    case 'TOEFL': {
      const l = Math.round(listening * 30);
      const r = Math.round(reading * 30);
      const total = (l + r) * 2;
      return {
        scaleKey: 'examScore.scale.toefl',
        total: String(total),
        max: '120',
        parts: [
          { key: 'examScore.part.reading', value: String(r), max: '30' },
          { key: 'examScore.part.listening', value: String(l), max: '30' },
        ],
        passed: total >= Number(level),
        noteKey: 'examScore.noteExtrapolated',
      };
    }
    case 'CAMB': {
      const c = CAMBRIDGE[level];
      if (!c) return null;
      const scale = (p: number) => Math.round(c.min + p * (c.max - c.min));
      const r = scale(reading);
      const l = scale(listening);
      const total = Math.round((r + l) / 2);
      const grade = total >= c.pass + 20 ? `${c.above} (Grade A)` : total >= c.pass + 13 ? `${c.cefr} (Grade B)` : total >= c.pass ? `${c.cefr} (Grade C)` : c.below;
      return {
        scaleKey: 'examScore.scale.cambridge',
        total: String(total),
        max: String(c.max),
        parts: [
          { key: 'examScore.part.readingUse', value: String(r), max: String(c.max) },
          { key: 'examScore.part.listening', value: String(l), max: String(c.max) },
        ],
        passed: total >= c.pass,
        grade,
        noteKey: 'examScore.noteNoWS',
      };
    }
    case 'JLPT':
    case 'NAT': {
      const jl = certCode === 'NAT' ? NAT_TO_JLPT[level] : level;
      const pass = JLPT_PASS[jl];
      if (!pass) return null;
      const listen = Math.round(listening * 60);
      if (jl === 'N4' || jl === 'N5') {
        const lr = Math.round(((language * 2 + readOnly) / 3) * 120);
        const total = lr + listen;
        return {
          scaleKey: certCode === 'NAT' ? 'examScore.scale.nat' : 'examScore.scale.jlpt',
          total: String(total),
          max: '180',
          parts: [
            { key: 'examScore.part.languageReading', value: String(lr), max: '120' },
            { key: 'examScore.part.listening', value: String(listen), max: '60' },
          ],
          passed: total >= pass && lr >= 38 && listen >= 19,
          noteKey: 'examScore.noteJlptMin',
        };
      }
      const lang = Math.round(language * 60);
      const read = Math.round(readOnly * 60);
      const total = lang + read + listen;
      return {
        scaleKey: certCode === 'NAT' ? 'examScore.scale.nat' : 'examScore.scale.jlpt',
        total: String(total),
        max: '180',
        parts: [
          { key: 'examScore.part.language', value: String(lang), max: '60' },
          { key: 'examScore.part.reading', value: String(read), max: '60' },
          { key: 'examScore.part.listening', value: String(listen), max: '60' },
        ],
        passed: total >= pass && lang >= 19 && read >= 19 && listen >= 19,
        noteKey: 'examScore.noteJlptMin',
      };
    }
    case 'J.TEST': {
      const max = level === 'EF' ? 500 : 1000;
      const half = max / 2;
      const r = Math.round(reading * half);
      const l = Math.round(listening * half);
      const total = r + l;
      const grade =
        level === 'EF'
          ? total >= 350 ? 'E' : total >= 250 ? 'F' : '—'
          : total >= 930 ? 'Special A' : total >= 900 ? 'A' : total >= 850 ? 'Pre-A' : total >= 800 ? 'B' : total >= 700 ? 'C' : total >= 600 ? 'D' : '—';
      return {
        scaleKey: 'examScore.scale.jtest',
        total: String(total),
        max: String(max),
        parts: [
          { key: 'examScore.part.reading', value: String(r), max: String(half) },
          { key: 'examScore.part.listening', value: String(l), max: String(half) },
        ],
        passed: grade !== '—',
        grade,
      };
    }
    default:
      return null;
  }
}

/** Skills sorted from weakest to strongest (by accuracy). */
export function weakestSkills(stats: SkillStat[]): (SkillStat & { percent: number })[] {
  return stats
    .filter((s) => s.total > 0)
    .map((s) => ({ ...s, percent: Math.round((s.correct / s.total) * 100) }))
    .sort((a, b) => a.percent - b.percent);
}
