'use strict';
// ============================================================
// ROOM: Nietzsche's Mountain — death of God, creating values, eternal recurrence
// ============================================================
const PILLARS = [
  { x: 214, label: 'Eternal Heaven' },
  { x: 250, label: 'Absolute Truth' },
  { x: 286, label: 'Rules Handed Down' },
];
Rooms.mountain = {
  name: "Nietzsche's Mountain", sub: 'Sils-Maria, Swiss Alps, 1881', scene: 'mountain',
  spawn: [30, 200], spawnDir: 3,
  walls: [[0, 0, W, 88], [18, 92, 62, 44], [16, 206, 150, 46], [186, 196, 26, 16]],
  surface() { return 'snow'; },
  blocked(x, y) {
    if (x > 352 && x < 436) {
      if (hasInsight('amorfati') && y > 172 && y < 190) return false;
      return true;
    }
    if (x > 194 && x < 310 && y > 88 && y < 147) return true; // the ledge with the pillars
    return false;
  },
  bg(g) {
    vgrad(g, 0, 0, W, 90, '#1b2a4a', '#6a8ab8', 12);
    const r = mulberry(4); for (let i = 0; i < 40; i++) R(g, '#fff', r() * W, r() * 40, 1, 1);
    // peaks
    const peak = (cx, h, w, c, s) => { for (let x = cx - w; x <= cx + w; x++) { const y = 90 - h * (1 - Math.abs(x - cx) / w); R(g, c, x, y, 1, 90 - y); if (y < 90 - h * 0.6) R(g, s, x, y, 1, 3); } };
    peak(80, 60, 90, '#5a6a8a', '#f0f4f8'); peak(260, 80, 110, '#4a5a7a', '#ffffff'); peak(420, 55, 90, '#5a6a8a', '#f0f4f8');
    tex(g, 0, 88, W, H - 88, '#e8eef4', ['#d8e2ec', '#f4f8fc', '#c8d4e0'], 0.1, 71);
    // hut
    R(g, '#6b4a2b', 22, 104, 54, 32); for (let i = 0; i < 4; i++) R(g, '#5a3a1a', 22, 108 + i * 8, 54, 1);
    for (let i = 0; i < 16; i++) R(g, '#4a2a1a', 18 + i, 104 - i, 62 - i * 2, 1);
    R(g, '#f4f8fc', 26, 90, 46, 2); R(g, '#3a2a1a', 44, 118, 12, 18); R(g, '#f7dc6f', 28, 112, 8, 6); R(g, '#f7dc6f', 64, 112, 8, 6);
    // lake
    ellipse(g, 90, 230, 76, 24, '#4a7aa8'); ellipse(g, 90, 228, 72, 20, '#7aaad8'); R(g, '#b8d8f0', 50, 222, 30, 1); R(g, '#b8d8f0', 100, 236, 24, 1);
    // pyramid rock
    for (let i = 0; i < 22; i++) R(g, i < 8 ? '#7a7a82' : '#6a6a72', 199 - i * 0.6, 186 + i, 2 + i * 1.2, 1);
    R(g, '#8a8a92', 198, 186, 2, 6);
    // ledge for pillars
    R(g, '#c8d4e0', 196, 140, 112, 6); R(g, '#a8b4c0', 196, 145, 112, 2);
    // abyss
    R(g, '#0a0a14', 356, 88, 78, H - 88);
    for (let y = 88; y < H; y += 3) { R(g, '#2a3040', 352 + Math.sin(y * 0.2) * 3, y, 6, 3); R(g, '#2a3040', 430 + Math.sin(y * 0.17) * 3, y, 6, 3); }
    for (let y = 120; y < H; y += 1) { g.fillStyle = `rgba(0,0,0,${Math.min(0.6, (y - 120) / 200)})`; g.fillRect(360, y, 70, 1); }
    // far side
    tex(g, 436, 88, 44, H - 88, '#e0e8f0', ['#d0dae4'], 0.1, 72);
    R(g, '#c9a24a', 466, 162, 10, 2); R(g, '#3a2a1a', 470, 164, 2, 16);
  },
  under(g, t) {
    // eagle & snake circling
    const ex = 240 + Math.cos(t * 0.4) * 120, ey = 30 + Math.sin(t * 0.4) * 12; const w = Math.floor(t * 6) % 2;
    R(g, '#3a2a1a', ex - 1, ey, 3, 2); R(g, '#3a2a1a', ex - 5, ey - w, 4, 1); R(g, '#3a2a1a', ex + 2, ey - w, 4, 1);
    R(g, '#27ae60', ex, ey + 2, 1, 1); R(g, '#27ae60', ex + 1, ey + 3, 1, 1);
    // snow
    for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 12 + Math.sin(t + i) * 8) % W, y = (i * 53 + t * 20) % H; R(g, '#fff', x, y, 1, 1); }
    // pillars
    for (let i = 0; i < 3; i++) {
      const p = PILLARS[i], cr = flag('mt_p' + i), fallen = flag('mt_fallen');
      if (fallen) { R(g, '#d8d0bc', p.x - 6, 137, 20, 5); R(g, '#c8c0ac', p.x + 14, 138, 6, 4); continue; }
      drawColumn(g, p.x, 140, 40, '#ece4d0');
      if (cr) { line(g, p.x + 2, 108, p.x + 5, 118, '#5a5a5a'); line(g, p.x + 5, 118, p.x + 3, 126, '#5a5a5a'); }
      if (this.wobble && G.t - this.wobble < 1.5) R(g, 'rgba(255,255,255,0.3)', p.x + Math.sin(G.t * 40) * 1, 100, 8, 40);
    }
    // abyss eyes
    if (this.eyes && G.t - this.eyes < 4) { const a = Math.min(1, (G.t - this.eyes) * 2) * (Math.floor(G.t * 3) % 7 ? 1 : 0); g.fillStyle = `rgba(231,76,60,${a})`; g.fillRect(386, 160, 3, 2); g.fillRect(398, 160, 3, 2); }
    // rope bridge
    if (hasInsight('amorfati')) {
      for (let x = 352; x < 438; x++) { const sag = Math.sin((x - 352) / 86 * Math.PI) * 4; R(g, '#8b5a2b', x, 176 + sag, 1, 1); R(g, '#8b5a2b', x, 186 + sag, 1, 1); if (x % 5 === 0) R(g, '#a0703a', x, 177 + sag, 3, 9); }
    }
  },
  build() {
    const ents = [
      door('stoa', [0, 186, 6, 40], 'stoa', 317, 100, { arrow: 'left', sign: 'Back to the Stoa', signPos: [44, 176] }),
      door('cafe', [474, 168, 6, 30], 'cafe', 240, 250, { arrow: 'right', sign: 'Paris, 1940s', signPos: [446, 150], locked: () => !hasInsight('amorfati') }),
      npc('nietzsche', 150, 170, LOOKS.nietzsche, {
        dir: 3, ph: 26, mark: () => !flag('mt_hammer') || (flag('mt_fallen') && !hasInsight('amorfati') && !flag('mt_demon')) ? '!' : null,
        interact: () => nietzscheTalk(),
      }),
      thing('lantern', 120, 150, (g, t) => { R(g, '#3a2a1a', 119, 128, 2, 22); R(g, '#3a2a1a', 116, 128, 8, 2); R(g, '#c9a24a', 121, 130, 5, 7); R(g, `rgba(255,220,120,${0.6 + 0.3 * Math.sin(t * 7)})`, 122, 132, 3, 4); }, {
        r: 18, ph: 26, label: 'Look at the lantern',
        async interact() { await madmanParable(); },
      }),
      thing('hut', 50, 136, null, {
        r: 22, ph: 8, label: 'Peek into the hut',
        async interact() {
          await say(null, 'A small rented room in Sils-Maria. A desk, piles of notebooks, medicine bottles, and a pair of very worn walking boots.');
          await say('nietzsche', 'I walk six, eight hours a day here. *"All truly great thoughts are conceived while walking."*');
          await say('owl', 'Nietzsche suffered terrible headaches, stomach pain and near-blindness for most of his life. He wrote anyway, often in short bursts. Pain was something he tried to say *yes* to.');
        },
      }),
      thing('trio', 300, 232, (g, t) => drawMetamorphoses(g, t, this.meta || 0), {
        r: 30, ph: 22, label: 'Watch the three animals',
        interact: () => metamorphoses(this),
      }),
      thing('rock', 199, 206, null, {
        r: 24, ph: 26, label: 'Sit by the pyramid rock', mark: () => flag('mt_fallen') && !hasInsight('amorfati') && flag('mt_demon') ? '!' : null,
        async interact() {
          if (!flag('mt_fallen')) { await say(null, 'A huge pyramid-shaped boulder by Lake Silvaplana. Nietzsche said a thought struck him right here in August 1881, "6,000 feet beyond man and time."'); return; }
          await eternalRecurrence();
        },
      }),
      thing('abyss', 360, 150, null, {
        r: 18, ph: 10, label: 'Gaze into the abyss',
        async interact() {
          G.room.eyes = G.t;
          for (let i = 0; i < 4; i++) AudioSys.play('sine', 220, { hz: true, vol: 0.08 / (i + 1), dur: 0.8 }, i * 0.35);
          await say(null, 'Darkness, all the way down. Then two red eyes blink open, looking back up at you.');
          await say('nietzsche', '*"Whoever fights monsters should see to it that he does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you."*');
        },
      }),
    ];
    PILLARS.forEach((p, i) => ents.push(thing('pillar' + i, p.x + 4, 146, null, {
      r: 14, ph: 46, label: () => flag('mt_hammer') ? 'Tap with the hammer' : 'Examine pillar', iy: 0,
      enabled: () => !flag('mt_fallen'),
      mark: () => flag('mt_hammer') && !flag('mt_p' + i) ? '!' : null,
      async interact() {
        if (!flag('mt_hammer')) { await say(null, `A gleaming marble pillar, carved: *"${p.label}."* It holds up… something. It looks very solid.`); return; }
        if (flag('mt_p' + i)) { await say(null, 'Already cracked.'); return; }
        flag('mt_p' + i, 1); SFX.hollow(); G.room.wobble = G.t; shake(0.15);
        await say(null, `TOCK… The pillar "${p.label}" rings *hollow*.`);
        if (PILLARS.every((_, k) => flag('mt_p' + k))) await pillarsFall();
      },
    })));
    return ents;
  },
  onEnter() { this.meta = 0; },
  hint() {
    if (!flag('mt_hammer')) return 'Talk to the man with the *enormous mustache*. That\'s Nietzsche.';
    if (!flag('mt_fallen')) return 'Tap each of the *three pillars* on the ledge with the hammer (E).';
    if (!hasInsight('amorfati')) return 'Go sit by the big *pyramid-shaped rock* beside the lake.';
    return 'A *rope bridge* now crosses the abyss to the east. Beyond it: Paris, 1940s.';
  },
};

