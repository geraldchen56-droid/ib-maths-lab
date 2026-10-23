/* Renders each topic's How-to-answer and Worked-examples panels from LAB.L, and builds the two pull-out drawers. */
(function(){
"use strict";
const LAB=window.LAB,L=LAB.L,TITLES=LAB.TITLES;
const calcHTML=x=>x&&typeof x==='object'?`<span data-calc="casio">${x.c}</span><span data-calc="ti84">${x.t}</span>`:x;
const isCalc=x=>x&&typeof x==='object';

function methodHTML(sec,d){
return `<div class="panel learn-method">
<div class="lh"><span class="label">Method</span><h3>How to answer questions on ${TITLES[sec]}</h3></div>
<ol class="msteps">${d.method.map(([h,t])=>`<li><b>${h}.</b> ${calcHTML(t)}</li>`).join('')}</ol>
<div class="learn-grid">
<div><h4>Spot the question type</h4><div class="qtypes">${d.types.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>
<div><h4>Where the marks are</h4><ul class="marks">${d.marks.map(m=>`<li>${m}</li>`).join('')}</ul>
<p class="small">IB mark codes: <span class="mk">M1</span> method, <span class="mk">A1</span> accuracy, <span class="mk">R1</span> reasoning. A1 marks usually depend on the M1 before them.</p></div>
</div>
</div>`;
}
function exampleHTML(sec,e,i){
const total=e.parts.reduce((s,p)=>s+p.m,0);
return `<article class="ex" data-i="${i}"${i?' hidden':''}>
<div class="ex-top"><span class="tag">${e.tag}</span><span class="tag">${total} marks</span></div>
<h4 class="ex-title">${e.title}</h4>
<div class="ex-stem">${e.stem}</div>
${e.parts.map((p,j)=>`<div class="part">
<div class="pq"><b>(${String.fromCharCode(97+j)})</b><span>${p.q}</span><span class="pm">[${p.m}]</span></div>
<ol class="sol">${p.s.map(s=>`<li hidden${isCalc(s)?' class="calcline"':''}>${calcHTML(s)}</li>`).join('')}</ol>
<div class="pbtn"><button class="btn" data-a="step">Show next step</button><button class="btn" data-a="all">Show full solution</button><button class="btn" data-a="hide" hidden>Hide</button></div>
</div>`).join('')}
${e.calc?`<div class="ex-calc"><span class="label">On your calculator</span> ${calcHTML(e.calc)}</div>`:''}
<div class="ex-tip"><b>Examiner note</b>${e.tip}</div>
</article>`;
}
function examplesHTML(sec,d){
return `<div class="panel learn-ex">
<div class="lh"><span class="label">Worked examples</span><h3>Exam-style questions, solved step by step</h3>
<p class="small">Try each part on paper first. Then reveal one step at a time and compare your working line by line. The mark codes show where an examiner would award each mark.</p></div>
<div class="seg extabs" role="tablist">${d.ex.map((e,i)=>`<button role="tab" data-t="${i}" aria-pressed="${i?'false':'true'}">Example ${i+1}</button>`).join('')}</div>
${d.ex.map((e,i)=>exampleHTML(sec,e,i)).join('')}
</div>`;
}
function update(part){
const li=[...part.querySelectorAll('.sol li')],shown=li.filter(x=>!x.hidden).length;
part.querySelector('[data-a="step"]').hidden=shown===li.length;
part.querySelector('[data-a="all"]').hidden=shown===li.length;
part.querySelector('[data-a="hide"]').hidden=shown===0;
}
Object.keys(L).forEach(sec=>{
const s=document.getElementById('s-'+sec);if(!s)return;
const duo=s.querySelector('.duo');const wrap=document.createElement('div');wrap.className='learn';
wrap.innerHTML=methodHTML(sec,L[sec])+examplesHTML(sec,L[sec]);
s.insertBefore(wrap,duo);
wrap.addEventListener('click',ev=>{
const b=ev.target.closest('button');if(!b)return;
if(b.dataset.t!==undefined){const t=b.dataset.t;wrap.querySelectorAll('.extabs button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));wrap.querySelectorAll('.ex').forEach(x=>x.hidden=x.dataset.i!==t);return;}
const part=b.closest('.part');if(!part)return;const li=[...part.querySelectorAll('.sol li')];
if(b.dataset.a==='step'){const n=li.find(x=>x.hidden);if(n)n.hidden=false;}
if(b.dataset.a==='all')li.forEach(x=>x.hidden=false);
if(b.dataset.a==='hide')li.forEach(x=>x.hidden=true);
update(part);
});
});
})();
/* Formulas pull-out drawer: each topic's formula panel lives in a drawer on the right edge.
   Wide screens push the page over so it can stay open while reading; narrow screens overlay it. */
(function(){
"use strict";
const NAMES=window.LAB.SECNAME;
const KEY='ibprob-formulas',wide=()=>matchMedia('(min-width:1200px)').matches;
const drawer=document.createElement('aside');
drawer.className='pullout';drawer.id='formulaDrawer';drawer.setAttribute('aria-label','Formulas');drawer.inert=true;
drawer.innerHTML='<div class="po-head"><div><span class="label">Formulas</span><h3 class="po-title"></h3></div><button type="button" class="po-close" aria-label="Close formulas">×</button></div><div class="po-body"></div><p class="po-hint small">Press <kbd>F</kbd> to open or close</p>';
const tab=document.createElement('button');
tab.type='button';tab.className='po-tab';tab.hidden=true;tab.setAttribute('aria-controls','formulaDrawer');tab.setAttribute('aria-expanded','false');
tab.innerHTML='<span class="po-sym" aria-hidden="true">Σ</span><span class="po-txt">Formulas</span>';
const scrim=document.createElement('div');scrim.className='po-scrim';
document.body.append(scrim,drawer,tab);
const body=drawer.querySelector('.po-body'),store={};
Object.keys(NAMES).forEach(sec=>{
const th=document.querySelector('#s-'+sec+' .theory');const fp=th&&th.children[1];if(!fp)return;
th.classList.add('solo');fp.classList.add('po-content');fp.hidden=true;body.appendChild(fp);store[sec]=fp;
});
let open=false;try{open=localStorage.getItem(KEY)==='1'&&wide();}catch(e){}
const current=()=>{const s=document.querySelector('.sec:not([hidden])');return s?s.dataset.sec:null;};
function sync(){
const sec=current(),has=!!store[sec],o=open&&has;
tab.hidden=!has;
Object.entries(store).forEach(([k,el])=>{el.hidden=k!==sec;});
drawer.querySelector('.po-title').textContent=has?NAMES[sec]:'';
const was=document.documentElement.classList.contains('po-open');
document.documentElement.classList.toggle('po-open',o);
drawer.inert=!o;tab.setAttribute('aria-expanded',o?'true':'false');
tab.setAttribute('aria-label',o?'Close formulas':'Open formulas');
if(was!==o&&wide())setTimeout(()=>window.dispatchEvent(new Event('resize')),300);
}
function set(v,focus){
open=v;try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}
sync();
if(focus)(v?drawer.querySelector('.po-close'):tab).focus({preventScroll:true});
}
tab.addEventListener('click',()=>set(!open,true));
drawer.querySelector('.po-close').addEventListener('click',()=>set(false,true));
scrim.addEventListener('click',()=>set(false,false));
document.addEventListener('keydown',e=>{
if(e.key==='Escape'&&open){set(false,true);return;}
const t=e.target;if(e.metaKey||e.ctrlKey||e.altKey||(t&&(t.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))))return;
if((e.key==='f'||e.key==='F')&&!tab.hidden){e.preventDefault();set(!open,true);}
});
const mo=new MutationObserver(sync);
document.querySelectorAll('.sec').forEach(s=>mo.observe(s,{attributes:true,attributeFilter:['hidden']}));
sync();
})();
/* Topics pull-out on the left: on desktop the topic menu hides off-screen and slides out
   when the pointer reaches the left edge (or the tab is clicked), then tucks away again. */
