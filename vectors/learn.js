/* Vectors: How-to-answer guides and worked examples for every topic.
   Same shape as the Probability unit: a method panel and exam-style worked examples whose
   solutions reveal one step at a time. Every number was checked with a computer algebra system. */
(function(){
"use strict";
const {K,G,M,cv}=window.LAB;
const V=(...a)=>cv(...a);

const L={
vec:{
method:[
['Write the position vectors','a = OA, b = OB. Always write them as columns with brackets, and keep the letters: it stops you subtracting the wrong way round.'],
['Displacement = end − start','AB = b − a. This single rule is behind lengths, midpoints, ratios and collinearity questions.'],
['Length and unit vector','|v| = √(v₁² + v₂² + v₃²). The unit vector is v divided by |v|. Square and add before rooting.'],
['Dividing a line','AP : PB = m : n means P is m/(m+n) of the way from A to B, so p = a + (m/(m+n))·AB. A midpoint is the case 1 : 1.'],
['Collinear = parallel + shared point','A, B, C are collinear if AB = λ·AC for some scalar λ. Match components to find λ, then check the rest.']
],
types:[
['"Find the vector AB" or "find |AB|"','Subtract, then square, add, root'],
['"P divides AB in the ratio…"','p = a + fraction × AB'],
['"Show A, B, C are collinear" or "find k so they are"','AB = λAC, one component gives λ, another gives k'],
['"Show the triangle is isosceles/right-angled"','Compute two lengths (or a dot product) and compare'],
['Proof with a and b as unknowns','Express everything through a and b, then compare. No numbers needed']
],
marks:['M1 for forming AB as end − start, even if a sign slips.','A1 for each correct final vector or length.','R1 for a conclusion in words, like "so A, B, C are collinear".'],
ex:[
{tag:'Paper 1 · no calculator',title:'Displacement, length, ratio',stem:`Points A and B have position vectors ${V(1,2,-1)} and ${V(4,-4,5)}.`,parts:[
{q:'Find the vector AB.',m:2,s:[`AB = <b>b</b> − <b>a</b> = ${V(4,-4,5)} − ${V(1,2,-1)} `+M('M1'),`= <b>${V(3,-6,6)}</b> `+M('A1')]},
{q:'Find |AB| and a unit vector in the direction of AB.',m:3,s:['|AB| = √(3² + 6² + 6²) = √(9 + 36 + 36) '+M('M1'),'= √81 = <b>9</b> '+M('A1'),`Unit vector = AB ÷ 9 = <b>${V('1/3','−2/3','2/3')}</b> `+M('A1')]},
{q:'The point P lies on AB with AP : PB = 1 : 2. Find the coordinates of P.',m:3,s:['AP is 1 part out of 3, so AP = ⅓ AB '+M('M1'),`<b>p</b> = <b>a</b> + ⅓AB = ${V(1,2,-1)} + ${V(1,-2,2)} `+M('M1'),`= ${V(2,0,1)}, so P is <b>(2, 0, 1)</b> `+M('A1')]}
],tip:'Check a ratio answer: P should sit between A and B, and AP should be half the length of PB here (3 and 6).',calc:G(`Length: ${K('OPTN')} → MAT/VCT → Norm(Vct A). Enter the vector in the vector editor first.`,`Length: √(sum(L₁²)) with {3,−6,6} stored in L₁. Result 9.`)},
{tag:'Paper 1 · no calculator',title:'Collinear points',stem:`Points A, B and C have coordinates A(2, 1, −3), B(5, k, 0) and C(8, 5, 3).`,parts:[
{q:'Find AB and AC in terms of k.',m:2,s:[`AB = ${V(5,'k',0)} − ${V(2,1,-3)} = <b>${V(3,'k − 1',3)}</b> `+M('A1'),`AC = ${V(8,5,3)} − ${V(2,1,-3)} = <b>${V(6,4,6)}</b> `+M('A1')]},
{q:'Given that A, B and C are collinear, find k.',m:3,s:['Collinear means AC = λ·AB for some scalar λ.','x-components: 6 = 3λ, so λ = 2 '+M('M1'),'y-components: 4 = 2(k − 1) '+M('M1'),'k − 1 = 2, so <b>k = 3</b> '+M('A1'),'Check z: 6 = 2 × 3 ✓']},
{q:'Find the ratio AB : BC.',m:2,s:['AC = 2AB, so AB is half of AC '+M('M1'),'B is the midpoint of AC, so AB : BC = <b>1 : 1</b> '+M('A1')]}
],tip:'Use a component with no unknown to find λ first. Then the unknown drops out of a second component with a single step.'},
{tag:'Paper 2 · calculator',title:'An isosceles triangle',stem:`The points A, B and C have coordinates A(1, 2, 3), B(4, 6, 5) and C(−3, 5, 5). M is the midpoint of BC.`,parts:[
{q:'Show that triangle ABC is isosceles with |AB| = |AC|.',m:3,s:[`AB = ${V(3,4,2)}, so |AB| = √(9 + 16 + 4) = √29 `+M('M1'),`AC = ${V(-4,3,2)}, so |AC| = √(16 + 9 + 4) = √29 `+M('A1'),'|AB| = |AC|, so the triangle is isosceles. '+M('R1')]},
{q:'Find the coordinates of M.',m:2,s:['M = ½(<b>b</b> + <b>c</b>) '+M('M1'),'= ½(4 − 3, 6 + 5, 5 + 5) = <b>(0.5, 5.5, 5)</b> '+M('A1')]},
{q:'Find the length of AM.',m:3,s:[`AM = <b>m</b> − <b>a</b> = ${V(-0.5,3.5,2)} `+M('M1'),'|AM|² = 0.25 + 12.25 + 4 = 16.5 '+M('M1'),'|AM| = <b>4.06</b> (3 s.f.) '+M('A1')]}
],tip:'In an isosceles triangle the line from the apex to the midpoint of the base is perpendicular to the base. Test it: AM · BC = 0.'}
]},

dot:{
method:[
['Pick the form that matches the data','Components: a·b = a₁b₁ + a₂b₂ + a₃b₃. Angle: a·b = |a||b| cos θ. Components when you have numbers, the angle form when you are given lengths and an angle.'],
['Perpendicular means zero','a·b = 0 is the only test. If the question has an unknown, the equation is linear.'],
['Angle between two vectors','cos θ = a·b ÷ (|a||b|). Positive dot gives acute, negative gives obtuse. Check your calculator is in degrees.'],
['Angle at a vertex','Both vectors must leave the vertex. For the angle at B use BA and BC, never AB and BC.'],
['Expand brackets like algebra','(a + b)·(a + b) = |a|² + 2a·b + |b|². Use a·a = |a|² everywhere.']
],
types:[
['"Find the angle between…"','Dot product, then cos⁻¹'],
['"Find k so the vectors are perpendicular"','Set a·b = 0, solve'],
['"Angle ABC" in a triangle','BA and BC from the vertex B'],
['"Given |a|, |b|, a·b, find…"','Expand brackets, substitute'],
['Projection or distance along a vector','Scalar projection = a·b ÷ |b|']
],
marks:['M1 for the dot product formula with numbers in.','A1 for the dot product value and for cos θ.','A1 for the angle to 3 s.f. Do not round before the final step.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Angle and perpendicular',stem:`Vectors <b>a</b> = ${V(1,1,0)} and <b>b</b> = ${V(0,1,1)}.`,parts:[
{q:'Find a·b.',m:1,s:['a·b = (1)(0) + (1)(1) + (0)(1) = <b>1</b> '+M('A1')]},
{q:'Find the angle between a and b.',m:2,s:['|a| = |b| = √2, so cos θ = 1 ÷ (√2 × √2) '+M('M1'),'= ½, so θ = <b>60°</b> '+M('A1')]},
{q:'Find the value of k for which a + k b is perpendicular to a.',m:3,s:['Perpendicular: (a + kb)·a = 0 '+M('M1'),'a·a + k(a·b) = 2 + k '+M('A1'),'2 + k = 0, so <b>k = −2</b> '+M('A1')]}
],tip:'Whenever you see "perpendicular", write "= 0" before doing anything else. It sets up the equation.',calc:G(`${K('OPTN')} → MAT/VCT → DotP(Vct A,Vct B) and Angle(Vct A,Vct B). Needs OS 3.x; on older OS use Sum(List1×List2).`,`Store vectors as lists. ${K('2nd')} ${K('STAT')} → MATH → 5:sum(, then sum(L₁*L₂) = 1.`)},
{tag:'Paper 2 · calculator',title:'Angles in a triangle',stem:`The points A(1, 2, 3), B(4, 0, 2) and C(2, 5, 7) form a triangle.`,parts:[
{q:'Find the vectors BA and BC.',m:2,s:[`BA = <b>a</b> − <b>b</b> = <b>${V(-3,2,1)}</b> `+M('A1'),`BC = <b>c</b> − <b>b</b> = <b>${V(-2,5,5)}</b> `+M('A1')]},
{q:'Find angle ABC.',m:4,s:['BA·BC = (−3)(−2) + (2)(5) + (1)(5) '+M('M1'),'= 21 '+M('A1'),'|BA| = √14, |BC| = √54, so cos B = 21 ÷ (√14 × √54) '+M('M1'),'B = <b>40.2°</b> (3 s.f.) '+M('A1')]},
{q:'Find the angles at A and at C.',m:4,s:[`AB = ${V(3,-2,-1)}, AC = ${V(1,3,4)}, so AB·AC = 3 − 6 − 4 = −7 `+M('M1'),'cos A = −7 ÷ (√14 × √26), so A = <b>111.5°</b> '+M('A1'),'Angles add to 180°: C = 180° − 40.2° − 111.5° '+M('M1'),'= <b>28.3°</b> '+M('A1')]}
],tip:'A negative dot product means an obtuse angle, so 111.5° passes the sanity check. Always confirm the three angles add to 180°.'},
{tag:'Paper 1 · no calculator',title:'Using |a|, |b| and a·b',stem:`Vectors <b>a</b> and <b>b</b> satisfy |<b>a</b>| = 3, |<b>b</b>| = 2 and <b>a</b>·<b>b</b> = 3.`,parts:[
{q:'Find (2a − b)·(a + b).',m:3,s:['Expand: 2a·a + 2a·b − b·a − b·b '+M('M1'),'= 2(9) + 2(3) − 3 − 4 '+M('A1'),'= <b>17</b> '+M('A1')]},
{q:'Find the angle between a and b.',m:2,s:['cos θ = 3 ÷ (3 × 2) = ½ '+M('M1'),'θ = <b>60°</b> '+M('A1')]},
{q:'Find |a − b|.',m:3,s:['|a − b|² = |a|² − 2a·b + |b|² '+M('M1'),'= 9 − 6 + 4 = 7 '+M('A1'),'|a − b| = <b>√7 ≈ 2.65</b> '+M('A1')]}
],tip:'You never need the components. Write each bracket as a dot product of itself, expand, then replace a·a by |a|².'}
]},

line:{
method:[
['Point and direction','r = a + λb. The direction b is AB = (second point) − (first point). Any multiple of b gives the same line.'],
['Test a point is on the line','Match one component to find λ, then check the other two. If one fails, the point is off the line.'],
['Angle between two lines','Use the direction vectors only, with cos θ = |b₁·b₂| ÷ (|b₁||b₂|). The absolute value keeps the angle acute.'],
['Shortest distance from a point','d = |AP × b| ÷ |b|. Or find the foot F with AF perpendicular to b, then take |PF|.'],
['Motion in a straight line','Velocity is b, speed is |b|, position at time t is a + tb. Closest approach: (p − r(t))·b = 0.']
],
types:[
['"Find the equation of the line through A and B"','b = AB, then r = a + λb'],
['"Does C lie on the line?"','Solve one component, verify the other two'],
['"Find where the line meets x = 0"','Set that component to 0, solve λ'],
['"Angle between two lines"','Directions only, with absolute value'],
['Particle or drone problems','Speed = |b|; closest approach via perpendicular']
],
marks:['A1 for a correct direction vector, M1 for r = a + λb with a point.','M1 for equating components, A1 for λ, R1 for the check or conclusion.','A1 for the angle or distance to 3 s.f.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Equation of a line',stem:`The line l passes through A(2, −1, 3) and B(4, 1, 2).`,parts:[
{q:'Find a vector equation of l.',m:2,s:[`Direction AB = ${V(2,2,-1)} `+M('M1'),`<b>r</b> = ${V(2,-1,3)} + λ${V(2,2,-1)} `+M('A1')]},
{q:'Determine whether C(8, 5, 0) lies on l.',m:3,s:['x: 8 = 2 + 2λ, so λ = 3 '+M('M1'),'y: −1 + 2(3) = 5 ✓ and z: 3 − 3 = 0 ✓ '+M('A1'),'All three components agree, so C lies on l. '+M('R1')]},
{q:'The line meets the plane x = 0 at D. Find the coordinates of D.',m:3,s:['x: 2 + 2λ = 0, so λ = −1 '+M('M1'),'y: −1 + 2(−1) = −3 '+M('A1'),'z: 3 − (−1) = 4, so D is <b>(0, −3, 4)</b> '+M('A1')]},
{q:'Write l in Cartesian form.',m:2,s:['Make λ the subject of each component: λ = (x − 2)/2, (y + 1)/2, (z − 3)/(−1) '+M('M1'),'<b>(x − 2)/2 = (y + 1)/2 = (z − 3)/(−1)</b> '+M('A1')]}
],tip:'For "show that C lies on l" you must check all three components. Two out of three is not enough for the R1.'},
{tag:'Paper 1 · no calculator',title:'Angles between lines',stem:`Line l₁: <b>r</b> = ${V(1,0,2)} + λ${V(1,2,2)} and line l₂: <b>r</b> = ${V(3,1,0)} + μ${V(2,-1,2)}.`,parts:[
{q:'Find the acute angle between l₁ and l₂.',m:3,s:['b₁·b₂ = (1)(2) + (2)(−1) + (2)(2) = 4 '+M('M1'),'|b₁| = |b₂| = 3, so cos θ = 4 ÷ 9 '+M('A1'),'θ = <b>63.6°</b> (3 s.f.) '+M('A1')]},
{q:`A third line l₃ has direction ${V('k',2,1)}. Given l₃ is perpendicular to l₁, find k.`,m:2,s:['(k)(1) + (2)(2) + (1)(2) = 0 '+M('M1'),'k + 6 = 0, so <b>k = −6</b> '+M('A1')]},
{q:'Find the acute angle between l₁ and the x-axis.',m:2,s:[`The x-axis has direction ${V(1,0,0)}, so cos θ = 1 ÷ 3 `+M('M1'),'θ = <b>70.5°</b> (3 s.f.) '+M('A1')]}
],tip:'The points a₁ and a₂ are decoys for angle questions. Only the direction vectors matter.'},
{tag:'Paper 2 · calculator',title:'A drone in flight',stem:`A drone has position <b>r</b> = ${V(2,1,0)} + t${V(3,-2,1)} metres, where t is the time in seconds. A tower top is at P(10, −5, 3).`,parts:[
{q:'Find the speed of the drone.',m:2,s:[`Velocity = ${V(3,-2,1)} `+M('M1'),'Speed = √(9 + 4 + 1) = <b>3.74 m/s</b> (3 s.f.) '+M('A1')]},
{q:'Find the position of the drone when t = 4.',m:2,s:[`<b>r</b> = ${V(2,1,0)} + 4${V(3,-2,1)} `+M('M1'),`= <b>${V(14,-7,4)}</b> `+M('A1')]},
{q:'Find the time when the drone is closest to P.',m:3,s:[`AP = ${V(10,-5,3)} − ${V(2,1,0)} = ${V(8,-6,3)} `+M('A1'),'The connecting vector is perpendicular to the path: (AP − tb)·b = 0 '+M('M1'),'t = AP·b ÷ |b|² = 39 ÷ 14 = <b>2.79 s</b> (3 s.f.) '+M('A1')]},
{q:'Find the shortest distance between the drone and P.',m:2,s:[`AP × b = ${V(0,1,2)}, so |AP × b| = √5. Then d = √5 ÷ √14 `+M('M1'),'= <b>0.598 m</b> (3 s.f.) '+M('A1')]}
],tip:'Closest approach = perpendicular. If your t comes out negative, the closest point is behind the starting position, so for t ≥ 0 the answer would be at t = 0.'}
]},

lines2:{
method:[
['Compare the directions first','If b₂ is a multiple of b₁ the lines are parallel (or the same line). If not, they either intersect or are skew.'],
['Parallel: same line or not?','Put A₂ into the equation of line 1. If it fits, the lines coincide. If not, they are parallel and distinct.'],
['Not parallel: equate and solve','Write the three component equations. Solve two for λ and μ, then test the third.'],
['Third equation holds → intersect','Substitute λ back into line 1 to get the point. Third equation fails → skew, with no intersection and no parallel.'],
['Distance between skew lines','n = b₁ × b₂. Then d = |(a₂ − a₁)·n| ÷ |n|. The angle between them uses the directions only.']
],
types:[
['"Show the lines intersect and find the point"','Equate, solve two, check the third'],
['"Show the lines are skew"','Not parallel, and the third equation fails'],
['"Find the angle between the lines"','Directions, with absolute value'],
['"Find k so that the lines intersect"','The third equation fixes k'],
['"Find the shortest distance between…"','(a₂ − a₁)·(b₁ × b₂) ÷ |b₁ × b₂|']
],
marks:['M1 for equating the lines, A1 for each of λ and μ.','R1 for the conclusion that explicitly refers to the third equation.','A1 for the point, angle, or distance.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Intersecting lines',stem:`Lines l₁: <b>r</b> = ${V(2,1,-1)} + λ${V(1,2,1)} and l₂: <b>r</b> = ${V(1,2,4)} + μ${V(1,1,-1)}.`,parts:[
{q:'Show that l₁ and l₂ intersect.',m:4,s:['Equate: x: 2 + λ = 1 + μ, y: 1 + 2λ = 2 + μ, z: −1 + λ = 4 − μ '+M('M1'),'From x: μ = λ + 1. Into y: 1 + 2λ = 3 + λ, so λ = 2 '+M('A1'),'Then μ = 3 '+M('A1'),'z check: −1 + 2 = 1 and 4 − 3 = 1 ✓. A solution exists for all three, so the lines intersect. '+M('R1')]},
{q:'Find the coordinates of the point of intersection.',m:1,s:[`Put λ = 2 in l₁: ${V(2,1,-1)} + 2${V(1,2,1)} = <b>(4, 5, 1)</b> `+M('A1')]},
{q:'Find the acute angle between the lines.',m:3,s:['b₁·b₂ = 1 + 2 − 1 = 2 '+M('M1'),'cos θ = 2 ÷ (√6 × √3) '+M('A1'),'θ = <b>61.9°</b> (3 s.f.) '+M('A1')]}
],tip:'Solve two equations, then test the third. If you check the third and it works, say so in words: that is the R1.',calc:G(`${K('MENU')} → Equation → ${K('F1')} SIMUL, 2 unknowns, using the x and y equations. Then check z by hand.`,`Put the x and y equations in a 2×3 matrix: ${K('2nd')} ${K('x⁻¹')} (MATRIX) → MATH → B:rref(.`)},
{tag:'Paper 2 · calculator',title:'Skew lines',stem:`Lines l₁: <b>r</b> = ${V(1,0,2)} + λ${V(2,1,-1)} and l₂: <b>r</b> = ${V(0,3,1)} + μ${V(1,-1,2)}.`,parts:[
{q:'Show that l₁ and l₂ are skew.',m:4,s:['Equate x and y: 1 + 2λ = μ and λ = 3 − μ '+M('M1'),'Solve: 3λ = 2, so λ = 2/3 and μ = 7/3 '+M('A1'),'z: 2 − 2/3 = 4/3 but 1 + 2(7/3) = 17/3 '+M('A1'),'4/3 ≠ 17/3 and the directions are not parallel, so the lines are skew. '+M('R1')]},
{q:'Find the acute angle between the lines.',m:3,s:['b₁·b₂ = 2 − 1 − 2 = −1 '+M('M1'),'cos θ = |−1| ÷ (√6 × √6) = 1/6 '+M('A1'),'θ = <b>80.4°</b> (3 s.f.) '+M('A1')]},
{q:'Find the shortest distance between the lines.',m:4,s:[`n = b₁ × b₂ = ${V(1,-5,-3)} `+M('M1'),'|n| = √35 '+M('A1'),`(a₂ − a₁)·n = ${V(-1,3,-1)}·${V(1,-5,-3)} = −13 `+M('M1'),'d = 13 ÷ √35 = <b>2.20</b> (3 s.f.) '+M('A1')]}
],tip:'Skew needs two facts: not parallel and no intersection. Showing only the second loses the R1.'},
{tag:'Paper 1 · no calculator',title:'Parallel and coincident',stem:`Lines l₁: <b>r</b> = ${V(3,1,2)} + λ${V(1,2,-1)} and l₂: <b>r</b> = ${V(1,-3,'p')} + μ${V(-2,-4,2)}.`,parts:[
{q:'Show that l₁ and l₂ are parallel.',m:2,s:['b₂ = −2b₁ '+M('M1'),'The directions are multiples, so the lines are parallel. '+M('R1')]},
{q:'Given that l₁ and l₂ are the same line, find p.',m:3,s:['The point (1, −3, p) must lie on l₁. x: 3 + λ = 1, so λ = −2 '+M('M1'),'y: 1 + 2(−2) = −3 ✓ '+M('A1'),'z: p = 2 − (−2) = <b>4</b> '+M('A1')]},
{q:'Given instead that p = 5, find the distance between the lines.',m:3,s:[`AP = ${V(-2,-4,3)}, so AP × b₁ = ${V(-2,1,0)} `+M('M1'),'|AP × b₁| = √5 and |b₁| = √6 '+M('A1'),'d = √5 ÷ √6 = <b>0.913</b> (3 s.f.) '+M('A1')]}
],tip:'Parallel lines are the same line only if one point of line 2 fits line 1. Always test a point.'}
]},

