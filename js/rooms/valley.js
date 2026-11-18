'use strict';
// ============================================================
// ROOM: Laozi's Valley — the Tao, wu wei, yin & yang, emptiness
// ============================================================
Rooms.valley = {
  name: "Laozi's Valley", sub: 'China, c. 4th century BCE', scene: 'valley',
  spawn: [22, 210], spawnDir: 3,
  walls: [[0, 0, W, 92], [0, 92, 186, 40], [214, 92, 266, 40], [186, 92, 28, 30], [108, 160, 22, 12], [326, 162, 30, 10], [228, 210, 24, 18], [418, 140, 22, 10]],
  surface(x, y) { return 'grass'; },
  bg(g) {
    vgrad(g, 0, 0, W, 92, '#d8e8e0', '#f4f0e0', 8);
    const ridge = (base, amp, f, ph, c) => { for (let x = 0; x < W; x++) { const y = base + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph) * amp * 0.3; R(g, c, x, y, 1, 92 - y); } };
    ridge(30, 18, 0.018, 0, '#a8c0b8'); ridge(46, 14, 0.025, 2, '#88a898'); ridge(62, 10, 0.03, 4, '#6a8a78'); ridge(76, 6, 0.04, 1, '#4f7060');
    // mist bands
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, 40 + i * 14, W, 4); }
    // river
    vgrad(g, 0, 92, W, 40, '#5a9ab0', '#3a7a90', 5);
    // banks
    tex(g, 0, 130, W, H - 130, '#7aa060', ['#6a9050', '#8ab070', '#5f8a48'], 0.12, 91);
    R(g, '#5a7a40', 0, 130, W, 2);
    // bamboo
    for (let i = 0; i < 9; i++) { const x = 440 + i * 4 - (i % 2) * 2; R(g, '#5a8a3a', x, 160 - (i % 3) * 10, 2, 110); for (let k = 0; k < 6; k++) R(g, '#3a6a2a', x, 170 + k * 16, 2, 1); R(g, '#7ab05a', x + 2, 166 + i * 7, 4, 1); }
    // dock & boat
    R(g, '#8b5a2b', 186, 120, 28, 14); for (let x = 186; x < 214; x += 5) R(g, '#6b4a2b', x, 120, 1, 14);
    // water-worn stone with spring
    drawRock(g, 119, 172, 24, 16, '#8a8a8a'); R(g, '#6a6a6a', 116, 160, 6, 3); R(g, '#5a5a5a', 117, 161, 4, 2);
    R(g, '#7a7a7a', 104, 150, 30, 6); R(g, '#9ab0c0', 118, 154, 2, 6);
    // pot & wheel table
    R(g, '#6b4a2b', 326, 162, 30, 6); R(g, '#5a3a1a', 328, 168, 2, 6); R(g, '#5a3a1a', 352, 168, 2, 6);
    ellipse(g, 334, 156, 5, 6, '#b5651d'); R(g, '#8b4513', 331, 150, 6, 1); ellipse(g, 334, 151, 3, 1, '#3a1a0a');
    ring(g, 348, 155, 6, '#6b4a2b'); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; line(g, 348, 155, 348 + Math.cos(a) * 6, 155 + Math.sin(a) * 6, '#6b4a2b'); } R(g, '#f5f5f5', 347, 154, 2, 2);
    // yin-yang stone
    R(g, '#7a7a7a', 226, 212, 28, 16); R(g, '#8a8a8a', 226, 212, 28, 2);
    // tree for Zhuangzi
    drawTree(g, 72, 236, { leaf: '#5a9a4a', size: 1.2 });
    // uncarved block
    R(g, '#a0703a', 172, 228, 14, 10); R(g, '#b8884a', 172, 228, 14, 2); R(g, '#8a5a2a', 182, 230, 2, 8);
    // scroll rock
    drawRock(g, 429, 150, 22, 12, '#9a9a9a');
    // cook ding's block
    R(g, '#8b5a2b', 384, 230, 22, 8); R(g, '#6b4a2b', 386, 238, 3, 4); R(g, '#6b4a2b', 400, 238, 3, 4);
    for (let i = 0; i < 4; i++) R(g, '#a0703a', 386 + i * 5, 231, 1, 6);
    // flowers
    const r = mulberry(17); for (let i = 0; i < 50; i++) R(g, pick2(r, ['#f78fb3', '#ffffff', '#f7c948']), r() * W, 136 + r() * 136, 1, 1);
  },
  under(g, t) {
    // flowing river
    for (let i = 0; i < 40; i++) { const x = (i * 53 + t * 40) % (W + 20) - 10, y = 96 + (i * 7) % 32; R(g, '#9ad0e0', x, y, 5 + i % 4, 1); }
    // boat at dock
    if (!this.inBoat) { R(g, '#6b4a2b', 196, 128, 22, 4); R(g, '#8b5a2b', 198, 126, 18, 2); }
    // drip on the stone
    const k = (t * 0.8) % 1; R(g, '#9ad0e0', 119, 156 + k * 6, 1, 2);
    // butterfly
    if (!this.dream) { const bx = 92 + Math.sin(t * 1.3) * 12, by = 210 + Math.cos(t * 1.7) * 8, w = Math.floor(t * 10) % 2; R(g, '#f39c12', bx - 2, by - w, 2, 2); R(g, '#f39c12', bx + 1, by - w, 2, 2); R(g, '#3a2a1a', bx, by, 1, 2); }
    // yin-yang symbol on stone (rotating)
    drawYinYang(g, 240, 219, 6, t * (this.night != null ? 2 : 0.3));
  },
  over(g, t) {
    if (this.night != null) {
      const k = this.night;
      g.fillStyle = `rgba(20,24,60,${0.55 * k})`; g.fillRect(0, 0, W, H);
      if (k > 0.3) { disc(g, 400, 26, 6, `rgba(240,240,255,${k})`); for (let i = 0; i < 20; i++) R(g, `rgba(255,255,255,${k})`, (i * 47) % W, (i * 13) % 60, 1, 1); }
      // a seed of day within night: a lantern-like firefly
      if (k > 0.5) { R(g, '#ffe680', 240 + Math.sin(t * 2) * 20, 180, 1, 1); }
    }
    if (this.dream) { g.fillStyle = `rgba(255,200,240,${0.25 + 0.05 * Math.sin(t)})`; g.fillRect(0, 0, W, H); }
  },
  build() {
    const Rm = this; Rm.night = null; Rm.inBoat = false; Rm.dream = false;
    return [
      door('west', [0, 190, 6, 40], 'courtyard', 460, 172, { arrow: 'left', sign: "Confucius's Courtyard", signPos: [56, 178] }),
      door('east', [474, 190, 6, 40], 'bodhi', 22, 200, { arrow: 'right', sign: 'The Bodhi Tree', signPos: [440, 178], locked: () => !hasInsight('wuwei'), lockedMsg: 'Laozi: "The river knows the way. Have you asked it yet?"' }),
      npc('laozi', 262, 150, LOOKS.laozi, {
        ph: 34, mark: () => hasInsight('wuwei') ? null : '!',
        draw(g, t) {
          // water buffalo
          const x = this.x, y = this.y + 4;
          R(g, 'rgba(0,0,0,0.2)', x - 12, y - 1, 26, 3);
          R(g, '#4a4a52', x - 11, y - 14, 22, 10); R(g, '#5a5a62', x - 11, y - 14, 22, 2);
          R(g, '#4a4a52', x + 9, y - 16, 7, 7); R(g, '#d8d0c0', x + 9, y - 18, 2, 3); R(g, '#d8d0c0', x + 15, y - 18, 2, 3); R(g, '#111', x + 13, y - 14, 1, 1);
          for (const lx of [-10, -6, 5, 9]) R(g, '#3a3a42', x + lx, y - 4, 2, 4);
          R(g, '#3a3a42', x - 13, y - 13, 2, 6 + Math.round(Math.sin(t * 2)));
          drawPerson(g, x - 1, y - 8, this.look, this.dir, 0, { noShadow: true, sit: true });
        },
        interact: () => laoziTalk(),
      }),
      thing('boat', 206, 136, null, {
        r: 20, ph: 10, label: 'Get in the boat', enabled: () => flag('vl_intro'),
        mark: () => flag('vl_intro') && !hasInsight('wuwei') ? '!' : null,
        interact: () => riverJourney(),
      }),
      thing('stone', 119, 176, null, {
        r: 20, ph: 22, label: 'Touch the stone',
        async interact() {
          await say(null, 'A hard grey stone with a deep, smooth groove worn into its top, right beneath a dripping spring.');
          for (let i = 0; i < 14; i++) { AudioSys.ev.drip(); await wait(0.5 - i * 0.03); }
          await say('laozi', '*"Nothing in the world is softer or weaker than water. Yet for attacking the hard and strong, nothing can beat it."*');
          await say('laozi', 'Drip by drip, century by century, the soft overcomes the hard. Not by force, but by *persistence* and *yielding*.');
        },
      }),
      thing('yinyang', 240, 228, null, {
        r: 22, ph: 20, label: 'Turn the yin-yang stone',
        async interact() {
          const lo = AudioSys.layer('osc', { hz: 110, wave: 'sine', vol: 0.0001, dest: 'sfx' }), hi = AudioSys.layer('osc', { hz: 330, wave: 'triangle', vol: 0.0001, dest: 'sfx' });
          await say(null, 'You turn the stone. The sky begins to shift…');
          for (let i = 0; i <= 80; i++) { const k = (1 - Math.cos(i / 80 * Math.PI * 2)) / 2; Rm.night = k; lo.vol(0.08 * k, 0.1); hi.vol(0.06 * (1 - k), 0.1); await wait(0.06); }
          lo.vol(0.06, 0.5); hi.vol(0.05, 0.5); AudioSys.play('bowl', 57, { vol: 0.08 });
          await say('laozi', '*Yin* and *yang*. Dark and light, soft and hard, rest and motion. Not enemies: partners. Each contains the seed of the other, and each turns into the other.');
          await say('laozi', 'Hear the low tone and the high tone? Alone, each is thin. Together: harmony. *"When everyone knows beauty as beauty, ugliness is already there."* No high without low.');
          lo.stop(2); hi.stop(2); Rm.night = null;
        },
      }),
      thing('pot', 340, 170, null, {
        r: 20, ph: 22, label: 'Look at the pot and wheel',
        async interact() {
          SFX.pour(1.4);
          await say(null, 'You pour water into a clay pot. It fills up the empty space inside.');
          await say('laozi', '*"Thirty spokes share one hub; it is the empty center that makes the wheel useful. Shape clay into a pot; it is the emptiness inside that makes it useful."*');
          await say('laozi', 'Everyone admires what *is*. Few notice the power of what *isn\'t*: the empty room you live in, the silence between notes, the pause before a reply.');
        },
      }),
      npc('cookding', 395, 226, LOOKS.cookding, {
        dir: 2,
        interact: () => cookDingCutscene(),
      }),
      npc('zhuangzi', 86, 238, LOOKS.zhuangzi, {
        pose: { sit: true, closedEyes: true }, dir: 0, label: 'Wake the dreamer',
        async interact() { await butterflyDream(Rm); },
      }),
      thing('block', 179, 238, null, {
        r: 16, ph: 14, label: 'Examine the wood',
        async interact() {
          await say(null, 'A rough, uncarved block of wood.');
          await say('laozi', '*Pu*, the uncarved block. Before it\'s carved into a bowl or a spoon, it could become *anything*. Simplicity is full of possibility.');
          await say('laozi', 'Be like the block: unpretentious, natural, not carved up by ambition and cleverness.');
        },
      }),
      thing('scroll', 429, 152, null, {
        r: 18, ph: 18, label: 'Read the scroll',
        async interact() {
          SFX.paper();
          let fade = 0;
          const end = setActivity({
            ui() {
              panel(110, 40, 260, 90, { bg: '#f3e6c4', border: '#8b5a2b', border2: '#5a3a1a' });
              ctx.globalAlpha = Math.max(0, 1 - fade);
              text('道可道，非常道', 240, 52, { size: 20, align: 'center', color: '#1a1a1a', shadow: false });
              text('The Tao that can be told', 240, 80, { size: 14, align: 'center', color: '#3a2a1a', shadow: false });
              text('is not the eternal Tao.', 240, 94, { size: 14, align: 'center', color: '#3a2a1a', shadow: false });
              ctx.globalAlpha = 1;
              if (fade > 1) text('…', 240, 80, { size: 20, align: 'center', color: '#3a2a1a', shadow: false });
            },
          });
          await say(null, 'The opening line of the *Tao Te Ching*, said to be written by Laozi on his way out of China.');
          for (let i = 0; i < 40; i++) { fade = i / 25; await wait(0.05); }
          await say(null, 'As you read it… the words fade away.');
          await say('laozi', 'The *Tao*, "the Way," is the source and flow of everything. The moment you put it into words, you\'ve made it smaller. Like trying to hold water in your fist.');
          end();
        },
      }),
    ];
  },
  hint() {
    if (!flag('vl_intro')) return 'Talk to *Laozi*, the old man riding a water buffalo by the river.';
    if (!hasInsight('wuwei')) return 'Get in the *boat* at the little dock and try to reach the next valley.';
    return 'Explore: the dripping *stone*, the *yin-yang* stone, the *pot*, *Cook Ding*, the sleeping *Zhuangzi*. The path *east* leads to the Bodhi Tree.';
  },
};

