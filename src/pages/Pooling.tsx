import { lazy, Suspense, useId, useMemo, useState } from 'react'
import { ASSUMPTIONS as A } from '../config/assumptions'
import { pick } from '../engine'
import type { TKey } from '../i18n'
import { inr, inrRange, num, pct } from '../lib/format'
import { poolAnalysis } from '../model/pool'
import { neighboursOf, resolveVillage, type VillageProfile } from '../model/village'
import { useApp } from '../state/AppState'
import { Callout, PageHeader, PageNav, Seg } from '../ui/bits'

const PoolMap = lazy(() => import('../ui/PoolMap'))

const RADII = ['10', '15', '25', '40'] as const

export default function Pooling() {
  const { t, lang, village, state, togglePool } = useApp()
  const [radius, setRadius] = useState<(typeof RADII)[number]>('25')
  const listId = useId()

  const neighbours = useMemo(
    () => (village?.lat != null && village.lon != null ? neighboursOf(village.id, village.lat, village.lon, Number(radius)) : []),
    [village, radius],
  )

  const members = useMemo<VillageProfile[]>(() => {
    if (!village) return []
    const others = state.pool.map((id) => resolveVillage(id)).filter((v): v is VillageProfile => v != null)
    return [village, ...others]
  }, [village, state.pool])

  const pool = useMemo(() => (members.length > 1 ? poolAnalysis(members, state.settings) : null), [members, state.settings])

  if (!village) return null
  const hasCoords = village.lat != null && village.lon != null
  const name = (v: { name: string; nameHi?: string }) => (lang === 'hi' && v.nameHi ? v.nameHi : v.name)

  let msg: TKey = 'pool.msg.pick'
  let tone: 'good' | 'warn' | 'alarm' | 'note' = 'note'
  if (pool) {
    const anyAloneClears = pool.rows.some((r) => r.aloneClears)
    const allAloneClear = pool.rows.every((r) => r.aloneClears)
    if (!pool.pooledClears) [msg, tone] = ['pool.msg.stillShort', 'alarm']
    else if (allAloneClear) [msg, tone] = ['pool.msg.alreadyOk', 'good']
    else if (!anyAloneClears) [msg, tone] = ['pool.msg.flip', 'good']
    else [msg, tone] = ['pool.msg.flipSome', 'good']
  }

  return (
    <article>
      <PageHeader kicker={t('pool.kicker')} title={t('pool.title')} lede={t('pool.lede')} step={[6, 8]} />

      {!hasCoords ? (
        <Callout kind="warn">{t('pool.noCoords')}</Callout>
      ) : (
        <>
          <Seg
            legend={t('pool.radius')}
            value={radius}
            onChange={setRadius}
            options={RADII.map((r) => ({ value: r, label: `${r} km` }))}
          />

          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 mt-6">
            <div>
              <Suspense fallback={<div className="h-[22rem] border border-ink bg-paper-2 grid place-items-center muted">{t('app.loading')}</div>}>
                <PoolMap
                  center={{ lat: village.lat!, lon: village.lon!, name: village.name }}
                  neighbours={neighbours}
                  selected={state.pool}
                  radiusKm={Number(radius)}
                  onToggle={togglePool}
                  label={t('pool.mapLabel', { name: name(village) })}
                />
              </Suspense>
              <p className="small muted mt-2">{t('pool.mapNote')}</p>
            </div>

            <fieldset aria-describedby={listId}>
              <legend className="section-title mb-2">{t('pool.listTitle')}</legend>
              {neighbours.length === 0 ? (
                <p id={listId} className="muted">
                  {t('pool.none', { km: radius })}
                </p>
              ) : (
                <ul id={listId} className="border-t border-ink">
                  {neighbours.map((n) => {
                    const checked = state.pool.includes(n.lgdCode)
                    return (
                      <li key={n.lgdCode} className="border-b border-rule">
                        <label className="flex items-start gap-3 py-3 cursor-pointer">
                          <input type="checkbox" className="mt-1" checked={checked} onChange={() => togglePool(n.lgdCode)} />
                          <span className="flex-1">
                            <span className="font-semibold">{name(n)}</span>
                            <span className="block small muted">
                              {n.district} · {t('pool.kmAway', { km: n.distanceKm.toFixed(1) })} · {t(n.illustrative ? 'pool.illustrative' : 'pool.placeholder')}
                            </span>
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </fieldset>
          </div>
        </>
      )}

      <section className="section" aria-live="polite">
        <h2 className="section-title mb-3">{t('pool.compareTitle')}</h2>
        <div className={tone}>
          <p className="font-semibold">{t(msg)}</p>
        </div>
        {pool && (
          <div className="table-wrap mt-4">
            <table className="ledger">
              <thead>
                <tr>
                  <th scope="col">{t('pool.colVillage')}</th>
                  <th scope="col" className="amt">
                    {t('pool.colAlone')}
                  </th>
                  <th scope="col" className="amt">
                    {t('pool.colTogether')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pool.rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="font-normal">
                      {r.name}
                      <span className="block small muted">
                        {num(r.households)} {t('unit.households')}
                      </span>
                    </th>
                    <td className={`amt ${r.alone.mid.netPerHousehold < 0 ? 'neg' : ''}`}>
                      {inr(r.alone.mid.netPerHousehold, lang)}
                      <span className="block small muted">{r.aloneClears ? t('pool.clears') : t('pool.short')}</span>
                    </td>
                    <td className={`amt ${pool.pooled.mid.netPerHousehold < 0 ? 'neg' : 'pos'}`}>{inr(pool.pooled.mid.netPerHousehold, lang)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <th scope="row">
                    {t('pool.together')}{' '}
                    <span className="small muted font-normal">
                      ({num(pool.households)} {t('unit.households')})
                    </span>
                  </th>
                  <td className="amt small muted">{t('money.headline')}</td>
                  <td className={`amt ${pool.pooled.mid.net < 0 ? 'neg' : ''}`}>
                    {inr(pool.pooled.mid.net, lang)}
                    <span className="block small muted font-normal">{inrRange(pick(pool.pooled, (r) => r.net), lang)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="small muted mt-2">
              {t('sc.mid')}. {t('pool.monitoringNote', { pct: pct(A.extraVillageMonitoringShare.value) })}
            </p>
          </div>
        )}
      </section>

      <PageNav prev={['/offer', 'nav.offer']} next={['/readiness', 'nav.readiness']} />
    </article>
  )
}
