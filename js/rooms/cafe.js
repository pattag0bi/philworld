'use strict';
// ============================================================
// ROOM: The Existentialist Café — freedom, bad faith, the absurd (finale)
// ============================================================
Rooms.cafe = {
  name: 'The Existentialist Café', sub: 'Saint-Germain-des-Prés, Paris, 1940s', scene: 'cafe',
  spawn: [240, 250], spawnDir: 1,
  walls: [[0, 0, W, 84], [16, 84, 128, 26], [140, 150, 24, 10], [290, 150, 24, 10], [394, 196, 70, 30], [60, 210, 24, 10]],
  surface() { return 'wood'; },
  bg(g) {
    // back wall
    R(g, '#3a2418', 0, 0, W, 84); for (let x = 0; x < W; x += 20) R(g, '#2e1c12', x, 0, 1, 84);
    R(g, '#5a3a24', 0, 78, W, 6); R(g, '#c9a24a', 0, 77, W, 1);
    // windows to rainy Paris
    for (const wx of [170, 260]) {
      R(g, '#1a1a2a', wx, 10, 70, 56); vgrad(g, wx + 2, 12, 66, 52, '#1a2440', '#3a3a5a', 6);
      for (let i = 0; i < 6; i++) R(g, '#101018', wx + 2 + i * 11, 44 - (i % 3) * 6, 10, 20 + (i % 3) * 6);
      for (let i = 0; i < 6; i++) R(g, '#f7dc6f', wx + 5 + i * 11, 50 - (i % 2) * 6, 2, 2);
      if (wx === 260) { R(g, '#0a0a12', wx + 50, 20, 2, 44); R(g, '#0a0a12', wx + 46, 40, 10, 2); R(g, '#0a0a12', wx + 44, 56, 14, 2); line(g, wx + 44, 64, wx + 50, 20, '#0a0a12'); line(g, wx + 58, 64, wx + 52, 20, '#0a0a12'); }
      R(g, '#5a3a24', wx + 34, 10, 2, 56); R(g, '#5a3a24', wx, 36, 70, 2);
    }
    // painting of Sisyphus's hill
    R(g, '#c9a24a', 372, 18, 60, 44); R(g, '#d8b070', 374, 20, 56, 40);
    vgrad(g, 376, 22, 52, 36, '#e8a050', '#f5d0a0', 4);
    for (let i = 0; i < 40; i++) R(g, '#6d4c41', 380 + i, 54 - i * 0.7, 1, 4 + i * 0.7);
    disc(g, 414, 26, 3, '#7f8c8d');
    // poster (Kierkegaard)
    R(g, '#e8d8b8', 110, 16, 30, 40); R(g, '#3a2a1a', 114, 20, 22, 18); disc(g, 125, 28, 5, '#e8d8b8'); R(g, '#3a2a1a', 114, 42, 22, 1); R(g, '#3a2a1a', 114, 46, 18, 1); R(g, '#3a2a1a', 114, 50, 20, 1);
    // checker floor
    for (let y = 84; y < H; y += 12) for (let x = 0; x < W; x += 12) R(g, ((x + y) / 12) % 2 ? '#d8c8a8' : '#6a4a34', x, y, 12, 12);
    g.fillStyle = 'rgba(40,20,10,0.25)'; g.fillRect(0, 84, W, H - 84);
    // bar
    R(g, '#5a3020', 16, 86, 128, 24); R(g, '#7a4a30', 16, 86, 128, 4); R(g, '#c9a24a', 16, 90, 128, 1);
    for (let i = 0; i < 8; i++) R(g, ['#2e7d32', '#8b1e2b', '#c9a24a', '#1b4f72'][i % 4], 24 + i * 7, 60, 4, 12);
    R(g, '#4a2a18', 16, 72, 128, 2);
    R(g, '#b0b0b8', 100, 66, 22, 18); R(g, '#d0d0d8', 102, 68, 18, 4); R(g, '#3a3a3a', 108, 80, 6, 4); // espresso machine
    // tables
    for (const [x, y] of [[152, 156], [302, 156], [72, 216]]) { ellipse(g, x, y - 4, 12, 4, '#3a2a1a'); ellipse(g, x, y - 5, 11, 3, '#5a3a24'); R(g, '#2a1a10', x - 1, y - 2, 2, 6); R(g, '#f5f5f5', x - 2, y - 8, 4, 3); }
    // piano
    R(g, '#1a1a1a', 394, 196, 70, 30); R(g, '#2a2a2a', 394, 196, 70, 4); for (let i = 0; i < 16; i++) R(g, '#f5f5f5', 398 + i * 4, 216, 3, 6); for (let i = 0; i < 16; i++) if (i % 7 !== 2 && i % 7 !== 6) R(g, '#111', 400 + i * 4, 216, 2, 4);
    // door
    R(g, '#4a2a18', 220, 262, 40, 10); R(g, '#c9a24a', 238, 264, 4, 1);
  },
  under(g, t) {
    // rain on windows
    for (const wx of [170, 260]) for (let i = 0; i < 10; i++) { const k = (t * 0.6 + i * 0.13) % 1; R(g, 'rgba(180,200,230,0.7)', wx + 4 + (i * 13) % 62, 12 + k * 50, 1, 3); }
    // steam from cups
    for (const [x, y] of [[152, 148], [302, 148]]) for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; R(g, `rgba(255,255,255,${0.5 * (1 - k)})`, x + Math.sin(t * 2 + i) * 2, y - 2 - k * 12, 1, 1); }
    // lamplight
    for (const x of [100, 240, 380]) { g.fillStyle = 'rgba(255,200,120,0.07)'; disc(g, x, 120, 50, 'rgba(255,200,120,0.06)'); }
  },
  over(g, t) {
    if (this.finale) { g.fillStyle = `rgba(255,210,140,${0.06 + 0.03 * Math.sin(t)})`; g.fillRect(0, 0, W, H); }
  },
  build() {
    const Rm = this;
    Rm.manq = Rm.manq || null;
    const ents = [
      door('out', [220, 266, 40, 8], 'crossroads', 240, 78, { arrow: 'down', sign: 'Back to the Crossroads', signPos: [240, 252] }),
      npc('sartre', 140, 156, LOOKS.sartre, { dir: 3, pose: { sit: true }, mark: () => !flag('cf_sartre') ? '!' : null, interact: () => sartreTalk() }),
      thing('mannequin', 186, 160, (g, t) => drawMannequin(g, 186, 160, flag('cf_manq'), t), { r: 18, ph: 26, label: 'Look at the blank figure', solid: true, box: [-5, -3, 10, 4], async interact() { if (flag('cf_manq')) { const m = flag('cf_manq'); await say(null, `The figure you shaped: *${m.tags.join(', ')}*. Every label came from an action.`); } else await say(null, 'A blank, faceless figure. No name. No purpose. It is waiting to become *someone*.'); } }),
      npc('beauvoir', 316, 156, LOOKS.beauvoir, { dir: 2, pose: { sit: true }, interact: () => beauvoirTalk() }),
      npc('camus', 402, 102, LOOKS.camus, { dir: 1, mark: () => !flag('cf_camus') ? '!' : null, interact: () => camusTalk() }),
      npc('waiter', 240, 130, LOOKS.waiter, {
        solid: false, noBob: true,
        update(dt, t) {
          if (this._talk) return;
          const k = (t * 0.12) % 1, pts = [[240, 130], [200, 180], [260, 200], [300, 120], [240, 130]];
          const i = Math.floor(k * 4), f = (k * 4) % 1, a = pts[i], b = pts[i + 1];
          const ff = Math.round(f * 6) / 6; // robotic, jerky movement
          const nx = lerp(a[0], b[0], ff), ny = lerp(a[1], b[1], ff);
          if (nx !== this.x || ny !== this.y) { this.dir = Math.abs(nx - this.x) > Math.abs(ny - this.y) ? (nx < this.x ? 2 : 3) : (ny < this.y ? 1 : 0); this.walkStep = (this.walkStep + 1) % 4; if (dist(nx, ny, player.x, player.y) < 140 && Math.random() < 0.5) AudioSys.play('sine', 2000, { hz: true, wave: 'square', dur: 0.015, vol: 0.015 }); }
          this.x = nx; this.y = ny;
        },
        draw(g, t) { drawPerson(g, this.x, this.y, this.look, this.dir, this.walkStep, { hold: (g, x, y) => { R(g, '#c0c0c8', x + 4, y - 15, 8, 1); R(g, '#f5f5f5', x + 6, y - 18, 3, 3); } }); },
        async interact() { this._talk = true; try { await waiterTalk(); } finally { this._talk = false; } },
      }),
      thing('piano', 428, 226, null, {
        r: 26, ph: 30, label: 'Play the piano',
        async interact() {
          const lick = [62, 65, 69, 72, 71, 69, 67, 65, 64, 62, 60, 62];
          lick.forEach((n, i) => AudioSys.play('piano', n, { vol: 0.15, dur: 1 }, i * 0.14));
          [50, 53, 57, 60].forEach(n => AudioSys.play('piano', n, { vol: 0.07, dur: 2.5 }, 1.7));
          await wait(1.2);
          await say(null, 'A little jazz phrase rings out over the clink of cups.');
          await say('owl', 'In Sartre\'s novel *Nausea*, the hero feels that existence is pointless and sticky, until he hears a jazz record, "Some of These Days." For a moment, the music feels *necessary*. Art as a tiny rescue.');
        },
      }),
      thing('poster', 150, 96, null, {
        r: 18, ph: 10, label: 'Read the poster',
        async interact() {
          await say(null, 'A faded poster: *Søren Kierkegaard*, Copenhagen, 1840s. "Anxiety is the dizziness of freedom."');
          await say('owl', 'Kierkegaard is often called the *father of existentialism*, though his answer was a passionate "leap of faith." His room isn\'t built yet. It\'s on the roadmap as a teaser!');
        },
      }),
      thing('window', 240, 92, null, {
        r: 30, ph: 10, label: 'Look out the window',
        async interact() {
          AudioSys.ev.thunderFar();
          await say(null, 'Rain on the rooftops of Paris. Somewhere, a siren.');
          await say('owl', 'During World War II, France was occupied by Nazi Germany (1940–44). Everyday choices became life-and-death: collaborate, resist, or look away. No wonder these thinkers obsessed over *freedom* and *responsibility*.');
        },
      }),
      thing('bar', 80, 112, null, {
        r: 26, ph: 10, label: 'Lean on the bar',
        async interact() {
          AudioSys.ev.hiss();
          await say(null, 'The espresso machine hisses. A sign over the bar reads *Café de Flore*.');
          await say('owl', 'Sartre and Beauvoir practically lived at cafés like the Flore and Les Deux Magots. During the war, the cafés were heated and their hotel rooms weren\'t, so they wrote there all day.');
        },
      }),
    ];
    if (flag('cf_finale')) ents.push(...finaleGuests());
    return ents;
  },
  afterEnter(first) {
    if (first) return say('owl', 'Hoo! Paris! Every road ends up here. Smell that coffee. Listen to that rain. These people are asking: *if nothing is given to us, not even our purpose, what do we do?*');
  },
  hint() {
    if (!flag('cf_sartre')) return 'Sit with *Sartre*, the man with round glasses and a pipe, by the blank figure.';
    if (!flag('cf_camus')) return 'Talk to *Camus* by the painting of a hill. He has a friend with a boulder.';
    if (!hasInsight('freedom')) return 'Talk to *Camus* or *Sartre* again.';
    const w = hasInsight('amorfati'), e = hasInsight('middleway');
    if (!w || !e) return `You can still walk the *${w ? 'East' : 'West'}* road from the Crossroads! The door at the bottom leads back.`;
    return 'You\'ve walked every road. Talk to old friends, or press *M* to see everything you\'ve learned.';
  },
};

