(function(){
"use strict";
const LAB=window.LAB;
const {$,tok,prep,MONO,sf,gcd,ri,pick,C,DRAW}=LAB;
LAB.SECS.push('overview','direct','indsum','inddiv','indmore','contra','counter','drill','casio');
LAB.CARDS.push(
['direct','SL 1.6','Direct proof','Let n be an integer, write it in algebra, LHS ≡ RHS'],
['indsum','AHL 1.15','Induction: series','Base case, assume P(k), add the next term, conclude'],
['inddiv','AHL 1.15','Induction: divisibility','Write f(k + 1) using f(k), pull out the divisor'],
['indmore','AHL 1.15','Induction: inequalities & derivatives','Start at n₀, chain the inequality, differentiate the k case'],
['contra','AHL 1.15','Proof by contradiction','Suppose not, reach something impossible: √2, primes, logs'],
['counter','AHL 1.15','Counterexamples','One example kills "for all": n² + n + 41, 2ᵖ − 1'],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Tables, sums and checks for testing a claim before you prove it']);
Object.assign(LAB.SECNAME,{direct:'Direct proof',indsum:'Induction: series',inddiv:'Induction: divisibility',indmore:'Induction: inequalities & derivatives',contra:'Proof by contradiction',counter:'Counterexamples'});

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

/* ===== Practice generators ===== */
const GEN={
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
Object.assign(LAB.GEN,GEN);
})();
