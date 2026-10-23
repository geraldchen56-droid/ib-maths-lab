/* Shared engine for every unit: DOM and canvas helpers, maths helpers, calculator switch.
   Each unit page loads this first, then its own learn.js and app.js, then learn-render.js and boot.js. */
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
const K=(...ks)=>ks.map(k=>`<kbd>${k}</kbd>`).join(' ');
const G=(c,t)=>({c,t});
const M=s=>`<span class="mk">${s}</span>`;
/* column vector as HTML: cv(1,-2,3) or cv([1,-2,3]) */
const cv=(...a)=>{if(a.length===1&&Array.isArray(a[0]))a=a[0];return '<span class="cv">'+a.map(x=>`<i>${String(x).replace(/^-/,'−')}</i>`).join('')+'</span>';};
const tableHTML=(head,rows)=>`<div class="tablewrap"><table class="mini">${rows.map(r=>`<tr>${r.map((c,i)=>i===0||head?`<th>${c}</th>`:`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const UNITS=[
{id:'probability',name:'Probability',ref:'Topic 4',href:'../probability/'},
{id:'vectors',name:'Vectors',ref:'Topic 3 · AHL',href:'../vectors/'}
];
window.LAB={$,$$,tok,hexRgb,rgba,prep,MONO,fact,nCr,nPr,bpdf,bcdf,erf,Phi,invPhi,gcd,frac,sf,p4,r2,ri,pick,C,lbl3,big,K,G,M,cv,tableHTML,UNITS,
unit:(document.body&&document.body.dataset.unit)||'',
DRAW:{},GEN:{},L:{},SECS:[],CARDS:[],SECNAME:{},TITLES:{}};
/* ---------- calculator choice ---------- */
function setCalc(c){c=c==='ti84'?'ti84':'casio';document.documentElement.dataset.calc=c;try{localStorage.setItem('ibprob-calc',c);}catch(e){}
$$('[data-pick]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pick===c?'true':'false'));}
$$('[data-pick]').forEach(b=>b.addEventListener('click',()=>setCalc(b.dataset.pick)));
setCalc(document.documentElement.dataset.calc);
})();
