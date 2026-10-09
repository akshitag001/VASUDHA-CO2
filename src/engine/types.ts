// Shared engine types. No React, no DOM — the engine is plain functions.

export type Scenario = 'low' | 'mid' | 'high'

export interface Range {
  low: number
  mid: number
  high: number
}

export type Provenance = 'dataset' | 'assumption' | 'input'

export type ActivityKey = 'agroforestry' | 'manure' | 'soil' | 'pasture'

export const ACTIVITY_KEYS: ActivityKey[] = ['agroforestry', 'manure', 'soil', 'pasture']

// The village numbers the model needs. Units: hectares, head, households, t C/ha.
export interface VillageInputs {
  households: number
  population: number
  croplandHa: number
  commonLandHa: number
  degradedHa: number
  plantationHa: number
  dairyCattle: number
  indigenousCattle: number
  buffalo: number
  goats: number
  sheep: number
  socTCHa: number
}

export type VillageField = keyof VillageInputs

export const VILLAGE_FIELDS: VillageField[] = [
  'households',
  'population',
  'croplandHa',
  'commonLandHa',
  'degradedHa',
  'plantationHa',
  'dairyCattle',
  'indigenousCattle',
  'buffalo',
  'goats',
  'sheep',
  'socTCHa',
]

// Scientific and adoption parameters (built from config/assumptions.ts).
export interface ModelParams {
  biomassGrowth: Range
  carbonFraction: number
  gwpCh4: number
  manureEfficiency: Range
  manureEf: {
    dairyCattle: number
    indigenousCattle: number
    buffalo: number
    goats: number
    sheep: number
  }
  socGain: Range
  agroCommonShare: number
  croplandAdoption: number
  pastureShare: number
  pastureFactor: number
}

export interface CostRanges {
  validation: Range
  verificationPerCycle: Range
  verificationCycleYears: number
  monitoringPerYear: Range
  registration: Range
}

export type CostBearer = 'community' | 'shared' | 'aggregator'

export const range = (low: number, mid: number, high: number): Range => ({ low, mid, high })

export const point = (v: number): Range => ({ low: v, mid: v, high: v })

export const mapRange = (r: Range, f: (x: number) => number): Range => ({
  low: f(r.low),
  mid: f(r.mid),
  high: f(r.high),
})

export const addRanges = (...rs: Range[]): Range =>
  rs.reduce((acc, r) => ({ low: acc.low + r.low, mid: acc.mid + r.mid, high: acc.high + r.high }), point(0))

// Ranges are always reported low-to-high, whatever order the arithmetic produced.
export const ordered = (r: Range): Range => {
  const [low, mid, high] = [r.low, r.mid, r.high].sort((x, y) => x - y)
  return { low, mid, high }
}
