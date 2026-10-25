/* Calculus · Differential equations: How-to-answer guides and worked examples for every topic.
   Same shape as the other units: a method panel and exam-style worked examples whose
   solutions reveal one step at a time. Every number was checked with sympy (each solution
   was differentiated back into its equation) and scipy. */
(function(){
"use strict";
const {K,G,M}=window.LAB;

const L={
euler:{
method:[
['Translate the words','"The rate of change of y" is dy/dt. "Proportional to" means "= k ×". "Decreasing" or "falls" puts a minus sign in front.'],
['Find the constant from data','Substitute one known state, usually the starting value and its rate, and solve for k.'],
['Set up Euler','Write down f(x, y), h, x₀, y₀ and the number of steps: (x<sub>end</sub> − x₀) ÷ h.'],
['Step and tabulate',G(`Make a table of n, xₙ, yₙ and f(xₙ, yₙ). Each row: yₙ₊₁ = yₙ + h × f(xₙ, yₙ). On the calculator: ${K('MENU')} → Recursion, aₙ₊₁ = aₙ + h × f(x₀ + nh, aₙ).`,`Make a table of n, xₙ, yₙ and f(xₙ, yₙ). Each row: yₙ₊₁ = yₙ + h × f(xₙ, yₙ). On the calculator: SEQ mode, u(n) = u(n−1) + h × f(x₀ + (n−1)h, u(n−1)).`)],
['Judge the estimate','Differentiate the equation to get d²y/dx². Positive means concave up, so Euler underestimates. A smaller h gives a better estimate.']
],
types:[
['"The rate of … is proportional to …"','dy/dt = k × (that quantity)'],
['A room temperature, a limit or a "difference"','k × (difference), with the sign from the words'],
['"Use Euler\'s method with step length h"','Table of n, x, y, slope'],
['"Is your answer an over- or underestimate?"','Sign of d²y/dx² from the equation'],
['"How could the estimate be improved?"','Smaller h, more steps']
],
marks:['M1 for a correct Euler step using the slope at the old point.','A1 for the values in the table and for the final estimate.','R1 for over- or underestimate with a reason (concavity), not just the word.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Three Euler steps, then judge the estimate',stem:'Consider the differential equation dy/dx = x + y, given that y = 1 when x = 0.',parts:[
{q:'Use Euler\'s method with h = 0.1 to find an approximate value of y when x = 0.3.',m:4,s:['x₀ = 0, y₀ = 1 and f(x, y) = x + y. From 0 to 0.3 is three steps.','y₁ = 1 + 0.1(0 + 1) = 1.1 '+M('M1'),'y₂ = 1.1 + 0.1(0.1 + 1.1) = 1.22 '+M('A1'),'y₃ = 1.22 + 0.1(0.2 + 1.22) = 1.362 '+M('A1'),'So y(0.3) ≈ <b>1.362</b> '+M('A1')]},
{q:'Find an expression for d²y/dx² in terms of x and y.',m:2,s:['Differentiate both sides with respect to x: d²y/dx² = 1 + dy/dx '+M('M1'),'= <b>1 + x + y</b> '+M('A1')]},
{q:'Hence state, with a reason, whether your answer to part (a) is an underestimate or an overestimate.',m:2,s:['Along the steps x ≥ 0 and y ≥ 1, so d²y/dx² = 1 + x + y &gt; 0. The curve is concave up. '+M('R1'),'Each tangent lies below the curve, so 1.362 is an <b>underestimate</b>. '+M('A1')]}
],tip:'The true value is 2e<sup>0.3</sup> − 1.3 ≈ 1.400, so the estimate is indeed low. The common slip is using the slope at the new point on each step, which loses the M1 and everything after it.'},
{tag:'Paper 2 · calculator',title:'Newton\'s law of cooling',stem:'A cup of tea is made with water at 90°C and left in a room at 20°C. The temperature T °C of the tea falls at a rate proportional to the difference between T and the room temperature. Time t is measured in minutes.',parts:[
{q:'Write down a differential equation for T.',m:2,s:['The rate is proportional to the difference T − 20, so dT/dt = ±k(T − 20) '+M('M1'),'T falls, so <b>dT/dt = −k(T − 20)</b>, with k &gt; 0 '+M('A1')]},
{q:'Initially the tea is cooling at 3.5°C per minute. Find k.',m:2,s:['At t = 0, T = 90 and dT/dt = −3.5: −3.5 = −k(90 − 20) '+M('M1'),'k = 3.5 ÷ 70 = <b>0.05</b> '+M('A1')]},
{q:'Use Euler\'s method with a step of 2 minutes to estimate the temperature after 6 minutes.',m:3,s:['Tₙ₊₁ = Tₙ + 2 × (−0.05)(Tₙ − 20) = Tₙ − 0.1(Tₙ − 20) '+M('M1'),'T₁ = 90 − 0.1 × 70 = 83, T₂ = 83 − 0.1 × 63 = 76.7 '+M('A1'),'T₃ = 76.7 − 0.1 × 56.7 = <b>71.03°C</b> '+M('A1'),G('Recursion: aₙ₊₁ = aₙ − 0.1(aₙ − 20), a₀ = 90, End 3 → 71.03','SEQ: u(n) = u(n−1) − 0.1(u(n−1) − 20), u(nMin) = 90 → u(3) = 71.03')]},
{q:'The exact solution is T = 20 + 70e<sup>−0.05t</sup>. Find the percentage error in your estimate from part (c).',m:3,s:['Exact T(6) = 20 + 70e<sup>−0.3</sup> = 71.857… '+M('A1'),'Percentage error = |71.03 − 71.857| ÷ 71.857 × 100 '+M('M1'),'= <b>1.15%</b> (3 s.f.) '+M('A1')]}
],tip:'"Falls at 3.5°C per minute" means dT/dt = −3.5. Writing +3.5 gives a negative k, and every later mark then follows a model that heats the tea up.'},
{tag:'Paper 2 · calculator',title:'Euler with the calculator, and the effect of h',stem:'The function y = f(x) satisfies dy/dx = ln(x + y), with f(1) = 1.',parts:[
{q:'Use Euler\'s method with h = 0.2 to estimate f(2).',m:3,s:['Five steps, with xₙ = 1 + 0.2n: yₙ₊₁ = yₙ + 0.2 ln(xₙ + yₙ) '+M('M1'),G('Recursion: aₙ₊₁ = aₙ + 0.2ln(1 + 0.2n + aₙ), a₀ = 1, End 5','SEQ: u(n) = u(n−1) + 0.2ln(1 + 0.2(n−1) + u(n−1)), u(nMin) = 1'),'y values: 1.1386, 1.3085, 1.5078, 1.7346, 1.9871 '+M('A1'),'f(2) ≈ <b>1.99</b> (3 s.f.) '+M('A1')]},
{q:'Repeat part (a) with h = 0.1.',m:2,s:['Ten steps: the same recursion with 0.1 in place of 0.2 '+M('M1'),G('Recursion: aₙ₊₁ = aₙ + 0.1ln(1 + 0.1n + aₙ), a₀ = 1, End 10','SEQ: u(n) = u(n−1) + 0.1ln(1 + 0.1(n−1) + u(n−1)), u(nMin) = 1'),'f(2) ≈ <b>2.03</b> (3 s.f.) '+M('A1')]},
{q:'Show that d²y/dx² = (1 + dy/dx) ÷ (x + y).',m:2,s:['Differentiate ln(x + y) with respect to x using the chain rule '+M('M1'),'d²y/dx² = (1 + dy/dx) ÷ (x + y) '+M('A1')]},
{q:'Hence explain whether f(2) is more or less than your answer to part (b).',m:2,s:['For x ≥ 1 and y ≥ 1, x + y ≥ 2, so dy/dx = ln(x + y) &gt; 0. Then 1 + dy/dx &gt; 0 and x + y &gt; 0, so d²y/dx² &gt; 0: concave up. '+M('R1'),'Euler underestimates, so f(2) is <b>more than 2.03</b>. Halving h raised the estimate, which agrees. '+M('A1')]}
],tip:'In the recursion, x must be written through n, as 1 + 0.2n. Typing X uses whatever value is stored in X, and gives a table that looks reasonable but is wrong.'}
]},

sep:{
method:[
['Check that it separates','Write dy/dx = g(x) × h(y). Factorise first, and split exponentials: e<sup>x − y</sup> = eˣ × e<sup>−y</sup>.'],
['Separate','Write ∫ dy/h(y) = ∫ g(x) dx as its own line. This line earns the first M1.'],
['Integrate both sides, one + c','Use partial fractions or ln|…| where needed. Only one constant.'],
['Use the initial condition now','Substitute the given point as soon as c appears, before you rearrange.'],
['Rearrange and answer','Exponentiate with care: ln|y| = kx + c gives y = Ae<sup>kx</sup>, never e<sup>kx</sup> + c.']
],
types:[
['"Show that the general solution is…"','Separate, integrate, + c, rearrange to the given form'],
['"Given that y = … when x = …"','Substitute straight after integrating'],
['Growth or decay "proportional to"','y = Ae<sup>kt</sup>, then two data points give A and k'],
['Limited growth kP(N − P)','Partial fractions, then ln of a ratio'],
['"Find the time when…"','Solve the particular solution for t']
],
marks:['M1 for separating correctly, each side in its own variable.','A1 for each side integrated, and M1 for using the initial condition.','A1 for the final form asked for. A missing + c usually costs every later mark.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Splitting an exponential',stem:'Consider the differential equation dy/dx = e<sup>x − y</sup>, given that y = ln 2 when x = 0.',parts:[
{q:'Show that eʸ = eˣ + c, where c is a constant.',m:3,s:['e<sup>x − y</sup> = eˣ × e<sup>−y</sup>, so eʸ dy/dx = eˣ '+M('M1'),'∫ eʸ dy = ∫ eˣ dx '+M('M1'),'eʸ = eˣ + c '+M('A1')]},
{q:'Find y in terms of x.',m:3,s:['x = 0, y = ln 2: e<sup>ln 2</sup> = e⁰ + c '+M('M1'),'2 = 1 + c, so c = 1 '+M('A1'),'eʸ = eˣ + 1, so <b>y = ln(eˣ + 1)</b> '+M('A1')]},
{q:'Show that y &gt; x for all x.',m:2,s:['eˣ + 1 &gt; eˣ for every x, and ln is an increasing function '+M('R1'),'so ln(eˣ + 1) &gt; ln(eˣ) = x, that is, y &gt; x. '+M('A1')]}
],tip:'e<sup>x − y</sup> must be split into eˣ × e<sup>−y</sup> before separating. Integrating e<sup>x − y</sup> with respect to x while treating y as a constant scores nothing.'},
{tag:'Paper 1 · no calculator',title:'Limited growth with partial fractions',stem:'The number of fish P in a lake is modelled by dP/dt = 0.0005P(1000 − P), where t is in years. Initially there are 100 fish.',parts:[
{q:'Express 1 ÷ (P(1000 − P)) in partial fractions.',m:2,s:['1 ÷ (P(1000 − P)) = A/P + B/(1000 − P), so 1 = A(1000 − P) + BP '+M('M1'),'P = 0 gives A = 1/1000, P = 1000 gives B = 1/1000: <b>1/(1000P) + 1/(1000(1000 − P))</b> '+M('A1')]},
{q:'Hence show that P = 1000 ÷ (1 + 9e<sup>−0.5t</sup>).',m:6,s:['∫ dP ÷ (P(1000 − P)) = ∫ 0.0005 dt '+M('M1'),'(1/1000)(ln P − ln(1000 − P)) '+M('A1'),'= 0.0005t + c '+M('A1'),'Multiply by 1000: ln(P ÷ (1000 − P)) = 0.5t + C','t = 0, P = 100: C = ln(100/900) '+M('M1'),'C = −ln 9 '+M('A1'),'P ÷ (1000 − P) = e<sup>0.5t</sup> ÷ 9, so 9P = 1000e<sup>0.5t</sup> − Pe<sup>0.5t</sup> '+M('A1'),'P(9 + e<sup>0.5t</sup>) = 1000e<sup>0.5t</sup>, so P = 1000 ÷ (1 + 9e<sup>−0.5t</sup>)']},
{q:'Find the time when the population reaches 500.',m:2,s:['500 = 1000 ÷ (1 + 9e<sup>−0.5t</sup>) ⇒ 9e<sup>−0.5t</sup> = 1 '+M('M1'),'t = 2 ln 9 = <b>4.39 years</b> (3 s.f.) '+M('A1')]}
],tip:'The 1/1000 from the partial fractions is the step most often dropped. Without it the exponent comes out as 0.0005t instead of 0.5t.'},
{tag:'Paper 1 · no calculator',title:'Cooling with an exact constant',stem:'A cup of coffee at 90°C cools in a room at 20°C according to dT/dt = −k(T − 20), where t is in minutes. After 10 minutes its temperature is 55°C.',parts:[
{q:'Show that T = 20 + 70e<sup>−kt</sup>.',m:4,s:['∫ dT ÷ (T − 20) = −∫ k dt '+M('M1'),'ln|T − 20| = −kt + c '+M('A1'),'T − 20 = Ae<sup>−kt</sup> '+M('M1'),'t = 0, T = 90: A = 70, so T = 20 + 70e<sup>−kt</sup> '+M('A1')]},
{q:'Find the exact value of k.',m:3,s:['55 = 20 + 70e<sup>−10k</sup> '+M('M1'),'e<sup>−10k</sup> = 35/70 = ½ '+M('A1'),'<b>k = (ln 2) ÷ 10</b> '+M('A1')]},
{q:'Find how long the coffee takes to cool to 37.5°C.',m:3,s:['37.5 = 20 + 70e<sup>−kt</sup> '+M('M1'),'e<sup>−kt</sup> = 17.5/70 = ¼ '+M('A1'),'e<sup>−kt</sup> = (½)<sup>t/10</sup> = ¼, so t/10 = 2: <b>t = 20 minutes</b> '+M('A1')]}
],tip:'It is the temperature <em>difference</em> that halves every 10 minutes (70 → 35 → 17.5), not the temperature. That gives 20 minutes without any logs.'}
]},

homog:{
method:[
['Test for homogeneous','Divide the top and bottom by the highest power of x. Every term must turn into a function of y/x.'],
['Substitute','y = vx, so dy/dx = v + x dv/dx. Write this line: it carries an M1.'],
['Simplify to x dv/dx = F(v) − v','Subtract v from the right-hand side. It often cancels or combines.'],
['Separate and integrate','∫ dv ÷ (F(v) − v) = ln|x| + c. Look for the top being the derivative of the bottom.'],
['Back-substitute, then use the condition','Replace v by y/x, find c, and give the answer in x and y.']
],
types:[
['"Use the substitution y = vx"','Write dy/dx = v + x dv/dx straight away'],
['"Show that x dv/dx = …"','Substitute and simplify; the given form tells you where to stop'],
['Every term of degree 2: x², xy, y²','Divide by x² to get F(v)'],
['"Find y² in terms of x"','Leave the answer squared, as in y² = 2x³ − x²'],
['ln x in a denominator','State the asymptote where it equals 0']
],
marks:['M1 for dy/dx = v + x dv/dx.','A1 for the separated equation in v and x, and A1 for each integral.','M1 for substituting v = y/x back, A1 for the final answer in x and y.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Substitute, separate, state the domain',stem:'Consider dy/dx = (x² + y²) ÷ (xy) for x &gt; 0, y &gt; 0, given that y = 2 when x = 1.',parts:[
{q:'Use the substitution y = vx to show that x dv/dx = 1/v.',m:3,s:['dy/dx = (x² + v²x²) ÷ (x × vx) = (1 + v²) ÷ v '+M('M1'),'y = vx ⇒ dy/dx = v + x dv/dx '+M('M1'),'v + x dv/dx = v + 1/v, so x dv/dx = 1/v '+M('A1')]},
{q:'Hence find y² in terms of x.',m:4,s:['∫ v dv = ∫ dx/x '+M('M1'),'v²/2 = ln x + c '+M('A1'),'x = 1, v = 2: c = 2 '+M('A1'),'y²/x² = 2 ln x + 4, so <b>y² = x²(2 ln x + 4)</b> '+M('A1')]},
{q:'Find the set of values of x for which the solution is valid.',m:2,s:['y² &gt; 0 needs 2 ln x + 4 &gt; 0 '+M('M1'),'ln x &gt; −2, so <b>x &gt; e<sup>−2</sup></b> '+M('A1')]}
],tip:'v²/2 = ln x + 2 doubles to v² = 2 ln x + 4. Doubling the ln x but not the constant gives v² = 2 ln x + 2 and loses the last A1.'},
{tag:'Paper 1 · no calculator',title:'A solution with an asymptote',stem:'Consider dy/dx = (y² + xy) ÷ x² for x &gt; 0, given that y = 1 when x = 1.',parts:[
{q:'Use the substitution y = vx to show that x dv/dx = v².',m:2,s:['dy/dx = v² + v, and y = vx gives dy/dx = v + x dv/dx '+M('M1'),'v + x dv/dx = v² + v, so x dv/dx = v² '+M('A1')]},
{q:'Hence show that y = x ÷ (1 − ln x).',m:4,s:['∫ v<sup>−2</sup> dv = ∫ dx/x '+M('M1'),'−1/v = ln x + c '+M('A1'),'x = 1, v = 1: c = −1 '+M('A1'),'−x/y = ln x − 1, so y = x ÷ (1 − ln x) '+M('A1')]},
{q:'Write down the equation of the vertical asymptote of the graph of y.',m:1,s:['1 − ln x = 0 when x = e, so <b>x = e</b> '+M('A1')]}
],tip:'−1/v = ln x + c rearranges to v = −1 ÷ (ln x + c), not −1/ln x + c. Keep the bracket.'},
{tag:'Paper 2 · calculator',title:'Logs on both sides, then an area',stem:'Consider dy/dx = (3y² + x²) ÷ (2xy) for x &gt; 0, y &gt; 0, given that y = 1 when x = 1.',parts:[
{q:'Use the substitution y = vx to show that x dv/dx = (v² + 1) ÷ (2v).',m:3,s:['y = vx ⇒ dy/dx = v + x dv/dx '+M('M1'),'Divide top and bottom by x²: v + x dv/dx = (3v² + 1) ÷ (2v) '+M('A1'),'x dv/dx = (3v² + 1 − 2v²) ÷ (2v) = (v² + 1) ÷ (2v) '+M('A1')]},
{q:'Hence show that y² = 2x³ − x².',m:4,s:['∫ 2v ÷ (v² + 1) dv = ∫ dx/x '+M('M1'),'ln(v² + 1) = ln x + c '+M('A1'),'x = 1, v = 1: c = ln 2, so v² + 1 = 2x '+M('A1'),'y²/x² = 2x − 1, so y² = 2x³ − x² '+M('A1')]},
{q:'Find the area of the region bounded by the curve y = √(2x³ − x²), the x-axis and the line x = 2.',m:3,s:['The curve meets the x-axis where 2x³ − x² = 0, so x = ½ (x &gt; 0) '+M('A1'),'Area = ∫ from ½ to 2 of √(2x³ − x²) dx '+M('M1'),G('∫(√(2X^3−X²), 0.5, 2) = 2.42487…','fnInt(√(2X^3−X²), X, .5, 2) = 2.42487…'),'= <b>2.42</b> (3 s.f.) '+M('A1')]}
],tip:'The lower limit is where the curve starts, x = ½, not 0. For 0 &lt; x &lt; ½ the expression under the root is negative and the GDC returns an error.'}
]},

