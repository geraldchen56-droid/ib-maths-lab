(function(){
"use strict";
const LAB=window.LAB;
const {$,tok,prep,MONO,sf,ri,pick,C,DRAW}=LAB;
LAB.SECS.push('overview','euler','sep','homog','ifac','drill','casio');
LAB.CARDS.push(
['euler','HL 5.18','Modelling & Euler','"Proportional to", setting up a model, Euler step by step'],
['sep','HL 5.18','Separation of variables','∫ dy/h(y) = ∫ g(x) dx, growth, decay, cooling'],
['homog','HL 5.18','Homogeneous (y = vx)','dy/dx = F(y/x), substitute, separate, back-substitute'],
['ifac','HL 5.18','Integrating factor','dy/dx + P(x)y = Q(x), I = e^∫P'],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Euler tables, solvers and checks on one page']);
Object.assign(LAB.SECNAME,{euler:'Modelling & Euler',sep:'Separation of variables',homog:'Homogeneous (y = vx)',ifac:'Integrating factor'});

/* ---------- formatting ---------- */
const MIN='−';
const fm=x=>{if(!isFinite(x))return '–';if(Math.abs(x)<1e-9)x=0;return sf(x,4).replace('-',MIN);};
const d6=x=>{if(!isFinite(x))return '–';if(Math.abs(x)<1e-12)x=0;return String(Number(x.toPrecision(6))).replace('-',MIN);};
const cl=x=>Math.round(x*1e10)/1e10;            /* strip floating-point noise from exact decimal arithmetic */
const N=x=>String(cl(x)).replace('-',MIN);       /* a number as typed in a question */
const par=x=>x<0?`(${N(x)})`:N(x);
const kx=(c,v='x')=>{c=cl(c);return c===1?v:c===-1?MIN+v:N(c)+v;};      /* 1x → x, −1x → −x */
const kX=c=>kx(c,'X').replace(MIN,'−');
const lhsK=k=>k===0?'dy/dx':`dy/dx ${k<0?MIN:'+'} ${kx(Math.abs(k),'y')}`;               /* bracket negatives when substituting */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
/* linear combination like "2x − y + 1" */
function lin(cs,names){let s='';cs.forEach((k,i)=>{k=cl(k);if(k===0)return;const a=Math.abs(k),nm=names[i];const body=nm?(a===1?'':N(a))+nm:N(a);if(!s)s=(k<0?MIN:'')+body;else s+=' '+(k<0?MIN:'+')+' '+body;});return s||'0';}
const sg=a=>(a<0?'−':'+')+fm(Math.abs(a));          /* signed term for calculator lines */
const parD=x=>x<0?`(${d6(x)})`:d6(x);

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

/* ---------- 2D plot with slope field ---------- */
const CV_H=340;
function niceStep(span,target){const raw=span/target,p=Math.pow(10,Math.floor(Math.log10(raw)));for(const m of [1,2,2.5,5,10])if(m*p>=raw-1e-12)return m*p;return 10*p;}
function plot(cvEl,W){
const {ctx,w,h}=prep(cvEl,CV_H);
const L=36,Rp=10,T=10,B=24,pw=w-L-Rp,ph=h-T-B;
const X=x=>L+(x-W.x0)/(W.x1-W.x0)*pw,Y=y=>T+(W.y1-y)/(W.y1-W.y0)*ph;
const sx=niceStep(W.x1-W.x0,Math.max(4,Math.round(pw/70))),sy=niceStep(W.y1-W.y0,Math.max(4,Math.round(ph/45)));
ctx.font=`10px ${MONO}`;ctx.lineWidth=1;
for(let g=Math.ceil(W.x0/sx)*sx;g<=W.x1+1e-9;g+=sx){const gx=X(g);ctx.strokeStyle=Math.abs(g)<1e-9?tok('muted'):tok('faint');ctx.beginPath();ctx.moveTo(gx,T);ctx.lineTo(gx,T+ph);ctx.stroke();ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(fm(cl(g)),gx,T+ph+5);}
for(let g=Math.ceil(W.y0/sy)*sy;g<=W.y1+1e-9;g+=sy){const gy=Y(g);ctx.strokeStyle=Math.abs(g)<1e-9?tok('muted'):tok('faint');ctx.beginPath();ctx.moveTo(L,gy);ctx.lineTo(L+pw,gy);ctx.stroke();ctx.fillStyle=tok('muted');ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(fm(cl(g)),L-5,gy);}
const S={ctx,w,h,X,Y,W};
S.clip=()=>{ctx.save();ctx.beginPath();ctx.rect(L,T,pw,ph);ctx.clip();};
S.unclip=()=>ctx.restore();
S.field=(f,col)=>{const nx=Math.max(10,Math.round(pw/34)),ny=Math.max(8,Math.round(ph/30)),cw=pw/nx,chh=ph/ny,len=Math.min(cw,chh)*0.36;
ctx.strokeStyle=col||tok('muted');ctx.lineWidth=1.2;ctx.globalAlpha=0.55;
for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const px=L+(i+0.5)*cw,py=T+(j+0.5)*chh;const x=W.x0+(px-L)/pw*(W.x1-W.x0),y=W.y1-(py-T)/ph*(W.y1-W.y0);
const s=f(x,y);if(!isFinite(s))continue;let dx=pw/(W.x1-W.x0),dy=-s*ph/(W.y1-W.y0);const m=Math.hypot(dx,dy);dx*=len/m;dy*=len/m;
ctx.beginPath();ctx.moveTo(px-dx,py-dy);ctx.lineTo(px+dx,py+dy);ctx.stroke();}
ctx.globalAlpha=1;};
S.poly=(pts,col,lw,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=lw||2;ctx.setLineDash(dash||[]);ctx.lineJoin='round';ctx.beginPath();let pen=false;
pts.forEach(p=>{const ok=p&&isFinite(p[1])&&Math.abs(Y(p[1]))<5000;if(!ok){pen=false;return;}if(pen)ctx.lineTo(X(p[0]),Y(p[1]));else{ctx.moveTo(X(p[0]),Y(p[1]));pen=true;}});
ctx.stroke();ctx.setLineDash([]);};
S.dot=(x,y,col,r)=>{if(!isFinite(y))return;ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(x),Y(y),r||4,0,7);ctx.fill();};
S.label=(x,y,t,col,dx,dy)=>{if(!isFinite(y))return;ctx.fillStyle=col;ctx.font=`600 12px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(t,X(x)+(dx||7),Y(y)+(dy||-9));};
S.seg=(x,y,s,col,lw,len)=>{len=len||14;let dx=pw/(W.x1-W.x0),dy=-s*ph/(W.y1-W.y0);const m=Math.hypot(dx,dy);dx*=len/m;dy*=len/m;ctx.strokeStyle=col;ctx.lineWidth=lw||2.5;ctx.beginPath();ctx.moveTo(X(x)-dx,Y(y)-dy);ctx.lineTo(X(x)+dx,Y(y)+dy);ctx.stroke();};
return S;
}
/* sample a closed-form solution, breaking the line at asymptotes and gaps */
function sample(fn,a,b,n){const pts=[];let prev=null;for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,y=fn(x);if(prev&&isFinite(prev[1])&&isFinite(y)&&Math.abs(y-prev[1])>60)pts.push(null);pts.push(isFinite(y)?[x,y]:null);prev=[x,y];}return pts;}
/* accurate numerical solution (RK4, many small steps) */
function rk4(f,x0,y0,x1,n){const h=(x1-x0)/n;let x=x0,y=y0;const pts=[[x,y]];
for(let i=0;i<n;i++){const k1=f(x,y),k2=f(x+h/2,y+h/2*k1),k3=f(x+h/2,y+h/2*k2),k4=f(x+h,y+h*k3);y+=h/6*(k1+2*k2+2*k3+k4);x+=h;if(!isFinite(y)||Math.abs(y)>1e6)break;pts.push([x,y]);}
return pts;}
function autoY(arrs,lo,hi,minSpan){let a=Infinity,b=-Infinity;arrs.forEach(pts=>pts.forEach(p=>{if(p&&isFinite(p[1])){a=Math.min(a,p[1]);b=Math.max(b,p[1]);}}));
if(!isFinite(a)){a=-1;b=1;}a=clamp(a,lo,hi);b=clamp(b,lo,hi);if(b-a<minSpan){const m=(a+b)/2;a=m-minSpan/2;b=m+minSpan/2;}const pad=(b-a)*0.12;return [a-pad,b+pad];}

/* ===== 1. Modelling and Euler's method ===== */
(function(){
const H=[0.05,0.1,0.125,0.25,0.5];
const DE={
xy:{f:(x,y)=>x+y,t:'x + y',e:(X,Y)=>`${X}+${Y}`},
xmy:{f:(x,y)=>x-y,t:'x − y',e:(X,Y)=>`${X}−${Y}`},
m2xy:{f:(x,y)=>-2*x*y,t:'−2xy',e:(X,Y)=>`−2(${X})${Y}`},
log:{f:(x,y)=>y*(1-y/3),t:'y(1 − y/3)',e:(X,Y)=>`${Y}(1−${Y}÷3)`}
};
let key='xy';
presets('#euler-pre',[['xy','x + y'],['xmy','x − y'],['m2xy','−2xy'],['log','y(1 − y/3)']],k=>{key=k;draw();},'xy');
const R=ctrls('#euler-ctrls','eu-',[
{head:'Start at (0, y₀)'},
{id:'y0',label:'y₀',min:-2,max:3,step:0.5,val:1},
{head:'Euler steps'},
{id:'hi',label:'step length h',min:0,max:4,step:1,val:3,fmt:i=>String(H[i])},
{id:'X',label:'estimate y at x =',min:0.5,max:3,step:0.5,val:2}
],()=>draw());
readout('#euler-ro',[['euN','steps n = x ÷ h'],['euE','Euler estimate',1],['euT','accurate value'],['euErr','error (accurate − Euler)',1],['euCon','concavity at the start']]);
function draw(){
R.sync();const [y0,hi,Xe]=vals(R,'y0','hi','X');const h=H[hi],n=Math.round(Xe/h),D=DE[key],f=D.f;
const eu=[[0,y0]];let x=0,y=y0;const rows=[];
for(let i=0;i<n;i++){const s=f(x,y),yn=y+h*s;if(rows.length<4)rows.push([i,x,y,s,yn]);y=yn;x=cl(x+h);eu.push([x,y]);if(!isFinite(y)||Math.abs(y)>1e6)break;}
const acc=rk4(f,0,y0,3.2,1600),accX=rk4(f,0,y0,Xe,4000),yT=accX[accX.length-1][1];
const show=acc.filter(p=>p[0]<=Xe+1e-9);
const [ya,yb]=autoY([show,eu],-40,60,2);
const S=plot($('#euler-cv'),{x0:-0.2,x1:3.2,y0:ya,y1:yb});
S.clip();S.field(f);S.poly(acc,tok('good'),2.5);S.poly(eu,tok('accent'),2);eu.forEach(p=>S.dot(p[0],p[1],tok('accent'),3));
S.poly([[Xe,y],[Xe,yT]],tok('bad'),2.5);S.dot(0,y0,tok('ink'),4);S.unclip();
put('euN',`${N(Xe)} ÷ ${h} = ${n}`);put('euE',d6(y));put('euT',d6(yT));put('euErr',d6(yT-y)+(Math.abs(yT)>1e-9?`  (${sf(Math.abs((yT-y)/yT)*100,3)}%)`:''));
const dd=1e-4,s0=f(0,y0),y2=(f(dd,y0+dd*s0)-f(-dd,y0-dd*s0))/(2*dd);
put('euCon',Math.abs(y2)<1e-6?'zero: no clear bias':y2>0?'up, so Euler starts under':'down, so Euler starts over');
const xs=`${h}n`,xt=`${h}(n−1)`;
gdc('euler',`Recursion: aₙ₊₁ = aₙ + ${h}(${D.e(xs,'aₙ')})   a₀ = ${N(y0)}, End ${n}`,`SEQ: u(n) = u(n−1) + ${h}(${D.e(xt,'u(n−1)')})   u(nMin) = ${N(y0)}`);
work('euler',[`dy/dx = ${D.t},  h = ${h}:  yₙ₊₁ = yₙ + ${h} × f(xₙ, yₙ)`].concat(rows.map(([i,xx,yy,s,yn])=>`n = ${i}:  x = ${N(xx)},  y = ${d6(yy)},  slope = ${d6(s)}  →  y${['₁','₂','₃','₄'][i]} = ${d6(yy)} + ${h} × ${parD(s)} = ${d6(yn)}`)).concat(n>4?[`… ${n-4} more step${n-4>1?'s':''} to reach x = ${N(Xe)}`]:[]));
}
DRAW.euler=draw;
})();

/* ===== 2. Separation of variables ===== */
(function(){
const DE={
ky:{t:'ky',f:(k)=>(x,y)=>k*y,sol:(k,x0,y0)=>x=>y0*Math.exp(k*(x-x0))},
kxy:{t:'kxy',f:(k)=>(x,y)=>k*x*y,sol:(k,x0,y0)=>x=>y0*Math.exp(k*(x*x-x0*x0)/2)},
cool:{t:'k(y − 2)',f:(k)=>(x,y)=>k*(y-2),sol:(k,x0,y0)=>x=>2+(y0-2)*Math.exp(k*(x-x0))},
xy:{t:'kx ÷ y',f:(k)=>(x,y)=>Math.abs(y)<0.05?NaN:k*x/y,sol:(k,x0,y0)=>{const Cc=y0*y0-k*x0*x0;return x=>{const q=k*x*x+Cc;return q<0?NaN:Math.sign(y0)*Math.sqrt(q);};}}
};
let key='ky';
presets('#sep-pre',[['ky','ky'],['kxy','kxy'],['cool','k(y − 2)'],['xy','kx ÷ y']],k=>{key=k;draw();},'ky');
const R=ctrls('#sep-ctrls','se-',[
{head:'The equation'},
{id:'k',label:'k',min:-1.5,max:1.5,step:0.25,val:0.5},
{head:'Initial condition y(x₀) = y₀'},
{id:'x0',label:'x₀',min:-2,max:2,step:0.5,val:0},
{id:'y0',label:'y₀',min:-3,max:4,step:0.5,val:1},
{head:'Read off'},
{id:'xq',label:'y at x =',min:-3,max:3,step:0.5,val:2}
],()=>draw());
readout('#sep-ro',[['seSep','separated'],['seGen','general solution'],['seC','constant from (x₀, y₀)',1],['sePart','particular solution',1],['seY','y at x',1]]);
function draw(){
R.sync();const [k,x0,y0,xq]=vals(R,'k','x0','y0','xq');const D=DE[key];
const S=plot($('#sep-cv'),{x0:-3,x1:3,y0:-4,y1:6});S.clip();S.field(D.f(k));
for(let c=-3;c<=5;c+=1){if(c===y0)continue;if(key==='xy'&&c===0)continue;S.poly(sample(D.sol(k,x0,c),-3,3,240),tok('accent-soft'),1.5);}
const bad=key==='xy'&&y0===0,yf=bad?(()=>NaN):D.sol(k,x0,y0);
if(!bad)S.poly(sample(yf,-3,3,360),tok('accent'),2.8);
S.dot(x0,y0,tok('amber'),5);const yq=yf(xq);S.dot(xq,yq,tok('amber'),4);S.label(xq,yq,'y = '+fm(yq),tok('amber'),10,16);S.unclip();
const K=N(k),co=A=>Math.abs(A-1)<1e-9?'':Math.abs(A+1)<1e-9?MIN:fm(A)+'·',cc=A=>Math.abs(A-1)<1e-9?'':Math.abs(A+1)<1e-9?'−':fm(A);
let sepT,gen,cT,part,cal;
if(key==='ky'){const A=y0*Math.exp(-k*x0);sepT=`∫ dy/y = ∫ ${K} dx`;gen=`ln|y| = ${kx(k)} + c, so y = A·e^(${kx(k)})`;
cT=y0===0?'A = 0':x0===0?`A = y₀ = ${fm(A)}`:`A = ${N(y0)}·e^(${N(cl(-k*x0))}) = ${fm(A)}`;part=y0===0?'y = 0 (lost when you divide by y)':`y = ${co(A)}e^(${kx(k)})`;cal=`${cc(A)}e^(${kX(k)})`;}
else if(key==='kxy'){const A=y0*Math.exp(-k*x0*x0/2);sepT=`∫ dy/y = ∫ ${kx(k)} dx`;gen=`ln|y| = ${kx(k/2,'x²')} + c, so y = A·e^(${kx(k/2,'x²')})`;
cT=y0===0?'A = 0':`A = ${fm(A)}`;part=y0===0?'y = 0 (lost when you divide by y)':`y = ${co(A)}e^(${kx(k/2,'x²')})`;cal=`${cc(A)}e^(${kX(k/2)}²)`;}
else if(key==='cool'){const A=(y0-2)*Math.exp(-k*x0);sepT=`∫ dy/(y − 2) = ∫ ${K} dx`;gen=`ln|y − 2| = ${kx(k)} + c, so y = 2 + A·e^(${kx(k)})`;
cT=y0===2?'A = 0':x0===0?`A = y₀ − 2 = ${fm(A)}`:`A = (${N(y0)} − 2)·e^(${N(cl(-k*x0))}) = ${fm(A)}`;part=y0===2?'y = 2 (equilibrium, lost when you divide by y − 2)':`y = 2 ${A<0?MIN:'+'} ${co(Math.abs(A))}e^(${kx(k)})`;cal=`2${sg(A)}e^(${kX(k)})`;}
else{const Cc=y0*y0-k*x0*x0;sepT=`∫ y dy = ∫ ${kx(k)} dx`;gen=`y²/2 = ${kx(k)}²/2 + c, so y² = ${kx(k)}² + C`;
cT=bad?'y₀ = 0 is not allowed: dy/dx = kx ÷ 0 has no value':`C = ${N(y0)}² − ${par(k)}(${N(x0)})² = ${fm(Cc)}`;
part=bad?'–':`y = ${y0<0?MIN:''}√(${lin([k,Cc],['x²',''])})`;cal=bad?'–':`${y0<0?'−':''}√(${lin([k,Cc],['X²',''])})`;}
put('seSep',sepT);put('seGen',gen);put('seC',cT);put('sePart',part);put('seY',isFinite(yq)?fm(yq):'no value: the solution stops before this x');
gdc('sep',`Graph: Y1 = ${cal}  →  G-SOLVE → Y-CAL at X = ${N(xq)}`,`Y1 = ${cal.replace(/e\^/g,'e^')}  →  CALC → 1:value at X = ${N(xq)}`);
work('sep',[`dy/dx = ${D.t.replace('k',kx(k,'')||'1').replace(/^1(?=[a-z(])/,'')}`,`Separate: ${sepT}`,`Integrate: ${gen}`,`Use (${N(x0)}, ${N(y0)}): ${cT}`,`Particular: ${part}`]);
}
DRAW.sep=draw;
})();

/* ===== 3. Homogeneous equations ===== */
(function(){
const DE={
p1:{t:'(x + y)/x',F:v=>1+v,Fv:'1 + v',sub:'x dv/dx = 1',sep:'∫ dv = ∫ dx/x',gen:'v = ln x + c'},
p2:{t:'(x² + y²)/(xy)',F:v=>v+1/v,Fv:'v + 1/v',sub:'x dv/dx = 1/v',sep:'∫ v dv = ∫ dx/x',gen:'v²/2 = ln x + c'},
p3:{t:'(y² + xy)/x²',F:v=>v*v+v,Fv:'v² + v',sub:'x dv/dx = v²',sep:'∫ dv/v² = ∫ dx/x',gen:'−1/v = ln x + c'},
p4:{t:'(3y² + x²)/(2xy)',F:v=>(3*v*v+1)/(2*v),Fv:'(3v² + 1)/(2v)',sub:'x dv/dx = (v² + 1)/(2v)',sep:'∫ 2v/(v² + 1) dv = ∫ dx/x',gen:'ln(v² + 1) = ln x + c'}
};
let key='p1';
presets('#homog-pre',[['p1','(x + y)/x'],['p2','(x² + y²)/(xy)'],['p3','(y² + xy)/x²'],['p4','(3y² + x²)/(2xy)']],k=>{key=k;draw();},'p1');
const R=ctrls('#homog-ctrls','ho-',[
{head:'Point the solution passes through'},
{id:'x0',label:'x₀',min:0.5,max:3,step:0.25,val:1},
{id:'y0',label:'y₀',min:-3,max:4,step:0.25,val:2},
{head:'Ray y = vx'},
{id:'v',label:'v',min:-3,max:3,step:0.25,val:1}
],()=>draw());
readout('#homog-ro',[['hoV','v₀ = y₀ ÷ x₀'],['hoF','slope on the ray, F(v)'],['hoC','constant c',1],['hoSol','solution',1],['hoY','y at x = 3']]);
function solution(key,x0,y0){const v0=y0/x0;
if(key==='p1'){const c=v0-Math.log(x0);return {c,txt:`y = x(ln x ${c<0?MIN:'+'} ${fm(Math.abs(c))})`,y:x=>x*(Math.log(x)+c)};}
if(key==='p2'){if(v0===0)return {bad:'v₀ = 0 is not allowed: F(v) has 1/v'};const c=v0*v0-2*Math.log(x0),s=Math.sign(v0);return {c,txt:`y = ${s<0?MIN:''}x√(2 ln x ${c<0?MIN:'+'} ${fm(Math.abs(c))})`,y:x=>{const q=2*Math.log(x)+c;return q<0?NaN:s*x*Math.sqrt(q);}};}
if(key==='p3'){if(v0===0)return {c:NaN,txt:'y = 0 (lost when you divide by v²)',y:()=>0};const c=-1/v0-Math.log(x0);return {c,txt:`y = −x ÷ (ln x ${c<0?MIN:'+'} ${fm(Math.abs(c))})`,asym:Math.exp(-c),y:x=>{const q=Math.log(x)+c;return Math.abs(q)<1e-3?NaN:-x/q;}};}
if(v0===0)return {bad:'v₀ = 0 is not allowed: F(v) has 1/v'};const A=(v0*v0+1)/x0,s=Math.sign(v0);return {c:Math.log(A),A,txt:`y² = ${fm(A)}x³ − x²`,y:x=>{const q=A*x*x*x-x*x;return q<0?NaN:s*Math.sqrt(q);}};
}
function draw(){
R.sync();const [x0,y0,v]=vals(R,'x0','y0','v');const D=DE[key],F=D.F;
const S=plot($('#homog-cv'),{x0:0,x1:4,y0:-4,y1:6});S.clip();
S.field((x,y)=>x<0.04?NaN:F(y/x));
S.poly([[0,0],[4,4*v]],tok('amber'),1.5,[5,4]);
const Fv=F(v);if(isFinite(Fv))for(let xx=0.5;xx<4;xx+=0.75){const yy=v*xx;if(yy>-4&&yy<6)S.seg(xx,yy,Fv,tok('amber'),3,13);}
const sol=solution(key,x0,y0);
if(!sol.bad){const pts=[];for(let i=1;i<=500;i++){const x=4*i/500,y=sol.y(x);if(sol.asym&&pts.length&&pts[pts.length-1]&&(x-sol.asym)*(pts[pts.length-1][0]-sol.asym)<0)pts.push(null);pts.push(isFinite(y)?[x,y]:null);}S.poly(pts,tok('accent'),2.8);}
S.dot(x0,y0,tok('ink'),5);S.unclip();
const v0=y0/x0,y3=sol.bad?NaN:sol.y(3);
put('hoV',fm(v0));put('hoF',isFinite(Fv)?`F(${fm(v)}) = ${fm(Fv)} everywhere on the ray`:'no slope here: F(v) has 1/v and v = 0');
put('hoC',sol.bad?sol.bad:key==='p4'?`A = e^c = ${fm(sol.A)}`:isFinite(sol.c)?fm(sol.c):'–');
put('hoSol',sol.bad?'–':sol.txt);put('hoY',isFinite(y3)?fm(y3):(sol.asym&&sol.asym<3?'no value: an asymptote at x = '+fm(sol.asym)+' comes first':'no value: the solution stops before x = 3'));
const calc=sol.bad?'–':key==='p1'?`X(ln X ${sol.c<0?'−':'+'} ${fm(Math.abs(sol.c))})`:key==='p2'?`${v0<0?'−':''}X√(2ln X ${sol.c<0?'−':'+'} ${fm(Math.abs(sol.c))})`:key==='p3'?(isFinite(sol.c)?`−X÷(ln X ${sol.c<0?'−':'+'} ${fm(Math.abs(sol.c))})`:'0'):`${v0<0?'−':''}√(${fm(sol.A)}X^3−X²)`;
gdc('homog',`Graph: Y1 = ${calc}  →  G-SOLVE → Y-CAL at X = 3`,`Y1 = ${calc.replace('ln X','ln(X)')}  →  CALC → 1:value at X = 3`);
work('homog',[`dy/dx = ${D.t} = ${D.Fv}, with v = y/x`,`y = vx ⇒ v + x dv/dx = ${D.Fv}  ⇒  ${D.sub}`,`Separate: ${D.sep}  ⇒  ${D.gen}`,sol.bad?sol.bad:`At (${N(x0)}, ${N(y0)}), v = ${fm(v0)}: ${key==='p4'?'v² + 1 = Ax, A = '+fm(sol.A):'c = '+(isFinite(sol.c)?fm(sol.c):'–')}`,sol.bad?'':`Put v = y/x back: ${sol.txt}`]);
}
DRAW.homog=draw;
})();

/* ===== 4. Integrating factor ===== */
(function(){
/* y′ + k y = Q(x), y(0) = y₀. Each Q gives the steady part, c, and special cases where the split changes form. */
const Q={
c:{t:'q',q:(q,x)=>q,steady:(k,q)=>k===0?null:x=>q/k,steadyT:(k,q)=>`${fm(q/k)}`,c:(k,q,y0)=>y0-q/k,IQ:(k,q)=>`${N(q)}e^(${kx(k)})`,sp:(q,y0)=>x=>y0+q*x,spT:(q,y0)=>`y = ${N(y0)} ${q<0?MIN:'+'} ${N(Math.abs(q))}x`},
x:{t:'qx',q:(q,x)=>q*x,steady:(k,q)=>k===0?null:x=>q*(x/k-1/(k*k)),steadyT:(k,q)=>`${fm(q/k)}x ${q/(k*k)>0?MIN:'+'} ${fm(Math.abs(q/(k*k)))}`,c:(k,q,y0)=>y0+q/(k*k),IQ:(k,q)=>`${N(q)}x·e^(${kx(k)})`,sp:(q,y0)=>x=>y0+q*x*x/2,spT:(q,y0)=>`y = ${N(y0)} ${q<0?MIN:'+'} ${N(Math.abs(q/2))}x²`},
s:{t:'q sin x',q:(q,x)=>q*Math.sin(x),steady:(k,q)=>x=>q*(k*Math.sin(x)-Math.cos(x))/(k*k+1),steadyT:(k,q)=>`${fm(q*k/(k*k+1))} sin x ${q>0?MIN:'+'} ${fm(Math.abs(q/(k*k+1)))} cos x`,c:(k,q,y0)=>y0+q/(k*k+1),IQ:(k,q)=>k===0?`${N(q)} sin x`:`${N(q)}e^(${kx(k)}) sin x`},
e:{t:'q e^(−x)',q:(q,x)=>q*Math.exp(-x),steady:(k,q)=>k===1?null:x=>q*Math.exp(-x)/(k-1),steadyT:(k,q)=>`${fm(q/(k-1))}e^(−x)`,c:(k,q,y0)=>y0-q/(k-1),IQ:(k,q)=>k===1?N(q):`${N(q)}e^(${kx(k-1)})`,sp1:(q,y0)=>x=>(q*x+y0)*Math.exp(-x),sp1T:(q,y0)=>`y = (${lin([q,y0],['x',''])})e^(−x)`}
};
let key='c';
presets('#ifac-pre',[['c','Q = q'],['x','Q = qx'],['s','Q = q sin x'],['e','Q = q e^(−x)']],k=>{key=k;draw();},'c');
const R=ctrls('#ifac-ctrls','if-',[
{head:'dy/dx + ky = Q(x)'},
{id:'k',label:'k (so P = k)',min:-1,max:3,step:0.5,val:1},
{id:'q',label:'q',min:-3,max:3,step:0.5,val:2},
{head:'Initial condition'},
{id:'y0',label:'y(0)',min:-3,max:4,step:0.5,val:0}
],()=>draw());
readout('#ifac-ro',[['ifI','integrating factor I'],['ifD','d/dx(I y) ='],['ifGen','solution',1],['ifY','y(2)'],['ifL','long run']]);
function draw(){
R.sync();const [k,q,y0]=vals(R,'k','q','y0');const D=Q[key];
const st=D.steady(k,q);let yf,stT='',cc=NaN,gen;
if(st){cc=D.c(k,q,y0);yf=x=>st(x)+cc*Math.exp(-k*x);stT=D.steadyT(k,q);gen=`y = ${stT} ${cc<0?MIN:'+'} ${fm(Math.abs(cc))}e^(${kx(-k)})`.replace('e^(0x)','');}
else if(key==='e'){yf=D.sp1(q,y0);gen=D.sp1T(q,y0)+'   (k = 1: I Q = q, so no split)';}
else{yf=D.sp(q,y0);gen=D.spT(q,y0)+'   (k = 0: just integrate Q)';}
const sol=sample(yf,0,6,360),stP=st?sample(st,0,6,240):[],trP=st?sample(x=>cc*Math.exp(-k*x),0,6,240):[];
const [ya,yb]=autoY([sol,stP,trP],-20,30,3);
const S=plot($('#ifac-cv'),{x0:0,x1:6,y0:ya,y1:yb});S.clip();
S.field((x,y)=>D.q(q,x)-k*y);
if(st){S.poly(trP,tok('muted'),1.8,[5,4]);S.poly(stP,tok('amber'),2,[6,4]);}
S.poly(sol,tok('accent'),2.8);S.dot(0,y0,tok('ink'),5);S.unclip();
const I=k===0?'e^0 = 1':`e^(${kx(k)})`;
put('ifI',I);const IQ=k===0?D.t.replace('q',N(q)):D.IQ(k,q);put('ifD',IQ);
put('ifGen',gen);put('ifY',fm(yf(2)));
put('ifL',k>0?(st?'transient dies away, y → steady part':'y → 0'):k<0?(st&&Math.abs(cc)<1e-9?'c = 0: no transient, y = steady part':'transient grows without bound'):'no decay: k = 0');
const sx=st?stT.replace(/x/g,'X'):'';
const yc=st?`${sx}${sg(cc)}e^(${kX(-k)})`:'(your y)';
gdc('ifac',`Graph: Y1 = ${yc}  →  G-SOLVE → Y-CAL at X = 2`,`Y1 = ${yc}  →  CALC → 1:value at X = 2`);
work('ifac',[`${lhsK(k)} = ${D.t.replace('q',N(q))}.  P = ${N(k)}, so I = e^∫P dx = ${I}`,
`Multiply through: d/dx(${k===0?'':'e^('+kx(k)+')'}y) = ${IQ}`,
`Integrate, add c, divide by I: ${gen}`,st?`y(0) = ${N(y0)} gives c = ${fm(cc)}. Steady part ${stT}, transient ${fm(cc)}e^(${kx(-k)}).`:'']);
}
DRAW.ifac=draw;
})();

/* ===== Practice generators ===== */
const rn=(lo,hi)=>{let x=0;do{x=ri(lo,hi);}while(x===0);return x;};
const SUB=['₀','₁','₂','₃','₄','₅'];
const GEN={
euler:[
/* linear f, 2 or 3 steps */
()=>{const a=ri(-3,3),b=rn(-2,2),c=ri(-2,2),x0=pick([0,1]),y0=ri(-2,3),h=pick([0.1,0.2,0.5]),n=pick([2,3]);
const f=(x,y)=>a*x+b*y+c,fT=lin([a,b,c],['x','y','']);
let x=x0,y=y0;const w=[`yₙ₊₁ = yₙ + ${h} × f(xₙ, yₙ) with f = ${fT}.`];
for(let i=0;i<n;i++){const s=cl(f(x,y)),yn=cl(y+h*s);w.push(`n = ${i}: slope at (${N(x)}, ${N(y)}) is ${N(s)}, so y${SUB[i+1]} = ${N(y)} + ${h} × ${par(s)} = ${N(yn)}.`);y=yn;x=cl(x+h);}
w.push(`So y(${N(x)}) ≈ <b>${N(y)}</b>.`);w.push(C(`fx-CG50: Recursion, aₙ₊₁ = aₙ + ${h}(${lin([a,b,c],[x0?`(${x0}+${h}n)`:`(${h}n)`,'aₙ',''])})`,`TI-84: SEQ, u(n) = u(n−1) + ${h}(${lin([a,b,c],[x0?`(${x0}+${h}(n−1))`:`(${h}(n−1))`,'u(n−1)',''])})`));
if(Math.abs(y)>500)return GEN.euler[0]();
return {q:`Given dy/dx = ${fT} and y = ${N(y0)} when x = ${x0}, use Euler's method with step length ${h} to estimate y when x = ${N(x)}.`,ans:y,work:w,tip:`New = old + h × slope at old. ${n} steps, because (${N(x)} − ${x0}) ÷ ${h} = ${n}.`};},
/* non-linear f, 2 steps */
()=>{const type=pick(['xy','x2y','y2']),x0=pick([0,1]),y0=pick([1,2,-1]),h=pick([0.1,0.2]);
const F={xy:[(x,y)=>x*y,'xy'],x2y:[(x,y)=>x*x-y,'x² − y'],y2:[(x,y)=>x+y*y,'x + y²']}[type];
let x=x0,y=y0;const w=[`yₙ₊₁ = yₙ + ${h} × f(xₙ, yₙ) with f = ${F[1]}.`];
for(let i=0;i<2;i++){const s=F[0](x,y),yn=y+h*s;w.push(`n = ${i}: f(${N(x)}, ${d6(y)}) = ${d6(s)}, so y${SUB[i+1]} = ${d6(y)} + ${h} × ${parD(s)} = ${d6(yn)}.`);y=yn;x=cl(x+h);}
w.push(`So y(${N(x)}) ≈ <b>${sf(y)}</b> (3 s.f.).`);
return {q:`The curve y = f(x) satisfies dy/dx = ${F[1]} and passes through (${x0}, ${N(y0)}). Use Euler's method with h = ${h} to estimate f(${N(x)}).`,ans:y,work:w,tip:`Non-linear f changes nothing: still slope at the OLD point, times h, added on.`};},
/* modelling: find k from an initial rate */
()=>{if(Math.random()<0.5){const T0=ri(60,95),Ta=pick([15,18,20,22,25]),r=pick([1.5,2,2.4,3,3.5,4,5]);const k=r/(T0-Ta);
return {q:`A drink at ${T0}°C is left in a room at ${Ta}°C. It cools at a rate proportional to the difference between its temperature and the room's, so dT/dt = −k(T − ${Ta}). Initially it is cooling at ${r}°C per minute. Find k.`,ans:k,
work:[`Initially T = ${T0} and dT/dt = −${r} (falling).`,`−${r} = −k(${T0} − ${Ta}) = −${T0-Ta}k.`,`k = ${r} ÷ ${T0-Ta} = <b>${sf(k)}</b> per minute.`],tip:`"Falling at r" means dT/dt = −r. Put the initial values into the DE and solve for k.`};}
const P0=pick([200,250,400,500,800,1200]),r=pick([12,15,18,24,30,36,40]);const k=r/P0;
return {q:`A population P grows at a rate proportional to its size. When P = ${P0} it is increasing at ${r} per year. Write down the differential equation and find the constant of proportionality k.`,ans:k,
work:[`"Proportional to its size": dP/dt = kP.`,`${r} = k × ${P0}.`,`k = ${r} ÷ ${P0} = <b>${sf(k)}</b> per year.`],tip:`"Proportional to" = "k ×". One data point gives k.`};},
/* modelling + Euler */
()=>{const k=pick([0.05,0.1,0.2]),Ta=pick([15,20,25]),T0=ri(70,95),h=pick([1,2,5]);
let T=T0;const w=[`dT/dt = −${k}(T − ${Ta}). Tₙ₊₁ = Tₙ + ${h} × (−${k}(Tₙ − ${Ta})).`];
for(let i=0;i<2;i++){const s=cl(-k*(T-Ta)),Tn=cl(T+h*s);w.push(`n = ${i}: slope = −${k}(${N(T)} − ${Ta}) = ${N(s)}, so T${SUB[i+1]} = ${N(T)} + ${h} × ${par(s)} = ${N(Tn)}.`);T=Tn;}
w.push(`After ${2*h} minutes, T ≈ <b>${sf(T,4)}</b>°C.`);
return {q:`A metal block at ${T0}°C cools in a room at ${Ta}°C according to dT/dt = −${k}(T − ${Ta}), with t in minutes. Use Euler's method with a step of ${h} minute${h>1?'s':''} to estimate the temperature after ${2*h} minutes.`,ans:T,work:w,tip:`Time steps work exactly like x steps. Two steps of ${h} reach t = ${2*h}.`};}
],
sep:[
/* exponential growth / decay */
()=>{const k=pick([0.2,0.3,0.4,0.5,-0.2,-0.3,-0.5,-0.8]),a=ri(2,9),b=pick([1,2,3,4]);const y=a*Math.exp(k*b);
return {q:`Solve dy/dx = ${N(k)}y with y = ${a} when x = 0, and hence find y when x = ${b}.`,ans:y,
work:[`Separate: ∫ dy/y = ∫ ${N(k)} dx, so ln|y| = ${kx(k)} + c.`,`y = Ae^(${kx(k)}). At x = 0, y = ${a}, so A = ${a}.`,`y(${b}) = ${a}e^(${N(cl(k*b))}) = <b>${sf(y)}</b>.`],tip:`dy/dx = ky ⇒ y = y₀e^(kx). Spot it and skip straight to the answer.`};},
/* Newton's law of cooling with a second data point */
()=>{const Ta=pick([15,18,20,22]),T0=ri(75,98),t1=pick([5,10,15]);let T1=ri(Ta+15,T0-8);const t2=pick([20,25,30,40]);
const r=(T1-Ta)/(T0-Ta),k=-Math.log(r)/t1,T2=Ta+(T0-Ta)*Math.exp(-k*t2);
return {q:`An object cools according to dT/dt = −k(T − ${Ta}). At t = 0, T = ${T0}°C, and at t = ${t1} minutes, T = ${T1}°C. Find T when t = ${t2}.`,ans:T2,
work:[`Separate: ∫ dT/(T − ${Ta}) = −∫ k dt ⇒ T = ${Ta} + Ae^(−kt).`,`t = 0: A = ${T0} − ${Ta} = ${T0-Ta}.`,`t = ${t1}: ${T1} = ${Ta} + ${T0-Ta}e^(−${t1}k) ⇒ e^(−${t1}k) = ${T1-Ta}/${T0-Ta} ⇒ k = ${sf(k,4)}.`,`T(${t2}) = ${Ta} + ${T0-Ta}e^(−${sf(k,6)} × ${t2}) = <b>${sf(T2)}</b>°C.`],tip:`Cooling: T = Tₐ + (T₀ − Tₐ)e^(−kt). First point gives A, second gives k.`};},
/* y dy = x dx */
()=>{const x0=ri(0,2),y0=ri(1,4),x1=ri(x0+1,x0+3);const y=Math.sqrt(y0*y0+x1*x1-x0*x0);
return {q:`Given dy/dx = x/y and y = ${y0} when x = ${x0}, with y &gt; 0, find y when x = ${x1}.`,ans:y,
work:[`Separate: ∫ y dy = ∫ x dx ⇒ y²/2 = x²/2 + c ⇒ y² = x² + C.`,`At (${x0}, ${y0}): ${y0*y0} = ${x0*x0} + C ⇒ C = ${y0*y0-x0*x0}.`,`y(${x1}) = √(${x1*x1} + ${y0*y0-x0*x0}) = √${x1*x1+y0*y0-x0*x0} = <b>${sf(y)}</b>.`],tip:`Multiply the 2 through early: y² = x² + C. Take the positive root because y &gt; 0.`};},
/* kxy */
()=>{const k=pick([0.5,1,-1,2,-0.5,0.4]),a=ri(1,5),b=pick([1,1.5,2]);const y=a*Math.exp(k*b*b/2);
return {q:`Solve dy/dx = ${kx(k)}y given y(0) = ${a}. Find y(${N(b)}).`,ans:y,
work:[`Separate: ∫ dy/y = ∫ ${kx(k)} dx ⇒ ln|y| = ${kx(k/2,'x²')} + c.`,`y = Ae^(${kx(k/2,'x²')}), and y(0) = ${a} gives A = ${a}.`,`y(${N(b)}) = ${a}e^(${N(cl(k*b*b/2))}) = <b>${sf(y)}</b>.`],tip:`x on the right integrates to x²/2. The exponent is (k/2)x², not kx².`};},
/* e^(x − y) */
()=>{const y0=pick([0,1,2]),b=pick([0.5,1,2]);const y=Math.log(Math.exp(b)+Math.exp(y0)-1);
return {q:`Solve dy/dx = e^(x − y) with y(0) = ${y0}. Find y(${N(b)}).`,ans:y,
work:[`e^(x − y) = eˣe^(−y), so separate: ∫ eʸ dy = ∫ eˣ dx ⇒ eʸ = eˣ + c.`,`y(0) = ${y0}: e^${y0} = 1 + c ⇒ c = ${y0===0?'0':'e^'+y0+' − 1'}.`,`y = ln(eˣ + ${y0===0?'0':'e^'+y0+' − 1'}), so y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`Split the exponent first: e^(x − y) = eˣ ÷ eʸ. Then it separates.`};},
/* doubling / half-life */
()=>{if(Math.random()<0.5){const d=pick([3,4,5,6,8,10]);const k=Math.log(2)/d;
return {q:`A quantity grows according to dN/dt = kN and doubles every ${d} years. Find k.`,ans:k,work:[`N = N₀e^(kt). Doubling: 2N₀ = N₀e^(${d}k).`,`e^(${d}k) = 2 ⇒ k = ln 2 ÷ ${d} = <b>${sf(k)}</b>.`],tip:`Doubling time d ⇒ k = ln 2 ÷ d. Halving ⇒ k = −ln 2 ÷ d.`};}
const k=pick([0.05,0.08,0.1,0.12,0.2]),m=pick([3,5,10]);const t=Math.log(m)/k;
return {q:`A colony grows according to dP/dt = ${k}P, with t in hours. How long does it take to become ${m} times as large?`,ans:t,work:[`P = P₀e^(${k}t).`,`${m}P₀ = P₀e^(${k}t) ⇒ ${k}t = ln ${m}.`,`t = ln ${m} ÷ ${k} = <b>${sf(t)}</b> hours.`],tip:`P₀ cancels. "m times as large" ⇒ kt = ln m.`};}
],
homog:[
/* (y + px)/x */
()=>{const p=rn(-2,3),a=ri(-2,3),b=pick([2,3,4,0.5]);const y=b*(p*Math.log(b)+a);
return {q:`Use the substitution y = vx to solve dy/dx = (y ${p<0?MIN:'+'} ${Math.abs(p)===1?'':Math.abs(p)}x)/x for x &gt; 0, given y = ${N(a)} when x = 1. Find y when x = ${N(b)}.`,ans:y,
work:[`dy/dx = v ${p<0?MIN:'+'} ${Math.abs(p)}. With y = vx: v + x dv/dx = v ${p<0?MIN:'+'} ${Math.abs(p)}.`,`x dv/dx = ${N(p)} ⇒ ∫ dv = ∫ ${N(p)}/x dx ⇒ v = ${N(p)} ln x + c.`,`x = 1, v = ${N(a)} ⇒ c = ${N(a)}. So y = x(${N(p)} ln x ${a<0?MIN:'+'} ${Math.abs(a)}).`,`y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`F(v) = v + p: the v's cancel and x dv/dx = p. Integrate to v = p ln x + c.`};},
/* (x² + y²)/(xy) */
()=>{const a=ri(1,3),b=pick([2,3,0.5,1.5]);const q=2*Math.log(b)+a*a;if(q<=0)return GEN.homog[1]();const y=b*Math.sqrt(q);
return {q:`Solve dy/dx = (x² + y²)/(xy), x &gt; 0, y &gt; 0, with y(1) = ${a}. Find y(${N(b)}).`,ans:y,
work:[`Divide top and bottom by x²: dy/dx = (1 + v²)/v = v + 1/v.`,`y = vx: v + x dv/dx = v + 1/v ⇒ x dv/dx = 1/v.`,`∫ v dv = ∫ dx/x ⇒ v²/2 = ln x + c. At x = 1, v = ${a}: c = ${N(a*a/2)}.`,`v² = 2 ln x + ${a*a} ⇒ y = x√(2 ln x + ${a*a}).`,`y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`v + 1/v minus v leaves 1/v. Separate as v dv = dx/x.`};},
/* (y² + xy)/x² */
()=>{const a=pick([1,2,-1,0.5,-2]),b=pick([1.5,2,3]);const den=1-a*Math.log(b);if(den<0.2)return GEN.homog[2]();const y=a*b/den;
return {q:`Solve dy/dx = (y² + xy)/x² for x &gt; 0, given y = ${N(a)} when x = 1. Find y when x = ${N(b)}.`,ans:y,
work:[`dy/dx = v² + v with v = y/x. y = vx gives x dv/dx = v².`,`∫ v⁻² dv = ∫ dx/x ⇒ −1/v = ln x + c.`,`x = 1, v = ${N(a)} ⇒ c = ${N(-1/a)}. So 1/v = ${N(1/a)} − ln x ⇒ v = ${N(a)}/(1 − ${par(a)}ln x).`,`y = ${N(a)}x/(1 − ${par(a)}ln x), so y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`F(v) − v = v²: separate as v⁻² dv. Watch for the asymptote where the denominator is 0.`};},
/* (3y² + x²)/(2xy) */
()=>{const a=ri(1,3),b=pick([2,3,1.5]);const y=Math.sqrt((a*a+1)*b**3-b*b);
return {q:`Solve dy/dx = (3y² + x²)/(2xy), x &gt; 0, y &gt; 0, given y(1) = ${a}. Find y(${N(b)}).`,ans:y,
work:[`dy/dx = (3v² + 1)/(2v). y = vx: x dv/dx = (3v² + 1)/(2v) − v = (v² + 1)/(2v).`,`∫ 2v/(v² + 1) dv = ∫ dx/x ⇒ ln(v² + 1) = ln x + c ⇒ v² + 1 = Ax.`,`x = 1, v = ${a}: A = ${a*a+1}. So y²/x² + 1 = ${a*a+1}x ⇒ y² = ${a*a+1}x³ − x².`,`y(${N(b)}) = √(${a*a+1} × ${N(cl(b**3))} − ${N(cl(b*b))}) = <b>${sf(y)}</b>.`],tip:`Top is the derivative of the bottom: ∫ 2v/(v² + 1) dv = ln(v² + 1). Logs on both sides ⇒ v² + 1 = Ax.`};}
],
ifac:[
/* constant Q */
()=>{const k=pick([1,2,3,0.5]),q=rn(-6,8),y0=ri(-3,4),b=pick([1,2]);if(cl(y0-q/k)===0)return GEN.ifac[0]();const y=q/k+(y0-q/k)*Math.exp(-k*b);
return {q:`Solve dy/dx + ${kx(k,'y')} = ${N(q)} with y(0) = ${y0}. Find y(${b}).`,ans:y,
work:[`I = e^(${kx(k)}). d/dx(ye^(${kx(k)})) = ${N(q)}e^(${kx(k)}).`,`ye^(${kx(k)}) = ${N(cl(q/k))}e^(${kx(k)}) + c ⇒ y = ${N(cl(q/k))} + ce^(${kx(-k)}).`,`y(0) = ${y0} ⇒ c = ${N(cl(y0-q/k))}.`,`y(${b}) = ${N(cl(q/k))} ${y0-q/k<0?MIN:'+'} ${N(Math.abs(cl(y0-q/k)))}e^(−${N(cl(k*b))}) = <b>${sf(y)}</b>.`],tip:`dy/dx + ky = q ⇒ y = q/k + ce^(−kx). The steady value is q/k.`};},
/* exponential Q */
()=>{const k=pick([1,2,3]),m=pick([1,-2,2,-3]);if(m+k===0)return GEN.ifac[1]();const q=rn(-4,5),y0=ri(-2,4),b=pick([0.5,1]);
const A=q/(m+k),c=y0-A,y=A*Math.exp(m*b)+c*Math.exp(-k*b);
return {q:`Solve dy/dx + ${kx(k,'y')} = ${N(q)}e^(${kx(m)}) given y(0) = ${y0}. Find y(${N(b)}).`,ans:y,
work:[`I = e^(${kx(k)}). d/dx(ye^(${kx(k)})) = ${N(q)}e^(${kx(m+k)}).`,`ye^(${kx(k)}) = (${N(q)}/${N(m+k)})e^(${kx(m+k)}) + c ⇒ y = ${sf(A,4)}e^(${kx(m)}) + ce^(${kx(-k)}).`,`y(0) = ${y0} ⇒ c = ${y0} − ${par(+sf(A,6))} = ${sf(c,4)}.`,`y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`The exponents add: e^(kx) × e^(mx) = e^((m + k)x). Then divide by m + k.`};},
/* x y′ + n y = x^m */
()=>{const n=ri(1,3),m=ri(1,3),a=ri(-2,3),b=pick([2,3,0.5]);const c=a-1/(m+n),y=b**m/(m+n)+c*b**(-n);
const xp=['','x','x²','x³','x⁴','x⁵','x⁶'];
return {q:`Solve x dy/dx + ${n===1?'':n}y = ${xp[m]} for x &gt; 0, with y(1) = ${a}. Find y(${N(b)}).`,ans:y,
work:[`Standard form: dy/dx + (${n}/x)y = ${m===1?'1':xp[m-1]}.`,`I = e^(${n} ln x) = ${xp[n]}. d/dx(${xp[n]}y) = ${xp[m+n-1]}.`,`${xp[n]}y = ${xp[m+n]}/${m+n} + c. At x = 1: ${a} = 1/${m+n} + c ⇒ c = ${sf(c,4)}.`,`y = ${xp[m]}/${m+n} + c/${xp[n]}, so y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`Divide by x first. P = n/x gives I = xⁿ, because e^(n ln x) = xⁿ.`};},
/* y′ + 2xy = q x e^(−x²) */
()=>{const q=rn(-4,6),a=ri(-2,3),b=pick([0.5,1,1.5]);const y=(q*b*b/2+a)*Math.exp(-b*b);
return {q:`Solve dy/dx + 2xy = ${N(q)}xe^(−x²) given y(0) = ${a}. Find y(${N(b)}).`,ans:y,
work:[`P = 2x ⇒ I = e^(x²).`,`d/dx(ye^(x²)) = ${N(q)}x (the exponentials cancel).`,`ye^(x²) = ${N(cl(q/2))}x² + c, and y(0) = ${a} ⇒ c = ${a}.`,`y = (${N(cl(q/2))}x² ${a<0?MIN:'+'} ${Math.abs(a)})e^(−x²), so y(${N(b)}) = <b>${sf(y)}</b>.`],tip:`I = e^(x²) cancels the e^(−x²) on the right. Designed to cancel.`};},
/* integrating factor only */
()=>{const n=ri(1,4),b=ri(2,3);const ans=b**n;
return {q:`The equation x dy/dx + ${n===1?'':n}y = sin x is solved using an integrating factor I(x). Find I(${b}), taking the integrating factor with no constant.`,ans,exact:true,
work:[`Standard form: dy/dx + (${n}/x)y = sin x ÷ x, so P = ${n}/x.`,`I = e^∫P dx = e^(${n} ln x) = x${['','','²','³','⁴'][n]}.`,`I(${b}) = ${b}${['','','²','³','⁴'][n]} = <b>${ans}</b>.`],tip:`Coefficient of y over coefficient of dy/dx gives P. e^(n ln x) = xⁿ.`};}
]
};
Object.assign(LAB.GEN,GEN);
})();
