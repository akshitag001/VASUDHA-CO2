import { describe, expect, it } from 'vitest'
import {
  activityMitigation,
  annualCosts,
  breakEvenCredits,
  breakEvenScale,
  CO2_PER_C,
  dataConfidence,
  defaultCosts,
  defaultModelParams,
  estimateMitigation,
  evaluateOffer,
  issuableCredits,
  matchMethodologies,
  creditableActivities,
  overallVerdict,
  pick,
  poolFinance,
  point,
  runScenarios,
  sensitivity,
  type FinanceInput,
  type MethodologyEntry,
  type Offer,
  type VillageInputs,
} from './index'
import methodologyData from '../data/methodologies.json'
import { inr, inrRange } from '../lib/format'

const village: VillageInputs = {
  households: 500,
  population: 2400,
  croplandHa: 500,
  commonLandHa: 400,
  degradedHa: 150,
  plantationHa: 60,
  dairyCattle: 180,
  indigenousCattle: 640,
  buffalo: 210,
  goats: 380,
  sheep: 60,
  socTCHa: 14,
}

const p = defaultModelParams()

const baseInput = (over: Partial<FinanceInput> = {}): FinanceInput => ({
  mitigation: { low: 1000, mid: 1500, high: 2000 },
  creditableFraction: { low: 0.5, mid: 0.75, high: 0.9 },
  price: { low: 250, mid: 500, high: 850 },
  aggregatorShare: 0.3,
  durationYears: 10,
  households: 500,
  costs: defaultCosts(),
  costBearer: 'community',
  sharedCostFraction: 0.5,
  ...over,
})

describe('carbon', () => {
  it('agroforestry follows IPCC tier-1 arithmetic', () => {
    const area = 150 + 400 * p.agroCommonShare
    expect(activityMitigation('agroforestry', village, p, 'mid')).toBeCloseTo(area * p.biomassGrowth.mid * p.carbonFraction * CO2_PER_C)
  })

  it('every activity range is ordered low ≤ mid ≤ high', () => {
    const est = estimateMitigation(village, p)
    for (const r of [...Object.values(est.byActivity), est.total]) {
      expect(r.low).toBeLessThanOrEqual(r.mid)
      expect(r.mid).toBeLessThanOrEqual(r.high)
    }
  })

  it('a village with nothing has zero mitigation, and negative inputs are ignored', () => {
    const empty = Object.fromEntries(Object.keys(village).map((k) => [k, 0])) as unknown as VillageInputs
    expect(estimateMitigation(empty, p).total.high).toBe(0)
    expect(estimateMitigation({ ...empty, croplandHa: -50 }, p).total.high).toBe(0)
  })

  it('credits are mitigation × creditable fraction, never the raw mitigation', () => {
    const c = issuableCredits({ low: 100, mid: 200, high: 300 }, { low: 0.5, mid: 0.75, high: 0.9 })
    expect(c).toEqual({ low: 50, mid: 150, high: 270 })
  })
})

