'use strict';
// ============================================================
// ROOM: Plato's Cave — shadows, the Sun, and the Forms
// stages: chained → free → (outside) → return → done
// ============================================================
function caveStage(s) { return s ? flag('caveStage', s) : (flag('caveStage') || 'chained'); }

function silhouette(g, type, x, y, s, c) {
  const S = (dx, dy, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x + dx * s), Math.round(y + dy * s), Math.ceil(w * s), Math.ceil(h * s)); };
  if (type === 'horse') { S(-6, -9, 12, 5); S(4, -13, 3, 6); S(5, -14, 5, 3); S(5, -15, 1, 2); S(-5, -4, 1, 4); S(-3, -4, 1, 4); S(2, -4, 1, 4); S(4, -4, 1, 4); S(-8, -9, 2, 5); }
  if (type === 'bird') { S(-3, -9, 7, 3); S(4, -10, 2, 2); S(6, -9, 2, 1); S(-1, -13, 2, 4); S(-3, -15, 2, 2); S(-1, -6, 2, 3); S(-5, -9, 2, 2); }
  if (type === 'jar') { S(-3, -10, 6, 8); S(-4, -8, 8, 4); S(-1, -14, 2, 4); S(-2, -15, 4, 1); S(-5, -12, 1, 4); S(4, -12, 1, 4); S(-1, -2, 2, 2); }
  if (type === 'tree') { S(-1, -6, 2, 6); S(-5, -14, 10, 8); S(-3, -17, 6, 3); }
  if (type === 'person') { S(-2, -16, 4, 4); S(-3, -12, 6, 8); S(-3, -4, 2, 4); S(1, -4, 2, 4); }
}
const CUTOUTS = ['horse', 'bird', 'jar', 'tree', 'person'];
const caveDark = document.createElement('canvas'); caveDark.width = W; caveDark.height = H;
const cdg = caveDark.getContext('2d');

