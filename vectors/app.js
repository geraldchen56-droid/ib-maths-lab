(function(){
"use strict";
const LAB=window.LAB;
const {$,$$,tok,hexRgb,rgba,prep,MONO,gcd,frac,sf,p4,r2,ri,pick,C,DRAW,cv}=LAB;
LAB.SECS.push('overview','vec','dot','cross','line','lines2','plane','lp','pp','drill','casio');
LAB.CARDS.push(
['vec','HL 3.12','Vector basics','Add, scale, |v|, position and displacement, ratios'],
['dot','HL 3.13','Scalar product','Angles, perpendicular, projections'],
['cross','HL 3.15','Vector product','Normals, areas of parallelograms and triangles'],
['line','HL 3.14','Lines','r = a + λb, angle, shortest distance, motion'],
['lines2','HL 3.14','Two lines','Parallel, intersecting or skew'],
['plane','HL 3.16','Planes','r·n = d, three points, distance'],
['lp','HL 3.16','Line and plane','Intersection, angle, reflection'],
['pp','HL 3.16','Planes meeting','Two planes, three planes, systems'],
['casio',C('fx-CG50 AU','TI-84 Plus CE'),'Calculator sheet','Every vector keystroke on one page']);
Object.assign(LAB.SECNAME,{vec:'Vector basics',dot:'Scalar product',line:'Lines',lines2:'Two lines',cross:'Vector product',plane:'Planes',lp:'Line and plane',pp:'Planes meeting'});

/* ---------- vector maths ---------- */
const MIN='−';
const fm=x=>{if(!isFinite(x))return '–';if(Math.abs(x)<1e-9)x=0;return sf(x,4).replace('-',MIN);};
const rat=(x,maxd=60)=>{if(!isFinite(x))return '–';if(Math.abs(x-Math.round(x))<1e-9)return fm(Math.round(x));for(let d=2;d<=maxd;d++){const n=Math.round(x*d);if(Math.abs(x-n/d)<1e-9)return (n<0?MIN:'')+Math.abs(n)+'/'+d;}return fm(x);};
const vs=v=>'('+v.map(fm).join(', ')+')';
const vr=v=>'('+v.map(x=>rat(x)).join(', ')+')';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(k,a)=>a.map(x=>k*x);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.sqrt(dot(a,a));
const unit=a=>mul(1/norm(a),a);
const deg=r=>r*180/Math.PI;
const angDeg=(a,b)=>deg(Math.acos(Math.max(-1,Math.min(1,dot(a,b)/(norm(a)*norm(b))))));
const isZero=a=>norm(a)<1e-9;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function lin(c,names){let s='';c.forEach((k,i)=>{if(Math.abs(k)<1e-9)return;const a=Math.abs(k),body=(Math.abs(a-1)<1e-9?'':rat(a))+names[i];if(!s)s=(k<0?MIN:'')+body;else s+=' '+(k<0?MIN:'+')+' '+body;});return s||'0';}
const planeEq=(n,d)=>lin(n,['x','y','z'])+' = '+rat(d);
const sqrtStr=n2=>{const r=Math.sqrt(n2);return Math.abs(r-Math.round(r))<1e-9?String(Math.round(r)):`√${rat(n2)} ≈ ${sf(r,4)}`;};

/* ---------- controls and readouts built from a spec ---------- */
function ctrls(host,pre,specs,onChange){
const el=typeof host==='string'?$(host):host,R={};
specs.forEach(s=>{
if(s.head){const h=document.createElement('div');h.className='ctrl-h';h.textContent=s.head;el.appendChild(h);return;}
const d=document.createElement('div');d.className='ctrl';
d.innerHTML=`<label for="${pre}${s.id}">${s.label}</label><output id="${pre}${s.id}o"></output><input type="range" id="${pre}${s.id}" min="${s.min}" max="${s.max}" step="${s.step||1}" value="${s.val}">`;
el.appendChild(d);const inp=d.querySelector('input');R[s.id]=inp;inp.addEventListener('input',()=>onChange(s.id));
});
R.sync=()=>{Object.keys(R).forEach(k=>{if(k==='sync')return;const o=document.getElementById(pre+k+'o');if(o)o.textContent=fm(+R[k].value);});};
return R;
}
function readout(host,items){const el=typeof host==='string'?$(host):host;el.className='readout';el.innerHTML=items.map(([id,l,hi])=>`<div${hi?' class="hi"':''}><span>${l}</span><b id="${id}"></b></div>`).join('');}
const put=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
const vals=(R,...ids)=>ids.map(i=>+R[i].value);
function numFields(host,items,onChange){const el=typeof host==='string'?$(host):host,R={};
el.className='inrow';
el.innerHTML=items.map(([id,l,v])=>`<label class="field" for="${id}">${l}<input type="number" id="${id}" value="${v}" step="1"></label>`).join('');
items.forEach(([id])=>{R[id]=document.getElementById(id);R[id].addEventListener('input',onChange);});return R;}
function presets(host,list,onPick){const el=typeof host==='string'?$(host):host;el.className='seg';
el.innerHTML=list.map(([k,l],i)=>`<button type="button" data-p="${k}" aria-pressed="false">${l}</button>`).join('');
el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;Array.from(el.querySelectorAll('button')).forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));onPick(b.dataset.p);});}
function setVals(R,obj){Object.keys(obj).forEach(k=>{R[k].value=obj[k];});}

/* ---------- 2D grid canvas ---------- */
function arrow2(ctx,x0,y0,x1,y1,col,w){
ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||2;ctx.lineCap='round';
ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
const a=Math.atan2(y1-y0,x1-x0),L=Math.min(10,Math.hypot(x1-x0,y1-y0)*0.5);if(L<2)return;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-L*Math.cos(a-0.4),y1-L*Math.sin(a-0.4));ctx.lineTo(x1-L*Math.cos(a+0.4),y1-L*Math.sin(a+0.4));ctx.closePath();ctx.fill();
}

