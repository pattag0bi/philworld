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
        interact: () => gadflyCutscene(),
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
        async interact() { await oracleCutscene(); },
      }),
      thing('hemlock', 311, 230, (g, t) => { R(g, '#8a8a92', 308, 220, 6, 7); R(g, '#5a7a3a', 309, 221, 4, 2); }, {
        r: 18, ph: 16, label: 'Look at the cup',
        async interact() { await trialCutscene(); },
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
  await say('socrates', 'Here it is: *What is justice?* Not an example of it. What justice *is*, in every case.');
  await say('socrates', 'Here\'s how my game works. You give me a *rule*: "justice means ___." Then we test your rule on a real situation.');
  await say('socrates', 'A true definition must work in *every* case. If we find even *one* case where your rule gives the wrong answer, that case is called a *counterexample*, and we need a better rule.');
  const bubble = { text: '', cracks: 0, cert: 1, shatter: 0, show: true };
  const rc = { rule: '', broken: 0 };
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
    ui() {
      if (rc.rule) {
        // the rule card being tested
        const w = Math.min(360, textW(rc.rule, { size: 13 }) + 30);
        ctx.fillStyle = '#1a1020'; ctx.fillRect(240 - w / 2 - 1, 23, w + 2, 32);
        ctx.fillStyle = '#f3e6c4'; ctx.fillRect(240 - w / 2, 24, w, 30);
        text('YOUR RULE', 240, 26, { title: true, size: 6, align: 'center', color: '#8b5a2b', shadow: false });
        text(rc.rule, 240, 37, { size: 13, align: 'center', color: '#3a2410', shadow: false });
        if (rc.broken) {
          const k = Math.min(1, (G.t - rc.broken) * 4);
          ctx.globalAlpha = k;
          ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(240 - w / 2 + 6, 44); ctx.lineTo(240 + w / 2 - 6, 44); ctx.stroke();
          ctx.fillStyle = '#c0392b'; ctx.fillRect(240 + w / 2 - 90, 50, 86, 12);
          text('✗ COUNTEREXAMPLE', 240 + w / 2 - 47, 50, { size: 11, align: 'center', color: '#fff', shadow: false });
          ctx.globalAlpha = 1;
        }
      }
      if (!bubble.show || bubble.shatter) return;
      const x = player.x, y = player.y - 44;
      text('certain?', x, y - 24, { size: 11, align: 'center', color: UIC.dim });
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 20, y - 14, 40, 4);
      ctx.fillStyle = bubble.cert > 0.5 ? '#2ecc71' : bubble.cert > 0.2 ? '#f39c12' : '#e74c3c'; ctx.fillRect(x - 20, y - 14, 40 * bubble.cert, 4);
      if (bubble.text) text(bubble.text, x, y - 4, { size: 11, align: 'center', color: '#1b2a3a', shadow: false });
    },
  });
  // stage: you and Socrates on the left, the "play" happens to the right
  const S = G.room.ents.find(e => e.id === 'socrates'), sHome = [S.x, S.y];
  player.x = 214; player.y = 150; player.dir = 3; S.x = 190; S.y = 144; S.dir = 3;
  const YP = G.room.ents.find(e => e.id === 'youngPlato'); const ypHome = [YP.x, YP.y]; YP.x = 150; YP.y = 120; YP.dir = 3;
  const answers = [
    { a: 'Telling the truth and paying back what you owe.', short: 'truth & debts', run: caseDebts },
    { a: 'Helping your friends and harming your enemies.', short: 'help friends, harm foes', run: caseFriends },
    { a: 'Whatever benefits the stronger: the rulers decide.', short: 'might makes right', run: caseStronger },
  ];
  let left = [0, 1, 2];
  while (left.length) {
    const c = await ask('socrates', left.length === 3 ? 'So: what is justice? Give me your best rule.' : 'Then let\'s try another rule. *What is justice?*', left.map(i => answers[i].a));
    const A = answers[left[c]];
    left.splice(c, 1);
    bubble.text = A.short; bubble.cert = 1; rc.broken = 0; AudioSys.play('bell', 76, { vol: 0.08, dur: 1 });
    const C = await cutStart('Testing the rule: ' + A.short);
    await A.run(C, rc);
    rc.broken = G.t; SFX.crack(); shake(0.2);
    bubble.cracks++; bubble.cert = Math.max(0.05, 1 - bubble.cracks * 0.33);
    AudioSys.play('sine', 50 - bubble.cracks * 2, { vol: 0.12, dur: 1.5 });
    await C.end();
    await wait(0.6);
    if (left.length) await say('you', ['Hmm… okay, maybe not quite.', 'Ugh. You\'re good at this.'][2 - left.length] || 'Hmm…');
    rc.rule = '';
  }
  S.x = sHome[0]; S.y = sHome[1]; S.dir = 0;
  YP.x = ypHome[0]; YP.y = ypHome[1]; YP.dir = 2;
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

