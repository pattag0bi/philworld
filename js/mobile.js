'use strict';
// ============================================================
// PhilWorld — phone / tablet support: on-screen controls, name box,
// "rotate your phone" hint, fullscreen, and the offline service worker.
// Everything here is inert on a desktop with a keyboard (add ?touch=1 to test it).
// ============================================================
const TOUCH = (() => {
  try {
    if (/[?&]touch=0/.test(location.search)) return false;
    if (/[?&]touch=1/.test(location.search)) return true;
    return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  } catch (e) { return false; }
})();

// ---------- offline: register the service worker (needs https or localhost)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}

if (TOUCH) (function () {
  const standaloneApp = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || !!navigator.standalone;
  document.body.classList.add('touch');
  fracScale = true;
  reserveFn = () => Math.round(0.6 * (Math.min(0.27 * innerHeight, 120) + 12)); // let the pad overlap the game's empty margin a little
  resize();

  // ---------- key hints in text: "Press E" -> "Tap A", etc.
  const RULES = [
    [/Arrows or WASD to walk\. \*E\* to interact\. \*M\* opens the roadmap of ideas, \*J\* your journal, \*H\* asks me for a hint, \*N\* toggles sound\./,
      'Use the *D-pad* to walk. *A* to interact. the *map* button opens the roadmap of ideas, the *book* your journal, the *bulb* asks me for a hint, and the *gear* has the sound.'],
    [/arrows \/ WASD to move · E or Space to interact/, 'D-pad to move · A to interact'],
    [/ \(or →\)/, ''],
    [/Press (\*?)E(\*?)/g, 'Tap $1A$2'],
    [/Press (\*?)M(\*?)/g, 'Tap the $1map$2 button'],
    [/Press (\*?)J(\*?)/g, 'Tap the $1book$2 button'],
    [/Press (\*?)B(\*?)/g, 'Tap the $1bow$2 button'],
    [/Hold E/g, 'Hold A'],
    [/\(E\)/g, '(A)'],
    [/\*arrow keys\*/g, '*D-pad*'],
    [/\(arrow keys\)/g, '(D-pad)'],
    [/arrows: explore {3}· {3}M \/ Esc: close/, 'D-pad: explore   ·   A: close'],
    [/J \/ Esc close/, 'A: close'],
    [/↑ ↓ choose {2}· {2}← → change {2}· {2}F fullscreen {2}· {2}O \/ Esc close/, 'D-pad: choose / change  ·  A on Close'],
    [/Type your name · ↓ \(arrow\) or Enter for next/, 'Tap the name to type · D-pad ↓ for next'],
    [/↑↓ choose · ←→ change · E to begin on the last row/, 'Tap a row (or D-pad) · A on the last row'],
    [/press any key to begin/, 'tap to begin'],
    [/ \([NVP] to turn on\)/, ''],
    [/^E$/, 'A'],
  ];
  T = s => {
    if (typeof s !== 'string' || s.length > 600) return s;
    for (const [re, to] of RULES) s = s.replace(re, to);
    return s;
  };

  // ---------- DOM
  const css = document.createElement('style');
  css.textContent = `
  body.touch { -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; touch-action:none; overscroll-behavior:none; }
  #tc { position:fixed; inset:0; pointer-events:none; z-index:5; font-family:'Press Start 2P',monospace; }
  #tc > * { pointer-events:auto; touch-action:none; }
  #pad { position:absolute; left:calc(env(safe-area-inset-left) + 10px); bottom:calc(env(safe-area-inset-bottom) + 10px);
    width:min(27vh,120px); height:min(27vh,120px); border-radius:50%; background:rgba(22,16,34,.38); border:2px solid rgba(232,213,168,.35); }
  #pad .arr { position:absolute; color:rgba(244,234,210,.55); font-size:min(5vh,20px); line-height:1; pointer-events:none; }
  #pad .arr.on { color:#f7c948; }
  #pad .u { left:50%; top:9%; transform:translateX(-50%); } #pad .d { left:50%; bottom:9%; transform:translateX(-50%); }
  #pad .l { left:11%; top:50%; transform:translateY(-50%); } #pad .r { right:11%; top:50%; transform:translateY(-50%); }
  #pad .nub { position:absolute; left:50%; top:50%; width:34%; height:34%; margin:-17%; border-radius:50%; background:rgba(247,201,72,.35); border:2px solid rgba(247,201,72,.7); pointer-events:none; }
  #abtn { position:absolute; right:calc(env(safe-area-inset-right) + 14px); bottom:calc(env(safe-area-inset-bottom) + 18px);
    width:min(19vh,80px); height:min(19vh,80px); border-radius:50%; background:rgba(247,201,72,.4); border:3px solid rgba(247,201,72,.85);
    color:#fff6d8; font-size:min(8vh,30px); display:flex; align-items:center; justify-content:center; text-shadow:0 2px 0 rgba(0,0,0,.5); }
  #abtn.on { background:rgba(247,201,72,.75); }
  #tmenu { position:absolute; right:calc(env(safe-area-inset-right) + 6px); top:calc(env(safe-area-inset-top) + 6px); display:flex; flex-direction:column; gap:6px; }
  #tmenu button { all:unset; box-sizing:border-box; width:40px; height:40px; border-radius:8px; background:rgba(22,16,34,.55); border:2px solid rgba(232,213,168,.45);
    color:#f4ead2; font:20px/1 system-ui,sans-serif; display:flex; align-items:center; justify-content:center; }
  #tmenu button:active { background:rgba(247,201,72,.5); }
  #tmenu button[hidden] { display:none; }
  body:not([data-screen=game]) #tmenu button:not(#tm-set):not(#tm-fs) { display:none; }
  body[data-screen=boot] #tmenu, body[data-screen=boot] #pad, body[data-screen=boot] #abtn { display:none; }
  body[data-screen=creator] #tmenu, body[data-screen=creator] #abtn { display:none; }
  body[data-screen=title] #abtn { }
  #nameBox { position:fixed; left:0; bottom:0; width:60px; height:30px; opacity:0; font-size:16px; border:0; padding:0; pointer-events:none; }
  #rot { position:fixed; inset:0; z-index:9; display:none; flex-direction:column; align-items:center; justify-content:center; gap:22px; background:#0b0a12; color:#f7c948; font-family:'Press Start 2P',monospace; font-size:12px; text-align:center; line-height:1.8; padding:0 28px; }
  #rot .ph { width:46px; height:80px; border:4px solid #f7c948; border-radius:8px; animation:rot 2.4s ease-in-out infinite; }
  @keyframes rot { 0%,25% { transform:rotate(0) } 60%,100% { transform:rotate(-90deg) } }
  @media (orientation:portrait) { body.touch #rot { display:flex; } body.touch #tc { display:none; } }
  `;
  document.head.appendChild(css);

  const tc = document.createElement('div'); tc.id = 'tc';
  tc.innerHTML = `
    <div id="pad"><span class="arr u">▲</span><span class="arr d">▼</span><span class="arr l">◀</span><span class="arr r">▶</span><div class="nub"></div></div>
    <div id="abtn">A</div>
    <div id="tmenu">
      <button id="tm-bow" hidden aria-label="Bow">🙇</button>
      <button id="tm-hint" aria-label="Hint">💡</button>
      <button id="tm-map" aria-label="Map">🗺️</button>
      <button id="tm-jou" aria-label="Journal">📖</button>
      <button id="tm-fs" aria-label="Fullscreen">⛶</button>
      <button id="tm-set" aria-label="Settings">⚙️</button>
    </div>`;
  document.body.appendChild(tc);
  const rot = document.createElement('div'); rot.id = 'rot';
  rot.innerHTML = '<div class="ph"></div><div>Turn your phone sideways to play</div>';
  document.body.appendChild(rot);
  const nameBox = document.createElement('input');
  nameBox.id = 'nameBox'; nameBox.maxLength = 14; nameBox.autocomplete = 'off'; nameBox.autocapitalize = 'words'; nameBox.spellcheck = false; nameBox.enterKeyHint = 'next';
  document.body.appendChild(nameBox);

  for (const ev of ['contextmenu', 'gesturestart', 'gesturechange']) addEventListener(ev, e => e.preventDefault(), { passive: false });
  addEventListener('touchmove', e => { if (e.target !== nameBox) e.preventDefault(); }, { passive: false });
  addEventListener('touchstart', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  const unlock = () => { if (typeof AudioSys !== 'undefined') AudioSys.unlock(); };
  const buzz = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) { } };

  // ---------- D-pad: one big stick; slide anywhere inside it. Diagonals work.
  const pad = document.getElementById('pad'), nub = pad.querySelector('.nub');
  const NAMES = { u: 'arrowup', d: 'arrowdown', l: 'arrowleft', r: 'arrowright' };
  let padId = null, cur = { u: 0, d: 0, l: 0, r: 0 }, heldSince = 0, lastRep = 0;
  function setDir(n) {
    for (const k in n) {
      if (n[k] && !cur[k]) { pressQ[NAMES[k]] = true; heldSince = performance.now(); lastRep = 0; }
      keys[NAMES[k]] = !!n[k];
      pad.querySelector('.arr.' + k).classList.toggle('on', !!n[k]);
    }
    cur = n;
  }
  function padMove(e) {
    const r = pad.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const m = Math.hypot(dx, dy);
    if (m > R) { dx = dx / m * R; dy = dy / m * R; }
    nub.style.transform = `translate(${dx * 0.55}px,${dy * 0.55}px)`;
    const dz = R * 0.28;
    // a direction counts when its axis passes the dead zone and is not much weaker than the other axis (so diagonals need both)
    const ax = Math.abs(dx), ay = Math.abs(dy);
    setDir({
      l: dx < -dz && ax > ay * 0.45 ? 1 : 0, r: dx > dz && ax > ay * 0.45 ? 1 : 0,
      u: dy < -dz && ay > ax * 0.45 ? 1 : 0, d: dy > dz && ay > ax * 0.45 ? 1 : 0,
    });
  }
  function padEnd() { padId = null; nub.style.transform = ''; setDir({ u: 0, d: 0, l: 0, r: 0 }); }
  pad.addEventListener('pointerdown', e => { padId = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch (err) { } unlock(); padMove(e); e.preventDefault(); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === padId) padMove(e); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(ev, e => { if (e.pointerId === padId) padEnd(); });
  // held direction repeats in menus / sliders (walking uses the held key itself)
  setInterval(() => {
    if (padId === null) return;
    const menu = G.screen !== 'game' || Settings.open || G.overlay || Dialog.cur;
    if (!menu) return;
    const now = performance.now();
    if (now - heldSince > 380 && now - lastRep > 130) { lastRep = now; for (const k in cur) if (cur[k]) pressQ[NAMES[k]] = true; }
  }, 40);

  // ---------- A button (hold = hold E, for "hold to approach")
  const abtn = document.getElementById('abtn');
  let aId = null;
  abtn.addEventListener('pointerdown', e => { aId = e.pointerId; try { abtn.setPointerCapture(e.pointerId); } catch (err) { } abtn.classList.add('on'); keys['e'] = true; pressQ['e'] = true; unlock(); buzz(8); e.preventDefault(); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) abtn.addEventListener(ev, e => { if (e.pointerId === aId) { aId = null; keys['e'] = false; abtn.classList.remove('on'); } });

  // ---------- menu buttons just press the matching key
  const press = (id, k) => document.getElementById(id).addEventListener('pointerdown', e => { pressQ[k] = true; unlock(); buzz(8); e.preventDefault(); });
  press('tm-map', 'm'); press('tm-jou', 'j'); press('tm-hint', 'h'); press('tm-set', 'o'); press('tm-bow', 'b'); press('tm-fs', 'f');

  if (!fullscreenOK() || standaloneApp) document.getElementById('tm-fs').hidden = true;

  // show / hide what makes sense for the current screen
  const bowBtn = document.getElementById('tm-bow');
  setInterval(() => {
    document.body.dataset.screen = G.screen;
    bowBtn.hidden = !(G.state && G.state.flags && G.state.flags.bow);
  }, 200);

  // ---------- name entry: a hidden real text box so the phone keyboard appears
  nameBox.addEventListener('input', () => {
    const v = nameBox.value.replace(/[^\p{L}\p{N} '\-]/gu, '').slice(0, 14);
    if (v !== nameBox.value) nameBox.value = v;
    Creator.typed = true; G.state.name = v; SFX.blip(500);
  });
  nameBox.addEventListener('keydown', e => { if (e.key === 'Enter') { nameBox.blur(); Creator.row = 1; SFX.select(); } });
  nameBox.addEventListener('blur', () => { if (!G.state.name.trim()) { G.state.name = 'Traveler'; Creator.typed = false; } });

  // ---------- taps on menu screens (title list, character creator)
  G.onTap = (x, y) => {
    unlock();
    if (G.screen === 'title') {
      const opts = titleOptions();
      const i = Math.floor((y - 124) / 14);
      if (x > 120 && x < 360 && i >= 0 && i < opts.length) { Title.sel = i; pressQ['e'] = true; }
    } else if (G.screen === 'creator') {
      const i = Math.floor((y - 56) / 26);
      if (x < 200 || i < 0 || i > 5 || y - 56 - i * 26 > 22) return;
      Creator.row = i; SFX.select();
      if (i === 0) {
        nameBox.value = Creator.typed ? G.state.name : '';
        nameBox.focus();
      } else {
        nameBox.blur();
        if (i === 5) pressQ['e'] = true;
        else if (x > 304) { pressQ[x < 362 ? 'arrowleft' : 'arrowright'] = true; }
      }
    }
  };

  // ---------- phones background tabs hard: stop sound when hidden, resume after
  document.addEventListener('visibilitychange', () => { if (document.hidden) Voice.stop(); });
})();