cross:{
method:[
['Compute the product','a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁). Cover the column you are finding: the first component ignores x and uses the other two.'],
['Check it','(a × b)·a = 0 and (a × b)·b = 0. If either fails, you have a slip. This takes ten seconds and saves marks.'],
['Size means area','|a × b| = |a||b| sin θ = area of the parallelogram. Triangle ABC has area ½|AB × AC|.'],
['Direction means normal','a × b is perpendicular to both a and b. This is how you get the normal of a plane from three points.'],
['Order matters','b × a = −(a × b). Swapping flips the sign. The magnitude is unchanged.']
],
types:[
['"Find a × b"','Component formula, then check with dot products'],
['"Find a vector perpendicular to a and b"','a × b (any multiple)'],
['"Find the area of triangle ABC"','½|AB × AC|'],
['"Given |a|, |b| and |a × b|, find θ"','sin θ, then pick the angle with the dot product'],
['"Show a and b are parallel"','a × b = 0']
],
marks:['M1 for a correct attempt at the cross product, A1 for each correct result.','R1 for verifying perpendicular by showing the dot product is zero.','The ½ for a triangle is part of the M1: forget it and the final A1 is lost.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Computing a cross product',stem:`<b>a</b> = ${V(2,-1,3)} and <b>b</b> = ${V(1,4,-2)}.`,parts:[
{q:'Find a × b.',m:2,s:['(−1)(−2) − (3)(4) = −10; (3)(1) − (2)(−2) = 7; (2)(4) − (−1)(1) = 9 '+M('M1'),`<b>a × b = ${V(-10,7,9)}</b> `+M('A1')]},
{q:'Verify that a × b is perpendicular to both a and b.',m:2,s:[`(a × b)·a = −20 − 7 + 27 = 0 `+M('M1'),'(a × b)·b = −10 + 28 − 18 = 0, so it is perpendicular to both. '+M('R1')]},
{q:'Find |a × b|.',m:2,s:['√(100 + 49 + 81) '+M('M1'),'= √230 = <b>15.2</b> (3 s.f.) '+M('A1')]}
],tip:'Do the dot product check in the exam. It is quick, and it tells you whether a sign slipped.',calc:G(`${K('OPTN')} → MAT/VCT → CrossP(Vct A,Vct B). Needs OS 3.x.`,`The TI-84 Plus CE has no cross-product command. Compute the three components by hand, or store them and check with sum().`)},
{tag:'Paper 2 · calculator',title:'Area of a triangle',stem:`A triangle has vertices A(1, 0, 2), B(3, 1, 1) and C(2, 3, 4).`,parts:[
{q:'Find the vectors AB and AC.',m:2,s:[`AB = <b>${V(2,1,-1)}</b> `+M('A1'),`AC = <b>${V(1,3,2)}</b> `+M('A1')]},
{q:'Find AB × AC.',m:2,s:['(1)(2) − (−1)(3) = 5; (−1)(1) − (2)(2) = −5; (2)(3) − (1)(1) = 5 '+M('M1'),`AB × AC = <b>${V(5,-5,5)}</b> `+M('A1')]},
{q:'Find the area of triangle ABC.',m:3,s:['Area = ½|AB × AC| '+M('M1'),'= ½√(25 + 25 + 25) = ½√75 '+M('A1'),'= 5√3/2 ≈ <b>4.33</b> '+M('A1')]},
{q:'Find a unit vector perpendicular to the plane containing A, B and C.',m:2,s:[`|AB × AC| = 5√3, so the unit normal is ${V(5,-5,5)} ÷ 5√3 `+M('M1'),`= <b>(1/√3)${V(1,-1,1)}</b>, or its negative `+M('A1')]}
],tip:'The ½ is easy to forget: the cross product gives the parallelogram, and the triangle is half of it.'},
{tag:'Paper 1 · no calculator',title:'Sine and the 60° / 120° trap',stem:`Vectors <b>a</b> and <b>b</b> satisfy |<b>a</b>| = 3, |<b>b</b>| = 4 and |<b>a</b> × <b>b</b>| = 6√3.`,parts:[
{q:'Find sin θ, where θ is the angle between a and b.',m:2,s:['|a × b| = |a||b| sin θ, so 6√3 = 12 sin θ '+M('M1'),'sin θ = <b>√3/2</b> '+M('A1')]},
{q:'Write down the two possible values of θ.',m:2,s:['sin 60° = √3/2 '+M('A1'),'and sin 120° = √3/2, so θ = <b>60° or 120°</b> '+M('A1')]},
{q:'Given also that a·b = 6, find θ.',m:2,s:['cos θ = 6 ÷ 12 = ½ '+M('M1'),'cos is positive, so θ = <b>60°</b>, not 120° '+M('A1')]},
{q:'Find the area of the triangle with sides a and b.',m:2,s:['Area = ½|a × b| '+M('M1'),'= ½(6√3) = 3√3 ≈ <b>5.20</b> '+M('A1')]}
],tip:'Sine cannot tell an acute angle from its supplement. A dot product, whose sign tells acute from obtuse, settles it.'}
]},

