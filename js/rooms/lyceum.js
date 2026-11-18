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
  await say('aristotle', 'My answer: *virtue*. And every virtue sits in the *middle*, between too little and too much. I call it the *mean*. But the middle of *what*? Let me show you. Dinner time!');
  await milosDinner();
  await say('aristotle', 'Now the most important part. How does anyone *become* good? I tutored a boy who became famous. You will raise him. Every choice you make for him becomes part of who he is.');
  await raiseAlexander();
  await giveInsight('mean');
  await say('owl', 'The path *west* to the Stoa is open, and so is the other road back at the Agora.');
}

// ---------- 1. Milo's Dinner: the mean is relative to the person
function drawScaled(g, x, y, sc, fn) { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(sc, sc); fn(g); g.restore(); }
const MILO = { skin: '#c98e62', hairStyle: 'curly', hairC: '#2b1d14', beard: '#2b1d14', beardLen: 2, robe: '#c0392b', robe2: '#7b241c', legs: '#c98e62' };
async function milosDinner() {
  const C = await cutStart("Aristotle's dinner puzzle");
  player.x = 200; player.y = 150; player.dir = 3;
  const AXd = G.room.ents.find(e => e.id === 'alexander'); if (AXd) AXd.hidden = true;
  const table = C.prop('table', 0, 0, (g) => { R(g, '#6b4a2b', 236, 150, 136, 6); R(g, '#8b5a2b', 236, 148, 136, 3); for (const x of [240, 366]) R(g, '#5a3a1a', x, 156, 3, 10); }, { z: 151 });
  const diners = [
    { id: 'kid', name: 'A little girl', look: { skin: '#f0d0a8', hairStyle: 'ponytail', hairC: '#d8b26e', robe: '#f39c12', robe2: '#9a5a10' }, x: 256, sc: 1, want: 0 },
    { id: 'scholar', name: 'A thin scholar', look: { skin: '#eab994', hairStyle: 'bald', hairC: '#bbb', beard: '#bbb', beardLen: 3, robe: '#7a6a8a', robe2: '#4a3a5a', long: true }, x: 300, sc: 1, want: 1 },
    { id: 'milo', name: 'Milo of Croton, champion wrestler', look: MILO, x: 346, sc: 1.6, want: 2 },
  ];
  for (const d of diners) {
    d.a = C.actor(d.id, d.look, d.x, 146, { dir: 0 });
    if (d.sc !== 1) d.a.customDraw = function (g) { drawScaled(g, this.x, this.y, d.sc, gg => drawPerson(gg, 0, 0, this.look, this.dir, 0, this.pose)); };
    d.plate = C.prop('plate_' + d.id, d.x, 152, function (g, t) { ellipse(g, this.x, 150, 7, 2, '#ecf0f1'); const n = this.portion == null ? -1 : [1, 3, 7][this.portion]; for (let i = 0; i < n; i++) disc(g, this.x - 4 + (i % 3) * 4, 147 - Math.floor(i / 3) * 3, 2, ['#c0392b', '#f39c12', '#27ae60'][i % 3]); }, { z: 152 });
  }
  await say('aristotle', 'Suppose 10 pounds of food is too much for a person, and 2 pounds is too little. Is 6 pounds, the exact middle, right for *everyone*?');
  await say('aristotle', 'Let\'s find out. Serve each guest the amount that is *right for them*.');
  const sizes = ['A small bowl', 'A normal plate', 'A mountain of food'];
  for (const d of diners) {
    let done = false;
    while (!done) {
      C.emote(d.a, '?', 2);
      const c = await ask('aristotle', `How much for *${d.name}*?`, sizes);
      d.plate.portion = c; SFX.coin();
      await wait(0.5);
      const who = { name: d.name, look: d.look, voice: d.id === 'kid' ? 480 : d.id === 'milo' ? 170 : 260 };
      if (c === d.want) {
        C.emote(d.a, 'heart', 2.5); d.a.pose = { smile: true }; SFX.success();
        await say(who, ['Yum! Just right!', 'Ah, perfect. Now I can think clearly.', 'HA! Finally, a real meal! Now I can wrestle a bull!'][diners.indexOf(d)]);
        done = true;
      } else if (c > d.want) {
        C.emote(d.a, 'sweat', 2.5); shake(0.1); AudioSys.play('sine', 180, { hz: true, wave: 'sawtooth', to: 90, dur: 0.5, vol: 0.05 });
        await say(who, ['Ugh… my tummy hurts. That\'s way too much!', 'Oof. I can\'t possibly. I\'ll fall asleep over my books!', '…'][diners.indexOf(d)] || 'Too much!');
        d.plate.portion = null;
      } else {
        C.emote(d.a, 'tear', 2.5); AudioSys.play('sine', 300, { hz: true, to: 200, dur: 0.4, vol: 0.05 });
        await say(who, ['Still a bit hungry…', 'Hmm, I\'ll be hungry before my lecture is over.', 'THIS? This is a snack for a sparrow! I\'m starving!'][diners.indexOf(d)]);
        d.plate.portion = null;
      }
    }
  }
  await say('aristotle', 'Three guests, three different right amounts. Milo needs far more than the scholar. For Milo, 6 pounds is too *little*. For a beginner, it\'s too *much*.');
  await say('aristotle', 'That\'s what I mean: the mean is *relative to us*. Not the mathematical middle, but the right amount for *this* person in *this* situation. Finding it takes judgment. I call it *practical wisdom*.');
  await C.end();
  if (AXd) AXd.hidden = false;
}