describe('finance', () => {
  it('central scenario matches a hand calculation', () => {
    const r = runScenarios(baseInput()).mid
    const credits = 1500 * 0.75
    const gross = credits * 500
    const costs = 500000 / 10 + 60000 / 10 + 400000 / 2 + 100000
    expect(r.credits).toBeCloseTo(credits)
    expect(r.gross).toBeCloseTo(gross)
    expect(r.aggregatorCut).toBeCloseTo(gross * 0.3)
    expect(r.costs.total).toBeCloseTo(costs)
    expect(r.net).toBeCloseTo(gross * 0.7 - costs)
    expect(r.netPerHousehold).toBeCloseTo((gross * 0.7 - costs) / 500)
  })

  it('zero credits gives zero revenue and a loss equal to costs', () => {
    const r = runScenarios(baseInput({ mitigation: point(0) })).mid
    expect(r.gross).toBe(0)
    expect(r.net).toBeCloseTo(-annualCosts(defaultCosts(), 'mid', 10).total)
  })

  it('costs above revenue produce a negative net — never floored at zero', () => {
    const r = runScenarios(baseInput({ mitigation: point(50) }))
    expect(r.mid.net).toBeLessThan(0)
    expect(r.low.net).toBeLessThan(r.mid.net)
    expect(r.mid.netPerHousehold).toBeLessThan(0)
  })

  it('pessimistic scenario is the lowest, optimistic the highest', () => {
    const s = runScenarios(baseInput())
    expect(s.low.net).toBeLessThan(s.mid.net)
    expect(s.mid.net).toBeLessThan(s.high.net)
    const r = pick(s, (x) => x.net)
    expect(r.low).toBeLessThanOrEqual(r.high)
  })

  it('when the aggregator pays MRV, the village bears no costs', () => {
    const r = runScenarios(baseInput({ costBearer: 'aggregator' })).mid
    expect(r.costsToVillage).toBe(0)
    expect(r.net).toBeCloseTo(r.gross * 0.7)
  })

  it('shared costs halve what the village pays', () => {
    const all = runScenarios(baseInput()).mid
    const half = runScenarios(baseInput({ costBearer: 'shared' })).mid
    expect(half.costsToVillage).toBeCloseTo(all.costsToVillage / 2)
  })

  it('zero households does not divide by zero', () => {
    expect(runScenarios(baseInput({ households: 0 })).mid.netPerHousehold).toBe(0)
  })

  it('an upfront grant adds to the contract total; an advance does not', () => {
    const none = runScenarios(baseInput()).mid.netOverContract
    expect(runScenarios(baseInput({ upfrontPayment: 100000, upfrontIsAdvance: false })).mid.netOverContract).toBeCloseTo(none + 100000)
    expect(runScenarios(baseInput({ upfrontPayment: 100000, upfrontIsAdvance: true })).mid.netOverContract).toBeCloseTo(none)
  })
})

describe('break-even', () => {
  it('at the break-even credit volume net income is zero', () => {
    const need = breakEvenCredits(baseInput())!
    const r = runScenarios(baseInput({ mitigation: point(need / 0.75), creditableFraction: point(0.75) })).mid
    expect(r.net).toBeCloseTo(0, 4)
  })

  it('returns null when a 100% aggregator share makes break-even impossible', () => {
    expect(breakEvenCredits(baseInput({ aggregatorShare: 1 }))).toBeNull()
  })

  it('is zero when the village bears no costs', () => {
    expect(breakEvenCredits(baseInput({ costBearer: 'aggregator' }))).toBe(0)
  })

  it('reports hectares and cattle needed, and whether the village clears it', () => {
    const be = breakEvenScale(baseInput({ mitigation: point(100) }), p)
    expect(be.clears).toBe(false)
    expect(be.agroforestryHaNeeded!).toBeGreaterThan(0)
    expect(be.cattleNeeded!).toBeGreaterThan(be.agroforestryHaNeeded!)
  })
})

describe('sensitivity', () => {
  it('bars are sorted by swing and price moves net in the right direction', () => {
    const s = sensitivity(baseInput())
    for (let i = 1; i < s.bars.length; i++) expect(s.bars[i - 1].swing).toBeGreaterThanOrEqual(s.bars[i].swing)
    const price = s.bars.find((b) => b.factor === 'price')!
    expect(price.netAtHigh).toBeGreaterThan(price.netAtLow)
    const share = s.bars.find((b) => b.factor === 'aggregatorShare')!
    expect(share.netAtHigh).toBeLessThan(share.netAtLow)
  })
})

describe('pooling', () => {
  it('pools credits, pays fixed costs once and can clear break-even when no member does', () => {
    const base = baseInput()
    const { mitigation: _m, households: _h, ...rest } = base
    const members = [
      { id: 'a', mitigation: point(800), households: 150 },
      { id: 'b', mitigation: point(800), households: 150 },
      { id: 'c', mitigation: point(800), households: 150 },
    ]
    const r = poolFinance(members, rest, 0.5)
    expect(r.mitigation.mid).toBe(2400)
    expect(r.households).toBe(450)
    expect(Object.values(r.standaloneClearsBreakEven).every((x) => !x)).toBe(true)
    expect(r.pooledClearsBreakEven).toBe(true)
    expect(r.pooled.mid.net).toBeGreaterThan(r.standalone.a.mid.net * 3)
  })
})