function drawYinYang(g, cx, cy, r, a) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (x * x + y * y > r * r) continue;
    const rx = x * Math.cos(a) + y * Math.sin(a), ry = -x * Math.sin(a) + y * Math.cos(a);
    let dark = rx > 0;
    const top = (rx) * (rx) + (ry + r / 2) * (ry + r / 2) <= (r / 2) * (r / 2), bot = rx * rx + (ry - r / 2) * (ry - r / 2) <= (r / 2) * (r / 2);
    if (top) dark = true; if (bot) dark = false;
    if (rx * rx + (ry + r / 2) ** 2 <= 1.2) dark = false; if (rx * rx + (ry - r / 2) ** 2 <= 1.2) dark = true;
    g.fillStyle = dark ? '#1a1a1a' : '#f5f5f5'; g.fillRect(cx + x, cy + y, 1, 1);
  }
}

async function laoziTalk() {
  if (!flag('vl_intro')) {
    await say('laozi', 'Mm. A traveler. I am called *Laozi*, "the Old Master." Legend says I was keeper of the royal archives, until I grew tired of court life and rode west on this buffalo.');
    await laoziBorderCutscene();
    await say('owl', 'Historians aren\'t sure Laozi was even one real person! The Tao Te Ching may be a collection by several hands. The legend is still lovely.');
    await say('laozi', 'You want to reach the *next valley*? The river goes there. Take the little boat at the dock. Paddle hard!');
    flag('vl_intro', 1);
    return;
  }
  if (!hasInsight('wuwei')) { await say('laozi', 'The boat is waiting at the dock.'); return; }
  const c = await ask('laozi', 'Mm?', ['How should rulers rule?', 'Is wu wei just being lazy?', 'Farewell.']);
  if (c === 0) await say('laozi', '*"Governing a large country is like cooking a small fish."* Poke at it too much and it falls apart. The best leaders are barely noticed. When their work is done, the people say: "We did it ourselves."');
  if (c === 1) await say('laozi', 'Ha! The farmer who pulls on his rice shoots to help them grow faster kills them. The lazy farmer lets weeds win. Wu wei is the *third way*: tend, then trust. Act, but don\'t force.');
}

