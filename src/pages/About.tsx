import { ROLES } from '../data/regulatory'
import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import { PageHeader } from '../ui/bits'

export default function About() {
  const { t } = useApp()
  return (
    <article className="max-w-3xl">
<<<<<<< HEAD
      <PageHeader kicker={t('about.kicker')} title={t('about.title')} lede={t('about.p1')} art="gram-sabha" artWide />
=======
      <PageHeader kicker={t('about.kicker')} title={t('about.title')} lede={t('about.p1')} />
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
      <p className="text-ink-2">{t('about.p2')}</p>

      <section className="section">
        <h2 className="section-title mb-3">{t('about.limitsTitle')}</h2>
        <ul className="list-disc pl-6 space-y-1.5">
          {(['about.l1', 'about.l2', 'about.l3', 'about.l4', 'about.l5'] as TKey[]).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </section>

      <section className="section" lang="en">
        <h2 className="section-title mb-3">CCTS: who does what</h2>
        <dl className="border-t border-ink">
          {ROLES.map((r) => (
            <div key={r.role} className="border-b border-rule py-2 grid sm:grid-cols-[14rem_1fr] gap-x-4">
              <dt className="small muted">{r.role}</dt>
              <dd>
                {r.entity}{' '}
                {!r.verified && (
                  <span className="verify" title={t('prov.verifyTip')}>
                    {t('prov.verify')}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <p className="font-semibold mb-2">{t('app.disclaimer')}</p>
        <p className="small muted">{t('about.stack')}</p>
        <p className="small muted mt-1">{t('app.footer')}</p>
      </section>
    </article>
  )
}
