'use strict';
// ============================================================
// PhilWorld — people, insights, roadmap
// ============================================================
const LOOKS = {
  socrates: { skin: '#e8b48f', hairStyle: 'bald', hairC: '#e8e4da', beard: '#e8e4da', beardLen: 3, robe: '#a89f91', robe2: '#6d6458', long: true, legs: '#c98e62' },
  youngPlato: { skin: '#eab994', hairStyle: 'curly', hairC: '#3b2716', robe: '#3a6ea5', robe2: '#e0c060', legs: '#c98e62' },
  plato: { skin: '#eab994', hairStyle: 'short', hairC: '#d8d0c0', beard: '#d8d0c0', beardLen: 4, robe: '#3a6ea5', robe2: '#e0c060', long: true },
  sophist: { skin: '#eab994', hairStyle: 'curly', hairC: '#1d1d2b', robe: '#c0392b', robe2: '#f1c40f', legs: '#c98e62', sash: '#f1c40f' },
  aristotle: { skin: '#e0a77e', hairStyle: 'curly', hairC: '#4a3020', beard: '#4a3020', beardLen: 2, robe: '#7a2e8c', robe2: '#e0c060', long: true },
  alexander: { skin: '#eab994', hairStyle: 'curly', hairC: '#d8b26e', robe: '#c0392b', robe2: '#c0a040', hat: 'helmet', legs: '#8b5a2b' },
  epictetus: { skin: '#c98e62', hairStyle: 'short', hairC: '#6b6b6b', beard: '#6b6b6b', beardLen: 3, robe: '#8a7a5a', robe2: '#5a4a3a', long: true, staff: true },
  marcus: { skin: '#eab994', hairStyle: 'curly', hairC: '#8a6a3a', beard: '#8a6a3a', beardLen: 2, robe: '#8b1e2b', robe2: '#e0c060', hat: 'laurel', long: true },
  zeno: { skin: '#c98e62', hairStyle: 'short', hairC: '#3a2a1a', beard: '#3a2a1a', beardLen: 1, robe: '#5d8aa8', robe2: '#3a5a70', long: true },
  nietzsche: { skin: '#f0caa8', hairStyle: 'short', hairC: '#5a3a22', mustache: '#5a3a22', robe: '#2c2c34', robe2: '#4a4a54', collar: '#e8e4da', legs: '#1a1a20' },
  demon: { skin: '#3a2a5a', hairStyle: 'spiky', hairC: '#1a1030', robe: '#2a1a40', robe2: '#5a3a8a', long: true, eyes: '#e74c3c' },
  confucius: { skin: '#e8c095', hairStyle: 'bald', hairC: '#e8e4da', beard: '#e8e4da', beardLen: 4, robe: '#2e4a3e', robe2: '#c9a24a', hat: 'scholar', long: true },
  ruler: { skin: '#e8c095', hairStyle: 'short', hairC: '#1d1d2b', robe: '#c9a24a', robe2: '#8b1e2b', hat: 'crown', long: true },
  minister: { skin: '#e8c095', hairStyle: 'short', hairC: '#1d1d2b', robe: '#2e4a7e', robe2: '#c9a24a', hat: 'scholar', long: true },
  parent: { skin: '#e8c095', hairStyle: 'bun', hairC: '#2b1d14', robe: '#8e44ad', robe2: '#e0c060', long: true },
  child: { skin: '#f0d0a8', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#e67e22', robe2: '#935116' },
  elder: { skin: '#e8c095', hairStyle: 'ponytail', hairC: '#1d1d2b', robe: '#16a085', robe2: '#0e6655' },
  younger: { skin: '#f0d0a8', hairStyle: 'short', hairC: '#1d1d2b', robe: '#48c9b0', robe2: '#0e6655' },
  husband: { skin: '#e0b088', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#2980b9', robe2: '#1b4f72', long: true },
  wife: { skin: '#f0d0a8', hairStyle: 'bun', hairC: '#1d1d2b', robe: '#c0392b', robe2: '#f1c40f', long: true },
  friendA: { skin: '#e0b088', hairStyle: 'short', hairC: '#3a2a1a', robe: '#27ae60', robe2: '#145a32' },
  friendB: { skin: '#f0d0a8', hairStyle: 'ponytail', hairC: '#1d1d2b', robe: '#f39c12', robe2: '#9a5a10' },
  laozi: { skin: '#e8c095', hairStyle: 'long', hairC: '#f0f0f0', beard: '#f0f0f0', beardLen: 6, robe: '#d8d0b8', robe2: '#7a6a4a', long: true },
  zhuangzi: { skin: '#e8c095', hairStyle: 'topknot', hairC: '#2b1d14', beard: '#2b1d14', beardLen: 1, robe: '#6a8a5a', robe2: '#3a5a2a', long: true },
  cookding: { skin: '#d8a070', hairStyle: 'topknot', hairC: '#1d1d2b', robe: '#8a7050', robe2: '#ecf0f1', sash: '#ecf0f1' },
  buddha: { skin: '#d9a066', hairStyle: 'curly', hairC: '#2a1a40', robe: '#e07b1a', robe2: '#b05a10', long: true, ushnisha: true, sash: '#c0601a' },
  monk: { skin: '#c98e62', hairStyle: 'bald', robe: '#8b1e2b', robe2: '#f1c40f', long: true, sash: '#f1c40f' },
  kisa: { skin: '#b07a50', hairStyle: 'long', hairC: '#1d1d2b', robe: '#2e86c1', robe2: '#f1c40f', long: true },
  nagasena: { skin: '#c98e62', hairStyle: 'bald', robe: '#d35400', robe2: '#a04000', long: true },
  sartre: { skin: '#f0caa8', hairStyle: 'short', hairC: '#3a2a1a', glasses: true, pipe: true, robe: '#3a3a44', robe2: '#22222a', collar: '#e8e4da', legs: '#22222a' },
  beauvoir: { skin: '#f0caa8', hairStyle: 'bun', hairC: '#3b2716', hat: 'turban', hatC: '#b03a48', robe: '#7a2a3a', robe2: '#4a1a24', legs: '#2a1a1a' },
  camus: { skin: '#e0b090', hairStyle: 'short', hairC: '#2a1a10', robe: '#b8a27a', robe2: '#8a7450', collar: '#8a7450', legs: '#3a3a44' },
  waiter: { skin: '#f0caa8', hairStyle: 'short', hairC: '#1d1d2b', robe: '#1c1c22', robe2: '#ecf0f1', collar: '#ecf0f1', legs: '#1c1c22', mustache: '#1d1d2b' },
  prisoner: { skin: '#b89a7a', hairStyle: 'long', hairC: '#3a2a1a', robe: '#6a5a4a', robe2: '#4a3a2a', beard: '#3a2a1a', beardLen: 2 },
  puppeteer: { skin: '#8a6a4a', hairStyle: 'bald', robe: '#3a2a20', robe2: '#2a1a10', hat: 'hood' },
  sisyphus: { skin: '#c98e62', hairStyle: 'curly', hairC: '#2b1d14', beard: '#2b1d14', beardLen: 2, robe: '#a89f91', robe2: '#6d6458', legs: '#c98e62' },
};

const SPEAKERS = {
  owl: { name: 'Glaux the Owl', look: 'owl', voice: 880 },
  socrates: { name: 'Socrates', look: LOOKS.socrates, voice: 260 },
  youngPlato: { name: 'Young Plato', look: LOOKS.youngPlato, voice: 420 },
  plato: { name: 'Plato', look: LOOKS.plato, voice: 300 },
  sophist: { name: 'Gorgias the Sophist', look: LOOKS.sophist, voice: 460 },
  aristotle: { name: 'Aristotle', look: LOOKS.aristotle, voice: 240 },
  alexander: { name: 'Young Alexander', look: LOOKS.alexander, voice: 480 },
  epictetus: { name: 'Epictetus', look: LOOKS.epictetus, voice: 220 },
  marcus: { name: 'Marcus Aurelius', look: LOOKS.marcus, voice: 250 },
  zeno: { name: 'Zeno of Citium', look: LOOKS.zeno, voice: 280 },
  nietzsche: { name: 'Friedrich Nietzsche', look: LOOKS.nietzsche, voice: 230 },
  demon: { name: 'A Demon', look: LOOKS.demon, voice: 110 },
  confucius: { name: 'Confucius (Kongzi)', look: LOOKS.confucius, voice: 250 },
  laozi: { name: 'Laozi', look: LOOKS.laozi, voice: 210 },
  zhuangzi: { name: 'Zhuangzi', look: LOOKS.zhuangzi, voice: 330 },
  cookding: { name: 'Cook Ding', look: LOOKS.cookding, voice: 300 },
  buddha: { name: 'Siddhartha, the Buddha', look: LOOKS.buddha, voice: 230 },
  monk: { name: 'A Monk', look: LOOKS.monk, voice: 290 },
  kisa: { name: 'Kisa Gotami', look: LOOKS.kisa, voice: 420 },
  nagasena: { name: 'Nagasena', look: LOOKS.nagasena, voice: 280 },
  sartre: { name: 'Jean-Paul Sartre', look: LOOKS.sartre, voice: 300 },
  beauvoir: { name: 'Simone de Beauvoir', look: LOOKS.beauvoir, voice: 400 },
  camus: { name: 'Albert Camus', look: LOOKS.camus, voice: 270 },
  waiter: { name: 'The Waiter', look: LOOKS.waiter, voice: 520 },
  prisoner: { name: 'Prisoner', look: LOOKS.prisoner, voice: 200 },
  puppeteer: { name: 'Puppeteer', look: LOOKS.puppeteer, voice: 170 },
  sisyphus: { name: 'Sisyphus', look: LOOKS.sisyphus, voice: 180 },
};

// ---------------- insights (one per room)
const INSIGHT_ORDER = ['wonder', 'socratic', 'forms', 'mean', 'control', 'amorfati', 'harmony', 'wuwei', 'middleway', 'freedom'];
const INSIGHTS = {
  wonder: {
    title: 'Philosophy Begins in Wonder', place: 'The Crossroads', who: 'Plato & Aristotle',
    quote: '"Philosophy" = philo (love) + sophia (wisdom).',
    points: [
      'Philosophy is the *love of wisdom*: asking the questions most people skip.',
      'Its big branches: *metaphysics* (what is real?), *epistemology* (how do we know?), *ethics* (how should we live?), *logic* (what is good reasoning?), *aesthetics* (what is beauty?).',
      'Plato and Aristotle both said it starts with *wonder*: being puzzled by the ordinary.',
    ],
    icon(g, t) { drawOwl(g, 40, 34, t, {}); for (let i = 0; i < 3; i++) qmark(g, 14 + i * 25, 12 + (i % 2) * 6, ['#f1c40f', '#5dade2', '#e74c3c'][i]); },
  },
  socratic: {
    title: 'Know That You Don\'t Know', place: 'The Agora, Athens', who: 'Socrates (c. 470–399 BCE)',
    quote: '"The unexamined life is not worth living."',
    points: [
      'The *Socratic method*: ask "What is X?", then test every answer with *counterexamples*.',
      'Each failed definition is a gain: you lose a false belief.',
      'True wisdom starts with admitting *how little you know*. Socrates wrote nothing; we know him through Plato.',
    ],
    icon(g, t) { disc(g, 40, 20, 15, '#aed6f1'); disc(g, 36, 15, 4, '#eaf2f8'); line(g, 30, 8, 38, 20, '#1b4f72'); line(g, 38, 20, 34, 30, '#1b4f72'); line(g, 38, 20, 50, 24, '#1b4f72'); drawPerson(g, 40, 40, LOOKS.socrates, 0, 0, { noShadow: true }); },
  },
  forms: {
    title: 'The Cave & The Forms', place: "Plato's Cave", who: 'Plato (c. 428–348 BCE)',
    quote: 'What we see may be only shadows of what is real.',
    points: [
      'In the *Allegory of the Cave*, prisoners mistake shadows for reality. Leaving is painful, but freeing.',
      'The *Forms*: behind every wobbly circle is the perfect Circle; behind every horse, Horseness. Known by the *mind*, not the eyes.',
      'The Sun = the *Form of the Good*. Education is turning the whole soul toward the light.',
    ],
    icon(g, t) { R(g, '#2a1a10', 0, 0, 80, 40); R(g, '#3a2a1a', 0, 26, 80, 14); disc(g, 66, 9, 6, '#f9e79f'); R(g, '#111', 10, 10, 12, 8); R(g, '#111', 22, 14, 3, 3); drawFlame(g, 40, 34, t, 1); },
  },
  mean: {
    title: 'The Golden Mean', place: "Aristotle's Lyceum", who: 'Aristotle (384–322 BCE)',
    quote: '"We are what we repeatedly do."  (a summary of his view)',
    points: [
      'A virtue sits *between two vices*: courage lies between cowardice and recklessness.',
      'The mean is *relative to the situation*, not a mathematical middle. Finding it takes practical wisdom (*phronesis*).',
      'Virtue is a *habit*: you become brave by doing brave things. Its goal is *eudaimonia*, flourishing.',
    ],
    icon(g, t) { R(g, '#7f8c8d', 8, 22, 64, 3); R(g, '#c0392b', 8, 20, 6, 7); R(g, '#c0392b', 66, 20, 6, 7); R(g, '#f1c40f', 37, 17, 7, 13); drawSpark(g, 40, 12, t); },
  },
  control: {
    title: 'The Dichotomy of Control', place: 'The Painted Stoa', who: 'Epictetus, Marcus Aurelius, Seneca',
    quote: '"Some things are up to us, and some are not." (Epictetus)',
    points: [
      '*Up to you*: your judgments, choices, effort, and how you respond.',
      '*Not up to you*: weather, other people, reputation, outcomes, the past.',
      'Suffering comes from treating the second list like the first. Do your part well, then accept the rest calmly.',
    ],
    icon(g, t) { disc(g, 40, 20, 18, '#5d6d7e'); disc(g, 40, 20, 10, '#f5b041'); ICONS.storm(g, 18, 8); ICONS.heart(g, 40, 21); },
  },
  amorfati: {
    title: 'Create Values, Love Your Fate', place: "Nietzsche's Mountain", who: 'Friedrich Nietzsche (1844–1900)',
    quote: '"Become who you are."',
    points: [
      '"*God is dead*": the old foundations of meaning have lost their hold, and the danger is *nihilism*.',
      'The answer is to *create values*, as the camel becomes a lion and then a child.',
      '*Eternal recurrence*: could you will this exact life again, forever? *Amor fati*: love your fate.',
    ],
    icon(g, t) { R(g, '#d6eaf8', 0, 30, 80, 10); for (let i = 0; i < 3; i++) { R(g, '#e8e0cc', 16 + i * 20, 10 + i * 4, 6, 20 - i * 4); } line(g, 10, 6, 70, 6, '#f1c40f'); ring(g, 40, 20, 12, '#f1c40f'); },
  },
  harmony: {
    title: 'Ren, Li & Harmony', place: "Confucius's Courtyard", who: 'Confucius (551–479 BCE)',
    quote: '"Do not impose on others what you yourself do not want."',
    points: [
      '*Ren*: humaneness, the warm heart of a good person.',
      '*Li*: ritual and manners, the way respect becomes visible.',
      'Society is a web of *relationships with duties flowing both ways*. Set each in its right place, and the whole sounds in *harmony*.',
    ],
    icon(g, t) { for (let i = 0; i < 5; i++) { R(g, '#8b5a2b', 6 + i * 15, 6, 1, 4); R(g, '#c9a24a', 2 + i * 15, 10, 9, 10 + i * 2); R(g, '#e0c060', 3 + i * 15, 11, 2, 6); } R(g, '#5a3a20', 0, 4, 80, 2); },
  },
  wuwei: {
    title: 'Wu Wei: Flow Like Water', place: "Laozi's Valley", who: 'Laozi & Zhuangzi (c. 6th–4th c. BCE)',
    quote: '"The Tao that can be told is not the eternal Tao."',
    points: [
      '*Wu wei* is not doing nothing. It is *effortless action*: working with the grain of things instead of forcing them.',
      'Water is soft, yet it carves stone. *Yin and yang*: opposites need and become each other.',
      'Emptiness is useful: the hollow of the cup and the hub of the wheel.',
    ],
    icon(g, t) { disc(g, 40, 20, 16, '#f5f5f5'); for (let dy = -16; dy <= 16; dy++) { const w = Math.floor(Math.sqrt(256 - dy * dy)); R(g, '#1a1a1a', 40, 20 + dy, w + 1, 1); } disc(g, 40, 12, 8, '#1a1a1a'); disc(g, 40, 28, 8, '#f5f5f5'); disc(g, 40, 12, 2, '#f5f5f5'); disc(g, 40, 28, 2, '#1a1a1a'); },
  },
  middleway: {
    title: 'Let Go: The Middle Way', place: 'The Bodhi Tree', who: 'Siddhartha Gautama, the Buddha (c. 5th c. BCE)',
    quote: 'All conditioned things are impermanent.',
    points: [
      '*Four Noble Truths*: (1) life involves suffering (*dukkha*), (2) caused by *craving*, (3) it can end (*nirvana*), (4) via the *Eightfold Path*.',
      'The *Middle Way*: not too loose and not too tight, like a well-tuned string.',
      '*Impermanence* (anicca) and *not-self* (anatta): everything changes, even "you".',
    ],
    icon(g, t) { ring(g, 40, 20, 14, '#f1c40f', 2); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(g, 40, 20, 40 + Math.cos(a) * 14, 20 + Math.sin(a) * 14, '#f1c40f'); } disc(g, 40, 20, 3, '#f1c40f'); },
  },
  freedom: {
    title: 'Condemned to Be Free', place: 'The Existentialist Café', who: 'Sartre, Beauvoir & Camus (20th c.)',
    quote: '"One must imagine Sisyphus happy." (Camus)',
    points: [
      '*Existence precedes essence*: you aren\'t born with a purpose. You *make yourself* through your choices.',
      'Freedom means *responsibility*. Pretending you have no choice is *bad faith*.',
      'The *absurd*: we crave meaning and the universe stays silent. Camus\'s answer is *revolt*: live fully anyway.',
    ],
    icon(g, t) { for (let i = 0; i < 40; i++) R(g, '#6d4c41', 10 + i, 34 - i * 0.6, 1, 6); disc(g, 44, 10, 6, '#7f8c8d'); drawPerson(g, 36, 22, LOOKS.sisyphus, 3, Math.floor(t * 4) % 4, { noShadow: true }); },
  },
};
function qmark(g, x, y, c) {
  R(g, c, x, y, 6, 2); R(g, c, x + 5, y + 2, 2, 3); R(g, c, x + 3, y + 5, 3, 2); R(g, c, x + 2, y + 7, 2, 2); R(g, c, x + 2, y + 11, 2, 2);
}

// ---------------- roadmap (star map)
const MAP_NODES = [
  { id: 'crossroads', name: 'The Crossroads', x: 240, y: 226, region: 'hub', era: 'Here & now', desc: 'Where every journey begins. Big questions start here.' },
  { id: 'agora', name: 'The Agora', x: 168, y: 192, region: 'west', era: 'Athens, 399 BCE', desc: 'Socrates questions everything, including you.' },
  { id: 'cave', name: "Plato's Cave", x: 92, y: 158, region: 'west', era: 'c. 375 BCE', desc: 'Shadows, a fire, and the climb toward the Sun.' },
  { id: 'lyceum', name: "Aristotle's Lyceum", x: 176, y: 140, region: 'west', era: '335 BCE', desc: 'Virtue as a balance. Everything has a purpose.' },
  { id: 'stoa', name: 'The Painted Stoa', x: 120, y: 100, region: 'west', era: '300 BCE – 180 CE', desc: 'Control what you can. Accept what you can\'t.' },
  { id: 'mountain', name: "Nietzsche's Mountain", x: 176, y: 66, region: 'west', era: 'Swiss Alps, 1880s', desc: 'The old pillars fall. Create your own values.' },
  { id: 'courtyard', name: "Confucius's Courtyard", x: 316, y: 192, region: 'east', era: 'Lu, China, c. 500 BCE', desc: 'Harmony through relationships and ritual.' },
  { id: 'valley', name: "Laozi's Valley", x: 392, y: 150, region: 'east', era: 'China, c. 400 BCE', desc: 'Flow like water. Wu wei, effortless action.' },
  { id: 'bodhi', name: 'The Bodhi Tree', x: 340, y: 96, region: 'east', era: 'India, c. 5th c. BCE', desc: 'Suffering, letting go, and the Middle Way.' },
  { id: 'cafe', name: 'The Existentialist Café', x: 258, y: 42, region: 'finale', era: 'Paris, 1940s', desc: 'Where all roads meet. You are free. Now what?' },
  // teasers: coming later
  { id: 'epicurus', name: "Epicurus's Garden", x: 40, y: 120, region: 'teaser', era: '306 BCE', desc: 'Coming soon: pleasure, friendship, and not fearing death.' },
  { id: 'descartes', name: "Descartes's Stove Room", x: 62, y: 74, region: 'teaser', era: '1619', desc: 'Coming soon: "I think, therefore I am."' },
  { id: 'kant', name: "Kant's Clockwork Study", x: 110, y: 46, region: 'teaser', era: '1780s', desc: 'Coming soon: duty, reason, and the categorical imperative.' },
  { id: 'kierkegaard', name: "Kierkegaard's Leap", x: 344, y: 46, region: 'teaser', era: '1840s', desc: 'Coming soon: anxiety is the dizziness of freedom.' },
  { id: 'zen', name: 'The Zen Garden', x: 428, y: 74, region: 'teaser', era: 'Japan, 13th c.', desc: 'Coming soon: where Buddhism meets Taoism.' },
  { id: 'nagarjuna', name: "Nagarjuna's Emptiness", x: 424, y: 118, region: 'teaser', era: 'India, 2nd c.', desc: 'Coming soon: emptiness (sunyata) and the two truths.' },
  { id: 'ubuntu', name: 'Ubuntu Village', x: 440, y: 210, region: 'teaser', era: 'Southern Africa', desc: 'Coming soon: "I am because we are."' },
  { id: 'beauvoirteaser', name: 'Spinoza\'s Lens Shop', x: 52, y: 200, region: 'teaser', era: '1670s', desc: 'Coming soon: God, Nature, and freedom through understanding.' },
];
const MAP_EDGES = [
  ['crossroads', 'agora', 'west road', 'path'], ['crossroads', 'courtyard', 'east road', 'path'],
  ['agora', 'cave', 'Socrates → his student Plato', 'path'], ['agora', 'lyceum', "Plato's student, Aristotle", 'path'],
  ['cave', 'lyceum', 'disagree: Forms vs. things', 'clash'],
  ['cave', 'stoa', 'path', 'path'], ['lyceum', 'stoa', 'path', 'path'],
  ['stoa', 'mountain', '2,000 years later…', 'path'], ['mountain', 'cafe', 'inspires', 'path'],
  ['courtyard', 'valley', 'rival schools', 'path'], ['valley', 'bodhi', 'path', 'path'], ['bodhi', 'cafe', 'path', 'path'],
  ['stoa', 'bodhi', 'echo: accept what you cannot change', 'echo'], ['valley', 'stoa', 'echo: live in accord with nature', 'echo'],
  ['mountain', 'bodhi', 'Nietzsche read Buddhism (and argued with it)', 'echo'],
  ['epicurus', 'stoa', 'rival school', 'teaser'], ['descartes', 'stoa', '', 'teaser'], ['kant', 'descartes', '', 'teaser'], ['kant', 'mountain', '', 'teaser'],
  ['kierkegaard', 'cafe', 'father of existentialism', 'teaser'], ['zen', 'bodhi', '', 'teaser'], ['zen', 'valley', 'Buddhism meets Taoism', 'teaser'],
  ['nagarjuna', 'bodhi', '', 'teaser'], ['ubuntu', 'courtyard', 'community-centered ethics', 'teaser'], ['beauvoirteaser', 'stoa', '', 'teaser'],
];
const ROOM_INSIGHT = { crossroads: 'wonder', agora: 'socratic', cave: 'forms', lyceum: 'mean', stoa: 'control', mountain: 'amorfati', courtyard: 'harmony', valley: 'wuwei', bodhi: 'middleway', cafe: 'freedom' };
