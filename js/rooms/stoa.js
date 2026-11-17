'use strict';
// ============================================================
// ROOM: The Painted Stoa — Stoicism: the dichotomy of control
// ============================================================
Rooms.stoa = {
  name: 'The Painted Stoa', sub: 'Athens & Rome, 300 BCE – 180 CE', scene: 'stoa',
  spawn: [24, 190], spawnDir: 3,
  walls: [[0, 0, 300, 84], [334, 0, 146, 84], [342, 84, 138, 120], [342, 216, 138, 60], [60, 196, 70, 30], [186, 136, 34, 6], [292, 106, 14, 8]],
  surface(x, y) { return x > 340 ? 'wood' : 'sand'; },
  bg(g) {
    vgrad(g, 0, 0, W, 72, '#85c1e9', '#d6eaf8', 8);
    R(g, '#3a8ac0', 334, 72, 146, 12); R(g, '#5aa0d0', 334, 72, 146, 1);
    for (let x = 380; x < 440; x++) { const h = 6 - Math.abs(x - 410) * 0.2; if (h > 0) R(g, '#7a9a8a', x, 72 - h, 1, h); }
    for (let i = 0; i < 3; i++) { disc(g, 360 + i * 40, 20 + (i % 2) * 8, 5, '#ffffff'); disc(g, 366 + i * 40, 22 + (i % 2) * 8, 4, '#f4f8fc'); }
    // painted colonnade
    R(g, '#8b1e2b', 0, 22, 300, 8); R(g, '#c9a24a', 0, 30, 300, 2);
    R(g, '#f0e4c8', 0, 32, 300, 52);
    const panels = [['#c0392b', '#2e86c1'], ['#27ae60', '#f39c12'], ['#8e44ad', '#e74c3c'], ['#2e86c1', '#f1c40f'], ['#d35400', '#16a085']];
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 58;
      R(g, '#3a2a1a', x, 38, 46, 34); R(g, panels[i][0], x + 2, 40, 42, 30);
      for (let k = 0; k < 4; k++) drawPerson(g, x + 8 + k * 10, 66, { skin: '#eab994', robe: panels[i][1], hairStyle: 'short', hairC: '#3a2a1a', hat: k % 2 ? 'helmet' : null }, k % 2 ? 2 : 3, k % 4, { noShadow: true });
    }
    for (let x = 0; x < 300; x += 58) drawColumn(g, x + 2, 86, 54, '#f4ecd8', { paint: '#c0392b' });
    R(g, '#e0d4b8', 300, 22, 34, 62);
    tex(g, 300, 30, 34, 54, '#b8b0a0', ['#a8a090', '#c8c0b0'], 0.2, 61);
    // path up toward the mountains
    tex(g, 302, 60, 30, 26, '#c8b898', ['#b8a888'], 0.3, 62);
    // ground
    tex(g, 0, 84, 342, H - 84, '#e0cc98', ['#d0bc88', '#ecd8a8', '#c8b080'], 0.14, 63);
    // sea
    vgrad(g, 342, 84, 138, H - 84, '#2e86c1', '#1b4f72', 8);
    // pier
    R(g, '#8b5a2b', 342, 204, 120, 12); for (let x = 342; x < 462; x += 8) R(g, '#6b4a2b', x, 204, 1, 12);
    R(g, '#5a3a1a', 360, 216, 3, 10); R(g, '#5a3a1a', 420, 216, 3, 10);
    // Marcus's tent
    R(g, '#8b1e2b', 60, 180, 70, 4); for (let i = 0; i < 18; i++) R(g, '#a83a3a', 62 + i, 184 + i, 66 - i * 2, 1);
    R(g, '#c0a070', 62, 196, 66, 30); R(g, '#a08050', 62, 196, 66, 2); R(g, '#3a2a1a', 88, 206, 14, 20);
    R(g, '#c9a24a', 94, 168, 2, 14); R(g, '#c0392b', 96, 168, 8, 5);
    // desk outside tent
    R(g, '#6b4a2b', 140, 220, 26, 6); R(g, '#5a3a1a', 142, 226, 2, 6); R(g, '#5a3a1a', 162, 226, 2, 6);
    // bench
    R(g, '#a89f91', 186, 134, 34, 5); R(g, '#8a8070', 188, 139, 3, 4); R(g, '#8a8070', 215, 139, 3, 4);
    // archery target
    R(g, '#8b5a2b', 297, 108, 2, 8); disc(g, 298, 102, 8, '#f5f5f5'); disc(g, 298, 102, 6, '#c0392b'); disc(g, 298, 102, 4, '#f5f5f5'); disc(g, 298, 102, 2, '#c0392b');
    R(g, '#8b5a2b', 210, 176, 10, 2);
  },
  under(g, t) {
    const st = this.storm || 0;
    for (let i = 0; i < 14; i++) {
      const y = 92 + i * 13, ph = t * (1 + st * 2) + i;
      for (let x = 346; x < W; x += 16) R(g, st > 0.3 ? '#cfd8dc' : '#85c1e9', x + Math.sin(ph + x * 0.1) * (3 + st * 4), y + Math.cos(ph) * st * 2, 6, 1);
    }
    // ship
    const sx = 440 + Math.sin(t * 0.2) * 20, sy = 150 + Math.sin(t * (1 + st * 3)) * (1 + st * 3);
    ICONS.ship(g, sx, sy);
  },
  over(g, t) {
    const st = this.storm || 0;
    if (st > 0) {
      g.fillStyle = `rgba(20,24,40,${0.5 * st})`; g.fillRect(0, 0, W, H);
      g.fillStyle = `rgba(200,210,230,${0.6 * st})`;
      for (let i = 0; i < 160 * st; i++) { const x = (i * 73 + t * 300) % W, y = (i * 131 + t * 520) % H; g.fillRect(Math.round(x), Math.round(y), 1, 4); }
      if (this.bolt && G.t - this.bolt < 0.15) { g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0, 0, W, H); }
    }
    if (this.calm > 0) {
      const r = 10 + this.calm * 7;
      g.fillStyle = `rgba(255,210,120,${0.12 + 0.05 * Math.sin(t * 2)})`;
      disc(g, player.x, player.y - 8, Math.round(r), `rgba(255,210,120,${0.14 + 0.05 * Math.sin(t * 2)})`);
    }
  },
  build() {
    this.storm = 0; this.calm = 0;
    return [
      door('agora', [0, 170, 6, 40], 'agora', 24, 230, { arrow: 'left', sign: 'Agora', signPos: [30, 160] }),
      door('mountain', [304, 78, 26, 8], 'mountain', 30, 200, {
        arrow: 'up', sign: '2,000 years later: the Alps', signPos: [318, 66],
        locked: () => !hasInsight('control'), lockedMsg: 'Epictetus: "First learn what is *up to you*. Talk to me on the bench."',
      }),
      npc('epictetus', 203, 134, LOOKS.epictetus, {
        pose: { sit: true }, ph: 26, mark: () => hasInsight('control') ? null : '!',
        interact: () => epictetusTalk(),
      }),
      npc('marcus', 112, 236, LOOKS.marcus, {
        dir: 3, mark: () => flag('st_sorted') && !hasInsight('control') ? '!' : null,
        interact: () => marcusTalk(),
      }),
      npc('zeno', 168, 104, LOOKS.zeno, {
        dir: 1,
        interact: () => zenoCutscene(),
      }),
      thing('desk', 152, 222, (g, t) => {
        R(g, '#f3e6c4', 144, 216, 8, 5); R(g, '#8b5a2b', 147, 217, 3, 1);
        R(g, '#c9a24a', 156, 212, 6, 1); R(g, '#c9a24a', 156, 220, 6, 1); const k = (t * 0.2) % 1;
        R(g, '#f7dc6f', 157, 213 + Math.floor(k * 3), 4, 3 - Math.floor(k * 3)); R(g, '#f7dc6f', 158, 216, 2, 1); R(g, '#f7dc6f', 157, 219 - Math.floor(k * 2), 4, 1 + Math.floor(k * 2));
      }, {
        r: 18, ph: 16, label: 'Look at the desk',
        async interact() {
          SFX.pour(1.5);
          await say(null, 'An hourglass, its sand slowly running out. Beside it, an open notebook in Greek.');
          await say(null, 'On the hourglass is carved: *MEMENTO MORI*, "remember that you will die."');
          await say('marcus', 'Not to be gloomy. To be *awake*. If today were your last, would you spend it complaining about traffic?');
          await say('owl', 'The Stoics also practiced *premeditatio malorum*: calmly imagining losses in advance, so they wouldn\'t be crushed by surprise and would appreciate what they have.');
        },
      }),
      thing('letter', 228, 176, (g) => { R(g, '#f3e6c4', 224, 172, 9, 6); R(g, '#c0392b', 227, 174, 3, 2); }, {
        r: 14, ph: 10, label: 'Read the letter',
        async interact() {
          SFX.paper();
          await say(null, 'A letter signed *Seneca*: Roman statesman, playwright, and Stoic. He wrote 124 letters of advice to his friend Lucilius.');
          await say(null, '"We suffer more often in *imagination* than in reality." Most of our fears are about things that never actually happen.');
        },
      }),
      thing('target', 280, 120, null, {
        r: 20, ph: 18, label: 'Shoot an arrow', iy: 0,
        async interact() {
          await say('owl', 'The Roman orator Cicero described a *Stoic archer*. Do everything you can to aim well. Then let go.');
          let arrow = { x: player.x, y: player.y - 10 };
          const gust = Math.random() < 0.5 ? (Math.random() < 0.5 ? -9 : 9) : 0;
          const end = setActivity({ draw(g) { R(g, '#5a3a1a', arrow.x - 3, arrow.y, 6, 1); R(g, '#ddd', arrow.x - 4, arrow.y - 1, 1, 3); } });
          SFX.swish();
          const sx = arrow.x, sy = arrow.y, tx = 298, ty = 102 + gust;
          for (let i = 0; i <= 30; i++) { arrow.x = lerp(sx, tx, i / 30); arrow.y = lerp(sy, ty, i / 30) - Math.sin(i / 30 * 3.14) * 10; await nextFrame(); }
          if (gust) { SFX.whoosh(); await wait(0.2); } else { SFX.thud(); }
          await wait(0.4); end();
          if (gust) await say(null, 'A sudden gust pushes the arrow wide. A miss!');
          else await say(null, 'THUNK! Bullseye!');
          await say('owl', 'Either way, the Stoic asks only: *did I aim well?* The aim was up to you; the wind wasn\'t. Hitting is "preferred," but your aim is your *success*.');
        },
      }),
    ];
  },
  hint() {
    if (!flag('st_sorted')) return 'Talk to *Epictetus*, the old man sitting on the bench with a walking stick.';
    if (!hasInsight('control')) return 'Talk to *Marcus Aurelius*, the emperor by his tent. Something is coming over the sea…';
    return 'The path *up* at the end of the colonnade leads to the mountains, 2,000 years later.';
  },
};

