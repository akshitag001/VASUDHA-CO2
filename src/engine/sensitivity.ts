// One-at-a-time sensitivity of central net income (a tornado chart).
// Each factor is moved to its low and high value while everything else stays central.

import type { FinanceInput } from './finance'
import { computePoint, pointFor } from './finance'

export type SensitivityFactor = 'price' | 'aggregatorShare' | 'creditableFraction' | 'costs' | 'mitigation'

export interface SensitivityBar {
  factor: SensitivityFactor
  lowInput: number // the input value used for the "low" end
  highInput: number
  netAtLow: number // net income when the factor is at its low value
  netAtHigh: number
  swing: number // |netAtHigh − netAtLow|
}

export interface SensitivityResult {
  base: number // central net income
  bars: SensitivityBar[] // biggest swing first
}

const SHARE_STEP = 0.1

export function sensitivity(input: FinanceInput): SensitivityResult {
  const base = pointFor(input, 'mid')
  const net = (over: Partial<typeof base>) => computePoint(input, { ...base, ...over }).net
  const shareLow = Math.max(0, input.aggregatorShare - SHARE_STEP)
  const shareHigh = Math.min(1, input.aggregatorShare + SHARE_STEP)

  const raw: Omit<SensitivityBar, 'swing'>[] = [
    { factor: 'price', lowInput: input.price.low, highInput: input.price.high, netAtLow: net({ price: input.price.low }), netAtHigh: net({ price: input.price.high }), },
    { factor: 'aggregatorShare', lowInput: shareLow, highInput: shareHigh, netAtLow: net({ aggregatorShare: shareLow }), netAtHigh: net({ aggregatorShare: shareHigh }), },
    {
      factor: 'creditableFraction',
      lowInput: input.creditableFraction.low,
      highInput: input.creditableFraction.high,
      netAtLow: net({ fraction: input.creditableFraction.low }),
      netAtHigh: net({ fraction: input.creditableFraction.high }),
    },
    { factor: 'costs', lowInput: 0, highInput: 1, netAtLow: net({ costLevel: 'low' }), netAtHigh: net({ costLevel: 'high' }), },
    {
      factor: 'mitigation',
      lowInput: input.mitigation.low,
      highInput: input.mitigation.high,
      netAtLow: net({ mitigation: input.mitigation.low }),
      netAtHigh: net({ mitigation: input.mitigation.high }),
    },
  ]
  const bars: SensitivityBar[] = raw.map((b) => ({ ...b, swing: Math.abs(b.netAtHigh - b.netAtLow) }))

  bars.sort((x, y) => y.swing - x.swing)
  return { base: computePoint(input, base).net, bars }
}
