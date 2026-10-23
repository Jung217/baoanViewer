// 保安宮文物細部瀏覽：選一件文物 → 手機平放桌面 → 螢幕當作窗口，在桌上滑動／轉動手機瀏覽原圖細部。
// 純靜態頁，不依賴建置工具。感測器（DeviceOrientation / DeviceMotion）需要 HTTPS。
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const screens = { gallery: $('gallery'), prepare: $('prepare'), viewer: $('viewer') };
  const canvas = $('canvas'), ctx = canvas.getContext('2d');
  const mini = $('minimap'), mctx = mini.getContext('2d');

  // 平放判定：傾斜小於 FLAT_DEG 視為平放；超過 LIFT_DEG 視為拿起（中間為遲滯區）。
  const FLAT_DEG = 6, LIFT_DEG = 16, FLAT_HOLD_MS = 700, CALIBRATE_MS = 900;
  // 估計 1 個 CSS 像素在手機螢幕上的實際長度（公尺）：一般手機螢幕短邊約 6.6 公分。
  const M_PER_PX = 0.066 / Math.max(300, Math.min(screen.width, screen.height));

  const state = {
    artifacts: [], current: null, img: null, loadToken: 0,
    sensors: false, gotOrientation: false, orientation: { alpha: null, beta: null, gamma: null },
    flatSince: 0, lifted: false,
    mode: 'idle', // idle | prepare | calibrating | view
    manual: false,
    // 視圖：C 為螢幕中心對應的原圖座標（px），s 為每個原圖像素佔幾個 CSS 像素，theta 為圖在螢幕上的旋轉（弧度）
    C: { u: 0, v: 0 }, s: 1, theta: 0, alpha0: null, alphaPrev: null, alphaTurn: 0,
    // 運動積分
    lastT: 0, vel: { x: 0, y: 0 }, bias: { x: 0, y: 0 }, grav: { x: 0, y: 0 }, quiet: 0,
    calib: { start: 0, n: 0, sx: 0, sy: 0 },
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

  // ---------- 2. 準備：載入原圖、提示平放 ----------
  function openArtifact(a, push = true) {
    state.current = a;
    state.mode = 'prepare';
    state.flatSince = 0;
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
      checkFlatStart();
    } catch {
      if (token !== state.loadToken) return;
      text.textContent = '原圖載入失敗，請返回後重試';
    }
  }

  function setHint() {
    const hint = document.querySelector('.hint');
    const flat = isFlat();
    hint.classList.toggle('ready', flat);
    let title = '把手機螢幕朝上，平放在桌面';
    let body = '放平之後，整張圖就像鋪在桌上。在桌面上滑動、轉動手機，螢幕就是看圖的窗口。';
    if (!window.isSecureContext) {
      title = '這個連線無法使用感測器';
      body = '手機的方向與移動感測器只在 HTTPS 連線下開放。請改用 https:// 網址開啟，或直接用手指拖曳瀏覽。';
    } else if (!state.sensors) {
      body += ' 先按下「開始偵測」允許使用動作感測器。';
    } else if (state.sensors && !state.gotOrientation) {
      body = '等待方向感測器回應…電腦瀏覽器通常沒有這個感測器，可以改用拖曳瀏覽。';
    } else if (flat && !state.img) {
      title = '已放平，等待原圖載入';
    } else if (flat) {
      title = '已放平，保持不動';
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

  function tiltOf(o) {
    if (o.beta == null || o.gamma == null) return Infinity;
    return Math.hypot(o.beta, o.gamma);
  }
  function isFlat() { return state.gotOrientation && tiltOf(state.orientation) < FLAT_DEG; }

  function checkFlatStart() {
    if (state.mode !== 'prepare' || !state.img || !isFlat()) return;
    if (state.flatSince && performance.now() - state.flatSince >= FLAT_HOLD_MS) startView(false);
  }

  // ---------- 感測器 ----------
  function onOrientation(e) {
    if (e.beta == null) return;
    state.gotOrientation = true;
    const o = state.orientation;
    o.alpha = e.alpha; o.beta = e.beta; o.gamma = e.gamma;
    const tilt = tiltOf(o);

    if (state.mode === 'prepare') {
      const k = 37 / 30;
      $('bubble').style.transform = `translate(${clamp(o.gamma, -30, 30) * k}px, ${clamp(o.beta, -30, 30) * k}px)`;
      $('tilt-read').textContent = `前後 ${o.beta.toFixed(1)}° · 左右 ${o.gamma.toFixed(1)}°`;
      if (tilt < FLAT_DEG) { if (!state.flatSince) state.flatSince = performance.now(); }
      else state.flatSince = 0;
      setHint();
      checkFlatStart();
      return;
    }
    if (state.mode !== 'view' && state.mode !== 'calibrating') return;
    if (state.manual) return;

    // 拿起／放回
    if (!state.lifted && tilt > LIFT_DEG) setLifted(true);
    else if (state.lifted && tilt < FLAT_DEG) setLifted(false);

    // 轉動：以進入檢視時的 alpha 為零點，桌面上的圖反向轉動，看起來固定在桌上
    if (o.alpha != null && !state.lifted) {
      if (state.alphaPrev == null) { state.alphaPrev = o.alpha; state.alpha0 = o.alpha; state.alphaTurn = 0; }
      let d = o.alpha - state.alphaPrev;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      state.alphaTurn += d; state.alphaPrev = o.alpha;
      if (state.followRotate) {
        state.theta = state.alphaTurn * Math.PI / 180 * (state.invertRotate ? -1 : 1);
        state.dirty = true;
      }
    }
  }

  function setLifted(lifted) {
    state.lifted = lifted;
    $('lifted').hidden = !lifted;
    state.vel.x = state.vel.y = 0; state.quiet = 0;
    // 放回時 alpha 可能已漂移：以目前 alpha 為新的參考，保留已累積的轉角
    if (!lifted) state.alphaPrev = state.orientation.alpha;
    state.dirty = true;
  }

  function onMotion(e) {
    const t = e.timeStamp || performance.now();
    const dt = state.lastT ? clamp((t - state.lastT) / 1000, 0, 0.05) : 0;
    state.lastT = t;

    let ax, ay;
    if (e.acceleration && e.acceleration.x != null) { ax = e.acceleration.x; ay = e.acceleration.y; }
    else if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x != null) {
      // 沒有去重力的加速度：用低通濾波估重力分量再扣掉
      const g = e.accelerationIncludingGravity;
      state.grav.x += (g.x - state.grav.x) * 0.08; state.grav.y += (g.y - state.grav.y) * 0.08;
      ax = g.x - state.grav.x; ay = g.y - state.grav.y;
    } else return;
    const r = e.rotationRate || {};
    const spin = Math.hypot(r.alpha || 0, r.beta || 0, r.gamma || 0);

    if (state.mode === 'calibrating') {
      const c = state.calib;
      if (Math.hypot(ax, ay) > 0.35 || state.lifted) { c.start = t; c.n = c.sx = c.sy = 0; return; }
      c.n++; c.sx += ax; c.sy += ay;
      if (t - c.start >= CALIBRATE_MS && c.n > 10) {
        state.bias.x = c.sx / c.n; state.bias.y = c.sy / c.n;
        state.vel.x = state.vel.y = 0;
        state.mode = 'view';
        toast('在桌面上滑動、轉動手機來瀏覽細部');
        updateState();
      }
      return;
    }
    if (state.mode !== 'view' || state.manual || state.lifted || !dt) return;

    let dx = ax - state.bias.x, dy = ay - state.bias.y;
    const mag = Math.hypot(dx, dy);
    // 靜止判定（零速度更新）：加速度與角速度都很小一段時間 → 速度歸零並慢慢修正偏差
    if (mag < 0.12 && spin < 10) state.quiet += dt; else state.quiet = 0;
    if (state.quiet > 0.08) {
      state.vel.x = state.vel.y = 0;
      state.bias.x += (ax - state.bias.x) * 0.02; state.bias.y += (ay - state.bias.y) * 0.02;
      return;
    }
    if (mag < 0.05) { dx = 0; dy = 0; }
    state.vel.x = (state.vel.x + dx * dt) * Math.exp(-dt * 0.6);
    state.vel.y = (state.vel.y + dy * dt) * Math.exp(-dt * 0.6);
    const sign = state.invert ? -1 : 1;
    // 裝置座標：x 向右、y 向手機頂端；螢幕座標 y 向下
    const qx = sign * state.vel.x * dt / M_PER_PX * state.gain;
    const qy = -sign * state.vel.y * dt / M_PER_PX * state.gain;
    moveWindow(qx, qy);
  }

  // ---------- 3. 檢視 ----------
  // 視窗（螢幕）在螢幕座標移動 (qx, qy) CSS px → 原圖中心點跟著移動
  function moveWindow(qx, qy) {
    const d = rot(qx, qy, -state.theta);
    state.C.u += d.x / state.s; state.C.v += d.y / state.s;
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
    state.mode = manual ? 'view' : 'calibrating';
    state.C = { u: state.img.naturalWidth / 2, v: state.img.naturalHeight / 2 };
    state.s = 1; state.theta = 0; state.alphaPrev = null; state.alphaTurn = 0;
    state.vel = { x: 0, y: 0 }; state.quiet = 0; state.lifted = false;
    state.calib = { start: performance.now(), n: 0, sx: 0, sy: 0 };
    $('lifted').hidden = true; $('settings').hidden = true;
    $('view-title').textContent = a.name;
    show('viewer');
    history.replaceState({ screen: 'viewer', id: a.id }, '');
    resize();
    zoomAt(1, canvas.clientWidth / 2, canvas.clientHeight / 2);
    toast(manual ? '用手指拖曳、雙指縮放瀏覽' : '保持不動，校準中…', manual ? 2600 : 1400);
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
    if (state.mode !== 'view' && state.mode !== 'calibrating') return;
    const deg = Math.round(((state.theta * 180 / Math.PI) % 360 + 540) % 360 - 180);
    const where = `中心 ${Math.round(state.C.u)}, ${Math.round(state.C.v)} px`;
    const zoom = state.s >= 1 ? `${state.s.toFixed(state.s % 1 ? 1 : 0)}×` : `${Math.round(state.s * 100)}%`;
    let mode;
    if (state.manual) mode = '拖曳瀏覽（未使用感測器）';
    else if (state.mode === 'calibrating') mode = '校準中・保持不動';
    else if (state.lifted) mode = '已拿起・暫停追蹤';
    else mode = `平放追蹤中・轉角 ${deg}°`;
    $('state').textContent = `${mode} · ${zoom} · ${where}`;
    $('view-sub').textContent = `${state.current.id} · 原圖 ${state.img.naturalWidth} × ${state.img.naturalHeight} px`;
  }

  function loop() {
    cancelAnimationFrame(state.raf);
    const tick = () => {
      if (state.mode !== 'view' && state.mode !== 'calibrating') return;
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
    state.theta = 0; state.alphaTurn = 0; state.alphaPrev = state.orientation.alpha;
    state.vel = { x: 0, y: 0 }; state.dirty = true;
  });
  $('settings-btn').addEventListener('click', () => {
    const panel = $('settings'); panel.hidden = !panel.hidden;
    $('settings-btn').setAttribute('aria-expanded', String(!panel.hidden));
  });
  $('gain').addEventListener('input', e => { state.gain = Number(e.target.value); $('gain-read').textContent = `${state.gain.toFixed(1)}×`; });
  $('follow-rotate').addEventListener('change', e => { state.followRotate = e.target.checked; if (!state.followRotate) { state.theta = 0; state.dirty = true; } });
  $('invert').addEventListener('change', e => { state.invert = e.target.checked; });
  $('invert-rotate').addEventListener('change', e => { state.invertRotate = e.target.checked; state.alphaTurn = 0; state.alphaPrev = state.orientation.alpha; state.theta = 0; state.dirty = true; });
  $('recalibrate').addEventListener('click', () => {
    if (state.manual) { toast('拖曳模式不需要校準'); return; }
    state.mode = 'calibrating'; state.calib = { start: performance.now(), n: 0, sx: 0, sy: 0 };
    $('settings').hidden = true; toast('保持不動，校準中…', 1400); state.dirty = true;
  });
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
