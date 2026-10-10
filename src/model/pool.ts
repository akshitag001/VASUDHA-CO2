// Pooling analysis across real model objects. No React.

import { ASSUMPTIONS as A } from '../config/assumptions'
import {
  breakEvenCredits,
  creditableActivities,
  defaultModelParams,
  estimateMitigation,
  matchMethodologies,
  mitigationFor,
  pooledInput,
  runScenarios,
  type ScenarioSet,
  type VillageInputs,
} from '../engine'
import { VILLAGE_FIELDS } from '../engine/types'
import { analyse, financeInputFor, METHODOLOGIES, type Settings } from './analysis'
import { toInputs, type VillageProfile } from './village'

export interface PoolRow {
  id: string
  name: string
  kind: VillageProfile['kind']
  households: number
  alone: ScenarioSet
  aloneClears: boolean
}

export interface PoolAnalysis {
  rows: PoolRow[]
  pooled: ScenarioSet
  pooledClears: boolean
  households: number
  activities: string[]
}

function sumInputs(list: VillageInputs[]): VillageInputs {
  const out = Object.fromEntries(VILLAGE_FIELDS.map((f) => [f, 0])) as unknown as VillageInputs
  for (const v of list) for (const f of VILLAGE_FIELDS) out[f] += v[f]
  // soil carbon is a density, so average it rather than add it
  out.socTCHa = list.length ? list.reduce((s, v) => s + v.socTCHa, 0) / list.length : 0
  return out
}

export function poolAnalysis(members: VillageProfile[], s: Settings): PoolAnalysis {
  const p = defaultModelParams()
  const inputs = members.map(toInputs)
  // Eligibility is screened on the pooled totals: pooling can meet thresholds
  // (e.g. herd size) that no single village meets.
  const activities = creditableActivities(matchMethodologies(sumInputs(inputs), METHODOLOGIES), s.includeFuture)

  const rows: PoolRow[] = members.map((m) => {
    const a = analyse(m, s)
    const need = breakEvenCredits(a.finance, 'mid')
    return {
      id: m.id,
      name: m.name,
      kind: m.kind,
      households: a.inputs.households,
      alone: a.scenarios,
      aloneClears: need != null && a.scenarios.mid.credits >= need,
    }
  })

  const base = financeInputFor({ low: 0, mid: 0, high: 0 }, 0, s)
  const { mitigation: _m, households: _h, ...rest } = base
  const poolMembers = inputs.map((v, i) => ({
    id: members[i].id,
    mitigation: mitigationFor(estimateMitigation(v, p), activities),
    households: v.households,
  }))
  const pooled = pooledInput(poolMembers, rest, A.extraVillageMonitoringShare.value)
  const scen = runScenarios(pooled)
  const need = breakEvenCredits(pooled, 'mid')
  return {
    rows,
    pooled: scen,
    pooledClears: need != null && scen.mid.credits >= need,
    households: pooled.households,
    activities,
  }
}
