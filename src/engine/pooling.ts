// Pooling neighbouring Panchayats into one project.
//
// A pooled project pays validation, registration and verification ONCE.
// Monitoring grows with each added village by `extraVillageMonitoringShare`.
// Credits and households simply add up.

import type { FinanceInput, ScenarioSet } from './finance'
import { runScenarios } from './finance'
import { breakEvenCredits } from './breakeven'
import type { Range } from './types'
import { addRanges, mapRange } from './types'

export interface PoolMember {
  id: string
  mitigation: Range
  households: number
}

export type PoolBase = Omit<FinanceInput, 'mitigation' | 'households'>

export interface PoolResult {
  members: number
  mitigation: Range
  households: number
  pooled: ScenarioSet
  standalone: Record<string, ScenarioSet>
  pooledClearsBreakEven: boolean
  standaloneClearsBreakEven: Record<string, boolean>
}

export function pooledInput(members: PoolMember[], base: PoolBase, extraMonitoringShare: number): FinanceInput {
  const n = Math.max(1, members.length)
  const monitoringMultiplier = 1 + Math.max(0, extraMonitoringShare) * (n - 1)
  return {
    ...base,
    mitigation: addRanges(...members.map((m) => m.mitigation)),
    households: members.reduce((s, m) => s + Math.max(0, m.households), 0),
    costs: { ...base.costs, monitoringPerYear: mapRange(base.costs.monitoringPerYear, (x) => x * monitoringMultiplier) },
  }
}

const clears = (input: FinanceInput): boolean => {
  const need = breakEvenCredits(input, 'mid')
  if (need == null) return false
  return input.mitigation.mid * input.creditableFraction.mid >= need
}

export function poolFinance(members: PoolMember[], base: PoolBase, extraMonitoringShare: number): PoolResult {
  const pooled = pooledInput(members, base, extraMonitoringShare)
  const standalone: Record<string, ScenarioSet> = {}
  const standaloneClearsBreakEven: Record<string, boolean> = {}
  for (const m of members) {
    const solo: FinanceInput = { ...base, mitigation: m.mitigation, households: m.households }
    standalone[m.id] = runScenarios(solo)
    standaloneClearsBreakEven[m.id] = clears(solo)
  }
  return {
    members: members.length,
    mitigation: pooled.mitigation,
    households: pooled.households,
    pooled: runScenarios(pooled),
    standalone,
    pooledClearsBreakEven: clears(pooled),
    standaloneClearsBreakEven,
  }
}
