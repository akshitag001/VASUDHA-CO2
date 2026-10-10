// Break-even: the smallest scale at which net income to the village turns positive.

import type { FinanceInput } from './finance'
import { annualCosts, bearerFraction } from './finance'
import { agroforestryPerHa, manurePerHead } from './carbon'
import type { ModelParams, Scenario } from './types'

// Credits per year needed for net = 0 in a scenario. Returns null when no
// amount of credits can break even (price × (1 − share) ≤ 0 and costs > 0).
export function breakEvenCredits(input: FinanceInput, s: Scenario = 'mid'): number | null {
  const costLevel: Scenario = s === 'low' ? 'high' : s === 'high' ? 'low' : 'mid'
  const costs =
    annualCosts(input.costs, costLevel, input.durationYears).total * bearerFraction(input.costBearer, input.sharedCostFraction)
  const netPerCredit = input.price[s] * (1 - Math.min(1, Math.max(0, input.aggregatorShare)))
  if (costs <= 0) return 0
  if (netPerCredit <= 0) return null
  return costs / netPerCredit
}

export interface BreakEvenScale {
  creditsNeeded: number | null
  mitigationNeeded: number | null // tCO₂e/yr of eligible mitigation
  currentMitigation: number
  scaleFactor: number | null // needed ÷ current (≤ 1 means already above break-even)
  clears: boolean
  // Same requirement expressed as land or animals, if it came from one activity alone
  agroforestryHaNeeded: number | null
  cattleNeeded: number | null
}

export function breakEvenScale(input: FinanceInput, p: ModelParams, s: Scenario = 'mid'): BreakEvenScale {
  const creditsNeeded = breakEvenCredits(input, s)
  const fraction = input.creditableFraction[s]
  const mitigationNeeded = creditsNeeded == null || fraction <= 0 ? null : creditsNeeded / fraction
  const current = input.mitigation[s]
  const perHa = agroforestryPerHa(p, s)
  const perHead = manurePerHead(p, 'indigenousCattle', s)
  return {
    creditsNeeded,
    mitigationNeeded,
    currentMitigation: current,
    scaleFactor: mitigationNeeded == null ? null : current > 0 ? mitigationNeeded / current : Infinity,
    clears: mitigationNeeded != null && current >= mitigationNeeded,
    agroforestryHaNeeded: mitigationNeeded == null || perHa <= 0 ? null : mitigationNeeded / perHa,
    cattleNeeded: mitigationNeeded == null || perHead <= 0 ? null : mitigationNeeded / perHead,
  }
}
