'use strict';
// ============================================================
// PhilWorld — spoken dialog (pre-generated clips, see tools/)
//
// One shared <audio> element plays every line. iPhones only let an element play
// if it was started inside a tap, and lines start later (from game code), so
// AudioSys.unlock() calls Voice.unlock() inside the first tap to "bless" the
// element; after that we just swap its src. The element is routed through Web
// Audio because iOS ignores element.volume.
// ============================================================
const Voice = (() => {
  let manifest = null, enabled = true, el = null, srcNode = null, gainNode = null, unlocked = false, active = false, token = 0;
  // 0.1s of silence as a WAV. (A zero-length WAV is rejected by Chrome with NotSupportedError, so the unlock never stuck.)
  const silentWav = () => {
    const n = 800, b = new Uint8Array(44 + n * 2), v = new DataView(b.buffer);
    const tag = (o, t) => { for (let i = 0; i < 4; i++) b[o + i] = t.charCodeAt(i); };
    tag(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); tag(8, 'WAVE'); tag(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); tag(36, 'data'); v.setUint32(40, n * 2, true);
    let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return 'data:audio/wav;base64,' + btoa(s);
  };
  try { enabled = localStorage.getItem('philworld-voices') !== '0'; } catch (e) { }
  fetch('audio/voice/manifest.json').then(r => r.ok ? r.json() : null).then(m => { manifest = m; }).catch(() => { });

  function normVoiceKey(s) {
    let t = s;
    const name = G.state && G.state.name;
    if (name && name.trim()) t = t.split(name).join('{name}');
    return t.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  }
  function element() {
    if (!el) { el = new Audio(); el.preload = 'auto'; el.setAttribute('playsinline', ''); }
    return el;
  }
  function wire() {
    const ac = AudioSys.ctx && AudioSys.ctx();
    if (!ac || srcNode) return;
    try { srcNode = ac.createMediaElementSource(element()); gainNode = ac.createGain(); srcNode.connect(gainNode); gainNode.connect(ac.destination); }
    catch (e) { srcNode = null; gainNode = null; }
  }
  function setVolume(v) {
    v = Math.min(1, v);
    if (gainNode) gainNode.gain.value = v; else if (el) el.volume = v;
  }
  // called from inside a tap / key press (AudioSys.unlock)
  function unlock() {
    element(); wire();
    if (unlocked || active) return; // never swap the src out from under a line that is playing
    unlocked = true;
    el.src = silentWav();
    const p = el.play();
    // an AbortError just means a real line took over the element, which also counts as unlocked; only a blocked play() means try again
    if (p && p.then) p.then(() => { if (!active) el.pause(); }).catch(e => { if (e && e.name === 'NotAllowedError') unlocked = false; });
  }
  function stop() {
    token++;
    if (el) { try { el.pause(); } catch (e) { } }
    if (active) { active = false; AudioSys.duck(false); }
  }
  // Starts the clip for this line. Returns { onDuration(cb) } or null if there is no clip.
  function play(text) {
    stop();
    if (!manifest || !enabled || AudioSys.isMuted()) return null;
    const id = manifest[normVoiceKey(text)];
    if (!id) return null;
    const a = element(); wire();
    setVolume(AudioSys.voiceLevel());
    const me = token;
    active = true;
    AudioSys.duck(true);
    const h = { cb: null, onDuration(cb) { this.cb = cb; if (a.readyState >= 1 && isFinite(a.duration) && a.duration) cb(a.duration); } };
    a.onloadedmetadata = () => { if (me === token && h.cb && isFinite(a.duration)) h.cb(a.duration); };
    a.onended = () => { if (me === token && active) { active = false; AudioSys.duck(false); } };
    a.src = 'audio/voice/' + id + '.mp3';
    const p = a.play();
    if (p && p.catch) p.catch(() => { if (me === token && active) { active = false; AudioSys.duck(false); } });
    return h;
  }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('philworld-voices', enabled ? '1' : '0'); } catch (e) { }
    if (!enabled) stop();
    return enabled;
  }
  return { play, stop, unlock, setVolume, toggle, isEnabled: () => enabled, ready: () => !!manifest, has: t => !!(manifest && manifest[normVoiceKey(t)]) };
})();
