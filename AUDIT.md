# VASUDHA CO2 — Phase 0 Audit

Audit date: 2026-10-09. Scope: every file under `src/`, plus `index.html`, `public/`, `package.json` and the config files. No source file was changed. `npm ci` was run only so lint and build could be checked.

Status labels used below:

- **REAL**: computed from data or user inputs through code you can trace.
- **PARTIAL**: some numbers are computed, but parts are hardcoded, inconsistent or ignored.
- **MOCK**: hardcoded or simulated content presented as if it were analysis.

---

## 0. Headline findings

1. **Revenue ignores the creditable fraction.** `lib/calc.ts › calcViability()` multiplies the *full* mitigation estimate by the price. The 75% creditable fraction is applied only to the "Potential CCCs" figure on screen (`lib/adapter.ts › computeViability()`). The Dashboard's "Show calculation" panel states the opposite ("Gross revenue: potential CCCs × carbon price"). Gross and net revenue are therefore overstated by about 33%, before any other error.
2. **The default "Medium" price is actually the engine's high price.** `data/demo.ts › defaultViabilityInputs` sets prices of ₹500 / 1,000 / 1,500. The engine (`lib/config.ts › CARBON_PRICE_INR`) uses ₹250 / 500 / 850. `computeViability()` reads only `carbonPrices[1]` (₹1,000), maps any value ≥ ₹850 to `'high'`, and so prices every headline at **₹850**. The Low and High inputs on the page are never used.
3. **Viability uses three cost models that disagree with each other** (details in §2):
   - The headline cards use annualised `MRV_COSTS` from config.
   - The break-even chart uses the slider costs, *not annualised*: ₹17 lakh/yr.
   - The "Aggregator economics" breakdown subtracts the aggregator share twice, and its rows don't add up to its total.

   For Jamgaon on the same page, the headline says net **+₹3.0 to +₹13.0 lakh/yr**, while the chart says break-even is **₹1,619/t**, which is above every price scenario in the app.
4. **The cost sliders do nothing to the headline.** Verification, monitoring, registration, "other" and project duration in `ViabilityInputs` are ignored by `calcViability()`. They only feed the break-even chart and the breakdown rows.
5. **Two contradictory methodology databases.**
   - `data/cctsMethodologies.ts` (BM codes) marks A/R `BM FR05.002` as **approved**. It drives the Dashboard, Methodology, Readiness and Decision pages.
   - `data/engine/methodologies.ts` (invented `CCTS-AF-001`-style codes) marks agroforestry as **pending** and soil carbon as **draft**. It drives only the Aggregation compatibility check.

   None of the statuses or codes has been verified. `Assumptions.tsx` even says the codes "are illustrative".
6. **The "measured" pilot data is not loaded from any dataset.** `data/engine/panchayatProfiles.ts` contains hand-typed values whose own header comment calls them "researched approximations … not exact village records". The LGD codes and coordinates in `data/engine/lgd.ts` are self-described as "illustrative LGD-style codes". The UI nevertheless labels these villages "measured" / "sourced", with 4/5 data confidence.
7. **No dataset file exists in the repo.** There is no CSV, JSON or GeoJSON. Every "dataset" value is a TypeScript literal. The live SoilGrids client (`lib/soilgrids.ts › fetchSoc`) is never called.
8. **The CCTS Readiness checklist is hardcoded.** Every item's complete/partial/missing status is a literal in `CCTSReadiness.tsx`; only one detail string is computed.
9. **Contract tools are mostly mock.** The contract comparison table on Viability is hardcoded (Aggregator A/B/Community). The "upload contract" panel shows a simulated document with canned findings. The Share button has no handler.
10. **Unsourced market claim.** The string `viab.interpretation3` says "Current Indian CCTS market conditions range from ₹500–1,500/tCO₂e" in all three languages. No CCTS offset trading price exists to source this, and it contradicts the config (₹250–850).
11. **The hero image is missing.** `Landing.tsx` loads `/hero-village.jpg`, but `public/` contains only `favicon.svg` and `icons.svg`, so the hero renders as an empty green box. The overlaid numbers you mention must be baked into an image file that isn't in this copy of the repo.
12. **Lint fails with 6 errors.** All are rules-of-hooks violations: `useMemo` called after `if (!panchayat) return null` in Viability, Dashboard and Aggregation. The build passes, but as a single 2.58 MB JS chunk (706 kB gzipped).

