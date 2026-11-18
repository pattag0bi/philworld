'use strict';
// ============================================================
// ROOM: The Bodhi Tree — Four Noble Truths, the Middle Way, letting go
// ============================================================
const TREASURES = [
  { id: 'coins', icon: 'coins', x: 160, y: 166, name: 'a pile of gold coins', craving: 'wealth' },
  { id: 'crown', icon: 'crown', x: 336, y: 150, name: 'a jeweled crown', craving: 'power' },
  { id: 'mango', icon: 'mango', x: 72, y: 186, name: 'a perfect, sweet mango', craving: 'pleasure' },
  { id: 'scroll', icon: 'scroll', x: 206, y: 244, name: 'a scroll full of praise for you', craving: 'praise' },
  { id: 'mirror', icon: 'mirror', x: 444, y: 196, name: 'a flattering mirror', craving: 'self-image' },
];
Rooms.bodhi = {
  name: 'The Bodhi Tree', sub: 'Bodh Gaya, India, c. 5th century BCE', scene: 'bodhi',
  spawn: [22, 200], spawnDir: 3,
  walls: [[0, 0, W, 70], [216, 96, 48, 14], [36, 204, 112, 44], [24, 96, 70, 46], [280, 198, 40, 16], [404, 220, 36, 14]],
  surface() { return 'grass'; },
  bg(g) {
    vgrad(g, 0, 0, W, 70, '#f5b041', '#fdebd0', 10);
    for (let x = 0; x < W; x++) { const h = 40 + Math.sin(x * 0.04) * 8 + Math.sin(x * 0.11) * 4; R(g, '#7a9a4a', x, h, 1, 70 - h); }
    tex(g, 0, 68, W, H - 68, '#9ab85a', ['#8aa84a', '#aac86a', '#7f9f40'], 0.12, 101);
    // village hut
    R(g, '#c8a070', 28, 108, 62, 34); for (let i = 0; i < 14; i++) R(g, '#a07a3a', 24 + i * 0.5, 96 + i, 70 - i, 1);
    R(g, '#5a3a1a', 52, 122, 12, 20); R(g, '#f7dc6f', 34, 116, 8, 6);
    // lotus pond
    ellipse(g, 92, 226, 56, 22, '#6a5a3a'); ellipse(g, 92, 224, 52, 18, '#4a8a8a'); ellipse(g, 92, 222, 46, 13, '#5aa0a0');
    for (const [x, y] of [[66, 220], [96, 230], [120, 218], [84, 214]]) { ellipse(g, x, y, 5, 2, '#3a8a3a'); }
    // mandala table
    R(g, '#8b5a2b', 280, 200, 40, 12); R(g, '#a0703a', 280, 198, 40, 3);
    // chariot
    // deer park fence
    for (let x = 360; x < 476; x += 8) R(g, '#8b5a2b', x, 168, 2, 8); R(g, '#8b5a2b', 360, 170, 116, 1);
    // the great tree
    R(g, '#6b4a2b', 230, 50, 20, 60); R(g, '#5a3a1a', 244, 50, 6, 60);
    for (let i = 0; i < 5; i++) R(g, '#6b4a2b', 222 + i * 9, 104 + (i % 2) * 3, 6, 8);
    disc(g, 240, 40, 48, '#3a7a2a'); disc(g, 200, 50, 30, '#4a8a3a'); disc(g, 282, 50, 30, '#4a8a3a'); disc(g, 240, 22, 32, '#5a9a4a');
    const r = mulberry(23);
    for (let i = 0; i < 90; i++) { const a = r() * 6.28, d = r() * 50; const x = 240 + Math.cos(a) * d * 1.2, y = 40 + Math.sin(a) * d * 0.7; R(g, '#6aaa4a', x, y, 3, 2); R(g, '#6aaa4a', x + 1, y + 2, 1, 1); }
    // prayer flags
    for (let i = 0; i < 12; i++) R(g, ['#3498db', '#ecf0f1', '#e74c3c', '#27ae60', '#f1c40f'][i % 5], 300 + i * 12, 76 + Math.sin(i * 0.5) * 3, 6, 5);
    line(g, 296, 76, 448, 78, '#5a3a1a');
    // flowers
    for (let i = 0; i < 60; i++) R(g, pick2(r, ['#f78fb3', '#ffffff', '#f7c948', '#e67e22']), r() * W, 90 + r() * 180, 1, 1);
  },
  under(g, t) {
    // lotuses
    for (const [x, y, i] of [[70, 218, 0], [108, 226, 1], [90, 214, 2]]) {
      const open = this.lotus ? clamp((G.t - this.lotus) / 2 - i * 0.2, 0, 1) : 0.15;
      const s = Math.round(1 + open * 3);
      R(g, '#f8c8d8', x - s, y - 2 - s, s * 2, s); R(g, '#f8a8c8', x - 1, y - 3 - s - Math.round(open * 2), 2, s + 1); R(g, '#f7dc6f', x, y - 3, 1, 1);
    }
    // deer
    for (let i = 0; i < 2; i++) {
      const hop = this.deerHop && G.t - this.deerHop < 1.5 ? Math.abs(Math.sin((G.t - this.deerHop) * 8)) * 6 : 0;
      const x = 390 + i * 40 + Math.sin(t * 0.3 + i * 3) * 10, y = 136 + i * 14 - hop;
      R(g, 'rgba(0,0,0,0.15)', x - 6, 138 + i * 14, 12, 2);
      R(g, '#c8884a', x - 6, y - 8, 12, 5); R(g, '#f5e8d0', x - 4, y - 7, 2, 1); R(g, '#f5e8d0', x + 1, y - 7, 2, 1);
      R(g, '#c8884a', x + 5, y - 12, 3, 5); R(g, '#c8884a', x + 6, y - 13, 4, 3); R(g, '#111', x + 8, y - 12, 1, 1);
      R(g, '#8b5a2b', x + 6, y - 15, 1, 2); R(g, '#8b5a2b', x + 8, y - 15, 1, 2);
      for (const lx of [-5, -3, 3, 5]) R(g, '#a06a3a', x + lx, y - 3, 1, 4);
    }
    // mandala
    const rings = this.mandala || 0, sw = this.sweep;
    const cols = ['#e74c3c', '#f1c40f', '#3498db', '#27ae60', '#ecf0f1', '#9b59b6'];
    if (rings) {
      for (let k = rings - 1; k >= 0; k--) {
        const rad = 2 + k * 2;
        if (sw != null) { const s = clamp((G.t - sw) / 1.5, 0, 1); g.globalAlpha = 1 - s; }
        disc(g, 300, 204, rad, cols[k]);
        g.globalAlpha = 1;
      }
      if (rings >= 3 && sw == null) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; R(g, '#fff', 300 + Math.cos(a) * 7, 204 + Math.sin(a) * 5, 1, 1); } }
    }
    // treasures on the ground
    if (flag('bd_attach') && !flag('bd_letgo')) for (const T of TREASURES) if (!this.carried.includes(T.id)) { ICONS[T.icon](g, T.x, T.y - 6 + Math.sin(t * 3 + T.x) * 1); drawSpark(g, T.x + 6, T.y - 12, t + T.x); }
    // chariot
    drawChariot(g, 422, 232, this.chariot || 0, t);
  },
  over(g, t) {
    // carried treasures stacked above the player
    if (this.carried && this.carried.length && !player.hidden) {
      this.carried.forEach((id, i) => { const T = TREASURES.find(x => x.id === id); ICONS[T.icon](g, player.x + Math.sin(t * 3 + i) * (1 + i * 0.4), player.y - 26 - i * 10); });
    }
    // falling leaves
    for (let i = 0; i < 6; i++) { const k = (t * 0.12 + i / 6) % 1; R(g, '#7aba5a', 200 + i * 15 + Math.sin(t + i) * 10, 60 + k * 120, 2, 1); }
  },
  build() {
    const Rm = this;
    Rm.carried = Rm.carried && flag('bd_attach') && !flag('bd_letgo') ? Rm.carried : [];
    Rm.mandala = 0; Rm.sweep = null; Rm.chariot = 0; Rm.lotus = null;
    const ents = [
      door('west', [0, 176, 6, 44], 'valley', 460, 210, { arrow: 'left', sign: "Laozi's Valley", signPos: [44, 164] }),
      door('east', [474, 100, 6, 40], 'cafe', 240, 250, { arrow: 'right', sign: 'Paris, 1940s', signPos: [444, 88], locked: () => !hasInsight('middleway'), lockedMsg: 'Glaux: "Hoo… first sit with the Buddha under the great tree."' }),
      npc('buddha', 240, 118, LOOKS.buddha, {
        pose: { sit: true, closedEyes: true }, ph: 30, solid: true,
        mark: () => {
          if (hasInsight('middleway')) return null;
          if (flag('bd_attach') && !flag('bd_letgo')) return Rm.carried.length === TREASURES.length ? '!' : null;
          return '!';
        },
        draw(g, t) {
          const a = 0.18 + 0.06 * Math.sin(t * 1.5);
          disc(g, this.x, this.y - 14, 12, `rgba(255,230,150,${a})`);
          drawPerson(g, this.x, this.y, this.look, 0, 0, this.pose);
        },
        interact: () => buddhaTalk(),
      }),
      npc('monk', 330, 212, LOOKS.monk, { dir: 2, interact: () => mandalaScene(Rm) }),
      npc('kisa', 104, 152, LOOKS.kisa, { dir: 3, interact: () => kisaStory() }),
      npc('nagasena', 392, 238, LOOKS.nagasena, { dir: 3, interact: () => chariotScene(Rm) }),
      thing('lotus', 92, 210, null, {
        r: 30, ph: 10, label: 'Watch the lotus',
        async interact() {
          Rm.lotus = G.t; SFX.sparkle(); AudioSys.play('bowl', 64, { vol: 0.08 });
          await say(null, 'Slowly, the lotus flowers open: pure pink petals rising from brown, muddy water.');
          await say('owl', 'The lotus is a favorite Buddhist symbol. It grows *out of* the mud, yet blooms clean. Awakening doesn\'t happen by escaping life\'s mess. It grows *from* it.');
        },
      }),
      thing('deer', 410, 150, null, {
        r: 30, ph: 20, label: 'Watch the deer', iy: -6,
        async interact() {
          Rm.deerHop = G.t; SFX.swish();
          await say(null, 'The deer look up, hop a few steps, then go back to grazing.');
          await say('owl', 'After his awakening, the Buddha gave his very first teaching in a *deer park* at Sarnath, to five former companions. It\'s called "Setting the Wheel of Dharma in Motion."');
        },
      }),
    ];
    TREASURES.forEach(T => ents.push(thing('t_' + T.id, T.x, T.y, null, {
      r: 16, ph: 18, label: 'Take it',
      enabled: () => flag('bd_attach') && !flag('bd_letgo') && !Rm.carried.includes(T.id),
      mark: () => '!',
      async interact() {
        Rm.carried.push(T.id); SFX.coin();
        player.slow = Math.pow(0.78, Rm.carried.length);
        const n = Rm.carried.length;
        Rm.anx = Rm.anx || [];
        Rm.anx.push(AudioSys.layer('osc', { hz: AudioSys.midi(58 + n * 1 + (n % 2) * 6), wave: n % 2 ? 'sawtooth' : 'square', vol: 0.012 + n * 0.004, f: 1200, lfo: 6 + n * 1.3, lfoDepth: 0.012, dest: 'sfx' }));
        await say(null, `You pick up ${T.name}. Mine! (*${T.craving}*)`);
        if (n === 2) await say('owl', 'Hoo… are you walking slower? And what\'s that buzzing?');
        if (n === TREASURES.length) await say(null, 'Arms full. Heavy. Every step is an effort, and the buzzing in your ears won\'t stop. Go back to the Buddha.');
      },
    })));
    return ents;
  },
  onLeave() { if (this.anx) { this.anx.forEach(l => l.stop(0.5)); this.anx = []; } },
  onEnter() {
    if (flag('bd_attach') && !flag('bd_letgo') && this.carried && this.carried.length) {
      player.slow = Math.pow(0.78, this.carried.length);
      this.anx = this.carried.map((_, i) => AudioSys.layer('osc', { hz: AudioSys.midi(59 + i + ((i + 1) % 2) * 6), wave: i % 2 ? 'square' : 'sawtooth', vol: 0.016 + i * 0.004, f: 1200, lfo: 7 + i * 1.3, lfoDepth: 0.012, dest: 'sfx' }));
    }
  },
  hint() {
    if (!flag('bd_lute')) return 'Sit with the *Buddha* beneath the great tree.';
    if (!flag('bd_letgo')) {
      const left = TREASURES.length - this.carried.length;
      return left ? `Collect the glittering *treasures* around the garden. ${left} left.` : 'You carry everything. Return to the *Buddha*.';
    }
    if (!hasInsight('middleway')) return 'Talk to the *Buddha* again.';
    return 'Try the *mandala* with the monk, *Nagasena\'s chariot*, *Kisa Gotami*, and the *lotus* pond. The path *east* leads to Paris.';
  },
};

