'use strict';
// ============================================================
// PhilWorld — audio: recorded music tracks + procedural ambience/SFX (Web Audio)
// ============================================================
const AudioSys = (() => {
  let ac = null, master, comp, roomFilter, musicBus, ambBus, sfxBus, revSend, reverb, noiseBuf;
  let muted = false;
  try { muted = localStorage.getItem('philworld-muted') === '1'; } catch (e) { }
  let scene = null, sceneName = null, pendingScene = null;
  let layers = [];
  let musicOverride = null;
  const mus = { step: 0, next: 0, deg: 2 };

  // ---------------- recorded music (audio/music/<scene>.mp3), looped, crossfaded
  // Falls back to the procedural generator below if a track is missing or fails.
  const TRACKS = ['title', 'crossroads', 'agora', 'cave', 'caveOut', 'lyceum', 'stoa', 'mountain', 'courtyard', 'valley', 'bodhi', 'cafe'];
  const TRACK_VOL = 0.5;
  let track = null; // { name, el, gain, ok }
  function startTrack(name) {
    if (track && track.name === name) return;
    stopTrack(2);
    if (!TRACKS.includes(name)) return;
    const el = new Audio('audio/music/' + name + '.mp3');
    el.loop = true; el.preload = 'auto';
    const gain = ac.createGain(); gain.gain.value = 0.0001; gain.connect(musicBus);
    const t = { name, el, gain, ok: true };
    try { ac.createMediaElementSource(el).connect(gain); } catch (e) { t.ok = false; }
    el.addEventListener('error', () => { t.ok = false; });
    el.play().catch(() => { t.ok = false; });
    track = t;
    fadeTrack(musicOverride ? 0.0001 : TRACK_VOL, 2);
  }
  function stopTrack(sec) {
    if (!track) return;
    const t = track; track = null;
    t.gain.gain.setTargetAtTime(0.0001, ac.currentTime, sec / 3);
    setTimeout(() => { t.el.pause(); t.el.removeAttribute('src'); t.gain.disconnect(); }, sec * 1000 + 200);
  }
  function fadeTrack(v, sec) { if (track) track.gain.gain.setTargetAtTime(v, ac.currentTime, sec / 3); }
  const trackPlaying = () => track && track.ok;

  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  const SC = {
    pentMaj: [0, 2, 4, 7, 9], pentMin: [0, 3, 5, 7, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], bhairav: [0, 1, 4, 5, 7, 8, 11],
    dorianJazz: [0, 2, 3, 5, 7, 9, 10],
  };

  function unlock() {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); setup(); }
      catch (e) { ac = null; return; }
    }
    if (ac.state === 'suspended') ac.resume();
  }
  function impulse(sec, decay) {
    const len = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
  function setup() {
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.85;
    comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ac.destination);
    roomFilter = ac.createBiquadFilter(); roomFilter.type = 'lowpass'; roomFilter.frequency.value = 18000; roomFilter.Q.value = 0.8;
    roomFilter.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0.55; musicBus.connect(roomFilter);
    ambBus = ac.createGain(); ambBus.gain.value = 0.7; ambBus.connect(roomFilter);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.75; sfxBus.connect(master);
    reverb = ac.createConvolver(); reverb.buffer = impulse(2.6, 2.4);
    revSend = ac.createGain(); revSend.gain.value = 0.4; revSend.connect(reverb); reverb.connect(roomFilter);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (pendingScene) { const p = pendingScene; pendingScene = null; setScene(p); }
  }
  const now = () => ac ? ac.currentTime : 0;

  function out(dest, rev) {
    const gn = ac.createGain();
    gn.connect(dest || musicBus);
    if (rev) { const s = ac.createGain(); s.gain.value = rev; gn.connect(s); s.connect(revSend); }
    return gn;
  }
  function noiseSrc() {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    s.loopStart = 0; s.loopEnd = 2;
    return s;
  }
  function env(gp, t, a, peak, dur) {
    gp.setValueAtTime(0.0001, t);
    gp.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    gp.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  // ---------------- instruments
  const I = {
    pluck(f, t, o = {}) {
      const dur = o.dur || 1.3, vol = o.vol || 0.22;
      const os = ac.createOscillator(); os.type = o.wave || 'triangle'; os.frequency.setValueAtTime(f, t);
      if (o.bend) os.frequency.exponentialRampToValueAtTime(f * o.bend, t + Math.min(dur, 0.5));
      const os2 = ac.createOscillator(); os2.type = 'sawtooth'; os2.frequency.setValueAtTime(f, t); os2.detune.value = o.detune || 5;
      if (o.bend) os2.frequency.exponentialRampToValueAtTime(f * o.bend, t + Math.min(dur, 0.5));
      const g2 = ac.createGain(); g2.gain.value = o.saw == null ? 0.25 : o.saw;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(o.bright || Math.min(f * 7, 12000), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.1, 90), t + dur * 0.8);
      const gn = out(o.dest, o.rev == null ? 0.35 : o.rev);
      env(gn.gain, t, 0.004, vol, dur);
      os.connect(lp); os2.connect(g2); g2.connect(lp); lp.connect(gn);
      os.start(t); os2.start(t); os.stop(t + dur + 0.05); os2.stop(t + dur + 0.05);
    },
    flute(f, t, o = {}) {
      const dur = o.dur || 1.1, vol = o.vol || 0.14;
      const os = ac.createOscillator(); os.type = 'sine'; os.frequency.value = f;
      const lfo = ac.createOscillator(); lfo.frequency.value = 5.2;
      const lg = ac.createGain(); lg.gain.value = f * 0.01; lfo.connect(lg); lg.connect(os.frequency);
      const h = ac.createOscillator(); h.type = 'triangle'; h.frequency.value = f * 2;
      const hg = ac.createGain(); hg.gain.value = 0.07; h.connect(hg);
      const gn = out(o.dest, o.rev == null ? 0.55 : o.rev);
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + 0.09);
      gn.gain.setValueAtTime(vol, t + dur * 0.6);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      os.connect(gn); hg.connect(gn);
      const n = noiseSrc(); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 3;
      const ng = ac.createGain(); ng.gain.setValueAtTime(vol * 0.5, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      n.connect(bp); bp.connect(ng); ng.connect(gn);
      for (const s of [os, lfo, h]) { s.start(t); s.stop(t + dur + 0.1); }
      n.start(t, Math.random()); n.stop(t + 0.25);
    },
    bowl(f, t, o = {}) {
      const dur = o.dur || 7, vol = o.vol || 0.16;
      const gn = out(o.dest || ambBus, o.rev == null ? 0.6 : o.rev);
      gn.gain.value = 1;
      [[1, 1], [2.71, 0.45], [5.15, 0.2], [8.6, 0.08]].forEach(([r, a]) => {
        for (const dt of [0, 1.7]) {
          const os = ac.createOscillator(); os.type = 'sine'; os.frequency.value = f * r + dt;
          const gg = ac.createGain(); const d = dur / (r * 0.5 + 0.5);
          env(gg.gain, t, 0.01, vol * a * 0.5, d);
          os.connect(gg); gg.connect(gn); os.start(t); os.stop(t + d + 0.1);
        }
      });
    },
    bell(f, t, o = {}) {
      const dur = o.dur || 2.6, vol = o.vol || 0.14;
      const gn = out(o.dest, o.rev == null ? 0.5 : o.rev); gn.gain.value = 1;
      [[1, 1], [2, 0.5], [2.4, 0.35], [3, 0.25], [4.2, 0.15], [5.4, 0.08]].forEach(([r, a]) => {
        const os = ac.createOscillator(); os.type = 'sine'; os.frequency.value = f * r;
        const gg = ac.createGain(); env(gg.gain, t, 0.003, vol * a, dur / (0.6 + r * 0.3));
        os.connect(gg); gg.connect(gn); os.start(t); os.stop(t + dur + 0.1);
      });
    },
    piano(f, t, o = {}) {
      const dur = o.dur || 1.8, vol = o.vol || 0.16;
      const gn = out(o.dest, o.rev == null ? 0.35 : o.rev);
      env(gn.gain, t, 0.006, vol, dur);
      const a = ac.createOscillator(); a.type = 'triangle'; a.frequency.value = f;
      const b = ac.createOscillator(); b.type = 'sine'; b.frequency.value = f * 2; const bg = ac.createGain(); bg.gain.value = 0.3;
      const c = ac.createOscillator(); c.type = 'sine'; c.frequency.value = f * 3.01; const cg = ac.createGain(); cg.gain.value = 0.08;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 8, t); lp.frequency.exponentialRampToValueAtTime(f * 2, t + dur);
      a.connect(lp); b.connect(bg); bg.connect(lp); c.connect(cg); cg.connect(lp); lp.connect(gn);
      for (const s of [a, b, c]) { s.start(t); s.stop(t + dur + 0.05); }
    },
    pad(f, t, o = {}) {
      const dur = o.dur || 4, vol = o.vol || 0.06;
      const gn = out(o.dest, o.rev == null ? 0.5 : o.rev);
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp || 900;
      for (const d of [-7, 7]) {
        const os = ac.createOscillator(); os.type = o.wave || 'sawtooth'; os.frequency.value = f; os.detune.value = d;
        os.connect(lp); os.start(t); os.stop(t + dur + 0.1);
      }
      lp.connect(gn);
    },
    sine(f, t, o = {}) {
      const dur = o.dur || 0.6, vol = o.vol || 0.12;
      const os = ac.createOscillator(); os.type = o.wave || 'sine'; os.frequency.setValueAtTime(f, t);
      if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      const gn = out(o.dest, o.rev == null ? 0.3 : o.rev);
      env(gn.gain, t, o.a || 0.005, vol, dur);
      os.connect(gn); os.start(t); os.stop(t + dur + 0.05);
    },
    drum(f, t, o = {}) {
      const dur = o.dur || 0.35, vol = o.vol || 0.4;
      const os = ac.createOscillator(); os.type = 'sine';
      os.frequency.setValueAtTime(f * 2.5, t); os.frequency.exponentialRampToValueAtTime(f, t + 0.06);
      const gn = out(o.dest, o.rev == null ? 0.15 : o.rev); env(gn.gain, t, 0.002, vol, dur);
      os.connect(gn); os.start(t); os.stop(t + dur + 0.05);
    },
    noise(t, o = {}) {
      const dur = o.dur || 0.2, vol = o.vol || 0.2;
      const n = noiseSrc(); const f = ac.createBiquadFilter(); f.type = o.type || 'bandpass';
      f.frequency.setValueAtTime(o.f || 1000, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      f.Q.value = o.q || 1;
      const gn = out(o.dest || sfxBus, o.rev || 0);
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + (o.a || 0.003));
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(f); f.connect(gn); n.start(t, Math.random() * 1.5); n.stop(t + dur + 0.05);
    },
  };

  function play(inst, note, o = {}, delay = 0) {
    if (!ac || !I[inst]) return;
    if (inst === 'noise') return I.noise(ac.currentTime + delay + 0.01, o);
    const f = note < 200 && !o.hz ? midi(note) : note;
    I[inst](f, ac.currentTime + delay + 0.01, o);
  }

  // ---------------- continuous layers
  const DUMMY = { vol() { }, freq() { }, cut() { }, stop() { }, q() { } };
  function layer(kind, o = {}) {
    if (!ac) return DUMMY;
    const gn = ac.createGain(); gn.gain.value = 0.0001; gn.connect(o.dest === 'music' ? musicBus : o.dest === 'sfx' ? sfxBus : ambBus);
    let src, filt, lfo;
    filt = ac.createBiquadFilter(); filt.type = o.ftype || 'lowpass'; filt.frequency.value = o.f || 800; filt.Q.value = o.q || 0.7;
    if (kind === 'noise') { src = noiseSrc(); }
    else {
      src = ac.createOscillator(); src.type = o.wave || 'sine'; src.frequency.value = o.hz || 220;
      if (o.f == null) filt.frequency.value = 6000;
    }
    src.connect(filt); filt.connect(gn);
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; gn.connect(s); s.connect(revSend); }
    if (kind === 'noise') src.start(0, Math.random()); else src.start();
    if (o.lfo) {
      lfo = ac.createOscillator(); lfo.frequency.value = o.lfo;
      const lg = ac.createGain(); lg.gain.value = o.lfoDepth == null ? (o.vol || 0.1) * 0.6 : o.lfoDepth;
      lfo.connect(lg); lg.connect(gn.gain); lfo.start();
    }
    let vib;
    if (o.vib) {
      vib = ac.createOscillator(); vib.frequency.value = o.vib;
      const vg = ac.createGain(); vg.gain.value = o.vibDepth || 8; vib.connect(vg); vg.connect(src.detune || src.playbackRate); vib.start();
    }
    const L = {
      vol(v, ti = 0.5) { gn.gain.setTargetAtTime(Math.max(v, 0.0001), ac.currentTime, Math.max(ti, 0.01) / 3); },
      freq(f, ti = 0.1) { if (src.frequency) src.frequency.setTargetAtTime(f, ac.currentTime, Math.max(ti, 0.01) / 3); },
      cut(f, ti = 0.1) { filt.frequency.setTargetAtTime(f, ac.currentTime, Math.max(ti, 0.01) / 3); },
      q(v) { filt.Q.value = v; },
      stop(ti = 1) {
        gn.gain.setTargetAtTime(0.0001, ac.currentTime, Math.max(ti, 0.01) / 3);
        setTimeout(() => { try { src.stop(); lfo && lfo.stop(); vib && vib.stop(); gn.disconnect(); } catch (e) { } }, ti * 1000 + 600);
      },
    };
    L.vol(o.vol == null ? 0.1 : o.vol, o.fadeIn || 1.2);
    return L;
  }

  // ---------------- random ambient events
  const EV = {
    cricket() { const t = now() + 0.01; for (let i = 0; i < 3; i++) I.sine(4200 + Math.random() * 300, t + i * 0.07, { dur: 0.04, vol: 0.02, dest: ambBus, rev: 0.1 }); },
    bird() {
      const t = now() + 0.01, b = 2200 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) I.sine(b + Math.random() * 400, t + i * 0.11, { dur: 0.09, vol: 0.035, to: b * (Math.random() < 0.5 ? 1.3 : 0.8), dest: ambBus, rev: 0.3 });
    },
    drip() { const f = 900 + Math.random() * 900; I.sine(f, now() + 0.01, { dur: 0.18, vol: 0.06, to: f * 0.55, dest: ambBus, rev: 1.2 }); },
    crackle() { const t = now(); for (let i = 0; i < 1 + Math.random() * 3; i++) I.noise(t + Math.random() * 0.15, { type: 'highpass', f: 2500, dur: 0.02, vol: 0.06, dest: ambBus }); },
    gull() { const t = now() + 0.01; I.sine(1300, t, { wave: 'sawtooth', dur: 0.35, vol: 0.012, to: 900, dest: ambBus, rev: 0.6 }); I.sine(1400, t + 0.4, { wave: 'sawtooth', dur: 0.3, vol: 0.01, to: 1000, dest: ambBus, rev: 0.6 }); },
    eagle() { I.sine(2000, now() + 0.01, { wave: 'sawtooth', dur: 0.7, vol: 0.012, to: 1100, dest: ambBus, rev: 1 }); },
    templeBell() { I.bell(midi(48 + pick([0, 7, 12])), now() + 0.01, { vol: 0.06, dur: 5, dest: ambBus, rev: 0.9 }); },
    wood() { const f = pick([600, 700, 800, 900]); I.sine(f, now() + 0.01, { dur: 0.08, vol: 0.08, dest: ambBus, rev: 0.5 }); },
    bowl() { I.bowl(midi(pick([55, 57, 60, 62])), now() + 0.01, { vol: 0.07, dur: 8 }); },
    clink() { I.bell(midi(pick([88, 91, 93])), now() + 0.01, { vol: 0.02, dur: 0.6, dest: ambBus, rev: 0.4 }); },
    thunderFar() { I.noise(now() + 0.01, { type: 'lowpass', f: 180, dur: 3, vol: 0.12, a: 0.6, dest: ambBus }); },
    owlHoot() { const t = now() + 0.01; I.sine(400, t, { dur: 0.3, vol: 0.03, to: 360, dest: ambBus, rev: 0.6, a: 0.06 }); I.sine(380, t + 0.45, { dur: 0.5, vol: 0.03, to: 340, dest: ambBus, rev: 0.6, a: 0.08 }); },
    murmur() { const t = now() + 0.01; for (let i = 0; i < 4; i++) I.sine(140 + Math.random() * 120, t + i * 0.12, { wave: 'sawtooth', dur: 0.12, vol: 0.006, dest: ambBus, rev: 0.4 }); },
    wave() { I.noise(now() + 0.01, { type: 'lowpass', f: 700, to: 300, dur: 2.5, vol: 0.08, a: 0.9, dest: ambBus }); },
    hiss() { I.noise(now() + 0.01, { type: 'highpass', f: 3000, dur: 1.2, vol: 0.03, a: 0.2, dest: ambBus }); },
    chime() { const b = 76 + pick([0, 2, 4, 7, 9]); I.bell(midi(b), now() + 0.01, { vol: 0.025, dur: 2, dest: ambBus, rev: 0.8 }); },
  };

  // ---------------- music generator
  function noteOf(m, deg, oct) {
    const sc = m.scale, n = sc.length;
    const o = Math.floor(deg / n), i = ((deg % n) + n) % n;
    return midi(m.root + sc[i] + 12 * o + (oct || 0));
  }
  function playStep(m, t, s) {
    if (m.custom) return m.custom(t, s, I, midi);
    const per = m.bar || 8;
    const bar = Math.floor(s / per), pos = s % per;
    const prog = m.prog || [0, 3, 4, 0];
    const ch = prog[bar % prog.length];
    if (m.bass && pos === 0) I[m.bassInst || m.inst](noteOf(m, ch, -12), t, { vol: m.bassVol || 0.13, dur: m.bassDur || 2.6, rev: 0.3 });
    if (m.pad && pos === 0 && bar % 2 === 0) {
      for (const d of [0, 2, 4]) I.pad(noteOf(m, ch + d, -12), t, { dur: m.padDur || 6, vol: m.padVol || 0.03, lp: m.padLp || 900, wave: m.padWave });
    }
    if (m.drone && s % (m.droneEvery || 32) === 0) {
      I.pad(midi(m.root - 24), t, { dur: m.droneDur || 12, vol: m.droneVol || 0.04, lp: m.droneLp || 500 });
      I.pad(midi(m.root - 17), t, { dur: m.droneDur || 12, vol: (m.droneVol || 0.04) * 0.7, lp: m.droneLp || 500 });
    }
    const strong = pos % 2 === 0;
    if (Math.random() < (strong ? m.density : m.density * 0.35)) {
      const step = pick([-2, -1, -1, 0, 1, 1, 2, -3, 3]);
      mus.deg = clamp(mus.deg + step, m.lo == null ? 0 : m.lo, m.hi == null ? 9 : m.hi);
      if (pos === 0 && Math.random() < 0.5) mus.deg = ch + pick([0, 2, 4, 7]);
      const dur = (m.noteDur || 1.2) * (strong ? 1 : 0.7);
      I[m.inst](noteOf(m, mus.deg, m.oct || 0), t, { vol: (m.vol || 0.12) * (strong ? 1 : 0.75), dur, bend: m.bend, rev: m.rev, wave: m.wave, saw: m.saw });
      if (m.harm && Math.random() < m.harm) I[m.inst](noteOf(m, mus.deg - 2, m.oct || 0), t, { vol: (m.vol || 0.12) * 0.5, dur, wave: m.wave });
    }
  }
  function musicTick() {
    const m = musicOverride || (!trackPlaying() && scene && scene.music);
    if (!m || !ac) return;
    const spb = 60 / m.bpm / 2;
    if (mus.next < ac.currentTime) mus.next = ac.currentTime + 0.05;
    while (mus.next < ac.currentTime + 0.2) {
      try { playStep(m, mus.next, mus.step); } catch (e) { console.error(e); }
      mus.step++;
      mus.next += spb;
    }
  }

  // ---------------- scenes
  const SCENES = {
    title: {
      music: { bpm: 60, root: 57, scale: SC.pentMaj, inst: 'bell', density: 0.35, vol: 0.06, noteDur: 3, pad: true, padVol: 0.035, prog: [0, 3, 1, 4], oct: 12 },
      layers: [['noise', { f: 400, vol: 0.015, lfo: 0.07 }]], events: [[0.2, 'chime']],
    },
    crossroads: {
      music: { bpm: 76, root: 62, scale: SC.pentMaj, inst: 'pluck', density: 0.5, vol: 0.1, bass: true, prog: [0, 3, 1, 4], noteDur: 1.6 },
      layers: [['noise', { f: 500, vol: 0.02, lfo: 0.08 }]], events: [[0.7, 'cricket'], [0.25, 'bird'], [0.03, 'owlHoot']],
    },
    agora: {
      music: { bpm: 96, root: 62, scale: SC.dorian, inst: 'pluck', density: 0.6, vol: 0.11, bass: true, prog: [0, 3, 0, 4], noteDur: 1.1 },
      layers: [['noise', { f: 450, ftype: 'bandpass', q: 0.8, vol: 0.025, lfo: 0.2 }], ['noise', { f: 2400, ftype: 'bandpass', q: 3, vol: 0.006, lfo: 0.3 }]],
      events: [[0.3, 'bird'], [0.5, 'murmur']],
    },
    cave: {
      music: { bpm: 50, root: 45, scale: SC.phrygian, inst: 'sine', density: 0.18, vol: 0.06, noteDur: 3, drone: true, droneVol: 0.05, droneEvery: 24, droneDur: 10, rev: 1 },
      layers: [['noise', { f: 160, vol: 0.05, lfo: 0.05 }], ['noise', { f: 900, ftype: 'bandpass', q: 0.6, vol: 0.02 }]],
      events: [[0.8, 'drip'], [3.5, 'crackle']],
    },
    caveOut: {
      music: { bpm: 84, root: 65, scale: SC.lydian, inst: 'flute', density: 0.45, vol: 0.1, noteDur: 1.6, pad: true, padVol: 0.025, prog: [0, 1, 4, 0], padWave: 'triangle', padLp: 2000 },
      layers: [['noise', { f: 900, vol: 0.02, lfo: 0.1 }]], events: [[0.9, 'bird']],
    },
    lyceum: {
      music: { bpm: 100, root: 60, scale: SC.mixo, inst: 'pluck', density: 0.55, vol: 0.1, bass: true, prog: [0, 6, 3, 0], noteDur: 1.2, harm: 0.15 },
      layers: [['noise', { f: 3000, ftype: 'highpass', vol: 0.012, lfo: 0.5 }]], events: [[0.5, 'bird']],
    },
    stoa: {
      music: { bpm: 70, root: 57, scale: SC.aeolian, inst: 'pluck', density: 0.42, vol: 0.1, bass: true, prog: [0, 5, 3, 4], noteDur: 1.8 },
      layers: [['noise', { f: 500, vol: 0.06, lfo: 0.09, lfoDepth: 0.04 }]], events: [[0.12, 'gull'], [0.25, 'wave']],
    },
    mountain: {
      music: { bpm: 60, root: 50, scale: SC.aeolian, inst: 'piano', density: 0.3, vol: 0.12, bass: true, bassVol: 0.1, prog: [0, 5, 2, 6], noteDur: 2.4, pad: true, padVol: 0.03, padLp: 700 },
      layers: [['noise', { f: 700, ftype: 'bandpass', q: 0.7, vol: 0.06, lfo: 0.13, lfoDepth: 0.05 }], ['noise', { f: 2200, ftype: 'bandpass', q: 4, vol: 0.01, lfo: 0.21 }]],
      events: [[0.06, 'eagle']],
    },
    courtyard: {
      music: { bpm: 66, root: 60, scale: SC.pentMaj, inst: 'pluck', density: 0.45, vol: 0.12, bend: 0.985, noteDur: 2.4, bass: true, bassVol: 0.08, prog: [0, 3, 1, 4], saw: 0.1 },
      layers: [['noise', { f: 2500, ftype: 'bandpass', q: 1.2, vol: 0.012, lfo: 0.3 }]], events: [[0.35, 'bird'], [0.05, 'templeBell'], [0.08, 'chime']],
    },
    valley: {
      music: { bpm: 64, root: 57, scale: SC.pentMin, inst: 'flute', density: 0.42, vol: 0.12, noteDur: 2.2, drone: true, droneVol: 0.025, droneEvery: 32, oct: 12 },
      layers: [['noise', { f: 1100, ftype: 'bandpass', q: 0.5, vol: 0.05, lfo: 0.25, lfoDepth: 0.02 }], ['noise', { f: 350, vol: 0.03, lfo: 0.06 }]],
      events: [[0.2, 'wood'], [0.3, 'bird']],
    },
    bodhi: {
      music: { bpm: 58, root: 55, scale: SC.bhairav, inst: 'pluck', density: 0.3, vol: 0.09, noteDur: 2.4, bend: 1.01, drone: true, droneVol: 0.045, droneEvery: 16, droneDur: 9, droneLp: 700 },
      layers: [['noise', { f: 3000, ftype: 'bandpass', q: 2, vol: 0.006, lfo: 0.4 }]], events: [[0.6, 'bird'], [0.06, 'bowl']],
    },
    cafe: {
      music: {
        bpm: 72, custom: (t, s, I, midi) => {
          // slow jazz: Dm9 - G13 - Cmaj9 - A7b9, comping on beats, melody sprinkles
          const chords = [[50, 53, 57, 60, 64], [43, 53, 59, 64, 67], [48, 52, 55, 59, 62], [45, 49, 55, 58, 61]];
          const bar = Math.floor(s / 8) % 4, pos = s % 8, c = chords[bar];
          if (pos === 0) { I.piano(midi(c[0] - 12), t, { vol: 0.12, dur: 2.5 }); c.slice(1).forEach((n, i) => I.piano(midi(n), t + i * 0.015, { vol: 0.05, dur: 2.2 })); }
          if (pos === 5 && Math.random() < 0.6) c.slice(1).forEach(n => I.piano(midi(n), t, { vol: 0.03, dur: 0.6 }));
          if (pos % 2 === 0) I.noise(t, { type: 'highpass', f: 7000, dur: 0.06, vol: 0.012, dest: musicBus });
          if (pos % 2 === 1 && Math.random() < 0.45) { const m = c[2 + Math.floor(Math.random() * 3)] + 12; I.piano(midi(m), t, { vol: 0.07, dur: 1.1 }); }
        },
      },
      layers: [['noise', { f: 5000, ftype: 'highpass', vol: 0.03, lfo: 0.3, lfoDepth: 0.01 }], ['noise', { f: 300, vol: 0.02 }]],
      events: [[0.15, 'clink'], [0.05, 'thunderFar']],
    },
  };

  function setScene(name) {
    if (!ac) { pendingScene = name; sceneName = name; return; }
    if (scene && sceneName === name && layers.length) return;
    for (const L of layers) L.stop(1.5);
    layers = [];
    scene = SCENES[name] || null; sceneName = name;
    musicOverride = null;
    mus.deg = 3;
    startTrack(name);
    if (!scene) return;
    for (const [k, o] of (scene.layers || [])) layers.push(layer(k, o));
  }
  function tick(dt) {
    if (!ac || ac.state !== 'running') return;
    musicTick();
    if (scene && scene.events) for (const [rate, name] of scene.events) if (Math.random() < rate * dt) EV[name]();
  }
  function setMuffle(f, ti = 0.8) {
    if (!ac) return;
    roomFilter.frequency.setTargetAtTime(f, ac.currentTime, ti / 3);
  }
  function setMusicVol(v, ti = 0.8) { if (ac) musicBus.gain.setTargetAtTime(v, ac.currentTime, ti / 3); }
  // Custom cutscene music (e.g. Nietzsche's recurrence melody) temporarily replaces the room track.
  function setMusic(m) { musicOverride = m; mus.step = 0; if (ac) { mus.next = ac.currentTime + 0.05; fadeTrack(m ? 0.0001 : TRACK_VOL, m ? 1 : 3); } }
  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('philworld-muted', muted ? '1' : '0'); } catch (e) { }
    if (ac) master.gain.setTargetAtTime(muted ? 0 : 0.85, ac.currentTime, 0.05);
    return muted;
  }

  // ---------------- sound effects
  const sfxQ = (fn) => { if (ac) fn(ac.currentTime + 0.005); };
  const S = {
    blip(p = 520, wave = 'square') { sfxQ(t => I.sine(p * (0.95 + Math.random() * 0.1), t, { wave, dur: 0.045, vol: 0.035, dest: sfxBus, rev: 0 })); },
    select() { sfxQ(t => I.sine(880, t, { wave: 'square', dur: 0.05, vol: 0.04, dest: sfxBus, rev: 0 })); },
    confirm() { sfxQ(t => { I.sine(660, t, { wave: 'square', dur: 0.06, vol: 0.04, dest: sfxBus, rev: 0 }); I.sine(990, t + 0.06, { wave: 'square', dur: 0.08, vol: 0.04, dest: sfxBus, rev: 0 }); }); },
    step(surf) {
      sfxQ(t => {
        const m = { grass: [2200, 'highpass', 0.018], stone: [1400, 'bandpass', 0.03], wood: [500, 'bandpass', 0.04], snow: [3500, 'bandpass', 0.03], sand: [3000, 'highpass', 0.02], dirt: [900, 'bandpass', 0.03] }[surf || 'stone'] || [1400, 'bandpass', 0.03];
        I.noise(t, { f: m[0] * (0.9 + Math.random() * 0.2), type: m[1], dur: 0.05, vol: m[2], q: 1.5 });
      });
    },
    interact() { sfxQ(t => { I.sine(660, t, { dur: 0.08, vol: 0.06, dest: sfxBus }); I.sine(1320, t + 0.05, { dur: 0.12, vol: 0.05, dest: sfxBus }); }); },
    chime() { sfxQ(t => [72, 76, 79, 84, 88].forEach((n, i) => I.bell(midi(n), t + i * 0.09, { vol: 0.09, dur: 2.5, dest: sfxBus, rev: 0.6 }))); },
    door() { sfxQ(t => I.noise(t, { type: 'bandpass', f: 300, to: 1800, dur: 0.45, vol: 0.12, a: 0.1, q: 0.7 })); },
    crack() { sfxQ(t => { I.noise(t, { type: 'bandpass', f: 2600, dur: 0.12, vol: 0.25, q: 2 }); I.sine(300, t, { wave: 'square', to: 80, dur: 0.15, vol: 0.06, dest: sfxBus }); }); },
    shatter() { sfxQ(t => { for (let i = 0; i < 14; i++) I.bell(midi(84 + Math.floor(Math.random() * 20)), t + Math.random() * 0.5, { vol: 0.05, dur: 0.6, dest: sfxBus }); I.noise(t, { type: 'highpass', f: 3000, dur: 0.6, vol: 0.25 }); }); },
    boing() { sfxQ(t => I.sine(520, t, { dur: 0.45, vol: 0.1, to: 140, dest: sfxBus, rev: 0.1 })); },
    success() { sfxQ(t => [67, 71, 74, 79].forEach((n, i) => I.pluck(midi(n), t + i * 0.08, { vol: 0.12, dur: 1.2, dest: sfxBus }))); },
    chain() { sfxQ(t => { for (let i = 0; i < 3; i++) I.bell(midi(90 + Math.floor(Math.random() * 6)), t + i * 0.04, { vol: 0.05, dur: 0.25, dest: sfxBus }); }); },
    rumble(d = 1.6) { sfxQ(t => I.noise(t, { type: 'lowpass', f: 140, dur: d, vol: 0.45, a: 0.08 })); },
    thunder() { sfxQ(t => { I.noise(t, { type: 'highpass', f: 1200, dur: 0.25, vol: 0.2 }); I.noise(t + 0.05, { type: 'lowpass', f: 220, dur: 2.8, vol: 0.5, a: 0.15 }); }); },
    swish() { sfxQ(t => I.noise(t, { type: 'bandpass', f: 600, to: 3500, dur: 0.3, vol: 0.12, a: 0.05, q: 1 })); },
    pour(d = 1.5) { sfxQ(t => I.noise(t, { type: 'bandpass', f: 1400, to: 2600, dur: d, vol: 0.08, a: 0.15, q: 2 })); },
    hollow() { sfxQ(t => { I.sine(220, t, { dur: 1.6, vol: 0.14, dest: sfxBus, rev: 1.2 }); I.sine(331, t, { dur: 1.2, vol: 0.07, dest: sfxBus, rev: 1.2 }); I.noise(t, { f: 900, dur: 0.05, vol: 0.2 }); }); },
    thud() { sfxQ(t => I.drum(55, t, { vol: 0.5, dest: sfxBus, dur: 0.4 })); },
    roar() { sfxQ(t => { I.sine(110, t, { wave: 'sawtooth', dur: 0.9, vol: 0.12, to: 70, dest: sfxBus, rev: 0.3 }); I.noise(t, { type: 'lowpass', f: 600, dur: 0.9, vol: 0.18, a: 0.1 }); }); },
    snap() { sfxQ(t => { I.noise(t, { type: 'highpass', f: 2000, dur: 0.06, vol: 0.35 }); I.sine(1800, t, { dur: 0.25, vol: 0.08, to: 200, wave: 'square', dest: sfxBus }); }); },
    coin() { sfxQ(t => { I.sine(1975, t, { wave: 'square', dur: 0.06, vol: 0.04, dest: sfxBus, rev: 0 }); I.sine(2637, t + 0.07, { wave: 'square', dur: 0.2, vol: 0.04, dest: sfxBus, rev: 0 }); }); },
    sparkle() { sfxQ(t => { for (let i = 0; i < 6; i++) I.sine(2000 + Math.random() * 3000, t + i * 0.05, { dur: 0.12, vol: 0.025, dest: sfxBus, rev: 0.5 }); }); },
    buzz() { sfxQ(t => { const os = ac.createOscillator(); os.type = 'sawtooth'; os.frequency.value = 210; const l = ac.createOscillator(); l.frequency.value = 30; const lg = ac.createGain(); lg.gain.value = 25; l.connect(lg); lg.connect(os.frequency); const gn = out(sfxBus, 0); env(gn.gain, t, 0.05, 0.03, 0.8); const lp = ac.createBiquadFilter(); lp.frequency.value = 1500; os.connect(lp); lp.connect(gn); os.start(t); l.start(t); os.stop(t + 0.9); l.stop(t + 0.9); }); },
    hoot() { sfxQ(t => { I.sine(520, t, { dur: 0.22, vol: 0.09, to: 460, dest: sfxBus, a: 0.03, rev: 0.3 }); I.sine(500, t + 0.28, { dur: 0.35, vol: 0.09, to: 430, dest: sfxBus, a: 0.04, rev: 0.3 }); }); },
    splash() { sfxQ(t => I.noise(t, { type: 'highpass', f: 1500, to: 600, dur: 0.5, vol: 0.18, a: 0.01 })); },
    discord() { sfxQ(t => { [60, 61, 66, 67].forEach(n => I.pluck(midi(n), t, { vol: 0.08, dur: 0.8, dest: sfxBus, wave: 'sawtooth' })); }); },
    whoosh() { sfxQ(t => I.noise(t, { type: 'lowpass', f: 300, to: 2000, dur: 0.7, vol: 0.15, a: 0.3 })); },
    paper() { sfxQ(t => I.noise(t, { type: 'highpass', f: 4000, dur: 0.15, vol: 0.06, a: 0.02 })); },
    sad() { sfxQ(t => { I.pad(midi(45), t, { dur: 3, vol: 0.06, dest: sfxBus }); I.pad(midi(48), t, { dur: 3, vol: 0.05, dest: sfxBus }); }); },
    wonder() { sfxQ(t => [60, 64, 67, 71, 74, 79].forEach((n, i) => I.bell(midi(n), t + i * 0.12, { vol: 0.06, dur: 3, dest: sfxBus, rev: 0.8 }))); },
    grunt() { sfxQ(t => I.sine(140, t, { wave: 'sawtooth', dur: 0.18, vol: 0.06, to: 100, dest: sfxBus })); },
    hum(d = 2) { sfxQ(t => I.pad(midi(48), t, { dur: d, vol: 0.06, dest: sfxBus, lp: 600 })); },
  };

  return {
    unlock, setScene, tick, setMuffle, setMusicVol, setMusic, layer, play, midi, SC, I: () => I,
    sfx: S, ev: EV, toggleMute, isMuted: () => muted, ready: () => !!ac, now, scene: () => sceneName,
    track: () => track && { name: track.name, ok: track.ok, paused: track.el.paused, time: track.el.currentTime, gain: track.gain.gain.value },
  };
})();
const SFX = AudioSys.sfx;
