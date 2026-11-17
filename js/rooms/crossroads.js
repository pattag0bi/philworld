'use strict';
// ============================================================
// ROOM: The Crossroads (hub) — Philosophy begins in wonder
// ============================================================
Rooms.crossroads = {
  name: 'The Crossroads', sub: 'Where every journey begins', scene: 'crossroads',
  spawn: [240, 196],
  walls: [[0, 0, 226, 62], [254, 0, 226, 62], [72, 206, 58, 16], [358, 212, 26, 10], [236, 137, 8, 4],
    [58, 86, 6, 4], [138, 80, 6, 4], [328, 84, 6, 4], [418, 92, 6, 4], [28, 238, 6, 4], [448, 240, 6, 4]],
  surface(x, y) { return (y > 146 && y < 172) || (x > 228 && x < 252 && y < 150) ? 'dirt' : 'grass'; },
  bg(g) {
    vgrad(g, 0, 0, W, 62, '#5b3f8a', '#f6b26b', 14);
    disc(g, 380, 50, 14, '#ffd39a'); disc(g, 380, 50, 10, '#ffe7c2');
    for (let x = 0; x < W; x++) { const h = 44 + Math.sin(x * 0.03) * 6 + Math.sin(x * 0.011 + 1) * 6; R(g, '#8a5a8a', x, h, 1, 62 - h); }
    for (let x = 0; x < W; x++) { const h = 52 + Math.sin(x * 0.05 + 2) * 4; R(g, '#6a4a7a', x, h, 1, 62 - h); }
    tex(g, 0, 60, W, H - 60, '#6a9a4a', ['#5a8a3a', '#7aaa5a', '#4f7f34', '#8ab86a'], 0.12, 11);
    // roads
    tex(g, 0, 148, W, 22, '#c9a66b', ['#b8955a', '#d8b67a', '#a8854a'], 0.25, 12);
    tex(g, 230, 60, 20, 90, '#c9a66b', ['#b8955a', '#d8b67a', '#a8854a'], 0.25, 13);
    R(g, '#a8854a', 0, 148, W, 1); R(g, '#a8854a', 0, 169, W, 1);
    // north arch (café)
    R(g, '#7a7a8a', 222, 20, 36, 42); R(g, '#9a9aa8', 224, 20, 32, 40);
    R(g, '#2a1a2a', 230, 30, 20, 32); R(g, '#5a3a3a', 230, 30, 20, 2);
    R(g, '#6a6a7a', 220, 16, 40, 5); R(g, '#b8b8c4', 220, 16, 40, 1);
    // west mini temple gate
    for (const y of [146, 182]) { drawColumn(g, 4, y, 26, '#e8e0cc'); drawColumn(g, 22, y, 26, '#e8e0cc'); }
    R(g, '#d8d0bc', 0, 112, 34, 5); R(g, '#c8c0ac', 2, 108, 30, 4); R(g, '#b8b0a0', 8, 104, 18, 4);
    // east moon gate
    R(g, '#8b1e2b', 452, 110, 28, 76);
    for (let dy = -18; dy <= 18; dy++) { const w = Math.floor(Math.sqrt(324 - dy * dy)); R(g, '#c9a66b', 466 - w, 159 + dy, w * 2 + 1, 1); }
    R(g, '#3a3a3a', 448, 104, 34, 6); R(g, '#5a5a5a', 446, 102, 36, 3);
    R(g, '#c9a24a', 452, 188, 28, 2);
    // pond
    ellipse(g, 100, 214, 34, 14, '#3a6a8a'); ellipse(g, 100, 213, 31, 11, '#4a8ab0'); R(g, '#9ad0f0', 84, 208, 10, 1); R(g, '#9ad0f0', 106, 216, 8, 1);
    for (let i = 0; i < 9; i++) R(g, '#4a7a3a', 70 + i * 7, 200 + (i % 3), 1, 4);
    // thinker statue
    R(g, '#6a6a72', 356, 206, 30, 16); R(g, '#8a8a92', 356, 206, 30, 2); R(g, '#5a5a62', 356, 220, 30, 2);
    R(g, '#9aa0a8', 364, 186, 12, 20); R(g, '#b0b6be', 365, 180, 8, 8); R(g, '#9aa0a8', 362, 190, 4, 8);
    R(g, '#b0b6be', 366, 188, 4, 6); R(g, '#8a9098', 364, 198, 14, 6); R(g, '#7a8088', 374, 200, 4, 6);
    // trees, bushes, flowers
    drawTree(g, 60, 90, { leaf: '#4a7a3a', size: 1.1 }); drawTree(g, 140, 84, { leaf: '#5a8a3a' }); drawTree(g, 330, 88, { leaf: '#4a7a3a' });
    drawTree(g, 420, 96, { leaf: '#5a8a3a', size: 1.2 }); drawTree(g, 30, 242, { leaf: '#4a7a3a' }); drawTree(g, 450, 244, { leaf: '#5a8a3a', size: 1.1 });
    drawBush(g, 180, 110, '#4a8a3a', '#f7c948'); drawBush(g, 300, 120, '#4a8a3a', '#e74c3c'); drawBush(g, 200, 240, '#4a8a3a', '#f39c12'); drawBush(g, 290, 250, '#4a8a3a', '#9b59b6');
    const r = mulberry(5);
    for (let i = 0; i < 60; i++) { const x = r() * W, y = 70 + r() * 200; if (y > 145 && y < 172) continue; R(g, pick2(r, ['#f7c948', '#ffffff', '#e74c3c', '#c39bd3']), x, y, 1, 1); }
    // signpost
    R(g, '#6b4a2b', 239, 112, 3, 28);
    R(g, '#a0703a', 222, 116, 18, 6); R(g, '#a0703a', 202, 117, 6, 4); // west arm
    R(g, '#a0703a', 241, 124, 18, 6); R(g, '#a0703a', 259, 125, 4, 4); // east arm
    R(g, '#a0703a', 236, 104, 9, 8); // north
    R(g, '#5a3a1a', 226, 118, 12, 1); R(g, '#5a3a1a', 244, 126, 12, 1); R(g, '#5a3a1a', 238, 107, 5, 1);
  },
  under(g, t) {
    // reflection in the pond
    if (Math.abs(player.x - 100) < 28 && player.y > 186 && player.y < 206 && !player.hidden) {
      g.save(); g.globalAlpha = 0.45;
      g.beginPath(); g.ellipse(100, 213, 30, 10, 0, 0, 7); g.clip();
      g.translate(0, 2 * (player.y + 1)); g.scale(1, -1);
      drawPerson(g, player.x + Math.round(Math.sin(t * 3) * 0.6), player.y, playerLook(), player.dir, 0, { noShadow: true });
      g.restore();
    }
    // ripples
    const k = (t * 0.6) % 1;
    g.fillStyle = `rgba(200,235,255,${0.4 * (1 - k)})`;
    ring(g, 112, 214, Math.round(2 + k * 8), `rgba(200,235,255,${0.35 * (1 - k)})`);
    // café door glow
    if (flag('cafeOpen')) { g.fillStyle = `rgba(255,190,90,${0.35 + 0.15 * Math.sin(t * 3)})`; g.fillRect(230, 32, 20, 30); }
    // fireflies
    for (let i = 0; i < 8; i++) {
      const fx = 60 + ((i * 97) % 380) + Math.sin(t * 0.7 + i) * 12, fy = 90 + ((i * 53) % 150) + Math.cos(t * 0.9 + i * 2) * 8;
      const a = (Math.sin(t * 2 + i * 1.7) + 1) / 2;
      g.fillStyle = `rgba(255,240,140,${a * 0.9})`; g.fillRect(Math.round(fx), Math.round(fy), 1, 1);
    }
  },
  build() {
    const ents = [
      door('west', [0, 146, 6, 26], 'agora', 456, 200, { arrow: 'left', sign: 'West: Ancient Greece', signPos: [52, 136], locked: () => !hasInsight('wonder'), lockedMsg: 'Glaux: "Hoo! Look at the *thinking statue* first (south-east)."' }),
      door('east', [474, 146, 6, 26], 'courtyard', 22, 196, { arrow: 'right', sign: 'East: China & India', signPos: [424, 136], locked: () => !hasInsight('wonder'), lockedMsg: 'Glaux: "Hoo! Look at the *thinking statue* first (south-east)."' }),
      door('north', [228, 52, 24, 10], 'cafe', 240, 250, { arrow: 'up', sign: 'Paris, 1940s', signPos: [240, 6], locked: () => !flag('cafeOpen'), lockedMsg: 'A door that smells of coffee and rain. It opens once you finish *either* the West road or the East road.' }),
      thing('sign', 240, 140, null, {
        r: 22, ph: 34, label: 'Read signpost',
        async interact() {
          await say(null, '*West*: Ancient Greece. Socrates, Plato, Aristotle, the Stoics… and onward to Nietzsche.\nThe West often asks: *What is real? What can I know?*');
          await say(null, '*East*: China and India. Confucius, Laozi, the Buddha.\nThe East often asks: *How do I live in harmony, with others and with the world?*');
          await say(null, '*North*: the Existentialist Café, Paris. Both roads end there, in the 20th century.');
          await say('owl', 'Of course, those are rough generalizations. Every tradition asks *all* the big questions. That\'s what makes comparing them fun!');
        },
      }),
      thing('pond', 100, 206, null, {
        r: 30, ph: 10, label: 'Look into the pond',
        async interact() {
          SFX.splash();
          await say(null, 'Your reflection looks back at you, rippling.');
          await say(null, 'Carved above the Temple of Apollo at Delphi were two words: *"Know thyself."*');
          const c = await ask(null, 'So… who is the "you" looking back?', ['My body.', 'My mind and memories.', 'I… honestly don\'t know.']);
          if (c === 0) await say('owl', 'Your body replaces most of its cells over the years. Are you a *new* you? Hoo! Hold that puzzle. The Buddha has thoughts about it, out East.');
          if (c === 1) await say('owl', 'Many agree! But memories fade and change. Hold that puzzle. The Buddha has a surprising answer, out East.');
          if (c === 2) await say('owl', 'Ha! Socrates would love you. Admitting you don\'t know is where philosophy starts.');
        },
      }),
      thing('thinker', 370, 214, null, {
        r: 26, ph: 36, label: 'Study the statue',
        mark: () => hasInsight('wonder') ? null : (flag('owlMet') ? '!' : null),
        interact: () => thinkerScene(),
      }),
    ];
    return ents;
  },
  onEnter(first) {
    if (!flag('owlMet')) { owl.hidden = false; owl.perch = [248, 112]; owl.x = 248; owl.y = 112; }
  },
  async afterEnter(first) {
    if (flag('owlMet')) return;
    await wait(0.6);
    await narrate('You wake at a crossroads. The sun is setting. You don\'t quite remember how you got here…');
    SFX.hoot(); await wait(0.5);
    await say('owl', `Hoo! A new traveler! Welcome, *${G.state.name}*.`);
    owl.perch = [player.x + 16, player.y - 8];
    await wait(0.6);
    await say('owl', 'I\'m *Glaux*, an owl of Athena, the Greek goddess of wisdom. Owls have been a symbol of philosophy for over 2,000 years.');
    await say('owl', 'A philosopher named Hegel wrote that "the owl of Minerva spreads its wings only with the falling of dusk." Wisdom often arrives *after* the day is done, when we look back.');
    await say('owl', 'Fitting, isn\'t it? Look at that sunset.');
    const c = await ask('owl', 'Tell me: have you ever wondered *why there is something rather than nothing?*', ['All the time!', 'Uh… no?', 'Is this a test?']);
    if (c === 0) await say('owl', 'Then you\'re already a philosopher. Hoo hoo!');
    if (c === 1) await say('owl', 'Well, you just did! See? It\'s contagious.');
    if (c === 2) { SFX.boing(); await say('owl', 'No tests here! You *can\'t fail* in PhilWorld. You can only wonder.'); }
    await say('owl', 'This world is made of *rooms*. Each holds one big idea. Talk to people and *touch things*, and the ideas will show themselves. You\'ll *hear* them too, so keep your ears open.');
    await say('owl', 'Arrows or WASD to walk. *E* to interact. *M* opens the roadmap of ideas, *J* your journal, *H* asks me for a hint, *N* toggles sound.');
    await say('owl', 'Before you choose a road, look at that *statue of a thinker* by the path. It\'s pondering the five biggest questions of all.');
    flag('owlMet', 1);
    owl.perch = null;
  },
  hint() {
    if (!hasInsight('wonder')) return 'The *thinking statue* to the south-east! Press E next to it.';
    if (!G.state.visited.includes('agora') && !G.state.visited.includes('courtyard')) return 'Two roads: *West* to Ancient Greece, *East* to China and India. You can do both, in any order!';
    if (flag('cafeOpen') && !G.state.visited.includes('cafe')) return 'The *north door* is open now. The Existentialist Café awaits!';
    const w = hasInsight('amorfati'), e = hasInsight('middleway');
    if (w && !e) return 'You\'ve walked the West. The *East* road holds Confucius, Laozi and the Buddha.';
    if (e && !w) return 'You\'ve walked the East. The *West* road holds Socrates, Plato, Aristotle and more.';
    return 'Press *M* to see the roadmap. Golden stars are ideas you\'ve truly understood.';
  },
};
function pick2(r, a) { return a[Math.floor(r() * a.length)]; }