Rooms.cave = {
  name: "Plato's Cave", sub: 'from the Republic, c. 375 BCE', scene: 'cave', muffle: 700,
  spawn: [30, 150], view: 'in',
  get walls() {
    if (this.view === 'out') return [[0, 0, W, 96], [0, 96, 18, 40], [92, 196, 60, 22], [292, 158, 10, 4], [380, 120, 6, 4]];
    return [[0, 0, W, 110], [80, 160, 320, 8], [226, 214, 28, 16], [0, 230, 380, 60], [0, 110, 20, 26], [0, 172, 20, 60]];
  },
  surface() { return this.view === 'out' ? 'grass' : 'dirt'; },
  bg(g) {
    if (this.view === 'out') return caveOutsideBg(g);
    tex(g, 0, 0, W, H, '#3a2a22', ['#2a1e18', '#4a3628', '#33251d'], 0.2, 31);
    // the wall where shadows play
    tex(g, 40, 18, 400, 84, '#6a5444', ['#5a4434', '#7a6454', '#62503f'], 0.18, 32);
    for (let i = 0; i < 12; i++) R(g, '#4a3a2e', 40 + i * 34, 18 + (i % 3) * 8, 2, 40 + (i % 4) * 10);
    R(g, '#2a1e18', 0, 102, W, 8);
    // floor
    tex(g, 0, 110, W, 162, '#4a3a2e', ['#3a2a20', '#5a4a3a', '#42332a'], 0.15, 33);
    // parapet
    R(g, '#5a4a3a', 80, 160, 320, 8); R(g, '#6a5a4a', 80, 160, 320, 2); R(g, '#3a2a20', 80, 167, 320, 1);
    // rock masses
    R(g, '#2a1e18', 0, 230, 380, 42);
    for (let x = 0; x < 380; x += 6) R(g, '#33251d', x, 228 + (x * 7 % 5), 6, 4);
    // tunnel up and out (bottom-right)
    for (let i = 0; i < 40; i++) R(g, mix('#2a1e18', '#d8c890', i / 40), 400 + i * 2, 260 - i * 0.6, 3, 14);
    // fire pit
    ellipse(g, 240, 224, 14, 5, '#2a2a2a'); for (let i = 0; i < 6; i++) R(g, '#5a3a1a', 230 + i * 4, 220 + (i % 2), 4, 2);
    if (caveStage() === 'done') { R(g, '#1a1410', 470, 108, 10, 50); }
    // chain posts
    for (const x of [150, 190, 240, 290, 330]) R(g, '#6a6a70', x - 1, 118, 2, 6);
  },
  under(g, t) {
    if (this.view === 'out') return caveOutsideUnder(g, t);
    // shadows on the wall from cutouts
    for (const p of this.puppets || []) {
      const sx = 240 + (p.x - 240) * 1.35;
      if (sx < 30 || sx > 450) continue;
      silhouette(g, p.type, sx, 84, 3, 'rgba(15,8,5,0.75)');
      drawPerson(g, sx + 4, 104, { skin: '#100805', robe: '#100805', hairStyle: 'bald', hairC: '#100805', legs: '#100805', robe2: '#100805', eyes: '#100805' }, 0, 0, { noShadow: true, bob: 0, armsUp: true });
    }
  },
  over(g, t) {
    if (this.view === 'out') return;
    const st = caveStage();
    const f = 1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 23) * 0.03;
    let dark = 0.86;
    if (st === 'return' && this.returnT != null) dark = lerp(0.97, 0.86, clamp((G.t - this.returnT) / 6, 0, 1));
    cdg.globalCompositeOperation = 'source-over';
    cdg.clearRect(0, 0, W, H);
    cdg.fillStyle = `rgba(6,3,8,${dark})`; cdg.fillRect(0, 0, W, H);
    cdg.globalCompositeOperation = 'destination-out';
    const lights = [[240, 220, 190 * f, 1], [240, 60, 220, 0.55], [player.x, player.y - 8, 26, 0.35], [450, 250, 70, 0.8]];
    if (st === 'done') lights.push([474, 130, 50, 0.6]);
    for (const [x, y, r, a] of lights) {
      const gr = cdg.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      cdg.fillStyle = gr; cdg.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.drawImage(caveDark, 0, 0);
    // warm glow
    g.fillStyle = `rgba(255,140,40,${0.07 * f})`; g.fillRect(0, 110, W, 162);
    drawFlame(g, 240, 222, t, 2);
    for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i / 5) % 1; R(g, `rgba(255,180,80,${1 - k})`, 236 + Math.sin(i * 3 + t) * 6, 206 - k * 30, 1, 1); }
  },
  build() {
    if (this.view === 'out') return caveOutsideEnts();
    const st = caveStage();
    this.puppets = [0, 1, 2].map(i => ({ type: CUTOUTS[i], off: i * 190, speed: 22 }));
    const ents = [
      door('agora', [0, 136, 6, 36], 'agora', 20, 110, { arrow: 'left', sign: 'Agora', signPos: [32, 126], locked: () => caveStage() === 'chained' }),
      door('stoa', [474, 108, 6, 50], 'stoa', 24, 190, { arrow: 'right', sign: 'Path to the Stoa', signPos: [440, 98], hidden: st !== 'done', locked: () => caveStage() !== 'done' }),
      Object.assign(door('tunnel', [446, 236, 34, 36], null, 0, 0, { arrow: 'right', sign: 'Toward the light', signPos: [430, 226] }), {
        locked: () => caveStage() === 'chained',
        onUse: () => caveSwitch('out', 44, 168),
      }),
    ];
    // prisoners
    [[150, 'Prisoner'], [190, 'Prisoner'], [290, 'Prisoner'], [330, 'Prisoner']].forEach(([x], i) => {
      ents.push(npc('prisoner' + i, x, 132, Object.assign({}, LOOKS.prisoner, { hairC: ['#3a2a1a', '#5a3a22', '#2b1d14', '#6a5a4a'][i], robe: ['#6a5a4a', '#5a4a3a', '#7a6a5a', '#5a5048'][i] }), {
        dir: 1, faces: false, pose: { sit: true, chained: true }, label: 'Talk',
        async interact() {
          const st = caveStage();
          const lines = st === 'done' || st === 'return'
            ? ['Go away! You went up there and came back half-blind. Proof that it\'s dangerous!', 'A "Sun"? A "real horse"? Ha! Sit down and watch the *actual* horse on the wall.', 'If anyone tries to drag *me* up there, I\'ll fight them!', '…Was it really brighter up there? No. No, don\'t tell me.']
            : ['Turn around? Why would I? Everything real is right there on the wall.', 'Shh! The jar is coming. I\'ve memorized the order. I\'m the best at this.', 'You\'re blocking the horse! Sit down!', 'Behind us? There\'s nothing behind us. There\'s only the wall.'];
          await say({ name: 'Prisoner', look: this.look, voice: 180 + i * 30 }, lines[i]);
        },
      }));
    });
    // puppeteers (moving)
    for (let i = 0; i < 3; i++) {
      const p = this.puppets[i];
      ents.push(npc('puppeteer' + i, 0, 186, LOOKS.puppeteer, {
        solid: false, dir: 3, faces: false, noBob: true, label: 'Talk to the puppeteer', p,
        update(dt, t) {
          if (G.busy && this._talking) return;
          this.x = ((t * p.speed + p.off) % 570) - 45;
          p.x = this.x; this.walkStep = Math.floor(t * 6) % 4;
          if (this.x < -40) p.type = CUTOUTS[(Math.floor(t / 7) + i) % CUTOUTS.length];
        },
        draw(g, t) {
          drawPerson(g, this.x, this.y, this.look, 3, this.walkStep, {});
          R(g, '#5a3a1a', this.x, this.y - 30, 1, 14);
          silhouette(g, p.type, this.x, this.y - 28, 1, '#a07a4a');
        },
        enabled: () => caveStage() !== 'chained',
        async interact() {
          this._talking = true;
          const L = ['Shh! Back to your seat! We just… carry things back and forth. Don\'t think about it.', 'You saw the shadows? That\'s *my* horse. Nice, isn\'t it? Painted it myself.', 'Who are we? Doesn\'t matter. Plato never says. Maybe the people who decide what everyone else sees.'];
          await say('puppeteer', L[i]);
          if (i === 2) await say('owl', 'Hoo. Today you might think of advertisers, propaganda, or a social media feed: someone else choosing the shadows you watch.');
          this._talking = false;
        },
      }));
    }
    ents.push(thing('cutouts', 96, 182, (g) => { R(g, '#5a3a1a', 88, 176, 18, 6); silhouette(g, 'horse', 92, 178, 1, '#a07a4a'); silhouette(g, 'tree', 102, 178, 1, '#8a6a3a'); }, {
      label: 'Examine cutouts', enabled: () => caveStage() !== 'chained',
      async interact() {
        await say(null, 'A pile of spare wooden cutouts: a horse, a tree, a jar, a bird. Flat. Crude. Painted on one side only.');
        await say(null, 'These are what made your whole world on the wall. The "real" horse was a *shadow of a copy*.');
      },
    }));
    ents.push(thing('fire', 240, 226, null, {
      r: 28, ph: 26, label: 'Look at the fire', enabled: () => caveStage() !== 'chained',
      async interact() {
        flash('#ffb060', 0.6); SFX.whoosh();
        await say(null, 'The fire is real, or at least *more* real than the shadows. But it stings your eyes. After a lifetime in the dark, even firelight hurts.');
        await say('owl', 'Plato says learning is often uncomfortable at first. The truth can feel like an attack on everything you\'re used to.');
      },
    }));
    return ents;
  },
  onEnter(first) {
    this.view = 'in';
    const st = caveStage();
    if (st === 'outside') caveStage('free');
    if (caveStage() === 'chained') {
      player.x = 240; player.y = 132; player.dir = 1; player.frozen = true; player.pose = { sit: true, chained: true };
      owl.perch = [214, 116]; owl.x = 214; owl.y = 116;
    }
    if (caveStage() === 'done') AudioSys.setMuffle(3500, 0.5);
    else if (caveStage() !== 'chained') AudioSys.setMuffle(2200, 0.5);
  },
  async afterEnter() {
    if (caveStage() === 'chained') await chainedScene();
  },
  hint() {
    const st = caveStage();
    if (this.view === 'out') {
      if (!flag('cv_plato1')) return 'Talk to *Plato*. He knows how to get used to the light.';
      if (!flag('cv_pond') || !flag('cv_horse')) return 'Start gently: the *reflections in the pond*, then the *real horse*.';
      if (!flag('cv_sun')) return 'Your eyes are ready. Walk to the *hilltop* and look at the *Sun*.';
      if (!flag('cv_forms')) return 'Talk to *Plato* again. He has something to show you in the sand.';
      return st === 'done' ? 'You can go back into the cave and on to the Stoa (right side, inside).' : 'Go back *down* into the cave (the dark opening on the left). Tell the others what you saw.';
    }
    if (st === 'free') return 'Look around: the *puppeteers*, the *cutouts*, the fire. Then take the *tunnel* in the bottom-right corner toward the light.';
    if (st === 'done') return 'The path to *the Stoa* is open on the right side of the cave.';
    return 'Struggle against your chains!';
  },
};

