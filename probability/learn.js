/* Probability: How-to-answer guides and worked examples for every topic.
   Each topic gets a method panel and a set of exam-style worked examples whose
   solutions reveal one step at a time. Calculator lines follow the Casio/TI choice. */
(function(){
"use strict";
const {K,G,M}=window.LAB;

const L={
basics:{
method:[
['List what you are given','Write each value with notation: P(A) = 0.4, P(A ∪ B) = 0.7. Half the battle is spotting which region each number describes.'],
['Draw the Venn, fill it from the middle','Overlap first, then the "only" regions (P(A) − P(A ∩ B)), then outside = 1 − P(A ∪ B). If the overlap is unknown, call it x and write every region in terms of x.'],
['Translate the words into a region','"both" = A ∩ B. "either / at least one" = A ∪ B. "neither" = (A ∪ B)′. "exactly one" = the two "only" regions. "A but not B" = A ∩ B′.'],
['Read off or add regions','Use the addition rule to fill any gap. Regions never overlap, so adding them is always safe.'],
['Answer tests in a full sentence','Independence: work out P(A)P(B) and P(A ∩ B) separately, compare them, then state the conclusion. Mutually exclusive: check whether P(A ∩ B) = 0.']
],
types:[
['"Find P(A ∪ B)" or "Find P(A ∩ B)"','Addition rule, rearranged if needed'],
['"Show that A and B are independent"','Compute both sides and show they are equal. A "show that" needs every number written'],
['"Are A and B mutually exclusive? Justify"','Point to P(A ∩ B): zero or not'],
['Venn with counts (n students)','Fill the counts, check they add to n, then divide by n'],
['"A and B are independent… find x"','Replace P(A ∩ B) with P(A)P(B) in the addition rule and solve']
],
marks:['M1 for the correct formula with your numbers substituted, even if the arithmetic slips.','A1 for the final answer. Exact fractions or 3 s.f.','R1 for a reason in words: "since P(A ∩ B) = P(A)P(B), A and B are independent".'],
ex:[
{tag:'Paper 1 · no calculator',title:'Using the addition rule',stem:'Events A and B satisfy P(A) = 0.4, P(B) = 0.5 and P(A ∪ B) = 0.7.',parts:[
{q:'Find P(A ∩ B).',m:2,s:['Write the addition rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).','Substitute: 0.7 = 0.4 + 0.5 − P(A ∩ B) '+M('M1'),'P(A ∩ B) = 0.9 − 0.7 = <b>0.2</b> '+M('A1')]},
{q:'Show that A and B are independent.',m:2,s:['Independent means P(A ∩ B) = P(A) × P(B). Work out the right-hand side.','P(A) × P(B) = 0.4 × 0.5 = 0.2 '+M('M1'),'This equals P(A ∩ B) = 0.2, so A and B are independent. '+M('R1')]},
{q:'Find P(A ∩ B′).',m:2,s:['A ∩ B′ is "A but not B": the part of circle A outside the overlap.','P(A ∩ B′) = P(A) − P(A ∩ B) = 0.4 − 0.2 '+M('M1'),'= <b>0.2</b> '+M('A1')]}
],tip:'In a "show that", the conclusion sentence earns a mark. Writing "0.2 = 0.2" without "so A and B are independent" loses it.'},
{tag:'Paper 1 · no calculator',title:'A Venn diagram with counts',stem:'In a class of 30 students, 18 study Economics (E), 12 study Physics (P) and 5 study neither.',parts:[
{q:'Find the number of students who study both subjects.',m:2,s:['Students in at least one subject: 30 − 5 = 25.','Both = 18 + 12 − 25 '+M('M1'),'= <b>5</b> '+M('A1')]},
{q:'A student is chosen at random. Find the probability they study exactly one subject.',m:2,s:['Economics only: 18 − 5 = 13. Physics only: 12 − 5 = 7.','Exactly one: 13 + 7 = 20 students '+M('M1'),'P = 20/30 = <b>2/3</b> '+M('A1')]},
{q:'Determine whether E and P are independent. Justify your answer.',m:3,s:['P(E) = 18/30 = 0.6 and P(P) = 12/30 = 0.4.','P(E) × P(P) = 0.24 '+M('M1'),'P(E ∩ P) = 5/30 = 0.1667 '+M('A1'),'0.1667 ≠ 0.24, so E and P are <b>not independent</b>. '+M('R1')]}
],tip:'Check your Venn: 13 + 5 + 7 + 5 = 30. If the regions don\'t add to the total, stop and fix it before answering.'},
{tag:'Paper 1 · no calculator',title:'Independence with an unknown',stem:'A and B are independent events with P(A) = x, P(B) = 0.3 and P(A ∪ B) = 0.58.',parts:[
{q:'Find x.',m:3,s:['Independent, so P(A ∩ B) = P(A)P(B) = 0.3x.','Addition rule: 0.58 = x + 0.3 − 0.3x '+M('M1'),'0.7x = 0.28 '+M('A1'),'x = <b>0.4</b> '+M('A1')]},
{q:'Find P(A′ ∩ B′).',m:2,s:['A′ ∩ B′ is "neither", the region outside both circles.','P(A′ ∩ B′) = 1 − P(A ∪ B) = 1 − 0.58 '+M('M1'),'= <b>0.42</b> '+M('A1'),'Check: complements of independent events are independent, so (1 − 0.4)(1 − 0.3) = 0.42 ✓']}
],tip:'Whenever a question says "independent" and has an unknown, the move is to replace P(A ∩ B) with a product.'}
]},
conditional:{
method:[
['Find the condition','Look for "given", "if", "of those who", "knowing that". Whatever follows becomes the denominator.'],
['Pick the tool','Two-way table: read a row or column. Events in stages ("then", "second"): tree diagram. Values handed to you: P(A | B) = P(A ∩ B) / P(B).'],
['Build the tree carefully','Each set of branches from one point adds to 1. The second-stage probabilities are conditional on the first stage. Without replacement, reduce both the total and the colour taken.'],
['Multiply along, add across','List every path that satisfies the event. Multiply along each path, then add the paths.'],
['Reverse conditionals','If you are asked P(first | second), find P(second) first by adding all its paths, then divide the path you want by it.']
],
types:[
['Two-way table, "given that…"','Restrict to the row or column named in the condition'],
['"Two are drawn without replacement"','Tree with denominators n and n − 1'],
['"Given that the second was red, find P(first red)"','One path ÷ all paths ending in "second red"'],
['"At least one… over several days"','1 − P(none), with independent repeats multiplied'],
['"Show that P(…) = 13/28"','Write every path and the sum. Leave fractions exact']
],
marks:['M1 for a correct tree or correct use of the conditional formula.','A1 for each correct path product.','Exact fractions are expected on Paper 1. Simplify only if asked.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Reading a two-way table',stem:'80 students were asked how they travel to school.<div class="tablewrap"><table class="mini"><tr><th></th><th>Walk</th><th>Bus</th><th>Total</th></tr><tr><th>Year 11</th><td>18</td><td>22</td><td>40</td></tr><tr><th>Year 12</th><td>26</td><td>14</td><td>40</td></tr><tr><th>Total</th><td>44</td><td>36</td><td>80</td></tr></table></div>',parts:[
{q:'Find P(a student walks).',m:1,s:['44 of the 80 students walk: P = 44/80 = <b>11/20</b> '+M('A1')]},
{q:'Find P(walks | Year 12).',m:2,s:['The condition is "Year 12", so only use the Year 12 row: 40 students.','Of those, 26 walk '+M('M1'),'P = 26/40 = <b>13/20</b> '+M('A1')]},
{q:'Find P(Year 12 | walks).',m:2,s:['Now the condition is "walks", so use the Walk column: 44 students.','Of those, 26 are in Year 12 '+M('M1'),'P = 26/44 = <b>13/22</b> '+M('A1')]},
{q:'Are "walks" and "Year 12" independent? Give a reason.',m:2,s:['If independent, P(walks | Year 12) would equal P(walks).','13/20 ≠ 11/20 '+M('M1'),'So they are <b>not independent</b>: knowing the year changes the chance of walking. '+M('R1')]}
],tip:'Parts (b) and (c) use the same 26 but different denominators. That swap is exactly what examiners test.'},
{tag:'Paper 1 · no calculator',title:'Without replacement',stem:'A bag has 5 red and 3 green counters. Two are taken at random without replacement.',parts:[
{q:'Draw a tree diagram to show the possible outcomes.',m:2,s:['First draw: R 5/8, G 3/8.','After a red: R 4/7, G 3/7. After a green: R 5/7, G 2/7 '+M('A1 A1'),'Check: each pair of branches adds to 1.']},
{q:'Show that the probability both counters are the same colour is 13/28.',m:3,s:['Same colour = RR or GG.','P(RR) = 5/8 × 4/7 = 20/56 and P(GG) = 3/8 × 2/7 = 6/56 '+M('M1 A1'),'P(same) = 20/56 + 6/56 = 26/56 = 13/28 '+M('A1')]},
{q:'Given that both counters are the same colour, find the probability that they are both red.',m:2,s:['Condition: "same colour", probability 26/56.','P(RR | same) = P(RR) / P(same) = (20/56) ÷ (26/56) '+M('M1'),'= 20/26 = <b>10/13</b> '+M('A1')]}
],tip:'Keep the 56ths unsimplified until the end. They cancel cleanly in the conditional step.'},
{tag:'Paper 2 · calculator',title:'Total probability and repeated days',stem:'On any day, the probability of rain is 0.3. If it rains, the probability Mia is late is 0.4. If it does not rain, the probability she is late is 0.1.',parts:[
{q:'Find the probability Mia is late on a given day.',m:2,s:['Two paths end in "late": rain then late, no rain then late.','P(late) = 0.3 × 0.4 + 0.7 × 0.1 '+M('M1'),'= 0.12 + 0.07 = <b>0.19</b> '+M('A1')]},
{q:'Given that Mia is late, find the probability that it rained.',m:2,s:['Reverse conditional: rain-and-late path over all late paths.','P(rain | late) = 0.12 / 0.19 '+M('M1'),'= 12/19 = <b>0.632</b> (3 s.f.) '+M('A1')]},
{q:'Days are independent. Find the probability she is late on at least one of two days.',m:2,s:['At least one = 1 − P(on time both days).','P(on time) = 1 − 0.19 = 0.81, so P(on time twice) = 0.81² = 0.6561 '+M('M1'),'P(late at least once) = 1 − 0.6561 = <b>0.344</b> (3 s.f.) '+M('A1')]}
],tip:'"At least one" over repeated trials is almost always faster as 1 − none.'}
]},
bayes:{
method:[
['Separate cause from evidence','The cause happens first (the machine, the disease, the supplier). The evidence is what you observe (defective, positive test).'],
['Draw the tree cause → evidence','Priors on the first branches, then P(evidence | each cause). Fill complements so each set adds to 1.'],
['Numerator: one path','The cause you are asked about, followed by the evidence.'],
['Denominator: every path to the evidence','Add all paths ending in the evidence. This is the total probability of the evidence.'],
['Divide, then sanity-check','Compare with the prior. A positive test should raise the probability of disease, but with a rare condition it may still be small.']
],
types:[
['"Given the item is defective, which machine?"','Defective path for that machine ÷ all defective paths'],
['Medical or screening test','Prevalence is the prior. A false positive is P(+ | healthy)'],
['Two tests in a row','Use the first answer as the new prior, or multiply the conditionals'],
['Unknown conditional, given the posterior','Set up path ÷ total = given value and solve'],
['Answer looks surprisingly low','Imagine 10 000 people and count to check']
],
marks:['M1 for a correct numerator and M1 for a correct denominator. They are often marked separately.','A1 for the final answer (3 s.f. unless exact).','An unlabelled tree usually earns nothing. Label the events and the probabilities.'],
ex:[
{tag:'Paper 2 · calculator',title:'Three machines',stem:'Machines A, B and C make 50%, 30% and 20% of a factory\'s output. The percentages of defective items they make are 2%, 3% and 5% respectively.',parts:[
{q:'Find the probability that a randomly chosen item is defective.',m:2,s:['Three paths end in "defective".','P(D) = 0.5(0.02) + 0.3(0.03) + 0.2(0.05) '+M('M1'),'= 0.010 + 0.009 + 0.010 = <b>0.029</b> '+M('A1')]},
{q:'An item is defective. Find the probability it was made by machine C.',m:2,s:['Path for C then defective: 0.2 × 0.05 = 0.010.','P(C | D) = 0.010 / 0.029 '+M('M1'),'= <b>0.345</b> (3 s.f.) '+M('A1'),'Notice C makes only 20% of items but accounts for over a third of the defects.']},
{q:'An item is not defective. Find the probability it was made by machine A.',m:3,s:['Now the evidence is "not defective": P(D′) = 1 − 0.029 = 0.971 '+M('A1'),'Path for A then not defective: 0.5 × 0.98 = 0.49 '+M('M1'),'P(A | D′) = 0.49 / 0.971 = <b>0.505</b> (3 s.f.) '+M('A1')]}
],tip:'When the evidence changes (defective to not defective), rebuild both the numerator and the denominator.'},
{tag:'Paper 2 · calculator',title:'A screening test',stem:'A condition affects 1% of a population. A test gives a positive result for 98% of people with the condition and for 4% of people without it.',parts:[
{q:'Find the probability that a randomly chosen person tests positive.',m:2,s:['P(+) = 0.01 × 0.98 + 0.99 × 0.04 '+M('M1'),'= 0.0098 + 0.0396 = <b>0.0494</b> '+M('A1')]},
{q:'A person tests positive. Find the probability they have the condition.',m:2,s:['P(C | +) = 0.0098 / 0.0494 '+M('M1'),'= <b>0.198</b> (3 s.f.) '+M('A1'),'Count check with 10 000 people: 100 have it and 98 test positive; 9 900 don\'t and 396 test positive. 98 / 494 ≈ 0.198 ✓']},
{q:'The person takes the test again. Results are independent given whether they have the condition. Find the probability they have the condition if both tests are positive.',m:3,s:['P(C ∩ ++) = 0.01 × 0.98² = 0.009604 '+M('M1'),'P(C′ ∩ ++) = 0.99 × 0.04² = 0.001584 '+M('M1'),'P(C | ++) = 0.009604 / (0.009604 + 0.001584) = <b>0.858</b> (3 s.f.) '+M('A1'),'Same answer if you use 0.198 from (b) as the new prior. Bayes updates step by step.']}
],tip:'A low answer in (b) is not an error. It is the base-rate effect, and examiners like asking you to comment on it.'},
{tag:'Paper 1 · no calculator',title:'Working backwards from the posterior',stem:'A student is well prepared (W) for a test with probability 0.7. P(pass | W) = 0.9 and P(pass | W′) = k. Given that the student passes, the probability they were well prepared is 0.84.',parts:[
{q:'Find k.',m:4,s:['Path W then pass: 0.7 × 0.9 = 0.63. Path W′ then pass: 0.3k.','P(W | pass) = 0.63 / (0.63 + 0.3k) = 0.84 '+M('M1 A1'),'0.63 = 0.5292 + 0.252k, so 0.1008 = 0.252k '+M('M1'),'k = <b>0.4</b> '+M('A1')]}
],tip:'Write the Bayes fraction with the unknown in it first, then cross-multiply. Don\'t try to guess k.'}
]},
counting:{
method:[
['Does order matter?','Positions, codes, rankings, arrangements: order matters, use permutations. Teams, committees, hands, selections: order doesn\'t, use combinations.'],
['Deal with restrictions first','Fixed positions: place those items first. Must be together: glue into one block. Must be apart: total − together. Identical items: divide by the factorial of each repeat.'],
['Break it into stages','"And" between stages means multiply. Separate cases ("2 girls or 3 girls") means add.'],
['"At least one" → complement','Total − none. Never "choose one, then choose the rest", because that double counts.'],
['For probability, count both the same way','Favourable ÷ total, with both counts ordered or both unordered.']
],
types:[
['Arrangements of a word','n! ÷ (repeat factorials)'],
['"…must be next to each other"','Glue them, arrange the blocks, × internal arrangements'],
['"…must not be next to each other"','Total − together'],
['Committee with "exactly k" of a type','ᵃCₖ × ᵇC₍ᵣ₋ₖ₎'],
['Probability of a selection','Favourable combinations ÷ total combinations']
],
marks:['M1 for a correct product or quotient structure, e.g. 8! ÷ (2! 3!).','A1 for the number.','Show the structure even when the calculator does the arithmetic. The structure carries the method mark.'],
ex:[
{tag:'Paper 1 · no calculator',title:'Arranging letters with repeats',stem:'Consider the letters of the word PARALLEL.',parts:[
{q:'Find the number of different arrangements of all 8 letters.',m:2,s:['Repeats: A appears 2 times, L appears 3 times.','8! ÷ (2! × 3!) '+M('M1'),'= 40 320 ÷ 12 = <b>3360</b> '+M('A1')]},
{q:'Find the number of arrangements that begin with P.',m:2,s:['Fix P in the first slot. Arrange the other 7 letters (A×2, L×3).','7! ÷ (2! × 3!) '+M('M1'),'= 5040 ÷ 12 = <b>420</b> '+M('A1')]},
{q:'Find the number of arrangements in which all three L\'s are together.',m:3,s:['Glue LLL into one block. Units: P, A, R, A, E, [LLL]: 6 units with A repeated.','The L\'s are identical, so the block has only 1 internal arrangement.','6! ÷ 2! '+M('M1 M1'),'= 720 ÷ 2 = <b>360</b> '+M('A1')]}
],tip:'With identical letters inside a block, the internal arrangements are 1, not 3!. Only distinct items swap.'},
{tag:'Paper 1 · no calculator',title:'Choosing a committee',stem:'A committee of 4 is chosen from 6 boys and 4 girls.',parts:[
{q:'Find the number of committees with exactly 2 girls.',m:2,s:['Choose the girls and the boys separately, then multiply.','⁴C₂ × ⁶C₂ = 6 × 15 '+M('M1'),'= <b>90</b> '+M('A1')]},
{q:'Find the number of committees with at least one girl.',m:3,s:['Total committees: ¹⁰C₄ = 210 '+M('A1'),'No girls (all boys): ⁶C₄ = 15','At least one girl = 210 − 15 = <b>195</b> '+M('M1 A1')]},
{q:'The committee is chosen at random. Find the probability it has exactly 2 girls.',m:2,s:['Favourable ÷ total, both as combinations.','90 / 210 '+M('M1'),'= <b>3/7</b> '+M('A1')]}
],tip:'Sanity check: the committees with 0 to 4 girls (15 + 80 + 90 + 24 + 1) add to 210.',calc:G(`${K('OPTN')} → ${K('F6')} → ${K('F3')} PROB → ${K('F3')} nCr for ¹⁰C₄.`,`${K('MATH')} → PROB → 3:nCr. Type 10 nCr 4.`)},
{tag:'Paper 1 · no calculator',title:'People in a row',stem:'Seven people, including Ana and Ben, sit in a row of seven seats.',parts:[
{q:'Find the number of arrangements in which Ana and Ben sit next to each other.',m:2,s:['Glue Ana and Ben: 6 units to arrange, 6! = 720.','Inside the block, AB or BA: × 2 '+M('M1'),'= <b>1440</b> '+M('A1')]},
{q:'Find the number of arrangements in which they do not sit next to each other.',m:2,s:['Total: 7! = 5040.','5040 − 1440 '+M('M1'),'= <b>3600</b> '+M('A1')]},
{q:'Find the probability that Ana and Ben sit at the two ends.',m:2,s:['Ana and Ben at the ends: 2 ways. The other 5 fill the middle: 5! = 120.','Favourable = 2 × 120 = 240 '+M('M1'),'P = 240 / 5040 = <b>1/21</b> '+M('A1')]}
],tip:'"Not together" is almost always total minus together. Counting the gaps directly is possible but slower.'}
]},
discrete:{
method:[
['Use Σ P = 1 for any unknown','Write the sum of the probabilities equal to 1 and solve. Also check every probability is between 0 and 1.'],
['Extend the table for E(X)','Add a row of x·P(X = x) and sum it. E(X) need not be a value X can take.'],
['Add an x² row for the variance','E(X²) = Σ x²·P(X = x). Then Var(X) = E(X²) − [E(X)]². Square the x-values, not the probabilities.'],
['Define gain for games','Gain = prize − cost to play. Fair means E(gain) = 0.'],
['Transforms use the rules, not a new table','E(aX + b) = aE(X) + b and Var(aX + b) = a²Var(X).']
],
types:[
['"Find k" in a table or formula','Σ P = 1'],
['Two unknowns p, q and a given E(X)','Two equations: Σ P = 1 and Σ xP = E(X)'],
['"Is the game fair?"','E(gain) = 0? Include the stake'],
['P(X ≥ a) from a table','Add the relevant columns. Watch strict versus non-strict'],
['Var or SD of 3X − 2','a²Var(X); SD = |a|σ']
],
marks:['M1 for Σ P = 1 written with your terms.','M1 for Σ x·P with at least most terms correct.','A1 for each final value. Exact answers on Paper 1.'],
ex:[
{tag:'Paper 1 · no calculator',title:'A distribution given by a formula',stem:'X has probability distribution P(X = x) = k(x + 1) for x = 0, 1, 2, 3.',parts:[
{q:'Find k.',m:2,s:['Probabilities: k, 2k, 3k, 4k.','k + 2k + 3k + 4k = 10k = 1 '+M('M1'),'k = <b>0.1</b> '+M('A1')]},
{q:'Find E(X).',m:2,s:['E(X) = 0(0.1) + 1(0.2) + 2(0.3) + 3(0.4) '+M('M1'),'= 0 + 0.2 + 0.6 + 1.2 = <b>2</b> '+M('A1')]},
{q:'Find Var(X).',m:3,s:['E(X²) = 0(0.1) + 1(0.2) + 4(0.3) + 9(0.4) '+M('M1'),'= 0.2 + 1.2 + 3.6 = 5 '+M('A1'),'Var(X) = 5 − 2² = <b>1</b> '+M('A1')]},
{q:'Find P(X ≥ 2).',m:1,s:['P(X = 2) + P(X = 3) = 0.3 + 0.4 = <b>0.7</b> '+M('A1')]}
],tip:'Write out the probabilities as a table first. It stops you mixing up x and P(X = x) in the sums.',calc:G(`Check with ${K('MENU')} → <b>Statistics</b>: x in List 1, P in List 2, 1-VAR. x̄ = 2, σx = 1.`,`Check with ${K('STAT')} → 1-Var Stats, List L1, FreqList L2. x̄ = 2, σx = 1.`)},
{tag:'Paper 1 · no calculator',title:'Is the game fair?',stem:'A player pays $c to roll a fair six-sided die. They win $10 for a six, $4 for a four or a five, and nothing otherwise.',parts:[
{q:'Find the expected amount the player wins, before paying.',m:2,s:['E(winnings) = 10 × 1/6 + 4 × 2/6 + 0 × 3/6 '+M('M1'),'= 18/6 = <b>$3</b> '+M('A1')]},
{q:'Find the value of c for the game to be fair.',m:2,s:['Fair: E(gain) = E(winnings) − c = 0 '+M('M1'),'c = <b>$3</b> '+M('A1')]},
{q:'The cost is $4. Find the expected total gain over 30 games.',m:2,s:['Expected gain per game = 3 − 4 = −$1 '+M('M1'),'Over 30 games: <b>−$30</b>, an expected loss of $30 '+M('A1')]}
],tip:'Always define what X is: prize won, or gain after the stake. Most mistakes on game questions come from mixing the two.'},
{tag:'Paper 1 · no calculator',title:'Two unknowns, then a transform',stem:'X takes the values 1, 2, 3 and 4 with probabilities 0.1, p, q and 0.2. E(X) = 2.6.',parts:[
{q:'Find p and q.',m:4,s:['Σ P = 1: 0.1 + p + q + 0.2 = 1, so p + q = 0.7 '+M('M1'),'E(X): 0.1 + 2p + 3q + 0.8 = 2.6, so 2p + 3q = 1.7 '+M('M1'),'Subtract 2(p + q) = 1.4: q = 0.3 '+M('A1'),'p = <b>0.4</b>, q = <b>0.3</b> '+M('A1')]},
{q:'Find Var(X).',m:2,s:['E(X²) = 1(0.1) + 4(0.4) + 9(0.3) + 16(0.2) = 0.1 + 1.6 + 2.7 + 3.2 = 7.6 '+M('M1'),'Var(X) = 7.6 − 2.6² = 7.6 − 6.76 = <b>0.84</b> '+M('A1')]},
{q:'Find E(2X + 1) and Var(2X + 1).',m:2,s:['E(2X + 1) = 2(2.6) + 1 = <b>6.2</b> '+M('A1'),'Var(2X + 1) = 2² × 0.84 = <b>3.36</b>. The +1 does not change the spread. '+M('A1')]}
],tip:'Two unknowns always need two equations: Σ P = 1 is the one students forget to write.'}
]},
binomial:{
method:[
['Justify the model, define X','"X = number of seeds that fail. X ~ B(15, 0.2)." Fixed n, two outcomes, independent trials, constant p.'],
['Turn the words into an inequality','"at least 3" → X ≥ 3. "more than 3" → X ≥ 4. "no more than 3" → X ≤ 3. "fewer than 3" → X ≤ 2.'],
['Convert to what your calculator does',G('Casio Bcd takes whole-number Lower and Upper bounds. Write the bounds explicitly.','TI binomcdf only does P(X ≤ x). Rewrite as ≤ or as 1 − (≤).')],
['Write the statement, then the number','"P(X > 4) = 1 − P(X ≤ 4) = 0.164". The statement earns the method mark even if the number is wrong.'],
['Recognise the inverse types','Unknown n from "at least one" → 1 − (1 − p)ⁿ and logs or a table. n and p from E and Var → divide Var by E.']
],
types:[
['"exactly k"','P(X = k): pdf'],
['"at most / no more than k"','P(X ≤ k): cdf'],
['"at least k" / "more than k"','1 − P(X ≤ k − 1) / 1 − P(X ≤ k)'],
['A probability from part (a) reused in (b)','New binomial with that p. Keep full precision'],
['"smallest n so that P(at least one) > t"','1 − (1 − p)ⁿ > t, round up']
],
marks:['A1 for stating B(n, p), often a separate mark.','M1 for the correct probability statement, e.g. 1 − P(X ≤ 4).','A1 for the value to 3 s.f. Use stored values, not rounded ones, in later parts.'],
ex:[
{tag:'Paper 2 · calculator',title:'Seeds that fail',stem:'20% of a type of seed fail to germinate. A packet contains 15 seeds. Let X be the number that fail.',parts:[
{q:'State the distribution of X.',m:1,s:['Fixed n = 15, fail or not, independent, constant p = 0.2: X ~ <b>B(15, 0.2)</b> '+M('A1')]},
{q:'Find P(X = 3).',m:2,s:['Exactly 3: use the pdf.',G(`Bpd: x 3, Numtrial 15, p 0.2 `+M('M1'),`binompdf(15, 0.2, 3) `+M('M1')),'P(X = 3) = <b>0.250</b> (3 s.f.) '+M('A1')]},
{q:'Find the probability that more than 4 seeds fail.',m:2,s:['"More than 4" starts at 5: P(X ≥ 5) = 1 − P(X ≤ 4).',G(`Bcd: Lower 5, Upper 15, Numtrial 15, p 0.2 `+M('M1'),`1 − binomcdf(15, 0.2, 4) `+M('M1')),'= <b>0.164</b> (3 s.f.) '+M('A1')]},
{q:'Find P(2 ≤ X ≤ 5).',m:2,s:['Inclusive at both ends.',G(`Bcd: Lower 2, Upper 5 `+M('M1'),`binomcdf(15, 0.2, 5) − binomcdf(15, 0.2, 1) `+M('M1')),'= <b>0.772</b> (3 s.f.) '+M('A1')]},
{q:'A shop sells 10 packets. Find the probability that at most one packet has more than 4 failed seeds.',m:3,s:['Each packet "succeeds" with q = 0.16423… from part (c). Let Y = number of such packets: Y ~ B(10, 0.16423…) '+M('M1'),G(`Bcd: Lower 0, Upper 1, Numtrial 10, p = stored answer `+M('M1'),`binomcdf(10, Ans, 1) with the stored answer `+M('M1')),'P(Y ≤ 1) = <b>0.493</b> (3 s.f.) '+M('A1')]}
],tip:'Store the answer to (c) in a memory (A or Ans) and reuse it in (e). Typing 0.164 instead gives 0.494, which can lose the final mark.'},
{tag:'Paper 1 · no calculator',title:'Finding n and p',stem:'X ~ B(n, p) with E(X) = 6 and Var(X) = 4.2.',parts:[
{q:'Find p.',m:2,s:['np = 6 and np(1 − p) = 4.2.','Divide: 1 − p = 4.2 / 6 = 0.7 '+M('M1'),'p = <b>0.3</b> '+M('A1')]},
{q:'Find n.',m:1,s:['n = 6 / 0.3 = <b>20</b> '+M('A1')]},
{q:'Write down an expression for P(X = 0).',m:1,s:['All 20 trials fail: P(X = 0) = <b>0.7²⁰</b> '+M('A1')]}
],tip:'Dividing Var by E cancels n. It is the fastest route every time.'},
{tag:'Paper 2 · calculator',title:'How many rolls?',stem:'A fair die is rolled n times.',parts:[
{q:'Find the least n such that the probability of at least one six is greater than 0.9.',m:4,s:['P(at least one six) = 1 − (5/6)ⁿ > 0.9 '+M('M1'),'(5/6)ⁿ < 0.1 '+M('A1'),'n > ln 0.1 / ln(5/6) = 12.63. Dividing by a negative log flips the sign. '+M('M1'),'Round up: n = <b>13</b> '+M('A1'),G(`Check in Table: Y1 = 1 − (5/6)^X gives 0.888 at X = 12 and 0.907 at X = 13.`,`Check with Y1 = 1 − (5/6)^X and TABLE: 0.888 at X = 12 and 0.907 at X = 13.`)]}
],tip:'n must be a whole number that satisfies the inequality, so always round up, even from 12.1.'}
]},
normal:{
method:[
['Define X and pull out σ','X ~ N(165, 8²) means σ = 8. X ~ N(165, 64) also means σ = 8. The calculator wants σ.'],
['Sketch and shade','A 10-second sketch with μ marked and the region shaded tells you which tail you need and whether the answer should be above or below 0.5.'],
['Probability from a value: forward',G('Ncd with Lower and Upper. Use ±1E99 for an open end.','normalcdf(lower, upper, μ, σ). Use ±1E99 for an open end.')],
['Value from a probability: inverse',G('InvN with the Tail matching the inequality.','invNorm with the area to the left, so for "more than" use 1 − area.')],
['Unknown μ or σ: standardise','Get z with μ = 0, σ = 1, then set (x − μ)/σ = z. Two unknowns means two equations, solved simultaneously.']
],
types:[
['"Find P(X < 155)"','Forward: cdf'],
['"10% are above h. Find h"','Inverse, right tail'],
['"5% are below 490. Find σ"','z from the inverse with μ = 0, σ = 1, then rearrange'],
['Two percentages, μ and σ both unknown','Two z-equations, simultaneous'],
['"10 people are chosen…"','Binomial with p from the normal part']
],
marks:['M1 for a correct sketch or probability statement, e.g. P(X > h) = 0.1.','A1 for z (to 4 s.f. or better) in unknown-parameter questions.','A1 for the final answer. Keep z unrounded in later steps.'],
ex:[
{tag:'Paper 2 · calculator',title:'Heights',stem:'Heights of adults in a town are normally distributed with mean 165 cm and standard deviation 8 cm.',parts:[
{q:'Find the probability a randomly chosen adult is shorter than 155 cm.',m:2,s:['P(H < 155), a left tail.',G(`Ncd: Lower −1E99, Upper 155, σ 8, μ 165 `+M('M1'),`normalcdf(−1E99, 155, 165, 8) `+M('M1')),'= <b>0.106</b> (3 s.f.) '+M('A1')]},
{q:'Find the probability a randomly chosen adult is between 160 cm and 175 cm.',m:2,s:[G(`Ncd: Lower 160, Upper 175, σ 8, μ 165 `+M('M1'),`normalcdf(160, 175, 165, 8) `+M('M1')),'= <b>0.628</b> (3 s.f.) '+M('A1')]},
{q:'The tallest 10% of adults are taller than h cm. Find h.',m:2,s:['P(H > h) = 0.1: a right tail of area 0.1.',G(`InvN: Tail Right, Area 0.1, σ 8, μ 165 `+M('M1'),`invNorm(0.9, 165, 8): the left area is 1 − 0.1 `+M('M1')),'h = <b>175</b> cm (3 s.f.), more precisely 175.25 '+M('A1')]},
{q:'Ten adults are chosen at random. Find the probability that at least two are shorter than 155 cm.',m:3,s:['Each adult is "short" with p = 0.10565 from (a). Y ~ B(10, 0.10565) '+M('M1'),'P(Y ≥ 2) = 1 − P(Y ≤ 1) '+M('M1'),'= <b>0.286</b> (3 s.f.) '+M('A1')]}
],tip:'Normal-then-binomial is a favourite Paper 2 ending. Spot the switch: "ten are chosen" means count successes, so binomial.'},
{tag:'Paper 2 · calculator',title:'Finding σ',stem:'The mass of a bag of rice is normally distributed with mean 500 g. 5% of bags weigh less than 490 g.',parts:[
{q:'Find the standard deviation.',m:4,s:['P(X < 490) = 0.05. Standardise: P(Z < (490 − 500)/σ) = 0.05 '+M('M1'),G(`InvN: Tail Left, Area 0.05, σ 1, μ 0 → z = −1.6449 `+M('A1'),`invNorm(0.05, 0, 1) → z = −1.6449 `+M('A1')),'(490 − 500)/σ = −1.6449 '+M('M1'),'σ = 10 / 1.6449 = <b>6.08</b> g (3 s.f.) '+M('A1')]}
],tip:'The sign check: 490 is below the mean, so z must be negative. If you get a positive z, your tail is wrong.'},
{tag:'Paper 2 · calculator',title:'Both parameters unknown',stem:'X is normally distributed with P(X < 20) = 0.1 and P(X > 35) = 0.05.',parts:[
{q:'Find μ and σ.',m:6,s:['Standardise both conditions.',G(`InvN (σ 1, μ 0): Tail Left, Area 0.1 → z₁ = −1.2816. Tail Right, Area 0.05 → z₂ = 1.6449 `+M('A1 A1'),`invNorm(0.1, 0, 1) → z₁ = −1.2816. invNorm(0.95, 0, 1) → z₂ = 1.6449 `+M('A1 A1')),'μ − 1.2816σ = 20 and μ + 1.6449σ = 35 '+M('M1'),'Subtract: 2.9264σ = 15, so σ = <b>5.13</b> (3 s.f.) '+M('A1'),'μ = 20 + 1.2816 × 5.1257 = <b>26.6</b> (3 s.f.) '+M('M1 A1'),G(`Or Equation → SIMUL, 2 unknowns, rows [1, −1.2816 | 20] and [1, 1.6449 | 35].`,`Or APPS → PlySmlt2 → simultaneous, rows [1, −1.2816 | 20] and [1, 1.6449 | 35].`)]}
],tip:'Write μ + zσ = x for each condition, with z carrying its own sign. That keeps the algebra identical every time.'}
]},
continuous:{
method:[
['Find k from total area 1','∫ f(x) dx over the whole domain = 1. Integrate without k, then k = 1 ÷ the result.'],
['Probabilities are integrals','P(a < X < b) = ∫ₐᵇ f(x) dx. Sketch f first. Symmetry can save a whole integral.'],
['Mean and variance','E(X) = ∫ x f(x) dx. E(X²) = ∫ x² f(x) dx. Var(X) = E(X²) − [E(X)]².'],
['Median: solve for m','∫ from the lower end to m of f(x) dx = 0.5. Solve, then keep only the root inside the domain.'],
['Mode: the highest point','Solve f′(x) = 0 and also check the endpoints. On a GDC, use the graph\'s maximum tool.']
],
types:[
['"Find the value of k"','Total area = 1'],
['"Find P(X < 1)"','Integrate over that range'],
['"Find the median"','Area up to m = 0.5'],
['"Write down E(X)" for a symmetric f','The centre of symmetry, no working needed'],
['Piecewise f','Split every integral at the join']
],
marks:['M1 for setting up the integral with correct limits, even before integrating.','A1 for the antiderivative, A1 for the value.','"Write down" means no working is needed. "Find" means show the integral.'],
ex:[
{tag:'Paper 1 · no calculator',title:'A symmetric pdf',stem:'X has pdf f(x) = kx(4 − x) for 0 ≤ x ≤ 4, and 0 otherwise.',parts:[
{q:'Find k.',m:3,s:['∫₀⁴ (4x − x²) dx = [2x² − x³/3]₀⁴ '+M('M1'),'= 32 − 64/3 = 32/3 '+M('A1'),'k × 32/3 = 1, so k = <b>3/32</b> '+M('A1')]},
{q:'Write down E(X).',m:1,s:['f is symmetric about x = 2 (a parabola with roots at 0 and 4): E(X) = <b>2</b> '+M('A1')]},
{q:'Find P(X < 1).',m:2,s:['(3/32)[2x² − x³/3]₀¹ = (3/32)(2 − 1/3) '+M('M1'),'= (3/32)(5/3) = <b>5/32</b> '+M('A1')]},
{q:'Find Var(X).',m:3,s:['E(X²) = (3/32) ∫₀⁴ (4x³ − x⁴) dx = (3/32)[x⁴ − x⁵/5]₀⁴ '+M('M1'),'= (3/32)(256 − 204.8) = (3/32)(51.2) = 4.8 '+M('A1'),'Var(X) = 4.8 − 2² = <b>0.8</b> '+M('A1')]}
],tip:'"Write down" in (b) is a signal that no integral is needed. Look for symmetry before integrating.'},
{tag:'Paper 2 · calculator',title:'Median and mode',stem:'X has pdf f(x) = kx² for 0 ≤ x ≤ 3, and 0 otherwise.',parts:[
{q:'Find k.',m:2,s:['∫₀³ x² dx = 9 '+M('M1'),'k = <b>1/9</b> '+M('A1')]},
{q:'Find the median of X.',m:3,s:['∫₀ᵐ x²/9 dx = m³/27 = 0.5 '+M('M1 A1'),'m³ = 13.5, so m = <b>2.38</b> (3 s.f.) '+M('A1'),G(`Equation → SOLVER: X^3÷27=0.5, Lower 0, Upper 3.`,`MATH → Solver: X^3/27 − 0.5 = 0, bound {0, 3}.`)]},
{q:'Write down the mode of X.',m:1,s:['f is increasing on [0, 3], so the maximum is at the endpoint: mode = <b>3</b> '+M('A1'),'f′(x) = 2x/9 = 0 gives x = 0, a minimum. Using f′ = 0 blindly here gives the wrong answer.']},
{q:'Find E(X).',m:2,s:['E(X) = ∫₀³ x · x²/9 dx = [x⁴/36]₀³ '+M('M1'),'= 81/36 = <b>2.25</b> '+M('A1'),G(`Run-Matrix ∫dx: ∫(X×X²÷9, 0, 3) = 2.25.`,`MATH → 9:fnInt(: ∫₀³ X*X²/9 dX = 2.25.`)]}
],tip:'Mean 2.25 < median 2.38 < mode 3: the pdf is skewed left, and the mean is pulled towards the long tail.'},
{tag:'Paper 1 · no calculator',title:'A piecewise pdf',stem:'X has pdf f(x) = kx for 0 ≤ x ≤ 2, f(x) = k(4 − x) for 2 < x ≤ 4, and 0 otherwise.',parts:[
{q:'Find k.',m:2,s:['The graph is a triangle with base 4 and height 2k.','Area = ½ × 4 × 2k = 4k = 1 '+M('M1'),'k = <b>1/4</b> '+M('A1')]},
{q:'Find P(X < 3).',m:3,s:['Easier as 1 − P(X > 3).','P(X > 3) = ∫₃⁴ (4 − x)/4 dx = small triangle ½ × 1 × ¼ = 1/8 '+M('M1 A1'),'P(X < 3) = 1 − 1/8 = <b>7/8</b> '+M('A1')]},
{q:'Find P(1 < X < 3).',m:2,s:['By symmetry, P(X < 1) = P(X > 3) = 1/8 '+M('M1'),'P(1 < X < 3) = 1 − 2(1/8) = <b>3/4</b> '+M('A1')]}
],tip:'With straight-line pdfs, areas of triangles and trapezia are faster than integrals and earn the same marks.'}
]}
};
window.LAB.L=Object.assign(window.LAB.L,L);
Object.assign(window.LAB.TITLES,{basics:'events and Venn diagrams',conditional:'conditional probability',bayes:"Bayes' theorem",counting:'counting',discrete:'discrete random variables',binomial:'the binomial distribution',normal:'the normal distribution',continuous:'continuous random variables'});
})();
