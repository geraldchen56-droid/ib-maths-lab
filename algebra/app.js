(function(){
"use strict";
const LAB=window.LAB;
const {$,tok,prep,MONO,sf,gcd,ri,pick,C,DRAW}=LAB;
LAB.SECS.push('overview','direct','indsum','inddiv','indmore','contra','counter','cart','polar','polyroots','demoivre','croots','drill','casio');
LAB.CARDS.push(
['direct','SL 1.6','Direct proof','Let n be an integer, write it in algebra, LHS ≡ RHS'],
['indsum','AHL 1.15','Induction: series','Base case, assume P(k), add the next term, conclude'],
['inddiv','AHL 1.15','Induction: divisibility','Write f(k + 1) using f(k), pull out the divisor'],
['indmore','AHL 1.15','Induction: inequalities & derivatives','Start at n₀, chain the inequality, differentiate the k case'],
['contra','AHL 1.15','Proof by contradiction','Suppose not, reach something impossible: √2, primes, logs'],
['counter','AHL 1.15','Counterexamples','One example kills "for all": n² + n + 41, 2ᵖ − 1'],
["cart","AHL 1.12","Cartesian form & Argand","a + bi, i² = −1, divide by the conjugate"],
["polar","AHL 1.13","Polar & Euler form","r cis θ = re^(iθ): moduli multiply, arguments add"],
["polyroots","AHL 1.14","Polynomial roots","Conjugate pairs, quadratic factors, sum and product"],
["demoivre","AHL 1.14","De Moivre's theorem","(r cis θ)ⁿ = rⁿ cis nθ, multiple-angle identities"],
["croots","AHL 1.14","Roots of complex numbers","+ 2kπ then ÷ n: n roots on a circle"],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Tables, sums and checks for testing a claim before you prove it']);
Object.assign(LAB.SECNAME,{cart:'Cartesian form & Argand',polar:'Polar & Euler form',polyroots:'Polynomial roots',demoivre:"De Moivre's theorem",croots:'Roots of complex numbers',direct:'Direct proof',indsum:'Induction: series',inddiv:'Induction: divisibility',indmore:'Induction: inequalities & derivatives',contra:'Proof by contradiction',counter:'Counterexamples'});

/* ---------- formatting ---------- */
const MIN='−';
const N=x=>String(x).replace('-',MIN);
const fm=x=>{if(!isFinite(x))return '–';if(Math.abs(x)<1e-12)x=0;return sf(x,4).replace('-',MIN);};
const SUPS={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','k':'ᵏ','+':'⁺','-':'⁻','r':'ʳ','p':'ᵖ','x':'ˣ','(':'⁽',')':'⁾'};
const sup=s=>String(s).split('').map(c=>SUPS[c]||c).join('');
const big=b=>{const s=b.toString();return s.length>14?s.slice(0,6)+'…'+s.slice(-4)+' ('+s.length+' digits)':s;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fact=n=>{let r=1n;for(let i=2n;i<=BigInt(n);i++)r*=i;return r;};
const bpow=(a,n)=>BigInt(a)**BigInt(n);
function bgcd(a,b){a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;}
/* smallest prime factor of a BigInt (trial division), or the number itself if prime */
function spf(n){n=BigInt(n);if(n<2n)return n;if(n%2n===0n)return 2n;for(let p=3n;p*p<=n;p+=2n)if(n%p===0n)return p;return n;}
const isPrime=n=>BigInt(n)>=2n&&spf(n)===BigInt(n);
const PRIMES=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53];

/* ---------- controls and readouts built from a spec ---------- */
function ctrls(host,pre,specs,onChange){
const el=typeof host==='string'?$(host):host,R={},FMT={};
specs.forEach(s=>{
if(s.head){const h=document.createElement('div');h.className='ctrl-h';h.textContent=s.head;el.appendChild(h);return;}
const d=document.createElement('div');d.className='ctrl';
d.innerHTML=`<label for="${pre}${s.id}">${s.label}</label><output id="${pre}${s.id}o"></output><input type="range" id="${pre}${s.id}" min="${s.min}" max="${s.max}" step="${s.step||1}" value="${s.val}">`;
el.appendChild(d);const inp=d.querySelector('input');R[s.id]=inp;if(s.fmt)FMT[s.id]=s.fmt;inp.addEventListener('input',()=>onChange(s.id));
});
R.sync=()=>{Object.keys(R).forEach(k=>{if(k==='sync')return;const o=document.getElementById(pre+k+'o');if(o)o.textContent=FMT[k]?FMT[k](+R[k].value):fm(+R[k].value);});};
return R;
}
function readout(host,items){const el=typeof host==='string'?$(host):host;el.className='readout';el.innerHTML=items.map(([id,l,hi])=>`<div${hi?' class="hi"':''}><span>${l}</span><b id="${id}"></b></div>`).join('');}
const put=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
const vals=(R,...ids)=>ids.map(i=>+R[i].value);
function presets(host,list,onPick,initial){const el=typeof host==='string'?$(host):host;el.className='seg';
el.innerHTML=list.map(([k,l])=>`<button type="button" data-p="${k}" aria-pressed="${k===initial?'true':'false'}">${l}</button>`).join('');
el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;Array.from(el.querySelectorAll('button')).forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));onPick(b.dataset.p);});}
const gdc=(sec,c,t)=>{$('#'+sec+'-gdc').innerHTML=C(`<span class="gl">fx-CG50</span>${c}`,`<span class="gl">TI-84</span>${t}`);};
const work=(sec,lines)=>{$('#'+sec+'-work').innerHTML=lines.join('<br>');};

/* ---------- a grid of numbered cells, each passing or failing a test ---------- */
function cellGrid(cvEl,cells,opts){
opts=opts||{};
const w0=cvEl.clientWidth||300,cw=w0<480?58:72,chh=50,gap=6;
const cols=Math.max(3,Math.floor((w0+gap)/(cw+gap))),rows=Math.ceil(cells.length/cols);
const {ctx,w}=prep(cvEl,Math.max(1,rows)*(chh+gap)+4);
const cwx=(w-(cols-1)*gap)/cols;
cells.forEach((c,i)=>{
const x=(i%cols)*(cwx+gap),y=Math.floor(i/cols)*(chh+gap)+2;
const col=c.ok?'good':'bad';
ctx.fillStyle=tok(col+'-soft');ctx.strokeStyle=c.hi?tok('amber'):tok(col);ctx.lineWidth=c.hi?3:1.2;
ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,cwx,chh,6);else ctx.rect(x,y,cwx,chh);ctx.fill();ctx.stroke();
ctx.fillStyle=tok('muted');ctx.font=`10.5px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(c.label,x+6,y+5);
ctx.fillStyle=tok(col);ctx.textAlign='right';ctx.fillText(c.ok?'✓':'✗',x+cwx-6,y+5);
ctx.fillStyle=tok('ink');ctx.font=`500 ${c.val.length>7?11:13}px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(c.val.length>9?c.val.slice(0,8)+'…':c.val,x+cwx/2,y+chh-9);
});
}

/* ===== 1. Direct proof ===== */
(function(){
const CL={
three:{name:'three consecutive integers',t:'n + (n + 1) + (n + 2)',f:n=>3*n+3,steps:['n + (n + 1) + (n + 2)','= 3n + 3','= 3(n + 1)'],why:'n + 1 is an integer, so the sum is 3 × an integer.',calc:'X+(X+1)+(X+2)'},
prod:{name:'two consecutive integers multiplied',t:'n(n + 1)',f:n=>n*(n+1),steps:['n(n + 1)'],why:'one of n and n + 1 is even, so the product is even.',calc:'X(X+1)'},
odd8:{name:'an odd square, minus 1',t:'(2n + 1)² − 1',f:n=>(2*n+1)**2-1,steps:['(2n + 1)² − 1','= 4n² + 4n + 1 − 1','= 4n(n + 1)'],why:'n(n + 1) is even, so 4n(n + 1) = 4 × even = 8 × an integer.',calc:'(2X+1)²−1'},
cube:{name:'n³ − n',t:'n³ − n',f:n=>n**3-n,steps:['n³ − n','= n(n² − 1)','= (n − 1)n(n + 1)'],why:'three consecutive integers include a multiple of 2 and a multiple of 3, so the product is a multiple of 6.',calc:'X³−X'},
odds:{name:'two consecutive odd numbers added',t:'(2n − 1) + (2n + 1)',f:n=>4*n,steps:['(2n − 1) + (2n + 1)','= 4n'],why:'4n is 4 × an integer.',calc:'(2X−1)+(2X+1)'}
};
const G0={};Object.keys(CL).forEach(k=>{let g=0;for(let n=1;n<=200;n++)g=gcd(g,CL[k].f(n));G0[k]=g;});
let key='three';
const R=ctrls('#direct-ctrls','di-',[
{head:'The claim: d always divides it'},
{id:'d',label:'divisor d to test',min:2,max:12,val:3},
{head:'Examples'},
{id:'N',label:'check n = 1 up to',min:6,max:48,step:6,val:24}
],()=>draw());
presets('#direct-pre',[['three','n + (n+1) + (n+2)'],['prod','n(n + 1)'],['odd8','(2n+1)² − 1'],['cube','n³ − n'],['odds','(2n−1) + (2n+1)']],k=>{key=k;R.d.value=G0[k];draw();},'three');
readout('#direct-ro',[['diC','expression'],['diP','examples that pass',1],['diG','largest d that always works'],['diA','in algebra',1],['diV','verdict']]);
function draw(){
R.sync();const [d,Nn]=vals(R,'d','N');const D=CL[key];
const cells=[];let first=0,pass=0;
for(let n=1;n<=Nn;n++){const v=D.f(n),ok=v%d===0;if(ok)pass++;else if(!first)first=n;cells.push({label:'n='+n,val:String(v),ok,hi:n===first});}
cellGrid($('#direct-cv'),cells);
const g=G0[key];
put('diC',D.t);put('diP',`${pass} of ${Nn}`);put('diG',String(g));put('diA',D.steps[D.steps.length-1]);
put('diV',first?`n = ${first} breaks it: ${d} does not divide ${D.f(first)}. The claim with d = ${d} is false.`:g%d===0?`All ${Nn} pass, but that is evidence, not proof. The algebra covers every n.`:`All ${Nn} pass, yet ${d} does not divide every value. Keep checking.`);
gdc('direct',`Table: Y1 = (${D.calc})÷${d}, Start 1, End ${Nn}, Step 1. A decimal in the Y1 column is a counterexample.`,`Y1 = (${D.calc})/${d}, TBLSET Start 1, ΔTbl 1, then TABLE. A decimal in Y1 is a counterexample.`);
work('direct',[`Claim: ${D.name} is always divisible by ${g}.`,`Let n be any integer. ${D.steps.join('  ')}`,`So: ${D.why}`,`Every n is covered at once. Checking n = 1 to ${Nn} only covers ${Nn} cases.`]);
}
DRAW.direct=draw;
})();

