/* Calculus: How-to-answer guides and worked examples for every topic.
   Same shape as the other units: a method panel and exam-style worked examples whose
   solutions reveal one step at a time. Every number was checked with sympy (each solution
   was differentiated back into its equation) and scipy. */
(function(){
"use strict";
const {K,G,M}=window.LAB;

const L={
limits:{
method:[
['Decide what is being asked','A limit, continuity at a join, differentiability at a join, or a derivative "from first principles".'],
['Limits: substitute first','If you get a number, that is the limit. If you get 0/0, factorise and cancel, rationalise, or use l\'Hôpital (HL).'],
['First principles: write the definition','f′(x) = lim<sub>h→0</sub> (f(x + h) − f(x)) ÷ h. Writing this line earns the M1.'],
['Expand, cancel, divide by h','The f(x) terms always cancel. Divide every remaining term by h before letting h → 0.'],
['Joins: two conditions','Continuous: the pieces agree at the join. Differentiable: also the gradients agree. Two unknowns need both.']
],
types:[
['"From first principles"','Definition of the derivative, never the power rule'],
['lim<sub>x→a</sub> of a fraction giving 0/0','Factorise (x − a) out of both, or rationalise'],
['Piecewise f with one unknown','Continuity: left piece = right piece at the join'],
['Piecewise f with two unknowns','Continuity + matching gradients'],
['"Explain why f is not differentiable at…"','Corner (gradients differ), gap, or vertical tangent']
],
marks:['M1 for the correct first-principles definition with f(x + h).','A1 for the expansion, A1 for cancelling h, A1 for the limit.','R1 for a reason when explaining continuity or differentiability, not just "yes" or "no".'],
ex:[
{tag:'Paper 1 · no calculator',title:'First principles for x³',stem:'Let f(x) = x³.',parts:[
{q:'Use the definition of the derivative to show that f′(x) = 3x².',m:4,s:['f′(x) = lim<sub>h→0</sub> ((x + h)³ − x³) ÷ h '+M('M1'),'(x + h)³ = x³ + 3x²h + 3xh² + h³ '+M('A1'),'so f′(x) = lim<sub>h→0</sub> (3x²h + 3xh² + h³) ÷ h = lim<sub>h→0</sub> (3x² + 3xh + h²) '+M('A1'),'= 3x² '+M('A1')]},
{q:'Hence find the equation of the tangent to y = f(x) at x = 2.',m:2,s:['Gradient f′(2) = 12, point (2, 8) '+M('M1'),'y − 8 = 12(x − 2), so <b>y = 12x − 16</b> '+M('A1')]}
],tip:'Dividing by h has to happen before h → 0. Setting h = 0 in (3x²h + 3xh² + h³) ÷ h gives 0/0, and the last two marks go with it.'},
{tag:'Paper 1 · no calculator',title:'Continuous and differentiable at a join',stem:'f(x) = x² + a for x ≤ 2, and f(x) = bx − 1 for x &gt; 2, where a and b are constants.',parts:[
{q:'Given that f is continuous at x = 2, express a in terms of b.',m:2,s:['Both pieces equal at x = 2: 4 + a = 2b − 1 '+M('M1'),'<b>a = 2b − 5</b> '+M('A1')]},
{q:'Given also that f is differentiable at x = 2, find a and b.',m:3,s:['Gradients match at x = 2: 2x = b at x = 2 '+M('M1'),'b = 4 '+M('A1'),'a = 2(4) − 5 = 3 '+M('A1')]},
{q:'Find f′(1) and f′(3).',m:2,s:['f′(1) = 2(1) = <b>2</b> '+M('A1'),'f′(3) = b = <b>4</b> '+M('A1')]}
],tip:'Matching gradients alone is not enough: a function can have matching slopes and a jump. Differentiability needs continuity first.'},
{tag:'Paper 1 · no calculator',title:'A limit, 1/x, and a corner',stem:'This question has three short parts.',parts:[
{q:'Find lim<sub>x→3</sub> (x² − 9) ÷ (x − 3).',m:2,s:['(x² − 9) ÷ (x − 3) = (x − 3)(x + 3) ÷ (x − 3) = x + 3 for x ≠ 3 '+M('M1'),'Limit = <b>6</b> '+M('A1')]},
{q:'Use first principles to show that the derivative of 1/x is −1/x².',m:4,s:['lim<sub>h→0</sub> (1/(x + h) − 1/x) ÷ h '+M('M1'),'= lim<sub>h→0</sub> (x − (x + h)) ÷ (hx(x + h)) '+M('A1'),'= lim<sub>h→0</sub> −1 ÷ (x(x + h)) '+M('A1'),'= −1/x² '+M('A1')]},
{q:'Explain why g(x) = |x − 1| is not differentiable at x = 1.',m:2,s:['For x &lt; 1 the gradient is −1; for x &gt; 1 it is 1 '+M('R1'),'The left and right derivatives differ (a corner), so g′(1) does not exist '+M('A1')]}
],tip:'A calculator\'s d/dx at x = 1 for |x − 1| returns 0, because it averages both sides. That number is not evidence of differentiability.'}
]},

lhop:{
method:[
['Substitute first','Only use l\'Hôpital when you get 0/0 or ∞/∞. Write "0/0 form" to show you checked.'],
['Differentiate top and bottom separately','Not the quotient rule. Top′ over bottom′.'],
['Substitute again','If you still get 0/0, apply the rule again, checking the form each time.'],
['Rewrite other forms','0 × ∞: write as a fraction, e.g. x ln x = ln x ÷ (1/x). 1^∞ or 0⁰: take ln first.'],
['State the limit','A number, or "does not exist" with a reason.']
],
types:[
['sin(px)/x, (eᵖˣ − 1)/x','One application'],
['(1 − cos x)/x², (eˣ − 1 − x)/x²','Two applications'],
['x ln x as x → 0⁺','Rewrite as ln x ÷ (1/x)'],
['xˣ, (1 + 1/x)ˣ','Take ln, find the limit, exponentiate'],
['"Hence" after a Maclaurin part','Series instead of the rule']
],
marks:['M1 for checking the form and applying the rule correctly.','A1 for each correct derivative pair.','A1 for the final limit. Using the quotient rule scores M0.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Two applications',stem:'Find lim<sub>x→0</sub> (1 − cos 2x) ÷ x².',parts:[
{q:'Find the limit.',m:4,s:['At x = 0: (1 − 1) ÷ 0 = 0/0 '+M('M1'),'Apply l\'Hôpital: 2 sin 2x ÷ 2x, still 0/0 '+M('A1'),'Apply again: 4 cos 2x ÷ 2 '+M('A1'),'At x = 0: 4 ÷ 2 = <b>2</b> '+M('A1')]}
],tip:'The check "still 0/0" must be written before the second application. Applying the rule to a non-0/0 fraction gives wrong answers.'},
{tag:'Paper 1 · no calculator',title:'Then use it',stem:'This question uses l\'Hôpital\'s rule and a substitution.',parts:[
{q:'Show that lim<sub>x→0</sub> (eˣ − 1 − x) ÷ x² = ½.',m:4,s:['At x = 0: (1 − 1 − 0) ÷ 0 = 0/0 '+M('M1'),'Differentiate: (eˣ − 1) ÷ 2x, still 0/0 '+M('A1'),'Differentiate: eˣ ÷ 2 '+M('A1'),'At x = 0: ½ '+M('A1')]},
{q:'Hence find lim<sub>x→0</sub> (e<sup>2x</sup> − 1 − 2x) ÷ x².',m:2,s:['Let u = 2x: (eᵘ − 1 − u) ÷ (u²/4) = 4 × (eᵘ − 1 − u) ÷ u² '+M('M1'),'→ 4 × ½ = <b>2</b> '+M('A1')]}
],tip:'"Hence" means reuse part (a). Rescaling the variable is much faster than applying the rule again from scratch.'},
{tag:'Paper 1 · no calculator',title:'0 × ∞ and 0⁰',stem:'This question is about the behaviour of x ln x and xˣ as x → 0⁺.',parts:[
{q:'Find lim<sub>x→0⁺</sub> x ln x.',m:4,s:['x ln x = ln x ÷ (1/x), which is of the form −∞/∞ '+M('M1'),'Apply l\'Hôpital: (1/x) ÷ (−1/x²) '+M('A1'),'= −x '+M('A1'),'→ <b>0</b> '+M('A1')]},
{q:'Hence find lim<sub>x→0⁺</sub> xˣ.',m:2,s:['xˣ = e<sup>x ln x</sup> '+M('M1'),'→ e⁰ = <b>1</b> '+M('A1')]}
],tip:'The rule only works on fractions. Writing x ln x as x ÷ (1/ln x) also works but gives a harder derivative; put the ln on top.'}
]},

diff:{
method:[
['Name the structure','Product (two factors), quotient (one over another), composite (a function inside a function), or a booklet standard.'],
['Write the pieces','u, v, u′, v′ for products and quotients; inner and outer for the chain rule.'],
['Apply the rule','(uv)′ = u′v + uv′. (u/v)′ = (u′v − uv′) ÷ v². Chain: outer′(inner) × inner′.'],
['Simplify by factorising','Take out common factors such as eˣ or (x² + 1). Stationary-point parts need the factorised form.'],
['Evaluate if asked','Substitute only after differentiating.']
],
types:[
['xⁿeᵏˣ, x sin x','Product rule'],
['(ax + b)/(cx + d), x/(x² + 1)','Quotient rule'],
['(3x + 1)⁵, ln(x² + 1), e^(sin x)','Chain rule'],
['Table of f, f′, g, g′ values','Chain/product/quotient with table lookups'],
['arcsin, arctan, aˣ, tan, sec (HL)','Booklet derivatives plus chain rule']
],
marks:['M1 for the correct rule with the right pieces.','A1 for each correctly differentiated piece.','A1 for a simplified or factorised answer when asked.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Product rule and stationary points',stem:'Let f(x) = x²e<sup>−x</sup>.',parts:[
{q:'Find f′(x), giving your answer in factorised form.',m:3,s:['u = x², v = e<sup>−x</sup>: f′(x) = 2xe<sup>−x</sup> + x²(−e<sup>−x</sup>) '+M('M1'),'= 2xe<sup>−x</sup> − x²e<sup>−x</sup> '+M('A1'),'= <b>x(2 − x)e<sup>−x</sup></b> '+M('A1')]},
{q:'Find the coordinates of the stationary points of the graph of f.',m:3,s:['e<sup>−x</sup> ≠ 0, so x(2 − x) = 0 ⇒ x = 0 or x = 2 '+M('M1'),'<b>(0, 0)</b> '+M('A1'),'<b>(2, 4e<sup>−2</sup>)</b> '+M('A1')]}
],tip:'Factorise e<sup>−x</sup> out before setting f′(x) = 0. Then say e<sup>−x</sup> ≠ 0: that one sentence is what justifies ignoring it.'},
{tag:'Paper 1 · no calculator',title:'Rules from a table',stem:'The table gives values of f, f′, g and g′.<div class="tablewrap"><table class="mini"><tr><th>x</th><th>1</th><th>2</th><th>3</th></tr><tr><th>f(x)</th><td>3</td><td>1</td><td>2</td></tr><tr><th>f′(x)</th><td>−1</td><td>4</td><td>5</td></tr><tr><th>g(x)</th><td>2</td><td>3</td><td>1</td></tr><tr><th>g′(x)</th><td>6</td><td>−2</td><td>0.5</td></tr></table></div>',parts:[
{q:'h(x) = f(g(x)). Find h′(1).',m:3,s:['h′(x) = f′(g(x)) × g′(x) '+M('M1'),'h′(1) = f′(g(1)) × g′(1) = f′(2) × 6 '+M('A1'),'= 4 × 6 = <b>24</b> '+M('A1')]},
{q:'k(x) = f(x)g(x). Find k′(2).',m:2,s:['k′(2) = f′(2)g(2) + f(2)g′(2) = 4 × 3 + 1 × (−2) '+M('M1'),'= <b>10</b> '+M('A1')]},
{q:'q(x) = f(x) ÷ g(x). Find q′(3).',m:2,s:['q′(3) = (f′(3)g(3) − f(3)g′(3)) ÷ g(3)² = (5 × 1 − 2 × 0.5) ÷ 1 '+M('M1'),'= <b>4</b> '+M('A1')]}
],tip:'In the chain rule, f′ is evaluated at g(1) = 2, not at 1. Reading f′(1) = −1 from the table is the slip this question is built to catch.'},
{tag:'Paper 1 · no calculator',title:'Booklet derivatives (HL)',stem:'Differentiate each function with respect to x.',parts:[
{q:'y = arcsin(2x)',m:2,s:['Booklet: d/dx arcsin u = 1/√(1 − u²), times du/dx = 2 '+M('M1'),'dy/dx = <b>2 ÷ √(1 − 4x²)</b> '+M('A1')]},
{q:'y = x × 2ˣ',m:3,s:['d/dx 2ˣ = 2ˣ ln 2 '+M('A1'),'Product rule: dy/dx = 2ˣ + x × 2ˣ ln 2 '+M('M1'),'= <b>2ˣ(1 + x ln 2)</b> '+M('A1')]},
{q:'y = tan³(2x)',m:3,s:['Outer: 3tan²(2x), times the derivative of tan(2x) '+M('M1'),'d/dx tan(2x) = 2sec²(2x) '+M('A1'),'dy/dx = <b>6tan²(2x)sec²(2x)</b> '+M('A1')]}
],tip:'tan³(2x) has three layers: cube, tan, 2x. Each layer contributes one factor. Missing the final 2 is the common slip.'}
]},

tangent:{
method:[
['Differentiate','Find f′(x).'],
['Gradient at the point','m = f′(a). If only y is given, find x first.'],
['Point on the curve','(a, f(a)). Use the original function, not f′.'],
['Write the line','Tangent: y − f(a) = m(x − a). Normal: gradient −1/m through the same point.'],
['Increasing or decreasing','Solve f′(x) &gt; 0 or f′(x) &lt; 0. Use the roots of f′ and a sign diagram.']
],
types:[
['"Tangent at the point where x = …"','m from f′, point from f'],
['"Normal to the curve"','Gradient −1/m'],
['"Line y = mx + c is a tangent"','Equate, then discriminant = 0'],
['"Gradient is …" or "parallel to …"','Solve f′(x) = given gradient'],
['"Find the values of x for which f is increasing"','Solve f′(x) &gt; 0']
],
marks:['M1 for finding f′ at the point, A1 for the gradient.','M1 for a line through the correct point, A1 for the equation.','For monotonicity: A1 for the roots of f′, A1 for the correct interval.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Tangent, normal and a triangle',stem:'Consider the curve y = x³ − 2x + 1.',parts:[
{q:'Find the gradient of the curve at x = 1.',m:2,s:['dy/dx = 3x² − 2 '+M('M1'),'At x = 1: <b>1</b> '+M('A1')]},
{q:'Find the equation of the tangent at x = 1.',m:2,s:['At x = 1, y = 0. Tangent: y − 0 = 1(x − 1) '+M('M1'),'<b>y = x − 1</b> '+M('A1')]},
{q:'Find the equation of the normal at x = 1.',m:2,s:['Normal gradient = −1 ÷ 1 = −1 '+M('M1'),'<b>y = −x + 1</b> '+M('A1')]},
{q:'Find the area of the triangle formed by the tangent, the normal and the y-axis.',m:2,s:['The tangent meets the y-axis at (0, −1), the normal at (0, 1); both pass through (1, 0) '+M('M1'),'Base 2 along the y-axis, height 1: area = ½ × 2 × 1 = <b>1</b> '+M('A1')]}
],tip:'The point on the curve comes from y = x³ − 2x + 1, not from dy/dx. Using y = 1 (the gradient) as the y-coordinate is a classic slip.'},
{tag:'Paper 1 · no calculator',title:'Tangent by discriminant',stem:'The line y = kx − 7 is a tangent to the curve y = x² − 3x + 2.',parts:[
{q:'Find the possible values of k.',m:5,s:['x² − 3x + 2 = kx − 7 '+M('M1'),'x² − (3 + k)x + 9 = 0 '+M('A1'),'Tangent ⇒ one repeated root ⇒ discriminant = 0 '+M('M1'),'(3 + k)² − 36 = 0 '+M('A1'),'3 + k = ±6, so <b>k = 3 or k = −9</b> '+M('A1')]},
{q:'For k = 3, find the point of contact.',m:2,s:['x² − 6x + 9 = 0 ⇒ (x − 3)² = 0 ⇒ x = 3 '+M('M1'),'y = 3(3) − 7 = 2: <b>(3, 2)</b> '+M('A1')]}
],tip:'A line meeting a parabola at exactly one point must be tangent (unless it is vertical). Discriminant = 0 is the condition.'},
{tag:'Paper 1 · no calculator',title:'Increasing, then a tangent',stem:'Let f(x) = xe<sup>−x</sup>.',parts:[
{q:'Show that f′(x) = (1 − x)e<sup>−x</sup>.',m:2,s:['Product rule: f′(x) = e<sup>−x</sup> + x(−e<sup>−x</sup>) '+M('M1'),'= (1 − x)e<sup>−x</sup> '+M('A1')]},
{q:'Find the set of values of x for which f is increasing.',m:2,s:['e<sup>−x</sup> &gt; 0, so f′(x) &gt; 0 ⇔ 1 − x &gt; 0 '+M('M1'),'<b>x &lt; 1</b> '+M('A1')]},
{q:'The tangent at x = 2 meets the x-axis at P. Find the x-coordinate of P.',m:3,s:['f(2) = 2e<sup>−2</sup>, f′(2) = −e<sup>−2</sup> '+M('M1'),'Tangent: y − 2e<sup>−2</sup> = −e<sup>−2</sup>(x − 2) '+M('A1'),'y = 0 ⇒ x − 2 = 2 ⇒ <b>x = 4</b> '+M('A1')]}
],tip:'Every term contains e<sup>−2</sup>, so it cancels. Converting to decimals early hides this and invites rounding errors.'}
]},

