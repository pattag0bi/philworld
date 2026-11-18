'use strict';
// ============================================================
// PhilWorld — main loop, title screen, character creator
// ============================================================
const Title = { mode: 'main', sel: 0, slotSel: 0, row: 0, act: 0, confirm: false, slots: [], rects: [], t0: 0 };
const Creator = { row: 0, rows: ['Name', 'Hair', 'Hair color', 'Skin', 'Outfit', 'Begin journey'] };

function refreshTitleSave() {
  Title.slots = [];
  for (let n = 1; n <= SLOTS; n++) Title.slots.push(loadSave(n));
  const l = lastSlot();
  Title.last = Title.slots[l - 1] ? l : (Title.slots.findIndex(x => x) + 1) || 0; // slot to "Continue"
}
function mainOptions() { return Title.last ? ['Continue', 'Journeys', 'Settings'] : ['Begin journey', 'Settings']; }
function slotActions(n) {
  if (Title.confirm) return ['Yes, delete it', 'Keep it'];
  return Title.slots[n] ? ['Continue', 'Copy code', 'Delete'] : ['Begin', 'Paste code'];
}
function startTitle() {
  G.screen = 'title'; G.fadeTo = 0;
  refreshTitleSave();
  Object.assign(Title, { mode: 'main', sel: 0, row: 0, act: 0, confirm: false, t0: G.t });
  Title.slotSel = Math.max(0, Title.last - 1);
  AudioSys.setScene('title');
}
function ago(ts) {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
  const d = Math.floor(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
}

// ---------------- save codes: move progress between browsers / devices
const CODE_PREFIX = 'PHILWORLD-';
function makeSaveCode(n) {
  const s = loadSave(n); if (!s) return null;
  return CODE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(s))));
}
function readSaveCode(code) {
  code = (code || '').trim().replace(/\s+/g, '');
  if (code.startsWith(CODE_PREFIX)) code = code.slice(CODE_PREFIX.length);
  const s = JSON.parse(decodeURIComponent(escape(atob(code))));
  if (!s || typeof s !== 'object' || !Array.isArray(s.insights) || !s.look || !s.room || !Rooms[s.room]) throw new Error('bad save');
  return Object.assign(newState(), s);
}
async function copySaveCode(n) {
  const code = makeSaveCode(n); if (!code) return;
  let ok = false;
  try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { }
  for (const k in keys) keys[k] = false;
  if (ok) notice('Save code *copied*! Open PhilWorld in the other browser, pick an empty journey, and choose *Paste code*.', 5);
  else { window.prompt('Copy this save code, then paste it into PhilWorld in the other browser:', code); notice('Paste that code into *Paste code* on the other browser.', 4); }
}
function enterSaveCode(n) {
  const code = window.prompt('Paste your PhilWorld save code:');
  for (const k in keys) keys[k] = false;
  if (!code) return;
  try {
    const s = readSaveCode(code);
    G.slot = n; G.state = s; save(true);
    refreshTitleSave(); Title.row = 0;
    SFX.chime();
    notice(`Welcome back, *${s.name}*! Journey restored (${s.insights.length}/10 insights).`, 5);
  } catch (e) { SFX.boing(); notice('That code didn\'t work. Copy the *whole* code and try again.', 4); }
}
function startCreator(slot) {
  G.screen = 'creator';
  G.slot = slot || G.slot;
  G.state = newState();
  Creator.row = 0;
  G.textHandler = (e) => {
    if (G.screen !== 'creator' || Creator.row !== 0) return;
    if (e.key === 'Backspace') { G.state.name = G.state.name.slice(0, -1); SFX.blip(300); }
    else if (e.key.length === 1 && /[\p{L}\p{N} '\-]/u.test(e.key) && G.state.name.length < 14) {
      if (G.state.name === 'Traveler' && !Creator.typed) G.state.name = '';
      Creator.typed = true;
      G.state.name += e.key; SFX.blip(500);
    }
  };
}
async function startGame(fromSave) {
  G.textHandler = null;
  if (fromSave) { const s = loadSave(G.slot); if (s) G.state = Object.assign(newState(), s); }
  if (!G.state.name.trim()) G.state.name = 'Traveler';
  G.screen = 'game';
  G.fade = 1; G.fadeTo = 1;
  G.room = null;
  const room = G.state.room || 'crossroads', pos = G.state.pos;
  if (fromSave && pos && pos[0] === room) await goto(room, pos[1], pos[2], pos[3]);
  else await goto(room);
  if (fromSave) notice(`Welcome back, *${G.state.name}*! ✦ ${G.state.insights.length}/10 insights`, 3);
}

// ---------------- title / creator drawing
function drawTitleBg(t) {
  vgrad(g, 0, 0, W, H, '#0d0820', '#5a2f62', 18);
  const r = mulberry(3);
  for (let i = 0; i < 140; i++) {
    const x = r() * W, y = r() * 170, b = r();
    g.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * b * (0.5 + 0.5 * Math.sin(t * 2 + i))})`;
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  // shooting star every few seconds
  const ss = (t % 7) / 1.1;
  if (ss < 1) { const sx = 380 - ss * 150, sy = 20 + ss * 70; for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(255,240,200,${(1 - k / 10) * (1 - ss)})`; g.fillRect(Math.round(sx + k * 2.4), Math.round(sy - k * 1.1), 2, 1); } }
  // moon with halo
  for (let k = 5; k > 0; k--) { g.fillStyle = `rgba(247,201,72,${0.025 * (6 - k)})`; g.beginPath(); g.arc(404, 52, 14 + k * 5, 0, 7); g.fill(); }
  g.fillStyle = '#f6e7b4'; g.beginPath(); g.arc(404, 52, 14, 0, 7); g.fill();
  g.fillStyle = '#e0cc92'; g.beginPath(); g.arc(399, 48, 3, 0, 7); g.arc(409, 58, 2, 0, 7); g.arc(410, 46, 1.5, 0, 7); g.fill();
  // constellation of the roadmap
  g.strokeStyle = 'rgba(247,201,72,0.22)'; g.lineWidth = 1;
  const pts = [[40, 118], [88, 96], [140, 124], [192, 92], [246, 108], [300, 84], [350, 112]];
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  pts.forEach(([x, y], i) => { const a = 0.6 + 0.4 * Math.sin(t * 3 + i); g.fillStyle = `rgba(247,201,72,${a * 0.25})`; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = `rgba(255,236,160,${a})`; g.fillRect(x - 1, y - 1, 3, 3); });
  // drifting clouds
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 190 + t * (3 + i * 1.5)) % (W + 120)) - 60, cy = 134 + i * 11 + Math.sin(i * 2) * 5;
    g.fillStyle = `rgba(150,110,170,${0.13 + 0.03 * i})`;
    g.fillRect(Math.round(cx - 26), Math.round(cy), 52, 3); g.fillRect(Math.round(cx - 16), Math.round(cy - 3), 30, 3); g.fillRect(Math.round(cx - 34), Math.round(cy + 3), 36, 2);
  }
  // far hills, hills
  for (let x = 0; x < W; x++) {
    const h0 = 176 + Math.sin(x * 0.014 + 1) * 9 + Math.sin(x * 0.04) * 3;
    R(g, '#3a2650', x, h0, 1, H - h0);
    const h1 = 190 + Math.sin(x * 0.02) * 10 + Math.sin(x * 0.05) * 4;
    R(g, '#2a1a3a', x, h1, 1, H - h1);
    const h2 = 214 + Math.sin(x * 0.03 + 2) * 8;
    R(g, '#1a1028', x, h2, 1, H - h2);
  }
  // fork in the road
  for (let y = 214; y < H; y++) {
    const k = (y - 214) / (H - 214);
    const w = 4 + k * 40;
    R(g, '#5a4a3a', 240 - w / 2, y, w, 1);
    R(g, '#4a3a2a', 240 - w / 2 - k * 60 - 20 * k, y, 2 + k * 8, 1);
  }
  drawSign(g, 240, 218);
  drawOwl(g, 240, 201, t, {});
  // west temple (lit windows), east gate silhouettes
  for (let i = 0; i < 4; i++) R(g, '#3a2a4a', 60 + i * 10, 176, 4, 20);
  R(g, '#3a2a4a', 56, 172, 42, 4); R(g, '#3a2a4a', 62, 168, 30, 4);
  for (let i = 0; i < 3; i++) R(g, `rgba(247,201,72,${0.5 + 0.3 * Math.sin(t * 2 + i)})`, 66 + i * 10, 182, 2, 6);
  ring(g, 410, 186, 14, '#3a2a4a', 3); R(g, '#3a2a4a', 392, 200, 36, 3);
  // fireflies
  for (let i = 0; i < 14; i++) {
    const fx = (i * 67 + Math.sin(t * 0.6 + i * 3) * 18) % W, fy = 200 + ((i * 31) % 60) + Math.sin(t * 0.9 + i) * 8, a = Math.max(0, Math.sin(t * 1.6 + i * 2));
    g.fillStyle = `rgba(200,255,140,${a * 0.9})`; g.fillRect(Math.round(fx), Math.round(fy), 2, 2);
    g.fillStyle = `rgba(200,255,140,${a * 0.2})`; g.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 4, 4);
  }
}