/* ===== 2. Induction: series (dominoes) ===== */
(function(){
const SER={
sr:{t:'Σ r = n(n + 1)/2',u:r=>r,S:n=>n*(n+1)/2,ut:'(k + 1)',calcT:'X',note:'true formula'},
sr2:{t:'Σ r² = n(n + 1)(2n + 1)/6',u:r=>r*r,S:n=>n*(n+1)*(2*n+1)/6,ut:'(k + 1)²',calcT:'X²',note:'true formula'},
sr3:{t:'Σ r³ = n²(n + 1)²/4',u:r=>r**3,S:n=>n*n*(n+1)*(n+1)/4,ut:'(k + 1)³',calcT:'X³',note:'true formula'},
tel:{t:'Σ 1/(r(r + 1)) = n/(n + 1)',u:r=>1/(r*(r+1)),S:n=>n/(n+1),ut:'1/((k + 1)(k + 2))',calcT:'1/(X(X+1))',note:'true formula'},
bb:{t:'Σ r = (n² + n + 2)/2',u:r=>r,S:n=>(n*n+n+2)/2,ut:'(k + 1)',calcT:'X',note:'broken: base case fails'},
bs:{t:'Σ r² = n(n+1)(2n+1)/6 + (n−1)(n−2)(n−3)',u:r=>r*r,S:n=>n*(n+1)*(2*n+1)/6+(n-1)*(n-2)*(n-3),ut:'(k + 1)²',calcT:'X²',note:'broken: step fails at k = 3'}
};
let key='sr2';
presets('#indsum-pre',[['sr','Σ r'],['sr2','Σ r²'],['sr3','Σ r³'],['tel','Σ 1/(r(r+1))'],['bb','faulty: base'],['bs','faulty: step']],k=>{key=k;draw();},'sr2');
const R=ctrls('#indsum-ctrls','is-',[
{head:'Dominoes'},
{id:'N',label:'number of dominoes',min:6,max:14,val:10},
{head:'Inspect the step'},
{id:'k',label:'k (step from k to k + 1)',min:1,max:13,val:3}
],()=>draw());
readout('#indsum-ro',[['isB','base case P(1)',1],['isS','step at k: S(k) + next term vs RHS(k + 1)',1],['isF','dominoes that fall'],['isT','where the formula is actually true'],['isV','verdict']]);
const eq=(a,b)=>Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b));
function draw(){
R.sync();let [Nn,k]=vals(R,'N','k');if(k>Nn-1){k=Nn-1;R.k.value=k;R.sync();}
const D=SER[key];
const lhs=[0];for(let n=1;n<=Nn;n++)lhs[n]=lhs[n-1]+D.u(n);
const P=n=>eq(lhs[n],D.S(n)),step=j=>eq(D.S(j)+D.u(j+1),D.S(j+1));
const fall=[];fall[1]=P(1);for(let n=1;n<Nn;n++)fall[n+1]=fall[n]&&step(n);
/* canvas */
const {ctx,w,h}=prep($('#indsum-cv'),250);
const base=h-62,gapx=(w-40)/Nn,dw=Math.min(16,gapx*0.36),dh=Math.min(120,gapx*1.9);
ctx.strokeStyle=tok('muted');ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(10,base);ctx.lineTo(w-10,base);ctx.stroke();
for(let n=1;n<=Nn;n++){
const x=20+(n-0.5)*gapx;
/* link between n and n+1: the inductive step */
if(n<Nn){const s=step(n);ctx.strokeStyle=n===k?tok('amber'):tok(s?'good':'bad');ctx.lineWidth=n===k?3:1.6;ctx.setLineDash(s?[]:[4,3]);
ctx.beginPath();ctx.moveTo(x+dw/2+3,base+14);ctx.lineTo(x+gapx-dw/2-3,base+14);ctx.stroke();ctx.setLineDash([]);
if(!s){ctx.fillStyle=tok('bad');ctx.font=`600 12px ${MONO}`;ctx.textAlign='center';ctx.fillText('✗',x+gapx/2,base+10);}}
ctx.save();ctx.translate(x+dw/2,base);
if(fall[n])ctx.rotate(n<Nn?Math.asin(clamp((gapx-dw)/dh,0,0.95)):0.9);
ctx.fillStyle=fall[n]?tok('accent'):tok('paper');ctx.strokeStyle=fall[n]?tok('accent'):tok('muted');ctx.lineWidth=1.5;
ctx.beginPath();ctx.rect(-dw,-dh,dw,dh);ctx.fill();ctx.stroke();ctx.restore();
ctx.fillStyle=tok('muted');ctx.font=`11px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(String(n),x,base+22);
const t=P(n);ctx.fillStyle=tok(t?'good':'bad');ctx.font=`600 12px ${MONO}`;ctx.fillText(t?'✓':'✗',x,base+38);
}
ctx.fillStyle=tok('muted');ctx.font=`10.5px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('n',2,base+22);ctx.fillText('P(n)',2,base+38);
/* readouts */
const b1=lhs[1],r1=D.S(1);
put('isB',`LHS = ${fm(b1)}, RHS = ${fm(r1)}  ${P(1)?'✓ true':'✗ false'}`);
put('isS',`${fm(D.S(k))} + ${fm(D.u(k+1))} = ${fm(D.S(k)+D.u(k+1))}   vs   ${fm(D.S(k+1))}  ${step(k)?'✓':'✗'}`);
let nf=0;for(let n=1;n<=Nn;n++)if(fall[n])nf++;put('isF',`${nf} of ${Nn}`);
let tr=[];for(let n=1;n<=Nn;n++)if(P(n))tr.push(n);put('isT',tr.length===Nn?'every n shown':tr.length?`n = ${tr.length<=6?tr.join(', '):tr[0]+' … '+tr[tr.length-1]+' only'}`:'nowhere');
let bad=0;for(let n=1;n<Nn;n++)if(!step(n)){bad=n;break;}
put('isV',!P(1)?(bad?'base and step both fail':'every step works, but the first domino never falls: no proof'):bad?`the chain breaks between ${bad} and ${bad+1}: no proof`:'base true and every step true: all n');
gdc('indsum',`Run-Matrix: Σ(${D.calcT},X,1,${k+1}) gives the left side for n = ${k+1}. Compare with the formula at n = ${k+1}.`,`sum(seq(${D.calcT},X,1,${k+1})) gives the left side for n = ${k+1}. Compare with the formula at n = ${k+1}.`);
work('indsum',[`${D.t}  (${D.note})`,`Base: n = 1 gives LHS ${fm(b1)}, RHS ${fm(r1)}.`,`Step at k = ${k}: assume S(${k}) = ${fm(D.S(k))}. Add the next term ${D.ut} = ${fm(D.u(k+1))}: S(${k+1}) = ${fm(D.S(k)+D.u(k+1))}.`,`The formula predicts ${fm(D.S(k+1))}. ${step(k)?'They match.':'They do not match, so P('+k+') does not lead to P('+(k+1)+').'}`,`In a real proof the step is done with a general k, in algebra, so it covers every k at once.`]);
}
DRAW.indsum=draw;
})();

/* ===== 3. Induction: divisibility ===== */
(function(){
const EX={
e7:{t:'7ⁿ − 1',tk:'7ᵏ − 1',f:n=>bpow(7,n)-1n,m:7n,r:k=>6n,stepT:'7ᵏ⁺¹ − 1 = 7(7ᵏ − 1) + 6',calc:'7^X−1'},
e5:{t:'5ⁿ + 3',tk:'5ᵏ + 3',f:n=>bpow(5,n)+3n,m:5n,r:k=>-12n,stepT:'5ᵏ⁺¹ + 3 = 5(5ᵏ + 3) − 12',calc:'5^X+3'},
e9:{t:'3²ⁿ − 1',tk:'3²ᵏ − 1',f:n=>bpow(9,n)-1n,m:9n,r:k=>8n,stepT:'3²⁽ᵏ⁺¹⁾ − 1 = 9(3²ᵏ − 1) + 8',calc:'3^(2X)−1'},
cub:{t:'n³ + 2n',tk:'k³ + 2k',f:n=>bpow(n,3)+2n*BigInt(n),m:1n,r:k=>3n*(BigInt(k)*BigInt(k)+BigInt(k)+1n),stepT:'(k + 1)³ + 2(k + 1) = (k³ + 2k) + 3(k² + k + 1)',calc:'X³+2X'},
e116:{t:'11ⁿ − 6ⁿ',tk:'11ᵏ − 6ᵏ',f:n=>bpow(11,n)-bpow(6,n),m:11n,r:k=>5n*bpow(6,k),stepT:'11ᵏ⁺¹ − 6ᵏ⁺¹ = 11(11ᵏ − 6ᵏ) + 5 × 6ᵏ',calc:'11^X−6^X'},
e83:{t:'2³ⁿ − 3ⁿ',tk:'2³ᵏ − 3ᵏ',f:n=>bpow(8,n)-bpow(3,n),m:8n,r:k=>5n*bpow(3,k),stepT:'2³⁽ᵏ⁺¹⁾ − 3ᵏ⁺¹ = 8(2³ᵏ − 3ᵏ) + 5 × 3ᵏ',calc:'2^(3X)−3^X'}
};
const G0={};Object.keys(EX).forEach(k=>{let g=0n;for(let n=1;n<=30;n++)g=bgcd(g,EX[k].f(n));G0[k]=Number(g);});
let key='e7';
const R=ctrls('#inddiv-ctrls','id-',[
{head:'The claim'},
{id:'d',label:'divisor d to test',min:2,max:12,val:6},
{head:'Inspect the step'},
{id:'k',label:'k',min:1,max:8,val:2}
],()=>draw());
presets('#inddiv-pre',[['e7','7ⁿ − 1'],['e5','5ⁿ + 3'],['e9','3²ⁿ − 1'],['cub','n³ + 2n'],['e116','11ⁿ − 6ⁿ'],['e83','2³ⁿ − 3ⁿ']],k=>{key=k;R.d.value=G0[k];draw();},'e7');
readout('#inddiv-ro',[['idK','f(k)'],['idK1','f(k + 1)'],['idS','f(k + 1) rebuilt from f(k)',1],['idR','is the extra term a multiple of d?'],['idV','verdict',1]]);
function draw(){
R.sync();const [d,k]=vals(R,'d','k');const D=EX[key],dd=BigInt(d);
const NB=12,{ctx,w,h}=prep($('#inddiv-cv'),230);
const L=34,T=14,B=40,pw=w-L-10,ph=h-T-B,bw=pw/NB;
ctx.font=`10px ${MONO}`;ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';
ctx.strokeStyle=tok('faint');ctx.lineWidth=1;
for(let r=0;r<d;r+=Math.max(1,Math.ceil(d/6))){const y=T+ph-(r/(d-1))*ph;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+pw,y);ctx.stroke();ctx.fillText(String(r),L-6,y);}
let first=0;
for(let n=1;n<=NB;n++){const rem=Number(((D.f(n)%dd)+dd)%dd),x=L+(n-0.5)*bw;
if(rem===0){ctx.fillStyle=tok('good');ctx.beginPath();ctx.arc(x,T+ph,5,0,7);ctx.fill();}
else{if(!first)first=n;const hh=(rem/(d-1))*ph;ctx.fillStyle=tok('bad');ctx.fillRect(x-bw*0.3,T+ph-hh,bw*0.6,hh);}
if(n===k||n===k+1){ctx.strokeStyle=tok('amber');ctx.lineWidth=2;ctx.strokeRect(x-bw*0.45,T-6,bw*0.9,ph+12);}
ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(String(n),x,T+ph+12);}
ctx.textAlign='left';ctx.fillText('n',2,T+ph+12);ctx.save();ctx.translate(10,T+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('remainder ÷ d',0,0);ctx.restore();
const fk=D.f(k),fk1=D.f(k+1),rk=D.r(k),ok=D.m*fk+rk===fk1,rdiv=rk%dd===0n,fdiv=fk%dd===0n;
put('idK',big(fk));put('idK1',big(fk1));
put('idS',`${D.m===1n?'':D.m+' × '}${big(fk)} ${rk<0n?'−':'+'} ${big(rk<0n?-rk:rk)} = ${big(D.m*fk+rk)} ${ok?'✓':'✗'}`);
put('idR',`${big(rk<0n?-rk:rk)} ÷ ${d} ${rdiv?'= '+big((rk<0n?-rk:rk)/dd)+' ✓':'leaves a remainder ✗'}`);
const g=G0[key];
put('idV',first?`n = ${first}: ${d} does not divide f(${first}). The claim with d = ${d} is false.`:g%d===0?`f(1) is a multiple of ${d}, and so is the extra term: the step works for every k.`:`no failure up to n = ${NB}, but the step does not keep the remainder at 0.`);
gdc('inddiv',`Table: Y1 = (${D.calc})÷${d}, Start 1, End 8. Whole numbers only = no counterexample up to 8.`,`Y1 = (${D.calc})/${d}, then TABLE from X = 1. Whole numbers only = no counterexample up to 8.`);
work('inddiv',[`Base: f(1) = ${D.f(1)}, ${D.f(1)%dd===0n?'a multiple of '+d+' ✓':'not a multiple of '+d+' ✗'}.`,`Assume f(k) = ${D.tk} is a multiple of ${d}.`,`Step: ${D.stepT}.`,`${D.m===1n?'f(k)':D.m+' × f(k)'} is a multiple of ${d} by the assumption. The extra term ${rdiv?'is a multiple of '+d+' too':'is not a multiple of '+d}.`,rdiv?`So f(k + 1) is a sum of multiples of ${d}: P(k) ⇒ P(k + 1).`:`So the step fails: P(k) does not give P(k + 1) for d = ${d}.`]);
}
DRAW.inddiv=draw;
})();

