'use strict';
// ============================================================
// ROOM: Confucius's Courtyard — ren, li, and harmony of relationships
// ============================================================
const PAIRS = [
  {
    id: 'ruler', a: ['ruler', 150, 132], b: ['minister', 172, 134], note: 60, label: 'Ruler & Minister',
    q: 'How should a *ruler* and a *minister* treat each other?',
    opts: [
      ['The ruler commands; the minister obeys, whatever happens.', 0, 'Blind obedience isn\'t loyalty! A good minister *speaks up* when the ruler is wrong, respectfully but honestly.'],
      ['The ruler leads by virtue; the minister serves loyally and speaks up.', 1, '"Govern by virtue and you will be like the North Star: it stays in place while all the other stars turn around it."'],
      ['Each looks out only for themselves.', 0, 'Then the state falls apart. Rulers who serve only themselves lose the people\'s trust, and without trust no state can stand.'],
    ],
  },
  {
    id: 'parent', a: ['parent', 318, 132], b: ['child', 340, 136], note: 62, label: 'Parent & Child',
    q: 'How should a *parent* and a *child* treat each other?',
    opts: [
      ['The child must fear the parent.', 0, 'Fear isn\'t respect. Confucius said even dogs and horses get fed. What matters is *reverence* and care, given willingly.'],
      ['They\'re basically strangers sharing a roof.', 0, 'For Confucius, the family is where we *first* learn to be human. It\'s the root of every other virtue.'],
      ['The parent cares and guides; the child respects, and cares for them when they\'re old.', 1, 'This is *xiao*, filial piety: love and respect flowing up, care and guidance flowing down.'],
    ],
  },
  {
    id: 'sibling', a: ['elder', 96, 182], b: ['younger', 118, 186], note: 64, label: 'Elder & Younger Sibling',
    q: 'How should an *elder* and a *younger* sibling treat each other?',
    opts: [
      ['The elder is kind and protective; the younger is respectful.', 1, 'Kindness from above, respect from below. Each role carries a *duty*, not just a privilege.'],
      ['The elder bosses; the younger obeys.', 0, 'Bossing isn\'t leading. An elder who isn\'t kind hasn\'t earned the younger\'s respect.'],
      ['Constant rivalry! May the best one win.', 0, 'A family at war with itself can\'t teach harmony to anyone else.'],
    ],
  },
  {
    id: 'spouse', a: ['husband', 380, 182], b: ['wife', 402, 182], note: 67, label: 'Husband & Wife',
    q: 'How should *spouses* treat each other?',
    opts: [
      ['Each has their role, with mutual respect and care.', 1, 'In Confucius\'s day these roles were *unequal*, and later thinkers argued hard about that. The core idea that survives: duties flow *both ways*.'],
      ['One decides everything; the other just goes along.', 0, 'Without mutual respect there\'s no harmony, only silence.'],
      ['They ignore each other.', 0, 'A cold home spreads coldness outward to the whole village.'],
    ],
  },
  {
    id: 'friend', a: ['friendA', 330, 238], b: ['friendB', 352, 238], note: 69, label: 'Friend & Friend',
    q: 'How should *friends* treat each other?',
    opts: [
      ['Friends flatter each other and agree about everything.', 0, 'Confucius warned against friends who flatter. A true friend tells you the truth, kindly.'],
      ['Friends are useful contacts.', 0, 'Using people isn\'t friendship. It\'s trade.'],
      ['Friends are equals who are trustworthy and help each other grow.', 1, 'The only relationship of *equals* among the five. "Have no friends who are not as good as yourself": friends lift each other up.'],
    ],
  },
];
const CY_LOOKS = { ruler: LOOKS.ruler, minister: LOOKS.minister, parent: LOOKS.parent, child: LOOKS.child, elder: LOOKS.elder, younger: LOOKS.younger, husband: LOOKS.husband, wife: LOOKS.wife, friendA: LOOKS.friendA, friendB: LOOKS.friendB };
const CY_NAMES = { ruler: 'The Ruler', minister: 'The Minister', parent: 'Parent', child: 'Child', elder: 'Elder Sister', younger: 'Younger Brother', husband: 'Husband', wife: 'Wife', friendA: 'Friend', friendB: 'Friend' };

