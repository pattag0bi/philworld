#!/usr/bin/env python3
"""Draws the PhilWorld app icon (a 64x64 pixel scene scaled up) into icons/. Needs Pillow."""
import os, random
from PIL import Image, ImageDraw

N = 64
im = Image.new('RGB', (N, N))
d = ImageDraw.Draw(im)
top, bot = (20, 12, 44), (74, 42, 90)
for y in range(N):
    t = y / (N - 1)
    d.line([(0, y), (N, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
random.seed(5)
for _ in range(26):
    x, y = random.randint(2, 61), random.randint(2, 30)
    if 14 < x < 50 and 10 < y < 40:
        continue
    d.point((x, y), fill=(255, 240, 200))
d.ellipse((20, 12, 43, 35), fill=(247, 201, 72))     # moon
d.ellipse((27, 9, 48, 30), fill=(46, 26, 67))        # bite out of it -> crescent
col, dark = (232, 213, 168), (58, 42, 74)             # temple, kept inside the maskable safe zone
d.polygon([(14, 40), (32, 31), (50, 40)], fill=col)
d.rectangle((14, 40, 50, 42), fill=dark)
for x in (17, 25, 33, 41):
    d.rectangle((x, 43, x + 3, 53), fill=col)
d.rectangle((14, 54, 50, 55), fill=col)
d.rectangle((12, 56, 52, 57), fill=(180, 160, 120))

out = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(out, exist_ok=True)
big = im.resize((512, 512), Image.NEAREST)
big.save(os.path.join(out, 'icon-512.png'))
big.save(os.path.join(out, 'icon-maskable-512.png'))
im.resize((192, 192), Image.NEAREST).save(os.path.join(out, 'icon-192.png'))
im.resize((180, 180), Image.NEAREST).save(os.path.join(out, 'apple-touch-icon.png'))
