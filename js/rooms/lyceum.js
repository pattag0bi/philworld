'use strict';
// ============================================================
// ROOM: Aristotle's Lyceum — the Golden Mean, the four causes, telos
// ============================================================
Rooms.lyceum = {
  name: "Aristotle's Lyceum", sub: 'Athens, 335 BCE', scene: 'lyceum',
  spawn: [454, 200], spawnDir: 2,
  walls: [[0, 0, W, 82], [10, 100, 50, 38], [28, 190, 124, 6], [28, 190, 4, 60], [148, 190, 4, 60], [28, 246, 124, 4], [172, 204, 56, 32], [338, 196, 32, 14], [416, 150, 8, 4]],
  surface(x, y) { return y < 100 ? 'stone' : 'grass'; },
  bg(g) {
    vgrad(g, 0, 0, W, 30, '#f5cba7', '#fdebd0', 6);
    // peripatos: covered walkway
    R(g, '#a04030', 0, 26, W, 8); R(g, '#c05040', 0, 26, W, 2);
    R(g, '#e8dcc0', 0, 34, W, 48);
    for (let x = 4; x < W; x += 28) drawColumn(g, x, 84, 46, '#f0e8d4');
    tex(g, 0, 82, W, 20, '#d8c8a8', ['#c8b898', '#e0d4b8'], 0.1, 51);
    R(g, '#b8a888', 0, 101, W, 1);
    // garden
    tex(g, 0, 102, W, H - 102, '#7aa84a', ['#6a983a', '#8ab85a', '#5f8f34'], 0.12, 52);
    for (let i = 0; i < 4; i++) tex(g, 170 + i * 8, 104 + i * 40, 8, 40, '#c8b080', ['#b8a070'], 0.2, 53 + i);
    // scroll shelves
    R(g, '#6b4a2b', 10, 100, 50, 38); R(g, '#8b6a4b', 12, 102, 46, 34);
    for (let r = 0; r < 3; r++) { R(g, '#5a3a1a', 12, 112 + r * 11, 46, 1); for (let i = 0; i < 9; i++) { R(g, '#f3e6c4', 14 + i * 5, 104 + r * 11, 3, 7); R(g, '#c9a24a', 14 + i * 5, 104 + r * 11, 3, 1); } }
    // animal pen
    for (let x = 28; x < 152; x += 6) { R(g, '#8b5a2b', x, 186, 2, 8); }
    R(g, '#8b5a2b', 28, 189, 124, 2); R(g, '#8b5a2b', 28, 246, 124, 2); R(g, '#8b5a2b', 28, 190, 2, 58); R(g, '#8b5a2b', 150, 190, 2, 58);
    tex(g, 30, 192, 120, 54, '#8ab05a', ['#9ac06a', '#7a9a4a'], 0.15, 55);
    // dolphin pool
    R(g, '#d8d0c0', 170, 202, 60, 36); R(g, '#3a8ac0', 174, 206, 52, 28); R(g, '#5aaae0', 174, 206, 52, 3);
    // sculptor corner
    tex(g, 320, 180, 70, 44, '#d8d0c0', ['#c8c0b0', '#e8e0d0'], 0.2, 56);
    R(g, '#6a6a6a', 376, 204, 10, 2); R(g, '#8b5a2b', 384, 200, 2, 6);
    // flowers & bushes
    drawBush(g, 260, 250, '#4a8a3a', '#f7c948'); drawBush(g, 300, 120, '#4a8a3a', '#e74c3c'); drawBush(g, 110, 120, '#4a8a3a', '#9b59b6');
  },
  under(g, t) {
    // dolphin
    const k = (t * 0.4) % 1;
    if (k < 0.35) {
      const p = k / 0.35, dx = 186 + p * 28, dy = 222 - Math.sin(p * Math.PI) * 20;
      R(g, '#7f8c8d', dx - 4, dy - 2, 9, 4); R(g, '#95a5a6', dx - 3, dy, 6, 2); R(g, '#7f8c8d', dx + 5, dy - 1, 2, 1); R(g, '#7f8c8d', dx - 6, dy - 3, 2, 3); R(g, '#7f8c8d', dx, dy - 4, 2, 2);
      if (p > 0.95) for (let i = 0; i < 4; i++) R(g, '#cfe8f8', dx - 2 + i * 2, dy - 3 - i % 2 * 2, 1, 1);
    }
    for (let i = 0; i < 6; i++) R(g, '#8ac8f0', 178 + ((t * 10 + i * 9) % 46), 214 + (i % 3) * 6, 3, 1);
  },
  build() {
    const self = this;
    return [
      door('agora', [474, 180, 6, 40], 'agora', 22, 216, { arrow: 'right', sign: 'Agora', signPos: [448, 170] }),
      door('stoa', [0, 146, 6, 40], 'stoa', 24, 190, { arrow: 'left', sign: 'Path to the Stoa', signPos: [44, 138], locked: () => !hasInsight('mean'), lockedMsg: 'Aristotle: "Wait! First find the *mean*. Talk to me."' }),
      npc('aristotle', 240, 96, LOOKS.aristotle, {
        ph: 28, mark: () => hasInsight('mean') ? null : '!',
        update(dt, t) {
          if (this._talk) { this.walkStep = 0; return; }
          const nx = 240 + Math.sin(t * 0.3) * 110;
          this.dir = nx < this.x ? 2 : 3; this.x = nx; this.walkStep = Math.floor(t * 5) % 4;
        },
        async interact() { this._talk = true; try { await aristotleTalk(); } finally { this._talk = false; } },
      }),
      npc('alexander', 300, 160, LOOKS.alexander, {
        dir: 2,
        async interact() {
          await say('alexander', 'I\'m Alexander, prince of Macedon. Aristotle was hired by my father to tutor me, from when I was 13.');
          await say('alexander', 'He taught me ethics, politics, poetry, medicine… and to always seek the *mean* between extremes.');
          await say('alexander', 'Soon I\'m going to conquer the known world, from Greece to India. He\'d probably say I *slightly overshot* the mean on ambition.');
        },
      }),
      thing('statue', 354, 206, (g, t) => drawStatue(g, 354, 206, self.statueStage || 0, t), {
        r: 26, ph: 30, label: 'Examine the statue', solid: true, box: [-14, -6, 28, 6],
        interact: () => fourCauses(self),
      }),
      thing('acorn', 420, 154, (g, t) => drawOak(g, 420, 154, self.oak == null ? 0 : self.oak, t), {
        r: 22, ph: 20, label: 'Pick up the acorn',
        async interact() {
          await say('aristotle', '(calling over) An acorn! Plant it. Watch what it\'s *trying* to become.');
          for (let s = 1; s <= 4; s++) { self.oak = s; AudioSys.play('pluck', 60 + [0, 4, 7, 12][s - 1], { vol: 0.15, dur: 1.5 }); SFX.sparkle(); await wait(0.7); }
          await say('aristotle', 'Every living thing has a *telos*: a built-in goal. The acorn\'s telos is to become a flourishing oak.');
          await say('aristotle', 'And a human\'s? To use *reason* well and live a life of virtue together with others. I call that *eudaimonia*: flourishing, or deep happiness.');
          await wait(0.8); self.oak = 0;
        },
      }),
      thing('scrolls', 36, 140, null, {
        r: 24, ph: 6, label: 'Read a scroll',
        async interact() {
          SFX.paper();
          showVignette((v, t) => {
            R(v, '#f3e6c4', 0, 0, 160, 90);
            ellipse(v, 80, 46, 64, 38, '#d6eaf8'); ellipse(v, 80, 50, 40, 26, '#aed6f1'); disc(v, 80, 54, 4, '#c0392b');
            if (Math.floor(t * 2) % 2) disc(v, 80, 54, 6, 'rgba(192,57,43,0.3)');
          }, { title: 'All humans are mortal · Socrates is human · ∴ Socrates is mortal' });
          await say('aristotle', 'Logic! I was the first to write down its rules. Here is a *syllogism*: two premises, one conclusion that MUST follow.');
          await say('aristotle', 'Big circle: *mortal things*. Inside it: *humans*. Inside that: *Socrates*. If the circles are drawn right, the conclusion can\'t escape!');
          await say('owl', 'His logic was the standard in Europe and the Islamic world for about 2,000 years. Thinkers like Ibn Sina and Ibn Rushd studied and expanded it.');
          hideVignette();
        },
      }),
      thing('pool', 200, 210, null, {
        r: 30, ph: 14, label: 'Watch the dolphin',
        async interact() {
          SFX.splash();
          await say('aristotle', 'I dissected and described over *500 kinds of animals*. I noticed dolphins breathe air, give birth to live young and nurse them with milk.');
          await say('aristotle', 'So they\'re more like land mammals than fish! Everyone laughed. About 2,000 years later, biologists agreed with me.');
          await say('owl', 'Unlike Plato, Aristotle looked *down* at the world, not up. He collected, sorted and observed. He\'s often called the first great *scientist*.');
        },
      }),
      thing('sheep', 90, 222, (g, t) => {
        for (const [x, y, o] of [[60, 218, 0], [100, 230, 1], [124, 210, 2]]) {
          const b = Math.floor(t * 1.5 + o) % 4 === 0 ? 1 : 0;
          disc(g, x, y - 5, 5, '#f5f5f5'); disc(g, x - 3, y - 6, 3, '#ffffff'); R(g, '#3a3a3a', x + 4, y - 7 + b, 4, 3); R(g, '#3a3a3a', x - 3, y - 1, 1, 2); R(g, '#3a3a3a', x + 2, y - 1, 1, 2);
        }
        R(g, '#6b8e23', 128, 236, 8, 5); R(g, '#556b2f', 129, 234, 6, 2); R(g, '#a0b060', 135, 237, 2, 2);
      }, {
        r: 40, ph: 20, label: 'Visit the animals',
        async interact() {
          AudioSys.play('sine', 300, { hz: true, wave: 'sawtooth', to: 260, dur: 0.5, vol: 0.06 });
          await say('aristotle', 'I sort everything: plants that *grow*, animals that grow and *feel and move*, and humans who grow, feel, move and *reason*.');
          await say('aristotle', 'That tortoise and those sheep each have a *soul* in my sense: what makes a living thing alive and active. Not a ghost; more like its *way of being*.');
        },
      }),
    ];
  },
  hint() {
    if (!hasInsight('mean')) return 'Catch *Aristotle*. He\'s pacing back and forth under the covered walkway. He talks while he walks!';
    return 'Try the *statue* in the sculptor\'s corner, the *acorn*, the *scrolls* and the *dolphin* for more of Aristotle\'s ideas. Then the path *west* to the Stoa.';
  },
};

