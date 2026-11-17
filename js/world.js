'use strict';
// ============================================================
// PhilWorld — rooms, player, entities, doors
// ============================================================
const Rooms = {};
const player = { x: 240, y: 200, dir: 0, step: 0, stepT: 0, stepSnd: 0, moving: false, speed: 64, slow: 1, hidden: false, frozen: false, pose: {}, bowT: 0 };
const owl = { x: 220, y: 190, tx: 0, ty: 0, hidden: false, perch: null, flyT: 0 };

// ---------- entity helpers
function npc(id, x, y, look, o = {}) {
  return Object.assign({
    id, x, y, look, dir: o.dir || 0, solid: true, box: [-5, -3, 10, 4], r: 22, ph: 26, label: 'Talk',
    pose: {},
    draw(g, t) {
      const bob = this.noBob ? 0 : (Math.sin(t * 1.8 + this.x * 0.37) > 0.6 ? -1 : 0);
      drawPerson(g, this.x, this.y, this.look, this.dir, this.walkStep || 0, Object.assign({ bob }, this.pose));
    },
  }, o);
}
function thing(id, x, y, draw, o = {}) {
  return Object.assign({ id, x, y, draw, solid: false, r: 20, ph: 20, label: 'Look' }, o);
}
function door(id, zone, to, sx, sy, o = {}) {
  // zone: [x,y,w,h]; spawn sx,sy in target room
  return Object.assign({
    id, zone, to, sx, sy, isDoor: true, x: zone[0] + zone[2] / 2, y: zone[1] + zone[3] / 2,
    draw(g, t) {
      const lk = this.locked && this.locked();
      if (this.hideWhenLocked && lk) return;
      const [x, y, w, h] = this.zone;
      if (this.arrow) {
        const b = Math.round(Math.sin(t * 4) * 1.5);
        const ax = this.arrow === 'left' ? x + 6 : this.arrow === 'right' ? x + w - 6 : x + w / 2;
        const ay = this.arrow === 'up' ? y + 4 : this.arrow === 'down' ? y + h - 4 : y + h / 2;
        const c = lk ? '#6a6070' : '#f7c948';
        const p = (a, bb, ww = 1, hh = 1) => R(g, c, ax + a, ay + bb, ww, hh);
        if (this.arrow === 'left') { p(-2 - b, -1, 6, 3); p(-4 - b, -3, 2, 7); p(-5 - b, -1, 1, 3); p(-3 - b, -2, 1, 5); }
        if (this.arrow === 'right') { p(-3 + b, -1, 6, 3); p(3 + b, -3, 2, 7); p(5 + b, -1, 1, 3); p(2 + b, -2, 1, 5); }
        if (this.arrow === 'up') { p(-1, -2 - b, 3, 6); p(-3, -4 - b, 7, 2); p(-1, -5 - b, 3, 1); }
        if (this.arrow === 'down') { p(-1, -3 + b, 3, 6); p(-3, 3 + b, 7, 2); p(-1, 5 + b, 3, 1); }
      }
    },
    labelDraw: o.label,
  }, o, { label: undefined });
}

// ---------- room transitions
async function waitFade() { await waitUntil(() => Math.abs(G.fade - G.fadeTo) < 0.01); }
function prerender(Rm) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const cg = c.getContext('2d');
  Rm.bg(cg);
  return c;
}
function redrawRoom() { if (G.room) G.room.bgc = prerender(G.room); }

async function goto(id, sx, sy, dir) {
  G.busy++;
  try {
    if (G.room) {
      SFX.door();
      G.fadeTo = 1; await waitFade();
      if (G.room.onLeave) G.room.onLeave();
    }
    hideVignette();
    G.activity = null;
    const Rm = Rooms[id];
    G.room = Rm; G.roomId = id; G.state.room = id;
    player.x = sx == null ? Rm.spawn[0] : sx;
    player.y = sy == null ? Rm.spawn[1] : sy;
    player.dir = dir == null ? (Rm.spawnDir || 0) : dir;
    player.hidden = false; player.frozen = false; player.slow = 1; player.pose = {};
    Rm.ents = Rm.build ? Rm.build() : [];
    Rm.bgc = prerender(Rm);
    if (sx != null && blocked(sx, sy)) { sx = null; sy = null; } // saved spot no longer valid: use the room's entrance
    owl.x = player.x - 14; owl.y = player.y - 4; owl.perch = null; owl.hidden = !flag('owlMet');
    AudioSys.setScene(Rm.scene || id);
    AudioSys.setMuffle(Rm.muffle || 18000, 0.6);
    AudioSys.setMusicVol(0.55, 0.5);
    const first = !G.state.visited.includes(id);
    if (first) G.state.visited.push(id);
    if (G.state.path[G.state.path.length - 1] !== id) G.state.path.push(id);
    save();
    if (Rm.onEnter) Rm.onEnter(first);
    G.fadeTo = 0;
    toastRoom(Rm.name, Rm.sub);
    await waitFade();
    if (Rm.afterEnter) script(() => Rm.afterEnter(first));
  } finally { G.busy--; }
}