curve:{
method:[
['Find f′ and f″','Factorise f′ completely.'],
['Stationary points','Solve f′(x) = 0. Find each y-value from f.'],
['Nature','f″ &gt; 0 minimum, f″ &lt; 0 maximum. If f″ = 0, use the sign of f′ either side.'],
['Inflexion','f″(x) = 0 AND f″ changes sign. If f′ = 0 there too, it is a stationary inflexion.'],
['Concavity intervals','f″ &gt; 0 concave up, f″ &lt; 0 concave down.']
],
types:[
['"Find and classify the stationary points"','f′ = 0, then f″ or sign test'],
['f″ = 0 at a stationary point','Sign of f′ either side decides'],
['"Find the point of inflexion"','f″ = 0 with a sign change'],
['Given the graph of f′','Roots of f′ are stationary points of f; turning points of f′ are inflexions of f'],
['"Concave down for…"','Solve f″(x) &lt; 0']
],
marks:['M1 for f′ = 0, A1 for each x, A1 for each coordinate.','M1 for a valid nature test, A1 for each conclusion.','R1 for "f″ changes sign" at an inflexion. f″ = 0 alone scores nothing.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Full analysis of a cubic',stem:'Let f(x) = x³ − 3x² − 9x + 5.',parts:[
{q:'Find and classify the stationary points of the graph of f.',m:6,s:['f′(x) = 3x² − 6x − 9 = 3(x − 3)(x + 1) '+M('M1'),'x = −1 or x = 3 '+M('A1'),'f(−1) = 10: (−1, 10) '+M('A1'),'f(3) = −22: (3, −22) '+M('A1'),'f″(x) = 6x − 6. f″(−1) = −12 &lt; 0, so (−1, 10) is a <b>maximum</b> '+M('M1'),'f″(3) = 12 &gt; 0, so (3, −22) is a <b>minimum</b> '+M('A1')]},
{q:'Find the coordinates of the point of inflexion.',m:2,s:['f″(x) = 0 ⇒ x = 1, and f″ changes sign there (linear) '+M('M1'),'f(1) = −6: <b>(1, −6)</b> '+M('A1')]}
],tip:'The inflexion of a cubic is midway between its turning points: (−1 + 3) ÷ 2 = 1. A quick check on your answer.'},
{tag:'Paper 1 · no calculator',title:'A stationary inflexion',stem:'Let f(x) = x⁴ − 4x³.',parts:[
{q:'Find f′(x) and f″(x).',m:2,s:['f′(x) = 4x³ − 12x² '+M('A1'),'f″(x) = 12x² − 24x '+M('A1')]},
{q:'Find and classify the stationary points.',m:4,s:['f′(x) = 4x²(x − 3) = 0 ⇒ x = 0 or 3 '+M('M1'),'(0, 0) and (3, −27) '+M('A1'),'f″(0) = 0, so test f′ either side: f′ &lt; 0 on both sides of 0, so (0, 0) is a <b>stationary point of inflexion</b> '+M('R1'),'f″(3) = 36 &gt; 0: (3, −27) is a <b>minimum</b> '+M('A1')]},
{q:'Find the other point of inflexion.',m:2,s:['f″(x) = 12x(x − 2) = 0 ⇒ x = 2, with a sign change '+M('M1'),'<b>(2, −16)</b> '+M('A1')]}
],tip:'f″(0) = 0 does not make (0, 0) an inflexion by itself; x⁴ has f″(0) = 0 and a minimum. Here the sign test on f′ settles it.'},
{tag:'Paper 2 · calculator',title:'ln x ÷ x',stem:'Let f(x) = (ln x) ÷ x for x &gt; 0. You may use f″(x) = (2 ln x − 3) ÷ x³.',parts:[
{q:'Find the coordinates of the maximum point.',m:3,s:['f′(x) = (1 − ln x) ÷ x² = 0 '+M('M1'),'ln x = 1, x = e '+M('A1'),'<b>(e, 1/e)</b>, about (2.72, 0.368) '+M('A1')]},
{q:'Find the coordinates of the point of inflexion.',m:3,s:['f″(x) = 0 ⇒ 2 ln x − 3 = 0 '+M('M1'),'x = e<sup>3/2</sup> = 4.48 (3 s.f.) '+M('A1'),'y = 1.5e<sup>−1.5</sup> = 0.335: <b>(4.48, 0.335)</b> '+M('A1')]},
{q:'Find the set of values of x for which the graph is concave down.',m:2,s:['f″(x) &lt; 0 ⇔ 2 ln x − 3 &lt; 0 (x³ &gt; 0) '+M('M1'),'<b>0 &lt; x &lt; e<sup>3/2</sup></b> '+M('A1')]}
],tip:'x³ &gt; 0 for x &gt; 0, so the sign of f″ is the sign of the top alone. Say this; it is the reasoning examiners want.'}
]},

