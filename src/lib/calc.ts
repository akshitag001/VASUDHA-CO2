// Pure calculation core. IPCC Tier 1 baseline + CCTS viability.
// Always returns low/mid/high — never a single confident number.

import {
  BIOMASS,
  CARBON_PRICE_INR,
  CONTRACT,
  LIVESTOCK,
  MRV_COSTS,
  SOIL,
  UNCERTAINTY,
} from './config'
import type { ResolvedVillage } from './resolveVillage'
import type { ActivityKey } from '../data/engine/activities'

export interface Triple {
  low: number
  mid: number
  high: number
}

export const band = (mid: number): Triple => ({
  low: mid * UNCERTAINTY.lowMult,
  mid,
  high: mid * UNCERTAINTY.highMult,
})

// ---- per-activity annual mitigation potential (tCO₂e / year) ----

// Agroforestry: only the *additional* plantable area counts (degraded + a portion of common land)
export function agroforestryPotential(v: ResolvedVillage): number {
  const additionalArea = v.landUseHa.degradedRestorable + v.landUseHa.commonAndForest * 0.25
  return additionalArea * BIOMASS.growthRate.mid * BIOMASS.carbonFraction * BIOMASS.co2ToC
}

export function manurePotential(v: ResolvedVillage): number {
  let kgCh4 = 0
  for (const [species, count] of Object.entries(v.livestock)) {
    const ef = LIVESTOCK.manureCh4[species] ?? 0
    kgCh4 += count * ef
  }
  return (kgCh4 * LIVESTOCK.gwpCh4 * LIVESTOCK.mitigationEfficiency.mid) / 1000
}

// Soil carbon: applied to cropland where regenerative practice is plausible (~40% adoption)
export function soilPotential(v: ResolvedVillage): number {
  const adoptedArea = v.landUseHa.agricultural * 0.4
  return adoptedArea * SOIL.annualSocDelta.mid * SOIL.co2ToC
}

// Pasture: SOC + minor woody regrowth on protected common grazing land
export function pasturePotential(v: ResolvedVillage): number {
  const protectedArea = v.landUseHa.commonAndForest * 0.35
  return protectedArea * SOIL.annualSocDelta.mid * 0.8 * SOIL.co2ToC
}

export function activityPotential(v: ResolvedVillage, key: ActivityKey): number {
  switch (key) {
    case 'agroforestry':
      return agroforestryPotential(v)
    case 'manure':
      return manurePotential(v)
    case 'soil':
      return soilPotential(v)
    case 'pasture':
      return pasturePotential(v)
  }
}

export interface Baseline {
  byActivity: { key: ActivityKey; value: number }[]
  total: Triple
}

export function estimateBaseline(v: ResolvedVillage): Baseline {
  const byActivity: { key: ActivityKey; value: number }[] = [
    { key: 'agroforestry', value: agroforestryPotential(v) },
    { key: 'manure', value: manurePotential(v) },
    { key: 'soil', value: soilPotential(v) },
    { key: 'pasture', value: pasturePotential(v) },
  ]
  const mid = byActivity.reduce((s, a) => s + a.value, 0)
  return { byActivity, total: band(mid) }
}

// ---- Viability ----

export type PriceKey = 'low' | 'mid' | 'high'

export interface ViabilityInput {
  households: number
  carbonMid: number
  priceKey: PriceKey
  margin: number
}

export interface Viability {
  price: number
  carbon: Triple
  gross: Triple
  fixedCostsPerYear: Triple
  aggregatorCut: Triple
  net: Triple
  netPerHousehold: Triple
  breakEvenTonnes: number
  verdict: 'viable' | 'marginal' | 'not'
  costItems: { key: string; perYear: number; source: string }[]
}

