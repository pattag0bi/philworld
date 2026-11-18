'use strict';
// ============================================================
// PhilWorld — cutscenes: characters act out the stories in the room.
// Use inside a script:  const C = await cutStart('Athens, 399 BCE'); ... await C.end();
// Stories set somewhere else go on a stage (C.stage) so the room itself is left alone.
// ============================================================
G.letterbox = 0;
G.caption = null;

function drawEmote(g, x, y, kind, t) {
  const b = Math.round(Math.sin(t * 6));
  if (kind === '!') drawExclaim(g, x, y + 2, t, '#f7c948');
  else if (kind === '?') qmark(g, x - 3, y - 12 + b, '#5dade2');
  else if (kind === 'heart') ICONS.heart(g, x, y - 6 + b);
  else if (kind === 'tear') { R(g, '#3498db', x + 3, y - 2 + ((t * 10) % 6), 2, 3); }
  else if (kind === 'angry') { for (let i = 0; i < 3; i++) line(g, x - 3 + i * 3, y - 10, x - 1 + i * 3, y - 6, '#e74c3c'); }
  else if (kind === 'ha') { R(g, '#f7dc6f', x - 4, y - 10 + b, 2, 5); R(g, '#f7dc6f', x - 2, y - 8 + b, 2, 1); R(g, '#f7dc6f', x, y - 10 + b, 2, 5); R(g, '#f7dc6f', x + 3, y - 10 - b, 2, 5); R(g, '#f7dc6f', x + 5, y - 8 - b, 2, 1); R(g, '#f7dc6f', x + 7, y - 10 - b, 2, 5); }
  else if (kind === '...') { for (let i = 0; i < 3; i++) if (Math.floor(t * 3) % 4 > i) R(g, '#fff', x - 4 + i * 4, y - 6, 2, 2); }
  else if (kind === 'zzz') { R(g, '#aed6f1', x + 2, y - 8 - (t * 4) % 4, 4, 1); R(g, '#aed6f1', x + 5, y - 14 - (t * 4) % 4, 3, 1); }
  else if (kind === 'note') { disc(g, x, y - 4 + b, 2, '#f7c948'); R(g, '#f7c948', x + 2, y - 12 + b, 1, 8); }
  else if (kind === 'sweat') { R(g, '#85c1e9', x + 6, y - 2, 1, 2); R(g, '#85c1e9', x - 6, y - 1, 1, 2); }
  else if (kind === 'idea') { disc(g, x, y - 8, 4, '#f7dc6f'); R(g, '#c9a24a', x - 1, y - 4, 3, 2); drawSpark(g, x + 5, y - 12, t); }
}

function makeActor(id, look, x, y, o = {}) {
  return Object.assign({
    id: 'cut_' + id, temp: true, look, x, y, dir: o.dir || 0, step: 0, pose: o.pose || {}, alpha: 1, solid: false,
    emote: null, emoteT: 0,
    draw(g, t) {
      if (this.alpha <= 0) return;
      g.globalAlpha = this.alpha;
      if (this.customDraw) this.customDraw(g, t);
      else if (this.look === 'owl') drawOwl(g, this.x, this.y, t, {});
      else drawPerson(g, this.x, this.y, this.look, this.dir, this.step, this.pose);
      g.globalAlpha = 1;
      if (this.emote && G.t < this.emoteT) drawEmote(g, this.x, this.y - (this.pose.sit ? 26 : 30), this.emote, t);
    },
  }, o);
}