// ---------- 2. Raise Alexander: virtue is a habit
const HABITS = [
  { id: 'courage', name: 'Courage', lo: 'cowardly', hi: 'reckless' },
  { id: 'generosity', name: 'Generosity', lo: 'stingy', hi: 'wasteful' },
  { id: 'temperance', name: 'Self-control', lo: 'joyless', hi: 'indulgent' },
];
function habitOf(h) { const v = G.alex[h]; return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; }
function habitWord(h) { const v = habitOf(h), H = HABITS.find(x => x.id === h); return v < -0.34 ? H.lo : v > 0.34 ? H.hi : 'balanced'; }
function drawHabits() {
  if (!G.alex || !G.alexShow) return;
  panel(6, 64, 132, 66, { bg: 'rgba(22,16,34,0.9)' });
  text("ALEXANDER'S HABITS", 72, 68, { title: true, size: 5, align: 'center', color: UIC.hl });
  HABITS.forEach((H, i) => {
    const y = 80 + i * 16, v = habitOf(H.id), n = G.alex[H.id].length;
    text(H.name, 12, y - 2, { size: 11, color: UIC.ink });
    const x0 = 66, w = 64;
    const grd = ctx.createLinearGradient(x0, 0, x0 + w, 0); grd.addColorStop(0, '#5dade2'); grd.addColorStop(0.5, '#f7c948'); grd.addColorStop(1, '#e74c3c');
    ctx.fillStyle = grd; ctx.globalAlpha = 0.45; ctx.fillRect(x0, y + 1, w, 4); ctx.globalAlpha = 1;
    if (n) { const kx = x0 + (v + 1) / 2 * w; ctx.fillStyle = '#fff'; ctx.fillRect(kx - 1, y - 1, 3, 8); }
    for (let k = 0; k < n; k++) { ctx.fillStyle = G.alex[H.id][k] === 0 ? '#2ecc71' : '#e67e22'; ctx.fillRect(x0 + k * 5, y + 7, 4, 2); }
  });
}
function drawBucephalus(g, x, y, rear, t) {
  const r = rear ? 6 : 0;
  R(g, 'rgba(0,0,0,0.2)', x - 12, y - 1, 26, 3);
  R(g, '#1d1d24', x - 11, y - 15 - r * 0.4, 22, 9);
  R(g, '#1d1d24', x + 7, y - 22 - r, 5, 10); R(g, '#1d1d24', x + 9, y - 24 - r, 7, 4); R(g, '#f5f5f5', x + 12, y - 23 - r, 2, 1);
  R(g, '#3a3a44', x + 7, y - 25 - r, 2, 9);
  for (const lx of [-10, -6]) R(g, '#1d1d24', x + lx, y - 7, 2, 7);
  for (const lx of [5, 9]) R(g, '#1d1d24', x + lx, y - 7 - r, 2, 7 - (rear ? 2 : 0));
  R(g, '#3a3a44', x - 14, y - 15, 3, 9 + Math.round(Math.sin(t * 4)));
  if (rear) for (let i = 0; i < 3; i++) R(g, '#c8b898', x - 6 + i * 6, y - 2 - ((t * 20 + i * 3) % 4), 2, 1);
}
async function raiseAlexander() {
  G.alex = { courage: [], generosity: [], temperance: [] };
  const AX = G.room.ents.find(e => e.id === 'alexander'), axHome = [AX.x, AX.y];
  AX.hidden = true;
  const YOUNG = Object.assign({}, LOOKS.alexander, { hat: null, robe: '#c0392b', robe2: '#c0a040' });
  const C = await cutStart();
  await C.stage(STAGES.palace({ style: 'greek' }), 'Pella, Macedon · 344 BCE');
  G.alexShow = true;
  const al = C.actor('alex', YOUNG, 260, 150, { dir: 3 });
  // --- Scene 1: Bucephalus (timing mini-game)
  const horse = C.prop('horse', 400, 150, function (g, t) { drawBucephalus(g, this.x + (this.warn && !this.rear ? Math.round(Math.sin(t * 40)) : 0), this.y, this.rear, t); }, { rear: false, z: 150 });
  const philip = C.actor('philip', Object.assign({}, LOOKS.ruler, { beard: '#3a2a1a', beardLen: 2 }), 330, 120, { dir: 0 });
  await say(null, 'A merchant brings King Philip a magnificent black horse, *Bucephalus*. But it bucks and rears. No one can ride it.');
  await say({ name: 'King Philip', look: philip.look, voice: 230 }, 'Take the wild beast away! It\'s useless.');
  C.emote(al, 'idea', 2.5);
  await say('alexander', 'Wait, Father! He\'s not wild. He\'s afraid of his own *shadow*! Let me try.');
  await say(null, 'Approach the horse. *Hold E* to walk while he is calm. *Let go* when he rears up. Wait too long and Philip will lose patience.');
  let p = 0, reckless = 0, timid = 0, idle = 0, phaseT = 1.6, kicked = 0, rearStart = 0;
  const end = setActivity({
    panels: false,
    update(dt) {
      if (Dialog.cur || this.done) return;
      phaseT -= dt;
      if (phaseT <= 0) { horse.rear = !horse.rear; if (horse.rear) rearStart = G.t; phaseT = horse.rear ? 0.8 + Math.random() * 0.8 : 1.1 + Math.random() * 1.2; if (horse.rear) AudioSys.play('sine', 800, { hz: true, wave: 'sawtooth', to: 400, dur: 0.5, vol: 0.05 }); }
      horse.warn = !horse.rear && phaseT < 0.5;
      const holding = down('act') || keys['e'] || keys[' '];
      if (holding) {
        idle = 0;
        if (horse.rear) { if (G.t - rearStart > 0.3 && G.t - kicked > 0.7) { kicked = G.t; reckless++; p = Math.max(0, p - 0.18); shake(0.25); SFX.thud(); notice('Too fast! He rears and you stumble back.', 1.2); } }
        else { p = Math.min(1, p + dt * 0.2); al.step = Math.floor(G.t * 8) % 4; }
      } else {
        al.step = 0;
        if (!horse.rear) { idle += dt; if (idle > 3) { idle = 0; timid++; notice('Philip: "Hurry up, boy, or I\'ll send it away!"', 1.4); } }
      }
      al.x = lerp(262, 384, p); al.dir = 3;
      if (p >= 1) this.done = true;
    },
    ui() {
      text('Hold E to approach · let go when he rears', 240, 58, { size: 12, align: 'center', color: UIC.hl });
      const soon = !horse.rear && phaseT < 0.5;
      text(horse.rear ? 'REARING! wait…' : soon ? 'about to rear…' : 'calm: go', 400, 104, { size: 12, align: 'center', color: horse.rear ? '#e74c3c' : soon ? '#f39c12' : '#2ecc71' });
    },
  });
  const act = G.activity; await waitUntil(() => act.done); end();
  horse.rear = false;
  await say(null, 'Alexander turns Bucephalus to face the sun, so his shadow falls behind him. The horse calms. Alexander swings up and rides!');
  for (let i = 0; i < 60; i++) { horse.x = 400 + Math.sin(i / 10) * 40; al.x = horse.x; al.y = 138; await nextFrame(); }
  const cScore = reckless >= 3 ? 1 : timid >= 3 ? -1 : 0;
  G.alex.courage.push(cScore);
  await say({ name: 'King Philip', look: philip.look, voice: 230 }, 'My son, find a kingdom big enough for you. Macedon is too small!');
  await say('aristotle', cScore === 0 ? 'Brave, but *careful*: he moved when it was right and waited when it wasn\'t. That is courage.' : cScore > 0 ? 'He got there, but by charging in when the horse was dangerous. Too much daring is *recklessness*.' : 'He got there, but he hesitated so long he nearly lost the chance. Too little daring is *cowardice*.');
  horse.alpha = 0; philip.alpha = 0; al.x = 260; al.y = 150;
  // --- Scene 2: the beggar at the gate (generosity)
  await C.black(true); C.caption('The palace gate, a few months later'); await C.black(false);
  const beg = C.actor('beggar', { skin: '#c98e62', hairStyle: 'long', hairC: '#6a6a6a', beard: '#6a6a6a', beardLen: 3, robe: '#7a6a5a', robe2: '#5a4a3a', long: true }, 360, 150, { dir: 2, pose: { sit: true } });
  C.emote(beg, '...', 2.5);
  await say({ name: 'An old soldier, begging', look: beg.look, voice: 200 }, 'Young prince… I fought for your father for twenty years. Now I have nothing. Could you spare anything?');
  const g1 = await ask('aristotle', 'What does Alexander do?', ['Walk past and keep his gold.', 'Give him a good meal and a coin, and listen to his story.', 'Hand him the entire royal treasury, on the spot!']);
  const gScore = [-1, 0, 1][g1];
  G.alex.generosity.push(gScore);
  if (gScore === -1) { C.emote(beg, 'tear', 3); await C.walk(al, 440, 150, 50); await say('aristotle', 'Keeping what could do real good is *stinginess*.'); }
  else if (gScore === 0) { await C.walk(al, 344, 150, 50); ICONS && SFX.coin(); C.emote(beg, 'heart', 3); beg.pose = { sit: true, smile: true }; await say('aristotle', 'Giving the right amount, to the right person, for the right reason. That is *generosity*.'); }
  else { await C.walk(al, 344, 150, 50); for (let i = 0; i < 6; i++) { SFX.coin(); await wait(0.1); } const tre = C.actor('treasurer', { skin: '#eab994', hairStyle: 'bald', hairC: '#bbb', robe: '#2e86c1', robe2: '#c9a24a', long: true }, 300, 120, { dir: 0 }); C.emote(tre, '!', 2); tre.pose = { closedEyes: true }; await say({ name: 'The royal treasurer', look: tre.look, voice: 300 }, 'The *whole* treasury?! But… how will we pay the army?'); await say('aristotle', 'Giving with no sense of measure isn\'t generosity. It\'s *wastefulness*, and soon there\'s nothing left to give anyone.'); tre.alpha = 0; }
  beg.alpha = 0; al.x = 260;
  // --- Scene 3: the feast (self-control)
  await C.stage(STAGES.hall({ style: 'greek' }), 'A royal feast', { carry: [al] });
  const feast = C.prop('feast', 0, 0, (g, t) => { R(g, '#6b4a2b', 280, 150, 140, 6); for (let i = 0; i < 6; i++) { ICONS[['apple', 'mango', 'coin'][i % 3]](g, 290 + i * 22, 144); } for (let i = 0; i < 3; i++) { R(g, '#c9a24a', 300 + i * 40, 140, 4, 6); } }, { z: 151 });
  const guests = [0, 1, 2].map(i => C.actor('g' + i, { skin: ['#eab994', '#c98e62', '#e8b48f'][i], hairStyle: 'curly', hairC: '#2b1d14', beard: '#2b1d14', beardLen: 1, robe: ['#8e44ad', '#16a085', '#d35400'][i], robe2: '#c9a24a', long: true }, 300 + i * 50, 130, { dir: 0, pose: { sit: true } }));
  await C.walk(al, 290, 156, 50); al.dir = 1;
  const cleitus = guests[1];
  await say({ name: 'Cleitus, his friend', look: cleitus.look, voice: 260 }, 'To the prince! More wine for Alexander! Tell us how you tamed that horse!');
  const f1 = await ask('aristotle', 'What does Alexander do at the feast?', ['Refuse all food and wine, and sit in grim silence.', 'Enjoy the food and a cup of wine, then stop when it\'s enough.', 'Drink cup after cup, and boast louder and louder.']);
  const tScore = [-1, 0, 1][f1];
  G.alex.temperance.push(tScore);
  if (tScore === -1) { al.pose = {}; C.emote(al, '...', 3); guests.forEach(g => C.emote(g, '?', 2)); await say('aristotle', 'Refusing every pleasure isn\'t a virtue. It\'s being *joyless*. A good life includes enjoying good things.'); }
  else if (tScore === 0) { C.emote(al, 'heart', 2); guests.forEach(g => C.emote(g, 'ha', 2)); AudioSys.play('pluck', 67, { vol: 0.1 }); await say('aristotle', 'Enjoying pleasure in the right amount, and staying in charge of yourself. That is *self-control*.'); }
  else { for (let i = 0; i < 4; i++) { al.x += 4 * (i % 2 ? -1 : 1); C.emote(al, 'ha', 1); AudioSys.play('sine', 300 + i * 60, { hz: true, wave: 'sawtooth', dur: 0.15, vol: 0.04 }); await wait(0.35); } al.pose = { armsUp: true }; C.emote(cleitus, 'angry', 2.5); shake(0.2); SFX.shatter(); await say('alexander', 'I am the GREATEST! Greater than my father! Greater than any of you!'); al.pose = {}; await say('aristotle', 'When pleasure takes over, you stop being in charge of yourself. That is *indulgence*, and it makes people do things they regret.'); }
  feast.alpha = 0; guests.forEach(g => g.alpha = 0); al.x = 260; al.y = 150;
  // --- Scene 4: the battle (his habit acts for him)
  await C.stage(STAGES.field(), 'Battle of Chaeronea · 338 BCE · Alexander is 18', { carry: [al] });
  await say(null, 'Years have passed. Alexander leads the cavalry in his first great battle.');
  await say('aristotle', 'This time, *you don\'t choose*. Watch what his habits make him do.');
  const enemy = [0, 1, 2].map(i => C.actor('e' + i, { skin: '#e8b48f', hairStyle: 'short', robe: '#2e86c1', robe2: '#1b4f72', hat: 'helmet' }, 400 + (i % 2) * 14, 130 + i * 14, { dir: 2 }));
  const allies = [0, 1].map(i => C.actor('a' + i, { skin: '#e8b48f', hairStyle: 'short', robe: '#c0392b', hat: 'helmet' }, 230, 136 + i * 24, { dir: 3 }));
  al.look = Object.assign({}, YOUNG, { hat: 'helmet' });
  const ch = habitOf('courage');
  if (ch > 0.34) {
    await C.walk(al, 390, 150, 120); C.emote(al, '!', 2); SFX.thud(); shake(0.3);
    await say(null, 'He charges *alone*, far ahead of his men, and is nearly surrounded before they can reach him.');
  } else if (ch < -0.34) {
    C.emote(al, 'sweat', 3); await wait(1.2);
    await say(null, 'He hesitates at the critical moment. His officers have to lead the charge for him.');
    await C.walkAll(allies.map(a => [a, 380, a.y, 70]));
  } else {
    C.emote(al, 'idea', 2);
    await say(null, 'He waits for the right moment, then leads his men through a gap in the enemy line, together.');
    await C.walkAll([[al, 370, 150, 70], ...allies.map(a => [a, 360, a.y, 70])]);
    enemy.forEach(e => C.emote(e, '!', 2));
  }
  G.alex.courage.push(ch > 0.34 ? 1 : ch < -0.34 ? -1 : 0);
  await say('aristotle', 'Did you see? You didn\'t choose that. His *habit* did. We become what we repeatedly do. Every choice you made for him has been carving his character, like water carving stone.');
  await alexanderEnding(C);
  G.alexShow = false;
  AX.hidden = false; AX.x = axHome[0]; AX.y = axHome[1];
}

