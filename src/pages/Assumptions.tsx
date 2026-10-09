import { ASSUMPTIONS, REGIONAL_DEFAULTS, type Assumption, type AssumptionGroup } from '../config/assumptions'
import type { TKey } from '../i18n'
import { num } from '../lib/format'
import { METHODOLOGIES, METHODOLOGY_NOTE } from '../model/analysis'
import { useApp } from '../state/AppState'
import { PageHeader } from '../ui/bits'

const GROUPS: AssumptionGroup[] = ['market', 'cost', 'carbon', 'adoption', 'pooling', 'benchmark']

const show = (a: Assumption, v: number) => (a.unit.includes('fraction') ? `${num(v * 100)}%` : num(v, 2))

export default function Assumptions() {
  const { t, lang } = useApp()
  const all = Object.values(ASSUMPTIONS) as Assumption[]
  return (
    <article>
      <PageHeader kicker={t('asm.kicker')} title={t('asm.title')} lede={t('asm.lede')} />
      {GROUPS.map((g) => (
        <section key={g} className="section">
          <h2 className="section-title mb-3">{t(`asm.g.${g}` as TKey)}</h2>
          <div className="table-wrap">
            <table className="ledger" lang="en">
              <thead>
                <tr>
                  <th scope="col">{t('asm.colItem')}</th>
                  <th scope="col" className="amt">
                    {t('asm.colValue')}
                  </th>
                  <th scope="col" className="amt">
                    {t('asm.colRange')}
                  </th>
                  <th scope="col">{t('asm.colSource')}</th>
                  <th scope="col">{t('asm.colConf')}</th>
                </tr>
              </thead>
              <tbody>
                {all
                  .filter((a) => a.group === g)
                  .map((a) => (
                    <tr key={a.id}>
                      <th scope="row" className="font-semibold">
                        {a.label}
                        <span className="block small muted font-normal">{a.unit}</span>
                        <code className="small">{a.id}</code>
                      </th>
                      <td className="amt">{show(a, a.value)}</td>
                      <td className="amt">{a.low === a.high ? '—' : `${show(a, a.low)} – ${show(a, a.high)}`}</td>
                      <td className="small" style={{ minWidth: '16rem' }}>
                        {a.source} <span className="muted">({a.year})</span>
                        {a.url && (
                          <>
                            {' '}
                            <a href={a.url} target="_blank" rel="noreferrer">
                              ↗
                            </a>
                          </>
                        )}
                        {a.note && <span className="block muted mt-1">{a.note}</span>}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="small">{t(`conf.${a.confidence}` as TKey)}</span>{' '}
                        {!a.verified && (
                          <span className="verify" title={t('prov.verifyTip')}>
                            {t('prov.verify')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="section">
        <h2 className="section-title mb-2">{t('asm.placeholderTitle')}</h2>
        <p className="text-ink-2 mb-3" lang="en">
          {REGIONAL_DEFAULTS.source}
        </p>
        <div className="table-wrap">
          <table className="ledger" lang="en">
            <thead>
              <tr>
                <th scope="col">Region</th>
                <th scope="col" className="amt">
                  Cropland
                </th>
                <th scope="col" className="amt">
                  Common
                </th>
                <th scope="col" className="amt">
                  Degraded
                </th>
                <th scope="col" className="amt">
                  SOC t C/ha
                </th>
                <th scope="col">Cattle / buffalo / goats / sheep per 1,000 people</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(REGIONAL_DEFAULTS.regions).map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="font-normal">
                    {r.label}
                    <span className="block small muted">{r.states.join(', ')}</span>
                  </th>
                  <td className="amt">{num(r.cropShare * 100)}%</td>
                  <td className="amt">{num(r.commonShare * 100)}%</td>
                  <td className="amt">{num(r.degradedShare * 100)}%</td>
                  <td className="amt">{r.socTCHa}</td>
                  <td className="small">
                    {r.livestockPer1000.dairyCattle + r.livestockPer1000.indigenousCattle} / {r.livestockPer1000.buffalo} / {r.livestockPer1000.goats} / {r.livestockPer1000.sheep}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted mt-2" lang="en">
          Village of {num(REGIONAL_DEFAULTS.population)} people, {num(REGIONAL_DEFAULTS.households)} households, {num(REGIONAL_DEFAULTS.totalHa)} ha.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title mb-2">{t('asm.methodologyTitle')}</h2>
        <p className="alarm small mb-3" lang="en">
          {METHODOLOGY_NOTE}
        </p>
        <ul className="border-t border-ink">
          {METHODOLOGIES.map((m) => (
            <li key={m.id} className="border-b border-rule py-2 flex flex-wrap gap-x-3 items-baseline">
              <span className="figure small">{m.code}</span>
              <span className="flex-1">{m.name[lang]}</span>
              <span className="small">{t(`meth.status.${m.status}` as TKey)}</span>
              <span className="verify">{t('prov.verify')}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
