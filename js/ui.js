'use strict';
// ============================================================
// PhilWorld — UI: dialog, choices, insight cards, journal, roadmap, HUD
// ============================================================
const FONT = s => `${s}px VT323, monospace`;
const TFONT = s => `${s}px "Press Start 2P", monospace`;
const UIC = { ink: '#f4ead2', dim: '#b9ad94', hl: '#f7c948', panel: 'rgba(22,16,34,0.94)', border: '#e8d5a8', border2: '#6b5a8a' };

function uiBegin() {
  ctx.setTransform(SCALE, 0, 0, SCALE, OX, OY);
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = 'top';
}
function panel(x, y, w, h, o = {}) {
  ctx.fillStyle = o.bg || UIC.panel; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = o.border2 || UIC.border2;
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = o.border || UIC.border;
  ctx.fillRect(x + 2, y + 2, w - 4, 1); ctx.fillRect(x + 2, y + h - 3, w - 4, 1); ctx.fillRect(x + 2, y + 2, 1, h - 4); ctx.fillRect(x + w - 3, y + 2, 1, h - 4);
}
function text(str, x, y, o = {}) {
  str = T(str);
  ctx.font = o.title ? TFONT(o.size || 8) : FONT(o.size || 13);
  ctx.textAlign = o.align || 'left';
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(str, x + 0.6, y + 0.6); }
  ctx.fillStyle = o.color || UIC.ink;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}
function textW(str, o = {}) { ctx.font = o.title ? TFONT(o.size || 8) : FONT(o.size || 13); return ctx.measureText(str).width; }

// ---------- rich text (*highlight*)
function parseRich(s) {
  s = T(s);
  const out = []; let hl = false;
  for (const ch of s) { if (ch === '*') { hl = !hl; continue; } out.push({ ch, hl }); }
  return out;
}
function layoutRich(chars, maxW, size) {
  ctx.font = FONT(size);
  const lines = []; let line = [], lineW = 0, word = [], wordW = 0;
  const cw = ch => ctx.measureText(ch).width;
  const spaceW = cw(' ');
  const pushWord = () => {
    if (!word.length) return;
    if (lineW + wordW > maxW && line.length) {
      while (line.length && line[line.length - 1].ch === ' ') line.pop();
      lines.push(line); line = []; lineW = 0;
    }
    line.push(...word); lineW += wordW; word = []; wordW = 0;
  };
  for (const c of chars) {
    if (c.ch === '\n') { pushWord(); lines.push(line); line = []; lineW = 0; continue; }
    if (c.ch === ' ') { pushWord(); if (line.length) { line.push(c); lineW += spaceW; } continue; }
    word.push(c); wordW += cw(c.ch);
  }
  pushWord(); if (line.length) lines.push(line);
  return lines;
}
function drawRich(lines, x, y, size, lh, limit = 1e9, o = {}) {
  ctx.font = FONT(size);
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    let cx = x;
    for (const c of lines[i]) {
      if (n >= limit) return;
      const w = ctx.measureText(c.ch).width;
      if (o.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(c.ch, cx + 0.6, y + i * lh + 0.6); }
      ctx.fillStyle = c.hl ? (o.hl || UIC.hl) : (o.color || UIC.ink);
      ctx.fillText(c.ch, cx, y + i * lh);
      cx += w; n++;
    }
  }
}
function richBlock(str, x, y, maxW, size = 13, lh = 13, o = {}) {
  const lines = layoutRich(parseRich(str), maxW, size);
  drawRich(lines, x, y, size, lh, 1e9, o);
  return lines.length * lh;
}

