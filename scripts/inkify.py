"""Turn generated "green ink on off-white paper" illustrations into ink-only transparent WebP.

Why: mix-blend-mode cannot hide the paper inside transformed (parallax / animated) wrappers,
and off-white paper shows as a box on pastel cards. Real alpha works on any background.

Usage (from the repo root):
    python scripts/inkify.py                 # rebuild every image in JOBS
    python scripts/inkify.py money pooling   # rebuild just these

Needs: pip install pillow numpy
After adding a new image: add it to JOBS here AND to ART_SIZES in src/ui/motion.tsx
(use the size this script prints).
"""
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageFilter

IMG = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
INK = np.array([0x1F, 0x3A, 0x08], dtype=np.float32)  # forest ink, a touch lighter than text #1a3300

# output name: (source file in public/img, max width, trim blank margins?)
JOBS = {
    'hero-landscape': ('Pastoral Countryside Sketch Border.png', 1600, False),
    'select-corner': ('1_Find your village.png', 560, True),
    'soil-carbon': ('2_Carbon in your land.png', 560, True),
    'pooling': ('3_Villages pooling together.png', 1000, True),
    'gram-sabha': ('4_The Gram Sabha decides.png', 1400, True),
    'footer-strip': ('5_Horizon divider.png', 1500, True),
    'empty-state': ('6_Nothing here yet.png', 480, True),
    'money': ('7_Money to the village.png', 560, True),
}


def trim(im: Image.Image) -> Image.Image:
    bg = Image.new('RGB', im.size, im.getpixel((4, 4)))
    mask = ImageChops.difference(im, bg).convert('L').filter(ImageFilter.MaxFilter(5)).point(lambda v: 255 if v > 40 else 0)
    box = mask.getbbox()
    if not box:
        return im
    pad = int(max(im.size) * 0.03)
    return im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))


def inkify(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    paper, ink = np.percentile(lum, 70), np.percentile(lum, 0.5)  # most of the canvas is paper
    alpha = np.clip((paper - 6 - lum) / max(1.0, paper - 6 - ink), 0, 1) ** 0.85
    rgba = np.dstack([np.broadcast_to(INK, a.shape[:2] + (3,)), alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def save(img: Image.Image, name: str) -> None:
    path = os.path.join(IMG, name + '.webp')
    img.save(path, 'WEBP', quality=70, alpha_quality=70, method=6)
    print(f'{name:18} {img.size[0]}x{img.size[1]:<5} {os.path.getsize(path) // 1024} KB')


def main(only: list[str]) -> None:
    for name, (src, width, do_trim) in JOBS.items():
        if only and name not in only:
            continue
        im = Image.open(os.path.join(IMG, src)).convert('RGB')
        if do_trim:
            im = trim(im)
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        out = inkify(im)
        save(out, name)
        if name == 'hero-landscape':  # small variant for the hero's srcset
            save(out.resize((800, round(out.height * 800 / out.width)), Image.LANCZOS), 'hero-landscape-sm')


if __name__ == '__main__':
    main(sys.argv[1:])