// ---------- cutscenes
const CITIZEN = i => ({ skin: ['#eab994', '#c98e62', '#e8b48f', '#d8a070'][i % 4], hairStyle: ['short', 'curly', 'bald', 'short'][i % 4], hairC: ['#3a2a1a', '#2b1d14', '#6b6b6b', '#5a3a22'][i % 4], beard: i % 2 ? '#3a2a1a' : null, beardLen: 2, robe: ['#a89f91', '#8a7a5a', '#c8b898', '#7a6a5a', '#9a8a7a', '#b8a888'][i % 6], robe2: '#5a4a3a', long: true });
async function oracleCutscene() {
  const S = G.room.ents.find(e => e.id === 'socrates'); const home = [S.x, S.y];
  AudioSys.play('bell', 62, { vol: 0.1, dur: 3 });
  await say(null, 'A stone tablet: *"The Oracle of Delphi was asked: is anyone wiser than Socrates? The priestess answered: No one."*');
  const C = await cutStart('The Oracle of Delphi');
  const ch = C.actor('chaerephon', CITIZEN(1), S.x + 14, S.y, { dir: 2 });
  await say({ name: 'Chaerephon', look: ch.look, voice: 330 }, 'Socrates, my friend! I went all the way to Delphi and asked the god: is anyone wiser than you? The priestess said: *no one!*');
  C.emote(S, '?', 2.5);
  await say('socrates', 'Me? But I know *nothing*! There must be a mistake. I\'ll find someone wiser and prove the god wrong.');
  const pol = C.actor('pol', LOOKS.ruler, 150, 120, { dir: 3 });
  const poet = C.actor('poet', { skin: '#eab994', hairStyle: 'long', hairC: '#5a3a22', robe: '#8e44ad', robe2: '#e0c060', hat: 'laurel', long: true }, 330, 200, { dir: 2 });
  const smith = C.actor('smith', { skin: '#c98e62', hairStyle: 'short', hairC: '#1d1d2b', robe: '#6b4a2b', robe2: '#3a2a1a', sash: '#3a2a1a' }, 380, 150, { dir: 2 });
  await C.walk(S, 174, 122, 50); C.face(S, pol);
  C.emote(pol, '!', 2); await say({ name: 'A Famous Politician', look: pol.look, voice: 240 }, 'Justice? Simple. It\'s whatever wins votes. Next question.');
  C.emote(S, '?', 2); await wait(0.6);
  await C.walk(S, 306, 196, 55); C.face(S, poet);
  C.emote(poet, 'note', 2); await say({ name: 'A Celebrated Poet', look: poet.look, voice: 380 }, 'My verses are inspired by the Muses! What do they *mean*? Well… I couldn\'t really say.');
  C.emote(S, '?', 2); await wait(0.6);
  await C.walk(S, 360, 154, 55); C.face(S, smith);
  C.emote(smith, '!', 2); await say({ name: 'A Skilled Craftsman', look: smith.look, voice: 200 }, 'I make the finest shoes in Athens! So of course I also know how the city should be run.');
  C.emote(S, 'idea', 2.5);
  await say('socrates', 'Each one *thought* he knew things he didn\'t. The craftsman truly knew his craft, but thought that made him wise about everything.');
  await say('socrates', 'So I am wiser in just one tiny way: *I know that I don\'t know.* Maybe that\'s what the god meant.');
  await Promise.all([C.walk(S, home[0], home[1], 60), C.fadeActor(pol, 0), C.fadeActor(poet, 0), C.fadeActor(smith, 0), C.fadeActor(ch, 0)]);
  S.dir = 0;
  await C.end();
  await say('owl', 'Asking experts hard questions in public made Socrates many enemies. Powerful people don\'t like looking foolish.');
}
async function trialCutscene() {
  const S = G.room.ents.find(e => e.id === 'socrates'); const home = [S.x, S.y];
  SFX.sad();
  await say(null, 'A cup of *hemlock*, a poison. Something terrible happened in this city…');
  const C = await cutStart('The Trial of Socrates · Athens, 399 BCE');
  const jurors = [];
  for (let i = 0; i < 8; i++) jurors.push(C.actor('j' + i, CITIZEN(i), 500 + i * 10, 150 + (i % 2) * 22, { dir: 2 }));
  await C.walkAll(jurors.map((j, i) => [j, 296 + (i >> 1) * 20, 148 + (i % 2) * 24, 70]));
  jurors.forEach(j => j.dir = 2);
  await C.walk(S, 230, 140, 40); S.dir = 3;
  const mel = C.actor('meletus', { skin: '#e8b48f', hairStyle: 'spiky', hairC: '#1d1d2b', beard: '#1d1d2b', beardLen: 1, robe: '#5a2a2a', robe2: '#3a1a1a', long: true }, 252, 196, { dir: 1 });
  C.emote(mel, 'angry', 3);
  await say({ name: 'Meletus, the accuser', look: mel.look, voice: 230 }, 'Men of Athens! This Socrates *corrupts the youth* and does not honor the gods of the city! He must be punished!');
  jurors.forEach((j, i) => setTimeout(() => C.emote(j, i % 3 ? '?' : 'angry', 1.5), i * 120));
  await say(null, 'Socrates speaks in his own defense. He doesn\'t beg or weep, as accused men usually did.');
  await say('socrates', 'I am like a *gadfly* on a great, lazy horse. If you kill me, you won\'t easily find another to keep you awake. And I tell you: *the unexamined life is not worth living.*');
  await say(null, 'A jury of about *500 citizens* votes, dropping pebbles into urns…');
  for (let i = 0; i < jurors.length; i++) { C.emote(jurors[i], i < 5 ? 'angry' : 'tear', 2.5); AudioSys.play('drum', 60 + i * 3, { vol: 0.2 }); await wait(0.25); }
  await say(null, 'Guilty, by about 60 votes. The sentence: *death*.');
  SFX.sad();
  await C.walkAll(jurors.map((j, i) => [j, 520, 150 + (i % 2) * 22, 90]));
  mel.alpha = 0;
  // the prison: friends gather
  await C.stage(STAGES.cell(), 'A prison cell, one month later', { dark: true });
  S.x = home[0]; S.y = home[1]; S.dir = 0;
  const Sc = C.cast('socrates', 236, 146, { dir: 0 });
  const crito = C.actor('crito', CITIZEN(2), 266, 150, { dir: 2 });
  const f2 = C.actor('f2', CITIZEN(3), 250, 170, { dir: 1 });
  const f3 = C.actor('f3', CITIZEN(5), 214, 166, { dir: 1 });
  await C.black(false);
  await say({ name: 'Crito', look: crito.look, voice: 260 }, 'Socrates, everything is ready. The guards are bribed. A ship is waiting. *Escape tonight!*');
  C.face(Sc, crito);
  await say('socrates', 'Dear Crito. Should I break the laws that raised me, just to save my own skin? Would that be *just*? No. I won\'t run.');
  const jailer = C.actor('jailer', LOOKS.puppeteer, 480, 200, { dir: 2 });
  await C.walk(jailer, 262, 168, 35); C.face(jailer, Sc);
  C.emote(crito, 'tear', 4); C.emote(f2, 'tear', 4); C.emote(f3, 'tear', 4);
  await say(null, 'The jailer brings the cup. The friends weep. Socrates comforts *them*.');
  await say('socrates', 'Why cry? We have spent our lives practicing for this: caring for the soul more than the body. Let us go calmly.');
  C.emote(Sc, '...', 3);
  await wait(1.2);
  AudioSys.play('pad', 45, { vol: 0.08, dur: 6 }); AudioSys.play('pad', 52, { vol: 0.06, dur: 6 });
  await C.black(true, 1.2);
  await narrate('He drank calmly, talking with his friends about the soul until the end.');
  await say('owl', 'Plato was too ill to be there that day. He wrote the scene later, in the *Phaedo*. Socrates died for the right to keep asking questions.');
  await C.end();
}

