'use strict';
// ============================================================
// PhilWorld — spoken dialog (pre-generated with Sarvam AI, see tools/)
// ============================================================
const Voice = (() => {
  let manifest = null, cur = null, enabled = true;
  try { enabled = localStorage.getItem('philworld-voices') !== '0'; } catch (e) { }
  fetch('audio/voice/manifest.json').then(r => r.ok ? r.json() : null).then(m => { manifest = m; }).catch(() => { });

  function normVoiceKey(s) {
    let t = s;
    const name = G.state && G.state.name;
    if (name && name.trim()) t = t.split(name).join('{name}');
    return t.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  }
  function stop() {
    if (!cur) return;
    try { cur.pause(); } catch (e) { }
    cur = null;
    AudioSys.setMusicVol(0.55, 0.6);
  }
  // Starts the clip for this line. Returns { onDuration(cb) } or null if there is no clip.
  function play(text) {
    stop();
    if (!manifest || !enabled || AudioSys.isMuted()) return null;
    const id = manifest[normVoiceKey(text)];
    if (!id) return null;
    const a = new Audio('audio/voice/' + id + '.mp3');
    a.volume = 1;
    cur = a;
    AudioSys.setMusicVol(0.22, 0.3);
    const h = { audio: a, cb: null, onDuration(cb) { this.cb = cb; if (isFinite(a.duration) && a.duration) cb(a.duration); } };
    a.addEventListener('loadedmetadata', () => { if (h.cb && isFinite(a.duration)) h.cb(a.duration); });
    a.addEventListener('ended', () => { if (cur === a) { cur = null; AudioSys.setMusicVol(0.55, 0.8); } });
    a.play().catch(() => { if (cur === a) cur = null; });
    return h;
  }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('philworld-voices', enabled ? '1' : '0'); } catch (e) { }
    if (!enabled) stop();
    return enabled;
  }
  return { play, stop, toggle, isEnabled: () => enabled, ready: () => !!manifest, has: t => !!(manifest && manifest[normVoiceKey(t)]) };
})();
