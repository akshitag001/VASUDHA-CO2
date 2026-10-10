# VASUDHA CO₂ — UI/UX Redesign Handoff

**Checkpoint 5 · 2026-10-10** · For the next agent / IDE.

> **Frontend only.** Do NOT change logic in `src/engine/`, `src/model/`, `src/state/`, `src/data/`, `src/config/`, `src/lib/`, or the meaning of any i18n string. Visual / interaction work only.

---

## 0. Start here (5-minute orientation)

1. **Fix git first** (see §8): `main`'s last commit contains merge-conflict markers. The working tree is already repaired. Commit it.
2. `npm install` (if needed), then `npm run dev`.
3. Read §2 (constraints) before writing any CSS.
4. Pick up work from §9 (to-do list), in order.
5. Before you finish, run the checks in §7, then update this file (bump the checkpoint number and move finished items from §9 into §5).

---

## 1. Design brief

"Creative-agency sketchbook on cream paper" (SayBriefly style reference).

| Role | Value |
|---|---|
| Canvas | Cream `#fcfaf5` (token `paper`), plus a faint paper-grain overlay on `body::before` |
| Text / structure / primary buttons | Forest Ink `#1a3300` (token `ink`); never pure black |
| Emphasis | Highlighter Yellow `#ffe95c`, used as a marker **wash behind words** (`.hl`), never as a main CTA fill on cream |
| Accents (one per row, never side by side) | mint `#d5f5c2`, blush `#f6d0ff`, teal `#a8e5e5`, peach `#ffdcc2`, pink `#ffd6e3` |
| Display font | Bricolage Grotesque 800, positive tracking, **≥ 40px only** (`.display`, `.display-xl/lg/md`, `h1`) |
| UI / body font | Inter (body 16–20px) |
| Labels / numbers | Roboto Mono (`.kicker`, `.figure`, `.chip`) |
| Radii | buttons 6px · cards 12–18px · pills 9999px |
| Depth | Borders and colour fills. Hard "sticker" shadow `6px 6px 0 #1a3300` only for hero objects (verdict stamp, specimen card, hover states) |
| Imagery | Hand-drawn forest-ink line art on transparent backgrounds (§4) |

---

## 2. Hard constraints (read before touching CSS)

1. **The PDF export uses html2canvas**, which can't parse `oklch()` / `color-mix()`. Use **hex or rgba only**. Tailwind's default palette is disabled (`--color-*: initial`), so never use opacity modifiers like `bg-ink/50`.
2. **Token names are kept from v1** (`paper`, `paper-2`, `card`, `ink`, `ink-2`, `ink-3`, `rule`, `indigo`, `turmeric`, `loss`, `gain`, `chart-*`). Only their values changed (`indigo` is now deep teal `#1d5c58`, `turmeric` is now highlighter yellow). Don't rename them: every page uses them. New tokens: `yellow mint blush teal peach pink terracotta pencil`.
3. **Provenance tags** (`.prov-dataset` filled / `.prov-assumption` dashed / `.prov-input` solid) must stay distinguishable by **shape + label**, not just colour.
4. **Reduced motion must keep working.** Every new animation needs an off switch in the `prefers-reduced-motion` blocks (`index.css` base layer and the bottom of `motion.css`). `[data-reveal]` is forced visible there.
5. **Never put text on top of an illustration.** The user explicitly complained about this. Illustrations get their own grid cell or band.
6. **Don't use `mix-blend-mode` to hide image backgrounds.** It silently breaks inside any transformed or animated wrapper and shows a pale box. Images are already transparent (§4).
7. The `.brief` node in `Brief.tsx` is what gets exported to PDF. Keep it inline-styled and free of motion. Anything decorative near it needs the `no-print` class.

---

## 3. File map (frontend)