/* ---------- 3D scene: turntable projection, shared view across all 3D models ---------- */
const VIEW={az:35,el:22};
function bindView(cvEl,azS,elS,redraw){
cvEl.classList.add('c3');let drag=null;
cvEl.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,az:VIEW.az,el:VIEW.el,t:e.pointerType};try{cvEl.setPointerCapture(e.pointerId);}catch(_){}});
cvEl.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;VIEW.az=((drag.az+dx*0.5+540)%360)-180;if(drag.t==='mouse')VIEW.el=clamp(drag.el+dy*0.4,0,85);redraw();});
const end=()=>{drag=null;};cvEl.addEventListener('pointerup',end);cvEl.addEventListener('pointercancel',end);
cvEl.addEventListener('dblclick',()=>{VIEW.az=35;VIEW.el=22;redraw();});
azS.addEventListener('input',()=>{VIEW.az=+azS.value;redraw();});elS.addEventListener('input',()=>{VIEW.el=+elS.value;redraw();});
}
const viewSpecs=[{head:'View (drag the picture, double-click to reset)'},{id:'az',label:'Rotate',min:-180,max:180,step:1,val:35},{id:'el',label:'Tilt',min:0,max:85,step:1,val:22}];
function syncView(R){R.az.value=VIEW.az;R.el.value=VIEW.el;}
function clipLine(a,b,Rr){let t0=-1e9,t1=1e9;for(let i=0;i<3;i++){if(Math.abs(b[i])<1e-12){if(Math.abs(a[i])>Rr+1e-9)return null;}else{let s=(-Rr-a[i])/b[i],e=(Rr-a[i])/b[i];if(s>e)[s,e]=[e,s];t0=Math.max(t0,s);t1=Math.min(t1,e);}}return t0<=t1?[t0,t1]:null;}
function planePoly(n,d,Rr){
const pts=[];const cs=[-Rr,Rr];
for(let i=0;i<3;i++)for(const s of cs)for(const t of cs){
const p0=[0,0,0],p1=[0,0,0];const j=(i+1)%3,k=(i+2)%3;p0[i]=-Rr;p1[i]=Rr;p0[j]=p1[j]=s;p0[k]=p1[k]=t;
const dn=dot(n,sub(p1,p0));if(Math.abs(dn)<1e-12)continue;const u=(d-dot(n,p0))/dn;if(u<-1e-9||u>1+1e-9)continue;
const q=add(p0,mul(u,sub(p1,p0)));if(!pts.some(p=>norm(sub(p,q))<1e-6))pts.push(q);}
if(pts.length<3)return null;
const nn=unit(n);let e1=Math.abs(nn[0])<0.9?cross(nn,[1,0,0]):cross(nn,[0,1,0]);e1=unit(e1);const e2=cross(nn,e1);
const c=mul(1/pts.length,pts.reduce((a,p)=>add(a,p),[0,0,0]));
pts.sort((p,q)=>Math.atan2(dot(sub(p,c),e2),dot(sub(p,c),e1))-Math.atan2(dot(sub(q,c),e2),dot(sub(q,c),e1)));
return pts;}
function scene(cvEl,H,Rr){
const {ctx,w,h}=prep(cvEl,H);
const az=VIEW.az*Math.PI/180,el=VIEW.el*Math.PI/180,sa=Math.sin(az),ca=Math.cos(az),se=Math.sin(el),ce=Math.cos(el);
const Rv=[-sa,ca,0],Uv=[-se*ca,-se*sa,ce];
let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
for(const a of [-Rr,Rr])for(const b of [-Rr,Rr])for(const c of [-Rr,Rr]){const p=[a,b,c],x=dot(p,Rv),y=dot(p,Uv);mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y);}
const pad=24,k=Math.min((w-2*pad)/(mxx-mnx),(h-2*pad)/(mxy-mny)),cx=w/2-(mnx+mxx)/2*k,cy=h/2+(mny+mxy)/2*k;
const P=p=>[cx+dot(p,Rv)*k,cy-dot(p,Uv)*k];
const S={ctx,w,h,P,R:Rr};
S.line=(p,q,o={})=>{const a=P(p),b=P(q);ctx.save();ctx.strokeStyle=o.c||tok('ink');ctx.lineWidth=o.w||1.5;ctx.globalAlpha=o.a==null?1:o.a;ctx.setLineDash(o.dash||[]);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.restore();};
S.path=(pts,o={})=>{ctx.save();ctx.strokeStyle=o.c||tok('ink');ctx.lineWidth=o.w||1.5;ctx.setLineDash(o.dash||[]);ctx.beginPath();pts.forEach((p,i)=>{const q=P(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.stroke();ctx.restore();};
S.text=(p,t,o={})=>{const q=P(p);ctx.save();ctx.fillStyle=o.c||tok('ink');ctx.font=o.font||`500 12.5px ${MONO}`;ctx.textAlign=o.align||'left';ctx.textBaseline=o.base||'middle';ctx.fillText(t,q[0]+(o.dx||0),q[1]+(o.dy||0));ctx.restore();};
S.dot=(p,o={})=>{const q=P(p);ctx.save();ctx.fillStyle=o.c||tok('ink');ctx.beginPath();ctx.arc(q[0],q[1],o.r||4,0,7);ctx.fill();if(o.ring){ctx.strokeStyle=tok('paper');ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();if(o.label)S.text(p,o.label,{c:o.c,dx:o.dx==null?7:o.dx,dy:o.dy==null?-8:o.dy});};
S.arrow=(p,q,o={})=>{const a=P(p),b=P(q);const c=o.c||tok('ink');ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=o.w||2;ctx.setLineDash(o.dash||[]);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.setLineDash([]);
const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),L=Math.min(10,Math.hypot(b[0]-a[0],b[1]-a[1])*0.5);if(L>=3){ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(b[0]-L*Math.cos(ang-0.4),b[1]-L*Math.sin(ang-0.4));ctx.lineTo(b[0]-L*Math.cos(ang+0.4),b[1]-L*Math.sin(ang+0.4));ctx.closePath();ctx.fill();}ctx.restore();
if(o.label)S.text(q,o.label,{c,dx:o.dx==null?8:o.dx,dy:o.dy==null?-8:o.dy,font:`600 13px ${MONO}`});};
S.poly=(pts,o={})=>{ctx.save();ctx.beginPath();pts.forEach((p,i)=>{const q=P(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();if(o.fill){ctx.fillStyle=o.fill;ctx.fill();}if(o.stroke){ctx.strokeStyle=o.stroke;ctx.lineWidth=o.w||1.5;ctx.setLineDash(o.dash||[]);ctx.stroke();}ctx.restore();};
S.axes=()=>{
const cs=[-Rr,Rr];
ctx.save();ctx.strokeStyle=tok('faint');ctx.lineWidth=1;
for(let g=-Rr;g<=Rr+1e-9;g+=2){S.line([g,-Rr,-Rr],[g,Rr,-Rr],{c:tok('faint'),w:1});S.line([-Rr,g,-Rr],[Rr,g,-Rr],{c:tok('faint'),w:1});}
for(let i=0;i<3;i++)for(const s of cs)for(const t of cs){const p0=[0,0,0],p1=[0,0,0],j=(i+1)%3,kk=(i+2)%3;p0[i]=-Rr;p1[i]=Rr;p0[j]=p1[j]=s;p0[kk]=p1[kk]=t;S.line(p0,p1,{c:tok('line'),w:1,a:0.7});}
ctx.restore();
['x','y','z'].forEach((nm,i)=>{const a=[0,0,0],b=[0,0,0];a[i]=-Rr;b[i]=Rr;S.line(a,b,{c:tok('muted'),w:1.3});
for(let t=-Rr+2;t<Rr;t+=2){if(t===0)continue;const q=[0,0,0];q[i]=t;S.text(q,String(t).replace('-',MIN),{c:tok('muted'),font:`10px ${MONO}`,dx:5,dy:9});}
const e=[0,0,0];e[i]=Rr*1.0;S.text(e,nm,{c:tok('ink'),font:`italic 600 14px ${MONO}`,dx:6,dy:-6});});
};
S.drawLine=(a,b,o={})=>{const r=clipLine(a,b,Rr);if(!r)return null;S.line(add(a,mul(r[0],b)),add(a,mul(r[1],b)),o);return r;};
S.plane=(n,d,col,o={})=>{const poly=planePoly(n,d,Rr);if(!poly)return false;S.poly(poly,{fill:rgba(col,o.fill==null?0.16:o.fill),stroke:tok(col),w:o.w||1.4});return true;};
S.inside=p=>Math.abs(p[0])<=Rr+1e-9&&Math.abs(p[1])<=Rr+1e-9&&Math.abs(p[2])<=Rr+1e-9;
return S;
}
const nz=(v)=>!isZero(v);

function det3(m){return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);}

/* ---------- shared wiring for the 3D models ---------- */
const CV_H=330;
function model3(sec,specs,draw){
const R=ctrls('#'+sec+'-ctrls',sec+'-',specs.concat(viewSpecs),id=>{if(id!=='az'&&id!=='el')draw();});
bindView($('#'+sec+'-cv'),R.az,R.el,draw);
return R;
}
const gdc=(sec,c,t)=>{$('#'+sec+'-gdc').innerHTML=C(`<span class="gl">fx-CG50</span>${c}`,`<span class="gl">TI-84</span>${t}`);};
const term=(n,a)=>a===0?n:`${n} ${a>0?'−':'+'} ${rat(Math.abs(a))}`;
function cartesian(a,b){
const nm=['x','y','z'],fr=[],eq=[];
for(let i=0;i<3;i++){if(Math.abs(b[i])<1e-9)eq.push(`${nm[i]} = ${rat(a[i])}`);else{const t=term(nm[i],a[i]);fr.push(Math.abs(b[i]-1)<1e-9?t:`(${t}) / ${b[i]<0?'('+rat(b[i])+')':rat(b[i])}`);}}
return fr.join(' = ')+(eq.length?(fr.length?',  ':'')+eq.join(',  '):'');
}
const COL={u:'accent',v:'amber',w:'good',x:'bad'};

/* ===== 1. Vector basics (2D grid) ===== */
(function(){
const R=ctrls('#vec-ctrls','vec-',[
{head:'Position vectors'},
{id:'u1',label:'u₁',min:-6,max:6,val:4},{id:'u2',label:'u₂',min:-6,max:6,val:1},
{id:'v1',label:'v₁',min:-6,max:6,val:-2},{id:'v2',label:'v₂',min:-6,max:6,val:4},
{head:'Scale and divide'},
{id:'k',label:'k (for ku)',min:-3,max:3,step:0.5,val:1.5},
{id:'lam',label:'λ (P = A + λAB)',min:0,max:1,step:0.05,val:0.5}
],()=>draw());
readout('#vec-ro',[['vecU','|u|'],['vecUh','unit vector û'],['vecS','u + v'],['vecK','k u'],['vecAB','AB = v − u',1],['vecABn','|AB|',1],['vecM','midpoint M'],['vecP','P (λ along AB)']]);
function draw(){
R.sync();const [u1,u2,v1,v2,k,lam]=vals(R,'u1','u2','v1','v2','k','lam');
const u=[u1,u2],v=[v1,v2],ab=sub(v,u),m=mul(0.5,add(u,v)),p=add(u,mul(lam,ab));
const {ctx,w,h}=prep($('#vec-cv'),CV_H);
const span=8,s=Math.min(w,h)/(2*span+1),cx=w/2,cy=h/2;const X=x=>cx+x*s,Y=y=>cy-y*s;
ctx.lineWidth=1;ctx.font=`10px ${MONO}`;ctx.fillStyle=tok('muted');ctx.textAlign='center';ctx.textBaseline='top';
for(let g=-span;g<=span;g++){ctx.strokeStyle=g===0?tok('muted'):tok('faint');ctx.beginPath();ctx.moveTo(X(g),Y(-span));ctx.lineTo(X(g),Y(span));ctx.stroke();ctx.beginPath();ctx.moveTo(X(-span),Y(g));ctx.lineTo(X(span),Y(g));ctx.stroke();if(g&&g%2===0){ctx.fillText(String(g).replace('-',MIN),X(g),Y(0)+4);ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(String(g).replace('-',MIN),X(0)-4,Y(g));ctx.textAlign='center';ctx.textBaseline='top';}}
const lab=(x,y,t,c)=>{ctx.fillStyle=tok(c);ctx.font=`600 13px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(t,X(x)+8,Y(y)-8);};
if(k!==1){ctx.setLineDash([4,4]);arrow2(ctx,X(0),Y(0),X(k*u1),Y(k*u2),tok('muted'),1.5);ctx.setLineDash([]);}
arrow2(ctx,X(0),Y(0),X(u1),Y(u2),tok('accent'),2.5);lab(u1,u2,'A','accent');
arrow2(ctx,X(0),Y(0),X(v1),Y(v2),tok('amber'),2.5);lab(v1,v2,'B','amber');
arrow2(ctx,X(u1),Y(u2),X(v1),Y(v2),tok('good'),2.5);
ctx.fillStyle=tok('ink');[[m,'M'],[p,'P']].forEach(([q,t])=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),4,0,7);ctx.fill();ctx.font=`600 12px ${MONO}`;ctx.textAlign='left';ctx.fillText(t,X(q[0])+7,Y(q[1])+12);});
const nu=norm(u);
put('vecU',nu?sqrtStr(dot(u,u)):'0');put('vecUh',nu?'('+u.map(x=>rat(x/nu)).join(', ')+')':'–');
put('vecS',vs(add(u,v)));put('vecK',vs(mul(k,u)));put('vecAB',vs(ab));put('vecABn',sqrtStr(dot(ab,ab)));put('vecM',vr(m));put('vecP',vr(p));
gdc('vec',`Norm(Vct A) then Vct A+Vct B   (OPTN → MAT/VCT, vectors from the editor)`,`√(sum(L₁²))   with {${u1},${u2}}→L₁`);
}
DRAW.vec=draw;
})();

/* ===== 2. Scalar product ===== */
(function(){
const R=model3('dot',[{head:'Vector u (blue)'},{id:'u1',label:'u₁',min:-5,max:5,val:3},{id:'u2',label:'u₂',min:-5,max:5,val:1},{id:'u3',label:'u₃',min:-5,max:5,val:0},
{head:'Vector v (amber)'},{id:'v1',label:'v₁',min:-5,max:5,val:1},{id:'v2',label:'v₂',min:-5,max:5,val:3},{id:'v3',label:'v₃',min:-5,max:5,val:2}],draw);
readout('#dot-ro',[['dtD','u · v',1],['dtA','angle θ',1],['dtU','|u|'],['dtV','|v|'],['dtP','projection of v on u'],['dtC','verdict']]);
function draw(){
syncView(R);R.sync();
const u=vals(R,'u1','u2','u3'),v=vals(R,'v1','v2','v3');
const S=scene($('#dot-cv'),CV_H,6);S.axes();const O=[0,0,0];
const d=dot(u,v),nu=norm(u),nv=norm(v);
if(nu>0.01&&nv>0.01){
const uh=unit(u),pr=mul(d/(nu*nu),u),perp=sub(v,pr);
if(norm(sub(pr,v))>0.01)S.line(v,pr,{c:tok('good'),dash:[4,4],w:1.5});
if(norm(pr)>0.05)S.arrow(O,pr,{c:tok('good'),w:3});
if(norm(perp)>1e-6){const w2=unit(perp),r=Math.min(nu,nv)*0.35,pts=[];const th=Math.acos(clamp(d/(nu*nv),-1,1));for(let i=0;i<=24;i++){const t=th*i/24;pts.push(add(mul(r*Math.cos(t),uh),mul(r*Math.sin(t),w2)));}S.path(pts,{c:tok('ink'),w:1.5});}
}
if(nu>0.01)S.arrow(O,u,{c:tok('accent'),w:3,label:'u'});if(nv>0.01)S.arrow(O,v,{c:tok('amber'),w:3,label:'v'});
const th=nu>0.01&&nv>0.01?angDeg(u,v):NaN;
put('dtD',fm(d));put('dtA',isNaN(th)?'–':sf(th,4)+'°');put('dtU',sqrtStr(dot(u,u)));put('dtV',sqrtStr(dot(v,v)));
put('dtP',nu>0.01?sf(d/nu,4)+(d<0?'  (opposite way)':''):'–');
put('dtC',isNaN(th)?'zero vector':Math.abs(d)<1e-9?'perpendicular':th<90?'acute (u·v > 0)':'obtuse (u·v < 0)');
gdc('dot',`DotP(Vct A,Vct B)    Angle(Vct A,Vct B)`,`sum(L₁*L₂)    cos⁻¹(sum(L₁*L₂)/(√(sum(L₁²))√(sum(L₂²))))`);
}
DRAW.dot=draw;
})();

/* ===== 3. Vector product ===== */
(function(){
const R=model3('cross',[{head:'Vector u (blue)'},{id:'u1',label:'u₁',min:-5,max:5,val:3},{id:'u2',label:'u₂',min:-5,max:5,val:0},{id:'u3',label:'u₃',min:-5,max:5,val:0},
{head:'Vector v (amber)'},{id:'v1',label:'v₁',min:-5,max:5,val:1},{id:'v2',label:'v₂',min:-5,max:5,val:3},{id:'v3',label:'v₃',min:-5,max:5,val:0}],draw);
readout('#cross-ro',[['crX','u × v',1],['crM','|u × v|  = parallelogram area',1],['crT','triangle area'],['crS','check |u||v| sin θ'],['crD','(u × v) · u'],['crE','(u × v) · v']]);
function draw(){
syncView(R);R.sync();
const u=vals(R,'u1','u2','u3'),v=vals(R,'v1','v2','v3');
const S=scene($('#cross-cv'),CV_H,6);S.axes();const O=[0,0,0],c=cross(u,v),nc=norm(c);
S.poly([O,u,add(u,v),v],{fill:rgba('accent',0.14),stroke:tok('accent'),w:1.2,dash:[4,3]});
if(nc>0.01){const L=Math.min(4,Math.max(2,nc/4));S.arrow(O,mul(L/nc,c),{c:tok('good'),w:3,label:'u×v'});}
if(norm(u)>0.01)S.arrow(O,u,{c:tok('accent'),w:3,label:'u'});if(norm(v)>0.01)S.arrow(O,v,{c:tok('amber'),w:3,label:'v'});
put('crX',vs(c));put('crM',nc<1e-9?'0  (u ∥ v)':sqrtStr(dot(c,c)));put('crT',nc<1e-9?'0':(()=>{const t=nc/2;return dot(c,c)%4===0&&Number.isInteger(Math.sqrt(dot(c,c)))?fm(t):sf(t,4);})());
const th=norm(u)>0.01&&norm(v)>0.01?angDeg(u,v):NaN;put('crS',isNaN(th)?'–':sf(norm(u)*norm(v)*Math.sin(th*Math.PI/180),4));
put('crD',fm(dot(c,u)));put('crE',fm(dot(c,v)));
gdc('cross',`CrossP(Vct A,Vct B)    Norm(Vct C)`,`no cross-product key: use ${'('+'u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁'+')'}`);
}
DRAW.cross=draw;
})();

/* ===== 4. Lines ===== */
(function(){
const R=model3('line',[{head:'Point A on the line'},{id:'a1',label:'a₁',min:-5,max:5,val:1},{id:'a2',label:'a₂',min:-5,max:5,val:-2},{id:'a3',label:'a₃',min:-5,max:5,val:1},
{head:'Direction b'},{id:'b1',label:'b₁',min:-4,max:4,val:2},{id:'b2',label:'b₂',min:-4,max:4,val:1},{id:'b3',label:'b₃',min:-4,max:4,val:1},
{head:'Point P off the line'},{id:'p1',label:'p₁',min:-5,max:5,val:3},{id:'p2',label:'p₂',min:-5,max:5,val:3},{id:'p3',label:'p₃',min:-5,max:5,val:-1}],draw);
readout('#line-ro',[['lnV','r = a + λb',1],['lnC','Cartesian form'],['lnL','λ at the foot F'],['lnF','foot F'],['lnD','distance from P to line',1],['lnU','|b|']]);
function draw(){
syncView(R);R.sync();
const a=vals(R,'a1','a2','a3'),b=vals(R,'b1','b2','b3'),p=vals(R,'p1','p2','p3');
const S=scene($('#line-cv'),CV_H,6);S.axes();const nb=norm(b);
if(nb<0.01){put('lnV','b = 0: not a line');['lnC','lnL','lnF','lnD','lnU'].forEach(i=>put(i,'–'));S.dot(a,{c:tok('accent'),label:'A'});S.dot(p,{c:tok('amber'),label:'P'});return;}
S.drawLine(a,b,{c:tok('accent'),w:2.5});
const lam=dot(sub(p,a),b)/(nb*nb),F=add(a,mul(lam,b));
S.line(p,F,{c:tok('bad'),dash:[5,4],w:2});
S.arrow(a,add(a,b),{c:tok('amber'),w:3,label:'b'});
S.dot(a,{c:tok('accent'),label:'A',r:5,ring:1});S.dot(p,{c:tok('ink'),label:'P',r:5,ring:1});if(S.inside(F))S.dot(F,{c:tok('bad'),label:'F',r:4,ring:1});
put('lnV',`${vs(a)} + λ${vs(b)}`);put('lnC',cartesian(a,b));put('lnL',rat(lam));put('lnF',vr(F));
const dd=norm(cross(sub(p,a),b))/nb;put('lnD',sf(dd,4));put('lnU',sqrtStr(dot(b,b)));
gdc('line',`Norm(CrossP(Vct AP,Vct B))÷Norm(Vct B)`,`d = |AP × b| ÷ |b|  — cross by components, then √(sum(L₁²))`);
}
DRAW.line=draw;
})();

/* ===== 5. Two lines ===== */
const L1={a:[1,2,0],b:[1,1,2]};
function classify2(a2,b2){
const {a:a1,b:b1}=L1,c=cross(b1,b2),d=sub(a2,a1);
if(isZero(c)){return isZero(cross(d,b1))?{k:'coincident'}:{k:'parallel',dist:norm(cross(d,b1))/norm(b1)};}
const cc=dot(c,c),lam=dot(cross(d,b2),c)/cc,mu=dot(cross(d,b1),c)/cc,trip=dot(d,c);
const ang=deg(Math.acos(Math.min(1,Math.abs(dot(b1,b2))/(norm(b1)*norm(b2)))));
if(Math.abs(trip)<1e-9)return {k:'intersect',lam,mu,pt:add(a1,mul(lam,b1)),ang};
return {k:'skew',lam,mu,dist:Math.abs(trip)/norm(c),ang,p1:add(a1,mul(lam,b1)),p2:add(a2,mul(mu,b2))};
}
(function(){
const R=model3('lines2',[{head:'Line 2: point and direction'},{id:'a1',label:'a₁',min:-6,max:6,val:0},{id:'a2',label:'a₂',min:-6,max:6,val:3},{id:'a3',label:'a₃',min:-6,max:6,val:1},
{id:'b1',label:'b₁',min:-3,max:3,val:1},{id:'b2',label:'b₂',min:-3,max:3,val:-1},{id:'b3',label:'b₃',min:-3,max:3,val:2}],draw);
presets('#lines2-pre',[['int','Intersect'],['par','Parallel'],['coi','Coincident'],['skew','Skew']],k=>{
const P={int:{a1:2,a2:5,a3:4,b1:1,b2:-1,b3:0},par:{a1:0,a2:-2,a3:1,b1:2,b2:2,b3:4},coi:{a1:3,a2:4,a3:4,b1:-1,b2:-1,b3:-2},skew:{a1:0,a2:3,a3:1,b1:1,b2:-1,b3:2}}[k];setVals(R,P);draw();});
readout('#lines2-ro',[['l2K','verdict',1],['l2X','meeting point / gap',1],['l2A','acute angle between lines']]);
function draw(){
syncView(R);R.sync();
const a2=vals(R,'a1','a2','a3'),b2=vals(R,'b1','b2','b3');
const S=scene($('#lines2-cv'),CV_H,6);S.axes();
if(norm(b2)<0.01){put('l2K','b₂ = 0: not a line');put('l2X','–');put('l2A','–');put('lines2-work','');S.drawLine(L1.a,L1.b,{c:tok('accent'),w:2.5});return;}
const r=classify2(a2,b2);
S.drawLine(L1.a,L1.b,{c:tok('accent'),w:2.5});S.drawLine(a2,b2,{c:tok('amber'),w:2.5});
S.text(add(L1.a,mul(-1.6,L1.b)),'L₁',{c:tok('accent'),font:`600 13px ${MONO}`});S.dot(L1.a,{c:tok('accent'),r:4,ring:1});S.dot(a2,{c:tok('amber'),r:4,ring:1});
let work='';
const eqs=['x','y','z'].map((n,i)=>`${n}:  ${rat(L1.a[i])} + ${rat(L1.b[i])}λ  =  ${rat(a2[i])} + ${rat(b2[i])}μ`.replace(/\+ −/g,'− '));
if(r.k==='intersect'){if(S.inside(r.pt))S.dot(r.pt,{c:tok('bad'),r:6,ring:1,label:'X'});
put('l2K','Intersect');put('l2X',vr(r.pt));put('l2A',sf(r.ang,4)+'°');
work=`Solve any two for λ, μ: λ = ${rat(r.lam)}, μ = ${rat(r.mu)}.  Third equation: both sides agree, so the lines meet at ${vr(r.pt)}.`;}
else if(r.k==='skew'){S.line(r.p1,r.p2,{c:tok('bad'),dash:[5,4],w:2});S.dot(r.p1,{c:tok('bad'),r:3});S.dot(r.p2,{c:tok('bad'),r:3});
put('l2K','Skew');put('l2X','gap '+sf(r.dist,4));put('l2A',sf(r.ang,4)+'°');
work=`Not parallel. Solving two equations gives λ = ${rat(r.lam)}, μ = ${rat(r.mu)}, but the third equation then fails (${vr(r.p1)} ≠ ${vr(r.p2)}). No solution, so the lines are skew.`;}
else if(r.k==='parallel'){put('l2K','Parallel');put('l2X','gap '+sf(r.dist,4));put('l2A','0°');work=`b₂ is a multiple of b₁, and A₂ is not on L₁, so the lines are parallel and never meet.`;}
else{put('l2K','Coincident');put('l2X','same line');put('l2A','0°');work=`b₂ is a multiple of b₁ and A₂ is on L₁, so the two equations describe the same line.`;}
$('#lines2-work').innerHTML=`<div class="wk">${eqs.join('<br>')}<br><b>${work}</b></div>`;
gdc('lines2',`SIMUL on two of the equations, then test the third`,`rref( on the 2×3 augmented matrix, then test the third`);
}
function put2(){}
DRAW.lines2=draw;
})();

/* ===== 6. Planes ===== */
(function(){
const R=model3('plane',[{head:'Plane  n · r = d'},{id:'n1',label:'n₁',min:-4,max:4,val:1},{id:'n2',label:'n₂',min:-4,max:4,val:2},{id:'n3',label:'n₃',min:-4,max:4,val:2},{id:'d',label:'d',min:-12,max:12,val:6},
{head:'Point P'},{id:'p1',label:'p₁',min:-5,max:5,val:3},{id:'p2',label:'p₂',min:-5,max:5,val:3},{id:'p3',label:'p₃',min:-5,max:5,val:2}],draw);
readout('#plane-ro',[['plE','Cartesian equation',1],['plN','|n|'],['plO','distance from origin'],['plI','intercepts (x, y, z)'],['plD','distance from P to plane',1],['plF','foot of perpendicular from P'],['plS','which side is P?']]);
function draw(){
syncView(R);R.sync();
const n=vals(R,'n1','n2','n3'),[d]=vals(R,'d'),p=vals(R,'p1','p2','p3');
const S=scene($('#plane-cv'),CV_H,6);S.axes();const nn=norm(n);
if(nn<0.01){put('plE','n = 0: not a plane');['plN','plO','plI','plD','plF','plS'].forEach(i=>put(i,'–'));S.dot(p,{c:tok('amber'),label:'P'});return;}
S.plane(n,d,'accent');
const Q=mul(d/(nn*nn),n);
if(S.inside(Q)&&nn>0)S.arrow(Q,add(Q,mul(2.5/nn,n)),{c:tok('good'),w:3,label:'n'});
const t=(dot(n,p)-d)/(nn*nn),F=sub(p,mul(t,n));
S.line(p,F,{c:tok('bad'),dash:[5,4],w:2});S.dot(p,{c:tok('amber'),r:5,ring:1,label:'P'});if(S.inside(F))S.dot(F,{c:tok('bad'),r:4,ring:1,label:'F'});
put('plE',planeEq(n,d));put('plN',sqrtStr(dot(n,n)));put('plO',sf(Math.abs(d)/nn,4));
put('plI',n.map(x=>Math.abs(x)<1e-9?'none':rat(d/x)).join(',  '));
put('plD',sf(Math.abs(dot(n,p)-d)/nn,4));put('plF',vr(F));
const s=dot(n,p)-d;put('plS',Math.abs(s)<1e-9?'on the plane':s>0?'n · p > d  (side n points to)':'n · p < d  (other side)');
gdc('plane',`n = CrossP(Vct AB,Vct AC), then d = n·A`,`n by components, d = sum(L₁*L₂) with n→L₁, A→L₂`);
}
DRAW.plane=draw;
})();

/* ===== 7. Line and plane ===== */
(function(){
const R=model3('lp',[{head:'Plane  n · r = d'},{id:'n1',label:'n₁',min:-3,max:3,val:1},{id:'n2',label:'n₂',min:-3,max:3,val:2},{id:'n3',label:'n₃',min:-3,max:3,val:-1},{id:'d',label:'d',min:-9,max:9,val:3},
{head:'Line  r = a + λb'},{id:'a1',label:'a₁',min:-5,max:5,val:-2},{id:'a2',label:'a₂',min:-5,max:5,val:-1},{id:'a3',label:'a₃',min:-5,max:5,val:-3},
{id:'b1',label:'b₁',min:-3,max:3,val:1},{id:'b2',label:'b₂',min:-3,max:3,val:1},{id:'b3',label:'b₃',min:-3,max:3,val:2}],draw);
presets('#lp-pre',[['x','Crosses'],['par','Parallel'],['in','Lies in plane']],k=>{
const P={x:{n1:1,n2:2,n3:-1,d:3,a1:-2,a2:-1,a3:-3,b1:1,b2:1,b3:2},par:{n1:1,n2:1,n3:-1,d:3,a1:0,a2:0,a3:0,b1:1,b2:0,b3:1},in:{n1:1,n2:1,n3:-1,d:3,a1:1,a2:1,a3:-1,b1:1,b2:0,b3:1}}[k];setVals(R,P);draw();});
readout('#lp-ro',[['lpK','verdict',1],['lpX','intersection',1],['lpA','angle between line and plane'],['lpBN','b · n'],['lpAN','a · n  (compare with d)']]);
function draw(){
syncView(R);R.sync();
const n=vals(R,'n1','n2','n3'),[d]=vals(R,'d'),a=vals(R,'a1','a2','a3'),b=vals(R,'b1','b2','b3');
const S=scene($('#lp-cv'),CV_H,6);S.axes();
if(norm(n)<0.01||norm(b)<0.01){put('lpK','need n ≠ 0 and b ≠ 0');['lpX','lpA','lpBN','lpAN'].forEach(i=>put(i,'–'));return;}
S.plane(n,d,'accent');S.drawLine(a,b,{c:tok('amber'),w:2.5});S.dot(a,{c:tok('amber'),r:4,ring:1,label:'A'});
const bn=dot(b,n),an=dot(a,n);put('lpBN',fm(bn));put('lpAN',fm(an));
const ang=deg(Math.asin(clamp(Math.abs(bn)/(norm(b)*norm(n)),0,1)));
if(Math.abs(bn)<1e-9){
if(Math.abs(an-d)<1e-9){put('lpK','Line lies in the plane');put('lpX','every point');put('lpA','0°');}
else{put('lpK','Parallel, never meets');put('lpX','none');put('lpA','0°');}
}else{const lam=(d-an)/bn,X=add(a,mul(lam,b));put('lpK','Meet at one point');put('lpX',`λ = ${rat(lam)}:  ${vr(X)}`);put('lpA',sf(ang,4)+'°');if(S.inside(X))S.dot(X,{c:tok('bad'),r:6,ring:1,label:'X'});}
gdc('lp',`sub the line into n·r = d, solve for λ`,`sub the line into n·r = d, solve for λ (solver or by hand)`);
}
DRAW.lp=draw;
})();

/* ===== 8. Planes meeting ===== */
function rank(M){const A=M.map(r=>r.slice());let r=0;const rows=A.length,cols=A[0].length;for(let c=0;c<cols&&r<rows;c++){let p=-1,best=1e-9;for(let i=r;i<rows;i++)if(Math.abs(A[i][c])>best){best=Math.abs(A[i][c]);p=i;}if(p<0)continue;[A[r],A[p]]=[A[p],A[r]];for(let i=r+1;i<rows;i++){const f=A[i][c]/A[r][c];for(let j=c;j<cols;j++)A[i][j]-=f*A[r][j];}r++;}return r;}
function solve3(rows){/* rows: [n1,n2,n3,d] */const A=rows.map(r=>r.slice(0,3)),D=det3(A);if(Math.abs(D)<1e-9)return null;return [0,1,2].map(c=>{const B=A.map((r,i)=>r.map((x,j)=>j===c?rows[i][3]:x));return det3(B)/D;});}
function classify3(rows){
const A=rows.map(r=>r.slice(0,3)),rA=rank(A),rB=rank(rows);
const N=A;let par=null;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(isZero(cross(N[i],N[j]))&&!isZero(N[i])&&!isZero(N[j])){par=par||[];par.push([i,j]);}
const coin=(i,j)=>par&&par.some(q=>q[0]===i&&q[1]===j)&&rank([rows[i],rows[j]])===1;
if(rows.some(r=>isZero(r.slice(0,3))))return {k:'bad'};
if(rA===3){return {k:'point',pt:solve3(rows)};}
if(rA===2&&rB===2){
let dir=null,pair=null;for(let i=0;i<3&&!dir;i++)for(let j=i+1;j<3&&!dir;j++){const c=cross(N[i],N[j]);if(!isZero(c)){dir=c;pair=[i,j];}}
const ax=dir.map(Math.abs).indexOf(Math.max(...dir.map(Math.abs)));const o=[0,1,2].filter(i=>i!==ax);
const m=[[N[pair[0]][o[0]],N[pair[0]][o[1]]],[N[pair[1]][o[0]],N[pair[1]][o[1]]]],dd=m[0][0]*m[1][1]-m[0][1]*m[1][0];
const r0=rows[pair[0]][3],r1=rows[pair[1]][3];const pt=[0,0,0];pt[o[0]]=(r0*m[1][1]-m[0][1]*r1)/dd;pt[o[1]]=(m[0][0]*r1-r0*m[1][0])/dd;
const anyCoin=[[0,1],[0,2],[1,2]].some(q=>coin(q[0],q[1]));
return {k:'line',dir,pt,coin:anyCoin};}
if(rA===2){const anyPar=par&&par.length>0;return {k:anyPar?'twopar':'prism'};}
if(rB===1)return {k:'allcoin'};
return {k:'allpar'};
}
(function(){
const grid=$('#pp-grid');
const ids=[];let h='<span></span><span class="rl">x</span><span class="rl">y</span><span class="rl">z</span><span class="rl">= d</span>';
for(let i=0;i<3;i++){h+=`<span class="rl">π${i+1}</span>`;for(let j=0;j<4;j++){const id=`pp${i}${j}`;ids.push(id);h+=`<input type="number" step="1" id="${id}" aria-label="plane ${i+1} ${['x','y','z','d'][j]} coefficient" value="0">`;}}
grid.innerHTML=h;
const E={};ids.forEach(id=>{E[id]=document.getElementById(id);E[id].addEventListener('input',draw);});
const VR=ctrls('#pp-ctrls','pp-',viewSpecs,()=>{});
bindView($('#pp-cv'),VR.az,VR.el,draw);
const PS={pt:[[1,2,-1,4],[2,-1,1,1],[3,1,1,5]],line:[[1,2,-1,4],[2,-1,1,1],[3,1,0,5]],prism:[[1,-1,2,1],[2,1,-1,2],[3,0,1,4]],twopar:[[1,1,1,3],[2,2,2,10],[1,-1,0,0]],coin:[[1,1,1,3],[2,2,2,6],[1,-1,0,0]],allpar:[[1,2,3,6],[2,4,6,20],[3,6,9,9]]};
function load(k){PS[k].forEach((r,i)=>r.forEach((x,j)=>{E['pp'+i+j].value=x;}));draw();}
PS.pt.forEach((r,i)=>r.forEach((x,j)=>{E['pp'+i+j].value=x;}));
presets('#pp-pre',[['pt','Point'],['line','Line'],['prism','Prism'],['twopar','Two parallel'],['coin','Two coincide'],['allpar','All parallel']],load);
readout('#pp-ro',[['ppK','how they meet',1],['ppX','common points',1],['ppD','determinant of coefficients'],['ppR','rank: coefficients | augmented']]);
const VERD={point:'Single point',line:'Common line',prism:'Triangular prism: no common point',twopar:'Two parallel planes: no common point',allcoin:'All three planes are the same',allpar:'Parallel planes: no common point',bad:'A row is all zero'};
function draw(){
syncView(VR);VR.sync();
const rows=[0,1,2].map(i=>[0,1,2,3].map(j=>+E['pp'+i+j].value||0));
const S=scene($('#pp-cv'),CV_H,6);S.axes();
const cl=classify3(rows),cols=['accent','amber','good'];
if(cl.k!=='bad')rows.forEach((r,i)=>S.plane(r.slice(0,3),r[3],cols[i],{fill:0.12}));
const A=rows.map(r=>r.slice(0,3));put('ppD',fm(det3(A)));put('ppR',`${rank(A)} | ${rank(rows)}`);
let verdict=VERD[cl.k],x='none';
if(cl.k==='point'){x=vr(cl.pt);if(S.inside(cl.pt))S.dot(cl.pt,{c:tok('bad'),r:6,ring:1,label:'X'});}
else if(cl.k==='line'){x=`r = ${vr(cl.pt)} + t${vr(cl.dir)}`;S.drawLine(cl.pt,cl.dir,{c:tok('bad'),w:3});verdict=cl.coin?'Common line (two planes coincide)':'Common line';}
else if(cl.k==='allcoin')x='the whole plane';
put('ppK',verdict);put('ppX',x);
gdc('pp',`Equation → SIMUL (3 unknowns), or Det of the 3×3`,`rref( on the 3×4 augmented matrix`);
}
DRAW.pp=draw;
})();

/* ---------- practice generators ---------- */
const rn=(lo,hi)=>{let x=0;do{x=ri(lo,hi);}while(x===0);return x;};
const rv=(lo=-5,hi=5)=>[ri(lo,hi),ri(lo,hi),ri(lo,hi)];
const rnv=(lo=-4,hi=4)=>{let v;do{v=rv(lo,hi);}while(isZero(v));return v;};
const nonPar=(a,b)=>!isZero(cross(a,b));
const nonPar2=()=>{let a,b;do{a=rnv();b=rnv();}while(!nonPar(a,b));return [a,b];};
const P=v=>'('+v.map(x=>String(x).replace('-',MIN)).join(', ')+')';
const pt=(n,v)=>`${n}${P(v)}`;
const COMP=['x','y','z'],ORD=['first','second','third'];
const lineTxt=(a,b)=>`<b>r</b> = ${cv(a)} + λ${cv(b)}`;
const plTxt=(n,d)=>planeEq(n,d);
const tipA=C('Casio: OPTN → MAT/VCT. Define the vectors in the editor, then DotP(, CrossP(, Angle(, Norm(.','TI-84: store each vector as a list. Dot product is sum(L₁*L₂), length is √(sum(L₁²)).');

const GENV={
vec:[
()=>{const a=rv(-6,6),b=rv(-6,6);if(norm(sub(a,b))<1)return GENV.vec[0]();const ab=sub(b,a),n2=dot(ab,ab);
return {q:`Points ${pt('A',a)} and ${pt('B',b)}. Find the distance AB, to 3 significant figures.`,ans:Math.sqrt(n2),
work:[`AB = B − A = ${P(b)} − ${P(a)} = ${P(ab)}.`,`|AB| = √(${ab.map(x=>x*x).join(' + ')}) = √${n2}.`,`= <b>${sf(Math.sqrt(n2))}</b>.`],tip:`Displacement = end − start. Square every component, add, root.`};},
()=>{const m=pick([2,3,4]);let a=rnv(-4,4);const k=ri(1,5),p=rn(-4,4),q=rn(-4,4),N=k*k+p*p+q*q;
return {q:`The vector ${cv('k',p,q)} has magnitude √${N}. Find the positive value of k.`,ans:k,exact:true,
work:[`|v|² = k² + ${p*p} + ${q*q} = ${N}.`,`k² = ${N} − ${p*p+q*q} = ${k*k}, so k = <b>${k}</b> (positive root).`],tip:`Magnitude questions: square both sides first, then root at the end.`};},
()=>{const a=rv(-4,4),t=pick([[1,2],[1,3],[2,3],[1,4],[3,4]]),[m,n]=t;const c=add(a,mul(n,rnv(-3,3)));
const d=sub(c,a),B=add(a,mul(m/n,d));if(d.some(x=>(x*m)%n!==0))return GENV.vec[2]();
const idx=ri(0,2);if(B[idx]===0)return GENV.vec[2]();
return {q:`Points ${pt('A',a)} and ${pt('C',c)} lie on a straight line, and B lies on AC with AB = ${m}/${n} of AC. Find the ${ORD[idx]} coordinate of B.`,ans:B[idx],exact:true,
work:[`AC = ${P(c)} − ${P(a)} = ${P(d)}.`,`AB = ${m}/${n} × AC, so <b>b</b> = <b>a</b> + ${m}/${n}·AC = ${P(B)}.`,`The ${ORD[idx]} coordinate is <b>${B[idx]}</b>.`],tip:`Collinear means AB = λ AC for some scalar λ.`};},
()=>{const rat2=pick([[1,2],[2,1],[1,3],[3,1],[2,3],[3,2],[1,4]]),[m,n]=rat2,s=m+n;const a=rv(-5,5),d=mul(s,rnv(-2,2)),b=add(a,d);const idx=ri(0,2);const Pp=add(a,mul(m/s,d));
if(Pp[idx]===0)return GENV.vec[3]();
return {q:`Points ${pt('A',a)} and ${pt('B',b)}. The point P lies on AB with AP : PB = ${m} : ${n}. Find the ${COMP[idx]}-coordinate of P.`,ans:Pp[idx],exact:true,
work:[`AB = ${P(d)}. AP is ${m}/${s} of AB.`,`<b>p</b> = <b>a</b> + ${m}/${s} AB = ${P(Pp)}.`,`${COMP[idx]}-coordinate: <b>${Pp[idx]}</b>.`],tip:`AP : PB = m : n means P is m/(m+n) of the way from A to B.`};},
()=>{const a=rv(-5,5),b=rv(-5,5);const M=mul(0.5,add(a,b));const idx=ri(0,2);
if(a.every((x,i)=>x===b[i])||(b[idx]===0))return GENV.vec[4]();
return {q:`M${P(M)} is the midpoint of AB, and A is ${P(a)}. Find the ${COMP[idx]}-coordinate of B.`,ans:b[idx],exact:true,
work:[`<b>m</b> = (<b>a</b> + <b>b</b>)/2, so <b>b</b> = 2<b>m</b> − <b>a</b>.`,`${COMP[idx]}: 2(${fm(M[idx])}) − (${fm(a[idx])}) = <b>${b[idx]}</b>.`],tip:`Midpoint is the average. Working backwards: double it, subtract the known end.`};}
],
dot:[
()=>{const u=rnv(-5,5),v=rnv(-5,5);const d=dot(u,v);if(d===0)return GENV.dot[0]();
return {q:`Find <b>a</b>·<b>b</b> where <b>a</b> = ${cv(u)} and <b>b</b> = ${cv(v)}.`,ans:d,exact:true,
work:[`Multiply matching components and add:`,`${u.map((x,i)=>`(${fm(x)})(${fm(v[i])})`).join(' + ')} = <b>${d}</b>.`,C('fx-CG50: DotP(Vct A,Vct B).','TI-84: sum(L₁*L₂).')],tip:`Dot product is a number, not a vector. Components pair up, then add.`};},
()=>{const [u,v]=nonPar2();const th=angDeg(u,v);
return {q:`Find the angle between <b>a</b> = ${cv(u)} and <b>b</b> = ${cv(v)}, in degrees to 3 significant figures.`,ans:th,
work:[`a·b = ${dot(u,v)}, |a| = √${dot(u,u)}, |b| = √${dot(v,v)}.`,`cos θ = ${dot(u,v)} / (√${dot(u,u)} × √${dot(v,v)}).`,`θ = <b>${sf(th)}°</b>.`,C('fx-CG50: Angle(Vct A,Vct B) in Degree mode.','TI-84: cos⁻¹(sum(L₁*L₂)/(√(sum(L₁²))√(sum(L₂²)))) in Degree mode.')],tip:`cos θ = a·b ÷ (|a||b|). Positive means acute, negative means obtuse.`};},
()=>{let k,a,b,c,d,e;for(let i=0;i<500;i++){k=ri(-5,5);a=rn(-4,4);b=rn(-4,4);c=rn(-4,4);d=ri(-4,4);e=-(k*c+a*d)/b;if(Number.isInteger(e)&&k!==0&&Math.abs(e)<=6&&e!==0)break;}
const u=[k,a,b],v=[c,d,e];if(dot(u,v)!==0)return GENV.dot[2]();
return {q:`The vectors ${cv('k',a,b)} and ${cv(c,d,e)} are perpendicular. Find k.`,ans:k,exact:true,
work:[`Perpendicular means the dot product is zero.`,`${c}k + (${a})(${d}) + (${b})(${e}) = 0.`,`${c}k = ${-(a*d+b*e)}, so k = <b>${k}</b>.`],tip:`Perpendicular ⇒ dot = 0. The unknown k appears once, so it is a linear equation.`};},
()=>{const u=rnv(-5,5),v=rnv(-5,5);const pr=dot(u,v)/norm(v);if(Math.abs(pr)<0.3)return GENV.dot[3]();
return {q:`Find the scalar projection of <b>a</b> = ${cv(u)} onto <b>b</b> = ${cv(v)}, to 3 significant figures.`,ans:pr,
work:[`Scalar projection of a onto b = (a·b) / |b|.`,`a·b = ${dot(u,v)}, |b| = √${dot(v,v)}.`,`= ${dot(u,v)} / ${sf(norm(v),5)} = <b>${sf(pr)}</b>.`],tip:`Project ONTO b means divide by |b|, the vector you land on.`};},
()=>{const p=ri(2,6),q=ri(2,6),r=ri(-Math.floor(p*q*0.8),Math.floor(p*q*0.8));const t=p*p+q*q+2*r;if(t<=0)return GENV.dot[4]();
return {q:`Vectors <b>a</b> and <b>b</b> have |<b>a</b>| = ${p}, |<b>b</b>| = ${q} and <b>a</b>·<b>b</b> = ${r}. Find |<b>a</b> + <b>b</b>|, to 3 significant figures.`,ans:Math.sqrt(t),
work:[`|a + b|² = (a + b)·(a + b) = |a|² + 2a·b + |b|².`,`= ${p*p} + ${2*r} + ${q*q} = ${t}.`,`|a + b| = √${t} = <b>${sf(Math.sqrt(t))}</b>.`],tip:`To get a length from a sum, square it first: |a + b|² expands like a bracket.`};}
],
line:[
()=>{const a=rv(-5,5),b=rnv(-3,3),t=rn(-4,4);const X=add(a,mul(t,b));
return {q:`A line has equation ${lineTxt(a,b)}. The point ${pt('Q',X)} lies on the line. Find the value of λ at Q.`,ans:t,exact:true,
work:[`${P(X)} = ${P(a)} + λ${P(b)}.`,`Take a component where b is not zero, the ${COMP[b.findIndex(x=>x!==0)]}-component: ${fm(X[b.findIndex(x=>x!==0)])} = ${fm(a[b.findIndex(x=>x!==0)])} + ${fm(b[b.findIndex(x=>x!==0)])}λ.`,`λ = <b>${t}</b>. The other components give the same λ, which confirms Q is on the line.`],tip:`Match one component, solve for λ, then check a second one.`};},
()=>{const b=rnv(-3,3);const i=b.findIndex(x=>x!==0);const a=rv(-4,4);const t=rn(-3,3);const c=a[i]+t*b[i];const j=(i+1+ri(0,1))%3;
const ans=a[j]+t*b[j];if(ans===0)return GENV.line[1]();
return {q:`A line has equation ${lineTxt(a,b)}. It passes through the point where ${COMP[i]} = ${c}. Find the ${COMP[j]}-coordinate of that point.`,ans,exact:true,
work:[`${COMP[i]}: ${fm(a[i])} + ${fm(b[i])}λ = ${c}, so λ = ${t}.`,`${COMP[j]}: ${fm(a[j])} + ${fm(b[j])}(${t}) = <b>${ans}</b>.`],tip:`Fix the one coordinate they give you, solve λ, then substitute into the rest.`};},
()=>{const [u,v]=nonPar2();const th=deg(Math.acos(Math.abs(dot(u,v))/(norm(u)*norm(v))));
return {q:`Two lines have direction vectors ${cv(u)} and ${cv(v)}. Find the acute angle between the lines, in degrees to 3 significant figures.`,ans:th,
work:[`cos θ = |u·v| / (|u||v|) = |${dot(u,v)}| / (√${dot(u,u)}·√${dot(v,v)}).`,`The angle between lines is taken acute, so use the absolute value.`,`θ = <b>${sf(th)}°</b>.`],tip:`Lines have no "direction": use |dot| to force an acute answer.`};},
()=>{const a=rv(-4,4),b=rnv(-3,3),p=rv(-5,5);const c=cross(sub(p,a),b);if(isZero(c))return GENV.line[3]();const dd=norm(c)/norm(b);
return {q:`Find the shortest distance from the point ${pt('P',p)} to the line ${lineTxt(a,b)}. Give your answer to 3 significant figures.`,ans:dd,
work:[`AP = ${P(p)} − ${P(a)} = ${P(sub(p,a))}.`,`AP × b = ${P(c)}, so |AP × b| = √${dot(c,c)}.`,`d = |AP × b| / |b| = √${dot(c,c)} / √${dot(b,b)} = <b>${sf(dd)}</b>.`],tip:`Distance from point to line = |AP × b| ÷ |b|. The cross product gives the parallelogram area; ÷ base gives the height.`};},
()=>{const a=rv(-4,4),b=rnv(-3,3),p=rv(-5,5);const t=dot(sub(p,a),b)/dot(b,b);if(Math.abs(t)<0.05)return GENV.line[4]();
return {q:`A particle moves with position <b>r</b> = ${cv(a)} + t${cv(b)}, t ≥ 0 in seconds. The point ${pt('P',p)} is fixed. At what time is the particle closest to P? (Give t to 3 significant figures.)`,ans:t,
work:[`The closest point F has AF perpendicular to b: (AP − t b)·b = 0.`,`t = AP·b / |b|² = ${dot(sub(p,a),b)} / ${dot(b,b)}.`,`t = <b>${sf(t)}</b>.`],tip:`Closest approach: the connecting vector is perpendicular to the direction. Dot with b and solve.`};}
],
lines2:[
()=>{const X=rv(-4,4),[b1,b2]=nonPar2();const l=rn(-3,3),m=rn(-3,3);const a1=sub(X,mul(l,b1)),a2=sub(X,mul(m,b2));const i=ri(0,2);if(X[i]===0)return GENV.lines2[0]();
return {q:`Lines L₁: ${lineTxt(a1,b1)} and L₂: ${lineTxt(a2,b2).replace(/λ/,'μ')} intersect. Find the ${COMP[i]}-coordinate of the intersection point.`,ans:X[i],exact:true,
work:[`Set them equal and solve two of the three component equations for λ and μ.`,`This gives λ = ${l}, μ = ${m}. Check the third equation: it holds, so the lines meet.`,`Point = ${P(X)}. The ${COMP[i]}-coordinate is <b>${X[i]}</b>.`,C('fx-CG50: Equation → SIMUL on two of the equations.','TI-84: rref( on the 2×3 matrix.')],tip:`Meet means one common point: λ, μ must satisfy ALL three components. Solve two, test the third.`};},
()=>{const X=rv(-3,3);let b1,b2,l,m;do{[b1,b2]=nonPar2();}while(b1[0]*b2[1]-b1[1]*b2[0]===0);l=rn(-3,3);m=rn(-3,3);
const a1=sub(X,mul(l,b1)),a2=sub(X,mul(m,b2));if(a2[2]===0)return GENV.lines2[1]();
return {q:`L₁: ${lineTxt(a1,b1)} and L₂: <b>r</b> = ${cv(a2[0],a2[1],'k')} + μ${cv(b2)}. The lines intersect. Find k.`,ans:a2[2],exact:true,
work:[`The x and y components do not involve k. Solve them for λ and μ: λ = ${l}, μ = ${m}.`,`Then the z components must agree: ${fm(a1[2])} + ${fm(b1[2])}(${l}) = k + ${fm(b2[2])}(${m}).`,`k = <b>${a2[2]}</b>.`],tip:`Use the two components free of the unknown to find λ and μ, then the third equation forces k.`};},
()=>{const [b1,b2]=nonPar2();const th=deg(Math.acos(Math.abs(dot(b1,b2))/(norm(b1)*norm(b2))));const a1=rv(-4,4),a2=rv(-4,4);
return {q:`L₁: ${lineTxt(a1,b1)} and L₂: ${lineTxt(a2,b2).replace(/λ/,'μ')}. Find the acute angle between the lines, in degrees to 3 significant figures.`,ans:th,
work:[`Only the direction vectors matter: ${P(b1)} and ${P(b2)}.`,`cos θ = |${dot(b1,b2)}| / (√${dot(b1,b1)}·√${dot(b2,b2)}).`,`θ = <b>${sf(th)}°</b>.`],tip:`The points a₁, a₂ are decoys for the angle. Directions only.`};},
()=>{let a1,a2,b1,b2,c,tr;do{a1=rv(-4,4);a2=rv(-4,4);[b1,b2]=nonPar2();c=cross(b1,b2);tr=dot(sub(a2,a1),c);}while(tr===0);const dd=Math.abs(tr)/norm(c);
return {q:`The lines L₁: ${lineTxt(a1,b1)} and L₂: ${lineTxt(a2,b2).replace(/λ/,'μ')} are skew. Find the shortest distance between them, to 3 significant figures.`,ans:dd,
work:[`b₁ × b₂ = ${P(c)}, with magnitude √${dot(c,c)}.`,`a₂ − a₁ = ${P(sub(a2,a1))}.`,`d = |(a₂ − a₁)·(b₁ × b₂)| / |b₁ × b₂| = |${tr}| / √${dot(c,c)} = <b>${sf(dd)}</b>.`],tip:`Skew gap = |(a₂−a₁)·n| ÷ |n| where n = b₁ × b₂ is perpendicular to both lines.`};},
()=>{const b=rnv(-3,3),m=rn(-3,3);if(Math.abs(m)===1)return GENV.lines2[4]();const a=rv(-3,3),s=rn(-2,2);const a2=add(a,mul(s,b));const b2=mul(m,b);
const idx=ri(0,2);if(b[idx]===0||a2[idx]===0)return GENV.lines2[4]();
return {q:`L₁: ${lineTxt(a,b)} and L₂: <b>r</b> = ${cv(a2.map((x,i)=>i===idx?'p':x))} + μ${cv(b2)} are the same line. Find p.`,ans:a2[idx],exact:true,
work:[`Directions ${P(b)} and ${P(b2)} are parallel (×${m}), so the lines coincide when A₂ is on L₁.`,`The other two components of A₂ fix λ = ${s}: A₂ = ${P(a)} + ${s}${P(b)}.`,`${COMP[idx]}: p = ${fm(a[idx])} + ${s}(${fm(b[idx])}) = <b>${a2[idx]}</b>.`],tip:`Same line = parallel directions AND a shared point.`};}
],
cross:[
()=>{const [u,v]=nonPar2();const c=cross(u,v);const i=ri(0,2);if(c[i]===0)return GENV.cross[0]();
return {q:`<b>a</b> = ${cv(u)} and <b>b</b> = ${cv(v)}. Find the ${ORD[i]} component of <b>a</b> × <b>b</b>.`,ans:c[i],exact:true,
work:[`<b>a</b> × <b>b</b> = ${cv(c)}.`,`${ORD[i]} component: <b>${c[i]}</b>.`,C('fx-CG50: CrossP(Vct A,Vct B).','TI-84: no cross-product key: use the component formula.')],tip:`Cross by cover-up: for the first component, ignore x and compute a₂b₃ − a₃b₂, then rotate.`};},
()=>{const [u,v]=nonPar2();const c=cross(u,v);
return {q:`<b>a</b> = ${cv(u)} and <b>b</b> = ${cv(v)}. Find |<b>a</b> × <b>b</b>|, to 3 significant figures.`,ans:norm(c),
work:[`<b>a</b> × <b>b</b> = ${cv(c)}.`,`|a × b| = √${dot(c,c)} = <b>${sf(norm(c))}</b>.`],tip:`|a × b| = area of the parallelogram spanned by a and b.`};},
()=>{let A,B,C2,c;do{A=rv(-4,4);B=rv(-4,4);C2=rv(-4,4);c=cross(sub(B,A),sub(C2,A));}while(isZero(c));const ar=norm(c)/2;
return {q:`Find the area of triangle ABC with ${pt('A',A)}, ${pt('B',B)} and ${pt('C',C2)}, to 3 significant figures.`,ans:ar,
work:[`AB = ${P(sub(B,A))}, AC = ${P(sub(C2,A))}.`,`AB × AC = ${P(c)}, magnitude √${dot(c,c)}.`,`Area = ½|AB × AC| = <b>${sf(ar)}</b>.`],tip:`Triangle = HALF the parallelogram. Don't forget the ½.`};},
()=>{const p=ri(2,7),q=ri(2,7),th=pick([30,60,120,150]);const ans=p*q*Math.sin(th*Math.PI/180);
return {q:`Vectors <b>a</b> and <b>b</b> have |<b>a</b>| = ${p}, |<b>b</b>| = ${q}, and the angle between them is ${th}°. Find |<b>a</b> × <b>b</b>|.`,ans,
work:[`|a × b| = |a||b| sin θ = ${p} × ${q} × sin ${th}°.`,`= ${p*q} × ${sf(Math.sin(th*Math.PI/180),4)} = <b>${sf(ans)}</b>.`],tip:`Dot uses cos, cross uses sin. sin 120° = sin 60°, so supplementary angles give the same size.`};},
()=>{const u=rnv(-4,4),m=pick([-3,-2,2,3]);const v=mul(m,u);const i=ri(0,2);if(u[i]===0)return GENV.cross[4]();
return {q:`Vectors <b>a</b> = ${cv(u)} and <b>b</b> = ${cv(v.map((x,j)=>j===i?'k':x))} satisfy <b>a</b> × <b>b</b> = <b>0</b>. Find k.`,ans:v[i],exact:true,
work:[`<b>a</b> × <b>b</b> = <b>0</b> means the vectors are parallel: <b>b</b> = λ<b>a</b>.`,`Another component fixes λ = ${m}.`,`k = ${m} × (${fm(u[i])}) = <b>${v[i]}</b>.`],tip:`Cross = 0 ⇔ parallel. Find the multiplier from a component with no unknown.`};}
],
plane:[
()=>{const n=rnv(-4,4),A=rv(-4,4);const d=dot(n,A);if(d===0)return GENV.plane[0]();
return {q:`A plane has normal ${cv(n)} and passes through ${pt('A',A)}. Its equation is <b>r</b>·${cv(n)} = d. Find d.`,ans:d,exact:true,
work:[`d = n·a = ${n.map((x,i)=>`(${fm(x)})(${fm(A[i])})`).join(' + ')}.`,`d = <b>${d}</b>.`],tip:`A point on the plane gives d: always n·(point on plane).`};},
()=>{const n=rnv(-4,4),p=rv(-5,5),d=ri(-8,8);const s=dot(n,p)-d;if(s===0)return GENV.plane[1]();const dd=Math.abs(s)/norm(n);
return {q:`Find the shortest distance from ${pt('P',p)} to the plane ${plTxt(n,d)}, to 3 significant figures.`,ans:dd,
work:[`Distance = |n·p − d| / |n|.`,`n·p = ${dot(n,p)}, so |${dot(n,p)} − ${fm(d)}| = ${Math.abs(s)}.`,`|n| = √${dot(n,n)}, so distance = <b>${sf(dd)}</b>.`],tip:`Plug the point into the left side, subtract d, then divide by |n|.`};},
()=>{let A,B,C2,n;do{A=rv(-4,4);B=rv(-4,4);C2=rv(-4,4);n=cross(sub(B,A),sub(C2,A));}while(isZero(n));const d=dot(n,A);if(d===0)return GENV.plane[2]();
return {q:`The plane through ${pt('A',A)}, ${pt('B',B)} and ${pt('C',C2)} is written <b>r</b>·<b>n</b> = d, where <b>n</b> = AB × AC. Find d.`,ans:d,exact:true,
work:[`AB = ${P(sub(B,A))}, AC = ${P(sub(C2,A))}.`,`<b>n</b> = AB × AC = ${P(n)}.`,`d = n·a = ${dot(n,A)} → <b>${d}</b>.`],tip:`Three points → two edge vectors → cross for the normal → dot with any one point for d.`};},
()=>{const i=ri(0,2);const c=rn(-4,4);const n=rnv(-4,4);if(n[i]===0)return GENV.plane[3]();const d=n[i]*c;const ans=c;
return {q:`Find the ${COMP[i]}-intercept of the plane ${plTxt(n,d)}. (The ${COMP[i]}-intercept is the value of ${COMP[i]} where the plane meets the ${COMP[i]}-axis.)`,ans,exact:true,
work:[`On the ${COMP[i]}-axis the other two coordinates are zero.`,`${n[i]}${COMP[i]} = ${d}, so ${COMP[i]} = <b>${ans}</b>.`],tip:`Axis intercept: set the other two variables to 0.`};},
()=>{const n=rnv(-4,4),k=rn(-4,4),i=ri(0,2);if(n[i]===0)return GENV.plane[4]();const q=rv(-3,3);const p=q.slice();p[i]=k;const d=dot(n,p);
return {q:`The point ${pt('Q',p.map((x,j)=>j===i?'k':x))} lies on the plane ${plTxt(n,d)}. Find k.`,ans:k,exact:true,
work:[`Substitute into the plane equation: ${n.map((x,j)=>`(${fm(x)})(${j===i?'k':fm(p[j])})`).join(' + ')} = ${d}.`,`${n[i]}k = ${d-n.reduce((s,x,j)=>j===i?s:s+x*p[j],0)}, so k = <b>${k}</b>.`],tip:`On the plane means the point satisfies the equation. Substitute and solve.`};},
()=>{const a=rv(-3,3),[b,c]=nonPar2();const n=cross(b,c);const d=dot(n,a);if(d===0)return GENV.plane[5]();
return {q:`A plane has equation <b>r</b> = ${cv(a)} + λ${cv(b)} + μ${cv(c)}. Using <b>n</b> = ${cv(b)} × ${cv(c)}, write it as <b>r</b>·<b>n</b> = d. Find d.`,ans:d,exact:true,
work:[`<b>n</b> = ${P(b)} × ${P(c)} = ${P(n)}.`,`d = n·a = <b>${d}</b>.`],tip:`Parametric to Cartesian: cross the two directions, then dot with the point.`};}
],
lp:[
()=>{const a=rv(-4,4),b=rnv(-3,3),n=rnv(-3,3);if(dot(b,n)===0)return GENV.lp[0]();const t=rn(-3,3);const d=dot(n,add(a,mul(t,b)));
return {q:`The line ${lineTxt(a,b)} meets the plane ${plTxt(n,d)} at one point. Find the value of λ at that point.`,ans:t,exact:true,
work:[`Substitute r = a + λb into n·r = d: n·a + λ(n·b) = d.`,`${dot(n,a)} + ${dot(n,b)}λ = ${d}.`,`λ = <b>${t}</b>.`],tip:`Line into plane: n·a + λ(n·b) = d. A single linear equation in λ.`};},
()=>{const a=rv(-4,4),b=rnv(-3,3),n=rnv(-3,3);if(dot(b,n)===0)return GENV.lp[1]();const t=rn(-3,3);const X=add(a,mul(t,b));const d=dot(n,X);const i=ri(0,2);if(X[i]===0)return GENV.lp[1]();
return {q:`The line ${lineTxt(a,b)} meets the plane ${plTxt(n,d)}. Find the ${COMP[i]}-coordinate of the point of intersection.`,ans:X[i],exact:true,
work:[`${dot(n,a)} + ${dot(n,b)}λ = ${d}, so λ = ${t}.`,`Point = ${P(X)}, so the ${COMP[i]}-coordinate is <b>${X[i]}</b>.`],tip:`Find λ first, then put it back in the line, not the plane.`};},
()=>{const b=rnv(-3,3),n=rnv(-3,3);if(isZero(cross(b,n))||dot(b,n)===0)return GENV.lp[2]();const th=deg(Math.asin(Math.abs(dot(b,n))/(norm(b)*norm(n))));
return {q:`A line has direction ${cv(b)} and a plane has normal ${cv(n)}. Find the angle between the line and the plane, in degrees to 3 significant figures.`,ans:th,
work:[`The angle with the NORMAL satisfies cos φ = |b·n| / (|b||n|); the angle with the plane is 90° − φ.`,`So sin θ = |b·n| / (|b||n|) = ${Math.abs(dot(b,n))} / (√${dot(b,b)}·√${dot(n,n)}).`,`θ = <b>${sf(th)}°</b>.`],tip:`Line and plane: use SIN of the angle with the normal's dot formula. Line and line: COS.`};},
()=>{let k,p,q,n;for(let i=0;i<500;i++){n=rnv(-3,3);p=rn(-3,3);q=rn(-3,3);k=-(n[1]*p+n[2]*q)/n[0];if(n[0]!==0&&Number.isInteger(k)&&k!==0)break;}
if(!(Number.isInteger(k)&&k!==0&&n[0]!==0))return GENV.lp[3]();
return {q:`The line <b>r</b> = λ${cv('k',p,q)} is parallel to the plane ${plTxt(n,ri(1,5))}. Find k.`,ans:k,exact:true,
work:[`Parallel to the plane means the direction is perpendicular to the normal: b·n = 0.`,`${n[0]}k + ${n[1]}(${p}) + ${n[2]}(${q}) = 0.`,`k = <b>${k}</b>.`],tip:`Line ∥ plane ⇔ b·n = 0.`};},
()=>{const n=rnv(-3,3),F=rv(-4,4),t=rn(-2,2);const Pp=add(F,mul(t,n)),Q=sub(F,mul(t,n));const d=dot(n,F);const i=ri(0,2);if(Q[i]===0||n[i]===0)return GENV.lp[4]();
return {q:`${pt('P',Pp)} is reflected in the plane ${plTxt(n,d)} to give P′. Find the ${COMP[i]}-coordinate of P′.`,ans:Q[i],exact:true,
work:[`Foot of perpendicular: F = P − t n with t = (n·p − d)/|n|² = ${t}.`,`F = ${P(F)}.`,`P′ = 2F − P = ${P(Q)}, so the ${COMP[i]}-coordinate is <b>${Q[i]}</b>.`],tip:`Reflect = go to the foot, then go the same distance again. P′ = 2F − P.`};}
],
pp:[
()=>{const [n1,n2]=nonPar2();const th=deg(Math.acos(Math.abs(dot(n1,n2))/(norm(n1)*norm(n2))));
return {q:`Find the acute angle between the planes ${plTxt(n1,ri(1,6))} and ${plTxt(n2,ri(1,6))}, in degrees to 3 significant figures.`,ans:th,
work:[`The angle between planes is the angle between their normals: ${P(n1)} and ${P(n2)}.`,`cos θ = |${dot(n1,n2)}| / (√${dot(n1,n1)}·√${dot(n2,n2)}).`,`θ = <b>${sf(th)}°</b>.`],tip:`Planes meet at the same angle as their normals. d does not affect it.`};},
()=>{const [n1,n2]=nonPar2();const c=cross(n1,n2);const i=ri(0,2);if(c[i]===0)return GENV.pp[1]();
return {q:`The planes ${plTxt(n1,ri(1,6))} and ${plTxt(n2,ri(1,6))} meet in a line. Find the ${ORD[i]} component of the vector n₁ × n₂, which is parallel to that line.`,ans:c[i],exact:true,
work:[`The line lies in both planes, so it is perpendicular to both normals.`,`n₁ × n₂ = ${P(n1)} × ${P(n2)} = ${P(c)}.`,`${ORD[i]} component: <b>${c[i]}</b>.`],tip:`Direction of the line of intersection = n₁ × n₂.`};},
()=>{let r1,r2,p,q,c,k;for(let i=0;i<800;i++){r1=rnv(-3,3);r2=rnv(-3,3);c=cross(r1,r2);p=ri(-3,3);q=ri(-3,3);if(c[2]===0)continue;k=-(p*c[0]+q*c[1])/c[2];if(Number.isInteger(k)&&k!==0)break;k=null;}
if(k==null||(!p&&!q))return GENV.pp[2]();
return {q:`The planes ${plTxt(r1,1)}, ${plTxt(r2,2)} and ${lin([p,q],['x','y'])} + kz = 3 do not meet at a unique point. Find k.`,ans:k,exact:true,
work:[`No unique point ⇔ the coefficient determinant is zero: r₃·(r₁ × r₂) = 0.`,`r₁ × r₂ = ${P(c)}.`,`${p}(${c[0]}) + ${q}(${c[1]}) + k(${c[2]}) = 0, so k = <b>${k}</b>.`,C('fx-CG50: Det of the 3×3 matrix with k left as a letter is awkward: use the triple product by hand.','TI-84: same: do the triple product by hand.')],tip:`Singular system ⇔ det = 0 ⇔ r₃·(r₁×r₂) = 0.`};},
()=>{let A,X,d,D;do{A=[rnv(-3,3),rnv(-3,3),rnv(-3,3)];D=det3(A);}while(D===0);X=rv(-3,3);const rows=A.map(r=>[...r,dot(r,X)]);const i=ri(0,2);if(X[i]===0)return GENV.pp[3]();
return {q:`Solve the system ${rows.map(r=>plTxt(r.slice(0,3),r[3])).join(';  ')}. Find the ${COMP[i]}-coordinate of the solution.`,ans:X[i],exact:true,
work:[`The determinant of the coefficients is ${D} ≠ 0, so there is exactly one solution.`,`Solving (GDC): (x, y, z) = ${P(X)}.`,`${COMP[i]} = <b>${X[i]}</b>.`,C('fx-CG50: Equation → F1 SIMUL → 3 unknowns.','TI-84: rref( of the 3×4 matrix, or APPS → PlySmlt2 → Simultaneous.')],tip:`On the GDC, enter all three rows exactly as written. Check one equation by hand.`};},
()=>{const n=rnv(-3,3),d1=ri(-6,6);let d2=ri(-6,6);if(d1===d2)d2+=3;const dd=Math.abs(d1-d2)/norm(n);
return {q:`Find the distance between the parallel planes ${plTxt(n,d1)} and ${plTxt(n,d2)}, to 3 significant figures.`,ans:dd,
work:[`Same normal, so the planes are parallel. Distance = |d₁ − d₂| / |n|.`,`= |${d1} − ${d2}| / √${dot(n,n)} = ${Math.abs(d1-d2)} / ${sf(norm(n),5)} = <b>${sf(dd)}</b>.`],tip:`Parallel planes: same n, subtract the d's, divide by |n|.`};}
]
};
Object.assign(LAB.GEN,GENV);
})();