/* ===== 4. Induction: inequalities ===== */
(function(){
const IN={
p2:{t:'2ⁿ > n²',L:n=>2**n,R:n=>n*n,Lt:'2ⁿ',Rt:'n²',s:3,why:'2^(k+1) = 2 × 2ᵏ > 2k², and 2k² ≥ (k + 1)² needs k² − 2k − 1 ≥ 0, which is true for k ≥ 3',calc:['2^X','X²']},
fac:{t:'n! > 2ⁿ',L:n=>Number(fact(n)),R:n=>2**n,Lt:'n!',Rt:'2ⁿ',s:1,why:'(k + 1)! = (k + 1) × k! > (k + 1)2ᵏ, and (k + 1)2ᵏ ≥ 2 × 2ᵏ needs k + 1 ≥ 2, true for k ≥ 1',calc:['X!','2^X']},
p3:{t:'3ⁿ > n³',L:n=>3**n,R:n=>n**3,Lt:'3ⁿ',Rt:'n³',s:3,why:'3^(k+1) = 3 × 3ᵏ > 3k³, and 3k³ ≥ (k + 1)³ needs (1 + 1/k)³ ≤ 3, true for k ≥ 3',calc:['3^X','X^3']},
lin:{t:'2ⁿ > 2n + 1',L:n=>2**n,R:n=>2*n+1,Lt:'2ⁿ',Rt:'2n + 1',s:1,why:'2^(k+1) = 2 × 2ᵏ > 4k + 2, and 4k + 2 ≥ 2k + 3 needs k ≥ ½, true for k ≥ 1',calc:['2^X','2X+1']}
};
let key='p2';
presets('#indmore-pre',[['p2','2ⁿ > n²'],['fac','n! > 2ⁿ'],['p3','3ⁿ > n³'],['lin','2ⁿ > 2n + 1']],k=>{key=k;draw();},'p2');
const R=ctrls('#indmore-ctrls','im-',[
{head:'Where the induction starts'},
{id:'n0',label:'base case n₀',min:1,max:8,val:1}
],()=>draw());
readout('#indmore-ro',[['imB','base case P(n₀)',1],['imS','the step argument works for'],['imC','what the proof shows',1],['imM','smallest base that works']]);
function draw(){
R.sync();const [n0]=vals(R,'n0');const D=IN[key],NB=12;
const P=n=>D.L(n)>D.R(n);
const {ctx,w,h}=prep($('#indmore-cv'),280);
const L=46,T=12,B=34,pw=w-L-10,ph=h-T-B,bw=pw/NB;
let mx=1;for(let n=1;n<=NB;n++)mx=Math.max(mx,D.L(n),D.R(n));const lm=Math.log10(mx);
const Y=v=>T+ph-(Math.log10(Math.max(1,v))/lm)*ph;
/* proven region */
const okBase=P(n0),valid=okBase&&n0>=D.s;
for(let n=1;n<=NB;n++){const x0=L+(n-1)*bw;ctx.fillStyle=P(n)?tok('good-soft'):tok('bad-soft');ctx.fillRect(x0+1,T,bw-2,ph);}
if(valid){ctx.fillStyle=tok('accent');ctx.fillRect(L+(n0-1)*bw,T+ph+2,pw-(n0-1)*bw,4);}
ctx.font=`10px ${MONO}`;ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';
for(let p=0;p<=lm;p+=Math.max(1,Math.ceil(lm/5))){const y=Y(10**p);ctx.strokeStyle=tok('line');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+pw,y);ctx.stroke();ctx.fillText('10'+sup(p),L-5,y);}
for(let n=1;n<=NB;n++){const x0=L+(n-1)*bw,bb=bw*0.32;
ctx.fillStyle=tok('accent');ctx.fillRect(x0+bw*0.16,Y(D.L(n)),bb,T+ph-Y(D.L(n)));
ctx.fillStyle=tok('amber');ctx.fillRect(x0+bw*0.52,Y(D.R(n)),bb,T+ph-Y(D.R(n)));
ctx.fillStyle=n===n0?tok('ink'):tok('muted');ctx.font=`${n===n0?'600 ':''}11px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(String(n),x0+bw/2,T+ph+10);}
const xb=L+(n0-1)*bw;ctx.strokeStyle=tok('ink');ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(xb,T);ctx.lineTo(xb,T+ph);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle=tok('ink');ctx.font=`600 11px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('n₀',xb+4,T+2);
let best=D.s;while(!P(best))best++;
put('imB',`n = ${n0}: ${D.Lt} = ${D.L(n0)}, ${D.Rt} = ${D.R(n0)}  ${okBase?'✓ true':'✗ false'}`);
put('imS',`k ≥ ${D.s}`);
put('imC',valid?`P(n) for every n ≥ ${n0}`:!okBase?`nothing: P(${n0}) is false`:`nothing: the step fails from k = ${n0} to k = ${D.s}`);
put('imM',`n₀ = ${best}`);
gdc('indmore',`Table: Y1 = ${D.calc[0]}, Y2 = ${D.calc[1]}, Start 1, End 12. Find where Y1 > Y2 starts and stays.`,`Y1 = ${D.calc[0]}, Y2 = ${D.calc[1]}, then TABLE from X = 1. Find where Y1 > Y2 starts and stays.`);
work('indmore',[`Claim: ${D.t} for n ≥ n₀.`,`Base: n = ${n0} gives ${D.L(n0)} ${okBase?'>':'≤'} ${D.R(n0)}.`,`Step: ${D.why}.`,valid?`Base true and n₀ = ${n0} ≥ ${D.s}, so the step applies from the start. Proved for n ≥ ${n0}.`:!okBase?`The base case is false, so there is nothing to build on.`:`The base is true, but the step needs k ≥ ${D.s}, so P(${n0}) does not carry to P(${n0+1}). Move the base to n₀ = ${best}.`]);
}
DRAW.indmore=draw;
})();

/* ===== 5. Contradiction: near misses to √d = p/q ===== */
(function(){
const R=ctrls('#contra-ctrls','co-',[
{head:'Suppose √d = p/q'},
{id:'d',label:'d',min:2,max:12,val:2},
{head:'Try every denominator'},
{id:'Q',label:'q = 1 up to',min:5,max:40,val:20}
],()=>draw());
readout('#contra-ro',[['coS','is d a perfect square?'],['coG','smallest |p² − dq²|',1],['coB','best p/q found'],['coL','does d | p² force d | p?'],['coV','verdict',1]]);
function draw(){
R.sync();const [d,Q]=vals(R,'d','Q');const rt=Math.sqrt(d),sq=Number.isInteger(rt);
const gaps=[];let mn=Infinity,best=[1,1],be=Infinity;
for(let q=1;q<=Q;q++){const p=Math.round(q*rt),g=Math.abs(p*p-d*q*q);gaps.push([q,p,g]);mn=Math.min(mn,g);const e=Math.abs(p/q-rt);if(e<be-1e-15){be=e;best=[p,q];}}
const {ctx,w,h}=prep($('#contra-cv'),240);
const L=34,T=12,B=30,pw=w-L-10,ph=h-T-B,bw=pw/Q;let mg=1;gaps.forEach(g=>mg=Math.max(mg,g[2]));
ctx.font=`10px ${MONO}`;ctx.strokeStyle=tok('line');ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';
for(let v=0;v<=mg;v+=Math.max(1,Math.ceil(mg/5))){const y=T+ph-v/mg*ph;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+pw,y);ctx.stroke();ctx.fillText(String(v),L-5,y);}
if(!sq){const y1=T+ph-1/mg*ph;ctx.strokeStyle=tok('good');ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(L,y1);ctx.lineTo(L+pw,y1);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=tok('good');ctx.textAlign='left';ctx.fillText('floor: 1',L+4,y1-8);}
gaps.forEach(([q,p,g],i)=>{const x=L+(i+0.5)*bw;if(g===0){ctx.fillStyle=tok('bad');ctx.beginPath();ctx.arc(x,T+ph,4,0,7);ctx.fill();}else{const hh=g/mg*ph;ctx.fillStyle=g===1?tok('accent'):tok('accent-soft');ctx.fillRect(x-bw*0.32,T+ph-hh,bw*0.64,hh);}
if(Q<=20||q%5===0){ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(String(q),x,T+ph+8);}});
ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=tok('muted');ctx.fillText('q',2,T+ph+8);
let lemma=true;for(let p=1;p<=500;p++)if((p*p)%d===0&&p%d!==0){lemma=false;break;}
put('coS',sq?`yes: √${d} = ${rt}`:'no');put('coG',sq?'0 (p = '+rt+'q works)':String(mn));
put('coB',`${best[0]}/${best[1]} = ${(best[0]/best[1]).toFixed(6)}  (√${d} = ${rt.toFixed(6)})`);
let cx=0;if(!lemma){for(let p=1;p<=500;p++)if((p*p)%d===0&&p%d!==0){cx=p;break;}}
put('coL',lemma?'yes, for every p tested':`no: p = ${cx} gives p² = ${cx*cx}`);
put('coV',sq?`p² = dq² has solutions, so the proof must break. It breaks at "d | p² ⇒ d | p".`:lemma?`p² never equals ${d}q². The proof by contradiction works directly.`:`√${d} is irrational, but "d | p² ⇒ d | p" fails. Prove it via a prime factor of ${d} instead.`);
gdc('contra',`Table: Y1 = X√${d}, Start 1, End ${Q}. No whole number appears, but a table is evidence, not proof.`,`Y1 = X√(${d}), TABLE from X = 1. No whole number appears, but a table is evidence, not proof.`);
work('contra',[`Suppose √${d} = p/q with p, q integers, q ≠ 0, no common factor. Then p² = ${d}q².`,`The model tries every q up to ${Q} with the nearest p. ${sq?'At q = 1, p = '+rt+': exact. So √'+d+' is rational and no contradiction is possible.':'The gap p² − '+d+'q² is never 0, only as small as '+mn+'.'}`,`The proof replaces "never 0 in the examples" with an argument for all q: ${sq?'it must fail somewhere, and it does.':lemma?d+' | p² ⇒ '+d+' | p, then '+d+' | q too, contradicting "no common factor".':'use a prime that divides '+d+' an odd number of times.'}`]);
}
DRAW.contra=draw;
})();

/* ===== 6. Counterexamples ===== */
(function(){
const CL={
e41:{t:'n² + n + 41 is prime for every positive integer n',dom:N=>Array.from({length:N},(_,i)=>i+1),f:n=>BigInt(n*n+n+41),lab:n=>'n='+n,calc:'X²+X+41'},
p11:{t:'n² − n + 11 is prime for every positive integer n',dom:N=>Array.from({length:N},(_,i)=>i+1),f:n=>BigInt(n*n-n+11),lab:n=>'n='+n,calc:'X²−X+11'},
six:{t:'6n + 1 is prime for every positive integer n',dom:N=>Array.from({length:N},(_,i)=>i+1),f:n=>BigInt(6*n+1),lab:n=>'n='+n,calc:'6X+1'},
mer:{t:'2ᵖ − 1 is prime for every prime p',dom:N=>PRIMES.filter(p=>p<=31).slice(0,Math.max(4,Math.round(N/5))),f:p=>bpow(2,p)-1n,lab:p=>'p='+p,calc:'2^X−1'},
fer:{t:'2^(2ᵏ) + 1 is prime for every k ≥ 0 (Fermat)',dom:N=>[0,1,2,3,4,5,6].slice(0,Math.max(4,Math.min(7,Math.round(N/7)))),f:k=>bpow(2,2**k)+1n,lab:k=>'k='+k,calc:'2^(2^X)+1'}
};
let key='e41';
presets('#counter-pre',[['e41','n² + n + 41'],['p11','n² − n + 11'],['six','6n + 1'],['mer','2ᵖ − 1'],['fer','2^(2ᵏ) + 1']],k=>{key=k;draw();},'e41');
const R=ctrls('#counter-ctrls','ce-',[
{head:'Search'},
{id:'N',label:'how far to search',min:10,max:60,step:5,val:45}
],()=>draw());
readout('#counter-ro',[['ceC','claim'],['ceP','cases that hold'],['ceF','first counterexample',1],['ceX','its factors',1],['ceV','verdict']]);
function draw(){
R.sync();const [Nn]=vals(R,'N');const D=CL[key];
const dom=D.dom(Nn);let first=null,pass=0;const cells=[];
dom.forEach(n=>{const v=D.f(n),ok=isPrime(v);if(ok)pass++;else if(first===null)first=n;cells.push({label:D.lab(n),val:v.toString().length>9?v.toString().slice(0,7)+'…':v.toString(),ok,hi:first===n});});
cellGrid($('#counter-cv'),cells);
put('ceC',D.t);put('ceP',`${pass} of ${dom.length}`);
if(first===null){put('ceF','none yet');put('ceX','–');put('ceV',`no counterexample in this range. That still proves nothing about "every n". Search further.`);}
else{const v=D.f(first),p=spf(v);put('ceF',`${D.lab(first)}: ${big(v)}`);put('ceX',`${big(p)} × ${big(v/p)}`);put('ceV',`${pass?pass+' cases held, but ':''}one counterexample is enough: the claim is false.`);}
const fp=first===null?null:spf(D.f(first)),ft=fp!==null&&fp.toString().length<7?fp.toString():'p';
gdc('counter',`Table: Y1 = ${D.calc}, Y2 = (${D.calc})÷${ft}. A whole number in Y2 means Y1 is not prime.`,`Y1 = ${D.calc}, Y2 = Y1/${ft} (Y1 is in VARS → Y-VARS). A whole number in Y2 means Y1 is not prime.`);
work('counter',[`Claim: ${D.t}.`,first===null?'Every case in range holds. Examples can never prove a "for every" claim.':`${D.lab(first)} gives ${big(D.f(first))} = ${big(spf(D.f(first)))} × ${big(D.f(first)/spf(D.f(first)))}, which is not prime.`,key==='e41'?'Spot it without searching: at n = 40, n² + n + 41 = 40(40 + 1) + 41 = 41 × 41.':key==='p11'?'Spot it: at n = 11, n² − n + 11 = 11 × 11 − 11 + 11 = 11².':key==='six'?'Spot it: 25 = 6 × 4 + 1 is 5². Squares of numbers like 5 and 7 are 1 more than a multiple of 6.':key==='mer'?'2ᵖ − 1 prime needs p prime, but p prime is not enough: p = 11 gives 2047 = 23 × 89.':'Fermat believed all of these were prime. Euler found 641 divides the k = 5 number in 1732.']);
}
DRAW.counter=draw;
})();

