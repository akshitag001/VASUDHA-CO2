// Financial model: what actually reaches the village.
//
//   credits          = eligible mitigation × creditable fraction
//   gross            = credits × price
//   aggregator cut   = gross × aggregator share
//   costs to village = annualised (validation + registration) + verification per year + monitoring
//                      × the village's share of costs (all / half / none)
//   net to village   = gross − aggregator cut − costs to village
//
// Three scenarios, always reported low → high:
//   low  = low mitigation, low creditable fraction, low price, HIGH costs
//   mid  = central values everywhere
//   high = high mitigation, high fraction, high price, LOW costs
//
// Nothing is floored at zero. A negative net means the project loses the
// village money at that scale.

import type { CostBearer, CostRanges, Range, Scenario } from './types'

export interface FinanceInput {
  mitigation: Range // eligible mitigation, tCO₂e per year
  creditableFraction: Range
  price: Range // ₹ per credit
  aggregatorShare: number // 0–1 of gross
  durationYears: number
  households: number
  costs: CostRanges
  costBearer: CostBearer
  sharedCostFraction: number
  upfrontPayment?: number // ₹, paid once at signing
  upfrontIsAdvance?: boolean // true = recovered from later payments, false = a grant
}

export interface CostBreakdown {
  validation: number
  registration: number
  verification: number
  monitoring: number
  total: number
}

export interface ScenarioResult {
  scenario: Scenario
  credits: number
  price: number
  gross: number
  aggregatorCut: number
  costs: CostBreakdown // full project costs per year
  costsToVillage: number // the part the village pays per year
  net: number // per year
  netPerHousehold: number // per year
  netOverContract: number // whole contract, including any upfront grant
}

export type ScenarioSet = Record<Scenario, ScenarioResult>

const clamp01 = (x: number) => Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0))

export function bearerFraction(bearer: CostBearer, sharedFraction: number): number {
  if (bearer === 'aggregator') return 0
  if (bearer === 'shared') return clamp01(sharedFraction)
  return 1
}

export function annualCosts(costs: CostRanges, level: Scenario, durationYears: number): CostBreakdown {
  const years = Math.max(1, durationYears)
  const cycle = Math.max(1, costs.verificationCycleYears)
  const validation = costs.validation[level] / years
  const registration = costs.registration[level] / years
  const verification = costs.verificationPerCycle[level] / cycle
  const monitoring = costs.monitoringPerYear[level]
  return { validation, registration, verification, monitoring, total: validation + registration + verification + monitoring }
}

// The point values a single scenario is computed from. Exposed so sensitivity
// analysis can move one input at a time.
export interface ScenarioPoint {
  mitigation: number
  fraction: number
  price: number
  costLevel: Scenario
  aggregatorShare: number
}

export function pointFor(input: FinanceInput, s: Scenario): ScenarioPoint {
  return {
    mitigation: input.mitigation[s],
    fraction: input.creditableFraction[s],
    price: input.price[s],
    costLevel: s === 'low' ? 'high' : s === 'high' ? 'low' : 'mid',
    aggregatorShare: input.aggregatorShare,
  }
}

export function computePoint(input: FinanceInput, pt: ScenarioPoint, scenario: Scenario = 'mid'): ScenarioResult {
  const credits = Math.max(0, pt.mitigation) * clamp01(pt.fraction)
  const price = Math.max(0, pt.price)
  const gross = credits * price
  const aggregatorCut = gross * clamp01(pt.aggregatorShare)
  const costs = annualCosts(input.costs, pt.costLevel, input.durationYears)
  const costsToVillage = costs.total * bearerFraction(input.costBearer, input.sharedCostFraction)
  const net = gross - aggregatorCut - costsToVillage
  const years = Math.max(1, input.durationYears)
  const upfront = Math.max(0, input.upfrontPayment ?? 0)
  const grant = input.upfrontIsAdvance ? 0 : upfront
  return {
    scenario,
    credits,
    price,
    gross,
    aggregatorCut,
    costs,
    costsToVillage,
    net,
    netPerHousehold: input.households > 0 ? net / input.households : 0,
    netOverContract: net * years + grant,
  }
}

export function runScenarios(input: FinanceInput): ScenarioSet {
  return {
    low: computePoint(input, pointFor(input, 'low'), 'low'),
    mid: computePoint(input, pointFor(input, 'mid'), 'mid'),
    high: computePoint(input, pointFor(input, 'high'), 'high'),
  }
}

// Collect one field from a scenario set as an ordered Range (low ≤ mid ≤ high).
export function pick(set: ScenarioSet, f: (r: ScenarioResult) => number): Range {
  const vals = [f(set.low), f(set.mid), f(set.high)].sort((a, b) => a - b)
  return { low: vals[0], mid: f(set.mid), high: vals[2] }
}
