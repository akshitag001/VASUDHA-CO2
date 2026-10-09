import { describe, expect, it } from 'vitest'
import { compactForShare, decodeState, encodeState, EMPTY, DEFAULT_OFFER } from './store'

describe('share links', () => {
  it('round-trips a state with non-default values, including non-Latin text', () => {
    const s = {
      ...EMPTY,
      villageId: 'custom',
      custom: { name: 'जामगाँव', district: 'Mandla', state: 'Madhya Pradesh' },
      overrides: { households: 600 },
      pool: ['143905'],
      settings: { ...EMPTY.settings, aggregatorShare: 0.25 },
      offer: { ...DEFAULT_OFFER, communitySharePct: 55 },
      offerCheckedAt: '2026-10-09',
      lang: 'gu' as const,
    }
    const back = decodeState(encodeState(compactForShare(s)))!
    expect(back.custom?.name).toBe('जामगाँव')
    expect(back.overrides.households).toBe(600)
    expect(back.settings.aggregatorShare).toBe(0.25)
    expect(back.settings.durationYears).toBe(EMPTY.settings.durationYears)
    expect(back.offer.communitySharePct).toBe(55)
    expect(back.offer.contractYears).toBe(DEFAULT_OFFER.contractYears)
    expect(back.lang).toBe('gu')
  })

  it('a default state encodes to a short link', () => {
    expect(encodeState(compactForShare({ ...EMPTY, villageId: '143892' })).length).toBeLessThan(60)
  })

  it('rejects garbage', () => {
    expect(decodeState('not-base64!!')).toBeNull()
  })
})