/* ===================== Complex numbers ===================== */
const {rgba}=LAB;
const cl=x=>Math.round(x*1e10)/1e10;
const TAU=2*Math.PI,PI12=Math.PI/12;
/* principal argument in (−π, π] */
const parg=t=>{t=((t%TAU)+TAU)%TAU;if(t>Math.PI+1e-12)t-=TAU;return t;};
/* kπ/12 as a reduced fraction of π */
const P12=k=>{if(k===0)return '0';const g=gcd(Math.abs(k),12)||1,n=k/g,d=12/g;return (n<0?MIN:'')+(Math.abs(n)===1?'':Math.abs(n))+'π'+(d===1?'':'/'+d);};
/* an angle as a fraction of π when it is a multiple of π/12, else a decimal */
const ang=t=>{const k=Math.round(t/PI12);return Math.abs(t-k*PI12)<1e-9?P12(k):fm(t);};
/* a + bi as text */
function cT(a,b){a=cl(a);b=cl(b);if(Math.abs(a)<1e-9)a=0;if(Math.abs(b)<1e-9)b=0;const B=fm(Math.abs(b)),im=(B==='1'?'':B)+'i';if(b===0)return fm(a);if(a===0)return (b<0?MIN:'')+im;return fm(a)+' '+(b<0?MIN:'+')+' '+im;}
const cMul=(a,b,c,d)=>[a*c-b*d,a*d+b*c],cDiv=(a,b,c,d)=>{const m=c*c+d*d;return [(a*c+b*d)/m,(b*c-a*d)/m];};
/* modulus as text: exact surd when it is √(integer) */
function modT(m2){m2=cl(m2);const r=Math.sqrt(m2);if(Number.isInteger(m2)&&!Number.isInteger(cl(r))){let out=1,inn=m2;for(let f=2;f*f<=inn;f++)while(inn%(f*f)===0){inn/=f*f;out*=f;}return (out===1?'':out)+'√'+inn;}return fm(r);}
const niceStep=(span,target)=>{const raw=span/target,p=Math.pow(10,Math.floor(Math.log10(raw)));for(const m of [1,2,2.5,5,10])if(m*p>=raw-1e-12)return m*p;return 10*p;};
/* axes with optional equal scaling; returns drawing helpers in data coordinates */
function axes(cvEl,W,o){o=o||{};const H=o.h||340,{ctx,w,h}=prep(cvEl,H);const L=o.equal?14:36,Rp=14,T=12,B=o.equal?14:24;let pw=w-L-Rp,ph=h-T-B;
let {x0,x1,y0,y1}=W;if(o.equal){const u=Math.min(pw/(x1-x0),ph/(y1-y0)),xc=(x0+x1)/2,yc=(y0+y1)/2;x0=xc-pw/u/2;x1=xc+pw/u/2;y0=yc-ph/u/2;y1=yc+ph/u/2;}
const X=x=>L+(x-x0)/(x1-x0)*pw,Y=y=>T+(y1-y)/(y1-y0)*ph;
const st=o.equal?niceStep(Math.max(x1-x0,y1-y0),8):niceStep(x1-x0,7),sty=o.equal?st:niceStep(y1-y0,6);ctx.font=`10px ${MONO}`;ctx.lineWidth=1;
for(let g=Math.ceil(x0/st)*st;g<=x1+1e-9;g+=st){ctx.strokeStyle=Math.abs(g)<1e-9?tok('muted'):tok('faint');ctx.beginPath();ctx.moveTo(X(g),T);ctx.lineTo(X(g),T+ph);ctx.stroke();if(Math.abs(g)>1e-9||!o.equal){ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(fm(cl(g)),X(g),o.equal?Y(0)+3:T+ph+5);}}
for(let g=Math.ceil(y0/sty)*sty;g<=y1+1e-9;g+=sty){ctx.strokeStyle=Math.abs(g)<1e-9?tok('muted'):tok('faint');ctx.beginPath();ctx.moveTo(L,Y(g));ctx.lineTo(L+pw,Y(g));ctx.stroke();if(Math.abs(g)>1e-9||!o.equal){ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(fm(cl(g))+(o.equal?'i':''),o.equal?X(0)-4:L-5,Y(g));}}
if(o.equal){ctx.fillStyle=tok('muted');ctx.font=`600 11px ${MONO}`;ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText('Re',L+pw-2,Y(0)-3);ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('Im',X(0)+4,T+2);}
const A={ctx,X,Y,u:pw/(x1-x0)};
A.arrow=(x,y,col,lw,fx,fy)=>{fx=fx||0;fy=fy||0;const a=X(fx),b=Y(fy),c=X(x),d=Y(y),t=Math.atan2(d-b,c-a),hh=9;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw||2.4;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();
if(Math.hypot(c-a,d-b)>6){ctx.beginPath();ctx.moveTo(c,d);ctx.lineTo(c-hh*Math.cos(t-0.4),d-hh*Math.sin(t-0.4));ctx.lineTo(c-hh*Math.cos(t+0.4),d-hh*Math.sin(t+0.4));ctx.closePath();ctx.fill();}};
A.dot=(x,y,col,r)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(x),Y(y),r||4.5,0,7);ctx.fill();};
A.ring=(x,y,col,r)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(x),Y(y),r||5,0,7);ctx.stroke();};
A.label=(x,y,t,col,dx,dy)=>{ctx.fillStyle=col;ctx.font=`600 12px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(t,X(x)+(dx===undefined?8:dx),Y(y)+(dy===undefined?-10:dy));};
A.line=(pts,col,lw,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=lw||1.5;ctx.setLineDash(dash||[]);ctx.beginPath();let pen=false;pts.forEach(p=>{if(!p||!isFinite(p[1])){pen=false;return;}pen?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]));pen=true;});ctx.stroke();ctx.setLineDash([]);};
A.circle=(r,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash(dash||[4,4]);ctx.beginPath();ctx.arc(X(0),Y(0),r*A.u,0,7);ctx.stroke();ctx.setLineDash([]);};
A.arc=(r,t0,t1,col)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(0),Y(0),r,-t0,-t1,t1>t0);ctx.stroke();};
return A;}
const argGdc=(sec,c,t)=>gdc(sec,c,t);
/* signed sum of terms like [[2,'z²'],[−1,'z'],[5,'']]: zero terms dropped, coefficient 1 hidden */
const tj=arr=>{let s='';arr.forEach(([c,v])=>{c=cl(c);if(c===0)return;const a=Math.abs(c),body=(a===1&&v?'':fm(a))+v;s+=s?` ${c<0?MIN:'+'} ${body}`:(c<0?MIN:'')+body;});return s||'0';};
const pq=x=>x<0?`(${N(x)})`:String(x);
const rnz=(lo,hi)=>{let x=0;do{x=ri(lo,hi);}while(x===0);return x;};
const fr=(n,d)=>{if(d<0){n=-n;d=-d;}return LAB.frac(n,d).replace('-',MIN);};

/* ===== Cartesian form and the Argand diagram ===== */
(function(){
let key='add';
presets('#cart-pre',[['add','z + w'],['mul','zw'],['div','z ÷ w'],['conj','z*']],k=>{key=k;draw();},'add');
const R=ctrls('#cart-ctrls','ca-',[{head:'z = a + bi'},{id:'a',label:'a',min:-4,max:4,step:1,val:3},{id:'b',label:'b',min:-4,max:4,step:1,val:1},{head:'w = c + di'},{id:'c',label:'c',min:-4,max:4,step:1,val:1},{id:'d',label:'d',min:-4,max:4,step:1,val:2}],()=>draw());
readout('#cart-ro',[['caZ','z'],['caW','w'],['caR','result',1],['caM','what happened']]);
function draw(){
R.sync();const [a,b,c,d]=vals(R,'a','b','c','d');let res,lines,note;
if(key==='add'){res=[a+c,b+d];lines=[`z + w = (${a} + ${c}) + (${b} + ${d})i`,`= ${cT(...res)}: add real parts, add imaginary parts`];note='vectors added nose to tail: the diagonal of the parallelogram';}
else if(key==='mul'){res=cMul(a,b,c,d);lines=[`zw = (${cT(a,b)})(${cT(c,d)})`,`= ${a*c} + ${a*d}i + ${b*c}i + ${b*d}i²`,`i² = −1, so = ${cT(...res)}`];note='moduli multiply, arguments add (see the polar topic)';}
else if(key==='div'){if(c===0&&d===0){res=[NaN,NaN];lines=['w = 0: division by zero is undefined'];note='undefined';}else{res=cDiv(a,b,c,d);const m=c*c+d*d;lines=[`Multiply top and bottom by w* = ${cT(c,-d)}`,`(${cT(a,b)})(${cT(c,-d)}) = ${cT(a*c+b*d,b*c-a*d)}`,`w w* = ${pq(c)}² + ${pq(d)}² = ${m}`,`z ÷ w = ${cT(a*c+b*d,b*c-a*d)} over ${m} = ${cT(...res)}`];note='moduli divide, arguments subtract';}}
else{res=[a,-b];lines=[`z* = ${cT(a,-b)}: change the sign of the imaginary part`,`z z* = ${pq(a)}² + ${pq(b)}² = ${a*a+b*b}, always real`];note='reflection in the real axis';}
const pts=[[a,b],[c,d],res].filter(p=>isFinite(p[0]));const M=Math.max(4.5,...pts.map(p=>Math.max(Math.abs(p[0]),Math.abs(p[1]))))*1.15;
const A=axes($('#cart-cv'),{x0:-M,x1:M,y0:-M,y1:M},{equal:true});
if(key==='add'){A.line([[a,b],res],tok('amber'),1.4,[5,4]);A.line([[c,d],res],tok('accent'),1.4,[5,4]);}
if(key==='conj')A.line([[a,b],[a,-b]],tok('muted'),1.2,[3,4]);
A.arrow(a,b,tok('accent'));A.label(a,b,'z',tok('accent'));
if(key!=='conj'){A.arrow(c,d,tok('amber'));A.label(c,d,'w',tok('amber'));}
if(isFinite(res[0])){A.arrow(res[0],res[1],tok('good'),3);A.label(res[0],res[1],key==='add'?'z + w':key==='mul'?'zw':key==='div'?'z/w':'z*',tok('good'));}
put('caZ',cT(a,b));put('caW',key==='conj'?'(not used)':cT(c,d));put('caR',isFinite(res[0])?cT(...res):'undefined');put('caM',note);
const ic=x=>cT(...x).replace(/−/g,'-');
argGdc('cart',`Run-Matrix (Complex Mode a+bi): (${ic([a,b])})${key==='add'?'+':key==='mul'?'×':key==='div'?'÷':''}${key==='conj'?' → OPTN → COMPLEX → Conjg':'('+ic([c,d])+')'}; i is SHIFT 0`,`MODE a+bi: (${ic([a,b])})${key==='add'?'+':key==='mul'?'*':key==='div'?'/':''}${key==='conj'?' → MATH → CMPLX → 1:conj(':'('+ic([c,d])+')'}; i is 2nd .`);
work('cart',lines);
}
DRAW.cart=draw;
})();

/* ===== Modulus-argument (polar) and Euler form ===== */
(function(){
let key='mul';
presets('#polar-pre',[['mul','zw'],['div','z ÷ w']],k=>{key=k;draw();},'mul');
const R=ctrls('#polar-ctrls','po-',[{head:'z = r₁ cis θ₁'},{id:'r1',label:'r₁',min:0.5,max:3,step:0.25,val:2},{id:'t1',label:'θ₁',min:-11,max:12,step:1,val:2,fmt:P12},{head:'w = r₂ cis θ₂'},{id:'r2',label:'r₂',min:0.5,max:3,step:0.25,val:1.5},{id:'t2',label:'θ₂',min:-11,max:12,step:1,val:3,fmt:P12}],()=>draw());
readout('#polar-ro',[['poZ','z'],['poW','w'],['poR','result, modulus-argument',1],['poP','principal argument',1],['poC','result, Cartesian']]);
function draw(){
R.sync();const [r1,k1,r2,k2]=vals(R,'r1','t1','r2','t2');const t1=k1*PI12,t2=k2*PI12;
const r=key==='mul'?r1*r2:r1/r2,kk=key==='mul'?k1+k2:k1-k2,t=kk*PI12,pa=parg(t),kp=Math.round(pa/PI12);
const M=Math.max(3.2,r1,r2,r)*1.12;const A=axes($('#polar-cv'),{x0:-M,x1:M,y0:-M,y1:M},{equal:true});
A.circle(1,tok('muted'));
const pz=[r1*Math.cos(t1),r1*Math.sin(t1)],pw_=[r2*Math.cos(t2),r2*Math.sin(t2)],pr=[r*Math.cos(t),r*Math.sin(t)];
A.arc(22,0,t1,tok('accent'));A.arc(30,0,t2,tok('amber'));A.arc(38,0,pa,tok('good'));
A.arrow(...pz,tok('accent'));A.label(...pz,'z',tok('accent'));A.arrow(...pw_,tok('amber'));A.label(...pw_,'w',tok('amber'));A.arrow(...pr,tok('good'),3);A.label(...pr,key==='mul'?'zw':'z/w',tok('good'));
put('poZ',`${fm(r1)} cis ${P12(k1)}  =  ${cT(...pz)}`);put('poW',`${fm(r2)} cis ${P12(k2)}  =  ${cT(...pw_)}`);
put('poR',`${fm(r)} cis(${P12(k1)} ${key==='mul'?'+':MIN} ${k2<0?'('+P12(k2)+')':P12(k2)}) = ${fm(r)} cis ${P12(kk)}`);
put('poP',kk===kp?`${P12(kp)} (already in (−π, π])`:`${P12(kk)} ${kk>kp?MIN:'+'} 2π = ${P12(kp)}`);put('poC',cT(...pr));
argGdc('polar',`Run-Matrix, SET UP Complex Mode r∠θ, Angle Rad: (${fm(r1)}∠${P12(k1).replace('−','-')})${key==='mul'?'×':'÷'}(${fm(r2)}∠${P12(k2).replace('−','-')}); ∠ is SHIFT ×`,`MODE re^(θi), RADIAN: (${fm(r1)}e^(${P12(k1).replace('−','-')}i))${key==='mul'?'*':'/'}(${fm(r2)}e^(${P12(k2).replace('−','-')}i))`);
work('polar',[`${key==='mul'?'Multiply':'Divide'} the moduli: ${fm(r1)} ${key==='mul'?'×':'÷'} ${fm(r2)} = ${fm(r)}`,`${key==='mul'?'Add':'Subtract'} the arguments: ${P12(k1)} ${key==='mul'?'+':MIN} ${k2<0?'('+P12(k2)+')':P12(k2)} = ${P12(kk)}`,`In Euler form: ${fm(r1)}e^(i${P12(k1)}) ${key==='mul'?'×':'÷'} ${fm(r2)}e^(i${P12(k2)}) = ${fm(r)}e^(i${P12(kp)})`]);
}
DRAW.polar=draw;
})();

/* ===== Polynomial roots: conjugate pairs ===== */
(function(){
const R=ctrls('#polyroots-ctrls','pr-',[{head:'Complex root p + qi'},{id:'p',label:'p',min:-3,max:3,step:0.5,val:1},{id:'q',label:'q',min:0,max:3,step:0.5,val:2},{head:'Real root'},{id:'r',label:'r',min:-3,max:3,step:0.5,val:2}],()=>draw());
document.getElementById('polyroots-pre').innerHTML='<p class="small">A cubic with real coefficients: its non-real roots come as a conjugate pair.</p>';
readout('#polyroots-ro',[['prQ','quadratic factor (z − α)(z − α*)'],['prP','the cubic',1],['prS','sum of roots = −(coefficient of z²)'],['prX','product of roots = −(constant)'],['prN','graph of y = f(x)']]);
function draw(){
R.sync();const [p,q,r]=vals(R,'p','q','r');const s2=p*p+q*q,A_=-(r+2*p),B_=2*p*r+s2,C_=-r*s2;
const M=Math.max(3.5,Math.abs(p)+1,q+1,Math.abs(r)+1);const A=axes($('#polyroots-cv'),{x0:-M,x1:M,y0:-M,y1:M},{equal:true});
if(q>0)A.line([[p,q],[p,-q]],tok('muted'),1.2,[4,4]);A.dot(p,q,tok('accent'),6);A.dot(p,-q,tok('accent'),6);A.dot(r,0,tok('amber'),6);
A.label(p,q,'p + qi',tok('accent'));if(q>0)A.label(p,-q,'p − qi',tok('accent'),8,12);A.label(r,0,'r',tok('amber'),6,14);
const f=x=>(x-r)*(x*x-2*p*x+s2);const pts=[];for(let i=0;i<=300;i++){const x=-5+10*i/300;pts.push([x,f(x)]);}
let lo=Infinity,hi=-Infinity;pts.forEach(([,y])=>{if(Math.abs(y)<60){lo=Math.min(lo,y);hi=Math.max(hi,y);}});lo=Math.min(lo,-2);hi=Math.max(hi,2);
const G=axes($('#polyroots-graph'),{x0:-5,x1:5,y0:lo-1,y1:hi+1},{h:220});G.line(pts,tok('accent'),2.4);G.dot(r,0,tok('amber'),5.5);if(q===0){G.dot(p,0,tok('accent'),5.5);}
const zt=(c,v)=>{c=cl(c);if(c===0)return '';const a=Math.abs(c);return ` ${c<0?MIN:'+'} ${a===1&&v?'':fm(a)}${v}`;};
put('prQ',q===0?`(z ${p<0?'+':MIN} ${fm(Math.abs(p))})²: q = 0 makes a repeated real root`:`z²${zt(-2*p,'z')}${zt(s2,'')}`);
put('prP',`z³${zt(A_,'z²')}${zt(B_,'z')}${zt(C_,'')}`);put('prS',`${fm(r)} + 2(${fm(p)}) = ${fm(-A_)}`);put('prX',`${fm(r)} × ${fm(s2)} = ${fm(-C_)}`);
put('prN',q===0?'touches or crosses at every real root':'crosses the x-axis once, at x = r; the complex pair is invisible on a real graph');
argGdc('polyroots',`MENU → Equation → F2 POLYNOMIAL → degree 3, coefficients 1, ${fm(A_)}, ${fm(B_)}, ${fm(C_)}, SOLVE (Complex Mode a+bi)`,`TI-84 Plus CE: APPS → PlySmlt2 → POLYNOMIAL ROOT FINDER, order 3, a+bi, coefficients 1, ${fm(A_)}, ${fm(B_)}, ${fm(C_)}`);
work('polyroots',[`Real coefficients ⇒ if p + qi is a root, so is p − qi.`,`(z − (p + qi))(z − (p − qi)) = (z − p)² + q² = z² − 2pz + (p² + q²)`,`Here: z² ${-2*p<0?MIN:'+'} ${fm(Math.abs(2*p))}z + ${fm(s2)}, times (z ${r<0?'+':MIN} ${fm(Math.abs(r))})`]);
}
DRAW.polyroots=draw;
})();

/* ===== De Moivre's theorem: powers spiral ===== */
(function(){
const R=ctrls('#demoivre-ctrls','dm-',[{head:'z = r cis θ'},{id:'r',label:'r',min:0.8,max:1.25,step:0.05,val:1.1},{id:'t',label:'θ',min:1,max:12,step:1,val:2,fmt:P12},{head:'Power'},{id:'n',label:'n',min:1,max:12,step:1,val:6}],()=>draw());
document.getElementById('demoivre-pre').innerHTML='<p class="small">Each multiplication by z turns by θ and stretches by r. The dots are z⁰, z¹, z², …</p>';
readout('#demoivre-ro',[['dmZ','z'],['dmN','zⁿ = rⁿ cis nθ',1],['dmP','principal argument',1],['dmC','zⁿ, Cartesian'],['dmR','real or imaginary?']]);
function draw(){
R.sync();const [r,k,n]=vals(R,'r','t','n');const t=k*PI12;
const pts=[];for(let j=0;j<=n;j++)pts.push([r**j*Math.cos(j*t),r**j*Math.sin(j*t)]);
const M=Math.max(1.3,...pts.map(p=>Math.hypot(p[0],p[1])))*1.15;const A=axes($('#demoivre-cv'),{x0:-M,x1:M,y0:-M,y1:M},{equal:true});
A.circle(1,tok('muted'));A.line(pts,rgba('accent',0.5),1.6);pts.forEach((p,j)=>{A.dot(p[0],p[1],j===n?tok('good'):tok('accent'),j===n?6:3.5);});
A.arrow(pts[1][0],pts[1][1],tok('accent'),2);A.label(pts[1][0],pts[1][1],'z',tok('accent'));A.arrow(pts[n][0],pts[n][1],tok('good'),3);A.label(pts[n][0],pts[n][1],'z'+(n>1?(['','','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰','¹¹','¹²'][n]):''),tok('good'));
const kk=n*k,pa=parg(kk*PI12),kp=Math.round(pa/PI12),rn_=r**n,re=rn_*Math.cos(kk*PI12),im=rn_*Math.sin(kk*PI12);
put('dmZ',`${fm(r)} cis ${P12(k)}`);put('dmN',`${fm(r)}${['','','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰','¹¹','¹²'][n]||'^'+n} cis(${n} × ${P12(k)}) = ${fm(rn_)} cis ${P12(kk)}`);
put('dmP',P12(kp));put('dmC',cT(re,im));
put('dmR',kp%12===0?'real: nθ is a multiple of π':kp%6===0?'purely imaginary: nθ is an odd multiple of π/2':'neither');
argGdc('demoivre',`Run-Matrix, Complex Mode r∠θ, Rad: (${fm(r)}∠${P12(k)})^${n}`,`MODE re^(θi), RADIAN: (${fm(r)}e^(${P12(k)}i))^${n}`);
work('demoivre',[`De Moivre: (r cis θ)ⁿ = rⁿ cis nθ`,`(${fm(r)} cis ${P12(k)})^${n} = ${fm(rn_)} cis ${P12(kk)}`,kk===kp?'':`Reduce the argument: ${P12(kk)} → ${P12(kp)} (subtract multiples of 2π)`,`= ${cT(re,im)}`].filter(Boolean));
}
DRAW.demoivre=draw;
})();

/* ===== nth roots ===== */
(function(){
const MODS=[1,2,8,16,27,32,64,81];
const R=ctrls('#croots-ctrls','cr-',[{head:'Solve zⁿ = w'},{id:'n',label:'n',min:2,max:8,step:1,val:3},{id:'m',label:'|w|',min:0,max:7,step:1,val:2,fmt:i=>String(MODS[i])},{id:'t',label:'arg w',min:0,max:23,step:1,val:6,fmt:P12}],()=>draw());
document.getElementById('croots-pre').innerHTML='<p class="small">The n roots sit on one circle, equally spaced 2π/n apart: the corners of a regular polygon.</p>';
readout('#croots-ro',[['crW','w'],['crM','modulus of every root'],['crF','first root (k = 0)',1],['crA','arguments',1],['crS','sum of the roots']]);
function draw(){
R.sync();const n=+R.n.value,W=MODS[+R.m.value],k=+R.t.value;const th=k*PI12,rr=Math.pow(W,1/n);
const roots=[];for(let j=0;j<n;j++){const a=(th+TAU*j)/n;roots.push([rr*Math.cos(a),rr*Math.sin(a),a]);}
const M=Math.max(rr,Math.min(W,rr*2.2),1.3)*1.18;const A=axes($('#croots-cv'),{x0:-M,x1:M,y0:-M,y1:M},{equal:true});
A.circle(rr,tok('accent'));const wx=W*Math.cos(th),wy=W*Math.sin(th);
if(W<=M*1.05){A.arrow(wx,wy,tok('amber'),2.4);A.label(wx,wy,'w',tok('amber'));}
else{const s=M*0.92/W;A.arrow(wx*s,wy*s,tok('amber'),2.4);A.label(wx*s,wy*s,'w, scaled down',tok('amber'),10,14);}
A.line(roots.concat([roots[0]]).map(p=>[p[0],p[1]]),rgba('accent',0.6),1.6);roots.forEach((p,j)=>A.dot(p[0],p[1],j===0?tok('good'):tok('accent'),j===0?6.5:5));
const argList=roots.map(p=>ang(parg(p[2])));
put('crW',`${W} cis ${P12(k)}  =  ${cT(wx,wy)}`);put('crM',`${W}^(1/${n}) = ${fm(rr)}`);put('crF',`${fm(rr)} cis ${ang(th/n)} = ${cT(roots[0][0],roots[0][1])}`);
put('crA',argList.join(', ')+`  (spacing ${24%n===0?P12(24/n):'2π/'+n})`);put('crS','0, for every n ≥ 2');
argGdc('croots',`Check a root: Run-Matrix, (${fm(rr)}∠${ang(th/n)})^${n} should give ${W}∠${P12(k)}`,`Check a root: (${fm(rr)}e^(${ang(th/n)}i))^${n} should give ${W}e^(${P12(k)}i)`);
work('croots',[`w = ${W} cis(${P12(k)} + 2kπ): adding 2kπ doesn't change w`,`z = ${W}^(1/${n}) cis((${P12(k)} + 2kπ) ÷ ${n}), k = 0, 1, …, ${n-1}`,`= ${fm(rr)} cis(${ang(th/n)} + ${24%n===0?P12(24/n):'2π/'+n} × k)`]);
}
DRAW.croots=draw;
})();