Rooms.courtyard = {
  name: "Confucius's Courtyard", sub: 'State of Lu, China, c. 500 BCE', scene: 'courtyard',
  spawn: [22, 196], spawnDir: 3,
  walls: [[0, 0, W, 90], [194, 212, 92, 36], [32, 86, 76, 30], [420, 104, 18, 10]],
  surface(x, y) { return 'stone'; },
  bg(g) {
    vgrad(g, 0, 0, W, 20, '#f5b7b1', '#fdedec', 5);
    // hall roof
    for (let i = 0; i < 16; i++) R(g, i % 2 ? '#3a3a42' : '#4a4a52', -10 + i * 0.5, 10 + i, W + 20 - i, 1);
    R(g, '#2a2a32', 0, 26, W, 3); for (let x = 0; x < W; x += 6) R(g, '#5a5a62', x, 10, 3, 16);
    R(g, '#c9a24a', 0, 29, W, 2);
    R(g, '#6a1a1a', 0, 31, W, 52); R(g, '#4a0e0e', 0, 31, W, 4);
    for (let x = 14; x < W; x += 52) { R(g, '#c0392b', x, 31, 8, 56); R(g, '#e74c3c', x + 1, 31, 2, 56); R(g, '#8b1e1e', x + 6, 31, 2, 56); }
    // lattice windows
    for (let x = 36; x < W - 40; x += 52) { R(g, '#3a1a0e', x, 44, 18, 26); for (let k = 0; k < 4; k++) { R(g, '#c9a24a', x, 44 + k * 7, 18, 1); R(g, '#c9a24a', x + k * 6, 44, 1, 26); } }
    // steps
    R(g, '#b8b0a0', 160, 83, 160, 4); R(g, '#a8a090', 168, 87, 144, 3);
    // stone courtyard
    tex(g, 0, 90, W, H - 90, '#c8c0b0', ['#b8b0a0', '#d8d0c0', '#a8a090'], 0.08, 81);
    for (let y = 90; y < H; y += 16) R(g, '#b0a898', 0, y, W, 1);
    for (let y = 90; y < H; y += 16) for (let x = (y / 16 % 2) * 16; x < W; x += 32) R(g, '#b0a898', x, y, 1, 16);
    // pond
    R(g, '#8a8a8a', 192, 210, 96, 40); R(g, '#3a6a7a', 196, 214, 88, 32); R(g, '#5a8a9a', 196, 214, 88, 2);
    for (let i = 0; i < 4; i++) { disc(g, 210 + i * 20, 228 + (i % 2) * 8, 3, '#3a8a3a'); }
    // bell rack (bianzhong)
    R(g, '#5a3a1a', 32, 86, 76, 3); R(g, '#5a3a1a', 34, 86, 3, 32); R(g, '#5a3a1a', 103, 86, 3, 32); R(g, '#5a3a1a', 32, 114, 76, 3);
    // name plaque
    R(g, '#1a1a1a', 288, 60, 40, 14); R(g, '#c9a24a', 290, 62, 36, 10); for (let i = 0; i < 4; i++) R(g, '#1a1a1a', 294 + i * 8, 64, 4, 6);
    // moon gate east
    R(g, '#e8e0d0', 444, 90, 36, 120); R(g, '#c8c0b0', 444, 90, 2, 120);
    for (let dy = -22; dy <= 22; dy++) { const w = Math.floor(Math.sqrt(484 - dy * dy)); R(g, '#7aa86a', 466 - w + 4, 170 + dy, w * 2, 1); }
    R(g, '#3a3a42', 440, 86, 40, 6);
    // west gate
    R(g, '#8b1e2b', 0, 168, 8, 2); R(g, '#8b1e2b', 0, 222, 8, 2);
    // willow
    R(g, '#5a3a1a', 52, 214, 4, 30);
    for (let i = 0; i < 14; i++) { const x = 38 + i * 2.4; R(g, '#7ab86a', x, 206 + Math.abs(7 - i), 1, 22 + (i % 3) * 4); }
    // lanterns are animated
    // mirror stand
    R(g, '#5a3a1a', 428, 104, 2, 12); ellipse(g, 429, 98, 6, 7, '#c9a24a'); ellipse(g, 429, 98, 4, 5, '#aed6f1');
  },
  under(g, t) {
    // koi
    for (let i = 0; i < 3; i++) { const a = t * (0.5 + i * 0.2) + i * 2; const x = 240 + Math.cos(a) * 30, y = 230 + Math.sin(a * 1.3) * 10; R(g, i === 1 ? '#f5f5f5' : '#e67e22', x, y, 4, 2); R(g, '#c0392b', x + (Math.cos(a) > 0 ? 3 : -1), y, 2, 1); }
    // bells
    for (let i = 0; i < 5; i++) {
      const lit = flag('cy_' + PAIRS[i].id), x = 40 + i * 13, h = 8 + i;
      const sw = this.ring && this.ring[i] && G.t - this.ring[i] < 1 ? Math.sin((G.t - this.ring[i]) * 30) : 0;
      R(g, '#3a2a1a', x + 4, 89, 1, 3);
      R(g, lit ? '#e0c060' : '#8a7a5a', x + sw, 92, 9, h); R(g, lit ? '#fff0a0' : '#a89a7a', x + 1 + sw, 93, 2, h - 2);
      if (lit) drawSpark(g, x + 5, 92 + h + 2, t + i);
    }
    for (const x of [60, 200, 280, 420]) drawLantern(g, x, 112, t);
  },
  build() {
    const Rm = this;
    Rm.ring = [];
    const ents = [
      door('west', [0, 172, 6, 48], 'crossroads', 462, 160, { arrow: 'left', sign: 'Crossroads', signPos: [36, 160] }),
      door('east', [474, 150, 6, 44], 'valley', 22, 210, { arrow: 'right', sign: "Laozi's Valley", signPos: [442, 136], locked: () => !hasInsight('harmony'), lockedMsg: 'Confucius: "First bring harmony to this courtyard, then you may walk on."' }),
      npc('confucius', 240, 98, LOOKS.confucius, { ph: 30, mark: () => !flag('cy_intro') || (PAIRS.every(p => flag('cy_' + p.id)) && !hasInsight('harmony')) ? '!' : null, interact: () => confuciusTalk() }),
      thing('bells', 70, 118, null, {
        r: 26, ph: 30, label: 'Strike the bells',
        async interact() {
          const notes = [60, 62, 64, 67, 69, 72];
          for (let i = 0; i < 6; i++) { AudioSys.play('bell', notes[i], { vol: 0.12, dur: 2.5 }); Rm.ring[i % 5] = G.t; await wait(0.22); }
          await say(null, 'A *bianzhong*: a set of bronze bells, each tuned to a different note. Some ancient sets had over 60 bells!');
          await say('confucius', 'Music shapes the heart. When I heard the ancient *Shao* music in the state of Qi, I didn\'t notice the taste of meat for three months!');
          await say('owl', 'For Confucius, music and ritual worked together: ritual gives *order*, music gives *harmony*. A good society needs both.');
        },
      }),
      thing('plaque', 308, 92, null, {
        r: 20, ph: 30, label: 'Read the plaque',
        async interact() {
          await say(null, 'Gold characters on black lacquer: *Zhengming*, "the rectification of names."');
          await say('confucius', 'A ruler must *act* like a ruler. A father must *act* like a father. If names don\'t match reality, words lose their meaning, and then nothing can be done right.');
          await say('owl', 'Imagine calling a cruel king "the people\'s protector." Confucius thought fixing the gap between *words* and *deeds* was the first step to fixing a society.');
        },
      }),
      thing('mirror', 429, 112, null, {
        r: 20, ph: 22, label: 'Look into the mirror',
        async interact() {
          showVignette((v, t) => {
            const flip = Math.floor(t / 1.6) % 2;
            R(v, flip ? '#3a2a40' : '#2a3a40', 0, 0, 160, 90); R(v, '#c9a24a', 79, 0, 2, 90);
            drawPerson(v, 40, 76, LOOKS.child, 3, 0, { armsUp: !flip }); drawPerson(v, 58, 76 + (flip ? 0 : 2), LOOKS.younger, 2, 0, { closedEyes: !flip });
            drawPerson(v, 102, 76 + (flip ? 2 : 0), LOOKS.child, 3, 0, { closedEyes: flip }); drawPerson(v, 120, 76, LOOKS.younger, 2, 0, { armsUp: flip });
          }, { title: 'How would it feel the other way round?' });
          await say(null, 'In the bronze mirror, a boy is about to shove his friend. Then the image flips: the *friend* shoves *him*.');
          await say('confucius', 'A student asked me: "Is there one word to guide your whole life?" I said: *shu*, "reciprocity." *Do not impose on others what you yourself do not want.*');
          await say('owl', 'Versions of this "Golden Rule" appear in many traditions: Hillel in Judaism, Jesus in Christianity, the Mahabharata in Hinduism. Confucius said it around 500 BCE.');
          hideVignette();
        },
      }),
      thing('pond', 240, 252, null, {
        r: 26, ph: 6, label: 'Watch the koi',
        async interact() {
          SFX.splash();
          await say('confucius', 'Once, standing by a river, I said: "It flows on like this, never stopping, day and night."');
          await say('owl', 'People still debate what he meant. Time slipping away? Or steady, ceaseless effort, like the river? Maybe both!');
        },
      }),
      npc('student', 420, 236, { skin: '#e8c095', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#5d6d7e', robe2: '#2c3e50', long: true }, {
        dir: 2,
        async interact() {
          const sp = { name: 'Yan Hui, a student', look: this.look, voice: 380 };
          await say(sp, 'I\'m the Master\'s favorite student, Yan Hui. He never wrote a book. We students wrote down his sayings after he died. They\'re called the *Analects*.');
          await say(sp, 'The very first line: *"Is it not a joy to learn, and to practice what you have learned?"*');
          await say(sp, 'He taught anyone who came with even a small gift of dried meat, rich or poor. That was unusual in his time.');
        },
      }),
    ];
    for (const P of PAIRS) {
      for (const side of ['a', 'b']) {
        const [key, x, y] = P[side];
        ents.push(npc(key, x, y, CY_LOOKS[key], {
          faces: false, pair: P, side, label: () => flag('cy_' + P.id) ? 'Talk' : 'Help them',
          update() {
            const done = flag('cy_' + P.id);
            this.dir = done ? (side === 'a' ? 3 : 2) : (side === 'a' ? 2 : 3);
          },
          draw(g, t) {
            const done = flag('cy_' + P.id);
            const bow = done && (Math.floor(t / 3 + (side === 'a' ? 0 : 0.1)) % 4 === 0);
            drawPerson(g, this.x, this.y, this.look, this.dir, 0, Object.assign({ smile: done, bow }, this.pose));
            if (!done && flag('cy_intro')) { const k = Math.floor(t * 2) % 2; disc(g, (P.a[1] + P.b[1]) / 2 + 2, this.y - 30 - k, 3, 'rgba(120,120,130,0.8)'); }
            if (this.angry && G.t - this.angry < 1.2) { R(g, '#e74c3c', this.x - 1, this.y - 32, 3, 1); R(g, '#e74c3c', this.x, this.y - 33, 1, 3); }
          },
          mark: () => flag('cy_intro') && !flag('cy_' + P.id) && side === 'a' ? '!' : null,
          interact: () => pairTalk(P, ents),
        }));
      }
    }
    return ents;
  },
  hint() {
    if (!flag('cy_intro')) return 'Talk to *Confucius* on the hall steps.';
    const left = PAIRS.filter(p => !flag('cy_' + p.id));
    if (left.length) return `Set each relationship right. Still out of tune: *${left.map(p => p.label).join(', ')}*.`;
    if (!hasInsight('harmony')) return 'All five ring true! Go back to *Confucius*.';
    return 'Try bowing with *B* near people. The *moon gate* to the east leads to Laozi\'s Valley.';
  },
};