plane:{
method:[
['Get a normal','From three points: n = AB × AC. From two directions: n = b × c. A plane given as ax + by + cz = d already has n = (a, b, c).'],
['Find d with any point','d = n·a for a point a on the plane. Then the plane is r·n = d, or ax + by + cz = d.'],
['Three forms','Vector: r = a + λb + μc. Normal: r·n = d. Cartesian: ax + by + cz = d. Convert using n = b × c and d = n·a.'],
['Distance from a point','d = |n·p − d| ÷ |n|. Substitute the point into the left of the plane equation first.'],
['Intercepts and tests','Axis intercepts: set the other two variables to 0. A point is on the plane if it satisfies the equation.']
],
types:[
['"Find the equation of the plane through A, B, C"','AB × AC, then d = n·a'],
['"Convert r = a + λb + μc to Cartesian"','n = b × c, d = n·a'],
['"Find the distance from P to the plane"','|n·p − d| ÷ |n|'],
['"Find where the plane meets the axes"','Zero out the other two variables'],
['"Find the foot of the perpendicular"','Line through P along n, substitute into the plane']
],
marks:['M1 for the cross product used for the normal, A1 for n.','M1 for n·a to find d, A1 for the equation.','A1 for the distance to 3 s.f. when it is not exact.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Plane through three points',stem:`The plane Π contains A(1, 2, 0), B(3, −1, 1) and C(0, 1, 2).`,parts:[
{q:'Find the vectors AB and AC.',m:2,s:[`AB = <b>${V(2,-3,1)}</b> `+M('A1'),`AC = <b>${V(-1,-1,2)}</b> `+M('A1')]},
{q:'Find a normal to Π.',m:3,s:['Cross product: first component (−3)(2) − (1)(−1) = −5, and the others follow the same pattern '+M('M1'),`AB × AC = ${V(-5,-5,-5)} `+M('A1'),`A simpler normal is <b>n = ${V(1,1,1)}</b> `+M('A1')]},
{q:'Find the Cartesian equation of Π.',m:2,s:['d = n·a = (1)(1) + (1)(2) + (1)(0) = 3 '+M('M1'),'<b>x + y + z = 3</b> '+M('A1'),'Check B: 3 − 1 + 1 = 3 ✓ and C: 0 + 1 + 2 = 3 ✓']}
],tip:'Always check the other two points in your final equation. It catches a bad normal or a wrong d.'},
{tag:'Paper 2 · calculator',title:'Distance and foot of the perpendicular',stem:`The plane Π has equation 2x − y + 2z = 6. The point P has coordinates (1, −2, 3).`,parts:[
{q:'Find the distance from P to Π.',m:2,s:['|2(1) − (−2) + 2(3) − 6| ÷ √(4 + 1 + 4) '+M('M1'),'= 4 ÷ 3 = <b>4/3</b> '+M('A1')]},
{q:'Find the coordinates of the foot of the perpendicular from P to Π.',m:4,s:[`The line through P along the normal: <b>r</b> = ${V(1,-2,3)} + t${V(2,-1,2)} `+M('M1'),'Substitute: 2(1 + 2t) − (−2 − t) + 2(3 + 2t) = 6, so 10 + 9t = 6 '+M('M1'),'t = −4/9 '+M('A1'),`Foot = ${V(1,-2,3)} − (4/9)${V(2,-1,2)} = <b>(1/9, −14/9, 19/9)</b> `+M('A1')]}
],tip:'Check: the distance from P to the foot is |t| × |n| = (4/9)(3) = 4/3, which matches part (a).'},
{tag:'Paper 1 · no calculator',title:'Vector form to Cartesian',stem:`A plane has equation <b>r</b> = ${V(1,2,3)} + λ${V(1,0,2)} + μ${V(0,1,-1)}.`,parts:[
{q:'Find a normal to the plane.',m:2,s:[`<b>n</b> = ${V(1,0,2)} × ${V(0,1,-1)} `+M('M1'),`= <b>${V(-2,1,1)}</b> `+M('A1')]},
{q:'Find the Cartesian equation of the plane.',m:2,s:['d = n·a = (−2)(1) + (1)(2) + (1)(3) = 3 '+M('M1'),'<b>−2x + y + z = 3</b> '+M('A1')]},
{q:'Find where the plane meets each coordinate axis.',m:3,s:['x-axis (y = z = 0): −2x = 3, so x = <b>−3/2</b> '+M('A1'),'y-axis (x = z = 0): y = <b>3</b> '+M('A1'),'z-axis (x = y = 0): z = <b>3</b> '+M('A1')]}
],tip:'Directions go in the cross product, never the point. The point is only for finding d.'}
]},