function drawOak(g, x, y, s, t) {
  if (s === 0) { R(g, '#8b5a2b', x - 2, y - 4, 4, 4); R(g, '#5a3a1a', x - 2, y - 5, 4, 1); return; }
  if (s === 1) { R(g, '#3a8a3a', x, y - 6, 1, 6); R(g, '#5aaa4a', x + 1, y - 7, 2, 2); return; }
  if (s === 2) { R(g, '#6b4a2b', x, y - 12, 2, 12); disc(g, x + 1, y - 14, 4, '#4a9a3a'); return; }
  drawTree(g, x, y, { leaf: '#3a7a2a', size: s === 3 ? 0.8 : 1.4, fruit: '#8b5a2b' });
}
function drawStatue(g, x, y, s, t) {
  R(g, 'rgba(0,0,0,0.2)', x - 14, y - 1, 28, 3);
  R(g, '#9a9aa0', x - 12, y - 6, 24, 6); R(g, '#b0b0b8', x - 12, y - 6, 24, 1);
  if (s === 0 || s === 1) {
    R(g, '#e8e8ec', x - 8, y - 30, 16, 24); R(g, '#d0d0d8', x + 4, y - 30, 4, 24); R(g, '#f8f8fc', x - 8, y - 30, 2, 24);
    if (s === 1) { R(g, '#d0d0d8', x - 3, y - 28, 6, 6); for (let i = 0; i < 4; i++) R(g, '#fff', x + 10 + Math.sin(t * 9 + i) * 5, y - 20 + i * 3, 1, 1); }
  }
  if (s >= 2) {
    const c = s === 2 ? 'rgba(80,140,255,0.9)' : '#f0f0f4';
    if (s === 2) { R(g, '#e8e8ec', x - 8, y - 30, 16, 24); }
    const P = (a, b, w, h) => R(g, c, x + a, y + b, w, h);
    P(-2, -30, 5, 5); P(-4, -25, 9, 9); P(-6, -24, 2, 6); P(5, -27, 2, 7); P(-3, -16, 3, 10); P(1, -16, 3, 10);
    if (s === 4) { for (const [a, b] of [[-3, -31], [-1, -32], [1, -32], [3, -31]]) R(g, '#5cb85c', x + a, y + b, 1, 1); R(g, '#f7c948', x - 10, y - 4, 20, 1); }
  }
}
async function fourCauses(self) {
  await say('aristotle', 'To truly understand *anything*, ask four "why" questions. I call them the *four causes*. Let\'s try them on this statue.');
  self.statueStage = 0; AudioSys.play('bell', 55, { vol: 0.1 });
  await say('aristotle', '1. The *material* cause: what is it made of? *Marble.*');
  self.statueStage = 1;
  for (let i = 0; i < 4; i++) { SFX.crack(); await wait(0.18); }
  await say('aristotle', '2. The *efficient* cause: what made it? *The sculptor\'s chisel*, tap, tap, tap.');
  self.statueStage = 2; AudioSys.play('bell', 67, { vol: 0.1 });
  await say('aristotle', '3. The *formal* cause: what shape or design makes it *this* thing? *The form of a hero*, which the sculptor had in mind.');
  self.statueStage = 4; SFX.success();
  await say('aristotle', '4. The *final* cause: what is it *for*? *To honor a hero*, and inspire citizens.');
  await say('aristotle', 'Notice: for me the form isn\'t floating in some heaven like Plato\'s Forms. It\'s *in* the thing itself.');
}

