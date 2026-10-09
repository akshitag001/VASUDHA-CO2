import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import { PageHeader } from '../ui/bits'
import { ProvLegend } from '../ui/Prov'

export default function Guide() {
  const { t } = useApp()
  const ideas: [TKey, TKey][] = [
    ['guide.h1', 'guide.p1'],
    ['guide.h2', 'guide.p2'],
    ['guide.h3', 'guide.p3'],
    ['guide.h4', 'guide.p4'],
    ['guide.h5', 'guide.p5'],
  ]
  return (
    <article>
      <PageHeader kicker={t('guide.kicker')} title={t('guide.title')} lede={t('guide.lede')} />
      <div className="grid gap-6 max-w-3xl">
        {ideas.map(([h, p]) => (
          <section key={h} className="border-l-4 border-ink pl-5">
            <h2 className="text-xl mb-1">{t(h)}</h2>
            <p className="text-ink-2">{t(p)}</p>
            {h === 'guide.h4' && (
              <div className="mt-3">
                <ProvLegend />
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="section max-w-3xl">
        <h2 className="section-title mb-3">{t('guide.useTitle')}</h2>
        <ol className="list-decimal pl-6 space-y-2">
          {(['guide.use1', 'guide.use2', 'guide.use3', 'guide.use4', 'guide.use5', 'guide.use6', 'guide.use7'] as TKey[]).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ol>
        <p className="note mt-5">{t('guide.saved')}</p>
      </section>
    </article>
  )
}
