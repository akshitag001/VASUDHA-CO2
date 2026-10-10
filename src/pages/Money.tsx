import { useId } from 'react'
import { ASSUMPTIONS as A } from '../config/assumptions'
import { pick, type ScenarioResult } from '../engine'
import type { CostBearer, Scenario } from '../engine/types'
import type { TKey } from '../i18n'
import { inr, inrRange, num, pct } from '../lib/format'
import { changedSettings } from '../model/analysis'
import { useApp } from '../state/AppState'
import { AsmTag, Callout, NumberField, PageHeader, PageNav, Seg, SliderField, Stat } from '../ui/bits'
import { RangeStrip, Tornado } from '../ui/charts'
import { Ledger } from '../ui/Ledger'

const SCEN: Scenario[] = ['low', 'mid', 'high']

export default function Money() {
  const { t, lang, analysis, state, setSettings, resetSettings } = useApp()
  const futureId = useId()
  if (!analysis) return null
  const a = analysis
  const s = state.settings
  const ch = changedSettings(s)
  const net = pick(a.scenarios, (r) => r.net)
  const perHH = pick(a.scenarios, (r) => r.netPerHousehold)
  const fmt = (n: number) => inr(n, lang)
  const be = a.breakEven
  const anyChanged = Object.values(ch).some(Boolean)

  const rows: [TKey, (r: ScenarioResult) => string, boolean?][] = [
    ['money.row.credits', (r) => num(r.credits)],
    ['money.row.price', (r) => inr(r.price, lang)],
    ['money.row.gross', (r) => inr(r.gross, lang)],
    ['money.row.aggCut', (r) => `− ${inr(r.aggregatorCut, lang)}`],
    ['money.row.costs', (r) => `− ${inr(r.costsToVillage, lang)}`],
    ['money.row.net', (r) => inr(r.net, lang), true],
    ['money.row.netHH', (r) => inr(r.netPerHousehold, lang)],
    ['money.row.overContract', (r) => inr(r.netOverContract, lang)],
  ]

  const factorInput = (f: string, v: number) =>
    f === 'price' ? inr(v, lang) : f === 'costs' ? (v === 0 ? t('money.priceLow') : t('money.priceHigh')) : f === 'mitigation' ? `${num(v)} t` : pct(v)

  return (
    <article>
      <PageHeader kicker={t('money.kicker')} title={t('money.title')} lede={t('money.lede')} step={[4, 8]} art="money" />

      <section className="grid sm:grid-cols-2 gap-4" aria-live="polite">
        <Stat label={t('money.headline')} value={inrRange(net, lang)} tone={net.mid < 0 ? 'neg' : undefined}>
          <RangeStrip range={net} domain={[Math.min(0, net.low), Math.max(0, net.high)]} label={t('money.headline')} format={fmt} />
          <p className="small muted">
            {t('sc.mid')}: <span className="figure">{inr(net.mid, lang)}</span>
          </p>
        </Stat>
        <Stat label={t('money.headlineHH')} value={inrRange(perHH, lang)} tone={perHH.mid < 0 ? 'neg' : undefined}>
          <RangeStrip range={perHH} domain={[Math.min(0, perHH.low), Math.max(0, perHH.high)]} label={t('money.headlineHH')} format={fmt} />
          <p className="small muted">
            {t('sc.mid')}: <span className="figure">{inr(perHH.mid, lang)}</span>
          </p>
        </Stat>
      </section>
      {a.activities.length === 0 && (
        <div className="mt-4">
          <Callout kind="alarm">{t('money.noActivities')}</Callout>
        </div>
      )}

      {/* Inputs */}
      <section className="section">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <h2 className="section-title">{t('money.settingsTitle')}</h2>
          {anyChanged && (
            <button type="button" className="btn-quiet" onClick={resetSettings}>
              {t('app.reset')}
            </button>
          )}
        </div>
        <div className="sheet grid gap-6">
          <fieldset>
            <legend className="label flex flex-wrap items-center gap-2">
              {t('money.price')} <AsmTag id="carbonPrice" changed={ch.price} />
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'mid', 'high'] as Scenario[]).map((k) => (
                <NumberField
                  key={k}
                  label={<span className="font-normal">{t(k === 'low' ? 'money.priceLow' : k === 'mid' ? 'money.priceMid' : 'money.priceHigh')}</span>}
                  value={s.price[k]}
                  unit="₹"
                  max={100000}
                  onChange={(v) => setSettings({ price: { ...s.price, [k]: v } })}
                />
              ))}
            </div>
            <span className="hint">{t('money.priceHint')}</span>
          </fieldset>

          <div className="grid md:grid-cols-2 gap-6">
            <SliderField
              label={t('money.fraction')}
              tag={<AsmTag id="creditableFraction" changed={ch.creditableFraction} />}
              value={Math.round(s.creditableFraction * 100)}
              min={30}
              max={100}
              format={(v) => `${v}%`}
              onChange={(v) => setSettings({ creditableFraction: v / 100 })}
              hint={t('money.fractionHint')}
            />
            <SliderField
              label={t('money.share')}
              tag={<AsmTag id="aggregatorShare" changed={ch.aggregatorShare} />}
              value={Math.round(s.aggregatorShare * 100)}
              min={0}
              max={70}
              format={(v) => `${v}%`}
              onChange={(v) => setSettings({ aggregatorShare: v / 100 })}
            />
            <SliderField
              label={t('money.duration')}
              tag={<AsmTag id="contractYears" changed={ch.durationYears} />}
              value={s.durationYears}
              min={A.contractYears.low}
              max={A.contractYears.high}
              format={(v) => t('app.years', { n: v })}
              onChange={(v) => setSettings({ durationYears: v })}
            />
            <Seg<CostBearer>
              legend={t('money.bearer')}
              value={s.costBearer}
              onChange={(v) => setSettings({ costBearer: v })}
              options={[
                { value: 'community', label: t('money.bearer.community') },
                { value: 'shared', label: t('money.bearer.shared') },
                { value: 'aggregator', label: t('money.bearer.aggregator') },
              ]}
            />
          </div>
          <div className="flex gap-3 items-start">
            <input id={futureId} type="checkbox" checked={s.includeFuture} onChange={(e) => setSettings({ includeFuture: e.target.checked })} className="mt-1" />
            <label htmlFor={futureId}>
              <span className="font-semibold">{t('money.includeFuture')}</span>
              <span className="hint">{t('money.includeFutureHint')}</span>
            </label>
          </div>
        </div>
      </section>

      {/* Scenario table */}
      <section className="section">
        <h2 className="section-title mb-1">{t('money.scenarioTitle')}</h2>
        <p className="muted mb-3">{t('sc.explain')}</p>
        <div className="table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{t('carbon.colField')}</span>
                </th>
                {SCEN.map((k) => (
                  <th key={k} scope="col" className="amt">
                    {t(`sc.${k}` as TKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, f, total]) => (
                <tr key={k} className={total ? 'total' : undefined}>
                  <th scope="row" className="font-normal">
                    {t(k)}
                  </th>
                  {SCEN.map((sc) => {
                    const r = a.scenarios[sc]
                    const negative = (k === 'money.row.net' || k === 'money.row.netHH' || k === 'money.row.overContract') && r.net < 0
                    return (
                      <td key={sc} className={`amt ${negative ? 'neg' : ''}`}>
                        {f(r)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <Ledger r={a.scenarios.mid} input={a.finance} caption={t('money.ledgerTitle')} />
      </section>

      {/* Break-even */}
      <section className="section">
        <h2 className="section-title mb-2">{t('money.breakEvenTitle')}</h2>
        {be.creditsNeeded === 0 ? (
          <p>{t('money.breakEven.noCosts')}</p>
        ) : be.creditsNeeded == null ? (
          <Callout kind="alarm">{t('money.breakEven.impossible')}</Callout>
        ) : (
          <div className={be.clears ? 'good' : 'warn'}>
            <p>
              {t('money.breakEven.need', { credits: num(be.creditsNeeded) })} {t('money.breakEven.have', { credits: num(a.scenarios.mid.credits) })}
            </p>
            {be.clears ? (
              <p className="font-semibold mt-1">{t('money.breakEven.clears')}</p>
            ) : (
              <>
                <p className="font-semibold mt-1">
                  {t('money.breakEven.short', { factor: be.scaleFactor && Number.isFinite(be.scaleFactor) ? num(be.scaleFactor, 1) : '—' })}
                </p>
                {be.agroforestryHaNeeded != null && be.cattleNeeded != null && (
                  <p className="mt-1">{t('money.breakEven.equiv', { ha: num(Math.ceil(be.agroforestryHaNeeded / 10) * 10), cattle: num(Math.ceil(be.cattleNeeded / 100) * 100) })}</p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Sensitivity */}
      <section className="section">
        <h2 className="section-title mb-1">{t('money.tornadoTitle')}</h2>
        <p className="muted mb-4">{t('money.tornadoLede')}</p>
        <p className="small mb-2">{t('money.tornadoAxis', { base: inr(a.sensitivity.base, lang) })}</p>
        <Tornado
          bars={a.sensitivity.bars.map((b) => ({
            label: t(`money.factor.${b.factor}` as TKey),
            netAtLow: b.netAtLow,
            netAtHigh: b.netAtHigh,
            lowLabel: factorInput(b.factor, b.lowInput),
            highLabel: factorInput(b.factor, b.highInput),
          }))}
          base={a.sensitivity.base}
          format={fmt}
          lowEnd={t('money.tornadoLowEnd')}
          highEnd={t('money.tornadoHighEnd')}
          legend={[t('money.lowerThanCentral'), t('money.higherThanCentral')]}
        />
        <details className="working mt-4">
          <summary>{t('app.tableView')}</summary>
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th scope="col">{t('carbon.colField')}</th>
                  <th scope="col" className="amt">
                    {t('money.tornadoLowEnd')}
                  </th>
                  <th scope="col" className="amt">
                    {t('money.tornadoHighEnd')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {a.sensitivity.bars.map((b) => (
                  <tr key={b.factor}>
                    <th scope="row" className="font-normal">
                      {t(`money.factor.${b.factor}` as TKey)}
                    </th>
                    <td className="amt">
                      {factorInput(b.factor, b.lowInput)} → {inr(b.netAtLow, lang)}
                    </td>
                    <td className="amt">
                      {factorInput(b.factor, b.highInput)} → {inr(b.netAtHigh, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <PageNav prev={['/methodology', 'nav.methodology']} next={['/offer', 'nav.offer']} />
    </article>
  )
}