function drawChariot(g, x, y, s, t) {
  const sep = s ? Math.min(1, (G.t - s) / 1) : 0;
  const k = sep * 14;
  R(g, '#8b5a2b', x - 10 - k * 0.2, y - 12 - k * 0.5, 20, 6); // seat/box
  R(g, '#6b4a2b', x - 14 - k, y - 4, 28, 2); // axle
  ring(g, x - 12 - k * 1.3, y - 4, 6, '#5a3a1a'); ring(g, x + 12 + k * 1.3, y - 4, 6, '#5a3a1a');
  line(g, x - 12 - k * 1.3 - 5, y - 4, x - 12 - k * 1.3 + 5, y - 4, '#5a3a1a'); line(g, x + 12 + k * 1.3 - 5, y - 4, x + 12 + k * 1.3 + 5, y - 4, '#5a3a1a');
  R(g, '#a0703a', x + 10 + k, y - 9 - k * 0.3, 18, 2); // pole
  if (s && sep >= 1) { /* labels drawn in UI */ }
}

async function buddhaTalk() {
  const Rm = Rooms.bodhi;
  if (!flag('bd_lute')) {
    await say('buddha', '…Welcome. Sit with me. I was born *Siddhartha Gautama*, a prince, in a palace full of every pleasure. My father wanted me never to see sorrow.');
    await say('buddha', 'But one day I rode out beyond the palace walls, and I saw *four sights*.');
    await fourSightsCutscene();
    await say('buddha', 'Old age. Sickness. Death. They come to *everyone*, even princes. And then a monk, calm in the middle of it all. I left the palace that night to find out how.');
    await say('buddha', 'For six years I tried the opposite of luxury: fasting until my ribs showed, sleeping on thorns. I nearly died. It didn\'t help either.');
    await say('buddha', 'Then, so the story goes, I overheard a music teacher on a passing boat, instructing a student. Here. Tune this string.');
    await luteTuner();
    flag('bd_lute', 1);
    await say('buddha', 'Too loose, it won\'t sing. Too tight, it snaps. This is the *Middle Way*: not indulgence, not self-torture.');
    await say('buddha', 'I ate a bowl of rice milk, sat beneath this very tree, and vowed not to rise until I understood. At dawn, I *awoke*. "Buddha" means "the awakened one."');
    await say('buddha', 'Now, let me show you the root of suffering. Treasures are scattered around this garden. Go and *gather them all*.');
    flag('bd_attach', 1);
    return;
  }
  if (!flag('bd_letgo')) {
    if (Rm.carried.length < TREASURES.length) { await say('buddha', 'Gather them *all*, every last one. Then come back to me.'); return; }
    await say('buddha', 'You have everything. Wealth, power, pleasure, praise, a fine self-image. Tell me: how do you feel?');
    await ask('buddha', '', ['Heavy. Slow.', 'Anxious. I\'m afraid of dropping something.', 'I want *more*.']);
    await say('buddha', 'This is *tanha*: craving, clinging. We grab at things that cannot last, and then we suffer when they change or slip away.');
    await say('buddha', 'Let go. Press *E* to set each one down.');
    let dropped = 0;
    const end = setActivity({ ui() { text(`Press E to let go  (${dropped}/${TREASURES.length})`, 240, 40, { size: 14, align: 'center', color: UIC.hl }); } });
    while (Rm.carried.length) {
      await nextFrame();
      if (hit('act')) {
        Rm.carried.pop(); dropped++;
        const L = Rm.anx.pop(); if (L) L.stop(1.2);
        player.slow = Math.pow(0.78, Rm.carried.length);
        AudioSys.play('sine', 70 - dropped * 2, { vol: 0.06, dur: 1 }); SFX.whoosh();
      }
    }
    end();
    flag('bd_letgo', 1); player.slow = 1;
    AudioSys.setMusicVol(0.0001, 1);
    await wait(1.6);
    AudioSys.play('bowl', 57, { vol: 0.2, dur: 10 });
    await narrate('…Silence. Then a single singing bowl, slowly fading. You feel light enough to float.');
    AudioSys.setMusicVol(0.55, 4);
    await say('buddha', 'Hear how the bowl rings and fades? Every sound, every flower, every feeling, every life arises and passes away. This is *anicca*, impermanence.');
    await say('buddha', 'Suffering doesn\'t come from things changing. It comes from *clinging* to them as if they wouldn\'t.');
  }
  if (!hasInsight('middleway')) {
    await say('buddha', 'Let me put it the way a doctor would. My first teaching had *four truths*.');
    const panels = [
      ['1 · Diagnosis', 'Life involves *dukkha*: suffering, dissatisfaction, a sense that something is never quite right.', (v, t) => { R(v, '#e8d8c8', 0, 0, 160, 90); ICONS.sick(v, 80, 40); }],
      ['2 · Cause', 'Its cause is *tanha*: craving and clinging, to pleasure, to being, even to not-being.', (v, t) => { R(v, '#e8d8c8', 0, 0, 160, 90); ICONS.coins(v, 66, 44); ICONS.crown(v, 96, 40); for (let i = 0; i < 4; i++) R(v, '#c98e62', 50 + i * 4, 60 - i * 2, 3, 10); }],
      ['3 · Cure', 'Suffering *can end*. That ending is *nirvana*: literally "blowing out," like a flame of craving gone quiet.', (v, t) => { R(v, '#e8d8c8', 0, 0, 160, 90); R(v, '#f5f5f5', 76, 44, 8, 24); if (t < 1.5) drawFlame(v, 80, 44, t, 1); else for (let i = 0; i < 3; i++) R(v, `rgba(120,120,120,${1 - (t - 1.5) % 1})`, 79 + Math.sin(t * 3 + i) * 3, 38 - ((t - 1.5) * 10 + i * 5) % 20, 2, 2); }],
      ['4 · Prescription', 'The *Eightfold Path*: right view, intention, speech, action, livelihood, effort, mindfulness, concentration.', (v, t) => { R(v, '#e8d8c8', 0, 0, 160, 90); ring(v, 80, 45, 26, '#c9a24a', 2); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t * 0.5; line(v, 80, 45, 80 + Math.cos(a) * 26, 45 + Math.sin(a) * 26, '#c9a24a'); } disc(v, 80, 45, 4, '#c9a24a'); }],
    ];
    for (const [title, s, fn] of panels) { showVignette(fn, { title }); AudioSys.play('bowl', 60, { vol: 0.06, dur: 4 }); await say('buddha', s); }
    hideVignette();
    await say('buddha', 'Don\'t believe me because I said it. *Test it*, like a goldsmith tests gold by rubbing and burning it. See for yourself.');
    await giveInsight('middleway');
    await say('owl', 'The path *east* is open, to Paris in the 1940s. Strange neighbors, I know! But they\'re also asking how to live with suffering and freedom.');
    return;
  }
  const c = await ask('buddha', '…', ['What is "not-self"?', 'What is meditation for?', 'Thank you.']);
  if (c === 0) await say('buddha', 'Look for your "self." Is it your body? Your feelings? Thoughts? All are always changing. Ask *Nagasena* by the chariot. He explains it well.');
  if (c === 1) await say('buddha', 'To *see clearly*. Sit, breathe, and watch thoughts arise and pass like clouds. Slowly you stop being pushed around by every craving.');
}