// the golden PHILWORLD logo: a soft glow and a gentle wave through the letters
function drawLogo(y, size = 24) {
  const word = 'PHILWORLD', o = { title: true, size };
  const adv = word.split('').map(c => textW(c, o) + 1);
  let x = 240 - adv.reduce((a, b) => a + b, 0) / 2;
  ctx.save();
  word.split('').forEach((c, i) => {
    const dy = Math.sin(G.t * 2.2 - i * 0.55) * 1.6;
    ctx.shadowColor = 'rgba(247,201,72,0.65)'; ctx.shadowBlur = 14;
    text(c, x, y + dy, { ...o, color: i < 4 ? '#ffe28a' : '#f7c948', shadow: false });
    ctx.shadowBlur = 0;
    text(c, x + 1, y + dy + 1.5, { ...o, color: 'rgba(90,50,10,0.55)', shadow: false });
    text(c, x, y + dy, { ...o, color: i < 4 ? '#ffe28a' : '#f7c948', shadow: false });
    x += adv[i];
  });
  ctx.restore();
  // ornament under the logo: ──── ✦ ────
  const ow = 70 + 10 * Math.sin(G.t * 1.5);
  ctx.fillStyle = 'rgba(247,201,72,0.5)'; ctx.fillRect(240 - 14 - ow, y + size + 8, ow, 1); ctx.fillRect(240 + 14, y + size + 8, ow, 1);
  text('✦', 240, y + size + 2, { size: 13, align: 'center', color: '#f7c948' });
  text('a walk through the love of wisdom', 240, y + size + 16, { size: 16, align: 'center', color: '#e8d5a8' });
}