// ---------- dialog
function speakerOf(who) {
  if (!who) return null;
  if (who === 'you') return { name: G.state.name, look: playerLook(), voice: 380 };
  if (typeof who === 'object') return who;
  return SPEAKERS[who] || { name: who, look: null, voice: 400 };
}
const Dialog = {
  cur: null, queue: [],
  next() { if (typeof Voice !== 'undefined') Voice.stop(); this.cur = null; const n = this.queue.shift(); if (n) n(); },
  open(who, str, choices, o = {}) {
    return new Promise(res => {
      if (this.cur) { this.queue.push(() => this._open(who, str, choices, o, res)); return; }
      this._open(who, str, choices, o, res);
    });
  },
  _open(who, str, choices, o, res) {
    {
      const sp = speakerOf(who);
      const tx = sp && sp.look ? 76 : 20;
      const chars = parseRich(str);
      const lines = layoutRich(chars, 464 - (tx - 8) - 14, 13);
      this.cur = { sp, str, chars, lines, total: chars.length, shown: 0, choices, sel: 0, res, tx, blipT: 0, t: 0, o };
      const c = this.cur;
      c.voice = (typeof Voice !== 'undefined' && !(sp && sp.name === G.state.name && who === 'you')) ? Voice.play(str) : null;
      if (c.voice) c.voice.onDuration(d => { c.speed = clamp(c.total / Math.max(0.6, d * 0.85), 22, 70); });
      if (typeof onDialogLine === 'function') onDialogLine(who, str, c);
    }
  },
  update(dt) {
    const c = this.cur; if (!c) return;
    c.t += dt;
    if (c.shown < c.total) {
      const speed = c.speed || (c.o.slow ? 28 : 52);
      const before = Math.floor(c.shown);
      c.shown = Math.min(c.total, c.shown + dt * speed);
      if (Math.floor(c.shown) !== before) {
        c.blipT -= 1;
        const ch = c.chars[Math.floor(c.shown) - 1];
        if (!c.voice && c.blipT <= 0 && ch && ch.ch !== ' ') { c.blipT = 2; SFX.blip(c.sp ? c.sp.voice || 400 : 330, c.sp && c.sp.look === 'owl' ? 'sine' : 'square'); }
      }
      if (hit('act') && c.t > 0.08) c.shown = c.total;
      return;
    }
    if (c.choices) {
      if (hit('up')) { c.sel = (c.sel + c.choices.length - 1) % c.choices.length; SFX.select(); }
      if (hit('down')) { c.sel = (c.sel + 1) % c.choices.length; SFX.select(); }
      if (hit('act')) { SFX.confirm(); const r = c.res, s = c.sel; this.next(); r(s); }
    } else if (hit('act')) {
      const r = c.res; this.next(); r();
    }
  },
  draw() {
    const c = this.cur; if (!c) return;
    const bx = 8, by = H - 80, bw = 464, bh = 74;
    panel(bx, by, bw, bh);
    if (c.sp && c.sp.look) {
      ctx.fillStyle = '#2e2440'; ctx.fillRect(14, by + 9, 56, 46);
      drawPortrait(ctx, 16, by + 11, 52, c.sp.look, { smile: true });
      ctx.fillStyle = UIC.border2; ctx.fillRect(14, by + 55, 56, 1);
    }
    if (c.sp) {
      const nw = textW(c.sp.name, { size: 13 }) + 14;
      panel(bx + 6, by - 13, nw, 15, { bg: '#3a2a5a' });
      text(c.sp.name, bx + 13, by - 12, { color: UIC.hl });
    }
    drawRich(c.lines, c.tx, by + 9, 13, 13, Math.floor(c.shown), c.sp ? {} : { color: '#d9d0f0' });
    if (c.shown >= c.total && !c.choices && Math.floor(G.t * 3) % 2 === 0) text('▼', bx + bw - 16, by + bh - 16, { color: UIC.hl });
    if (c.choices && c.shown >= c.total) {
      ctx.font = FONT(13);
      const w = Math.min(440, Math.max(...c.choices.map(s => ctx.measureText(s.replace(/\*/g, '')).width)) + 30);
      const h = c.choices.length * 15 + 10;
      const x = bx + bw - w, y = by - h - 4;
      panel(x, y, w, h, { bg: 'rgba(30,22,48,0.97)' });
      c.choices.forEach((s, i) => {
        const sel = i === c.sel;
        if (sel) { ctx.fillStyle = 'rgba(247,201,72,0.15)'; ctx.fillRect(x + 4, y + 5 + i * 15, w - 8, 14); }
        text((sel ? '▶ ' : '  ') + s.replace(/\*/g, ''), x + 8, y + 6 + i * 15, { color: sel ? UIC.hl : UIC.ink });
      });
    }
  },
};
function say(who, str, o) { return Dialog.open(who, str, null, o || {}); }
function narrate(str, o) { return Dialog.open(null, str, null, o || {}); }
function ask(who, str, choices, o) { return Dialog.open(who, str, choices, o || {}); }
async function sayAll(who, arr) { for (const s of arr) await say(who, s); }

