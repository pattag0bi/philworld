'use strict';
// ============================================================
// PhilWorld — a picture for every line.
// When someone speaks, a story panel illustrates what they're talking about,
// composed from a library of pixel "motifs" picked by keywords in the line.
// Hand-made vignettes (showVignette) and cutscenes take priority.
// ============================================================
try { G.panels = localStorage.getItem('philworld-panels') !== '0'; } catch (e) { G.panels = true; }

const MOTIFS = [];
function M(re, fn) { MOTIFS.push([re, fn]); }
const P_ = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const person = (g, x, y, L, o = {}) => drawPerson(g, x, y, L, o.dir || 0, o.step || 0, Object.assign({ noShadow: true }, o));
const GENERIC = { skin: '#eab994', hairStyle: 'short', hairC: '#3a2a1a', robe: '#a89f91', robe2: '#6d6458' };

// ---- the motif library (each draws in a ~40x44 box, feet/base at y≈38)
M(/\bjustice\b|\bjust\b|\bunfair\b|\bfair\b|\bjudg/i, (g, x, y, t) => { const k = Math.sin(t * 2) * 2; P_(g, '#c9a24a', x - 1, y - 30, 2, 26); P_(g, '#c9a24a', x - 14, y - 28 + k, 28, 2); for (const s of [-1, 1]) { const yy = y - 22 + k * s; P_(g, '#8a7a5a', x + s * 12, y - 28 + k * s, 1, 6); ellipse(g, x + s * 12, yy, 6, 2, '#e0c060'); } P_(g, '#8b5a2b', x - 8, y - 4, 16, 3); });
M(/\bsword|\bmadm|\bmad\b|\bweapon/i, (g, x, y, t) => { person(g, x - 6, y, { skin: '#e8b48f', hairStyle: 'spiky', hairC: '#7a3a1a', robe: '#7a6a5a', eyes: '#e74c3c' }, { armsUp: true }); P_(g, '#bdc3c7', x + 4, y - 30, 2, 16); P_(g, '#8b5a2b', x + 2, y - 15, 6, 2); for (let i = 0; i < 3; i++) P_(g, '#e74c3c', x - 18 + i * 3, y - 28 - (Math.floor(t * 8 + i) % 3), 1, 3); });
M(/\bfriend/i, (g, x, y, t) => { person(g, x - 7, y, LOOKS.friendA, { dir: 3, smile: true }); person(g, x + 7, y, LOOKS.friendB, { dir: 2, smile: true }); ICONS.heart(g, x, y - 30 + Math.sin(t * 3) * 2); });
M(/\benem|\bharm|\bhurt/i, (g, x, y, t) => { person(g, x - 8, y, GENERIC, { dir: 3 }); person(g, x + 8, y, { skin: '#c98e62', hairStyle: 'spiky', hairC: '#111', robe: '#5a5a5a' }, { dir: 2 }); for (let i = 0; i < 3; i++) line(g, x - 3 + i * 3, y - 30, x - 1 + i * 3, y - 26, '#e74c3c'); });
M(/\bruler|\bking\b|\bemperor|\bprince|\bpalace|\bcrown|\bthrone|\blords?\b|\bmajesty/i, (g, x, y, t) => { P_(g, '#8b1e2b', x - 12, y - 10, 24, 10); P_(g, '#c9a24a', x - 12, y - 10, 24, 1); person(g, x, y - 6, LOOKS.ruler, { sit: true }); ICONS.crown(g, x, y - 34 + Math.sin(t * 2)); });
M(/\bsoldier|\bwars?\b|\barmy|\bconquer|\bbattle|\bresistance|\boccup/i, (g, x, y, t) => { for (let i = 0; i < 3; i++) person(g, x - 12 + i * 12, y - (i === 1 ? 2 : 0), { skin: '#e8b48f', hairStyle: 'short', robe: '#c0392b', hat: 'helmet' }, { dir: 3, step: Math.floor(t * 6 + i) % 4 }); P_(g, '#7f8c8d', x + 16, y - 34, 1, 22); });
M(/\bathens|\bagora|\bmarketplace|\bdemocra|\bcitizen|\bparthenon|\bgreek/i, (g, x, y, t) => { P_(g, '#e0d8c4', x - 18, y - 30, 36, 3); for (let i = 0; i < 5; i++) P_(g, '#f0ead8', x - 16 + i * 8, y - 27, 3, 20); P_(g, '#d0c8b4', x - 20, y - 7, 40, 3); for (let i = 0; i < 9; i++) P_(g, '#e0d8c4', x - 16 + i * 2, y - 31 - Math.min(i, 8 - i), 4, 1); });
M(/\bvot|\bjury|\btrial|\bsentenc|\bcourt\b|\bcharges/i, (g, x, y, t) => { ellipse(g, x, y - 12, 9, 11, '#b5651d'); P_(g, '#8b4513', x - 4, y - 24, 8, 2); for (let i = 0; i < 6; i++) { const k = (t * 1.2 + i / 6) % 1; disc(g, x - 10 + (i * 7) % 20, y - 40 + k * 20, 1, i % 2 ? '#111' : '#fff'); } });
M(/\bcoffee|\bcafé|\bcafe\b|\bcrème|\bespresso/i, (g, x, y, t) => { ellipse(g, x, y - 4, 12, 3, '#ecf0f1'); P_(g, '#f5f5f5', x - 7, y - 16, 14, 12); P_(g, '#6b4a2b', x - 6, y - 15, 12, 2); P_(g, '#f5f5f5', x + 7, y - 13, 3, 5); for (let i = 0; i < 3; i++) P_(g, `rgba(255,255,255,${0.6 - ((t + i / 3) % 1) * 0.6})`, x - 3 + i * 3, y - 20 - ((t * 10 + i * 4) % 12), 1, 2); });
M(/\bpoison|\bhemlock|\bcup\b|\bdrank|\bdrink/i, (g, x, y, t) => { P_(g, '#8a8a92', x - 6, y - 18, 12, 12); P_(g, '#5a7a3a', x - 5, y - 17, 10, 3); P_(g, '#8a8a92', x - 2, y - 6, 4, 4); P_(g, '#8a8a92', x - 6, y - 2, 12, 2); for (let i = 0; i < 3; i++) P_(g, '#7a9a4a', x - 4 + i * 4, y - 22 - ((t * 6 + i) % 6), 1, 2); });
M(/\bdeath\b|\bdie\b|\bdied\b|\bdies\b|\bdead\b|\bkill|\bexecut|\bfuneral|\bcorpse|\bmortal|\bmemento|\bburied/i, (g, x, y, t) => { P_(g, '#7f8c8d', x - 8, y - 24, 16, 22); disc(g, x, y - 24, 8, '#7f8c8d'); P_(g, '#5d6d6e', x - 1, y - 26, 2, 12); P_(g, '#5d6d6e', x - 5, y - 22, 10, 2); P_(g, '#27ae60', x - 12, y - 2, 24, 2); P_(g, '#f78fb3', x + 9, y - 5, 2, 3); });
M(/\boracle|\bdelphi|\btemple|\bgods?\b|\bheaven|\bdivine|\bpriestess|\bfaith|\breligio/i, (g, x, y, t) => { disc(g, x, y - 22, 16, `rgba(255,230,150,${0.25 + 0.1 * Math.sin(t * 3)})`); P_(g, '#e0d8c4', x - 14, y - 26, 28, 3); for (let i = 0; i < 4; i++) P_(g, '#f0ead8', x - 12 + i * 7, y - 23, 3, 17); P_(g, '#d0c8b4', x - 16, y - 6, 32, 3); for (let i = 0; i < 7; i++) P_(g, '#e0d8c4', x - 12 + i * 4, y - 27 - Math.min(i, 6 - i) * 2, 4, 2); });
M(/\bwrit|\bbooks?\b|\bscroll|\bnotebook|\bletters?\b|\bread\b|\banalects|\btao te ching|\bmeditations|\bhandbook|\bnovel|\bdialogues|\bwrote|\bposter|\bplay\b|\bsecond sex|\brepublic\b/i, (g, x, y, t) => { P_(g, '#f3e6c4', x - 14, y - 26, 28, 20); P_(g, '#c9a24a', x - 16, y - 28, 3, 24); P_(g, '#c9a24a', x + 13, y - 28, 3, 24); for (let i = 0; i < 5; i++) P_(g, '#5a3a1a', x - 10, y - 22 + i * 3, i === 4 ? Math.floor((t * 10) % 18) : 18 - (i % 2) * 4, 1); P_(g, '#3a2a1a', x + 6, y - 12, 1, 6); });
M(/\bschool|\bacademy|\bstudent|\bteach|\btutor|\blesson|\blearn|\bstud(y|ied)|\bclass\b|\bexams?\b/i, (g, x, y, t) => { P_(g, '#6b4a2b', x - 16, y - 32, 32, 22); P_(g, '#2e4a3e', x - 14, y - 30, 28, 18); P_(g, '#fff', x - 10, y - 26, 6, 1); P_(g, '#fff', x - 10, y - 22, 12, 1); P_(g, '#fff', x - 10, y - 18, 9, 1); for (let i = 0; i < 2; i++) person(g, x - 8 + i * 16, y + 6, LOOKS.youngPlato, { dir: 1, sit: true }); });
M(/\bsun\b|\bsunlight|\bdaylight|\blight\b|\bdawn|\bbright|\bblind/i, (g, x, y, t) => { for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t * 0.4; line(g, x + Math.cos(a) * 12, y - 20 + Math.sin(a) * 12, x + Math.cos(a) * 18, y - 20 + Math.sin(a) * 18, '#f7dc6f'); } disc(g, x, y - 20, 9, '#fff3b0'); disc(g, x, y - 20, 6, '#ffffff'); });
M(/\bshadow/i, (g, x, y, t) => { P_(g, '#6a5444', x - 18, y - 36, 36, 32); silhouette(g, ['horse', 'bird', 'jar'][Math.floor(t / 1.5) % 3], x, y - 12, 2, 'rgba(15,8,5,0.85)'); });
M(/\bcaves?\b|\bchain|\bprisoner/i, (g, x, y, t) => { ellipse(g, x, y - 18, 18, 18, '#4a3a2e'); ellipse(g, x, y - 14, 11, 14, '#120a06'); drawFlame(g, x, y - 6, t, 1); for (let i = -1; i <= 1; i += 2) P_(g, '#8a8a90', x + i * 14, y - 4, 1, 4); });
M(/\bfire\b|\bflame|\blantern|\bcandle|\bburn/i, (g, x, y, t) => { P_(g, '#5a3a1a', x - 8, y - 4, 16, 3); drawFlame(g, x, y - 5, t, 2); });
M(/\bhorse/i, (g, x, y, t) => { const h = Math.floor(t * 2) % 2; P_(g, '#8b5a2b', x - 9, y - 16, 18, 8); P_(g, '#8b5a2b', x + 6, y - 22 + h, 4, 8); P_(g, '#8b5a2b', x + 8, y - 23 + h, 6, 4); P_(g, '#3a2a1a', x + 6, y - 24 + h, 2, 8); for (const lx of [-8, -5, 4, 7]) P_(g, '#6b4a2b', x + lx, y - 8, 2, 8); P_(g, '#3a2a1a', x - 12, y - 16, 3, 7); });
M(/\bcircles?\b|\bperfect/i, (g, x, y, t) => { ring(g, x, y - 18, 14, '#fff', 1); ring(g, x, y - 18, 15, `rgba(247,201,72,${0.5 + 0.4 * Math.sin(t * 4)})`, 1); drawSpark(g, x + 12, y - 32, t); });
M(/\bmathemat|\bnumbers?\b|\bgeometr|\btriangle|\bmeasur/i, (g, x, y, t) => { line(g, x - 14, y - 4, x, y - 30, '#5dade2'); line(g, x, y - 30, x + 14, y - 4, '#5dade2'); line(g, x - 14, y - 4, x + 14, y - 4, '#5dade2'); P_(g, '#f7c948', x - 2, y - 14, 4, 1); P_(g, '#f7c948', x - 2, y - 12, 4, 1); });
M(/\bsouls?\b|\bspirit/i, (g, x, y, t) => { for (let i = 0; i < 4; i++) disc(g, x + Math.sin(t * 2 + i) * 3, y - 10 - i * 6, 5 - i, `rgba(174,214,241,${0.9 - i * 0.18})`); drawSpark(g, x + 8, y - 30, t); });
M(/\beyes?\b|\bsee\b|\bseen\b|\bsight|\bvision|\bgaze|\blook(ed|ing)?\b/i, (g, x, y, t) => { ellipse(g, x, y - 18, 16, 9, '#f5f5f5'); disc(g, x + Math.sin(t * 1.5) * 5, y - 18, 6, '#3a6ea5'); disc(g, x + Math.sin(t * 1.5) * 5, y - 18, 3, '#111'); P_(g, '#fff', x + Math.sin(t * 1.5) * 5 + 1, y - 21, 1, 1); if (Math.floor(t * 3) % 9 === 0) P_(g, '#e8b48f', x - 16, y - 27, 33, 18); });
M(/\bquestion|\bwhat is\b|\bask(ed|s)?\b|\bpuzzl|\bwhy\b/i, (g, x, y, t) => { qmark(g, x - 4, y - 36 + Math.sin(t * 3) * 2, '#f7c948'); qmark(g, x + 8, y - 22 + Math.cos(t * 3) * 2, '#5dade2'); });
M(/\bmind\b|\bthink|\bthought|\bideas?\b|\breason\b|\breasoning|\blogic|\bsyllogism|\bopinion/i, (g, x, y, t) => { disc(g, x, y - 18, 12, '#e8b48f'); P_(g, '#3a2a1a', x - 12, y - 30, 24, 6); disc(g, x + 2, y - 20, 6, '#f5b7b1'); line(g, x - 2, y - 22, x + 6, y - 22, '#c0392b'); line(g, x + 2, y - 26, x + 2, y - 14, '#c0392b'); for (let i = 0; i < 3; i++) disc(g, x + 14 + i * 4, y - 34 - i * 3, 1 + i, '#fff'); });
M(/\bwonder|\bstars?\b|\buniverse|\bcosmos|\bsomething rather than nothing|\bexist/i, (g, x, y, t) => { R(g, '#1a1a3a', x - 20, y - 40, 40, 38); for (let i = 0; i < 14; i++) { const a = (Math.sin(t * 2 + i) + 1) / 2; P_(g, `rgba(255,255,255,${0.3 + a * 0.7})`, x - 18 + (i * 13) % 36, y - 38 + (i * 7) % 34, 1, 1); } disc(g, x + 8, y - 30, 4, '#f7dc6f'); });
M(/\bowls?\b|\bminerva|\bathena/i, (g, x, y, t) => drawOwl(g, x, y - 4, t, {}));
M(/\bships?\b|\bshipwreck|\bvoyage|\bboat|\bsail|\bcargo|\bsank/i, (g, x, y, t) => { const b = Math.sin(t * 3) * 2; ICONS.ship(g, x, y - 18 + b); for (let i = 0; i < 6; i++) P_(g, '#5dade2', x - 18 + i * 7 + Math.sin(t * 3 + i) * 2, y - 8, 4, 1); P_(g, '#2e86c1', x - 20, y - 6, 40, 6); });
M(/\bstorms?\b|\brain\b|\bthunder|\bweather|\bwind\b|\bgust/i, (g, x, y, t) => { ICONS.cloud(g, x, y - 28); for (let i = 0; i < 6; i++) P_(g, '#aed6f1', x - 10 + i * 4, y - 18 + ((t * 30 + i * 5) % 14), 1, 3); if (Math.floor(t * 4) % 7 === 0) { line(g, x, y - 22, x - 4, y - 12, '#f7dc6f'); line(g, x - 4, y - 12, x + 2, y - 4, '#f7dc6f'); } });
M(/\brivers?\b|\bwaters?\b|\bflow|\bcurrent|\bdrip|\bponds?\b|\blakes?\b|\bspring\b|\bswim/i, (g, x, y, t) => { for (let r = 0; r < 4; r++) for (let i = 0; i < 40; i++) P_(g, r % 2 ? '#5dade2' : '#85c1e9', x - 20 + i, y - 30 + r * 7 + Math.round(Math.sin(i * 0.4 + t * 3 + r) * 2), 1, 2); });
M(/\bmountains?\b|\balps\b|\bwalk|\bpeak|\bclimb/i, (g, x, y, t) => { for (let i = -20; i <= 20; i++) { const h = 30 - Math.abs(i) * 1.2; P_(g, '#5a6a8a', x + i, y - 4 - h, 1, h); if (h > 22) P_(g, '#fff', x + i, y - 4 - h, 1, 3); } person(g, x - 10 + ((t * 6) % 20), y, LOOKS.nietzsche, { dir: 3, step: Math.floor(t * 6) % 4 }); });
M(/\bhammer|\bidols?\b|\bpillars?\b|\bhollow/i, (g, x, y, t) => { const a = Math.sin(t * 6) * 0.6; drawColumn(g, x + 4, y, 30, '#ece4d0'); P_(g, '#8b5a2b', x - 14 + a * 4, y - 26, 2, 14); P_(g, '#7f8c8d', x - 18 + a * 4, y - 28, 10, 5); if (a > 0.4) for (let i = 0; i < 3; i++) P_(g, '#fff', x - 2 + i * 2, y - 30 - i * 2, 1, 1); });
M(/\blions?\b/i, (g, x, y, t) => drawLion(g, x - 6, y, Math.floor(t) % 3 === 0 ? 'roar' : null, t));
M(/\bcamels?\b|\bburdens?\b|\bthou shalt|\bload me/i, (g, x, y, t) => { P_(g, '#c8a060', x - 8, y - 12, 16, 6); P_(g, '#b89050', x - 5, y - 15, 4, 3); P_(g, '#c8a060', x + 6, y - 18, 3, 8); P_(g, '#c8a060', x + 7, y - 19, 5, 3); [-7, -4, 3, 6].forEach(lx => P_(g, '#a08040', x + lx, y - 6 + (Math.floor(t * 4) % 2), 2, 6)); P_(g, '#6b4a2b', x - 7, y - 21, 10, 6); });
M(/\bchild\b|\bchildren|\bsons?\b|\bboy\b|\bbaby|\binnocen/i, (g, x, y, t) => { person(g, x, y, { skin: '#f0d0a8', hairStyle: 'curly', hairC: '#d8b26e', robe: '#5dade2', robe2: '#2e86c1' }, { armsUp: Math.floor(t * 3) % 2 === 0, smile: true }); disc(g, x + 10, y - 10 - Math.abs(Math.sin(t * 5)) * 10, 2, '#e74c3c'); });
M(/\bdragon/i, (g, x, y, t) => { for (let i = 0; i < 16; i++) disc(g, x - 16 + i * 2, y - 14 + Math.sin(i * 0.6 + t * 4) * 5, 3, i % 2 ? '#27ae60' : '#2ecc71'); disc(g, x + 16, y - 16, 4, '#27ae60'); P_(g, '#e74c3c', x + 19, y - 17, 1, 1); });
M(/\babyss|\bmonsters?\b|\bnihilism|\bvoid\b|\bnothing has value|\bdizz/i, (g, x, y, t) => { ellipse(g, x, y - 16, 18, 14, '#0a0a14'); ellipse(g, x, y - 16, 12, 9, '#000'); if (Math.floor(t * 2) % 5) { P_(g, '#e74c3c', x - 5, y - 18, 2, 2); P_(g, '#e74c3c', x + 3, y - 18, 2, 2); } });
M(/\bspider|\bmoon|\bmoonlight/i, (g, x, y, t) => { R(g, '#101830', x - 20, y - 40, 40, 38); disc(g, x + 8, y - 30, 6, '#e8e8f0'); line(g, x - 16, y - 34, x - 6, y - 20, '#ccc'); P_(g, '#111', x - 7, y - 20 + Math.sin(t * 2) * 2, 3, 2); });
M(/\bmusic|\bsongs?\b|\bbells?\b|\bharp|\blute\b|\bstring\b|\bmelody|\bjazz|\bpiano|\brecord\b|\bnotes?\b|\bsing\b|\bsound/i, (g, x, y, t) => { for (let i = 0; i < 3; i++) { const yy = y - 14 - i * 8 + Math.sin(t * 4 + i) * 3, xx = x - 12 + i * 10; disc(g, xx, yy, 2, '#f7c948'); P_(g, '#f7c948', xx + 2, yy - 9, 1, 9); P_(g, '#f7c948', xx + 2, yy - 9, 4, 1); } });
M(/\bfamil|\bparents?\b|\bmother|\bfather|\bhusband|\bwife\b|\bsiblings?|\bbrother|\bsister|\bhome\b/i, (g, x, y, t) => { person(g, x - 10, y, LOOKS.husband, { smile: true }); person(g, x + 10, y, LOOKS.wife, { smile: true }); person(g, x, y + 2, LOOKS.child, { smile: true }); });
M(/\bmoney|\bcoins?\b|\bgold\b|\bwealth|\bobols?\b|\brich\b|\bprices?\b|\beconomy|\bfee\b|\bbusiness|\bmerchant|\bpaid|\bpay\b/i, (g, x, y, t) => { ICONS.coins(g, x, y - 10); for (let i = 0; i < 3; i++) ICONS.coin(g, x - 10 + i * 10, y - 24 - ((t * 20 + i * 7) % 12)); });
M(/\bfood|\beat\b|\bate\b|\bmeat\b|\brice\b|\bmango|\bpleasures?\b|\bstarv|\bfasting|\bluxury/i, (g, x, y, t) => { ellipse(g, x, y - 8, 12, 5, '#8b5a2b'); ellipse(g, x, y - 10, 10, 3, '#f5f5f5'); ICONS.mango(g, x + 10, y - 22); ICONS.apple(g, x - 10, y - 20); });
M(/\bold man\b|\bold age\b|\bgrow old|\baging|\bgrey hair/i, (g, x, y, t) => person(g, x, y, { skin: '#d8b08a', hairStyle: 'bald', hairC: '#ddd', beard: '#ddd', beardLen: 3, robe: '#8a7a6a', staff: true, long: true }, { bow: true, step: Math.floor(t * 2) % 4 }));
M(/\bsick|\billness|\bpain\b|\bheadache|\bmedicine|\bdoctor|\bdisease|\bplague|\bdiagnos|\bcure\b|\bgerms?\b/i, (g, x, y, t) => { ICONS.sick(g, x - 8, y - 18); P_(g, '#ecf0f1', x + 4, y - 24, 10, 16); P_(g, '#e74c3c', x + 8, y - 20, 2, 8); P_(g, '#e74c3c', x + 5, y - 17, 8, 2); });
M(/\bmonks?\b|\bmeditat|\bnuns?\b|\bawake|\bawaken|\bbuddha\b/i, (g, x, y, t) => { disc(g, x, y - 14, 13, `rgba(255,230,150,${0.25 + 0.1 * Math.sin(t * 2)})`); person(g, x, y, LOOKS.buddha, { sit: true, closedEyes: true }); });
M(/\btrees?\b|\boaks?\b|\bacorn|\bseeds?\b|\bgrow|\bbodhi\b|\bplants?\b/i, (g, x, y, t) => drawTree(g, x, y - 2, { leaf: '#3a8a3a', size: 0.9 + Math.sin(t) * 0.05, fruit: /acorn|oak/.test(G._panelText || '') ? '#8b5a2b' : null }));
M(/\bflowers?\b|\blotus|\bbloom|\bbeaut|\bpetals?\b/i, (g, x, y, t) => { for (let i = 0; i < 6; i++) { const a = t + i * 1.05; disc(g, x + Math.cos(a) * 7, y - 20 + Math.sin(a) * 7, 4, '#f8a8c8'); } disc(g, x, y - 20, 3, '#f7dc6f'); P_(g, '#27ae60', x, y - 12, 1, 12); ellipse(g, x - 5, y - 4, 5, 2, '#27ae60'); });
M(/\bdolphins?|\bfish\b|\bkoi\b/i, (g, x, y, t) => { const k = (t * 0.6) % 1, dx = x - 14 + k * 28, dy = y - 10 - Math.sin(k * 3.14) * 20; P_(g, '#7f8c8d', dx - 4, dy - 2, 9, 4); P_(g, '#95a5a6', dx - 3, dy, 6, 2); P_(g, '#7f8c8d', dx - 6, dy - 3, 2, 3); P_(g, '#2e86c1', x - 20, y - 6, 40, 6); });
M(/\bsheep|\banimals?\b|\bbuffalo|\bdeer\b|\btortoise|\bspecies/i, (g, x, y, t) => { disc(g, x - 6, y - 8, 6, '#f5f5f5'); P_(g, '#3a3a3a', x - 1, y - 11, 5, 4); P_(g, '#3a3a3a', x - 9, y - 3, 1, 3); P_(g, '#3a3a3a', x - 3, y - 3, 1, 3); P_(g, '#c8884a', x + 6, y - 14, 10, 6); P_(g, '#c8884a', x + 15, y - 19, 3, 6); P_(g, '#8b5a2b', x + 15, y - 22, 1, 3); for (const lx of [7, 9, 13, 15]) P_(g, '#a06a3a', x + lx, y - 8, 1, 8); });
M(/\bbutterfl|\bdream|\bsleep|\bwak(e|ing)\b|\bwoke/i, (g, x, y, t) => { const w = Math.floor(t * 8) % 2, bx = x + Math.sin(t * 2) * 8, by = y - 22 + Math.cos(t * 3) * 4; P_(g, '#f39c12', bx - 5, by - 3 - w * 2, 5, 5); P_(g, '#f39c12', bx + 1, by - 3 - w * 2, 5, 5); P_(g, '#3a2a1a', bx, by - 3, 1, 6); P_(g, '#aed6f1', x - 16, y - 8, 4, 1); P_(g, '#aed6f1', x - 14, y - 12, 4, 1); });
M(/\bknife|\bblade|\bcook\b|\bcarv|\bchisel|\bsculpt|\bstatue|\bmarble|\bcraftsm/i, (g, x, y, t) => { P_(g, '#e8e8ec', x - 8, y - 30, 16, 26); P_(g, '#d0d0d8', x + 4, y - 30, 4, 26); const a = Math.sin(t * 8); P_(g, '#7f8c8d', x + 10 + a * 2, y - 22, 8, 2); P_(g, '#8b5a2b', x + 16 + a * 2, y - 23, 5, 4); if (a > 0.6) P_(g, '#fff', x + 9, y - 24, 1, 1); });
M(/\bwheels?\b|\bchariot|\bhub\b|\bspokes?\b|\baxle/i, (g, x, y, t) => { ring(g, x, y - 18, 12, '#6b4a2b', 2); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + t; line(g, x, y - 18, x + Math.cos(a) * 12, y - 18 + Math.sin(a) * 12, '#6b4a2b'); } disc(g, x, y - 18, 2, '#3a2a1a'); });
M(/\bpots?\b|\bclay\b|\bempt(y|iness)\b|\bvessel/i, (g, x, y, t) => { ellipse(g, x, y - 14, 12, 13, '#b5651d'); ellipse(g, x, y - 26, 7, 2, '#3a1a0a'); P_(g, '#8b4513', x - 7, y - 28, 14, 2); const k = (t * 0.3) % 1; ellipse(g, x, y - 26 + 0, 6, 1, k > 0.5 ? '#5dade2' : '#3a1a0a'); });
M(/\bindia\b|\bchina\b|\bparis\b|\brome\b|\bgreece\b|\bfrance\b|\beurope|\bswiss|\bmacedon|\balgiers|\bcopenhagen|\bjapan|\bkorea|\bvietnam|\bworld\b|\bwest\b|\beast\b|\bborder/i, (g, x, y, t) => { disc(g, x, y - 18, 15, '#2e86c1'); disc(g, x - 4, y - 22, 6, '#27ae60'); disc(g, x + 6, y - 14, 5, '#27ae60'); disc(g, x + 2, y - 28, 3, '#27ae60'); const px = x + Math.sin(t) * 6, py = y - 30; disc(g, px, py, 3, '#e74c3c'); P_(g, '#e74c3c', px, py + 2, 1, 4); });
M(/\bfree\b|\bfreedom|\bfreed\b|\bslave|\bunchain/i, (g, x, y, t) => { const s = Math.min(1, (t % 3) / 1); P_(g, '#8a8a90', x - 14 - s * 4, y - 18, 10, 3); P_(g, '#8a8a90', x + 4 + s * 4, y - 18, 10, 3); ring(g, x - 4 - s * 4, y - 17, 3, '#6a6a70'); ring(g, x + 4 + s * 4, y - 17, 3, '#6a6a70'); if (s >= 1) for (let i = 0; i < 4; i++) drawSpark(g, x - 6 + i * 4, y - 30, t + i); });
M(/\bchoices?\b|\bchoos|\bchose\b|\bdecid|\broads?\b|\bpaths?\b|\bthe way\b/i, (g, x, y, t) => { P_(g, '#c9a66b', x - 2, y - 14, 4, 14); for (let i = 0; i < 16; i++) { P_(g, '#c9a66b', x - 2 - i, y - 14 - i, 4, 1); P_(g, '#c9a66b', x - 2 + i, y - 14 - i, 4, 1); } P_(g, '#8b5a2b', x - 1, y - 30, 2, 16); P_(g, '#a0703a', x - 10, y - 30, 9, 4); P_(g, '#a0703a', x + 1, y - 26, 9, 4); });
M(/\bmasks?\b|\broles?\b|\bplaying at|\bpretend|\bbad faith|\bwaiter/i, (g, x, y, t) => { ellipse(g, x - 6, y - 20, 8, 10, '#f5f5f5'); ellipse(g, x + 6, y - 18, 8, 10, '#f7dc6f'); P_(g, '#111', x - 9, y - 23, 2, 2); P_(g, '#111', x - 4, y - 23, 2, 2); P_(g, '#111', x - 8, y - 15, 5, 1); P_(g, '#111', x + 3, y - 21, 2, 2); P_(g, '#111', x + 8, y - 21, 2, 2); P_(g, '#111', x + 4, y - 13, 5, 1); });
M(/\bwom[ae]n\b|\bfeminis|\bgirl/i, (g, x, y, t) => { person(g, x, y, LOOKS.beauvoir, { smile: true }); ring(g, x + 14, y - 26, 4, '#f78fb3'); P_(g, '#f78fb3', x + 14, y - 22, 1, 6); P_(g, '#f78fb3', x + 12, y - 19, 5, 1); });
M(/\bboulder|\brocks?\b|\bstones?\b|\bhill\b|\bsisyphus/i, (g, x, y, t) => { for (let i = 0; i < 36; i++) P_(g, '#6d4c41', x - 18 + i, y - 4 - i * 0.6, 1, 4 + i * 0.6); const k = (t * 0.25) % 1; disc(g, x - 8 + k * 22, y - 14 - k * 14, 6, '#7f8c8d'); person(g, x - 16 + k * 22, y - k * 14, LOOKS.sisyphus, { dir: 3, step: Math.floor(t * 6) % 4, armsUp: true }); });
M(/\bhapp|\bsmil|\bjoy\b|\bjoyful|\blove\b|\bloves\b|\bheart|\bkind\b|\bkindly|\bkindness|\bcare\b|\bcaring|\beudaimonia|\bflourish|\bhumane|\bwarm/i, (g, x, y, t) => { ICONS.heart(g, x, y - 18 + Math.sin(t * 4) * 1.5); for (let i = 0; i < 3; i++) drawSpark(g, x - 12 + i * 12, y - 30 + (i % 2) * 6, t + i); });
M(/\bangry|\banger\b|\binsult|\brude|\bfight|\brevolt|\bmock|\blaugh at/i, (g, x, y, t) => { disc(g, x, y - 18, 11, '#e74c3c'); P_(g, '#111', x - 5, y - 21, 3, 1); P_(g, '#111', x + 3, y - 21, 3, 1); P_(g, '#111', x - 4, y - 13, 8, 1); for (let i = 0; i < 3; i++) line(g, x + 12 + i * 2, y - 32, x + 14 + i * 2, y - 28, '#e74c3c'); });
M(/\beternal|\brecurrence|\bagain\b|\bforever|\bloop|\bonce more|\binnumerable/i, (g, x, y, t) => { for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28 + t * 2; P_(g, i < 20 ? '#f7c948' : '#f5d76e', x + Math.cos(a) * 12, y - 18 + Math.sin(a) * 12, 2, 2); } P_(g, '#f7c948', x + 10, y - 30, 4, 4); });
M(/\bhourglass|\btime\b|\bclock|\bcentur|\byears?\b|\bdays?\b|\bnight\b|\bmorning|\bimpermanen|\bchange/i, (g, x, y, t) => { P_(g, '#c9a24a', x - 8, y - 32, 16, 2); P_(g, '#c9a24a', x - 8, y - 4, 16, 2); const k = (t * 0.2) % 1; for (let i = 0; i < 12; i++) { const w = Math.abs(6 - i); P_(g, '#d6eaf8', x - w, y - 30 + i * 2, w * 2 + 1, 2); } P_(g, '#f7dc6f', x - 4 + k * 3, y - 28 + k * 10, 8 - k * 6, 4 - k * 3); P_(g, '#f7dc6f', x - 4, y - 8 - k * 4, 8, 2 + k * 4); P_(g, '#f7dc6f', x, y - 18, 1, 8); });
M(/\bmirror|\bmyself|\byourself|\bself\b|\bidentity|\bwho you are|\breflection/i, (g, x, y, t) => { ellipse(g, x, y - 20, 10, 13, '#c9a24a'); ellipse(g, x, y - 20, 8, 11, '#aed6f1'); person(g, x, y - 8, playerLook(), { noShadow: true }); P_(g, '#fff', x - 5, y - 28, 1, 4); });
M(/\byin\b|\byang\b|\bopposites?\b|\bbalance|\bharmony|\bmiddle\b|\bmean\b|\bextremes?\b|\btoo loose|\btoo tight/i, (g, x, y, t) => drawYinYang(g, x, y - 18, 12, t * 0.6));
M(/\blaugh|\bjokes?\b|\bwit\b|\bfunny|\bha!|\bhoo hoo/i, (g, x, y, t) => { disc(g, x, y - 18, 11, '#f7dc6f'); P_(g, '#111', x - 5, y - 22, 3, 1); P_(g, '#111', x + 3, y - 22, 3, 1); ellipse(g, x, y - 14, 5, 3, '#8b1e2b'); P_(g, '#5dade2', x - 12, y - 22 + Math.sin(t * 8), 1, 3); });
M(/\bvirtues?\b|\bcourage|\bbrave|\bhabit|\bcharacter\b|\bjunzi|\bnoble/i, (g, x, y, t) => { P_(g, '#c9a24a', x - 10, y - 32, 20, 18); for (let i = 0; i < 8; i++) P_(g, '#c9a24a', x - 10 + i, y - 14 + i, 20 - i * 2, 1); P_(g, '#8b1e2b', x - 2, y - 28, 4, 16); P_(g, '#8b1e2b', x - 7, y - 24, 14, 4); drawSpark(g, x + 8, y - 30, t); });
M(/\bbow\b|\bbowed|\britual|\bli\b|\bcourtes|\brespect|\bmanners|\breverence/i, (g, x, y, t) => { const b = Math.floor(t) % 2 === 0; person(g, x - 8, y, LOOKS.minister, { dir: 3, bow: b }); person(g, x + 8, y, LOOKS.ruler, { dir: 2, bow: !b }); });
M(/\btruth\b|\btrue\b|\breal\b|\breality|\bforms?\b/i, (g, x, y, t) => { disc(g, x, y - 18, 14, `rgba(255,240,180,${0.2 + 0.1 * Math.sin(t * 3)})`); P_(g, '#f7c948', x - 2, y - 30, 4, 4); P_(g, '#f7c948', x - 1, y - 26, 2, 14); P_(g, '#f7c948', x + 1, y - 18, 4, 2); P_(g, '#f7c948', x + 1, y - 14, 3, 2); drawSpark(g, x + 8, y - 30, t); });
M(/\bsuffer|\bsorrow|\bgrief|\bsad\b|\bweep|\bcry\b|\bmisery|\bdukkha/i, (g, x, y, t) => { disc(g, x, y - 18, 10, '#aed6f1'); P_(g, '#111', x - 4, y - 21, 3, 1); P_(g, '#111', x + 2, y - 21, 3, 1); P_(g, '#111', x - 3, y - 13, 6, 1); const k = (t * 1.2) % 1; P_(g, '#3498db', x - 5, y - 19 + k * 10, 2, 3); });
M(/\bcrav|\bcling|\bgrasp|\bdesir|\btanha|\bmine!|\bwant\b/i, (g, x, y, t) => { const c = Math.floor(t * 2) % 2; P_(g, '#e8b48f', x - 6, y - 16, 12, 10); for (let i = 0; i < 4; i++) P_(g, '#e8b48f', x - 6 + i * 3, y - 24 + (c ? 4 : 0), 2, 8 - (c ? 4 : 0)); P_(g, '#e8b48f', x + 6, y - 14, 4, 2); ICONS.coin(g, x, y - 30 + (c ? 6 : 0)); });
M(/\blaws?\b|\brules?\b|\bgovern|\bstates?\b|\bpolitic|\bofficial|\bsociety|\bvillage|\bcity\b/i, (g, x, y, t) => { P_(g, '#8b1e2b', x - 16, y - 20, 32, 16); for (let i = 0; i < 4; i++) P_(g, '#c0392b', x - 14 + i * 9, y - 20, 3, 16); for (let i = 0; i < 12; i++) P_(g, '#3a3a42', x - 20 + i, y - 22 - i * 0.5, 40 - i * 2, 1); P_(g, '#c9a24a', x - 3, y - 14, 6, 6); });
M(/\bdusk|\bsunset|\bevening/i, (g, x, y, t) => { vgrad(g, x - 20, y - 40, 40, 36, '#5b3f8a', '#f6b26b', 6); disc(g, x, y - 8, 8, '#ffd39a'); P_(g, '#6a4a7a', x - 20, y - 6, 40, 4); });
M(/\bpuppet|\bcutout|\bcopy\b|\bcopies/i, (g, x, y, t) => { person(g, x, y, LOOKS.puppeteer, { armsUp: true }); P_(g, '#5a3a1a', x, y - 34, 1, 10); silhouette(g, 'horse', x, y - 32, 1, '#a07a4a'); });