function titleBtn(label, x, y, w, sel, fn, o = {}) {
  Title.rects.push({ x, y, w, h: o.h || 16, fn });
  const h = o.h || 16;
  if (sel) { ctx.fillStyle = 'rgba(247,201,72,0.14)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#f7c948'; ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h); }
  text(label, x + w / 2, y + 1, { size: o.size || 15, align: 'center', color: sel ? (o.hot || '#f7c948') : (o.col || '#e8d5a8') });
}

function titleBack() { if (Title.confirm) Title.confirm = false; else if (Title.mode === 'slots') { Title.mode = 'main'; Title.sel = 0; } SFX.select(); }
function slotPrimary(n) {
  const a = slotActions(n)[Title.row ? Title.act : 0];
  SFX.confirm();
  if (Title.confirm) {
    if (a === 'Yes, delete it') { clearSave(n + 1); refreshTitleSave(); SFX.boing(); notice('Journey deleted.', 2); }
    Title.confirm = false; Title.act = 0; Title.row = 0; return;
  }
  if (a === 'Continue') { G.slot = n + 1; startGame(true); }
  else if (a === 'Begin') { startCreator(n + 1); }
  else if (a === 'Copy code') copySaveCode(n + 1);
  else if (a === 'Paste code') enterSaveCode(n + 1);
  else if (a === 'Delete') { Title.confirm = true; Title.row = 1; Title.act = 1; }
}
function mainPrimary(o) {
  SFX.confirm();
  if (o === 'Continue') { G.slot = Title.last; startGame(true); }
  else if (o === 'Begin journey') startCreator(1);
  else if (o === 'Journeys') { Title.mode = 'slots'; Title.row = 0; Title.act = 0; Title.confirm = false; Title.slotSel = Math.max(0, Title.last - 1); }
  else if (o === 'Settings') Settings.show();
}
function titleTap(x, y) {
  for (const r of Title.rects) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) { r.fn(); return; }
}

