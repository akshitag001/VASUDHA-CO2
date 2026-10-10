import { useEffect, useState } from 'react'
import en, { type Dict, type TKey } from './en'
import type { Lang } from '../lib/format'

export type { TKey, Dict }
export type Params = Record<string, string | number>
export type T = (key: TKey, params?: Params) => string

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'हिन्दी' },
  { code: 'gu', label: 'ગુ', name: 'ગુજરાતી' },
]

// English ships in the main bundle; Hindi and Gujarati load when first chosen.
const cache: Partial<Record<Lang, Dict>> = { en }

export function loadDict(lang: Lang): Promise<Dict> {
  if (cache[lang]) return Promise.resolve(cache[lang]!)
  const p = lang === 'hi' ? import('./hi') : import('./gu')
  return p.then((m) => (cache[lang] = m.default))
}

export function useDict(lang: Lang): Dict {
  const [dict, setDict] = useState<Dict>(() => cache[lang] ?? en)
  useEffect(() => {
    let live = true
    loadDict(lang).then((d) => live && setDict(() => d))
    return () => {
      live = false
    }
  }, [lang])
  return cache[lang] ?? dict
}

export function makeT(dict: Dict): T {
  return (key, params) => {
    let s: string = dict[key] ?? en[key] ?? key
    if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v))
    return s
  }
}
