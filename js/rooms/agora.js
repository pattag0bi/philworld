'use strict';
// ============================================================
// ROOM: The Agora — Socrates & the method of questioning
// ============================================================
Rooms.agora = {
  name: 'The Agora', sub: 'Athens, 399 BCE', scene: 'agora',
  spawn: [456, 200], spawnDir: 2,
  walls: [[0, 0, W, 76], [104, 148, 34, 20], [370, 104, 54, 18], [384, 196, 56, 16], [300, 226, 22, 10]],
  surface() { return 'stone'; },
  bg(g) {
    vgrad(g, 0, 0, W, 34, '#5dade2', '#aed6f1', 8);
    // acropolis
    for (let x = 250; x < 470; x++) { const h = 20 + Math.max(0, 12 - Math.abs(x - 360) * 0.12) + Math.sin(x * 0.2) * 1; R(g, '#a89070', x, 34 - (h - 20) * 1.2, 1, H); }
    R(g, '#f0ead8', 322, 10, 76, 3); R(g, '#e0d8c4', 326, 6, 68, 4); R(g, '#d0c8b4', 340, 3, 40, 3);
    for (let i = 0; i < 9; i++) R(g, '#f0ead8', 324 + i * 9, 13, 3, 12);
    R(g, '#e0d8c4', 320, 25, 80, 2);
    // stoa colonnade (back wall)
    R(g, '#c8b89a', 0, 34, W, 42); R(g, '#8a7a5a', 0, 34, W, 4); R(g, '#b8a888', 0, 38, W, 2);
    R(g, '#3a2a1a', 0, 44, W, 32);
    for (let x = 6; x < W; x += 30) drawColumn(g, x, 76, 34, '#ece4d0');
    // paving
    tex(g, 0, 76, W, H - 76, '#d8c8a8', ['#c8b898', '#e0d4b8', '#b8a888'], 0.06, 21);
    for (let y = 76; y < H; y += 14) R(g, '#c0b090', 0, y, W, 1);
    for (let y = 76; y < H; y += 14) for (let x = (y / 14 % 2) * 12; x < W; x += 24) R(g, '#c0b090', x, y, 1, 14);
    // fountain
    ellipse(g, 121, 160, 22, 10, '#a89878'); ellipse(g, 121, 158, 19, 8, '#5a9ac0'); R(g, '#d8d0c0', 118, 140, 6, 18); R(g, '#e8e0d0', 115, 138, 12, 3);
    // market stall: olives & amphorae (top-right)
    R(g, '#8b5a2b', 370, 106, 54, 12); R(g, '#a0703a', 370, 104, 54, 3);
    for (let i = 0; i < 6; i++) { R(g, i % 2 ? '#c0392b' : '#f5f5f5', 368 + i * 10, 84, 10, 6); }
    R(g, '#6b4a2b', 371, 84, 2, 22); R(g, '#6b4a2b', 420, 84, 2, 22);
    for (let i = 0; i < 4; i++) { disc(g, 378 + i * 12, 101, 4, '#4a5a2a'); R(g, '#3a4a1a', 376 + i * 12, 99, 1, 1); }
    // pottery stall (bottom-right)
    R(g, '#8b5a2b', 384, 198, 56, 12);
    for (let i = 0; i < 4; i++) { ellipse(g, 392 + i * 13, 194, 4, 6, '#c0603a'); R(g, '#1a1a1a', 389 + i * 13, 193, 6, 1); R(g, '#c0603a', 391 + i * 13, 186, 2, 3); }
    // hemlock table
    R(g, '#6b4a2b', 300, 228, 22, 6); R(g, '#5a3a1a', 302, 234, 2, 4); R(g, '#5a3a1a', 318, 234, 2, 4);
    // olive trees in pots
    for (const [x, y] of [[60, 230], [200, 100], [280, 100]]) { R(g, '#a0603a', x - 5, y - 6, 10, 6); drawTree(g, x, y - 6, { leaf: '#6a8a4a', size: 0.7, fruit: '#2a3a1a' }); }
    // oracle stone
    R(g, '#8a8a92', 164, 82, 20, 20); R(g, '#9a9aa2', 166, 84, 16, 16); for (let i = 0; i < 4; i++) R(g, '#5a5a62', 168, 87 + i * 3, 12 - (i % 2) * 4, 1);
  },
  under(g, t) {
    // fountain water
    for (let i = 0; i < 6; i++) { const k = (t * 1.5 + i / 6) % 1; R(g, '#cfe8f8', 121 + Math.sin(i * 2) * k * 10, 138 + k * k * 18, 1, 2); }
  },
  build() {
    const s = npc('socrates', 240, 150, LOOKS.socrates, {
      ph: 28, mark: () => hasInsight('socratic') && flag('fork') ? null : '!',
      interact: () => socratesTalk(),
      update(dt, t) { this.fly = [this.x + Math.cos(t * 3.1) * 9, this.y - 22 + Math.sin(t * 4.3) * 5]; },
      draw(g, t) {
        drawPerson(g, this.x, this.y, this.look, this.dir, 0, { bob: Math.sin(t * 2) > 0.7 ? -1 : 0, smile: true });
        if (this.fly) { R(g, '#111', this.fly[0], this.fly[1], 2, 1); R(g, 'rgba(255,255,255,0.7)', this.fly[0], this.fly[1] - 1 - (Math.floor(t * 20) % 2), 1, 1); }
      },
    });
    return [
      door('east', [474, 180, 6, 40], 'crossroads', 18, 160, { arrow: 'right', sign: 'Crossroads', signPos: [446, 170] }),
      door('cave', [0, 92, 6, 40], 'cave', 30, 150, {
        arrow: 'left', sign: "Plato's Cave", signPos: [44, 84],
        locked: () => !(flag('fork') === 'cave' || hasInsight('forms') || hasInsight('mean')),
        lockedMsg: 'This path is closed. Talk to *Socrates* first.',
      }),
      door('lyceum', [0, 196, 6, 40], 'lyceum', 454, 200, {
        arrow: 'left', sign: "Aristotle's Lyceum", signPos: [52, 188],
        locked: () => !(flag('fork') === 'lyceum' || hasInsight('forms') || hasInsight('mean')),
        lockedMsg: 'This path is closed. Talk to *Socrates* first.',
      }),
      s,
      thing('gadfly', 252, 128, null, {
        r: 10, ph: 4, label: 'Swat the fly', iy: 8,
        async interact() {
          SFX.buzz();
          await say('socrates', 'Ha! Leave it be. In my trial I called *myself* a gadfly: a fly sent by the gods to sting the big, lazy horse of Athens awake.');
          await say('socrates', 'Annoying? Yes. Useful? Also yes. A city that never gets questioned falls asleep.');
        },
      }),
      npc('youngPlato', 272, 166, LOOKS.youngPlato, {
        dir: 2, label: 'Talk', hold: true,
        draw(g, t) { drawPerson(g, this.x, this.y, this.look, this.dir, 0, { hold: (g, x, y) => { R(g, '#c8a060', x - 8, y - 9, 4, 5); R(g, '#3a2a1a', x - 7, y - 8, 2, 1); } }); },
        async interact() {
          await say('youngPlato', 'Shh, I\'m writing. Socrates never writes anything down. He says writing makes memory lazy!');
          await say('youngPlato', 'So I\'ll write *dialogues*: little plays starring him. Ironically, the only reason anyone will remember him is my books.');
          await say('youngPlato', 'One day I\'ll found a school called the *Academy*. Our word "academic" will come from it. It\'ll run for about 300 years.');
        },
      }),
      npc('sophist', 396, 128, LOOKS.sophist, {
        dir: 0,
        async interact() {
          await say('sophist', 'Psst! I\'m *Gorgias*, a Sophist. For a fee I\'ll teach you to win *any* argument, whether you\'re right or not!');
          const c = await ask('sophist', 'Special price: two obols. What do you say?', ['Buy a lesson (2 obols)', 'No thanks. I want the truth, not just to win.']);
          if (c === 0) {
            SFX.coin();
            await say('sophist', 'Lesson one: never admit you\'re wrong. Lesson two: if you\'re losing, *talk faster*. Lesson three: see lesson one.');
            await say('socrates', '(from across the square) And what if the other person is *right*, Gorgias? Then you\'ve "won" and stayed foolish!');
          } else {
            await say('sophist', 'Bah! You sound just like Socrates. He never charges a single coin. Terrible business model.');
          }
          await say('owl', 'The Sophists taught *rhetoric*, the art of persuasion. Socrates cared about *truth* instead. That\'s why "sophistry" now means clever-sounding but misleading arguments.');
        },
      }),
      thing('oracle', 174, 102, null, {
        r: 18, ph: 22, label: 'Read the inscription',
        async interact() {
          AudioSys.play('bell', 62, { vol: 0.1, dur: 3 });
          await say(null, 'A stone tablet: *"The Oracle of Delphi was asked: is anyone wiser than Socrates? The priestess answered: No one."*');
          await say('socrates', 'That puzzled me! I know *nothing*. So I questioned politicians, poets and craftsmen, people famous for their wisdom.');
          await say('socrates', 'They all *thought* they knew things they didn\'t. Then I understood: I\'m wiser only in one tiny way. *I know that I don\'t know.*');
        },
      }),
      thing('hemlock', 311, 230, (g, t) => { R(g, '#8a8a92', 308, 220, 6, 7); R(g, '#5a7a3a', 309, 221, 4, 2); }, {
        r: 18, ph: 16, label: 'Look at the cup',
        async interact() {
          SFX.sad();
          await say(null, 'A cup of *hemlock*, a poison.');
          await say(null, 'In 399 BCE, Athens put Socrates on trial for "corrupting the youth" and "not honoring the city\'s gods." A jury of 501 citizens voted. He was sentenced to death.');
          await say(null, 'His friends arranged an escape. He refused. Fleeing would break the laws he had lived under all his life. He spent his last hours talking about the soul, then calmly drank.');
          await say(null, 'At his trial he said the line he\'s most famous for: *"The unexamined life is not worth living."*');
        },
      }),
      thing('fountain', 121, 164, null, {
        r: 26, ph: 26, label: 'Listen at the fountain',
        async interact() {
          SFX.pour(1.2);
          await say(null, 'Citizens gather here to argue about politics, trade gossip and buy olives.');
          await say('owl', 'Athens invented *democracy*: "rule by the people." Citizens voted directly on laws. But only free adult men counted. Women, slaves and foreigners had no vote. A good question for Socrates: *was that just?*');
        },
      }),
    ];
  },
  hint() {
    if (!hasInsight('socratic')) return 'Talk to *Socrates*, the bald man with the white beard. He has a question for you.';
    if (!flag('fork')) return 'Talk to Socrates again. He\'ll show you the fork in the road.';
    return flag('fork') === 'cave' ? 'The *upper-left* path leads to Plato\'s Cave.' : 'The *lower-left* path leads to Aristotle\'s Lyceum.';
  },
};