// ---------- collision
function blocked(x, y) {
  if (x < 4 || x > W - 4 || y < 8 || y > H - 2) return true;
  const Rm = G.room;
  const px = x - 4, py = y - 3, pw = 8, ph = 3;
  for (const w of Rm.walls || []) {
    if (px < w[0] + w[2] && px + pw > w[0] && py < w[1] + w[3] && py + ph > w[1]) return true;
  }
  for (const e of Rm.ents) {
    if (!e.solid || e.hidden || !e.box) continue;
    const bx = e.x + e.box[0], by = e.y + e.box[1];
    if (px < bx + e.box[2] && px + pw > bx && py < by + e.box[3] && py + ph > by) return true;
  }
  if (Rm.blocked && Rm.blocked(x, y)) return true;
  return false;
}
function canControl() { return !G.busy && !G.activity && !G.overlay && !Dialog.cur; }

// ---------- update
function updateWorld(dt) {
  const Rm = G.room; if (!Rm) return;
  if (Rm.update) Rm.update(dt);
  for (const e of Rm.ents) if (e.update) e.update(dt, G.t);
  player.moving = false;
  if (player.bowT > 0) { player.bowT -= dt; if (player.bowT <= 0) player.pose.bow = false; }
  const ctl = canControl();
  if (ctl && !player.frozen) {
    let dx = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
    let dy = (down('down') ? 1 : 0) - (down('up') ? 1 : 0);
    if (dx || dy) {
      const l = Math.hypot(dx, dy); dx /= l; dy /= l;
      const sp = player.speed * player.slow * dt;
      const nx = player.x + dx * sp, ny = player.y + dy * sp;
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
      if (Math.abs(dx) > Math.abs(dy)) player.dir = dx < 0 ? 2 : 3; else player.dir = dy < 0 ? 1 : 0;
      player.moving = true;
      player.bowT = 0; player.pose.bow = false;
    }
  }
  if (player.moving) {
    player.stepT += dt * 8 * player.slow;
    player.step = Math.floor(player.stepT) % 4;
    player.stepSnd -= dt;
    if (player.stepSnd <= 0) { player.stepSnd = 0.3 / player.slow; SFX.step(Rm.surface ? Rm.surface(player.x, player.y) : 'stone'); }
  } else { player.step = 0; player.stepT = 0.99; }

  // owl follows
  if (!owl.hidden) {
    if (owl.perch) { owl.tx = owl.perch[0]; owl.ty = owl.perch[1]; }
    else {
      const side = player.dir === 2 ? 14 : -14;
      owl.tx = player.x + side; owl.ty = player.y - 6;
    }
    const d = dist(owl.x, owl.y, owl.tx, owl.ty);
    owl.flying = d > 3 || !owl.perch && player.moving;
    owl.x = lerp(owl.x, owl.tx, Math.min(1, dt * 3)); owl.y = lerp(owl.y, owl.ty, Math.min(1, dt * 3));
  }

  // remember where the player is standing (quietly, every few seconds)
  G.posSaveT = (G.posSaveT || 0) - dt;
  if (ctl && G.posSaveT <= 0) { G.posSaveT = 4; rememberPosition(); save(true); }
  if (!ctl) { G.prompt = null; return; }
  // doors
  for (const e of Rm.ents) {
    if (!e.isDoor || e.hidden) continue;
    const [x, y, w, h] = e.zone;
    if (player.x > x && player.x < x + w && player.y > y && player.y < y + h) {
      const lk = e.locked && e.locked();
      if (lk) {
        if (!e._lastMsg || G.t - e._lastMsg > 3) { e._lastMsg = G.t; notice(e.lockedMsg || 'The way is closed for now.'); SFX.boing(); }
      } else if (e.onUse) { script(() => e.onUse()); return; }
      else { goto(e.to, e.sx, e.sy, e.sdir); return; }
    }
  }
  // interaction
  let best = null, bd = 1e9;
  for (const e of Rm.ents) {
    if (!e.interact || e.hidden || (e.enabled && !e.enabled())) continue;
    const d = dist(player.x, player.y, e.x, e.y + (e.iy || 0));
    if (d < (e.r || 20) && d < bd) { bd = d; best = e; }
  }
  G.prompt = best;
  if (best && hit('act')) {
    SFX.interact();
    if (best.look && best.faces !== false) {
      const dx = player.x - best.x, dy = player.y - best.y;
      best.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    }
    const dx = best.x - player.x, dy = (best.y - 6) - player.y;
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    flag('seen:' + G.roomId + ':' + best.id, 1);
    G.prompt = null;
    script(() => best.interact(best));
    return;
  }
  if (hit('bow') && flag('bow')) {
    player.pose.bow = true; player.bowT = 0.9;
    AudioSys.play('bell', 79, { vol: 0.05, dur: 1.2 });
    for (const e of Rm.ents) {
      if (!e.look || e.hidden || dist(e.x, e.y, player.x, player.y) > 40) continue;
      setTimeout(() => { e.pose = Object.assign({}, e.pose, { bow: true }); AudioSys.play('bell', 84, { vol: 0.03, dur: 1 }); }, 250);
      setTimeout(() => { e.pose = Object.assign({}, e.pose, { bow: false }); }, 1300);
    }
    if (Rm.onBow) Rm.onBow();
  }
  if (hit('hint')) script(owlHint);
  if (hit('map')) openMap();
  if (hit('journal')) openJournal();
}

