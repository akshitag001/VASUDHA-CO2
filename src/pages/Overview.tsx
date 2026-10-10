import { Link } from 'react-router-dom'
import { pick } from '../engine'
import type { TKey } from '../i18n'
import { inr, inrRange, num, tonnesRange } from '../lib/format'
import { useApp } from '../state/AppState'
import { RangeStrip } from '../ui/charts'
import { Callout, PageHeader, PageNav, Stat, VerdictStamp } from '../ui/bits'
import { ProvLegend } from '../ui/Prov'

export default function Overview() {
  const { t, lang, village, analysis, state } = useApp()
  if (!village || !analysis) return null
  const a = analysis
  const net = pick(a.scenarios, (r) => r.net)
  const perHH = pick(a.scenarios, (r) => r.netPerHousehold)
  const total = pick(a.scenarios, (r) => r.netOverContract)
  const credits = pick(a.scenarios, (r) => r.credits)
  const top = a.sensitivity.bars[0]
  const hasInput = Object.values(village.fields).some((f) => f.provenance === 'input')
  const name = lang === 'hi' ? village.nameHi : village.name
  const domain = (r: { low: number; high: number }): [number, number] => [Math.min(0, r.low), Math.max(0, r.high)]
  const fmt = (n: number) => inr(n, lang)

  return (
    <article>
      <PageHeader kicker={t('overview.kicker')} title={t('overview.title', { name })} step={[1, 8]} />

      {village.kind !== 'custom' && !hasInput && (
        <div className="mb-6">
          <Callout kind="warn">
            {t(village.kind === 'illustrative' ? 'kind.illustrativeNote' : 'kind.placeholderNote')}{' '}
            <Link to="/carbon">{t('kind.editLink')} →</Link>
          </Callout>
        </div>
      )}

      <VerdictStamp verdict={a.verdict}>
        <p className="small muted mt-3">
          {a.activities.length
            ? t('overview.counted', { list: a.activities.map((k) => t(`act.${k}` as TKey)).join(', ') })
            : t('overview.countedNone')}
        </p>
      </VerdictStamp>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6" aria-label={t('money.headline')}>
        <Stat label={`${t('overview.incomeHH')} · ${t('app.perYear')}`} value={inrRange(perHH, lang)} tone={perHH.mid < 0 ? 'neg' : undefined}>
          <RangeStrip range={perHH} domain={domain(perHH)} label={t('overview.incomeHH')} format={fmt} />
          <p className="small muted">
            {t('sc.mid')}: <span className="figure">{inr(perHH.mid, lang)}</span>
          </p>
        </Stat>
        <Stat label={`${t('overview.incomeTotal')} · ${t('app.perYear')}`} value={inrRange(net, lang)} tone={net.mid < 0 ? 'neg' : undefined}>
          <RangeStrip range={net} domain={domain(net)} label={t('overview.incomeTotal')} format={fmt} />
          <p className="small muted">
            {t('sc.mid')}: <span className="figure">{inr(net.mid, lang)}</span> · {t('overview.overContract', { n: state.settings.durationYears })}:{' '}
            <span className="figure">{inrRange(total, lang)}</span>
          </p>
        </Stat>
        <Stat label={t('overview.credits')} value={tonnesRange(credits)} sub={t('unit.creditsYr')} />
        <Stat label={t('overview.confidence')} value={`${a.confidence.overall}/100`} sub={`${t(`conf.${a.confidence.level}` as TKey)} · ${t('overview.confidenceNote')}`}>
          <Link to="/data" className="small">
            {t('data.confTitle')}
          </Link>
        </Stat>
      </section>
      <p className="small muted mt-3">{t('sc.explain')}</p>

      {top && top.swing > 0 && (
        <section className="section">
          <h2 className="section-title">{t('overview.drivers')}</h2>
          <p className="text-ink-2">
            {t('overview.driversBody', { factor: t(`money.factor.${top.factor}` as TKey), amount: inr(top.swing, lang) })}{' '}
            <Link to="/money">{t('nav.money')} →</Link>
          </p>
        </section>
      )}

      <section className="section">
        <h2 className="section-title mb-3">{t('overview.nextTitle')}</h2>
        <ol className="space-y-2">
          {(
            [
              ['/carbon', 'overview.next.carbon'],
              ['/offer', 'overview.next.offer'],
              ['/pooling', 'overview.next.pooling'],
              ['/brief', 'overview.next.brief'],
            ] as [string, TKey][]
          ).map(([to, k], i) => (
            <li key={to} className="flex gap-3 items-baseline">
              <span className="figure muted">{num(i + 1)}.</span>
              <Link to={to}>{t(k)}</Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="section">
        <ProvLegend />
      </div>

      <PageNav next={['/carbon', 'nav.carbon']} />
    </article>
  )
}