describe('methodology matching', () => {
  const entries = methodologyData.entries as MethodologyEntry[]

  it('only approved pathways with all conditions met are eligible', () => {
    const m = matchMethodologies(village, entries)
    for (const r of m) {
      if (r.category === 'eligible') expect(r.entry.status).toBe('approved')
      if (r.category === 'future') expect(r.entry.status).not.toBe('approved')
    }
    expect(creditableActivities(m, false)).not.toContain('soil')
    expect(creditableActivities(m, true)).toContain('soil')
  })

  it('a tiny village matches nothing', () => {
    const tiny = { ...village, dairyCattle: 1, indigenousCattle: 1, buffalo: 1, degradedHa: 0, commonLandHa: 1, croplandHa: 2 }
    expect(creditableActivities(matchMethodologies(tiny, entries), true)).toEqual([])
  })
})

describe('offer checker', () => {
  const ctx = (() => {
    const { aggregatorShare: _a, durationYears: _d, costBearer: _c, ...rest } = baseInput()
    return rest
  })()
  const bench = { communityShareTypical: 0.6, communityShareFavourable: 0.75, maxYearsWithoutExit: 10, longContractYears: 15 }
  const good: Offer = {
    communitySharePct: 80,
    contractYears: 10,
    upfrontPayment: 0,
    upfrontIsAdvance: false,
    mrvPaidBy: 'aggregator',
    exit: 'notice',
    pricing: 'floating_floor',
    fixedPrice: 0,
    floorPrice: 300,
    ownership: 'community',
    paymentTiming: 'annual',
  }

  it('a fair offer is favourable with no high-severity flags', () => {
    const r = evaluateOffer(good, ctx, bench)
    expect(r.verdict).toBe('favourable')
    expect(r.redFlags.filter((f) => f.severity === 'high')).toHaveLength(0)
  })

  it('long lock-in, low share, village pays MRV and no floor are flagged', () => {
    const r = evaluateOffer(
      { ...good, communitySharePct: 50, contractYears: 20, exit: 'none', mrvPaidBy: 'community', pricing: 'floating', ownership: 'aggregator' },
      ctx,
      bench,
    )
    const ids = r.redFlags.map((f) => f.id)
    expect(r.verdict).toBe('below')
    expect(ids).toEqual(expect.arrayContaining(['shareLow', 'lockIn', 'mrvCommunity', 'noFloor', 'ownAggregator', 'veryLong']))
    expect(r.questions[0]).toBeDefined()
  })

  it('a price floor lifts the pessimistic price', () => {
    const r = evaluateOffer({ ...good, floorPrice: 400 }, ctx, bench)
    expect(r.priceUsed.low).toBe(400)
  })

  it('a fixed price below the low scenario is a red flag', () => {
    const r = evaluateOffer({ ...good, pricing: 'fixed', fixedPrice: 100 }, ctx, bench)
    expect(r.redFlags.map((f) => f.id)).toContain('fixedBelow')
    expect(r.verdict).toBe('below')
  })
})

describe('confidence and verdict', () => {
  it('real data scores higher than assumptions', () => {
    const est = estimateMitigation(village, p)
    const prov = (x: 'dataset' | 'assumption') =>
      Object.fromEntries(Object.keys(village).map((k) => [k, x])) as Parameters<typeof dataConfidence>[0]['provenance']
    const factors = { agroforestry: ['medium' as const], manure: ['medium' as const], soil: ['low' as const], pasture: ['low' as const] }
    const hi = dataConfidence({ provenance: prov('dataset'), mitigation: est.byActivity, activityFactors: factors, moneyFactors: ['low'] })
    const lo = dataConfidence({ provenance: prov('assumption'), mitigation: est.byActivity, activityFactors: factors, moneyFactors: ['low'] })
    expect(hi.overall).toBeGreaterThan(lo.overall)
    expect(lo.overall).toBeGreaterThanOrEqual(0)
    expect(hi.overall).toBeLessThanOrEqual(100)
  })

  it('verdict reflects pathways and the scenario spread', () => {
    const s = runScenarios(baseInput())
    expect(overallVerdict(0, s)).toBe('no_pathway')
    expect(overallVerdict(1, runScenarios(baseInput({ mitigation: point(10) })))).toBe('not_alone')
  })
})

describe('formatting', () => {
  it('formats rupees in lakh and orders ranges low to high', () => {
    expect(inr(820000)).toBe('₹8.2 lakh')
    expect(inrRange({ low: 970000, high: 820000 })).toBe('₹8.2 – ₹9.7 lakh')
    expect(inrRange({ low: -65000, high: 690000 })).toBe('−₹0.7 – ₹6.9 lakh')
  })
})
