// Plain, explainable overall verdict for the village (no opaque scores).

import type { ScenarioSet } from './finance'

export type OverallVerdict =
  | 'no_pathway' // no approved, eligible methodology
  | 'not_alone' // central case loses money
  | 'depends' // central case positive, pessimistic case negative
  | 'worth_exploring' // positive even in the pessimistic case

export function overallVerdict(eligibleCount: number, s: ScenarioSet): OverallVerdict {
  if (eligibleCount === 0) return 'no_pathway'
  if (s.mid.net <= 0) return 'not_alone'
  if (s.low.net < 0) return 'depends'
  return 'worth_exploring'
}