async function caveSwitch(view, x, y) {
  G.busy++;
  try {
    SFX.whoosh();
    G.fadeTo = 1; await waitFade();
    const Rm = Rooms.cave;
    Rm.view = view;
    Rm.ents = Rm.build(); Rm.bgc = prerender(Rm);
    player.x = x; player.y = y; player.dir = view === 'out' ? 3 : 2;
    owl.x = x - 12; owl.y = y; owl.perch = null;
    if (view === 'out') {
      AudioSys.setScene('caveOut'); AudioSys.setMuffle(18000, 3);
      G.flashColor = '#ffffff'; G.flash = 1.6; G.flashDecay = flag('cv_sun') ? 1.5 : 0.28;
    } else {
      AudioSys.setScene('cave');
      if (caveStage() === 'done') AudioSys.setMuffle(3500, 1);
      else { AudioSys.setMuffle(700, 1.5); caveStage('return'); Rm.returnT = G.t; }
    }
    G.fadeTo = 0; await waitFade();
  } finally { G.busy--; }
  if (view === 'out' && !flag('cv_out')) {
    flag('cv_out', 1);
    script(async () => {
      await narrate('LIGHT! Everything is blinding white. You can\'t see a thing!');
      await wait(2.5);
      await narrate('Slowly… colors. Shapes. Your eyes are adjusting.');
      G.flashDecay = 1.5;
      await say('plato', 'Easy, friend! Don\'t try to look at the Sun yet. You\'d only be blinded again. Come here, talk to me.');
    });
  }
  if (view === 'in' && caveStage() === 'return') script(returnScene);
}