function updateTitle() {
  if (Title.mode === 'main') {
    const opts = mainOptions();
    if (hit('up')) { Title.sel = (Title.sel + opts.length - 1) % opts.length; SFX.select(); }
    if (hit('down')) { Title.sel = (Title.sel + 1) % opts.length; SFX.select(); }
    if (hit('act')) mainPrimary(opts[Title.sel]);
    return;
  }
  const n = Title.slotSel, acts = slotActions(n);
  if (hit('esc')) { titleBack(); return; }
  if (Title.row === 0) {
    if (hit('left')) { Title.slotSel = (n + SLOTS - 1) % SLOTS; Title.confirm = false; SFX.select(); }
    if (hit('right')) { Title.slotSel = (n + 1) % SLOTS; Title.confirm = false; SFX.select(); }
    if (hit('down')) { Title.row = 1; Title.act = 0; SFX.select(); }
    if (hit('act')) slotPrimary(n);
  } else {
    if (hit('left')) { Title.act = (Title.act + acts.length - 1) % acts.length; SFX.select(); }
    if (hit('right')) { Title.act = (Title.act + 1) % acts.length; SFX.select(); }
    if (hit('up')) { Title.row = 0; Title.confirm = false; SFX.select(); }
    if (hit('act')) slotPrimary(n);
  }
}
function drawSlotCard(i, x, y, w, h) {
  const s = Title.slots[i], sel = i === Title.slotSel, focus = sel && Title.row === 0;
  Title.rects.push({ x, y, w, h, fn: () => { if (Title.slotSel === i && Title.row === 0) slotPrimary(i); else { Title.slotSel = i; Title.row = 0; Title.confirm = false; SFX.select(); } } });
  panel(x, y, w, h, { bg: sel ? '#2c2048' : '#1c1530', border: sel ? '#f7c948' : '#6b5a8a', border2: sel ? '#b9770e' : '#463a63' });
  text('JOURNEY ' + (i + 1), x + w / 2, y + 7, { title: true, size: 6, align: 'center', color: sel ? '#f7c948' : '#9a8fb8' });
  if (!s) {
    const pulse = 0.5 + 0.5 * Math.sin(G.t * 3);
    text('+', x + w / 2, y + 36 + (focus ? Math.round(pulse * 2) : 0), { size: 40, align: 'center', color: sel ? '#f7c948' : '#6b5a8a' });
    text('empty', x + w / 2, y + 82, { size: 15, align: 'center', color: '#9a8fb8' });
    text('start a new journey', x + w / 2, y + 96, { size: 12, align: 'center', color: '#6b5a8a' });
    return;
  }
  // little portrait of the traveler
  _ccg.clearRect(0, 0, 24, 28);
  drawPerson(_ccg, 12, 26, playerLook(s.look), 0, sel ? Math.floor(G.t * 4) % 4 : 0, {});
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w / 2 - 26, y + 20, 52, 50);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_cc, x + w / 2 - 24, y + 20, 48, 56);
  text(s.name || 'Traveler', x + w / 2, y + 77, { size: 16, align: 'center', color: '#fff' });
  // 10 insight pips
  const got = (s.insights || []).length, px = x + w / 2 - 5 * 9 + 1;
  for (let k = 0; k < 10; k++) { ctx.fillStyle = k < got ? '#f7c948' : '#3a2f58'; ctx.fillRect(px + k * 9, y + 94, 7, 5); }
  text(`${got}/10 insights`, x + w / 2, y + 100, { size: 12, align: 'center', color: '#e8d5a8' });
  const rn = (MAP_NODES.find(n => n.id === s.room) || {}).name || '';
  text(rn, x + w / 2, y + 111, { size: 12, align: 'center', color: '#9a8fb8' });
  const when = ago(s.ts); if (when) text(when, x + w / 2, y + 122, { size: 11, align: 'center', color: '#6b5a8a' });
}
function drawTitleUI() {
  Title.rects = [];
  const intro = Math.min(1, (G.t - Title.t0) / 1.2);
  ctx.globalAlpha = intro;
  if (Title.mode === 'main') {
    drawLogo(46, 24);
    const opts = mainOptions();
    opts.forEach((o, i) => {
      const sel = i === Title.sel, y = 128 + i * 20;
      titleBtn((sel ? '▶  ' : '') + o + (sel ? '  ◀' : ''), 150, y, 180, sel, () => { Title.sel = i; mainPrimary(o); }, { h: 18, size: 17 });
    });
    const sl = Title.slots[Title.last - 1];
    const cur = mainOptions()[Title.sel];
    let tip = '';
    if (cur === 'Continue' && sl) tip = `${sl.name} · ${(sl.insights || []).length}/10 insights · ${(MAP_NODES.find(n => n.id === sl.room) || {}).name || ''}`;
    else if (cur === 'Journeys') tip = `${Title.slots.filter(Boolean).length} of ${SLOTS} journeys saved · switch, copy or delete`;
    else if (cur === 'Settings') tip = 'volume for music, voices and sound effects';
    else if (cur === 'Begin journey') tip = 'create your traveler and set out from the crossroads';
    if (tip) text(tip, 240, 128 + opts.length * 20 + 4, { size: 13, align: 'center', color: '#9a8fb8' });
    text('arrows / WASD to move · E or Space to interact · headphones recommended', 240, 258, { size: 12, align: 'center', color: '#9a8fb8' });
  } else {
    ctx.fillStyle = 'rgba(10,6,22,0.62)'; ctx.fillRect(0, 0, W, H);
    text('YOUR JOURNEYS', 240, 14, { title: true, size: 10, align: 'center', color: '#f7c948' });
    titleBtn('◀ back', 8, 8, 52, false, titleBack, { size: 13, col: '#9a8fb8' });
    const cw = 144, gap = 8, x0 = (W - (cw * SLOTS + gap * (SLOTS - 1))) / 2;
    for (let i = 0; i < SLOTS; i++) drawSlotCard(i, x0 + i * (cw + gap), 38, cw, 138);
    const acts = slotActions(Title.slotSel);
    const bw = Title.confirm ? 100 : 82, tw = acts.length * bw + (acts.length - 1) * 8, ax = 240 - tw / 2;
    if (Title.confirm) text(`Delete ${Title.slots[Title.slotSel].name}'s journey for good?`, 240, 184, { size: 14, align: 'center', color: '#c0604a' });
    acts.forEach((a, k) => {
      const sel = Title.row === 1 && Title.act === k, danger = a === 'Delete' || a === 'Yes, delete it';
      const col = danger ? '#d07a68' : '#e8d5a8';
      titleBtn(a, ax + k * (bw + 8), 198, bw, sel, () => { Title.row = 1; Title.act = k; slotPrimary(Title.slotSel); }, { h: 16, size: 14, col, hot: danger ? '#ff9a85' : '#f7c948' });
    });
    const hint = Title.row === 0 ? '←→ choose a journey · E to play · ↓ for more options · Esc to go back' : '←→ choose · E to confirm · ↑ back to journeys';
    text(Title.slots[Title.slotSel] || Title.row ? hint : '←→ choose a journey · E to begin · Esc to go back', 240, 240, { size: 12, align: 'center', color: '#9a8fb8' });
  }
  ctx.globalAlpha = 1;
}

