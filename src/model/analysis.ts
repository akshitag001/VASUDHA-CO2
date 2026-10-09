// Composes the engine into one analysis for a village + user settings. No React.

import { ASSUMPTIONS as A, type Confidence } from '../config/assumptions'
import methodologyData from '../data/methodologies.json'
import type { ActivityKey, CostBearer, Range, VillageInputs } from '../engine/types'
import {
  breakEvenScale,
  creditableActivities,
  dataConfidence,
  evaluateOffer,
  defaultCosts,
  defaultModelParams,
  estimateMitigation,
  matchMethodologies,
  mitigationFor,
  overallVerdict,
  runScenarios,
  sensitivity,
  soilStockCO2e,
  toRange,
  type BreakEvenScale,
  type ConfidenceResult,
  type FinanceInput,
  type MatchResult,
  type MethodologyEntry,
  type MitigationEstimate,
  type Offer,
  type OfferResult,
  type OverallVerdict,
  type ScenarioSet,
  type SensitivityResult,
} from '../engine'
import { provenanceOf, toInputs, type VillageProfile } from './village'

export const METHODOLOGIES = methodologyData.entries as MethodologyEntry[]
export const METHODOLOGY_NOTE = methodologyData.listNote

export interface Settings {
  price: Range // ₹ per credit
  creditableFraction: number // central value; low/high from config spread around it
  aggregatorShare: number // fraction of gross
  durationYears: number
  costBearer: CostBearer
  includeFuture: boolean // count pathways not yet approved
}

export const DEFAULT_SETTINGS: Settings = {
  price: toRange(A.carbonPrice),
  creditableFraction: A.creditableFraction.value,
  aggregatorShare: A.aggregatorShare.value,
  durationYears: A.contractYears.value,
  costBearer: 'community',
  includeFuture: false,
}

// Which settings differ from the config defaults (shown as "User input").
export function changedSettings(s: Settings): Record<keyof Settings, boolean> {
  const d = DEFAULT_SETTINGS
  return {
    price: s.price.low !== d.price.low || s.price.mid !== d.price.mid || s.price.high !== d.price.high,
    creditableFraction: s.creditableFraction !== d.creditableFraction,
    aggregatorShare: s.aggregatorShare !== d.aggregatorShare,
    durationYears: s.durationYears !== d.durationYears,
    costBearer: s.costBearer !== d.costBearer,
    includeFuture: s.includeFuture !== d.includeFuture,
  }
}

export function fractionRange(central: number): Range {
  const lo = A.creditableFraction.value - A.creditableFraction.low
  const hi = A.creditableFraction.high - A.creditableFraction.value
  return { low: Math.max(0, central - lo), mid: central, high: Math.min(1, central + hi) }
}

const ACTIVITY_FACTORS: Record<ActivityKey, Confidence[]> = {
  agroforestry: [A.biomassGrowth.confidence, A.carbonFraction.confidence, A.agroCommonShare.confidence],
  manure: [A.efIndigenousCattle.confidence, A.manureEfficiency.confidence, A.gwpCh4.confidence],
  soil: [A.socGain.confidence, A.croplandAdoption.confidence],
  pasture: [A.socGain.confidence, A.pastureShare.confidence, A.pastureFactor.confidence],
}

const MONEY_FACTORS: Confidence[] = [
  A.carbonPrice.confidence,
  A.creditableFraction.confidence,
  A.validationCost.confidence,
  A.verificationCost.confidence,
  A.monitoringCost.confidence,
  A.registrationCost.confidence,
]

export interface Analysis {
  inputs: VillageInputs
  mitigation: MitigationEstimate
  matches: MatchResult[]
  activities: ActivityKey[] // activities whose mitigation is counted towards credits
  eligibleCount: number
  futureCount: number
  creditMitigation: Range
  finance: FinanceInput
  scenarios: ScenarioSet
  breakEven: BreakEvenScale
  sensitivity: SensitivityResult
  confidence: ConfidenceResult
  verdict: OverallVerdict
  soilStock: number
}

export function financeInputFor(mitigation: Range, households: number, s: Settings): FinanceInput {
  return {
    mitigation,
    creditableFraction: fractionRange(s.creditableFraction),
    price: s.price,
    aggregatorShare: s.aggregatorShare,
    durationYears: s.durationYears,
    households,
    costs: defaultCosts(),
    costBearer: s.costBearer,
    sharedCostFraction: A.sharedCostFraction.value,
  }
}

export function analyse(village: VillageProfile, s: Settings): Analysis {
  const p = defaultModelParams()
  const inputs = toInputs(village)
  const mitigation = estimateMitigation(inputs, p)
  const matches = matchMethodologies(inputs, METHODOLOGIES)
  const activities = creditableActivities(matches, s.includeFuture)
  const creditMitigation = mitigationFor(mitigation, activities)
  const finance = financeInputFor(creditMitigation, inputs.households, s)
  const scenarios = runScenarios(finance)
  const eligibleCount = matches.filter((m) => m.category === 'eligible').length
  return {
    inputs,
    mitigation,
    matches,
    activities,
    eligibleCount,
    futureCount: matches.filter((m) => m.category === 'future').length,
    creditMitigation,
    finance,
    scenarios,
    breakEven: breakEvenScale(finance, p),
    sensitivity: sensitivity(finance),
    confidence: dataConfidence({
      provenance: provenanceOf(village),
      mitigation: mitigation.byActivity,
      activityFactors: ACTIVITY_FACTORS,
      moneyFactors: MONEY_FACTORS,
    }),
    verdict: overallVerdict(s.includeFuture ? activities.length : eligibleCount, scenarios),
    soilStock: soilStockCO2e(inputs),
  }
}

export const OFFER_BENCH = {
  communityShareTypical: A.benchCommunityShareTypical.value,
  communityShareFavourable: A.benchCommunityShareFavourable.value,
  maxYearsWithoutExit: A.benchMaxYearsWithoutExit.value,
  longContractYears: A.benchLongContractYears.value,
}

export function offerResult(a: Analysis, offer: Offer): OfferResult {
  const f = a.finance
  return evaluateOffer(
    offer,
    {
      mitigation: f.mitigation,
      creditableFraction: f.creditableFraction,
      price: f.price,
      households: f.households,
      costs: f.costs,
      sharedCostFraction: f.sharedCostFraction,
    },
    OFFER_BENCH,
  )
}
