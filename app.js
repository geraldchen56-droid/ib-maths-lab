(function(){
"use strict";
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue('--'+n).trim();
function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rgba(name,a){const [r,g,b]=hexRgb(tok(name));return `rgba(${r},${g},${b},${a})`;}
function prep(cv,h){const w=cv.clientWidth||300;const d=window.devicePixelRatio||1;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.height=h+'px';const ctx=cv.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {ctx,w,h};}
const MONO='"IBM Plex Mono", ui-monospace, monospace';
/* ---------- maths ---------- */
function fact(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function nCr(n,r){if(r<0||r>n)return 0;r=Math.min(r,n-r);let x=1;for(let i=1;i<=r;i++)x=x*(n-r+i)/i;return Math.round(x);}
function nPr(n,r){if(r<0||r>n)return 0;let x=1;for(let i=0;i<r;i++)x*=n-i;return x;}
function bpdf(n,p,k){if(k<0||k>n)return 0;if(p===0)return k===0?1:0;if(p===1)return k===n?1:0;return nCr(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);}
function bcdf(n,p,k){if(k<0)return 0;let s=0;for(let i=0;i<=Math.min(k,n);i++)s+=bpdf(n,p,i);return Math.min(1,s);}
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y;}
function Phi(z){return 0.5*(1+erf(z/Math.SQRT2));}
function invPhi(p){let lo=-12,hi=12;for(let i=0;i<90;i++){const m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}
function frac(n,d){const g=gcd(n,d)||1;n/=g;d/=g;return d===1?String(n):`${n}/${d}`;}
const sf=(x,s=3)=>{if(!isFinite(x))return '–';if(Number.isInteger(x)&&Math.abs(x)<1e15)return String(x);return String(Number(x.toPrecision(s)));};
const p4=x=>isFinite(x)?x.toFixed(4):'–';
const r2=x=>Math.round(x*100)/100;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const C=(c,t)=>`<span data-calc="casio">${c}</span><span data-calc="ti84">${t}</span>`;
const lbl3=x=>+(+x).toFixed(4);
const big=x=>x>=1e6?x.toExponential(4).replace('e+',' × 10^'):x.toLocaleString('en-US');
/* ---------- calculator choice ---------- */
function setCalc(c){c=c==='ti84'?'ti84':'casio';document.documentElement.dataset.calc=c;try{localStorage.setItem('ibprob-calc',c);}catch(e){}
$$('[data-pick]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pick===c?'true':'false'));}
$$('[data-pick]').forEach(b=>b.addEventListener('click',()=>setCalc(b.dataset.pick)));
setCalc(document.documentElement.dataset.calc);
/* ---------- navigation ---------- */
const SECS=['overview','basics','conditional','bayes','counting','discrete','binomial','normal','continuous','drill','casio'];
const DRAW={};
let current='overview';
function show(id){
if(!SECS.includes(id))id='overview';
current=id;
SECS.forEach(s=>{const el=document.getElementById('s-'+s);el.hidden=s!==id;});
$$('.navb').forEach(b=>b.setAttribute('aria-current',b.dataset.go===id?'true':'false'));
const nb=document.querySelector(`.navb[data-go="${id}"]`);
if(nb&&nb.scrollIntoView&&window.innerWidth<=900)nb.scrollIntoView({block:'nearest',inline:'center'});
try{history.replaceState(null,'','#'+id);}catch(e){}
try{localStorage.setItem('ibprob-last',id);}catch(e){}
requestAnimationFrame(()=>{DRAW[id]&&DRAW[id]();});
}
$$('.navb').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.go);window.scrollTo({top:0});}));
const CARDS=[
['basics','SL 4.5','Events & Venns','Addition rule, independence, mutually exclusive'],
['conditional','SL 4.6','Conditional & trees','"Given that", two-way tables, replacement'],
['bayes','HL 4.13','Bayes\' theorem','Reversing a conditional; base rates'],
['counting','HL 1.10','Counting','nPr, nCr, repeats, "together"'],
['discrete','SL 4.7','Discrete RVs','Find k, E(X), Var(X), aX + b'],
['binomial','SL 4.8','Binomial','B(n, p), cdf conversions, "at least one"'],
['normal','SL 4.9','Normal','Areas, InvN, unknown μ and σ'],
['continuous','HL 4.14','Continuous RVs','pdf, mean, median, mode, variance'],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Every menu path and keystroke on one page'],
];
$('#cards').innerHTML=CARDS.map(c=>`<button class="card" data-go="${c[0]}"><span class="r">${c[1]}</span><span class="n">${c[2]}</span><span class="d">${c[3]}</span></button>`).join('');
$$('.card').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.go);window.scrollTo({top:0});}));
/* ---------- Venn ---------- */
(function(){
const A=$('#vA'),B=$('#vB'),I=$('#vI'),cv=$('#vennCv');let region='AB';
const names={AB:'P(A ∩ B)',AuB:'P(A ∪ B)',Ao:'P(A ∩ B′)',Bo:'P(A′ ∩ B)',N:'P(A′ ∩ B′)',Ac:'P(A′)'};
const test={AB:(a,b)=>a&&b,AuB:(a,b)=>a||b,Ao:(a,b)=>a&&!b,Bo:(a,b)=>!a&&b,N:(a,b)=>!a&&!b,Ac:(a,b)=>!a};
$$('#vennRegions button').forEach(btn=>btn.addEventListener('click',()=>{region=btn.dataset.r;$$('#vennRegions button').forEach(x=>x.setAttribute('aria-pressed',x===btn?'true':'false'));draw();}));
[A,B,I].forEach(e=>e.addEventListener('input',draw));
function draw(){
let a=+A.value,b=+B.value,i=+I.value;const lo=Math.max(0,r2(a+b-1)),hi=Math.min(a,b);let msg='';
if(i<lo){i=lo;I.value=i;msg=`P(A ∩ B) can't be below ${lo}: P(A) + P(B) would exceed 1.`;}
if(i>hi){i=hi;I.value=i;msg=`P(A ∩ B) can't exceed the smaller of P(A) and P(B).`;}
$('#vMsg').textContent=msg;
$('#vAo').textContent=a.toFixed(2);$('#vBo').textContent=b.toFixed(2);$('#vIo').textContent=i.toFixed(2);
const val={AB:i,AuB:a+b-i,Ao:a-i,Bo:b-i,N:1-(a+b-i),Ac:1-a};
$('#vRegName').textContent=names[region];$('#vReg').textContent=val[region].toFixed(2);
$('#vU').textContent=(a+b-i).toFixed(2);
$('#vAgB').textContent=b>0?p4(i/b):'undefined';
$('#vProd').textContent=(a*b).toFixed(4);
const ind=Math.abs(i-a*b)<0.0051;
$('#vInd').textContent=ind?'Yes':'No';$('#vME').textContent=i===0?'Yes':'No';
const {ctx,w,h}=prep(cv,250);
const r=Math.min(h*0.34,w*0.21),cy=h/2+8,c1=w/2-r*0.62,c2=w/2+r*0.62;
// region shading via offscreen pixels
const off=document.createElement('canvas');off.width=Math.ceil(w);off.height=h;const oc=off.getContext('2d');const img=oc.createImageData(off.width,h);
const [sr,sg,sb]=hexRgb(tok('accent'));
for(let y=0;y<h;y++)for(let x=0;x<off.width;x++){
if(x<8||x>w-8||y<8||y>h-8)continue;
const inA=(x-c1)**2+(y-cy)**2<=r*r,inB=(x-c2)**2+(y-cy)**2<=r*r;
if(test[region](inA,inB)){const k=(y*off.width+x)*4;img.data[k]=sr;img.data[k+1]=sg;img.data[k+2]=sb;img.data[k+3]=70;}
}
oc.putImageData(img,0,0);ctx.drawImage(off,0,0,off.width,h);
ctx.strokeStyle=tok('muted');ctx.lineWidth=1.2;ctx.strokeRect(8,8,w-16,h-16);
ctx.lineWidth=2;ctx.strokeStyle=tok('accent');ctx.beginPath();ctx.arc(c1,cy,r,0,7);ctx.stroke();
ctx.strokeStyle=tok('amber');ctx.beginPath();ctx.arc(c2,cy,r,0,7);ctx.stroke();
ctx.fillStyle=tok('ink');ctx.font=`600 15px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText('A',c1-r*0.75,cy-r*0.85);ctx.fillText('B',c2+r*0.75,cy-r*0.85);
ctx.font=`500 13px ${MONO}`;
ctx.fillText((a-i).toFixed(2),c1-r*0.48,cy);ctx.fillText(i.toFixed(2),w/2,cy);ctx.fillText((b-i).toFixed(2),c2+r*0.48,cy);
ctx.textAlign='right';ctx.fillText((1-(a+b-i)).toFixed(2),w-18,h-22);
ctx.textAlign='left';ctx.fillStyle=tok('muted');ctx.fillText('U',16,22);
}
DRAW.basics=draw;
})();
/* ---------- Tree ---------- */
(function(){
const A=$('#tA'),BA=$('#tBA'),BnA=$('#tBnA'),cv=$('#treeCv');
[A,BA,BnA].forEach(e=>e.addEventListener('input',draw));
function draw(){
const a=+A.value,ba=+BA.value,bn=+BnA.value;
$('#tAo').textContent=a.toFixed(2);$('#tBAo').textContent=ba.toFixed(2);$('#tBnAo').textContent=bn.toFixed(2);
const ab=a*ba,nab=(1-a)*bn,pb=ab+nab;
$('#tAB').textContent=p4(ab);$('#tB').textContent=p4(pb);$('#tAgB').textContent=pb>0?p4(ab/pb):'undefined';
$('#tInd').textContent=Math.abs(ba-bn)<0.005?'Yes':'No';
const {ctx,w,h}=prep(cv,270);
const x0=14,x1=w*0.34,x2=w*0.64,y0=h/2;
const yA=h*0.27,yN=h*0.73,ys=[h*0.1,h*0.42,h*0.58,h*0.9];
const paths=[[x0,y0,x1,yA,a.toFixed(2),false],[x0,y0,x1,yN,(1-a).toFixed(2),false],
[x1,yA,x2,ys[0],ba.toFixed(2),true],[x1,yA,x2,ys[1],(1-ba).toFixed(2),false],
[x1,yN,x2,ys[2],bn.toFixed(2),true],[x1,yN,x2,ys[3],(1-bn).toFixed(2),false]];
ctx.lineCap='round';
paths.forEach(([xa,ya,xb,yb,lab,hl],idx)=>{
ctx.strokeStyle=hl?tok('accent'):tok('line');ctx.lineWidth=hl?3:2;
ctx.beginPath();ctx.moveTo(xa+(idx<2?0:18),ya);ctx.lineTo(xb-14,yb);ctx.stroke();
ctx.fillStyle=tok('muted');ctx.font=`500 12px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='bottom';
const mx=(xa+xb)/2,my=(ya+yb)/2;ctx.fillText(lab,mx,my-(yb<ya?2:-16)+(yb<ya?0:0));
});
ctx.fillStyle=tok('ink');ctx.font=`600 14px ${MONO}`;ctx.textBaseline='middle';ctx.textAlign='center';
ctx.fillText('A',x1,yA);ctx.fillText('A′',x1,yN);
const lb=['B','B′','B','B′'];ys.forEach((y,k)=>ctx.fillText(lb[k],x2,y));
ctx.textAlign='left';ctx.font=`500 12.5px ${MONO}`;
const ends=[['A∩B',ab,true],['A∩B′',a*(1-ba),false],['A′∩B',nab,true],['A′∩B′',(1-a)*(1-bn),false]];
ends.forEach(([n,v,hl],k)=>{ctx.fillStyle=hl?tok('accent'):tok('muted');ctx.fillText(`${n} ${v.toFixed(3)}`,x2+16,ys[k]);});
}
DRAW.conditional=draw;
})();
/* ---------- Bayes ---------- */
(function(){
const P=$('#bP'),S=$('#bS'),Sp=$('#bSp'),cv=$('#bayesCv');
[P,S,Sp].forEach(e=>e.addEventListener('input',draw));
function draw(){
const p=+P.value,s=+S.value,sp=+Sp.value;
$('#bPo').textContent=(p*100).toFixed(1)+'%';$('#bSo').textContent=(s*100).toFixed(0)+'%';$('#bSpo').textContent=(sp*100).toFixed(0)+'%';
const ill=Math.round(1000*p),tp=Math.round(ill*s),fn=ill-tp,healthy=1000-ill,fp=Math.round(healthy*(1-sp)),tn=healthy-fp;
$('#bTP').textContent=tp;$('#bFP').textContent=fp;
const post=p*s/(p*s+(1-p)*(1-sp)),npv=(1-p)*sp/((1-p)*sp+p*(1-s));
$('#bPost').textContent=p4(post);$('#bNPV').textContent=p4(npv);
const cols=40,rows=25,cw=cv.clientWidth||320,cell=Math.min(cw/cols,12),H=Math.ceil(rows*cell)+4;
const {ctx,w}=prep(cv,H);const ox=(w-cols*cell)/2;
const kinds=[];for(let i=0;i<tp;i++)kinds.push(0);for(let i=0;i<fn;i++)kinds.push(1);for(let i=0;i<fp;i++)kinds.push(2);for(let i=0;i<tn;i++)kinds.push(3);
const cA=tok('accent'),cAm=tok('amber'),cL=tok('line');
for(let k=0;k<1000;k++){
const x=ox+(k%cols+0.5)*cell,y=2+(Math.floor(k/cols)+0.5)*cell,rr=cell*0.34;
ctx.beginPath();ctx.arc(x,y,rr,0,7);
const t=kinds[k];
if(t===0){ctx.fillStyle=cA;ctx.fill();}
else if(t===1){ctx.strokeStyle=cA;ctx.lineWidth=1.3;ctx.stroke();}
else if(t===2){ctx.fillStyle=cAm;ctx.fill();}
else{ctx.fillStyle=cL;ctx.fill();}
}
}
DRAW.bayes=draw;
})();
/* ---------- Counting ---------- */
(function(){
const N=$('#cN'),R=$('#cR');
[N,R].forEach(e=>e.addEventListener('input',upd));
function combos(arr,r){const out=[];(function rec(st,cur){if(cur.length===r){out.push(cur.slice());return;}for(let i=st;i<arr.length;i++){cur.push(arr[i]);rec(i+1,cur);cur.pop();}})(0,[]);return out;}
function perms(a){if(a.length<=1)return [a.slice()];const out=[];a.forEach((x,i)=>{perms(a.filter((_,j)=>j!==i)).forEach(p=>out.push([x,...p]));});return out;}
function upd(){
const n=+N.value;R.max=n;let r=Math.min(+R.value,n);R.value=r;
$('#cNo').textContent=n;$('#cRo').textContent=r;
$('#cFact').textContent=big(fact(n));$('#cP').textContent=big(nPr(n,r));$('#cRf').textContent=big(fact(r));$('#cC').textContent=big(nCr(n,r));
const L=$('#cList');
if(n<=6&&r<=3&&r>0){
const letters='ABCDEF'.slice(0,n).split('');
L.innerHTML=combos(letters,r).map(c=>`<span class="combo"><b>{${c.join('')}}</b> → ${perms(c).map(p=>p.join('')).join(' ')}</span>`).join('');
}else{
L.innerHTML=`<span class="small">${nCr(n,r).toLocaleString('en-US')} groups, each counted ${fact(r).toLocaleString('en-US')} times as an ordered selection: ${nCr(n,r).toLocaleString('en-US')} × ${fact(r).toLocaleString('en-US')} = ${nPr(n,r).toLocaleString('en-US')}. Lower n to 6 or less and r to 3 or less to see them listed.</span>`;
}
}
DRAW.counting=upd;
})();
/* ---------- Discrete ---------- */
(function(){
const tb=$('#dTable');const xs=[0,1,2,3,4],ps=[0.1,0.3,0.3,0.2,0.1];
xs.forEach((x,k)=>{const tr=document.createElement('tr');tr.innerHTML=`<td><input type="number" id="dx${k}" value="${x}" step="1" aria-label="x value ${k+1}"></td><td><input type="number" id="dp${k}" value="${ps[k]}" step="0.05" min="0" max="1" aria-label="probability ${k+1}"></td>`;tb.appendChild(tr);});
tb.addEventListener('input',draw);$('#dA').addEventListener('input',draw);$('#dB').addEventListener('input',draw);
function draw(){
const rows=[];for(let k=0;k<5;k++){const x=parseFloat($('#dx'+k).value),p=parseFloat($('#dp'+k).value);if(isFinite(x)&&isFinite(p))rows.push([x,p]);}
const sum=rows.reduce((s,r)=>s+r[1],0),E=rows.reduce((s,r)=>s+r[0]*r[1],0),E2=rows.reduce((s,r)=>s+r[0]*r[0]*r[1],0),V=E2-E*E;
const a=parseFloat($('#dA').value)||0,b=parseFloat($('#dB').value)||0;
let msg='';if(rows.some(r=>r[1]<0||r[1]>1))msg='Each probability must lie between 0 and 1.';else if(Math.abs(sum-1)>1e-9)msg=`Probabilities sum to ${sf(sum,4)}, not 1. This is not a valid distribution.`;
$('#dMsg').textContent=msg;
$('#dSum').textContent=sf(sum,4);$('#dE').textContent=sf(E,4);$('#dE2').textContent=sf(E2,4);$('#dV').textContent=sf(V,4);
$('#dEt').textContent=`${sf(a*E+b,4)}`;$('#dVt').textContent=`${sf(a*a*V,4)}`;
const {ctx,w,h}=prep($('#discCv'),220);
if(!rows.length)return;
const vals=rows.map(r=>r[0]),mn=Math.min(...vals),mx=Math.max(...vals),pad=Math.max(0.6,(mx-mn)*0.12);
const L=40,Rt=12,T=12,Bt=28,pw=w-L-Rt,ph=h-T-Bt;const xmin=mn-pad,xmax=mx+pad;const ymax=Math.max(0.1,...rows.map(r=>r[1]))*1.15;
const X=v=>L+(v-xmin)/(xmax-xmin)*pw,Y=v=>T+ph-(v/ymax)*ph;
ctx.strokeStyle=tok('faint');ctx.fillStyle=tok('muted');ctx.font=`11px ${MONO}`;ctx.textAlign='right';ctx.textBaseline='middle';
const step=ymax>0.6?0.2:0.1;for(let t=0;t<=ymax+1e-9;t+=step){ctx.beginPath();ctx.moveTo(L,Y(t));ctx.lineTo(w-Rt,Y(t));ctx.stroke();ctx.fillText(t.toFixed(1),L-6,Y(t));}
const sorted=vals.slice().sort((p,q)=>p-q);let gap=Infinity;for(let k=1;k<sorted.length;k++)if(sorted[k]-sorted[k-1]>0)gap=Math.min(gap,sorted[k]-sorted[k-1]);
const bw=Math.min(40,isFinite(gap)?gap/(xmax-xmin)*pw*0.6:40);
ctx.textAlign='center';ctx.textBaseline='top';
rows.forEach(([x,p])=>{ctx.fillStyle=tok('accent');ctx.fillRect(X(x)-bw/2,Y(Math.max(p,0)),bw,Y(0)-Y(Math.max(p,0)));ctx.fillStyle=tok('muted');ctx.fillText(sf(x,3),X(x),T+ph+6);});
ctx.strokeStyle=tok('line');ctx.beginPath();ctx.moveTo(L,Y(0));ctx.lineTo(w-Rt,Y(0));ctx.stroke();
if(isFinite(E)&&E>=xmin&&E<=xmax){const ex=X(E);ctx.fillStyle=tok('amber');ctx.beginPath();ctx.moveTo(ex,Y(0)+1);ctx.lineTo(ex-7,Y(0)+13);ctx.lineTo(ex+7,Y(0)+13);ctx.closePath();ctx.fill();ctx.strokeStyle=tok('amber');ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ex,T);ctx.lineTo(ex,Y(0));ctx.stroke();ctx.setLineDash([]);}
}
DRAW.discrete=draw;
})();
/* ---------- Binomial ---------- */
(function(){
const N=$('#bnN'),P=$('#bnP'),Op=$('#bnOp'),K=$('#bnK'),K2=$('#bnK2');
[N,P,Op,K,K2].forEach(e=>e.addEventListener('input',draw));
function draw(){
const n=+N.value,p=+P.value,op=Op.value;let k=Math.max(0,Math.round(+K.value||0)),k2=Math.max(0,Math.round(+K2.value||0));
$('#bnK2wrap').hidden=op!=='btw';$('#bnNo').textContent=n;$('#bnPo').textContent=p.toFixed(2);
const inc=i=>op==='eq'?i===k:op==='le'?i<=k:op==='lt'?i<k:op==='ge'?i>=k:op==='gt'?i>k:(i>=k&&i<=k2);
let res=0;for(let i=0;i<=n;i++)if(inc(i))res+=bpdf(n,p,i);
const lbl={eq:`P(X = ${k})`,le:`P(X ≤ ${k})`,lt:`P(X < ${k})`,ge:`P(X ≥ ${k})`,gt:`P(X > ${k})`,btw:`P(${k} ≤ X ≤ ${k2})`}[op];
const tail=`Numtrial ${n}, p ${p}`;
const g={eq:`Bpd → x ${k}, ${tail}`,le:`Bcd → Lower 0, Upper ${k}, ${tail}`,lt:`Bcd → Lower 0, Upper ${k-1}, ${tail}`,ge:`Bcd → Lower ${k}, Upper ${n}, ${tail}`,gt:`Bcd → Lower ${k+1}, Upper ${n}, ${tail}`,btw:`Bcd → Lower ${k}, Upper ${k2}, ${tail}`}[op];
$('#bnLbl').textContent=lbl;$('#bnRes').textContent=p4(Math.min(1,res));const ti={eq:`binompdf(${n}, ${p}, ${k})`,le:`binomcdf(${n}, ${p}, ${k})`,lt:`binomcdf(${n}, ${p}, ${k-1})`,ge:k<=0?`1  (every value counts)`:`1 − binomcdf(${n}, ${p}, ${k-1})`,gt:`1 − binomcdf(${n}, ${p}, ${k})`,btw:`binomcdf(${n}, ${p}, ${k2}) − binomcdf(${n}, ${p}, ${k-1})`}[op];
$('#bnGdc').innerHTML=C(`<span class="gl">fx-CG50</span>${g}`,`<span class="gl">TI-84</span>${ti}`);
$('#bnE').textContent=sf(n*p,4);$('#bnV').textContent=sf(n*p*(1-p),4);
let best=0,bi=0;for(let i=0;i<=n;i++){const v=bpdf(n,p,i);if(v>best+1e-12){best=v;bi=i;}}$('#bnMode').textContent=bi;
const {ctx,w,h}=prep($('#binCv'),230);
const L=44,Rt=10,T=12,Bt=26,pw=w-L-Rt,ph=h-T-Bt;const ymax=Math.max(best,0.05)*1.12;
const slot=pw/(n+1),X=i=>L+(i+0.5)*slot,Y=v=>T+ph-(v/ymax)*ph;
ctx.font=`11px ${MONO}`;ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';
const nt=4;for(let t=0;t<=nt;t++){const v=ymax*t/nt;ctx.strokeStyle=tok('faint');ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(w-Rt,Y(v));ctx.stroke();ctx.fillText(v.toFixed(2),L-6,Y(v));}
const bw=Math.max(2,slot*0.72);ctx.textAlign='center';ctx.textBaseline='top';
const lstep=n<=15?1:n<=30?5:5;
for(let i=0;i<=n;i++){const v=bpdf(n,p,i);ctx.fillStyle=inc(i)?tok('accent'):tok('line');ctx.fillRect(X(i)-bw/2,Y(v),bw,Y(0)-Y(v));if(i%lstep===0){ctx.fillStyle=tok('muted');ctx.fillText(i,X(i),T+ph+6);}}
const mx=L+(n*p+0.5)*slot;ctx.strokeStyle=tok('amber');ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(mx,T);ctx.lineTo(mx,Y(0));ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;
}
DRAW.binomial=draw;
})();
/* ---------- Normal ---------- */
(function(){
const els=['nMu','nSd','nMode','nA','nB','nArea','nTail'].map(i=>$('#'+i));
els.forEach(e=>e.addEventListener('input',draw));
function draw(){
const mu=parseFloat($('#nMu').value),sd=parseFloat($('#nSd').value),mode=$('#nMode').value;
$('#nAB').hidden=mode==='inv';$('#nInv').hidden=mode!=='inv';
$('#nA').parentElement.hidden=mode==='lt';$('#nB').parentElement.hidden=mode==='gt';
const msgEl=$('#nMsg');msgEl.textContent='';
if(!isFinite(mu)||!isFinite(sd)||sd<=0){msgEl.textContent='Enter a mean and a positive standard deviation.';return;}
$('#nVar').textContent=sf(sd*sd,4);
let lo=-Infinity,hi=Infinity,res,zs,gdc,gti,resL='Probability';const fx=v=>sf(v,4);
if(mode==='inv'){
let ar=parseFloat($('#nArea').value);if(!(ar>0&&ar<1)){msgEl.textContent='Area must be between 0 and 1.';return;}
const tail=$('#nTail').value;
if(tail==='left'){const z=invPhi(ar);hi=mu+sd*z;res=`x = ${fx(hi)}`;zs=`z = ${z.toFixed(4)}`;gdc=`InvN → Tail Left, Area ${ar}, σ ${sd}, μ ${mu}`;gti=`invNorm(${ar}, ${mu}, ${sd})`;}
else if(tail==='right'){const z=invPhi(1-ar);lo=mu+sd*z;res=`x = ${fx(lo)}`;zs=`z = ${z.toFixed(4)}`;gdc=`InvN → Tail Right, Area ${ar}, σ ${sd}, μ ${mu}`;gti=`invNorm(${lbl3(1-ar)}, ${mu}, ${sd})  (left area = 1 − ${ar})`;}
else{const z=invPhi((1+ar)/2);lo=mu-sd*z;hi=mu+sd*z;res=`${fx(lo)} < x < ${fx(hi)}`;zs=`z = ±${z.toFixed(4)}`;gdc=`InvN → Tail Central, Area ${ar}, σ ${sd}, μ ${mu}  (gives both x₁ and x₂)`;gti=`invNorm(${lbl3((1-ar)/2)}, ${mu}, ${sd}) and invNorm(${lbl3((1+ar)/2)}, ${mu}, ${sd})`;}
resL='Boundary';
}else{
const a=parseFloat($('#nA').value),b=parseFloat($('#nB').value);
if(mode!=='lt'&&!isFinite(a)||mode!=='gt'&&!isFinite(b)){msgEl.textContent='Enter the boundary values.';return;}
if(mode==='lt'){hi=b;}else if(mode==='gt'){lo=a;}else{lo=Math.min(a,b);hi=Math.max(a,b);}
const zl=isFinite(lo)?(lo-mu)/sd:-Infinity,zh=isFinite(hi)?(hi-mu)/sd:Infinity;
res=p4((isFinite(zh)?Phi(zh):1)-(isFinite(zl)?Phi(zl):0));
zs=[isFinite(zl)?`z₁ = ${zl.toFixed(3)}`:'',isFinite(zh)?`z₂ = ${zh.toFixed(3)}`:''].filter(Boolean).join(', ');
gdc=`Ncd → Lower ${isFinite(lo)?lo:'−1E99'}, Upper ${isFinite(hi)?hi:'1E99'}, σ ${sd}, μ ${mu}`;gti=`normalcdf(${isFinite(lo)?lo:'−1E99'}, ${isFinite(hi)?hi:'1E99'}, ${mu}, ${sd})`;
}
$('#nResL').textContent=resL;$('#nRes').textContent=res;$('#nZ').textContent=zs;$('#nGdc').innerHTML=C(`<span class="gl">fx-CG50</span>${gdc}`,`<span class="gl">TI-84</span>${gti}`);
const {ctx,w,h}=prep($('#normCv'),240);
const L=14,Rt=14,T=14,Bt=36,pw=w-L-Rt,ph=h-T-Bt;const xmin=mu-4*sd,xmax=mu+4*sd,pk=1/(sd*Math.sqrt(2*Math.PI));
const X=v=>L+(v-xmin)/(xmax-xmin)*pw,Y=v=>T+ph-(v/(pk*1.08))*ph;const f=v=>pk*Math.exp(-0.5*((v-mu)/sd)**2);
const s0=Math.max(xmin,lo),s1=Math.min(xmax,hi);
if(s1>s0){ctx.fillStyle=rgba('accent',0.3);ctx.beginPath();ctx.moveTo(X(s0),Y(0));for(let i=0;i<=160;i++){const v=s0+(s1-s0)*i/160;ctx.lineTo(X(v),Y(f(v)));}ctx.lineTo(X(s1),Y(0));ctx.closePath();ctx.fill();}
ctx.strokeStyle=tok('line');ctx.beginPath();ctx.moveTo(L,Y(0));ctx.lineTo(w-Rt,Y(0));ctx.stroke();
ctx.strokeStyle=tok('ink');ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=300;i++){const v=xmin+(xmax-xmin)*i/300;i?ctx.lineTo(X(v),Y(f(v))):ctx.moveTo(X(v),Y(f(v)));}ctx.stroke();ctx.lineWidth=1;
ctx.font=`11px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='top';
for(let k=-3;k<=3;k++){const v=mu+k*sd,x=X(v);ctx.strokeStyle=tok('muted');ctx.beginPath();ctx.moveTo(x,Y(0));ctx.lineTo(x,Y(0)+5);ctx.stroke();ctx.fillStyle=k===0?tok('ink'):tok('muted');if(pw>380||k%1===0&&Math.abs(k)!==3||pw>300)ctx.fillText(sf(v,4),x,Y(0)+7);ctx.fillStyle=tok('muted');ctx.fillText(k===0?'μ':(k>0?'+':'−')+Math.abs(k)+'σ',x,Y(0)+20);}
[lo,hi].forEach(v=>{if(isFinite(v)&&v>xmin&&v<xmax){ctx.strokeStyle=tok('accent');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(v),Y(0));ctx.lineTo(X(v),Y(f(v)));ctx.stroke();ctx.lineWidth=1;}});
}
DRAW.normal=draw;
})();
/* ---------- Continuous ---------- */
(function(){
const Fam=$('#ctFam'),Nn=$('#ctN'),Aa=$('#ctA'),Cc=$('#ctC');
[Fam,Nn,Aa,Cc].forEach(e=>e.addEventListener('input',draw));
function draw(){
const fam=Fam.value,n=+Nn.value,a=+Aa.value,t=+Cc.value,c=t*a;
$('#ctNwrap').hidden=fam!=='pow';$('#ctNo').textContent=n;$('#ctAo').textContent=a;$('#ctCo').textContent=sf(c,3);
let k,f,E,V,med,mode,P,kStr,eq;
if(fam==='pow'){
k=(n+1)/Math.pow(a,n+1);f=x=>k*Math.pow(x,n);E=(n+1)*a/(n+2);V=(n+1)*a*a/(n+3)-E*E;med=a*Math.pow(0.5,1/(n+1));mode=n===0?'none (flat)':sf(a,3)+' (endpoint)';P=Math.pow(t,n+1);
kStr=Number.isInteger(a)?frac(n+1,Math.pow(a,n+1)):sf(k,4);
eq=`f(x) = k·x${n===0?'⁰':['','','²','³','⁴'][n]||'^'+n} for 0 ≤ x ≤ ${a}. Total area: k·${a}${n+1>1?'^'+(n+1):''}/${n+1} = 1, so k = ${kStr}.`;
}else{
k=6/Math.pow(a,3);f=x=>k*x*(a-x);E=a/2;V=a*a/20;med=a/2;mode=sf(a/2,3)+' (f′ = 0)';P=k*(a*c*c/2-c*c*c/3);
kStr=Number.isInteger(a)?frac(6,a*a*a):sf(k,4);
eq=`f(x) = k·x(${a} − x) for 0 ≤ x ≤ ${a}. Total area: k·${a}³/6 = 1, so k = ${kStr}.`;
}
$('#ctEq').textContent=eq;$('#ctK').textContent=kStr;$('#ctP').textContent=p4(P);$('#ctE').textContent=sf(E,4);$('#ctMed').textContent=sf(med,4);$('#ctMode').textContent=mode;$('#ctV').textContent=sf(V,4);
const {ctx,w,h}=prep($('#contCv'),230);
const L=44,Rt=14,T=14,Bt=26,pw=w-L-Rt,ph=h-T-Bt;
const fmax=fam==='pow'?(n===0?k:k*Math.pow(a,n)):k*a*a/4;const ymax=fmax*1.15;
const X=v=>L+v/a*pw,Y=v=>T+ph-(v/ymax)*ph;
ctx.font=`11px ${MONO}`;ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';
for(let i=0;i<=4;i++){const v=ymax*i/4;ctx.strokeStyle=tok('faint');ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(w-Rt,Y(v));ctx.stroke();ctx.fillText(sf(v,2),L-6,Y(v));}
if(c>0){ctx.fillStyle=rgba('accent',0.25);ctx.beginPath();ctx.moveTo(X(0),Y(0));for(let i=0;i<=120;i++){const v=c*i/120;ctx.lineTo(X(v),Y(f(v)));}ctx.lineTo(X(c),Y(0));ctx.closePath();ctx.fill();}
ctx.strokeStyle=tok('ink');ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=200;i++){const v=a*i/200;i?ctx.lineTo(X(v),Y(f(v))):ctx.moveTo(X(v),Y(f(v)));}ctx.lineTo(X(a),Y(0));ctx.stroke();ctx.lineWidth=1;
ctx.strokeStyle=tok('line');ctx.beginPath();ctx.moveTo(L,Y(0));ctx.lineTo(w-Rt,Y(0));ctx.stroke();
ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';
const st=a<=3?0.5:1;for(let v=0;v<=a+1e-9;v+=st)ctx.fillText(sf(v,3),X(v),Y(0)+6);
const vline=(v,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(X(v),Y(0));ctx.lineTo(X(v),T);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;};
vline(E,tok('accent'),[6,4]);vline(med,tok('amber'),[2,3]);
if(!(fam==='pow'&&n===0)){vline(fam==='pow'?a-0.01*a:a/2,tok('muted'),[1,4]);}
}
DRAW.continuous=draw;
})();
/* ---------- Question generators ---------- */
const tableHTML=(head,rows)=>`<div class="tablewrap"><table class="mini">${rows.map(r=>`<tr>${r.map((c,i)=>i===0||head?`<th>${c}</th>`:`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const GEN={
basics:[
()=>{const a=ri(30,70)/100,b=ri(20,60)/100;const lo=Math.max(0.05,a+b-1),hi=Math.min(a,b)-0.02;const i=r2(lo+(hi-lo)*Math.random());const u=r2(a+b-i);
return {q:`Events A and B satisfy P(A) = ${a}, P(B) = ${b} and P(A ∪ B) = ${u}. Find P(A ∩ B).`,ans:i,
work:[`Addition rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).`,`Rearrange: P(A ∩ B) = ${a} + ${b} − ${u} = <b>${i}</b>.`],
tip:`Union = add both, then subtract the overlap you counted twice.`};},
()=>{const a=ri(2,8)/10,b=ri(2,8)/10;const kind=pick(['union','neither','exactly']);
const inter=a*b,ans=kind==='union'?a+b-inter:kind==='neither'?(1-a)*(1-b):a+b-2*inter;
const ask={union:'P(A ∪ B)',neither:'P(A′ ∩ B′), the probability that neither occurs',exactly:'the probability that exactly one of A and B occurs'}[kind];
const w=[`Independent, so P(A ∩ B) = P(A)P(B) = ${a} × ${b} = ${sf(inter,4)}.`];
if(kind==='union')w.push(`P(A ∪ B) = ${a} + ${b} − ${sf(inter,4)} = <b>${sf(ans,4)}</b>.`);
if(kind==='neither')w.push(`A′ and B′ are also independent: (1 − ${a})(1 − ${b}) = <b>${sf(ans,4)}</b>. Or 1 − P(A ∪ B).`);
if(kind==='exactly')w.push(`Exactly one = A only + B only = (P(A) − P(A∩B)) + (P(B) − P(A∩B)) = ${a} + ${b} − 2(${sf(inter,4)}) = <b>${sf(ans,4)}</b>.`);
return {q:`A and B are independent events with P(A) = ${a} and P(B) = ${b}. Find ${ask}.`,ans,work:w,tip:`Independent means multiply for "and". Complements of independent events are independent too.`};},
()=>{const a=ri(30,65)/100,b=ri(20,55)/100;const lo=Math.max(0.05,a+b-1),hi=Math.min(a,b)-0.02;const i=r2(lo+(hi-lo)*Math.random());const kind=pick(['Ao','N']);
const ans=kind==='Ao'?a-i:1-(a+b-i);
return {q:`P(A) = ${a}, P(B) = ${b}, P(A ∩ B) = ${i}. Find ${kind==='Ao'?'P(A ∩ B′)':'P(A′ ∩ B′)'}.`,ans,
work:kind==='Ao'?[`A ∩ B′ is "A but not B": the part of A outside the overlap.`,`P(A ∩ B′) = P(A) − P(A ∩ B) = ${a} − ${i} = <b>${sf(ans,4)}</b>.`]:[`A′ ∩ B′ is the region outside both circles.`,`P(A ∪ B) = ${a} + ${b} − ${i} = ${r2(a+b-i)}.`,`P(A′ ∩ B′) = 1 − ${r2(a+b-i)} = <b>${sf(ans,4)}</b>.`],
tip:`Fill the Venn from the middle out: overlap, then "only" regions, then outside.`};},
],
conditional:[
()=>{const a=ri(8,30),b=ri(5,25),c=ri(10,40),d=ri(10,40);const kind=pick([0,1,2]);
const T=tableHTML(false,[['','Plays sport','No sport'],['Physics',a,b],['No physics',c,d]]);
const qs=[`P(plays sport | studies Physics)`,`P(studies Physics | plays sport)`,`P(no sport | does not study Physics)`];
const nums=[[a,a+b,'the Physics row'],[a,a+c,'the "plays sport" column'],[d,c+d,'the "no physics" row']][kind];
return {q:`A survey of students gave these results.${T}A student is chosen at random. Find ${qs[kind]}.`,ans:nums[0]/nums[1],
work:[`The condition restricts you to ${nums[2]}: total ${nums[1]}.`,`Of those, ${nums[0]} satisfy the event.`,`Probability = ${nums[0]}/${nums[1]} = <b>${sf(nums[0]/nums[1])}</b>.`],
tip:`"Given" = new denominator. Find the row or column the condition points to.`};},
()=>{const r=ri(3,8),b=ri(3,8),n=r+b;const kind=pick(['same','one','second']);
let ans,w;
if(kind==='same'){ans=(r*(r-1)+b*(b-1))/(n*(n-1));w=[`Both red: (${r}/${n}) × (${r-1}/${n-1}). Both blue: (${b}/${n}) × (${b-1}/${n-1}).`,`Add the two paths: (${r*(r-1)} + ${b*(b-1)}) / ${n*(n-1)} = <b>${sf(ans)}</b>.`];}
else if(kind==='one'){ans=2*r*b/(n*(n-1));w=[`Red then blue: (${r}/${n})(${b}/${n-1}). Blue then red: (${b}/${n})(${r}/${n-1}).`,`Both paths are equal, so the total is 2 × ${r*b}/${n*(n-1)} = <b>${sf(ans)}</b>.`];}
else{ans=r/n;w=[`Red then red: (${r}/${n})(${r-1}/${n-1}). Blue then red: (${b}/${n})(${r}/${n-1}).`,`Sum: ${r}(${r-1} + ${b}) / ${n*(n-1)} = ${r}/${n} = <b>${sf(ans)}</b>.`,`The second draw is just as likely to be red as the first. Without information about the first, the second is unchanged.`];}
const ask={same:'both balls are the same colour',one:'one ball of each colour is drawn',second:'the second ball is red'}[kind];
return {q:`A bag contains ${r} red and ${b} blue balls. Two are drawn without replacement. Find the probability that ${ask}.`,ans,work:w,
tip:kind==='second'?`Symmetry: any single draw without replacement has the original probability.`:`Along the branches ×, across the paths +. Second-stage numbers drop by one.`};},
()=>{const a=ri(2,8)/10,ba=ri(1,9)/10,bn=ri(1,9)/10;const kind=pick(['B','AgB']);const pb=a*ba+(1-a)*bn;
const w=[`P(B) = P(A)P(B|A) + P(A′)P(B|A′) = ${a}(${ba}) + ${r2(1-a)}(${bn}) = ${sf(pb,4)}.`];
if(kind==='AgB')w.push(`P(A | B) = P(A ∩ B)/P(B) = ${sf(a*ba,4)}/${sf(pb,4)} = <b>${sf(a*ba/pb)}</b>.`);else w[0]=w[0].replace(sf(pb,4)+'.','<b>'+sf(pb,4)+'</b>.');
return {q:`P(A) = ${a}, P(B | A) = ${ba} and P(B | A′) = ${bn}. Find ${kind==='B'?'P(B)':'P(A | B)'}.`,ans:kind==='B'?pb:a*ba/pb,work:w,
tip:kind==='B'?`Total probability: add every path that ends in B.`:`Reverse conditional: the A-then-B path over all paths to B.`};},
],
bayes:[
()=>{const p=pick([0.005,0.01,0.02,0.04,0.05,0.1]),s=ri(85,99)/100,f=ri(2,12)/100;const ans=p*s/(p*s+(1-p)*f);
return {q:`A disease affects ${sf(p*100)}% of a population. A test detects it in ${Math.round(s*100)}% of people who have it, and gives a false positive for ${Math.round(f*100)}% of people who don't. A randomly chosen person tests positive. Find the probability they have the disease.`,ans,
work:[`Tree: ill (${p}) → + (${s}); healthy (${sf(1-p,4)}) → + (${f}).`,`One path: P(ill ∩ +) = ${p} × ${s} = ${sf(p*s,4)}.`,`All paths to +: ${sf(p*s,4)} + ${sf(1-p,4)} × ${f} = ${sf(p*s+(1-p)*f,4)}.`,`P(ill | +) = ${sf(p*s,4)} ÷ ${sf(p*s+(1-p)*f,4)} = <b>${sf(ans)}</b>.`,`In 10 000 people: about ${Math.round(10000*p*s)} true positives against ${Math.round(10000*(1-p)*f)} false positives.`],
tip:`Bayes = one path ÷ all paths to the evidence. Rare condition → most positives are false.`};},
()=>{const a=ri(3,7)/10;let d1=ri(1,6),d2=ri(1,6);if(d1===d2)d2=d1%6+1;d1/=100;d2/=100;const ans=a*d1/(a*d1+(1-a)*d2);
return {q:`Machine A makes ${Math.round(a*100)}% of a factory's items and machine B the rest. ${Math.round(d1*100)}% of A's items are faulty and ${Math.round(d2*100)}% of B's. A randomly chosen item is faulty. Find the probability it was made by machine A.`,ans,
work:[`P(A ∩ faulty) = ${a} × ${d1} = ${sf(a*d1,4)}.`,`P(faulty) = ${sf(a*d1,4)} + ${sf(1-a,2)} × ${d2} = ${sf(a*d1+(1-a)*d2,4)}.`,`P(A | faulty) = <b>${sf(ans)}</b>.`],
tip:`Cause first, evidence second on the tree. Then one path over all paths.`};},
()=>{let s=[ri(2,5),ri(2,5)];s.push(10-s[0]-s[1]);s=s.map(x=>x/10);const d=[ri(1,8),ri(1,8),ri(1,8)].map(x=>x/100);const k=ri(0,2);
const tot=s.reduce((acc,x,i)=>acc+x*d[i],0);const ans=s[k]*d[k]/tot;const nm=['X','Y','Z'];
return {q:`Three suppliers X, Y and Z provide ${s.map(x=>Math.round(x*100)+'%').join(', ')} of a shop's stock. The proportions of damaged items are ${d.map(x=>Math.round(x*100)+'%').join(', ')} respectively. A damaged item is found. Find the probability it came from supplier ${nm[k]}.`,ans,
work:[`P(damaged) = ${s.map((x,i)=>`${x}(${d[i]})`).join(' + ')} = ${sf(tot,4)}.`,`P(${nm[k]} ∩ damaged) = ${s[k]} × ${d[k]} = ${sf(s[k]*d[k],4)}.`,`P(${nm[k]} | damaged) = ${sf(s[k]*d[k],4)} ÷ ${sf(tot,4)} = <b>${sf(ans)}</b>.`],
tip:`Three causes, same idea: one path over the sum of all three paths.`};},
],
counting:[
()=>{const m=ri(5,9),wn=ri(4,8),k=ri(3,5);const kind=pick(['exact','atleast']);
if(kind==='exact'){const j=ri(1,Math.min(k-1,wn));const ans=nCr(wn,j)*nCr(m,k-j);
return {q:`A committee of ${k} is chosen from ${m} men and ${wn} women. In how many ways can it be chosen with exactly ${j} ${j===1?'woman':'women'}?`,ans,exact:true,
work:[`Choose the women: <sup>${wn}</sup>C<sub>${j}</sub> = ${nCr(wn,j)}.`,`The other ${k-j} must be men: <sup>${m}</sup>C<sub>${k-j}</sub> = ${nCr(m,k-j)}.`,`Multiply: <b>${ans}</b>.`],
tip:`"Exactly" fixes both groups. Choose each separately and multiply.`};}
const ans=nCr(m+wn,k)-nCr(m,k);
return {q:`A committee of ${k} is chosen from ${m} men and ${wn} women. In how many ways can it include at least one woman?`,ans,exact:true,
work:[`Total committees: <sup>${m+wn}</sup>C<sub>${k}</sub> = ${nCr(m+wn,k)}.`,`Committees with no women (all men): <sup>${m}</sup>C<sub>${k}</sub> = ${nCr(m,k)}.`,`At least one woman = ${nCr(m+wn,k)} − ${nCr(m,k)} = <b>${ans}</b>.`],
tip:`At least one = total − none.`};},
()=>{const n=ri(5,8);const kind=pick(['tog','apart']);const tog=2*fact(n-1);const ans=kind==='tog'?tog:fact(n)-tog;
return {q:`${n} friends, including Ana and Ben, sit in a row. In how many arrangements are Ana and Ben ${kind==='tog'?'next to each other':'<b>not</b> next to each other'}?`,ans,exact:true,
work:kind==='tog'?[`Glue Ana and Ben into one block. Now arrange ${n-1} units: ${n-1}! = ${fact(n-1)}.`,`Inside the block they can swap: × 2.`,`Total: <b>${ans}</b>.`]:[`All arrangements: ${n}! = ${fact(n)}.`,`Together: 2 × ${n-1}! = ${tog}.`,`Not together = ${fact(n)} − ${tog} = <b>${ans}</b>.`],
tip:`Together → glue then multiply by the inside arrangements. Apart → total minus together.`};},
()=>{const words=['STATISTICS','BANANA','SHANGHAI','DIVIDEND','EXPECTED','PROBABILITY','PARAMETER'];const wd=pick(words);
const cnt={};wd.split('').forEach(ch=>cnt[ch]=(cnt[ch]||0)+1);const reps=Object.entries(cnt).filter(e=>e[1]>1);
const ans=fact(wd.length)/reps.reduce((p,e)=>p*fact(e[1]),1);
return {q:`How many different arrangements are there of the letters of the word ${wd}?`,ans,exact:true,
work:[`${wd.length} letters, so ${wd.length}! if all were different.`,`Repeats: ${reps.map(e=>`${e[0]} × ${e[1]}`).join(', ')}. Swapping identical letters changes nothing, so divide by ${reps.map(e=>e[1]+'!').join(' × ')}.`,`${wd.length}! ÷ (${reps.map(e=>e[1]+'!').join(' × ')}) = <b>${ans.toLocaleString('en-US')}</b>.`],
tip:`Repeats: divide by the factorial of each repeat count.`};},
],
discrete:[
()=>{const start=pick([0,1]);const xs=[0,1,2,3].map(v=>v+start);const ws=xs.map(()=>ri(1,5));const S=ws.reduce((a,b)=>a+b,0);
const kind=pick(['k','E','V','T']);const E=xs.reduce((s,x,i)=>s+x*ws[i],0)/S,E2=xs.reduce((s,x,i)=>s+x*x*ws[i],0)/S,V=E2-E*E;
const aa=pick([2,3,-2,4]),bb=ri(1,9);
const T=tableHTML(false,[['x',...xs],['P(X = x)',...ws.map(w=>w===1?'k':w+'k')]]);
const ask={k:'the value of k',E:'E(X)',V:'Var(X)',T:`E(${aa}X + ${bb})`}[kind];
const ans={k:1/S,E,V,T:aa*E+bb}[kind];
const w=[`Probabilities sum to 1: ${ws.join('k + ')}k = ${S}k = 1, so k = 1/${S}.`];
if(kind!=='k')w.push(`E(X) = Σ x·P(X = x) = (${xs.map((x,i)=>`${x}·${ws[i]}`).join(' + ')})/${S} = ${frac(xs.reduce((s,x,i)=>s+x*ws[i],0),S)}${kind==='E'?' ≈ <b>'+sf(E)+'</b>':''}.`);
if(kind==='V'){w.push(`E(X²) = (${xs.map((x,i)=>`${x*x}·${ws[i]}`).join(' + ')})/${S} = ${sf(E2,5)}.`);w.push(`Var(X) = E(X²) − [E(X)]² = ${sf(E2,5)} − ${sf(E,5)}² = <b>${sf(V)}</b>.`);}
if(kind==='T')w.push(`E(${aa}X + ${bb}) = ${aa}E(X) + ${bb} = <b>${sf(aa*E+bb)}</b>.`);
if(kind==='k')w[0]=w[0].replace(`k = 1/${S}.`,`k = <b>1/${S}</b> ≈ ${sf(1/S)}.`);
return {q:`The random variable X has the distribution below.${T}Find ${ask}.`,ans,work:w,
tip:kind==='V'?`Square the x-values, never the probabilities. Then subtract the squared mean.`:`Every "find k" starts with Σ P = 1.`};},
()=>{const m=ri(4,18)/2,v=ri(2,12)/2,a=pick([2,3,-2,-3,4,5]),b=ri(-5,10);const kind=pick(['E','V','SD']);
const ans=kind==='E'?a*m+b:kind==='V'?a*a*v:Math.abs(a)*Math.sqrt(v);const Y=`${a}X ${b<0?'−':'+'} ${Math.abs(b)}`;
const w=kind==='E'?[`E(aX + b) = aE(X) + b = ${a}(${m}) ${b<0?'−':'+'} ${Math.abs(b)} = <b>${sf(ans)}</b>.`]:
kind==='V'?[`Adding ${b} shifts the values, not the spread, so b disappears.`,`Var(aX + b) = a²Var(X) = ${a*a} × ${v} = <b>${sf(ans)}</b>.`]:
[`Var(${Y}) = ${a}² × ${v} = ${a*a*v}.`,`SD = √${a*a*v} = <b>${sf(ans)}</b>. Equivalently |a|·σ.`];
return {q:`E(X) = ${m} and Var(X) = ${v}. Find ${kind==='E'?`E(${Y})`:kind==='V'?`Var(${Y})`:`the standard deviation of ${Y}`}.`,ans,work:w,
tip:`Shift moves the mean, not the spread. Scale squares in the variance.`};},
],
binomial:[
()=>{const n=ri(6,20),p=pick([0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.55,0.6,0.7,0.8]);const op=pick(['eq','le','lt','ge','gt','btw']);
let k=ri(1,Math.max(1,Math.round(n*0.7))),k2=Math.min(n,k+ri(2,4));
const inc=i=>op==='eq'?i===k:op==='le'?i<=k:op==='lt'?i<k:op==='ge'?i>=k:op==='gt'?i>k:(i>=k&&i<=k2);
let ans=0;for(let i=0;i<=n;i++)if(inc(i))ans+=bpdf(n,p,i);
const st={eq:`P(X = ${k})`,le:`P(X ≤ ${k})`,lt:`P(X < ${k})`,ge:`P(X ≥ ${k})`,gt:`P(X > ${k})`,btw:`P(${k} ≤ X ≤ ${k2})`}[op];
const words={eq:`exactly ${k}`,le:`at most ${k}`,lt:`fewer than ${k}`,ge:`at least ${k}`,gt:`more than ${k}`,btw:`between ${k} and ${k2} inclusive`}[op];
const conv={eq:`Bpd: x ${k}, Numtrial ${n}, p ${p}`,le:`P(0 ≤ X ≤ ${k}). Bcd: Lower 0, Upper ${k}, Numtrial ${n}, p ${p}`,lt:`P(X ≤ ${k-1}). Bcd: Lower 0, Upper ${k-1}, Numtrial ${n}, p ${p}`,ge:`P(${k} ≤ X ≤ ${n}), or 1 − P(X ≤ ${k-1}). Bcd: Lower ${k}, Upper ${n}, Numtrial ${n}, p ${p}`,gt:`P(${k+1} ≤ X ≤ ${n}), or 1 − P(X ≤ ${k}). Bcd: Lower ${k+1}, Upper ${n}, Numtrial ${n}, p ${p}`,btw:`Bcd: Lower ${k}, Upper ${k2}, Numtrial ${n}, p ${p}`}[op];
const convT={eq:`binompdf(${n}, ${p}, ${k})`,le:`binomcdf(${n}, ${p}, ${k})`,lt:`P(X ≤ ${k-1}) = binomcdf(${n}, ${p}, ${k-1})`,ge:`1 − P(X ≤ ${k-1}) = 1 − binomcdf(${n}, ${p}, ${k-1})`,gt:`1 − P(X ≤ ${k}) = 1 − binomcdf(${n}, ${p}, ${k})`,btw:`P(X ≤ ${k2}) − P(X ≤ ${k-1}) = binomcdf(${n}, ${p}, ${k2}) − binomcdf(${n}, ${p}, ${k-1})`}[op];
const ctx=pick([`A basketball player scores ${Math.round(p*100)}% of free throws. She takes ${n} shots.`,`Each seed germinates with probability ${p}, independently. ${n} seeds are planted.`,`A multiple-choice quiz has ${n} questions; a student guesses each correctly with probability ${p}.`]);
return {q:`${ctx} Find the probability of ${words} successes.`,ans,
work:[`X ~ B(${n}, ${p}). We need ${st}.`,`Convert: ${st} = ${C(conv,convT)}.`,`= <b>${sf(ans)}</b>.`],
tip:C(`Strict sign? Step one integer inward. "Fewer than k" → Upper k−1. "More than k" → Lower k+1. "At least k" → Lower k, Upper n.`,`binomcdf only does ≤. "Fewer than k" → ≤ k−1. "At least k" → 1 − P(X ≤ k−1). "More than k" → 1 − P(X ≤ k).`)};},
()=>{const p=pick([0.02,0.05,0.08,0.1,0.15,0.2,0.25]),t=pick([0.9,0.95,0.99]);const ans=Math.ceil(Math.log(1-t)/Math.log(1-p));
return {q:`Each ticket wins a prize with probability ${p}, independently. Find the smallest number of tickets needed so that the probability of winning at least one prize exceeds ${t}.`,ans,exact:true,
work:[`P(at least one) = 1 − P(none) = 1 − ${1-p}ⁿ.`,`Need 1 − ${r2(1-p)}ⁿ > ${t}, so ${r2(1-p)}ⁿ < ${r2(1-t)}.`,`Take logs: n > ln ${r2(1-t)} / ln ${r2(1-p)} = ${sf(Math.log(1-t)/Math.log(1-p),5)}. Dividing by a negative log flips the inequality.`,`Round up: n = <b>${ans}</b>.`,C(`fx-CG50 check: Table menu, Y1 = 1−${r2(1-p)}^X, and scroll until Y1 first exceeds ${t}.`,`TI-84 check: Y1 = 1−${r2(1-p)}^X in Y=, then 2nd GRAPH (TABLE), and scroll until Y1 first exceeds ${t}.`)],
tip:`At least one = 1 − none. Solving for n? Round UP, because n must be a whole number that satisfies the inequality.`};},
()=>{const p=pick([0.2,0.25,0.4,0.5,0.6,0.75,0.8]);let n=ri(10,40);const E=n*p,V=n*p*(1-p);const kind=pick(['n','p']);
return {q:`X ~ B(n, p) with E(X) = ${sf(E,5)} and Var(X) = ${sf(V,5)}. Find ${kind}.`,ans:kind==='n'?n:p,exact:kind==='n',
work:[`np = ${sf(E,5)} and np(1 − p) = ${sf(V,5)}.`,`Divide: 1 − p = ${sf(V,5)}/${sf(E,5)} = ${1-p}, so p = ${p}.`,`n = ${sf(E,5)}/${p} = ${n}.`,`Answer: <b>${kind==='n'?n:p}</b>.`],
tip:`Divide Var by E: the n cancels and 1 − p falls out.`};},
],
normal:[
()=>{const mu=ri(20,120),sd=pick([2,3,4,5,6,8,10,12,15]);const useVar=Math.random()<0.5;const kind=pick(['lt','gt','btw']);
const a=r2(mu+sd*(ri(-20,5)/10)),b=r2(mu+sd*(ri(-5,20)/10));const lo=Math.min(a,b),hi=Math.max(a,b)+(a===b?sd:0);
const ans=kind==='lt'?Phi((hi-mu)/sd):kind==='gt'?1-Phi((lo-mu)/sd):Phi((hi-mu)/sd)-Phi((lo-mu)/sd);
const nota=useVar?`X ~ N(${mu}, ${sd*sd})`:`X ~ N(${mu}, ${sd}²)`;
const st=kind==='lt'?`P(X < ${hi})`:kind==='gt'?`P(X > ${lo})`:`P(${lo} < X < ${hi})`;
const g=kind==='lt'?`Ncd: Lower −1E99, Upper ${hi}, σ ${sd}, μ ${mu}`:kind==='gt'?`Ncd: Lower ${lo}, Upper 1E99, σ ${sd}, μ ${mu}`:`Ncd: Lower ${lo}, Upper ${hi}, σ ${sd}, μ ${mu}`;
const gT=kind==='lt'?`normalcdf(−1E99, ${hi}, ${mu}, ${sd})`:kind==='gt'?`normalcdf(${lo}, 1E99, ${mu}, ${sd})`:`normalcdf(${lo}, ${hi}, ${mu}, ${sd})`;
return {q:`${nota}. Find ${st}.`,ans,
work:[useVar?`The second parameter is the variance: σ² = ${sd*sd}, so σ = ${sd}.`:`σ = ${sd}.`,`${C(g,gT)}.`,`${st} = <b>${sf(ans)}</b>.`],
tip:useVar?`N(μ, σ²): the second number is the variance. Square-root it before typing σ.`:C(`Sketch, shade, then Ncd. Casio asks for σ before μ.`,`Sketch, shade, then normalcdf. The TI asks for μ before σ.`)};},
()=>{const mu=ri(40,200),sd=pick([4,5,6,8,10,12,15,20]);const q=pick([0.05,0.1,0.15,0.2,0.25,0.3]);const side=pick(['above','below']);
const ans=side==='above'?mu+sd*invPhi(1-q):mu+sd*invPhi(q);
return {q:`The masses of parcels are normally distributed with mean ${mu} g and standard deviation ${sd} g. ${Math.round(q*100)}% of parcels are ${side==='above'?'heavier':'lighter'} than k grams. Find k.`,ans,
work:[side==='above'?`P(X > k) = ${q}: a right-tail area.`:`P(X < k) = ${q}: a left-tail area.`,C(`InvN: Tail ${side==='above'?'Right':'Left'}, Area ${q}, σ ${sd}, μ ${mu}.`,side==='above'?`invNorm uses the area to the left of k: 1 − ${q} = ${r2(1-q)}.`:`invNorm uses the area to the left of k, which is ${q}.`),C(side==='above'?`(Equivalent: Tail Left with Area 1 − ${q} = ${r2(1-q)}.)`:`It's a left tail, so no conversion needed.`,`invNorm(${side==='above'?r2(1-q):q}, ${mu}, ${sd}).`),`k = <b>${sf(ans,4)}</b>.`],
tip:C(`Tail follows the sign. "More than" or "heavier than" → Right. "Less than" → Left.`,`invNorm thinks left. "More than" or "heavier than" → feed it 1 − area. "Less than" → use the area as it is.`)};},
()=>{const mu=ri(50,150),sd=pick([3,4,5,6,8,10,12]);const x=r2(mu+sd*pick([-1.6,-1.2,-0.8,0.7,1.1,1.5]));const q=Math.round(Phi((x-mu)/sd)*1000)/1000;const z=invPhi(q);const ans=(x-mu)/z;
return {q:`X ~ N(${mu}, σ²) and P(X < ${x}) = ${q}. Find σ.`,ans,
work:[`Standardise: P(Z < (${x} − ${mu})/σ) = ${q}.`,C(`InvN: Tail Left, Area ${q}, σ 1, μ 0 → z = ${z.toFixed(4)}.`,`invNorm(${q}, 0, 1) → z = ${z.toFixed(4)}.`),`(${x} − ${mu})/σ = ${z.toFixed(4)}, so σ = ${r2(x-mu)}/${z.toFixed(4)} = <b>${sf(ans)}</b>.`],
tip:C(`Unknown σ → get z from InvN with σ = 1, μ = 0. Then (x − μ)/σ = z.`,`Unknown σ → z = invNorm(area, 0, 1). Then (x − μ)/σ = z.`)};},
()=>{const mu=ri(40,100),sd=ri(4,15);const a=mu-sd*ri(5,15)/10,b=mu+sd*ri(5,15)/10;const A=Math.round(a),B=Math.round(b);
const q1=Math.round(Phi((A-mu)/sd)*1000)/1000,q2=Math.round((1-Phi((B-mu)/sd))*1000)/1000;const z1=invPhi(q1),z2=invPhi(1-q2);const s=(B-A)/(z2-z1),m=A-s*z1;const kind=pick(['mu','sd']);
return {q:`X is normally distributed. P(X < ${A}) = ${q1} and P(X > ${B}) = ${q2}. Find ${kind==='mu'?'the mean μ':'the standard deviation σ'}.`,ans:kind==='mu'?m:s,
work:[C(`InvN with σ 1, μ 0: Tail Left, Area ${q1} → z₁ = ${z1.toFixed(4)}. Tail Right, Area ${q2} → z₂ = ${z2.toFixed(4)}.`,`invNorm(${q1}, 0, 1) → z₁ = ${z1.toFixed(4)}. invNorm(1 − ${q2}, 0, 1) = invNorm(${lbl3(1-q2)}, 0, 1) → z₂ = ${z2.toFixed(4)}.`),`μ + ${z1.toFixed(4)}σ = ${A}`,`μ + ${z2.toFixed(4)}σ = ${B}`,`Subtract: σ = ${B-A}/(${z2.toFixed(4)} − (${z1.toFixed(4)})) = ${sf(s,5)}.`,`μ = ${A} − (${z1.toFixed(4)})(${sf(s,5)}) = ${sf(m,5)}.`,`Answer: <b>${sf(kind==='mu'?m:s)}</b>.`],
tip:C(`Two unknowns → two "μ + zσ = x" equations. On the fx-CG50: Equation → SIMUL, 2 unknowns, rows 1, z | x.`,`Two unknowns → two "μ + zσ = x" equations. On the TI-84: APPS → PlySmlt2 → simultaneous, 2 unknowns, rows 1, z | x.`)};},
],
continuous:[
()=>{const n=ri(1,3),a=ri(1,4);const k=(n+1)/Math.pow(a,n+1);const kind=pick(['k','E','med','P','V']);const c=a/2;
const sup=['','','²','³'][n];
const ans={k,E:(n+1)*a/(n+2),med:a*Math.pow(0.5,1/(n+1)),P:Math.pow(0.5,n+1),V:(n+1)*a*a/(n+3)-((n+1)*a/(n+2))**2}[kind];
const ask={k:'k',E:'E(X)',med:'the median of X',P:`P(X < ${sf(c)})`,V:'Var(X)'}[kind];
const w=[`∫₀^${a} kx${n===1?'':sup} dx = k·${a}^${n+1}/${n+1} = 1, so k = ${frac(n+1,Math.pow(a,n+1))}.`];
if(kind==='E')w.push(`E(X) = ∫₀^${a} x·kx${n===1?'':sup} dx = k·${a}^${n+2}/${n+2} = <b>${sf(ans)}</b>.`);
if(kind==='med')w.push(`∫₀^m kx${n===1?'':sup} dx = k·m^${n+1}/${n+1} = 0.5 → m^${n+1} = ${sf(Math.pow(a,n+1)/2,5)}.`,`m = <b>${sf(ans)}</b> (the root inside [0, ${a}]).`);
if(kind==='P')w.push(`P(X < ${sf(c)}) = k·(${sf(c)})^${n+1}/${n+1} = (${sf(c)}/${a})^${n+1} = <b>${sf(ans)}</b>.`);
if(kind==='V')w.push(`E(X) = ${sf((n+1)*a/(n+2),5)}, E(X²) = k·${a}^${n+3}/${n+3} = ${sf((n+1)*a*a/(n+3),5)}.`,`Var(X) = E(X²) − [E(X)]² = <b>${sf(ans)}</b>.`);
if(kind==='k')w[0]=w[0].replace(/k = ([0-9/]+)\.$/,'k = <b>$1</b>.');
return {q:`The continuous random variable X has pdf f(x) = kx${n===1?'':sup} for 0 ≤ x ≤ ${a}, and 0 otherwise. Find ${ask}.`,ans,work:w,
tip:kind==='med'?`Median: integrate from the lower end to m and set it to 0.5.`:`Area = probability. Total area 1 gives k.`};},
()=>{const a=pick([2,3,4,6]);const k=6/Math.pow(a,3);const kind=pick(['k','P','V']);const c=a*pick([1,1,3])/4*(Math.random()<0.5?1:1);const cc=pick([a/4,a/3,3*a/4]);
const P=k*(a*cc*cc/2-cc*cc*cc/3);const ans={k,P,V:a*a/20}[kind];
const w=[`∫₀^${a} kx(${a} − x) dx = k[${a}x²/2 − x³/3]₀^${a} = k·${a}³/6 = 1, so k = ${frac(6,a*a*a)}.`];
if(kind==='P')w.push(`P(X < ${sf(cc)}) = k[${a}x²/2 − x³/3]₀^${sf(cc)} = <b>${sf(P)}</b>.`);
if(kind==='V')w.push(`By symmetry E(X) = ${a/2}.`,`E(X²) = ∫ x²·kx(${a} − x) dx = 3·${a}²/10 = ${sf(3*a*a/10,5)}.`,`Var(X) = ${sf(3*a*a/10,5)} − ${a/2}² = <b>${sf(a*a/20)}</b>.`);
if(kind==='k')w[0]=w[0].replace(/k = ([0-9/]+)\.$/,'k = <b>$1</b>.');
return {q:`X has pdf f(x) = kx(${a} − x) for 0 ≤ x ≤ ${a}, and 0 otherwise. Find ${kind==='k'?'k':kind==='P'?`P(X < ${sf(cc)})`:'Var(X)'}.`,ans,work:w,
tip:`Symmetric pdf → mean = median = mode = the centre. Saves an integral.`};},
],
};
const SECNAME={basics:'Events & Venns',conditional:'Conditional & trees',bayes:"Bayes' theorem",counting:'Counting',discrete:'Discrete RVs',binomial:'Binomial',normal:'Normal',continuous:'Continuous RVs'};
/* ---------- score store ---------- */
let SCORE={};try{SCORE=JSON.parse(localStorage.getItem('ibprob-score')||'{}')||{};}catch(e){SCORE={};}
function saveScore(){try{localStorage.setItem('ibprob-score',JSON.stringify(SCORE));}catch(e){}renderScore();}
function renderScore(){
let c=0,a=0;Object.values(SCORE).forEach(s=>{c+=s.c||0;a+=s.a||0;});
$('#tCorrect').textContent=c;$('#tAttempt').textContent=a;$('#tRate').textContent=a?Math.round(100*c/a)+'%':'–';
$$('.navb .s[data-s]').forEach(el=>{const s=SCORE[el.dataset.s];el.textContent=s&&s.a?`${s.c}/${s.a}`:'';});
$$('.p-score').forEach(el=>{const s=SCORE[el.dataset.sec];el.textContent=s&&s.a?`${s.c} correct of ${s.a} this browser`:'Answers to 3 s.f. Fractions like 3/8 are fine.';});
}
function parseAns(t){t=String(t).trim().replace(/,/g,'').replace(/−/g,'-');if(!t)return NaN;const m=t.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)$/);if(m)return parseFloat(m[1])/parseFloat(m[2]);if(/%$/.test(t))return parseFloat(t)/100;return Number(t);}
function mountPractice(el){
const sec=el.dataset.sec;
el.innerHTML=`<div class="p-head"><h3>Practice</h3><span class="p-score" data-sec="${sec}"></span></div>
<div class="p-q"></div>
<div class="p-row"><label class="sr" for="in-${sec}" style="position:absolute;left:-9999px">Your answer</label>
<input type="text" id="in-${sec}" inputmode="decimal" autocomplete="off" placeholder="Your answer">
<button class="btn primary" data-act="check">Check</button>
<button class="btn" data-act="show">Show working</button>
<button class="btn" data-act="next">New question</button></div>
<div class="p-fb" aria-live="polite"></div>
<div class="p-work" hidden></div>`;
const qEl=el.querySelector('.p-q'),inp=el.querySelector('input'),fb=el.querySelector('.p-fb'),wk=el.querySelector('.p-work');
let cur=null,scored=false,from='';
function next(){
let gens;if(sec==='drill'){from=pick(Object.keys(GEN));gens=GEN[from];}else gens=GEN[sec];
cur=pick(gens)();scored=false;
qEl.innerHTML=(sec==='drill'?`<span class="from">${SECNAME[from]}</span><br>`:'')+cur.q;
inp.value='';fb.textContent='';fb.className='p-fb';wk.hidden=true;
wk.innerHTML=`<span class="label">Working</span><ol>${cur.work.map(s=>`<li>${s}</li>`).join('')}</ol><div class="tipline"><b>Shorthand</b>${cur.tip}</div>`;
}
function check(){
const x=parseAns(inp.value);if(!isFinite(x)){fb.textContent='Enter a number, e.g. 0.237 or 3/8.';fb.className='p-fb no';return;}
const a=cur.ans;const ok=cur.exact?Math.abs(x-a)<1e-9*Math.max(1,Math.abs(a)):Math.abs(x-a)<=Math.max(Math.abs(a)*0.006,1e-6);
if(!scored){scored=true;SCORE[sec]=SCORE[sec]||{c:0,a:0};SCORE[sec].a++;if(ok)SCORE[sec].c++;saveScore();}
if(ok){fb.textContent=`Correct. Answer: ${sf(a)}.`;fb.className='p-fb ok';}
else{fb.textContent='Not quite. Try again, or open the working.';fb.className='p-fb no';}
}
el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const act=b.dataset.act;
if(act==='check')check();if(act==='next')next();
if(act==='show'){wk.hidden=!wk.hidden;if(!scored){scored=true;SCORE[sec]=SCORE[sec]||{c:0,a:0};SCORE[sec].a++;saveScore();}fb.textContent=`Answer: ${sf(cur.ans)}`;fb.className='p-fb';}});
inp.addEventListener('keydown',e=>{if(e.key==='Enter')check();});
next();
}
$$('.practice').forEach(mountPractice);
renderScore();
/* ---------- redraw on resize / theme ---------- */
let rt;const redraw=()=>{clearTimeout(rt);rt=setTimeout(()=>{DRAW[current]&&DRAW[current]();},80);};
window.addEventListener('resize',redraw);
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',redraw);}catch(e){}
new MutationObserver(redraw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(redraw);
let start=(location.hash||'').slice(1);if(!SECS.includes(start)){try{start=localStorage.getItem('ibprob-last')||'overview';}catch(e){start='overview';}}
show(start);
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h!==current&&SECS.includes(h))show(h);});
})();