---

## 1. Page and feature status

| Page / feature | Status | What is real | What is not | Where |
|---|---|---|---|---|
| Landing | PARTIAL | Navigation, regulatory hierarchy text | Hero image missing; `ml-${indent*6}` dynamic Tailwind classes are never generated, so the indents don't render | `pages/Landing.tsx` |
| Panchayat selection | REAL (UI) | Dropdown and search over `lgd.ts`; "Regional estimate" banner | The underlying LGD codes and coordinates are illustrative, not from the real LGD | `pages/PanchayatSelection.tsx`, `data/villages.ts`, `data/engine/lgd.ts` |
| Village resolution | PARTIAL | Pilot villages (6) map to profiles | Non-pilot villages all get identical assumed size (population 1,800, 380 HH, 720 ha), presented as figures | `lib/resolveVillage.ts › fromRegionalDefault` |
| Overview (Dashboard) | PARTIAL | KPIs come from the engine | Inherits bugs 1–2; "Show calculation" text misdescribes the math; `conditionally_viable` is labelled "Viable"; header bar hardcodes "Last updated: Demo data"; readiness badge uses BM matcher | `pages/Dashboard.tsx` |
| Decision score (0–10 bars) | PARTIAL | Computed | Thresholds (`/120`, `/100`, `/50000`, `×3`) are arbitrary, uncited, inline constants | `lib/adapter.ts › computeDecisionScore` |
| Carbon Estimator (Baseline) | PARTIAL | Per-activity mitigation (IPCC-style) | "Baseline stock" = SOC (t C/ha) × area × 0.9/1.1, labelled **tCO₂e** but it's **t C** (missing ×44/12); SOC is shown as "14.8 t SOC" (it's t C/ha); "MGNREGA work days" always shows 0 | `pages/Baseline.tsx`, `lib/adapter.ts › toLegacyPanchayat` |
| Mitigation engine | REAL (formulas) | `agroforestryPotential`, `manurePotential`, `soilPotential`, `pasturePotential` | Adoption shares (25% of common land, 40% of cropland, 35% pasture, 0.8 factor) are inline magic numbers, not in config; the ±25% band is a fixed multiplier, not derived from parameter ranges | `lib/calc.ts` |
| Methodology Match | PARTIAL | Rule checks against village numbers | Codes and statuses unverified; contradicts the engine rule set; always appends a "generic agroforestry" card; rice pathway always "more info" | `pages/Methodology.tsx`, `data/cctsMethodologies.ts › matchMethodologies` |
| Financial Viability | PARTIAL | Headline net comes from `calcViability` | See §2: three cost models, ignored inputs, double-subtraction, mock comparison table | `pages/Viability.tsx` |
| Neighbouring Panchayats | PARTIAL | Haversine distances over `lgd.ts` coordinates; pooled carbon and households are summed and run through the engine | Non-pilot neighbours all carry identical regional-default numbers; carbon ranges are formatted with `formatRange`, so tonnes display as **₹** ("₹1.5K – ₹2.5K tCO₂e/yr"); "mid-case" banner shows the low–high range; compatibility is `ownMethodologies.length > 0` for every neighbour; "shared monitoring" is hardcoded false; neighbours can't be toggled from the map | `pages/Aggregation.tsx`, `lib/neighbours.ts` |
| Map | REAL | Real coordinates (illustrative values), radius ring, pins | Map initialises only once; if the first village has no coordinates it never appears; no click-to-select; popup HTML is built by string concatenation | `components/Map/MapView.tsx` |
| CCTS Readiness | MOCK | Activity count | Every status is a literal; overall verdict is just "≥2 BM matches" | `pages/CCTSReadiness.tsx` |
| Decision Brief | PARTIAL | Numbers come from the engine; real html2canvas → jsPDF export | Status line always says "Potential match" even with zero matches; verdict colour always amber; pooled result not shown; no QR/link; Share button is dead; the brief is the whole card (not A4-constrained); `@media print` only hides `.no-print`, so there's no print layout | `pages/DecisionPack.tsx`, `lib/exportPdf.ts`, `index.css` |
| Contract transparency checklist | REAL (simple) | Weighted score from 18 user ticks | Questions only; doesn't evaluate actual offer terms | `utils/calculations.ts › calculateContractTransparency`, `data/demo.ts › contractQuestions` |
| Contract upload | MOCK | n/a | Canned "detected terms" text (`contract.docWarn1` etc.) | `pages/DecisionPack.tsx` |
| Contract comparison table | MOCK | Column A uses the slider margin | All other cells are literals | `pages/Viability.tsx` |
| Assumptions | REAL | Renders `lib/config.ts` live | Omits creditable fraction, adoption shares, regional defaults and decision-score thresholds; claims "Nothing on this page is hardcoded elsewhere", which is false (see §4) | `pages/Assumptions.tsx` |
| Data Sources | MOCK | n/a | Static list with invented "last updated" dates and confidence levels; doesn't say which sources are loaded (none are); ACVA directory has specific validity dates that are unverified; source URLs are listed without links; `eepINDIA.gov.in` looks wrong | `pages/DataSources.tsx`, `data/demo.ts › dataSources`, `data/regulatorySnapshot.ts` |
| User Manual / About | Static text | n/a | About claims "PostgreSQL/PostGIS compatible architecture" and "real APIs can later replace mock data"; Data Sources text claims "No data is fabricated — all inputs come from publicly available sources" and "satellite imagery" | `data/translations.ts` |
| Language toggle | PARTIAL | en / hi / gu dictionaries (635 / 627 / 628 keys) | Many strings hardcoded in English in TSX (Assumptions, Aggregation banners, Viability warnings, MobileNav, Selection page, Dashboard "Show calculation"); language isn't persisted | `data/translations.ts`, pages |
| Women's lens | Exists but unused | `labourNote` / `labourNoteHi` per activity | `data/engine/activities.ts › activityGuides` is never imported | `data/engine/activities.ts` |

