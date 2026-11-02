/* Number & algebra · Proof: How-to-answer guides and worked examples for every topic.
   Same shape as the other units: a method panel and exam-style worked examples whose
   solutions reveal one step at a time. Every number and every algebraic step was checked
   with sympy (expansions, factorisations, inductive steps, derivatives, factorisations of
   the counterexamples). "AG" means answer given: no mark for writing it, only for reaching it. */
(function(){
"use strict";
const {K,G,M}=window.LAB;
const AG='<span class="small">AG</span>';

const L={
cart:{
method:[
['Write everything as a + bi','Collect real parts and imaginary parts. i² = −1, i³ = −i, i⁴ = 1.'],
['Multiply by expanding','FOIL, then replace i² by −1.'],
['Divide by the conjugate','Multiply top and bottom by the conjugate of the denominator: (c + di)(c − di) = c² + d².'],
['Unknown z: let z = x + yi','Substitute, including z* = x − yi, then equate real parts and imaginary parts.'],
['Check on the Argand diagram','Real part across, imaginary part up. Adding is vector addition; z* is a reflection.']
],
types:[
['"Express in the form a + bi"','Expand, or multiply by the conjugate'],
['An equation containing z and z*','z = x + yi, equate real and imaginary parts'],
['"Find the square roots of a + bi"','(x + yi)² = a + bi, quadratic in x²'],
['"Find real a and b such that…"','Equate real and imaginary parts'],
['Powers of i','Remainder of the power ÷ 4']
],
marks:['M1 for multiplying by the conjugate, or for substituting z = x + yi.','A1 for each correct part (real and imaginary).','M1 for equating real and imaginary parts, A1 for each value.'],
ex:[
{tag:'Paper 1 · no calculator',title:'The four operations',stem:'Let z = 3 − 2i and w = 1 + 4i.',parts:[
{q:'Find z + w*.',m:2,s:['w* = 1 − 4i '+M('A1'),'z + w* = <b>4 − 6i</b> '+M('A1')]},
{q:'Find zw.',m:2,s:['(3 − 2i)(1 + 4i) = 3 + 12i − 2i − 8i² '+M('M1'),'= 3 + 10i + 8 = <b>11 + 10i</b> '+M('A1')]},
{q:'Find z ÷ w in the form a + bi.',m:3,s:['Multiply top and bottom by w* = 1 − 4i '+M('M1'),'Top: (3 − 2i)(1 − 4i) = 3 − 12i − 2i + 8i² = −5 − 14i. Bottom: 1 + 16 = 17 '+M('A1'),'<b>−5/17 − (14/17)i</b> '+M('A1')]}
],tip:'The bottom becomes c² + d², always positive. If you get a negative denominator, a sign was lost in (c + di)(c − di).'},
{tag:'Paper 1 · no calculator',title:'Square roots of a complex number',stem:'Find the square roots of −5 + 12i.',parts:[
{q:'Find both square roots, in the form x + yi.',m:5,s:['Let (x + yi)² = −5 + 12i: x² − y² + 2xyi = −5 + 12i '+M('M1'),'x² − y² = −5 and xy = 6 '+M('A1'),'y = 6/x gives x² − 36/x² = −5, so x⁴ + 5x² − 36 = 0 '+M('M1'),'(x² + 9)(x² − 4) = 0, and x is real, so x² = 4 '+M('A1'),'x = 2, y = 3 or x = −2, y = −3: <b>±(2 + 3i)</b> '+M('A1')]}
],tip:'x² = −9 is rejected because x is real. Keep that root and you get "x = 3i", which is not allowed.'},
{tag:'Paper 1 · no calculator',title:'An equation with z and z*',stem:'Find the complex number z such that 2z + iz* = 7 + 8i.',parts:[
{q:'Find z in the form x + yi.',m:5,s:['Let z = x + yi, z* = x − yi '+M('M1'),'2x + 2yi + i(x − yi) = 2x + y + (x + 2y)i '+M('A1'),'Equate parts: 2x + y = 7 and x + 2y = 8 '+M('M1')+' '+M('A1'),'x = 2, y = 3: <b>z = 2 + 3i</b> '+M('A1')]},
{q:'Find |z − 1|.',m:2,s:['z − 1 = 1 + 3i '+M('M1'),'|1 + 3i| = <b>√10</b> '+M('A1')]}
],tip:'i × (−yi) = −yi² = +y. That sign is what makes the real equation 2x + y, not 2x − y.'}
]},

polar:{
method:[
['Sketch the point','Its quadrant fixes the argument. Never trust arctan(b/a) alone.'],
['Modulus','r = |z| = √(a² + b²).'],
['Argument','Reference angle arctan(|b/a|), then adjust for the quadrant. Principal value: −π &lt; θ ≤ π.'],
['Multiply or divide in polar','Moduli multiply (divide); arguments add (subtract).'],
['Convert back if asked','a = r cos θ, b = r sin θ. Euler: re<sup>iθ</sup> = r cis θ.']
],
types:[
['"Find the modulus and argument"','Pythagoras, then the quadrant'],
['"Express in the form re^(iθ)"','Same as polar, written with Euler'],
['zw or z/w in polar form','Multiply moduli, add arguments'],
['"Write in the form a + bi"','r cos θ + i r sin θ'],
['Rotation by θ about O','Multiply by cis θ (by i for π/2)']
],
marks:['A1 for the modulus, A1 for the argument (in the right quadrant).','M1 for multiplying moduli and adding arguments.','A1 for the principal argument. Degrees, or an angle outside (−π, π], usually loses it.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Multiply and divide in polar form',stem:'Let z = 1 + √3 i and w = −1 + i.',parts:[
{q:'Find the modulus and argument of z and of w.',m:4,s:['|z| = √(1 + 3) = 2 '+M('A1'),'arg z = π/3 (first quadrant) '+M('A1'),'|w| = √2 '+M('A1'),'arg w = 3π/4 (second quadrant) '+M('A1')]},
{q:'Find zw in the form r cis θ, −π &lt; θ ≤ π.',m:2,s:['|zw| = 2√2, arg = π/3 + 3π/4 = 13π/12 '+M('M1'),'Principal: 13π/12 − 2π = −11π/12, so <b>zw = 2√2 cis(−11π/12)</b> '+M('A1')]},
{q:'Find z ÷ w in the form r cis θ.',m:2,s:['|z/w| = 2/√2 = √2, arg = π/3 − 3π/4 '+M('M1'),'<b>√2 cis(−5π/12)</b> '+M('A1')]}
],tip:'arctan(1/−1) = −π/4 on the calculator, but w is in the second quadrant: π − π/4 = 3π/4.'},
{tag:'Paper 1 · no calculator',title:'Euler form both ways',stem:'This question uses the form re<sup>iθ</sup>.',parts:[
{q:'Express z = −2 − 2i in the form re<sup>iθ</sup>, −π &lt; θ ≤ π.',m:3,s:['r = √(4 + 4) = 2√2 '+M('A1'),'Third quadrant: θ = −(π − π/4) '+M('M1'),'<b>z = 2√2 e<sup>−3πi/4</sup></b> '+M('A1')]},
{q:'Express w = 3e<sup>iπ/6</sup> in the form a + bi.',m:2,s:['3(cos π/6 + i sin π/6) '+M('M1'),'<b>3√3/2 + (3/2)i</b> '+M('A1')]},
{q:'Show that e<sup>iθ</sup> + e<sup>−iθ</sup> = 2cos θ.',m:2,s:['(cos θ + i sin θ) + (cos(−θ) + i sin(−θ)) = (cos θ + i sin θ) + (cos θ − i sin θ) '+M('M1'),'= 2cos θ '+M('A1')]}
],tip:'cos is even and sin is odd: cos(−θ) = cos θ and sin(−θ) = −sin θ. That is the whole of part (c).'},
{tag:'Paper 2 · calculator',title:'Moduli, arguments, rotation',stem:'Let z = 3 + 4i and w = 2 − i.',parts:[
{q:'Find |zw|.',m:2,s:['|zw| = |z||w| = 5 × √5 '+M('M1'),'= <b>11.2</b> (3 s.f.) '+M('A1')]},
{q:'Find arg(z ÷ w).',m:2,s:['arg z − arg w = 0.92730 − (−0.46365) '+M('M1'),G('Run-Matrix: Arg((3+4i)÷(2−i)) = 1.3909','MATH → CMPLX → angle((3+4i)/(2−i)) = 1.390943'),'= <b>1.39</b> (3 s.f.) '+M('A1')]},
{q:'The point representing z is rotated π/2 anticlockwise about O. Find the complex number of its image.',m:2,s:['Rotation by π/2 is multiplication by i '+M('M1'),'i(3 + 4i) = <b>−4 + 3i</b> '+M('A1')]}
],tip:'Set the calculator to radians. In degrees, Arg returns 79.7 and the A1 is lost.'}
]},

polyroots:{
method:[
['Use the conjugate pair','Real coefficients: if p + qi is a root, so is p − qi.'],
['Build the quadratic factor','(z − α)(z − α*) = z² − 2pz + (p² + q²).'],
['Find the remaining factor','Divide, or compare coefficients.'],
['Or use sums and products','Sum = −aₙ₋₁/aₙ, product = (−1)ⁿa₀/aₙ.'],
['List all roots','State every root, including the real ones.']
],
types:[
['"Given that 1 + 2i is a root…"','Conjugate is a root; quadratic factor'],
['"Find the other roots"','Divide by the quadratic factor'],
['Unknown coefficients a, b','Sum and product of roots, or substitute the root'],
['"Sum of the roots", "product of the roots"','Vieta from the coefficients'],
['α² + β² + γ²','(sum)² − 2(sum of pairs)']
],
marks:['A1 for stating the conjugate root, with the reason (real coefficients).','M1 for forming the quadratic factor, A1 for it.','M1 for the remaining factor or real root, A1 for each final root.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Factorise a cubic',stem:'f(z) = z³ − 4z² + 9z − 10. Given that 1 + 2i is a root of f(z) = 0:',parts:[
{q:'Write down another complex root.',m:1,s:['f has real coefficients, so <b>1 − 2i</b> is a root '+M('A1')]},
{q:'Find a real quadratic factor of f(z).',m:2,s:['(z − 1 − 2i)(z − 1 + 2i) = (z − 1)² − (2i)² '+M('M1'),'= <b>z² − 2z + 5</b> '+M('A1')]},
{q:'Find the real root.',m:2,s:['f(z) = (z² − 2z + 5)(z − 2), comparing constant terms: 5 × (−2) = −10 '+M('M1'),'<b>z = 2</b> '+M('A1')]}
],tip:'(z − 1)² − (2i)² = (z − 1)² + 4. The minus becomes a plus because i² = −1.'},
{tag:'Paper 1 · no calculator',title:'A quartic with an imaginary root',stem:'g(z) = z⁴ − 2z³ + 6z² − 2z + 5. One root of g(z) = 0 is i.',parts:[
{q:'Explain why −i is also a root.',m:1,s:['g has real coefficients, so non-real roots come in conjugate pairs '+M('R1')]},
{q:'Find all the roots.',m:4,s:['(z − i)(z + i) = z² + 1 is a factor '+M('M1')+' '+M('A1'),'g(z) = (z² + 1)(z² − 2z + 5) '+M('A1'),'Roots: <b>±i and 1 ± 2i</b> '+M('A1')]},
{q:'Verify the sum and the product of the roots from the coefficients.',m:2,s:['Sum = −(−2)/1 = 2 = i − i + 2 '+M('A1'),'Product = 5/1 = 5 = (1)(5) '+M('A1')]}
],tip:'Comparing coefficients is faster than long division: the z³ coefficient −2 and constant 5 fix the second factor at once.'},
{tag:'Paper 1 · no calculator',title:'Unknown coefficients',stem:'z³ + az² + bz + 20 = 0, where a and b are real, has a root 2 + i.',parts:[
{q:'Find the real root.',m:3,s:['Product of roots = −20 '+M('M1'),'(2 + i)(2 − i) = 5 '+M('A1'),'5r = −20, so <b>r = −4</b> '+M('A1')]},
{q:'Find a and b.',m:3,s:['Sum of roots = (2 + i) + (2 − i) − 4 = 0 = −a '+M('M1'),'<b>a = 0</b> '+M('A1'),'b = sum of pairs = 5 + (−4)(2 + i) + (−4)(2 − i) = 5 − 16, <b>b = −11</b> '+M('A1')]}
],tip:'Vieta avoids expanding (2 + i)³. If you substitute instead, (2 + i)³ = 2 + 11i, which is easy to get wrong.'}
]},

demoivre:{
method:[
['Convert to polar first','r cis θ, with θ in radians.'],
['Apply De Moivre','(r cis θ)ⁿ = rⁿ cis nθ. Valid for any integer n, including negative.'],
['Reduce the argument','Add or subtract multiples of 2π.'],
['Convert back if needed','rⁿ cos nθ + i rⁿ sin nθ.'],
['Identities: expand and compare','Expand (cos θ + i sin θ)ⁿ with the binomial theorem; real part = cos nθ, imaginary part = sin nθ.']
],
types:[
['(1 + i)⁸, (√3 − i)⁶','Polar, De Moivre, back to Cartesian'],
['"Smallest n such that zⁿ is real"','nθ = kπ'],
['"Show that cos 3θ = …"','Expand (c + is)³, real part'],
['zⁿ + z⁻ⁿ = 2cos nθ','Express cosⁿθ in multiple angles'],
['Hence integrate cos⁴θ','Use the multiple-angle form']
],
marks:['M1 for converting to polar, A1 for r and θ.','M1 for applying De Moivre, A1 for the result.','For identities: M1 binomial expansion, A1 for equating real (or imaginary) parts, A1 for the identity.'],
ex:[
{tag:'Paper 1 · no calculator',title:'A sixth power',stem:'Let z = 1 − √3 i.',parts:[
{q:'Write z in the form r cis θ, −π &lt; θ ≤ π.',m:2,s:['r = 2 '+M('A1'),'θ = −π/3 (fourth quadrant): <b>z = 2 cis(−π/3)</b> '+M('A1')]},
{q:'Find z⁶.',m:2,s:['z⁶ = 2⁶ cis(−2π) '+M('M1'),'= <b>64</b> '+M('A1')]},
{q:'Find the smallest positive integer n for which zⁿ is real.',m:2,s:['zⁿ = 2ⁿ cis(−nπ/3) is real when nπ/3 is a multiple of π '+M('M1'),'<b>n = 3</b> (z³ = −8) '+M('A1')]}
],tip:'"Real" includes negative real numbers. z³ = −8 counts, so the answer is 3, not 6.'},
{tag:'Paper 1 · no calculator',title:'Multiple-angle identity',stem:'This question proves and uses a triple-angle identity.',parts:[
{q:'Use De Moivre\'s theorem to show that cos 3θ = 4cos³θ − 3cos θ.',m:5,s:['(cos θ + i sin θ)³ = cos 3θ + i sin 3θ '+M('M1'),'Expand with c = cos θ, s = sin θ: c³ + 3c²(is) + 3c(is)² + (is)³ '+M('A1'),'Real part: cos 3θ = c³ − 3cs² '+M('A1'),'s² = 1 − c² '+M('M1'),'cos 3θ = c³ − 3c + 3c³ = 4c³ − 3c '+M('A1')]},
{q:'Hence solve 8x³ − 6x − 1 = 0.',m:3,s:['Let x = cos θ: 2(4cos³θ − 3cos θ) = 1, so cos 3θ = ½ '+M('M1'),'3θ = π/3, 5π/3, 7π/3 '+M('A1'),'<b>x = cos(π/9), cos(5π/9), cos(7π/9)</b> '+M('A1')]}
],tip:'A cubic has three roots, so take three values of 3θ before the cosines start repeating.'},
{tag:'Paper 1 · no calculator',title:'Powers of cos from z + 1/z',stem:'Let z = cis θ.',parts:[
{q:'Show that zⁿ + z⁻ⁿ = 2cos nθ.',m:2,s:['zⁿ = cis nθ and z⁻ⁿ = cis(−nθ) = cos nθ − i sin nθ '+M('M1'),'Adding: 2cos nθ '+M('A1')]},
{q:'By expanding (z + z⁻¹)⁴, show that cos⁴θ = ⅛(cos 4θ + 4cos 2θ + 3).',m:4,s:['(z + z⁻¹)⁴ = z⁴ + 4z² + 6 + 4z⁻² + z⁻⁴ '+M('M1')+' '+M('A1'),'= 2cos 4θ + 8cos 2θ + 6 '+M('A1'),'(2cos θ)⁴ = 16cos⁴θ, so cos⁴θ = ⅛(cos 4θ + 4cos 2θ + 3) '+M('A1')]},
{q:'Hence find ∫ from 0 to π/2 of cos⁴θ dθ.',m:2,s:['⅛[¼sin 4θ + 2sin 2θ + 3θ] from 0 to π/2 '+M('M1'),'= ⅛ × 3π/2 = <b>3π/16</b> '+M('A1')]}
],tip:'Pair the terms symmetrically: z⁴ with z⁻⁴, z² with z⁻². Each pair is 2cos(something).'}
]},

croots:{
method:[
['Write w in polar with + 2kπ','w = R cis(θ + 2kπ). The 2kπ is what produces n different roots.'],
['Take the nth root','z = R<sup>1/n</sup> cis((θ + 2kπ)/n).'],
['List k = 0, 1, …, n − 1','Exactly n roots. Adjust arguments into (−π, π] if asked.'],
['Convert if asked','Cartesian form with exact values.'],
['Use the geometry','The roots are the vertices of a regular n-gon centred at O, spacing 2π/n. Their sum is 0.']
],
types:[
['"Solve z³ = 8i"','Polar form, + 2kπ, divide by n'],
['Roots of unity, ω','1 + ω + … + ωⁿ⁻¹ = 0, ωⁿ = 1'],
['"Show that the roots form…"','Equal moduli, arguments 2π/n apart'],
['Area of the polygon','n × ½r² sin(2π/n)'],
['(z + 1)ⁿ = zⁿ type','Divide and set ((z + 1)/z)ⁿ = 1']
],
marks:['A1 for w in polar form, M1 for the general root with 2kπ.','A1 for all n roots (in the form asked).','For roots of unity: M1 for using the geometric series or ωⁿ = 1, A1 for the result.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Cube roots of 8i',stem:'Solve z³ = 8i.',parts:[
{q:'Find the roots in the form r cis θ, then in the form a + bi.',m:5,s:['8i = 8 cis(π/2) '+M('A1'),'z = 2 cis((π/2 + 2kπ)/3), k = 0, 1, 2 '+M('M1'),'2 cis(π/6), 2 cis(5π/6), 2 cis(3π/2) '+M('A1'),'= <b>√3 + i</b> and <b>−√3 + i</b> '+M('A1'),'and <b>−2i</b> '+M('A1')]}
],tip:'Adding 2kπ before dividing by 3 is what creates three different roots. Dividing first and adding 2kπ after gives only one.'},
{tag:'Paper 1 · no calculator',title:'Cube roots of unity',stem:'Let ω = cis(2π/3).',parts:[
{q:'Show that 1 + ω + ω² = 0.',m:2,s:['Geometric series: 1 + ω + ω² = (ω³ − 1) ÷ (ω − 1) '+M('M1'),'ω³ = cis 2π = 1, and ω ≠ 1, so the sum is 0 '+M('A1')]},
{q:'Simplify (1 + ω)(1 + ω²).',m:2,s:['= 1 + ω + ω² + ω³ '+M('M1'),'= 0 + 1 = <b>1</b> '+M('A1')]},
{q:'Simplify (1 + ω²)⁵.',m:2,s:['1 + ω² = −ω, so (1 + ω²)⁵ = −ω⁵ '+M('M1'),'ω⁵ = ω³ω² = ω², so the answer is <b>−ω²</b> '+M('A1')]}
],tip:'Two facts do all the work: ω³ = 1 and 1 + ω + ω² = 0. Reduce powers modulo 3 first.'},
{tag:'Paper 1 · no calculator',title:'Fourth roots and a square',stem:'Consider z⁴ = −16.',parts:[
{q:'Find the four roots in the form r cis θ.',m:3,s:['−16 = 16 cis(π + 2kπ) '+M('A1'),'z = 2 cis((π + 2kπ)/4) '+M('M1'),'<b>2 cis(π/4), 2 cis(3π/4), 2 cis(−3π/4), 2 cis(−π/4)</b> '+M('A1')]},
{q:'The roots form a square on the Argand diagram. Find its area.',m:2,s:['Four triangles from O, each ½ × 2 × 2 × sin(π/2) = 2 '+M('M1'),'Area = <b>8</b> '+M('A1')]},
{q:'Write down the product of the four roots.',m:1,s:['z⁴ + 16 = 0: product = (−1)⁴ × 16 ÷ 1 = <b>16</b> '+M('A1')]}
],tip:'The equation is z⁴ + 16 = 0, so the constant is +16, not −16. Rearrange before using the product formula.'}
]},