// ---------- vignette panel ("imagine...")
const vcan = document.createElement('canvas'); vcan.width = 160; vcan.height = 90;
const vg = vcan.getContext('2d');
function showVignette(draw, o = {}) { G.vignette = { draw, t0: G.t, title: o.title || '', bg: o.bg || '#2a2440', x: o.x, y: o.y }; }
function hideVignette() { G.vignette = null; }
function drawVignette() {
  const v = G.vignette; if (!v) return;
  vg.fillStyle = v.bg; vg.fillRect(0, 0, 160, 90);
  try { v.draw(vg, G.t - v.t0); } catch (e) { console.error(e); G.vignette = null; return; }
  const x = v.x == null ? W / 2 - 84 : v.x, y = v.y == null ? 14 : v.y;
  g.fillStyle = '#1a1020'; g.fillRect(x - 2, y - 2, 168, 98);
  g.fillStyle = '#e8d5a8'; g.fillRect(x, y, 164, 94);
  g.drawImage(vcan, x + 2, y + 2);
}
function drawVignetteTitle() {
  const v = G.vignette; if (!v || !v.title) return;
  const x = v.x == null ? W / 2 - 84 : v.x, y = v.y == null ? 14 : v.y;
  const w = textW(v.title, { size: 12 }) + 10;
  ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 82 - w / 2, y + 88, w, 12);
  text(v.title, x + 82, y + 88, { size: 12, align: 'center', color: UIC.hl });
}

// ---------- small notices
function toastRoom(title, sub) { G.toast = { title, sub, t: 0 }; }
function notice(str, dur = 2.6) { G.msg = { str, t: 0, dur }; }

// ---------- insight card
const icanv = document.createElement('canvas'); icanv.width = 80; icanv.height = 40;
const ig = icanv.getContext('2d');
function drawInsightCard(id, x, y, alpha = 1, o = {}) {
  const I = INSIGHTS[id];
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 2, y - 2, 344, 244);
  ctx.fillStyle = '#f3e6c4'; ctx.fillRect(x, y, 340, 240);
  ctx.fillStyle = '#e4d3a8'; ctx.fillRect(x, y + 236, 340, 4);
  ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x + 4, y + 4, 332, 1); ctx.fillRect(x + 4, y + 235, 332, 1); ctx.fillRect(x + 4, y + 4, 1, 232); ctx.fillRect(x + 335, y + 4, 1, 232);
  text(o.header || '✦ INSIGHT ✦', x + 170, y + 10, { title: true, size: 7, align: 'center', color: '#b9770e', shadow: false });
  text(I.title, x + 170, y + 22, { title: true, size: 9, align: 'center', color: '#4a2a10', shadow: false });
  text(I.place + '  ·  ' + I.who, x + 170, y + 36, { size: 12, align: 'center', color: '#7a5a3a', shadow: false });
  ig.fillStyle = '#3a2a4a'; ig.fillRect(0, 0, 80, 40);
  try { I.icon(ig, G.t); } catch (e) { }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#4a2a10'; ctx.fillRect(x + 108, y + 50, 124, 64);
  ctx.drawImage(icanv, x + 110, y + 52, 120, 60);
  text(I.quote, x + 170, y + 118, { size: 13, align: 'center', color: '#6a3a8a', shadow: false });
  let yy = y + 134;
  for (const pt of I.points) {
    ctx.fillStyle = '#b9770e'; ctx.fillRect(x + 16, yy + 5, 3, 3);
    const lines = layoutRich(parseRich(pt), 296, 13);
    drawRich(lines, x + 24, yy, 13, 11, 1e9, { color: '#3a2410', hl: '#a04000', shadow: false });
    yy += lines.length * 11 + 4;
  }
  ctx.globalAlpha = 1;
}
function giveInsight(id) {
  if (!G.state.insights.includes(id)) { G.state.insights.push(id); save(); }
  if (id === 'amorfati' || id === 'middleway') flag('cafeOpen', 1);
  SFX.chime();
  setTimeout(() => SFX.wonder(), 400);
  return new Promise(res => { G.overlay = { type: 'insight', id, t: 0, res }; });
}

