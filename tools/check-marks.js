// Checks that every worked-example part in every unit's learn.js awards exactly the marks it states.
// Run from the repo root:  node tools/check-marks.js
const fs = require('fs');
const path = require('path');
const stubEl = () => ({ setAttribute(){}, append(){}, prepend(){}, addEventListener(){}, querySelector(){ return { addEventListener(){} }; }, dataset: {} });
global.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: stubEl, body: { append(){}, dataset: {} }, documentElement: { dataset: {}, classList: { toggle(){}, contains(){ return false; } }, addEventListener(){} }, addEventListener(){} };
global.matchMedia = () => ({ matches: false, addEventListener(){} });
global.localStorage = { getItem: () => null, setItem(){} };
global.MutationObserver = class { observe(){} };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
global.window = global;
// core.js defines window.LAB (the K, G and M helpers that learn.js uses).
eval(fs.readFileSync('shared/core.js', 'utf8'));
const units = fs.readdirSync('.').filter(d => fs.existsSync(path.join(d, 'learn.js')));
let problems = 0, parts = 0;
for (const unit of units) {
  global.LAB.L = {};
  eval(fs.readFileSync(path.join(unit, 'learn.js'), 'utf8'));
  const L = global.LAB.L;
  for (const [topic, d] of Object.entries(L)) d.ex.forEach((e, i) => e.parts.forEach((p, j) => {
    parts++;
    // Each calculator line appears twice (Casio + TI) with the same marks, so count Casio only.
    const casioOnly = p.s.map(s => (typeof s === 'object' ? s.c : s)).join(' ');
    const awarded = (casioOnly.match(/class="mk">([^<]*)</g) || []).reduce((n, m) => n + m.replace(/.*>/, '').replace('<', '').trim().split(/\s+/).length, 0);
    if (awarded !== p.m) { problems++; console.log(`✗ ${unit}/${topic} example ${i + 1} part (${String.fromCharCode(97 + j)}): states [${p.m}] but awards ${awarded}`); }
  }));
}
console.log(problems ? `${problems} problem(s) in ${parts} parts` : `✓ all ${parts} parts add up (${units.join(', ')})`);
process.exit(problems ? 1 : 0);