direct:{
method:[
['Name the general object','"Let n be an integer." Even numbers are 2n, odd numbers 2n + 1, consecutive integers n, n + 1, n + 2. Two independent numbers need two letters: 2m + 1 and 2n + 1.'],
['Translate the claim','Write the quantity the question talks about in terms of n: the sum, product or difference.'],
['Work from one side only','Start with the left-hand side and transform it, line by line, into the right-hand side. Never write the target as an equation and work on both sides.'],
['Expose the structure','Factorise to show the divisor: 3(n + 1), 8 × something, (n − 1)n(n + 1).'],
['Say why it is an integer',G(`End with a sentence: "n + 1 is an integer, so the sum is a multiple of 3." Test the claim first in a table (${K('MENU')} → Table) to make sure it is true before proving it.`,`End with a sentence: "n + 1 is an integer, so the sum is a multiple of 3." Test the claim first in a table (Y= then ${K('2nd')} ${K('GRAPH')}) to make sure it is true before proving it.`)]
],
types:[
['"Show that … ≡ …" or "Prove the identity"','LHS → RHS, one side only'],
['"…consecutive integers…"','n, n + 1, n + 2, then factorise'],
['"…odd…" or "…even…"','2n + 1 or 2n, separate letters for separate numbers'],
['"…is divisible by d"','Factorise until d × integer appears'],
['"Hence…" after an identity','Use the identity just proved, do not restart']
],
marks:['M1 for writing the general case in algebra (n, 2n + 1, …).','A1 for a correct expansion or simplification.','R1 for the closing reason: why the bracket is an integer or why a product is even.','A proof by examples scores 0, however many examples.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Consecutive integers',stem:'This question is about sums of consecutive integers.',parts:[
{q:'Prove that the sum of any three consecutive integers is divisible by 3.',m:3,s:['Let the integers be n, n + 1 and n + 2, where n ∈ ℤ. '+M('M1'),'Sum = n + (n + 1) + (n + 2) = 3n + 3 '+M('A1'),'= 3(n + 1). Since n + 1 is an integer, the sum is a multiple of 3. '+M('R1')]},
{q:'Prove that the sum of any four consecutive integers is never divisible by 4.',m:3,s:['Sum = n + (n + 1) + (n + 2) + (n + 3) '+M('M1'),'= 4n + 6 '+M('A1'),'= 4(n + 1) + 2, which leaves remainder 2 when divided by 4, so it is never a multiple of 4. '+M('R1')]}
],tip:'Checking 1 + 2 + 3 = 6 and 4 + 5 + 6 = 15 earns nothing. The M1 is for "let n be an integer", and the R1 needs the reason: n + 1 is an integer, or the remainder is 2.'},
{tag:'Paper 1 · no calculator',title:'Odd squares',stem:'This question is about the squares of odd numbers.',parts:[
{q:'Prove that the square of any odd integer is 1 more than a multiple of 8.',m:4,s:['Let the odd integer be 2n + 1, where n ∈ ℤ. '+M('M1'),'(2n + 1)² = 4n² + 4n + 1 '+M('A1'),'= 4n(n + 1) + 1 '+M('M1'),'n and n + 1 are consecutive, so one of them is even. So n(n + 1) = 2p for some integer p, and 4n(n + 1) = 8p. '+M('R1'),'So (2n + 1)² = 8p + 1. '+AG]},
{q:'Hence prove that if a and b are both odd, then a² − b² is divisible by 8.',m:2,s:['By part (a), a² = 8p + 1 and b² = 8q + 1 for some integers p and q. '+M('M1'),'a² − b² = 8p − 8q = 8(p − q), a multiple of 8. '+M('A1')]}
],tip:'Writing a = 2n + 1 and b = 2n + 1 with the same n proves the result only for a = b. Two independent odd numbers need two different letters.'},
{tag:'Paper 2 · calculator',title:'A sum without induction',stem:'This question shows how an identity can prove a series result directly.',parts:[
{q:'Show that n² − (n − 1)² ≡ 2n − 1.',m:2,s:['LHS = n² − (n² − 2n + 1) '+M('M1'),'= 2n − 1 = RHS '+M('A1')]},
{q:'Hence prove that the sum of the first n odd numbers is n².',m:3,s:['The rth odd number is 2r − 1 = r² − (r − 1)², by part (a). '+M('M1'),'Sum = (1² − 0²) + (2² − 1²) + (3² − 2²) + … + (n² − (n − 1)²) '+M('A1'),'Every term cancels except n² − 0², so the sum is n². '+M('R1')]},
{q:'Use your calculator to find the sum of the odd numbers from 101 to 199 inclusive.',m:2,s:['The odd numbers 1 to 199 are the first 100; the odd numbers 1 to 99 are the first 50. Sum = 100² − 50² '+M('M1'),G('Check: Σ(2X−1, X, 51, 100) = 7500','Check: sum(seq(2X−1, X, 51, 100)) = 7500'),'= <b>7500</b> '+M('A1')]}
],tip:'In part (a), start from the LHS and finish at the RHS. Writing "n² − (n − 1)² = 2n − 1" at the top and simplifying both sides assumes what you are proving.'}
]},