// ---- per-room panel backgrounds
const PANEL_THEME = {
  crossroads: ['#3a2a5a', '#7a4a6a'], agora: ['#2a4a6a', '#5a7a9a'], cave: ['#1a120c', '#3a2a1e'], lyceum: ['#3a2a3a', '#7a5a4a'],
  stoa: ['#1b3a5a', '#3a6a8a'], mountain: ['#1b2a4a', '#4a5a7a'], courtyard: ['#3a1414', '#6a2a2a'], valley: ['#1a3a3a', '#3a6a5a'],
  bodhi: ['#4a2a10', '#8a5a2a'], cafe: ['#1a1018', '#3a2418'],
};
function themeOf() { const k = G.roomId === 'cave' && Rooms.cave.view === 'out' ? 'valley' : G.roomId; return PANEL_THEME[k] || ['#2a2440', '#4a3a6a']; }

const _mc = document.createElement('canvas'); _mc.width = 44; _mc.height = 44;
const _mg = _mc.getContext('2d');
function findMotifs(text) {
  const found = [];
  for (const [re, fn] of MOTIFS) {
    const m = re.exec(text);
    if (m) found.push({ fn, at: m.index });
  }
  found.sort((a, b) => a.at - b.at);
  return found.slice(0, 3).map(f => f.fn);
}
function makeLinePanel(who, str) {
  const sp = speakerOf(who);
  const text = str.replace(/\*/g, '');
  const motifs = findMotifs(text);
  const [c1, c2] = themeOf();
  const look = sp && sp.look;
  return (v, t) => {
    vgrad(v, 0, 0, 160, 90, c1, c2, 6);
    for (let i = 0; i < 10; i++) v.fillStyle = 'rgba(255,255,255,0.04)', v.fillRect((i * 37 + t * 6) % 170 - 10, (i * 19) % 90, 1, 1);
    if (!motifs.length) {
      // a living postcard of where you are
      if (G.room && G.room.bgc) {
        const px = clamp(player.x - 120 + Math.sin(t * 0.3) * 30, 0, W - 240), py = clamp(player.y - 90, 0, H - 135);
        v.imageSmoothingEnabled = false;
        v.drawImage(G.room.bgc, px, py, 240, 135, 0, 0, 160, 90);
        v.fillStyle = 'rgba(0,0,0,0.15)'; v.fillRect(0, 0, 160, 90);
      }
    } else {
      const n = motifs.length, s = n === 1 ? 2 : n === 2 ? 1.6 : 1.2;
      const cw = 44 * s, startX = 80 - (cw * n) / 2 + (look && n < 3 ? 14 : 0);
      motifs.forEach((fn, i) => {
        _mg.clearRect(0, 0, 44, 44);
        try { fn(_mg, 22, 40, t + i * 0.7); } catch (e) { }
        const bob = Math.round(Math.sin(t * 2 + i) * 1.5);
        v.imageSmoothingEnabled = false;
        v.drawImage(_mc, Math.round(startX + i * cw), Math.round(84 - 44 * s + bob), Math.round(44 * s), Math.round(44 * s));
      });
    }
    // the speaker, talking
    if (look) {
      const talking = Dialog.cur && Dialog.cur.shown < Dialog.cur.total;
      _mg.clearRect(0, 0, 44, 44);
      if (look === 'owl') drawOwl(_mg, 22, 40, t, { flying: talking && Math.floor(t * 4) % 2 === 0 });
      else drawPerson(_mg, 22, 40, look, 3, 0, { armsUp: talking && Math.floor(t * 3) % 3 === 0, smile: true });
      v.drawImage(_mc, motifs.length ? -16 : 0, 90 - 66, 66, 66);
      if (talking) for (let i = 0; i < 3; i++) { const a = (t * 3 + i * 0.33) % 1; v.fillStyle = `rgba(255,255,255,${0.7 * (1 - a)})`; v.fillRect((motifs.length ? 22 : 38) + i * 2 + a * 6, 38 - i * 4, 2, 1); }
    }
    v.fillStyle = 'rgba(0,0,0,0.25)'; v.fillRect(0, 88, 160, 2);
  };
}
// called by Dialog for every new line
function onDialogLine(who, str, c) {
  if (G.panels === false || G.cutscene) return;
  if (G.vignette && !G.vignette.auto) return;
  if (G.activity && !G.activity.panels) return;
  G._panelText = str;
  const draw = makeLinePanel(who, str);
  const left = player.x > 250;
  showVignette(draw, { x: left ? 12 : W - 180, y: 22 });
  G.vignette.auto = true;
}
// hide the auto panel when talking is over
(function () {
  const next = Dialog.next.bind(Dialog);
  Dialog.next = function () { next(); if (!this.cur && G.vignette && G.vignette.auto) { const v = G.vignette; Promise.resolve().then(() => { if (!Dialog.cur && G.vignette === v) hideVignette(); }); } };
})();
