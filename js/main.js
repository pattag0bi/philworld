'use strict';
// ============================================================
// PhilWorld — main loop, title screen, character creator
// ============================================================
const Title = { sel: 0, hasSave: false, t: 0 };
const Creator = { row: 0, rows: ['Name', 'Hair', 'Hair color', 'Skin', 'Outfit', 'Begin journey'] };

function refreshTitleSave() {
  const s = loadSave();
  Title.hasSave = !!s;
  Title.info = s ? `Saved: ${s.name} · ${(s.insights || []).length}/10 insights · ${(MAP_NODES.find(n => n.id === s.room) || {}).name || ''}` : '';
}
function titleOptions() {
  return Title.hasSave ? ['Continue journey', 'New journey', 'Copy save code', 'Enter save code', 'Settings'] : ['New journey', 'Enter save code', 'Settings'];
}
function startTitle() {
  G.screen = 'title'; G.fadeTo = 0;
  refreshTitleSave();
  Title.sel = 0;
  AudioSys.setScene('title');
}

// ---------------- save codes: move progress between browsers / devices
const CODE_PREFIX = 'PHILWORLD-';
function makeSaveCode() {
  const s = loadSave(); if (!s) return null;
  return CODE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(s))));
}
function readSaveCode(code) {
  code = (code || '').trim().replace(/\s+/g, '');
  if (code.startsWith(CODE_PREFIX)) code = code.slice(CODE_PREFIX.length);
  const s = JSON.parse(decodeURIComponent(escape(atob(code))));
  if (!s || typeof s !== 'object' || !Array.isArray(s.insights) || !s.look || !s.room || !Rooms[s.room]) throw new Error('bad save');
  return Object.assign(newState(), s);
}
async function copySaveCode() {
  const code = makeSaveCode(); if (!code) return;
  let ok = false;
  try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { }
  for (const k in keys) keys[k] = false;
  if (ok) notice('Save code *copied*! Open PhilWorld in the other browser, choose *Enter save code*, and paste it.', 5);
  else { window.prompt('Copy this save code, then paste it into PhilWorld in the other browser:', code); notice('Paste that code into *Enter save code* on the other browser.', 4); }
}
function enterSaveCode() {
  const code = window.prompt('Paste your PhilWorld save code:');
  for (const k in keys) keys[k] = false;
  if (!code) return;
  try {
    const s = readSaveCode(code);
    G.state = s; save(true);
    refreshTitleSave(); Title.sel = 0;
    SFX.chime();
    notice(`Welcome back, *${s.name}*! Journey restored (${s.insights.length}/10 insights). Choose *Continue journey*.`, 5);
  } catch (e) { SFX.boing(); notice('That code didn\'t work. Copy the *whole* code and try again.', 4); }
}
function startCreator() {
  G.screen = 'creator';
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
  if (fromSave) { const s = loadSave(); if (s) G.state = Object.assign(newState(), s); }
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
  vgrad(g, 0, 0, W, H, '#140c2c', '#4a2a5a', 16);
  const r = mulberry(3);
  for (let i = 0; i < 120; i++) {
    const x = r() * W, y = r() * 170, b = r();
    g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * b * (0.5 + 0.5 * Math.sin(t * 2 + i))})`;
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  // constellation of the roadmap
  g.strokeStyle = 'rgba(247,201,72,0.25)'; g.lineWidth = 1;
  const pts = [[60, 60], [110, 40], [160, 70], [210, 38], [270, 30], [320, 64], [380, 44], [430, 70]];
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  pts.forEach(([x, y], i) => { g.fillStyle = `rgba(247,201,72,${0.6 + 0.4 * Math.sin(t * 3 + i)})`; g.fillRect(x - 1, y - 1, 3, 3); });
  // hills
  for (let x = 0; x < W; x++) {
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
  // west temple, east gate silhouettes
  for (let i = 0; i < 4; i++) R(g, '#3a2a4a', 60 + i * 10, 176, 4, 20);
  R(g, '#3a2a4a', 56, 172, 42, 4); R(g, '#3a2a4a', 62, 168, 30, 4);
  ring(g, 410, 186, 14, '#3a2a4a', 3); R(g, '#3a2a4a', 392, 200, 36, 3);
}

function updateTitle() {
  const opts = titleOptions();
  if (hit('up')) { Title.sel = (Title.sel + opts.length - 1) % opts.length; SFX.select(); }
  if (hit('down')) { Title.sel = (Title.sel + 1) % opts.length; SFX.select(); }
  if (hit('act')) {
    SFX.confirm();
    const o = opts[Title.sel];
    if (o === 'Continue journey') startGame(true);
    else if (o === 'Copy save code') copySaveCode();
    else if (o === 'Enter save code') enterSaveCode();
    else if (o === 'Settings') Settings.show();
    else startCreator();
  }
}
function drawTitleUI() {
  const opts = titleOptions();
  text('PHILWORLD', 240, 78, { title: true, size: 22, align: 'center', color: '#f7c948' });
  text('a walk through the love of wisdom', 240, 108, { size: 16, align: 'center', color: '#e8d5a8' });
  opts.forEach((o, i) => {
    const sel = i === Title.sel;
    text((sel ? '▶ ' : '  ') + o, 240, 126 + i * 14, { size: 15, align: 'center', color: sel ? '#f7c948' : '#e8d5a8' });
  });
  if (Title.hasSave && Title.info) text(Title.info, 240, 184, { size: 13, align: 'center', color: '#9a8fb8' });
  const tip = { 'New journey': Title.hasSave ? '(starting over replaces your saved journey)' : '', 'Copy save code': 'copy a code to move your progress to another browser or device', 'Enter save code': 'paste a code from another browser to continue your journey here', 'Settings': 'volume for music, voices and sound effects' }[opts[Title.sel]];
  if (tip) text(tip, 240, 172, { size: 12, align: 'center', color: opts[Title.sel] === 'New journey' ? '#c0604a' : '#9a8fb8' });
  text('arrows / WASD to move · E or Space to interact · headphones recommended', 240, 258, { size: 12, align: 'center', color: '#9a8fb8' });
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
    ctx.fillStyle = 'rgba(8,6,16,0.6)'; ctx.fillRect(0, 0, W, H);
    text('PHILWORLD', 240, 96, { title: true, size: 22, align: 'center', color: '#f7c948' });
    if (Math.floor(G.t * 2) % 2 === 0) text('press any key to begin', 240, 140, { size: 18, align: 'center' });
    text('(sound is a big part of this game; turn it up!)', 240, 164, { size: 13, align: 'center', color: '#9a8fb8' });
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