optim:{
method:[
['Draw and label','A sketch with variables on it. Name what you are maximising or minimising.'],
['Write a formula in two variables','Then use the constraint (fixed volume, perimeter, sum) to eliminate one.'],
['Differentiate and set to zero','Solve for the variable. Reject values outside the domain.'],
['Justify max or min','Second derivative sign, or the sign of the first derivative either side.'],
['Answer the question asked','The maximum value, the dimension, or both, with units.']
],
types:[
['Box from a sheet, cut squares of side x','V = x(L − 2x)(W − 2x)'],
['Can with fixed volume','Eliminate h: S = 2πr² + 2V/r'],
['Fence against a wall, fixed length','A = x(P − 2x)'],
['Shortest distance to a curve','Minimise D², not D'],
['Rectangle under a curve','A = 2x × f(x) by symmetry']
],
marks:['M1 for using the constraint to get one variable, A1 for the expression.','M1 for setting the derivative to zero, A1 for the value.','R1 for justifying maximum or minimum. A1 for the optimal value.'],
ex:[
{tag:'Paper 1 · no calculator',title:'The open box',stem:'Squares of side x cm are cut from each corner of a 12 cm by 12 cm sheet of card. The sides are folded up to form an open box.',parts:[
{q:'Show that the volume of the box is V = x(12 − 2x)².',m:2,s:['The base is (12 − 2x) by (12 − 2x) '+M('A1'),'The height is x, so V = x(12 − 2x)² '+M('A1')]},
{q:'Find the value of x that maximises V, justifying that it is a maximum.',m:4,s:['V′ = (12 − 2x)² − 4x(12 − 2x) = (12 − 2x)(12 − 6x) '+M('M1'),'V′ = 0 ⇒ x = 2 or x = 6 '+M('A1'),'x = 6 gives V = 0 (no box), so x = 2 '+M('A1'),'V′ &gt; 0 for x just below 2 and &lt; 0 just above, so a maximum '+M('R1')]},
{q:'Find the maximum volume.',m:1,s:['V = 2 × 8² = <b>128 cm³</b> '+M('A1')]}
],tip:'Factorising V′ by taking out (12 − 2x) is much faster than expanding to a cubic first.'},
{tag:'Paper 2 · calculator',title:'The cheapest can',stem:'A closed cylindrical can has volume 500 cm³, radius r cm and height h cm.',parts:[
{q:'Show that the surface area is S = 2πr² + 1000/r.',m:3,s:['πr²h = 500 ⇒ h = 500 ÷ (πr²) '+M('M1'),'S = 2πr² + 2πrh '+M('A1'),'= 2πr² + 2πr × 500/(πr²) = 2πr² + 1000/r '+M('A1')]},
{q:'Find the minimum surface area, justifying that it is a minimum.',m:4,s:['S′ = 4πr − 1000/r² '+M('M1'),'S′ = 0 ⇒ r³ = 250/π ⇒ r = 4.30 '+M('A1'),'S = 2π(4.301…)² + 1000/4.301… = <b>349 cm²</b> (3 s.f.) '+M('A1'),'S″ = 4π + 2000/r³ &gt; 0, so a minimum '+M('R1'),G('Graph Y1 = 2πX²+1000÷X, G-SOLVE → MIN: (4.301, 348.73)','Y1 = 2πX²+1000/X, CALC → 3:minimum: (4.301, 348.73)')]}
],tip:'Keep r = 4.30127… in the calculator for the next line. Using r = 4.3 gives 348.73 anyway here, but in other questions early rounding loses the A1.'},
{tag:'Paper 1 · no calculator',title:'Rectangle under a parabola',stem:'A rectangle has its base on the x-axis and its two upper vertices on the curve y = 12 − x², symmetric about the y-axis. One upper vertex is at (x, 12 − x²) with 0 &lt; x &lt; √12.',parts:[
{q:'Show that the area of the rectangle is A = 24x − 2x³.',m:2,s:['Width 2x, height 12 − x² '+M('A1'),'A = 2x(12 − x²) = 24x − 2x³ '+M('A1')]},
{q:'Find the maximum area.',m:4,s:['A′ = 24 − 6x² '+M('M1'),'A′ = 0 ⇒ x = 2 (x &gt; 0) '+M('A1'),'A″ = −12x = −24 &lt; 0, so a maximum '+M('R1'),'A = 4 × 8 = <b>32</b> '+M('A1')]}
],tip:'The width is 2x, not x. Using x gives A = 12x − x³, a maximum at the same x, but half the area.'}
]},

