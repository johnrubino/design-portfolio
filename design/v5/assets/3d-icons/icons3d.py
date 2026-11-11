"""Build the page's 3D icons from 3dicons "Color" renders (multi-colour, dynamic
angle) as 96px WebP files.

Icons keep their own colours. The one exception is the file icon, which is
hue-shifted per case study so each matches its line on the map (FoWA keeps the
original red-orange; FPL turns yellow; PPR turns blue). A hue shift moves every
colour in the icon together, so its shading and highlights stay intact.

Usage: python3 icons3d.py <source-color dir> <beta/src/assets/3d dir>
"""
import sys
import numpy as np
from PIL import Image

src_dir, out_dir = sys.argv[1:3]


def hue_shift(im, degrees):
    if not degrees:
        return im
    a = im.getchannel('A')
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.int16)
    hsv[..., 0] = (hsv[..., 0] + round(degrees / 360 * 256)) % 256
    out = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    out.putalpha(a)
    return out


def build(name, out, shift=0, size=96):
    im = Image.open(f'{src_dir}/{name}.png').convert('RGBA').resize((size, size), Image.LANCZOS)
    hue_shift(im, shift).save(f'{out_dir}/{out}.webp', 'WEBP', quality=88, method=6)


JOBS = [
    ('file-text', 'file-text-fowa', 8),     # red-orange, toward FoWA coral
    ('file-text', 'file-text-fpl', 38),     # yellow, toward FPL
    ('file-text', 'file-text-ppr', 215),    # blue, toward PPR
    ('lab', 'lab-labs', 0), ('notebook', 'notebook-write', 0),
    ('boy', 'boy-base', 0), ('clock', 'clock-base', 0), ('clock', 'clock-write', 0),
    ('lock', 'lock-base', 0), ('tool', 'tool-ppr', 0),
]
for name, out, shift in JOBS:
    build(name, out, shift)
print('ok', len(JOBS))
