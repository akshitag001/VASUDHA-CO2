// Honest methodology matching.
//
// A pathway is only called ELIGIBLE when its recorded status is 'approved' AND
// every screening condition is met. Proposed or not-yet-notified pathways whose
// conditions are met are reported separately as "possible in future".

import type { ActivityKey, VillageInputs } from './types'

export type MethodologyStatus = 'approved' | 'proposed' | 'not_yet_notified'
export type Localized = { en: string; hi: string; gu: string }

export type Metric =
  | 'cattleBuffalo'
  | 'totalLivestock'
  | 'commonPlusDegradedHa'
  | 'degradedHa'
  | 'croplandHa'
  | 'commonLandHa'
  | 'socTCHa'
  | 'households'

export interface Condition {
  metric: Metric
  op: '>=' | '>' | '<' | '<='
  value: number
  label: Localized
  basis: string
}

export interface MethodologyEntry {
  id: string
  code: string
  activity: ActivityKey | null
  name: Localized
  status: MethodologyStatus
  statusVerified: boolean
  lastVerified: string | null
  sourceUrl: string
  note?: string
  needs?: Localized
  conditions: Condition[]
}

export type MatchCategory =
  | 'eligible' // approved + all conditions met
  | 'future' // not approved yet, conditions met
  | 'unmet' // at least one condition not met
  | 'needs_info' // the tool has no data to screen this pathway

export interface MatchResult {
  entry: MethodologyEntry
  category: MatchCategory
  conditions: { condition: Condition; actual: number; met: boolean }[]
}

export function metricValue(v: VillageInputs, m: Metric): number {
  switch (m) {
    case 'cattleBuffalo':
      return v.dairyCattle + v.indigenousCattle + v.buffalo
    case 'totalLivestock':
      return v.dairyCattle + v.indigenousCattle + v.buffalo + v.goats + v.sheep
    case 'commonPlusDegradedHa':
      return v.commonLandHa + v.degradedHa
    case 'degradedHa':
      return v.degradedHa
    case 'croplandHa':
      return v.croplandHa
    case 'commonLandHa':
      return v.commonLandHa
    case 'socTCHa':
      return v.socTCHa
    case 'households':
      return v.households
  }
}

const test = (actual: number, op: Condition['op'], value: number) =>
  op === '>=' ? actual >= value : op === '>' ? actual > value : op === '<' ? actual < value : actual <= value

export function matchMethodologies(v: VillageInputs, entries: MethodologyEntry[]): MatchResult[] {
  return entries.map((entry) => {
    if (entry.activity == null || entry.conditions.length === 0) {
      return { entry, category: 'needs_info' as const, conditions: [] }
    }
    const conditions = entry.conditions.map((c) => {
      const actual = metricValue(v, c.metric)
      return { condition: c, actual, met: test(actual, c.op, c.value) }
    })
    const allMet = conditions.every((c) => c.met)
    const category: MatchCategory = !allMet ? 'unmet' : entry.status === 'approved' ? 'eligible' : 'future'
    return { entry, category, conditions }
  })
}

// Activities whose credits could be issued today (eligible) and, optionally,
// those possible in future.
export function creditableActivities(matches: MatchResult[], includeFuture: boolean): ActivityKey[] {
  const keys = new Set<ActivityKey>()
  for (const m of matches) {
    if (!m.entry.activity) continue
    if (m.category === 'eligible' || (includeFuture && m.category === 'future')) keys.add(m.entry.activity)
  }
  return [...keys]
}
