'use strict';
// ============================================================
// PhilWorld — pixel graphics helpers (everything is drawn in code)
// ============================================================
const HAIR_STYLES = ['short', 'long', 'curly', 'bun', 'ponytail', 'spiky', 'bald'];
const HAIR_COLORS = ['#2b1d14', '#5a3a22', '#9a5a2a', '#d8b26e', '#e8e4da', '#b03a48', '#3a6ea5', '#1d1d2b'];
const SKINS = ['#f8d9bd', '#eab994', '#c98e62', '#9a6440', '#6b4329'];
const ROBES = [['#c0392b', '#7b241c'], ['#2e86c1', '#e0c060'], ['#27ae60', '#145a32'], ['#8e44ad', '#e0c060'], ['#e67e22', '#935116'], ['#e8e4da', '#9a9a9a'], ['#34495e', '#c0392b'], ['#d4ac0d', '#7d6608']];

const _shadeCache = new Map();
function shade(hex, amt) {
  const key = hex + amt;
  if (_shadeCache.has(key)) return _shadeCache.get(key);
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  if (amt < 0) { r *= 1 + amt; gg *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; gg += (255 - gg) * amt; b += (255 - b) * amt; }
  const out = '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(gg) << 8) | Math.round(b)).toString(16).slice(1);
  _shadeCache.set(key, out);
  return out;
}

function playerLook(L = G.state.look) {
  return {
    skin: SKINS[L.skin], hairStyle: HAIR_STYLES[L.hair], hairC: HAIR_COLORS[L.hairC],
    robe: ROBES[L.robe][0], robe2: ROBES[L.robe][1], legs: '#4a3626',
  };
}

function R(g, c, x, y, w = 1, h = 1) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }
function disc(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy) + 0.3);
    g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
  }
}
function ellipse(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)) + 0.3);
    g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
  }
}
function ring(g, cx, cy, r, c, th = 1) {
  g.fillStyle = c;
  const steps = Math.max(24, r * 7);
  for (let i = 0; i < steps; i++) {
    const a = i / steps * Math.PI * 2;
    g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), th, th);
  }
}
function line(g, x0, y0, x1, y1, c) {
  g.fillStyle = c;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    g.fillRect(Math.round(lerp(x0, x1, t)), Math.round(lerp(y0, y1, t)), 1, 1);
  }
}
function tex(g, x, y, w, h, base, cols, dens = 0.08, seed = 1) {
  if (base) { g.fillStyle = base; g.fillRect(x, y, w, h); }
  const r = mulberry(seed);
  const n = Math.floor(w * h * dens);
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[Math.floor(r() * cols.length)];
    g.fillRect(x + Math.floor(r() * w), y + Math.floor(r() * h), r() < 0.3 ? 2 : 1, 1);
  }
}
function vgrad(g, x, y, w, h, c1, c2, steps = 12) {
  for (let i = 0; i < steps; i++) {
    g.fillStyle = mix(c1, c2, i / (steps - 1));
    const y0 = y + Math.floor(h * i / steps), y1 = y + Math.floor(h * (i + 1) / steps);
    g.fillRect(x, y0, w, y1 - y0);
  }
}
function mix(a, b, t) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(A >> 16, B >> 16, t)), gg = Math.round(lerp((A >> 8) & 255, (B >> 8) & 255, t)), bb = Math.round(lerp(A & 255, B & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (gg << 8) | bb).toString(16).slice(1);
}