async function gadflyCutscene() {
  SFX.buzz();
  await say('socrates', 'Ha! Leave it be. I call *myself* a gadfly. Look:');
  const C = await cutStart('Athens, the sleepy horse');
  const horse = C.prop('horse', 330, 220, function (g, t) { const x = this.x, y = this.y, j = this.jump || 0; R(g, '#8b5a2b', x - 12, y - 16 - j, 24, 9); R(g, '#8b5a2b', x + 8, y - 22 - j + (this.sleep ? 5 : 0), 5, 9); R(g, '#8b5a2b', x + 10, y - 23 - j + (this.sleep ? 5 : 0), 7, 4); for (const lx of [-11, -7, 6, 10]) R(g, '#6b4a2b', x + lx, y - 7 - j, 2, 7); R(g, '#3a2a1a', x - 15, y - 16 - j, 3, 8); if (this.sleep) { R(g, '#aed6f1', x + 16, y - 26 - (t * 4) % 6, 4, 1); R(g, '#aed6f1', x + 19, y - 32 - (t * 4) % 6, 3, 1); } }, { sleep: true });
  const fly = C.prop('fly', 240, 120, function (g, t) { R(g, '#111', this.x, this.y, 2, 1); R(g, 'rgba(255,255,255,0.7)', this.x, this.y - 1 - (Math.floor(t * 20) % 2), 1, 1); }, {});
  await say(null, 'Athens is like a big, noble horse: strong, but lazy and half asleep.');
  SFX.buzz();
  for (let i = 0; i <= 40; i++) { fly.x = lerp(240, 342, i / 40) + Math.sin(i) * 6; fly.y = lerp(120, 200, i / 40) + Math.cos(i * 1.3) * 5; await nextFrame(); }
  SFX.snap(); horse.sleep = false; shake(0.3);
  for (let i = 0; i < 20; i++) { horse.jump = Math.sin(i / 20 * Math.PI) * 10; await nextFrame(); }
  horse.jump = 0;
  AudioSys.play('sine', 700, { hz: true, wave: 'sawtooth', to: 350, dur: 0.6, vol: 0.06 });
  await say('socrates', 'Sting! Now it\'s awake. Annoying? Yes. Useful? Also yes. A city that never gets questioned falls asleep.');
  await C.end();
}