// ---------- Socrates & the bubble of certainty
async function socratesTalk() {
  if (hasInsight('socratic')) {
    if (!flag('fork')) return forkScene();
    await say('socrates', 'Still here? Good. Keep asking questions. When someone says "everyone knows that…", that\'s exactly where to dig.');
    return forkScene(true);
  }
  await say('socrates', 'Ah, a new face! I\'m Socrates. I don\'t teach anything. I just ask questions. Will you help me with one?');
  await say('socrates', 'Here it is: *What is justice?*');
  const bubble = { text: '', cracks: 0, cert: 1, shatter: 0, show: true };
  const end = setActivity({
    draw(g, t) {
      if (!bubble.show) return;
      const x = player.x, y = player.y - 44;
      if (bubble.shatter > 0) {
        const k = G.t - bubble.shatter;
        for (let i = 0; i < 18; i++) { const a = i * 0.35; R(g, '#aed6f1', x + Math.cos(a) * k * 60, y + Math.sin(a) * k * 50 + k * k * 30, 2, 2); }
        return;
      }
      disc(g, x, y, 15, 'rgba(174,214,241,0.85)'); disc(g, x - 5, y - 5, 4, 'rgba(255,255,255,0.8)');
      R(g, 'rgba(174,214,241,0.85)', x - 2, y + 17, 3, 3); R(g, 'rgba(174,214,241,0.85)', x - 1, y + 22, 2, 2);
      const cracks = [[[-6, -12], [0, -2], [-4, 6]], [[10, -8], [2, 0], [8, 10]], [[-13, 2], [-2, 0], [2, 13]]];
      for (let i = 0; i < bubble.cracks; i++) { const c = cracks[i]; for (let k = 0; k < c.length - 1; k++) line(g, x + c[k][0], y + c[k][1], x + c[k + 1][0], y + c[k + 1][1], '#1b4f72'); }
    },
    ui(c) {
      if (!bubble.show || bubble.shatter) return;
      const x = player.x, y = player.y - 44;
      text('certain?', x, y - 24, { size: 11, align: 'center', color: UIC.dim });
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 20, y - 14, 40, 4);
      ctx.fillStyle = bubble.cert > 0.5 ? '#2ecc71' : bubble.cert > 0.2 ? '#f39c12' : '#e74c3c'; ctx.fillRect(x - 20, y - 14, 40 * bubble.cert, 4);
      if (bubble.text) text(bubble.text, x, y - 4, { size: 11, align: 'center', color: '#1b2a3a', shadow: false });
    },
  });
  const answers = [
    { a: 'Telling the truth and paying back what you owe.', short: 'truth & debts', who: 'This is what old Cephalus said, in Plato\'s *Republic*.',
      ce: ['Suppose a friend lends you his sword. Later he goes *mad* and demands it back, raging.', 'You owe it to him. Is it *just* to hand a sword to a madman?'],
      v: (v, t) => { R(v, '#3a2a40', 0, 0, 160, 90); drawPerson(v, 50, 72, playerLook(), 3, 0, { hold: (g, x, y) => { R(g, '#bdc3c7', x + 5, y - 14, 1, 10); R(g, '#8b5a2b', x + 4, y - 5, 3, 2); } }); drawPerson(v, 108, 72, { skin: '#e8b48f', hairStyle: 'spiky', hairC: '#7a3a1a', robe: '#7a6a5a', eyes: '#e74c3c' }, 2, Math.floor(t * 8) % 4, { armsUp: true }); for (let i = 0; i < 3; i++) line(v, 120 + i * 4, 40, 124 + i * 4, 30 + Math.sin(t * 10 + i) * 3, '#e74c3c'); } },
    { a: 'Helping your friends and harming your enemies.', short: 'help friends, harm foes', who: 'Polemarchus argued this in the *Republic*.',
      ce: ['But we often misjudge who our friends really are. Someone who seems friendly might be robbing you!', 'And tell me: does *harming* a person make them better, or worse? Can justice ever make people *worse*?'],
      v: (v, t) => { R(v, '#2a3a2a', 0, 0, 160, 90); drawPerson(v, 50, 72, LOOKS.sophist, 3, 0, { smile: true }); R(v, '#f1c40f', 40, 60, 5, 5); R(v, '#111', 46, 51, 6, 2); drawPerson(v, 110, 72, { skin: '#c98e62', hairStyle: 'spiky', hairC: '#111', robe: '#5a5a5a' }, 2, 0, {}); ICONS.heart(v, 110, 40 + Math.sin(t * 3) * 2); } },
    { a: 'Whatever benefits the stronger: the rulers decide.', short: 'might makes right', who: 'Thrasymachus angrily said this in the *Republic*.',
      ce: ['But rulers make *mistakes*. Sometimes they order things that actually harm themselves.', 'Then obeying them is sometimes *not* in the stronger\'s interest. So is justice obeying, or benefiting? It can\'t be both!'],
      v: (v, t) => { R(v, '#3a2a2a', 0, 0, 160, 90); R(v, '#5a4a3a', 0, 70, 120, 20); R(v, '#1a1010', 120, 70, 40, 20); drawPerson(v, 30, 70, LOOKS.ruler, 3, 0, { armsUp: true }); for (let i = 0; i < 3; i++) drawPerson(v, 70 + i * 18 + (t * 8 % 18), 70 + (i === 2 && (t * 8 % 18) > 14 ? 8 : 0), { skin: '#e8b48f', hairStyle: 'short', robe: '#c0392b', hat: 'helmet' }, 3, Math.floor(t * 8) % 4, {}); } },
  ];
  let left = [0, 1, 2];
  while (left.length) {
    const c = await ask('socrates', left.length === 3 ? 'What is justice? Give me your best answer.' : 'Hmm. Then try again: *what is justice?*', left.map(i => answers[i].a));
    const A = answers[left[c]];
    left.splice(c, 1);
    bubble.text = A.short; bubble.cert = 1; AudioSys.play('bell', 76, { vol: 0.08, dur: 1 });
    await say('socrates', 'Interesting! ' + A.who + ' Let\'s test it.');
    showVignette(A.v, { title: 'Imagine…', x: 14, y: 84 });
    await say('socrates', A.ce[0]);
    await say('socrates', A.ce[1]);
    hideVignette();
    bubble.cracks++; bubble.cert = Math.max(0.05, 1 - bubble.cracks * 0.33); SFX.crack(); shake(0.2);
    AudioSys.play('sine', 50 - bubble.cracks * 2, { vol: 0.12, dur: 1.5 });
    if (left.length) await say('you', ['Hmm… okay, maybe not quite.', 'Ugh. You\'re good at this.'][2 - left.length] || 'Hmm…');
  }
  await say('you', 'Wait… then I don\'t know what justice is at all!');
  bubble.shatter = G.t; SFX.shatter(); shake(0.4); flash('#aed6f1', 0.5);
  await wait(1.2);
  bubble.show = false; end();
  AudioSys.play('pad', 57, { vol: 0.06, dur: 4 }); AudioSys.play('pad', 64, { vol: 0.05, dur: 4 });
  await say('socrates', 'Wonderful! Don\'t look so sad. You\'ve lost a *false belief*. That\'s a gain, not a loss!');
  await say('socrates', 'This is my method: ask "what is X?", then test each answer with *counterexamples*. People call it the *Socratic method*.');
  await say('socrates', 'Most people are certain about big words like justice, courage and love, and they never check. Now you\'ve checked. Now you *know that you don\'t know*. That\'s where real thinking begins.');
  await giveInsight('socratic');
  await forkScene();
}

async function forkScene(again) {
  if (!again) {
    await say('socrates', 'Now. My student Plato, that young man writing everything down, will grow up with a bold idea:');
    await say('socrates', 'that the true reality is *beyond* this world of the senses. And *his* student Aristotle will disagree: truth is right *here*, in real things.');
  }
  if (flag('fork') && again) {
    await say('socrates', flag('fork') === 'cave' ? 'Your road leads upper-left, to Plato\'s Cave.' : 'Your road leads lower-left, to Aristotle\'s Lyceum.');
    return;
  }
  const c = await ask('socrates', 'So which road calls you? *Is truth beyond this world, or in it?*', ['Beyond this world: Plato\'s Cave', 'In this world: Aristotle\'s Lyceum']);
  flag('fork', c === 0 ? 'cave' : 'lyceum');
  SFX.rumble(1); shake(0.3);
  await say('socrates', c === 0 ? 'Then go upper-left, to the Cave. Bring a sense of wonder… and maybe sunglasses.' : 'Then go lower-left, to the Lyceum. Aristotle walks while he talks, so keep up!');
  await say('owl', 'Don\'t worry: once you finish that road, the other one opens too. *Every* path can be explored.');
}