function drawMannequin(g, x, y, m, t) {
  const L = { skin: '#9a9aa0', hairStyle: 'none', robe: '#b0b0b8', robe2: '#9a9aa0', legs: '#8a8a90', eyes: '#9a9aa0' };
  let hold = null;
  if (m) {
    const c = m.choices;
    if (c[0] != null) L.robe = ['#e67e22', '#7f8c8d', '#8e44ad'][c[0]];
    if (c[1] != null) { L.hairStyle = 'short'; L.hairC = '#5a3a22'; hold = [(g, x, y) => { R(g, '#8b5a2b', x + 5, y - 15, 1, 8); R(g, '#e74c3c', x + 5, y - 16, 1, 2); }, (g, x, y) => ICONS.book(g, x + 6, y - 10), (g, x, y) => { R(g, '#a0703a', x + 3, y - 12, 6, 6); R(g, '#5a3a1a', x + 8, y - 20, 1, 9); }, null][c[1]]; if (c[1] === 3) L.hat = 'nightcap'; }
    if (c[2] != null) { L.skin = '#eab994'; L.eyes = '#221a1a'; }
    if (c[3] != null) L.sash = ['#f1c40f', '#7f8c8d', '#e74c3c'][c[3]];
  }
  drawPerson(g, x, y, L, 0, 0, { hold, smile: m && m.choices[2] != null });
}
async function sartreTalk() {
  if (flag('cf_sartre')) {
    const c = await ask('sartre', 'Mm? *(puffs pipe)*', ['What is bad faith?', 'What should I do with my freedom?', 'Is "Hell is other people" true?', 'Goodbye.']);
    if (c === 0) { await say('sartre', 'Watch the waiter. Too precise, too eager, like a machine. He\'s *playing at being a waiter*, as if that were all he could be.'); await say('sartre', '*Bad faith* is lying to yourself about your freedom: "I had no choice." "That\'s just how I am." You always have a choice. Even not choosing is a choice.'); }
    if (c === 1) { await say('sartre', 'During the war a student came to me. His brother had been killed. Should he join the Resistance, or stay and care for his mother, who lived only for him?'); await say('sartre', 'No ethics book could decide for him. I told him: *you are free, so choose*, that is, invent. Whatever he chose, he would be choosing what kind of person he was.'); }
    if (c === 2) { await say('sartre', 'That line from my play *No Exit* gets misread! I didn\'t mean people are awful. I meant: if we depend entirely on others\' judgment to know who we are, *that* becomes a hell.'); }
    return;
  }
  await say('sartre', 'Ah, sit, sit. Jean-Paul Sartre. Writer, philosopher, terrible at being on time. Look at this paper knife on my table.');
  await say('sartre', 'Before it was made, someone *designed* it, for cutting paper. Its purpose, its *essence*, came first. Then it existed.');
  await say('sartre', 'Now: what is *your* purpose? Who designed *you*? I say: no one. You *exist first*, and then you define yourself by what you do. *Existence precedes essence.*');
  await say('sartre', 'Don\'t believe me? Here: this blank figure. Let\'s see who it becomes. Choose for it.');
  const scen = [
    ['A stranger drops their groceries in the rain.', ['Help pick them up', 'Hurry past: you\'re late', 'Laugh at them'], ['kind', 'busy', 'mocking']],
    ['A free evening, all to yourself.', ['Paint', 'Read philosophy', 'Play music', 'Sleep'], ['an artist', 'a thinker', 'a musician', 'sleepy']],
    ['A friend begs you to lie for them.', ['Lie, out of loyalty', 'Refuse and explain why', 'Avoid them for a week'], ['loyal', 'honest', 'evasive']],
    ['You see someone treated unfairly.', ['Speak up', 'Stay quiet', 'Organize others to help'], ['brave', 'cautious', 'a leader']],
  ];
  const m = { choices: [], tags: [] };
  for (const [s, opts, tags] of scen) {
    const c = await ask('sartre', s, opts);
    m.choices.push(c); m.tags.push(tags[c]);
    flag('cf_manq', m);
    SFX.sparkle(); AudioSys.play('piano', 60 + m.choices.length * 3, { vol: 0.12, dur: 1.5 });
    await say(null, `The figure changes: it becomes *${tags[c]}*.`);
  }
  await say('sartre', `Look! A moment ago this was nobody. Now it is ${m.tags.slice(0, -1).join(', ')} and ${m.tags[m.tags.length - 1]}. Not because it was *born* that way: because of what it *did*.`);
  await say('sartre', 'And notice: at every step, you could have chosen *otherwise*. That\'s the frightening part. We are *condemned to be free*. No excuses, no human nature to blame, no rulebook from the sky.');
  await say('sartre', 'Freedom means *responsibility*. And when you choose, you\'re showing what you think a human being *should* be. Heavy, eh? Hence the anguish. Hence the coffee.');
  flag('cf_sartre', 1);
  await checkFreedom();
}
async function beauvoirTalk() {
  const c = await ask('beauvoir', 'Simone de Beauvoir. Do sit down. What would you like to discuss?', ['"One is not born a woman…"?', 'Is my freedom just about me?', 'You and Sartre?']);
  if (c === 0) {
    await say('beauvoir', 'In *The Second Sex* (1949) I wrote: *"One is not born, but rather becomes, a woman."*');
    await say('beauvoir', 'Society hands women a ready-made "essence": passive, the "Other," defined in relation to men. But that\'s a role taught and imposed, not a fate. It can be refused and rewritten.');
    await say('owl', 'That book helped spark the modern feminist movement. It\'s the existentialist idea, "existence precedes essence," turned toward how societies shape people.');
  }
  if (c === 1) {
    await say('beauvoir', 'No! That\'s the trap. My freedom only means something in a world with *other* free people. *"To will oneself free is also to will others free."*');
    await say('beauvoir', 'Someone who is starving, or oppressed, can\'t exercise their freedom fully. So taking freedom seriously means fighting for *everyone\'s*. I called this the *ethics of ambiguity*.');
  }
  if (c === 2) {
    await say('beauvoir', 'Partners for fifty years, never married, each with our own lives. We read every word the other wrote. Sometimes I think people forget *I* was a philosopher too, not just "Sartre\'s companion."');
  }
}
async function waiterTalk() {
  await say('waiter', 'Bonjour! I am a waiter. *(bows exactly 30 degrees)* A waiter is what I am. I could not possibly be anything else.');
  const c = await ask('waiter', 'What will Monsieur or Madame have?', ['A café crème, please.', 'Could you be something other than a waiter?']);
  if (c === 0) { SFX.coin(); await say('waiter', 'Café crème. *(pivot, step, step, pivot)* Coming. Precisely. As a waiter does.'); }
  else { SFX.boing(); await say('waiter', '…Error. I… am… a waiter. *(clicks heels nervously)* Please don\'t ask such questions.'); }
  await say('sartre', '(murmuring) See? *Bad faith*. He pretends his role is his whole being, so he doesn\'t have to face his freedom. Of course, he *is* free. He could quit tomorrow and sail to Brazil!');
}
async function camusTalk() {
  if (flag('cf_camus')) {
    const c = await ask('camus', 'Ah, my friend.', ['Are you an existentialist?', 'What is revolt?', 'Goodbye.']);
    if (c === 0) await say('camus', 'Everyone says so! I always denied it. I don\'t think we "create" meaning out of nothing. I think we face the absurd honestly and live *anyway*. A small difference, but it mattered to me.');
    if (c === 1) await say('camus', 'Not violence. Revolt means refusing both despair *and* false comfort. Keep your eyes open, keep living fully: love, create, play football, swim in the sea. *"In the midst of winter, I found there was, within me, an invincible summer."*');
    return;
  }
  await say('camus', 'Albert Camus. I grew up poor in Algiers: sun, sea, football. I love life so much it hurts. And still I see the problem.');
  await say('camus', 'We humans demand meaning, reasons, a point. The universe answers with… silence. That clash, our cry and the silent world, I call *the absurd*.');
  await say('camus', 'Some escape it with false hope. Some give up. I say: *revolt*. Live with the absurd, fully, with eyes open. Let me show you my favorite hero.');
  await say('camus', 'Step into the painting with me…');
  await sisyphus();
  flag('cf_camus', 1);
  await say('camus', '*"The struggle itself toward the heights is enough to fill a man\'s heart. One must imagine Sisyphus happy."*');
  await say('camus', 'His rock is his thing. His task is his. And in the moment of walking back down the hill, he is *free*, and stronger than his fate.');
  await checkFreedom();
}

