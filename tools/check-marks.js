// Checks that every worked-example part in learn.js awards exactly the marks it states.
// Run from the repo root:  node tools/check-marks.js
const fs = require('fs');
const src = fs.readFileSync('learn.js', 'utf8');
// learn.js expects a browser; give it just enough of one to load the data object.
global.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ setAttribute(){}, append(){}, prepend(){}, addEventListener(){}, querySelector(){ return { addEventListener(){} }; } }), body: { append(){} }, documentElement: { classList: { toggle(){}, contains(){ return false; } }, addEventListener(){} }, addEventListener(){} };
global.matchMedia = () => ({ matches: false, addEventListener(){} });
global.localStorage = { getItem: () => null, setItem(){} };
global.MutationObserver = class { observe(){} };
eval(src.replace('Object.keys(L).forEach', 'globalThis.L_OUT = L; Object.keys(L).forEach'));
const L = globalThis.L_OUT;
let problems = 0, parts = 0;
for (const [topic, d] of Object.entries(L)) d.ex.forEach((e, i) => e.parts.forEach((p, j) => {
  parts++;
  const text = p.s.map(s => (typeof s === 'object' ? s.c + ' ' + s.t : s)).join(' ');
  // Each calculator line appears twice (Casio + TI) with the same marks, so count Casio only.
  const casioOnly = p.s.map(s => (typeof s === 'object' ? s.c : s)).join(' ');
  const awarded = (casioOnly.match(/class="mk">([^<]*)</g) || []).reduce((n, m) => n + m.replace(/.*>/, '').replace('<', '').trim().split(/\s+/).length, 0);
  if (awarded !== p.m) { problems++; console.log(`✗ ${topic} example ${i + 1} part (${String.fromCharCode(97 + j)}): states [${p.m}] but awards ${awarded}`); }
}));
console.log(problems ? `${problems} problem(s) in ${parts} parts` : `✓ all ${parts} parts add up`);
process.exit(problems ? 1 : 0);