// ---------- overlays: insight / journal / map
const Overlay = {
  update(dt) {
    const o = G.overlay; if (!o) return;
    o.t += dt;
    if (o.type === 'insight') {
      if (o.t > 0.6 && hit('act')) { SFX.confirm(); G.overlay = null; o.res && o.res(); }
    } else if (o.type === 'journal') {
      const n = G.state.insights.length;
      if (hit('left')) { o.i = (o.i + n - 1) % Math.max(n, 1); SFX.paper(); }
      if (hit('right')) { o.i = (o.i + 1) % Math.max(n, 1); SFX.paper(); }
      if (hit('journal') || hit('esc') || hit('act')) { G.overlay = null; SFX.select(); }
    } else if (o.type === 'map') {
      const nodes = MAP_NODES;
      const cur = nodes[o.sel];
      const dirs = [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]];
      for (const [k, dx, dy] of dirs) {
        if (hit(k)) {
          let best = -1, bs = 1e9;
          nodes.forEach((n, i) => {
            if (i === o.sel) return;
            const vx = n.x - cur.x, vy = n.y - cur.y;
            const along = vx * dx + vy * dy; if (along <= 4) return;
            const across = Math.abs(vx * dy) + Math.abs(vy * dx);
            const s = along + across * 2.2;
            if (s < bs) { bs = s; best = i; }
          });
          if (best >= 0) { o.sel = best; SFX.select(); }
        }
      }
      if (hit('map') || hit('esc') || hit('act')) { G.overlay = null; SFX.select(); }
    }
  },
  draw() {
    const o = G.overlay; if (!o) return;
    if (o.type === 'insight') {
      ctx.fillStyle = `rgba(10,6,20,${Math.min(0.75, o.t * 2)})`; ctx.fillRect(0, 0, W, H);
      const k = ease(Math.min(1, o.t * 2.5));
      drawInsightCard(o.id, 70, 16 + (1 - k) * 30, k);
      for (let i = 0; i < 10; i++) {
        const a = G.t * 0.8 + i * 0.63;
        const px = 240 + Math.cos(a) * (190 + (i % 3) * 8), py = 136 + Math.sin(a * 1.3) * 126;
        ctx.fillStyle = `rgba(247,201,72,${0.4 + 0.4 * Math.sin(G.t * 5 + i)})`; ctx.fillRect(px, py, 2, 2);
      }
      if (o.t > 0.6) text('E · continue', 240, 258, { size: 12, align: 'center', color: UIC.hl });
    } else if (o.type === 'journal') {
      ctx.fillStyle = 'rgba(10,6,20,0.85)'; ctx.fillRect(0, 0, W, H);
      const n = G.state.insights.length;
      text('JOURNAL', 240, 6, { title: true, size: 8, align: 'center', color: UIC.hl });
      INSIGHT_ORDER.forEach((id, i) => {
        const have = G.state.insights.includes(id);
        const x = 240 - 5 * 14 + i * 14 + 2, y = 18;
        const isCur = have && G.state.insights[o.i] === id;
        ctx.fillStyle = have ? (isCur ? '#fff' : '#f7c948') : '#4a4060';
        ctx.fillRect(x + 3, y, 3, 9); ctx.fillRect(x, y + 3, 9, 3);
      });
      if (!n) { text('No insights yet. Explore and talk to people!', 240, 130, { size: 14, align: 'center' }); }
      else { drawInsightCard(G.state.insights[o.i], 70, 30, 1, { header: `✦ ${o.i + 1} / ${n} ✦` }); }
      text('← → browse   ·   J / Esc close', 240, 260, { size: 12, align: 'center', color: UIC.dim });
    } else if (o.type === 'map') drawMap(o);
  },
};
function openJournal() { G.overlay = { type: 'journal', t: 0, i: Math.max(0, G.state.insights.length - 1) }; SFX.paper(); }
function openMap() {
  const i = Math.max(0, MAP_NODES.findIndex(n => n.id === G.roomId));
  G.overlay = { type: 'map', t: 0, sel: i }; SFX.whoosh();
}