indsum:{
method:[
['State P(n)','Write the statement for one n: "P(n): Σ r² = n(n + 1)(2n + 1)/6, n ∈ ℤ⁺."'],
['Base case','Substitute n = 1 into the left side and the right side separately. Show both numbers and say "so P(1) is true".'],
['Assume P(k)','"Assume P(k) is true for some k ∈ ℤ⁺." Write out the sum for n = k. Then write the target: what P(k + 1) says.'],
['Add the next term','S(k + 1) = S(k) + (term for r = k + 1). Replace S(k) using the assumption, then factor out what the target has, usually (k + 1).'],
['Conclude',G(`"P(1) is true, and P(k) true implies P(k + 1) true. So by mathematical induction P(n) is true for all n ∈ ℤ⁺." Check the formula for n = 5 first: ${K('OPTN')} → CALC → Σ(.`,`"P(1) is true, and P(k) true implies P(k + 1) true. So by mathematical induction P(n) is true for all n ∈ ℤ⁺." Check the formula for n = 5 first: sum(seq( from ${K('2nd')} ${K('STAT')}.`)]
],
types:[
['"Prove by induction that Σ … = …"','Base, assume, add the (k + 1)th term, factor'],
['A fraction formula: Σ 1/(r(r + 1))','Common denominator, then factorise the numerator'],
['A term with 2ʳ or 3ʳ','Write 2ᵏ⁺¹ = 2 × 2ᵏ and collect powers'],
['"Hence find Σ from r = a to b"','S(b) − S(a − 1)'],
['"Find the smallest n such that the sum exceeds…"','Table of the formula; show both sides of the boundary']
],
marks:['A1 for the base case with both sides evaluated.','M1 for assuming P(k), and M1 for adding the (k + 1)th term to S(k).','A1 marks for the algebra that reaches the P(k + 1) form.','R1 for the conclusion. It is only awarded if the base case and both M1 marks are earned.'],
ex:[
{tag:'Paper 1 · no calculator',title:'The sum of squares',stem:'Prove by mathematical induction that Σ<sub>r=1</sub><sup>n</sup> r² = n(n + 1)(2n + 1)/6 for all n ∈ ℤ⁺.',parts:[
{q:'Write out the full proof.',m:7,s:['n = 1: LHS = 1² = 1, RHS = 1 × 2 × 3 ÷ 6 = 1. So P(1) is true. '+M('A1'),'Assume P(k) is true for some k ∈ ℤ⁺: Σ<sub>r=1</sub><sup>k</sup> r² = k(k + 1)(2k + 1)/6. '+M('M1'),'Target: Σ<sub>r=1</sub><sup>k+1</sup> r² = (k + 1)(k + 2)(2k + 3)/6.','Σ<sub>r=1</sub><sup>k+1</sup> r² = k(k + 1)(2k + 1)/6 + (k + 1)² '+M('M1'),'= (k + 1)[k(2k + 1) + 6(k + 1)] ÷ 6 '+M('A1'),'= (k + 1)(2k² + 7k + 6) ÷ 6 '+M('A1'),'= (k + 1)(k + 2)(2k + 3) ÷ 6, which is P(k + 1). '+M('A1'),'P(1) is true, and P(k) true implies P(k + 1) true, so P(n) is true for all n ∈ ℤ⁺ by mathematical induction. '+M('R1')]}
],tip:'Expanding everything into a cubic and then trying to factorise wastes time and invites slips. Take out (k + 1) straight away, because the target has it as a factor.'},
{tag:'Paper 1 · no calculator',title:'A fraction series',stem:'Let P(n) be the statement Σ<sub>r=1</sub><sup>n</sup> 1/(r(r + 1)) = n/(n + 1), for n ∈ ℤ⁺.',parts:[
{q:'Prove that P(n) is true for all n ∈ ℤ⁺.',m:6,s:['n = 1: LHS = 1/(1 × 2) = ½, RHS = 1/2. So P(1) is true. '+M('A1'),'Assume P(k): Σ<sub>r=1</sub><sup>k</sup> 1/(r(r + 1)) = k/(k + 1). '+M('M1'),'Σ<sub>r=1</sub><sup>k+1</sup> 1/(r(r + 1)) = k/(k + 1) + 1/((k + 1)(k + 2)) '+M('M1'),'= [k(k + 2) + 1] ÷ ((k + 1)(k + 2)) = (k² + 2k + 1) ÷ ((k + 1)(k + 2)) '+M('A1'),'= (k + 1)² ÷ ((k + 1)(k + 2)) = (k + 1)/(k + 2), which is P(k + 1). '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so P(n) is true for all n ∈ ℤ⁺. '+M('R1')]},
{q:'Hence find the exact value of Σ<sub>r=10</sub><sup>99</sup> 1/(r(r + 1)).',m:2,s:['Σ<sub>r=10</sub><sup>99</sup> = S(99) − S(9) = 99/100 − 9/10 '+M('M1'),'= <b>9/100</b> '+M('A1')]}
],tip:'In part (b) the common error is S(99) − S(10), which removes the r = 10 term that belongs in the sum. Subtract up to one below the lower limit.'},
{tag:'Paper 2 · calculator',title:'A series with powers of 2',stem:'Let S<sub>n</sub> = Σ<sub>r=1</sub><sup>n</sup> r × 2<sup>r−1</sup>.',parts:[
{q:'Prove by induction that S<sub>n</sub> = 1 + (n − 1)2ⁿ for all n ∈ ℤ⁺.',m:6,s:['n = 1: LHS = 1 × 2⁰ = 1, RHS = 1 + 0 × 2 = 1. So P(1) is true. '+M('A1'),'Assume P(k): S<sub>k</sub> = 1 + (k − 1)2ᵏ. '+M('M1'),'S<sub>k+1</sub> = 1 + (k − 1)2ᵏ + (k + 1)2ᵏ '+M('M1'),'= 1 + 2k × 2ᵏ '+M('A1'),'= 1 + k × 2ᵏ⁺¹ = 1 + ((k + 1) − 1)2ᵏ⁺¹, which is P(k + 1). '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so the result holds for all n ∈ ℤ⁺. '+M('R1')]},
{q:'Find the smallest value of n for which S<sub>n</sub> &gt; 10⁶.',m:3,s:['Solve 1 + (n − 1)2ⁿ &gt; 1 000 000. '+M('M1'),G('Table: Y1 = 1+(X−1)2^X, Start 1, End 20','Y1 = 1+(X−1)2^X, then TABLE from X = 1'),'n = 16: S = 983 041; n = 17: S = 2 097 153 '+M('A1'),'So n = <b>17</b>. '+M('A1')]}
],tip:'The term for r = k + 1 is (k + 1) × 2ᵏ, not (k + 1) × 2ᵏ⁺¹. Substitute r = k + 1 into r × 2<sup>r−1</sup> carefully: the power is r − 1.'}
]},

inddiv:{
method:[
['Base case','Work out f(1) and show it is a multiple of d: "f(1) = 6 = 6 × 1".'],
['Assume and name the multiple','"Assume f(k) = dm for some m ∈ ℤ." Naming m is what makes the step work.'],
['Rewrite f(k + 1)','Split the power: 7ᵏ⁺¹ = 7 × 7ᵏ. Then either substitute 7ᵏ = 6m + 1, or add and subtract to make f(k) appear: 7ᵏ⁺¹ − 1 = 7(7ᵏ − 1) + 6.'],
['Factor out d','Show f(k + 1) = d × (an integer), and say the bracket is an integer.'],
['Conclude',G(`Same sentence as every induction proof. Check the claim first with a table of f(X) ÷ d: ${K('MENU')} → Table.`,`Same sentence as every induction proof. Check the claim first with a table of f(X)/d: Y= then ${K('2nd')} ${K('GRAPH')}.`)]
],
types:[
['"aⁿ − 1 is divisible by d"','aᵏ⁺¹ = a × aᵏ, substitute aᵏ = dm + 1'],
['"aⁿ + c is divisible by d"','a(aᵏ + c) − c(a − 1)'],
['Two powers: aⁿ − bⁿ','a(aᵏ − bᵏ) + (a − b)bᵏ'],
['A polynomial: n³ + 2n','f(k + 1) − f(k) is a multiple of d'],
['"Find the largest integer that always divides…"','HCF of f(1), f(2), f(3), then prove it']
],
marks:['A1 for f(1) and the statement that it is divisible by d.','M1 for "assume f(k) = dm"; M1 for writing f(k + 1) in terms of f(k) or aᵏ.','A1 marks for the algebra that shows the factor d.','R1 for the conclusion, only if the earlier marks are earned.'],
ex:[
{tag:'Paper 1 · no calculator',title:'7ⁿ − 1',stem:'Prove by mathematical induction that 7ⁿ − 1 is divisible by 6 for all n ∈ ℤ⁺.',parts:[
{q:'Write out the full proof.',m:6,s:['n = 1: 7¹ − 1 = 6 = 6 × 1, so P(1) is true. '+M('A1'),'Assume P(k): 7ᵏ − 1 = 6m for some m ∈ ℤ, so 7ᵏ = 6m + 1. '+M('M1'),'7ᵏ⁺¹ − 1 = 7 × 7ᵏ − 1 '+M('M1'),'= 7(6m + 1) − 1 = 42m + 6 '+M('A1'),'= 6(7m + 1), and 7m + 1 is an integer, so P(k + 1) is true. '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so 7ⁿ − 1 is divisible by 6 for all n ∈ ℤ⁺. '+M('R1')]}
],tip:'"Assume 7ᵏ − 1 is divisible by 6" with no m leaves nothing to substitute. Write 7ᵏ − 1 = 6m, so that 7ᵏ = 6m + 1 can go straight into 7 × 7ᵏ.'},
{tag:'Paper 1 · no calculator',title:'A polynomial: n³ + 2n',stem:'Prove by mathematical induction that n³ + 2n is divisible by 3 for all n ∈ ℤ⁺.',parts:[
{q:'Write out the full proof.',m:7,s:['n = 1: 1 + 2 = 3, divisible by 3, so P(1) is true. '+M('A1'),'Assume P(k): k³ + 2k = 3m for some m ∈ ℤ. '+M('M1'),'(k + 1)³ + 2(k + 1) '+M('M1'),'= k³ + 3k² + 3k + 1 + 2k + 2 '+M('A1'),'= (k³ + 2k) + 3k² + 3k + 3 '+M('M1'),'= 3m + 3(k² + k + 1) = 3(m + k² + k + 1), a multiple of 3. '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so the result holds for all n ∈ ℤ⁺. '+M('R1')]}
],tip:'The key M1 is regrouping to make k³ + 2k appear. Students who expand correctly but never pick out the hypothesis cannot use the assumption, and lose the last three marks.'},
{tag:'Paper 2 · calculator',title:'Test first, then prove: 3²ⁿ + 7',stem:'Let f(n) = 3²ⁿ + 7, n ∈ ℤ⁺.',parts:[
{q:'Use your calculator to find f(n) ÷ 8 for n = 1, 2, 3, 4 and 5.',m:2,s:[G('Table: Y1 = (3^(2X)+7)÷8, Start 1, End 5','Y1 = (3^(2X)+7)/8, TABLE from X = 1')+' '+M('M1'),'2, 11, 92, 821, 7382: all integers. '+M('A1')]},
{q:'Prove by induction that f(n) is divisible by 8 for all n ∈ ℤ⁺.',m:6,s:['f(1) = 9 + 7 = 16 = 8 × 2, so P(1) is true. '+M('A1'),'Assume 3²ᵏ + 7 = 8m for some m ∈ ℤ. '+M('M1'),'3²⁽ᵏ⁺¹⁾ + 7 = 9 × 3²ᵏ + 7 = 9(8m − 7) + 7 '+M('M1'),'= 72m − 56 '+M('A1'),'= 8(9m − 7), a multiple of 8. '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so 8 | f(n) for all n ∈ ℤ⁺. '+M('R1')]}
],tip:'Part (a) is evidence, not proof: five integers say nothing about n = 6. The R1 in (b) depends on the base case and the step, never on the table.'}
]},

indmore:{
method:[
['Find n₀','The question gives the starting value, or you find it: the first n after the last failure. P(n₀) is the base case, not P(1).'],
['Base case','Evaluate both sides at n₀ and compare.'],
['Assume and start from the left','Assume P(k) for some k ≥ n₀. Begin with the left side of P(k + 1) and split off the left side of P(k): 2ᵏ⁺¹ = 2 × 2ᵏ, (k + 1)! = (k + 1) × k!.'],
['Chain the inequality','Use the assumption once (that gives &gt;), then show what you have is ≥ the right side of P(k + 1), using k ≥ n₀. For derivatives, differentiate the k formula instead.'],
['Conclude from n₀',G(`"P(n₀) is true and P(k) ⇒ P(k + 1) for k ≥ n₀, so P(n) is true for all n ≥ n₀." To find n₀, tabulate both sides: ${K('MENU')} → Table with Y1 and Y2.`,`"P(n₀) is true and P(k) ⇒ P(k + 1) for k ≥ n₀, so P(n) is true for all n ≥ n₀." To find n₀, tabulate both sides: Y1, Y2 then ${K('2nd')} ${K('GRAPH')}.`)]
],
types:[
['"…for all n ≥ 5" or "for n &gt; 3"','Base case at that n, not at 1'],
['aⁿ against a polynomial','aᵏ⁺¹ = a × aᵏ &gt; a × (polynomial), then compare'],
['n! against aⁿ','(k + 1)! = (k + 1)k!, and k + 1 &gt; a'],
['"Prove that the nth derivative is…"','Differentiate the k formula, match the k + 1 formula'],
['"Find the smallest n for which…"','Table both sides, then prove from that n']
],
marks:['A1 for the base case at the correct starting value.','M1 for the assumption with k ≥ n₀ stated; M1 for starting from the left side of P(k + 1).','R1 for justifying the comparison step (why the extra piece is positive for k ≥ n₀).','R1 for the conclusion, stating n ≥ n₀.'],
ex:[
{tag:'Paper 1 · no calculator',title:'2ⁿ against n²',stem:'Prove by mathematical induction that 2ⁿ &gt; n² for all integers n ≥ 5.',parts:[
{q:'Write out the full proof.',m:6,s:['n = 5: 2⁵ = 32 and 5² = 25, and 32 &gt; 25, so P(5) is true. '+M('A1'),'Assume 2ᵏ &gt; k² for some integer k ≥ 5. '+M('M1'),'2ᵏ⁺¹ = 2 × 2ᵏ &gt; 2k² '+M('M1'),'2k² − (k + 1)² = k² − 2k − 1 = (k − 1)² − 2. For k ≥ 5, (k − 1)² ≥ 16, so this is positive. '+M('R1'),'So 2ᵏ⁺¹ &gt; 2k² &gt; (k + 1)², which is P(k + 1). '+M('A1'),'P(5) is true and P(k) ⇒ P(k + 1) for k ≥ 5, so 2ⁿ &gt; n² for all integers n ≥ 5. '+M('R1')]}
],tip:'Writing "2ᵏ⁺¹ = 2k²" turns the inequality into an equation and loses the method. Keep the &gt; from the assumption, then justify each later comparison.'},
{tag:'Paper 1 · no calculator',title:'An nth derivative',stem:'Let f(x) = xe<sup>2x</sup>.',parts:[
{q:'Find f′(x) and f″(x).',m:3,s:['Product rule: f′(x) = e<sup>2x</sup> + 2xe<sup>2x</sup> '+M('M1'),'= (1 + 2x)e<sup>2x</sup> '+M('A1'),'f″(x) = 2e<sup>2x</sup> + 2(1 + 2x)e<sup>2x</sup> = (4 + 4x)e<sup>2x</sup> '+M('A1')]},
{q:'Prove by induction that f<sup>(n)</sup>(x) = 2<sup>n−1</sup>(n + 2x)e<sup>2x</sup> for all n ∈ ℤ⁺.',m:6,s:['n = 1: 2⁰(1 + 2x)e<sup>2x</sup> = (1 + 2x)e<sup>2x</sup> = f′(x), so P(1) is true. '+M('A1'),'Assume f<sup>(k)</sup>(x) = 2<sup>k−1</sup>(k + 2x)e<sup>2x</sup>. '+M('M1'),'f<sup>(k+1)</sup>(x) = d/dx[2<sup>k−1</sup>(k + 2x)e<sup>2x</sup>] '+M('M1'),'= 2<sup>k−1</sup>[2e<sup>2x</sup> + 2(k + 2x)e<sup>2x</sup>] '+M('A1'),'= 2<sup>k−1</sup> × 2(k + 1 + 2x)e<sup>2x</sup> = 2ᵏ((k + 1) + 2x)e<sup>2x</sup>, which is P(k + 1). '+M('A1'),'P(1) is true and P(k) ⇒ P(k + 1), so the formula holds for all n ∈ ℤ⁺. '+M('R1')]}
],tip:'The step is "differentiate the kth derivative". Students who differentiate f(x) again from scratch, or substitute k + 1 into the formula and call it done, have assumed P(k + 1).'},
{tag:'Paper 2 · calculator',title:'Factorials beat powers',stem:'This question compares n! with 3ⁿ.',parts:[
{q:'Use your calculator to find the smallest positive integer n for which n! &gt; 3ⁿ.',m:2,s:[G('Table: Y1 = X!, Y2 = 3^X, Start 1, End 10','Y1 = X!, Y2 = 3^X, TABLE from X = 1')+' '+M('M1'),'n = 6: 720 &lt; 729; n = 7: 5040 &gt; 2187. So n = <b>7</b>. '+M('A1')]},
{q:'Prove by induction that n! &gt; 3ⁿ for all integers n ≥ 7.',m:6,s:['n = 7: 7! = 5040 &gt; 2187 = 3⁷, so P(7) is true. '+M('A1'),'Assume k! &gt; 3ᵏ for some integer k ≥ 7. '+M('M1'),'(k + 1)! = (k + 1) × k! &gt; (k + 1) × 3ᵏ '+M('M1'),'Since k ≥ 7, k + 1 ≥ 8 &gt; 3. '+M('R1'),'So (k + 1)! &gt; 3 × 3ᵏ = 3ᵏ⁺¹, which is P(k + 1). '+M('A1'),'P(7) is true and P(k) ⇒ P(k + 1) for k ≥ 7, so n! &gt; 3ⁿ for all n ≥ 7. '+M('R1')]}
],tip:'n = 1 fails, but so do n = 2 to 6, and 6! falls short of 3⁶ by only 9. Read the whole table: the base case is the first n after the last failure.'}
]},

contra:{
method:[
['Assume the opposite','Write the negation as a sentence: "Suppose √2 is rational", "Suppose there are finitely many primes", "Suppose n is odd".'],
['Write it in algebra','Rational means p/q with p, q integers, q ≠ 0 and no common factor. Finitely many primes means a full list p₁, p₂, …, pₖ.'],
['Deduce, one fact per line','Square, rearrange, use parity or divisibility. Each line should follow from the one before.'],
['Reach the impossible','Something must be both true and false: p and q both even, despite having no common factor; an even number equal to an odd one; a prime not on the complete list.'],
['Conclude','"This is a contradiction, so the assumption is false and √2 is irrational." A calculator can show √2 = 1.41421356…, but no number of decimals proves irrationality.']
],
types:[
['"Prove that √d is irrational"','√d = p/q in lowest terms, p² = dq²'],
['"Prove that log<sub>a</sub> b is irrational"','aᵖ = bᵠ, then parity or prime factors'],
['"Prove there are infinitely many…"','Suppose a finite list, build one more'],
['"Prove that if n² is even then n is even"','Suppose n odd, then n² is odd'],
['"Show that at least one…"','Suppose none, count, contradict (pigeonhole)']
],
marks:['M1 for clearly stating the assumption, including "no common factor" for p/q.','A1 for the key equation, such as p² = 2q² or 2ᵖ = 3ᵠ.','R1 for each deduction that uses parity or divisibility.','R1 for naming the contradiction and concluding.'],
ex:[
{tag:'Paper 1 · no calculator',title:'√2 is irrational',stem:'This question builds the classic proof in two parts.',parts:[
{q:'Prove that if n² is even, then n is even.',m:3,s:['Suppose n² is even but n is odd, so n = 2m + 1 for some m ∈ ℤ. '+M('M1'),'Then n² = 4m² + 4m + 1 = 2(2m² + 2m) + 1 '+M('A1'),'which is odd. This contradicts n² being even, so n must be even. '+M('R1')]},
{q:'Prove by contradiction that √2 is irrational.',m:6,s:['Suppose √2 = p/q, where p, q ∈ ℤ, q ≠ 0, and p and q have no common factor. '+M('M1'),'Squaring: p² = 2q² '+M('A1'),'So p² is even, and by part (a) p is even. '+M('R1'),'Write p = 2m: 4m² = 2q², so q² = 2m² '+M('A1'),'So q² is even, and by part (a) q is even. '+M('R1'),'Then p and q are both even, contradicting "no common factor". So √2 is irrational. '+M('R1')]}
],tip:'Without "no common factor" in the first line there is no contradiction at the end, since p and q both even is perfectly possible (4/2 = 2). The first M1 needs it.'},
{tag:'Paper 1 · no calculator',title:'An irrational logarithm',stem:'This question uses parity to prove a logarithm is irrational.',parts:[
{q:'Prove by contradiction that log₂ 3 is irrational.',m:5,s:['Suppose log₂ 3 = p/q with p, q ∈ ℤ. Since log₂ 3 &gt; 0, we can take p, q positive. '+M('M1'),'Then 2<sup>p/q</sup> = 3, so 2ᵖ = 3ᵠ. '+M('A1'),'p ≥ 1, so 2ᵖ is even. '+M('R1'),'3ᵠ is a product of odd numbers, so it is odd. '+M('R1'),'An even number cannot equal an odd number. This contradiction shows log₂ 3 is irrational. '+M('R1')]},
{q:'Hence show that log₄ 9 is irrational.',m:2,s:['log₄ 9 = ln 9 ÷ ln 4 = 2 ln 3 ÷ 2 ln 2 '+M('M1'),'= log₂ 3, which is irrational by part (a). '+M('A1')]}
],tip:'The argument needs p ≥ 1. If p = 0 then 2ᵖ = 1 is odd and the parity argument fails, which is why the first line says why p and q can be taken positive.'},
{tag:'Paper 2 · calculator',title:'Infinitely many primes',stem:'This question is about Euclid\'s proof.',parts:[
{q:'Prove by contradiction that there are infinitely many prime numbers.',m:5,s:['Suppose there are only finitely many primes, p₁, p₂, …, pₙ. '+M('M1'),'Let N = p₁p₂…pₙ + 1. '+M('A1'),'N &gt; 1, so N is prime or has a prime factor. '+M('R1'),'Dividing N by any pᵢ leaves remainder 1, so no pᵢ divides N. '+M('R1'),'So there is a prime not on the list, which contradicts the list being complete. Hence there are infinitely many primes. '+M('R1')]},
{q:'Find the smallest prime factor of 2 × 3 × 5 × 7 × 11 × 13 + 1.',m:2,s:['N = 30 031. Divide by primes from 17 upwards. '+M('M1'),G('Table: Y1 = 30031÷X, look for a whole number','Y1 = 30031/X, TABLE, look for a whole number'),'30 031 = 59 × 509, so the smallest prime factor is <b>59</b>. '+M('A1')]}
],tip:'Part (b) shows why "N is prime" is wrong. N = 30 031 is not prime. The proof only needs N to have a prime factor that is missing from the list, and 59 is missing.'}
]},

counter:{
method:[
['Read the quantifier','"For all", "every", "always" can be broken by one counterexample. "There exists" is proved by one example.'],
['Try the awkward numbers','0, 1, negatives, fractions, and the constant in the formula: n = 41 for n² + n + 41, n = 11 for n² − n + 11.'],
['Check it fully','Show the claim\'s condition holds for your example and its conclusion fails. Write the arithmetic out.'],
['State it plainly','"When n = 40, n² + n + 41 = 1681 = 41², which is not prime. So the statement is false."'],
['If no counterexample appears, prove it',G(`A table that shows no failures is a hint to prove the claim, not a proof. Search with ${K('MENU')} → Table; test factors with Y2 = Y1 ÷ p.`,`A table that shows no failures is a hint to prove the claim, not a proof. Search with TABLE; test factors with Y2 = Y1/p.`)]
],
types:[
['"Show that the statement is false"','One counterexample, fully checked'],
['"…is prime for all n"','Make the constant a factor: n = c'],
['"If a &gt; b then a² &gt; b²"','Try negatives'],
['"x² ≥ x for all real x"','Try a fraction between 0 and 1'],
['"Prove or disprove"','Test a few cases first, then decide']
],
marks:['M1 for a sensible choice of counterexample.','A1 for the arithmetic showing the conclusion fails.','R1 for the statement that this disproves the claim, or for the correct condition when asked.','"Proving" a false statement, or "disproving" a true one with a failed counterexample, scores 0.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Three false claims',stem:'Each statement below is false. Give a counterexample to each.',parts:[
{q:'"n² + n + 41 is prime for every positive integer n."',m:2,s:['Take n = 40: n² + n + 41 = 40 × 41 + 41 '+M('M1'),'= 41 × 41 = 1681, which is not prime. '+M('A1')]},
{q:'"x² ≥ x for every real number x."',m:2,s:['Take x = ½. '+M('M1'),'x² = ¼ &lt; ½ = x, so the statement fails. '+M('A1')]},
{q:'"If a &gt; b, then a² &gt; b²." Give a counterexample, and state a condition on b that makes the statement true.',m:3,s:['Take a = 1 and b = −2. '+M('M1'),'a &gt; b, but a² = 1 &lt; 4 = b². '+M('A1'),'The statement is true when b ≥ 0, since then a &gt; b ≥ 0 and squaring keeps the order. '+M('R1')]}
],tip:'n = 41 also works for part (a), but n = 40 shows the trick: factorise n(n + 1) + 41 by making n + 1 = 41. A counterexample with no arithmetic shown earns only the M1.'},
{tag:'Paper 2 · calculator',title:'Mersenne numbers',stem:'Numbers of the form 2ⁿ − 1 are called Mersenne numbers.',parts:[
{q:'Write 2¹¹ − 1 as a product of two primes.',m:2,s:['2¹¹ − 1 = 2047. Divide by primes in turn. '+M('M1'),G('Table: Y1 = 2047÷X, look for a whole number','Y1 = 2047/X, TABLE, look for a whole number'),'2047 = <b>23 × 89</b> '+M('A1')]},
{q:'Hence explain why the statement "2ᵖ − 1 is prime for every prime p" is false.',m:1,s:['11 is prime but 2¹¹ − 1 = 23 × 89 is not, so p = 11 is a counterexample. '+M('R1')]},
{q:'Prove that if n = ab, where a and b are integers greater than 1, then 2ⁿ − 1 is not prime.',m:3,s:['2ⁿ − 1 = (2ᵃ)ᵇ − 1 = (2ᵃ − 1)(2<sup>a(b−1)</sup> + 2<sup>a(b−2)</sup> + … + 2ᵃ + 1) '+M('M1')+' '+M('A1'),'Since 1 &lt; a &lt; n, the factor 2ᵃ − 1 is between 1 and 2ⁿ − 1, so 2ⁿ − 1 has a proper factor and is not prime. '+M('R1')]}
],tip:'Part (c) proves the converse direction: n composite ⇒ 2ⁿ − 1 composite. Together with (b) it shows "p prime" is necessary but not sufficient. Swapping a statement with its converse is a classic error.'},
{tag:'Paper 1 · no calculator',title:'Prove or disprove',stem:'For each statement, decide whether it is true or false. Prove the true statement and give a counterexample to each false one.',parts:[
{q:'"The sum of two irrational numbers is irrational."',m:2,s:['False. Take √2 and −√2, both irrational. '+M('M1'),'Their sum is 0, which is rational. '+M('A1')]},
{q:'"The product of two consecutive even numbers is divisible by 8."',m:3,s:['True. Let the numbers be 2n and 2n + 2: product = 2n(2n + 2) '+M('M1'),'= 4n(n + 1) '+M('A1'),'n(n + 1) is even, so 4n(n + 1) is a multiple of 8. '+M('R1')]},
{q:'"n² − n + 11 is prime for every positive integer n."',m:2,s:['False. Take n = 11: 121 − 11 + 11 '+M('M1'),'= 121 = 11², not prime. '+M('A1')]}
],tip:'"Prove or disprove" questions mix true and false statements on purpose. Try two or three cases before committing. A counterexample hunt on a true statement wastes the time you need for the proof.'}
]}
};
window.LAB.L=Object.assign(window.LAB.L,L);
Object.assign(window.LAB.TITLES,{cart:'complex numbers in Cartesian form',polar:'modulus-argument and Euler form',polyroots:'polynomial roots and conjugate pairs',demoivre:'De Moivre\'s theorem',croots:'roots of complex numbers',direct:'direct proof',indsum:'induction with series',inddiv:'induction with divisibility',indmore:'induction with inequalities and derivatives',contra:'proof by contradiction',counter:'counterexamples'});
})();
