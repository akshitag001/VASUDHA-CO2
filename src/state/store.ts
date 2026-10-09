// Persisted state shape, defaults, demos and share-link encoding. No React components here.
import type { Lang } from '../lib/format'
import { DEFAULT_SETTINGS, type Settings } from '../model/analysis'
import type { Field, Overrides } from '../model/village'
import type { Offer } from '../engine'

export const DEFAULT_OFFER: Offer = {
  communitySharePct: 70,
  contractYears: 10,
  upfrontPayment: 0,
  upfrontIsAdvance: true,
  mrvPaidBy: 'aggregator',
  exit: 'none',
  pricing: 'floating',
  fixedPrice: 400,
  floorPrice: 250,
  ownership: 'unclear',
  paymentTiming: 'unclear',
}

export interface Stored {
  v: 2
  villageId: string | null
  custom: { name: string; district: string; state: string } | null
  overrides: Overrides
  soil: Field | null
  settings: Settings
  pool: string[]
  offer: Offer
  offerCheckedAt: string | null
  readiness: Record<string, boolean>
  lang: Lang
}

export const EMPTY: Stored = {
  v: 2,
  villageId: null,
  custom: null,
  overrides: {},
  soil: null,
  settings: DEFAULT_SETTINGS,
  pool: [],
  offer: DEFAULT_OFFER,
  offerCheckedAt: null,
  readiness: {},
  lang: 'en',
}

export const KEY = 'vasudha_co2_v2'

// ---- encoding for share links (UTF-8 safe base64url) ----
export function encodeState(s: Partial<Stored>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(s))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeState(raw: string): Stored | null {
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return sanitize(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}

function sanitize(x: unknown): Stored | null {
  if (!x || typeof x !== 'object' || (x as Stored).v !== 2) return null
  const s = x as Partial<Stored>
  return {
    ...EMPTY,
    ...s,
    settings: { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) },
    offer: { ...DEFAULT_OFFER, ...(s.offer ?? {}) },
    lang: s.lang === 'hi' || s.lang === 'gu' ? s.lang : 'en',
  } as Stored
}

// Share links carry only what differs from the defaults, so the QR code on the
// printed brief stays small enough to scan. sanitize() fills the defaults back in.
export function compactForShare(s: Stored): Partial<Stored> & { v: 2 } {
  const out: Partial<Stored> & { v: 2 } = { v: 2, villageId: s.villageId }
  if (s.custom) out.custom = s.custom
  if (Object.keys(s.overrides).length) out.overrides = s.overrides
  if (s.soil) out.soil = { ...s.soil, source: 'ISRIC SoilGrids 2.0, live query' }
  if (s.pool.length) out.pool = s.pool
  const diff = <T extends object>(cur: T, def: T) =>
    Object.fromEntries(Object.entries(cur).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify((def as Record<string, unknown>)[k]))) as Partial<T>
  const settings = diff(s.settings, DEFAULT_SETTINGS)
  if (Object.keys(settings).length) out.settings = settings as Settings
  if (s.offerCheckedAt) {
    out.offer = diff(s.offer, DEFAULT_OFFER) as Offer
    out.offerCheckedAt = s.offerCheckedAt
  }
  if (s.lang !== 'en') out.lang = s.lang
  return out
}

export function loadInitial(): Stored {
  try {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('s')
    if (shared) {
      const st = decodeState(shared)
      params.delete('s')
      const q = params.toString()
      window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : ''))
      if (st) return st
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem('vasudha_co2_state_v1') // old format stored computed numbers; drop it
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitize(JSON.parse(raw)) ?? EMPTY
  } catch {
    /* storage unavailable */
  }
  return EMPTY
}

export type DemoId = 'small' | 'medium' | 'pool'

export const DEMOS: Record<DemoId, { villageId: string; pool: string[]; path: string }> = {
  small: { villageId: '143905', pool: [], path: '/overview' },
  medium: { villageId: '143892', pool: [], path: '/overview' },
  pool: { villageId: '215680', pool: ['215694', '215705'], path: '/pooling' },
}