(function(){
"use strict";
const rail=document.getElementById('rail');if(!rail)return;
const root=document.documentElement,desk=()=>matchMedia('(min-width:901px)').matches;
const head=document.createElement('div');head.className='nav-head';
head.innerHTML='<span class="label">Topics</span><button type="button" class="po-close nav-close" aria-label="Close topics">×</button>';
rail.prepend(head);
const sw=document.createElement('div');sw.className='unit-switch';
sw.innerHTML='<span class="label">Unit</span>'+window.LAB.UNITS.map(u=>`<a href="${u.href}"${u.id===window.LAB.unit?' aria-current="page"':''}>${u.name}</a>`).join('')+'<a class="hub" href="../">All units</a>';
head.after(sw);
const hint=document.createElement('p');hint.className='nav-hint small';hint.innerHTML='Move to the left edge or press <kbd>T</kbd>';rail.append(hint);
const tab=document.createElement('button');
tab.type='button';tab.className='nav-tab';tab.setAttribute('aria-controls','rail');tab.setAttribute('aria-expanded','false');tab.setAttribute('aria-label','Open topics');
tab.innerHTML='<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M1 1h14M1 6h14M1 11h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="po-txt">Topics</span>';
const scrim=document.createElement('div');scrim.className='nav-scrim';
document.body.append(scrim,tab);
let openT=0,closeT=0,pinned=false;
const isOpen=()=>root.classList.contains('nav-open');
function set(o,pin,focus){
clearTimeout(openT);clearTimeout(closeT);openT=closeT=0;
pinned=o&&!!pin;root.classList.toggle('nav-open',o);root.classList.toggle('nav-pinned',pinned);
tab.setAttribute('aria-expanded',String(o));
if(focus)(o?(rail.querySelector('.navb[aria-current="true"]')||rail.querySelector('.nav-close')):tab).focus({preventScroll:true});
}
document.addEventListener('mousemove',e=>{
if(!desk())return;
if(!isOpen()){
if(e.clientX<=12||tab.contains(e.target)){if(!openT)openT=setTimeout(()=>set(true,false),90);}
else if(openT){clearTimeout(openT);openT=0;}
}else if(!pinned){
if(e.clientX>rail.offsetWidth+24){if(!closeT)closeT=setTimeout(()=>set(false),280);}
else if(closeT){clearTimeout(closeT);closeT=0;}
}
},{passive:true});
document.documentElement.addEventListener('mouseleave',()=>{if(isOpen()&&!pinned)set(false);});
tab.addEventListener('click',()=>set(!(isOpen()&&pinned),true,true));
head.querySelector('.nav-close').addEventListener('click',()=>set(false,false,true));
scrim.addEventListener('click',()=>set(false));
rail.addEventListener('click',e=>{if(desk()&&e.target.closest('.navb'))set(false);});
document.addEventListener('keydown',e=>{
if(e.key==='Escape'&&isOpen()){set(false,false,true);return;}
const t=e.target;if(!desk()||e.metaKey||e.ctrlKey||e.altKey||(t&&(t.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))))return;
if(e.key==='t'||e.key==='T'){e.preventDefault();set(!isOpen(),true,true);}
});
matchMedia('(min-width:901px)').addEventListener('change',()=>set(false));
})();