// ---------------- people
function drawPerson(g, x, y, L, dir = 0, step = 0, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const p = (c, a, b, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  if (!o.noShadow) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 5, y - 1, 10, 2); g.fillRect(x - 4, y, 8, 1); }
  let dy = o.bob || 0;
  if (o.sit) dy += 4;
  if (o.scale && o.scale !== 1) { /* not used */ }
  const skin = L.skin || '#eab994', robe = L.robe || '#888';
  const robeD = shade(robe, -0.22), robeL = shade(robe, 0.15), robe2 = L.robe2 || robeD;
  const legC = L.legs || shade(robe, -0.45);
  const feet = shade(legC, -0.35);
  // legs
  if (o.sit) {
    p(robeD, -4, -5 + dy - 1, 8, 2);
    if (dir === 0) { p(legC, -3, -4 + dy, 2, 2); p(legC, 1, -4 + dy, 2, 2); }
  } else if (L.long) {
    const l1 = step === 1 ? -1 : 0, l2 = step === 3 ? -1 : 0;
    p(feet, -3, -2 + l1, 2, 2); p(feet, 1, -2 + l2, 2, 2);
  } else {
    const h1 = step === 1 ? 3 : 4, h2 = step === 3 ? 3 : 4;
    p(legC, -3, -5 + dy, 2, h1); p(legC, 1, -5 + dy, 2, h2);
    p(feet, -3, -5 + dy + h1 - 1, 2, 1); p(feet, 1, -5 + dy + h2 - 1, 2, 1);
  }
  // body
  const bodyTop = -12 + dy;
  const bodyH = o.sit ? 7 : (L.long ? 10 : 7);
  p(robe, -4, bodyTop, 8, bodyH);
  p(robeL, -4, bodyTop, 1, bodyH);
  p(robeD, 3, bodyTop, 1, bodyH);
  p(robeD, -4, bodyTop + bodyH - 1, 8, 1);
  if (L.long && !o.sit) { p(robeD, -1, bodyTop + 5, 1, bodyH - 5); }
  p(robe2, -4, bodyTop + 4, 8, 1);
  if (L.sash) { p(L.sash, -4, bodyTop, 2, 1); p(L.sash, -3, bodyTop + 1, 2, 1); p(L.sash, -2, bodyTop + 2, 2, 1); p(L.sash, -1, bodyTop + 3, 2, 1); p(L.sash, 0, bodyTop + 4, 2, 1); p(L.sash, 1, bodyTop + 5, 2, 1); }
  if (L.collar) p(L.collar, -2, bodyTop, 4, 1);
  // arms
  const sw = o.armsUp ? -3 : (step === 1 ? 1 : step === 3 ? -1 : 0);
  if (o.armsUp) {
    p(robe, -6, bodyTop - 3, 2, 4); p(skin, -6, bodyTop - 4, 2, 1);
    p(robe, 4, bodyTop - 3, 2, 4); p(skin, 4, bodyTop - 4, 2, 1);
  } else if (dir === 2 || dir === 3) {
    const ax = dir === 2 ? -1 : 0;
    p(robeD, ax, bodyTop + 1 + sw, 2, 4); p(skin, ax, bodyTop + 5 + sw, 2, 1);
  } else {
    p(robeD, -5, bodyTop + 1 + sw, 1, 4); p(skin, -5, bodyTop + 5 + sw, 1, 1);
    p(robeD, 4, bodyTop + 1 - sw, 1, 4); p(skin, 4, bodyTop + 5 - sw, 1, 1);
  }
  // head
  const hy = -18 + dy + (o.bow ? 3 : 0) + (o.sit ? 0 : 0);
  const hx = o.bow ? (dir === 2 ? -1 : dir === 3 ? 1 : 0) : 0;
  const q = (c, a, b, w = 1, h = 1) => p(c, a + hx, b, w, h);
  q(skin, -3, hy, 6, 6);
  q(shade(skin, -0.12), -3, hy + 5, 6, 1);
  // eyes
  if (!o.blink && dir !== 1) {
    const ec = L.eyes || '#221a1a';
    if (o.closedEyes) { if (dir === 0) { q(ec, -2, hy + 3, 2, 1); q(ec, 1, hy + 3, 2, 1); } }
    else if (dir === 0) { q(ec, -2, hy + 3); q(ec, 1, hy + 3); }
    else if (dir === 2) { q(ec, -2, hy + 3); }
    else if (dir === 3) { q(ec, 1, hy + 3); }
    if (dir === 0 && o.smile) { q(shade(skin, -0.35), -1, hy + 5, 2, 1); }
  }
  // hair
  const hc = L.hairC || '#3a2a1a', hd = shade(hc, -0.25);
  const st = L.hairStyle || 'short';
  if (st !== 'bald' && st !== 'none') {
    q(hc, -3, hy - 1, 6, 2);
    if (st === 'curly') { q(hc, -4, hy - 1, 8, 2); q(hd, -4, hy - 1); q(hd, -1, hy - 1); q(hd, 2, hy - 1); q(hc, -3, hy - 2, 2, 1); q(hc, 1, hy - 2, 2, 1); }
    if (st === 'spiky') { q(hc, -3, hy - 2); q(hc, -1, hy - 3); q(hc, 1, hy - 2); q(hc, 2, hy - 3); q(hc, -4, hy - 1); }
    if (dir === 0) { q(hc, -3, hy + 1, 1, 1); q(hc, 2, hy + 1, 1, 1); }
    if (dir === 2) { q(hc, 0, hy + 1, 3, 2); }
    if (dir === 3) { q(hc, -3, hy + 1, 3, 2); }
    if (dir === 1) { q(hc, -3, hy, 6, 5); q(hd, -3, hy + 4, 6, 1); }
    if (st === 'long') {
      if (dir === 1) q(hc, -4, hy, 8, 9);
      else { q(hc, -4, hy, 1, 8); q(hc, 3, hy, 1, 8); }
    }
    if (st === 'curly' && dir !== 1) { q(hc, -4, hy + 1, 1, 3); q(hc, 3, hy + 1, 1, 3); }
    if (st === 'bun' || st === 'topknot') { q(hc, -1, hy - 3, 2, 2); q(hd, -1, hy - 2, 2, 1); }
    if (st === 'ponytail') {
      if (dir === 1) q(hc, -1, hy + 5, 2, 4);
      else if (dir === 2) q(hc, 3, hy + 1, 1, 5);
      else if (dir === 3) q(hc, -4, hy + 1, 1, 5);
      else q(hc, 3, hy + 2, 1, 3);
    }
  } else {
    q(shade(skin, 0.25), -1, hy, 2, 1);
    if (L.hairC && dir !== 1) { q(hc, -3, hy + 2, 1, 2); q(hc, 2, hy + 2, 1, 2); }
    if (dir === 1 && L.hairC) q(hc, -3, hy + 3, 6, 2);
  }
  if (L.ushnisha) { q(hc, -2, hy - 2, 4, 2); q(hc, -1, hy - 3, 2, 1); }
  // facial hair
  if (L.beard && dir !== 1) {
    const bl = L.beardLen || 2;
    const bx = dir === 2 ? -3 : dir === 3 ? -2 : -3, bw = dir === 0 ? 6 : 5;
    q(L.beard, bx, hy + 4, bw, bl + 1);
    q(L.beard, bx + 1, hy + 5 + bl, bw - 2, 1);
    if (dir === 0) q(shade(L.beard, -0.3), -1, hy + 4, 2, 1);
    if (dir === 0) { q(L.beard, -3, hy + 2, 1, 2); q(L.beard, 2, hy + 2, 1, 2); }
  }
  if (L.mustache && dir !== 1) { q(L.mustache, -4, hy + 4, 8, 1); q(L.mustache, -3, hy + 5, 2, 1); q(L.mustache, 1, hy + 5, 2, 1); }
  if (L.glasses && dir !== 1) {
    if (dir === 0) { q('#111', -3, hy + 2, 3, 1); q('#111', 0, hy + 2, 3, 1); q('#111', -3, hy + 4, 3, 1); q('#111', 0, hy + 4, 3, 1); }
    else { const gx = dir === 2 ? -3 : 0; q('#111', gx, hy + 2, 3, 1); q('#111', gx, hy + 4, 3, 1); }
  }
  // hats
  if (L.hat === 'scholar') { q('#1a1a1a', -3, hy - 3, 6, 3); q('#2a2a2a', -2, hy - 5, 4, 2); q('#c9a24a', -3, hy - 1, 6, 1); }
  if (L.hat === 'laurel') { for (const [a, b] of [[-4, 1], [-4, 0], [-3, -1], [-1, -2], [1, -2], [2, -1], [3, 0], [3, 1]]) q(dir === 1 && b > -2 ? '#3c8d3c' : '#5cb85c', a, hy + b); }
  if (L.hat === 'turban') { q(L.hatC || '#b03a48', -4, hy - 3, 8, 3); q(shade(L.hatC || '#b03a48', 0.2), -3, hy - 4, 6, 1); q(shade(L.hatC || '#b03a48', -0.2), -4, hy - 1, 8, 1); }
  if (L.hat === 'beret') { q('#1c1c22', -4, hy - 2, 8, 2); q('#1c1c22', 1, hy - 3, 2, 1); }
  if (L.hat === 'hood') { q(robeD, -4, hy - 2, 8, 3); q(robeD, -4, hy, 1, 6); q(robeD, 3, hy, 1, 6); }
  if (L.hat === 'crown') { q('#f1c40f', -3, hy - 3, 6, 2); q('#f1c40f', -3, hy - 4); q('#f1c40f', 0, hy - 4); q('#f1c40f', 2, hy - 4); q('#e74c3c', -1, hy - 3); }
  if (L.hat === 'helmet') { q('#c0a040', -4, hy - 2, 8, 4); q('#c0392b', -1, hy - 5, 2, 3); }
  if (L.hat === 'nightcap') { q('#3a6ea5', -3, hy - 2, 6, 2); q('#3a6ea5', 1, hy - 4, 3, 2); q('#fff', 4, hy - 4); }
  if (L.pipe && dir === 0) { q('#3a2a1a', 1, hy + 5, 3, 1); q('#3a2a1a', 3, hy + 4, 1, 1); }
  // accessories
  if (L.staff) { p('#7a5230', 5, -19 + dy, 1, 18); p('#5a3a20', 5, -19 + dy, 1, 1); }
  if (o.hold) o.hold(g, x, y + dy, dir);
  if (o.chained) {
    p('#8a8a90', -6, bodyTop + 5, 2, 1); p('#8a8a90', 4, bodyTop + 5, 2, 1);
    p('#6a6a70', -7, bodyTop + 6, 1, 4); p('#6a6a70', 6, bodyTop + 6, 1, 4);
  }
}