async function chainedScene() {
  await wait(0.5);
  await narrate('Darkness. Cold stone. Chains on your wrists and ankles. You\'ve been here your *whole life*. At least, that\'s how it feels.');
  await narrate('All you have ever seen are shapes moving on the wall in front of you. Every sound seems to come *from* the wall: muffled, echoing.');
  await say({ name: 'Prisoner', look: LOOKS.prisoner, voice: 190 }, 'Look, the *horse* again! I called it first!');
  await say({ name: 'Prisoner', look: Object.assign({}, LOOKS.prisoner, { hairC: '#5a3a22' }), voice: 230 }, 'And next comes the *bird*, then the *jar*. I\'m the best at predicting. Everyone honors me for it.');
  const c = await ask({ name: 'Prisoner', look: LOOKS.prisoner, voice: 190 }, 'Your turn, newcomer. What\'s the *realest* thing in the world?', ['The shapes on the wall, obviously.', 'Maybe there\'s something behind us?']);
  if (c === 0) await say({ name: 'Prisoner', look: LOOKS.prisoner, voice: 190 }, 'Exactly! What else *could* there be?');
  else await say({ name: 'Prisoner', look: LOOKS.prisoner, voice: 190 }, 'Behind us?! Ha! There\'s nothing behind us. Don\'t talk nonsense.');
  await narrate('But something itches at you. Why do the shapes always come from the same direction? What is *behind* you?');
  // struggle
  let prog = 0;
  const end = setActivity({
    ui() {
      panel(160, 20, 160, 36);
      text('Press E again and again to struggle!', 240, 24, { size: 12, align: 'center', color: UIC.hl });
      ctx.fillStyle = '#1a1020'; ctx.fillRect(170, 40, 140, 8);
      ctx.fillStyle = '#e67e22'; ctx.fillRect(170, 40, 140 * prog / 10, 8);
    },
  });
  while (prog < 10) {
    await nextFrame();
    if (hit('act')) { prog++; SFX.chain(); shake(0.12); player.pose = { sit: true, chained: true, bob: -1 }; setTimeout(() => player.pose.bob = 0, 80); }
  }
  end();
  SFX.snap(); shake(0.5);
  caveStage('free');
  player.pose = {}; player.y = 140; player.dir = 0;
  await wait(0.3);
  flash('#ffa050', 1.4); G.flashDecay = 0.6;
  AudioSys.setMuffle(2200, 2.5);
  SFX.whoosh();
  await narrate('The chains snap! You stand, turn around, and…');
  await narrate('A *FIRE*! It burns your eyes. Between you and the fire, people walk behind a low wall, carrying *wooden cutouts* above their heads.');
  await narrate('The horse. The bird. The jar. They were never real. They were *shadows of puppets*. The sounds were just echoes.');
  owl.perch = null;
  await say('owl', 'Hoo… Look around. Talk to the puppeteers. And notice the *tunnel* in the bottom-right corner, leading *up*.');
  player.frozen = false;
}

