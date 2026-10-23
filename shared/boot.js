/* Navigation, overview cards, practice engine, scoring and start-up. Runs after the unit's own app.js. */
(function(){
"use strict";
const {$,$$,sf,pick,DRAW,GEN,SECS,CARDS,SECNAME}=window.LAB;
const UNIT=window.LAB.unit;
const LASTKEY=UNIT==='probability'?'ibprob-last':'iblab-last-'+UNIT;
/* ---------- navigation ---------- */
let current='overview';
function show(id){
if(!SECS.includes(id))id='overview';
current=id;
SECS.forEach(s=>{const el=document.getElementById('s-'+s);el.hidden=s!==id;});
$$('.navb').forEach(b=>b.setAttribute('aria-current',b.dataset.go===id?'true':'false'));
const nb=document.querySelector(`.navb[data-go="${id}"]`);
if(nb&&nb.scrollIntoView&&window.innerWidth<=900)nb.scrollIntoView({block:'nearest',inline:'center'});
try{history.replaceState(null,'','#'+id);}catch(e){}
try{localStorage.setItem(LASTKEY,id);}catch(e){}
requestAnimationFrame(()=>{DRAW[id]&&DRAW[id]();});
}
$$('.navb').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.go);window.scrollTo({top:0});}));
$('#cards').innerHTML=CARDS.map(c=>`<button class="card" data-go="${c[0]}"><span class="r">${c[1]}</span><span class="n">${c[2]}</span><span class="d">${c[3]}</span></button>`).join('');
$$('.card').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.go);window.scrollTo({top:0});}));
/* ---------- score store ---------- */
const skey=k=>UNIT==='probability'?k:UNIT+'.'+k;
const mine=k=>UNIT==='probability'?k.indexOf('.')<0:k.indexOf(UNIT+'.')===0;
let SCORE={};try{SCORE=JSON.parse(localStorage.getItem('ibprob-score')||'{}')||{};}catch(e){SCORE={};}
function saveScore(){try{let all={};try{all=JSON.parse(localStorage.getItem('ibprob-score')||'{}')||{};}catch(e){}Object.keys(SCORE).filter(mine).forEach(k=>{all[k]=SCORE[k];});localStorage.setItem('ibprob-score',JSON.stringify(all));}catch(e){}renderScore();}
function renderScore(){
let c=0,a=0;Object.keys(SCORE).filter(mine).forEach(k=>{const s=SCORE[k];c+=s.c||0;a+=s.a||0;});
$('#tCorrect').textContent=c;$('#tAttempt').textContent=a;$('#tRate').textContent=a?Math.round(100*c/a)+'%':'–';
$$('.navb .s[data-s]').forEach(el=>{const s=SCORE[skey(el.dataset.s)];el.textContent=s&&s.a?`${s.c}/${s.a}`:'';});
$$('.p-score').forEach(el=>{const s=SCORE[skey(el.dataset.sec)];el.textContent=s&&s.a?`${s.c} correct of ${s.a} this browser`:'Answers to 3 s.f. Fractions like 3/8 are fine.';});
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
if(!scored){scored=true;SCORE[skey(sec)]=SCORE[skey(sec)]||{c:0,a:0};SCORE[skey(sec)].a++;if(ok)SCORE[skey(sec)].c++;saveScore();}
if(ok){fb.textContent=`Correct. Answer: ${sf(a)}.`;fb.className='p-fb ok';}
else{fb.textContent='Not quite. Try again, or open the working.';fb.className='p-fb no';}
}
el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const act=b.dataset.act;
if(act==='check')check();if(act==='next')next();
if(act==='show'){wk.hidden=!wk.hidden;if(!scored){scored=true;SCORE[skey(sec)]=SCORE[skey(sec)]||{c:0,a:0};SCORE[skey(sec)].a++;saveScore();}fb.textContent=`Answer: ${sf(cur.ans)}`;fb.className='p-fb';}});
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
let start=(location.hash||'').slice(1);if(!SECS.includes(start)){try{start=localStorage.getItem(LASTKEY)||'overview';}catch(e){start='overview';}}
show(start);
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h!==current&&SECS.includes(h))show(h);});
})();