---

## 2. Where each Financial Viability number comes from

Worked values are Jamgaon with default inputs. I recomputed them with a standalone script that mirrors the engine.

| Number on page | Source | Value | Problem |
|---|---|---|---|
| Mitigation potential | `calc.ts › estimateBaseline` → `band()` ±25% | 1,500 – 2,500 tCO₂e/yr (mid 2,000) | Band is a fixed ±25%, not derived from the parameter ranges in config |
| **Creditable fraction 75%** | `data/demo.ts › defaultViabilityInputs.creditableFraction` (fallback `?? 0.75` in `adapter.ts`) | 75% | **No source anywhere.** Not in config. Slider range 50–100%. Used only for the CCC display, **not for revenue** |
| Potential CCCs | `adapter.ts › computeViability` | 1,125 – 1,875 /yr | Display only |
| **Carbon price scenarios** | Engine: `config.ts › CARBON_PRICE_INR` ₹250 / 500 / 850, source "India voluntary / offset nature-based price range, 2025–2026 estimate". Page inputs: `demo.ts` ₹500 / 1,000 / 1,500 | Headline uses ₹850 | Two price sets. Only `carbonPrices[1]` is read and snapped to a key. Config source has no citation or URL |
| Gross revenue | full mitigation × ₹850 | ₹12.7 – 21.2 lakh/yr | Should be credits × price |
| **Aggregator share 30%** | Slider default `demo.ts › aggregatorMarginPercent: 30`. Config `AGGREGATOR_MARGIN` 20 / 30 / 40%, source "Review of commercial developer contracts … (20%–40%)" | 30% of gross | Source isn't a citable document. Applied to gross *before* costs (a modelling choice to make explicit) |
| **Verification / MRV cost (headline)** | `config.ts › MRV_COSTS`: validation ₹3/5/8 lakh one-time ÷ 10 yr; verification ₹2/4/6 lakh per cycle ÷ 2 yr; monitoring ₹0.5/1/2 lakh/yr; registration ₹0.4/0.6/1 lakh ÷ 10 yr | ₹1.84 / 3.56 / 5.90 lakh/yr | Sources are descriptions, not citations ("National Carbon Registry (BEE / CCTS) listing fee schedule": no such schedule is cited). Amortisation always uses 10 yr, ignoring the duration slider |
| **Verification / MRV cost (breakdown rows and chart)** | `demo.ts` sliders: verification ₹8 lakh, monitoring ₹4 lakh, registration ₹3 lakh, other ₹2 lakh | Rows: ₹4.8 lakh + ₹2.3 lakh/yr. Chart: ₹17 lakh/yr (not annualised) | A different cost model from the headline |
| Net revenue (headline) | gross × 0.7 − fixed costs, pairing low-carbon with high-cost | **₹3.0 – 13.0 lakh/yr** | Inherits the price and creditable-fraction errors. At the engine's own mid price (₹500), with 75% creditable, mid net is ~**₹1.7 lakh/yr**, about 5× lower than the ₹8.3 lakh mid currently implied |
| Net per household | net ÷ 512 | ₹591 – 2,546 /HH/yr | Same |
| Total costs card | `adapter.ts`: fixed costs + aggregator cut | ₹9.7 – 8.2 lakh | **Range reads high-to-low** (low bound > high bound) |
| "Community share" (breakdown) | midGross − aggregatorShare − avg(totalCosts) | ₹2.9 lakh | Subtracts the aggregator share **twice** (totalCosts already includes it). Displayed rows (17.0 − 5.1 − 4.8 − 2.3) don't sum to it |
| Break-even chart / price | `Viability.tsx` local formula | ~₹1,619/t | Contradicts the positive headline on the same page |
| Break-even tonnes (red warning) | `calc.ts`: fixed mid ÷ (price × (1 − margin)) | ~598 t at ₹850 | In tCO₂e of *mitigation*, not credits; no area or herd break-even |
| Contract comparison table | Literals in `Viability.tsx` | n/a | MOCK |