// portrait
const _pc = document.createElement('canvas'); _pc.width = 24; _pc.height = 28;
const _pg = _pc.getContext('2d');
function drawPortrait(c, x, y, w, L, o = {}) {
  _pg.clearRect(0, 0, 24, 28);
  if (L === 'owl') drawOwl(_pg, 12, 20, G.t, { noShadow: true });
  else if (typeof L === 'function') L(_pg);
  else drawPerson(_pg, 12, 28, L, 0, 0, { noShadow: true, smile: o.smile });
  c.imageSmoothingEnabled = false;
  c.drawImage(_pc, 2, 3, 20, 16, x, y, w, w * 16 / 20);
}

// ---------------- owl companion (Glaux)
function drawOwl(g, x, y, t, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const p = (c, a, b, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  if (!o.noShadow && !o.flying) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x - 3, y, 7, 1); }
  const body = '#8a6a4a', dark = '#5a4030', belly = '#d8c09a';
  const wingUp = o.flying && Math.floor(t * 10) % 2 === 0;
  // body
  p(body, -3, -9, 7, 9);
  p(belly, -2, -5, 5, 4);
  p(dark, -1, -4); p(dark, 1, -3); p(dark, -1, -2);
  // head
  p(body, -4, -13, 9, 5);
  p(dark, -4, -14); p(dark, 4, -14); // ear tufts
  // face disc
  p('#e8d8b8', -3, -12, 3, 3); p('#e8d8b8', 1, -12, 3, 3);
  const blink = (Math.floor(t * 10) % 37) === 0 || o.blink;
  if (blink) { p(dark, -3, -11, 3, 1); p(dark, 1, -11, 3, 1); }
  else { p('#f1c40f', -2, -12, 2, 2); p('#f1c40f', 2, -12, 2, 2); p('#111', -2, -11); p('#111', 2, -11); }
  p('#e67e22', 0, -10, 1, 2);
  // wings
  if (o.flying) {
    if (wingUp) { p(dark, -7, -13, 4, 3); p(dark, 4, -13, 4, 3); }
    else { p(dark, -7, -8, 4, 3); p(dark, 4, -8, 4, 3); }
  } else { p(dark, -4, -8, 1, 6); p(dark, 4, -8, 1, 6); }
  // feet
  if (!o.flying) { p('#e67e22', -2, 0, 2, 1); p('#e67e22', 1, 0, 2, 1); }
}