| File | Role |
|---|---|
| `index.html` | Fonts (Bricolage, Inter, Roboto Mono, Plex Devanagari, Noto Gujarati), theme colour, OG/Twitter meta (`/img/og-cover.jpg`), hero image preload |
| `src/index.css` | Tokens (`@theme`), base styles, all components (`.btn`, `.sheet`, `.note-card`, `.seg`, `.ledger`, `.stamp`, callouts, `.toc`, reveal, marquee, preloader, nav pill, stat tiles). Imports `motion.css` |
| `src/motion.css` | Motion layer v2: hero depth layers, scroll text, dividers, pinned horizontal scroll, tilt, cursor, spin badge, footer, wavy `.section` rules, view transitions, reduced-motion and print overrides |
| `src/ui/motion.tsx` | All motion and brand components and hooks (§6) plus the `<Art>` image component and `preloadArt()` |
| `src/App.tsx` | Mounts `<Motion/>`: scroll var, reveal observer, progress bar, cursor, idle image preload. Spinner loading state |
| `src/pages/Landing.tsx` | Award-style landing page (§5) |
| `src/ui/Layout.tsx` | Dashboard shell: glass top bar, sidebar card with step progress, mobile drawer, page-enter animation, footer with horizon strip |
| `src/ui/bits.tsx` | `PageHeader` (step badge, display title, optional `art` / `artWide`), `Stat` (pastel-cap tile), `PageNav` (view-transition links) |
| `src/pages/Select.tsx` | Village picker: glass nav, parallax blobs, map-pin art, sticker search card, empty-state art |
| `scripts/inkify.py` | Image pipeline (§4) |
| `scripts/shoot.mjs` | Screenshot / QA tool (§7) |
| `IMAGE_PROMPTS.md` | Prompts used to generate the illustrations (style lock + scenes) |

---

## 4. Images

**Format:** every illustration in `public/img/*.webp` is **forest-ink strokes (`#1f3a08`) on a transparent background** (RGBA WebP, quality 70). All 8 together are about 677 KB.

**Pipeline:** `python scripts/inkify.py [names…]` (needs `pillow numpy`). It reads the user's source PNGs in `public/img/`, trims the blank margins, resizes, turns paper into transparency, recolours the ink and saves the WebP. **The source PNGs stay in `public/img/`; the user asked to keep them there** (note they get copied into `dist/`).

**Adding an image:**
1. The user generates it with `IMAGE_PROMPTS.md`; a white background is fine.
2. Add it to `JOBS` in `scripts/inkify.py` and run the script.
3. Add the printed size to `ART_SIZES` in `src/ui/motion.tsx`.
4. Render it with `<Art name="…" />`.

**Rendering:** use `<Art name className />`. It sets width/height, `loading="eager"`, `alt=""`, `aria-hidden`, `no-print` and the `BASE_URL` prefix.

**Loading:** `preloadArt()` fetches and decodes every image. On the landing page the preloader's 000→100 counter follows real image progress (at least 0.9 s, at most 3 s, plus a 3.5 s timer fallback). Every other entry point preloads on idle. The hero also has `<link rel=preload>` and `fetchPriority="high"`.

| File | Size | Used in |
|---|---|---|
| `hero-landscape.webp` (+ `-sm` 800w) | 1600×800 | Landing hero: its own band **below** the copy (`.hero-land`) |
| `select-corner.webp` | 560×685 | Select page corner (lg+) · Guide header · "How it works" panel 1 |
| `soil-carbon.webp` | 560×679 | Carbon header · panel 2 |
| `money.webp` | 560×566 | Money header · panel 3 |
| `gram-sabha.webp` | 1400×692 | Panel 4 (cropped right, `.gs-crop`) · Brief and About headers (wide banner) |
| `pooling.webp` | 1000×568 | Landing pooling section · Pooling header (wide banner) |
| `footer-strip.webp` | 1500×222 | Horizon on top of the landing footer and the dashboard footer |
| `empty-state.webp` | 480×467 | Select page "no results" |
| `og-cover.jpg` | 1200×630 | Social share preview (relative URL; make it absolute once the deploy domain is known) |

`PageHeader` accepts `art?: ArtName` (square art in a right column, md+) and `artWide?: boolean` (a banner under the lede).

---

## 5. Done so far

**Checkpoint 1 (system):** new tokens and fonts; full component restyle (buttons with a slide-fill hover and arrow nudge, pill segmented controls, custom range slider, rounded callouts, verdict as a tinted sticky-note stamp, `details` knobs, ledger hover rows, pill provenance tags); dashboard shell (glass bar, sidebar card, step progress, blurred drawer, page-enter); `PageHeader` / `Stat` / `PageNav` upgrades; Select page redesign; hard-coded hex in `charts.tsx`, `Brief.tsx` and `PoolMap.tsx` recoloured.

**Checkpoints 2–3 (art):** the user's illustrations added across the landing page, Select, Carbon, Money, Pooling, Brief, About and Guide, plus the footers; OG image.

