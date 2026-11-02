(function(){
"use strict";
const LAB=window.LAB;
const {$,tok,prep,MONO,sf,ri,pick,C,DRAW}=LAB;
LAB.SECS.push('overview','limits','lhop','diff','tangent','curve','optim','implicit','integ','tech','area','volume','kinem','maclaurin','euler','sep','homog','ifac','drill','casio');
LAB.CARDS.push(
["limits","SL 5.1 · AHL 5.12","Limits & first principles","Chords become tangents; continuity and differentiability at a join"],
["lhop","AHL 5.13","L'Hôpital's rule","0/0 and ∞/∞: differentiate top and bottom"],
["diff","SL 5.6 · AHL 5.15","Differentiation rules","Chain, product, quotient, and the HL booklet derivatives"],
["tangent","SL 5.2, 5.4","Tangents & normals","y − y₁ = m(x − x₁), −1/m, increasing and decreasing"],
["curve","SL 5.7, 5.8","Stationary points & inflexion","f, f′, f″ lined up: max, min, concavity"],
["optim","SL 5.8 · AHL 5.14","Optimisation","Constrain to one variable, differentiate, justify"],
["implicit","AHL 5.14","Implicit & related rates","Every y gets a dy/dx; formula → d/dt → substitute"],
["integ","SL 5.5, 5.10","Integration","Antiderivatives, reverse chain, F(b) − F(a)"],
["tech","AHL 5.15, 5.16","Integration techniques","By parts, substitution, partial fractions"],
["area","SL 5.11 · AHL 5.17","Areas","Top minus bottom, split at crossings, ∫ x dy"],
["volume","AHL 5.17","Volumes of revolution","π∫y² dx, π∫x² dy, washers"],
["kinem","SL 5.9","Kinematics","s, v, a; displacement vs distance"],
["maclaurin","AHL 5.19","Maclaurin series","Substitute, multiply, approximate, find limits"],
['euler','HL 5.18','Modelling & Euler','"Proportional to", setting up a model, Euler step by step'],
['sep','HL 5.18','Separation of variables','∫ dy/h(y) = ∫ g(x) dx, growth, decay, cooling'],
['homog','HL 5.18','Homogeneous (y = vx)','dy/dx = F(y/x), substitute, separate, back-substitute'],
['ifac','HL 5.18','Integrating factor','dy/dx + P(x)y = Q(x), I = e^∫P'],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Euler tables, solvers and checks on one page']);
Object.assign(LAB.SECNAME,{limits:'Limits & first principles',lhop:"L'Hôpital's rule",diff:'Differentiation rules',tangent:'Tangents & normals',curve:'Stationary points & inflexion',optim:'Optimisation',implicit:'Implicit & related rates',integ:'Integration',tech:'Integration techniques',area:'Areas',volume:'Volumes of revolution',kinem:'Kinematics',maclaurin:'Maclaurin series',euler:'Modelling & Euler',sep:'Separation of variables',homog:'Homogeneous (y = vx)',ifac:'Integrating factor'});

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

/* ---------- extra helpers for the differentiation and integration topics ---------- */
const {rgba}=LAB;
const SUPD=['','','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰'];
const pT=(cs,v='x')=>{const n=cs.length-1;return lin(cs,cs.map((_,i)=>{const d=n-i;return d===0?'':d===1?v:v+SUPD[d];}));};
const nd=(f,x,h=1e-5)=>(f(x+h)-f(x-h))/(2*h);
const nd2=(f,x,h=1e-3)=>(f(x+h)-2*f(x)+f(x-h))/(h*h);
function simp(f,a,b,n){n=n||2000;if(n%2)n++;const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=f(a+i*h)*(i%2?4:2);return s*h/3;}
function bis(f,a,b){let fa=f(a);for(let i=0;i<80;i++){const m=(a+b)/2,fm_=f(m);if((fm_<0)===(fa<0)){a=m;fa=fm_;}else b=m;}return (a+b)/2;}
/* every sign change (or touch) of f on [a, b] */
function zeros(f,a,b,n){n=n||600;const out=[];let px=a,py=f(a);for(let i=1;i<=n;i++){const x=a+(b-a)*i/n,y=f(x);if(isFinite(py)&&isFinite(y)){if(py===0)out.push(px);else if((py<0)!==(y<0)&&Math.abs(py-y)<1e3)out.push(bis(f,px,x));}px=x;py=y;}
return out.filter((v,i)=>i===0||Math.abs(v-out[i-1])>1e-6);}
const PIF=k=>{const g=LAB.gcd(Math.abs(k),12)||1,n=k/g,d=12/g;if(k===0)return '0';return (n<0?'−':'')+(Math.abs(n)===1?'':Math.abs(n))+'π'+(d===1?'':'/'+d);};
/* a plot whose y-range gives equal units on both axes, so perpendicular lines look perpendicular */
/* the smallest equal-scale window that contains the box [x0, x1] × [y0, y1] */
function fitWin(cvEl,x0,x1,y0,y1){const w=cvEl.clientWidth||300,pw=Math.max(120,w-46),ph=CV_H-34,u=Math.min(pw/(x1-x0),ph/(y1-y0)),xc=(x0+x1)/2,yc=(y0+y1)/2,hx=pw/u/2,hy=ph/u/2;return {x0:xc-hx,x1:xc+hx,y0:yc-hy,y1:yc+hy};}
function eqWin(cvEl,x0,x1,yc){const w=cvEl.clientWidth||300,span=(x1-x0)*(CV_H-34)/Math.max(120,w-46);return {x0,x1,y0:yc-span/2,y1:yc+span/2};}
/* shade between top(x) and bot(x) on [a, b] */
function band(S,top,bot,a,b,col){const ctx=S.ctx,n=160;ctx.fillStyle=col;ctx.beginPath();
for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;const y=top(x);i?ctx.lineTo(S.X(x),S.Y(y)):ctx.moveTo(S.X(x),S.Y(y));}
for(let i=n;i>=0;i--){const x=a+(b-a)*i/n;ctx.lineTo(S.X(x),S.Y(bot(x)));}ctx.closePath();ctx.fill();}
function lineThrough(S,x,y,m,col,lw,dash){const W=S.W;S.poly([[W.x0,y+m*(W.x0-x)],[W.x1,y+m*(W.x1-x)]],col,lw||2,dash);}
const fr=(n,d)=>{if(d<0){n=-n;d=-d;}return LAB.frac(n,d).replace('-',MIN);};
const cf=c=>c===1?'':c===-1?MIN:N(c);
const bx=r=>r===0?'x':`(x ${r<0?'+':MIN} ${Math.abs(r)})`;
/* negative numbers in generated text get a proper minus sign */
const fixMinus=t=>String(t).replace(/(^|[\s(=,:×÷+\[>\/])-(?=[\d.a-zπ(√])/g,'$1'+MIN);
const eqLine=(m,x,y)=>{const c=cl(y-m*x);const mm=Math.abs(m)<1e-12?0:m;return 'y = '+(mm===0?fm(c):(Math.abs(mm-1)<1e-12?'':Math.abs(mm+1)<1e-12?MIN:fm(mm))+'x'+(Math.abs(c)<1e-9?'':` ${c<0?MIN:'+'} ${fm(Math.abs(c))}`));};

/* ===== Limits, continuity and first principles ===== */
(function(){
const H=[1.5,1,0.5,0.2,0.1,0.01,-0.01,-0.1,-0.5,-1];
const F={
sq:{t:'x²',f:x=>x*x,d:a=>2*a,ok:()=>true,win:[-3,3,-1.5,7],simp:(a,h)=>`2a + h = ${fm(2*a+h)}`,fp:['(f(a + h) − f(a)) ÷ h = ((a + h)² − a²) ÷ h','= (2ah + h²) ÷ h = 2a + h','As h → 0, f′(a) = 2a'],c:'X²'},
cube:{t:'x³',f:x=>x*x*x,d:a=>3*a*a,ok:()=>true,win:[-2.5,2.5,-6,6],simp:(a,h)=>`3a² + 3ah + h² = ${fm(3*a*a+3*a*h+h*h)}`,fp:['((a + h)³ − a³) ÷ h','= (3a²h + 3ah² + h³) ÷ h = 3a² + 3ah + h²','As h → 0, f′(a) = 3a²'],c:'X^3'},
sqrt:{t:'√x',f:x=>x<0?NaN:Math.sqrt(x),d:a=>0.5/Math.sqrt(a),ok:a=>a>0,win:[-0.5,4.5,-0.8,2.6],simp:(a,h)=>a+h<0?'a + h < 0: √ undefined':`1 ÷ (√(a + h) + √a) = ${fm(1/(Math.sqrt(a+h)+Math.sqrt(a)))}`,fp:['(√(a + h) − √a) ÷ h','multiply top and bottom by √(a + h) + √a: h ÷ (h(√(a + h) + √a))','= 1 ÷ (√(a + h) + √a) → 1 ÷ (2√a)'],c:'√X',bad:'choose a > 0: at 0 the tangent is vertical, and for a < 0, √a is undefined'},
inv:{t:'1/x',f:x=>Math.abs(x)<1e-9?NaN:1/x,d:a=>-1/(a*a),ok:a=>a!==0,win:[-3,3,-4,4],simp:(a,h)=>a+h===0?'a + h = 0: undefined':`−1 ÷ (a(a + h)) = ${fm(-1/(a*(a+h)))}`,fp:['(1/(a + h) − 1/a) ÷ h','= (a − (a + h)) ÷ (ha(a + h)) = −1 ÷ (a(a + h))','As h → 0, f′(a) = −1/a²'],c:'1÷X',bad:'1/x is not defined at x = 0, so it cannot be continuous or differentiable there'},
abs:{t:'|x|',f:x=>Math.abs(x),d:a=>a===0?NaN:Math.sign(a),ok:()=>true,win:[-3,3,-1,4],simp:(a,h)=>a===0?`|h| ÷ h = ${h>0?'1':'−1'}  (h ${h>0?'>':'<'} 0)`:`= ${fm((Math.abs(a+h)-Math.abs(a))/h)}`,fp:['At a = 0: (|0 + h| − 0) ÷ h = |h| ÷ h','= 1 from the right, −1 from the left','The two one-sided limits differ, so f′(0) does not exist'],c:'Abs X'}
};
let key='sq';
presets('#limits-pre',[['sq','x²'],['cube','x³'],['sqrt','√x'],['inv','1/x'],['abs','|x|']],k=>{key=k;draw();},'sq');
const R=ctrls('#limits-ctrls','lm-',[
{head:'Point of tangency'},
{id:'a',label:'a',min:-2,max:2,step:0.5,val:1},
{head:'Second point at a + h'},
{id:'hi',label:'h',min:0,max:9,step:1,val:1,fmt:i=>N(H[i])}
],()=>draw());
readout('#limits-ro',[['lmS','secant gradient (f(a + h) − f(a)) ÷ h'],['lmF','simplified'],['lmD','f′(a), the limit as h → 0',1],['lmG','secant − tangent'],['lmN','differentiable at a?']]);
function draw(){
R.sync();const [a,hi]=vals(R,'a','hi');const h=H[hi],P=F[key],f=P.f;const [x0,x1,y0,y1]=P.win;
const S=plot($('#limits-cv'),{x0,x1,y0,y1});S.clip();
S.poly(sample(f,x0,x1,500),tok('ink'),2.2);
const ok=P.ok(a),fa=f(a),fb=f(a+h),ms=(fb-fa)/h,d=P.d(a);
if(ok&&isFinite(fb)){lineThrough(S,a,fa,ms,tok('accent'),2);S.dot(a+h,fb,tok('accent'),4.5);S.label(a+h,fb,'a + h',tok('accent'));}
if(ok&&isFinite(d))lineThrough(S,a,fa,d,tok('good'),2,[6,4]);
if(key==='abs'&&a===0){lineThrough(S,0,0,1,tok('amber'),1.5,[3,4]);lineThrough(S,0,0,-1,tok('amber'),1.5,[3,4]);}
if(isFinite(fa))S.dot(a,fa,tok('ink'),5);S.unclip();
if(!ok){put('lmS','–');put('lmF',P.bad);put('lmD','–');put('lmG','–');put('lmN','no');}
else{put('lmS',isFinite(fb)?d6(ms):'–');put('lmF',P.simp(a,h));put('lmD',isFinite(d)?fm(d):'does not exist: left and right limits are −1 and 1');put('lmG',isFinite(d)&&isFinite(fb)?d6(ms-d):'–');
put('lmN',isFinite(d)?'yes':'no: continuous, but there is a corner');}
const sx=N(a);
gdc('limits',`Run-Matrix: OPTN → CALC → d/dx(${P.c}, ${sx})${key==='abs'&&a===0?' gives 0, which is wrong: the calculator averages both sides':''}`,`MATH 8:nDeriv(${P.c.replace('Abs X','abs(X)').replace('^3','³')}, X, ${sx})${key==='abs'&&a===0?' gives 0, which is wrong: it averages both sides':''}`);
work('limits',[`f(x) = ${P.t}, a = ${sx}, h = ${N(h)}`].concat(P.fp));
}
DRAW.limits=draw;
})();

/* ===== L'Hôpital's rule ===== */
(function(){
const D=[-1,-0.5,-0.1,-0.01,0.01,0.1,0.5,1];
const F={
s3:{t:'sin 3x ÷ x',a:0,f:x=>Math.sin(3*x),g:x=>x,L:3,ft:'sin 3x',gt:'x',steps:['Check: sin 0 = 0 and 0 = 0, so 0/0','Differentiate top and bottom: 3 cos 3x ÷ 1','At x = 0: 3 cos 0 ÷ 1 = 3'],n:1,cf:'sin(3X)÷X'},
ex:{t:'(eˣ − 1) ÷ x',a:0,f:x=>Math.exp(x)-1,g:x=>x,L:1,ft:'eˣ − 1',gt:'x',steps:['Check: e⁰ − 1 = 0 and 0, so 0/0','Differentiate: eˣ ÷ 1','At x = 0: e⁰ = 1'],n:1,cf:'(e^X−1)÷X'},
cs:{t:'(1 − cos x) ÷ x²',a:0,f:x=>1-Math.cos(x),g:x=>x*x,L:0.5,ft:'1 − cos x',gt:'x²',steps:['Check: 1 − cos 0 = 0 and 0² = 0, so 0/0','Differentiate: sin x ÷ 2x, still 0/0 at x = 0','Differentiate again: cos x ÷ 2','At x = 0: 1 ÷ 2 = ½'],n:2,cf:'(1−cos X)÷X²'},
ln:{t:'ln x ÷ (x − 1)',a:1,f:x=>x>0?Math.log(x):NaN,g:x=>x-1,L:1,ft:'ln x',gt:'x − 1',steps:['Check: ln 1 = 0 and 1 − 1 = 0, so 0/0','Differentiate: (1/x) ÷ 1','At x = 1: 1'],n:1,cf:'ln X÷(X−1)'}
};
let key='s3';
presets('#lhop-pre',[['s3','sin 3x / x'],['ex','(eˣ − 1)/x'],['cs','(1 − cos x)/x²'],['ln','ln x/(x − 1)']],k=>{key=k;draw();},'s3');
const R=ctrls('#lhop-ctrls','lh-',[
{head:'Distance from the limit point'},
{id:'di',label:'x − a',min:0,max:7,step:1,val:5,fmt:i=>N(D[i])}
],()=>draw());
readout('#lhop-ro',[['lhX','x'],['lhF','top f(x)'],['lhG','bottom g(x)'],['lhQ','f(x) ÷ g(x)',1],['lhL','limit by L\'Hôpital',1],['lhN','applications needed']]);
function draw(){
R.sync();const d=D[+R.di.value],P=F[key],a=P.a,x=a+d;
const x0=a-2.2,x1=a+2.2;
const q=t=>{const gv=P.g(t);return Math.abs(gv)<1e-9?NaN:P.f(t)/gv;};
const S=plot($('#lhop-cv'),{x0:Math.max(x0,key==='ln'?0:x0),x1,y0:-2.5,y1:4});S.clip();
S.poly(sample(P.f,x0,x1,400),tok('accent'),2);S.poly(sample(P.g,x0,x1,400),tok('amber'),2);
S.poly(sample(q,x0,x1,800),tok('good'),2.6);
S.poly([[a,-2.5],[a,4]],tok('muted'),1,[3,4]);
S.dot(a,P.L,tok('good'),5);
const qx=q(x);S.dot(x,qx,tok('ink'),4);S.label(x,qx,'f/g = '+d6(qx),tok('ink'));S.unclip();
put('lhX',N(cl(x)));put('lhF',d6(P.f(x)));put('lhG',d6(P.g(x)));put('lhQ',d6(qx));put('lhL',fm(P.L));put('lhN',String(P.n));
gdc('lhop',`Graph: Y1 = ${P.cf}, TABLE with X = ${N(a)} ± 0.001 to check the limit`,`Y1 = ${P.cf.replace('ln X','ln(X)').replace('cos X','cos(X)')}, TABLE (2nd GRAPH) near X = ${N(a)}`);
work('lhop',[`lim x→${N(a)} of ${P.t}`].concat(P.steps));
}
DRAW.lhop=draw;
})();

/* ===== Differentiation rules ===== */
(function(){
const F={
prod:{t:'x²e^(−x)',f:x=>x*x*Math.exp(-x),d:x=>(2*x-x*x)*Math.exp(-x),rule:'product: (uv)′ = u′v + uv′',parts:'u = x², v = e^(−x); u′ = 2x, v′ = −e^(−x)',dt:'2xe^(−x) − x²e^(−x) = (2x − x²)e^(−x)',win:[-1,5,-0.8,1.6],c:'X²e^(−X)'},
quot:{t:'x ÷ (x² + 1)',f:x=>x/(x*x+1),d:x=>(1-x*x)/(x*x+1)**2,rule:'quotient: (u/v)′ = (u′v − uv′) ÷ v²',parts:'u = x, v = x² + 1; u′ = 1, v′ = 2x',dt:'((x² + 1) − 2x²) ÷ (x² + 1)² = (1 − x²) ÷ (x² + 1)²',win:[-4,4,-1.2,1.4],c:'X÷(X²+1)'},
chain:{t:'ln(x² + 1)',f:x=>Math.log(x*x+1),d:x=>2*x/(x*x+1),rule:'chain: dy/dx = dy/du × du/dx',parts:'u = x² + 1, y = ln u; dy/du = 1/u, du/dx = 2x',dt:'(1 ÷ (x² + 1)) × 2x = 2x ÷ (x² + 1)',win:[-4,4,-1.5,3],c:'ln(X²+1)'},
atan:{t:'arctan 2x',f:x=>Math.atan(2*x),d:x=>2/(1+4*x*x),rule:'chain with a booklet derivative: d/dx arctan x = 1 ÷ (1 + x²)',parts:'u = 2x, y = arctan u; dy/du = 1 ÷ (1 + u²), du/dx = 2',dt:'2 ÷ (1 + 4x²)',win:[-3,3,-2,2.4],c:'tan⁻¹(2X)'}
};
let key='prod';
presets('#diff-pre',[['prod','x²e^(−x)'],['quot','x/(x² + 1)'],['chain','ln(x² + 1)'],['atan','arctan 2x']],k=>{key=k;draw();},'prod');
const R=ctrls('#diff-ctrls','df-',[{head:'Point'},{id:'a',label:'x = a',min:-3,max:4,step:0.25,val:1}],()=>draw());
readout('#diff-ro',[['dfR','rule'],['dfP','pieces'],['dfD','f′(x)',1],['dfV','f′(a) from the formula',1],['dfN','numerical check']]);
function draw(){
R.sync();const P=F[key];const [x0,x1,y0,y1]=P.win;const a=clamp(+R.a.value,x0+0.1,x1-0.1);
const S=plot($('#diff-cv'),{x0,x1,y0,y1});S.clip();
S.poly(sample(P.f,x0,x1,400),tok('accent'),2.6);S.poly(sample(P.d,x0,x1,400),tok('amber'),2,[6,4]);
const fa=P.f(a),da=P.d(a);lineThrough(S,a,fa,da,tok('good'),1.8);
S.dot(a,fa,tok('accent'),5);S.dot(a,da,tok('amber'),5);S.poly([[a,fa],[a,da]],tok('muted'),1,[2,3]);S.label(a,da,"f′(a)",tok('amber'));S.unclip();
put('dfR',P.rule);put('dfP',P.parts);put('dfD',P.dt);put('dfV',fm(da));put('dfN',d6(nd(P.f,a)));
gdc('diff',`Run-Matrix: OPTN → CALC → d/dx(${P.c}, ${N(a)}) = ${d6(da)}`,`MATH 8:nDeriv(${P.c.replace('tan⁻¹','tan⁻¹').replace('ln(','ln(')}, X, ${N(a)}) = ${d6(da)}`);
work('diff',[`f(x) = ${P.t}. Use the ${P.rule}.`,P.parts,`f′(x) = ${P.dt}`,`f′(${N(a)}) = ${fm(da)}: the height of the dashed f′ curve equals the slope of f.`]);
}
DRAW.diff=draw;
})();

/* ===== Tangents, normals, increasing and decreasing ===== */
(function(){
const F={
cub:{t:'x³ − 3x',f:x=>x**3-3*x,d:x=>3*x*x-3,dom:[-2.5,2.5],dt:'3x² − 3',c:'X^3−3X'},
xe:{t:'xe^(−x)',f:x=>x*Math.exp(-x),d:x=>(1-x)*Math.exp(-x),dom:[-1,5],dt:'(1 − x)e^(−x)',c:'Xe^(−X)'},
ln:{t:'ln x',f:x=>x>0?Math.log(x):NaN,d:x=>1/x,dom:[0.2,5],dt:'1/x',c:'ln X'},
sin:{t:'sin x',f:Math.sin,d:Math.cos,dom:[-3.2,3.2],dt:'cos x',c:'sin X'}
};
let key='cub';
presets('#tangent-pre',[['cub','x³ − 3x'],['xe','xe^(−x)'],['ln','ln x'],['sin','sin x']],k=>{key=k;R.a.min=F[k].dom[0];R.a.max=F[k].dom[1];if(+R.a.value<F[k].dom[0]||+R.a.value>F[k].dom[1])R.a.value=(F[k].dom[0]+F[k].dom[1])/2;draw();},'cub');
const R=ctrls('#tangent-ctrls','tn-',[{head:'Point on the curve'},{id:'a',label:'x = a',min:-2.5,max:2.5,step:0.1,val:1.5}],()=>draw());
readout('#tangent-ro',[['tnP','point (a, f(a))'],['tnM','gradient f′(a)'],['tnT','tangent',1],['tnN','normal',1],['tnI','f at a']]);
function draw(){
R.sync();const P=F[key],a=+R.a.value,fa=P.f(a),m=P.d(a);
const cvEl=$('#tangent-cv'),W=fitWin(cvEl,a-3.5,a+3.5,fa-3,fa+3);const S=plot(cvEl,W);S.clip();
/* colour the curve by the sign of f′ */
const n=500;let seg=[],sgn=null;const flush=()=>{if(seg.length>1)S.poly(seg,tok(sgn>0?'good':'bad'),3);};
for(let i=0;i<=n;i++){const x=W.x0+(W.x1-W.x0)*i/n,y=P.f(x),s=P.d(x)>=0?1:-1;if(!isFinite(y)){flush();seg=[];continue;}if(sgn!==null&&s!==sgn){seg.push([x,y]);flush();seg=[[x,y]];}else seg.push([x,y]);sgn=s;}flush();
lineThrough(S,a,fa,m,tok('accent'),2);
if(Math.abs(m)>1e-9)lineThrough(S,a,fa,-1/m,tok('amber'),2,[6,4]);else S.poly([[a,W.y0],[a,W.y1]],tok('amber'),2,[6,4]);
S.dot(a,fa,tok('ink'),5);S.unclip();
put('tnP',`(${fm(a)}, ${fm(fa)})`);put('tnM',fm(m));put('tnT',eqLine(m,a,fa));
put('tnN',Math.abs(m)<1e-9?`x = ${fm(a)} (vertical)`:eqLine(-1/m,a,fa)+`  (gradient ${fm(-1/m)})`);
put('tnI',Math.abs(m)<1e-6?'stationary: f′(a) = 0':m>0?'increasing: f′(a) > 0':'decreasing: f′(a) < 0');
gdc('tangent',`Graph: Y1 = ${P.c}, SHIFT F5 G-SOLVE → dy/dx needs Derivative: On in SET UP; or Run-Matrix d/dx(${P.c}, ${fm(a)})`,`Y1 = ${P.c.replace('ln X','ln(X)').replace('sin X','sin(X)')}, CALC → 6:dy/dx at X = ${fm(a)}; or DRAW → 5:Tangent(`);
work('tangent',[`f′(x) = ${P.dt}, so m = f′(${fm(a)}) = ${fm(m)}`,`Tangent: y − ${par(+fm(fa))} = ${fm(m)}(x − ${par(+fm(a))}) ⇒ ${eqLine(m,a,fa)}`,Math.abs(m)<1e-9?'Normal: vertical line through the point':`Normal gradient = −1 ÷ m = ${fm(-1/m)} ⇒ ${eqLine(-1/m,a,fa)}`]);
}
DRAW.tangent=draw;
})();

/* ===== Stationary points, concavity and inflexion: f, f′, f″ stacked ===== */
(function(){
const F={
cub:{t:'x³ − 3x²',f:x=>x**3-3*x*x,d:x=>3*x*x-6*x,d2:x=>6*x-6,w:[-1.5,3.5],dt:'3x² − 6x',d2t:'6x − 6'},
qrt:{t:'x⁴ − 4x³',f:x=>x**4-4*x**3,d:x=>4*x**3-12*x*x,d2:x=>12*x*x-24*x,w:[-1.5,4.3],dt:'4x³ − 12x²',d2t:'12x² − 24x'},
xe:{t:'xe^(−x)',f:x=>x*Math.exp(-x),d:x=>(1-x)*Math.exp(-x),d2:x=>(x-2)*Math.exp(-x),w:[-1,6],dt:'(1 − x)e^(−x)',d2t:'(x − 2)e^(−x)'},
x3:{t:'x³',f:x=>x**3,d:x=>3*x*x,d2:x=>6*x,w:[-2,2],dt:'3x²',d2t:'6x'}
};
let key='cub';
presets('#curve-pre',[['cub','x³ − 3x²'],['qrt','x⁴ − 4x³'],['xe','xe^(−x)'],['x3','x³']],k=>{key=k;draw();},'cub');
const R=ctrls('#curve-ctrls','cu-',[{head:'Probe'},{id:'a',label:'x = a',min:0,max:100,step:1,val:30,fmt:v=>fm(cl(Math.round((F[key].w[0]+(F[key].w[1]-F[key].w[0])*v/100)*20)/20))}],()=>draw());
readout('#curve-ro',[['cuS','sign of f′(a), f″(a)'],['cuC','shape at a',1],['cuSP','stationary points',1],['cuIP','points of inflexion',1]]);
function nature(P,x){const e=1e-3,l=P.d(x-e),r=P.d(x+e);if(l>0&&r<0)return 'max';if(l<0&&r>0)return 'min';return 'stationary inflexion';}
function draw(){
R.sync();const P=F[key],[x0,x1]=P.w,a=cl(Math.round((x0+(x1-x0)*(+R.a.value)/100)*20)/20);
const cvEl=$('#curve-cv'),{ctx,w,h}=prep(cvEl,420);
const L=40,Rp=10,bands=[{fn:P.f,col:'accent',name:'f(x)'},{fn:P.d,col:'amber',name:'f′(x)'},{fn:P.d2,col:'good',name:'f″(x)'}];
const bh=(h-24)/3,X=x=>L+(x-x0)/(x1-x0)*(w-L-Rp);
const sp=zeros(P.d,x0,x1),ip=zeros(P.d2,x0,x1).filter(x=>{const e=1e-3;return (P.d2(x-e)<0)!==(P.d2(x+e)<0);});
bands.forEach((B,bi)=>{const top=bi*bh+4,bot=top+bh-8;let lo=Infinity,hi=-Infinity;for(let i=0;i<=200;i++){const y=B.fn(x0+(x1-x0)*i/200);if(isFinite(y)){lo=Math.min(lo,y);hi=Math.max(hi,y);}}
if(hi-lo<1e-6){lo-=1;hi+=1;}const pad=(hi-lo)*0.1;lo-=pad;hi+=pad;const Y=y=>bot-(y-lo)/(hi-lo)*(bot-top);
ctx.strokeStyle=tok('faint');ctx.lineWidth=1;ctx.strokeRect(L,top,w-L-Rp,bot-top);
if(lo<0&&hi>0){ctx.strokeStyle=tok('muted');ctx.beginPath();ctx.moveTo(L,Y(0));ctx.lineTo(w-Rp,Y(0));ctx.stroke();}
/* where this band is positive */
if(bi>0){ctx.fillStyle=rgba('good',0.10);for(let i=0;i<200;i++){const xa=x0+(x1-x0)*i/200,xb=x0+(x1-x0)*(i+1)/200;if(B.fn((xa+xb)/2)>0)ctx.fillRect(X(xa),top,X(xb)-X(xa)+0.5,bot-top);}}
ctx.strokeStyle=tok(B.col);ctx.lineWidth=2.4;ctx.beginPath();for(let i=0;i<=400;i++){const x=x0+(x1-x0)*i/400,y=B.fn(x);i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();
ctx.fillStyle=tok('muted');ctx.font=`11px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(B.name,L+6,top+4);
sp.forEach(s=>{ctx.fillStyle=tok('accent');ctx.beginPath();ctx.arc(X(s),Y(B.fn(s)),bi===0?5:3,0,7);ctx.fill();});
ip.forEach(s=>{ctx.strokeStyle=tok('good');ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(s),Y(B.fn(s)),bi===0?5:3,0,7);ctx.stroke();});
ctx.fillStyle=tok('ink');ctx.beginPath();ctx.arc(X(a),Y(B.fn(a)),3.5,0,7);ctx.fill();
});
ctx.setLineDash([4,4]);ctx.strokeStyle=tok('muted');ctx.lineWidth=1;sp.concat(ip).forEach(s=>{ctx.beginPath();ctx.moveTo(X(s),4);ctx.lineTo(X(s),h-22);ctx.stroke();});ctx.setLineDash([]);
ctx.strokeStyle=tok('ink');ctx.beginPath();ctx.moveTo(X(a),4);ctx.lineTo(X(a),h-22);ctx.stroke();
ctx.fillStyle=tok('muted');ctx.font=`10px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='top';const st=niceStep(x1-x0,6);for(let g=Math.ceil(x0/st)*st;g<=x1+1e-9;g+=st)ctx.fillText(fm(cl(g)),X(g),h-18);
const d1=P.d(a),d2=P.d2(a),sg_=v=>Math.abs(v)<1e-9?'0':v>0?'+':'−';
put('cuS',`f′ ${sg_(d1)},  f″ ${sg_(d2)}`);
put('cuC',(Math.abs(d1)<1e-9?'stationary, ':d1>0?'increasing, ':'decreasing, ')+(Math.abs(d2)<1e-9?'f″ = 0 here':d2>0?'concave up':'concave down'));
put('cuSP',sp.map(s=>`${nature(P,s)} at (${fm(s)}, ${fm(P.f(s))})`).join('; ')||'none');
put('cuIP',ip.map(s=>`(${fm(s)}, ${fm(P.f(s))})`).join('; ')||'none');
gdc('curve',`Graph: Y1 = f, SHIFT F5 G-SOLVE → MAX / MIN; Y2 = d/dx(Y1, X) and ROOT for f′ = 0`,`Y1 = f, CALC → 3:minimum / 4:maximum; Y2 = nDeriv(Y1, X, X) and 2:zero for f′ = 0`);
work('curve',[`f(x) = ${P.t}, f′(x) = ${P.dt}, f″(x) = ${P.d2t}`,`Stationary points: solve f′(x) = 0 → x = ${sp.map(fm).join(', ')||'none'}`,`Nature: sign of f″, or the sign of f′ either side if f″ = 0`,`Inflexion: f″ = 0 AND f″ changes sign → x = ${ip.map(fm).join(', ')||'none'}`]);
}
DRAW.curve=draw;
})();

/* ===== Optimisation ===== */
(function(){
const F={
box:{name:'open box from a square card',p:'card side L',pr:[6,30,12],xl:'cut x',obj:'volume V',f:(L,x)=>x*(L-2*x)**2,dom:L=>[0,L/2],opt:L=>L/6,ft:'V = x(L − 2x)²',dt:'V′ = (L − 2x)(L − 6x)',ot:'x = L/6'},
fence:{name:'rectangle against a wall',p:'fence length P',pr:[10,100,40],xl:'depth x',obj:'area A',f:(P,x)=>x*(P-2*x),dom:P=>[0,P/2],opt:P=>P/4,ft:'A = x(P − 2x)',dt:'A′ = P − 4x',ot:'x = P/4'},
can:{name:'closed can of fixed volume',p:'volume V',pr:[100,1000,330],xl:'radius r',obj:'surface area S',f:(V,r)=>2*Math.PI*r*r+2*V/r,dom:V=>[0.5,2.2*Math.cbrt(V/(2*Math.PI))],opt:V=>Math.cbrt(V/(2*Math.PI)),ft:'h = V/(πr²), S = 2πr² + 2V/r',dt:'S′ = 4πr − 2V/r²',ot:'r = ∛(V/(2π))',min:true}
};
let key='box';
presets('#optim-pre',[['box','Open box'],['fence','Fence'],['can','Can']],k=>{key=k;const P=F[k];R.p.min=P.pr[0];R.p.max=P.pr[1];R.p.value=P.pr[2];R.p.step=k==='can'?10:1;draw();},'box');
const R=ctrls('#optim-ctrls','op-',[{head:'Fixed quantity'},{id:'p',label:'parameter',min:6,max:30,step:1,val:12},{head:'Your choice'},{id:'t',label:'position in the allowed range',min:2,max:98,step:1,val:30,fmt:v=>v+'%'}],()=>draw());
readout('#optim-ro',[['opX','dimension'],['opV','objective'],['opD','derivative here'],['opO','optimum',1],['opB','best value',1]]);
function draw(){
R.sync();const P=F[key],p=+R.p.value,[d0,d1]=P.dom(p),x=d0+(d1-d0)*(+R.t.value)/100,g=t=>P.f(p,t),xo=P.opt(p),vo=g(xo);
const pts=sample(g,d0+1e-3,d1,300),[ya,yb]=autoY([pts],P.min?0:-1,P.min?vo*4:vo*1.2+1,1);
const S=plot($('#optim-cv'),{x0:0,x1:d1*1.02,y0:P.min?0:Math.min(0,ya),y1:P.min?Math.min(yb,vo*3):yb});S.clip();
S.poly(pts,tok('accent'),2.6);S.poly([[xo,S.W.y0],[xo,vo]],tok('good'),1.5,[5,4]);S.dot(xo,vo,tok('good'),5.5);
lineThrough(S,x,g(x),nd(g,x),tok('amber'),1.5,[3,4]);S.dot(x,g(x),tok('ink'),5);S.unclip();
put('opX',`${P.xl} = ${fm(x)}`);put('opV',`${P.obj} = ${fm(g(x))}`);put('opD',fm(nd(g,x))+(Math.abs(nd(g,x))<0.02*Math.max(1,Math.abs(vo))?' ≈ 0':''));
put('opO',`${P.ot} = ${fm(xo)}`);put('opB',`${P.min?'minimum':'maximum'} ${P.obj} = ${fm(vo)}`);
const cf=key==='box'?`X(${p}−2X)²`:key==='fence'?`X(${p}−2X)`:`2πX²+${2*p}÷X`;
gdc('optim',`Graph: Y1 = ${cf}, View Window x 0 to ${fm(d1)}, G-SOLVE → ${P.min?'MIN':'MAX'}`,`Y1 = ${cf}, WINDOW Xmin 0 Xmax ${fm(d1)}, CALC → ${P.min?'3:minimum':'4:maximum'}`);
work('optim',[`${P.name}, ${P.p} = ${p}`,`Objective: ${P.ft}`,`Differentiate: ${P.dt}. Set to 0: ${P.ot} = ${fm(xo)}`,`Check it is a ${P.min?'minimum':'maximum'}: the sign of the derivative goes ${P.min?'− then +':'+ then −'} (or use the second derivative)`,`${P.min?'Minimum':'Maximum'} ${P.obj} = ${fm(vo)}`]);
}
DRAW.optim=draw;
})();

/* ===== Implicit differentiation ===== */
(function(){
const F={
circ:{t:'x² + y² = 25',ys:x=>{const q=25-x*x;if(q<-1e-9)return [NaN,NaN];const r=Math.sqrt(Math.max(0,q));return [r,-r];},dy:(x,y)=>-x/y,dt:'2x + 2y dy/dx = 0 ⇒ dy/dx = −x/y',xr:[-5,5]},
ell:{t:'x²/9 + y²/4 = 1',ys:x=>{const q=4*(1-x*x/9);if(q<-1e-9)return [NaN,NaN];const r=Math.sqrt(Math.max(0,q));return [r,-r];},dy:(x,y)=>-4*x/(9*y),dt:'2x/9 + (2y/4) dy/dx = 0 ⇒ dy/dx = −4x/(9y)',xr:[-3,3]},
hyp:{t:'xy = 4',ys:x=>Math.abs(x)<1e-9?[NaN,NaN]:[4/x,4/x],dy:(x,y)=>-y/x,dt:'y + x dy/dx = 0 ⇒ dy/dx = −y/x',xr:[-6,6]},
rot:{t:'x² + xy + y² = 7',ys:x=>{const q=28-3*x*x;if(q<-1e-9)return [NaN,NaN];const r=Math.sqrt(Math.max(0,q));return [(-x+r)/2,(-x-r)/2];},dy:(x,y)=>-(2*x+y)/(x+2*y),dt:'2x + y + x dy/dx + 2y dy/dx = 0 ⇒ dy/dx = −(2x + y) ÷ (x + 2y)',xr:[-Math.sqrt(28/3),Math.sqrt(28/3)]}
};
let key='circ';
presets('#implicit-pre',[['circ','x² + y² = 25'],['ell','x²/9 + y²/4 = 1'],['hyp','xy = 4'],['rot','x² + xy + y² = 7']],k=>{key=k;draw();},'circ');
const R=ctrls('#implicit-ctrls','im-',[{head:'Point on the curve'},{id:'t',label:'position across',min:1,max:99,step:1,val:70,fmt:v=>v+'%'},{id:'br',label:'branch',min:0,max:1,step:1,val:0,fmt:v=>v?'lower':'upper'}],()=>draw());
readout('#implicit-ro',[['imP','point (x, y)'],['imD','differentiate',1],['imM','gradient here',1],['imT','tangent'],['imH','special tangents']]);
function draw(){
R.sync();const P=F[key],[xa,xb]=P.xr;let x=xa+(xb-xa)*(+R.t.value)/100;if(key==='hyp'&&Math.abs(x)<0.3)x=0.3;const br=+R.br.value;
const y=P.ys(x)[key==='hyp'?0:br],m=P.dy(x,y);
const cvEl=$('#implicit-cv'),W=fitWin(cvEl,-7,7,-6.5,6.5);const S=plot(cvEl,W);S.clip();
if(key==='hyp'){[0].forEach(b=>{const pts=[];for(let i=0;i<=800;i++){const xx=W.x0+(W.x1-W.x0)*i/800;const yy=P.ys(xx)[b];pts.push(isFinite(yy)&&Math.abs(xx)>0.05?[xx,yy]:null);}S.poly(pts,tok('accent'),2.6);});}
else{/* closed curve: upper branch left to right, lower branch back, with points bunched at the ends */const N_=600,xs=[];for(let i=0;i<=N_;i++)xs.push(xa+(xb-xa)*(1-Math.cos(Math.PI*i/N_))/2);xs[0]=xa;xs[N_]=xb;
const loop=xs.map(xx=>[xx,P.ys(xx)[0]]).concat(xs.slice().reverse().map(xx=>[xx,P.ys(xx)[1]]));S.poly(loop,tok('accent'),2.6);}
if(isFinite(m))lineThrough(S,x,y,m,tok('amber'),2);else S.poly([[x,W.y0],[x,W.y1]],tok('amber'),2);
S.dot(x,y,tok('ink'),5);S.unclip();
put('imP',`(${fm(x)}, ${fm(y)})`);put('imD',P.dt);put('imM',isFinite(m)?fm(m):'undefined: vertical tangent');put('imT',isFinite(m)?eqLine(m,x,y):`x = ${fm(x)}`);
put('imH',key==='circ'?'horizontal at x = 0, vertical at y = 0':key==='ell'?'horizontal at (0, ±2), vertical at (±3, 0)':key==='hyp'?'none: the gradient is always negative':'horizontal where y = −2x, vertical where x = −2y');
gdc('implicit','No implicit graphing in Graph mode: substitute the point into your dy/dx by hand, then check with d/dx of an explicit branch',"Can't graph implicitly: solve for y where possible (one branch per Y=) and use CALC → 6:dy/dx to check");
work('implicit',[`Differentiate every term with respect to x. Each y-term gets a dy/dx (chain rule).`,P.dt,`At (${fm(x)}, ${fm(y)}): dy/dx = ${isFinite(m)?fm(m):'undefined'}`]);
}
DRAW.implicit=draw;
})();

/* ===== Integration: Riemann sums and the fundamental theorem ===== */
(function(){
const F={
sq:{t:'x²',f:x=>x*x,F:x=>x**3/3,Ft:'x³/3',r:[-1,3],a:0,b:2,c:'X²'},
sin:{t:'sin x',f:Math.sin,F:x=>-Math.cos(x),Ft:'−cos x',r:[0,6.3],a:0,b:3.1,c:'sin X'},
exp:{t:'e^(x/2)',f:x=>Math.exp(x/2),F:x=>2*Math.exp(x/2),Ft:'2e^(x/2)',r:[-2,3],a:0,b:2,c:'e^(X÷2)'},
cub:{t:'x³ − 4x',f:x=>x**3-4*x,F:x=>x**4/4-2*x*x,Ft:'x⁴/4 − 2x²',r:[-2.5,2.5],a:-2,b:2,c:'X^3−4X'}
};
const RULE=['left','midpoint','right'];
let key='sq';
presets('#integ-pre',[['sq','x²'],['sin','sin x'],['exp','e^(x/2)'],['cub','x³ − 4x']],k=>{key=k;const P=F[k];R.a.min=R.b.min=P.r[0];R.a.max=R.b.max=P.r[1];R.a.value=P.a;R.b.value=P.b;draw();},'sq');
const R=ctrls('#integ-ctrls','ig-',[{head:'Limits'},{id:'a',label:'a',min:-1,max:3,step:0.1,val:0},{id:'b',label:'b',min:-1,max:3,step:0.1,val:2},{head:'Rectangles'},{id:'n',label:'n',min:2,max:64,step:1,val:6},{id:'rule',label:'height from',min:0,max:2,step:1,val:1,fmt:i=>RULE[i]}],()=>draw());
readout('#integ-ro',[['igA','antiderivative F(x)'],['igS','sum of rectangles'],['igE','exact F(b) − F(a)',1],['igD','error'],['igT','total area (counting below as +)']]);
function draw(){
R.sync();const P=F[key];let a=+R.a.value,b=+R.b.value;const n=+R.n.value,ru=+R.rule.value;
const [x0,x1]=P.r;const pts=sample(P.f,x0,x1,400),[ya,yb]=autoY([pts],-20,30,2);
const S=plot($('#integ-cv'),{x0,x1,y0:Math.min(ya,-0.3),y1:yb});S.clip();
const dx=(b-a)/n;let sum=0;const ctx=S.ctx;
for(let i=0;i<n;i++){const xl=a+i*dx,xs=xl+dx*[0,0.5,1][ru],hgt=P.f(xs);sum+=hgt*dx;
ctx.fillStyle=rgba(hgt>=0?'good':'bad',0.22);ctx.strokeStyle=tok(hgt>=0?'good':'bad');ctx.lineWidth=1;
const X0=S.X(xl),X1=S.X(xl+dx),Y0=S.Y(0),Y1=S.Y(hgt);ctx.fillRect(Math.min(X0,X1),Math.min(Y0,Y1),Math.abs(X1-X0),Math.abs(Y1-Y0));ctx.strokeRect(Math.min(X0,X1),Math.min(Y0,Y1),Math.abs(X1-X0),Math.abs(Y1-Y0));}
S.poly(pts,tok('accent'),2.6);S.unclip();
const ex=P.F(b)-P.F(a),tot=simp(x=>Math.abs(P.f(x)),Math.min(a,b),Math.max(a,b),4000)*(b>=a?1:1);
put('igA',P.Ft+' + c');put('igS',d6(sum));put('igE',d6(ex));put('igD',d6(ex-sum));put('igT',d6(tot)+(Math.abs(tot-Math.abs(ex))>1e-6?'  (differs: part is below the axis)':''));
gdc('integ',`Run-Matrix: OPTN → CALC → ∫dx(${P.c}, ${fm(a)}, ${fm(b)}) = ${d6(ex)}`,`MATH 9:fnInt(${P.c.replace('sin X','sin(X)')}, X, ${fm(a)}, ${fm(b)}) = ${d6(ex)}`);
work('integ',[`∫ ${P.t} dx = ${P.Ft} + c (check: differentiate it back)`,`∫ from ${fm(a)} to ${fm(b)} = F(${fm(a)===fm(b)?'b':fm(b)}) − F(${fm(a)}) = ${d6(P.F(b))} − ${parD(P.F(a))} = ${d6(ex)}`,`${n} ${RULE[ru]} rectangles give ${d6(sum)}. More rectangles → closer.`]);
}
DRAW.integ=draw;
})();

/* ===== Integration by parts, drawn as areas ===== */
(function(){
const F={
xe:{t:'xeˣ',u:t=>t,v:t=>Math.exp(t),ut:'x',dvt:'eˣ dx',vt:'eˣ',dut:'dx',t0:0,tr:[0.2,2],target:'∫ xeˣ dx',ans:b=>b*Math.exp(b)-Math.exp(b)+1,ant:'xeˣ − eˣ + c',vdu:b=>Math.exp(b)-1,c:'Xe^X'},
ln:{t:'ln x',u:t=>Math.log(t),v:t=>t,ut:'ln x',dvt:'dx',vt:'x',dut:'(1/x) dx',t0:1,tr:[1.2,6],target:'∫ ln x dx',ans:b=>b*Math.log(b)-b+1,ant:'x ln x − x + c',vdu:b=>b-1,c:'ln X'},
xc:{t:'x cos x',u:t=>t,v:t=>Math.sin(t),ut:'x',dvt:'cos x dx',vt:'sin x',dut:'dx',t0:0,tr:[0.2,1.57],target:'∫ x cos x dx',ans:b=>b*Math.sin(b)+Math.cos(b)-1,ant:'x sin x + cos x + c',vdu:b=>1-Math.cos(b),c:'Xcos X'}
};
let key='xe';
presets('#tech-pre',[['xe','xeˣ'],['ln','ln x'],['xc','x cos x']],k=>{key=k;const P=F[k];R.b.min=P.tr[0];R.b.max=P.tr[1];R.b.value=(P.tr[0]+P.tr[1])/2;draw();},'xe');
const R=ctrls('#tech-ctrls','tc-',[{head:'Upper limit'},{id:'b',label:'x = b',min:0.2,max:2,step:0.01,val:1.2}],()=>draw());
readout('#tech-ro',[['tcC','choose'],['tcR','rectangle [uv]'],['tcV','∫ v du (under the curve)'],['tcU','∫ u dv = [uv] − ∫ v du',1],['tcA','antiderivative',1]]);
function draw(){
R.sync();const P=F[key],b=+R.b.value,t0=P.t0;
const ub=P.u(b),vb=P.v(b),ua=P.u(t0),va=P.v(t0);
const S=plot($('#tech-cv'),{x0:-0.1*Math.max(ub,1),x1:Math.max(ub,1)*1.15,y0:-0.1*Math.max(vb,1),y1:Math.max(vb,1)*1.15});S.clip();
const ctx=S.ctx,N_=200,pts=[];for(let i=0;i<=N_;i++){const t=t0+(b-t0)*i/N_;pts.push([P.u(t),P.v(t)]);}
ctx.fillStyle=rgba('accent',0.18);ctx.beginPath();ctx.moveTo(S.X(ua),S.Y(0));pts.forEach(p=>ctx.lineTo(S.X(p[0]),S.Y(p[1])));ctx.lineTo(S.X(ub),S.Y(0));ctx.closePath();ctx.fill();
ctx.fillStyle=rgba('amber',0.28);ctx.beginPath();ctx.moveTo(S.X(0),S.Y(va));pts.forEach(p=>ctx.lineTo(S.X(p[0]),S.Y(p[1])));ctx.lineTo(S.X(0),S.Y(vb));ctx.closePath();ctx.fill();
if(ua!==0||va!==0){ctx.fillStyle=rgba('muted',0.15);ctx.fillRect(S.X(0),S.Y(va),S.X(ua)-S.X(0),S.Y(0)-S.Y(va));}
S.poly([[0,vb],[ub,vb],[ub,0]],tok('muted'),1.2,[4,4]);S.poly(pts,tok('ink'),2.6);S.dot(ub,vb,tok('ink'),4.5);
S.label(ub*0.55,vb*0.18,'∫ v du',tok('accent'),0,0);S.label(ub*0.08,vb*0.82,'∫ u dv',tok('amber'),0,0);S.unclip();
const vdu=P.vdu(b),uv=ub*vb-ua*va,udv=uv-vdu;
put('tcC',`u = ${P.ut}, dv = ${P.dvt}  ⇒  du = ${P.dut}, v = ${P.vt}`);put('tcR',`${fm(ub)} × ${fm(vb)}${ua*va?` − ${fm(ua*va)}`:''} = ${d6(uv)}`);put('tcV',d6(vdu));put('tcU',`${d6(udv)}  (direct: ${d6(P.ans(b))})`);put('tcA',P.ant);
gdc('tech',`Run-Matrix: ∫dx(${P.c}, ${fm(t0)}, ${fm(b)}) = ${d6(P.ans(b))} checks your antiderivative`,`fnInt(${P.c.replace('ln X','ln(X)').replace('cos X','cos(X)')}, X, ${fm(t0)}, ${fm(b)}) = ${d6(P.ans(b))}`);
work('tech',[`${P.target}: u = ${P.ut}, dv = ${P.dvt}`,`∫ u dv = uv − ∫ v du. The amber area plus the blue area is the whole rectangle uv.`,`So ${P.target} = ${P.ant}`,`From ${fm(t0)} to ${fm(b)}: ${d6(P.ans(b))}`]);
}
DRAW.tech=draw;
})();

/* ===== Areas ===== */
(function(){
const F={
pl:{t:'x² and x + 2',f:x=>x+2,g:x=>x*x,ft:'x + 2',gt:'x²',r:[-2.5,3],a:-1,b:2,c:['X+2','X²']},
cub:{t:'x³ − 4x and the x-axis',f:x=>x**3-4*x,g:()=>0,ft:'x³ − 4x',gt:'0',r:[-2.6,2.6],a:-2,b:2,c:['X^3−4X','0']},
rt:{t:'√x and x/2',f:x=>x<0?NaN:Math.sqrt(x),g:x=>x/2,ft:'√x',gt:'x/2',r:[0,5],a:0,b:4,c:['√X','X÷2']},
sc:{t:'sin x and cos x',f:Math.sin,g:Math.cos,ft:'sin x',gt:'cos x',r:[0,6.3],a:0.785,b:3.927,c:['sin X','cos X']}
};
let key='pl';
presets('#area-pre',[['pl','x² & x + 2'],['cub','x³ − 4x'],['rt','√x & x/2'],['sc','sin & cos']],k=>{key=k;const P=F[k];R.a.min=R.b.min=P.r[0];R.a.max=R.b.max=P.r[1];R.a.value=P.a;R.b.value=P.b;draw();},'pl');
const R=ctrls('#area-ctrls','ar-',[{head:'Limits'},{id:'a',label:'from x =',min:-2.5,max:3,step:0.005,val:-1},{id:'b',label:'to x =',min:-2.5,max:3,step:0.005,val:2}],()=>draw());
readout('#area-ro',[['arI','curves meet at x ='],['arS','∫ (f − g) dx, signed'],['arA','area ∫ |f − g| dx',1],['arN','note']]);
function draw(){
R.sync();const P=F[key];let a=+R.a.value,b=+R.b.value;if(a>b)[a,b]=[b,a];
const [x0,x1]=P.r,fp=sample(P.f,x0,x1,400),gp=sample(P.g,x0,x1,400),[ya,yb]=autoY([fp,gp],-10,12,2);
const S=plot($('#area-cv'),{x0,x1,y0:ya,y1:yb});S.clip();
const diff=x=>P.f(x)-P.g(x);
const ctx=S.ctx,n=300;for(let i=0;i<n;i++){const xa=a+(b-a)*i/n,xb=a+(b-a)*(i+1)/n,xm=(xa+xb)/2,f=P.f(xm),g=P.g(xm);if(!isFinite(f))continue;ctx.fillStyle=rgba(f>=g?'good':'bad',0.25);const top=Math.max(f,g),bot=Math.min(f,g);ctx.fillRect(S.X(xa),S.Y(top),S.X(xb)-S.X(xa)+0.6,S.Y(bot)-S.Y(top));}
S.poly(fp,tok('accent'),2.6);S.poly(gp,tok('amber'),2.6);
const ints=zeros(diff,x0+1e-6,x1,800).concat(key==='rt'?[0]:[]).sort((p,q)=>p-q);ints.forEach(x=>S.dot(x,P.f(x),tok('ink'),4));S.unclip();
const sgn=simp(diff,a,b,4000),ar=simp(x=>Math.abs(diff(x)),a,b,6000);
const inside=ints.filter(x=>x>a+1e-6&&x<b-1e-6);
put('arI',ints.map(fm).join(', ')||'none in view');put('arS',d6(sgn));put('arA',d6(ar));
put('arN',inside.length?`the curves cross at x = ${inside.map(fm).join(', ')} inside your limits: split there, or the signed integral cancels`:'no crossing inside your limits: area = |signed integral|');
gdc('area',`Run-Matrix: ∫dx(Abs (${P.c[0]}−(${P.c[1]})), ${fm(a)}, ${fm(b)}) = ${d6(ar)}`,`fnInt(abs(${P.c[0].replace(/sin X/,'sin(X)')}−(${P.c[1].replace(/cos X/,'cos(X)')})), X, ${fm(a)}, ${fm(b)}) = ${d6(ar)}`);
work('area',[`f(x) = ${P.ft}, g(x) = ${P.gt}`,`Intersections: solve f(x) = g(x) → x = ${ints.map(fm).join(', ')}`,`Area = ∫ from ${fm(a)} to ${fm(b)} of |f − g| dx = ${d6(ar)}`,inside.length?`Without the modulus, the regions either side of x = ${inside.map(fm).join(', ')} cancel: signed total ${d6(sgn)}`:'']);
}
DRAW.area=draw;
})();

/* ===== Volumes of revolution ===== */
(function(){
const F={
rt:{t:'y = √x about the x-axis',r:x=>x<0?NaN:Math.sqrt(x),ax:'x',r2t:'x',V:b=>Math.PI*b*b/2,Vt:'π[x²/2]',lim:[0.2,4],c:'(√X)²'},
sq:{t:'y = x² about the x-axis',r:x=>x*x,ax:'x',r2t:'x⁴',V:b=>Math.PI*b**5/5,Vt:'π[x⁵/5]',lim:[0.2,1.6],c:'(X²)²'},
sin:{t:'y = sin x about the x-axis',r:Math.sin,ax:'x',r2t:'sin²x',V:b=>Math.PI*(b/2-Math.sin(2*b)/4),Vt:'π[x/2 − sin 2x/4]',lim:[0.2,3.14],c:'(sin X)²'},
ry:{t:'y = x² about the y-axis',r:y=>y<0?NaN:Math.sqrt(y),ax:'y',r2t:'y',V:b=>Math.PI*b*b/2,Vt:'π[y²/2]',lim:[0.2,4],c:'X'}
};
let key='rt';
presets('#volume-pre',[['rt','√x, x-axis'],['sq','x², x-axis'],['sin','sin x, x-axis'],['ry','x², y-axis']],k=>{key=k;const P=F[k];R.b.min=P.lim[0];R.b.max=P.lim[1];R.b.value=P.lim[1]*0.75;R.s.value=50;draw();},'rt');
const R=ctrls('#volume-ctrls','vo-',[{head:'Region'},{id:'b',label:'upper limit',min:0.2,max:4,step:0.01,val:3},{head:'Slice'},{id:'s',label:'slice position',min:1,max:99,step:1,val:50,fmt:v=>v+'%'}],()=>draw());
readout('#volume-ro',[['voR','radius of this slice'],['voA','slice area πr²'],['voI','volume integral',1],['voV','volume',1]]);
function draw(){
R.sync();const P=F[key],b=+R.b.value,s=b*(+R.s.value)/100,rad=P.r(s);
const cvEl=$('#volume-cv');let S;
if(P.ax==='x'){let top=0;for(let i=0;i<=100;i++){const v=P.r(b*i/100);if(isFinite(v))top=Math.max(top,v);}top=top*1.2+0.2;const W={x0:-0.3,x1:b+0.6,y0:-top,y1:top};S=plot(cvEl,W);S.clip();
band(S,P.r,x=>0,0,b,rgba('accent',0.22));band(S,x=>0,x=>-P.r(x),0,b,rgba('accent',0.08));
S.poly(sample(P.r,0,b,300),tok('accent'),2.6);S.poly(sample(x=>-P.r(x),0,b,300),tok('accent'),1.4,[5,4]);
const ctx=S.ctx;ctx.fillStyle=rgba('amber',0.45);ctx.strokeStyle=tok('amber');ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(S.X(s),S.Y(0),Math.max(3,Math.abs(S.Y(rad)-S.Y(0))*0.28),Math.abs(S.Y(rad)-S.Y(0)),0,0,7);ctx.fill();ctx.stroke();
}else{const W=fitWin(cvEl,-Math.sqrt(b)*1.6,Math.sqrt(b)*1.6,-0.3,b+0.4);S=plot(cvEl,W);S.clip();
const ctx=S.ctx;ctx.fillStyle=rgba('accent',0.22);ctx.beginPath();ctx.moveTo(S.X(0),S.Y(0));for(let i=0;i<=200;i++){const y=b*i/200;ctx.lineTo(S.X(Math.sqrt(y)),S.Y(y));}ctx.lineTo(S.X(0),S.Y(b));ctx.closePath();ctx.fill();
S.poly(sample(x=>x*x,-Math.sqrt(b),Math.sqrt(b),300),tok('accent'),2.6);S.poly([[-Math.sqrt(b),b],[Math.sqrt(b),b]],tok('muted'),1.2,[4,4]);
ctx.fillStyle=rgba('amber',0.45);ctx.strokeStyle=tok('amber');ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(S.X(0),S.Y(s),Math.abs(S.X(rad)-S.X(0)),Math.max(3,Math.abs(S.X(rad)-S.X(0))*0.28),0,0,7);ctx.fill();ctx.stroke();}
S.unclip();
const V=P.V(b);put('voR',`${P.ax==='x'?'y':'x'} at ${P.ax} = ${fm(s)}: ${fm(rad)}`);put('voA',fm(Math.PI*rad*rad));put('voI',`π ∫ from 0 to ${fm(b)} of ${P.r2t} d${P.ax} = ${P.Vt}`);put('voV',`${fm(V)}  (= ${fm(V/Math.PI)}π)`);
gdc('volume',`Run-Matrix: π × ∫dx(${P.c}, 0, ${fm(b)}) = ${d6(V)}`,`π × fnInt(${P.c.replace('sin X','sin(X)')}, X, 0, ${fm(b)}) = ${d6(V)}`);
work('volume',[`${P.t}: each slice is a disc of radius ${P.ax==='x'?'y':'x'} and thickness d${P.ax}`,`V = π ∫ ${P.ax==='x'?'y²':'x²'} d${P.ax} = π ∫ from 0 to ${fm(b)} of ${P.r2t} d${P.ax}`,`= ${P.Vt} from 0 to ${fm(b)} = ${fm(V)}`]);
}
DRAW.volume=draw;
})();

/* ===== Kinematics ===== */
(function(){
const F={
q:{t:'t² − 4t + 3',v:t=>t*t-4*t+3,a:t=>2*t-4,at:'2t − 4',s:t=>t**3/3-2*t*t+3*t,st:'t³/3 − 2t² + 3t',c:'X²−4X+3'},
cub:{t:'t³ − 6t² + 9t',v:t=>t**3-6*t*t+9*t,a:t=>3*t*t-12*t+9,at:'3t² − 12t + 9',s:t=>t**4/4-2*t**3+4.5*t*t,st:'t⁴/4 − 2t³ + 4.5t²',c:'X^3−6X²+9X'},
sin:{t:'3 sin t',v:t=>3*Math.sin(t),a:t=>3*Math.cos(t),at:'3 cos t',s:t=>3-3*Math.cos(t),st:'3 − 3 cos t',c:'3sin X'},
ex:{t:'10e^(−t/2) − 4',v:t=>10*Math.exp(-t/2)-4,a:t=>-5*Math.exp(-t/2),at:'−5e^(−t/2)',s:t=>20-20*Math.exp(-t/2)-4*t,st:'20 − 20e^(−t/2) − 4t',c:'10e^(−X÷2)−4'}
};
let key='q';
presets('#kinem-pre',[['q','t² − 4t + 3'],['cub','t³ − 6t² + 9t'],['sin','3 sin t'],['ex','10e^(−t/2) − 4']],k=>{key=k;draw();},'q');
const R=ctrls('#kinem-ctrls','kn-',[{head:'Time'},{id:'T',label:'t',min:0,max:6,step:0.05,val:4}],()=>draw());
readout('#kinem-ro',[['knV','velocity v(t)'],['knA','acceleration a(t) = v′(t)'],['knS','displacement ∫ v dt from 0',1],['knD','distance ∫ |v| dt from 0',1],['knM','motion']]);
function draw(){
R.sync();const P=F[key],T=+R.T.value;
const pts=sample(P.v,0,6,400),[ya,yb]=autoY([pts],-15,25,3);
const S=plot($('#kinem-cv'),{x0:0,x1:6,y0:Math.min(ya,-0.5),y1:yb});S.clip();
const ctx=S.ctx,n=300;for(let i=0;i<n;i++){const ta=T*i/n,tb=T*(i+1)/n,v=P.v((ta+tb)/2);ctx.fillStyle=rgba(v>=0?'good':'bad',0.28);ctx.fillRect(S.X(ta),Math.min(S.Y(v),S.Y(0)),S.X(tb)-S.X(ta)+0.6,Math.abs(S.Y(v)-S.Y(0)));}
S.poly(pts,tok('accent'),2.6);S.dot(T,P.v(T),tok('ink'),5);
zeros(P.v,0.001,6).forEach(t=>{S.dot(t,0,tok('amber'),4);});S.unclip();
/* particle on a line */
const lc=$('#kinem-line'),{ctx:c2,w}=prep(lc,64);const sMin=Math.min(0,...Array.from({length:121},(_,i)=>P.s(i*0.05)))-0.5,sMax=Math.max(0,...Array.from({length:121},(_,i)=>P.s(i*0.05)))+0.5;
const SX=s=>20+(s-sMin)/(sMax-sMin)*(w-40);c2.strokeStyle=tok('muted');c2.lineWidth=1.5;c2.beginPath();c2.moveTo(10,40);c2.lineTo(w-10,40);c2.stroke();
c2.fillStyle=tok('muted');c2.font=`10px ${MONO}`;c2.textAlign='center';c2.fillText('O',SX(0),58);c2.beginPath();c2.moveTo(SX(0),35);c2.lineTo(SX(0),45);c2.stroke();
c2.strokeStyle=rgba('accent',0.5);c2.lineWidth=2;c2.beginPath();for(let i=0;i<=200;i++){const t=T*i/200,yy=40-4-12*i/200;i?c2.lineTo(SX(P.s(t)),yy):c2.moveTo(SX(P.s(t)),yy);}c2.stroke();
c2.fillStyle=tok('accent');c2.beginPath();c2.arc(SX(P.s(T)),40,6,0,7);c2.fill();
const v=P.v(T),a=P.a(T),sd=P.s(T)-P.s(0),dist=simp(t=>Math.abs(P.v(t)),0,Math.max(T,1e-6),3000);
put('knV',fm(v));put('knA',fm(a));put('knS',d6(sd));put('knD',d6(dist));
put('knM',Math.abs(v)<1e-6?'at rest':`moving ${v>0?'right (positive)':'left (negative)'}, ${v*a>0?'speeding up (v and a same sign)':v*a<0?'slowing down (v and a opposite signs)':'constant speed for an instant'}`);
gdc('kinem',`Run-Matrix: ∫dx(Abs (${P.c}), 0, ${fm(T)}) = ${d6(dist)} for distance; drop Abs for displacement`,`fnInt(abs(${P.c.replace('sin X','sin(X)')}), X, 0, ${fm(T)}) = ${d6(dist)} for distance; drop abs for displacement`);
work('kinem',[`v(t) = ${P.t}, a(t) = v′(t) = ${P.at}`,`s(t) = ∫ v dt = ${P.st} + c (c = 0 if s(0) = 0)`,`At rest when v = 0: t = ${zeros(P.v,0.001,6).map(fm).join(', ')||'never in [0, 6]'}`,`Distance = ∫ |v| dt = ${d6(dist)}; displacement = ${d6(sd)}`]);
}
DRAW.kinem=draw;
})();

/* ===== Maclaurin series ===== */
(function(){
const fa=k=>{let r=1;for(let i=2;i<=k;i++)r*=i;return r;};
const F={
exp:{t:'eˣ',f:Math.exp,c:k=>1/fa(k),r:'all x',win:[-3,3,-2,8]},
sin:{t:'sin x',f:Math.sin,c:k=>k%2?((k-1)/2%2?-1:1)/fa(k):0,r:'all x',win:[-6.5,6.5,-3,3]},
cos:{t:'cos x',f:Math.cos,c:k=>k%2?0:((k/2)%2?-1:1)/fa(k),r:'all x',win:[-6.5,6.5,-3,3]},
ln:{t:'ln(1 + x)',f:x=>x<=-1?NaN:Math.log(1+x),c:k=>k===0?0:(k%2?1:-1)/k,r:'−1 < x ≤ 1',win:[-1.5,3,-3,3]},
geo:{t:'1 ÷ (1 − x)',f:x=>Math.abs(1-x)<1e-6?NaN:1/(1-x),c:()=>1,r:'−1 < x < 1',win:[-2.5,2.5,-3,6]}
};
const fr=c=>{if(c===0)return '0';for(let d=1;d<=40320;d++){const n=Math.round(c*d);if(Math.abs(n-c*d)<1e-9)return d===1?String(n):`${n}/${d}`;}return fm(c);};
function polyText(P,n){let s='';for(let k=0;k<=n;k++){const c=P.c(k);if(c===0)continue;const v=k===0?'':k===1?'x':'x'+(SUPD[k]||'^'+k);let a=fr(Math.abs(c));let term;if(a==='1')term=k===0?'1':v;else if(a.includes('/')){const [nn,dd]=a.split('/');term=k===0?a:(nn==='1'?v+'/'+dd:nn+v+'/'+dd);}else term=a+v;
s+=s?` ${c<0?MIN:'+'} ${term}`:(c<0?MIN:'')+term;}return s||'0';}
let key='exp';
presets('#maclaurin-pre',[['exp','eˣ'],['sin','sin x'],['cos','cos x'],['ln','ln(1 + x)'],['geo','1/(1 − x)']],k=>{key=k;draw();},'exp');
const R=ctrls('#maclaurin-ctrls','mc-',[{head:'Polynomial'},{id:'n',label:'up to xⁿ, n =',min:0,max:10,step:1,val:3},{head:'Evaluate'},{id:'x',label:'x',min:-2,max:2,step:0.1,val:0.5}],()=>draw());
readout('#maclaurin-ro',[['mcP','polynomial',1],['mcA','polynomial at x'],['mcT','true value'],['mcE','error',1],['mcR','series valid for']]);
function draw(){
R.sync();const P=F[key],n=+R.n.value,x=+R.x.value;const [x0,x1,y0,y1]=P.win;
const Pn=t=>{let s=0;for(let k=0;k<=n;k++)s+=P.c(k)*t**k;return s;};
const S=plot($('#maclaurin-cv'),{x0,x1,y0,y1});S.clip();
if(key==='ln'||key==='geo'){S.ctx.fillStyle=rgba('good',0.08);S.ctx.fillRect(S.X(-1),S.Y(y1),S.X(1)-S.X(-1),S.Y(y0)-S.Y(y1));}
S.poly(sample(P.f,x0,x1,600),tok('good'),3);S.poly(sample(Pn,x0,x1,600),tok('accent'),2.2);
S.dot(x,Pn(x),tok('accent'),5);if(isFinite(P.f(x)))S.dot(x,P.f(x),tok('good'),5);S.unclip();
const pv=Pn(x),tv=P.f(x);
put('mcP',polyText(P,n));put('mcA',d6(pv));put('mcT',isFinite(tv)?d6(tv):'undefined');put('mcE',isFinite(tv)?d6(tv-pv):'–');put('mcR',P.r+((key==='ln'||key==='geo')&&(x<=-1||x>=1)&&!(key==='ln'&&x===1)?'. This x is outside, so adding terms makes it worse.':''));
gdc('maclaurin',`Graph: Y1 = f, Y2 = polynomial; Run-Matrix Σ(… , X, 0, ${n}) sums the terms`,`Y1 = f, Y2 = polynomial; MATH 0:summation Σ( sums the terms`);
work('maclaurin',[`f(x) = ${P.t}: f(x) = Σ f⁽ᵏ⁾(0) xᵏ ÷ k!`,`Up to the ${n===0?'constant':n===1?'x':'x'+SUPD[n]} term: ${polyText(P,n)}`,`At x = ${N(x)}: ${d6(pv)} vs ${isFinite(tv)?d6(tv):'–'}`]);
}
DRAW.maclaurin=draw;
})();

/* ===== Practice generators ===== */
const rn=(lo,hi)=>{let x=0;do{x=ri(lo,hi);}while(x===0);return x;};
const SUB=['₀','₁','₂','₃','₄','₅'];
const GEN={
limits:[
/* secant gradient */
()=>{const p=rn(-3,3),q=ri(-4,4),a=ri(-2,3),h=pick([0.1,0.01,0.5,0.2]);const f=x=>p*x*x+q*x,ans=(f(a+h)-f(a))/h;
return {q:`For f(x) = ${pT([p,q,0])}, find the gradient of the chord joining the points where x = ${a} and x = ${N(cl(a+h))}.`,ans,
work:[`Gradient = (f(${N(cl(a+h))}) − f(${a})) ÷ ${h}.`,`f(${N(cl(a+h))}) = ${N(cl(f(a+h)))}, f(${a}) = ${N(f(a))}.`,`(${N(cl(f(a+h)))} − ${par(f(a))}) ÷ ${h} = <b>${N(cl(ans))}</b>.`,`From first principles the chord gradient is ${lin([2*p,q,p],['a','','h'])}, which tends to f′(${a}) = ${N(2*p*a+q)} as h → 0.`],
tip:`Chord gradient = (f(a + h) − f(a)) ÷ h. Shrink h and it becomes the derivative.`};},
/* first principles */
()=>{const p=rn(-4,4),q=ri(-6,6),r=ri(-5,5),a=ri(-3,3);const ans=2*p*a+q;
return {q:`Use first principles to find the derivative of f(x) = ${pT([p,q,r])}, and hence find f′(${a}).`,ans,exact:true,
work:[`f(x + h) − f(x) = ${N(p)}(2xh + h²)${q?` ${q<0?MIN:'+'} ${Math.abs(q)===1?'':Math.abs(q)}h`:''}.`,`Divide by h: ${lin([2*p,p,q],['x','h',''])}.`,`Let h → 0: f′(x) = ${lin([2*p,q],['x',''])}.`,`f′(${a}) = <b>${ans}</b>.`],
tip:`The f(x) terms always cancel. Expand, cancel, divide by h, THEN let h → 0.`};},
/* limit by factorising */
()=>{const r=rn(-4,4);let s=rn(-5,5);if(s===r)s=r+1;const ans=r-s;
return {q:`Find lim<sub>x→${r}</sub> (${pT([1,-(r+s),r*s])}) ÷ (x ${r<0?'+':MIN} ${Math.abs(r)}).`,ans,exact:true,
work:[`At x = ${r} the fraction is 0/0, so factorise.`,`${pT([1,-(r+s),r*s])} = (x ${r<0?'+':MIN} ${Math.abs(r)})(x ${s<0?'+':MIN} ${Math.abs(s)}).`,`Cancel the common factor: the limit is ${r} ${s<0?'+':MIN} ${Math.abs(s)} = <b>${ans}</b>.`],
tip:`0/0 from a polynomial means (x − a) is a factor of both top and bottom. Factorise and cancel.`};},
/* continuity */
()=>{const a=pick([2,3,-1,-2,4]),b=ri(-5,6);const ans=(a*a-b)/(a-1);
return {q:`f(x) = kx ${b<0?MIN:'+'} ${Math.abs(b)} for x &lt; ${a}, and f(x) = x² + k for x ≥ ${a}. Find the value of k for which f is continuous.`,ans,
work:[`Continuous at x = ${a}: the two pieces must agree there.`,`${a}k ${b<0?MIN:'+'} ${Math.abs(b)} = ${a*a} + k.`,`${a-1}k = ${a*a-b}, so k = <b>${fr(a*a-b,a-1).replace('-',MIN)}</b>${Number.isInteger(ans)?'':' = '+sf(ans)}.`],
tip:`Continuous ⇒ left piece = right piece at the join.`};},
/* differentiable */
()=>{const a=rn(-3,3),p=ri(-4,5);const m=2*a,q=p-a*a;
return {q:`g(x) = x² ${p<0?MIN:'+'} ${Math.abs(p)} for x ≤ ${a}, and g(x) = mx + q for x &gt; ${a}. Given that g is differentiable at x = ${a}, find q.`,ans:q,exact:true,
work:[`Differentiable ⇒ the gradients match: 2(${a}) = m, so m = ${m}.`,`Differentiable also needs continuity: ${a*a} ${p<0?MIN:'+'} ${Math.abs(p)} = ${m}(${a}) + q.`,`${a*a+p} = ${m*a} + q, so q = <b>${q}</b>.`],
tip:`Differentiable = continuous AND gradients match. Two conditions, two unknowns.`};}
],
lhop:[
()=>{const p=rn(-6,6),q=pick([1,2,3,4,5]);const ans=p/q;
return {q:`Use l'Hôpital's rule to find lim<sub>x→0</sub> sin(${p}x) ÷ ${q===1?'':q}x.`,ans,
work:[`At x = 0: sin 0 = 0 and ${q===1?'':q}×0 = 0, so 0/0.`,`Differentiate top and bottom: ${N(p)} cos(${p}x) ÷ ${q}.`,`At x = 0: <b>${fr(p,q).replace('-',MIN)}</b>.`],tip:`sin(px)/(qx) → p/q. Worth knowing on sight.`};},
()=>{const p=rn(-4,5),q=pick([1,2,3]);const ans=p/q;const e=Math.random()<0.5;
return {q:`Find lim<sub>x→0</sub> ${e?`(e<sup>${p}x</sup> − 1)`:`ln(1 ${p<0?MIN:'+'} ${Math.abs(p)===1?'':Math.abs(p)}x)`} ÷ ${q===1?'':q}x.`,ans,
work:[`Both top and bottom are 0 at x = 0, so l'Hôpital applies.`,e?`Derivatives: ${N(p)}e<sup>${p}x</sup> ÷ ${q}.`:`Derivatives: ${N(p)} ÷ (1 ${p<0?MIN:'+'} ${Math.abs(p)===1?'':Math.abs(p)}x), over ${q}.`,`At x = 0: <b>${fr(p,q).replace('-',MIN)}</b>.`],tip:`Check 0/0 every time before differentiating. If it isn't 0/0, just substitute.`};},
()=>{const p=pick([1,2,3,4,0.5]);const ans=p*p/2;
return {q:`Find lim<sub>x→0</sub> (1 − cos ${N(p)===`1`?'':N(p)}x) ÷ x².`,ans,
work:[`0/0, so differentiate: ${cf(p)}sin ${cf(p)}x ÷ 2x.`,`Still 0/0. Differentiate again: ${cf(cl(p*p))}cos ${cf(p)}x ÷ 2.`,`At x = 0: <b>${sf(ans)}</b>.`],tip:`If you still get 0/0, apply the rule again. (1 − cos px)/x² → p²/2.`};},
()=>{const a=pick([1,2,3,-1]),n=pick([2,3,4,5]);const ans=n*a**(n-1);
return {q:`Find lim<sub>x→${a}</sub> (x${SUPD[n]} − ${N(a**n)}) ÷ (x ${a<0?'+':MIN} ${Math.abs(a)}).`,ans,exact:true,
work:[`At x = ${a}: ${N(a**n)} − ${N(a**n)} = 0 on top and 0 below.`,`Differentiate: ${n}x${SUPD[n-1]||''} ÷ 1.`,`At x = ${a}: ${n} × ${par(a)}${n-1>1?SUPD[n-1]:''} = <b>${ans}</b>.`],tip:`(xⁿ − aⁿ)/(x − a) → naⁿ⁻¹: it is the derivative of xⁿ at a.`};},
()=>{const p=pick([1,2,3,-2]);const ans=p*p/2;
return {q:`Find lim<sub>x→0</sub> (e<sup>${p}x</sup> − 1 ${p<0?'+':MIN} ${Math.abs(p)===1?'':Math.abs(p)}x) ÷ x².`,ans,
work:[`0/0. Differentiate: (${N(p)}e<sup>${p}x</sup> ${p<0?'+':MIN} ${Math.abs(p)}) ÷ 2x. Still 0/0.`,`Again: ${N(p*p)}e<sup>${p}x</sup> ÷ 2.`,`At x = 0: <b>${sf(ans)}</b>.`],tip:`Two applications when the first derivative still gives 0/0. Maclaurin gives the same: eᵖˣ − 1 − px ≈ p²x²/2.`};}
],
diff:[
()=>{const a=rn(-3,4),b=ri(-4,4),n=pick([2,3,4,5]),c=ri(-1,2);const ans=n*a*(a*c+b)**(n-1);
return {q:`Find the gradient of y = (${lin([a,b],['x',''])})${SUPD[n]} at x = ${c}.`,ans,exact:true,
work:[`Chain rule: dy/dx = ${n}(${lin([a,b],['x',''])})${SUPD[n-1]||''} × ${par(a)}.`,`At x = ${c}: ${lin([a,b],['x',''])} = ${a*c+b}.`,`dy/dx = ${n} × ${par(a*c+b)}${n-1>1?SUPD[n-1]:''} × ${par(a)} = <b>${ans}</b>.`],tip:`Power of a bracket: bring the power down, drop it by one, multiply by the derivative of the inside.`};},
()=>{const n=pick([1,2,3]),k=pick([1,-1,2,-2]),c=pick([1,2,0.5]);const ans=Math.exp(k*c)*(n*c**(n-1)+k*c**n);
return {q:`f(x) = x${SUPD[n]||''}e<sup>${kx(k)}</sup>. Find f′(${N(c)}).`,ans,
work:[`Product rule: u = x${SUPD[n]||''}, v = e<sup>${kx(k)}</sup>; u′ = ${n===1?'1':n+'x'+(SUPD[n-1]||'')}, v′ = ${k===1?'':k===-1?MIN:N(k)}e<sup>${kx(k)}</sup>.`,`f′(x) = e<sup>${kx(k)}</sup>(${n===1?'1':n+'x'+(SUPD[n-1]||'')} ${k<0?MIN:'+'} ${Math.abs(k)===1?'':Math.abs(k)}x${SUPD[n]||''}).`,`f′(${N(c)}) = <b>${sf(ans)}</b>.`],tip:`Product with eᵏˣ: factor eᵏˣ out at the end. It never equals zero.`};},
()=>{const a=rn(-3,4),b=ri(-4,4),c=rn(-2,3),d=ri(-3,4),e=ri(-1,2);if(c*e+d===0||a*d-b*c===0)return GEN.diff[2]();const ans=(a*d-b*c)/(c*e+d)**2;
return {q:`Differentiate y = (${lin([a,b],['x',''])}) ÷ (${lin([c,d],['x',''])}) and find dy/dx at x = ${e}.`,ans,
work:[`Quotient rule: u = ${lin([a,b],['x',''])}, v = ${lin([c,d],['x',''])}; u′ = ${a}, v′ = ${c}.`,`dy/dx = (${a}(${lin([c,d],['x',''])}) − ${par(c)}(${lin([a,b],['x',''])})) ÷ (${lin([c,d],['x',''])})² = ${a*d-b*c} ÷ (${lin([c,d],['x',''])})².`,`At x = ${e}: ${a*d-b*c} ÷ ${(c*e+d)**2} = <b>${sf(ans)}</b>.`],tip:`(ax + b)/(cx + d) always differentiates to (ad − bc)/(cx + d)². Low d-high minus high d-low, over low squared.`};},
()=>{const a=pick([1,2,3]),b=pick([1,2,4,5]),c=ri(-2,3);const ans=2*a*c/(a*c*c+b);
return {q:`Find the derivative of y = ln(${a===1?'':a}x² + ${b}) at x = ${c}.`,ans,
work:[`Chain rule: d/dx ln(u) = u′/u.`,`dy/dx = ${2*a}x ÷ (${a===1?'':a}x² + ${b}).`,`At x = ${c}: ${2*a*c} ÷ ${a*c*c+b} = <b>${sf(ans)}</b>.`],tip:`ln of anything: derivative of the inside over the inside.`};},
()=>{const t=pick(['at','as','ax']);
if(t==='at'){const k=pick([1,2,3]),c=pick([1,0.5,2,-1]);const ans=k/(1+k*k*c*c);return {q:`Find d/dx (arctan ${k===1?'':k}x) at x = ${N(c)}.`,ans,work:[`Booklet: d/dx arctan x = 1 ÷ (1 + x²). Chain rule with u = ${k===1?'':k}x.`,`dy/dx = ${k} ÷ (1 + ${k*k===1?'':k*k}x²).`,`At x = ${N(c)}: ${k} ÷ ${N(cl(1+k*k*c*c))} = <b>${sf(ans)}</b>.`],tip:`arctan(kx)′ = k/(1 + k²x²). Don't forget to square the k.`};}
if(t==='as'){const a=pick([2,3,4,5]),c=ri(0,a-1);const ans=1/Math.sqrt(a*a-c*c);return {q:`Find d/dx arcsin(x/${a}) at x = ${c}.`,ans,work:[`Booklet: d/dx arcsin x = 1 ÷ √(1 − x²). Chain rule with u = x/${a}.`,`dy/dx = (1/${a}) ÷ √(1 − x²/${a*a}) = 1 ÷ √(${a*a} − x²).`,`At x = ${c}: 1 ÷ √${a*a-c*c} = <b>${sf(ans)}</b>.`],tip:`arcsin(x/a)′ = 1/√(a² − x²).`};}
const a=pick([2,3,5,10]),c=pick([1,2,0,-1]);const ans=a**c*Math.log(a);return {q:`Find the gradient of y = ${a}ˣ at x = ${c}.`,ans,work:[`Booklet: d/dx aˣ = aˣ ln a.`,`At x = ${c}: ${a}${c===1?'':c===0?'⁰':c===-1?'⁻¹':'²'} × ln ${a}.`,`= <b>${sf(ans)}</b>.`],tip:`aˣ = e^(x ln a), so its derivative picks up a factor ln a.`};},
()=>{const k=pick([1,2,3]),n=pick([1,2,3,4]);const x=n*Math.PI/12,ans=k*Math.sin(2*k*x);
return {q:`Find the derivative of y = sin²(${k===1?'':k}x) at x = ${PIF(n)}.`,ans,
work:[`Chain rule twice: dy/dx = 2 sin(${k===1?'':k}x) × ${k===1?'':k+' '}cos(${k===1?'':k}x).`,`= ${k===1?'':k}sin(${2*k}x), using 2 sin A cos A = sin 2A.`,`At x = ${PIF(n)}: ${k===1?'':k}sin(${PIF(2*k*n)}) = <b>${sf(ans)}</b>.`],tip:`sin²(kx) = (sin(kx))². Outer square first, then sin, then the k. Radians!`};}
],
tangent:[
()=>{const a=rn(-3,3),b=ri(-5,5),c=ri(-6,6),p=rn(-3,3);const ans=c-a*p*p;
return {q:`Find the y-intercept of the tangent to y = ${pT([a,b,c])} at the point where x = ${p}.`,ans,exact:true,
work:[`dy/dx = ${lin([2*a,b],['x',''])}, so at x = ${p} the gradient is ${2*a*p+b}.`,`y(${p}) = ${a*p*p+b*p+c}.`,`Tangent: y − ${par(a*p*p+b*p+c)} = ${2*a*p+b}(x − ${par(p)}).`,`Put x = 0: y = ${a*p*p+b*p+c} − ${par(p*(2*a*p+b))} = <b>${ans}</b>.`],tip:`Gradient from f′, point from f, then y − y₁ = m(x − x₁).`};},
()=>{const a=rn(-2,3),b=rn(-4,4),p=rn(-2,2);const m=3*a*p*p+b;if(m===0)return GEN.tangent[1]();const ans=-1/m;
return {q:`Find the gradient of the normal to y = ${pT([a,0,b,0])} at x = ${p}.`,ans,
work:[`dy/dx = ${lin([3*a,b],['x²',''])}.`,`At x = ${p}: tangent gradient = ${m}.`,`Normal gradient = −1 ÷ ${par(m)} = <b>${fr(-1*Math.sign(m),Math.abs(m)).replace('-',MIN)}</b>.`],tip:`Normal ⊥ tangent: m₁ × m₂ = −1. Flip and change sign.`};},
()=>{const a=rn(-3,3),b=ri(-6,6),c=ri(-5,5),m=ri(-8,8);const ans=(m-b)/(2*a);
return {q:`The curve y = ${pT([a,b,c])} has gradient ${m} at point P. Find the x-coordinate of P.`,ans,
work:[`dy/dx = ${lin([2*a,b],['x',''])}.`,`${lin([2*a,b],['x',''])} = ${m}.`,`x = (${m} − ${par(b)}) ÷ ${2*a} = <b>${fr(m-b,2*a).replace('-',MIN)}</b>.`],tip:`"Gradient is m" ⇒ set f′(x) = m and solve. Parallel to a line ⇒ same m.`};},
()=>{let r1=ri(-4,2),r2=r1+pick([2,4,6]);const A=-1.5*(r1+r2),B=3*r1*r2;
return {q:`f(x) = ${pT([1,A,B,0])}. Given that f is decreasing for a &lt; x &lt; b, find b.`,ans:r2,exact:true,
work:[`f′(x) = ${pT([3,2*A,B])} = 3(${pT([1,-(r1+r2),r1*r2])}).`,`= 3(x ${r1<0?'+':MIN} ${Math.abs(r1)})(x ${r2<0?'+':MIN} ${Math.abs(r2)}).`,`f′ &lt; 0 between the roots: ${r1} &lt; x &lt; ${r2}, so b = <b>${r2}</b>.`],tip:`Decreasing ⇔ f′(x) < 0. For a positive cubic, that is between the roots of f′.`};},
()=>{const k=pick([1,2,-1,0.5]),p=rn(-2,2);const ans=p+2*k*k*p**3;
return {q:`The normal to y = ${kx(k,'x²')} at x = ${p} meets the x-axis at Q. Find the x-coordinate of Q.`,ans,
work:[`dy/dx = ${N(2*k)}x, so the tangent gradient at x = ${p} is ${N(cl(2*k*p))}, and the normal gradient is ${sf(-1/(2*k*p))}.`,`The point is (${p}, ${N(cl(k*p*p))}). Normal: y − ${N(cl(k*p*p))} = ${sf(-1/(2*k*p))}(x − ${par(p)}).`,`Put y = 0: x = ${N(p)} + ${par(cl(2*k*p))} × ${par(cl(k*p*p))} = <b>${N(cl(ans))}</b>.`],tip:`Normal through (x₁, y₁) with gradient −1/m. Meets the x-axis ⇒ set y = 0.`};}
],
curve:[
()=>{let r1=ri(-3,2),r2=r1+pick([2,4]);const A=-1.5*(r1+r2),B=3*r1*r2,d=ri(-5,5);
return {q:`Find the x-coordinate of the local maximum of f(x) = ${pT([1,A,B,d])}.`,ans:r1,exact:true,
work:[`f′(x) = ${pT([3,2*A,B])} = 3(x ${r1<0?'+':MIN} ${Math.abs(r1)})(x ${r2<0?'+':MIN} ${Math.abs(r2)}) = 0 ⇒ x = ${r1} or ${r2}.`,`f″(x) = ${lin([6,2*A],['x',''])}. f″(${r1}) = ${6*r1+2*A} &lt; 0 ⇒ maximum.`,`Local maximum at x = <b>${r1}</b>.`],tip:`Positive cubic: max at the left stationary point, min at the right. f″ < 0 confirms a max.`};},
()=>{let r1=ri(-3,2),r2=r1+pick([2,4]);const A=-1.5*(r1+r2),B=3*r1*r2,d=ri(-5,5);const f=x=>x**3+A*x*x+B*x+d,ans=f(r2);
return {q:`Find the minimum value of f(x) = ${pT([1,A,B,d])} at its local minimum.`,ans,exact:true,
work:[`f′(x) = 3(x ${r1<0?'+':MIN} ${Math.abs(r1)})(x ${r2<0?'+':MIN} ${Math.abs(r2)}), so stationary at x = ${r1}, ${r2}.`,`f″(${r2}) = ${6*r2+2*A} &gt; 0 ⇒ minimum at x = ${r2}.`,`f(${r2}) = <b>${ans}</b>.`],tip:`Find x from f′ = 0, the nature from f″, then the y-value from f, not f′.`};},
()=>{const a=rn(-3,3),b=ri(-9,9),c=ri(-5,5),d=ri(-5,5);const ans=-b/(3*a);
return {q:`Find the x-coordinate of the point of inflexion of y = ${pT([a,b,c,d])}.`,ans,
work:[`y″ = ${lin([6*a,2*b],['x',''])}.`,`y″ = 0 ⇒ x = ${fr(-2*b,6*a).replace('-',MIN)}. y″ is linear, so it changes sign there.`,`x = <b>${sf(ans)}</b>.`],tip:`Every cubic has exactly one inflexion, at x = −b/(3a): halfway between its turning points.`};},
()=>{const k=pick([1,2,3,0.5,4]);const ans=1/(k*Math.E);
return {q:`Find the maximum value of f(x) = xe<sup>${kx(-k)}</sup>.`,ans,
work:[`f′(x) = e<sup>${kx(-k)}</sup>(1 − ${kx(k)}) = 0 ⇒ x = ${sf(1/k)}.`,`f′ goes + to −, so this is a maximum.`,`f(${sf(1/k)}) = ${sf(1/k)}e<sup>−1</sup> = <b>${sf(ans)}</b>.`],tip:`xe^(−kx) peaks at x = 1/k, height 1/(ke). eˣ is never 0, so only the bracket can vanish.`};},
()=>{const a=pick([1,2,-1,0.5]);const ans=2*a;
return {q:`f(x) = x⁴ ${a>0?MIN:'+'} ${N(Math.abs(4*a))}x³. Find the x-coordinate of the point of inflexion that is not a stationary point.`,ans,
work:[`f′(x) = 4x³ ${a>0?MIN:'+'} ${N(Math.abs(12*a))}x² = 4x²(x ${a>0?MIN:'+'} ${N(Math.abs(3*a))}).`,`f″(x) = 12x² ${a>0?MIN:'+'} ${N(Math.abs(24*a))}x = 12x(x ${a>0?MIN:'+'} ${N(Math.abs(2*a))}), zero at x = 0 and x = ${N(2*a)}, changing sign at both.`,`x = 0 also has f′ = 0 (stationary inflexion). The other one: x = <b>${N(2*a)}</b>.`],tip:`Inflexion needs f″ = 0 AND a sign change. If f′ is also 0 there, it's a stationary inflexion.`};}
],
optim:[
()=>{const L=pick([6,9,12,15,18,24,30]);const ans=2*L**3/27;
return {q:`Equal squares of side x cm are cut from the corners of a ${L} cm square card, and the sides are folded up to make an open box. Find the maximum volume.`,ans,
work:[`V = x(${L} − 2x)², for 0 &lt; x &lt; ${L/2}.`,`V′ = (${L} − 2x)(${L} − 6x) = 0 ⇒ x = ${N(L/6)} (x = ${L/2} gives V = 0).`,`V(${N(L/6)}) = ${N(L/6)} × ${N(2*L/3)}² = <b>${sf(ans)}</b> cm³.`],tip:`Square-card box: cut x = L/6, giving V = 2L³/27.`};},
()=>{const P=pick([20,40,60,80,100,120]);const ans=P*P/8;
return {q:`A farmer uses ${P} m of fencing to enclose a rectangle against a long straight wall (no fence along the wall). Find the maximum area.`,ans,
work:[`Two sides of x and one of ${P} − 2x: A = x(${P} − 2x).`,`A′ = ${P} − 4x = 0 ⇒ x = ${N(P/4)}. A″ = −4 &lt; 0, a maximum.`,`A = ${N(P/4)} × ${N(P/2)} = <b>${N(ans)}</b> m².`],tip:`Against a wall, the side parallel to the wall is twice each other side.`};},
()=>{const V=pick([250,330,500,750,1000]);const r=Math.cbrt(V/(2*Math.PI)),ans=2*Math.PI*r*r+2*V/r;
return {q:`A closed cylindrical can holds ${V} cm³. Find the minimum possible surface area.`,ans,
work:[`V = πr²h ⇒ h = ${V}/(πr²). S = 2πr² + 2πrh = 2πr² + ${2*V}/r.`,`S′ = 4πr − ${2*V}/r² = 0 ⇒ r³ = ${V}/(2π) ⇒ r = ${sf(r,4)}.`,`S = 2π(${sf(r,4)})² + ${2*V} ÷ ${sf(r,4)} = <b>${sf(ans)}</b> cm².`,C(`Graph Y1 = 2πX²+${2*V}÷X, G-SOLVE → MIN`,`Y1 = 2πX²+${2*V}/X, CALC → 3:minimum`)],tip:`Use the fixed volume to eliminate h. The best can has h = 2r.`};},
()=>{const S=pick([6,9,12,15,30]);const ans=4*S**3/27;
return {q:`Two positive numbers x and y have sum ${S}. Find the maximum value of xy².`,ans,
work:[`y = ${S} − x, so P = x(${S} − x)².`,`P′ = (${S} − x)(${S} − 3x) = 0 ⇒ x = ${N(S/3)}, y = ${N(2*S/3)}.`,`P = ${N(S/3)} × ${N(2*S/3)}² = <b>${N(ans)}</b>.`],tip:`Use the constraint to get one variable, differentiate, set to 0.`};},
()=>{const a=pick([1,2,3,4,5]);const ans=Math.sqrt(a-0.25);
return {q:`Find the shortest distance from the point (${a}, 0) to the curve y = √x.`,ans,
work:[`D² = (x − ${a})² + (√x)² = ${pT([1,-(2*a-1),a*a])}.`,`d(D²)/dx = 2x − ${2*a-1} = 0 ⇒ x = ${N(a-0.5)}.`,`D² = ${N(a-0.25)}, so D = <b>${sf(ans)}</b>.`],tip:`Minimise D², not D. Same x, and no square root to differentiate.`};}
],
implicit:[
()=>{const T=pick([[3,4,5],[5,12,13],[6,8,10],[8,6,10],[4,3,5]]);const p=T[0]*pick([1,-1]),q=T[1]*pick([1,-1]),r=T[2];const ans=-p/q;
return {q:`Find the gradient of the curve x² + y² = ${r*r} at the point (${p}, ${q}).`,ans,
work:[`Differentiate implicitly: 2x + 2y dy/dx = 0.`,`dy/dx = −x/y.`,`At (${p}, ${q}): −(${p}) ÷ (${q}) = <b>${fr(-p*Math.sign(q),Math.abs(q)).replace('-',MIN)}</b>.`],tip:`Each y-term picks up dy/dx. For a circle centred at O, the tangent ⊥ radius: −x/y.`};},
()=>{const k=rn(-3,3),p=rn(-3,3),q=rn(-3,3);const c=p*p+k*p*q+q*q,den=k*p+2*q;if(den===0)return GEN.implicit[1]();const ans=-(2*p+k*q)/den;
return {q:`The curve x² ${k<0?MIN:'+'} ${Math.abs(k)===1?'':Math.abs(k)}xy + y² = ${c} passes through (${p}, ${q}). Find dy/dx at this point.`,ans,
work:[`Differentiate: 2x ${k<0?MIN:'+'} ${Math.abs(k)===1?'':Math.abs(k)}(y + x dy/dx) + 2y dy/dx = 0. The xy term needs the product rule.`,`dy/dx = −(${lin([2,k],['x','y'])}) ÷ (${lin([k,2],['x','y'])}).`,`At (${p}, ${q}): −(${2*p+k*q}) ÷ ${den} = <b>${sf(ans)}</b>.`],tip:`xy differentiates to y + x dy/dx. Collect the dy/dx terms on one side.`};},
()=>{const Q=pick([10,20,50,100]),R=pick([2,5,10]);const ans=Q/(4*Math.PI*R*R);
return {q:`A spherical balloon is inflated at ${Q} cm³ s⁻¹. Find the rate at which its radius is increasing when the radius is ${R} cm.`,ans,
work:[`V = (4/3)πr³ ⇒ dV/dr = 4πr².`,`dV/dt = dV/dr × dr/dt ⇒ ${Q} = 4π(${R})² dr/dt.`,`dr/dt = ${Q} ÷ (${4*R*R}π) = <b>${sf(ans)}</b> cm s⁻¹.`],tip:`Related rates: write the formula, differentiate with respect to t, substitute the instant LAST.`};},
()=>{const T=pick([[3,4,5],[6,8,10],[5,12,13],[8,6,10],[12,5,13]]),v=pick([0.5,1,2,3]);const [x,y,L]=T,ans=x*v/y;
return {q:`A ${L} m ladder leans against a vertical wall. Its foot slides away from the wall at ${v} m s⁻¹. How fast is the top sliding down the wall when the foot is ${x} m from the wall?`,ans,
work:[`x² + y² = ${L*L}. Differentiate with respect to t: 2x dx/dt + 2y dy/dt = 0.`,`When x = ${x}, y = √(${L*L} − ${x*x}) = ${y}.`,`dy/dt = −(${x} × ${v}) ÷ ${y} = ${sf(-ans)}. Sliding down at <b>${sf(ans)}</b> m s⁻¹.`],tip:`Pythagoras, then d/dt. Find the missing side at the instant before substituting.`};},
()=>{const R=pick([2,3,4,5]),H=pick([6,8,10,12]),Q=pick([2,5,10,12]),h=pick([2,3,4]);const k=(R/H)**2,ans=Q/(Math.PI*k*h*h);
return {q:`Water flows at ${Q} cm³ s⁻¹ into an inverted cone of radius ${R} cm and height ${H} cm. Find the rate at which the depth is rising when the water is ${h} cm deep.`,ans,
work:[`Similar triangles: r = (${fr(R,H)})h, so V = (1/3)π((${fr(R,H)})h)²h = (π/3)(${fr(R*R,H*H)})h³.`,`dV/dh = π(${fr(R*R,H*H)})h². So ${Q} = π(${fr(R*R,H*H)})(${h})² dh/dt.`,`dh/dt = <b>${sf(ans)}</b> cm s⁻¹.`],tip:`Cone: use similar triangles to remove r BEFORE differentiating, so V is in h alone.`};}
],
integ:[
()=>{const p=rn(-3,3),q=ri(-4,4),r=ri(-4,4),a=ri(-2,1),b=a+ri(1,3);const F=x=>p*x**3/3+q*x*x/2+r*x,ans=F(b)-F(a);
return {q:`Find ∫ from ${a} to ${b} of (${pT([p,q,r])}) dx.`,ans,
work:[`Antiderivative: ${lin([p,q,r],['x³/3','x²/2','x'])}.`,`F(${b}) − F(${a}) = ${sf(F(b),5)} − ${par(+sf(F(a),5))}.`,`= <b>${sf(ans)}</b>.`],tip:`Add one to the power, divide by the new power. Upper minus lower.`};},
()=>{const k=pick([1,2,-1,0.5,3]),c=pick([1,2,0.5,3]);const ans=(Math.exp(k*c)-1)/k;
return {q:`Find ∫ from 0 to ${N(c)} of e<sup>${kx(k)}</sup> dx.`,ans,
work:[`∫ e<sup>${kx(k)}</sup> dx = (1/${N(k)})e<sup>${kx(k)}</sup>.`,`= (1/${N(k)})(e<sup>${N(cl(k*c))}</sup> − 1).`,`= <b>${sf(ans)}</b>.`],tip:`∫ eᵏˣ dx = eᵏˣ/k. Divide by the coefficient of x.`};},
()=>{const n=pick([2,3,4]),b=pick([1,2]);const ans=((b*b+1)**(n+1)-1)/(2*(n+1));
return {q:`Find ∫ from 0 to ${b} of x(x² + 1)${SUPD[n]} dx.`,ans,
work:[`The x outside is (half) the derivative of x² + 1: reverse chain rule.`,`∫ x(x² + 1)${SUPD[n]} dx = (x² + 1)${SUPD[n+1]} ÷ ${2*(n+1)}.`,`(${b*b+1}${SUPD[n+1]} − 1) ÷ ${2*(n+1)} = <b>${sf(ans)}</b>.`],tip:`Spot f′(x) × (f(x))ⁿ. Answer: (f(x))ⁿ⁺¹ ÷ (n + 1), adjusting the constant.`};},
()=>{const k=ri(1,5),m=ri(-2,4);const A=k*k+m*k;
return {q:`Given that ∫ from 0 to k of (2x ${m<0?MIN:'+'} ${Math.abs(m)}) dx = ${A} and k &gt; 0, find k.`,ans:k,exact:true,
work:[`[${lin([1,m],['x²','x'])}] from 0 to k = ${lin([1,m],['k²','k'])}.`,`${lin([1,m,-A],['k²','k',''])} = 0.`,`Factorise or use the formula; k &gt; 0 gives k = <b>${k}</b>.`],tip:`Integrate with k as the upper limit, then solve the equation. Reject the root the question rules out.`};},
()=>{const p=rn(-3,3),q=ri(-4,4),x0=ri(-1,1),y0=ri(-3,5),x1=x0+ri(1,3);const ans=y0+p/2*(x1*x1-x0*x0)+q*(x1-x0);
return {q:`f′(x) = ${lin([p,q],['x',''])} and f(${x0}) = ${y0}. Find f(${x1}).`,ans,
work:[`f(x) = ${lin([p/2,q],['x²','x'])} + c.`,`f(${x0}) = ${y0} ⇒ c = ${N(cl(y0-p/2*x0*x0-q*x0))}.`,`f(${x1}) = <b>${N(cl(ans))}</b>.`],tip:`Integrate, then use the given point to find c straight away.`};},
()=>{const a=pick([1,2,3]),b=pick([1,2,4]),c=pick([1,2,3]);const ans=Math.log((a*c+b)/b)/a;
return {q:`Find ∫ from 0 to ${c} of 1 ÷ (${a===1?'':a}x + ${b}) dx.`,ans,
work:[`∫ 1/(ax + b) dx = (1/a) ln|ax + b|.`,`(1/${a})(ln ${a*c+b} − ln ${b}) = (1/${a}) ln(${fr(a*c+b,b)}).`,`= <b>${sf(ans)}</b>.`],tip:`Linear on the bottom ⇒ ln, divided by the coefficient of x.`};}
],
tech:[
()=>{const k=pick([1,2,-1]),b=pick([1,2]);const ans=Math.exp(k*b)*(b/k-1/(k*k))+1/(k*k);
return {q:`Use integration by parts to find ∫ from 0 to ${b} of xe<sup>${kx(k)}</sup> dx.`,ans,
work:[`u = x, dv = e<sup>${kx(k)}</sup> dx ⇒ du = dx, v = e<sup>${kx(k)}</sup>/${N(k)}.`,`∫ = [xe<sup>${kx(k)}</sup>/${N(k)}] − ∫ e<sup>${kx(k)}</sup>/${N(k)} dx = [e<sup>${kx(k)}</sup>(x/${N(k)} − 1/${N(k*k)})].`,`From 0 to ${b}: <b>${sf(ans)}</b>.`],tip:`LIATE: pick u as the one that gets simpler when differentiated. Polynomials before exponentials.`};},
()=>{if(Math.random()<0.5){const b=pick([2,3,4,5]);const ans=b*Math.log(b)-b+1;return {q:`Find ∫ from 1 to ${b} of ln x dx.`,ans,work:[`Write ln x as 1 × ln x. u = ln x, dv = dx ⇒ du = dx/x, v = x.`,`∫ ln x dx = x ln x − ∫ 1 dx = x ln x − x.`,`[x ln x − x] from 1 to ${b} = ${b} ln ${b} − ${b} + 1 = <b>${sf(ans)}</b>.`],tip:`∫ ln x dx: the hidden "× 1" is dv. Result x ln x − x.`};}
const b=pick([2,3,4]);const ans=b*b/2*Math.log(b)-b*b/4+0.25;return {q:`Find ∫ from 1 to ${b} of x ln x dx.`,ans,work:[`u = ln x (log first in LIATE), dv = x dx ⇒ du = dx/x, v = x²/2.`,`∫ = (x²/2) ln x − ∫ x/2 dx = (x²/2) ln x − x²/4.`,`From 1 to ${b}: ${N(b*b/2)} ln ${b} − ${N(b*b/4)} + ¼ = <b>${sf(ans)}</b>.`],tip:`With ln x present, ln x is always u: you can differentiate it but not easily integrate it.`};},
()=>{const p=ri(-3,0),q=p+pick([1,2,3]),a=q+ri(1,2),b=a+ri(1,3);const ans=(Math.log((b-q)/(a-q))-Math.log((b-p)/(a-p)))/(q-p);
return {q:`Find ∫ from ${a} to ${b} of 1 ÷ ((x ${p<0?'+':MIN} ${Math.abs(p)})(x ${q<0?'+':MIN} ${Math.abs(q)})) dx.`.replace('(x − 0)','x').replace('(x + 0)','x'),ans,
work:[`Partial fractions: 1/(${bx(p)}${bx(q)}) = A/${bx(p)} + B/${bx(q)}. x = ${q} gives B = ${fr(1,q-p)}; x = ${p} gives A = ${fr(-1,q-p)}.`,`∫ = ${q-p===1?'':`(${fr(1,q-p)})`}[ln|${bx(q).replace(/[()]/g,'')}| − ln|${bx(p).replace(/[()]/g,'')}|] = ${q-p===1?'':`(${fr(1,q-p)})`}ln|${bx(q)}/${bx(p)}|.`,`From ${a} to ${b}: <b>${sf(ans)}</b>.`],tip:`Cover-up: put x = each root to read off each numerator instantly.`};},
()=>{const a=pick([1,2,3,4]),t=pick([[1,'π/4',Math.PI/4],[Math.sqrt(3),'π/3',Math.PI/3],[1/Math.sqrt(3),'π/6',Math.PI/6]]);const b=a*t[0],bt=t[0]===1?String(a):t[0]>1?`${a===1?'':a}√3`:`${a}/√3`;const ans=t[2]/a;
return {q:`Find ∫ from 0 to ${bt} of 1 ÷ (${a*a} + x²) dx, giving a decimal answer.`,ans,
work:[`Booklet: ∫ 1/(a² + x²) dx = (1/a) arctan(x/a), here a = ${a}.`,`(1/${a})(arctan(${t[0]===1?'1':t[0]>1?'√3':'1/√3'}) − arctan 0) = (1/${a})(${t[1]}).`,`= <b>${sf(ans)}</b>.`],tip:`a² + x² on the bottom ⇒ arctan. Divide by a, and use x/a inside.`};},
()=>{const t=pick([[Math.PI/2,'π/2'],[Math.PI,'π'],[Math.PI/3,'π/3']]);const ans=Math.sin(t[0])-t[0]*Math.cos(t[0]);
return {q:`Find ∫ from 0 to ${t[1]} of x sin x dx.`,ans,
work:[`u = x, dv = sin x dx ⇒ du = dx, v = −cos x.`,`∫ = −x cos x + ∫ cos x dx = −x cos x + sin x.`,`From 0 to ${t[1]}: <b>${sf(ans)}</b>.`],tip:`x times a trig function: u = x, so the x disappears after one step.`};},
()=>{const c=pick([1,4,9,16]),b=pick([1,2,3]);const ans=Math.sqrt(b*b+c)-Math.sqrt(c);
return {q:`Use the substitution u = x² + ${c} to find ∫ from 0 to ${b} of x ÷ √(x² + ${c}) dx.`,ans,
work:[`du = 2x dx, so x dx = du/2. Limits: x = 0 → u = ${c}; x = ${b} → u = ${b*b+c}.`,`∫ from ${c} to ${b*b+c} of (1/2)u<sup>−1/2</sup> du = [√u] from ${c} to ${b*b+c}.`,`= √${b*b+c} − ${Math.sqrt(c)} = <b>${sf(ans)}</b>.`],tip:`Change the limits with the substitution, then you never go back to x.`};}
],
area:[
()=>{const r1=ri(-3,1),r2=r1+ri(1,4);const ans=(r2-r1)**3/6;
return {q:`Find the area enclosed between y = x² and y = ${lin([r1+r2,-r1*r2],['x',''])}.`,ans,
work:[`Intersect: x² = ${lin([r1+r2,-r1*r2],['x',''])} ⇒ ${pT([1,-(r1+r2),r1*r2])} = 0 ⇒ x = ${r1}, ${r2}.`,`The line is above between the roots: area = ∫ from ${r1} to ${r2} of (${lin([r1+r2,-r1*r2],['x',''])} − x²) dx.`,`= <b>${sf(ans)}</b>.`],tip:`Area between curves = ∫ (top − bottom), between the intersection points. (Line and x²: the answer is (gap)³/6.)`};},
()=>{const m=pick([1,2,3]);const c=m*m,ans=4*m**3/3;
return {q:`Find the area of the region enclosed by y = x² and the line y = ${c}.`,ans,
work:[`Intersect: x² = ${c} ⇒ x = ±${m}.`,`Area = ∫ from −${m} to ${m} of (${c} − x²) dx = [${c}x − x³/3].`,`= 2(${c*m} − ${fr(m**3,3)}) = <b>${fr(4*m**3,3)}</b>.`],tip:`Symmetric region: do 0 to m and double.`};},
()=>{const a=pick([1,2,3]);const ans=a**4/2;
return {q:`Find the total area enclosed between y = ${pT([1,0,-a*a,0])} and the x-axis.`,ans,
work:[`Roots: x(x − ${a})(x + ${a}) = 0 ⇒ x = −${a}, 0, ${a}.`,`∫ from −${a} to 0 = ${N(a**4/4)} and ∫ from 0 to ${a} = −${N(a**4/4)}: they cancel if you integrate straight through.`,`Total area = 2 × ${N(a**4/4)} = <b>${N(ans)}</b>.`],tip:`Curve crosses the axis ⇒ split at the roots and add the absolute values. One integral across gives 0 here.`};},
()=>{const m=pick([1,2,3]);const h=m*m,ans=2*m**3/3;
return {q:`The region R is bounded by y = x² (x ≥ 0), the y-axis and the line y = ${h}. Find its area by integrating with respect to y.`,ans,
work:[`x = √y, and y runs from 0 to ${h}.`,`Area = ∫ from 0 to ${h} of √y dy = [(2/3)y<sup>3/2</sup>].`,`= (2/3)(${m**3}) = <b>${sf(ans)}</b>.`],tip:`Area to the y-axis: ∫ x dy, with y-limits.`};},
()=>{const b=pick([1,2,3,0.5]);const ans=Math.exp(b)-1-b;
return {q:`Find the area between y = eˣ, y = 1 and x = ${N(b)}.`,ans,
work:[`eˣ ≥ 1 for x ≥ 0, so the area is ∫ from 0 to ${N(b)} of (eˣ − 1) dx.`,`= [eˣ − x] from 0 to ${N(b)} = e<sup>${N(b)}</sup> − ${N(b)} − 1.`,`= <b>${sf(ans)}</b>.`],tip:`Sketch first: it tells you which curve is on top and where the region starts.`};}
],
volume:[
()=>{const h=pick([1,2,3,4,6]);const ans=Math.PI*h*h/2;
return {q:`The region under y = √x from x = 0 to x = ${h} is rotated 2π about the x-axis. Find the volume.`,ans,
work:[`V = π ∫ y² dx = π ∫ from 0 to ${h} of x dx.`,`= π[x²/2] = ${N(h*h/2)}π.`,`= <b>${sf(ans)}</b>.`],tip:`About the x-axis: V = π∫y² dx. Square y BEFORE integrating.`};},
()=>{const a=pick([1,2,1.5]);const ans=Math.PI*a**5/5;
return {q:`The region between y = x², the x-axis and x = ${N(a)} is rotated 2π about the x-axis. Find the volume.`,ans,
work:[`y² = x⁴. V = π ∫ from 0 to ${N(a)} of x⁴ dx.`,`= π[x⁵/5] = π(${N(cl(a**5))})/5.`,`= <b>${sf(ans)}</b>.`],tip:`(x²)² = x⁴, not x⁴ ÷ 2 or 2x².`};},
()=>{const h=pick([1,2,3,4]);const ans=Math.PI*h*h/2;
return {q:`The region between y = x², the y-axis and y = ${h} is rotated 2π about the y-axis. Find the volume.`,ans,
work:[`About the y-axis: V = π ∫ x² dy, and x² = y.`,`V = π ∫ from 0 to ${h} of y dy = π[y²/2].`,`= ${N(h*h/2)}π = <b>${sf(ans)}</b>.`],tip:`About the y-axis: make x² the subject and use y-limits.`};},
()=>{const k=pick([1,0.5,-1]),b=pick([1,2]);const ans=Math.PI*(Math.exp(2*k*b)-1)/(2*k);
return {q:`The region under y = e<sup>${kx(k)}</sup> from x = 0 to x = ${b} is rotated 2π about the x-axis. Find the volume.`,ans,
work:[`y² = e<sup>${kx(2*k)}</sup>.`,`V = π ∫ from 0 to ${b} of e<sup>${kx(2*k)}</sup> dx = π[e<sup>${kx(2*k)}</sup>/${N(2*k)}].`,`= <b>${sf(ans)}</b>.`],tip:`(eᵏˣ)² = e²ᵏˣ. Square, then integrate.`};},
()=>{const k=pick([1,2,0.5]);const ans=2*Math.PI*k**5/15;
return {q:`The region enclosed by y = ${kx(k)} and y = x² is rotated 2π about the x-axis. Find the volume of the solid.`,ans,
work:[`They meet at x = 0 and x = ${N(k)}. The line is the outer radius, the curve the inner.`,`V = π ∫ from 0 to ${N(k)} of ((${kx(k)})² − (x²)²) dx = π[${N(cl(k*k))}x³/3 − x⁵/5].`,`= <b>${sf(ans)}</b>.`],tip:`Washer: π∫(R² − r²), never π∫(R − r)².`};},
()=>{const b=pick([2,3,4,5]);const ans=Math.PI*(1-1/b);
return {q:`The region under y = 1/x from x = 1 to x = ${b} is rotated 2π about the x-axis. Find the volume.`,ans,
work:[`y² = 1/x². V = π ∫ from 1 to ${b} of x<sup>−2</sup> dx = π[−1/x].`,`= π(1 − 1/${b}).`,`= <b>${sf(ans)}</b>.`],tip:`Write 1/x² as x⁻² to integrate.`};}
],
kinem:[
()=>{const a=rn(-3,3),b=ri(-6,6),c=ri(-5,5),T=ri(1,5);const ans=2*a*T+b;
return {q:`A particle moves with velocity v = ${pT([a,b,c],'t')} m s⁻¹. Find its acceleration when t = ${T}.`,ans,exact:true,
work:[`a = dv/dt = ${lin([2*a,b],['t',''])}.`,`At t = ${T}: <b>${ans}</b> m s⁻².`],tip:`Acceleration = derivative of velocity. Displacement = integral of velocity.`};},
()=>{const a=rn(-2,2),b=ri(-6,6),c=ri(-4,6),T=ri(1,4);const ans=a*T**3/3+b*T*T/2+c*T;
return {q:`v = ${pT([a,b,c],'t')}. Find the displacement of the particle between t = 0 and t = ${T}.`,ans,
work:[`s = ∫ from 0 to ${T} of (${pT([a,b,c],'t')}) dt.`,`= [${lin([a,b,c],['t³/3','t²/2','t'])}] from 0 to ${T}.`,`= <b>${sf(ans)}</b> m.`],tip:`Displacement = ∫ v dt, signs included.`};},
()=>{const r1=ri(1,2),r2=r1+ri(1,2),T=r2+ri(1,2);const F=t=>t**3/3-(r1+r2)*t*t/2+r1*r2*t;const ans=Math.abs(F(r1)-F(0))+Math.abs(F(r2)-F(r1))+Math.abs(F(T)-F(r2));
return {q:`v = ${pT([1,-(r1+r2),r1*r2],'t')} m s⁻¹. Find the total distance travelled from t = 0 to t = ${T}.`,ans,
work:[`v = (t − ${r1})(t − ${r2}): the particle changes direction at t = ${r1} and t = ${r2}.`,`Split: |∫ from 0 to ${r1} of v dt| + |∫ from ${r1} to ${r2} of v dt| + |∫ from ${r2} to ${T} of v dt| = ${sf(Math.abs(F(r1)-F(0)),4)} + ${sf(Math.abs(F(r2)-F(r1)),4)} + ${sf(Math.abs(F(T)-F(r2)),4)}.`,`Distance = <b>${sf(ans)}</b> m.`,C(`∫dx(Abs (X²−${r1+r2}X+${r1*r2}), 0, ${T})`,`fnInt(abs(X²−${r1+r2}X+${r1*r2}), X, 0, ${T})`)],tip:`Distance = ∫|v| dt. Split wherever v = 0, or use abs on the GDC.`};},
()=>{const A=pick([6,8,10,12,20]),B=pick([2,3,4,5]);const ans=Math.log(A/B);
return {q:`v = ${A}e<sup>−t</sup> − ${B}. Find the time when the particle is at rest.`,ans,
work:[`At rest ⇒ v = 0: ${A}e<sup>−t</sup> = ${B}.`,`e<sup>−t</sup> = ${fr(B,A)} ⇒ t = ln(${fr(A,B)}).`,`t = <b>${sf(ans)}</b> s.`],tip:`"At rest" means v = 0, not a = 0.`};},
()=>{const p=rn(-3,3),q=ri(-4,4),v0=ri(-3,5),s0=ri(-2,4),T=ri(1,4);const ans=s0+v0*T+q*T*T/2+p*T**3/6;
return {q:`A particle has acceleration a = ${lin([p,q],['t',''])} m s⁻². At t = 0 its velocity is ${v0} m s⁻¹ and its displacement is ${s0} m. Find its displacement when t = ${T}.`,ans,
work:[`v = ∫ a dt = ${lin([p/2,q,v0],['t²','t',''])} (using v(0) = ${v0}).`,`s = ∫ v dt = ${lin([p,q,v0,s0],['t³/6','t²/2','t',''])} (using s(0) = ${s0}).`,`s(${T}) = <b>${sf(ans)}</b> m.`],tip:`Integrate twice. A new constant appears each time: use v(0), then s(0).`};},
()=>{const b=pick([2,4,6,8]),c=ri(1,5);const ans=c+b*b/4;
return {q:`v = −t² + ${b}t + ${c}. Find the maximum velocity.`,ans,
work:[`dv/dt = −2t + ${b} = 0 ⇒ t = ${b/2}. (This is when a = 0.)`,`v(${b/2}) = −${b*b/4} + ${b*b/2} + ${c}.`,`= <b>${N(ans)}</b> m s⁻¹.`],tip:`Maximum velocity happens when acceleration is 0.`};}
],
maclaurin:[
()=>{const a=pick([2,3,-1,-2,0.5]),k=pick([2,3,4]);const fa=[1,1,2,6,24];const ans=a**k/fa[k];
return {q:`Find the coefficient of x${SUPD[k]} in the Maclaurin series of e<sup>${kx(a)}</sup>.`,ans,
work:[`eᵘ = 1 + u + u²/2! + u³/3! + … with u = ${kx(a)}.`,`The x${SUPD[k]} term is (${kx(a)})${SUPD[k]} ÷ ${k}! = ${cf(cl(a**k))}x${SUPD[k]} ÷ ${fa[k]}.`,`Coefficient = <b>${sf(ans)}</b>.`],tip:`Substitute into a known series rather than differentiating from scratch.`};},
()=>{const a=pick([2,3,-2,0.5]);if(Math.random()<0.5){const ans=-(a**3)/6;return {q:`Find the coefficient of x³ in the Maclaurin series of sin(${N(a)}x).`,ans,work:[`sin u = u − u³/3! + … with u = ${N(a)}x.`,`x³ term: −(${N(a)}x)³ ÷ 6 = ${N(cl(-(a**3)))}x³/6.`,`Coefficient = <b>${sf(ans)}</b>.`],tip:`sin is odd: only odd powers, alternating signs.`};}
const ans=-(a*a)/2;return {q:`Find the coefficient of x² in the Maclaurin series of cos(${N(a)}x).`,ans,work:[`cos u = 1 − u²/2! + … with u = ${N(a)}x.`,`x² term: −(${N(a)}x)² ÷ 2.`,`Coefficient = <b>${sf(ans)}</b>.`],tip:`cos is even: only even powers, starting at 1.`};},
()=>{const x=pick([0.1,0.2,0.3,-0.1,0.5]);const ans=1+x+x*x/2;
return {q:`Use the first three terms of the Maclaurin series of eˣ to estimate e<sup>${N(x)}</sup>.`,ans,
work:[`eˣ ≈ 1 + x + x²/2.`,`= 1 + ${par(x)} + ${N(cl(x*x))}/2.`,`= <b>${N(cl(ans))}</b> (true value ${sf(Math.exp(x),5)}).`],tip:`Small x ⇒ few terms needed. The error is about the size of the first term left out.`};},
()=>{const a=pick([1,2,-1]),b=pick([1,2,-1,3]);const ans=a*b-b*b/2;
return {q:`Find the coefficient of x² in the Maclaurin series of e<sup>${kx(a)}</sup>ln(1 ${b<0?MIN:'+'} ${Math.abs(b)===1?'':Math.abs(b)}x).`,ans,
work:[`e<sup>${kx(a)}</sup> = 1 + ${kx(a)} + …,  ln(1 ${b<0?MIN:'+'} ${Math.abs(b)===1?'':Math.abs(b)}x) = ${kx(b)} − ${N(cl(b*b/2))}x² + …`,`x² terms of the product: 1 × (−${N(cl(b*b/2))}x²) + (${kx(a)})(${kx(b)}).`,`Coefficient = −${N(cl(b*b/2))} + ${par(a*b)} = <b>${sf(ans)}</b>.`],tip:`Product of series: collect every pair of powers that add to the one you want.`};},
()=>{if(Math.random()<0.5){const a=pick([1,2,3]);const ans=a*a/2;return {q:`Use Maclaurin series to find lim<sub>x→0</sub> (e<sup>${kx(a)}</sup> − 1 − ${kx(a)}) ÷ x².`,ans,work:[`e<sup>${kx(a)}</sup> = 1 + ${kx(a)} + ${cf(a*a)}x²/2 + ${cf(a**3)}x³/6 + …`,`Numerator = ${cf(a*a)}x²/2 + ${cf(a**3)}x³/6 + …; divide by x²: ${fr(a*a,2)} + (${fr(a**3,6)})x + …`,`→ <b>${sf(ans)}</b> as x → 0.`],tip:`Expand, cancel the low powers, divide, then let x → 0.`};}
const a=pick([1,2,3]);const ans=-(a**3)/6;return {q:`Use Maclaurin series to find lim<sub>x→0</sub> (sin ${kx(a)} − ${kx(a)}) ÷ x³.`,ans,work:[`sin ${kx(a)} = ${kx(a)} − ${cf(a**3)}x³/6 + …`,`Numerator = −${cf(a**3)}x³/6 + …; divide by x³.`,`→ <b>${sf(ans)}</b>.`],tip:`Series beat l'Hôpital when the rule would need three applications.`};},
()=>{const p=pick([0.5,-0.5,-1,1.5,-2]),b=pick([1,2,-1,3]);const ans=p*(p-1)/2*b*b;
return {q:`Find the coefficient of x² in the expansion of (1 ${b<0?MIN:'+'} ${Math.abs(b)===1?'':Math.abs(b)}x)<sup>${N(p)}</sup>.`,ans,
work:[`Booklet: (1 + u)ⁿ = 1 + nu + n(n − 1)u²/2! + …, with n = ${N(p)}, u = ${kx(b)}.`,`x² term: ${N(p)}(${N(cl(p-1))}) ÷ 2 × (${kx(b)})².`,`Coefficient = <b>${sf(ans)}</b>.`],tip:`Fractional or negative powers: the binomial series, valid for |u| < 1.`};}
],

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
['limits','lhop','diff','tangent','curve','optim','implicit','integ','tech','area','volume','kinem','maclaurin'].forEach(s=>{GEN[s]=GEN[s].map(g=>()=>{const o=g();o.q=fixMinus(o.q);o.work=o.work.map(fixMinus);return o;});});
Object.assign(LAB.GEN,GEN);
})();