async function epictetusTalk() {
  if (flag('st_sorted')) {
    const c = await ask('epictetus', 'Yes, friend?', ['Why do you walk with a stick?', 'Remind me of the lesson.', 'Goodbye.']);
    if (c === 0) {
      await epictetusLegCutscene();
    }
    if (c === 1) await say('epictetus', 'Some things are up to us: our judgments, choices and efforts. The rest is not. Don\'t tie your peace to the second list.');
    return;
  }
  await say('epictetus', 'Sit, sit. My teaching fits in one sentence, the very first line of my *Handbook*:');
  await say('epictetus', '*"Some things are up to us, and some things are not up to us."*');
  await say('epictetus', 'Most misery comes from mixing them up. Let\'s practice. I\'ll toss things to you. Sort each one: *← not up to me* or *→ up to me*.');
  await sortingGame();
  flag('st_sorted', 1);
  await say('epictetus', 'Good. Now listen: *"People are disturbed not by things, but by their judgments about things."*');
  await say('epictetus', 'An insult is just sounds. The *story* you tell about it is what hurts, and that story is up to you.');
  await say('epictetus', 'Go see the Emperor Marcus by his tent. I think… the weather is about to give you a test.');
}

async function sortingGame() {
  const items = [
    ['cloud', 'The weather', 0, 'Rain falls on emperors and slaves alike. You can bring an umbrella. That part is up to you!'],
    ['heart', 'How kindly you speak', 1],
    ['talk', 'What others think of you', 0, 'You can be honest and kind, but their opinion happens in *their* head, not yours.'],
    ['sweat', 'How hard you try', 1],
    ['ship', 'Whether your ship arrives on time', 0, 'Storms, winds, pirates… Zeno lost his whole cargo that way!'],
    ['mind', 'Your judgments about events', 1, 'This is the big one! The judgment "this is a disaster" is *yours* to make or not make.'],
    ['trophy', 'Whether you win the race', 0, 'Tricky! Your *training* is up to you. The result also depends on rivals, luck and the weather.'],
    ['past', 'The past', 0, 'What\'s done is done. Not even the gods can change it. What you *learn* from it is up to you.'],
    ['bow', 'How carefully you aim', 1],
    ['sick', 'Whether you catch a cold', 0, 'Partly! Washing your hands is up to you. Whether the germ wins is not.'],
    ['mirror', 'How you treat yourself', 1],
    ['market', 'The economy', 0, 'Even the Emperor couldn\'t control prices!'],
  ];
  let i = 0, anim = null, msg = null, score = 0;
  const leftPile = [], rightPile = [];
  const end = setActivity({
    hidePlayer: false,
    draw(g, t) {
      g.fillStyle = 'rgba(10,8,20,0.65)'; g.fillRect(0, 0, W, H);
      disc(g, 110, 150, 58, '#3a4a5e'); ring(g, 110, 150, 58, '#7f8fa6', 1);
      disc(g, 370, 150, 58, '#7a5a2a'); disc(g, 370, 150, 50, '#9a7030'); ring(g, 370, 150, 58, '#f5b041', 1);
      leftPile.forEach((k, n) => ICONS[k](g, 80 + (n % 4) * 20, 140 + Math.floor(n / 4) * 20 + Math.sin(t + n) * 2));
      rightPile.forEach((k, n) => ICONS[k](g, 340 + (n % 4) * 20, 140 + Math.floor(n / 4) * 20));
      if (i < items.length) {
        const it = items[i];
        let x = 240, y = 92 + Math.sin(t * 3) * 3;
        if (anim) { const k = Math.min(1, (G.t - anim.t0) / 0.35); x = lerp(240, anim.side ? 370 : 110, ease(k)); y = lerp(92, 150, ease(k)); }
        disc(g, x, y, 12, '#f3e6c4'); ICONS[it[0]](g, x, y);
      }
    },
    ui() {
      text('NOT UP TO ME', 110, 214, { title: true, size: 7, align: 'center', color: '#aab7c4' });
      text('UP TO ME', 370, 214, { title: true, size: 7, align: 'center', color: '#f5b041' });
      if (i < items.length) {
        text(items[i][1], 240, 110, { size: 15, align: 'center', color: '#fff' });
        text('←  or  →', 240, 124, { size: 13, align: 'center', color: UIC.dim });
      }
      text(`${Math.min(i + 1, items.length)} / ${items.length}`, 240, 20, { size: 12, align: 'center', color: UIC.dim });
      if (msg) { panel(110, 228, 260, 38); richBlock(msg, 118, 233, 244, 12, 11); }
    },
  });
  while (i < items.length) {
    await nextFrame();
    if (anim) continue;
    let side = null;
    if (hit('left')) side = 0; else if (hit('right')) side = 1;
    if (side === null) continue;
    const it = items[i];
    anim = { side: it[2], t0: G.t };
    const correct = side === it[2];
    if (correct) { score++; if (it[2]) AudioSys.play('pluck', 64 + rightPile.length * 2, { vol: 0.14, dur: 1.4 }); else { SFX.whoosh(); AudioSys.play('sine', 57, { vol: 0.05, dur: 1 }); } }
    else { SFX.boing(); }
    await wait(0.4);
    (it[2] ? rightPile : leftPile).push(it[0]);
    if (!correct || it[3]) {
      msg = (correct ? '✓ ' : 'Actually… ') + (it[3] || (it[2] ? 'That one\'s yours. Your effort, your words, your attitude.' : 'That one isn\'t up to you.'));
      const t0 = G.t; await waitUntil(() => G.t - t0 > 1.5 && hit('act') || G.t - t0 > (correct ? 2.6 : 4.5));
      msg = null;
    }
    anim = null; i++;
  }
  await wait(0.3); end();
  await say('epictetus', `You sorted ${score} of ${items.length} at first glance. Notice what\'s on the *right*: all of it lives *inside you*.`);
}