async function confuciusTalk() {
  if (!flag('cy_intro')) {
    await say('confucius', 'Welcome, traveler. I am Kong Qiu. My students call me Kongzi, "Master Kong." In the West you\'ll call me *Confucius*.');
    await say('confucius', 'I lived in a time of chaos: warring states, greedy lords, broken families. I asked: how do people live *well together*?');
    await say('confucius', 'My answer: society is like a set of bells. Each *relationship* is one bell. When each is in its proper place, the whole rings in *harmony*.');
    await say('confucius', 'But look around. Five relationships have turned their backs on each other. Their bells hang silent.');
    await say('confucius', 'Go to each pair and help them find the right way to treat one another. Listen: you\'ll *hear* when it\'s right.');
    flag('cy_intro', 1);
    return;
  }
  if (!PAIRS.every(p => flag('cy_' + p.id))) {
    const n = PAIRS.filter(p => flag('cy_' + p.id)).length;
    await say('confucius', `${n} of 5 bells ring true. Keep going. And notice: in every pair, duties flow *both ways*.`);
    return;
  }
  if (!hasInsight('harmony')) {
    await say('confucius', 'Listen…');
    const Rm = Rooms.courtyard;
    const mel = [60, 62, 64, 67, 69, 67, 64, 62, 60, 64, 67, 72];
    for (let i = 0; i < mel.length; i++) { AudioSys.play('bell', mel[i], { vol: 0.12, dur: 2.5 }); Rm.ring[[0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 3, 4][i]] = G.t; await wait(0.3); }
    [60, 64, 67, 72].forEach(n => AudioSys.play('bell', n, { vol: 0.08, dur: 4 }));
    await wait(0.6);
    await say('confucius', 'Harmony. Not sameness: five *different* notes, each in its place, sounding together.');
    await say('confucius', 'The heart of it is *ren*: humaneness, warm-heartedness toward others. It starts at home and ripples outward to the village, the state, the world.');
    await say('confucius', 'And *li*: ritual, courtesy, manners. Li is how ren becomes *visible*. A bow, a greeting, a respectful silence. Small acts that hold a society together.');
    await say('confucius', 'The person who lives this way is a *junzi*, an exemplary person. Not by birth, but by *character*. Anyone can become one, through learning.');
    await giveInsight('harmony');
    await say('confucius', 'Let me teach you one piece of li. Press *B* to bow. Try it near people. You\'ll see they answer in kind.');
    flag('bow', 1);
    await say('owl', 'B to bow! Works everywhere in PhilWorld. The moon gate to the *east* is open now.');
    return;
  }
  const c = await ask('confucius', 'Yes, my friend?', ['What is a junzi?', 'Did your ideas last?', 'Farewell.']);
  if (c === 0) await say('confucius', 'The junzi seeks the cause in *himself*; the petty person seeks it in *others*. The junzi is calm and at ease; the petty person is always anxious.');
  if (c === 1) {
    await say('owl', 'For over 2,000 years! Confucian classics became the basis of China\'s imperial exams, used to choose government officials from about 600 to 1905 CE.');
    await say('owl', 'Today Confucian ideas still shape life in China, Korea, Japan, Vietnam and beyond. They\'re also hotly debated: some say they encourage too much obedience; others say they\'re about mutual care.');
  }
}