export function annualisedFixedCosts(scenario: 'low' | 'mid' | 'high') {
  const T = CONTRACT.defaultDurationYears
  const N = CONTRACT.verificationCycleYears
  const validation = MRV_COSTS.validation[scenario] / T
  const verification = MRV_COSTS.verificationPerCycle[scenario] / N
  const monitoring = MRV_COSTS.annualMonitoring[scenario]
  const registration = MRV_COSTS.registration[scenario] / T
  return {
    total: validation + verification + monitoring + registration,
    items: [
      { key: 'validation', perYear: validation, source: MRV_COSTS.validation.source },
      { key: 'verification', perYear: verification, source: MRV_COSTS.verificationPerCycle.source },
      { key: 'monitoring', perYear: monitoring, source: MRV_COSTS.annualMonitoring.source },
      { key: 'registration', perYear: registration, source: MRV_COSTS.registration.source },
    ],
  }
}

export function calcViability(input: ViabilityInput): Viability {
  const price = CARBON_PRICE_INR[input.priceKey]
  const carbon = band(input.carbonMid)

  const gross: Triple = {
    low: carbon.low * price,
    mid: carbon.mid * price,
    high: carbon.high * price,
  }

  const fcLow = annualisedFixedCosts('low')
  const fcMid = annualisedFixedCosts('mid')
  const fcHigh = annualisedFixedCosts('high')
  const fixedCostsPerYear: Triple = { low: fcLow.total, mid: fcMid.total, high: fcHigh.total }

  const aggregatorCut: Triple = {
    low: gross.low * input.margin,
    mid: gross.mid * input.margin,
    high: gross.high * input.margin,
  }

  const net: Triple = {
    low: gross.low - aggregatorCut.low - fixedCostsPerYear.high,
    mid: gross.mid - aggregatorCut.mid - fixedCostsPerYear.mid,
    high: gross.high - aggregatorCut.high - fixedCostsPerYear.low,
  }

  const netPerHousehold: Triple = {
    low: net.low / input.households,
    mid: net.mid / input.households,
    high: net.high / input.households,
  }

  const netPricePerCredit = price * (1 - input.margin)
  const breakEvenTonnes = netPricePerCredit > 0 ? fixedCostsPerYear.mid / netPricePerCredit : Infinity

  const verdict: Viability['verdict'] =
    net.mid > 0 && carbon.mid >= breakEvenTonnes
      ? 'viable'
      : net.mid > -fixedCostsPerYear.mid * 0.5
        ? 'marginal'
        : 'not'

  return {
    price,
    carbon,
    gross,
    fixedCostsPerYear,
    aggregatorCut,
    net,
    netPerHousehold,
    breakEvenTonnes,
    verdict,
    costItems: fcMid.items,
  }
}

// ---- Pooling ----

export interface Neighbour {
  name: string
  nameHi: string
  distanceKm: number
  households: number
  carbonMid: number
}

// Build plausible pooling neighbours for any resolved village (illustrative geometry).
export function poolingNeighbours(v: ResolvedVillage): Neighbour[] {
  const base = estimateBaseline(v).total.mid
  return [
    {
      name: `${v.name} — adjoining GP A`,
      nameHi: `${v.nameHi} — निकटवर्ती पंचायत क`,
      distanceKm: 5,
      households: Math.round(v.households * 0.55),
      carbonMid: base * 0.5,
    },
    {
      name: `${v.name} — adjoining GP B`,
      nameHi: `${v.nameHi} — निकटवर्ती पंचायत ख`,
      distanceKm: 9,
      households: Math.round(v.households * 0.8),
      carbonMid: base * 0.7,
    },
  ]
}

export function pooled(v: ResolvedVillage): { carbonMid: number; households: number } {
  const self = estimateBaseline(v).total.mid
  const ns = poolingNeighbours(v)
  return {
    carbonMid: self + ns.reduce((s, n) => s + n.carbonMid, 0),
    households: v.households + ns.reduce((s, n) => s + n.households, 0),
  }
}

// ---- formatting ----

export function inr(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} lakh`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}k`
  return `${sign}₹${Math.round(abs)}`
}

export function inrRange(t: Triple): string {
  return `${inr(t.low)} – ${inr(t.high)}`
}

export function tonnes(n: number): string {
  return Math.round(n).toLocaleString('en-IN')
}