implicit:{
method:[
['Differentiate every term with respect to x','A y-term picks up dy/dx (chain rule). xy needs the product rule: y + x dy/dx.'],
['Collect dy/dx terms','Move them to one side, everything else to the other.'],
['Factor out dy/dx and divide','Give dy/dx in terms of x and y.'],
['Related rates: link with the chain rule','dV/dt = dV/dr × dr/dt. Write the formula before differentiating.'],
['Substitute the instant last','Use the given values only after differentiating.']
],
types:[
['Curve given as an equation in x and y','Implicit differentiation'],
['"Horizontal tangent"','dy/dx = 0: set the numerator to 0, then solve with the curve'],
['"Vertical tangent"','Denominator of dy/dx = 0'],
['Balloon, sphere, cube growing','Volume or area formula, then chain rule'],
['Ladder, shadow, cone filling','Pythagoras or similar triangles first, then d/dt']
],
marks:['M1 for implicit differentiation including the product rule on xy terms.','A1 for each correctly differentiated term, A1 for dy/dx.','For related rates: M1 for the chain-rule link, A1 for the substitution, A1 for the rate with units.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Tangents to x² + xy + y² = 7',stem:'A curve has equation x² + xy + y² = 7.',parts:[
{q:'Show that dy/dx = −(2x + y) ÷ (x + 2y).',m:3,s:['2x + (y + x dy/dx) + 2y dy/dx = 0 '+M('M1')+' '+M('A1'),'(x + 2y) dy/dx = −(2x + y), so dy/dx = −(2x + y) ÷ (x + 2y) '+M('A1')]},
{q:'Find the equation of the tangent at the point (1, 2).',m:3,s:['dy/dx = −(2 + 2) ÷ (1 + 4) '+M('M1'),'= −4/5 '+M('A1'),'y − 2 = −(4/5)(x − 1), so <b>4x + 5y = 14</b> '+M('A1')]},
{q:'Find the points where the tangent is horizontal.',m:3,s:['dy/dx = 0 ⇒ 2x + y = 0 ⇒ y = −2x '+M('M1'),'x² − 2x² + 4x² = 7 ⇒ 3x² = 7 ⇒ x = ±√(7/3) '+M('A1'),'<b>(√(7/3), −2√(7/3))</b> and <b>(−√(7/3), 2√(7/3))</b> '+M('A1')]}
],tip:'Horizontal tangent: set only the numerator to zero, then substitute back into the curve equation. Both conditions are needed.'},
{tag:'Paper 2 · calculator',title:'Filling a cone',stem:'An inverted cone has radius 4 cm and height 10 cm. Water flows in at 3 cm³ s⁻¹. When the depth is h cm, the volume is V cm³.',parts:[
{q:'Show that V = 4πh³ ÷ 75.',m:2,s:['Similar triangles: r/h = 4/10, so r = 2h/5 '+M('M1'),'V = (1/3)π(2h/5)²h = 4πh³/75 '+M('A1')]},
{q:'Find the rate at which the depth is increasing when h = 5.',m:3,s:['dV/dh = 4πh²/25, and dV/dt = dV/dh × dh/dt '+M('M1'),'3 = (4π × 25/25) dh/dt = 4π dh/dt '+M('A1'),'dh/dt = 3/(4π) = <b>0.239 cm s⁻¹</b> '+M('A1')]},
{q:'Find the rate at which the radius of the water surface is increasing at that moment.',m:2,s:['r = 2h/5 ⇒ dr/dt = (2/5) dh/dt '+M('M1'),'= <b>0.0955 cm s⁻¹</b> '+M('A1')]}
],tip:'Eliminate r with similar triangles before differentiating. Differentiating V = (1/3)πr²h with both r and h varying needs the product rule and is much messier.'},
{tag:'Paper 1 · no calculator',title:'The sliding ladder',stem:'A 5 m ladder leans against a vertical wall. The foot slides away from the wall at 0.5 m s⁻¹. At time t the foot is x m from the wall and the top is y m above the ground.',parts:[
{q:'Find the speed at which the top slides down when the foot is 3 m from the wall.',m:4,s:['x² + y² = 25 '+M('M1'),'2x dx/dt + 2y dy/dt = 0 '+M('A1'),'When x = 3, y = 4 '+M('A1'),'dy/dt = −(3 × 0.5) ÷ 4 = −0.375: sliding down at <b>0.375 m s⁻¹</b> '+M('A1')]},
{q:'θ is the angle between the ladder and the ground. Find dθ/dt at that moment.',m:3,s:['x = 5 cos θ ⇒ dx/dt = −5 sin θ dθ/dt '+M('M1'),'sin θ = 4/5: 0.5 = −4 dθ/dt '+M('A1'),'dθ/dt = <b>−0.125 rad s⁻¹</b> '+M('A1')]}
],tip:'The negative sign means y (or θ) is decreasing. If the question asks for a speed, give the positive value and say "down".'}
]},