---

## 3. Datasets: loaded vs listed

**Actually loaded at runtime:** none. There are no data files in the repo. The app runs entirely on TypeScript literals:

| Content | File | Honest description |
|---|---|---|
| 6 pilot village profiles (Jamgaon, Kuknamal, Bichhiya Rural, Sukhsar, Chosala, Zalod Rural) | `data/engine/panchayatProfiles.ts` | Hand-entered approximations with source/vintage strings attached. Not traceable to a specific downloaded table |
| LGD hierarchy (~40 GPs) | `data/engine/lgd.ts` | "Illustrative LGD-style codes", approximate coordinates |
| Regional defaults (3 regions) | `data/engine/panchayatProfiles.ts › regionalDefaults` | Assumptions labelled as "regional mean", no file behind them |
| IPCC factors, prices, costs | `lib/config.ts` | Assumptions with descriptive (not citable) sources |
| Methodologies (two sets) | `data/cctsMethodologies.ts`, `data/engine/methodologies.ts` | Unverified |
| ACVA directory | `data/regulatorySnapshot.ts › acvaDirectory` | Unverified agency names and validity dates |

**Listed on the Data Sources page but not loaded:** MGNREGA, eGramSwaraj/GPDP, LGD, Sentinel-2, Livestock Census, SoilGrids, BEE methodologies, BEE ACVA directory. All 8 are listed; none is loaded. eGramSwaraj and Sentinel-2 aren't even used as a nominal source for any number. SoilGrids has client code that is never called.

