'use strict';
// ============================================================
// PhilWorld — stages: separate places for cutscenes set somewhere else.
// Each maker returns a stage spec for C.stage(): { bg, under, over, surface, muffle }.
// Layout matches the rooms: back wall / skyline up to about y≈100, floor below,
// so actors placed at y 110–260 stand on the ground.
// ============================================================
const STAGES = (() => {
  const sky = (g, h, top, bot) => vgrad(g, 0, 0, W, h, top, bot, 8);
  const ridges = (g, base, cols) => cols.forEach((c, i) => {
    const b = base + i * 12, amp = 14 - i * 3, f = 0.018 + i * 0.006, ph = i * 1.7;
    for (let x = 0; x < W; x++) { const y = b + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.6 + ph) * amp * 0.3; R(g, c, x, y, 1, 200); }
  });
  const tiles = (g, y0, base, lines, size = 16) => {
    tex(g, 0, y0, W, H - y0, base, [shade(base, -0.06), shade(base, 0.05)], 0.08, y0);
    for (let y = y0; y < H; y += size) R(g, lines, 0, y, W, 1);
    for (let y = y0; y < H; y += size) for (let x = ((y - y0) / size % 2) * size; x < W; x += size * 2) R(g, lines, x, y, 1, size);
  };
  const cobbles = (g, y0, base) => {
    R(g, base, 0, y0, W, H - y0);
    const r = mulberry(y0 + 7);
    for (let y = y0 + 2; y < H; y += 5) for (let x = (y % 2) * 3; x < W; x += 7) R(g, shade(base, (r() - 0.5) * 0.25), x, y, 5, 3);
  };
  const palm = (g, x, y, h = 40) => {
    for (let i = 0; i < h; i++) R(g, i % 6 < 1 ? '#6b4a2b' : '#8b6a3b', x + Math.round(Math.sin(i / 14) * 3), y - i, 3, 1);
    const tx = x + Math.round(Math.sin(h / 14) * 3) + 1, ty = y - h;
    for (const [dx, dy] of [[-1, 0], [1, 0], [-0.7, 0.5], [0.7, 0.5], [0, -0.6]]) for (let k = 0; k < 14; k++) R(g, k % 3 ? '#3f8f3a' : '#2f7a2a', tx + dx * k, ty + dy * k + (k * k) / 40, 2, 2);
  };
  const chineseRoof = (g, x, y, w, c = '#3a3a42', trim = '#c9a24a') => {
    for (let i = 0; i < 10; i++) R(g, i % 2 ? c : shade(c, 0.12), x - 10 + i, y + i, w + 20 - i * 2, 1);
    R(g, c, x - 14, y - 2, 6, 3); R(g, c, x + w + 8, y - 2, 6, 3);
    R(g, trim, x - 2, y + 10, w + 4, 1);
  };
  const pediment = (g, x, y, w, c = '#f0e8d4') => {
    for (let i = 0; i < 14; i++) R(g, i === 13 ? shade(c, -0.15) : c, x + w / 2 - i * (w / 28), y + i, i * (w / 14), 1);
  };
  const flag = (g, x, y, c, t) => { R(g, '#5a3a1a', x, y, 1, 26); for (let i = 0; i < 9; i++) R(g, c, x + 1 + i, y + 1 + Math.round(Math.sin(t * 4 + i * 0.6)), 1, 7); };

  // ---------- a palace courtyard (style: 'india' | 'greek' | 'chinese')
  function palace(o = {}) {
    const style = o.style || 'greek';
    return {
      name: 'palace', surface: (x, y) => (o.road && y > 150 && y < 206 ? 'dirt' : style === 'india' ? 'sand' : 'stone'),
      bg(g) {
        if (style === 'india') {
          sky(g, 112, '#f6c58f', '#fdf0d8');
          for (const [x, r] of [[110, 16], [240, 26], [370, 16]]) { // domes on drums
            R(g, '#e8b070', x - r + 2, 58 - 6, r * 2 - 4, 8);
            disc(g, x, 52, r, '#f5f0e6'); R(g, '#f5f0e6', x - r, 52, r * 2, 4); disc(g, x - r / 3, 47, Math.round(r / 3), '#ffffff');
            R(g, '#c9a24a', x - 1, 52 - r - 8, 2, 8); disc(g, x, 52 - r - 9, 2, '#f1c40f');
          }
          for (const x of [30, 450]) { R(g, '#d89a5a', x - 8, 34, 16, 26); disc(g, x, 34, 8, '#f5f0e6'); R(g, '#c9a24a', x, 22, 1, 6); }
          R(g, '#d89a5a', 0, 60, W, 52); R(g, '#c0844a', 0, 60, W, 3);
          for (let x = 0; x < W; x += 10) R(g, '#c0844a', x, 56, 6, 4);
          for (let x = 24; x < W; x += 54) { // arches
            R(g, '#7a3a1a', x, 80, 20, 30); disc(g, x + 10, 80, 10, '#7a3a1a'); R(g, '#d89a5a', x - 2, 69, 24, 1);
            R(g, '#e8b070', x - 3, 80, 2, 30); R(g, '#e8b070', x + 21, 80, 2, 30);
          }
          R(g, '#c9a24a', 0, 110, W, 2);
          tex(g, 0, 112, W, H - 112, '#dcc49a', ['#cfb688', '#e6d0a8'], 0.1, 301);
          palm(g, 14, 146, 62); palm(g, 462, 150, 66);
        } else if (style === 'chinese') {
          sky(g, 40, '#f5b7b1', '#fdedec');
          chineseRoof(g, 0, 30, W, '#3a3a42');
          R(g, '#6a1a1a', 0, 41, W, 60); R(g, '#4a0e0e', 0, 41, W, 4);
          for (let x = 18; x < W; x += 60) { R(g, '#c0392b', x, 41, 8, 64); R(g, '#e74c3c', x + 1, 41, 2, 64); }
          for (let x = 40; x < W - 40; x += 60) { R(g, '#3a1a0e', x, 56, 20, 30); for (let k = 0; k < 4; k++) { R(g, '#c9a24a', x, 56 + k * 8, 20, 1); R(g, '#c9a24a', x + k * 6, 56, 1, 30); } }
          R(g, '#b8b0a0', 140, 101, 200, 5); R(g, '#a8a090', 150, 106, 180, 4);
          tiles(g, 110, '#c8c0b0', '#b0a898');
          for (const x of [60, 420]) { R(g, '#8a8a8a', x - 6, 112, 12, 8); R(g, '#c9a24a', x - 4, 104, 8, 8); }
        } else {
          sky(g, 64, '#9fcbe8', '#e4f0f8');
          drawTree(g, 24, 112, { leaf: '#7a9a5a', size: 1.3 }); drawTree(g, 458, 114, { leaf: '#7a9a5a', size: 1.4 });
          pediment(g, 80, 32, 320, '#f0e8d4'); R(g, '#8b1e2b', 80, 46, 320, 6); R(g, '#c9a24a', 80, 52, 320, 2);
          R(g, '#e8dcc0', 80, 54, 320, 56);
          R(g, '#3a2a1a', 222, 66, 36, 44); R(g, '#5a3a1a', 224, 68, 32, 42); R(g, '#c9a24a', 239, 68, 2, 42);
          for (let x = 88; x < 400; x += 34) drawColumn(g, x, 112, 56, '#f4ecd8', { paint: '#8b1e2b' });
          R(g, '#c8b898', 0, 78, 80, 34); R(g, '#c8b898', 400, 78, 80, 34); R(g, '#b0a080', 0, 78, 80, 2); R(g, '#b0a080', 400, 78, 80, 2);
          R(g, '#d8ccb0', 70, 112, 340, 4);
          tex(g, 0, 116, W, H - 116, '#d8c8a0', ['#c8b890', '#e4d4b0'], 0.12, 302);
        }
        if (o.road) { // a road across the front
          tex(g, 0, 150, W, 56, '#c8a878', ['#b89868', '#d8b888'], 0.18, 303);
          R(g, shade('#c8a878', -0.15), 0, 150, W, 1); R(g, shade('#c8a878', -0.15), 0, 205, W, 1);
          for (let x = 0; x < W; x += 22) R(g, '#a8885a', x + (x % 3), 176, 8, 1);
        }
      },
      under(g, t) {
        if (style === 'india') { flag(g, 170, 30, '#e67e22', t); flag(g, 306, 30, '#e67e22', t); }
        if (style === 'chinese') { drawLantern(g, 120, 62, t); drawLantern(g, 360, 62, t); }
      },
    };
  }

  // ---------- an indoor hall (style: 'greek' feast hall | 'roman' house | 'chinese' court)
  function hall(o = {}) {
    const style = o.style || 'greek';
    return {
      name: 'hall', muffle: 9000, surface: () => (style === 'chinese' ? 'wood' : 'stone'),
      bg(g) {
        if (style === 'roman') {
          R(g, '#8b1e2b', 0, 0, W, 100); R(g, '#5a0e14', 0, 0, W, 8); R(g, '#2a1a14', 0, 86, W, 14);
          for (let x = 30; x < W; x += 90) { R(g, '#c9a24a', x, 18, 50, 52); R(g, '#e8d8b0', x + 2, 20, 46, 48); // fresco
            R(g, '#7aa86a', x + 2, 50, 46, 18); disc(g, x + 32, 32, 6, '#f7dc6f'); drawTree(g, x + 14, 62, { leaf: '#5a8a4a', size: 0.7 }); }
          for (let x = 0; x < W; x += 6) R(g, '#3a2a1a', x, 86, 3, 1);
          tiles(g, 100, '#d8cfc0', '#b8ae9e', 12);
          // the impluvium (rain pool) in the middle of the atrium
          R(g, '#9a9080', 180, 196, 120, 40); R(g, '#3a7a9a', 184, 200, 112, 32); R(g, '#5a9aba', 184, 200, 112, 2);
          for (const x of [8, 464]) drawColumn(g, x, 112, 106, '#f0e8d8', { paint: '#8b1e2b' });
          R(g, '#6b4a2b', 182, 144, 30, 4); R(g, '#4a2a14', 184, 148, 3, 6); R(g, '#4a2a14', 207, 148, 3, 6);
        } else if (style === 'chinese') {
          R(g, '#5a2a14', 0, 0, W, 100); for (let x = 0; x < W; x += 40) R(g, '#3a1a0a', x, 0, 4, 100);
          R(g, '#c0392b', 0, 90, W, 10);
          for (let x = 60; x < W; x += 120) { R(g, '#c9a24a', x, 20, 50, 56); R(g, '#f3e6c4', x + 3, 23, 44, 50); for (let k = 0; k < 5; k++) R(g, '#2a2a2a', x + 10 + k * 7, 30, 2, 30 - (k % 2) * 8); }
          R(g, '#8a5a2a', 0, 100, W, H - 100); for (let y = 100; y < H; y += 10) R(g, '#7a4a1a', 0, y, W, 1);
        } else {
          R(g, '#c8a878', 0, 0, W, 100); R(g, '#8b1e2b', 0, 0, W, 12); R(g, '#c9a24a', 0, 12, W, 2);
          for (let x = 0; x < W; x += 16) R(g, i_meander(x), x, 14, 8, 3);
          for (let x = 24; x < W; x += 80) drawColumn(g, x, 100, 84, '#ece0c4', { paint: '#8b1e2b' });
          for (let x = 54; x < W; x += 80) { R(g, '#7a1a20', x, 30, 26, 46); for (let k = 0; k < 4; k++) R(g, '#a02a30', x + 2 + k * 6, 30, 2, 46); }
          R(g, '#8a6a4a', 0, 96, W, 4);
          tiles(g, 100, '#c8b088', '#a89068', 14);
          ellipse(g, 240, 200, 60, 14, 'rgba(160,40,40,0.25)');
        }
      },
      under(g, t) {
        if (style !== 'roman') for (const x of [40, 440]) { R(g, '#3a2a1a', x - 1, 90, 3, 20); drawFlame(g, x, 90, t, 1); }
        if (style === 'roman') { const k = (t * 0.6) % 1; ring(g, 240, 216, Math.round(2 + k * 12), `rgba(200,230,250,${0.5 - k * 0.5})`); }
      },
    };
  }
  const i_meander = x => ((x / 16) % 2 ? '#c9a24a' : '#e8d8a8');

  // ---------- a mountain pass with a frontier gate tower
  function pass() {
    return {
      name: 'pass', surface: (x, y) => (y > 150 && y < 186 ? 'dirt' : 'grass'),
      bg(g) {
        sky(g, 100, '#e8d0b0', '#f6eedc');
        disc(g, 400, 34, 14, '#fff3d0');
        ridges(g, 34, ['#b8b0a8', '#988c84', '#848a6c', '#8e9466']);
        for (let i = 0; i < 2; i++) { g.fillStyle = 'rgba(255,250,240,0.35)'; g.fillRect(0, 56 + i * 16, W, 4); }
        tex(g, 0, 100, W, H - 100, '#9a9a6a', ['#8a8a5a', '#aaaa7a', '#7a7a4a'], 0.12, 311);
        // the road winding west through the pass
        tex(g, 0, 150, W, 36, '#b8a078', ['#a89068', '#c8b088'], 0.18, 312); R(g, '#8a7a5a', 0, 150, W, 1); R(g, '#8a7a5a', 0, 185, W, 1);
        // the gate: two posts, a lintel, a little tower roof
        R(g, '#6a6a62', 412, 70, 10, 104); R(g, '#6a6a62', 452, 70, 10, 104); R(g, '#7a7a72', 412, 70, 2, 104); R(g, '#7a7a72', 452, 70, 2, 104);
        R(g, '#5a5a52', 404, 64, 66, 10); chineseRoof(g, 410, 46, 54, '#2a2a32', '#8b1e2b');
        R(g, '#8b1e2b', 422, 74, 30, 4);
        for (let y = 80; y < 172; y += 10) { R(g, '#5a5a52', 412, y, 10, 1); R(g, '#5a5a52', 452, y, 10, 1); }
        for (let x = 462; x < W; x += 6) R(g, '#6a6a62', x, 96, 5, 10); R(g, '#7a7a72', 462, 94, 18, 2);
        drawRock(g, 60, 150, 30, 18, '#8a8478'); drawRock(g, 140, 210, 20, 12, '#8a8478');
        drawTree(g, 30, 240, { leaf: '#6a8a4a', size: 1.2 }); drawTree(g, 300, 120, { leaf: '#6a8a4a', size: 0.8 });
      },
      over(g, t) { g.fillStyle = `rgba(255,250,240,${0.08 + 0.04 * Math.sin(t * 0.7)})`; g.fillRect(0, 90, W, 30); },
    };
  }

  // ---------- an ancient Chinese kitchen
  function kitchen() {
    return {
      name: 'kitchen', muffle: 9000, surface: () => 'wood',
      bg(g) {
        R(g, '#6a4a2a', 0, 0, W, 104); for (let x = 0; x < W; x += 24) R(g, '#5a3a1a', x, 0, 2, 104);
        R(g, '#3a2414', 0, 0, W, 10); for (let x = 10; x < W; x += 40) R(g, '#3a2414', x, 0, 6, 16);
        // the stove
        R(g, '#8a7a6a', 40, 50, 90, 54); R(g, '#a89a8a', 40, 50, 90, 3); R(g, '#1a0a04', 58, 74, 22, 18); R(g, '#1a0a04', 92, 74, 22, 18);
        ellipse(g, 69, 50, 14, 4, '#3a3a3a'); ellipse(g, 103, 50, 14, 4, '#3a3a3a');
        R(g, '#7a6a5a', 76, 0, 10, 50);
        // shelves with jars, hanging herbs and a cleaver rack
        R(g, '#4a2a14', 180, 40, 120, 3); for (let i = 0; i < 7; i++) { ellipse(g, 192 + i * 16, 34, 5, 6, ['#b5651d', '#8a5a2a', '#c0784a'][i % 3]); R(g, '#3a1a0a', 190 + i * 16, 27, 4, 2); }
        for (let i = 0; i < 6; i++) { R(g, '#3a2414', 330 + i * 14, 16, 1, 10); R(g, ['#6a8a3a', '#c0392b', '#d4ac0d'][i % 3], 328 + i * 14, 26, 5, 12); }
        R(g, '#8a5a2a', 0, 104, W, H - 104); for (let y = 104; y < H; y += 12) R(g, '#7a4a1a', 0, y, W, 1);
        for (let y = 104; y < H; y += 12) for (let x = ((y - 104) / 12 % 2) * 30; x < W; x += 60) R(g, '#7a4a1a', x, y, 1, 12);
        // Lord Wenhui's mat, the butcher's block with the ox, firewood and a water jar
        R(g, '#a83a3a', 300, 154, 52, 16); R(g, '#c9a24a', 300, 154, 52, 1);
        R(g, '#6b4a2b', 370, 198, 44, 10); R(g, '#4a2a14', 372, 208, 4, 8); R(g, '#4a2a14', 406, 208, 4, 8);
        ellipse(g, 392, 192, 22, 8, '#b0503a'); ellipse(g, 392, 190, 18, 5, '#d07a5a'); R(g, '#f0e0d0', 378, 188, 28, 1);
        for (let i = 0; i < 5; i++) R(g, i % 2 ? '#7a5a3a' : '#8b6a4a', 40, 120 + i * 4, 40 - i * 6, 4);
        ellipse(g, 160, 128, 10, 12, '#6a5a4a'); ellipse(g, 160, 118, 7, 2, '#2a3a4a');
      },
      under(g, t) { drawFlame(g, 69, 90, t, 1.2); drawFlame(g, 103, 90, t + 1, 1.2); for (let i = 0; i < 3; i++) R(g, `rgba(220,220,220,${0.4 - ((t * 0.5 + i / 3) % 1) * 0.4})`, 66 + i * 16, 40 - ((t * 12 + i * 8) % 30), 3, 2); },
    };
  }

  // ---------- an Indian village lane (dusk: true for evening)
  function village(o = {}) {
    const dusk = !!o.dusk;
    return {
      name: 'village', surface: () => 'dirt',
      bg(g) {
        sky(g, 110, dusk ? '#3a3060' : '#9fcbe8', dusk ? '#e08a5a' : '#f0e8d0');
        if (dusk) { for (let i = 0; i < 30; i++) R(g, '#fff', (i * 89) % W, (i * 37) % 50, 1, 1); disc(g, 380, 70, 10, '#f7c08a'); }
        ridges(g, 76, dusk ? ['#4a3a5a', '#3a2e48'] : ['#8aa890', '#6a8870']);
        tex(g, 0, 110, W, H - 110, dusk ? '#7a6050' : '#c8a878', dusk ? ['#6a5040', '#8a7060'] : ['#b89868', '#d8b888'], 0.14, 321);
        for (let i = 0; i < 6; i++) { const x = 30 + i * 84; palm(g, x, 140 + (i % 2) * 8, 36 + (i % 3) * 6); }
        for (let i = 0; i < 5; i++) { const x = 60 + i * 90; R(g, dusk ? '#6a5040' : '#b08858', x, 118, 26, 18); for (let k = 0; k < 7; k++) R(g, dusk ? '#4a3828' : '#8a6a3a', x - 2 + k * 0.5, 111 + k, 30 - k, 1); }
      },
      over(g, t) { if (dusk) { g.fillStyle = 'rgba(30,20,60,0.22)'; g.fillRect(0, 0, W, H); } },
    };
  }

  // ---------- a European street (style: 'town' marketplace, 1880s | 'paris1940' occupied Paris)
  function street(o = {}) {
    const paris = o.style === 'paris1940';
    return {
      name: 'street', surface: () => 'stone',
      bg(g) {
        sky(g, 40, paris ? '#8a96a4' : '#a8d4f0', paris ? '#c4cad2' : '#eaf4fb');
        const fronts = paris ? ['#c8c0b4', '#bcb4a8', '#d0c8bc', '#b4ac9e', '#c4bcae', '#bab2a4'] : ['#e8c8a0', '#d89a7a', '#f0e0b8', '#c8a888', '#e0b890', '#d8c0a0', '#e8d8c0'];
        let x = 0, i = 0;
        while (x < W) {
          const w = paris ? 84 : 58 + (i % 3) * 8, top = paris ? 8 : 18 + (i % 3) * 10, c = fronts[i % fronts.length];
          R(g, c, x, top, w, 120 - top); R(g, shade(c, -0.2), x + w - 1, top, 1, 120 - top);
          if (paris) { R(g, '#5a6070', x, top - 6, w, 8); for (let k = 0; k < 4; k++) R(g, '#4a5060', x + 10 + k * 18, top - 12, 6, 8); }
          else { for (let k = 0; k < 6; k++) R(g, shade(c, -0.3), x + w / 2 - k * (w / 12), top - 6 + k, k * (w / 6), 1); }
          for (let r = 0; r < (paris ? 4 : 3); r++) for (let k = 0; k < Math.floor(w / 20); k++) {
            const wx = x + 6 + k * 20, wy = top + 8 + r * 22;
            if (wy > 92) continue;
            R(g, '#3a4050', wx, wy, 9, 13); R(g, '#8aa0b8', wx + 1, wy + 1, 7, 5); R(g, shade(c, 0.12), wx - 1, wy + 13, 11, 1);
            if (paris) R(g, '#2a2a2a', wx - 1, wy + 9, 11, 1);
          }
          R(g, '#3a2a1a', x + w / 2 - 6, 98, 12, 22);
          x += w; i++;
        }
        if (paris) {
          for (let k = 0; k < 4; k++) { const px = 40 + k * 120; R(g, '#d8d0b8', px, 100, 16, 18); R(g, '#8b1e2b', px + 2, 102, 12, 3); for (let j = 0; j < 4; j++) R(g, '#3a3a3a', px + 3, 108 + j * 2, 10, 1); }
          for (let k = 0; k < 6; k++) R(g, '#8a7a5a', 300 + k * 9, 112 - (k % 2) * 4, 10, 8);
          for (const lx of [110, 350]) { R(g, '#2a2a2a', lx, 76, 2, 46); R(g, '#3a3a3a', lx - 3, 72, 8, 5); }
          cobbles(g, 120, '#7a7a80');
        } else {
          // market stalls in front of the houses
          cobbles(g, 120, '#a8a098');
          for (let k = 0; k < 4; k++) { const sx = 30 + k * 120; const cs = ['#c0392b', '#2e86c1', '#27ae60', '#d4ac0d'][k];
            for (let j = 0; j < 6; j++) R(g, j % 2 ? '#f5f5f5' : cs, sx + j * 8, 112, 8, 8);
            R(g, '#6b4a2b', sx + 2, 120, 2, 18); R(g, '#6b4a2b', sx + 44, 120, 2, 18); R(g, '#8b5a2b', sx, 132, 48, 5);
            for (let j = 0; j < 5; j++) disc(g, sx + 6 + j * 9, 130, 3, ['#c0392b', '#f39c12', '#27ae60'][j % 3]); }
        }
      },
      over(g, t) { if (paris) { g.fillStyle = 'rgba(40,50,70,0.15)'; g.fillRect(0, 0, W, H); } },
    };
  }

  // ---------- an army camp (style: 'roman' | 'macedon')
  function camp(o = {}) {
    const roman = o.style !== 'macedon';
    const cloth = roman ? ['#e8dcc0', '#d8ccb0'] : ['#8e44ad', '#6c3483'];
    return {
      name: 'camp', surface: () => 'dirt',
      bg(g) {
        sky(g, 90, roman ? '#a8b8c8' : '#f0c890', roman ? '#e0e4e8' : '#fbecd0');
        ridges(g, 60, roman ? ['#7a8a8a', '#5a6a68'] : ['#c8a070', '#a88050']);
        // palisade
        for (let x = 0; x < W; x += 6) { R(g, '#6b4a2b', x, 74, 5, 26); R(g, '#8b6a3b', x + 1, 72, 3, 3); }
        tex(g, 0, 100, W, H - 100, '#9a8a6a', ['#8a7a5a', '#aa9a7a', '#7a6a4a'], 0.14, 331);
        for (let i = 0; i < 6; i++) { // rows of tents
          const x = 20 + i * 80, y = 132 + (i % 2) * 6, c = cloth[i % 2];
          for (let k = 0; k < 18; k++) R(g, k % 6 ? c : shade(c, -0.15), x + 18 - k, y - 18 + k, k * 2 + 1, 1);
          R(g, '#3a2a1a', x + 15, y - 6, 6, 6);
        }
        if (roman) for (const sx of [130, 350]) { // legion standards
          R(g, '#5a3a1a', sx, 88, 2, 52); R(g, '#c9a24a', sx - 5, 86, 12, 3); disc(g, sx + 1, 82, 4, '#d4ac0d');
          R(g, '#8b1e2b', sx - 5, 100, 12, 10); R(g, '#c9a24a', sx - 5, 100, 12, 1);
        } else { R(g, '#5a3a1a', 240, 70, 2, 70); R(g, '#c9a24a', 236, 66, 10, 3); for (let i = 0; i < 16; i++) R(g, '#c0392b', 242, 72 + i, 18 - i, 1); }
        // campfire spot
        R(g, '#3a2a1a', 420, 220, 20, 4);
      },
      under(g, t) { drawFlame(g, 430, 222, t, 1.2); for (let i = 0; i < 3; i++) R(g, `rgba(200,200,200,${0.4 - ((t * 0.4 + i / 3) % 1) * 0.4})`, 428 + Math.sin(t + i) * 3, 210 - ((t * 10 + i * 10) % 40), 3, 2); },
    };
  }

  // ---------- an open battlefield plain
  function field() {
    return {
      name: 'field', surface: () => 'grass',
      bg(g) {
        sky(g, 96, '#d8c8a8', '#f4ecd8');
        ridges(g, 54, ['#a8a080', '#8a8868', '#6a7050']);
        tex(g, 0, 96, W, H - 96, '#a8a868', ['#989858', '#b8b878', '#888848'], 0.14, 341);
        for (let i = 0; i < 40; i++) R(g, '#7a7a3a', (i * 113) % W, 100 + (i * 47) % 170, 2, 1);
      },
      over(g, t) { for (let i = 0; i < 8; i++) { const x = (i * 71 + t * 14) % (W + 60) - 30; g.fillStyle = 'rgba(210,190,150,0.12)'; g.fillRect(Math.round(x), 120 + (i % 4) * 30, 50, 8); } },
    };
  }

  // ---------- a prison cell
  function cell() {
    return {
      name: 'cell', muffle: 4000, surface: () => 'stone',
      bg(g) {
        tex(g, 0, 0, W, H, '#3a3430', ['#2e2824', '#4a423c'], 0.2, 7);
        for (let y = 0; y < 100; y += 12) for (let x = (y / 12 % 2) * 14; x < W; x += 28) R(g, '#2a2420', x, y, 1, 12);
        R(g, '#2a2420', 0, 100, W, 3);
        R(g, '#1a1410', 200, 20, 80, 50); R(g, '#c8d8e8', 204, 24, 72, 42); for (let i = 0; i < 6; i++) R(g, '#3a3430', 210 + i * 12, 24, 3, 42);
        g.fillStyle = 'rgba(220,230,255,0.08)'; g.beginPath(); g.moveTo(204, 66); g.lineTo(276, 66); g.lineTo(320, 200); g.lineTo(170, 200); g.fill();
        R(g, '#5a4a3a', 180, 160, 30, 8);
      },
    };
  }

  // ---------- a bare night sky over flat ground
  function night() {
    return {
      name: 'night', surface: () => 'stone',
      bg(g) { vgrad(g, 0, 0, W, H, '#05050f', '#1a1a3a', 10); for (let i = 0; i < 80; i++) R(g, '#fff', (i * 97) % W, (i * 41) % 180, 1, 1); R(g, '#2a2a3a', 0, 210, W, 62); },
      under(g, t) { for (let i = 0; i < 6; i++) if (Math.sin(t * 2 + i * 3) > 0.9) R(g, '#fff', (i * 131 + 40) % W, (i * 53 + 10) % 160, 2, 2); },
    };
  }

  return { palace, hall, pass, kitchen, village, street, camp, field, cell, night };
})();
