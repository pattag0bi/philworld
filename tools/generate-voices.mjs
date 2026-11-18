// Generates voice clips for every line in tools/lines.json and writes audio/voice/*.mp3 +
// audio/voice/manifest.json for the game. Speakers default to Sarvam AI (bulbul:v4-flash);
// speakers with provider:"elevenlabs" in voices.json use ElevenLabs (eleven_v4).
//
//   export SARVAM_API_KEY=...        (never commit this)
//   ELEVENLABS_API_KEY comes from ../.env.local (git-ignored), loaded by `npm run voices`
//   cd tools && npm run extract && npm run voices
//
// Re-running only generates clips whose text or voice changed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'audio/voice');
const KEY = process.env.SARVAM_API_KEY;
const EL_KEY = process.env.ELEVENLABS_API_KEY;
const EL_MODEL = 'eleven_v4';
fs.mkdirSync(OUT, { recursive: true });

const lines = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/lines.json'), 'utf8'));
const cast = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/voices.json'), 'utf8'));
const MODEL = cast._model || 'bulbul:v4-flash', LANG = cast._language || 'en-IN';
const LIMIT = process.argv.includes('--sample') ? 12 : Infinity;

// must match normVoiceKey() in js/voice.js
const normKey = s => s.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const ttsText = s => s
  .replace(/\{name\}/g, 'traveler').replace(/\*/g, '').replace(/\n/g, ' ')
  .replace(/…/g, '...').replace(/[✦▶◀✓♪]/g, '').replace(/\s+/g, ' ').trim();

const manifest = {};
const jobs = [];
for (const l of lines) {
  if (/\{\}/.test(l.text)) continue;               // still-dynamic lines stay as text blips
  const c = cast[l.speaker] === undefined ? cast.narrator : cast[l.speaker];
  if (!c) continue;                                  // e.g. the player ("you") is not voiced
  const text = ttsText(l.text);
  if (!/[A-Za-z]/.test(text)) continue;             // pauses like "…" have nothing to say
  const id = crypto.createHash('sha1').update((c.provider === 'elevenlabs' ? 'el|' + (c.stability ?? 0.5) + '|' : '') + c.voice + '|' + (c.pace || 1) + '|' + text).digest('hex').slice(0, 14);
  manifest[normKey(l.text)] = id;
  const file = path.join(OUT, id + '.mp3');
  if (!fs.existsSync(file)) jobs.push({ id, file, text, c, speaker: l.speaker });
}
const todo = jobs.slice(0, LIMIT);
if (todo.some(j => j.c.provider !== 'elevenlabs') && !KEY) { console.error('Set SARVAM_API_KEY first (export SARVAM_API_KEY=...).'); process.exit(1); }
if (todo.some(j => j.c.provider === 'elevenlabs') && !EL_KEY) { console.error('ELEVENLABS_API_KEY missing: run via `npm run voices` (loads ../.env.local).'); process.exit(1); }
console.log(`${Object.keys(manifest).length} voiced lines, ${todo.length} clips to generate (${todo.reduce((a, j) => a + j.text.length, 0)} chars)`);

async function tts(j, attempt = 0) {
  if (j.c.provider === 'elevenlabs') return ttsEleven(j, attempt);
  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: { 'api-subscription-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: j.text, language_code: LANG, model: MODEL, speaker: j.c.voice, pace: j.c.pace || 1, speech_sample_rate: 24000, output_audio_codec: 'mp3' }),
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 5) throw new Error(`HTTP ${res.status} after retries`);
    await new Promise(r => setTimeout(r, 1500 * 2 ** attempt));
    return tts(j, attempt + 1);
  }
  const body = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body.error || body).slice(0, 300)}`);
  const raw = Buffer.from(body.audios.join(''), 'base64');
  const tmp = j.file + '.raw';
  fs.writeFileSync(tmp, raw);
  // shrink: mono, 40 kbps mp3 (falls back to the original if ffmpeg is missing)
  try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '40k', j.file]); fs.unlinkSync(tmp); }
  catch (e) { fs.renameSync(tmp, j.file); }
}

async function ttsEleven(j, attempt = 0) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${j.c.voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: j.text, model_id: EL_MODEL, voice_settings: { stability: j.c.stability ?? 0.5, similarity_boost: 0.8 } }),
  });
  if (res.status === 409 || res.status === 429 || res.status >= 500) {
    if (attempt > 5) throw new Error(`HTTP ${res.status} after retries`);
    await new Promise(r => setTimeout(r, 1500 * 2 ** attempt));
    return ttsEleven(j, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const tmp = j.file + '.raw';
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '48k', j.file]); fs.unlinkSync(tmp); }
  catch (e) { fs.renameSync(tmp, j.file); }
}

let done = 0, failed = 0;
const queue = todo.slice();
async function worker() {
  while (queue.length) {
    const j = queue.shift();
    try { await tts(j); done++; }
    catch (e) { failed++; console.error(`\n✗ ${j.speaker}: "${j.text.slice(0, 50)}…" ${e.message}`); if (/invalid_api_key|401|403|insufficient_quota|quota_exceeded/.test(e.message)) { queue.length = 0; } }
    process.stdout.write(`\r${done}/${todo.length} done${failed ? `, ${failed} failed` : ''}   `);
  }
}
await Promise.all([1, 2, 3, 4].map(worker));
console.log();
// only list clips that exist, so the game never requests a missing file
const final = {};
for (const [k, id] of Object.entries(manifest)) if (fs.existsSync(path.join(OUT, id + '.mp3'))) final[k] = id;
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(final));
const bytes = fs.readdirSync(OUT).filter(f => f.endsWith('.mp3')).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`manifest: ${Object.keys(final).length} clips, ${(bytes / 1e6).toFixed(1)} MB`);
