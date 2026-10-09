import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../lib/format'
import { makeT, useDict, type T } from '../i18n'
import { analyse, DEFAULT_SETTINGS, type Analysis, type Settings } from '../model/analysis'
import { applyOverrides, customVillage, resolveVillage, type Field, type VillageProfile } from '../model/village'
import type { Offer } from '../engine'
import { compactForShare, DEFAULT_OFFER, DEMOS, encodeState, KEY, loadInitial, type DemoId, type Stored } from './store'
import type { VillageField } from '../engine/types'

interface Ctx {
  state: Stored
  lang: Lang
  t: T
  village: VillageProfile | null
  baseVillage: VillageProfile | null
  analysis: Analysis | null
  setLang: (l: Lang) => void
  selectVillage: (id: string) => boolean
  startCustom: (name: string, district: string, state: string) => void
  clearVillage: () => void
  setOverride: (f: VillageField, v: number | undefined) => void
  resetOverrides: () => void
  setSoil: (f: Field | null) => void
  setSettings: (s: Partial<Settings>) => void
  resetSettings: () => void
  togglePool: (id: string) => void
  setOffer: (o: Partial<Offer>) => void
  resetOffer: () => void
  toggleReady: (id: string) => void
  loadDemo: (d: DemoId) => string
  shareUrl: () => string
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* private mode etc. — the app still works without saving */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.lang = state.lang
  }, [state.lang])

  const baseVillage = useMemo<VillageProfile | null>(() => {
    if (state.villageId === 'custom' && state.custom) return customVillage(state.custom.name, state.custom.district, state.custom.state)
    return state.villageId ? resolveVillage(state.villageId) : null
  }, [state.villageId, state.custom])

  const village = useMemo(
    () => (baseVillage ? applyOverrides(baseVillage, state.overrides, state.soil ? { socTCHa: state.soil } : {}) : null),
    [baseVillage, state.overrides, state.soil],
  )

  const analysis = useMemo(() => (village ? analyse(village, state.settings) : null), [village, state.settings])

  const dict = useDict(state.lang)
  const t = useMemo(() => makeT(dict), [dict])

  const patch = useCallback((p: Partial<Stored> | ((s: Stored) => Partial<Stored>)) => {
    setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }))
  }, [])

  const freshVillage = { overrides: {}, soil: null, pool: [], offerCheckedAt: null, readiness: {} }

  const value: Ctx = {
    state,
    lang: state.lang,
    t,
    village,
    baseVillage,
    analysis,
    setLang: (lang) => patch({ lang }),
    selectVillage: (id) => {
      if (!resolveVillage(id)) return false
      patch({ villageId: id, custom: null, ...freshVillage })
      return true
    },
    startCustom: (name, district, st) => patch({ villageId: 'custom', custom: { name, district, state: st }, ...freshVillage }),
    clearVillage: () => patch({ villageId: null, custom: null, ...freshVillage }),
    setOverride: (f, v) =>
      patch((s) => {
        const overrides = { ...s.overrides }
        if (v === undefined) delete overrides[f]
        else overrides[f] = v
        return { overrides }
      }),
    resetOverrides: () => patch({ overrides: {}, soil: null }),
    setSoil: (soil) => patch((s) => {
      const overrides = { ...s.overrides }
      delete overrides.socTCHa
      return { soil, overrides }
    }),
    setSettings: (p) => patch((s) => ({ settings: { ...s.settings, ...p } })),
    resetSettings: () => patch({ settings: DEFAULT_SETTINGS }),
    togglePool: (id) => patch((s) => ({ pool: s.pool.includes(id) ? s.pool.filter((x) => x !== id) : [...s.pool, id] })),
    setOffer: (o) => patch((s) => ({ offer: { ...s.offer, ...o }, offerCheckedAt: new Date().toISOString().slice(0, 10) })),
    resetOffer: () => patch({ offer: DEFAULT_OFFER, offerCheckedAt: null }),
    toggleReady: (id) => patch((s) => ({ readiness: { ...s.readiness, [id]: !s.readiness[id] } })),
    loadDemo: (d) => {
      const demo = DEMOS[d]
      patch({ villageId: demo.villageId, custom: null, ...freshVillage, pool: demo.pool, settings: DEFAULT_SETTINGS, offer: DEFAULT_OFFER })
      return demo.path
    },
    shareUrl: () =>
      `${window.location.origin}/overview?s=${encodeState(compactForShare(state))}`,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