integ:{
method:[
['Rewrite into powers','√x = x<sup>1/2</sup>, 1/x³ = x<sup>−3</sup>. Split fractions into separate terms.'],
['Integrate term by term','xⁿ → xⁿ⁺¹/(n + 1) (n ≠ −1), 1/x → ln|x|, eᵏˣ → eᵏˣ/k, sin kx → −cos kx/k.'],
['Look for a reverse chain rule','f′(x) × g(f(x)) integrates to G(f(x)). Adjust the constant by inspection.'],
['Add + c, or apply limits','Indefinite: + c and use any given point. Definite: upper minus lower, no c.'],
['Check by differentiating','The derivative of your answer must be the integrand.']
],
types:[
['"Given f′(x) and a point, find f(x)"','Integrate, + c, substitute'],
['x(x² + 1)ⁿ, sin x cos³ x, xe^(x²)','Reverse chain rule by inspection'],
['∫ from a to b','Upper minus lower; exact or GDC'],
['"Given ∫ from 0 to k … = A, find k"','Integrate with k, solve'],
['1/(ax + b)','(1/a) ln|ax + b|']
],
marks:['A1 for each correctly integrated term, A1 for + c (indefinite).','M1 for substituting a point to find c, or limits correctly.','A1 for the exact value when "exact" is asked.'],
ex:[
{tag:'Paper 1 · no calculator',title:'From f′ back to f',stem:'A curve y = f(x) has gradient f′(x) = 6x² − 4x + 1 and passes through (1, 5).',parts:[
{q:'Find f(x).',m:4,s:['f(x) = ∫ (6x² − 4x + 1) dx '+M('M1'),'= 2x³ − 2x² + x + c '+M('A1'),'5 = 2 − 2 + 1 + c '+M('M1'),'c = 4, so <b>f(x) = 2x³ − 2x² + x + 4</b> '+M('A1')]},
{q:'Find ∫ from 0 to 2 of f′(x) dx.',m:2,s:['= f(2) − f(0) = 14 − 4 '+M('M1'),'= <b>10</b> '+M('A1')]}
],tip:'∫ f′(x) dx from a to b is f(b) − f(a): you already have f, so there is nothing new to integrate.'},
{tag:'Paper 1 · no calculator',title:'Reverse chain rule',stem:'Find each integral.',parts:[
{q:'∫ xe<sup>x²</sup> dx',m:2,s:['d/dx e<sup>x²</sup> = 2xe<sup>x²</sup>, so adjust by ½ '+M('M1'),'<b>½e<sup>x²</sup> + c</b> '+M('A1')]},
{q:'∫ from 0 to π/2 of sin x cos³ x dx',m:3,s:['d/dx cos⁴ x = −4 cos³ x sin x, so ∫ sin x cos³ x dx = −¼cos⁴ x '+M('M1')+' '+M('A1'),'[−¼cos⁴ x] from 0 to π/2 = 0 − (−¼) = <b>¼</b> '+M('A1')]},
{q:'∫ 2x ÷ (x² + 1) dx',m:2,s:['The top is the derivative of the bottom '+M('M1'),'<b>ln(x² + 1) + c</b> '+M('A1')]}
],tip:'Guess the answer, differentiate it, and fix the constant. If the guess is off by more than a constant factor, the method doesn\'t apply.'},
{tag:'Paper 2 · calculator',title:'Exact value, then an unknown limit',stem:'This question has two parts.',parts:[
{q:'Find the exact value of ∫ from 1 to 4 of (√x + 1/√x) dx.',m:4,s:['= ∫ (x<sup>1/2</sup> + x<sup>−1/2</sup>) dx '+M('M1'),'= [(2/3)x<sup>3/2</sup> + 2x<sup>1/2</sup>] '+M('A1')+' '+M('A1'),'= (16/3 + 4) − (2/3 + 2) = <b>20/3</b> '+M('A1')]},
{q:'Given that ∫ from 0 to k of e<sup>2x</sup> dx = 12, find k.',m:3,s:['[e<sup>2x</sup>/2] from 0 to k = (e<sup>2k</sup> − 1)/2 '+M('M1'),'(e<sup>2k</sup> − 1)/2 = 12 ⇒ e<sup>2k</sup> = 25 '+M('A1'),'k = ½ ln 25 = ln 5 = <b>1.61</b> (3 s.f.) '+M('A1')]}
],tip:'The lower limit 0 gives e⁰ = 1, not 0. Dropping it turns 25 into 24 and the answer into ln √24.'}
]},