async function cutStart(caption) {
  hideVignette();
  G.cutscene = true;
  const actors = [];
  const C = {
    actors,
    actor(id, look, x, y, o) { const a = makeActor(id, look, x, y, o); actors.push(a); G.room.ents.push(a); return a; },
    prop(id, x, y, draw, o) { const a = makeActor(id, null, x, y, Object.assign({ customDraw: draw }, o)); actors.push(a); G.room.ents.push(a); return a; },
    async walk(a, x, y, speed = 40) {
      const sx = a.x, sy = a.y, d = Math.hypot(x - sx, y - sy); if (d < 1) return;
      a.dir = Math.abs(x - sx) > Math.abs(y - sy) ? (x < sx ? 2 : 3) : (y < sy ? 1 : 0);
      const dur = d / speed; let t = 0, stepAcc = 0, snd = 0;
      while (t < dur) {
        const dt = await nextFrame(); t += dt; stepAcc += dt * 8; snd -= dt;
        const k = Math.min(1, t / dur); a.x = lerp(sx, x, k); a.y = lerp(sy, y, k); a.step = Math.floor(stepAcc) % 4;
        if (snd <= 0 && a.look && a.look !== 'owl') { snd = 0.32; if (dist(a.x, a.y, player.x, player.y) < 160) SFX.step(G.room.surface ? G.room.surface(a.x, a.y) : 'stone'); }
      }
      a.step = 0;
    },
    walkAll(list) { return Promise.all(list.map(([a, x, y, s]) => C.walk(a, x, y, s))); },
    emote(a, kind, dur = 1.6) { a.emote = kind; a.emoteT = G.t + dur; },
    face(a, b) { const dx = (b.x ?? b[0]) - a.x, dy = (b.y ?? b[1]) - a.y; a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); },
    async fadeActor(a, to, dur = 0.8) { const from = a.alpha; let t = 0; while (t < dur) { t += await nextFrame(); a.alpha = lerp(from, to, Math.min(1, t / dur)); } },
    async black(on, dur) { G.fadeTo = on ? 1 : 0; await waitFade(); if (dur) await wait(dur); },
    caption(s) { G.caption = s ? { s, t0: G.t } : null; },
    // A stage is a separate place for the story: its own backdrop, floor and sounds.
    // The real room is set aside untouched and comes back exactly as it was on C.end() (or C.leave()).
    //   await C.stage(STAGES.palace({ style: 'india' }), 'Kapilavastu');
    // Actors from the previous stage are dropped unless listed in o.carry.
    async stage(spec, caption, o = {}) {
      await C.black(true);
      const carry = o.carry || [];
      if (!C._real) C._real = { room: G.room, ph: [player.hidden, owl.hidden], tint: G.tint };
      else if (G.room.exit) G.room.exit(G.room);
      const S = Object.assign({ name: 'stage', isStage: true, walls: [], surface: () => 'stone' }, spec);
      S.ents = carry.slice();
      S.bgc = prerender(S);
      G.room = S; G.tint = null; G.toast = null;
      player.hidden = true; owl.hidden = true;
      if (S.muffle) AudioSys.setMuffle(S.muffle, 0.6);
      if (S.enter) S.enter(S);
      C.caption(caption === undefined ? null : caption);
      if (o.dark) return S;
      await C.black(false);
      return S;
    },
    // Go back to the real room mid-cutscene (actors made on the stage are dropped).
    async leave(o = {}) {
      if (!C._real) return;
      if (G.fadeTo < 1) await C.black(true);
      if (G.room.exit) G.room.exit(G.room);
      const r = C._real; C._real = null;
      G.room = r.room; [player.hidden, owl.hidden] = r.ph; G.tint = r.tint;
      AudioSys.setMuffle(G.room.muffle || 18000, 0.6);
      C.caption(o.caption || null);
      if (!o.dark) await C.black(false);
    },
    get staged() { return !!C._real; },
    // A stand-in for one of the room's people, for use on a stage (the real one stays home).
    cast(id, x, y, o = {}) {
      const e = (C._real ? C._real.room : G.room).ents.find(e => e.id === id);
      return C.actor(id, (e && e.look) || {}, x, y, Object.assign({ pose: {} }, o));
    },
    async end() {
      if (C._real) await C.leave({ dark: true });
      G.caption = null;
      if (G.fadeTo > 0) await C.black(false);
      while (G.letterbox > 0) { G.letterbox = Math.max(0, G.letterbox - (await nextFrame()) * 3); }
      G.room.ents = G.room.ents.filter(e => !actors.includes(e));
      G.cutscene = false;
    },
  };
  while (G.letterbox < 1) { G.letterbox = Math.min(1, G.letterbox + (await nextFrame()) * 3); }
  if (caption) C.caption(caption);
  return C;
}

// letterbox bars are drawn on the world buffer, the caption on the UI layer
function drawLetterbox() {
  if (G.letterbox <= 0) return;
  const h = Math.round(20 * ease(G.letterbox));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h);
}
function drawCaption() {
  const c = G.caption; if (!c) return;
  const a = Math.min(1, (G.t - c.t0) * 1.5);
  ctx.globalAlpha = a;
  text(c.s, 240, 5, { title: true, size: 7, align: 'center', color: '#e8d5a8' });
  ctx.globalAlpha = 1;
}
