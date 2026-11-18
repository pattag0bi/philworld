'use strict';
// ============================================================
// PhilWorld — core: canvas, state, input, timers, helpers
// ============================================================
const W = 480, H = 272;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const g = buf.getContext('2d');
let SCALE = 1, OX = 0, OY = 0;

// Phone notches / home bars: keep the game inside the safe area.
const _safeProbe = document.createElement('div');
_safeProbe.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
document.body.appendChild(_safeProbe);
function safeInsets() {
  const cs = getComputedStyle(_safeProbe);
  return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
}
let fracScale = false;
let reserveFn = null; // phones: how many css px each side the on-screen pad/buttons may cover
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  const si = safeInsets();
  const rs = reserveFn ? reserveFn() : 0;
  const aw = canvas.width - (si.l + si.r + 2 * rs) * dpr, ah = canvas.height - (si.t + si.b) * dpr;
  let s = Math.min(aw / W, ah / H);
  // whole-number scaling keeps pixels crisp; on phones fall back to fractional when that would waste >15% of the screen
  if (s >= 2) { const f = Math.floor(s); if (!fracScale || f >= s * 0.85) s = f; }
  SCALE = s;
  OX = Math.floor((si.l + rs) * dpr + (aw - W * s) / 2);
  OY = Math.floor(si.t * dpr + (ah - H * s) / 2);
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();
// Touch devices: mobile.js swaps this for a version that rewrites key hints ("Press E" -> "Tap A").
let T = s => s;

const G = {
  t: 0, dt: 0, screen: 'boot',
  room: null, roomId: null,
  busy: 0, overlay: null, activity: null,
  fade: 1, fadeTo: 1, flash: 0, flashColor: '#ffffff', shake: 0,
  toast: null, msg: null, prompt: null,
  tint: null,
  state: null,
};

// ---------- helpers
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ---------- save
function newState() {
  return {
    name: 'Traveler',
    look: { hair: 0, hairC: 1, skin: 1, robe: 1 },
    insights: [], visited: [], path: [], flags: {},
    room: 'crossroads',
  };
}
G.state = newState();
const SAVE_KEY = 'philworld-save-v1';
function save(quiet) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.state)); if (!quiet) G.savedAt = G.t; } catch (e) { }
}
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function flag(k, v) {
  if (v === undefined) return G.state.flags[k];
  G.state.flags[k] = v; save(); return v;
}
function hasInsight(id) { return G.state.insights.includes(id); }

// ---------- input
const KEYMAP = {
  up: ['arrowup', 'w'], down: ['arrowdown', 's'], left: ['arrowleft', 'a'], right: ['arrowright', 'd'],
  act: ['e', ' ', 'enter'], map: ['m'], journal: ['j'], mute: ['n'], esc: ['escape'],
  bow: ['b'], hint: ['h'], voice: ['v'], pictures: ['p'], settings: ['o'], fullscreen: ['f'],
};
const keys = {};
let pressQ = {}, pressed = {};
function keyName(e) { return e.key === ' ' ? ' ' : (e.key || '').toLowerCase(); }
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey) return;
  if (e.target && e.target.tagName === 'INPUT') return; // the phone's name box handles its own typing
  const k = keyName(e);
  if (!e.repeat) pressQ[k] = true;
  keys[k] = true;
  if (G.textHandler) G.textHandler(e);
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'backspace', 'tab'].includes(k)) e.preventDefault();
  if (typeof AudioSys !== 'undefined') AudioSys.unlock();
});
addEventListener('keyup', e => { keys[keyName(e)] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function toGame(e) { const r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1; return [((e.clientX - r.left) * d - OX) / SCALE, ((e.clientY - r.top) * d - OY) / SCALE]; }
canvas.addEventListener('pointerdown', () => {
  if (G.screen !== 'title' && G.screen !== 'creator') pressQ['e'] = true; // menus use onTap below
  if (typeof AudioSys !== 'undefined') AudioSys.unlock();
});
// Menu screens handle taps themselves (G.onTap(x, y) in game pixels). Fired on release so a text box can take focus.
canvas.addEventListener('pointerup', e => {
  if ((G.screen === 'title' || G.screen === 'creator') && G.onTap) { const [x, y] = toGame(e); G.onTap(x, y); }
});
function down(a) { return KEYMAP[a].some(k => keys[k]); }
function hit(a) {
  let r = false;
  for (const k of KEYMAP[a]) if (pressed[k]) { r = true; delete pressed[k]; }
  return r;
}
function anyKey() { const r = Object.keys(pressed).length > 0; pressed = {}; return r; }
function beginInput() { pressed = pressQ; pressQ = {}; }

// ---------- fullscreen (F, the settings page, or the phone menu button)
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
function fullscreenOK() { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen); }
function toggleFullscreen() {
  const d = document.documentElement;
  if (!fullscreenOK()) { notice('Fullscreen isn\'t available here. On iPhone, use Share > Add to Home Screen.', 4); return; }
  try {
    if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d, { navigationUI: 'hide' });
      Promise.resolve(p).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => { });
    }
  } catch (e) { }
}

// ---------- timers & async scripting
let timers = [], frameWaiters = [];
function wait(s) { return new Promise(r => timers.push({ t: s, r })); }
function nextFrame() { return new Promise(r => frameWaiters.push(r)); }
function tickTimers(dt) {
  const fw = frameWaiters; frameWaiters = [];
  for (const r of fw) r(dt);
  for (let i = timers.length - 1; i >= 0; i--) {
    timers[i].t -= dt;
    if (timers[i].t <= 0) { const r = timers[i].r; timers.splice(i, 1); r(); }
  }
}
async function waitUntil(fn) { while (!fn()) await nextFrame(); }
async function script(fn) {
  G.busy++;
  try { await fn(); } catch (e) { console.error(e); }
  finally { G.busy--; }
}
// An activity is a mini-scene: {draw(g,t), ui(c,t), hidePlayer}. Returns an end() function.
function setActivity(o) {
  o.t0 = G.t;
  G.activity = o;
  return () => { if (G.activity === o) G.activity = null; };
}
function shake(s) { G.shake = Math.max(G.shake, s); }
function flash(color, amt) { G.flashColor = color || '#fff'; G.flash = amt == null ? 1 : amt; }
