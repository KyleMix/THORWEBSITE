#!/usr/bin/env python3
"""
Subsets the self-hosted WOFF2 faces to the characters this site renders and
pins each variable axis to the range the CSS uses. Bodoni Moda ships every optical
size across a wide weight range; narrowing both roughly halves it.

    pip install fonttools brotli
    npm run fonts:subset

Re-run after adding a face, a weight, or a glyph the copy needs. Pristine
downloads are kept alongside as *.woff2.orig so this is always re-runnable.
"""
import os, shutil
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

# Basic Latin, Western European accents, and the punctuation the UI uses:
# · separators, × in print sizes, curly quotes, dashes, arrows, ✕ on filters.
LATIN = ("U+0020-007E,U+00A0,U+00A9,U+00B7,U+00D7,U+00E0-00FF,"
         "U+2010-2015,U+2018-201D,U+2022,U+2026,U+2190,U+2192,U+2713,U+2715")
# Central/Eastern European, kept for body text only so client names still set
# in Karla rather than falling back to the system stack.
LATIN_EXT = "U+0100-024F,U+1E00-1EFF,U+2C60-2C7F,U+A720-A7FF"

FACES = [
    ("bodoni-moda-normal-latin.woff2",       LATIN,     {"wght": (400, 700), "opsz": (8, 96)}),
    ("bodoni-moda-italic-latin.woff2",       LATIN,     {"wght": (400, 600), "opsz": (8, 72)}),
    ("karla-normal-400-600-latin.woff2",     LATIN,     {"wght": (400, 600)}),
    ("karla-normal-400-600-latin-ext.woff2", LATIN_EXT, {"wght": (400, 600)}),
    ("courier-prime-normal-400-latin.woff2", LATIN,     {}),
    ("courier-prime-normal-700-latin.woff2", LATIN,     {}),
]

kb = lambda p: os.path.getsize(p) / 1024
before = after = 0.0

for name, unicodes, axes in FACES:
    src = os.path.join("public/fonts", name)
    orig = src + ".orig"
    if not os.path.exists(orig):
        if not os.path.exists(src):
            print("skip (missing)", name)
            continue
        shutil.copy(src, orig)
    b = kb(orig)
    font = TTFont(orig)
    if axes and "fvar" in font:
        font = instancer.instantiateVariableFont(font, axes, updateFontNames=False, inplace=False)
    tmp = "/tmp/_subset_tmp.ttf"
    font.flavor = None
    font.save(tmp)
    subset.main([
        tmp, f"--output-file={src}", f"--unicodes={unicodes}", "--flavor=woff2",
        "--layout-features=kern,liga,calt,tnum,onum,frac", "--no-hinting", "--desubroutinize",
    ])
    a = kb(src)
    before += b; after += a
    print(f"{name:42s} {b:7.1f} KB -> {a:7.1f} KB")

print(f"\n{'TOTAL':42s} {before:7.1f} KB -> {after:7.1f} KB  ({round((1 - after / before) * 100)}% smaller)")