function drawMetamorphoses(g, t, s) {
  const b = Math.floor(t * 2) % 2;
  // camel
  const cx = 276, cy = 236;
  R(g, '#c8a060', cx - 8, cy - 12, 16, 6); R(g, '#b89050', cx - 5, cy - 15, 4, 3); R(g, '#b89050', cx + 1, cy - 15, 4, 3);
  R(g, '#c8a060', cx + 6, cy - 18, 3, 8); R(g, '#c8a060', cx + 7, cy - 19, 5, 3);
  for (const lx of [-7, -4, 3, 6]) R(g, '#a08040', cx + lx, cy - 6, 2, 6);
  R(g, '#6b4a2b', cx - 7, cy - 21, 10, 6); R(g, '#8b5a2b', cx - 6, cy - 22, 8, 1);
  // lion
  const lx = 302, ly = 238; drawLion(g, lx, ly, s === 2 ? 'roar' : null, t);
  // child
  drawPerson(g, 330, 238, { skin: '#f0d0a8', hairStyle: 'curly', hairC: '#d8b26e', robe: '#5dade2', robe2: '#2e86c1' }, 0, s === 3 ? Math.floor(t * 8) % 4 : 0, { armsUp: s === 3 && b, smile: true });
  if (s === 3) { disc(g, 340, 226 - Math.abs(Math.sin(t * 6)) * 8, 2, '#e74c3c'); }
}
async function metamorphoses(Rm) {
  await say('nietzsche', 'In my book *Thus Spoke Zarathustra*, the spirit goes through *three transformations*.');
  Rm.meta = 1; for (let i = 0; i < 3; i++) { SFX.thud(); await wait(0.4); }
  await say('nietzsche', 'First, the *camel*. It kneels and says: "Load me up!" It carries all the heavy values it was handed: duty, tradition, *"Thou shalt."*');
  Rm.meta = 2; SFX.roar(); shake(0.2);
  await say('nietzsche', 'Then the *lion*. In the desert it meets a great dragon whose every scale reads *"Thou shalt."* The lion roars: *"I will!"* It wins its freedom by saying *No*.');
  Rm.meta = 3; [72, 76, 79, 84, 79, 76].forEach((n, i) => AudioSys.play('bell', n, { vol: 0.08, dur: 0.8 }, i * 0.1));
  await say('nietzsche', 'But the lion can\'t *create*. So last comes the *child*: innocence, forgetting, a game, a new beginning, a sacred *Yes*. The child makes *new* values.');
  Rm.meta = 0;
}

