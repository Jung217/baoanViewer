const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-CysBXJu2.js","./game-DL27lLbr.js","./game-BCe-bysK.css","./classes-BMs-PAYp.js","./index-BuKmfV6T.css"])))=>i.map(i=>d[i]);
import{_ as xt}from"./game-DL27lLbr.js";import{I as O,c as it,e as k,C as wt,S as Tt,f as bt}from"./classes-BMs-PAYp.js";const _t=220;function zt(i,s,{maxZoom:r=6,tapSlop:c=8,onTap:m=null,onChange:g=null}={}){let u=1,d=1,h=1,o=1,f=0,$=0,x=null,z=0;const a=new Map,T=()=>i.getBoundingClientRect();function F(){const e=T();h=Math.min(e.width/u,e.height/d)||1}function w(e){return Math.max(h,Math.min(h*r,e))}function A(){const e=T(),l=u*o,p=d*o;f=l<=e.width?(e.width-l)/2:Math.min(0,Math.max(e.width-l,f)),$=p<=e.height?(e.height-p)/2:Math.min(0,Math.max(e.height-p,$))}function M(){A(),s.style.transform=`translate(${f}px, ${$}px) scale(${o})`,i.classList.toggle("is-zoomed",o>h*1.01),g&&g()}function B(){z&&cancelAnimationFrame(z),z=0}function U(e,l,p){if(B(),window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){o=e,f=l,$=p,M();return}const t={scale:o,x:f,y:$},b=performance.now(),I=R=>{const X=Math.min(1,(R-b)/_t),W=1-(1-X)**3;o=t.scale+(e-t.scale)*W,f=t.x+(l-t.x)*W,$=t.y+(p-t.y)*W,M(),z=X<1?requestAnimationFrame(I):0};z=requestAnimationFrame(I)}function D(e,l,p,y=!1){const t=w(o*e),b=(l-f)/o,I=(p-$)/o;y?U(t,l-b*t,p-I*t):(o=t,f=l-b*t,$=p-I*t,M())}function P(e,l){const p=T();return[e-p.left,l-p.top]}function S(){const[e,l]=[...a.values()],[p,y]=P((e.x+l.x)/2,(e.y+l.y)/2);x={type:"pinch",dist:Math.hypot(e.x-l.x,e.y-l.y)||1,scale:o,cx:(p-f)/o,cy:(y-$)/o}}function E(e){if(!(e.pointerType==="mouse"&&e.button!==0)&&!(e.target.closest&&e.target.closest("button, a, input, select, textarea, [data-no-pan]"))){B();try{i.setPointerCapture(e.pointerId)}catch{}a.set(e.pointerId,{x:e.clientX,y:e.clientY}),a.size===1?x={type:"tap",sx:e.clientX,sy:e.clientY,ox:f,oy:$}:a.size===2&&S()}}function q(e){const l=a.get(e.pointerId);if(!l||!x)return;if(l.x=e.clientX,l.y=e.clientY,x.type==="pinch"){if(a.size<2)return;const[t,b]=[...a.values()],[I,R]=P((t.x+b.x)/2,(t.y+b.y)/2);o=w(x.scale*Math.hypot(t.x-b.x,t.y-b.y)/x.dist),f=I-x.cx*o,$=R-x.cy*o,M();return}const p=e.clientX-x.sx,y=e.clientY-x.sy;x.type==="tap"&&Math.hypot(p,y)>c&&(x.type="pan",i.classList.add("is-dragging")),x.type==="pan"&&(f=x.ox+p,$=x.oy+y,M())}function _(e){if(!a.has(e.pointerId))return;a.delete(e.pointerId);const l=x;if(l&&l.type==="tap"&&e.type==="pointerup"&&m&&m(e.clientX,e.clientY,e),a.size===1&&l&&l.type==="pinch"){const[p]=[...a.values()];x={type:"pan",sx:p.x,sy:p.y,ox:f,oy:$}}else a.size===0&&(x=null,i.classList.remove("is-dragging"))}function H(e){e.preventDefault(),B();const l=e.deltaMode===1?.05:e.deltaMode===2?1:.0015,[p,y]=P(e.clientX,e.clientY);D(Math.exp(-e.deltaY*l),p,y)}const C=e=>e.preventDefault();i.addEventListener("pointerdown",E),i.addEventListener("pointermove",q),i.addEventListener("pointerup",_),i.addEventListener("pointercancel",_),i.addEventListener("lostpointercapture",_),i.addEventListener("wheel",H,{passive:!1}),i.addEventListener("gesturestart",C),i.addEventListener("contextmenu",C);const j=typeof ResizeObserver=="function"?new ResizeObserver(()=>{const e=T();if(!e.width||!e.height)return;const l=o/h,p=(e.width/2-f)/o,y=(e.height/2-$)/o;F(),o=w(h*l),f=e.width/2-p*o,$=e.height/2-y*o,M()}):null;return j&&j.observe(i),{setContentSize(e,l){u=e,d=l,s.style.width=`${e}px`,s.style.height=`${l}px`,F(),o=h,M()},fit(){F();const e=T();U(h,(e.width-u*h)/2,(e.height-d*h)/2)},zoomBy(e){const l=T();D(e,l.width/2,l.height/2,!0)},centerOn(e,l){const p=T(),y=p.width/2-e*u*o,t=p.height/2-l*d*o,b={x:f,y:$};f=y,$=t,A();const I={x:f,y:$};f=b.x,$=b.y,U(o,I.x,I.y)},toImage(e,l){const[p,y]=P(e,l),t=(p-f)/(u*o),b=(y-$)/(d*o);return{u:t,v:b,inside:t>=0&&t<=1&&b>=0&&b<=1}},toScreen(e,l){return{x:f+e*u*o,y:$+l*d*o}},isVisible(e,l,p=0){const y=T(),t=this.toScreen(e,l);return t.x>=p&&t.y>=p&&t.x<=y.width-p&&t.y<=y.height-p},get displayWidth(){return u*o},get zoom(){return o/h},get maxZoom(){return r},destroy(){B(),j&&j.disconnect(),i.removeEventListener("pointerdown",E),i.removeEventListener("pointermove",q),i.removeEventListener("pointerup",_),i.removeEventListener("pointercancel",_),i.removeEventListener("lostpointercapture",_),i.removeEventListener("wheel",H),i.removeEventListener("gesturestart",C),i.removeEventListener("contextmenu",C)}}}const Pt=20;function Ct([i,s],r){if(!r||r.length<3)return!1;let c=!1;for(let m=0,g=r.length-1;m<r.length;g=m++){const[u,d]=r[m],[h,o]=r[g];d>s!=o>s&&i<(h-u)*(s-d)/(o-d)+u&&(c=!c)}return c}function Rt(i,s,r,c,m,g){const u=m-r,d=g-c,h=u*u+d*d,o=h?Math.max(0,Math.min(1,((i-r)*u+(s-c)*d)/h)):0;return Math.hypot(i-(r+o*u),s-(c+o*d))}function Nt(i,s,r=1){if(!s||!s.length)return 1/0;if(Ct(i,s))return 0;const c=i[0],m=i[1]/r;if(s.length===1)return Math.hypot(c-s[0][0],m-s[0][1]/r);let g=1/0;for(let u=0,d=s.length-1;u<s.length;d=u++){const h=Rt(c,m,s[d][0],s[d][1]/r,s[u][0],s[u][1]/r);h<g&&(g=h)}return g}function Bt(i,s){return s>0?i/s:0}function vt(i,s,{aspect:r=1,tol:c=0}={}){let m=null;for(const g of s){const u=Nt(i,g.poly,r);if(u>c)continue;const d=ut(g.poly,r),h=Math.hypot(i[0]-d.u,(i[1]-d.v)/r);(!m||u<m.dist||u===m.dist&&h<m.centerDist)&&(m={spot:g,dist:u,centerDist:h})}return m&&{spot:m.spot,dist:m.dist}}function ut(i,s=1){let r=1/0,c=1/0,m=-1/0,g=-1/0;for(const[d,h]of i)d<r&&(r=d),d>m&&(m=d),h<c&&(c=h),h>g&&(g=h);const u=Math.hypot(m-r,(g-c)/s)/2;return{u:(r+m)/2,v:(c+g)/2,r:u}}const Mt=200,Dt=[.4,.7,1],ot=10,Lt=120,tt=2,ht=5,qt=1e-9;function Ft(i,s){return s?Math.max(0,Math.min(1,i/s)):0}function Ht(i){return Dt.filter(s=>i+qt>=s).length}function Ot({found:i,total:s,misses:r=0,hintsUsed:c=0,timeLeft:m=0,timeLimit:g=Lt}){const u=Ft(i,s),d=s>0&&i>=s,h=Math.round(100*u),o=g>0?Math.max(0,Math.min(1,m/g)):0,f=d?Math.round(50*o):0,$=ht*r,x=i>0?Math.max(0,50-$):0,z=ot*c,a=Math.max(0,Math.round(x-z));return{rate:u,stars:Ht(u),completion:h,timeBonus:f,accuracy:a,accuracyRaw:Math.round(x),missPenalty:$,hintPenalty:z,score:Math.min(Mt,h+f+a),complete:d}}const Ut='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2M4.5 8a9 9 0 0 0 0 8M19.5 8a9 9 0 0 1 0 8"/></svg>',dt=52,nt=2*Math.PI*dt,jt=["再試一次！","還差一點！","眼力很好！","全部找到！"],Xt={time:"時間到",quit:"提前結束",all:""};function Yt(i,{artifact:s,stats:r,breakdown:c,urls:m}){return new Promise(g=>{const u=s.aspect,d=new Set(r.foundIds),h=Math.round(c.rate*100),o=!!m.restored,f=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,$=Xt[r.reason]||"",x=[0,1,2].map(t=>`
      <svg class="sd-star ${t<c.stars?"is-on":""}" style="--i:${t}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="${Tt}"/>
      </svg>`).join(""),z=[{label:"找到損壞",value:c.completion,ok:c.completion>0,note:`${r.found} / ${r.total} 處`},{label:"時間獎勵",value:c.timeBonus,ok:c.timeBonus>0,note:c.complete?`剩 ${r.timeLeft} 秒`:"全部找到才有"},{label:"正確度",value:c.accuracy,ok:c.accuracy>0,note:`誤點 ${r.misses} 次${r.misses?` −${c.missPenalty}`:""}${r.hintsUsed?`・提示 ${r.hintsUsed} 次 −${c.hintPenalty}`:""}`}].map(t=>`
      <li class="${t.ok?"is-ok":""}">
        <span class="sd-check">${O.check}</span>
        <span class="sd-row-label">${t.label}<small>${t.note}</small></span>
        <b>+${t.value}</b>
      </li>`).join(""),a=s.spots.map(t=>{const b=ut(t.poly,u),I=Math.max(.08,2*b.r*1.2)*100,R=it(t.cls);return`
        <span class="sd-pin ${d.has(t.id)?`sd-ring sd-ring--${t.cls}`:"sd-pin--missed"}"
          style="left:${b.u*100}%;top:${b.v*100}%;width:${I}%;--c:${R.color}">
          <span class="sd-ring-label">${k(R.label)}</span>
        </span>`}).join(""),T=new Set(s.spots.map(t=>t.cls)),F=wt.map(t=>{const b=it(t);return`<li class="${T.has(t)?"":"is-absent"}"><i class="sd-swatch" style="--c:${b.color}"></i>${b.label}</li>`}).join("")+(r.found<r.total?'<li><i class="sd-missed-key"></i>漏掉的位置</li>':""),w=r.total-r.found,A=document.createElement("section");A.className="sd-results",A.setAttribute("aria-label","結算"),A.innerHTML=`
      <div class="sd-res">
        <div class="sd-res-summary">
          <div class="sd-stars" role="img" aria-label="${c.stars} 顆星">${x}</div>
          <h2 class="sd-ribbon">${jt[c.stars]}</h2>
          ${$?`<p class="sd-reason">${$}</p>`:""}
          <div class="sd-res-top">
            <div class="sd-ringchart" role="img" aria-label="完成率 ${h}%">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle class="sd-ring-track" cx="60" cy="60" r="${dt}"/>
                <circle class="sd-ring-value" cx="60" cy="60" r="${dt}"
                  stroke-dasharray="${nt.toFixed(2)}" stroke-dashoffset="${nt.toFixed(2)}"/>
              </svg>
              <div class="sd-ring-text"><b><span class="sd-pct">${f?h:0}</span>%</b><small>完成率</small></div>
            </div>
            <ul class="sd-scores">${z}</ul>
          </div>
          <div class="sd-total-row"><span>總分</span><b class="sd-total">${f?c.score:0}</b><small>/ ${Mt}</small></div>
        </div>

        <div class="sd-figs ${u>1?"is-landscape":""}">
          <figure class="sd-fig">
            <h3>${w?`揭曉：還有 ${w} 處沒找到`:"你找到了每一處損壞"}</h3>
            <div class="sd-media sd-reveal" style="--ar:${u}">
              <img class="sd-base" src="${k(m.photo)}" alt="${k(s.name)}實拍照片" draggable="false">
              <img class="sd-gt" src="${k(m.gt)}" alt="" draggable="false">
              ${a}
            </div>
            <figcaption>
              <button class="sd-switch" type="button" role="switch" aria-checked="false">
                <span class="sd-switch-track" aria-hidden="true"><span></span></span>疊上專家標註
              </button>
              <ul class="sd-legend-inline">${F}</ul>
              <p class="sd-gt-note" hidden>這是研究團隊實際標註的病害位置與範圍，遊戲的題目就是從這裡挑出來的。</p>
            </figcaption>
          </figure>

          <figure class="sd-fig">
            <h3>修復前後對照</h3>
            <div class="sd-media sd-ba" style="--ar:${u};--pos:50%">
              <img src="${k(m.photo)}" alt="修復前的實拍照片" draggable="false">
              <div class="sd-ba-after ${o?"":"is-placeholder"}">
                ${o?`<img src="${k(m.restored)}" alt="AI 修復示意圖" draggable="false">`:`<img class="sd-base" src="${k(m.photo)}" alt="" draggable="false"><img class="sd-gt is-on" src="${k(m.gt)}" alt="病害標註（修復圖製作中）" draggable="false">`}
                <span class="sd-stamp ${o?"":"is-pending"}">${o?"已修復":"修復圖製作中"}</span>
              </div>
              <span class="sd-ba-tag sd-ba-tag--l">修復前</span>
              <span class="sd-ba-tag sd-ba-tag--r">${o?"修復後":"病害標註"}</span>
              <div class="sd-ba-handle" role="slider" tabindex="0" aria-label="拖曳比較修復前後"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50%">
                <span class="sd-ba-knob">${O.arrows}</span>
              </div>
            </div>
            <figcaption class="sd-note">
              修復圖為 AI 依實拍照片補繪之示意，非實際修復成果。
              ${o?"":"<br>AI 修復圖製作中，右側暫以專家標註的病害位置代替。"}
            </figcaption>
          </figure>
        </div>

        <div class="sd-res-actions">
          <button class="sd-btn sd-btn--ar sd-ar" type="button">${Ut}手機 AR 瀏覽<small>轉動手機看修復前後</small></button>
          <button class="sd-btn sd-btn--ghost sd-replay" type="button">${O.replay}再玩一次</button>
          <button class="sd-btn sd-btn--primary sd-continue" type="button">繼續探索${O.next}</button>
        </div>
      </div>`,i.replaceChildren(A);const M=t=>A.querySelector(t);let B=!0,U=0;f?(A.classList.add("is-shown","no-motion"),M(".sd-ring-value").style.strokeDashoffset=(nt*(1-c.rate)).toFixed(2)):U=requestAnimationFrame(()=>{U=requestAnimationFrame(()=>{A.classList.add("is-shown"),M(".sd-ring-value").style.strokeDashoffset=(nt*(1-c.rate)).toFixed(2),D(M(".sd-pct"),h,900),D(M(".sd-total"),c.score,1200)})});function D(t,b,I){const R=performance.now(),X=W=>{const V=Math.min(1,(W-R)/I);B&&(t.textContent=Math.round(b*(1-(1-V)**3)),V<1&&requestAnimationFrame(X))};requestAnimationFrame(X)}const P=M(".sd-switch");P.addEventListener("click",()=>{const t=P.getAttribute("aria-checked")!=="true";P.setAttribute("aria-checked",String(t)),M(".sd-reveal .sd-gt").classList.toggle("is-on",t),M(".sd-reveal").classList.toggle("is-gt",t),M(".sd-gt-note").hidden=!t});const S=M(".sd-ba"),E=M(".sd-ba-handle");let q=50,_=null;function H(t){q=Math.max(0,Math.min(100,t)),S.style.setProperty("--pos",`${q}%`),E.setAttribute("aria-valuenow",String(Math.round(q))),E.setAttribute("aria-valuetext",`${Math.round(q)}%`)}function C(t){const b=S.getBoundingClientRect();H((t.clientX-b.left)/b.width*100)}S.addEventListener("pointerdown",t=>{if(!(t.pointerType==="mouse"&&t.button!==0)){_=t.pointerId;try{S.setPointerCapture(t.pointerId)}catch{}S.classList.add("is-dragging"),C(t)}}),S.addEventListener("pointermove",t=>{_===t.pointerId&&C(t)});const j=t=>{_===t.pointerId&&(_=null,S.classList.remove("is-dragging"))};S.addEventListener("pointerup",j),S.addEventListener("pointercancel",j),E.addEventListener("keydown",t=>{const b=t.shiftKey?20:5;if(t.key==="ArrowLeft"||t.key==="ArrowDown")H(q-b);else if(t.key==="ArrowRight"||t.key==="ArrowUp")H(q+b);else if(t.key==="Home")H(0);else if(t.key==="End")H(100);else return;t.preventDefault()});const e=M(".sd-ar"),l=e.querySelector("small");let p=!1;e.addEventListener("click",async()=>{if(!p){p=!0,l.textContent="載入中…";try{const{openArViewer:t}=await xt(async()=>{const{openArViewer:b}=await import("./index-CysBXJu2.js");return{openArViewer:b}},__vite__mapDeps([0,1,2,3,4]),import.meta.url);if(!B)return;l.textContent="轉動手機看修復前後",A.inert=!0,await t(i,s)}catch(t){console.error(t),l.textContent="載入失敗，請再按一次"}finally{A.inert=!1,p=!1,B&&e.focus({preventScroll:!0})}}});const y=t=>{B=!1,cancelAnimationFrame(U),A.remove(),g(t)};M(".sd-replay").addEventListener("click",()=>y("replay")),M(".sd-continue").addEventListener("click",()=>y("continue")),M(".sd-continue").focus({preventScroll:!0})})}const Wt="./",Vt=1300,Kt=3600,Gt=15;function lt(i,s){return Wt+i.assets+s}function Zt(){const i=window.screen&&window.screen.width?window.screen.width:window.innerWidth,s=window.screen&&window.screen.height?window.screen.height:window.innerHeight;return Math.min(i,s,Math.max(window.innerWidth,window.innerHeight))<=600?800:1600}function $t(i){return new Promise((s,r)=>{const c=new Image;c.decoding="async",c.onload=()=>s(c),c.onerror=()=>r(new Error(`照片載入失敗：${i}`)),c.src=i})}async function Jt(i,s,{onExit:r}={}){const c=document.createElement("div");c.className="sd",i.appendChild(c);const m=Zt(),g={photo:lt(s,`photo-${m}.webp`),gt:lt(s,"gt-1600.png"),restored:s.restored?lt(s,`restored-${m}.webp`):null};let u=$t(g.photo);u.catch(()=>{});const d=()=>(g.photo=`${g.photo.split("?")[0]}?t=${Date.now()}`,u=$t(g.photo),u.catch(()=>{}),u);let h=null;try{for(;;){const o=await Qt(c,s,{urls:g,width:m,getPhoto:()=>u,reloadPhoto:d});if(o.aborted&&h)break;const f=Ot(o);if(h={id:s.id,found:o.found,total:o.total,rate:Math.round(f.rate*1e3)/1e3,stars:f.stars,score:f.score,misses:o.misses,hintsUsed:o.hintsUsed,timeLeft:o.timeLeft,completed:f.complete,aborted:o.aborted},o.aborted||await Yt(c,{artifact:s,stats:o,breakdown:f,urls:g})!=="replay")break}}finally{c.remove()}return r&&r(h),h}function Qt(i,s,{urls:r,width:c,getPhoto:m,reloadPhoto:g}){return new Promise(u=>{const d=s.aspect,h=c,o=Math.round(c/d),f=s.spots.map(n=>({...n,circle:ut(n.poly,d)})),$=f.length,x=s.timeLimit||Lt,z=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches,a={phase:"intro",found:new Set,misses:0,hintsUsed:0,hinted:new Set,remaining:x*1e3},T=new Set,F=(n,L)=>{const v=setTimeout(()=>{T.delete(v),n()},L);return T.add(v),v};i.innerHTML=`
      <section class="sd-play" aria-label="找碴：${k(s.name)}">
        <header class="sd-hud">
          <button class="sd-icon-btn sd-quit" type="button" aria-label="結束這一局">${O.close}</button>
          <div class="sd-heading">
            <span class="sd-building">${k(s.building)}・大家來找碴</span>
            <strong class="sd-name">${k(s.name)}</strong>
          </div>
          <div class="sd-timer" role="timer" aria-label="剩餘時間">${O.clock}<span class="sd-time">${bt(x)}</span></div>
          <div class="sd-timebar" aria-hidden="true"><span></span></div>
        </header>
        <div class="sd-stage">
          <div class="sd-content"><img class="sd-photo" alt="${k(s.name)}實拍照片" draggable="false"></div>
          <div class="sd-marks" aria-hidden="true"></div>
          <div class="sd-toast" role="status" aria-live="polite"></div>
          <div class="sd-banner" hidden></div>
          ${te(s,$,x,z)}
        </div>
        <footer class="sd-bar">
          <div class="sd-found">
            <span class="sd-dots">${f.map(()=>'<i class="sd-dot"></i>').join("")}</span>
            <span class="sd-count">找到 <b>0</b> / ${$}</span>
          </div>
          <div class="sd-tools">
            <button class="sd-icon-btn sd-zoom-out" type="button" aria-label="縮小">${O.zoomOut}</button>
            <button class="sd-icon-btn sd-zoom-fit" type="button" aria-label="看整張">${O.fit}</button>
            <button class="sd-icon-btn sd-zoom-in" type="button" aria-label="放大">${O.zoomIn}</button>
            <button class="sd-btn sd-btn--hint sd-hint" type="button" aria-label="提示，剩 ${tt} 次">${O.bulb}<span>提示</span><b class="sd-hint-n">${tt}</b></button>
          </div>
        </footer>
      </section>`;const w=n=>i.querySelector(n),A=w(".sd-stage"),M=w(".sd-content"),B=w(".sd-photo"),U=w(".sd-marks"),D=w(".sd-toast"),P=w(".sd-banner"),S=w(".sd-intro"),E=w(".sd-start"),q=w(".sd-time"),_=w(".sd-timer"),H=w(".sd-timebar span"),C=w(".sd-hint"),j=w(".sd-hint-n"),e=[...i.querySelectorAll(".sd-dot")],l=w(".sd-count b"),p=[],y=zt(A,M,{onTap:At,onChange:I});y.setContentSize(h,o);function t(n){E.disabled=!0,E.textContent="照片載入中…",S.querySelector(".sd-intro-error").hidden=!0,n.then(()=>{a.phase==="intro"&&(B.src=r.photo,E.disabled=!1,E.textContent="開始找碴",E.focus({preventScroll:!0}))},()=>{a.phase==="intro"&&(E.textContent="重新載入",E.disabled=!1,E.dataset.retry="1",S.querySelector(".sd-intro-error").hidden=!1)})}t(m());function b(n){const L=y.toScreen(n.u,n.v),v=Math.max(n.min,2*n.r*y.displayWidth*n.pad);n.el.style.width=`${v}px`,n.el.style.height=`${v}px`,n.el.style.left=`${L.x-v/2}px`,n.el.style.top=`${L.y-v/2}px`}function I(){for(const n of p)b(n)}function R(n,L,v,N,{min:K=0,pad:G=1,ttl:Y=0}={}){const J={el:n,u:L,v,r:N,min:K,pad:G};return p.push(J),U.appendChild(n),b(J),Y&&F(()=>{n.remove(),p.splice(p.indexOf(J),1)},Y),J}function X(n){a.found.add(n.id);const L=it(n.cls),v=document.createElement("div");v.className=`sd-ring sd-ring--${n.cls}`,v.innerHTML=`<span class="sd-ring-label">${k(L.label)}</span>`,R(v,n.circle.u,n.circle.v,n.circle.r,{min:44,pad:1.15});const N=e[f.indexOf(n)];N.classList.add("is-found"),N.style.setProperty("--c",L.color),l.textContent=a.found.size,V(`<i class="sd-shape sd-shape--${n.cls}"></i><b>${k(L.label)}</b><span>${k(n.explain||L.explain)}</span>`,"is-found")}function W(n,L){const v=document.createElement("div");v.className="sd-miss",v.innerHTML=`<b class="sd-miss-pts">−${ht}</b>`,R(v,n,L,0,{min:34,ttl:1e3})}function V(n,L=""){D.innerHTML=n,D.className=`sd-toast is-shown ${L}`,clearTimeout(D._t),D._t=F(()=>{D.className="sd-toast"},Kt)}function Et(n,L=""){P.textContent=n,P.className=`sd-banner ${L}`,P.hidden=!1}let et=0,at=0;function pt(){const n=a.remaining/1e3;q.textContent=bt(n),H.style.transform=`scaleX(${Math.max(0,n/x)})`,_.classList.toggle("is-low",n<=Gt&&a.phase==="play")}function mt(n){if(a.phase==="play"&&(a.remaining-=Math.min(250,Math.max(0,n-at))),at=n,pt(),a.phase==="play"&&a.remaining<=0){a.remaining=0,pt(),Z("time");return}a.phase==="play"&&(et=requestAnimationFrame(mt))}function kt(){if(E.dataset.retry){delete E.dataset.retry,t(g());return}a.phase="play",S.remove(),A.classList.add("is-playing"),st(),at=performance.now(),et=requestAnimationFrame(mt)}function At(n,L){if(a.phase!=="play")return;const v=y.toImage(n,L);if(!v.inside)return;const N=[v.u,v.v],K=Bt(Pt,y.displayWidth),G=vt(N,f.filter(Y=>!a.found.has(Y.id)),{aspect:d,tol:K});if(G){X(G.spot),a.found.size===$&&Z("all");return}if(vt(N,f.filter(Y=>a.found.has(Y.id)),{aspect:d,tol:K})){V("<span>這裡已經找到了，看看別的地方。</span>");return}a.misses+=1,W(v.u,v.v)}function st(){const n=tt-a.hintsUsed;j.textContent=n,C.disabled=n<=0||a.phase!=="play",C.setAttribute("aria-label",`提示，剩 ${n} 次（每次扣 ${ot} 分）`)}function ft(){if(a.phase!=="play"||a.hintsUsed>=tt)return;const n=f.filter(Q=>!a.found.has(Q.id));if(!n.length)return;const L=n.filter(Q=>!a.hinted.has(Q.id)),v=(L.length?L:n).sort((Q,It)=>It.pixels-Q.pixels)[0];a.hinted.add(v.id),a.hintsUsed+=1,st();const N=Math.max(.14,v.circle.r*2.2),K=Math.random()*Math.PI*2,G=Math.random()*N*.45,Y=Math.min(1,Math.max(0,v.circle.u+Math.cos(K)*G)),J=Math.min(1,Math.max(0,v.circle.v+Math.sin(K)*G*d));y.isVisible(v.circle.u,v.circle.v,30)||y.fit();const yt=document.createElement("div");yt.className="sd-glow",R(yt,Y,J,N,{min:120,ttl:2600}),V(`<span>損壞就在發光的範圍附近（正確度 −${ot}）</span>`,"is-hint")}function Z(n){if(a.phase!=="play"&&!(a.phase==="intro"&&n==="abort"))return;const L=a.phase==="intro";a.phase="end",cancelAnimationFrame(et),st(),_.classList.remove("is-low");const v={all:"全部找到了！",time:"時間到！"}[n];v&&Et(v,`is-end is-${n}`);const N={found:a.found.size,foundIds:[...a.found],total:$,misses:a.misses,hintsUsed:a.hintsUsed,timeLeft:Math.max(0,Math.ceil(a.remaining/1e3)),timeLimit:x,reason:n,aborted:L};F(()=>{St(),u(N)},v?Vt:0)}E.addEventListener("click",kt),S.querySelector(".sd-back").addEventListener("click",()=>Z("abort"));const rt=w(".sd-quit");let ct=0;rt.addEventListener("click",()=>{if(a.phase==="intro"){Z("abort");return}if(a.phase==="play"){if(ct){Z("quit");return}rt.classList.add("is-armed"),V("<span>再按一次 ✕ 結束這一局，直接看結算。</span>"),ct=F(()=>{ct=0,rt.classList.remove("is-armed")},2500)}}),w(".sd-zoom-in").addEventListener("click",()=>y.zoomBy(1.6)),w(".sd-zoom-out").addEventListener("click",()=>y.zoomBy(1/1.6)),w(".sd-zoom-fit").addEventListener("click",()=>y.fit()),C.addEventListener("click",ft),st(),C.disabled=!0;function gt(n){if(!(n.ctrlKey||n.metaKey||n.altKey)&&(a.phase==="intro"&&n.key==="Escape"&&Z("abort"),a.phase==="play")){if(n.key==="+"||n.key==="=")y.zoomBy(1.6);else if(n.key==="-"||n.key==="_")y.zoomBy(1/1.6);else if(n.key==="0")y.fit();else if(n.key==="h"||n.key==="H")ft();else return;n.preventDefault()}}window.addEventListener("keydown",gt);function St(){cancelAnimationFrame(et);for(const n of T)clearTimeout(n);T.clear(),window.removeEventListener("keydown",gt),y.destroy()}})}function te(i,s,r,c){const m=r%60===0?`${r/60} 分鐘`:`${r} 秒`,g=new Set(i.spots.map(d=>d.cls)),u=wt.filter(d=>g.has(d)).map(d=>{const h=it(d);return`<li><i class="sd-shape sd-shape--${d}"></i><b>${h.label}</b><span>${h.explain}</span></li>`}).join("");return`
    <div class="sd-intro" data-no-pan role="dialog" aria-modal="true" aria-labelledby="sd-intro-title">
      <div class="sd-intro-card">
        <p class="sd-kicker">${k(i.building)}・${k(i.name)}</p>
        <h2 id="sd-intro-title">找出 ${s} 處損壞</h2>
        <p class="sd-intro-sub">這是文物的實拍照片。研究團隊在照片上標註了真實的病害，請把它們找出來。</p>
        <ul class="sd-legend">${u}</ul>
        <ul class="sd-rules">
          <li>限時 ${m}，提示 ${tt} 次（每次扣正確度 ${ot} 分）</li>
          <li>${c?"雙指縮放、單指拖曳":"滾輪縮放、拖曳移動"}，點一下標出損壞處</li>
          <li>點錯會打 ✕，每次扣正確度 ${ht} 分</li>
        </ul>
        <p class="sd-intro-error" role="alert" hidden>照片載入失敗，請檢查網路後重新載入。</p>
        <div class="sd-actions">
          <button class="sd-btn sd-btn--ghost sd-back" type="button">返回探索</button>
          <button class="sd-btn sd-btn--primary sd-start" type="button" disabled>照片載入中…</button>
        </div>
      </div>
    </div>`}async function ne(i,s,{onExit:r}={}){if(!i)throw new Error("openSpotDiff：缺少容器元素");if(!s||!Array.isArray(s.spots)||!s.spots.length)throw new Error(`openSpotDiff：${s&&s.id} 沒有可玩的熱區`);return Jt(i,s,{onExit:r})}async function ie(){const i=await xt(()=>import("./artifacts-DO3wNIRp.js"),[],import.meta.url);return(i.default||i).artifacts}export{ie as loadArtifacts,ne as openSpotDiff};
