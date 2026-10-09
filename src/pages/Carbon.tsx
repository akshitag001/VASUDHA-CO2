import { useId, useState } from 'react'
import { ASSUMPTIONS as A } from '../config/assumptions'
import { ACTIVITY_KEYS, VILLAGE_FIELDS, type VillageField } from '../engine/types'
import type { TKey } from '../i18n'
import { fetchSoilCarbon } from '../lib/soilgrids'
import { num, pct, tonnes, tonnesRange } from '../lib/format'
import { useApp } from '../state/AppState'
import { Callout, PageHeader, PageNav } from '../ui/bits'
import { RangeStrip } from '../ui/charts'
import { Prov, ProvLegend } from '../ui/Prov'

const UNIT: Record<VillageField, TKey> = {
  households: 'unit.households',
  population: 'unit.population',
  croplandHa: 'unit.ha',
  commonLandHa: 'unit.ha',
  degradedHa: 'unit.ha',
  plantationHa: 'unit.ha',
  dairyCattle: 'unit.head',
  indigenousCattle: 'unit.head',
  buffalo: 'unit.head',
  goats: 'unit.head',
  sheep: 'unit.head',
  socTCHa: 'unit.tcha',
}

function FigureInput({ field }: { field: VillageField }) {
  const { t, village, setOverride, baseVillage } = useApp()
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  if (!village) return null
  const f = village.fields[field]
  const invalid = draft != null && (draft.trim() === '' || !Number.isFinite(Number(draft)) || Number(draft) < 0)
  return (
    <tr>
      <th scope="row" className="font-normal">
        <label htmlFor={id}>{t(`field.${field}` as TKey)}</label>
      </th>
      <td>
        <div className="flex items-center gap-2">
          <input
            id={id}
            className="input input-num"
            style={{ maxWidth: '9rem', minHeight: '2.5rem' }}
            inputMode="decimal"
            value={draft ?? String(f.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-e` : undefined}
            onChange={(e) => {
              setDraft(e.target.value)
              const v = Number(e.target.value)
              if (e.target.value.trim() !== '' && Number.isFinite(v) && v >= 0) {
                // Typing the original value back removes the override, so the tag returns to its source.
                setOverride(field, baseVillage && baseVillage.fields[field].value === v ? undefined : v)
              }
            }}
            onBlur={() => setDraft(null)}
          />
          <span className="small muted">{t(UNIT[field])}</span>
        </div>
        {invalid && (
          <span id={`${id}-e`} className="hint neg">
            {t('carbon.invalid')}
          </span>
        )}
      </td>
      <td>
        <Prov kind={f.provenance} source={f.source} year={f.year} />
      </td>
    </tr>
  )
}

export default function Carbon() {
  const { t, village, analysis, resetOverrides, setSoil, state } = useApp()
  const [soilState, setSoilState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle')
  if (!village || !analysis) return null
  const a = analysis
  const est = a.mitigation
  const maxHigh = Math.max(1, ...ACTIVITY_KEYS.map((k) => est.byActivity[k].high))
  const hasChanges = Object.keys(state.overrides).length > 0 || state.soil != null

  const getSoil = async () => {
    if (village.lat == null || village.lon == null) return
    setSoilState('loading')
    const r = await fetchSoilCarbon(village.lat, village.lon)
    if (!r) return setSoilState('fail')
    setSoil({ value: r.tCPerHa, provenance: 'dataset', source: `ISRIC SoilGrids 2.0, organic carbon density 0–30 cm, live query (${r.url})`, year: '2020' })
    setSoilState('ok')
  }

  return (
    <article>
      <PageHeader kicker={t('carbon.kicker')} title={t('carbon.title')} lede={t('carbon.lede')} step={[2, 8]} />
      <ProvLegend />

      <section className="section">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <h2 className="section-title">{t('carbon.figuresTitle')}</h2>
          {hasChanges && (
            <button type="button" className="btn-quiet" onClick={resetOverrides}>
              {t('carbon.resetFigures')}
            </button>
          )}
        </div>
        <div className="table-wrap sheet" style={{ padding: '0.5rem 1rem' }}>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">{t('carbon.colField')}</th>
                <th scope="col">{t('carbon.colValue')}</th>
                <th scope="col">{t('carbon.colBasis')}</th>
              </tr>
            </thead>
            <tbody>
              {VILLAGE_FIELDS.map((f) => (
                <FigureInput key={f} field={f} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-ghost" onClick={getSoil} disabled={soilState === 'loading' || village.lat == null}>
            {soilState === 'loading' ? t('carbon.soilFetching') : t('carbon.soilFetch')}
          </button>
          <span className="small" role="status" aria-live="polite">
            {village.lat == null && t('carbon.soilNoCoords')}
            {soilState === 'ok' && <span className="pos">{t('carbon.soilOk')}</span>}
            {soilState === 'fail' && <span className="neg">{t('carbon.soilFailed')}</span>}
          </span>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t('carbon.potentialTitle')}</h2>
        <p className="muted mb-4">{t('carbon.potentialLede')}</p>
        <div className="table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">{t('carbon.colActivity')}</th>
                <th scope="col" className="amt">
                  {t('carbon.colRange')}
                </th>
                <th scope="col" style={{ minWidth: '8rem' }}>
                  <span className="sr-only">{t('carbon.colRange')}</span>
                </th>
                <th scope="col">{t('carbon.colCounted')}</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_KEYS.map((k) => {
                const r = est.byActivity[k]
                const counted = a.activities.includes(k)
                return (
                  <tr key={k}>
                    <td>{t(`act.${k}` as TKey)}</td>
                    <td className="amt">{tonnesRange(r)}</td>
                    <td>
                      <RangeStrip range={r} domain={[0, maxHigh]} label={t(`act.${k}` as TKey)} format={tonnes} />
                    </td>
                    <td className={counted ? 'pos font-semibold' : 'muted'}>{counted ? `✓ ${t('carbon.yes')}` : t('carbon.no')}</td>
                  </tr>
                )
              })}
              <tr className="total">
                <td>{t('carbon.total')}</td>
                <td className="amt">{tonnesRange(est.total)}</td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Callout kind="note">{t('carbon.notCredits')}</Callout>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t('carbon.stockTitle')}</h2>
        <p className="text-ink-2">{t('carbon.stockBody', { stock: num(Math.round(a.soilStock / 1000) * 1000) })}</p>
      </section>

      <details className="working section">
        <summary>{t('app.showWorking')}</summary>
        <div className="space-y-2 small">
          <p>
            <code>{t('carbon.working1', { share: pct(A.agroCommonShare.value) })}</code>
          </p>
          <p>
            <code>{t('carbon.working2')}</code>
          </p>
          <p>
            <code>{t('carbon.working3', { share: pct(A.croplandAdoption.value) })}</code>
          </p>
          <p>
            <code>{t('carbon.working4', { share: pct(A.pastureShare.value), factor: A.pastureFactor.value })}</code>
          </p>
          <p className="muted">{t('carbon.workingNote')}</p>
        </div>
      </details>

      <PageNav prev={['/overview', 'nav.overview']} next={['/methodology', 'nav.methodology']} />
    </article>
  )
}