tech:{
method:[
['Pick the technique','Product of different types → by parts. f(g(x))g′(x) → substitution. Rational with factorised denominator → partial fractions. a² + x² or √(a² − x²) → arctan or arcsin.'],
['By parts: choose u by LIATE','Logs, Inverse trig, Algebraic, Trig, Exponential. u is the earlier one.'],
['Substitution: change everything','dx in terms of du, and the limits in terms of u.'],
['Partial fractions: cover-up','Put x = each root to find each numerator.'],
['Finish and check','Simplify logs, then differentiate your answer to check.']
],
types:[
['xeˣ, x sin x, x² cos x','By parts, u = the polynomial'],
['ln x, x ln x, arctan x','By parts, u = the ln or inverse trig'],
['eˣ sin x','By parts twice, then solve for I'],
['(px + q)/((x − a)(x − b))','Partial fractions, then ln'],
['"Use the substitution u = …"','du, new limits, integrate in u']
],
marks:['M1 for a valid choice of u and dv (or du), A1 for each correct part.','A1 for the integral after the technique is applied.','M1 for applying limits correctly (new limits in u for substitution), A1 for the value.'],
ex:[
{tag:'Paper 1 · no calculator',title:'By parts twice: eˣ sin x',stem:'Let I = ∫ eˣ sin x dx.',parts:[
{q:'Show that I = ½eˣ(sin x − cos x) + c.',m:5,s:['u = sin x, dv = eˣ dx: I = eˣ sin x − ∫ eˣ cos x dx '+M('M1')+' '+M('A1'),'Again with u = cos x: ∫ eˣ cos x dx = eˣ cos x + ∫ eˣ sin x dx = eˣ cos x + I '+M('M1'),'I = eˣ sin x − eˣ cos x − I '+M('A1'),'2I = eˣ(sin x − cos x), so I = ½eˣ(sin x − cos x) + c '+M('A1')]},
{q:'Hence find ∫ from 0 to π of eˣ sin x dx.',m:2,s:['½e<sup>π</sup>(0 − (−1)) − ½e⁰(0 − 1) '+M('M1'),'= ½(e<sup>π</sup> + 1) ≈ <b>12.1</b> '+M('A1')]}
],tip:'Keep the same type for u both times (sin then cos). Switching u to eˣ on the second step undoes the first and gives I = I.'},
{tag:'Paper 1 · no calculator',title:'Partial fractions',stem:'Let f(x) = (5x − 1) ÷ ((x + 1)(x − 2)).',parts:[
{q:'Express f(x) in partial fractions.',m:3,s:['5x − 1 = A(x − 2) + B(x + 1) '+M('M1'),'x = 2: 9 = 3B, so B = 3 '+M('A1'),'x = −1: −6 = −3A, so A = 2: <b>f(x) = 2/(x + 1) + 3/(x − 2)</b> '+M('A1')]},
{q:'Hence find ∫ from 3 to 5 of f(x) dx, giving your answer as a single logarithm.',m:3,s:['[2 ln|x + 1| + 3 ln|x − 2|] from 3 to 5 '+M('M1'),'= 2 ln(6/4) + 3 ln(3/1) '+M('A1'),'= ln(9/4) + ln 27 = <b>ln(243/4)</b> '+M('A1')]}
],tip:'Collect logs with the rules: 2 ln(3/2) = ln(9/4). Leaving two separate logs loses the last mark when "a single logarithm" is asked.'},
{tag:'Paper 1 · no calculator',title:'Substitution with new limits',stem:'Use the substitution u = 1 − x² to evaluate the integral below.',parts:[
{q:'Find ∫ from 0 to 1 of x³√(1 − x²) dx.',m:6,s:['du = −2x dx, so x dx = −½ du '+M('M1'),'x² = 1 − u, so the integrand x² √(1 − x²) × x dx becomes (1 − u)√u × (−½) du '+M('A1'),'Limits: x = 0 → u = 1, x = 1 → u = 0 '+M('A1'),'= ½ ∫ from 0 to 1 of (u<sup>1/2</sup> − u<sup>3/2</sup>) du '+M('A1'),'= ½[(2/3)u<sup>3/2</sup> − (2/5)u<sup>5/2</sup>] from 0 to 1 '+M('A1'),'= ½(2/3 − 2/5) = <b>2/15</b> '+M('A1')]}
],tip:'Split x³ as x² × x. The single x pairs with dx to make du; the x² becomes 1 − u.'}
]},

area:{
method:[
['Sketch','Mark where the curves meet each other and the axes. It shows which curve is on top.'],
['Find the limits','Solve f(x) = g(x), or f(x) = 0 for the area to the x-axis.'],
['Set up top − bottom','Area = ∫ (top − bottom) dx. With respect to y: ∫ (right − left) dy.'],
['Split at crossings','If the curves cross inside the interval, split and add absolute values.'],
['Evaluate','Exactly on Paper 1; on Paper 2, use the GDC with the modulus.']
],
types:[
['Region between a curve and a line','Intersect, then ∫ (top − bottom)'],
['Curve crossing the x-axis','Split at the roots, add |each part|'],
['"Area between the curve and the y-axis"','x as a function of y, ∫ x dy'],
['Two curves that cross twice','GDC intersections, then ∫ |f − g|'],
['"Show that the area is …"','Exact working, no GDC']
],
marks:['A1 for the intersection points (limits).','M1 for ∫ (top − bottom) with the right limits.','A1 for the antiderivative and A1 for the area. A negative "area" scores A0.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Between a parabola and a line',stem:'The curves y = x² and y = x + 2 enclose a region R.',parts:[
{q:'Find the x-coordinates of the points of intersection.',m:2,s:['x² = x + 2 ⇒ x² − x − 2 = 0 ⇒ (x − 2)(x + 1) = 0 '+M('M1'),'<b>x = −1 and x = 2</b> '+M('A1')]},
{q:'Find the area of R.',m:4,s:['Area = ∫ from −1 to 2 of (x + 2 − x²) dx '+M('M1'),'= [x²/2 + 2x − x³/3] '+M('A1'),'= (2 + 4 − 8/3) − (½ − 2 + ⅓) = 10/3 + 7/6 '+M('A1'),'= <b>9/2</b> '+M('A1')]}
],tip:'The line is above the parabola between the roots (test x = 0: 2 &gt; 0). Integrating x² − (x + 2) gives −9/2.'},
{tag:'Paper 1 · no calculator',title:'When the integral is zero',stem:'Consider y = x³ − 4x.',parts:[
{q:'Show that ∫ from −2 to 2 of (x³ − 4x) dx = 0 and explain what this means.',m:2,s:['[x⁴/4 − 2x²] from −2 to 2 = (4 − 8) − (4 − 8) = 0 '+M('A1'),'The region above the axis (−2 to 0) and the region below (0 to 2) have equal area and cancel '+M('R1')]},
{q:'Find the total area enclosed between the curve and the x-axis.',m:3,s:['∫ from 0 to 2 of (x³ − 4x) dx = [x⁴/4 − 2x²] from 0 to 2 = −4 '+M('M1')+' '+M('A1'),'By symmetry the other region is +4, so total area = <b>8</b> '+M('A1')]}
],tip:'An odd function integrated over a symmetric interval is always zero. Area is never zero for a non-trivial region.'},
{tag:'Paper 2 · calculator',title:'Two curves, GDC',stem:'The curves y = eˣ and y = 4 − x² meet at two points.',parts:[
{q:'Find the x-coordinates of the points of intersection.',m:2,s:[G('Graph Y1 = e^X, Y2 = 4−X², G-SOLVE → INTSECT twice','Y1 = e^(X), Y2 = 4−X², CALC → 5:intersect twice'),'x = <b>−1.96</b> '+M('A1'),'x = <b>1.06</b> (3 s.f.) '+M('A1')]},
{q:'Find the area of the region enclosed by the two curves.',m:3,s:['Area = ∫ from −1.9646… to 1.0580… of (4 − x² − eˣ) dx '+M('M1')+' '+M('A1'),G('∫(4−X²−e^X, A, B) with the stored intersections = 6.4277','fnInt(4−X²−e^(X), X, A, B) with the stored intersections = 6.4277'),'= <b>6.43</b> (3 s.f.) '+M('A1')]}
],tip:'Store the intersections in A and B (on the Casio, store from the G-SOLVE screen; on the TI, STO→). Typing −1.96 and 1.06 gives 6.42, which loses the final A1.'}
]},

