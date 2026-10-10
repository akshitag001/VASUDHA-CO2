# VASUDHA CO₂ — UI/UX Redesign Handoff (Checkpoint 3)

> For the next agent / IDE. **Frontend only.** Do NOT touch `src/engine/`, `src/model/`, `src/state/`, `src/data/`, `src/config/`, `src/lib/` logic, or i18n strings' meaning. Visual changes only.

Design brief: "creative-agency sketchbook on cream paper" (SayBriefly style reference) — cream canvas `#fcfaf5`, Forest Ink `#1a3300` for text/CTAs, Highlighter Yellow `#ffe95c` as marker wash, sticky-note pastels (mint `#d5f5c2`, blush `#f6d0ff`, teal `#a8e5e5`, peach `#ffdcc2`, pink `#ffd6e3`) as one-off accents. Bricolage Grotesque 800 (display ≥ 40px only), Inter (UI/body), Roboto Mono (kickers/numbers). Buttons 6px radius, cards 12–18px, pills 9999px. Flat: borders + colour fills, hard offset "sticker" shadows (`6px 6px 0 #1a3300`) only for hero objects.

---

## ⚠️ Hard constraints (read first)

1. **PDF export uses html2canvas** → it cannot parse `oklch()` / `color-mix()`. Use **only hex or rgba**. Tailwind's default palette is disabled (`--color-*: initial`); never use opacity modifiers like `bg-ink/50`.
2. **Token names are kept from v1** (`paper`, `ink`, `ink-2`, `ink-3`, `rule`, `indigo`, `turmeric`, `loss`, `gain`, …) — only their values changed. `indigo` is now a deep teal, `turmeric` is now highlighter yellow. Don't rename them: every page depends on them.
3. **Provenance tags** (`.prov-dataset` filled / `.prov-assumption` dashed / `.prov-input` solid) must stay distinguishable by **shape + label**, not just colour.
4. `prefers-reduced-motion` must keep working: `[data-reveal]` is forced visible in that mode (see `index.css` base layer). Any new animation must degrade the same way.
5. Verify with: `npx tsc -b && npx vite build && npx vitest run` (all green at this checkpoint: 30/30 tests).

---

## ✅ DONE in checkpoint 1