async function sisyphus() {
  let pos = 0, cycles = 0, rolling = false, pushes = 0, sun = 0, smile = false, walkBack = 0;
  const climb = 14;
  const slope = k => [50 + k * 330, 186 - k * 120];
  const end = setActivity({
    hidePlayer: true,
    draw(g, t) {
      vgrad(g, 0, 0, W, H, mix('#2a1a3a', '#f5a050', sun), mix('#4a2a4a', '#fde0a0', sun), 10);
      disc(g, 410, 200 - sun * 150, 18, mix('#e86a3a', '#fff3b0', sun));
      for (let x = 0; x < W; x++) { const k = clamp((x - 50) / 330, 0, 1), y = 186 - k * 120; R(g, '#5a3a2a', x, y + 6, 1, H); R(g, '#7a5a3a', x, y + 6, 1, 2); }
      const [bx, by] = slope(pos / climb);
      disc(g, bx + 10, by - 6, 12, '#7f8c8d'); disc(g, bx + 7, by - 10, 4, '#95a5a6'); R(g, '#5d6d6e', bx + 12, by - 2, 4, 2);
      const sx = walkBack ? slope(walkBack)[0] : bx - 6, sy = walkBack ? slope(walkBack)[1] : by;
      drawPerson(g, sx, sy + 6, LOOKS.sisyphus, walkBack ? 2 : 3, (pushes + (walkBack ? Math.floor(t * 6) : 0)) % 4, { smile, armsUp: !walkBack });
    },
    ui() {
      text(cycles < 3 ? 'Press E (or →) again and again to push' : '', 240, 20, { size: 13, align: 'center', color: UIC.hl });
      text(`Climb ${Math.min(cycles + 1, 3)}`, 20, 20, { size: 12, color: UIC.dim });
    },
  });
  const bassNotes = [38, 38, 41, 43, 45, 43, 41, 40];
  const melNotes = [62, 65, 69, 67, 65, 69, 72, 74, 72, 69, 67, 65, 64, 62];
  while (cycles < 3) {
    await nextFrame();
    if (rolling) continue;
    if (hit('act') || hit('right')) {
      pos++; pushes++;
      AudioSys.play('drum', 50, { vol: 0.35 }); if (Math.random() < 0.4) SFX.grunt();
      if (cycles >= 1) AudioSys.play('pluck', bassNotes[pushes % 8], { vol: 0.16, dur: 0.8 });
      if (cycles >= 2) { AudioSys.play('piano', melNotes[pos % melNotes.length], { vol: 0.14, dur: 1 }); sun = Math.min(1, sun + 0.07); }
      if (cycles >= 2 && pos > 6) smile = true;
      if (pos >= climb) {
        rolling = true;
        await wait(0.4);
        SFX.rumble(1.8);
        for (let k = climb; k >= 0; k--) { pos = k; await wait(0.04); }
        SFX.thud(); shake(0.3);
        cycles++;
        if (cycles === 1) await say('camus', 'And down it rolls. The gods condemned Sisyphus to push it up, forever. Pointless. Like many jobs. Like many lives. Again!');
        if (cycles === 2) await say('camus', 'Listen: do you hear a rhythm in his effort? The task hasn\'t changed. *He* is starting to. Again!');
        rolling = false;
      }
    }
  }
  // the walk back down, smiling
  smile = true;
  for (let k = 1; k >= 0; k -= 0.01) { walkBack = Math.max(0.001, k); if (Math.floor(k * 100) % 12 === 0) AudioSys.play('flute', 74 + pick([0, 2, 5, 7]), { vol: 0.1, dur: 0.8 }); await wait(0.03); }
  await say('camus', 'Look at his face as he walks back down. He knows the rock will roll again. He *knows*. And he whistles.');
  end();
}

