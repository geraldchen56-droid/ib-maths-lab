# IB Maths Lab

Interactive study site for IB Mathematics: Analysis & Approaches HL. Live at **https://ib-aahl-probability-lab.vercel.app**.

The home page is a **course hub**. Units so far: **Number & algebra**, which so far covers proof (SL 1.6, AHL 1.15: direct proof, induction, contradiction, counterexamples), **Probability** (SL 4.5–4.9, 4.11–4.12, AHL 1.10, 4.13–4.14), **Vectors** (AHL 3.12–3.16, with rotatable 3D models) and **Calculus**, which so far covers differential equations (AHL 5.18, with live slope-field models). Every topic page follows the same pattern, so new units can be added in the same style.

---

## 1. How publishing works

The site is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

```
edit files  →  git push to main  →  Vercel redeploys automatically (≈20 seconds)
```

- Every push to `main` goes live at the URL above.
- Every push to any other branch gets its own preview URL (shown in the Vercel dashboard). Use a branch when you want to check something before it goes live.
- To undo a bad deploy, open Vercel → project **ib-aahl-probability-lab** → Deployments, then use **Promote** or **Instant Rollback** on the last good one.

## 2. Preview on your own computer

```bash
cd ib-maths-lab
python3 -m http.server 8000
```

Then open http://localhost:8000. Refresh after each edit; no restart is needed.

## 3. What each file does

```
index.html            the course hub (links to each unit; old /#topic links redirect to probability/)
shared/               code every unit uses
  core.js             helpers, the calculator switch (C, G, K, M, cv), the window.LAB namespace, the UNITS list
  boot.js             navigation, scoring, the practice engine
  learn-render.js     renders How to answer and Worked examples; builds the Formulas and Topics drawers
  styles.css          all styling, with variables and a dark mode at the top
probability/          one folder per unit
  index.html          page content: header, topic menu, one <section class="sec" id="s-TOPIC"> per topic
  app.js              the live models and the practice generators (GEN)
  learn.js            How to answer guides and Worked examples (the object L)
vectors/              same three files as probability/ (app.js also has the 3D engine)
calculus/             same three files; app.js has the 2D plot and slope-field helpers. Differential equations so far
algebra/              same three files; app.js has the proof models (cell grids, dominoes, remainder bars). Proof so far
tools/check-marks.js  checks every unit's worked examples add up
```

Scores are kept in the browser. Probability uses `ibprob-score` (its original key, so old scores survive); other units are stored in the same object under keys like `vectors.vec`. The calculator choice is `ibprob-calc` for all units.

### Anatomy of one topic page (in order)

1. **Header**: syllabus reference, title, one-line lede (`<unit>/index.html`)
2. **The idea**: the reasoning, written in plain prose (`<unit>/index.html`, `.theory > .prose`)
3. **Formulas**: formulas, Traps and Shorthand. They are written in `index.html` as the second panel in `.theory`, and `learn.js` moves them into the right-hand drawer automatically.
4. **Live model**: sliders and a canvas (markup in `index.html`, drawing code in `app.js`)
5. **How to answer**: 5-step method, question-type table, and where the marks are (`learn.js` → `L.topic.method/types/marks`)
6. **Worked examples**: 3 exam-style questions with marks and step-by-step reveal (`learn.js` → `L.topic.ex`)
7. **Practice + calculator panel**: unlimited random questions (`app.js` → `GEN.topic`) beside the Casio and TI-84 panels (`index.html`, `<aside class="calc" data-calc="casio|ti84">`)

## 4. Common edits

**Fix a typo or change wording.** Find the text in `index.html` (or in `learn.js` for methods and examples) and edit it directly.

**Calculator-specific text.** Anything that differs between calculators is written twice:
```html
<span data-calc="casio">Ncd(Lower, Upper, σ, μ)</span><span data-calc="ti84">normalcdf(lower, upper, μ, σ)</span>
```
Only the version matching the reader's choice is shown. In JavaScript, use the helper `C(casioText, tiText)` in `app.js`, or `G(casioText, tiText)` in `learn.js`.