async function aristotleTalk() {
  if (hasInsight('mean')) {
    await say('aristotle', 'Remember: virtue is a *habit*. You don\'t become kind by reading about kindness. You become kind by doing kind things, again and again.');
    return;
  }
  await say('aristotle', 'Ah, walk with me! My students are called *Peripatetics*: "the ones who walk around." I think better on my feet.');
  await say('aristotle', 'My teacher Plato looked up to the heavens for truth. I look *here*: at animals, plants, cities, people. What actually makes a human life go *well*?');
  await say('aristotle', 'My answer: *virtue*. And every virtue is a *mean* between two vices: one of too little, one of too much.');
  await say('aristotle', 'Here. Tune these three virtues on this young soldier. Don\'t look for the exact middle. *Listen* for where it sounds right.');
  await virtueTuner();
  await say('aristotle', 'You found them! Notice the mean wasn\'t always dead center. Courage leans a little toward boldness, generosity a little toward caution. The mean is *relative to us* and to the situation.');
  await say('aristotle', 'That takes *practical wisdom*, phronesis. No rulebook can do it for you.');
  await say('aristotle', 'And virtue is a *habit*. A harpist becomes good by playing the harp; we become brave by doing brave things. Do it until it\'s who you are.');
  await giveInsight('mean');
  await say('owl', 'The path *west* to the Stoa is open, and so is the other road back at the Agora.');
}