ifac:{
method:[
['Standard form','Divide so that dy/dx has coefficient 1. Then read off P(x) and Q(x), signs included.'],
['Integrating factor','I = e<sup>∫P dx</sup>. Simplify logs: e<sup>n ln x</sup> = xⁿ. No constant is needed.'],
['Multiply and recognise','Write d/dx(I y) = I Q as its own line. This is the line examiners look for.'],
['Integrate, + c','I y = ∫ I Q dx + c.'],
['Divide by I, then use the condition','Divide every term, including c. Then substitute the given point.']
],
types:[
['dy/dx + ky = …, with k a constant','I = e<sup>kx</sup>'],
['x dy/dx + ny = …','Divide by x: P = n/x, I = xⁿ'],
['cos x dy/dx + y sin x = …','Divide by cos x: P = tan x, I = sec x'],
['"Show that the general solution is…"','Stop at the given form, check by differentiating'],
['Follow-up: maximum, zero, value','Graph the particular solution on the GDC']
],
marks:['M1 for an attempt at e<sup>∫P dx</sup> with P from the standard form.','A1 for the integrating factor, M1 for d/dx(I y) = I Q, A1 for the integration.','M1 for using the condition, A1 for y in the form asked for.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Constant P',stem:'Consider the differential equation dy/dx + 2y = e<sup>−x</sup>, given that y = 3 when x = 0.',parts:[
{q:'Find the integrating factor.',m:2,s:['P = 2, so I = e<sup>∫2 dx</sup> '+M('M1'),'= <b>e<sup>2x</sup></b> '+M('A1')]},
{q:'Find the general solution.',m:3,s:['d/dx(ye<sup>2x</sup>) = e<sup>2x</sup> × e<sup>−x</sup> = eˣ '+M('M1'),'ye<sup>2x</sup> = eˣ + c '+M('A1'),'<b>y = e<sup>−x</sup> + ce<sup>−2x</sup></b> '+M('A1')]},
{q:'Find the particular solution.',m:2,s:['x = 0, y = 3: 3 = 1 + c '+M('M1'),'c = 2, so <b>y = e<sup>−x</sup> + 2e<sup>−2x</sup></b> '+M('A1')]}
],tip:'Dividing ye<sup>2x</sup> = eˣ + c by e<sup>2x</sup> divides the c too. Writing y = e<sup>−x</sup> + c loses the last three marks.'},
{tag:'Paper 1 · no calculator',title:'Divide first: P = 2/x',stem:'Consider x dy/dx + 2y = x² for x &gt; 0, given that y = 1 when x = 1.',parts:[
{q:'Show that the integrating factor is x².',m:2,s:['Standard form: dy/dx + (2/x)y = x '+M('M1'),'I = e<sup>∫2/x dx</sup> = e<sup>2 ln x</sup> = x² '+M('A1')]},
{q:'Find y in terms of x.',m:4,s:['d/dx(x²y) = x² × x = x³ '+M('M1'),'x²y = x⁴/4 + c '+M('A1'),'x = 1, y = 1: c = ¾ '+M('A1'),'<b>y = x²/4 + 3/(4x²)</b> '+M('A1')]},
{q:'Find the minimum value of y.',m:3,s:['dy/dx = x/2 − 3/(2x³) = 0 '+M('M1'),'x⁴ = 3, so x = 3<sup>1/4</sup> '+M('A1'),'y = √3/4 + 3/(4√3) = √3/4 + √3/4 = <b>√3/2</b> '+M('A1')]}
],tip:'P is 2/x, not 2. Reading P before dividing by x gives I = e<sup>2x</sup>, and nothing after that can be right.'},
{tag:'Paper 2 · calculator',title:'Trigonometric coefficients',stem:'Consider cos x dy/dx + y sin x = cos² x for 0 ≤ x &lt; π/2, given that y = 2 when x = 0.',parts:[
{q:'Show that the integrating factor is sec x.',m:3,s:['Divide by cos x: dy/dx + y tan x = cos x '+M('M1'),'I = e<sup>∫tan x dx</sup> = e<sup>−ln cos x</sup> '+M('A1'),'= 1 ÷ cos x = sec x '+M('A1')]},
{q:'Show that y = (x + 2) cos x.',m:3,s:['d/dx(y sec x) = sec x × cos x = 1 '+M('M1'),'y sec x = x + c '+M('A1'),'x = 0, y = 2: c = 2, so y = (x + 2) cos x '+M('A1')]},
{q:'Find the maximum value of y.',m:2,s:['Graph y = (x + 2) cos x for 0 ≤ x &lt; π/2 in radians and find the maximum '+M('M1'),G('Graph: Y1 = (X+2)cos X, Angle: Rad, G-SOLVE → MAX','Y1 = (X+2)cos(X), MODE RADIAN, CALC → 4:maximum'),'Maximum at x = 0.395: <b>y = 2.21</b> (3 s.f.) '+M('A1')]}
],tip:'∫ tan x dx = −ln cos x, so the integrating factor is e<sup>−ln cos x</sup> = sec x. Writing e<sup>ln cos x</sup> = cos x flips the sign, and the left side no longer collapses into one derivative.'}
]}
};
window.LAB.L=Object.assign(window.LAB.L,L);
Object.assign(window.LAB.TITLES,{euler:'modelling and Euler\'s method',sep:'separation of variables',homog:'homogeneous equations',ifac:'integrating factors'});
})();