lp:{
method:[
['Substitute the line into the plane','x = a₁ + λb₁ etc. goes into ax + by + cz = d. You get one linear equation in λ.'],
['Three outcomes','One solution for λ: the line meets the plane at a point. No solution (0 = non-zero): parallel, never meet. 0 = 0: the line lies in the plane.'],
['Quick parallel test','b·n = 0 means the line is parallel to the plane. Then check a·n against d to see if it lies in it.'],
['Angle with the plane','sin θ = |b·n| ÷ (|b||n|). The angle with the normal uses cos, so the angle with the plane uses sin.'],
['Foot and reflection','Foot of the perpendicular from P: line through P along n, then substitute. Reflection P′ = 2F − P.']
],
types:[
['"Find where the line meets the plane"','Substitute, solve λ, back into the line'],
['"Find the angle between the line and the plane"','sin θ = |b·n| ÷ (|b||n|)'],
['"Find k so the line is parallel to the plane"','b·n = 0'],
['"Show the line lies in the plane"','b·n = 0 and a·n = d'],
['"Find the reflection of P in the plane"','Foot F, then 2F − P']
],
marks:['M1 for substituting the line into the plane.','A1 for λ, and A1 for the point of intersection.','M1 for using sin (not cos) in the angle formula, A1 for the final answer.'],
ex:[
{tag:'Paper 2 · calculator',title:'Meeting point and angle',stem:`The line l: <b>r</b> = ${V(1,2,-1)} + λ${V(2,1,3)} and the plane Π: x + 2y − z = 9.`,parts:[
{q:'Find the coordinates of the point where l meets Π.',m:3,s:['Substitute: (1 + 2λ) + 2(2 + λ) − (−1 + 3λ) = 9 '+M('M1'),'6 + λ = 9, so λ = 3 '+M('A1'),`Point = ${V(1,2,-1)} + 3${V(2,1,3)} = <b>(7, 5, 8)</b> `+M('A1')]},
{q:'Find the angle between l and Π.',m:4,s:[`b·n = ${V(2,1,3)}·${V(1,2,-1)} = 1 `+M('M1'),'|b||n| = √14 × √6 = √84 '+M('A1'),'sin θ = 1 ÷ √84 (sin, because θ is with the plane, not the normal) '+M('M1'),'θ = <b>6.26°</b> (3 s.f.) '+M('A1')]}
],tip:'A very small angle with the plane means the line is almost parallel to it. 6° is plausible here because b·n is tiny compared with |b||n|.'},
{tag:'Paper 1 · no calculator',title:'Parallel to a plane',stem:`The line l: <b>r</b> = ${V(1,1,3)} + λ${V('k',1,2)} and the plane Π: x + y − z = 3.`,parts:[
{q:'Given that l is parallel to Π, find k.',m:3,s:['Parallel means b·n = 0 '+M('M1'),'k + 1 − 2 = 0 '+M('A1'),'<b>k = 1</b> '+M('A1')]},
{q:'Show that l does not lie in Π.',m:2,s:['a·n = 1 + 1 − 3 = −1 '+M('M1'),'−1 ≠ 3, so the point (1, 1, 3) is not on Π. l is parallel but not in the plane. '+M('R1')]},
{q:'Find the distance between l and Π.',m:2,s:['Take any point on l, say (1, 1, 3): |−1 − 3| ÷ √3 '+M('M1'),'= <b>4/√3 ≈ 2.31</b> '+M('A1')]}
],tip:'Parallel line and plane: every point of the line is the same distance from the plane, so one point is enough.'},
{tag:'Paper 2 · calculator',title:'Foot and reflection',stem:`The point P has coordinates (2, 1, 3) and the plane Π has equation x + y + z = 3.`,parts:[
{q:'Find the distance from P to Π.',m:2,s:['|2 + 1 + 3 − 3| ÷ √3 '+M('M1'),'= <b>√3 ≈ 1.73</b> '+M('A1')]},
{q:'Find the foot F of the perpendicular from P to Π.',m:3,s:[`The line through P along n: ${V('2 + t','1 + t','3 + t')} `+M('M1'),'Substitute: 6 + 3t = 3, so t = −1 '+M('A1'),'F = <b>(1, 0, 2)</b> '+M('A1')]},
{q:'Find the reflection of P in Π.',m:2,s:['F is the midpoint of PP′, so p′ = 2f − p '+M('M1'),'= (2 − 2, 0 − 1, 4 − 3) = <b>(0, −1, 1)</b> '+M('A1')]}
],tip:'Check the reflection: it is on the opposite side of the plane, and 0 + (−1) + 1 = 0 < 3 while P gives 6 > 3.'}
]},