// ---------- 3. the man he becomes
async function alexanderEnding(C) {
  await C.stage(STAGES.camp({ style: 'macedon' }), 'Alexander the Great, years later');
  const KING = Object.assign({}, LOOKS.alexander, { hat: 'crown', robe: '#8e44ad', robe2: '#f1c40f', long: true });
  const k = C.actor('king', KING, 300, 150, { dir: 0 });
  const w = { courage: habitWord('courage'), generosity: habitWord('generosity'), temperance: habitWord('temperance') };
  const balanced = Object.values(w).every(x => x === 'balanced');
  if (w.courage === 'reckless') {
    const sol = [0, 1, 2].map(i => C.actor('s' + i, { skin: '#e8b48f', hairStyle: 'short', robe: '#c0392b', hat: 'helmet' }, 340 + i * 14, 160, { dir: 2, pose: { sit: true } }));
    C.emote(k, '!', 2); sol.forEach(s => C.emote(s, 'sweat', 3));
    await say({ name: 'King Alexander', look: KING, voice: 480 }, 'Onward! India, and then the edge of the world!');
    await say(null, 'His exhausted army, years from home, sits down and *refuses* to march any further.');
  }
  if (w.temperance === 'indulgent') {
    const cl = C.actor('cl', { skin: '#c98e62', hairStyle: 'curly', hairC: '#2b1d14', beard: '#2b1d14', beardLen: 1, robe: '#16a085', long: true }, 260, 150, { dir: 3 });
    C.emote(k, 'angry', 2.5); shake(0.3); SFX.thud();
    await say(null, 'At a drunken feast, a quarrel. In a rage, the king kills his old friend Cleitus, and then weeps for days.');
    await C.fadeActor(cl, 0, 1);
  }
  if (w.generosity === 'wasteful') { for (let i = 0; i < 6; i++) SFX.coin(); await say(null, 'He gives away gifts and lands without measure, and his treasury is always empty.'); }
  if (w.generosity === 'stingy') { await say(null, 'He hoards his riches, and his soldiers grumble that the king never shares.'); }
  if (w.courage === 'cowardly') { await say(null, 'He avoids every risk, and his generals quietly take the real decisions.'); }
  if (w.temperance === 'joyless') { await say(null, 'He never relaxes or laughs, and his court finds him cold and distant.'); }
  if (balanced) {
    C.emote(k, 'heart', 3); SFX.chime();
    await say(null, 'Your Alexander grows into a brave but careful leader, generous in the right measure, the master of himself. His people *flourish*, and so does he.');
  }
  await say('owl', `Your Alexander became: *${w.courage}* in courage, *${w.generosity}* in giving, *${w.temperance}* in pleasure.`);
  await say('owl', 'The real Alexander was a brilliant, fearless commander who built an empire from Greece to India. But he was also often reckless, drank heavily, killed his friend Cleitus at a feast, and died at just 32. Aristotle might say he overshot the mean.');
  await C.end();
  await say('aristotle', 'This is my whole ethics in one boy. Virtue is a *habit*. A harpist becomes good by playing the harp; we become brave by doing brave things.');
  await say('aristotle', 'The mean is *relative to us*: Milo\'s dinner is not the scholar\'s. And the goal of it all is *eudaimonia*: flourishing, a life lived well. Not a feeling you have, but a life you build.');
}

function drawLion(g, x, y, mood, t) {
  disc(g, x, y - 10, 9, '#a0522d'); R(g, '#d4a24a', x - 2, y - 10, 16, 8); disc(g, x, y - 10, 6, '#e0b060');
  R(g, '#111', x - 3, y - 12, 1, 1); R(g, '#111', x + 2, y - 12, 1, 1); R(g, '#5a3a1a', x - 1, y - 9, 2, 1);
  if (mood === 'roar') { R(g, '#8b1e2b', x - 2, y - 8, 4, 3); R(g, '#fff', x - 2, y - 8, 1, 1); R(g, '#fff', x + 1, y - 8, 1, 1); }
  for (const lx of [0, 4, 10, 13]) R(g, '#c4923a', x + lx, y - 2, 2, 2);
  R(g, '#c4923a', x + 14, y - 12, 1, 4);
  if (mood === 'calm') { R(g, '#e0b060', x - 3, y - 13, 2, 1); }
}
