"""Rebuild the web fonts in src/assets/fonts/ from the @fontsource packages.

The page ships only what it uses (brief §5, §11):
  - Bricolage Grotesque: weight pinned at 650, optical size axis kept (12 to 96)
  - Public Sans 300 / 400 / 500
  - JetBrains Mono 400
each cut down to Basic Latin, Latin-1 and typographic punctuation. Together
that is about 70 kB instead of 140 kB.

Run after upgrading a @fontsource package, or if you need a character that
isn't in GLYPHS below (missing characters fall back to the system font):
    pip install fonttools brotli
    python3 scripts/subset-fonts.py
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter, Options

here = os.path.dirname(os.path.abspath(__file__))
modules = os.path.join(here, '..', 'node_modules')
out_dir = os.path.join(here, '..', 'src', 'assets', 'fonts')

# Basic Latin, Latin-1, and – — ‘ ’ “ ” • … →
GLYPHS = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2192]

FONTS = [
    ('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2', 'bricolage-grotesque-650.woff2', {'wght': 650}),
    ('@fontsource/public-sans/files/public-sans-latin-300-normal.woff2', 'public-sans-300.woff2', None),
    ('@fontsource/public-sans/files/public-sans-latin-400-normal.woff2', 'public-sans-400.woff2', None),
    ('@fontsource/public-sans/files/public-sans-latin-500-normal.woff2', 'public-sans-500.woff2', None),
    ('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'jetbrains-mono-400.woff2', None),
]

os.makedirs(out_dir, exist_ok=True)
for src, name, pin in FONTS:
    font = TTFont(os.path.join(modules, src))
    if pin:
        font = instancer.instantiateVariableFont(font, pin)
    opts = Options()
    opts.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk']
    sub = Subsetter(opts)
    sub.populate(unicodes=GLYPHS)
    sub.subset(font)
    font.flavor = 'woff2'
    out = os.path.join(out_dir, name)
    font.save(out)
    print(f'{name}: {os.path.getsize(out) / 1024:.1f} kB')