async function marcusTalk() {
  if (!flag('st_sorted')) {
    await say('marcus', 'Greetings. I am Marcus Aurelius, Emperor of Rome. Forgive me, I\'m writing in my notebook. Talk to Epictetus first. His books taught me most of what I know.');
    return;
  }
  if (hasInsight('control')) {
    const c = await ask('marcus', 'Yes?', ['What are you writing?', 'Goodbye, Emperor.']);
    if (c === 0) {
      await say('marcus', 'Notes to myself. Never meant for anyone else. People will later publish them as my *Meditations*.');
      await marcusMorningCutscene();
    }
    return;
  }
  await say('marcus', 'Ah, you\'ve learned the sorting. Now let\'s see it in the body, not just the head. Look at the sea.');
  // the storm rolls in
  const Rm = Rooms.stoa;
  const rain = AudioSys.layer('noise', { f: 4000, ftype: 'highpass', vol: 0.0001 });
  const wind = AudioSys.layer('noise', { f: 500, ftype: 'bandpass', q: 0.6, vol: 0.0001, lfo: 0.3, lfoDepth: 0.05 });
  AudioSys.setMusicVol(0.05, 2);
  for (let k = 0; k <= 30; k++) { Rm.storm = k / 30; rain.vol(0.12 * Rm.storm, 0.2); wind.vol(0.14 * Rm.storm, 0.2); await wait(0.07); }
  Rm.bolt = G.t; SFX.thunder(); shake(0.4);
  await say('marcus', 'A storm. You cannot stop it. You cannot argue with it. Not even an emperor can.');
  await say('marcus', 'But *inside* you there is a citadel the storm cannot enter, unless you open the gates. Breathe with me.');
  let breaths = 0, phase = 0;
  const drones = [];
  const end = setActivity({
    update(dt) {
      if (Dialog.cur || breaths >= 5) return;
      phase += dt / 4;
      if (Math.random() < dt * 0.25) { Rm.bolt = G.t; SFX.thunder(); shake(0.25); }
      if (hit('act')) {
        const fill = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
        if (fill > 0.7) {
          breaths++; Rm.calm = breaths;
          const n = [48, 55, 60, 64, 67][breaths - 1];
          drones.push(AudioSys.layer('osc', { hz: AudioSys.midi(n), wave: 'sine', vol: 0.05, fadeIn: 1.5, dest: 'sfx' }));
          AudioSys.play('bowl', n + 12, { vol: 0.08, dur: 5 });
        } else { this.early = G.t; SFX.blip(200, 'sine'); }
      }
    },
    ui() {
      const fill = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
      const r = 8 + fill * 26;
      ctx.strokeStyle = `rgba(255,215,130,${0.5 + fill * 0.5})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(240, 60, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(240, 60, 8 + 0.7 * 26, 0, 7); ctx.stroke();
      text(fill > 0.5 ? (phase % 1 < 0.5 ? 'breathe in…' : 'breathe out…') : (phase % 1 < 0.5 ? 'breathe in…' : 'breathe out…'), 240, 96, { size: 13, align: 'center' });
      text(`Press E when the circle is fullest   (${breaths}/5)`, 240, 108, { size: 12, align: 'center', color: UIC.hl });
      if (this.early && G.t - this.early < 1) text('not yet… wait for it to fill', 240, 120, { size: 12, align: 'center', color: UIC.dim });
    },
  });
  await waitUntil(() => breaths >= 5);
  await wait(1.5);
  end();
  await say('marcus', 'Listen. The storm is still roaring… but it isn\'t *inside* you anymore.');
  await say('marcus', 'I wrote in my notebook: *"You have power over your mind, not outside events. Realize this, and you will find strength."*');
  for (let k = 30; k >= 0; k--) { Rm.storm = k / 30; rain.vol(0.12 * Rm.storm, 0.2); wind.vol(0.14 * Rm.storm, 0.2); await wait(0.06); }
  rain.stop(1); wind.stop(1); drones.forEach(d => d.stop(3)); Rm.calm = 0;
  AudioSys.setMusicVol(0.55, 3);
  SFX.success();
  await say('marcus', 'And there, the sun. It too was never up to you. Enjoy it anyway!');
  await giveInsight('control');
  await say('owl', 'The path *up* at the end of the colonnade is open. Where it leads, about 1,700 years later, a philosopher will challenge *everything*, including the Stoics.');
}

// ---------- cutscenes
async function zenoCutscene() {
  const Z = G.room.ents.find(e => e.id === 'zeno'), home = [Z.x, Z.y], Rm = Rooms.stoa;
  await say('zeno', 'I\'m Zeno, founder of this school. We meet here at the *Stoa Poikile*, the "Painted Porch." That\'s why they call us *Stoics*.');
  await say('zeno', 'Want to know how I became a philosopher? It began with a disaster.');
  const C = await cutStart('Zeno of Citium · around 312 BCE');
  const ship = C.prop('ship', 500, 150, function (g, t) {
    const x = this.x, y = this.y + Math.sin(t * 3) * (1 + Rm.storm * 3), tilt = this.sink || 0;
    g.save(); g.beginPath(); g.rect(342, 84, 138, 188); g.clip();
    R(g, '#6b4a2b', x - 16, y + tilt * 10, 32, 6); R(g, '#8b5a2b', x - 13, y - 2 + tilt * 10, 26, 2);
    R(g, '#5a3a1a', x, y - 22 + tilt * 14, 2, 22); R(g, '#f5f5f5', x + 2, y - 20 + tilt * 14, 12, 14);
    for (let i = 0; i < 4; i++) ICONS.coin(g, x - 10 + i * 6, y - 4 + tilt * 12);
    drawPerson(g, x - 8, y + tilt * 12, LOOKS.zeno, 2, 0, { noShadow: true });
    g.restore();
  });
  Z.alpha = 0; Z.hidden = true;
  await C.walk(ship, 410, 150, 25);
  await say(null, 'A wealthy merchant sails toward Athens, his ship heavy with precious purple dye.');
  for (let k = 0; k <= 20; k++) { Rm.storm = k / 20; await wait(0.05); }
  SFX.thunder(); shake(0.4); Rm.bolt = G.t;
  await say('zeno', 'A storm! The waves are too high!');
  SFX.crack(); SFX.splash();
  for (let k = 0; k <= 30; k++) { ship.sink = k / 10; await wait(0.05); }
  ship.alpha = 0;
  await narrate('The ship sinks with everything he owns.');
  for (let k = 20; k >= 0; k--) { Rm.storm = k / 20; await wait(0.04); }
  const z = C.actor('zenoWet', LOOKS.zeno, 440, 210, { dir: 2, alpha: 0 });
  await C.fadeActor(z, 1, 1);
  C.emote(z, 'tear', 2); await wait(1);
  await C.walk(z, 214, 200, 35);
  const book = C.prop('book', 236, 200, (g, t) => { R(g, '#6b4a2b', 226, 192, 26, 8); ICONS.book(g, 238, 190); }, {});
  C.face(z, book);
  await say(null, 'Penniless in Athens, he wanders into a bookshop and picks up a book about *Socrates*.');
  C.emote(z, 'idea', 3);
  await say('zeno', '"Where can I find a man like this?" I asked. The bookseller pointed to a philosopher walking by. *Follow him*, he said. And I did.');
  await C.walk(z, home[0], home[1] + 6, 45);
  z.alpha = 0; Z.hidden = false; Z.alpha = 1; ship.alpha = 0;
  await C.end();
  await say('zeno', 'Later I said: *"I made a prosperous voyage when I suffered shipwreck."* Losing everything showed me what truly mattered.');
}
async function epictetusLegCutscene() {
  const E = G.room.ents.find(e => e.id === 'epictetus');
  await say('epictetus', 'I was born a *slave*. My name even means "acquired." Let me show you a story they tell about me.');
  const C = await cutStart('Rome, around 70 CE');
  const master = C.actor('master', { skin: '#eab994', hairStyle: 'short', hairC: '#1d1d2b', robe: '#f5f5f5', robe2: '#8b1e2b', sash: '#8b1e2b', long: true }, 500, 150, { dir: 2 });
  await C.walk(master, 222, 146, 50); C.face(master, E);
  C.emote(master, 'angry', 2);
  await say({ name: 'His Master', look: master.look, voice: 230 }, 'Let\'s see if you cry out, philosopher.');
  shake(0.15); SFX.grunt();
  C.emote(E, '...', 2.5);
  await say('epictetus', '(calmly) If you keep twisting, you\'ll break it.');
  shake(0.2); await wait(0.6);
  SFX.snap(); shake(0.5); flash('#ffffff', 0.4);
  C.emote(master, '!', 2);
  await say('epictetus', '(just as calmly) There. Didn\'t I tell you?');
  await C.walk(master, 520, 150, 60);
  await C.end();
  await say('epictetus', 'Perhaps it\'s only a legend. But the lesson is true: my leg was never up to me. My *response* was. Later I was freed and taught philosophy in Rome and Greece.');
}

async function marcusMorningCutscene() {
  const Mc = G.room.ents.find(e => e.id === 'marcus'), home = [Mc.x, Mc.y];
  await say('marcus', 'Each morning I write: today I will meet people who are rude, ungrateful, dishonest. Let me show you one such morning.');
  const C = await cutStart('A Roman army camp · 170s CE');
  const people = [
    [{ skin: '#eab994', hairStyle: 'short', hairC: '#3a2a1a', robe: '#c0392b', hat: 'helmet' }, 'angry', 'Out of my way, old man!'],
    [{ skin: '#c98e62', hairStyle: 'curly', hairC: '#1d1d2b', robe: '#8e44ad', robe2: '#e0c060', long: true }, 'ha', 'The emperor scribbles in his little diary again? Ha!'],
    [{ skin: '#f0caa8', hairStyle: 'bun', hairC: '#5a3a22', robe: '#16a085', long: true }, '...', '(walks past, ignoring his greeting)'],
  ];
  await C.walk(Mc, 150, 236, 40); Mc.dir = 3;
  for (const [look, emo, line] of people) {
    const p = C.actor('p', look, 500, 236, { dir: 2 });
    await C.walk(p, 176, 236, 70);
    C.emote(p, emo, 2);
    if (emo === 'angry') { shake(0.2); SFX.thud(); }
    await say({ name: 'A passer-by', look, voice: 280 }, line);
    C.emote(Mc, 'heart', 1.5);
    await C.walk(p, -20, 236, 80);
  }
  await say('marcus', 'They act that way out of ignorance. I can\'t be harmed by them unless I *choose* to be. And I was born to work *with* them, like hands and feet.');
  await C.walk(Mc, home[0], home[1], 40); Mc.dir = 3;
  await C.end();
  await say('owl', 'The most powerful man in the world, fighting wars and plague, writing himself reminders to be patient.');
}