const starSeed = mulberry(7); const STARS = [];
for (let i = 0; i < 140; i++) STARS.push([starSeed() * W, starSeed() * H, starSeed()]);
function nodeState(n) {
  if (n.region === 'teaser') return 'teaser';
  if (G.state.insights.includes(ROOM_INSIGHT[n.id])) return 'done';
  if (G.state.visited.includes(n.id)) return 'visited';
  return 'unknown';
}
function drawMap(o) {
  ctx.fillStyle = '#0c0a1c'; ctx.fillRect(0, 0, W, H);
  for (const [x, y, b] of STARS) { ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.35 * b * (0.6 + 0.4 * Math.sin(G.t * 2 + x))})`; ctx.fillRect(x, y, 1, 1); }
  // region labels
  text('THE WEST', 80, 236, { title: true, size: 6, color: '#5d8aa8', align: 'center' });
  text('THE EAST', 400, 236, { title: true, size: 6, color: '#c0604a', align: 'center' });
  const byId = {}; MAP_NODES.forEach(n => byId[n.id] = n);
  const sel = MAP_NODES[o.sel];
  // edges
  for (const [a, b, label, kind] of MAP_EDGES) {
    const A = byId[a], B = byId[b];
    const known = nodeState(A) !== 'unknown' || nodeState(B) !== 'unknown';
    const isSel = sel.id === a || sel.id === b;
    ctx.strokeStyle = kind === 'teaser' ? 'rgba(120,110,150,0.35)' : kind === 'echo' ? (isSel ? 'rgba(160,220,255,0.8)' : 'rgba(160,220,255,0.3)') : kind === 'clash' ? 'rgba(231,76,60,0.6)' : (known ? 'rgba(232,213,168,0.7)' : 'rgba(232,213,168,0.25)');
    ctx.lineWidth = isSel ? 1.4 : 0.8;
    ctx.setLineDash(kind === 'path' ? [] : [2, 3]);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    ctx.setLineDash([]);
    if (isSel && label && label !== 'path' && kind !== 'teaser') {
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const w = textW(label, { size: 11 }) + 6;
      ctx.fillStyle = 'rgba(12,10,28,0.85)'; ctx.fillRect(mx - w / 2, my - 6, w, 11);
      text(label, mx, my - 6, { size: 11, align: 'center', color: kind === 'echo' ? '#a0dcff' : kind === 'clash' ? '#f1948a' : UIC.dim });
    }
  }
  // your path trail
  const path = G.state.path.filter(id => byId[id]);
  if (path.length > 1) {
    ctx.strokeStyle = 'rgba(247,201,72,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([1, 3]);
    ctx.beginPath(); path.forEach((id, i) => { const n = byId[id]; if (i) ctx.lineTo(n.x, n.y); else ctx.moveTo(n.x, n.y); }); ctx.stroke(); ctx.setLineDash([]);
  }
  // nodes
  MAP_NODES.forEach((n, i) => {
    const st = nodeState(n);
    const isSel = i === o.sel, here = n.id === G.roomId;
    const c = st === 'done' ? '#f7c948' : st === 'visited' ? '#e8d5a8' : st === 'teaser' ? '#4a4466' : '#7a6f9a';
    const r = n.region === 'finale' ? 6 : n.region === 'hub' ? 5 : 4;
    if (st === 'done') { ctx.fillStyle = `rgba(247,201,72,${0.15 + 0.1 * Math.sin(G.t * 3 + i)})`; ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, 7); ctx.fill(); }
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill();
    if (st === 'done') { ctx.fillStyle = '#fff'; ctx.fillRect(n.x - 0.5, n.y - r + 1, 1, 2 * r - 2); ctx.fillRect(n.x - r + 1, n.y - 0.5, 2 * r - 2, 1); }
    if (here) { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(n.x, n.y, r + 3 + Math.sin(G.t * 4), 0, 7); ctx.stroke(); }
    if (isSel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(n.x - r - 4, n.y - r - 4, 2 * r + 8, 2 * r + 8); }
    const label = st === 'unknown' ? '???' : n.name;
    text(label, n.x, n.y + r + 2, { size: 11, align: 'center', color: st === 'teaser' ? '#6a6488' : isSel ? '#fff' : c });
  });
  // info box
  const st = nodeState(sel);
  panel(8, 246 - 2, 464, 26, { bg: 'rgba(22,16,34,0.96)' });
  const status = { done: '✦ Insight gained', visited: 'Visited', unknown: 'Not yet discovered', teaser: 'Coming soon' }[st];
  text((st === 'unknown' ? '???' : sel.name) + '  ·  ' + sel.era + '  ·  ' + status, 16, 248, { size: 12, color: UIC.hl });
  text(st === 'unknown' ? 'Keep exploring to reveal this place.' : sel.desc, 16, 259, { size: 12 });
  text('ROADMAP OF IDEAS', 8, 4, { title: true, size: 7, color: UIC.hl });
  text(`✦ ${G.state.insights.length}/10 insights   ·   arrows: explore   ·   M / Esc: close`, 472, 4, { size: 12, align: 'right', color: UIC.dim });
  text('— path   ··· echo between traditions   ··· red: clash   ·  gold trail = your journey', 8, 15, { size: 11, color: '#7a6f9a' });
}

// ---------- HUD
function drawHUD() {
  const n = G.state.insights.length;
  ctx.fillStyle = 'rgba(12,10,28,0.55)'; ctx.fillRect(4, 4, 58, 13);
  ctx.fillStyle = UIC.hl; ctx.fillRect(10, 6, 2, 9); ctx.fillRect(7, 9, 8, 3);
  text(`${n}/10`, 20, 4, { size: 13, color: UIC.hl });
  if (G.savedAt != null && G.t - G.savedAt < 2) {
    ctx.globalAlpha = Math.min(1, 2 - (G.t - G.savedAt));
    text('✓ progress saved', 6, 18, { size: 11, color: '#7fd88a' });
    ctx.globalAlpha = 1;
  }
  if (document.body.classList.contains('touch')) return; // phones have on-screen buttons instead
  const hints = 'H hint · M map · J journal · O settings' + (AudioSys.isMuted() ? ' · N sound off' : '') + (flag('bow') ? ' · B bow' : '');
  const w = textW(hints, { size: 11 }) + 8;
  ctx.fillStyle = 'rgba(12,10,28,0.5)'; ctx.fillRect(W - w - 4, 4, w, 12);
  text(hints, W - 8, 5, { size: 11, align: 'right', color: UIC.dim });
}
function drawToast() {
  const t = G.toast; if (!t) return;
  t.t += G.dt;
  const a = t.t < 0.5 ? t.t / 0.5 : t.t > 3 ? Math.max(0, 1 - (t.t - 3) / 0.8) : 1;
  if (t.t > 3.8) { G.toast = null; return; }
  ctx.globalAlpha = a;
  const w = Math.max(textW(t.title, { title: true, size: 10 }), textW(t.sub || '', { size: 13 })) + 30;
  ctx.fillStyle = 'rgba(12,10,28,0.75)'; ctx.fillRect(240 - w / 2, 26, w, 34);
  ctx.fillStyle = UIC.hl; ctx.fillRect(240 - w / 2 + 6, 58, w - 12, 1);
  text(t.title, 240, 31, { title: true, size: 10, align: 'center', color: UIC.hl });
  if (t.sub) text(t.sub, 240, 45, { size: 13, align: 'center', color: UIC.dim });
  ctx.globalAlpha = 1;
}
function drawMsg() {
  const m = G.msg; if (!m) return;
  m.t += G.dt; if (m.t > m.dur) { G.msg = null; return; }
  const a = Math.min(1, (m.dur - m.t) * 3);
  ctx.globalAlpha = a;
  const lines = layoutRich(parseRich(m.str), 300, 13);
  const w = Math.min(316, Math.max(...lines.map(l => l.length)) * 6.5 + 16), h = lines.length * 12 + 8;
  const my = G.screen === 'title' ? 214 : 70;
  panel(240 - w / 2, my, w, h, { bg: 'rgba(22,16,34,0.92)' });
  drawRich(lines, 240 - w / 2 + 8, my + 4, 13, 12);
  ctx.globalAlpha = 1;
}
function drawPrompt() {
  const e = G.prompt; if (!e) return;
  const label = (typeof e.label === 'function' ? e.label() : e.label) || 'Look';
  const x = e.x, y = e.y - (e.ph || 26) - 6;
  const w = textW(label, { size: 12 }) + 20;
  ctx.fillStyle = 'rgba(12,10,28,0.8)'; ctx.fillRect(x - w / 2, y - 6, w, 12);
  ctx.fillStyle = UIC.hl; ctx.fillRect(x - w / 2 + 2, y - 5, 10, 10);
  text('E', x - w / 2 + 4, y - 6, { size: 12, color: '#1a1020', shadow: false });
  text(label, x - w / 2 + 15, y - 6, { size: 12 });
}

// ---------- settings page (O, or "Settings" on the title screen)
const Settings = {
  open: false, sel: 0, t: 0,
  rows() {
    const s = AudioSys.settings();
    return [
      { label: 'Sound', kind: 'toggle', get: () => !AudioSys.isMuted(), set: () => { if (AudioSys.toggleMute()) Voice.stop(); } },
      { label: 'Master volume', kind: 'slider', key: 'master', val: s.master },
      { label: 'Music', kind: 'slider', key: 'music', val: s.music },
      { label: 'Voices', kind: 'slider', key: 'voice', val: s.voice },
      { label: 'Sound effects', kind: 'slider', key: 'effects', val: s.effects },
      { label: 'Spoken lines', kind: 'toggle', get: () => Voice.isEnabled(), set: () => Voice.toggle() },
      { label: 'Story pictures', kind: 'toggle', get: () => G.panels !== false, set: () => { G.panels = G.panels === false; try { localStorage.setItem('philworld-panels', G.panels ? '1' : '0'); } catch (e) { } } },
      { label: 'Fullscreen', kind: 'toggle', get: () => !!fsEl(), set: () => toggleFullscreen() },
      { label: 'Close', kind: 'close' },
    ];
  },
  show() { this.open = true; this.sel = 0; this.t = 0; SFX.paper(); },
  close() { this.open = false; SFX.select(); },
  update(dt) {
    this.t += dt;
    const rows = this.rows();
    if (hit('up')) { this.sel = (this.sel + rows.length - 1) % rows.length; SFX.select(); }
    if (hit('down')) { this.sel = (this.sel + 1) % rows.length; SFX.select(); }
    const r = rows[this.sel];
    const chg = hit('left') ? -1 : hit('right') ? 1 : 0;
    if (r.kind === 'slider' && chg) {
      AudioSys.setSetting(r.key, r.val + chg * 0.1);
      if (r.key === 'voice' || r.key === 'master') Voice.setVolume(AudioSys.voiceLevel());
      SFX.select();
    }
    if (r.kind === 'toggle' && (chg || hit('act'))) { r.set(); SFX.confirm(); }
    if ((r.kind === 'close' && hit('act')) || hit('esc') || hit('settings')) this.close();
  },
  draw() {
    if (!this.open) return;
    ctx.fillStyle = 'rgba(10,6,20,0.8)'; ctx.fillRect(0, 0, W, H);
    const rows = this.rows(), x = 110, w = 260, y0 = 46, rh = 20;
    panel(x, 18, w, y0 - 18 + rows.length * rh + 14);
    text('SETTINGS', 240, 26, { title: true, size: 8, align: 'center', color: UIC.hl });
    rows.forEach((r, i) => {
      const y = y0 + i * rh, sel = i === this.sel, c = sel ? UIC.hl : UIC.ink;
      if (r.kind === 'close') { text((sel ? '▶ ' : '') + 'Close', 240, y + 2, { size: 15, align: 'center', color: c }); return; }
      text((sel ? '▶ ' : '  ') + r.label, x + 12, y + 2, { size: 15, color: c });
      if (r.kind === 'slider') {
        const bx = x + 140, bw = 80;
        ctx.fillStyle = '#3a3050'; ctx.fillRect(bx, y + 8, bw, 4);
        ctx.fillStyle = sel ? UIC.hl : UIC.border; ctx.fillRect(bx, y + 8, Math.round(bw * r.val), 4);
        ctx.fillRect(bx + Math.round(bw * r.val) - 1, y + 5, 3, 10);
        text(Math.round(r.val * 100) + '%', x + w - 12, y + 2, { size: 14, align: 'right', color: sel ? UIC.hl : UIC.dim });
      } else {
        const on = r.get();
        text(on ? 'On' : 'Off', x + w - 12, y + 2, { size: 15, align: 'right', color: on ? '#7fd88a' : '#c0604a' });
      }
    });
    text('↑ ↓ choose  ·  ← → change  ·  F fullscreen  ·  O / Esc close', 240, 258, { size: 12, align: 'center', color: UIC.dim });
  },
};