// ---------------- common props
function drawColumn(g, x, y, h, c = '#e8e0cc', o = {}) {
  const d = shade(c, -0.18), l = shade(c, 0.1);
  R(g, d, x - 1, y - 3, 10, 3);
  R(g, c, x, y - h, 8, h - 3);
  R(g, l, x + 1, y - h, 1, h - 3); R(g, d, x + 4, y - h, 1, h - 3); R(g, d, x + 6, y - h, 1, h - 3);
  R(g, c, x - 1, y - h - 3, 10, 3); R(g, d, x - 1, y - h - 1, 10, 1);
  if (o.paint) { R(g, o.paint, x, y - h + 2, 8, 2); R(g, o.paint, x, y - 8, 8, 2); }
}
function drawTree(g, x, y, o = {}) {
  const leaf = o.leaf || '#3f8f3a', trunk = o.trunk || '#6b4a2b', s = o.size || 1;
  R(g, 'rgba(0,0,0,0.2)', x - 8 * s, y - 1, 16 * s, 3);
  R(g, trunk, x - 2, y - 14 * s, 4, 14 * s);
  R(g, shade(trunk, -0.25), x + 1, y - 14 * s, 1, 14 * s);
  const r = Math.round(9 * s);
  disc(g, x, y - 18 * s, r, shade(leaf, -0.2));
  disc(g, x - 4 * s, y - 21 * s, Math.round(r * 0.75), leaf);
  disc(g, x + 4 * s, y - 20 * s, Math.round(r * 0.7), leaf);
  disc(g, x - 1, y - 25 * s, Math.round(r * 0.6), shade(leaf, 0.15));
  if (o.fruit) for (let i = 0; i < 6; i++) R(g, o.fruit, x - 7 * s + ((i * 37) % 14) * s, y - 26 * s + ((i * 23) % 14) * s, 2, 2);
}
function drawBush(g, x, y, c = '#3f8f3a', flowers) {
  disc(g, x, y - 4, 5, shade(c, -0.2)); disc(g, x - 3, y - 5, 4, c); disc(g, x + 3, y - 5, 4, shade(c, 0.1));
  if (flowers) for (let i = 0; i < 4; i++) R(g, flowers, x - 5 + ((i * 7) % 10), y - 9 + ((i * 5) % 6), 1, 1);
}
function drawRock(g, x, y, w, h, c = '#8a8a8a') {
  ellipse(g, x, y - h / 2, w / 2, h / 2, shade(c, -0.15));
  ellipse(g, x - 1, y - h / 2 - 1, w / 2 - 1, h / 2 - 1, c);
  R(g, shade(c, 0.2), x - w / 4, y - h + 2, Math.max(2, w / 4), 1);
}
function drawSign(g, x, y, c = '#8b5a2b') {
  R(g, shade(c, -0.3), x - 1, y - 14, 2, 14);
  R(g, c, x - 8, y - 18, 16, 7); R(g, shade(c, 0.2), x - 8, y - 18, 16, 1); R(g, shade(c, -0.25), x - 8, y - 12, 16, 1);
  R(g, '#3a2414', x - 6, y - 16, 12, 1); R(g, '#3a2414', x - 6, y - 14, 9, 1);
}
function drawLantern(g, x, y, t, c = '#e74c3c') {
  R(g, '#3a2a1a', x, y - 22, 1, 6);
  R(g, c, x - 3, y - 16, 7, 8); R(g, shade(c, 0.3), x - 2, y - 15, 2, 6); R(g, '#c9a24a', x - 3, y - 17, 7, 1); R(g, '#c9a24a', x - 3, y - 8, 7, 1);
  const fl = 0.25 + 0.1 * Math.sin(t * 6 + x);
  g.fillStyle = `rgba(255,200,120,${fl})`; disc(g, x, y - 12, 9, `rgba(255,200,120,${fl * 0.5})`);
}
function drawFlame(g, x, y, t, s = 1) {
  const f = Math.sin(t * 15 + x) > 0;
  R(g, '#e74c3c', x - 3 * s, y - 6 * s, 6 * s, 6 * s);
  R(g, '#f39c12', x - 2 * s, y - (f ? 9 : 8) * s, 4 * s, 7 * s);
  R(g, '#f9e79f', x - 1 * s, y - (f ? 6 : 5) * s, 2 * s, 4 * s);
  R(g, '#f39c12', x + (f ? 1 : -2) * s, y - 11 * s, 1 * s, 2 * s);
}
function drawExclaim(g, x, y, t, c = '#f1c40f') {
  const b = Math.round(Math.sin(t * 5) * 1.5);
  R(g, '#1a1020', x - 2, y - 11 + b, 4, 9); R(g, '#1a1020', x - 2, y - 1 + b, 4, 3);
  R(g, c, x - 1, y - 10 + b, 2, 6); R(g, c, x - 1, y + b, 2, 1);
}
function drawSpark(g, x, y, t) {
  const a = (Math.sin(t * 4 + x * 0.3) + 1) / 2;
  if (a < 0.25) return;
  g.fillStyle = `rgba(255,255,220,${a})`;
  g.fillRect(Math.round(x), Math.round(y - 2), 1, 5); g.fillRect(Math.round(x - 2), Math.round(y), 5, 1);
}