| File | What changed |
|---|---|
| `index.html` | Google Fonts → Bricolage Grotesque, Inter, Roboto Mono (+ Plex Devanagari, Noto Gujarati for hi/gu). theme-color `#fcfaf5`. |
| `src/index.css` | **Full token + component rewrite.** New: `.display`, `.display-xl/lg/md`, `.hl` (+`.hl-mint`, `.hl-blush`, `.hl-draw` animated marker), `.badge`, `.chip`, `.note-card` + `.bg-yellow/mint/blush/teal/peach/pink`, `.glass`, `.btn-lg`, `.btn-pastel`, `.btn .arr` (arrow nudge), slide-fill button hover, pill `.seg`, custom range slider, focus rings, rounded callouts, verdict `.stamp` as tinted sticky note, `details.working` with rotating +/− knob, dashboard `.toc` pill states, `[data-reveal]` scroll reveal, `.split-word` headline reveal, `.blob`, `.marquee`, `.float`, `.spin-slow`, `.scroll-progress`, `.preloader`, `.nav-pill`/`.nav-link`, `.page-enter`, `.drawer-in`, `.stat` pastel cap tiles, paper-grain overlay on `body::before`. Print rules hide all motion chrome. |
| `src/ui/motion.tsx` (**new**) | `useScrollVar()` (writes `--sy` scroll px and `--p` progress to `<html>`), `useReveal()` (IntersectionObserver → `.is-in`, re-scans on route change), `useScrolled()`, `<ScrollProgress/>`, `<Parallax speed>` (translateY = `--sy × speed`), `<SplitWords text mark=[i]>`, `<Preloader/>` (yellow 000→100 counter, once per session via sessionStorage, adds `.preloading` to `<html>` so hero reveals wait 1.5s), `<Sketch kind="leaf|swirl|sun|arrow|stars">` monoline doodles, `<Logo/>`. |
| `src/App.tsx` | Mounts `<Motion/>` (scroll var + reveal + progress bar) inside the router. Spinner loading state. |
| `src/pages/Landing.tsx` | Full redesign: preloader, floating glass pill nav that compacts on scroll, giant split-word hero with yellow-marked last word, 3-layer parallax blobs + doodles, floating sticky notes (xl+), tilted yellow marquee, live ledger specimen on a rotated teal card, sticky-note demo cards, does/doesn't cards, step tiles with pastel circle hover-grow, dark rounded footer with outlined giant "VASUDHA" wordmark. |
| `src/ui/Layout.tsx` (dashboard shell) | Sticky glass top bar, logo lockup, live-village dot, pill lang switch (now styled via `aria-pressed`, no inline colours), sidebar as rounded card with step progress bar + yellow "how to read" sticky note, blurred mobile drawer with slide-in, route `page-enter` animation, dark rounded footer. |
| `src/ui/bits.tsx` | `PageHeader` → step badge + Bricolage display title. `Stat` → `.stat` tile with rotating pastel cap (pink for losses), mono kicker label. `PageNav` next button is `btn-lg` with arrow nudge. |
| `src/pages/Select.tsx` | Glass nav, parallax blobs, display heading, search in a sticker-shadow card, yellow hover results, mint sticky-note "not listed" card, pastel demo buttons. |
| Hard-coded hex in `charts.tsx`, `Brief.tsx`, `PoolMap.tsx` | Remapped to the new palette (ink `#1a3300`, chart-down `#cb5521`, chart-up `#1d5c58`, etc.). |

---

## 🔜 REMAINING TASKS (do in this order)

### 1. Visual QA pass (most important)
`npm run dev`, then check at 375px, 768px, 1280px, 1600px:
- `/` landing: preloader → hero words slide in → marquee → reveals. Clear sessionStorage key `vasudha.loaded` to re-see preloader.
- Every dashboard page via a demo ("See a demo analysis").
- Switch to हिं and ગુ: Bricolage has no Devanagari/Gujarati glyphs → falls back to Plex Devanagari / Noto Gujarati. Check `.display-xl` doesn't overflow; if it does, add `:lang(hi) .display, :lang(gu) .display { letter-spacing: 0; line-height: 1.15; }`.
- **/brief → "Download PDF"**: confirm the PDF still renders (html2canvas). If the `.page-enter` animation interferes, add `.brief` ancestors exclusion or `animation: none` while exporting.
- Print preview (Ctrl+P) on /brief: grain, progress bar, preloader must be hidden (already in `@media print`).

### 2. Per-page polish (pages already inherit new tokens; these add delight)
Pattern to apply to each of `Carbon, Methodology, Money, Offer, Pooling, Readiness, Guide, About, Assumptions, DataSources`:
- Add `data-reveal` to top-level `<section>`s (and `style={{'--d': '120ms'}}` for staggering siblings). Import nothing — the global `useReveal()` handles it.
- Wrap 1–2 key words of section titles in `<span className="hl">…</span>` **only where text is not translated mid-word** (safe: wrap the whole `t(...)` result).
- Replace plain `sheet` used for headline numbers with `Stat` or add `className="sheet stat"`.
- Use `note-card bg-mint|bg-blush|bg-teal` for at most ONE highlighted card per row (style rule: never two pastels side by side).
- `Money.tsx`: the sensitivity/tornado chart sits in `charts.tsx` — give the chart container `className="sheet"` and make bar `rx` rounded (`<rect rx="1">`).
- `Offer.tsx`: question checklist → each item as a rounded row with hover `bg-turmeric-soft`.
- `Pooling.tsx` / `PoolMap.tsx`: map container `rounded-[18px] overflow-hidden border border-ink`; marker CSS already recoloured.
- `Readiness.tsx`: checklist ticks → circular mint check badges like Landing's specimen list.
- `Guide.tsx` / `About.tsx`: long-read pages → constrain to `max-w-[42rem]`, add a `display-md` hero and a `Sketch` doodle at 0.2 opacity in the header corner.

