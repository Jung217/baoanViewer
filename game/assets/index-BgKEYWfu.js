const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-CZ7s7z9i.js","./game-CSCug4kG.js","./game-JFZU3gXx.css","./index-BuKmfV6T.css"])))=>i.map(i=>d[i]);
import{I as H,c as at,e as T,C as xt,_ as Mt,S as Tt,f as vt}from"./game-CSCug4kG.js";const _t=220;function zt(n,e,{maxZoom:r=6,tapSlop:c=8,onTap:p=null,onChange:y=null}={}){let u=1,l=1,h=1,o=1,f=0,$=0,w=null,P=0;const a=new Map,z=()=>n.getBoundingClientRect();function F(){const t=z();h=Math.min(t.width/u,t.height/l)||1}function M(t){return Math.max(h,Math.min(h*r,t))}function S(){const t=z(),d=u*o,m=l*o;f=d<=t.width?(t.width-d)/2:Math.min(0,Math.max(t.width-d,f)),$=m<=t.height?(t.height-m)/2:Math.min(0,Math.max(t.height-m,$))}function x(){S(),e.style.transform=`translate(${f}px, ${$}px) scale(${o})`,n.classList.toggle("is-zoomed",o>h*1.01),y&&y()}function B(){P&&cancelAnimationFrame(P),P=0}function O(t,d,m){if(B(),window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){o=t,f=d,$=m,x();return}const b={scale:o,x:f,y:$},k=performance.now(),C=i=>{const L=Math.min(1,(i-k)/_t),U=1-(1-L)**3;o=b.scale+(t-b.scale)*U,f=b.x+(d-b.x)*U,$=b.y+(m-b.y)*U,x(),P=L<1?requestAnimationFrame(C):0};P=requestAnimationFrame(C)}function q(t,d,m,g=!1){const b=M(o*t),k=(d-f)/o,C=(m-$)/o;g?O(b,d-k*b,m-C*b):(o=b,f=d-k*b,$=m-C*b,x())}function R(t,d){const m=z();return[t-m.left,d-m.top]}function X(){const[t,d]=[...a.values()],[m,g]=R((t.x+d.x)/2,(t.y+d.y)/2);w={type:"pinch",dist:Math.hypot(t.x-d.x,t.y-d.y)||1,scale:o,cx:(m-f)/o,cy:(g-$)/o}}function I(t){if(!(t.pointerType==="mouse"&&t.button!==0)&&!(t.target.closest&&t.target.closest("button, a, input, select, textarea, [data-no-pan]"))){B();try{n.setPointerCapture(t.pointerId)}catch{}a.set(t.pointerId,{x:t.clientX,y:t.clientY}),a.size===1?w={type:"tap",sx:t.clientX,sy:t.clientY,ox:f,oy:$}:a.size===2&&X()}}function V(t){const d=a.get(t.pointerId);if(!d||!w)return;if(d.x=t.clientX,d.y=t.clientY,w.type==="pinch"){if(a.size<2)return;const[b,k]=[...a.values()],[C,i]=R((b.x+k.x)/2,(b.y+k.y)/2);o=M(w.scale*Math.hypot(b.x-k.x,b.y-k.y)/w.dist),f=C-w.cx*o,$=i-w.cy*o,x();return}const m=t.clientX-w.sx,g=t.clientY-w.sy;w.type==="tap"&&Math.hypot(m,g)>c&&(w.type="pan",n.classList.add("is-dragging")),w.type==="pan"&&(f=w.ox+m,$=w.oy+g,x())}function A(t){if(!a.has(t.pointerId))return;a.delete(t.pointerId);const d=w;if(d&&d.type==="tap"&&t.type==="pointerup"&&p&&p(t.clientX,t.clientY,t),a.size===1&&d&&d.type==="pinch"){const[m]=[...a.values()];w={type:"pan",sx:m.x,sy:m.y,ox:f,oy:$}}else a.size===0&&(w=null,n.classList.remove("is-dragging"))}function Y(t){t.preventDefault(),B();const d=t.deltaMode===1?.05:t.deltaMode===2?1:.0015,[m,g]=R(t.clientX,t.clientY);q(Math.exp(-t.deltaY*d),m,g)}const _=t=>t.preventDefault();n.addEventListener("pointerdown",I),n.addEventListener("pointermove",V),n.addEventListener("pointerup",A),n.addEventListener("pointercancel",A),n.addEventListener("lostpointercapture",A),n.addEventListener("wheel",Y,{passive:!1}),n.addEventListener("gesturestart",_),n.addEventListener("contextmenu",_);const D=typeof ResizeObserver=="function"?new ResizeObserver(()=>{const t=z();if(!t.width||!t.height)return;const d=o/h,m=(t.width/2-f)/o,g=(t.height/2-$)/o;F(),o=M(h*d),f=t.width/2-m*o,$=t.height/2-g*o,x()}):null;return D&&D.observe(n),{setContentSize(t,d){u=t,l=d,e.style.width=`${t}px`,e.style.height=`${d}px`,F(),o=h,x()},fit(){F();const t=z();O(h,(t.width-u*h)/2,(t.height-l*h)/2)},zoomBy(t){const d=z();q(t,d.width/2,d.height/2,!0)},centerOn(t,d){const m=z(),g=m.width/2-t*u*o,b=m.height/2-d*l*o,k={x:f,y:$};f=g,$=b,S();const C={x:f,y:$};f=k.x,$=k.y,O(o,C.x,C.y)},toImage(t,d){const[m,g]=R(t,d),b=(m-f)/(u*o),k=(g-$)/(l*o);return{u:b,v:k,inside:b>=0&&b<=1&&k>=0&&k<=1}},toScreen(t,d){return{x:f+t*u*o,y:$+d*l*o}},isVisible(t,d,m=0){const g=z(),b=this.toScreen(t,d);return b.x>=m&&b.y>=m&&b.x<=g.width-m&&b.y<=g.height-m},get displayWidth(){return u*o},get zoom(){return o/h},get maxZoom(){return r},destroy(){B(),D&&D.disconnect(),n.removeEventListener("pointerdown",I),n.removeEventListener("pointermove",V),n.removeEventListener("pointerup",A),n.removeEventListener("pointercancel",A),n.removeEventListener("lostpointercapture",A),n.removeEventListener("wheel",Y),n.removeEventListener("gesturestart",_),n.removeEventListener("contextmenu",_)}}}const Ct=40;function Pt([n,e],r){if(!r||r.length<3)return!1;let c=!1;for(let p=0,y=r.length-1;p<r.length;y=p++){const[u,l]=r[p],[h,o]=r[y];l>e!=o>e&&n<(h-u)*(e-l)/(o-l)+u&&(c=!c)}return c}function Rt(n,e,r,c,p,y){const u=p-r,l=y-c,h=u*u+l*l,o=h?Math.max(0,Math.min(1,((n-r)*u+(e-c)*l)/h)):0;return Math.hypot(n-(r+o*u),e-(c+o*l))}function Nt(n,e,r=1){if(!e||!e.length)return 1/0;if(Pt(n,e))return 0;const c=n[0],p=n[1]/r;if(e.length===1)return Math.hypot(c-e[0][0],p-e[0][1]/r);let y=1/0;for(let u=0,l=e.length-1;u<e.length;l=u++){const h=Rt(c,p,e[l][0],e[l][1]/r,e[u][0],e[u][1]/r);h<y&&(y=h)}return y}function Bt(n,e){return e>0?n/e:0}function $t(n,e,{aspect:r=1,tol:c=0}={}){let p=null;for(const y of e){const u=Nt(n,y.poly,r);if(u>c)continue;const l=ht(y.poly,r),h=Math.hypot(n[0]-l.u,(n[1]-l.v)/r);(!p||u<p.dist||u===p.dist&&h<p.centerDist)&&(p={spot:y,dist:u,centerDist:h})}return p&&{spot:p.spot,dist:p.dist}}function ht(n,e=1){let r=1/0,c=1/0,p=-1/0,y=-1/0;for(const[l,h]of n)l<r&&(r=l),l>p&&(p=l),h<c&&(c=h),h>y&&(y=h);const u=Math.hypot(p-r,(y-c)/e)/2;return{u:(r+p)/2,v:(c+y)/2,r:u}}const Lt=200,qt=[.4,.7,1],rt=10,Et=120,nt=2,pt=5,Dt=1e-9;function Ft(n,e){return e?Math.max(0,Math.min(1,n/e)):0}function Ht(n){return qt.filter(e=>n+Dt>=e).length}function Ot({found:n,total:e,misses:r=0,hintsUsed:c=0,timeLeft:p=0,timeLimit:y=Et}){const u=Ft(n,e),l=e>0&&n>=e,h=Math.round(100*u),o=y>0?Math.max(0,Math.min(1,p/y)):0,f=l?Math.round(50*o):0,$=pt*r,w=n>0?Math.max(0,50-$):0,P=rt*c,a=Math.max(0,Math.round(w-P));return{rate:u,stars:Ht(u),completion:h,timeBonus:f,accuracy:a,accuracyRaw:Math.round(w),missPenalty:$,hintPenalty:P,score:Math.min(Lt,h+f+a),complete:l}}const Ut='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2M4.5 8a9 9 0 0 0 0 8M19.5 8a9 9 0 0 1 0 8"/></svg>',ut=52,ot=2*Math.PI*ut,jt=["再試一次！","還差一點！","眼力很好！","全部找到！"],Xt={time:"時間到",quit:"提前結束",all:""};function Yt(n,{artifact:e,stats:r,breakdown:c,urls:p}){return new Promise(y=>{const u=e.aspect,l=new Set(r.foundIds),h=Math.round(c.rate*100),o=!!p.restored,f=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,$=Xt[r.reason]||"",w=[0,1,2].map(i=>`
      <svg class="sd-star ${i<c.stars?"is-on":""}" style="--i:${i}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="${Tt}"/>
      </svg>`).join(""),P=[{label:"找到損壞",value:c.completion,ok:c.completion>0,note:`${r.found} / ${r.total} 處`},{label:"時間獎勵",value:c.timeBonus,ok:c.timeBonus>0,note:c.complete?`剩 ${r.timeLeft} 秒`:"全部找到才有"},{label:"正確度",value:c.accuracy,ok:c.accuracy>0,note:`誤點 ${r.misses} 次${r.misses?` −${c.missPenalty}`:""}${r.hintsUsed?`・提示 ${r.hintsUsed} 次 −${c.hintPenalty}`:""}`}].map(i=>`
      <li class="${i.ok?"is-ok":""}">
        <span class="sd-check">${H.check}</span>
        <span class="sd-row-label">${i.label}<small>${i.note}</small></span>
        <b>+${i.value}</b>
      </li>`).join(""),a=e.spots.map(i=>{const L=ht(i.poly,u),U=Math.max(.08,2*L.r*1.2)*100,j=at(i.cls);return`
        <span class="sd-pin ${l.has(i.id)?`sd-ring sd-ring--${i.cls}`:"sd-pin--missed"}"
          style="left:${L.u*100}%;top:${L.v*100}%;width:${U}%;--c:${j.color}">
          <span class="sd-ring-label">${T(j.label)}</span>
        </span>`}).join(""),z=new Set(e.spots.map(i=>i.cls)),F=xt.map(i=>{const L=at(i);return`<li class="${z.has(i)?"":"is-absent"}"><i class="sd-swatch" style="--c:${L.color}"></i>${L.label}</li>`}).join("")+(r.found<r.total?'<li><i class="sd-missed-key"></i>漏掉的位置</li>':""),M=r.total-r.found,S=document.createElement("section");S.className="sd-results",S.setAttribute("aria-label","結算"),S.innerHTML=`
      <div class="sd-res">
        <div class="sd-res-summary">
          <div class="sd-stars" role="img" aria-label="${c.stars} 顆星">${w}</div>
          <h2 class="sd-ribbon">${jt[c.stars]}</h2>
          ${$?`<p class="sd-reason">${$}</p>`:""}
          <div class="sd-res-top">
            <div class="sd-ringchart" role="img" aria-label="完成率 ${h}%">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle class="sd-ring-track" cx="60" cy="60" r="${ut}"/>
                <circle class="sd-ring-value" cx="60" cy="60" r="${ut}"
                  stroke-dasharray="${ot.toFixed(2)}" stroke-dashoffset="${ot.toFixed(2)}"/>
              </svg>
              <div class="sd-ring-text"><b><span class="sd-pct">${f?h:0}</span>%</b><small>完成率</small></div>
            </div>
            <ul class="sd-scores">${P}</ul>
          </div>
          <div class="sd-total-row"><span>總分</span><b class="sd-total">${f?c.score:0}</b><small>/ ${Lt}</small></div>
        </div>

        <div class="sd-figs ${u>1?"is-landscape":""}">
          <figure class="sd-fig">
            <h3>${M?`揭曉：還有 ${M} 處沒找到`:"你找到了每一處損壞"}</h3>
            <div class="sd-media sd-reveal" style="--ar:${u}">
              <img class="sd-base" src="${T(p.photo)}" alt="${T(e.name)}實拍照片" draggable="false">
              <img class="sd-gt" src="${T(p.gt)}" alt="" draggable="false">
              ${a}
            </div>
            <figcaption>
              <button class="sd-switch" type="button" role="switch" aria-checked="false">
                <span class="sd-switch-track" aria-hidden="true"><span></span></span>疊上專家標註
              </button>
              <ul class="sd-legend-inline">${F}</ul>
              <p class="sd-gt-note" hidden>這是研究團隊實際標註的劣化位置與範圍，遊戲的題目就是從這裡挑出來的。</p>
            </figcaption>
          </figure>

          <figure class="sd-fig">
            <div class="sd-fig-head">
              <h3>修復前後對照</h3>
              <div class="sd-seg" role="radiogroup" aria-label="右側顯示">
                <button type="button" role="radio" data-view="restored" ${o?"":'disabled title="修復圖製作中"'}>修復後</button>
                <button type="button" role="radio" data-view="gt">劣化標註</button>
              </div>
            </div>
            <div class="sd-media sd-ba" style="--ar:${u};--pos:50%">
              <img src="${T(p.photo)}" alt="修復前的實拍照片" draggable="false">
              <div class="sd-ba-after">
                ${o?`<img class="sd-ba-restored" src="${T(p.restored)}" alt="AI 修復示意圖" draggable="false">`:""}
                <div class="sd-ba-gtlayer">
                  <img class="sd-base" src="${T(p.photo)}" alt="" draggable="false">
                  <img class="sd-gt is-on" src="${T(p.gt)}" alt="研究團隊標註的劣化位置" draggable="false">
                </div>
                <span class="sd-stamp">已修復</span>
              </div>
              <span class="sd-ba-tag sd-ba-tag--l">修復前</span>
              <span class="sd-ba-tag sd-ba-tag--r"></span>
              <div class="sd-ba-handle" role="slider" tabindex="0" aria-label="拖曳比較修復前後"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50%">
                <span class="sd-ba-knob">${H.arrows}</span>
              </div>
            </div>
            <figcaption class="sd-note">
              修復圖為 AI 依實拍照片補繪之示意，非實際修復成果。
              ${o?"":"<br>這件文物的 AI 修復圖還在製作中，目前只能看劣化標註。"}
            </figcaption>
          </figure>
        </div>

        <div class="sd-res-actions">
          <button class="sd-btn sd-btn--ar sd-ar" type="button">${Ut}手機 AR 瀏覽<small>轉動手機看修復前後</small></button>
          <button class="sd-btn sd-btn--ghost sd-replay" type="button">${H.replay}再玩一次</button>
          <button class="sd-btn sd-btn--primary sd-continue" type="button">繼續探索${H.next}</button>
        </div>
      </div>`,n.replaceChildren(S);const x=i=>S.querySelector(i);let B=!0,O=0;f?(S.classList.add("is-shown","no-motion"),x(".sd-ring-value").style.strokeDashoffset=(ot*(1-c.rate)).toFixed(2)):O=requestAnimationFrame(()=>{O=requestAnimationFrame(()=>{S.classList.add("is-shown"),x(".sd-ring-value").style.strokeDashoffset=(ot*(1-c.rate)).toFixed(2),q(x(".sd-pct"),h,900),q(x(".sd-total"),c.score,1200)})});function q(i,L,U){const j=performance.now(),et=Z=>{const J=Math.min(1,(Z-j)/U);B&&(i.textContent=Math.round(L*(1-(1-J)**3)),J<1&&requestAnimationFrame(et))};requestAnimationFrame(et)}const R=x(".sd-switch");R.addEventListener("click",()=>{const i=R.getAttribute("aria-checked")!=="true";R.setAttribute("aria-checked",String(i)),x(".sd-reveal .sd-gt").classList.toggle("is-on",i),x(".sd-reveal").classList.toggle("is-gt",i),x(".sd-gt-note").hidden=!i});const X=x(".sd-ba-after"),I=[...S.querySelectorAll(".sd-seg button")];function V(i){X.dataset.view=i,x(".sd-ba-tag--r").textContent=i==="restored"?"修復後":"劣化標註";for(const L of I)L.setAttribute("aria-checked",String(L.dataset.view===i))}for(const i of I)i.addEventListener("click",()=>V(i.dataset.view));V(o?"restored":"gt");const A=x(".sd-ba"),Y=x(".sd-ba-handle");let _=50,D=null;function t(i){_=Math.max(0,Math.min(100,i)),A.style.setProperty("--pos",`${_}%`),Y.setAttribute("aria-valuenow",String(Math.round(_))),Y.setAttribute("aria-valuetext",`${Math.round(_)}%`)}function d(i){const L=A.getBoundingClientRect();t((i.clientX-L.left)/L.width*100)}A.addEventListener("pointerdown",i=>{if(!(i.pointerType==="mouse"&&i.button!==0)){D=i.pointerId;try{A.setPointerCapture(i.pointerId)}catch{}A.classList.add("is-dragging"),d(i)}}),A.addEventListener("pointermove",i=>{D===i.pointerId&&d(i)});const m=i=>{D===i.pointerId&&(D=null,A.classList.remove("is-dragging"))};A.addEventListener("pointerup",m),A.addEventListener("pointercancel",m),Y.addEventListener("keydown",i=>{const L=i.shiftKey?20:5;if(i.key==="ArrowLeft"||i.key==="ArrowDown")t(_-L);else if(i.key==="ArrowRight"||i.key==="ArrowUp")t(_+L);else if(i.key==="Home")t(0);else if(i.key==="End")t(100);else return;i.preventDefault()});const g=x(".sd-ar"),b=g.querySelector("small");let k=!1;g.addEventListener("click",async()=>{if(!k){k=!0,b.textContent="載入中…";try{const{openArViewer:i}=await Mt(async()=>{const{openArViewer:L}=await import("./index-CZ7s7z9i.js");return{openArViewer:L}},__vite__mapDeps([0,1,2,3]),import.meta.url);if(!B)return;b.textContent="轉動手機看修復前後",S.inert=!0,await i(n,e)}catch(i){console.error(i),b.textContent="載入失敗，請再按一次"}finally{S.inert=!1,k=!1,B&&g.focus({preventScroll:!0})}}});const C=i=>{B=!1,cancelAnimationFrame(O),S.remove(),y(i)};x(".sd-replay").addEventListener("click",()=>C("replay")),x(".sd-continue").addEventListener("click",()=>C("continue")),x(".sd-continue").focus({preventScroll:!0})})}const Wt="./",Vt=1300,Kt=3600,Gt=15;function lt(n,e){return Wt+n.assets+e}function Zt(){const n=window.screen&&window.screen.width?window.screen.width:window.innerWidth,e=window.screen&&window.screen.height?window.screen.height:window.innerHeight;return Math.min(n,e,Math.max(window.innerWidth,window.innerHeight))<=600?800:1600}function wt(n){return new Promise((e,r)=>{const c=new Image;c.decoding="async",c.onload=()=>e(c),c.onerror=()=>r(new Error(`照片載入失敗：${n}`)),c.src=n})}async function Jt(n,e,{onExit:r}={}){const c=document.createElement("div");c.className="sd",n.appendChild(c);const p=Zt(),y={photo:lt(e,`photo-${p}.webp`),gt:lt(e,"gt-1600.png"),restored:e.restored?lt(e,`restored-${p}.webp`):null};let u=wt(y.photo);u.catch(()=>{});const l=()=>(y.photo=`${y.photo.split("?")[0]}?t=${Date.now()}`,u=wt(y.photo),u.catch(()=>{}),u);let h=null;try{for(;;){const o=await Qt(c,e,{urls:y,width:p,getPhoto:()=>u,reloadPhoto:l});if(o.aborted&&h)break;const f=Ot(o);if(h={id:e.id,found:o.found,total:o.total,rate:Math.round(f.rate*1e3)/1e3,stars:f.stars,score:f.score,misses:o.misses,hintsUsed:o.hintsUsed,timeLeft:o.timeLeft,completed:f.complete,aborted:o.aborted},o.aborted||await Yt(c,{artifact:e,stats:o,breakdown:f,urls:y})!=="replay")break}}finally{c.remove()}return r&&r(h),h}function Qt(n,e,{urls:r,width:c,getPhoto:p,reloadPhoto:y}){return new Promise(u=>{const l=e.aspect,h=c,o=Math.round(c/l),f=e.spots.map(s=>({...s,circle:ht(s.poly,l)})),$=f.length,w=e.timeLimit||Et,P=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches,a={phase:"intro",found:new Set,misses:0,hintsUsed:0,hinted:new Set,remaining:w*1e3},z=new Set,F=(s,E)=>{const v=setTimeout(()=>{z.delete(v),s()},E);return z.add(v),v};n.innerHTML=`
      <section class="sd-play" aria-label="找碴：${T(e.name)}">
        <header class="sd-hud">
          <button class="sd-icon-btn sd-quit" type="button" aria-label="結束這一局">${H.close}</button>
          <div class="sd-heading">
            <span class="sd-building">${T(e.building)}・大家來找碴</span>
            <strong class="sd-name">${T(e.name)}</strong>
          </div>
          <div class="sd-timer" role="timer" aria-label="剩餘時間">${H.clock}<span class="sd-time">${vt(w)}</span></div>
          <div class="sd-timebar" aria-hidden="true"><span></span></div>
        </header>
        <div class="sd-stage">
          <div class="sd-content"><img class="sd-photo" alt="${T(e.name)}實拍照片" draggable="false"></div>
          <div class="sd-marks" aria-hidden="true"></div>
          <div class="sd-toast" role="status" aria-live="polite"></div>
          <div class="sd-banner" hidden></div>
          ${te(e,$,w,P)}
        </div>
        <footer class="sd-bar">
          <div class="sd-found">
            <span class="sd-dots">${f.map(()=>'<i class="sd-dot"></i>').join("")}</span>
            <span class="sd-count">找到 <b>0</b> / ${$}</span>
          </div>
          <div class="sd-tools">
            <button class="sd-icon-btn sd-zoom-out" type="button" aria-label="縮小">${H.zoomOut}</button>
            <button class="sd-icon-btn sd-zoom-fit" type="button" aria-label="看整張">${H.fit}</button>
            <button class="sd-icon-btn sd-zoom-in" type="button" aria-label="放大">${H.zoomIn}</button>
            <button class="sd-btn sd-btn--hint sd-hint" type="button" aria-label="提示，剩 ${nt} 次">${H.bulb}<span>提示</span><b class="sd-hint-n">${nt}</b></button>
          </div>
        </footer>
      </section>`;const M=s=>n.querySelector(s),S=M(".sd-stage"),x=M(".sd-content"),B=M(".sd-photo"),O=M(".sd-marks"),q=M(".sd-toast"),R=M(".sd-banner"),X=M(".sd-intro"),I=M(".sd-start"),V=M(".sd-time"),A=M(".sd-timer"),Y=M(".sd-timebar span"),_=M(".sd-hint"),D=M(".sd-hint-n"),t=[...n.querySelectorAll(".sd-dot")],d=M(".sd-count b"),m=[],g=zt(S,x,{onTap:At,onChange:C});g.setContentSize(h,o);function b(s){I.disabled=!0,I.textContent="照片載入中…",X.querySelector(".sd-intro-error").hidden=!0,s.then(()=>{a.phase==="intro"&&(B.src=r.photo,I.disabled=!1,I.textContent="開始找碴",I.focus({preventScroll:!0}))},()=>{a.phase==="intro"&&(I.textContent="重新載入",I.disabled=!1,I.dataset.retry="1",X.querySelector(".sd-intro-error").hidden=!1)})}b(p());function k(s){const E=g.toScreen(s.u,s.v),v=Math.max(s.min,2*s.r*g.displayWidth*s.pad);s.el.style.width=`${v}px`,s.el.style.height=`${v}px`,s.el.style.left=`${E.x-v/2}px`,s.el.style.top=`${E.y-v/2}px`}function C(){for(const s of m)k(s)}function i(s,E,v,N,{min:K=0,pad:G=1,ttl:W=0}={}){const tt={el:s,u:E,v,r:N,min:K,pad:G};return m.push(tt),O.appendChild(s),k(tt),W&&F(()=>{s.remove(),m.splice(m.indexOf(tt),1)},W),tt}function L(s){a.found.add(s.id);const E=at(s.cls),v=document.createElement("div");v.className=`sd-ring sd-ring--${s.cls}`,v.innerHTML=`<span class="sd-ring-label">${T(E.label)}</span>`,i(v,s.circle.u,s.circle.v,s.circle.r,{min:44,pad:1.15});const N=t[f.indexOf(s)];N.classList.add("is-found"),N.style.setProperty("--c",E.color),d.textContent=a.found.size,j(`<i class="sd-shape sd-shape--${s.cls}"></i><b>${T(E.label)}</b><span>${T(s.explain||E.explain)}</span>`,"is-found")}function U(s,E){const v=document.createElement("div");v.className="sd-miss",v.innerHTML=`<b class="sd-miss-pts">−${pt}</b>`,i(v,s,E,0,{min:34,ttl:1e3})}function j(s,E=""){q.innerHTML=s,q.className=`sd-toast is-shown ${E}`,clearTimeout(q._t),q._t=F(()=>{q.className="sd-toast"},Kt)}function et(s,E=""){R.textContent=s,R.className=`sd-banner ${E}`,R.hidden=!1}let Z=0,J=0;function mt(){const s=a.remaining/1e3;V.textContent=vt(s),Y.style.transform=`scaleX(${Math.max(0,s/w)})`,A.classList.toggle("is-low",s<=Gt&&a.phase==="play")}function ft(s){if(a.phase==="play"&&(a.remaining-=Math.min(250,Math.max(0,s-J))),J=s,mt(),a.phase==="play"&&a.remaining<=0){a.remaining=0,mt(),Q("time");return}a.phase==="play"&&(Z=requestAnimationFrame(ft))}function kt(){if(I.dataset.retry){delete I.dataset.retry,b(y());return}a.phase="play",X.remove(),S.classList.add("is-playing"),it(),J=performance.now(),Z=requestAnimationFrame(ft)}function At(s,E){if(a.phase!=="play")return;const v=g.toImage(s,E);if(!v.inside)return;const N=[v.u,v.v],K=Bt(Ct,g.displayWidth),G=$t(N,f.filter(W=>!a.found.has(W.id)),{aspect:l,tol:K});if(G){L(G.spot),a.found.size===$&&Q("all");return}if($t(N,f.filter(W=>a.found.has(W.id)),{aspect:l,tol:K})){j("<span>這裡已經找到了，看看別的地方。</span>");return}a.misses+=1,U(v.u,v.v)}function it(){const s=nt-a.hintsUsed;D.textContent=s,_.disabled=s<=0||a.phase!=="play",_.setAttribute("aria-label",`提示，剩 ${s} 次（每次扣 ${rt} 分）`)}function gt(){if(a.phase!=="play"||a.hintsUsed>=nt)return;const s=f.filter(st=>!a.found.has(st.id));if(!s.length)return;const E=s.filter(st=>!a.hinted.has(st.id)),v=(E.length?E:s).sort((st,It)=>It.pixels-st.pixels)[0];a.hinted.add(v.id),a.hintsUsed+=1,it();const N=Math.max(.14,v.circle.r*2.2),K=Math.random()*Math.PI*2,G=Math.random()*N*.45,W=Math.min(1,Math.max(0,v.circle.u+Math.cos(K)*G)),tt=Math.min(1,Math.max(0,v.circle.v+Math.sin(K)*G*l));g.isVisible(v.circle.u,v.circle.v,30)||g.fit();const bt=document.createElement("div");bt.className="sd-glow",i(bt,W,tt,N,{min:120,ttl:2600}),j(`<span>損壞就在發光的範圍附近（正確度 −${rt}）</span>`,"is-hint")}function Q(s){if(a.phase!=="play"&&!(a.phase==="intro"&&s==="abort"))return;const E=a.phase==="intro";a.phase="end",cancelAnimationFrame(Z),it(),A.classList.remove("is-low");const v={all:"全部找到了！",time:"時間到！"}[s];v&&et(v,`is-end is-${s}`);const N={found:a.found.size,foundIds:[...a.found],total:$,misses:a.misses,hintsUsed:a.hintsUsed,timeLeft:Math.max(0,Math.ceil(a.remaining/1e3)),timeLimit:w,reason:s,aborted:E};F(()=>{St(),u(N)},v?Vt:0)}I.addEventListener("click",kt),X.querySelector(".sd-back").addEventListener("click",()=>Q("abort"));const ct=M(".sd-quit");let dt=0;ct.addEventListener("click",()=>{if(a.phase==="intro"){Q("abort");return}if(a.phase==="play"){if(dt){Q("quit");return}ct.classList.add("is-armed"),j("<span>再按一次 ✕ 結束這一局，直接看結算。</span>"),dt=F(()=>{dt=0,ct.classList.remove("is-armed")},2500)}}),M(".sd-zoom-in").addEventListener("click",()=>g.zoomBy(1.6)),M(".sd-zoom-out").addEventListener("click",()=>g.zoomBy(1/1.6)),M(".sd-zoom-fit").addEventListener("click",()=>g.fit()),_.addEventListener("click",gt),it(),_.disabled=!0;function yt(s){if(!(s.ctrlKey||s.metaKey||s.altKey)&&(a.phase==="intro"&&s.key==="Escape"&&Q("abort"),a.phase==="play")){if(s.key==="+"||s.key==="=")g.zoomBy(1.6);else if(s.key==="-"||s.key==="_")g.zoomBy(1/1.6);else if(s.key==="0")g.fit();else if(s.key==="h"||s.key==="H")gt();else return;s.preventDefault()}}window.addEventListener("keydown",yt);function St(){cancelAnimationFrame(Z);for(const s of z)clearTimeout(s);z.clear(),window.removeEventListener("keydown",yt),g.destroy()}})}function te(n,e,r,c){const p=r%60===0?`${r/60} 分鐘`:`${r} 秒`,y=new Set(n.spots.map(l=>l.cls)),u=xt.filter(l=>y.has(l)).map(l=>{const h=at(l);return`<li><i class="sd-shape sd-shape--${l}"></i><b>${h.label}</b><span>${h.explain}</span></li>`}).join("");return`
    <div class="sd-intro" data-no-pan role="dialog" aria-modal="true" aria-labelledby="sd-intro-title">
      <div class="sd-intro-card">
        <p class="sd-kicker">${T(n.building)}・${T(n.name)}</p>
        <h2 id="sd-intro-title">找出 ${e} 處損壞</h2>
        <p class="sd-intro-sub">這是文物的實拍照片。研究團隊在照片上標註了真實的劣化，請把它們找出來。</p>
        <ul class="sd-legend">${u}</ul>
        <ul class="sd-rules">
          <li>限時 ${p}，提示 ${nt} 次（每次扣正確度 ${rt} 分）</li>
          <li>${c?"雙指縮放、單指拖曳":"滾輪縮放、拖曳移動"}，點一下標出損壞處</li>
          <li>點錯會打 ✕，每次扣正確度 ${pt} 分</li>
        </ul>
        <p class="sd-intro-error" role="alert" hidden>照片載入失敗，請檢查網路後重新載入。</p>
        <div class="sd-actions">
          <button class="sd-btn sd-btn--ghost sd-back" type="button">返回探索</button>
          <button class="sd-btn sd-btn--primary sd-start" type="button" disabled>照片載入中…</button>
        </div>
      </div>
    </div>`}async function se(n,e,{onExit:r}={}){if(!n)throw new Error("openSpotDiff：缺少容器元素");if(!e||!Array.isArray(e.spots)||!e.spots.length)throw new Error(`openSpotDiff：${e&&e.id} 沒有可玩的熱區`);return Jt(n,e,{onExit:r})}async function ne(){const n=await Mt(()=>import("./artifacts-CTdm1_YJ.js"),[],import.meta.url);return(n.default||n).artifacts}export{ne as loadArtifacts,se as openSpotDiff};