**Checkpoint 4 (landing v2 + fixes):**
- **Fixed:** images loaded late (lazy loading plus a delayed fade) → real preloading; text overlapped the illustrations → every image has its own space; pale boxes around images → transparent ink-only images; `useReveal` could leave lazily loaded pages invisible → MutationObserver; nav wrapped onto two lines → no-wrap, a wider compact pill, and a mark-only logo under 400px.
- **Landing page sections, in order:** preloader → glass nav (compacts on scroll) → 3-depth parallax hero → scroll-inked statement → crossing marquee tapes → live ledger specimen (3D tilt) → drawn divider → **pinned horizontal "How it works"** (4 illustrated panels and a dark CTA panel) → divider → tilt demo cards → pooling section (art beside text) → divider → does / doesn't → horizon strip → mega footer (big CTA, 4 columns, back-to-top spin badge, VASUDHA outline that fills on scroll, language switch).
- **App-wide:** custom cursor and magnetic buttons, View Transitions page wipe, wavy hand-drawn `.section` rules.

**Checkpoint 5:** repaired the conflicted working tree (§8); saved the image pipeline as `scripts/inkify.py`; rewrote this handoff.

---

## 6. Motion toolkit — `src/ui/motion.tsx` (+ `src/motion.css`)

| Export | What it does |
|---|---|
| `useScrollVar()` | Writes `--sy` (scroll px) and `--p` (page progress) on `<html>` once per frame. Mounted once in `App` |
| `useReveal()` | Adds `.is-in` to `[data-reveal]` elements in view (variants `="left"`, `="scale"`; stagger with `style={{'--d':'120ms'}}`). MutationObserver-backed. Mounted once |
| `useProgress(mode)` | Writes `--prog` 0–1 on the ref'd element. `through` (enters bottom → leaves top), `enter` (enters → bottom reaches viewport bottom), `pin` (tall section with a sticky child) |
| `useScrolled(px)`, `useMedia(q)` | Small helpers |
| `<Parallax speed>` | translateY = `--sy × speed` |
| `<SplitWords text mark={[i]}>` | Words slide up one after another; marked words get the drawn highlighter. Needs an ancestor with `data-reveal` |
| `<ScrollText text>` | Words ink in as the paragraph scrolls past |
| `<Divider kind="wave\|loop\|stitch" emblem tone>` | Line that draws itself with scroll, with a spinning emblem |
| `<Tilt max>` | 3D pointer tilt with glare (mouse only) |
| `<Cursor/>` | Ink ring that becomes a yellow disc over interactive elements; magnetic pull on `[data-magnetic]` (uses the CSS `translate` property). Fine pointers only. Mounted once |
| `<SpinBadge text onClick?>` | Rotating circular-text sticker |
| `<Preloader/>` | Yellow curtain with a real-progress counter; once per session (`sessionStorage['vasudha.loaded']`). Adds `.preloading` to `<html>` so the hero holds its start pose until the curtain lifts |
| `<Art name>`, `preloadArt()`, `artUrl()` | Images (§4) |
| `<Sketch kind>`, `<Logo/>`, `<ScrollProgress/>` | Doodles, brand lockup, top progress bar |

**Page transitions:** add `viewTransition` to a `<Link>`/`<NavLink>`, or call `navigate(to, { viewTransition: true })`. Already wired: sidebar, `PageNav`, landing links, Select navigation.

**Hero mechanics:** `.hero` gets `--mx/--my` from `onPointerMove`. `.hero-blobs` follow the pointer and rise; `.hero-copy` rises and fades; `.hero-land` sinks, grows and drifts.

---

## 7. Checks and the QA tool

Must all pass before handing back:
```
npx tsc -b && npx vite build && npx vitest run && npx oxlint
```
At checkpoint 5: build ✓ · 30/30 tests ✓ · lint exit 0 (only `only-export-components` dev hot-reload warnings in `motion.tsx`; harmless).

**Screenshots** (`scripts/shoot.mjs`: headless Chrome over the DevTools protocol, Node 22+, no dependencies). It emulates real device sizes, skips the preloader and captures at scroll positions:
```
npx vite build && npx vite preview --port 4173      # in a second terminal
node scripts/shoot.mjs http://localhost:4173/ out 1440 900 0 "0,1100,50%,100%"
node scripts/shoot.mjs http://localhost:4173/ mob 375 812 1 "0,30%,100%"
```
Arguments: `url outPrefix width height mobile(0|1) scrollStops` (px or `%` of the scrollable height). It prints `docW`; **`docW` must equal `vw`** (no sideways scroll). Plain `chrome --screenshot` can't go narrower than about 500px and stalls the preloader, so don't trust it.