async function thinkerScene() {
  const Q = [
    { b: 'Metaphysics', q: 'What is *REAL*?', note: 'Is the world just atoms? Do minds exist? What is time?', n: 60, draw(v, t) { // tree & its shadow & a dream bubble
      R(v, '#1a2a3a', 0, 0, 160, 90); for (let i = 0; i < 30; i++) R(v, '#fff', (i * 53) % 160, (i * 31) % 50, 1, 1);
      drawTree(v, 60, 70, { leaf: '#5a8a3a' }); R(v, 'rgba(0,0,0,0.5)', 60, 70, 40, 4);
      disc(v, 120, 30, 16, '#d8c8f0'); disc(v, 104, 50, 3, '#d8c8f0'); disc(v, 98, 58, 2, '#d8c8f0'); drawTree(v, 120, 42, { leaf: '#9a7ad0', size: 0.6 });
      qmark(v, 116, 8 + Math.sin(t * 3) * 2, '#f7c948');
    } },
    { b: 'Epistemology', q: 'How do I *KNOW*?', note: 'Can I trust my senses? What counts as proof? Could I be dreaming?', n: 64, draw(v, t) {
      R(v, '#2a2440', 0, 0, 160, 90);
      ellipse(v, 70, 45, 30, 16, '#f5f5f5'); disc(v, 70 + Math.sin(t * 2) * 8, 45, 9, '#3a6ea5'); disc(v, 70 + Math.sin(t * 2) * 8, 45, 4, '#111');
      ring(v, 118, 40, 12, '#c9a24a', 2); line(v, 126, 50, 140, 66, '#8b5a2b'); line(v, 127, 50, 141, 66, '#8b5a2b');
    } },
    { b: 'Ethics', q: 'What *SHOULD* I do?', note: 'What makes an action right? What is a good life? What do we owe each other?', n: 67, draw(v, t) {
      R(v, '#2a3a2a', 0, 0, 160, 90); R(v, '#c9a66b', 74, 50, 12, 40); for (let i = 0; i < 40; i++) { R(v, '#c9a66b', 80 - i * 1.6, 50 - i, 8, 1); R(v, '#c9a66b', 76 + i * 1.6, 50 - i, 8, 1); }
      drawPerson(v, 80, 76, playerLook(), 1, 0, {}); qmark(v, 77, 24 + Math.sin(t * 3) * 2, '#f7c948');
    } },
    { b: 'Logic', q: 'What makes reasoning *GOOD*?', note: 'When does one idea really follow from another? How do we spot bad arguments?', n: 71, draw(v, t) {
      R(v, '#1a2a40', 0, 0, 160, 90);
      const k = Math.floor(t * 1.5) % 4;
      [['A', 30], ['B', 80], ['C', 130]].forEach(([s, x], i) => { R(v, i < k ? '#f7c948' : '#5a6a8a', x - 12, 33, 24, 24); R(v, '#1a2a40', x - 4, 41, 8, 8); });
      R(v, '#e8d5a8', 44, 44, 22, 2); R(v, '#e8d5a8', 94, 44, 22, 2); R(v, '#e8d5a8', 64, 42, 2, 6); R(v, '#e8d5a8', 114, 42, 2, 6);
    } },
    { b: 'Aesthetics', q: 'What is *BEAUTY*?', note: 'Is beauty in the object or in the eye? Why does music move us?', n: 74, draw(v, t) {
      R(v, '#3a2a3a', 0, 0, 160, 90);
      R(v, '#8b5a2b', 18, 16, 56, 44); R(v, '#f5e8c8', 22, 20, 48, 36); disc(v, 46, 38, 8, '#e74c3c'); disc(v, 40, 34, 5, '#f39c12');
      for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * 1.26; disc(v, 116 + Math.cos(a) * 9, 40 + Math.sin(a) * 9, 5, '#f78fb3'); } disc(v, 116, 40, 4, '#f7c948'); R(v, '#27ae60', 115, 50, 2, 30);
    } },
  ];
  await say(null, 'A stone figure sits chin-on-hand, frozen mid-thought. As you look closer, its questions seem to float up into the air…');
  for (const it of Q) {
    showVignette(it.draw, { title: it.b });
    AudioSys.play('bell', it.n, { vol: 0.12, dur: 2.5 }); AudioSys.play('bell', it.n + 7, { vol: 0.06, dur: 2.5 }, 0.15);
    await say(null, `*${it.b}* asks: ${it.q}\n${it.note}`);
  }
  hideVignette();
  if (!hasInsight('wonder')) {
    await say('owl', 'Those five questions are the main *branches* of philosophy. "Philosophy" itself comes from Greek: *philo* (love) + *sophia* (wisdom).');
    await say('owl', 'Plato and Aristotle both said philosophy begins in *wonder*: being puzzled by things everyone else takes for granted.');
    await giveInsight('wonder');
    await say('owl', 'You earned your first *Insight*! Press *J* any time to reread it. Now the roads are open. *West* or *East*? Your choice!');
  }
}