// ---------- the three test cases, acted out
const NIKIAS = { skin: '#e8b48f', hairStyle: 'short', hairC: '#7a3a1a', robe: '#5d8aa8', robe2: '#3a5a70' };
async function caseDebts(C, rc) {
  rc.rule = 'Justice = always tell the truth, and give back what you owe.';
  await say('socrates', 'Your rule: *justice means always telling the truth and giving back what you owe.* Old Cephalus, a rich merchant in Plato\'s *Republic*, says exactly this. Watch.');
  const fr = C.actor('nikias', NIKIAS, 470, 150, { dir: 2 });
  const sword = C.prop('sword', 0, 0, function (g) { if (!this.on) return; R(g, '#bdc3c7', this.x, this.y - 12, 1, 11); R(g, '#8b5a2b', this.x - 1, this.y - 1, 3, 2); }, { z: 999 });
  await C.walk(fr, 240, 150, 60); C.face(fr, player);
  await say({ name: 'Your friend Nikias', look: fr.look, voice: 300 }, 'Will you keep my sword safe while I travel? Give it back whenever I ask.');
  sword.on = true; sword.x = player.x + 5; sword.y = player.y - 4; SFX.coin();
  await say(null, 'You promise. Now you *owe* him the sword.');
  await C.walk(fr, 480, 150, 70);
  C.caption('A few weeks later…');
  await wait(0.8);
  fr.look = Object.assign({}, NIKIAS, { hairStyle: 'spiky', eyes: '#e74c3c' });
  await C.walk(fr, 244, 150, 110); fr.pose = { armsUp: true }; C.emote(fr, 'angry', 5); shake(0.3); SFX.roar();
  await say({ name: 'Nikias, raging', look: fr.look, voice: 300 }, 'GIVE ME MY SWORD! I\'m going to get my neighbour Dion. Where is he hiding?!');
  await say(null, 'Your friend has gone *mad* with rage. And you happen to know exactly where Dion is hiding.');
  const c = await ask('socrates', 'Your rule says: *give back what you owe, and tell the truth.* What do you do?', ['Follow the rule: hand over the sword, say where Dion is.', 'Break the rule: keep the sword, say nothing.']);
  if (c === 0) {
    sword.on = false; fr.pose = { armsUp: true, hold: (g, x, y) => { R(g, '#bdc3c7', x + 5, y - 16, 1, 11); } };
    const dion = C.actor('dion', { skin: '#c98e62', hairStyle: 'curly', hairC: '#2b1d14', robe: '#d4ac0d', robe2: '#7d6608' }, 360, 180, { dir: 2 });
    C.emote(dion, '!', 2);
    await C.walk(fr, 330, 178, 110);
    await C.walk(dion, 500, 180, 140); SFX.boing();
    await say('socrates', 'Your rule made you *arm a madman* and send him straight to his victim. Was that *just*?');
  } else {
    C.emote(fr, 'angry', 2);
    await say('socrates', 'Of course you keep it. Almost anyone would. But notice: your *rule* told you to give it back and tell the truth.');
  }
  await say('socrates', 'Here is the problem. The rule says "give it back," yet giving it back would be *wrong*. A true definition of justice can never tell us to do something unjust.');
  await say('socrates', 'Paying debts and telling the truth are *usually* just, but not *always*. So they can\'t be what justice *is*. One counterexample, and the rule breaks.');
}
async function caseFriends(C, rc) {
  rc.rule = 'Justice = help your friends, and harm your enemies.';
  await say('socrates', 'Your rule: *justice means helping your friends and harming your enemies.* Polemarchus, Cephalus\'s son, defends this one. It has *two* weak spots. Watch the first.');
  const smiler = C.actor('smiler', LOOKS.sophist, 470, 142, { dir: 2 });
  const grump = C.actor('grump', { skin: '#c98e62', hairStyle: 'spiky', hairC: '#111', robe: '#5a5a5a', robe2: '#3a3a3a', beard: '#111', beardLen: 1 }, 470, 176, { dir: 2 });
  const purse = C.prop('purse', player.x + 6, player.y - 6, function (g) { if (this.alpha > 0) { disc(g, this.x, this.y, 3, '#8b5a2b'); R(g, '#f1c40f', this.x - 1, this.y - 4, 2, 1); } }, { z: 999 });
  await C.walkAll([[smiler, 250, 142, 60], [grump, 290, 178, 50]]);
  C.emote(smiler, 'heart', 3);
  await say({ name: 'A smiling stranger', look: smiler.look, voice: 460 }, 'Hello, dear friend! What a lovely day. Let me carry that heavy purse for you!');
  C.emote(grump, 'angry', 2);
  await say({ name: 'A grumpy stranger', look: grump.look, voice: 200 }, 'Hmph. Out of my way.');
  const pick = await ask('socrates', 'Your rule says: help your friends. Which one is your *friend*?', ['The smiling one, obviously.', 'The grumpy one?']);
  C.emote(smiler, 'ha', 2.5);
  for (let i = 0; i <= 20; i++) { purse.x = lerp(player.x + 6, smiler.x + 6, i / 20); purse.y = lerp(player.y - 6, smiler.y - 6, i / 20); await nextFrame(); }
  SFX.coin();
  await C.walk(smiler, 500, 142, 120);
  purse.alpha = 0;
  await say(null, 'The smiling "friend" runs off with your purse.');
  C.emote(grump, '!', 2);
  await C.walk(grump, 236, 160, 60);
  const coin = C.prop('coin', 236, 152, (g) => ICONS.coin(g, 236, 146), {});
  SFX.coin();
  await say({ name: 'The grumpy stranger', look: grump.look, voice: 200 }, 'You dropped this coin back there. Here. Don\'t lose it.');
  coin.alpha = 0;
  await say('socrates', pick === 0 ? 'You chose the smiler, like most of us would. We judge friends by how they *seem*.' : 'A good guess! But most people judge friends by how they *seem*.');
  await say('socrates', 'So your rule would have you *help the thief* and *harm the honest man*. We can be wrong about who our friends and enemies really are.');
  await say('socrates', 'Now the second weak spot, the deeper one. What happens when you *harm* someone? Watch.');
  const bully = C.actor('bully', { skin: '#eab994', hairStyle: 'short', hairC: '#3a2a1a', robe: '#8b1e2b', robe2: '#5a1010' }, 470, 160, { dir: 2 });
  const pots = C.prop('pots', 330, 180, function (g) { if (!this.broken) { ellipse(g, 330, 178, 4, 6, '#c0603a'); ellipse(g, 342, 178, 4, 6, '#c0603a'); } else { for (let i = 0; i < 6; i++) R(g, '#c0603a', 324 + i * 4, 180 - (i % 2) * 2, 3, 2); } }, {});
  await C.walk(bully, 252, 160, 70); C.face(bully, grump);
  shake(0.2); SFX.thud(); C.emote(grump, 'angry', 3); C.emote(bully, 'ha', 2);
  await say(null, 'Someone shoves the grumpy man, just to "harm an enemy."');
  await C.walk(bully, 500, 160, 90);
  await C.walk(grump, 334, 180, 60);
  SFX.shatter(); pots.broken = true; shake(0.2); C.emote(grump, 'angry', 2.5);
  await say(null, 'He storms off angrier than before, and smashes a potter\'s jars on his way.');
  await say('socrates', 'See? Harm a horse and it becomes a *worse* horse. Harm a person and they grow more bitter and *less* just, and the harm spreads.');
  const c2 = await ask('socrates', 'Can *justice* ever make people *less* just?', ['No, that makes no sense.', 'Maybe, if they deserve it?']);
  if (c2 === 1) await say('socrates', 'Think of it this way: can *heat* make things colder? Can *goodness* make people worse? Justice that breeds injustice isn\'t justice.');
  else await say('socrates', 'Exactly. That would be like *heat* making things colder.');
  await say('socrates', 'So a just person doesn\'t harm *anyone*, not even enemies. Your rule breaks twice.');
}
async function caseStronger(C, rc) {
  rc.rule = 'Justice = whatever benefits the stronger (the rulers).';
  await say('socrates', 'Your rule: *justice is whatever benefits the stronger.* In the *Republic*, Thrasymachus bursts in shouting this. His idea:');
  await say('socrates', 'Rulers make laws that benefit *themselves*, then call obeying those laws "justice." So your rule really says two things at once. Watch.');
  const ruler = C.actor('ruler', LOOKS.ruler, 370, 152, { dir: 2 });
  const trees = C.prop('trees', 0, 0, function (g) { for (let i = 0; i < 3; i++) if (!(this.cut > i)) drawTree(g, 262 + i * 34, 130, { leaf: '#6a8a4a', size: 0.7, fruit: '#2a3a1a' }); else { R(g, '#6b4a2b', 260 + i * 34, 126, 5, 4); } }, { z: 131, cut: 0 });
  const folk = [0, 1].map(i => C.actor('f' + i, { skin: ['#c98e62', '#e8b48f'][i], hairStyle: 'short', hairC: '#2b1d14', robe: ['#7a6a5a', '#8a7a5a'][i], robe2: '#4a3a2a' }, 250 + i * 70, 216, { dir: 1 }));
  C.emote(ruler, '!', 2.5); ruler.pose = { armsUp: true };
  await say({ name: 'The Ruler', look: ruler.look, voice: 240 }, 'NEW LAW! Cut down every olive tree! I want firewood to heat my palace!');
  ruler.pose = {};
  await say(null, 'The people obey the law. That\'s "justice," according to your rule.');
  for (let i = 0; i < 3; i++) { const f = folk[i % 2]; await C.walk(f, 262 + i * 34, 140, 80); SFX.thud(); SFX.crack(); trees.cut = i + 1; shake(0.1); await wait(0.25); }
  C.caption('Next autumn…');
  await wait(0.8);
  C.emote(ruler, 'tear', 3);
  await say({ name: 'The Ruler', look: ruler.look, voice: 240 }, 'Where is my olive oil? No olives to sell! My treasury is empty! I\'m *ruined*!');
  await say('socrates', 'Your rule says two things: (1) justice is *obeying the rulers\' laws*, and (2) justice is *what benefits the rulers*. The people obeyed, and it *hurt* the ruler.');
  const c = await ask('socrates', 'So, by your rule: was the people\'s obedience just or unjust?', ['Just: they obeyed the law.', 'Unjust: it harmed the ruler.', 'Wait… it\'s both. That can\'t be right!']);
  if (c === 2) await say('socrates', 'Exactly! You found it yourself. One rule, two opposite answers.');
  else await say('socrates', c === 0 ? 'But by part two it was *unjust*, since it harmed the stronger. One rule, two opposite answers!' : 'But by part one it was *just*, since they obeyed. One rule, two opposite answers!');
  await say('socrates', 'Rulers make *mistakes*, so "obeying the stronger" and "benefiting the stronger" can come apart. A rule that contradicts itself can\'t be the definition of justice.');
  await say('owl', 'Thrasymachus also claims that injustice *pays* better than justice. Plato spends the rest of the *Republic*, ten whole books, answering him.');
}