async function riverJourney() {
  if (hasInsight('wuwei')) { await say(null, 'The river sparkles. You\'ve already learned what it had to teach.'); return; }
  const Rm = Rooms.valley;
  await say('laozi', 'Reach the far valley. Use the *arrow keys* to paddle. Paddle hard!');
  Rm.inBoat = true;
  const L = 1700;
  const cy = x => 136 + Math.sin(x * 0.006) * 38 + Math.sin(x * 0.013 + 1) * 16;
  const rocks = [];
  for (let x = 260; x < L - 100; x += 110) rocks.push([x + Math.sin(x) * 30, cy(x) + (Math.floor(x / 110) % 2 ? 1 : -1) * (34 + (x % 7))]);
  let p = 0, off = 0, vy = 0, effort = 0, effortTotal = 0, jit = 0, noteT = 0, deg = 3, said = 0, msg = null, msgT = 0, bump = 0, spin = 0;
  const harsh = AudioSys.layer('osc', { hz: 92, wave: 'sawtooth', vol: 0.0001, f: 900, dest: 'sfx' });
  const splash = AudioSys.layer('noise', { f: 1800, ftype: 'bandpass', q: 0.8, vol: 0.0001, dest: 'sfx' });
  const flowSnd = AudioSys.layer('noise', { f: 700, ftype: 'lowpass', vol: 0.04, lfo: 0.3, lfoDepth: 0.02 });
  AudioSys.setMusicVol(0.08, 1);
  const scale = [57, 60, 62, 64, 67, 69, 72, 74, 76];
  const end = setActivity({
    hidePlayer: true,
    draw(g, t) {
      const cam = p - 120;
      vgrad(g, 0, 0, W, H, '#5a9ab0', '#2a6a80', 8);
      for (let i = 0; i < 70; i++) { const wx = ((i * 97) - cam * 1.1 + t * 30) % (W + 40); const x = wx < -20 ? wx + W + 40 : wx; R(g, '#8ac8d8', x, (i * 37) % H, 6 + (i % 5), 1); }
      for (let sx = 0; sx < W; sx += 2) {
        const wx = sx + cam, c = cy(wx);
        R(g, '#6a9050', sx, 0, 2, Math.max(0, c - 70)); R(g, '#5a8040', sx, Math.max(0, c - 72), 2, 3);
        R(g, '#6a9050', sx, c + 70, 2, H); R(g, '#5a8040', sx, c + 68, 2, 3);
        if ((wx | 0) % 40 < 2) { R(g, '#5a8a3a', sx, c - 92, 2, 22); R(g, '#5a8a3a', sx, c + 74, 2, 24); }
      }
      for (const [rx, ry] of rocks) { const sx = rx - cam; if (sx > -20 && sx < W + 20) { drawRock(g, sx, ry + 7, 18, 12, '#6a6a6a'); R(g, '#cfe8f0', sx - 10, ry + 6, 3, 1); R(g, '#cfe8f0', sx + 8, ry + 6, 3, 1); } }
      const fx = L - cam; if (fx < W + 40) { R(g, '#f7c948', fx, cy(L) - 40, 3, 80); text && 0; }
      // boat
      const bx = 120 + (Math.random() - 0.5) * jit * 3, by = cy(p) + off + (Math.random() - 0.5) * jit * 3;
      R(g, 'rgba(0,0,0,0.2)', bx - 11, by + 3, 24, 3);
      R(g, '#6b4a2b', bx - 11, by - 1, 22, 5); R(g, '#8b5a2b', bx - 9, by - 3, 18, 2); R(g, '#5a3a1a', bx + 10, by - 2, 3, 3);
      drawPerson(g, bx - 1, by + 1, playerLook(), 3, 0, { noShadow: true, sit: true, armsUp: effort > 0.2 && Math.floor(t * 10) % 2 === 0 });
      if (effort > 0.2) { for (let i = 0; i < 4; i++) R(g, '#ffffff', bx - 14 + Math.random() * 28, by + 2 + Math.random() * 6, 1, 1); }
      // wake
      for (let i = 1; i < 6; i++) R(g, 'rgba(255,255,255,0.5)', bx - 12 - i * 6, by + 2 + (i % 2), 4, 1);
    },
    ui() {
      ctx.fillStyle = '#1a1020'; ctx.fillRect(140, 10, 200, 6);
      ctx.fillStyle = '#5dade2'; ctx.fillRect(140, 10, 200 * Math.min(1, p / L), 6);
      text('the far valley', 344, 7, { size: 11, color: UIC.dim });
      ctx.fillStyle = '#1a1020'; ctx.fillRect(140, 20, 200, 4);
      ctx.fillStyle = '#e74c3c'; ctx.fillRect(140, 20, 200 * Math.min(1, effort), 4);
      text('effort', 344, 17, { size: 11, color: UIC.dim });
      if (msg) { panel(80, 226, 320, 40); richBlock(msg, 88, 232, 304, 13, 12); }
    },
    update(dt) {
      if (Dialog.cur) return;
      const keysDown = down('right') || down('left') || down('up') || down('down');
      effort = clamp(effort + (keysDown ? dt * 1.2 : -dt * 0.9), 0, 1);
      if (keysDown) effortTotal += dt;
      jit = effort;
      let speed;
      if (keysDown) {
        speed = down('left') ? -15 : 12;
        if (down('up')) vy -= 90 * dt; if (down('down')) vy += 90 * dt;
        vy += (Math.random() - 0.5) * 200 * dt;
      } else {
        speed = 62 + Math.sin(G.t) * 6;
        vy += (-off * 2.2 - vy * 1.6) * dt;
      }
      off += vy * dt; off = clamp(off, -60, 60);
      p = Math.max(0, p + speed * dt);
      for (const [rx, ry] of rocks) {
        if (Math.abs(rx - p) < 12 && Math.abs(ry - (cy(p) + off)) < 10 && G.t - bump > 0.6) {
          bump = G.t; SFX.thud(); shake(0.25); vy = -vy * 1.2 - Math.sign(ry - cy(p) - off) * 40; p = Math.max(0, p - 12);
        }
      }
      harsh.vol(effort * 0.07, 0.1); harsh.freq(92 + effort * 40 + Math.random() * 20, 0.05); splash.vol(effort * 0.08, 0.1);
      if (!keysDown) {
        noteT -= dt;
        if (noteT <= 0) { noteT = 0.42 + Math.random() * 0.3; deg = clamp(deg + pick([-2, -1, 1, 1, 2]), 0, scale.length - 1); AudioSys.play('flute', scale[deg], { vol: 0.12 * (1 - effort), dur: 1.4 }); }
      }
      if (msg && G.t - msgT > 4) msg = null;
      if (effortTotal > 3 && said === 0) { said = 1; msg = 'Laozi (from the bank): "Stop. *Put the paddle down.* Stop fighting the river."'; msgT = G.t; }
      if (effortTotal > 8 && said === 1 && keysDown) { said = 2; msg = 'Laozi: "The harder you push, the less you move. *Let go.* Let the water carry you."'; msgT = G.t; }
      if (p >= L) this.done = true;
    },
  });
  const act = G.activity;
  await waitUntil(() => act.done);
  harsh.stop(0.5); splash.stop(0.5); flowSnd.stop(1);
  AudioSys.setMusicVol(0.55, 2);
  [57, 60, 64, 69, 72].forEach((n, i) => AudioSys.play('flute', n + 12, { vol: 0.1, dur: 2 }, i * 0.15));
  end(); Rm.inBoat = false;
  player.x = 300; player.y = 150;
  await narrate('The boat glides gently onto a sandy bank. You arrived without even trying, once you stopped trying.');
  if (effortTotal < 1) await say('laozi', 'Ha! You didn\'t even pick up the paddle. You\'re a natural. Most people fight for years before learning that.');
  else await say('laozi', 'Notice what happened. The harder you paddled, the more you got stuck, spun around and crashed. When you let go, the current carried you *around* every rock.');
  await say('laozi', 'This is *wu wei*: "non-action," or better, *effortless action*. Not doing nothing. Acting *with* the flow of things, like a swimmer using the current instead of fighting it.');
  await say('laozi', '*"The Tao does nothing, yet nothing is left undone."* The seasons turn, the rivers run, the plants grow. No strain, no fuss.');
  await giveInsight('wuwei');
  await say('owl', 'The path *east* toward the Bodhi Tree is open. Laozi\'s ideas will later blend with Buddhism in China, giving rise to *Chan*, known in Japan as *Zen*!');
}

