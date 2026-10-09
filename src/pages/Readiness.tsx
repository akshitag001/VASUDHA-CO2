import { useMemo } from 'react'
import type { TKey } from '../i18n'
import { poolAnalysis } from '../model/pool'
import { resolveVillage, type VillageProfile } from '../model/village'
import { useApp } from '../state/AppState'
import { PageHeader, PageNav } from '../ui/bits'

type Status = 'yes' | 'partial' | 'no'

const GROUPS: [TKey, string[]][] = [
  ['ready.g.land', ['parcels', 'rights']],
  ['ready.g.community', ['discussed', 'resolution', 'women']],
  ['ready.g.records', ['baseline', 'soil']],
  ['ready.g.contract', ['twoOffers', 'written', 'advice']],
  ['ready.g.running', ['person', 'funds']],
]

const MARK: Record<Status, [string, string]> = { yes: ['✓', 'pos'], partial: ['◐', ''], no: ['✕', 'neg'] }

export default function Readiness() {
  const { t, village, analysis, state, toggleReady } = useApp()

  const pooledEarns = useMemo(() => {
    if (!village || state.pool.length === 0) return false
    const others = state.pool.map(resolveVillage).filter((v): v is VillageProfile => v != null)
    return poolAnalysis([village, ...others], state.settings).pooled.mid.net > 0
  }, [village, state.pool, state.settings])

  if (!village || !analysis) return null
  const fields = Object.values(village.fields)
  const entered = fields.filter((f) => f.provenance !== 'assumption').length

  const auto: [TKey, Status][] = [
    ['ready.auto.pathway', analysis.eligibleCount > 0 ? 'yes' : 'no'],
    [entered === fields.length ? 'ready.auto.figures' : 'ready.auto.figuresPartial', entered === fields.length ? 'yes' : entered > 0 ? 'partial' : 'no'],
    ['ready.auto.money', analysis.scenarios.mid.net > 0 || pooledEarns ? 'yes' : 'no'],
    ['ready.auto.confidence', analysis.confidence.overall >= 40 ? 'yes' : 'no'],
    ['ready.auto.offer', state.offerCheckedAt ? 'yes' : 'no'],
  ]
  const label: Record<Status, TKey> = { yes: 'ready.yes', partial: 'ready.partial', no: 'ready.no' }

  const all = GROUPS.flatMap(([, ids]) => ids)
  const done = all.filter((id) => state.readiness[id]).length + auto.filter(([, s]) => s === 'yes').length
  const total = all.length + auto.length

  return (
    <article>
      <PageHeader kicker={t('ready.kicker')} title={t('ready.title')} lede={t('ready.lede')} step={[7, 8]} />

      <div className="mb-8">
        <p className="figure-lg mb-2">{t('ready.progress', { done, total })}</p>
        <div className="h-3 bg-paper-2 border border-ink" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t('ready.title')}>
          <div className="h-full bg-indigo" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      <section className="sheet">
        <h2 className="section-title mb-3">{t('ready.autoTitle')}</h2>
        <ul className="divide-y divide-rule">
          {auto.map(([k, s]) => (
            <li key={k} className="flex gap-3 py-2.5 items-baseline">
              <span aria-hidden="true" className={`figure ${MARK[s][1]}`}>
                {MARK[s][0]}
              </span>
              <span className="flex-1">{t(k)}</span>
              <span className={`small font-semibold ${MARK[s][1]}`}>{t(label[s])}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title mb-4">{t('ready.manualTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {GROUPS.map(([g, ids]) => (
            <fieldset key={g}>
              <legend className="font-semibold serif text-lg mb-2">{t(g)}</legend>
              <ul className="border-t border-ink">
                {ids.map((id) => (
                  <li key={id} className="border-b border-rule">
                    <label className="flex gap-3 py-2.5 cursor-pointer items-start">
                      <input type="checkbox" className="mt-1" checked={!!state.readiness[id]} onChange={() => toggleReady(id)} />
                      <span>{t(`ready.i.${id}` as TKey)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
        </div>
      </section>

      <PageNav prev={['/pooling', 'nav.pooling']} next={['/brief', 'nav.brief']} />
    </article>
  )
}