Verified at checkpoint 4/5: landing page at 1440×900 (8 stops), 375 and 360 mobile, Select at 1280, Guide at 1280.

---

## 8. ⚠️ Git state (action needed)

- Commit `e4f78e3` "Merge remote updates…" merged the unrelated remote history `0e2db22` (the **original pre-redesign UI**) and **committed unresolved conflict markers in 16 files**. `main` as committed does not build.
- **The working tree is repaired:** every conflict was resolved by keeping the `HEAD` side (the redesign). The remote side contained nothing else; engine, data and i18n are identical between the two.
- `stash@{0}` ("WIP on main: f30773b") held the last nav fixes; they were re-applied by hand.
- **Nothing was committed and the stash was not dropped.** To finish:
  ```
  git add -A && git commit -m "Resolve merge conflicts: keep redesigned UI"
  git stash drop            # after confirming the site looks right
  ```
- `scripts/` is new and untracked; include it in the commit.

---

## 9. To-do (in order)

### 9.1 QA the risky bits (do first)
- **Brief → "Download PDF"**: confirm the PDF still renders and looks right (html2canvas). If the `.page-enter` animation or a view transition interferes, disable the animation while exporting.
- **Print preview** (Ctrl+P) on `/brief`: grain, cursor, progress bar, dividers and preloader must be hidden (rules already exist in both `@media print` blocks).
- **हिं / ગુ:** Bricolage has no Devanagari/Gujarati glyphs, so display text falls back to Plex Devanagari / Noto Gujarati. Check the hero and footer don't overflow at 375px. If they do, add `:lang(hi) .display, :lang(gu) .display { letter-spacing: 0; line-height: 1.15; }` and shrink `.display-xl`.
- **Tablet (768–1024):** the pinned "How it works" section; check that the panel text and art fit at `height: min(62vh, 33rem)`.

### 9.2 Per-page polish (the 10 dashboard pages)
They already have the new tokens, wavy section rules, header art (where listed in §4) and page transitions. Apply to `Overview, Carbon, Methodology, Money, Offer, Pooling, Readiness, Guide, About, Assumptions, DataSources`:
- `data-reveal` on top-level `<section>`s, staggered with `--d`.
- Wrap a whole translated title in `<span className="hl">` where emphasis helps (never split a translated string).
- Headline numbers → `Stat` or `className="sheet stat"`.
- At most ONE pastel `note-card` per row.
- `Overview`: make the verdict stamp the hero of the page; a `Divider` between the stats and the next steps.
- `Money`: chart containers in `.sheet`; rounded bar ends (see 9.3).
- `Offer`: checklist rows rounded, with a `bg-turmeric-soft` hover; flag rows as sticky notes.
- `Pooling` / `PoolMap`: map container `rounded-[18px] overflow-hidden border border-ink`.
- `Readiness`: ticks → circular mint check badges (same as the landing specimen list).
- `Guide` / `About`: long-read width `max-w-[42rem]`.

### 9.3 Charts (`src/ui/charts.tsx`)
Rounded bar ends (`rx`), track `#ece5d3`, mid marker `#1a3300`, round legend swatches. Optional grow-in animation via `transform: scaleX` (not `width`).

### 9.4 Small assets
- `public/favicon.svg`: replace with the logo mark (copy the SVG from `Logo` in `motion.tsx`: 40×40, yellow `#ffe95c` rect rx 9, ink `#1a3300` strokes).
- `og:image`: make the URL absolute once the domain is known.

### 9.5 Wrap up
Run §7 checks and screenshots, update this file (new checkpoint, move done items to §5), and remind the user to commit.

---

## 10. User preferences (learned)
- Wants an "award-winning" feel: big cosy type, strong parallax, scroll-linked motion, illustrated dividers, playful but clean.
- Very sensitive to **slow image loading** and **text overlapping images**. Check both with screenshots before claiming done.
- Generates images themselves from prompts; keep prompts in `IMAGE_PROMPTS.md` (style lock + scene).
- Token-budget conscious: keep this file current so another agent can continue at any point.
