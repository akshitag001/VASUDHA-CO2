import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { LANGS, type TKey } from '../i18n'
import { useApp } from '../state/AppState'
<<<<<<< HEAD
import { Art, Logo, Sketch, useScrolled } from './motion'
=======
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97

const WORK_NAV: [string, TKey][] = [
  ['/overview', 'nav.overview'],
  ['/carbon', 'nav.carbon'],
  ['/methodology', 'nav.methodology'],
  ['/money', 'nav.money'],
  ['/offer', 'nav.offer'],
  ['/pooling', 'nav.pooling'],
  ['/readiness', 'nav.readiness'],
  ['/brief', 'nav.brief'],
]

const REF_NAV: [string, TKey][] = [
  ['/guide', 'nav.guide'],
  ['/assumptions', 'nav.assumptions'],
  ['/data', 'nav.data'],
  ['/about', 'nav.about'],
]

export function LangSwitch() {
  const { lang, setLang, t } = useApp()
  return (
<<<<<<< HEAD
    <div role="group" aria-label={t('app.language')} className="seg flex-nowrap" style={{ gap: '0.25rem' }}>
=======
    <div role="group" aria-label={t('app.language')} className="seg flex-nowrap">
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => setLang(l.code)}
<<<<<<< HEAD
          className="text-sm"
          style={{ minHeight: '2.2rem', padding: '0.25rem 0.7rem' }}
=======
          className="px-3 min-h-[2.4rem] text-sm"
          style={lang === l.code ? { background: '#1b1a17', color: '#f6f2ea', fontWeight: 600 } : { background: 'transparent' }}
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

function Toc({ onNavigate }: { onNavigate?: () => void }) {
  const { t, village } = useApp()
<<<<<<< HEAD
  const loc = useLocation()
  const idx = WORK_NAV.findIndex(([to]) => to === loc.pathname)
  return (
    <nav aria-label={t('nav.groupWork')} className="toc">
      <p className="kicker px-4 mt-2 mb-2">{t('nav.groupWork')}</p>
      {idx >= 0 && (
        <div className="mx-4 mb-3 h-1.5 rounded-full bg-paper overflow-hidden border border-rule" aria-hidden="true">
          <div className="h-full bg-ink rounded-full transition-all duration-700" style={{ width: `${((idx + 1) / WORK_NAV.length) * 100}%` }} />
        </div>
      )}
=======
  return (
    <nav aria-label={t('nav.groupWork')} className="toc">
      <p className="kicker px-3 mt-2 mb-1">{t('nav.groupWork')}</p>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
      <ul>
        {WORK_NAV.map(([to, key], i) => (
          <li key={to}>
            {village ? (
<<<<<<< HEAD
              <NavLink to={to} viewTransition onClick={onNavigate}>
=======
              <NavLink to={to} onClick={onNavigate}>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span>{t(key)}</span>
              </NavLink>
            ) : (
<<<<<<< HEAD
              <span className="flex gap-3 items-center px-4 py-2 muted" aria-disabled="true">
=======
              <span className="flex gap-3 px-3 py-2 muted" aria-disabled="true">
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                {t(key)}
              </span>
            )}
          </li>
        ))}
      </ul>
<<<<<<< HEAD
      <p className="kicker px-4 mt-7 mb-2">{t('nav.groupRef')}</p>
      <ul>
        {REF_NAV.map(([to, key]) => (
          <li key={to}>
            <NavLink to={to} viewTransition onClick={onNavigate}>
              <span className="n">✦</span>
=======
      <p className="kicker px-3 mt-6 mb-1">{t('nav.groupRef')}</p>
      <ul>
        {REF_NAV.map(([to, key]) => (
          <li key={to}>
            <NavLink to={to} onClick={onNavigate}>
              <span className="n">·</span>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
              <span>{t(key)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('a,button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('a[href],button')]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
<<<<<<< HEAD
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(26,51,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={t('app.menu')}
        className="drawer-in absolute left-2 top-2 bottom-2 w-[85vw] max-w-xs bg-paper overflow-y-auto border border-ink rounded-[18px]"
        style={{ boxShadow: '6px 6px 0 #1a3300' }}
      >
        <div className="flex justify-between items-center p-3 border-b border-rule">
          <Logo />
          <button type="button" className="btn btn-ghost" style={{ minHeight: '2.3rem', padding: '0.3rem 0.8rem' }} onClick={onClose}>
=======
      <div className="absolute inset-0" style={{ background: 'rgba(27,26,23,0.45)' }} onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={t('app.menu')} className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-paper-2 overflow-y-auto border-r border-rule">
        <div className="flex justify-between items-center p-3 border-b border-rule">
          <span className="serif text-lg">{t('app.name')}</span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
            {t('app.close')}
          </button>
        </div>
        <div className="p-3">
          <LangSwitch />
        </div>
        <Toc onNavigate={onClose} />
      </div>
    </div>
  )
}

export function VillageBadge() {
  const { village, t } = useApp()
  if (!village) return null
  const kindKey: TKey = village.kind === 'illustrative' ? 'kind.illustrative' : village.kind === 'placeholder' ? 'kind.placeholder' : 'kind.custom'
  const hasInput = Object.values(village.fields).some((f) => f.provenance === 'input')
  return (
    <span className={`prov ${village.kind === 'custom' || hasInput ? 'prov-input' : 'prov-assumption'}`} style={{ cursor: 'default' }}>
      {t(kindKey)}
    </span>
  )
}

export default function Layout() {
  const { t, village, lang } = useApp()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const mainRef = useRef<HTMLElement>(null)
<<<<<<< HEAD
  const scrolled = useScrolled(8)
=======
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  const place = village ? [village.block, village.district, village.state].filter(Boolean).join(', ') : ''

  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        {t('app.skip')}
      </a>
<<<<<<< HEAD

      {/* Glass top bar */}
      <header className="no-print sticky top-0 z-40 px-2 sm:px-3 pt-2">
        <div data-scrolled={scrolled} className="nav-pill glass rounded-[16px] flex items-center gap-3 px-3 lg:px-4 min-h-[3.6rem] py-2">
          <button
            type="button"
            className="btn btn-ghost lg:hidden"
            style={{ minHeight: '2.4rem', padding: '0.3rem 0.8rem' }}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            ☰ <span className="sr-only sm:not-sr-only">{t('app.menu')}</span>
          </button>
          <Link to="/" className="shrink-0" style={{ textDecoration: 'none' }} aria-label="VASUDHA CO2 home">
            <Logo />
          </Link>
          {village && (
            <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-rule min-w-0">
              <span className="inline-block w-2 h-2 rounded-full bg-ink shrink-0" aria-hidden="true" style={{ boxShadow: '0 0 0 4px #d5f5c2' }} />
=======
      <header className="no-print border-b border-ink bg-paper sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 lg:px-6 min-h-[3.75rem] py-2">
          <button type="button" className="btn btn-ghost lg:hidden" aria-expanded={open} onClick={() => setOpen(true)}>
            ☰ <span className="sr-only sm:not-sr-only">{t('app.menu')}</span>
          </button>
          <Link to="/" className="serif text-xl no-underline text-ink shrink-0" style={{ textDecoration: 'none' }}>
            VASUDHA <span className="figure">CO₂</span>
          </Link>
          {village && (
            <div className="hidden md:flex items-center gap-2 border-l border-rule pl-3 min-w-0">
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
              <span className="font-semibold truncate">{lang === 'hi' ? village.nameHi : village.name}</span>
              {place && <span className="small muted truncate">{place}</span>}
              <VillageBadge />
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            {village && (
<<<<<<< HEAD
              <Link to="/select" className="nav-link hidden sm:inline-flex">
                ↺ {t('app.changeVillage')}
=======
              <Link to="/select" className="small hidden sm:inline">
                {t('app.changeVillage')}
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
              </Link>
            )}
            <div className="hidden lg:block">
              <LangSwitch />
            </div>
          </div>
        </div>
      </header>
<<<<<<< HEAD

      <Drawer open={open} onClose={() => setOpen(false)} />

      <div className="lg:grid lg:grid-cols-[16.5rem_1fr] gap-4 px-2 sm:px-3">
        <aside className="hidden lg:block no-print">
          <div className="sticky top-[4.6rem] mt-3 py-4 max-h-[calc(100vh-5.6rem)] overflow-y-auto rounded-[18px] border border-rule bg-paper-2">
            <Toc />
            <div className="mx-3 mt-6 p-4 rounded-[14px] bg-yellow border border-ink relative overflow-hidden">
              <Sketch kind="leaf" className="absolute -right-3 -bottom-3 w-20" style={{ opacity: 0.25 }} />
              <p className="kicker" style={{ color: '#1a3300' }}>
                {t('nav.guide')}
              </p>
              <Link to="/guide" className="font-semibold text-sm relative">
                {t('app.howToRead')} →
              </Link>
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <main id="main" ref={mainRef} tabIndex={-1} className="print-root px-2 sm:px-6 lg:px-10 py-10 max-w-[64rem] outline-none">
            <div key={loc.pathname} className="page-enter">
              <Outlet />
            </div>
          </main>
          <Art name="footer-strip" className="mx-2 sm:mx-6 lg:mx-10 mt-10 -mb-1 max-w-[62rem] w-[calc(100%-1rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-5rem)]" />
          <footer className="no-print mx-2 sm:mx-6 lg:mx-10 mb-6 p-6 rounded-[18px] bg-ink max-w-[62rem] small" style={{ color: '#cfd8c4' }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <span className="display text-2xl" style={{ color: '#fcfaf5' }}>
                VASUDHA <span style={{ color: '#ffe95c' }}>CO₂</span>
              </span>
              <span className="chip" style={{ background: 'transparent', color: '#ffe95c', borderColor: '#3a4a28' }}>
                ● runs in your browser
              </span>
            </div>
            <p className="mb-3" style={{ color: '#fcfaf5' }}>
              <strong>{t('app.disclaimer')}</strong>
            </p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <Link to="/guide" style={{ color: '#fcfaf5' }}>
                {t('app.howToRead')}
              </Link>
              <Link to="/assumptions" style={{ color: '#fcfaf5' }}>
                {t('nav.assumptions')}
              </Link>
              <Link to="/data" style={{ color: '#fcfaf5' }}>
                {t('nav.data')}
              </Link>
=======
      <Drawer open={open} onClose={() => setOpen(false)} />
      <div className="lg:grid lg:grid-cols-[15.5rem_1fr]">
        <aside className="hidden lg:block no-print border-r border-rule bg-paper-2 min-h-[calc(100vh-3.75rem)]">
          <div className="sticky top-[3.75rem] py-4 max-h-[calc(100vh-3.75rem)] overflow-y-auto">
            <Toc />
          </div>
        </aside>
        <div className="min-w-0">
          <main id="main" ref={mainRef} tabIndex={-1} className="print-root px-4 sm:px-6 lg:px-10 py-8 max-w-[62rem] outline-none">
            <Outlet />
          </main>
          <footer className="no-print px-4 sm:px-6 lg:px-10 py-6 border-t border-rule max-w-[62rem] small muted">
            <p className="text-ink-2 mb-2">
              <strong>{t('app.disclaimer')}</strong>
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <Link to="/guide">{t('app.howToRead')}</Link>
              <Link to="/assumptions">{t('nav.assumptions')}</Link>
              <Link to="/data">{t('nav.data')}</Link>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
              <span>{t('app.footer')}</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export function RequireVillage({ children }: { children: ReactNode }) {
  const { village } = useApp()
  if (!village) return <Navigate to="/select" replace />
  return <>{children}</>
}