async function luteTuner() {
  let ten = 0.12, hold = 0, snapMsg = 0, beat = 0, vib = 0;
  const end = setActivity({
    ui() {
      panel(150, 24, 180, 110);
      text('Tune the string', 240, 28, { size: 13, align: 'center', color: UIC.hl });
      // the lute body
      ctx.fillStyle = '#8b5a2b'; ctx.beginPath(); ctx.ellipse(240, 108, 26, 18, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#6b4a2b'; ctx.fillRect(236, 44, 8, 60);
      ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.arc(240, 106, 5, 0, 7); ctx.fill();
      // the string
      const amp = Math.max(0, vib) * (1.4 - ten) * 4;
      ctx.strokeStyle = ten > 0.97 ? '#e74c3c' : '#f5f5f5'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let i = 0; i <= 20; i++) { const y = 46 + i * 3.4, x = 240 + Math.sin(i / 20 * Math.PI) * Math.sin(G.t * 60) * amp; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      // tension meter
      ctx.fillStyle = '#1a1020'; ctx.fillRect(170, 50, 6, 70);
      ctx.fillStyle = ten < 0.42 ? '#5dade2' : ten > 0.58 ? '#e74c3c' : '#2ecc71'; ctx.fillRect(170, 120 - ten * 70, 6, ten * 70);
      text('tight', 180, 46, { size: 10, color: UIC.dim }); text('loose', 180, 116, { size: 10, color: UIC.dim });
      text(ten < 0.42 ? 'too loose…' : ten > 0.58 ? 'too tight!' : '♪ just right', 290, 80, { size: 13, align: 'center', color: ten < 0.42 ? '#5dade2' : ten > 0.58 ? '#e74c3c' : '#2ecc71' });
      text('hold ↑ ↓ to tighten / loosen', 240, 138, { size: 12, align: 'center', color: UIC.dim });
      if (snapMsg && G.t - snapMsg < 1.6) text('SNAP! Too tight. Restrung.', 240, 150, { size: 13, align: 'center', color: '#e74c3c' });
    },
    update(dt) {
      if (Dialog.cur) return;
      const d = (down('up') ? 1 : 0) - (down('down') ? 1 : 0);
      ten = clamp(ten + d * dt * 0.35, 0, 1);
      vib -= dt * 1.5;
      if (ten >= 0.99) { SFX.snap(); shake(0.3); ten = 0.15; snapMsg = G.t; }
      beat -= dt;
      if (beat <= 0) {
        beat = 0.7; vib = 1;
        const f = 110 + ten * 330;
        if (ten < 0.42) { AudioSys.play('pluck', f, { hz: true, vol: 0.12 * (0.4 + ten), dur: 0.5, bend: 0.85, wave: 'sawtooth', saw: 0.6, bright: 500 }); }
        else if (ten > 0.58) { AudioSys.play('pluck', f, { hz: true, vol: 0.1, dur: 0.35, wave: 'square', saw: 1, bright: 8000 }); AudioSys.play('pluck', f * 1.06, { hz: true, vol: 0.05, dur: 0.3, wave: 'square' }); }
        else { AudioSys.play('pluck', f, { hz: true, vol: 0.16, dur: 2.2, bend: 1.003 }); AudioSys.play('pluck', f * 1.5, { hz: true, vol: 0.06, dur: 2 }); }
      }
      if (ten >= 0.42 && ten <= 0.58 && !d) hold += dt; else hold = 0;
      if (hold > 2.2) this.done = true;
    },
  });
  const a = G.activity;
  await waitUntil(() => a.done);
  end(); SFX.success();
}

async function mandalaScene(Rm) {
  if (Rm.mandala >= 6 && Rm.sweep == null) return;
  await say('monk', 'I am making a sand mandala, as monks in Tibet do. Thousands of grains, placed one by one, for days or weeks. Will you help? Press *E* to pour each ring.');
  Rm.mandala = 0; Rm.sweep = null;
  const end = setActivity({ ui() { text(`Press E to pour sand  (${Rm.mandala}/6)`, 240, 40, { size: 14, align: 'center', color: UIC.hl }); } });
  while (Rm.mandala < 6) { await nextFrame(); if (hit('act')) { Rm.mandala++; SFX.pour(0.8); AudioSys.play('bell', 72 + Rm.mandala * 2, { vol: 0.05, dur: 1.5 }); } }
  end();
  SFX.sparkle();
  await say('monk', 'Beautiful, isn\'t it? Look at it carefully…');
  Rm.sweep = G.t; SFX.swish(); await wait(0.3); SFX.swish();
  await wait(1.6);
  Rm.mandala = 0; Rm.sweep = null;
  AudioSys.play('bowl', 62, { vol: 0.1 });
  await say('monk', '…and gone. We always sweep it away when it\'s finished, and pour the sand into a river.');
  await say('monk', 'Not because it didn\'t matter. Because *everything* is like this. Making it beautifully *and* letting it go: that\'s the whole practice.');
}

async function kisaStory() {
  await say('kisa', 'My name is Kisa Gotami. I want to tell you how I met the Buddha. It is a sad story, but it ends in peace.');
  await say('kisa', 'My little son died. I couldn\'t accept it. I carried him from house to house, begging for medicine to bring him back.');
  await say('kisa', 'The Buddha said: "Bring me a mustard seed, but only from a house where *no one has ever died*."');
  await kisaCutscene();
  await say('kisa', 'By nightfall I understood. I was not alone. Death touches everyone. I buried my son, and became a nun.');
  await say('owl', 'The Buddha didn\'t argue with her grief. He let her *discover* impermanence for herself, and find that it connected her to everyone else.');
}

async function chariotScene(Rm) {
  await say('nagasena', 'I am the monk Nagasena. A Greek king named *Milinda*, Menander, ruler of northwest India around 150 BCE, once asked me: "Who are you, really?"');
  await say('nagasena', 'I asked him: "Your Majesty, how did you come here?" "By chariot," he said. "Then show me the chariot."');
  Rm.chariot = G.t; SFX.thud(); await wait(0.4); SFX.thud();
  showVignette((v, t) => {
    R(v, '#e8d8b8', 0, 0, 160, 90);
    ring(v, 26, 50, 10, '#5a3a1a'); ring(v, 134, 50, 10, '#5a3a1a'); R(v, '#6b4a2b', 52, 50, 56, 3); R(v, '#8b5a2b', 64, 22, 32, 10); R(v, '#a0703a', 50, 76, 60, 3);
    if (Math.floor(t * 2) % 2) qmark(v, 76, 4, '#c0392b');
  }, { title: 'wheels · axle · box · pole… where is "the chariot"?' });
  await say('nagasena', 'Is the *wheel* the chariot? No. The *axle*? No. The *box*, the *pole*? No. Is the chariot something *apart* from all its parts? No!');
  await say('nagasena', '"Chariot" is a *name* for parts working together. Useful, but there\'s no extra chariot-thing hiding inside.');
  await say('nagasena', 'So too with "Nagasena": body, feelings, perceptions, intentions, awareness, all flowing and changing. That\'s *anatta*, "not-self." No fixed, unchanging core.');
  hideVignette();
  Rm.chariot = 0;
  await say('owl', 'Remember the pond at the Crossroads? "Who is looking back?" This is the Buddhist answer: there\'s a *process*, not a thing. Freeing, once you stop clinging to it!');
}

async function fourSightsCutscene() {
  const C = await cutStart();
  await C.stage(STAGES.palace({ style: 'india', road: true }), 'Kapilavastu · the four sights');
  const prince = C.actor('prince', { skin: '#d9a066', hairStyle: 'short', hairC: '#1d1d2b', robe: '#f1c40f', robe2: '#c0392b', hat: 'crown', long: true }, 150, 190, { dir: 3 });
  const ch = C.actor('channa', { skin: '#c98e62', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#ecf0f1', robe2: '#8b5a2b' }, 132, 196, { dir: 3 });
  const passers = [
    ['An old man', { skin: '#d8b08a', hairStyle: 'bald', hairC: '#ddd', beard: '#ddd', beardLen: 3, robe: '#8a7a6a', robe2: '#5a4a3a', staff: true, long: true }, { bow: true }, 22, 'tear', 'Channa, what is wrong with that man? His back is bent, his hair is white!', 'He is *old*, my prince. It comes to everyone who lives long enough. To you too.'],
    ['A sick man', { skin: '#c8d8a8', hairStyle: 'short', hairC: '#3a2a1a', robe: '#d8d0c0', robe2: '#a8a090' }, { sit: true, closedEyes: true }, 0, 'tear', 'And that one, shaking, lying by the road?', 'He is *sick*, my prince. Anyone can fall ill, even a king.'],
    ['A funeral procession', { skin: '#c98e62', hairStyle: 'short', hairC: '#111', robe: '#ecf0f1', robe2: '#ecf0f1' }, {}, 30, 'tear', 'Why are they carrying that still body, weeping?', 'He has *died*, my prince. Every living thing must die.'],
    ['A wandering monk', LOOKS.monk, { smile: true }, 28, 'idea', 'And him? He owns nothing, yet his face is so *peaceful*.', 'He is a monk, a seeker. He has left everything to find a way beyond suffering.'],
  ];
  for (const [title, look, pose, speed, emote, q, a] of passers) {
    C.caption(title);
    let actors = [];
    if (title === 'A funeral procession') {
      for (let i = 0; i < 3; i++) actors.push(C.actor('f' + i, look, 420 + i * 16, 168, { dir: 2 }));
      actors.push(C.prop('shroud', 440, 156, function (g) { R(g, '#f5f5f5', this.x - 14, this.y, 30, 5); R(g, '#8b5a2b', this.x - 16, this.y + 5, 34, 2); }, {}));
    } else if (title === 'A sick man') {
      actors.push(C.actor('s', look, 300, 168, { pose }));
    } else actors.push(C.actor('p', look, 400, 168, { dir: 2, pose }));
    AudioSys.play('bowl', 55 + passers.findIndex(p => p[0] === title) * 2, { vol: 0.08 });
    if (speed) await Promise.all(actors.map(x => C.walk(x, x.x - 150, x.y, speed)));
    C.face(prince, actors[0]);
    C.emote(prince, emote, 3);
    await say({ name: 'Prince Siddhartha', look: prince.look, voice: 330 }, q);
    await say({ name: 'Channa, the charioteer', look: ch.look, voice: 260 }, a);
    if (speed) await Promise.all(actors.map(x => C.walk(x, x.x - 300, x.y, speed * 1.5)));
    actors.forEach(x => x.alpha = 0);
  }
  await C.black(true);
  C.caption('That night');
  G.tint = 'rgba(16,14,52,0.5)';
  await C.black(false);
  prince.look = Object.assign({}, prince.look, { hat: null, robe: '#e07b1a', robe2: '#b05a10' });
  SFX.sparkle();
  await say(null, 'That night the prince took off his crown, left the palace, and set out to find the end of suffering.');
  await C.walk(prince, -20, 190, 40);
  await C.end();
}
async function kisaCutscene() {
  const C = await cutStart();
  await C.stage(STAGES.village({ dusk: true }), 'Kisa Gotami and the mustard seed');
  const K = C.cast('kisa', 100, 212, { dir: 3 });
  const houses = [];
  const xs = [160, 220, 280, 340, 400];
  xs.forEach((x, i) => houses.push(C.prop('h' + i, x, 200, function (g, t) {
    R(g, '#c8a070', x - 12, 178, 24, 22); for (let k = 0; k < 8; k++) R(g, '#a07a3a', x - 14 + k * 0.5, 170 + k, 28 - k, 1);
    R(g, '#3a2a1a', x - 3, 188, 6, 12);
    if (this.lit) { R(g, '#f7dc6f', x + 5, 184, 5, 5); drawFlame(g, x + 7, 206, t + i, 0.5); }
  }, {})));
  for (let i = 0; i < houses.length; i++) {
    await C.walk(K, xs[i], 212, 45);
    K.dir = 1;
    await wait(0.4);
    houses[i].lit = true;
    AudioSys.play('bell', 64 + [0, 2, 4, 7, 9][i], { vol: 0.06, dur: 2 });
    C.emote(K, i < 4 ? '...' : 'tear', 1.5);
    await wait(0.8);
  }
  await say('kisa', 'I went to every house in the village. Everyone had a seed to give, but every family had lost someone: a parent, a child, a friend.');
  K.dir = 0; K.pose = { sit: true };
  await wait(1.5);
  await C.end();
}