async function returnScene() {
  await narrate('Back in the dark. After the sunlight, you\'re nearly blind down here. You stumble over a rock.');
  SFX.thud(); shake(0.2);
  await say({ name: 'Prisoner', look: LOOKS.prisoner, voice: 190 }, 'Ha! Look at him. He went up there and came back with *ruined eyes*. He can\'t even see the shadows anymore!');
  await say('you', 'Listen! The shadows aren\'t real. There\'s a whole world up there, and a Sun, and real horses…');
  await say({ name: 'Prisoner', look: Object.assign({}, LOOKS.prisoner, { hairC: '#5a3a22' }), voice: 230 }, 'Madness! Nobody else go up there! And if anyone tries to drag *us* up… we\'ll kill them.');
  await say('owl', 'Plato wrote that line on purpose. He was thinking of his teacher *Socrates*, who was executed by Athens for trying to make people see.');
  await say('owl', 'Plato said true education isn\'t pouring knowledge into empty heads. It\'s *turning the whole soul around*, from shadows toward the light. Nobody can do the climbing for you.');
  AudioSys.setMuffle(3500, 3);
  caveStage('done');
  redrawRoom();
  const st = G.room.ents.find(e => e.id === 'stoa'); if (st) st.hidden = false;
  await giveInsight('forms');
  await say('owl', 'A passage has opened on the *right side* of the cave, toward the Stoa. And the other road from the Agora is open now too!');
}