function rememberPosition() {
  if (!G.room || G.screen !== 'game') return;
  if (G.roomId === 'cave' && Rooms.cave.view === 'out') { G.state.pos = null; return; }
  G.state.pos = [G.roomId, Math.round(player.x), Math.round(player.y), player.dir];
}
addEventListener('pagehide', () => { if (G.screen === 'game') { if (canControl()) rememberPosition(); save(true); } });
addEventListener('visibilitychange', () => { if (document.hidden && G.screen === 'game') { if (canControl()) rememberPosition(); save(true); } });

async function owlHint() {
  if (!flag('owlMet')) return;
  SFX.hoot();
  const h = G.room.hint ? G.room.hint() : null;
  await say('owl', h || 'Look around! Anything glowing or marked with a *!* wants your attention.');
}

// ---------- draw
const PLAYER_ENT = {
  get y() { return player.y; }, get x() { return player.x; },
  draw(g, t) { drawPerson(g, player.x, player.y, playerLook(), player.dir, player.moving ? player.step : 0, player.pose); },
};
const OWL_ENT = {
  get y() { return owl.y + 2; }, get x() { return owl.x; },
  draw(g, t) {
    const bob = owl.flying ? Math.sin(t * 8) * 1.5 - 6 : 0;
    drawOwl(g, owl.x, owl.y + bob, t, { flying: owl.flying });
  },
};
function drawWorld(t) {
  const Rm = G.room; if (!Rm) return;
  g.drawImage(Rm.bgc, 0, 0);
  if (Rm.under) Rm.under(g, t);
  const list = [];
  for (const e of Rm.ents) if (e.draw && !e.hidden) list.push(e);
  const act = G.activity;
  if (!player.hidden && !(act && act.hidePlayer)) list.push(PLAYER_ENT);
  if (!owl.hidden && !(act && act.hidePlayer)) list.push(OWL_ENT);
  list.sort((a, b) => ((a.z != null ? a.z : a.y) - (b.z != null ? b.z : b.y)));
  for (const e of list) e.draw(g, t);
  if (Rm.over) Rm.over(g, t);
  // markers
  if (!act) for (const e of Rm.ents) {
    if (e.hidden || !e.interact || (e.enabled && !e.enabled())) continue;
    const m = e.mark ? e.mark() : (flag('seen:' + G.roomId + ':' + e.id) ? null : 'spark');
    if (m === '!') drawExclaim(g, e.x, e.y - (e.ph || 26) - 2, t);
    else if (m === 'spark') drawSpark(g, e.x + 6, e.y - (e.ph || 22) + 2, t);
  }
  if (act && act.draw) act.draw(g, t);
  drawVignette();
}