pp:{
method:[
['Two planes: line or parallel','Normals not parallel: the planes meet in a line with direction n₁ × n₂. Normals parallel: no meeting (or the same plane).'],
['Angle between planes','Angle between the normals: cos θ = |n₁·n₂| ÷ (|n₁||n₂|). The right-hand sides do not matter.'],
['Three planes: det first','If the coefficient determinant is non-zero, the planes meet at exactly one point. If it is zero, they meet in a line or have no common point.'],
['Zero determinant: consistent?','Add multiples of the equations to eliminate. A true statement (0 = 0) means a line of solutions. A false one (0 = 5) means no common point.'],
['Name the no-solution case','Prism: every pair meets, but there is no common point, and the three lines are parallel. Two parallel planes: two normals are multiples.']
],
types:[
['"Find the angle between two planes"','Normals, absolute value'],
['"Find the line where two planes meet"','Direction n₁ × n₂, plus a point from setting one variable'],
['"For what k does the system have no unique solution"','Determinant = 0'],
['"Show the system is inconsistent"','Eliminate and reach a contradiction'],
['"Describe the geometrical arrangement"','Use the normals and the consistency result']
],
marks:['M1 for the elimination or determinant step.','A1 for each of the correct k and the correct solution.','R1 for describing the geometry, naming prism, parallel, or line.'],
ex:[
{tag:'Paper 2 · calculator',title:'Two planes',stem:`Planes Π₁: x + 2y − z = 3 and Π₂: 2x − y + 3z = 1.`,parts:[
{q:'Find the acute angle between Π₁ and Π₂.',m:3,s:[`n₁·n₂ = ${V(1,2,-1)}·${V(2,-1,3)} = −3 `+M('M1'),'cos θ = 3 ÷ (√6 × √14) '+M('A1'),'θ = <b>70.9°</b> (3 s.f.) '+M('A1')]},
{q:'Find a vector in the direction of the line where Π₁ and Π₂ meet.',m:2,s:[`n₁ × n₂ = ${V(5,-5,-5)} `+M('M1'),`<b>${V(1,-1,-1)}</b> is a simpler direction `+M('A1')]},
{q:'Find a vector equation of the line of intersection.',m:3,s:['Set z = 0: x + 2y = 3 and 2x − y = 1 '+M('M1'),'x = 1, y = 1, so (1, 1, 0) is on both planes '+M('A1'),`<b>r = ${V(1,1,0)} + t${V(1,-1,-1)}</b> `+M('A1')]}
],tip:'The right-hand sides (3 and 1) never affect the angle or the direction: only the normals do.'},
{tag:'Paper 1 · no calculator',title:'A system with a parameter',stem:`Consider the planes x + 2y − z = 4, 2x − y + z = 1 and 3x + y + kz = 5.`,parts:[
{q:'Find the value of k for which the system does not have a unique solution.',m:3,s:[`n₁ × n₂ = ${V(1,-3,-5)} `+M('M1'),`det = n₃·(n₁ × n₂) = ${V(3,1,'k')}·${V(1,-3,-5)} = 3 − 3 − 5k = −5k `+M('A1'),'−5k = 0, so <b>k = 0</b> '+M('A1')]},
{q:'For this value of k, show that the planes intersect in a line.',m:2,s:['Add the first two equations: 3x + y = 5, which is exactly the third equation (k = 0) '+M('M1'),'So the third plane contains the line of the first two: the system is consistent with infinitely many solutions. '+M('R1')]},
{q:'Find a vector equation of this line.',m:3,s:[`Direction = n₁ × n₂ = ${V(1,-3,-5)} `+M('A1'),'Set z = 0: x + 2y = 4 and 2x − y = 1, so x = 6/5, y = 7/5 '+M('M1'),`<b>r = ${V('6/5','7/5',0)} + t${V(1,-3,-5)}</b> `+M('A1')]},
{q:'For k = 1, find the coordinates of the point of intersection.',m:2,s:['det = −5 ≠ 0, so there is exactly one point '+M('M1'),'Solving: x = 6/5, y = 7/5, z = 0, so <b>(6/5, 7/5, 0)</b> '+M('A1')]}
],tip:'det = n₃·(n₁ × n₂) is quicker than expanding a 3×3 determinant when k is in only one row.',calc:G(`${K('MENU')} → Equation → ${K('F1')} SIMUL → 3 unknowns for the k = 1 case. With k as a letter, use the by-hand determinant.`,`${K('2nd')} ${K('x⁻¹')} (MATRIX) → EDIT a 3×4 matrix, then MATH → B:rref(. For k = 1 the last column gives the point.`)},
{tag:'Paper 1 · no calculator',title:'A triangular prism',stem:`Consider the planes Π₁: x − y + 2z = 1, Π₂: 2x + y − z = 2 and Π₃: 3x + z = 4.`,parts:[
{q:'Show that the three planes have no common point.',m:3,s:['Add Π₁ and Π₂: (1 + 2)x + (−1 + 1)y + (2 − 1)z = 1 + 2 '+M('M1'),'The y terms cancel: 3x + z = 3 '+M('A1'),'But Π₃ says 3x + z = 4, a contradiction. There is no solution. '+M('R1')]},
{q:'Show that no two of the planes are parallel.',m:2,s:[`The normals ${V(1,-1,2)}, ${V(2,1,-1)}, ${V(3,0,1)} are not multiples of each other `+M('M1'),'So every pair of planes meets in a line, and the three planes form a <b>triangular prism</b>. '+M('R1')]},
{q:'Find the direction of the line where Π₁ and Π₂ meet.',m:2,s:[`n₁ × n₂ = ${V(-1,5,3)} `+M('M1'),`Direction <b>${V(-1,5,3)}</b>. The other two lines have the same direction. `+M('A1')]}
],tip:'The three lines of a prism are parallel: n₁ × n₃ = (−1, 5, 3) too. No-solution and no parallel planes means prism.'}
]}
};
window.LAB.L=Object.assign(window.LAB.L,L);
Object.assign(window.LAB.TITLES,{vec:'vector basics',dot:'the scalar product',line:'lines in 3D',lines2:'two lines',cross:'the vector product',plane:'planes',lp:'a line and a plane',pp:'planes meeting'});
})();