/* ===== Practice generators ===== */
const GEN={
cart:[
()=>{const a=rnz(-5,5),b=rnz(-5,5),c=rnz(-5,5),d=rnz(-5,5),re=Math.random()<0.5;const [x,y]=cMul(a,b,c,d);const ans=re?x:y;
return {q:`Find the ${re?'real':'imaginary'} part of (${cT(a,b)})(${cT(c,d)}).`,ans,exact:true,
work:[`Expand: ${tj([[a*c,''],[a*d,'i'],[b*c,'i'],[b*d,'i²']])}.`,`i² = −1: (${a*c} ${b*d<0?'+':MIN} ${Math.abs(b*d)}) + (${a*d} ${b*c<0?MIN:'+'} ${Math.abs(b*c)})i = ${cT(x,y)}.`,`${re?'Real':'Imaginary'} part = <b>${fm(ans)}</b>.`],tip:`FOIL, then replace i² by −1. Real part: ac − bd. Imaginary part: ad + bc.`};},
()=>{const a=rnz(-6,6),b=rnz(-6,6),c=rnz(-4,4),d=rnz(-4,4),re=Math.random()<0.5;const m=c*c+d*d,[x,y]=cDiv(a,b,c,d);const ans=re?x:y;
return {q:`Write (${cT(a,b)}) ÷ (${cT(c,d)}) in the form x + yi and give the value of ${re?'x':'y'}.`,ans,
work:[`Multiply top and bottom by the conjugate ${cT(c,-d)}.`,`Top: (${cT(a,b)})(${cT(c,-d)}) = ${cT(a*c+b*d,b*c-a*d)}. Bottom: ${pq(c)}² + ${pq(d)}² = ${m}.`,`${re?'x':'y'} = ${fr(re?a*c+b*d:b*c-a*d,m)} = <b>${sf(ans)}</b>.`],tip:`Divide by realising the denominator: multiply by w*. w w* = c² + d² is always real.`};},
()=>{const k=pick([2,3,-2,-3,4]),x=rnz(-4,4),y=rnz(-4,4),re=Math.random()<0.5;const p=(1+k)*x,q=(1-k)*y;
return {q:`Find the complex number z that satisfies z ${k<0?MIN:'+'} ${Math.abs(k)}z* = ${cT(p,q)}, and give ${re?'Re(z)':'Im(z)'}.`,ans:re?x:y,exact:true,
work:[`Let z = x + yi, so z* = x − yi.`,`(x + yi) ${k<0?MIN:'+'} ${Math.abs(k)}(x − yi) = ${tj([[1+k,'x'],[1-k,'yi']])}.`,`Real parts: ${tj([[1+k,'x']])} = ${p} ⇒ x = ${x}. Imaginary parts: ${tj([[1-k,'y']])} = ${q} ⇒ y = ${y}.`,`z = ${cT(x,y)}, so ${re?'Re':'Im'}(z) = <b>${re?x:y}</b>.`],tip:`Two unknowns, two equations: equate real parts and imaginary parts separately.`};},
()=>{const n=ri(5,60),m=ri(5,60);const v=[1,0,-1,0],ans=v[n%4]+v[m%4];const iv=['1','i','−1','−i'];
return {q:`Find the real part of i<sup>${n}</sup> + i<sup>${m}</sup>.`,ans,exact:true,
work:[`Powers of i repeat every 4: i, −1, −i, 1.`,`${n} = 4 × ${Math.floor(n/4)} + ${n%4}, so i<sup>${n}</sup> = ${iv[n%4]}. ${m} = 4 × ${Math.floor(m/4)} + ${m%4}, so i<sup>${m}</sup> = ${iv[m%4]}.`,`Real part = <b>${ans}</b>.`],tip:`Divide the power by 4 and use the remainder: 0 → 1, 1 → i, 2 → −1, 3 → −i.`};},
()=>{let x=ri(1,5),y=rnz(-5,5);const a=x*x-y*y,b=2*x*y;
return {q:`The square roots of ${cT(a,b)} are ±(x + yi), where x &gt; 0. Find x.`,ans:x,exact:true,
work:[`(x + yi)² = x² − y² + 2xyi = ${cT(a,b)}.`,`x² − y² = ${a} and xy = ${b/2}.`,`Substitute y = ${b/2}/x: x⁴ ${-a<0?MIN:'+'} ${Math.abs(a)}x² − ${b*b/4} = 0 ⇒ x² = ${x*x} (x² must be positive).`,`x = <b>${x}</b>, y = ${y}: the roots are ±(${cT(x,y)}).`],tip:`Square roots of a + bi: set (x + yi)² = a + bi, equate parts, and get a quadratic in x².`};},
()=>{const a=rnz(-4,4),b=rnz(-4,4),c=rnz(-3,3),d=rnz(-3,3);const [p,q]=cMul(a,b,c,d);
return {q:`Find the real numbers a and b such that (a + bi)(${cT(c,d)}) = ${cT(p,q)}. Give a.`,ans:a,exact:true,
work:[`a + bi = (${cT(p,q)}) ÷ (${cT(c,d)}).`,`Multiply top and bottom by ${cT(c,-d)}: (${cT(p*c+q*d,q*c-p*d)}) ÷ ${c*c+d*d}.`,`= ${cT(a,b)}, so a = <b>${a}</b>.`],tip:`An unknown complex factor: divide. Or expand and equate real and imaginary parts.`};}
],
polar:[
()=>{const a=rnz(-6,6),b=rnz(-6,6);const ans=Math.hypot(a,b);
return {q:`Find |${cT(a,b)}|.`,ans,work:[`|a + bi| = √(a² + b²).`,`√(${a*a} + ${b*b}) = ${modT(a*a+b*b)}.`,`= <b>${sf(ans)}</b>.`],tip:`Modulus = distance from O: Pythagoras on the Argand diagram.`};},
()=>{const a=rnz(-5,5),b=rnz(-5,5);const ans=Math.atan2(b,a);const quad=a>0?'first or fourth':b>0?'second':'third';
return {q:`Find arg(${cT(a,b)}), in radians, with −π &lt; arg ≤ π.`,ans,
work:[`The point (${a}, ${b}) is in the ${a>0&&b>0?'first':a<0&&b>0?'second':a<0&&b<0?'third':'fourth'} quadrant.`,`Reference angle: arctan(${Math.abs(b)}/${Math.abs(a)}) = ${sf(Math.atan(Math.abs(b/a)),4)}.`,a>0?`First or fourth quadrant: arg = ${b<0?'−':''}${sf(Math.atan(Math.abs(b/a)),4)} = <b>${sf(ans)}</b>.`:`${b>0?'Second quadrant: π −':'Third quadrant: −(π −'} ${sf(Math.atan(Math.abs(b/a)),4)}${b>0?'':')'} = <b>${sf(ans)}</b>.`],tip:`Sketch it first. arctan(b/a) alone is only right in the first and fourth quadrants.`};},
()=>{const r1=pick([2,3,0.5]),r2=pick([2,3,4,0.5]),n=ri(2,4),m=ri(1,3);const ans=r1**n*r2**m;if(ans>2000)return GEN.polar[2]();
const wm=m===1?'':`<sup>${m}</sup>`;return {q:`|z| = ${r1} and |w| = ${r2}. Find |z<sup>${n}</sup>w${wm}|.`,ans,
work:[`Moduli multiply: |z<sup>${n}</sup>w${wm}| = |z|<sup>${n}</sup>|w|${wm}.`,`= ${r1}<sup>${n}</sup> × ${r2}${wm}.`,`= <b>${sf(ans)}</b>.`],tip:`|zw| = |z||w| and |zⁿ| = |z|ⁿ. No need to find z or w.`};},
()=>{const k1=rnz(-11,12),k2=rnz(-11,12),mul=Math.random()<0.5;const kk=mul?k1+k2:k1-k2,pa=parg(kk*PI12),kp=Math.round(pa/PI12);const ans=kp/12;
return {q:`arg z = ${P12(k1)} and arg w = ${P12(k2)}. Find arg(${mul?'zw':'z/w'}) in the form kπ with −1 &lt; k ≤ 1, and give k.`,ans,
work:[`Arguments ${mul?'add':'subtract'}: ${P12(k1)} ${mul?'+':MIN} ${k2<0?'('+P12(k2)+')':P12(k2)} = ${P12(kk)}.`,kk===kp?`Already between −π and π.`:`Bring into (−π, π]: ${P12(kk)} ${kk>kp?MIN:'+'} 2π = ${P12(kp)}.`,`k = <b>${fr(kp,12)}</b>.`],tip:`Multiply ⇒ add arguments. Divide ⇒ subtract. Then add or subtract 2π to get the principal value.`};},
()=>{const r=pick([2,3,4,6,10]),k=pick([2,3,4,6,8,9,10,-2,-3,-4,-8]),re=Math.random()<0.5;const ans=re?r*Math.cos(k*PI12):r*Math.sin(k*PI12);
return {q:`z = ${r} cis(${P12(k)}). Find ${re?'Re(z)':'Im(z)'}.`,ans,
work:[`r cis θ = r cos θ + i r sin θ.`,`${re?'Re':'Im'}(z) = ${r} ${re?'cos':'sin'}(${P12(k)}).`,`= <b>${sf(ans)}</b>.`],tip:`cis θ = cos θ + i sin θ: cos gives the real part, sin the imaginary part.`};},
()=>{const a=rnz(-4,4),b=rnz(-4,4);const ans=a*a+b*b;
return {q:`z = ${cT(a,b)}. Find z z*.`,ans,exact:true,work:[`z* = ${cT(a,-b)}.`,`z z* = a² + b² = ${a*a} + ${b*b}.`,`= <b>${ans}</b> = |z|².`],tip:`z z* = |z|², always a non-negative real number.`};}
],
polyroots:[
()=>{const p=rnz(-4,4),q=ri(1,5),askc=Math.random()<0.5;const b=-2*p,c=p*p+q*q;
return {q:`The quadratic z² + bz + c = 0, with b and c real, has a root ${cT(p,q)}. Find ${askc?'c':'b'}.`,ans:askc?c:b,exact:true,
work:[`Real coefficients ⇒ ${cT(p,-q)} is also a root.`,`Sum of roots = ${2*p} = −b ⇒ b = ${b}.`,`Product = (${cT(p,q)})(${cT(p,-q)}) = ${p*p} + ${q*q} = ${c} = c.`,`${askc?'c':'b'} = <b>${askc?c:b}</b>.`],tip:`Conjugate pair p ± qi gives the factor z² − 2pz + (p² + q²).`};},
()=>{const p=rnz(-3,3),q=ri(1,3),r=rnz(-4,4),w=pick(['A','B','C']);const s2=p*p+q*q,A=-(r+2*p),B=2*p*r+s2,Cc=-r*s2;const ans={A,B,C:Cc}[w];
return {q:`The cubic z³ + Az² + Bz + C = 0 has real coefficients, a real root ${r} and a root ${cT(p,q)}. Find ${w}.`,ans,exact:true,
work:[`The roots are ${r}, ${cT(p,q)} and ${cT(p,-q)}.`,`Quadratic factor: z² ${-2*p<0?MIN:'+'} ${Math.abs(2*p)}z + ${s2}. Multiply by (z ${r<0?'+':MIN} ${Math.abs(r)}).`,`${tj([[1,'z³'],[A,'z²'],[B,'z'],[Cc,'']])}, so ${w} = <b>${ans}</b>.`],tip:`Build the quadratic from the conjugate pair, then multiply by the linear factor.`};},
()=>{const p=rnz(-3,3),q=ri(1,3),r=rnz(-4,4);const s2=p*p+q*q,A=-(r+2*p),B=2*p*r+s2,Cc=-r*s2;
return {q:`Given that ${cT(p,q)} is a root of ${tj([[1,'z³'],[A,'z²'],[B,'z'],[Cc,'']])} = 0, find the real root.`,ans:r,exact:true,
work:[`${cT(p,-q)} is also a root (real coefficients).`,`Product of roots = −(constant) = ${-Cc}. The pair multiplies to ${s2}.`,`Real root = ${-Cc} ÷ ${s2} = <b>${r}</b>.`],tip:`Fastest route: product of all roots = (−1)ⁿ × constant ÷ leading coefficient.`};},
()=>{const c=[rnz(1,3),ri(-9,9),ri(-9,9),ri(-9,9),rnz(-9,9)],sum=Math.random()<0.5;const ans=sum?-c[1]/c[0]:c[4]/c[0];
const t=(k,v)=>{if(k===0)return '';return ` ${k<0?MIN:'+'} ${Math.abs(k)===1&&v?'':Math.abs(k)}${v}`;};
return {q:`Find the ${sum?'sum':'product'} of the roots of ${c[0]===1?'':c[0]}z⁴${t(c[1],'z³')}${t(c[2],'z²')}${t(c[3],'z')}${t(c[4],'')} = 0.`,ans,
work:[sum?`Sum of roots = −(coefficient of z³) ÷ (leading coefficient).`:`Product of roots = (−1)⁴ × constant ÷ leading coefficient.`,sum?`= −(${c[1]}) ÷ ${c[0]}.`:`= ${c[4]} ÷ ${c[0]}.`,`= <b>${fr(sum?-c[1]:c[4],c[0])}</b>.`],tip:`Degree n: sum = −aₙ₋₁/aₙ, product = (−1)ⁿa₀/aₙ. Complex roots are included.`};},
()=>{const A=ri(-6,6),B=ri(-8,8),Cc=rnz(-9,9);const ans=A*A-2*B;
return {q:`α, β and γ are the roots of ${tj([[1,'z³'],[A,'z²'],[B,'z'],[Cc,'']])} = 0. Find α² + β² + γ².`,ans,exact:true,
work:[`α + β + γ = ${-A}, αβ + βγ + γα = ${B}.`,`α² + β² + γ² = (α + β + γ)² − 2(αβ + βγ + γα).`,`= ${A*A} − ${2*B<0?'('+2*B+')':2*B} = <b>${ans}</b>.`],tip:`Sum of squares = (sum)² − 2(sum of pairs). No need to find the roots.`};}
],
demoivre:[
()=>{const n=ri(3,12);const ans=Math.round(2**(n/2)*Math.cos(n*Math.PI/4)*1e9)/1e9;
return {q:`Find the real part of (1 + i)<sup>${n}</sup>.`,ans,exact:true,
work:[`1 + i = √2 cis(π/4).`,`(1 + i)<sup>${n}</sup> = (√2)<sup>${n}</sup> cis(${P12(3*n)}) = ${n%2?'√2 × '+2**((n-1)/2):2**(n/2)} cis(${P12(Math.round(parg(3*n*PI12)/PI12))}).`,`Real part = ${n%2?'√2 × '+2**((n-1)/2):2**(n/2)} × cos(${P12(Math.round(parg(3*n*PI12)/PI12))}) = <b>${sf(ans)}</b>.`],tip:`Convert to polar, apply De Moivre, convert back. Never expand a binomial to a high power.`};},
()=>{const n=ri(2,8),mod=Math.random()<0.5;if(mod){const ans=2**n;return {q:`Find |(√3 + i)<sup>${n}</sup>|.`,ans,exact:true,work:[`|√3 + i| = √(3 + 1) = 2.`,`|z<sup>${n}</sup>| = |z|<sup>${n}</sup> = 2<sup>${n}</sup>.`,`= <b>${ans}</b>.`],tip:`|zⁿ| = |z|ⁿ: find the modulus first, then raise it.`};}
const kk=2*n,kp=Math.round(parg(kk*PI12)/PI12);return {q:`arg((√3 + i)<sup>${n}</sup>) = kπ with −1 &lt; k ≤ 1. Find k.`,ans:kp/12,work:[`arg(√3 + i) = π/6.`,`arg(z<sup>${n}</sup>) = ${n} × π/6 = ${P12(kk)}${kk===kp?'':`, which reduces to ${P12(kp)}`}.`,`k = <b>${fr(kp,12)}</b>.`],tip:`arg(zⁿ) = n arg z, then reduce into (−π, π].`};},
()=>{let p=ri(1,11),q=pick([3,4,5,6,8,12]);if(p%q===0)p++;const g=gcd(p,q);const ans=q/g;
return {q:`z = cis(${p===1?'':p}π/${q}). Find the smallest positive integer n for which zⁿ is real.`,ans,exact:true,
work:[`zⁿ = cis(${p===1?'':p}nπ/${q}). It is real when the argument is a multiple of π.`,`${p}n/${q} must be an integer.`,`Smallest n = ${q} ÷ gcd(${p}, ${q}) = <b>${ans}</b>.`],tip:`zⁿ real ⇔ nθ = kπ. zⁿ purely imaginary ⇔ nθ = π/2 + kπ.`};},
()=>{const c=pick([0.2,0.4,0.5,0.6,0.8,-0.3,-0.5,1/3]);const ans=4*c**3-3*c;
return {q:`Given that cos θ = ${c===1/3?'1/3':String(c).replace('-',MIN)}, use cos 3θ = 4cos³θ − 3cos θ to find cos 3θ.`,ans,
work:[`De Moivre: cos 3θ = Re((cos θ + i sin θ)³) = cos³θ − 3cos θ sin²θ = 4cos³θ − 3cos θ.`,`= 4(${sf(c,4)})³ − 3(${sf(c,4)}).`,`= <b>${sf(ans)}</b>.`],tip:`Real part of the cube gives cos 3θ; imaginary part gives sin 3θ = 3sin θ − 4sin³θ.`};},
()=>{const r=pick([1,2,0.5]),k=pick([1,2,3,4,5,-1,-2]),n=ri(2,6),re=Math.random()<0.5;const ans=r**n*(re?Math.cos(n*k*PI12):Math.sin(n*k*PI12));
return {q:`z = ${r===1?'':r+' '}cis(${P12(k)}). Find ${re?'Re':'Im'}(z<sup>${n}</sup>).`,ans,
work:[`z<sup>${n}</sup> = ${r===1?'':r+'<sup>'+n+'</sup> '}cis(${n} × ${P12(k)}) = ${fm(r**n)} cis(${P12(n*k)}).`,`${re?'Re':'Im'} = ${fm(r**n)} ${re?'cos':'sin'}(${P12(n*k)}).`,`= <b>${sf(ans)}</b>.`],tip:`Power the modulus, multiply the argument.`};},
()=>{const s=pick([0.2,0.3,0.5,0.6,-0.4]);const ans=3*s-4*s**3;
return {q:`Given that sin θ = ${String(s).replace('-',MIN)}, find sin 3θ.`,ans,
work:[`Im((cos θ + i sin θ)³) = 3cos²θ sin θ − sin³θ = 3(1 − sin²θ)sin θ − sin³θ = 3sin θ − 4sin³θ.`,`= 3(${s}) − 4(${s})³.`,`= <b>${sf(ans)}</b>.`],tip:`Expand (c + is)³, take the imaginary part, replace cos² by 1 − sin².`};}
],
croots:[
()=>{const n=pick([2,3,4,5,6]),R=pick([16,32,64,81,8,27,243,729]);const ans=Math.pow(R,1/n);
return {q:`Find the modulus of each root of z<sup>${n}</sup> = ${R}i.`,ans,
work:[`|${R}i| = ${R}.`,`Every root has modulus ${R}<sup>1/${n}</sup>.`,`= <b>${sf(ans)}</b>.`],tip:`All n roots lie on one circle, radius |w|^(1/n).`};},
()=>{const n=pick([2,3,4,5,6]),k=ri(1,23);const ans=k/(12*n);
return {q:`The roots of z<sup>${n}</sup> = 8 cis(${P12(k)}) are written r cis θ. The root with the smallest positive argument has θ = kπ. Find k.`,ans,
work:[`z = 8<sup>1/${n}</sup> cis((${P12(k)} + 2mπ) ÷ ${n}).`,`m = 0 gives the smallest positive argument: ${P12(k)} ÷ ${n}.`,`k = <b>${fr(k,12*n)}</b>.`],tip:`Divide the argument by n for the first root, then add 2π/n for each of the others.`};},
()=>{const n=pick([3,4,6,2]),R=pick([8,16,27,64,1]),k=pick([3,6,9,12,4,8]);const rr=Math.pow(R,1/n),ans=rr*Math.cos(k*PI12/n);
return {q:`Find the real part of the root of z<sup>${n}</sup> = ${R===1?'':R+' '}cis(${P12(k)}) with the smallest positive argument.`,ans,
work:[`Modulus: ${R}<sup>1/${n}</sup> = ${fm(rr)}. Argument of the first root: ${P12(k)} ÷ ${n} = ${ang(k*PI12/n)}.`,`Real part = ${fm(rr)} cos(${ang(k*PI12/n)}).`,`= <b>${sf(ans)}</b>.`],tip:`First root: nth root of the modulus, argument ÷ n.`};},
()=>{const n=pick([3,4,5,6,8]),R=pick([1,8,16,32,64]);const rr=Math.pow(R,1/n),ans=n/2*rr*rr*Math.sin(TAU/n);
return {q:`The roots of z<sup>${n}</sup> = ${R} form a regular polygon on the Argand diagram. Find its area.`,ans,
work:[`The roots lie on a circle of radius ${R}<sup>1/${n}</sup> = ${fm(rr)}, spaced 2π/${n} apart.`,`The polygon is ${n} triangles, each with area ½r² sin(2π/${n}).`,`Area = ${n} × ½ × ${fm(rr*rr)} × sin(2π/${n}) = <b>${sf(ans)}</b>.`],tip:`n triangles from the centre, each ½r² sin(2π/n).`};},
()=>{const a=rnz(-4,5);const ans=a*a-a+1;
return {q:`ω is a complex cube root of 1. Find (${N(a)} + ω)(${N(a)} + ω²).`,ans,exact:true,
work:[`ω³ = 1 and 1 + ω + ω² = 0, so ω + ω² = −1.`,`Expand: ${a*a} + (${N(a)})(ω + ω²) + ω³.`,`= ${a*a} ${a<0?'+':MIN} ${Math.abs(a)} + 1 = <b>${ans}</b>.`],tip:`Cube roots of unity: ω³ = 1 and 1 + ω + ω² = 0. Use both to simplify.`};}
],

direct:[
/* identity coefficient */
()=>{const a=ri(1,7),b=ri(1,5);const k=4*a*b;
return {q:`Show that (${a===1?'':a}n + ${b})² − (${a===1?'':a}n − ${b})² ≡ kn, where k is a constant, and find k.`,ans:k,exact:true,
work:[`Expand both: (${a===1?'':a}n + ${b})² = ${a*a===1?'':a*a}n² + ${2*a*b}n + ${b*b}, and (${a===1?'':a}n − ${b})² = ${a*a===1?'':a*a}n² − ${2*a*b}n + ${b*b}.`,`Subtract: the n² and constant terms cancel, leaving ${2*a*b}n + ${2*a*b}n = ${k}n.`,`So k = <b>${k}</b>. Every integer n gives a multiple of ${k}.`],tip:`(A + B)² − (A − B)² = 4AB. Spot it and skip the expansion.`};},
/* sum of consecutive integers */
()=>{const k=ri(3,9),c=k*(k-1)/2;
return {q:`The sum of ${k} consecutive integers, starting with n, can be written as ${k}n + c. Find c, and hence state whether the sum is always divisible by ${k}.`,ans:c,exact:true,
work:[`n + (n + 1) + … + (n + ${k-1}) = ${k}n + (0 + 1 + … + ${k-1}).`,`0 + 1 + … + ${k-1} = ${k-1} × ${k} ÷ 2 = ${c}.`,`So c = <b>${c}</b>. ${c%k===0?`${c} = ${k} × ${c/k}, so the sum ${k}(n + ${c/k}) is always divisible by ${k}.`:`${c} is not a multiple of ${k}, so the sum leaves remainder ${c%k} and is never divisible by ${k}.`}`],tip:`k consecutive integers sum to kn + k(k − 1)/2. Odd k: always divisible by k. Even k: never.`};},
/* largest integer that always divides */
()=>{const E=pick([
['n(n + 1)',n=>n*(n+1),'one of two consecutive integers is even'],
['n(n + 1)(n + 2)',n=>n*(n+1)*(n+2),'three consecutive integers include a multiple of 2 and of 3'],
['(2n + 1)² − 1',n=>(2*n+1)**2-1,'it equals 4n(n + 1), and n(n + 1) is even'],
['n³ − n',n=>n**3-n,'it equals (n − 1)n(n + 1), three consecutive integers'],
['(n + 1)³ − n³ − 1',n=>(n+1)**3-n**3-1,'it equals 3n² + 3n = 3n(n + 1), and n(n + 1) is even'],
['n⁴ − n²',n=>n**4-n*n,'it equals n²(n − 1)(n + 1): a multiple of 3, and of 4 from the even factors'],
['(2n + 1)² − (2n − 1)²',n=>(2*n+1)**2-(2*n-1)**2,'it equals 8n']]);
let g=0;for(let n=1;n<=60;n++)g=gcd(g,E[1](n));
return {q:`Find the largest integer that divides ${E[0]} for every positive integer n.`,ans:g,exact:true,
work:[`Try small n: ${[1,2,3].map(n=>`n = ${n} gives ${E[1](n)}`).join(', ')}.`,`The largest common factor of these is ${g}, so the answer can be no bigger than ${g}.`,`Proof that ${g} always works: ${E[2]}.`,`Answer: <b>${g}</b>.`],tip:`Small cases give the candidate. Factorise to prove it: consecutive integers supply the 2s and 3s.`};},
/* four consecutive integers + 1 */
()=>{const n=ri(2,15),m=n*n+3*n+1;
return {q:`It can be shown that n(n + 1)(n + 2)(n + 3) + 1 is always a perfect square, (n² + 3n + 1)². For n = ${n}, find the positive integer m with n(n + 1)(n + 2)(n + 3) + 1 = m².`,ans:m,exact:true,
work:[`Pair the outer and inner factors: n(n + 3) = n² + 3n and (n + 1)(n + 2) = n² + 3n + 2.`,`With x = n² + 3n, the product is x(x + 2) + 1 = x² + 2x + 1 = (x + 1)².`,`So m = n² + 3n + 1 = ${n*n} + ${3*n} + 1 = <b>${m}</b>. Check: ${n}×${n+1}×${n+2}×${n+3} + 1 = ${n*(n+1)*(n+2)*(n+3)+1} = ${m}².`],tip:`Pair outer with inner so the brackets share n² + 3n, then substitute x.`};}
],
indsum:[
/* use a standard result between limits */
()=>{const F=pick([['r',r=>r,n=>n*(n+1)/2,'n(n + 1)/2'],['r²',r=>r*r,n=>n*(n+1)*(2*n+1)/6,'n(n + 1)(2n + 1)/6'],['r³',r=>r**3,n=>(n*(n+1)/2)**2,'n²(n + 1)²/4'],['r(r + 1)',r=>r*(r+1),n=>n*(n+1)*(n+2)/3,'n(n + 1)(n + 2)/3']]);
const a=ri(6,15),b=a+ri(8,20);const v=F[2](b)-F[2](a-1);
return {q:`Given that Σ<sub>r=1</sub><sup>n</sup> ${F[0]} = ${F[3]} (proved by induction), find Σ<sub>r=${a}</sub><sup>${b}</sup> ${F[0]}.`,ans:v,exact:true,
work:[`Σ from ${a} to ${b} = Σ from 1 to ${b} − Σ from 1 to ${a-1}.`,`= ${F[2](b)} − ${F[2](a-1)}`,`= <b>${v}</b>`,C(`Check: Σ(${F[0].replace('r','X').replace('r','X')},X,${a},${b})`,`Check: sum(seq(${F[0].replace('r','X').replace('r','X')},X,${a},${b}))`)],tip:`Subtract up to (a − 1), not up to a. The lower limit itself belongs in the sum.`};},
/* telescoping */
()=>{const c=ri(0,3),n=ri(5,40);const num=n,den=(c+1)*(n+c+1);const g=gcd(num,den);
const lt=c===0?'1/(r(r + 1))':`1/((r + ${c})(r + ${c+1}))`,rt=c===0?'n/(n + 1)':`n/(${c+1}(n + ${c+1}))`;
return {q:`Prove by induction that Σ<sub>r=1</sub><sup>n</sup> ${lt} = ${rt}. Hence evaluate the sum for n = ${n}.`,ans:num/den,
work:[`Base: n = 1 gives 1/(${(1+c)*(2+c)}) on both sides.`,`Step: add the next term to ${c===0?'k/(k + 1)':`k/(${c+1}(k + ${c+1}))`}, put over a common denominator, and the numerator factorises to give ${c===0?'(k + 1)/(k + 2)':`(k + 1)/(${c+1}(k + ${c+2}))`}.`,`For n = ${n}: ${n}/(${c===0?'':c+1+' × '}${n+c+1}) = ${num}/${den} = <b>${num/g}/${den/g}</b> ≈ ${sf(num/den)}.`],tip:`1/((r + c)(r + c + 1)) = 1/(r + c) − 1/(r + c + 1): the middle terms cancel.`};},
/* smallest n so that the sum exceeds a target */
()=>{const F=pick([['r²',n=>n*(n+1)*(2*n+1)/6,'n(n + 1)(2n + 1)/6','X²'],['r³',n=>(n*(n+1)/2)**2,'n²(n + 1)²/4','X³'],['r × 2^(r − 1)',n=>1+(n-1)*2**n,'1 + (n − 1)2ⁿ','X×2^(X−1)']]);
const T=pick([1000,5000,10000,50000,100000,1000000]);let n=1;while(F[1](n)<=T)n++;
return {q:`Given that Σ<sub>r=1</sub><sup>n</sup> ${F[0]} = ${F[2]}, find the smallest n for which the sum exceeds ${T.toLocaleString('en-US')}.`,ans:n,exact:true,
work:[`Solve ${F[2]} > ${T.toLocaleString('en-US')}. The sum increases with n, so tabulate.`,`n = ${n-1}: ${F[1](n-1).toLocaleString('en-US')} (not enough).`,`n = ${n}: ${F[1](n).toLocaleString('en-US')} (exceeds).`,`So n = <b>${n}</b>.`,C(`Table: Y1 = ${F[2].replace(/n/g,'X').replace('ⁿ','^X')}, scan for the first Y1 > ${T}.`,`Y1 = ${F[2].replace(/n/g,'X').replace('ⁿ','^X')}, TABLE, scan for the first Y1 > ${T}.`)],tip:`Use the proved formula, not the sum term by term. Show both n values either side of the target.`};}
],
inddiv:[
/* largest divisor of a^n − b^n or a^n + c */
()=>{let a,b,txt,f;if(Math.random()<0.5){a=ri(3,13);b=ri(1,a-2);txt=`${a}ⁿ − ${b===1?'1':b+'ⁿ'}`;f=n=>bpow(a,n)-bpow(b,n);}else{a=pick([3,5,7,9,11]);const c=pick([1,3,5,7]);txt=`${a}ⁿ + ${c}`;f=n=>bpow(a,n)+BigInt(c);b=null;}
let g=0n;for(let n=1;n<=25;n++)g=bgcd(g,f(n));
return {q:`Find the largest integer d such that ${txt} is divisible by d for every positive integer n.`,ans:Number(g),exact:true,
work:[`n = 1 gives ${f(1)}, n = 2 gives ${f(2)}, n = 3 gives ${f(3)}.`,`Their highest common factor is ${g}, so d ≤ ${g}.`,b!==null?`a − b always divides aⁿ − bⁿ, and here no larger number works, so d = <b>${g}</b>.`:`Induction confirms ${g} divides every term, so d = <b>${g}</b>.`],tip:`aⁿ − bⁿ is always divisible by a − b. Check n = 1 and n = 2: their HCF caps the answer.`};},
/* the constant in the inductive step */
()=>{const a=pick([3,5,7,9,11,13]),c=pick([1,3,5,7]);const m=c*(a-1);let g=0n;for(let n=1;n<=25;n++)g=bgcd(g,bpow(a,n)+BigInt(c));
return {q:`In an inductive proof that ${a}ⁿ + ${c} is divisible by ${g} for all n ∈ ℤ⁺, the step uses ${a}ᵏ⁺¹ + ${c} = ${a}(${a}ᵏ + ${c}) − m. Find m.`,ans:m,exact:true,
work:[`${a}ᵏ⁺¹ + ${c} = ${a} × ${a}ᵏ + ${c}.`,`${a}(${a}ᵏ + ${c}) = ${a} × ${a}ᵏ + ${a*c}, which is ${a*c-c} too big.`,`So m = ${a*c} − ${c} = <b>${m}</b>. Both ${a}(${a}ᵏ + ${c}) and ${m} are multiples of the divisor, so the step works.`],tip:`aᵏ⁺¹ + c = a(aᵏ + c) − c(a − 1). Add and subtract to make the hypothesis appear.`};},
/* f(k+1) − f(k) for n³ + bn */
()=>{const b=pick([2,5,8,11,14]),c=1+b;
return {q:`Let f(n) = n³ + ${b}n. Show that f(k + 1) − f(k) = 3k² + 3k + c, and find c. (This is the step of an induction proof that 3 | f(n).)`,ans:c,exact:true,
work:[`f(k + 1) = (k + 1)³ + ${b}(k + 1) = k³ + 3k² + 3k + 1 + ${b}k + ${b}.`,`Subtract f(k) = k³ + ${b}k: f(k + 1) − f(k) = 3k² + 3k + ${c}.`,`c = <b>${c}</b>. Since ${c} = 3 × ${c/3}, the difference is 3(k² + k + ${c/3}): a multiple of 3, so P(k) ⇒ P(k + 1).`],tip:`Polynomial divisibility: find f(k + 1) − f(k) and show it is a multiple of the divisor.`};}
],
indmore:[
/* smallest base for an inequality */
()=>{const T=pick([[2,2,'2ⁿ > n²'],[2,3,'2ⁿ > n³'],[3,3,'3ⁿ > n³'],[3,4,'3ⁿ > n⁴'],['f',2,'n! > 2ⁿ'],['f',3,'n! > 3ⁿ'],['f',4,'n! > 4ⁿ']]);
const Lf=n=>T[0]==='f'?fact(n):bpow(T[0],n),Rf=n=>T[0]==='f'?bpow(T[1],n):bpow(n,T[1]);
let last=0;for(let n=1;n<=60;n++)if(!(Lf(n)>Rf(n)))last=n;const n0=last+1;
return {q:`The inequality ${T[2]} is to be proved by induction for all integers n ≥ n₀. Find the smallest possible value of n₀.`,ans:n0,exact:true,
work:[`Tabulate both sides. n = ${last}: ${Lf(last)} vs ${Rf(last)} (fails).`,`n = ${n0}: ${Lf(n0)} vs ${Rf(n0)} (holds), and it holds from here on.`,`So n₀ = <b>${n0}</b>. The base case is P(${n0}).`,C(`Table: Y1 = left, Y2 = right, find the last row with Y1 ≤ Y2.`,`TABLE with Y1 = left, Y2 = right, find the last row with Y1 ≤ Y2.`)],tip:`Base = first n after the LAST failure, not the first success. Small n can hold and then fail.`};},
/* nth derivative of x e^{ax} at 0 */
()=>{const a=pick([2,3,-1,-2,4]),n=ri(3,7);const v=n*a**(n-1);const aT=a<0?`(${N(a)})`:String(a),ax=a===-1?'−x':N(a)+'x';
return {q:`It can be proved by induction that if f(x) = xe<sup>${ax}</sup> then f<sup>(n)</sup>(x) = ${aT}<sup>n−1</sup>(${ax} + n)e<sup>${ax}</sup>. Find f<sup>(${n})</sup>(0).`,ans:v,exact:true,
work:[`At x = 0 the bracket is (0 + n) = n and e⁰ = 1.`,`f<sup>(${n})</sup>(0) = ${aT}<sup>${n-1}</sup> × ${n} = ${N(a**(n-1))} × ${n} = <b>${N(v)}</b>.`],tip:`Each derivative of xe^(ax) multiplies by a and adds one more e^(ax): f⁽ⁿ⁾ = aⁿ⁻¹(ax + n)e^(ax).`};},
/* nth derivative of 1/(1 - ax) or ln x */
()=>{if(Math.random()<0.5){const a=pick([2,3,-2]),n=ri(2,5);const v=Number(fact(n))*a**n;
return {q:`Prove by induction that if f(x) = 1/(1 − ${a<0?'('+N(a)+')':a}x) then f<sup>(n)</sup>(x) = n! × ${a<0?'('+N(a)+')':a}ⁿ/(1 − ${a<0?'('+N(a)+')':a}x)<sup>n+1</sup>. Hence find f<sup>(${n})</sup>(0).`,ans:v,exact:true,
work:[`Step: differentiating k! aᵏ(1 − ax)<sup>−(k+1)</sup> gives k! aᵏ × (k + 1) × a(1 − ax)<sup>−(k+2)</sup> = (k + 1)! aᵏ⁺¹(1 − ax)<sup>−(k+2)</sup>.`,`At x = 0: f<sup>(${n})</sup>(0) = ${n}! × ${a<0?'('+N(a)+')':a}<sup>${n}</sup> = ${fact(n)} × ${N(a**n)} = <b>${N(v)}</b>.`],tip:`Chain rule brings down the power and an extra a each time: n! aⁿ.`};}
const n=ri(2,6),x=pick([1,2]);const v=(n%2?1:-1)*Number(fact(n-1))/x**n;
return {q:`Given f(x) = ln x, it can be proved by induction that f<sup>(n)</sup>(x) = (−1)<sup>n−1</sup>(n − 1)!/xⁿ. Find f<sup>(${n})</sup>(${x}).`,ans:v,
work:[`Substitute n = ${n}, x = ${x}: (−1)<sup>${n-1}</sup> × ${n-1}! ÷ ${x}<sup>${n}</sup>.`,`= ${n%2?'':'−'}${fact(n-1)} ÷ ${x**n} = <b>${fm(v)}</b>.`],tip:`ln x: the sign alternates, starting positive for f′ = 1/x. The factorial is (n − 1)!, one behind.`};}
],
contra:[
/* Euclid numbers */
()=>{const k=ri(3,7),ps=PRIMES.slice(0,k);const Nn=ps.reduce((a,b)=>a*b,1)+1;const p=Number(spf(Nn));
return {q:`In Euclid's proof, suppose the only primes were ${ps.join(', ')}. Let N = ${ps.join(' × ')} + 1. Find the smallest prime factor of N.`,ans:p,exact:true,
work:[`N = ${Nn}.`,`N leaves remainder 1 when divided by each of ${ps.join(', ')}, so none of them is a factor.`,p===Nn?`Testing primes up to √${Nn} finds no factor, so N = <b>${Nn}</b> is itself prime.`:`Trial division: ${Nn} = ${p} × ${Nn/p}. The smallest prime factor is <b>${p}</b>.`,`Either way there is a prime outside the list: the contradiction.`],tip:`N need not be prime. The argument only needs a prime factor of N that is not on the list.`};},
/* near misses */
()=>{const d=pick([2,3,5,6,7,10,11]),q=ri(5,40);const rt=Math.sqrt(d);let best=Infinity,bp=0;for(let p=Math.floor(q*rt)-1;p<=Math.ceil(q*rt)+1;p++){const g=Math.abs(p*p-d*q*q);if(g<best){best=g;bp=p;}}
return {q:`If √${d} were equal to p/q, then p² − ${d}q² would be 0. For q = ${q}, find the smallest possible value of |p² − ${d}q²| over integers p.`,ans:best,exact:true,
work:[`${d}q² = ${d*q*q}. The nearest square is ${bp}² = ${bp*bp}, since ${q}√${d} ≈ ${(q*rt).toFixed(3)}.`,`Check ${bp-1}² = ${(bp-1)**2} and ${bp+1}² = ${(bp+1)**2} too.`,`Smallest gap = |${bp*bp} − ${d*q*q}| = <b>${best}</b>. It is never 0, because √${d} is irrational.`],tip:`p ≈ q√d. Check the two squares either side of dq²; the gap is at least 1.`};},
/* pigeonhole */
()=>{const m=ri(3,12),k=ri(2,5);const ans=m*(k-1)+1;const thing=pick([['socks','colours'],['students','birth months'],['cards','suits'],['marbles','colours']]);
const mm=thing[1]==='birth months'?12:thing[1]==='suits'?4:m;const a2=mm*(k-1)+1;
return {q:`There are ${mm} ${thing[1]}. Find the smallest number of ${thing[0]} that guarantees at least ${k} share the same ${thing[1].replace(/s$/,'').replace('birth month','birth month')}.`,ans:a2,exact:true,
work:[`Suppose not: every ${thing[1].replace(/s$/,'')} has at most ${k-1}. Then there are at most ${mm} × ${k-1} = ${mm*(k-1)} ${thing[0]}.`,`So ${mm*(k-1)} is not enough (it can be spread evenly), but one more forces a contradiction.`,`Answer: <b>${a2}</b>.`],tip:`Pigeonhole: boxes × (k − 1) + 1. "Suppose not" gives the bound.`};}
],
counter:[
/* n^2 + n + c composite */
()=>{const c=pick([3,5,11,17,41]);const sgn=pick([1,-1]);let n=1;while(isPrime(n*n+sgn*n+c))n++;const v=n*n+sgn*n+c,p=Number(spf(v));
return {q:`Find the smallest positive integer n that is a counterexample to the claim "n² ${sgn>0?'+':'−'} n + ${c} is prime for every positive integer n".`,ans:n,exact:true,
work:[`Test n = 1, 2, 3, …: ${Array.from({length:Math.min(n-1,5)},(_,i)=>(i+1)**2+sgn*(i+1)+c).join(', ')}${n>6?', …':''} are all prime.`,`n = ${n}: ${v} = ${p} × ${v/p}, not prime.`,`Smallest counterexample: n = <b>${n}</b>.`],tip:`Try n = c first (or n = c − 1): then every term shares the factor c. Smaller n may fail even sooner.`};},
/* d | n^2 but not d | n */
()=>{const d=pick([4,8,9,12,18,16,25]);let n=1;while(!((n*n)%d===0&&n%d!==0))n++;
return {q:`Find the smallest positive integer n that disproves the claim "if n² is divisible by ${d}, then n is divisible by ${d}".`,ans:n,exact:true,
work:[`We need ${d} | n² but ${d} ∤ n.`,`n = ${n}: n² = ${n*n} = ${d} × ${n*n/d}, but ${n} is not a multiple of ${d}.`,`Smallest counterexample: <b>${n}</b>. (The claim is true when d is prime, which is why the √2 proof works.)`],tip:`The claim only holds for square-free d. For d = p²q…, take n = pq….`};},
/* if x^2 > a^2 then x > a */
()=>{const a=ri(2,9);const ans=-(a+1);
return {q:`Find the largest integer that is a counterexample to the claim "if x² > ${a*a}, then x > ${a}".`,ans,exact:true,
work:[`A counterexample needs x² > ${a*a} but x ≤ ${a}.`,`x² > ${a*a} means x > ${a} or x < −${a}. The second case gives counterexamples.`,`The largest integer below −${a} is <b>${N(ans)}</b>.`],tip:`Squaring hides the sign. Negatives break any "x² > a² ⇒ x > a" claim.`};}
]
};
/* negative numbers in generated complex-number text get a proper minus sign */
const fixMinus=t=>String(t).replace(/(^|[\s(=,:×÷+\[>\/])-(?=[\d.a-zπ(√])/g,'$1'+MIN);
["cart","polar","polyroots","demoivre","croots"].forEach(s=>{GEN[s]=GEN[s].map(g=>()=>{const o=g();o.q=fixMinus(o.q);o.work=o.work.map(fixMinus);return o;});});
Object.assign(LAB.GEN,GEN);
})();