async function madmanParable() {
  showVignette((v, t) => {
    R(v, '#87ceeb', 0, 0, 160, 50); R(v, '#d8c8a8', 0, 50, 160, 40); disc(v, 140, 14, 7, '#fff8d0');
    drawPerson(v, 78, 76, { skin: '#f0caa8', hairStyle: 'spiky', hairC: '#3a2a1a', robe: '#5a4a3a', robe2: '#3a2a1a', beard: '#3a2a1a' }, 0, Math.floor(t * 6) % 4, { hold: (g, x, y) => { R(g, '#c9a24a', x + 5, y - 14, 3, 4); R(g, '#f7dc6f', x + 6, y - 13, 1, 2); } });
    for (let i = 0; i < 4; i++) { const x = 20 + i * 36 + (i > 1 ? 30 : 0); drawPerson(v, x, 82, { skin: '#eab994', hairStyle: 'short', hairC: '#2b1d14', robe: ['#2e86c1', '#c0392b', '#27ae60', '#8e44ad'][i], hat: i % 2 ? 'beret' : null }, i < 2 ? 3 : 2, 0, { smile: true, bob: Math.round(Math.sin(t * 10 + i)) }); }
  }, { title: 'The Madman (The Gay Science, 1882)' });
  await say('nietzsche', 'Hear a story I wrote. A madman lights a lantern on a bright morning and runs into the marketplace, crying: "I seek God! I seek God!"');
  await say('nietzsche', 'The people there don\'t believe in God anymore. They laugh. "Did he get lost? Did he emigrate?"');
  await say('nietzsche', 'The madman glares: *"God is dead. God remains dead. And we have killed him."*');
  hideVignette();
  await say('nietzsche', 'Don\'t mistake me. I\'m not *cheering*. I\'m describing something: in modern Europe, people no longer truly *live by* the old beliefs, yet they still lean on the values those beliefs held up.');
  await say('nietzsche', 'The madman says he came *too early*. Nobody yet sees what it means: if the foundation is gone, what holds up *meaning*, *morality*, *truth*?');
  await say('owl', 'People still argue about this today. Many religious thinkers strongly disagree with Nietzsche, and that argument is part of philosophy too.');
}