// ---------------- outside the cave
function caveOutsideBg(g) {
  vgrad(g, 0, 0, W, 100, '#7ec8f0', '#d8f0ff', 10);
  disc(g, 430, 30, 20, '#fff8d0'); disc(g, 430, 30, 15, '#ffffff');
  for (let x = 0; x < W; x++) { const h = 80 + Math.sin(x * 0.02) * 8; R(g, '#8ac06a', x, h, 1, 100 - h); }
  tex(g, 0, 96, W, H - 96, '#6ab04a', ['#5aa03a', '#7ac05a', '#8ad06a', '#4f9034'], 0.14, 41);
  // hillside with cave mouth
  for (let y = 96; y < H; y++) { const w = 40 + Math.sin(y * 0.05) * 6; R(g, '#7a6a5a', 0, y, w, 1); }
  ellipse(g, 20, 172, 14, 18, '#1a1410');
  // pond
  ellipse(g, 122, 206, 32, 12, '#3a7aa0'); ellipse(g, 122, 205, 29, 9, '#6ab0d8');
  // hilltop path to look at the sun
  ellipse(g, 410, 116, 34, 14, '#5a9a3a'); ellipse(g, 410, 113, 30, 11, '#7ab85a'); ellipse(g, 410, 111, 20, 6, '#9ad07a');
  for (let i = 0; i < 5; i++) R(g, '#f7c948', 396 + i * 7, 108 + (i % 2) * 4, 1, 1);
  // trees
  drawTree(g, 200, 130, { leaf: '#3a9a3a', size: 1.2 }); drawTree(g, 330, 220, { leaf: '#4aaa3a' }); drawTree(g, 460, 240, { leaf: '#3a9a3a', size: 1.1 });
  const r = mulberry(9);
  for (let i = 0; i < 80; i++) R(g, pick2(r, ['#f7c948', '#ffffff', '#e74c3c', '#c39bd3', '#5dade2']), r() * W, 100 + r() * 170, 1, 1);
  // sand drawing area
  tex(g, 262, 168, 70, 30, '#e0cc98', ['#d0bc88', '#ecd8a8'], 0.3, 43);
  for (const [x, y, rr] of [[276, 182, 6], [296, 183, 7], [316, 181, 6]]) for (let a = 0; a < 40; a++) { const an = a / 40 * 6.28; const w = rr + Math.sin(an * 3 + x) * 1.4; R(g, '#8a6a3a', x + Math.cos(an) * w, y + Math.sin(an) * w * 0.8); }
}
function caveOutsideUnder(g, t) {
  // reflections
  g.save(); g.beginPath(); g.ellipse(122, 205, 28, 8, 0, 0, 7); g.clip();
  g.globalAlpha = 0.5; drawTree(g, 122, 196, { leaf: '#2a7a2a', size: 0.6 }); g.globalAlpha = 1; g.restore();
  // birds
  for (let i = 0; i < 3; i++) { const bx = (t * 30 + i * 160) % 520 - 20, by = 40 + i * 12 + Math.sin(t * 2 + i) * 4; const w = Math.floor(t * 8 + i) % 2; R(g, '#2a2a2a', bx, by, 2, 1); R(g, '#2a2a2a', bx - 2, by - w, 2, 1); R(g, '#2a2a2a', bx + 2, by - w, 2, 1); }
  // sun rays
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t * 0.2; line(g, 430 + Math.cos(a) * 24, 30 + Math.sin(a) * 24, 430 + Math.cos(a) * 34, 30 + Math.sin(a) * 34, 'rgba(255,240,180,0.8)'); }
}
function caveOutsideEnts() {
  return [
    Object.assign(door('back', [6, 156, 22, 28], null, 0, 0, { arrow: 'left', sign: 'Back into the cave', signPos: [50, 140] }), {
      locked: () => !flag('cv_forms') && caveStage() !== 'done',
      lockedMsg: 'Plato: "Not yet! Learn to see in the light first."',
      onUse: () => caveSwitch('in', 436, 250),
    }),
    npc('plato', 300, 166, LOOKS.plato, {
      dir: 2, mark: () => (!flag('cv_plato1') || (flag('cv_sun') && !flag('cv_forms'))) ? '!' : null,
      interact: platoTalk,
    }),
    thing('pond', 122, 196, null, {
      r: 30, ph: 14, label: 'Look at the reflections',
      async interact() {
        SFX.splash(); flag('cv_pond', 1);
        await say(null, 'In the still water: reflections of trees and clouds. Upside down, but in *color*, in *daylight*.');
        await say('plato', 'Good. First reflections, then the things themselves. The eyes, like the mind, must be led *step by step*.');
      },
    }),
    thing('horse', 400, 200, (g, t) => {
      const x = 400, y = 200, h = Math.floor(t * 0.7) % 3 === 0 ? 2 : 0;
      R(g, 'rgba(0,0,0,0.2)', x - 10, y - 1, 22, 3);
      R(g, '#8b5a2b', x - 9, y - 14, 18, 8); R(g, '#a0703a', x - 9, y - 14, 18, 2);
      R(g, '#8b5a2b', x + 6, y - 20 + h, 4, 8); R(g, '#8b5a2b', x + 8, y - 21 + h, 6, 4); R(g, '#111', x + 11, y - 20 + h, 1, 1); R(g, '#3a2a1a', x + 6, y - 22 + h, 2, 8);
      for (const lx of [-8, -5, 4, 7]) R(g, '#6b4a2b', x + lx, y - 6, 2, 6);
      R(g, '#3a2a1a', x - 12, y - 14, 3, 7 + Math.round(Math.sin(t * 3)));
    }, {
      r: 24, ph: 26, label: 'Approach the horse', solid: true, box: [-10, -4, 22, 4],
      async interact() {
        AudioSys.play('sine', 700, { hz: true, wave: 'sawtooth', to: 350, dur: 0.6, vol: 0.05 }); flag('cv_horse', 1);
        await say(null, 'A *real horse*! Warm, breathing, smelling of grass. It snorts and nudges your hand.');
        await say(null, 'The thing on the wall was a flat grey shadow… of a wooden copy… of *this*.');
      },
    }),
    thing('sun', 410, 112, null, {
      r: 30, ph: 16, label: 'Look up at the Sun',
      async interact() {
        if (!flag('cv_pond') || !flag('cv_horse')) {
          flash('#ffffff', 1.2); SFX.boing();
          await say(null, 'AAH! Too bright! Your eyes aren\'t ready. Start gently: the *reflections in the pond*, then the *real things*.');
          return;
        }
        flag('cv_sun', 1);
        G.flashColor = '#fffbe0'; G.flash = 2.2; G.flashDecay = 0.5;
        [60, 64, 67, 71, 74, 79].forEach((n, i) => AudioSys.play('pad', n, { vol: 0.04, dur: 6, wave: 'triangle', lp: 3000 }, i * 0.15));
        await say(null, 'Slowly, you lift your eyes… to the *Sun*.');
        await say(null, 'It lights up everything. It makes the grass grow and the seasons turn. Without it, you couldn\'t see *anything*, not even the shadows below.');
        await say('plato', 'Yes! For me the Sun stands for the *Form of the Good*: the highest reality, the source of all truth and value. Come here. Let me explain.');
      },
    }),
  ];
}
async function platoTalk() {
  if (!flag('cv_plato1')) {
    flag('cv_plato1', 1);
    await say('plato', 'Welcome to the upper world! I\'m Plato. I\'m the one who imagined this cave. It\'s an *allegory*: a story where everything stands for something else.');
    await say('plato', 'The cave is the world of our *senses*. The shadows are the opinions and appearances we accept without questioning.');
    await say('plato', 'Your eyes need time. First look at *reflections* in the pond. Then the *real things*: that horse there. Only then, the *Sun* from the hilltop.');
    return;
  }
  if (!flag('cv_sun')) { await say('plato', 'Reflections first, then things, then the Sun. Step by step, like learning mathematics!'); return; }
  if (!flag('cv_forms')) {
    await say('plato', 'Now. Look at these circles someone drew in the sand.');
    let stage = 0;
    showVignette((v, t) => {
      R(v, '#e0cc98', 0, 0, 160, 90);
      const cs = [[30, 45, 14, 0], [80, 45, 15, 1], [130, 45, 13, 2]];
      for (const [x, y, r, i] of cs) {
        if (stage >= 2) v.globalAlpha = 0.3;
        for (let a = 0; a < 60; a++) { const an = a / 60 * 6.28; const w = r + Math.sin(an * (3 + i) + i) * 2 + Math.sin(an * 7) * 0.8; R(v, '#6a4a2a', x + Math.cos(an) * w, y + Math.sin(an) * w); }
        v.globalAlpha = 1;
      }
      if (stage >= 2) { ring(v, 80, 45, 26, '#fff', 1); ring(v, 80, 45, 27, `rgba(255,240,150,${0.5 + 0.4 * Math.sin(t * 4)})`, 1); drawSpark(v, 80, 14, t); }
    }, { title: 'Circles in the sand' });
    // wobbly, out-of-tune circles
    for (let i = 0; i < 3; i++) { AudioSys.play('sine', 440 * (1 + (i - 1) * 0.03), { hz: true, dur: 1.2, vol: 0.07 }, i * 0.5); AudioSys.play('sine', 447 + i * 5, { hz: true, dur: 1.2, vol: 0.05 }, i * 0.5); }
    await say('plato', 'Each one is a bit wobbly. Listen: each sounds slightly *off*. No circle anyone has ever drawn is perfect.');
    await say('plato', 'Yet you *know* they\'re imperfect. Compared to *what*? You\'ve never seen a perfect circle with your eyes.');
    stage = 2;
    AudioSys.play('sine', 440, { hz: true, dur: 4, vol: 0.12, a: 0.3 }); AudioSys.play('sine', 880, { hz: true, dur: 4, vol: 0.04, a: 0.3 });
    await say('plato', 'You compare them to *the Circle itself*, the *Form* of Circle. Perfect, eternal, unchanging. Not seen with the eyes, but grasped by the *mind*.');
    await say('plato', 'It\'s the same with horses. Big ones, small ones, spotted ones all share one Form: *Horseness*. And with Beauty, and Justice. Socrates was searching for the *Form of Justice*!');
    hideVignette();
    await say('plato', 'My student Aristotle will say I\'ve got it backwards, that forms live *inside* real things, not in some other realm. Students! Always arguing.');
    flag('cv_forms', 1);
    await say('plato', 'And now the hardest part. Go back *down* into the cave and tell the others what you\'ve seen. The opening is on the left.');
    return;
  }
  await say('plato', 'Remember: what you see with your eyes changes and decays. What you grasp with reason, like the Forms and mathematics, lasts forever. Or so I believe!');
}