**Add a worked example.** In `learn.js`, add an object to that topic's `ex` array:
```js
{tag:'Paper 2 · calculator', title:'Short title', stem:'The question setup…', parts:[
  {q:'Find P(X > 4).', m:2, s:[
    'First step of reasoning.',
    G(`Bcd: Lower 5, Upper 15 `+M('M1'), `1 − binomcdf(15, 0.2, 4) `+M('M1')),
    '= <b>0.164</b> (3 s.f.) '+M('A1')
  ]}
], tip:'Examiner note: the one mistake this question is designed to catch.'}
```
`m` is the marks for the part. The `M('M1')`, `M('A1')`, `M('R1')` badges inside its steps must add up to `m`. Run `node tools/check-marks.js` to confirm.

**Add a practice question type.** In the unit's `app.js`, add a function to the topic's `GEN` array. It must return:
```js
{ q: 'Question text (HTML allowed)', ans: 0.164, exact: false,
  work: ['step 1', 'step 2', C('casio line', 'TI line'), '= <b>answer</b>'],
  tip: 'Short, memorable shorthand for spotting and solving this question type.' }
```
Use `exact: true` for whole-number answers (counting). Otherwise answers within 0.6% are marked correct.

**Add a formula, trap or shorthand.** Edit the second `.panel` inside that topic's `.theory` in the unit's `index.html`. It shows up in the Formulas drawer automatically.

## 5. Adding a new unit (the rest of the course)

Build each unit in a **fresh Claude chat** and ask it to use the **ib-maths-topic-lab** skill. A good first message: *"Use the ib-maths-topic-lab skill to add Calculus to my IB Maths Lab."* The skill has the full template, the checks, and the deploy steps, so every unit matches this one. One chat per unit keeps each conversation short, which makes your usage go much further.

The AA HL syllabus, for planning:

| Unit | Contents |
|---|---|
| 1. Number & algebra | Sequences and series, exponents and logs, binomial theorem, counting*, **proof (done)**, complex numbers, systems of equations |
| 2. Functions | Graphs, composites and inverses, transformations, quadratics, rational functions, polynomials, inequalities, modulus |
| 3. Geometry & trigonometry | 3D shapes, trig ratios and identities, radians, unit circle, trig equations and graphs, **vectors, lines and planes (done)** |
| 4. Statistics & probability | Sampling, statistical measures, regression, **probability (done)** |
| 5. Calculus | Limits, differentiation, integration, kinematics, related rates, **differential equations (done)**, Maclaurin series |

\*Counting is already on the Probability page.

To add more topics to an existing unit (for example the rest of Calculus), add sections to that unit's folder rather than a new folder, and keep section ids unique within the unit.

Every page loads Vercel Web Analytics with two script lines just before `</head>` (`window.va` stub plus `/_vercel/insights/script.js`). Copy them into any new page, or its visits won't be counted.

To add a unit: create a folder (for example `calculus/`) with `index.html`, `app.js` and `learn.js` modelled on `vectors/`, add it to the `UNITS` list in `shared/core.js` and a card in the root `index.html`. The unit page's `<body>` needs `data-unit="calculus"`, and its scripts load in this order: `../shared/core.js`, `learn.js`, `app.js`, `../shared/learn-render.js`, `../shared/boot.js`. `tools/check-marks.js` finds any folder that has a `learn.js`.

## 6. Checks before every push

1. **Numbers**: every number in a new example or explanation is computed by a script, not by hand.
2. **Marks**: `node tools/check-marks.js` confirms every worked-example part awards exactly its stated marks.
3. **Syntax**: `node --check` on each unit's `app.js` and `learn.js`, e.g. `node --check vectors/app.js && node --check vectors/learn.js`.
4. **In the browser**: open the topic, then:
   - switch Casio ↔ TI and check both versions of every calculator line;
   - open the Formulas drawer with **F** and the Topics drawer by hovering at the left edge (or pressing **T**);
   - reveal each worked example step by step;
   - check the browser console shows no errors;
   - check the layout at phone width.

## 7. Keyboard shortcuts on the site

| Key | Action |
|---|---|
| **F** | Open or close the Formulas drawer (right) |
| **T** | Open or close the Topics drawer (left); hovering at the left edge also opens it |
| **Esc** | Close whichever drawer is open |
