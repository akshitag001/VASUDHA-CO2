import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { LANGS, type TKey } from '../i18n'
import { useApp } from '../state/AppState'

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
    <div role="group" aria-label={t('app.language')} className="seg flex-nowrap">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => setLang(l.code)}
          className="px-3 min-h-[2.4rem] text-sm"
          style={lang === l.code ? { background: '#1b1a17', color: '#f6f2ea', fontWeight: 600 } : { background: 'transparent' }}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

function Toc({ onNavigate }: { onNavigate?: () => void }) {
  const { t, village } = useApp()
  return (
    <nav aria-label={t('nav.groupWork')} className="toc">
      <p className="kicker px-3 mt-2 mb-1">{t('nav.groupWork')}</p>
      <ul>
        {WORK_NAV.map(([to, key], i) => (
          <li key={to}>
            {village ? (
              <NavLink to={to} onClick={onNavigate}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span>{t(key)}</span>
              </NavLink>
            ) : (
              <span className="flex gap-3 px-3 py-2 muted" aria-disabled="true">
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                {t(key)}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="kicker px-3 mt-6 mb-1">{t('nav.groupRef')}</p>
      <ul>
        {REF_NAV.map(([to, key]) => (
          <li key={to}>
            <NavLink to={to} onClick={onNavigate}>
              <span className="n">·</span>
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
      <div className="absolute inset-0" style={{ background: 'rgba(27,26,23,0.45)' }} onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={t('app.menu')} className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-paper-2 overflow-y-auto border-r border-rule">
        <div className="flex justify-between items-center p-3 border-b border-rule">
          <span className="serif text-lg">{t('app.name')}</span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  const place = village ? [village.block, village.district, village.state].filter(Boolean).join(', ') : ''

  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        {t('app.skip')}
      </a>
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
              <span className="font-semibold truncate">{lang === 'hi' ? village.nameHi : village.name}</span>
              {place && <span className="small muted truncate">{place}</span>}
              <VillageBadge />
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            {village && (
              <Link to="/select" className="small hidden sm:inline">
                {t('app.changeVillage')}
              </Link>
            )}
            <div className="hidden lg:block">
              <LangSwitch />
            </div>
          </div>
        </div>
      </header>
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
