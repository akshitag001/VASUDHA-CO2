import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TKey } from '../i18n'
import { analyse, DEFAULT_SETTINGS } from '../model/analysis'
import { resolveVillage } from '../model/village'
import { useApp } from '../state/AppState'
import type { DemoId } from '../state/store'
import { LangSwitch } from '../ui/Layout'
import { Ledger } from '../ui/Ledger'

const DEMO_ORDER: DemoId[] = ['small', 'medium', 'pool']

export default function Landing() {
  const { t, loadDemo } = useApp()
  const navigate = useNavigate()

  // Computed live, by the same engine, so the numbers always match the tool.
  const specimen = useMemo(() => {
    const v = resolveVillage('143892')
    return v ? analyse(v, DEFAULT_SETTINGS) : null
  }, [])

  const open = (d: DemoId) => navigate(loadDemo(d))

  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        {t('app.skip')}
      </a>
      <header className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[3.75rem] py-2 flex flex-wrap items-center justify-between gap-3">
          <span className="serif text-xl">
            VASUDHA <span className="figure">CO₂</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/guide" className="small hidden sm:inline">
              {t('app.howToRead')}
            </Link>
            <LangSwitch />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Masthead */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 grid lg:grid-cols-[1.25fr_1fr] gap-10 items-start">
          <div>
            <p className="kicker mb-4">{t('landing.kicker')}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6" style={{ lineHeight: 1.08 }}>
              {t('landing.h1')}
            </h1>
            <p className="lede mb-8">{t('landing.lede')}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/select" className="btn">
                {t('landing.start')} →
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => open('medium')}>
                {t('landing.demo')}
              </button>
            </div>
          </div>

          {specimen && (
            <figure className="sheet" style={{ boxShadow: '6px 6px 0 #d6cdbb' }}>
              <figcaption className="kicker mb-3">{t('landing.specimenTitle')}</figcaption>
              <Ledger r={specimen.scenarios.mid} input={specimen.finance} caption="Jamgaon, Mandla" />
              <p className="small muted mt-3">{t('landing.specimenNote')}</p>
            </figure>
          )}
        </section>

        {/* Demos */}
        <section className="border-y border-rule bg-paper-2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h2 className="text-2xl mb-1">{t('landing.demosTitle')}</h2>
            <p className="muted mb-6">{t('landing.demosNote')}</p>
            <ol className="grid md:grid-cols-3 gap-4">
              {DEMO_ORDER.map((d, i) => (
                <li key={d} className="sheet flex flex-col">
                  <span className="kicker mb-2">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-xl mb-2">{t(`landing.demo.${d}.title` as TKey)}</h3>
                  <p className="text-ink-2 mb-4 flex-1">{t(`landing.demo.${d}.desc` as TKey)}</p>
                  <button type="button" className="btn btn-ghost self-start" onClick={() => open(d)}>
                    {t('landing.open')} →
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Does / does not */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl mb-4">{t('landing.doesTitle')}</h2>
            <ul className="space-y-3">
              {(['landing.does1', 'landing.does2', 'landing.does3', 'landing.does4', 'landing.does5'] as TKey[]).map((k) => (
                <li key={k} className="flex gap-3">
                  <span aria-hidden="true" className="figure pos">
                    ✓
                  </span>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl mb-4">{t('landing.doesNotTitle')}</h2>
            <ul className="space-y-3">
              {(['landing.doesNot1', 'landing.doesNot2', 'landing.doesNot3', 'landing.doesNot4'] as TKey[]).map((k) => (
                <li key={k} className="flex gap-3">
                  <span aria-hidden="true" className="figure neg">
                    ✕
                  </span>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <h2 className="text-2xl mb-6">{t('landing.stepsTitle')}</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-ink">
            {(['landing.step1', 'landing.step2', 'landing.step3', 'landing.step4'] as TKey[]).map((k, i) => (
              <li key={k} className="py-5 pr-6 border-b border-rule lg:border-b-0">
                <span className="figure-lg block mb-2">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-ink-2">{t(k)}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 small">
          <p className="font-semibold mb-2">{t('app.disclaimer')}</p>
          <p className="muted flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/assumptions">{t('nav.assumptions')}</Link>
            <Link to="/data">{t('nav.data')}</Link>
            <span>{t('app.footer')}</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