async function nietzscheTalk() {
  if (!flag('mt_hammer')) {
    await say('nietzsche', 'Ah, a visitor on my mountain! I am Friedrich Nietzsche. Excuse the mustache. It has its own opinions.');
    await madmanParable();
    await say('nietzsche', 'So. Take this hammer. I *philosophize with a hammer*. Not to smash things blindly, but to *tap* the great idols, like a tuning fork, and hear whether they ring *hollow*.');
    SFX.coin(); flag('mt_hammer', 1);
    await say('nietzsche', 'Those three gleaming pillars on the ledge: tap each one. Listen closely.');
    return;
  }
  if (!flag('mt_fallen')) { await say('nietzsche', 'Tap them! All three. Don\'t be afraid of what you hear.'); return; }
  if (!hasInsight('amorfati')) {
    await say('nietzsche', 'One more test, the heaviest. Go sit by the *pyramid rock* by the lake. That\'s where this thought first came to me.');
    flag('mt_demon', 1); return;
  }
  const c = await ask('nietzsche', 'Well, friend?', ['What is the Übermensch?', 'Were you misunderstood?', 'Goodbye.']);
  if (c === 0) {
    await say('nietzsche', 'The *Übermensch*, the "Overhuman," is an ideal: someone who creates their own values and says *yes* to life, with all its suffering.');
    await say('nietzsche', '"Man is a rope stretched between animal and Übermensch: a rope over an abyss." Ha! You\'ll see that rope soon.');
  }
  if (c === 1) {
    await say('nietzsche', 'Terribly. After my mind collapsed in 1889, my sister edited my notes and later bent my ideas to fit German nationalism and antisemitism, which *I despised*.');
    await say('owl', 'True. Nietzsche wrote openly against antisemites, and fell out with his old friend Wagner partly over it. Scholars spent decades rescuing his real ideas.');
  }
}

async function pillarsFall() {
  await wait(0.5);
  SFX.rumble(2.5); shake(1.2);
  for (let i = 0; i < 3; i++) { SFX.crack(); await wait(0.25); }
  flag('mt_fallen', 1);
  AudioSys.play('pad', 38, { vol: 0.12, dur: 5, lp: 400 });
  await narrate('CRASH. The pillars topple and shatter in the snow. Cold wind howls through the empty space where they stood.');
  await say('nietzsche', 'There. Do you feel it? Dizziness. As if we\'re falling in every direction. If nothing is *given* from above, does anything matter at all?');
  await say('nietzsche', 'That feeling is *nihilism*: "nothing has value." It\'s the great danger of our age. But it is *not* the end of the story.');
  await say('nietzsche', 'If values aren\'t handed down to us, then we must *create* them. That is the task: *become who you are*.');
  await say('nietzsche', 'Now, one last test, the heaviest of all. Go sit by the *pyramid rock* by the lake.');
  flag('mt_demon', 1);
}

