import { useMemo } from 'react'
import { type ExitTerms, type Ownership, type PaymentTiming, type Pricing } from '../engine'
import type { CostBearer, Scenario } from '../engine/types'
import type { TKey } from '../i18n'
import { inr } from '../lib/format'
import { offerResult } from '../model/analysis'
import { useApp } from '../state/AppState'
import { Callout, NumberField, PageHeader, PageNav, Seg, SliderField } from '../ui/bits'

const TONE = { below: 'is-loss', reasonable: 'is-mid', favourable: 'is-gain' } as const

export default function OfferPage() {
  const { t, lang, analysis, state, setOffer, resetOffer } = useApp()
  const o = state.offer
  const result = useMemo(() => (analysis ? offerResult(analysis, o) : null), [analysis, o])
  if (!analysis || !result) return null

  return (
    <article>
      <PageHeader kicker={t('offer.kicker')} title={t('offer.title')} lede={t('offer.lede')} step={[5, 8]} />
      <Callout kind="warn">
        <strong>{t('offer.disclaimer')}</strong> {state.offerCheckedAt ? '' : t('offer.exampleNote')}
      </Callout>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 mt-8 items-start">
        {/* Form */}
        <section aria-labelledby="offer-form" className="sheet grid gap-6">
          <div className="flex flex-wrap justify-between items-baseline gap-2">
            <h2 id="offer-form" className="section-title">
              {t('offer.formTitle')}
            </h2>
            <span className="prov prov-input" style={{ cursor: 'default' }}>
              {t('prov.input')}
            </span>
          </div>
          <SliderField
            label={t('offer.share')}
            value={o.communitySharePct}
            min={0}
            max={100}
            format={(v) => `${v}%`}
            onChange={(v) => setOffer({ communitySharePct: v })}
            hint={t('offer.shareHint')}
          />
          <SliderField label={t('offer.years')} value={o.contractYears} min={2} max={40} format={(v) => t('app.years', { n: v })} onChange={(v) => setOffer({ contractYears: v })} />
          <Seg<CostBearer>
            legend={t('offer.mrv')}
            value={o.mrvPaidBy}
            onChange={(v) => setOffer({ mrvPaidBy: v })}
            options={[
              { value: 'aggregator', label: t('money.bearer.aggregator') },
              { value: 'shared', label: t('money.bearer.shared') },
              { value: 'community', label: t('money.bearer.community') },
            ]}
          />
          <Seg<ExitTerms>
            legend={t('offer.exit')}
            value={o.exit}
            onChange={(v) => setOffer({ exit: v })}
            options={[
              { value: 'none', label: t('offer.exit.none') },
              { value: 'penalty', label: t('offer.exit.penalty') },
              { value: 'notice', label: t('offer.exit.notice') },
            ]}
          />
          <Seg<Pricing>
            legend={t('offer.pricing')}
            value={o.pricing}
            onChange={(v) => setOffer({ pricing: v })}
            options={[
              { value: 'floating', label: t('offer.pricing.floating') },
              { value: 'floating_floor', label: t('offer.pricing.floating_floor') },
              { value: 'fixed', label: t('offer.pricing.fixed') },
            ]}
          />
          {o.pricing === 'fixed' && <NumberField label={t('offer.fixedPrice')} value={o.fixedPrice} unit="₹" max={100000} onChange={(v) => setOffer({ fixedPrice: v })} />}
          {o.pricing === 'floating_floor' && <NumberField label={t('offer.floorPrice')} value={o.floorPrice} unit="₹" max={100000} onChange={(v) => setOffer({ floorPrice: v })} />}
          <Seg<Ownership>
            legend={t('offer.ownership')}
            value={o.ownership}
            onChange={(v) => setOffer({ ownership: v })}
            options={[
              { value: 'community', label: t('offer.own.community') },
              { value: 'joint', label: t('offer.own.joint') },
              { value: 'aggregator', label: t('offer.own.aggregator') },
              { value: 'unclear', label: t('offer.own.unclear') },
            ]}
          />
          <Seg<PaymentTiming>
            legend={t('offer.payment')}
            value={o.paymentTiming}
            onChange={(v) => setOffer({ paymentTiming: v })}
            options={[
              { value: 'annual', label: t('offer.pay.annual') },
              { value: 'on_issuance', label: t('offer.pay.on_issuance') },
              { value: 'unclear', label: t('offer.pay.unclear') },
            ]}
          />
          <NumberField label={t('offer.upfront')} value={o.upfrontPayment} unit="₹" max={1e9} onChange={(v) => setOffer({ upfrontPayment: v })} />
          {o.upfrontPayment > 0 && (
            <Seg<'advance' | 'grant'>
              legend={t('offer.upfrontKind')}
              value={o.upfrontIsAdvance ? 'advance' : 'grant'}
              onChange={(v) => setOffer({ upfrontIsAdvance: v === 'advance' })}
              options={[
                { value: 'advance', label: t('offer.upfront.advance') },
                { value: 'grant', label: t('offer.upfront.grant') },
              ]}
            />
          )}
          {state.offerCheckedAt && (
            <button type="button" className="btn-quiet justify-self-start" onClick={resetOffer}>
              {t('app.reset')}
            </button>
          )}
        </section>

        {/* Result */}
        <section aria-live="polite" className="grid gap-6 lg:sticky lg:top-20">
          <div className={`stamp ${TONE[result.verdict]}`}>
            <p className="kicker">{t('offer.kicker')}</p>
            <h2 className="stamp-title">{t(`offer.verdict.${result.verdict}` as TKey)}</h2>
            <p className="small muted mt-1">{t('offer.verdictLede')}</p>
          </div>

          <div>
            <h3 className="text-lg mb-2">{t('offer.incomeTitle', { n: o.contractYears })}</h3>
            <dl className="grid grid-cols-3 border-t border-ink">
              {(['low', 'mid', 'high'] as Scenario[]).map((s) => {
                const v = result.scenarios[s].netOverContract
                return (
                  <div key={s} className="py-3 pr-2 border-b border-rule">
                    <dt className="small muted">{t(`sc.${s}` as TKey)}</dt>
                    <dd className={`figure text-lg ${v < 0 ? 'neg' : ''}`}>{inr(v, lang)}</dd>
                  </div>
                )
              })}
            </dl>
            <p className="small muted mt-2">{t('offer.incomeNote')}</p>
          </div>

          <div>
            <h3 className="text-lg mb-2">{t('offer.reasonsTitle')}</h3>
            <ul className="space-y-1.5">
              {result.findings.map((f) => (
                <li key={f.id} className="flex gap-2 items-baseline">
                  <span aria-hidden="true" className={`figure ${f.effect > 0 ? 'pos' : 'neg'}`}>
                    {f.effect > 0 ? '+' : '−'}
                  </span>
                  <span>{t(`offer.f.${f.id}` as TKey, f.params)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-2">{t('offer.flagsTitle')}</h3>
            {result.redFlags.length === 0 ? (
              <p className="good">{t('offer.flagsNone')}</p>
            ) : (
              <ul className="space-y-2">
                {result.redFlags.map((f) => (
                  <li key={f.id} className={f.severity === 'high' ? 'alarm' : 'warn'} style={{ padding: '0.55rem 0.8rem' }}>
                    <span className="font-semibold">{t(f.severity === 'high' ? 'offer.sev.high' : 'offer.sev.medium')}:</span> {t(`offer.flag.${f.id}` as TKey, f.params)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="section">
        <h2 className="section-title">{t('offer.questionsTitle')}</h2>
        <p className="muted mb-3">{t('offer.questionsNote')}</p>
        <ol className="space-y-2 list-decimal pl-6">
          {result.questions.map((q) => (
            <li key={q}>{t(`offer.q.${q}` as TKey)}</li>
          ))}
        </ol>
      </section>

      <PageNav prev={['/money', 'nav.money']} next={['/pooling', 'nav.pooling']} />
    </article>
  )
}