async function butterflyDream(Rm) {
  await say('zhuangzi', 'Mmm… zzz… ah! Oh. I\'m *Zhuangzi*. Sorry, I was dreaming. Want to try? Close your eyes…');
  Rm.dream = true;
  const b = { x: player.x, y: player.y - 10 };
  let notes = 0;
  const end = setActivity({
    hidePlayer: true,
    draw(g, t) {
      const w = Math.floor(t * 12) % 2;
      R(g, '#f39c12', b.x - 4, b.y - 2 - w * 2, 4, 4); R(g, '#f39c12', b.x + 1, b.y - 2 - w * 2, 4, 4);
      R(g, '#e67e22', b.x - 3, b.y + 2, 3, 2); R(g, '#e67e22', b.x + 1, b.y + 2, 3, 2); R(g, '#3a2a1a', b.x, b.y - 2, 1, 5);
      for (let i = 0; i < 5; i++) drawSpark(g, b.x - 10 + i * 5, b.y + 8 + (i % 2) * 3, t + i);
    },
    ui() { text('You are a butterfly. Fly freely! (arrow keys)', 240, 20, { size: 13, align: 'center', color: '#fff' }); },
    update(dt) {
      const dx = (down('right') ? 1 : 0) - (down('left') ? 1 : 0), dy = (down('down') ? 1 : 0) - (down('up') ? 1 : 0);
      b.x = clamp(b.x + dx * 90 * dt + Math.sin(G.t * 5) * 0.4, 10, W - 10); b.y = clamp(b.y + dy * 90 * dt + Math.cos(G.t * 7) * 0.4, 20, H - 10);
      if (Math.random() < dt * 5) { AudioSys.play('pluck', [72, 74, 76, 79, 81, 84][notes++ % 6], { vol: 0.07, dur: 1.5, rev: 0.8 }); }
    },
  });
  await wait(7);
  end(); Rm.dream = false; flash('#ffffff', 0.8);
  await say('zhuangzi', 'Once I, Zhuangzi, dreamt I was a butterfly, fluttering happily, with no idea I was Zhuangzi.');
  await say('zhuangzi', 'Suddenly I woke up, and there I was, solidly Zhuangzi. But now I can\'t tell: *was I Zhuangzi dreaming I was a butterfly, or am I a butterfly dreaming I\'m Zhuangzi?*');
  await say('zhuangzi', 'Maybe the boundaries we draw, between me and not-me, dream and waking, are less fixed than we think. Things keep *transforming* into each other.');
}

