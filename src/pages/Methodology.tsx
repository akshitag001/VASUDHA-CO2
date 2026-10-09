import type { MatchCategory, MatchResult } from '../engine'
import type { TKey } from '../i18n'
import { num } from '../lib/format'
import { METHODOLOGY_NOTE } from '../model/analysis'
import { useApp } from '../state/AppState'
import { Callout, PageHeader, PageNav } from '../ui/bits'

function Card({ m }: { m: MatchResult }) {
  const { t, lang } = useApp()
  const e = m.entry
  return (
    <li className="sheet">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          {e.code !== '—' && <p className="kicker">{e.code}</p>}
          <h3 className="text-lg">{e.name[lang]}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="prov prov-input" style={{ cursor: 'default' }}>
            {t(`meth.status.${e.status}` as TKey)}
          </span>
          {!e.statusVerified && (
            <span className="verify" title={t('prov.verifyTip')}>
              {t('prov.verify')}
            </span>
          )}
        </div>
      </div>

      {m.conditions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {m.conditions.map(({ condition: c, actual, met }) => (
            <li key={c.metric + c.value} className="flex gap-3 items-baseline">
              <span aria-hidden="true" className={`figure ${met ? 'pos' : 'neg'}`}>
                {met ? '✓' : '✕'}
              </span>
              <span>
                <span className="sr-only">{met ? t('ready.yes') : t('ready.no')}: </span>
                {c.label[lang]}
                <span className="block small muted">
                  {t('meth.actual')}: <span className="figure">{num(actual, 1)}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {e.needs && <p className="text-ink-2 mt-2">{e.needs[lang]}</p>}
      {e.note && <p className="small mt-3 warn">{e.note}</p>}

      <p className="small muted mt-3 flex flex-wrap gap-x-4">
        <span>
          {t('meth.lastVerified')}: {e.lastVerified ?? <strong className="neg">{t('prov.verify')}</strong>}
        </span>
        <a href={e.sourceUrl} target="_blank" rel="noreferrer">
          {t('meth.officialSource')} ↗
        </a>
      </p>
    </li>
  )
}

function Group({ title, lede, items, empty }: { title: string; lede?: string; items: MatchResult[]; empty?: string }) {
  if (!items.length && !empty) return null
  return (
    <section className="section">
      <h2 className="section-title">
        {title} <span className="figure muted">({items.length})</span>
      </h2>
      {lede && <p className="muted mb-3">{lede}</p>}
      {items.length ? <ul className="grid gap-4 mt-3">{items.map((m) => <Card key={m.entry.id} m={m} />)}</ul> : <p className="muted">{empty}</p>}
    </section>
  )
}

export default function Methodology() {
  const { t, analysis } = useApp()
  if (!analysis) return null
  const by = (c: MatchCategory) => analysis.matches.filter((m) => m.category === c)

  return (
    <article>
      <PageHeader kicker={t('meth.kicker')} title={t('meth.title')} lede={t('meth.lede')} step={[3, 8]} />
      <Callout kind="alarm" title={t('prov.verify')}>
        {t('meth.listNote')}
        <span className="block small mt-1 muted" lang="en">
          {METHODOLOGY_NOTE}
        </span>
      </Callout>

      <Group title={t('meth.eligible')} items={by('eligible')} empty={t('meth.eligibleNone')} />
      <Group title={t('meth.future')} lede={t('meth.futureLede')} items={by('future')} />
      <Group title={t('meth.unmet')} items={by('unmet')} />
      <Group title={t('meth.needsInfo')} items={by('needs_info')} />

      <p className="small muted mt-6">{t('meth.thresholdNote')}</p>
      <PageNav prev={['/carbon', 'nav.carbon']} next={['/money', 'nav.money']} />
    </article>
  )
}