function drawLion(g, x, y, mood, t) {
  disc(g, x, y - 10, 9, '#a0522d'); R(g, '#d4a24a', x - 2, y - 10, 16, 8); disc(g, x, y - 10, 6, '#e0b060');
  R(g, '#111', x - 3, y - 12, 1, 1); R(g, '#111', x + 2, y - 12, 1, 1); R(g, '#5a3a1a', x - 1, y - 9, 2, 1);
  if (mood === 'roar') { R(g, '#8b1e2b', x - 2, y - 8, 4, 3); R(g, '#fff', x - 2, y - 8, 1, 1); R(g, '#fff', x + 1, y - 8, 1, 1); }
  for (const lx of [0, 4, 10, 13]) R(g, '#c4923a', x + lx, y - 2, 2, 2);
  R(g, '#c4923a', x + 14, y - 12, 1, 4);
  if (mood === 'calm') { R(g, '#e0b060', x - 3, y - 13, 2, 1); }
}
async function virtueTuner() {
  const rows = [
    { name: 'Courage', lo: 'Cowardice', hi: 'Recklessness', target: 0.57, v: 0.08, done: false, hold: 0 },
    { name: 'Generosity', lo: 'Stinginess', hi: 'Wastefulness', target: 0.44, v: 0.92, done: false, hold: 0 },
    { name: 'Wit', lo: 'Boorishness', hi: 'Buffoonery', target: 0.5, v: 0.12, done: false, hold: 0 },
  ];
  let sel = 0, beat = 0;
  const tol = 0.075;
  const state = r => { const d = r.v - r.target; return Math.abs(d) < tol ? 'mean' : d < 0 ? 'lo' : 'hi'; };
  const hero = playerLook();
  showVignette((v, t) => {
    const r = rows[sel], s = state(r), d = r.v - r.target;
    R(v, s === 'mean' ? '#2a3a2a' : '#2a2440', 0, 0, 160, 90);
    R(v, '#5a7a3a', 0, 70, 160, 20);
    if (sel === 0) {
      const hx = s === 'lo' ? 40 - (t * 30 % 20) : s === 'hi' ? 92 + Math.sin(t * 20) * 2 : 66;
      drawPerson(v, hx, 78, hero, s === 'lo' ? 2 : 3, s !== 'mean' ? Math.floor(t * 10) % 4 : 0, { armsUp: s === 'hi', hold: s === 'mean' ? (g, x, y) => { R(g, '#c9a24a', x + 3, y - 14, 5, 9); R(g, '#8b1e2b', x + 4, y - 12, 3, 4); } : null });
      if (s === 'lo') { R(v, '#5dade2', hx + 5, 58, 1, 2); R(v, '#5dade2', hx - 6, 60, 1, 2); }
      if (s === 'hi') for (let i = 0; i < 3; i++) line(v, 84 + i * 4, 52, 88 + i * 4, 46, '#e74c3c');
      drawLion(v, 118, 78, s === 'mean' ? 'calm' : 'roar', t);
    } else if (sel === 1) {
      drawPerson(v, 58, 78, hero, 3, 0, { hold: s === 'lo' ? (g, x, y) => { disc(g, x, y - 9, 4, '#8b5a2b'); R(g, '#f1c40f', x - 1, y - 13, 2, 1); } : null, armsUp: s === 'hi' });
      drawPerson(v, 110, 78, { skin: '#c98e62', hairStyle: 'long', hairC: '#6a6a6a', robe: '#7a6a5a', robe2: '#5a4a3a', long: true }, 2, 0, { sit: true, smile: s === 'mean' });
      if (s === 'lo') { R(v, '#5dade2', 108, 64, 1, 2); }
      if (s === 'hi') { for (let i = 0; i < 12; i++) ICONS.coin(v, 20 + ((i * 37 + t * 40) % 130), 10 + ((i * 23 + t * 60) % 60)); R(v, '#8b5a2b', 52, 66, 12, 12); }
      if (s === 'mean') { const k = (t * 0.8) % 1; ICONS.coin(v, 64 + k * 40, 66 - Math.sin(k * 3.14) * 12); ICONS.heart(v, 84, 30 + Math.sin(t * 3) * 2); }
    } else {
      R(v, '#8b5a2b', 30, 62, 100, 6);
      drawPerson(v, 80, 60, hero, 0, 0, { armsUp: s === 'hi', smile: s !== 'lo', hold: s === 'hi' ? (g, x, y) => { R(g, '#7f8c8d', x - 4, y - 22, 8, 4); } : null });
      for (const [gx, i] of [[42, 0], [118, 1]]) {
        const b = s === 'mean' ? Math.round(Math.sin(t * 12 + i) * 1) : 0;
        drawPerson(v, gx, 60 + b, [LOOKS.youngPlato, LOOKS.sophist][i], 0, 0, { sit: true, smile: s === 'mean', closedEyes: s === 'lo' });
        if (s === 'lo') { R(v, '#aed6f1', gx + 5, 34 - (t * 6 % 6), 3, 1); R(v, '#aed6f1', gx + 6, 30 - (t * 6 % 6), 3, 1); }
        if (s === 'hi') { R(v, '#e74c3c', gx, 30, 2, 6); R(v, '#e74c3c', gx, 38, 2, 2); }
        if (s === 'mean') { drawSpark(v, gx + 6, 34, t + i); }
      }
    }
    // label
    v.fillStyle = s === 'mean' ? '#2ecc71' : '#e74c3c'; v.fillRect(0, 0, 160, 2);
  }, { title: 'The Golden Mean' });
  const end = setActivity({
    update(dt) {
      if (Dialog.cur) return;
      const r = rows[sel];
      if (!r.done) {
        const dv = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
        r.v = clamp(r.v + dv * dt * 0.45, 0, 1);
        if (state(r) === 'mean' && !dv) { r.hold += dt; if (r.hold > 0.9) { r.done = true; SFX.success(); } } else r.hold = 0;
      }
      if (hit('up')) { sel = (sel + 2) % 3; SFX.select(); }
      if (hit('down')) { sel = (sel + 1) % 3; SFX.select(); }
      if (r.done && rows.some(x => !x.done) && hit('act')) { sel = rows.findIndex(x => !x.done); SFX.select(); }
      // sound of the virtue
      beat -= dt;
      const s = state(r), d = r.v - r.target;
      if (beat <= 0) {
        if (s === 'mean') { beat = 0.55; [60, 64, 67].forEach((n, i) => AudioSys.play('pluck', n + 7, { vol: 0.1, dur: 1.2 }, i * 0.03)); }
        else if (s === 'lo') { beat = 0.6 + (-d) * 0.8; AudioSys.play('sine', 55 - Math.round(-d * 14), { vol: 0.05 * (1 - (-d) * 0.8), dur: 0.5 }); }
        else { beat = Math.max(0.12, 0.4 - d * 0.6); AudioSys.play('pluck', 70, { vol: 0.08 + d * 0.1, dur: 0.4, wave: 'sawtooth', saw: 1 }); AudioSys.play('pluck', 71 + Math.round(d * 6), { vol: 0.08 + d * 0.1, dur: 0.4, wave: 'square', saw: 1 }); }
      }
    },
    ui() {
      panel(70, 112, 340, 102);
      rows.forEach((r, i) => {
        const y = 120 + i * 26, isSel = i === sel, s = state(r);
        text((isSel ? '▶ ' : '  ') + r.name + (r.done ? '  ✓' : ''), 78, y, { size: 13, color: r.done ? '#2ecc71' : isSel ? UIC.hl : UIC.ink });
        text(r.lo, 180, y + 11, { size: 11, color: UIC.dim }); text(r.hi, 400, y + 11, { size: 11, align: 'right', color: UIC.dim });
        ctx.fillStyle = '#1a1020'; ctx.fillRect(180, y + 2, 220, 8);
        const grd = ctx.createLinearGradient(180, 0, 400, 0); grd.addColorStop(0, '#5dade2'); grd.addColorStop(0.5, '#f7c948'); grd.addColorStop(1, '#e74c3c');
        ctx.fillStyle = grd; ctx.globalAlpha = 0.35; ctx.fillRect(180, y + 2, 220, 8); ctx.globalAlpha = 1;
        const kx = 180 + r.v * 220;
        ctx.fillStyle = r.done ? '#2ecc71' : s === 'mean' ? '#fff' : UIC.hl; ctx.fillRect(kx - 2, y - 1, 4, 14);
        if (s === 'mean' && !r.done) text('♪', kx, y - 12, { size: 13, align: 'center', color: '#2ecc71' });
      });
      text(rows.every(r => r.done) ? '' : '↑↓ pick a virtue · hold ← → to adjust · let go when it sounds right', 240, 199, { size: 12, align: 'center', color: UIC.dim });
    },
  });
  await waitUntil(() => rows.every(r => r.done));
  await wait(0.6);
  end(); hideVignette();
  [60, 64, 67, 72, 76].forEach((n, i) => AudioSys.play('pluck', n, { vol: 0.12, dur: 2 }, i * 0.1));
}