// small item icons (used by Stoa sorting, Bodhi treasures, etc.)
const ICONS = {
  cloud(g, x, y) { disc(g, x, y, 5, '#cfd8e3'); disc(g, x - 5, y + 2, 4, '#cfd8e3'); disc(g, x + 5, y + 2, 4, '#e8eef5'); R(g, '#7f8fa6', x - 3, y + 7, 1, 2); R(g, '#7f8fa6', x + 1, y + 8, 1, 2); },
  talk(g, x, y) { R(g, '#f5f5f5', x - 7, y - 5, 14, 9); R(g, '#f5f5f5', x - 4, y + 4, 3, 2); R(g, '#e74c3c', x - 4, y - 2, 2, 3); R(g, '#e74c3c', x, y - 2, 2, 3); R(g, '#e74c3c', x + 4, y - 2, 2, 3); },
  heart(g, x, y) { R(g, '#e74c3c', x - 5, y - 4, 4, 3); R(g, '#e74c3c', x + 1, y - 4, 4, 3); R(g, '#e74c3c', x - 6, y - 2, 12, 3); R(g, '#e74c3c', x - 4, y + 1, 8, 2); R(g, '#e74c3c', x - 2, y + 3, 4, 2); R(g, '#f5b7b1', x - 4, y - 3, 1, 1); },
  sweat(g, x, y) { R(g, '#3498db', x - 1, y - 6, 2, 2); R(g, '#3498db', x - 2, y - 4, 4, 3); R(g, '#3498db', x - 3, y - 1, 6, 4); R(g, '#85c1e9', x - 2, y, 1, 2); },
  ship(g, x, y) { R(g, '#8b5a2b', x - 7, y + 1, 14, 3); R(g, '#8b5a2b', x - 5, y + 4, 10, 1); R(g, '#5a3a1a', x, y - 8, 1, 9); R(g, '#f5f5f5', x + 1, y - 7, 5, 6); R(g, '#3498db', x - 8, y + 5, 16, 1); },
  sick(g, x, y) { R(g, '#ecf0f1', x - 1, y - 8, 3, 12); R(g, '#e74c3c', x, y - 2, 1, 5); disc(g, x + 1, y + 5, 2, '#e74c3c'); },
  trophy(g, x, y) { R(g, '#f1c40f', x - 5, y - 6, 10, 6); R(g, '#f1c40f', x - 2, y, 4, 3); R(g, '#d4ac0d', x - 4, y + 3, 8, 2); R(g, '#f1c40f', x - 7, y - 5, 2, 3); R(g, '#f1c40f', x + 5, y - 5, 2, 3); R(g, '#fff', x - 3, y - 5, 1, 3); },
  mind(g, x, y) { disc(g, x, y, 6, '#f5b7b1'); R(g, '#c0392b', x - 3, y - 2, 6, 1); R(g, '#c0392b', x - 1, y - 4, 1, 6); R(g, '#c0392b', x + 2, y + 1, 2, 1); },
  clock(g, x, y) { disc(g, x, y, 6, '#ecf0f1'); ring(g, x, y, 6, '#7f8c8d'); R(g, '#2c3e50', x, y - 4, 1, 4); R(g, '#2c3e50', x - 3, y, 4, 1); },
  coin(g, x, y) { disc(g, x, y, 5, '#f1c40f'); disc(g, x, y, 3, '#d4ac0d'); R(g, '#fff6c0', x - 2, y - 3, 1, 2); },
  coins(g, x, y) { ICONS.coin(g, x - 4, y + 2); ICONS.coin(g, x + 3, y + 1); ICONS.coin(g, x, y - 3); },
  mirror(g, x, y) { ellipse(g, x, y - 2, 5, 6, '#c9a24a'); ellipse(g, x, y - 2, 4, 5, '#aed6f1'); R(g, '#fff', x - 2, y - 5, 1, 3); R(g, '#8b5a2b', x - 1, y + 4, 2, 5); },
  bow(g, x, y) { for (let i = -6; i <= 6; i++) R(g, '#8b5a2b', x + Math.round(3 - (i * i) / 12), y + i); R(g, '#ddd', x - 2, y - 6, 1, 13); R(g, '#7f8c8d', x - 7, y, 9, 1); },
  scale(g, x, y) { R(g, '#7f8c8d', x, y - 6, 1, 11); R(g, '#7f8c8d', x - 6, y - 5, 13, 1); R(g, '#c9a24a', x - 8, y - 1, 5, 2); R(g, '#c9a24a', x + 4, y - 1, 5, 2); R(g, '#7f8c8d', x - 3, y + 5, 7, 1); },
  storm(g, x, y) { ICONS.cloud(g, x, y - 2); R(g, '#f1c40f', x, y + 4, 2, 2); R(g, '#f1c40f', x - 1, y + 6, 2, 2); },
  crown(g, x, y) { R(g, '#f1c40f', x - 6, y - 1, 12, 5); R(g, '#f1c40f', x - 6, y - 5, 2, 4); R(g, '#f1c40f', x - 1, y - 6, 2, 5); R(g, '#f1c40f', x + 4, y - 5, 2, 4); R(g, '#e74c3c', x - 1, y + 1, 2, 2); R(g, '#3498db', x - 5, y + 1, 2, 2); R(g, '#3498db', x + 3, y + 1, 2, 2); },
  mango(g, x, y) { ellipse(g, x, y, 5, 6, '#f39c12'); ellipse(g, x - 1, y - 1, 3, 4, '#f7c04a'); R(g, '#27ae60', x + 1, y - 7, 3, 2); },
  scroll(g, x, y) { R(g, '#f3e6c4', x - 6, y - 4, 12, 8); R(g, '#c9a24a', x - 7, y - 5, 2, 10); R(g, '#c9a24a', x + 5, y - 5, 2, 10); R(g, '#8b5a2b', x - 4, y - 2, 8, 1); R(g, '#8b5a2b', x - 4, y, 6, 1); R(g, '#8b5a2b', x - 4, y + 2, 7, 1); },
  apple(g, x, y) { disc(g, x, y, 5, '#c0392b'); R(g, '#5a3a1a', x, y - 7, 1, 3); R(g, '#27ae60', x + 1, y - 7, 3, 2); },
  book(g, x, y) { R(g, '#8e44ad', x - 6, y - 5, 12, 10); R(g, '#f3e6c4', x - 5, y + 3, 11, 2); R(g, '#c9a24a', x - 3, y - 2, 6, 1); },
  past(g, x, y) { R(g, '#a1887f', x - 6, y - 6, 12, 12); R(g, '#d7ccc8', x - 5, y - 5, 10, 10); R(g, '#6d4c41', x - 3, y - 2, 6, 5); R(g, '#6d4c41', x - 1, y - 4, 2, 2); R(g, '#795548', x - 6, y + 4, 12, 2); },
  market(g, x, y) { R(g, '#ecf0f1', x - 7, y - 6, 14, 12); line(g, x - 6, y + 3, x - 2, y - 1, '#27ae60'); line(g, x - 2, y - 1, x + 1, y + 2, '#c0392b'); line(g, x + 1, y + 2, x + 6, y - 4, '#27ae60'); },
};
