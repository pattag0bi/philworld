// Extracts every spoken line (speaker + text) from the game scripts into tools/lines.json.
// Run: cd tools && npm run extract
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FILES = ['js/rooms', 'js/world.js', 'js/main.js'].flatMap(p => {
  const full = path.join(ROOT, p);
  return fs.statSync(full).isDirectory() ? fs.readdirSync(full).filter(f => f.endsWith('.js')).map(f => path.join(full, f)) : [full];
});

const NAME = '{name}';
// Evaluate a text expression into a string; dynamic parts become {} (or {name} for the player's name).
function evalText(n) {
  if (!n) return null;
  if (n.type === 'Literal' && typeof n.value === 'string') return n.value;
  if (n.type === 'TemplateLiteral') {
    let s = '';
    n.quasis.forEach((q, i) => {
      s += q.value.cooked;
      if (i < n.expressions.length) {
        const e = n.expressions[i];
        const src = e.type === 'MemberExpression' ? srcOf(e) : '';
        s += /G\.state\.name/.test(src) ? NAME : '{}';
      }
    });
    return s;
  }
  if (n.type === 'BinaryExpression' && n.operator === '+') {
    const a = evalText(n.left), b = evalText(n.right);
    return (a ?? '{}') + (b ?? '{}');
  }
  return null;
}
// Like evalText, but follows ?:, ||, [..][i] and pick([...]) to every possible string.
function evalTexts(n) {
  if (!n) return [];
  const one = evalText(n); if (one != null) return [one];
  if (n.type === 'ConditionalExpression') return [...evalTexts(n.consequent), ...evalTexts(n.alternate)];
  if (n.type === 'LogicalExpression') return [...evalTexts(n.left), ...evalTexts(n.right)];
  if (n.type === 'ArrayExpression') return n.elements.flatMap(evalTexts);
  if (n.type === 'MemberExpression' && n.object.type === 'ArrayExpression') return evalTexts(n.object);
  if (n.type === 'CallExpression' && n.callee.name === 'pick') return evalTexts(n.arguments[0]);
  return [];
}
let CUR_SRC = '';
const srcOf = n => CUR_SRC.slice(n.start, n.end);
function evalSpeaker(n) {
  if (!n) return 'narrator';
  if (n.type === 'Literal') return n.value === null ? 'narrator' : String(n.value);
  if (n.type === 'ObjectExpression') {
    const p = n.properties.find(p => p.key && (p.key.name === 'name' || p.key.value === 'name'));
    if (p) { const v = evalText(p.value); if (v) return 'name:' + v; }
    return '?obj:' + srcOf(n).slice(0, 60);
  }
  return '?' + srcOf(n).slice(0, 60);
}

const lines = [], unresolved = [];
const add = (speaker, text, file, kind) => {
  if (!text || !text.replace(/[{}]/g, '').trim()) return;
  lines.push({ speaker, text, file: path.relative(ROOT, file), kind });
};

for (const file of FILES) {
  CUR_SRC = fs.readFileSync(file, 'utf8');
  const ast = acorn.parse(CUR_SRC, { ecmaVersion: 'latest', sourceType: 'script' });
  walk.full(ast, node => {
    if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier') return;
    const fn = node.callee.name, a = node.arguments;
    if (!['say', 'narrate', 'ask', 'sayAll', 'notice'].includes(fn)) return;
    if (fn === 'notice') return; // short UI notices are not voiced
    const sp = fn === 'narrate' ? 'narrator' : evalSpeaker(a[0]);
    const tnode = fn === 'narrate' ? a[0] : a[1];
    if (fn === 'sayAll' && tnode && tnode.type === 'ArrayExpression') { tnode.elements.forEach(e => add(sp, evalText(e), file, 'say')); return; }
    const ts = evalTexts(tnode);
    if (!ts.length) unresolved.push({ file: path.relative(ROOT, file), fn, speaker: sp, expr: srcOf(tnode || node).slice(0, 90) });
    else ts.forEach(t => add(sp, t, file, fn));
  });
}

// Lines that reach say() through data structures (resolved by hand: speaker + where they live).
function literalStrings(n, out = []) {
  if (!n) return out;
  if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
  else if (n.type === 'TemplateLiteral') out.push(evalText(n));
  else for (const k of Object.keys(n)) { const v = n[k]; if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && literalStrings(x, out)); else if (typeof v.type === 'string') literalStrings(v, out); } }
  return out;
}
function findDecl(file, name) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  CUR_SRC = src;
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  let found = null;
  walk.full(ast, n => { if (n.type === 'VariableDeclarator' && n.id.name === name) found = n.init; });
  return found;
}
const MANUAL = [
  // [file, variable, speaker, filter]
  ['js/rooms/courtyard.js', 'PAIRS', 'confucius', s => s.length > 60 || /^How should/.test(s)],
  ['js/rooms/agora.js', 'answers', 'socrates', s => s.length > 40 && !/^(Telling|Helping|Whatever)/.test(s)],
  ['js/rooms/bodhi.js', 'panels', 'buddha', s => s.length > 40],
  ['js/rooms/cafe.js', 'scen', 'sartre', s => s.length > 25 && /\.$/.test(s)],
  ['js/rooms/cave.js', 'lines', 'name:Prisoner', s => s.length > 20],
  ['js/rooms/cave.js', 'L', 'puppeteer', s => s.length > 20],
  ['js/rooms/crossroads.js', 'Q', 'narrator', s => / asks: /.test(s)],
];
for (const [file, v, sp, filt] of MANUAL) {
  const d = findDecl(file, v); if (!d) continue;
  for (const s of literalStrings(d)) if (s && filt(s)) add(sp, s, path.join(ROOT, file), 'data');
}