volume:{
method:[
['Identify the axis','About the x-axis: discs of radius y, thickness dx. About the y-axis: radius x, thickness dy.'],
['Square the radius first','V = π ∫ y² dx or π ∫ x² dy. Square before integrating.'],
['Get the limits','x-limits for the x-axis; y-limits for the y-axis. Change them if needed.'],
['Washers for a gap','Region between two curves: V = π ∫ (R² − r²), outer radius R, inner r.'],
['Evaluate','Exact (multiples of π) on Paper 1, GDC on Paper 2.']
],
types:[
['Region under y = f(x), about the x-axis','π ∫ f(x)² dx'],
['About the y-axis','Make x the subject, π ∫ x² dy'],
['Region between two curves','Washer: π ∫ (R² − r²)'],
['sin²x or cos²x appears','Double-angle identity first'],
['No antiderivative available','GDC with π outside the integral']
],
marks:['M1 for π ∫ y² dx (or x² dy) with the correct limits.','A1 for the squared integrand, A1 for the antiderivative.','A1 for the volume. Missing π, or squaring after integrating, loses everything after the M1.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Same curve, two axes',stem:'The region R is bounded by y = 2√x, the x-axis and the line x = 4.',parts:[
{q:'Find the volume when R is rotated 2π about the x-axis.',m:3,s:['V = π ∫ from 0 to 4 of (2√x)² dx = π ∫ 4x dx '+M('M1')+' '+M('A1'),'= π[2x²] from 0 to 4 = <b>32π</b> '+M('A1')]},
{q:'The region bounded by y = 2√x, the y-axis and the line y = 4 is rotated 2π about the y-axis. Find the volume.',m:4,s:['x = y²/4 '+M('A1'),'V = π ∫ from 0 to 4 of x² dy '+M('M1'),'= π ∫ y⁴/16 dy = π[y⁵/80] from 0 to 4 '+M('A1'),'= 1024π/80 = <b>64π/5</b> '+M('A1')]}
],tip:'Part (b) is a different region from (a): it is to the left of the curve, against the y-axis. The limits are y-values, 0 to 4.'},
{tag:'Paper 1 · no calculator',title:'A washer',stem:'The region enclosed by y = x and y = x² is rotated 2π about the x-axis.',parts:[
{q:'Find the volume of the solid formed.',m:5,s:['They meet at x = 0 and x = 1; y = x is above '+M('A1'),'V = π ∫ from 0 to 1 of (x² − x⁴) dx '+M('M1')+' '+M('A1'),'= π(1/3 − 1/5) '+M('A1'),'= <b>2π/15</b> '+M('A1')]}
],tip:'Outer radius x, inner radius x²: R² − r² = x² − x⁴. Writing (x − x²)² instead gives π/30, which is wrong.'},
{tag:'Paper 2 · calculator',title:'Trig identity, then GDC',stem:'Two solids of revolution about the x-axis.',parts:[
{q:'Find the exact volume when the region under y = sin x for 0 ≤ x ≤ π is rotated 2π about the x-axis.',m:4,s:['sin² x = ½(1 − cos 2x) '+M('M1'),'V = (π/2) ∫ from 0 to π of (1 − cos 2x) dx '+M('A1'),'= (π/2)[x − ½ sin 2x] from 0 to π '+M('A1'),'= <b>π²/2</b> '+M('A1')]},
{q:'The region bounded by y = ln x, the x-axis and x = 3 is rotated 2π about the x-axis. Find the volume.',m:3,s:['ln x = 0 at x = 1, so V = π ∫ from 1 to 3 of (ln x)² dx '+M('M1')+' '+M('A1'),G('π × ∫((ln X)², 1, 3) = 3.2332','π × fnInt((ln(X))², X, 1, 3) = 3.2332'),'= <b>3.23</b> (3 s.f.) '+M('A1')]}
],tip:'The region starts where y = ln x meets the axis, x = 1, not at x = 0 where ln x is undefined.'}
]},

kinem:{
method:[
['Know the chain','s → differentiate → v → differentiate → a. Integrate to go back.'],
['Read the words','"At rest": v = 0. "Initially": t = 0. "Returns to its starting point": s = s(0).'],
['Displacement vs distance','Displacement = ∫ v dt. Distance = ∫ |v| dt: split where v = 0.'],
['Constants from conditions','Each integration adds a constant: use v(0), then s(0).'],
['Speeding up or slowing down','Speeding up if v and a have the same sign.']
],
types:[
['"Find when the particle is at rest"','Solve v(t) = 0'],
['"Find the total distance travelled"','∫ |v| dt, split at v = 0 (GDC: abs)'],
['"Find the displacement"','∫ v dt, signs kept'],
['Given a(t) and initial conditions','Integrate twice with constants'],
['"Maximum velocity"','a = 0, check it is a maximum']
],
marks:['M1 for differentiating or integrating in the right direction.','A1 for each correct expression, M1 for using initial conditions.','For distance: M1 for splitting (or |v|), A1 for each part, A1 for the total.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Rest, acceleration, distance',stem:'A particle moves in a straight line with velocity v = t² − 4t + 3 m s⁻¹ for 0 ≤ t ≤ 4.',parts:[
{q:'Find the times when the particle is at rest.',m:2,s:['(t − 1)(t − 3) = 0 '+M('M1'),'<b>t = 1 and t = 3</b> '+M('A1')]},
{q:'Find the acceleration when t = 2.',m:2,s:['a = 2t − 4 '+M('M1'),'a(2) = <b>0 m s⁻²</b> '+M('A1')]},
{q:'Find the displacement from t = 0 to t = 4.',m:2,s:['[t³/3 − 2t² + 3t] from 0 to 4 '+M('M1'),'= 64/3 − 32 + 12 = <b>4/3 m</b> '+M('A1')]},
{q:'Find the total distance travelled from t = 0 to t = 4.',m:3,s:['Split at t = 1 and t = 3 '+M('M1'),'Parts: 4/3, −4/3, 4/3 '+M('A1'),'Distance = 4/3 + 4/3 + 4/3 = <b>4 m</b> '+M('A1')]}
],tip:'Displacement 4/3 but distance 4: the particle goes forward, back, then forward again. The splits are at the rest times from part (a).'},
{tag:'Paper 2 · calculator',title:'Exponential velocity',stem:'A particle has velocity v = 10e<sup>−t/2</sup> − 4 m s⁻¹ for 0 ≤ t ≤ 5.',parts:[
{q:'Write down the initial velocity.',m:1,s:['v(0) = 10 − 4 = <b>6 m s⁻¹</b> '+M('A1')]},
{q:'Find the time at which the particle is at rest.',m:2,s:['10e<sup>−t/2</sup> = 4 ⇒ t = 2 ln 2.5 '+M('M1'),'= <b>1.83 s</b> (3 s.f.) '+M('A1')]},
{q:'Find the total distance travelled in the first 5 seconds.',m:3,s:['Distance = ∫ from 0 to 5 of |10e<sup>−t/2</sup> − 4| dt '+M('M1'),G('∫(Abs (10e^(−X÷2)−4), 0, 5) = 10.981','fnInt(abs(10e^(−X/2)−4), X, 0, 5) = 10.981')+' '+M('A1'),'= <b>11.0 m</b> (3 s.f.) '+M('A1')]},
{q:'Find the acceleration when t = 1.',m:2,s:['a = −5e<sup>−t/2</sup> '+M('M1'),'a(1) = <b>−3.03 m s⁻²</b> '+M('A1')]}
],tip:'Without the abs, the GDC gives the displacement, −1.64. A negative "distance" is an instant giveaway.'},
{tag:'Paper 1 · no calculator',title:'From acceleration',stem:'A particle has acceleration a = 6t − 4 m s⁻². When t = 0, v = 2 m s⁻¹ and s = 0.',parts:[
{q:'Find v in terms of t.',m:2,s:['v = 3t² − 4t + c, and v(0) = 2 ⇒ c = 2 '+M('M1'),'<b>v = 3t² − 4t + 2</b> '+M('A1')]},
{q:'Show that the particle is never at rest.',m:2,s:['Discriminant of 3t² − 4t + 2: 16 − 24 = −8 '+M('M1'),'Negative, so v = 0 has no solutions: never at rest '+M('R1')]},
{q:'Find s when t = 2.',m:2,s:['s = t³ − 2t² + 2t (s(0) = 0) '+M('M1'),'s(2) = 8 − 8 + 4 = <b>4 m</b> '+M('A1')]}
],tip:'Two integrations, two constants. Using v(0) = 2 for the constant in s, instead of s(0) = 0, is the usual slip.'}
]},

