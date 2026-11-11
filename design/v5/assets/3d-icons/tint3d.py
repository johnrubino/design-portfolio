"""Usage: python3 tint3d.py <source-clay dir> <beta/src/assets/3d dir>
"""Tint 3dicons Clay PNGs toward a line colour (same duotone method as
design/v5/assets/3d-icons/tint.py) and save as 96px WebP."""
import sys
from PIL import Image, ImageOps
src_dir, out_dir = sys.argv[1:3]
def hx(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t): return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
def tint(name, col, out, size=96, lo=0.5, hi=0.38):
    im = Image.open(f'{src_dir}/{name}.png').convert('RGBA').resize((size, size), Image.LANCZOS)
    a = im.getchannel('A'); L = ImageOps.autocontrast(im.convert('L'), cutoff=1)
    c = hx(col); dark = mix(c, (20, 20, 19), lo); light = mix(c, (242, 239, 232), hi)
    lut = [mix(dark, light, i/255) for i in range(256)]
    rgb = Image.merge('RGB', [L.point([p[k] for p in lut]) for k in range(3)]); rgb.putalpha(a)
    rgb.save(f'{out_dir}/{out}.webp', 'WEBP', quality=86, method=6)
JOBS = [
    ('file-text', '#FF6B4A', 'file-text-fowa'), ('file-text', '#E8A317', 'file-text-fpl'), ('file-text', '#5B8CFF', 'file-text-ppr'),
    ('lab', '#B57BFF', 'lab-labs'), ('notebook', '#D4C09A', 'notebook-write'),
    ('boy', '#8a867f', 'boy-base'), ('clock', '#8a867f', 'clock-base'), ('clock', '#D4C09A', 'clock-write'),
    ('lock', '#8a867f', 'lock-base'), ('tool', '#5B8CFF', 'tool-ppr'),
]
for name, col, out in JOBS: tint(name, col, out)
print('ok', len(JOBS))