// four sights: question (prince) / answer (charioteer) pairs
{ const d = findDecl('js/rooms/bodhi.js', 'passers');
  if (d) literalStrings(d).filter(x => x && x.length > 30).forEach((x, i) => add(i % 2 ? 'name:Channa, the charioteer' : 'name:Prince Siddhartha', x, path.join(ROOT, 'js/rooms/bodhi.js'), 'data')); }
{ const d = findDecl('js/rooms/stoa.js', 'people');
  if (d) literalStrings(d).filter(x => x && x.length > 15 && /^[A-Z(]/.test(x)).forEach(x => add('name:A passer-by', x, path.join(ROOT, 'js/rooms/stoa.js'), 'data')); }
// finale guests: object of speaker -> line
{ const d = findDecl('js/rooms/cafe.js', 'lines');
  if (d && d.type === 'ObjectExpression') for (const p of d.properties) add(p.key.name, evalText(p.value), path.join(ROOT, 'js/rooms/cafe.js'), 'data'); }
// owl hints: strings returned from each room's hint()
for (const f of fs.readdirSync(path.join(ROOT, 'js/rooms'))) {
  const src = fs.readFileSync(path.join(ROOT, 'js/rooms', f), 'utf8'); CUR_SRC = src;
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  walk.full(ast, n => {
    if (n.type === 'Property' && n.key && n.key.name === 'hint') walk.full(n.value, r => { if (r.type === 'ReturnStatement') evalTexts(r.argument).forEach(t => add('owl', t, path.join(ROOT, 'js/rooms', f), 'hint')); });
  });
}
// dynamic lines: expand their {} slots into every value they can take
const VARIANTS = [
  ['owl', "You've gathered *{} of 10* insights. Press *M* any time to see your roadmap: which ideas echo each other, and which ones clash.", [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]],
  ['owl', 'And you still have the whole *{}* road to explore! The door at the bottom of the café leads back to the Crossroads.', [['East'], ['West']]],
  ['owl', 'You can still walk the *{}* road from the Crossroads! The door at the bottom leads back.', [['East'], ['West']]],
  ['confucius', '{} of 5 bells ring true. Keep going. And notice: in every pair, duties flow *both ways*.', [[0], [1], [2], [3], [4]]],
  ['narrator', 'The {} stand with their backs to each other. Their note sounds sour.', [['ruler & minister'], ['parent & child'], ['elder & younger sibling'], ['husband & wife'], ['friend & friend']]],
  ['narrator', 'A gleaming marble pillar, carved: *"{}."* It holds up… something. It looks very solid.', [['Eternal Heaven'], ['Absolute Truth'], ['Rules Handed Down']]],
  ['narrator', 'TOCK… The pillar "{}" rings *hollow*.', [['Eternal Heaven'], ['Absolute Truth'], ['Rules Handed Down']]],
  ['epictetus', "You sorted {} of {} at first glance. Notice what's on the *right*: all of it lives *inside you*.", Array.from({ length: 13 }, (_, i) => [i, 12])],
  ['owl', 'Collect the glittering *treasures* around the garden. {} left.', [[1], [2], [3], [4], [5]]],
  ['narrator', 'The figure changes: it becomes *{}*.', ['kind', 'busy', 'mocking', 'an artist', 'a thinker', 'a musician', 'sleepy', 'loyal', 'honest', 'evasive', 'brave', 'cautious', 'a leader'].map(x => [x])],
  ['narrator', 'You pick up {}. Mine! (*{}*)', [['a pile of gold coins', 'wealth'], ['a jeweled crown', 'power'], ['a perfect, sweet mango', 'pleasure'], ['a scroll full of praise for you', 'praise'], ['a flattering mirror', 'self-image']]],
];
for (const [sp, tpl, vals] of VARIANTS) {
  const idx = lines.findIndex(l => l.text === tpl);
  if (idx < 0) { console.warn('variant template not found:', tpl.slice(0, 50)); continue; }
  lines.splice(idx, 1);
  for (const v of vals) { let i = 0; add(sp, tpl.replace(/\{\}/g, () => String(v[i++])), path.join(ROOT, 'js'), 'variant'); }
}
// a few speaker variables
for (const l of lines) { if (l.speaker === '?sp') l.speaker = 'name:Yan Hui, a student'; if (l.speaker.startsWith('?obj:{ name: CY_NAMES')) l.speaker = 'courtyardPeople'; }
// Milo's dinner: the speaker is whichever guest is being served
for (const l of lines) if (l.speaker === '?who') l.speaker = /tummy|Yum|Still a bit/.test(l.text) ? 'name:A little girl' : /books|lecture|think clearly|possibly/.test(l.text) ? 'name:A thin scholar' : 'name:Milo of Croton, champion wrestler';
lines.splice(0, lines.length, ...lines.filter(l => l.speaker !== '?k' && !l.speaker.startsWith('?')));
// de-duplicate
const seen = new Set(); const out = [];
for (const l of lines) { const k = l.speaker + '|' + l.text; if (seen.has(k)) continue; seen.add(k); out.push(l); }
fs.writeFileSync(path.join(ROOT, 'tools/lines.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(ROOT, 'tools/unresolved.json'), JSON.stringify(unresolved, null, 1));
const chars = out.reduce((a, l) => a + l.text.length, 0);
console.log(`${out.length} lines, ${chars} characters, ${unresolved.length} unresolved`);
const bySp = {}; out.forEach(l => bySp[l.speaker] = (bySp[l.speaker] || 0) + 1);
console.log(bySp);