async function laoziBorderCutscene() {
  const C = await cutStart();
  await C.stage(STAGES.pass(), 'The western pass · long, long ago');
  const L = C.cast('laozi', 290, 166, { dir: 3 });
  const keeper = C.actor('keeper', { skin: '#e8c095', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#8b1e2b', robe2: '#c9a24a', hat: 'helmet' }, 400, 168, { dir: 2 });
  await C.walk(L, 372, 166, 30);
  C.emote(keeper, '!', 2);
  await say({ name: 'The Gatekeeper', look: keeper.look, voice: 250 }, 'Old Master! You\'re leaving the kingdom forever? Then please, before you go, *write down your wisdom* for us!');
  C.emote(L, '...', 2.5); await wait(1);
  const scroll = C.prop('scroll', 384, 150, (g, t) => { ICONS.scroll(g, 386, 140 + Math.sin(t * 2)); drawSpark(g, 394, 132, t); }, {});
  for (let i = 0; i < 5; i++) { SFX.paper(); await wait(0.35); }
  await say(null, 'Laozi writes about 5,000 characters in two short books. The *Tao Te Ching*: "The Classic of the Way and Its Power."');
  C.emote(keeper, 'heart', 2); keeper.pose = { bow: true };
  await wait(0.8); keeper.pose = {};
  scroll.alpha = 0;
  await C.walk(L, 520, 166, 25);
  await say(null, 'Then he rides west through the gate… and is never seen again.');
  await wait(0.6);
  await C.end();
}

async function cookDingCutscene() {
  await say('cookding', 'I\'m Cook Ding, from a story by *Zhuangzi*. Watch two cooks at work.');
  const C = await cutStart();
  await C.stage(STAGES.kitchen(), 'The kitchen of Lord Wenhui');
  const lord = C.actor('lord', LOOKS.ruler, 326, 166, { dir: 3, pose: { sit: true } });
  const clumsy = C.actor('clumsy', { skin: '#d8a070', hairStyle: 'spiky', hairC: '#1d1d2b', robe: '#8a7050', robe2: '#ecf0f1' }, 372, 214, { dir: 3 });
  const D = C.cast('cookding', 372, 214, { dir: 3, alpha: 0 });
  const blade = C.prop('blade', 0, 0, function (g, t) { if (!this.on) return; R(g, '#bdc3c7', this.x, this.y, 6, 1); R(g, '#8b5a2b', this.x - 3, this.y, 3, 1); }, { z: 300 });
  for (let i = 0; i < 4; i++) { clumsy.pose = { armsUp: true }; await wait(0.15); clumsy.pose = {}; SFX.thud(); SFX.crack(); shake(0.15); await wait(0.25); }
  SFX.snap(); C.emote(clumsy, 'angry', 2);
  await say({ name: 'A clumsy cook', look: clumsy.look, voice: 300 }, 'Argh! Another broken knife! I hack and chop and the bone always wins!');
  await C.fadeActor(clumsy, 0, 0.5);
  await C.fadeActor(D, 1, 0.5);
  C.emote(D, '...', 2); await wait(0.8);
  blade.on = true;
  const notes = [69, 72, 74, 76, 79, 76, 74, 72];
  for (let i = 0; i < 8; i++) { blade.x = 390 + Math.sin(i * 0.8) * 10; blade.y = 189 + (i % 3); SFX.swish(); AudioSys.play('flute', notes[i], { vol: 0.07, dur: 0.6 }); await wait(0.28); }
  blade.on = false;
  C.emote(D, 'note', 2);
  await say('cookding', 'My knife has lasted *nineteen years*. I don\'t force anything. I *feel* for the natural gaps, and the blade glides through like a dance.');
  C.emote(lord, 'idea', 2.5);
  await say({ name: 'Lord Wenhui', look: lord.look, voice: 250 }, 'Excellent! From Cook Ding I have learned how to *live*.');
  await C.end();
}
