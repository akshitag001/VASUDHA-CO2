// Mitigation potential, IPCC Tier 1 style.
//
// Each activity is evaluated three times — with the low, central and high value
// of its uncertain parameters — so the range comes from the parameter ranges in
// config/assumptions.ts, not from a fixed ± band.
//
// "Mitigation potential" is NOT the same as credits. Credits = mitigation ×
// creditable fraction, and only for activities with an approved methodology.

import type { ActivityKey, ModelParams, Range, Scenario, VillageInputs } from './types'
import { ACTIVITY_KEYS, addRanges, mapRange } from './types'

export const CO2_PER_C = 44 / 12 // molecular weight ratio — a physical constant, not an assumption

const nonNeg = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0)

export function agroforestryArea(v: VillageInputs, p: ModelParams): number {
  return nonNeg(v.degradedHa) + nonNeg(v.commonLandHa) * p.agroCommonShare
}

export function agroforestryPerHa(p: ModelParams, s: Scenario): number {
  return p.biomassGrowth[s] * p.carbonFraction * CO2_PER_C
}

export function manurePerHead(p: ModelParams, species: keyof ModelParams['manureEf'], s: Scenario): number {
  return (p.manureEf[species] * p.gwpCh4 * p.manureEfficiency[s]) / 1000
}

export function activityMitigation(key: ActivityKey, v: VillageInputs, p: ModelParams, s: Scenario): number {
  switch (key) {
    case 'agroforestry':
      return agroforestryArea(v, p) * agroforestryPerHa(p, s)
    case 'manure': {
      const kgCh4 =
        nonNeg(v.dairyCattle) * p.manureEf.dairyCattle +
        nonNeg(v.indigenousCattle) * p.manureEf.indigenousCattle +
        nonNeg(v.buffalo) * p.manureEf.buffalo +
        nonNeg(v.goats) * p.manureEf.goats +
        nonNeg(v.sheep) * p.manureEf.sheep
      return (kgCh4 * p.gwpCh4 * p.manureEfficiency[s]) / 1000
    }
    case 'soil':
      return nonNeg(v.croplandHa) * p.croplandAdoption * p.socGain[s] * CO2_PER_C
    case 'pasture':
      return nonNeg(v.commonLandHa) * p.pastureShare * p.socGain[s] * p.pastureFactor * CO2_PER_C
  }
}

export type MitigationByActivity = Record<ActivityKey, Range>

export interface MitigationEstimate {
  byActivity: MitigationByActivity
  total: Range
}

export function estimateMitigation(v: VillageInputs, p: ModelParams): MitigationEstimate {
  const byActivity = Object.fromEntries(
    ACTIVITY_KEYS.map((k) => [
      k,
      {
        low: activityMitigation(k, v, p, 'low'),
        mid: activityMitigation(k, v, p, 'mid'),
        high: activityMitigation(k, v, p, 'high'),
      },
    ]),
  ) as MitigationByActivity
  return { byActivity, total: addRanges(...ACTIVITY_KEYS.map((k) => byActivity[k])) }
}

// Mitigation from a chosen set of activities (e.g. only those with an approved methodology).
export function mitigationFor(est: MitigationEstimate, activities: ActivityKey[]): Range {
  return addRanges(...activities.map((k) => est.byActivity[k]))
}

// Issuable credits: pessimistic mitigation × pessimistic fraction, and so on.
export function issuableCredits(mitigation: Range, fraction: Range): Range {
  return { low: mitigation.low * fraction.low, mid: mitigation.mid * fraction.mid, high: mitigation.high * fraction.high }
}

// Existing soil carbon stock in the top 30 cm (t C), converted to tCO₂e.
export function soilStockCO2e(v: VillageInputs): number {
  const area = nonNeg(v.croplandHa) + nonNeg(v.commonLandHa) + nonNeg(v.degradedHa) + nonNeg(v.plantationHa)
  return nonNeg(v.socTCHa) * area * CO2_PER_C
}

export { mapRange }
