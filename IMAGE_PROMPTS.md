# VASUDHA CO₂ — Image prompts

Every prompt = **STYLE LOCK** + **SCENE**. Always paste the style lock first, unchanged, so the whole set matches `hero-landscape` (the countryside sketch already in use).
If your tool accepts a reference image, attach `public/img/Pastoral Countryside Sketch Border.png` as the **style reference** at about 70% strength.

---

## STYLE LOCK (paste before every scene)

```
Hand-drawn pen-and-ink line illustration in the style of a botanical field-sketchbook
page. ONE ink colour only: deep forest green #1A3300. Fine 0.5mm technical-pen
linework, confident but slightly imperfect strokes, varied line weight (heavier on
silhouettes, hair-thin on interior detail), small open hatching for texture only,
NO solid fills, NO shading gradients, NO grey wash, NO colour. Background: flat,
clean, warm cream paper #FCFAF5, perfectly even, no paper texture, no vignette, no
border, no frame. Rural central-India setting (Madhya Pradesh / Gujarat tribal
villages): neem, mango, mahua and palash trees, khapra-tile roofs, mud-plaster walls,
zebu cattle. Calm, generous, airy composition with large areas of empty paper.
Editorial, award-winning studio illustration, crisp vector-like clarity, high detail
at the edges, empty at the centre. No text, no letters, no numbers, no signature,
no watermark, no people's faces in close-up.
```

**Negative prompt (if supported):**
`colour, colored, watercolor, gradient, shading, grey tones, 3d render, photo, realistic lighting, drop shadow, text, typography, logo, watermark, signature, frame, border, vignette, paper texture, cartoon, chibi, anime, clip-art, thick outlines, cluttered, busy centre`

**Output:** PNG, cream background (#FCFAF5), highest resolution available.

---

### 1. `select-corner` — "Find your village" (1:1, 2048×2048)
```
SCENE: A single oversized hand-drawn map-location pin, drawn as an outline, standing in
the TOP-RIGHT quadrant, its tip touching a tiny village vignette below it: three
khapra-roof huts, one large banyan tree with aerial roots, a winding dirt footpath
curving down-left and dissolving into a few dashed lines. Two small birds near the pin.
Everything sits in the upper-right 40% of the canvas; the remaining 60% (left and
bottom) is completely empty cream paper.
```

### 2. `soil-carbon` — "Carbon in your land" (4:5, 1600×2000)
```
SCENE: A botanical cross-section diagram. Top third: a young neem sapling and tufts
of grass on a gently curved ground line. Middle and bottom: a cut-away soil profile
showing branching fibrous roots, a few earthworms, small pebbles and decomposing
leaves drawn as outlines. Five small hand-drawn upward-curling arrows rising from the
roots toward the leaves suggest carbon being stored. Specimen-plate feel, like a
19th-century naturalist's notebook, centred, floating on empty paper with lots of
margin.
```

### 3. `pooling` — "Villages pooling together" (16:9, 2400×1350)
```
SCENE: Seen from a gentle bird's-eye angle: three small separate village clusters
(4–5 huts and a tree each) placed in a loose triangle, connected to a central round
community well / meeting platform by curved dashed footpaths. Faint field boundaries
like a patchwork quilt between them. Feels like a hand-drawn map from a field
researcher's notebook. Keep the outer 25% of the canvas empty.
```

### 4. `gram-sabha` — "The Gram Sabha decides" (21:9, 2800×1200)
```
SCENE: A village assembly under a huge spreading banyan tree on the RIGHT third: about
12 villagers seated on the ground in a loose semicircle, seen from behind and
three-quarter view, small in scale, men and women in saris, dhotis and turbans, one
elder in the centre holding up a single sheet of paper. A bicycle leaning on the tree,
a cow resting nearby. The left two-thirds stay almost completely empty (just a horizon
line and a few grass tufts) so text can sit on top.
```

### 5. `footer-strip` — "Horizon divider" (6:1, 3000×500)
```
SCENE: A very wide, low panoramic strip that reads as a horizon: a continuous ground
line with low shrubs, grass tufts, a fence, a bullock cart, a few palms and mango
trees, a small temple shikhara and a hand-pump, all short and hugging the BOTTOM edge.
The top 60% of the strip is empty paper. The left and right edges taper to just a
grass line so it can tile visually.
```

### 6. `empty-state` — "Nothing here yet" (1:1, 1600×1600)
```
SCENE: A single small charming vignette centred with huge margins: an empty wooden
charpai (rope cot) under a mango tree, a brass lota and a folded paper on it, a curious
goat looking at the paper. Gentle, a little humorous, quiet.
```

### 7. `money` — "Money to the village" (1:1, 1600×1600)
```
SCENE: A balance scale drawn as an outline, centred. On the left pan: a tiny stack of
coins and a leaf. On the right pan: a small bundle of paper contracts tied with string.
The scale is slightly uneven. Around its base: a few seedlings growing. Specimen-plate
composition, lots of empty paper around it.
```

### 8. Optional: `og-cover` — social share image (1.91:1, 1200×630)
```
SCENE: Same countryside as the hero but compressed: a mango tree framing the left
edge, rolling fields and two huts along the bottom, a sun top-right. The centre 60% is
empty for the title "VASUDHA CO₂", which will be added in code. Do NOT draw any text.
```

---

## Quality tips
- Generate 4 variations of each and pick the one with the **emptiest centre** and the **cleanest background**. Reject any with grey wash, colour casts or paper texture.
- If the background comes out slightly grey or yellow: it's fine, because the site uses `mix-blend-mode: multiply`. Pure, even cream is still best.
- Upscale 2× if the lines look soft. Thin lines must stay crisp at 50% display size.
- Drop the PNGs in `public/img/` using the file names above and tell Claude; it will convert them to WebP and wire them in.