### 3. Charts (`src/ui/charts.tsx`)
- Rounded bar ends (`rx`), track colour `#ece5d3`, mid marker `#1a3300`. Legend swatches → `borderRadius: 9999`.
- Optional: animate bar width on mount with a CSS transition on `width` (SVG rect width is not CSS-animatable in all browsers — use `transform: scaleX` with `transform-origin`).

### 4. Assets
- Replace `public/favicon.svg` with the leaf-in-yellow-square mark (copy the SVG from `Logo` in `motion.tsx`, 40×40, yellow `#ffe95c` rect rx 9, ink `#1a3300` strokes).
- If the user supplies images (see prompts below), put them in `public/img/` and use them as **low-opacity atmosphere**, not content (style rule: illustration = texture). Suggested slots: landing hero background behind blobs (opacity 0.25, `mix-blend-mode: multiply`), Select page header corner, Guide header.

### 5. Final check
`npx tsc -b && npx vite build && npx vitest run && npx oxlint` — all must pass.

---

## 🖼️ Images (checkpoint 3: all wired in)

Source PNGs supplied by the user (`public/img/1_…png` … `8_…png`, plus `Pastoral Countryside Sketch Border.png`) were auto-trimmed, resized and converted to WebP. **The source PNGs (~17 MB) still sit in `public/` and get copied into `dist/`.** Move them to a non-public folder (e.g. `design/source-art/`) once the user OKs it.

All images are green ink on white/cream paper. They're rendered with `.art` (`mix-blend-mode: multiply`), which makes the paper disappear, so **never remove their backgrounds**. Use the `<Art name="…" />` component (`src/ui/motion.tsx`). It sets width/height, lazy loading, `alt=""`, `aria-hidden`, `no-print` and the BASE_URL prefix. Add new images to the `ART_SIZES` map.

| File (public/img) | Size | Used in |
|---|---|---|
| `hero-landscape.webp` (+`-sm`) | 1774×887 | Landing hero, bottom-anchored parallax layer (`.hero-art`), preloaded in `index.html` |
| `select-corner.webp` | 640×783 | Select page top-right (lg+, parallax); Guide page header (side art) |
| `soil-carbon.webp` | 640×775 | Carbon page header (side art) |
| `money.webp` | 640×647 | Money page header (side art) |
| `pooling.webp` | 1100×625 | Pooling page header (wide banner) |
| `gram-sabha.webp` | 1600×791 | Landing "How it works" closing scene with the CTA overlaid on the empty left side; Brief + About page headers (wide banner) |
| `footer-strip.webp` | 1600×236 | Horizon line sitting on top of the Landing footer and the dashboard footer |
| `empty-state.webp` | 560×545 | Select page "no search results" state |
| `og-cover.jpg` | 1200×630 | `og:image` / Twitter card meta in `index.html` (relative URL; make it absolute once the deploy domain is known) |

`PageHeader` now takes `art?: ArtName` and `artWide?: boolean`. Square art sits in a right column (md+, hidden on mobile). Wide art becomes a banner under the lede. Both use the `.art-pop` entrance.

### Image QA still to do
- Landing "How it works": the CTA overlay sits at `md:left-[4%] md:top-[28%]` over the empty left part of `gram-sabha`. Check at 768/1024/1440 that it doesn't overlap the seated villagers.
- Dashboard footer strip: check that its width lines up with the dark footer at every breakpoint.
- Brief page: confirm the PDF export still contains only the `.brief` node (header art is outside it and has `no-print`).
- Prompts for any future images live in `IMAGE_PROMPTS.md` (style lock + scene format).