async function eternalRecurrence() {
  const melody = [62, 65, 69, 67, 65, 64, 62, 57];
  let layers = 0, loops = 0, dark = false;
  AudioSys.setMusic({
    bpm: 84, custom: (t, s, I, midi) => {
      const k = s % 16; if (k === 0) loops++;
      if (k % 2 === 0) {
        const n = melody[k / 2] - (dark ? 12 : 0);
        I.piano(midi(n), t, { vol: 0.13, dur: 1.2 });
        if (layers >= 1) I.pluck(midi(n - 12), t, { vol: 0.08, dur: 1.2 });
        if (layers >= 2) I.bell(midi(n + 12), t, { vol: 0.05, dur: 1.5 });
        if (layers >= 3 && k % 4 === 0) [0, 4, 7].forEach(d => I.pad(midi(50 + d), t, { vol: 0.03, dur: 2.5, wave: 'triangle', lp: 2000 }));
      }
      if (dark && k === 0) I.drum(45, t, { vol: 0.3 });
    },
  });
  let sunT = 0;
  showVignette((v, t) => {
    sunT = (t / 4) % 1;
    const day = Math.sin(sunT * Math.PI);
    R(v, mix('#101830', '#87ceeb', day), 0, 0, 160, 90);
    disc(v, 10 + sunT * 140, 70 - day * 55, 6, '#fff3b0');
    if (day < 0.3) { disc(v, 130, 18, 5, '#e8e8f0'); for (let i = 0; i < 12; i++) R(v, '#fff', (i * 37) % 160, (i * 17) % 40, 1, 1); }
    R(v, '#3a5a3a', 0, 70, 160, 20); drawTree(v, 30, 72, { leaf: '#2a4a2a', size: 0.8 }); drawTree(v, 130, 72, { leaf: '#2a4a2a', size: 0.8 });
    // the spider in the moonlight
    line(v, 30, 50, 52, 40, '#ccc'); R(v, '#111', 44 + Math.sin(t * 2) * 2, 43, 3, 2);
    drawPerson(v, 40 + sunT * 80, 84, playerLook(), 3, Math.floor(t * 6) % 4, {});
    if (dark) { v.fillStyle = 'rgba(40,0,40,0.35)'; v.fillRect(0, 0, 160, 90); }
    if (layers >= 2) for (let i = 0; i < 6; i++) drawSpark(v, 20 + i * 25, 20 + (i % 3) * 10, t + i);
  }, { title: 'Again… and again… and again…' });
  await say('demon', '…What if, one day or night, a *demon* crept after you into your loneliest loneliness and said:');
  await say('demon', '"This life, as you now live it, you will have to live *once more*, and *innumerable times more*. Every pain, every joy, every thought and sigh, all in the same order."');
  await say('demon', '"Even this spider, and this moonlight between the trees. Even this moment, and I myself. The eternal hourglass of existence, turned over again and again, and you with it, speck of dust!"');
  let c = await ask(null, 'How do you answer the demon?', ['Throw yourself down, gnash your teeth and curse him!', '"You are a god, and never have I heard anything more divine!"']);
  if (c === 0) {
    dark = true; AudioSys.play('pad', 33, { vol: 0.1, dur: 4, lp: 300 });
    await say('demon', 'Again. The same pains. The same regrets. The same small, grey days. Forever.');
    await say('nietzsche', 'Feel how heavy that is? Then the real question is not "is it true?" It\'s this: *how would you have to live, so that you could say yes to it?*');
    c = await ask(null, 'Then…', ['…I would live so that I\'d *want* it again. Yes!', '"Was that life? Well then! Once more!"']);
    dark = false;
  }
  for (let k = 1; k <= 3; k++) { layers = k; SFX.sparkle(); await wait(1.0); }
  await say('nietzsche', 'YES! Hear it? The very same melody, but now you *love* it. Nothing changed except your *yes*.');
  await say('nietzsche', 'That is *amor fati*: love of fate. Not just putting up with what happens, but *loving* it, even the hard parts. Wanting nothing to be different, not forward, not backward, not in all eternity.');
  hideVignette();
  await giveInsight('amorfati');
  AudioSys.setMusic(null);
  SFX.rumble(0.8);
  await say('nietzsche', 'Look: a *rope* now stretches across the abyss. "Man is a rope over an abyss." Cross it. On the other side, some Parisians have been reading me very closely…');
}