const _cc = document.createElement('canvas'); _cc.width = 24; _cc.height = 28; const _ccg = _cc.getContext('2d');
function updateCreator() {
  const L = G.state.look;
  if (hit('up') && !(Creator.row === 0 && !keys['arrowup'])) { Creator.row = (Creator.row + 5) % 6; SFX.select(); }
  if (hit('down') && !(Creator.row === 0 && !keys['arrowdown'])) { Creator.row = (Creator.row + 1) % 6; SFX.select(); }
  if (Creator.row === 0 && keys['enter'] && hit('act')) { Creator.row = 1; SFX.select(); return; }
  const chg = (hit('left') && (Creator.row !== 0)) ? -1 : (hit('right') && (Creator.row !== 0)) ? 1 : 0;
  if (chg) {
    SFX.select();
    if (Creator.row === 1) L.hair = (L.hair + chg + HAIR_STYLES.length) % HAIR_STYLES.length;
    if (Creator.row === 2) L.hairC = (L.hairC + chg + HAIR_COLORS.length) % HAIR_COLORS.length;
    if (Creator.row === 3) L.skin = (L.skin + chg + SKINS.length) % SKINS.length;
    if (Creator.row === 4) L.robe = (L.robe + chg + ROBES.length) % ROBES.length;
  }
  if (Creator.row === 5 && hit('act')) { SFX.chime(); startGame(false); }
}
function drawCreatorUI() {
  ctx.fillStyle = 'rgba(12,8,24,0.7)'; ctx.fillRect(0, 0, W, H);
  text('WHO ARE YOU, TRAVELER?', 240, 18, { title: true, size: 10, align: 'center', color: '#f7c948' });
  // preview
  panel(40, 50, 140, 170, { bg: '#2a2040' });
  const dirs = [0, 3, 1, 2];
  const d = dirs[Math.floor(G.t / 1.2) % 4];
  _ccg.clearRect(0, 0, 24, 28);
  drawPerson(_ccg, 12, 26, playerLook(), d, Math.floor(G.t * 6) % 4, {});
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_cc, 50, 60, 120, 140);
  text(G.state.name || '…', 110, 202, { size: 15, align: 'center', color: '#f7c948' });
  const L = G.state.look;
  const vals = [
    G.state.name + (Creator.row === 0 && Math.floor(G.t * 2) % 2 ? '_' : ''),
    HAIR_STYLES[L.hair], '', '', '', '',
  ];
  Creator.rows.forEach((r, i) => {
    const y = 56 + i * 26, sel = i === Creator.row;
    panel(204, y, 236, 22, { bg: sel ? '#3a2a5a' : '#221a34', border: sel ? '#f7c948' : '#6b5a8a' });
    if (i === 5) { text((sel ? '▶ ' : '') + r, 322, y + 4, { size: 15, align: 'center', color: sel ? '#f7c948' : '#e8d5a8' }); return; }
    text(r, 212, y + 4, { size: 14, color: '#b9ad94' });
    if (i === 0) text(vals[0], 300, y + 4, { size: 15, color: '#fff' });
    else {
      text('◀', 300, y + 4, { size: 14, color: sel ? '#f7c948' : '#6b5a8a' });
      text('▶', 424, y + 4, { size: 14, color: sel ? '#f7c948' : '#6b5a8a' });
      if (i === 1) text(vals[1], 362, y + 4, { size: 15, align: 'center' });
      const sw = (cols, idx) => cols.forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(318 + k * 13, y + 6, 10, 10); if (k === idx) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(317.5 + k * 13, y + 5.5, 11, 11); } });
      if (i === 2) sw(HAIR_COLORS.slice(0, 8), L.hairC);
      if (i === 3) sw(SKINS, L.skin);
      if (i === 4) sw(ROBES.map(r => r[0]), L.robe);
    }
  });
  text(Creator.row === 0 ? 'Type your name · ↓ (arrow) or Enter for next' : '↑↓ choose · ←→ change · E to begin on the last row', 240, 222, { size: 13, align: 'center', color: '#9a8fb8' });
}