**Live network calls:** OpenStreetMap raster tiles (map) and Google Fonts. Nothing else.

---

## 4. Bugs, inconsistencies and dead code

### Correctness bugs
- **B1** Revenue on full mitigation, not credits (`calc.ts › calcViability`).
- **B2** Price-scenario mismatch and snapping (`adapter.ts › computeViability` lines 99–101; `demo.ts`).
- **B3** Cost sliders and duration ignored by the headline (`calc.ts › annualisedFixedCosts` hardcodes `CONTRACT.defaultDurationYears`).
- **B4** Aggregator share double-subtracted in the breakdown (`Viability.tsx` line 58).
- **B5** Break-even chart uses non-annualised slider costs (`Viability.tsx` lines 34–51).
- **B6** "Total costs" range is inverted (`adapter.ts` line 118).
- **B7** Baseline stock is t C but labelled tCO₂e; SOC density is shown as "t SOC" (`adapter.ts` line 75, `Baseline.tsx`).
- **B8** Tonnes formatted as rupees on Aggregation (`formatRange` → `formatCurrency`).
- **B9** Decision Brief status is always "Potential match"; `conditionally_viable` displays as "Viable" (Dashboard, DecisionPack).
- **B10** Rules-of-hooks violations (6 lint errors) can crash or misrender when `panchayat` flips from null to set.
- **B11** `localStorage` persists a stale `PanchayatData` snapshot. After a code change, reloads keep the old numbers until "clear". `lang` is declared in `PersistedState` but never saved.
- **B12** Map never initialises if the first render has no coordinates (`MapView.tsx` effect with `[]` deps and a conditional container).
- **B13** Dynamic Tailwind classes `ml-${…}` aren't generated (Landing, About).
- **B14** `toggleNeighbour` matches by display name, not LGD code.
- **B15** `matchMethodologiesFor` reconstructs a fake profile (degraded = 30% of common land, dairy = 30% of cattle) instead of using the resolved village. These numbers differ from the real profile's.

### Inconsistencies
- Two methodology databases with conflicting statuses (see §0.5).
- Two disclaimer texts (`config.ts › DISCLAIMER` vs `translations › disclaimer`).
- `regulatorySnapshot.methodologyVersion 'v2.1'` and "July 2026" vs `METHODOLOGY_LIST_UPDATED '2026-08'`.
- The `CLUSTERING.minOverlapMethodologies` rule is shown on Assumptions but never enforced.
- Header always shows "Demo data", even for non-demo villages.
- About and Data Sources copy claims things the code doesn't do (§1).

