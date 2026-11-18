// PhilWorld service worker: lets the game install to a home screen and keep playing offline.
// Code/data: network first (so updates arrive), cache as the fallback.
// Audio (music + voice clips): cache first, filled as you play. Fonts: stale-while-revalidate.
const VERSION = 'philworld-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'js/core.js', 'js/audio.js', 'js/gfx.js', 'js/data.js', 'js/ui.js', 'js/voice.js', 'js/scenes.js', 'js/stages.js', 'js/cutscene.js', 'js/world.js',
  'js/rooms/crossroads.js', 'js/rooms/agora.js', 'js/rooms/cave.js', 'js/rooms/lyceum.js', 'js/rooms/stoa.js', 'js/rooms/mountain.js',
  'js/rooms/courtyard.js', 'js/rooms/valley.js', 'js/rooms/bodhi.js', 'js/rooms/cafe.js', 'js/main.js', 'js/mobile.js', 'audio/voice/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const r = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))]);
    if (r && r.ok) c.put(req, r.clone());
    return r;
  } catch (err) {
    return (await c.match(req, { ignoreSearch: true })) || Response.error();
  }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}
// Safari/Chrome ask audio for byte ranges; answer from the cached full file with a 206.
async function rangeFrom(res, range) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206, statusText: 'Partial Content', headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg', 'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`, 'Accept-Ranges': 'bytes',
    },
  });
}
async function audio(e) {
  const req = e.request, c = await caches.open(VERSION);
  const key = new Request(req.url);
  const hit = await c.match(key);
  const range = req.headers.get('range');
  if (hit) return range ? rangeFrom(hit, range) : hit;
  // not cached yet: play from the network now, and store the whole file in the background for next time
  e.waitUntil(fetch(key).then(r => (r.ok && r.status === 200) ? c.put(key, r) : null).catch(() => { }));
  return fetch(req);
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(staleWhileRevalidate(req)); return; }
  if (url.origin !== location.origin) return;
  if (/\.mp3$/.test(url.pathname)) { e.respondWith(audio(e)); return; }
  e.respondWith(networkFirst(req));
});
