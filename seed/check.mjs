// Sanity checks for the generated dataset in ./out. Usage: node check.mjs
import { readFileSync } from 'node:fs';

const load = (n) => JSON.parse(readFileSync(new URL(`./out/${n}.json`, import.meta.url), 'utf8'));
const lessons = load('lessons');
const exams = load('exams');
const problems = [];
const types = {};

function checkExercise(ex, where) {
  types[ex.type] = (types[ex.type] ?? 0) + 1;
  const opts = ex.options ?? [];
  if (['MULTIPLE_CHOICE', 'LISTENING', 'FILL_BLANK'].includes(ex.type) && opts.length) {
    if (opts.length < 3) problems.push(`${where} ${ex.id}: only ${opts.length} options`);
    if (!ex.answers?.every((a) => opts.includes(a))) problems.push(`${where} ${ex.id}: answer missing from options`);
    if (new Set(opts).size !== opts.length) problems.push(`${where} ${ex.id}: duplicate options`);
  }
  if (ex.type === 'FILL_BLANK' && !ex.question?.includes('___')) problems.push(`${where} ${ex.id}: no blank`);
  if (ex.type === 'ORDER_WORD') {
    const a = [...opts.join('').replace(/\s/g, '')].sort().join('');
    const b = [...ex.answers[0].replace(/\s/g, '')].sort().join('');
    if (a !== b) problems.push(`${where} ${ex.id}: tiles do not form the answer`);
  }
  if (ex.type === 'MATCHING' && (ex.pairs?.length ?? 0) < 3) problems.push(`${where} ${ex.id}: too few pairs`);
  if (ex.type === 'MATCHING' && new Set(ex.pairs.map((p) => p.b)).size !== ex.pairs.length) problems.push(`${where} ${ex.id}: duplicate matching values`);
  for (const k of Object.keys(ex.labels ?? {})) if (!k || /^__.*__$/.test(k)) problems.push(`${where} ${ex.id}: bad label key "${k}"`);
}

for (const l of lessons) {
  const size = Buffer.byteLength(JSON.stringify(l));
  if (size > 900_000) problems.push(`${l.id}: ${size} bytes`);
  for (const c of l.contents) for (const ex of c.exercises ?? c.questions ?? []) checkExercise(ex, l.id);
}
for (const e of exams) for (const s of e.sections) {
  if (!s.questions.length) problems.push(`${e.id}: empty section ${s.kind}`);
  for (const ex of s.questions) checkExercise(ex, e.id);
}

console.log('Exercise types:', types);
console.log('Exam question counts:', exams.map((e) => `${e.id}=${e.questionCount}`).join(' '));
console.log(problems.length ? `${problems.length} problems:\n${problems.join('\n')}` : 'No problems found.');
process.exitCode = problems.length ? 1 : 0;
