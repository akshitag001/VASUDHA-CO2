// Central assumptions. Ported from Vasudha-main/config.py.
// RULE: every financial and scientific constant lives here, never inline in a calculation.
// Each entry carries its source note so the UI can show the basis.

export interface Range {
  low: number
  mid: number
  high: number
  unit: string
  source: string
}

export const CARBON_PRICE_INR: Range = {
  low: 250,
  mid: 500,
  high: 850,
  unit: 'INR/tCO₂e',
  source: 'India voluntary / offset nature-based price range, 2025–2026 estimate (~$3.0–$10.2/tCO₂e).',
}

export const AGGREGATOR_MARGIN: Range = {
  low: 0.2,
  mid: 0.3,
  high: 0.4,
  unit: 'fraction of gross',
  source: 'Review of commercial developer contracts for rural community forestry / biogas (20%–40% gross revenue share).',
}

export const MRV_COSTS = {
  validation: {
    low: 300000, mid: 500000, high: 800000, unit: 'INR (one-time)',
    source: 'Third-party validation & Project Design Document (PDD) audit fee.',
  } as Range,
  verificationPerCycle: {
    low: 200000, mid: 400000, high: 600000, unit: 'INR per audit cycle',
    source: 'Periodic verification audit by an accredited agency (2- or 5-year cycle).',
  } as Range,
  annualMonitoring: {
    low: 50000, mid: 100000, high: 200000, unit: 'INR/year',
    source: 'Digital MRV satellite data feeds plus ground-truth sample auditing.',
  } as Range,
  registration: {
    low: 40000, mid: 60000, high: 100000, unit: 'INR (one-time)',
    source: 'National Carbon Registry (BEE / CCTS) listing fee schedule.',
  } as Range,
}

export const CONTRACT = {
  defaultDurationYears: 10,
  minDurationYears: 10,
  maxDurationYears: 15,
  verificationCycleYears: 2,
}

// Scientific — IPCC Tier 1 defaults (see config.py for full table citations)
export const BIOMASS = {
  growthRate: { low: 1.5, mid: 3.0, high: 4.5, unit: 't d.m./ha/yr',
    source: 'IPCC 2006 Tier 1 mean annual biomass increment, tropical dry/moist plantation & agroforestry.' } as Range,
  carbonFraction: 0.47,
  co2ToC: 44 / 12,
}

export const LIVESTOCK = {
  gwpCh4: 28,
  mitigationEfficiency: { low: 0.4, mid: 0.55, high: 0.7, unit: 'fraction',
    source: 'Avoided emissions via anaerobic digestion / improved manure management (40%–70%).' } as Range,
  // manure CH4 kg/head/yr — IPCC 2006 Vol 4 Ch 10 Tables 10.14 / 10.15 (Indian subcontinent, warm)
  manureCh4: {
    dairy_cattle: 4.0,
    indigenous_cattle: 2.5,
    buffalo: 4.5,
    goat: 0.22,
    sheep: 0.2,
  } as Record<string, number>,
}

export const SOIL = {
  annualSocDelta: { low: 0.3, mid: 0.5, high: 0.8, unit: 't C/ha/yr',
    source: 'Annual SOC enhancement under community conservation / contour bunding / pasture regeneration.' } as Range,
  co2ToC: 44 / 12,
}

export const UNCERTAINTY = {
  defaultPct: 0.25,
  lowMult: 0.75,
  highMult: 1.25,
}

export const CLUSTERING = {
  maxSearchRadiusKm: 25,
  maxClusterSize: 5,
  minOverlapMethodologies: 1,
}

export const DISCLAIMER =
  'Vasudha CO₂ provides advisory financial simulations based on open data. It is not an accredited verification agency and does not issue or trade carbon credits.'
