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

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  let s = Math.min(canvas.width / W, canvas.height / H);
  if (s >= 2) s = Math.floor(s);
  SCALE = s;
  OX = Math.floor((canvas.width - W * s) / 2);
  OY = Math.floor((canvas.height - H * s) / 2);
}
addEventListener('resize', resize);
resize();

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
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.state)); } catch (e) { } }
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
  bow: ['b'], hint: ['h'],
};
const keys = {};
let pressQ = {}, pressed = {};
function keyName(e) { return e.key === ' ' ? ' ' : (e.key || '').toLowerCase(); }
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey) return;
  const k = keyName(e);
  if (!e.repeat) pressQ[k] = true;
  keys[k] = true;
  if (G.textHandler) G.textHandler(e);
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'backspace', 'tab'].includes(k)) e.preventDefault();
  if (typeof AudioSys !== 'undefined') AudioSys.unlock();
});
addEventListener('keyup', e => { keys[keyName(e)] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
canvas.addEventListener('pointerdown', () => {
  pressQ['e'] = true;
  if (typeof AudioSys !== 'undefined') AudioSys.unlock();
});
function down(a) { return KEYMAP[a].some(k => keys[k]); }
function hit(a) {
  let r = false;
  for (const k of KEYMAP[a]) if (pressed[k]) { r = true; delete pressed[k]; }
  return r;
}
function anyKey() { const r = Object.keys(pressed).length > 0; pressed = {}; return r; }
function beginInput() { pressed = pressQ; pressQ = {}; }

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
