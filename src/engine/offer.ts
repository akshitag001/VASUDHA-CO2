// "Check this offer": evaluates an aggregator's terms against indicative
// benchmarks from config/assumptions.ts. Indicative only — not legal advice.

import type { FinanceInput, ScenarioSet } from './finance'
import { runScenarios } from './finance'
import type { CostBearer, Range } from './types'

export type ExitTerms = 'none' | 'penalty' | 'notice'
export type Pricing = 'fixed' | 'floating' | 'floating_floor'
export type Ownership = 'community' | 'joint' | 'aggregator' | 'unclear'
export type PaymentTiming = 'annual' | 'on_issuance' | 'unclear'

export interface Offer {
  communitySharePct: number // % of gross revenue paid to the village
  contractYears: number
  upfrontPayment: number // ₹
  upfrontIsAdvance: boolean
  mrvPaidBy: CostBearer
  exit: ExitTerms
  pricing: Pricing
  fixedPrice: number // used when pricing = 'fixed'
  floorPrice: number // used when pricing = 'floating_floor'
  ownership: Ownership
  paymentTiming: PaymentTiming
}

export interface OfferBenchmarks {
  communityShareTypical: number // fraction
  communityShareFavourable: number
  maxYearsWithoutExit: number
  longContractYears: number
}

export type OfferContext = Omit<FinanceInput, 'aggregatorShare' | 'durationYears' | 'costBearer' | 'upfrontPayment' | 'upfrontIsAdvance'>

export type Verdict = 'below' | 'reasonable' | 'favourable'

export interface Finding {
  id: string // i18n key suffix
  effect: -2 | -1 | 1 | 2
  params?: Record<string, string | number>
}

export interface RedFlag {
  id: string
  severity: 'high' | 'medium'
  params?: Record<string, string | number>
}

export interface OfferResult {
  scenarios: ScenarioSet
  priceUsed: Range
  verdict: Verdict
  score: number
  findings: Finding[]
  redFlags: RedFlag[]
  questions: string[] // i18n key suffixes, most important first
}

export function offerPrice(offer: Offer, market: Range): Range {
  if (offer.pricing === 'fixed') {
    const p = Math.max(0, offer.fixedPrice)
    return { low: p, mid: p, high: p }
  }
  if (offer.pricing === 'floating_floor') {
    const f = Math.max(0, offer.floorPrice)
    return { low: Math.max(market.low, f), mid: Math.max(market.mid, f), high: Math.max(market.high, f) }
  }
  return market
}

