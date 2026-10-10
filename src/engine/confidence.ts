// Data-confidence score: how much of the answer rests on real data vs assumptions.
//
// Three parts, each 0–100:
//   village data  – provenance of the village figures, weighted by how much each
//                   activity contributes to the central mitigation estimate
//   science       – confidence of the emission/growth factors each activity uses
//   money         – confidence of price, creditable fraction and cost assumptions
// Overall = 40% village + 30% science + 30% money.

import type { Confidence } from '../config/assumptions'
import type { ActivityKey, Provenance, Range, VillageField } from './types'
import { ACTIVITY_KEYS } from './types'

export const PROVENANCE_SCORE: Record<Provenance, number> = { dataset: 1, input: 0.7, assumption: 0.25 }
export const CONFIDENCE_SCORE: Record<Confidence, number> = { high: 1, medium: 0.6, low: 0.3 }
export const WEIGHTS = { village: 0.4, science: 0.3, money: 0.3 }

export const ACTIVITY_FIELDS: Record<ActivityKey, VillageField[]> = {
  agroforestry: ['degradedHa', 'commonLandHa'],
  manure: ['dairyCattle', 'indigenousCattle', 'buffalo', 'goats', 'sheep'],
  soil: ['croplandHa'],
  pasture: ['commonLandHa'],
}

export interface ConfidenceInput {
  provenance: Record<VillageField, Provenance>
  mitigation: Record<ActivityKey, Range>
  activityFactors: Record<ActivityKey, Confidence[]>
  moneyFactors: Confidence[]
}

export interface ConfidenceResult {
  overall: number
  level: Confidence
  village: number
  science: number
  money: number
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export function dataConfidence(c: ConfidenceInput): ConfidenceResult {
  const total = ACTIVITY_KEYS.reduce((s, k) => s + Math.max(0, c.mitigation[k].mid), 0)
  const weight = (k: ActivityKey) => (total > 0 ? Math.max(0, c.mitigation[k].mid) / total : 1 / ACTIVITY_KEYS.length)

  let village = 0
  let science = 0
  for (const k of ACTIVITY_KEYS) {
    village += weight(k) * mean(ACTIVITY_FIELDS[k].map((f) => PROVENANCE_SCORE[c.provenance[f]]))
    science += weight(k) * mean(c.activityFactors[k].map((x) => CONFIDENCE_SCORE[x]))
  }
  const money = mean(c.moneyFactors.map((x) => CONFIDENCE_SCORE[x]))

  const overall = WEIGHTS.village * village + WEIGHTS.science * science + WEIGHTS.money * money
  const pct = (x: number) => Math.round(x * 100)
  const o = pct(overall)
  return { overall: o, level: o >= 70 ? 'high' : o >= 40 ? 'medium' : 'low', village: pct(village), science: pct(science), money: pct(money) }
}