async function checkFreedom() {
  if (!(flag('cf_sartre') && flag('cf_camus')) || hasInsight('freedom')) return;
  await say('owl', 'Hoo… Sartre: you\'re free and responsible for what you become. Camus: life may have no given meaning, and you can live it fully anyway.');
  await giveInsight('freedom');
  await finale();
}

function finaleGuests() {
  const guests = [];
  const v = G.state.visited;
  const spots = [[60, 140], [110, 190], [190, 210], [270, 230], [340, 200], [360, 140], [60, 250], [450, 250], [200, 120], [430, 160]];
  const list = [['socrates', 'agora'], ['plato', 'cave'], ['aristotle', 'lyceum'], ['epictetus', 'stoa'], ['nietzsche', 'mountain'], ['confucius', 'courtyard'], ['laozi', 'valley'], ['buddha', 'bodhi']];
  let i = 0;
  for (const [k, room] of list) {
    if (!v.includes(room)) continue;
    const [x, y] = spots[i++];
    const lines = {
      socrates: 'So! Did you find out what justice is? …No? Excellent. Keep asking.',
      plato: 'Even this café is a kind of cave. Shadows of ideas everywhere! Wonderful ones, mind you.',
      aristotle: 'Coffee: a fine thing, in moderation. The mean, always the mean!',
      epictetus: 'The rain outside? Not up to us. The conversation inside? Very much up to us.',
      nietzsche: 'These Parisians read me well! Though I\'d say: create your values *joyfully*. Dance a little!',
      confucius: 'A gathering of friends from far away: is this not a delight? I said that, you know.',
      laozi: 'So many words in this café… Mm. The best ones are the pauses between them.',
      buddha: 'Every face here will change, and this evening will pass. That is why it is precious.',
    };
    guests.push(npc('g_' + k, x, y, LOOKS[k], { dir: 0, async interact() { await say(k, lines[k]); } }));
  }
  return guests;
}
async function finale() {
  const Rm = Rooms.cafe;
  flag('cf_finale', 1);
  G.fadeTo = 1; await waitFade();
  Rm.ents.push(...finaleGuests());
  Rm.finale = true;
  AudioSys.setMusic({
    bpm: 80, custom: (t, s, I, midi) => {
      const ch = [[50, 57, 62, 65, 69], [43, 55, 59, 62, 65], [48, 55, 60, 64, 67], [45, 57, 61, 64, 69]][Math.floor(s / 8) % 4];
      if (s % 8 === 0) ch.forEach((n, i) => I.piano(midi(n), t + i * 0.02, { vol: i ? 0.05 : 0.12, dur: 2.6 }));
      if (s % 2 === 1 && Math.random() < 0.6) I.bell(midi(ch[1 + Math.floor(Math.random() * 4)] + 12), t, { vol: 0.04, dur: 1.5 });
      if (s % 4 === 2) I.pluck(midi(ch[0] + 7), t, { vol: 0.06, dur: 1 });
    },
  });
  G.fadeTo = 0; await waitFade();
  SFX.hoot();
  await say('owl', `Look who came, ${G.state.name}! Everyone you met along the way.`);
  const n = G.state.insights.length;
  await say('owl', `You\'ve gathered *${n} of 10* insights. Press *M* any time to see your roadmap: which ideas echo each other, and which ones clash.`);
  const w = hasInsight('amorfati'), e = hasInsight('middleway');
  if (!w || !e) await say('owl', `And you still have the whole *${w ? 'East' : 'West'}* road to explore! The door at the bottom of the café leads back to the Crossroads.`);
  await say('owl', 'Notice something? Socrates questioning, the Stoics and the Buddha on letting go, Laozi\'s flowing water, Camus\'s rock… Different lands, different centuries, *similar questions*.');
  await say('owl', 'Philosophy isn\'t a list of answers to memorize. It\'s a way of *walking*: wondering, questioning, testing, and choosing how to live.');
  await say('owl', 'More rooms are being built: *Epicurus\'s Garden*, *Descartes\'s Stove Room*, *Kant\'s Clockwork Study*, the *Zen Garden*, *Ubuntu Village*… You\'ll find them as grey stars on the map.');
  // end card
  let t0 = G.t;
  const end = setActivity({
    ui() {
      const a = Math.min(1, (G.t - t0) / 1.5);
      ctx.fillStyle = `rgba(8,6,16,${0.85 * a})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a;
      text('THE END', 240, 70, { title: true, size: 18, align: 'center', color: UIC.hl });
      text('…of the beginning.', 240, 98, { size: 18, align: 'center', color: '#e8d5a8' });
      text(`${G.state.name}, you are free to keep wandering.`, 240, 130, { size: 15, align: 'center' });
      text(`Insights gathered: ${n} / 10`, 240, 150, { size: 14, align: 'center', color: UIC.dim });
      text('"The unexamined life is not worth living." · Socrates', 240, 182, { size: 13, align: 'center', color: UIC.dim });
      text('PhilWorld · art, music & sound all generated in code', 240, 222, { size: 12, align: 'center', color: '#7a6f9a' });
      if (G.t - t0 > 2) text('E · continue', 240, 246, { size: 13, align: 'center', color: UIC.hl });
      ctx.globalAlpha = 1;
    },
  });
  SFX.wonder();
  await wait(2);
  await waitUntil(() => hit('act'));
  end();
  AudioSys.setMusic(null);
}