// ---------------- door signs
function drawDoorSigns() {
  const Rm = G.room; if (!Rm) return;
  for (const e of Rm.ents) {
    if (!e.isDoor || !e.sign || e.hidden) continue;
    const lk = e.locked && e.locked();
    if (e.hideWhenLocked && lk) continue;
    const [x, y, w, h] = e.zone;
    const s = (lk ? '🔒 ' : '') + e.sign;
    const tw = textW(s, { size: 11 }) + 6;
    let tx = x + w / 2, ty = y - 12;
    if (e.signPos) { tx = e.signPos[0]; ty = e.signPos[1]; }
    tx = clamp(tx, tw / 2 + 2, W - tw / 2 - 2);
    ctx.fillStyle = 'rgba(12,10,28,0.6)'; ctx.fillRect(tx - tw / 2, ty, tw, 11);
    text(s, tx, ty, { size: 11, align: 'center', color: lk ? '#8a8098' : '#f7c948' });
  }
}

// ---------------- loop
let last = performance.now();
function update(dt) {
  beginInput();
  G.t += dt; G.dt = dt;
  AudioSys.tick(dt);
  const typing = G.screen === 'creator' && Creator.row === 0;
  if (hit('mute') && !typing) { const m = AudioSys.toggleMute(); if (m) Voice.stop(); notice(m ? 'Sound off (N to turn on)' : 'Sound on', 1.5); }
  if (hit('fullscreen') && !typing) toggleFullscreen();
  if (hit('voice') && !typing && Voice.ready()) { const v = Voice.toggle(); notice(v ? 'Voices on' : 'Voices off (V to turn on)', 1.5); }
  if (hit('pictures') && !typing && G.screen === 'game') { G.panels = G.panels === false; try { localStorage.setItem('philworld-panels', G.panels ? '1' : '0'); } catch (e) { } notice(G.panels ? 'Story pictures on' : 'Story pictures off (P to turn on)', 1.5); }
  // fade
  if (G.fade < G.fadeTo) G.fade = Math.min(G.fadeTo, G.fade + dt * 3);
  else if (G.fade > G.fadeTo) G.fade = Math.max(G.fadeTo, G.fade - dt * 2.5);
  if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * (G.flashDecay || 1.5));
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);

  if (Settings.open) Settings.update(dt);
  else if (hit('settings') && !typing && (G.screen === 'title' || (G.screen === 'game' && !G.overlay))) Settings.show();
  else if (G.screen === 'boot') { if (anyKey()) { AudioSys.unlock(); startTitle(); } }
  else if (G.screen === 'title') updateTitle();
  else if (G.screen === 'creator') updateCreator();
  else if (G.screen === 'game') {
    if (G.overlay) Overlay.update(dt);
    else if (Dialog.cur) Dialog.update(dt);
    if (G.activity && G.activity.update) G.activity.update(dt);
    updateWorld(dt);
  }
  tickTimers(dt);
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0a12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (G.screen === 'game') drawWorld(G.t);
  else drawTitleBg(G.t);
  if (G.tint) { g.fillStyle = G.tint; g.fillRect(0, 0, W, H); }
  if (G.flash > 0) { g.globalAlpha = Math.min(1, G.flash); g.fillStyle = G.flashColor; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  if (G.fade > 0) { g.fillStyle = `rgba(6,4,12,${G.fade})`; g.fillRect(0, 0, W, H); }
  let sx = 0, sy = 0;
  if (G.shake > 0) { sx = Math.round((Math.random() - 0.5) * 4); sy = Math.round((Math.random() - 0.5) * 4); }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, OX + sx * SCALE, OY + sy * SCALE, W * SCALE, H * SCALE);
  uiBegin();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (G.screen === 'boot') {
    drawLogo(70, 26);
    if (Math.floor(G.t * 2) % 2 === 0) text('press any key to begin', 240, 140, { size: 18, align: 'center' });
    text('(sound is a big part of this game; turn it up!)', 240, 162, { size: 13, align: 'center', color: '#9a8fb8' });
  } else if (G.screen === 'title') { drawTitleUI(); drawMsg(); }
  else if (G.screen === 'creator') drawCreatorUI();
  else if (G.screen === 'game') {
    if (G.activity && G.activity.ui) { try { G.activity.ui(ctx, G.t); } catch (e) { console.error(e); } }
    if (typeof drawHabits === 'function' && G.screen === 'game') drawHabits();
    if (!G.activity && !G.cutscene) drawDoorSigns();
    if (canControl()) drawPrompt();
    drawVignetteTitle();
    if (!G.overlay && !G.activity && !G.cutscene) drawHUD();
    drawCaption();
    drawToast();
    Dialog.draw();
    Overlay.draw();
    drawMsg();
  }
  Settings.draw();
  ctx.restore();
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { update(dt); render(); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
G.fade = 0; G.fadeTo = 0;
const fontsReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('16px VT323'), document.fonts.load('10px "Press Start 2P"')]).catch(() => { }) : Promise.resolve();
let loopStarted = false;
function startLoop() { if (loopStarted) return; loopStarted = true; last = performance.now(); requestAnimationFrame(frame); }
fontsReady.then(startLoop);
setTimeout(startLoop, 2500);