export function evaluateOffer(offer: Offer, ctx: OfferContext, bench: OfferBenchmarks): OfferResult {
  const share = Math.min(100, Math.max(0, offer.communitySharePct)) / 100
  const priceUsed = offerPrice(offer, ctx.price)
  const input: FinanceInput = {
    ...ctx,
    price: priceUsed,
    aggregatorShare: 1 - share,
    durationYears: Math.max(1, offer.contractYears),
    costBearer: offer.mrvPaidBy,
    upfrontPayment: offer.upfrontPayment,
    upfrontIsAdvance: offer.upfrontIsAdvance,
  }
  const scenarios = runScenarios(input)

  const findings: Finding[] = []
  const redFlags: RedFlag[] = []
  const pct = (x: number) => Math.round(x * 100)

  // Revenue share
  if (share < bench.communityShareTypical) {
    findings.push({ id: 'shareLow', effect: -2, params: { share: pct(share), typical: pct(bench.communityShareTypical) } })
    redFlags.push({ id: 'shareLow', severity: 'high', params: { share: pct(share), typical: pct(bench.communityShareTypical) } })
  } else if (share >= bench.communityShareFavourable) {
    findings.push({ id: 'shareHigh', effect: 2, params: { share: pct(share) } })
  } else {
    findings.push({ id: 'shareTypical', effect: 1, params: { share: pct(share) } })
  }

  // Who pays MRV
  if (offer.mrvPaidBy === 'community') {
    findings.push({ id: 'mrvCommunity', effect: -1 })
    redFlags.push({ id: 'mrvCommunity', severity: 'high' })
  } else if (offer.mrvPaidBy === 'aggregator') {
    findings.push({ id: 'mrvAggregator', effect: 1 })
  }

  // Length and exit
  if (offer.exit === 'none' && offer.contractYears > bench.maxYearsWithoutExit) {
    findings.push({ id: 'lockIn', effect: -2, params: { years: offer.contractYears } })
    redFlags.push({ id: 'lockIn', severity: 'high', params: { years: offer.contractYears, max: bench.maxYearsWithoutExit } })
  } else if (offer.exit === 'none') {
    findings.push({ id: 'noExit', effect: -1 })
    redFlags.push({ id: 'noExit', severity: 'medium' })
  } else if (offer.exit === 'notice') {
    findings.push({ id: 'exitNotice', effect: 1 })
  }
  if (offer.contractYears > bench.longContractYears) {
    redFlags.push({ id: 'veryLong', severity: 'medium', params: { years: offer.contractYears } })
  }

  // Pricing
  if (offer.pricing === 'floating') {
    findings.push({ id: 'noFloor', effect: -1 })
    redFlags.push({ id: 'noFloor', severity: 'medium' })
  } else if (offer.pricing === 'floating_floor') {
    findings.push({ id: 'hasFloor', effect: 1, params: { floor: Math.round(offer.floorPrice) } })
  } else if (offer.fixedPrice < ctx.price.low) {
    findings.push({ id: 'fixedBelow', effect: -2, params: { price: Math.round(offer.fixedPrice), low: Math.round(ctx.price.low) } })
    redFlags.push({ id: 'fixedBelow', severity: 'high', params: { price: Math.round(offer.fixedPrice), low: Math.round(ctx.price.low) } })
  } else if (offer.fixedPrice < ctx.price.mid) {
    findings.push({ id: 'fixedUnderMid', effect: -1, params: { price: Math.round(offer.fixedPrice) } })
  } else {
    findings.push({ id: 'fixedOk', effect: 1, params: { price: Math.round(offer.fixedPrice) } })
  }

  // Ownership
  if (offer.ownership === 'aggregator') {
    findings.push({ id: 'ownAggregator', effect: -1 })
    redFlags.push({ id: 'ownAggregator', severity: 'high' })
  } else if (offer.ownership === 'unclear') {
    findings.push({ id: 'ownUnclear', effect: -1 })
    redFlags.push({ id: 'ownUnclear', severity: 'medium' })
  } else if (offer.ownership === 'community') {
    findings.push({ id: 'ownCommunity', effect: 1 })
  }

  // Payment timing
  if (offer.paymentTiming === 'unclear') redFlags.push({ id: 'paymentUnclear', severity: 'medium' })
  if (offer.paymentTiming === 'on_issuance') redFlags.push({ id: 'paymentLate', severity: 'medium' })

  // Upfront money
  if (offer.upfrontPayment > 0 && !offer.upfrontIsAdvance) {
    findings.push({ id: 'upfrontGrant', effect: 1, params: { amount: Math.round(offer.upfrontPayment) } })
  }
  if (offer.upfrontPayment > 0 && offer.upfrontIsAdvance) {
    const lowTotal = scenarios.low.netOverContract
    if (lowTotal < offer.upfrontPayment) {
      redFlags.push({ id: 'advanceRisk', severity: 'high', params: { amount: Math.round(offer.upfrontPayment) } })
    }
  }

  // Money outcome
  if (scenarios.mid.netOverContract <= 0) {
    findings.push({ id: 'midNegative', effect: -2 })
    redFlags.push({ id: 'midNegative', severity: 'high' })
  } else if (scenarios.low.netOverContract < 0) {
    redFlags.push({ id: 'lowNegative', severity: 'medium' })
  }

  const score = findings.reduce((s, f) => s + f.effect, 0)
  let verdict: Verdict = score <= -2 ? 'below' : score >= 3 ? 'favourable' : 'reasonable'
  if (scenarios.mid.netOverContract <= 0 || redFlags.some((f) => f.id === 'shareLow' || f.id === 'fixedBelow')) verdict = 'below'

  const questions = [
    'qOwnership',
    'qShareOfWhat',
    'qMrvCosts',
    'qShortfall',
    'qExit',
    'qPaymentSchedule',
    'qMethodology',
    'qLandUse',
    'qConsent',
    'qDisputes',
  ]
  // Bring the questions raised by red flags to the top.
  const flagToQuestion: Record<string, string> = {
    shareLow: 'qShareOfWhat',
    mrvCommunity: 'qMrvCosts',
    lockIn: 'qExit',
    noExit: 'qExit',
    noFloor: 'qPriceFloor',
    fixedBelow: 'qPriceFloor',
    ownAggregator: 'qOwnership',
    ownUnclear: 'qOwnership',
    paymentUnclear: 'qPaymentSchedule',
    paymentLate: 'qPaymentSchedule',
    advanceRisk: 'qAdvance',
  }
  const urgent = [...new Set(redFlags.map((f) => flagToQuestion[f.id]).filter(Boolean))]
  const ordered = [...urgent, ...questions.filter((q) => !urgent.includes(q))]

  return { scenarios, priceUsed, verdict, score, findings, redFlags, questions: ordered }
}