maclaurin:{
method:[
['Use a known series if you can','eˣ, sin x, cos x, ln(1 + x), (1 + x)ⁿ and arctan x are in the booklet. Substitute into them.'],
['Otherwise differentiate','f(0), f′(0), f″(0), … then f(x) = f(0) + f′(0)x + f″(0)x²/2! + …'],
['Products: multiply and collect','Only keep terms up to the power asked for.'],
['Limits: expand and cancel','Expand the top, cancel the lowest powers, divide, let x → 0.'],
['Approximations: substitute a small x','State how many terms. Integrate the series term by term for integrals.']
],
types:[
['"Find the first three non-zero terms"','Differentiate, or substitute into a booklet series'],
['e^(2x), sin(x²), ln(1 − x)','Substitute u = 2x, x², −x'],
['eˣ sin x, e^x ln(1 + x)','Multiply series and collect'],
['lim (… )/xⁿ as x → 0','Expand and cancel'],
['Estimate ∫ from 0 to a','Integrate the polynomial term by term']
],
marks:['M1 for differentiating (or substituting into a known series).','A1 for each correct derivative value or term.','A1 for the series in the form asked. Factorial slips usually cost one A1 each.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Building ln(1 + x)',stem:'Let f(x) = ln(1 + x).',parts:[
{q:'Find the first three non-zero terms of the Maclaurin series of f.',m:4,s:['f(0) = 0; f′(x) = 1/(1 + x), f″(x) = −1/(1 + x)², f‴(x) = 2/(1 + x)³ '+M('M1'),'f′(0) = 1, f″(0) = −1, f‴(0) = 2 '+M('A1'),'f(x) = 0 + x − x²/2! + 2x³/3! '+M('A1'),'= <b>x − x²/2 + x³/3</b> '+M('A1')]},
{q:'Hence estimate ln 1.1.',m:2,s:['x = 0.1: 0.1 − 0.005 + 0.000333… '+M('M1'),'= <b>0.09533</b> (true value 0.09531) '+M('A1')]}
],tip:'The 2 in f‴(0) and the 3! = 6 combine to 1/3. Forgetting the factorial gives 2x³, which is wildly wrong.'},
{tag:'Paper 1 · no calculator',title:'A product of series',stem:'This question is about the Maclaurin series of eˣ sin x.',parts:[
{q:'Find the Maclaurin series of eˣ sin x up to and including the x³ term.',m:4,s:['(1 + x + x²/2 + x³/6)(x − x³/6) '+M('M1'),'x term: x '+M('A1'),'x² term: x × x = x² '+M('A1'),'x³ term: x²/2 × x − x³/6 = x³/3. So <b>x + x² + x³/3</b> '+M('A1')]},
{q:'Hence find lim<sub>x→0</sub> (eˣ sin x − x − x²) ÷ x³.',m:2,s:['(x³/3 + higher powers) ÷ x³ = 1/3 + terms in x '+M('M1'),'→ <b>1/3</b> '+M('A1')]}
],tip:'Only pairs of powers adding to 3 contribute to x³: (x²/2)(x) and (1)(−x³/6). Listing pairs is faster than expanding everything.'},
{tag:'Paper 2 · calculator',title:'Approximating an integral',stem:'There is no elementary antiderivative of e<sup>−x²</sup>.',parts:[
{q:'Find the Maclaurin series of e<sup>−x²</sup> up to the x⁶ term.',m:2,s:['Substitute u = −x² into eᵘ = 1 + u + u²/2 + u³/6 '+M('M1'),'<b>1 − x² + x⁴/2 − x⁶/6</b> '+M('A1')]},
{q:'Hence estimate ∫ from 0 to 0.5 of e<sup>−x²</sup> dx.',m:3,s:['∫ (1 − x² + x⁴/2 − x⁶/6) dx = [x − x³/3 + x⁵/10 − x⁷/42] '+M('M1'),'At 0.5: 0.5 − 0.041667 + 0.003125 − 0.000186 '+M('A1'),'= <b>0.461272</b> '+M('A1')]},
{q:'Find the percentage error in this estimate.',m:2,s:[G('∫(e^(−X²), 0, 0.5) = 0.4612810','fnInt(e^(−X²), X, 0, .5) = 0.4612810')+' '+M('M1'),'|0.461272 − 0.461281| ÷ 0.461281 × 100 = <b>0.00188%</b> '+M('A1')]}
],tip:'Integrate the series term by term, not the original function. Each power goes up by one and is divided by its new power.'}
]},

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
Object.assign(window.LAB.TITLES,{limits:'limits, continuity and first principles',lhop:"l'Hôpital's rule",diff:'differentiation rules',tangent:'tangents, normals and monotonicity',curve:'stationary points and concavity',optim:'optimisation',implicit:'implicit differentiation and related rates',integ:'integration',tech:'integration techniques',area:'areas between curves',volume:'volumes of revolution',kinem:'kinematics',maclaurin:'Maclaurin series',euler:'modelling and Euler\'s method',sep:'separation of variables',homog:'homogeneous equations',ifac:'integrating factors'});
})();
