// Number formatting in the Indian system (lakh / crore). Pure functions.

import type { Range } from '../engine/types'

export type Lang = 'en' | 'hi' | 'gu'

const UNITS: Record<Lang, { lakh: string; crore: string; thousand: string }> = {
  en: { lakh: 'lakh', crore: 'crore', thousand: 'thousand' },
  hi: { lakh: 'लाख', crore: 'करोड़', thousand: 'हज़ार' },
  gu: { lakh: 'લાખ', crore: 'કરોડ', thousand: 'હજાર' },
}

const MINUS = '−'

const trim = (s: string) => s.replace(/\.0$/, '')

// ₹ amount, compact: ₹8.2 lakh, ₹1.35 crore, ₹4,500.
export function inr(n: number, lang: Lang = 'en'): string {
  if (!Number.isFinite(n)) return '—'
  const sign = n < 0 ? MINUS : ''
  const abs = Math.abs(n)
  const u = UNITS[lang]
  if (abs >= 1e7) return `${sign}₹${trim((abs / 1e7).toFixed(2))} ${u.crore}`
  if (abs >= 1e5) return `${sign}₹${trim((abs / 1e5).toFixed(1))} ${u.lakh}`
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`
}

// Same unit on both ends so a range reads cleanly: "₹8.2 – ₹9.7 lakh".
export function inrRange(r: Pick<Range, 'low' | 'high'>, lang: Lang = 'en'): string {
  const lo = Math.min(r.low, r.high)
  const hi = Math.max(r.low, r.high)
  const big = Math.max(Math.abs(lo), Math.abs(hi))
  const u = UNITS[lang]
  const fmt = (x: number, div: number, dp: number) => `${x < 0 ? MINUS : ''}₹${trim((Math.abs(x) / div).toFixed(dp))}`
  if (big >= 1e7) return `${fmt(lo, 1e7, 2)} – ${fmt(hi, 1e7, 2)} ${u.crore}`
  if (big >= 1e5) return `${fmt(lo, 1e5, 1)} – ${fmt(hi, 1e5, 1)} ${u.lakh}`
  return `${inr(lo, lang)} – ${inr(hi, lang)}`
}

export function num(n: number, dp = 0): string {
  if (!Number.isFinite(n)) return '—'
  const s = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: dp, minimumFractionDigits: 0 })
  return n < 0 ? `${MINUS}${s}` : s
}

// Tonnes, rounded to a sensible precision so false precision isn't implied.
export function tonnes(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const r = abs >= 1000 ? Math.round(n / 10) * 10 : abs >= 100 ? Math.round(n) : Math.round(n * 10) / 10
  return num(r, 1)
}

export function tonnesRange(r: Pick<Range, 'low' | 'high'>): string {
  return `${tonnes(Math.min(r.low, r.high))} – ${tonnes(Math.max(r.low, r.high))}`
}

export function pct(fraction: number, dp = 0): string {
  return `${num(fraction * 100, dp)}%`
}
