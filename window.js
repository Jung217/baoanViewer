// 保安宮文物細部瀏覽：選一件文物 → 手機直立拿在面前 → 螢幕當作窗口，像對著牆上的壁畫左右轉、上下仰俯瀏覽原圖細部。
// 純靜態頁，不依賴建置工具。感測器（DeviceOrientation / DeviceMotion）需要 HTTPS。
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const screens = { gallery: $('gallery'), prepare: $('prepare'), viewer: $('viewer') };
  const canvas = $('canvas'), ctx = canvas.getContext('2d');
  const mini = $('minimap'), mctx = mini.getContext('2d');

  // 直立判定：手機背面與水平面的夾角小於 UPRIGHT_DEG 視為直立；超過 PAUSE_DEG（太平）暫停追蹤。
  const UPRIGHT_DEG = 25, PAUSE_DEG = 55, HOLD_MS = 600;
  // 防飄移：角速度低於 STILL_DPS（度/秒）時，方向值的變化視為感測器漂移，不移動畫面。
  const STILL_DPS = 3;
  // 手機每轉 1 弧度，視窗在虛擬牆面上移動的距離（公尺）；相當於牆離手機約 35 公分。
  const WALL_M = 0.35;
  // 估計 1 個 CSS 像素在手機螢幕上的實際長度（公尺）：一般手機螢幕短邊約 6.6 公分。
  const M_PER_PX = 0.066 / Math.max(300, Math.min(screen.width, screen.height));

  const state = {
    artifacts: [], current: null, img: null, loadToken: 0,
    sensors: false, gotOrientation: false, orientation: { alpha: null, beta: null, gamma: null },
    uprightSince: 0, paused: false,
    mode: 'idle', // idle | prepare | view
    manual: false,
    // 視圖：C 為螢幕中心對應的原圖座標（px），s 為每個原圖像素佔幾個 CSS 像素，theta 為圖在螢幕上的旋轉（弧度）
    C: { u: 0, v: 0 }, s: 1, theta: 0, prev: null, spin: null,
    gain: 1, followRotate: true, invert: false,
    dirty: true, raf: 0, wakeLock: null, miniBase: null,
  };

  const rot = (x, y, a) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function show(name) {
    for (const [key, el] of Object.entries(screens)) el.classList.toggle('on', key === name);
  }

  let toastTimer = 0;
  function toast(text, ms = 2600) {
    const el = $('toast');
    el.textContent = text; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  }

  // ---------- 1. 文物清單 ----------
  async function loadList() {
    const grid = $('grid');
    try {
      const res = await fetch('artifacts.json');
      if (!res.ok) throw new Error(res.status);
      state.artifacts = await res.json();
    } catch {
      grid.innerHTML = '<p class="empty">文物清單載入失敗，請重新整理。</p>';
      return;
    }
    grid.innerHTML = '';
    for (const a of state.artifacts) {
      const card = document.createElement('button');
      card.className = 'card'; card.setAttribute('role', 'listitem');
      card.innerHTML = `<img loading="lazy" alt="" src="${a.thumb}"><span><b></b><small></small></span>`;
      card.querySelector('b').textContent = a.title;
      card.querySelector('small').textContent = `${a.id} · ${a.building}`;
      card.setAttribute('aria-label', `${a.id} ${a.name}`);
      card.addEventListener('click', () => openArtifact(a));
      grid.appendChild(card);
    }
  }

  // ---------- 2. 準備：載入原圖、提示直立 ----------
  function openArtifact(a, push = true) {
    state.current = a;
    state.mode = 'prepare';
    state.uprightSince = 0;
    $('prepare-title').textContent = a.title;
    $('prepare-sub').textContent = `${a.id} · ${a.building} · 原圖 ${a.width} × ${a.height} px`;
    $('prepare-thumb').src = a.thumb;
    $('prepare-thumb').alt = a.name;
    $('start').hidden = state.sensors;
    $('start').disabled = false;
    $('start').textContent = '開始偵測';
    setHint();
    show('prepare');
    if (push) history.pushState({ screen: 'prepare', id: a.id }, '');
    loadImage(a);
  }

  async function loadImage(a) {
    const token = ++state.loadToken;
    state.img = null;
    const bar = $('load-bar'), text = $('load-text');
    bar.style.width = '0%';
    text.textContent = '載入原圖…';
    try {
      const res = await fetch(a.image);
      if (!res.ok) throw new Error(res.status);
      const total = Number(res.headers.get('content-length')) || a.bytes || 0;
      let blob;
      if (res.body && total) {
        const reader = res.body.getReader(), chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (token !== state.loadToken) { reader.cancel(); return; }
          chunks.push(value); got += value.length;
          bar.style.width = `${Math.min(100, got / total * 100)}%`;
          text.textContent = `載入原圖 ${(got / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB`;
        }
        blob = new Blob(chunks, { type: 'image/jpeg' });
      } else {
        blob = await res.blob();
      }
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      await img.decode();
      if (token !== state.loadToken) { URL.revokeObjectURL(img.src); return; }
      state.img = img;
      state.miniBase = null;
      bar.style.width = '100%';
      text.textContent = `原圖已載入 · ${img.naturalWidth} × ${img.naturalHeight} px`;
      setHint();
      checkStart();
    } catch {
      if (token !== state.loadToken) return;
      text.textContent = '原圖載入失敗，請返回後重試';
    }
  }

  function setHint() {
    const hint = document.querySelector('.hint');
    const up = isUpright();
    hint.classList.toggle('ready', up);
    let title = '把手機直立拿在面前';
    let body = '像隔著手機看牆上的壁畫。左右轉動、上下仰俯手機，螢幕就是看圖的窗口。';
    if (!window.isSecureContext) {
      title = '這個連線無法使用感測器';
      body = '手機的方向感測器只在 HTTPS 連線下開放。請改用 https:// 網址開啟，或直接用手指拖曳瀏覽。';
    } else if (!state.sensors) {
      body += ' 先按下「開始偵測」允許使用動作感測器。';
    } else if (!state.gotOrientation) {
      body = '等待方向感測器回應…電腦瀏覽器通常沒有這個感測器，可以改用拖曳瀏覽。';
    } else if (up && !state.img) {
      title = '已拿直，等待原圖載入';
    } else if (up) {
      title = '已拿直，保持一下';
    }
    $('hint-title').textContent = title;
    $('hint-text').textContent = body;
  }

  async function requestSensors() {
    if (!window.isSecureContext) { setHint(); toast('感測器需要 HTTPS，請改用拖曳瀏覽'); return; }
    const button = $('start');
    button.disabled = true; button.textContent = '偵測中…';
    try {
      const asks = [];
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') asks.push(DeviceOrientationEvent.requestPermission());
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') asks.push(DeviceMotionEvent.requestPermission());
      const results = await Promise.all(asks);
      if (results.some(r => r !== 'granted')) throw new Error('denied');
    } catch {
      button.disabled = false; button.textContent = '開始偵測';
      toast('沒有取得動作感測器權限，可改用拖曳瀏覽', 3600);
      return;
    }
    window.addEventListener('deviceorientation', onOrientation);
    window.addEventListener('devicemotion', onMotion);
    state.sensors = true;
    button.hidden = true;
    setHint();
    setTimeout(() => {
      if (!state.gotOrientation && state.mode === 'prepare') {
        setHint();
        toast('沒有偵測到方向感測器，可改用拖曳瀏覽', 3600);
      }
    }, 1500);
  }

  // 由 deviceorientation 的 alpha/beta/gamma 算出手機姿態（W3C 規格的 ZXY 旋轉矩陣）：
  // yaw：手機背面朝向的水平方位；pitch：背面朝向的仰角（正值為往上看）；roll：螢幕平面內的歪斜（正值為逆時針歪）。
  function poseOf(o) {
    if (o.beta == null || o.gamma == null) return null;
    const d = Math.PI / 180, A = (o.alpha || 0) * d, B = o.beta * d, G = o.gamma * d;
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B), cG = Math.cos(G), sG = Math.sin(G);
    const bx = -(cA * sG + cG * sA * sB), by = -(sA * sG - cA * cG * sB), bz = -(cB * cG);
    return {
      yaw: Math.atan2(bx, by),
      pitch: Math.asin(clamp(bz, -1, 1)),
      roll: Math.atan2(-cB * sG, sB),
    };
  }
  function isUpright() {
    const p = state.gotOrientation && poseOf(state.orientation);
    return !!p && Math.abs(p.pitch) < UPRIGHT_DEG * Math.PI / 180;
  }
  function checkStart() {
    if (state.mode !== 'prepare' || !state.img || !isUpright()) return;
    if (state.uprightSince && performance.now() - state.uprightSince >= HOLD_MS) startView(false);
  }

  // ---------- 感測器 ----------
  function onOrientation(e) {
    if (e.beta == null) return;
    state.gotOrientation = true;
    const o = state.orientation;
    o.alpha = e.alpha; o.beta = e.beta; o.gamma = e.gamma;
    const p = poseOf(o);
    const deg = 180 / Math.PI;

    if (state.mode === 'prepare') {
      const k = 37 / 30;
      $('bubble').style.transform = `translate(${clamp(-p.roll * deg, -30, 30) * k}px, ${clamp(-p.pitch * deg, -30, 30) * k}px)`;
      $('tilt-read').textContent = `仰俯 ${(p.pitch * deg).toFixed(1)}° · 歪斜 ${(p.roll * deg).toFixed(1)}°`;
      if (Math.abs(p.pitch) * deg < UPRIGHT_DEG) { if (!state.uprightSince) state.uprightSince = performance.now(); }
      else state.uprightSince = 0;
      setHint();
      checkStart();
      return;
    }
    if (state.mode !== 'view' || state.manual) return;

    // 手機放太平（例如放下或朝天）時暫停，拿直後繼續
    const pitchDeg = Math.abs(p.pitch) * deg;
    if (!state.paused && pitchDeg > PAUSE_DEG) setPaused(true);
    else if (state.paused && pitchDeg < UPRIGHT_DEG) setPaused(false);

    // 歪斜：直接用重力方向算出的絕對角度，圖保持正立，不會累積漂移
    if (state.followRotate && !state.paused) { state.theta = p.roll; state.dirty = true; }

    // 左右轉、上下仰俯 → 視窗在牆面上移動（增量，靜止時吸收漂移）
    if (state.paused) { state.prev = null; return; }
    if (!state.prev) { state.prev = p; return; }
    let dyaw = p.yaw - state.prev.yaw;
    if (dyaw > Math.PI) dyaw -= 2 * Math.PI; else if (dyaw < -Math.PI) dyaw += 2 * Math.PI;
    const dpitch = p.pitch - state.prev.pitch;
    state.prev = p;
    if (state.spin != null && state.spin < STILL_DPS) return;
    const k = WALL_M / M_PER_PX * state.gain * (state.invert ? -1 : 1);
    moveWorld(dyaw * k, -dpitch * k);
  }

  function setPaused(paused) {
    state.paused = paused;
    $('lifted').hidden = !paused;
    state.prev = null;
    state.dirty = true;
  }

  // 只用陀螺儀的角速度判斷手機是不是靜止
  function onMotion(e) {
    const r = e.rotationRate;
    state.spin = r && r.alpha != null ? Math.hypot(r.alpha || 0, r.beta || 0, r.gamma || 0) : null;
  }

  // ---------- 3. 檢視 ----------
  // 視窗（螢幕）在螢幕座標移動 (qx, qy) CSS px → 原圖中心點跟著移動
  function moveWindow(qx, qy) {
    const d = rot(qx, qy, -state.theta);
    state.C.u += d.x / state.s; state.C.v += d.y / state.s;
    clampCenter(); state.dirty = true;
  }
  // 牆面（原圖）座標方向的移動，單位為 CSS px
  function moveWorld(du, dv) {
    state.C.u += du / state.s; state.C.v += dv / state.s;
    clampCenter(); state.dirty = true;
  }
  function clampCenter() {
    if (!state.img) return;
    state.C.u = clamp(state.C.u, 0, state.img.naturalWidth);
    state.C.v = clamp(state.C.v, 0, state.img.naturalHeight);
  }
  function screenToImage(px, py) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const d = rot(px - w / 2, py - h / 2, -state.theta);
    return { u: state.C.u + d.x / state.s, v: state.C.v + d.y / state.s };
  }
  function zoomAt(scale, px, py) {
    const before = screenToImage(px, py);
    state.s = clamp(scale, 0.08, 6);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const d = rot(px - w / 2, py - h / 2, -state.theta);
    state.C.u = before.u - d.x / state.s; state.C.v = before.v - d.y / state.s;
    clampCenter(); state.dirty = true;
    for (const b of document.querySelectorAll('[data-zoom]')) b.classList.toggle('on', Math.abs(Number(b.dataset.zoom) - state.s) < 0.01);
  }

  async function startView(manual) {
    if (!state.img) { toast('原圖還在載入'); return; }
    const a = state.current;
    state.manual = manual;
    state.mode = 'view';
    state.C = { u: state.img.naturalWidth / 2, v: state.img.naturalHeight / 2 };
    state.s = 1; state.theta = 0; state.prev = null; state.paused = false;
    $('lifted').hidden = true; $('settings').hidden = true;
    $('view-title').textContent = a.name;
    show('viewer');
    history.replaceState({ screen: 'viewer', id: a.id }, '');
    resize();
    zoomAt(1, canvas.clientWidth / 2, canvas.clientHeight / 2);
    toast(manual ? '用手指拖曳、雙指縮放瀏覽' : '左右轉動、上下仰俯手機來瀏覽細部');
    updateState();
    loop();
    try { state.wakeLock = await navigator.wakeLock?.request('screen'); } catch { state.wakeLock = null; }
  }

  function leaveViewer() {
    state.mode = 'idle';
    cancelAnimationFrame(state.raf); state.raf = 0;
    state.wakeLock?.release?.().catch(() => {}); state.wakeLock = null;
    state.loadToken++;
    show('gallery');
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const md = Math.min(window.devicePixelRatio || 1, 2);
    mini.width = Math.round(mini.clientWidth * md); mini.height = Math.round(mini.clientHeight * md);
    state.miniBase = null;
    state.dirty = true;
  }

  function updateState() {
    if (state.mode !== 'view') return;
    const deg = Math.round(((state.theta * 180 / Math.PI) % 360 + 540) % 360 - 180);
    const where = `中心 ${Math.round(state.C.u)}, ${Math.round(state.C.v)} px`;
    const zoom = state.s >= 1 ? `${state.s.toFixed(state.s % 1 ? 1 : 0)}×` : `${Math.round(state.s * 100)}%`;
    let mode;
    if (state.manual) mode = '拖曳瀏覽（未使用感測器）';
    else if (state.paused) mode = '手機太平・暫停追蹤';
    else mode = `直立追蹤中・歪斜 ${deg}°`;
    $('state').textContent = `${mode} · ${zoom} · ${where}`;
    $('view-sub').textContent = `${state.current.id} · 原圖 ${state.img.naturalWidth} × ${state.img.naturalHeight} px`;
  }

  function loop() {
    cancelAnimationFrame(state.raf);
    const tick = () => {
      if (state.mode !== 'view') return;
      if (state.dirty) { draw(); drawMini(); updateState(); state.dirty = false; }
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  }

  function draw() {
    const img = state.img; if (!img) return;
    const dpr = canvas.width / canvas.clientWidth;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b0f0b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(state.theta);
    ctx.scale(state.s, state.s);
    ctx.translate(-state.C.u, -state.C.v);
    ctx.imageSmoothingEnabled = state.s < 2;
    ctx.imageSmoothingQuality = 'high';
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24 / state.s;
    ctx.drawImage(img, 0, 0);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(200,150,46,.8)'; ctx.lineWidth = 2 / state.s;
    ctx.strokeRect(0, 0, img.naturalWidth, img.naturalHeight);
  }

  function drawMini() {
    const img = state.img; if (!img || !mini.width) return;
    const W = mini.width, H = mini.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const k = Math.min(W / iw, H / ih) * 0.92, ox = (W - iw * k) / 2, oy = (H - ih * k) / 2;
    if (!state.miniBase) {
      const base = document.createElement('canvas'); base.width = W; base.height = H;
      const b = base.getContext('2d');
      b.imageSmoothingQuality = 'high';
      b.drawImage(img, ox, oy, iw * k, ih * k);
      state.miniBase = base;
    }
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, W, H);
    mctx.drawImage(state.miniBase, 0, 0);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const corners = [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => screenToImage(x, y));
    mctx.beginPath();
    corners.forEach((p, i) => { const x = ox + p.u * k, y = oy + p.v * k; if (i) mctx.lineTo(x, y); else mctx.moveTo(x, y); });
    mctx.closePath();
    mctx.fillStyle = 'rgba(168,38,28,.25)'; mctx.fill();
    mctx.strokeStyle = '#c8962e'; mctx.lineWidth = Math.max(1.5, W / 56); mctx.stroke();
  }

  // ---------- 手指拖曳、雙指縮放、滑鼠與鍵盤 ----------
  const pointers = new Map();
  let pinch = null;
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), s: state.s };
    }
  });
  canvas.addEventListener('pointermove', e => {
    const prev = pointers.get(e.pointerId); if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (pointers.size === 1) {
      moveWindow(prev.x - cur.x, prev.y - cur.y);
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const rect = canvas.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - rect.left, my = (a.y + b.y) / 2 - rect.top;
      zoomAt(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist, mx, my);
    }
  });
  const release = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(state.s * Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });
  window.addEventListener('keydown', e => {
    if (state.mode !== 'view') return;
    const step = e.shiftKey ? 120 : 40;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); moveWindow(...moves[e.key]); }
    if (e.key === '[' || e.key === ']') { state.theta += (e.key === ']' ? -1 : 1) * Math.PI / 36; state.dirty = true; }
    if (e.key === 'Escape') history.back();
  });

  // ---------- 介面事件 ----------
  $('start').addEventListener('click', requestSensors);
  $('manual').addEventListener('click', () => startView(true));
  for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', () => history.back());
  for (const b of document.querySelectorAll('[data-zoom]')) b.addEventListener('click', () => zoomAt(Number(b.dataset.zoom), canvas.clientWidth / 2, canvas.clientHeight / 2));
  $('recenter').addEventListener('click', () => {
    if (!state.img) return;
    state.C = { u: state.img.naturalWidth / 2, v: state.img.naturalHeight / 2 };
    state.prev = null; state.dirty = true;
  });
  $('settings-btn').addEventListener('click', () => {
    const panel = $('settings'); panel.hidden = !panel.hidden;
    $('settings-btn').setAttribute('aria-expanded', String(!panel.hidden));
  });
  $('gain').addEventListener('input', e => { state.gain = Number(e.target.value); $('gain-read').textContent = `${state.gain.toFixed(1)}×`; });
  $('follow-rotate').addEventListener('change', e => { state.followRotate = e.target.checked; if (!state.followRotate) { state.theta = 0; state.dirty = true; } });
  $('invert').addEventListener('change', e => { state.invert = e.target.checked; });
  window.addEventListener('resize', () => { if (screens.viewer.classList.contains('on')) resize(); });
  window.addEventListener('popstate', e => {
    const s = e.state?.screen;
    if (s === 'prepare' || s === 'viewer') {
      const a = state.artifacts.find(x => x.id === e.state.id);
      if (a) { leaveViewer(); openArtifact(a, false); return; }
    }
    leaveViewer();
  });
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && state.mode === 'view' && !state.wakeLock) {
      try { state.wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* 無法保持亮屏時忽略 */ }
    }
  });

  history.replaceState({ screen: 'gallery' }, '');
  loadList();
})();