async function pairTalk(P, ents) {
  const A = ents.find(e => e.id === P.a[0]), B = ents.find(e => e.id === P.b[0]);
  if (!flag('cy_intro')) { await say({ name: CY_NAMES[P.a[0]], look: CY_LOOKS[P.a[0]], voice: 300 }, 'Hmph. Talk to the Master first.'); return; }
  if (flag('cy_' + P.id)) {
    AudioSys.play('bell', P.note, { vol: 0.1, dur: 2 });
    await say({ name: CY_NAMES[P.a[0]], look: CY_LOOKS[P.a[0]], voice: 320 }, pick(['Thank you. Everything feels lighter now.', 'Ah, much better. Can you hear our bell?', 'We bowed to each other this morning. It\'s amazing what that does.']));
    return;
  }
  while (true) {
    AudioSys.play('pluck', P.note, { vol: 0.08, dur: 1, wave: 'sawtooth', saw: 1 }); AudioSys.play('pluck', P.note + 1, { vol: 0.08, dur: 1, wave: 'sawtooth', saw: 1 });
    await say(null, `The ${P.label.toLowerCase()} stand with their backs to each other. Their note sounds sour.`);
    const c = await ask('confucius', P.q, P.opts.map(o => o[0]));
    const o = P.opts[c];
    if (o[1]) {
      flag('cy_' + P.id, 1);
      SFX.success(); AudioSys.play('bell', P.note, { vol: 0.15, dur: 3 }, 0.3);
      Rooms.courtyard.ring[PAIRS.indexOf(P)] = G.t + 0.3;
      A.pose = { bow: true }; B.pose = { bow: true };
      await say('confucius', o[2]);
      A.pose = {}; B.pose = {};
      const n = PAIRS.filter(p => flag('cy_' + p.id)).length;
      if (n === 5) await say('owl', 'All five bells ring! Go tell *Confucius*!');
      return;
    }
    SFX.discord(); A.angry = G.t; B.angry = G.t; shake(0.15);
    await say('confucius', o[2]);
    const again = await ask(null, 'Try again?', ['Yes', 'Later']);
    if (again === 1) return;
  }
}