### Dead code (never imported or called)
- `lib/soilgrids.ts › fetchSoc`
- `lib/calc.ts › poolingNeighbours`, `pooled`, `inr`, `inrRange`, `tonnes`
- `data/engine/activities.ts › activityGuides` (useful: holds the women's-labour notes)
- `data/demo.ts › neighbouringPanchayats`, `methodologies`, `contractChecklist`, `stateData`. `demoPanchayat` is used only as an unreachable fallback.
- `data/villages.ts › villageStates`; `lib/adapter.ts › AGGREGATOR_MARGIN_DEFAULT`
- Types `ReadinessCheckItem`, `ContractChecklistItem`, `Methodology` (legacy), `DataSource` (used only by the static list)
- `README.md` is the unmodified Vite template.

---

## 5. Build and lint baseline

| Check | Result |
|---|---|
| `npm run lint` (oxlint) | **6 errors** (rules-of-hooks: `Viability.tsx` ×3, `Dashboard.tsx` ×1, `Aggregation.tsx` ×2), 13 warnings (unused imports, exhaustive-deps, component defined during render) |
| `npm run build` (tsc + vite) | **Passes.** One JS chunk of 2,583 kB (706 kB gzipped): MapLibre, Recharts, jsPDF and html2canvas are all in the first load |
| Tests | None. No test runner installed |

---

## 6. Decisions needed from you before Phase 1

1. **Pilot village data.** The six profiles aren't backed by data files. Options:
   - (a) Keep them, but relabel them from "Dataset / measured" to "Assumption: illustrative profile" until real extracts are added.
   - (b) You supply real extracts (Census 2011 PCA, 20th Livestock Census district table, etc.) and I add them as CSV/JSON under `public/data/` with a loader.

   Under your hard rules, (a) is the minimum.
2. **LGD codes.** These are self-described as illustrative. Should I keep them (labelled), or do you have a real LGD extract for Mandla and Dahod?
3. **Methodology source of truth.** I plan to merge both files into `src/data/methodologies.json` and mark **every** status `VERIFY` until you confirm. Which code scheme should be canonical: the BM codes or the engine codes?
4. **Hero image.** It isn't in the repo. Should I remove the slot, or will you add the image so I can label it "Illustrative"?
5. **Features to remove or replace** (you asked to be consulted):
   - The hardcoded contract comparison table on Viability. I propose replacing it with the "Check this offer" page from Phase 2.
   - The simulated "upload contract" panel. I propose removing it.
   - The static CCTS Readiness statuses. I propose deriving them from inputs, or showing them explicitly as a user-filled checklist.

   Please confirm each.
6. **Default price scenario.** In Phase 1, should the headline lead with the *low* scenario (consistent with "lowest case first") and show mid and high alongside?

---

## 7. Resolution status (after Phases 1–7, 2026-10-09)

| Finding | Status |
|---|---|
| B1 revenue on full mitigation | Fixed. Credits = eligible mitigation × creditable fraction (`engine/finance.ts`); tested |
| B2 price mismatch / snapping | Fixed. One price range in `config/assumptions.ts`; all three scenarios used |
| B3 sliders ignored, fixed 10-yr amortisation | Fixed. Duration, cost bearer, share, fraction and prices all feed the engine |
| B4 / B5 double-subtraction, second cost model | Fixed. One cost model; ledger rows add up to the total |
| B6 inverted ranges | Fixed. `pick()` and the formatters always order low → high |
| B7 t C labelled tCO₂e | Fixed. Soil stock × 44/12; SOC shown as t C/ha |
| B8 tonnes formatted as ₹ | Fixed |
| B9 hardcoded "Potential match" / wrong verdict label | Fixed. Verdicts derived from engine output |
| B10 rules-of-hooks (6 lint errors) | Fixed. Lint: 0 errors |
| B11 stale persisted numbers | Fixed. Only inputs are persisted (key `vasudha_co2_v2`); results are recomputed |
| B12 map init | Fixed. New lazy-loaded map, markers are keyboard-focusable buttons |
| B15 fake methodology profile | Fixed. Matcher uses the real village inputs |
| Two methodology databases | Merged into `data/methodologies.json`; every status marked VERIFY |
| Readiness statuses hardcoded | Replaced by 5 computed checks plus a user checklist |
| Mock contract table / simulated upload | Replaced by the "Check this offer" page |
| Data Sources page mock | Now states loaded / live / planned, with year, licence and link |
| Unsourced "₹500–1,500 market" claim, "no data is fabricated" copy | Removed |
| Fake "sample panchayat" entries for other states | Removed. "My village is not listed" lets users enter their own figures |
| ACVA validity dates (unverified) | Dates removed; names kept and marked VERIFY |
| Hero image (missing file) | Slot removed; the landing page shows a live computed example instead |
| Bundle 2.58 MB in one chunk | Pages and the map are code-split; Hindi/Gujarati load on demand (~100 kB gzipped first load) |
