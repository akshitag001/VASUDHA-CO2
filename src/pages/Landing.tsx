import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TKey } from '../i18n'
import { analyse, DEFAULT_SETTINGS } from '../model/analysis'
import { resolveVillage } from '../model/village'
import { useApp } from '../state/AppState'
import type { DemoId } from '../state/store'
import { LangSwitch } from '../ui/Layout'
import { HERO_LQIP } from '../ui/heroLqip'
import { Ledger } from '../ui/Ledger'
import { Art, Divider, Logo, Preloader, ScrollDoodle, ScrollText, Sketch, SpinBadge, SplitWords, Tilt, artUrl, useMedia, useProgress, useScrolled, type ArtName } from '../ui/motion'

const DEMO_ORDER: DemoId[] = ['small', 'medium', 'pool']
const DEMO_TONE = ['bg-pink', 'bg-yellow', 'bg-mint']
const DEMO_TILT = ['-1.2deg', '0.8deg', '-0.6deg']
const STEPS: { k: TKey; art: ArtName; tone: string }[] = [
  { k: 'landing.step1', art: 'select-corner', tone: 'bg-teal' },
  { k: 'landing.step2', art: 'soil-carbon', tone: 'bg-card' },
  { k: 'landing.step3', art: 'money', tone: 'bg-blush' },
  { k: 'landing.step4', art: 'gram-sabha', tone: 'bg-card' },
]
const MARQUEE = ['Soil carbon', 'Agroforestry', 'Livestock methane', 'CCTS methodologies', 'Aggregator offers', 'Village pooling', 'Gram Sabha brief', 'Runs in your browser']

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

function Tape({ items, tone, tilt, reverse }: { items: string[]; tone: string; tilt: string; reverse?: boolean }) {
  return (
    <div className={`border-y border-ink py-3.5 ${tone}`} style={{ transform: `rotate(${tilt})`, margin: '0 -3rem' }}>
      <div className="marquee">
        {[0, 1].map((k) => (
          <div key={k} className="marquee-track" style={reverse ? { animationDirection: 'reverse', animationDuration: '40s' } : undefined}>
            {items.map((m) => (
              <span key={m} className="display text-2xl sm:text-3xl whitespace-nowrap flex items-center gap-10" style={{ letterSpacing: '0.04em' }}>
                {m} <span className="text-xl">✺</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  const { t, loadDemo } = useApp()
  const navigate = useNavigate()
  const scrolled = useScrolled(40)
  const wide = useMedia('(min-width: 768px)')
  // Flip the hero's loaded class straight on the DOM node: no React re-render of the whole page.
  const heroImg = useRef<HTMLImageElement>(null)
  const markHeroLoaded = () => heroImg.current?.parentElement?.classList.add('is-loaded')
  // A cached image can finish before React attaches onLoad.
  useEffect(() => {
    if (heroImg.current?.complete && heroImg.current.naturalWidth) markHeroLoaded()
  }, [])

  // Computed live, by the same engine, so the numbers always match the tool.
  const specimen = useMemo(() => {
    const v = resolveVillage('143892')
    return v ? analyse(v, DEFAULT_SETTINGS) : null
  }, [])

  const open = (id: DemoId) => navigate(loadDemo(id), { viewTransition: true })
  const h1 = t('landing.h1')
  const lastWord = h1.split(' ').length - 1
  const does3 = t('landing.does3').split(' ')

  // Pointer parallax for the hero: writes --mx / --my in [-1, 1].
  const onHeroMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }

  // Pinned horizontal "how it works": the section is as tall as the track is wide.
  const pinRef = useProgress<HTMLElement>('pin')
  const trackRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const sec = pinRef.current
    const track = trackRef.current
    if (!sec || !track) return
    const measure = () => {
      if (!wide) {
        sec.style.height = ''
        sec.style.setProperty('--dist', '0')
        return
      }
      const dist = Math.max(0, track.scrollWidth - window.innerWidth)
      sec.style.setProperty('--dist', String(dist))
      sec.style.height = `${window.innerHeight + dist}px`
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [wide, pinRef])

  const wordRef = useProgress<HTMLParagraphElement>('enter')

  return (
    <div className="min-h-screen">
      <Preloader />
      <a href="#main" className="skip-link">
        {t('app.skip')}
      </a>

      {/* Floating glass nav — compacts once you scroll */}
      <header className="no-print fixed top-0 inset-x-0 z-50 px-3 sm:px-5 pt-3">
        <div
          data-scrolled={scrolled}
          className={`nav-pill glass mx-auto flex items-center justify-between gap-3 rounded-[16px] ${scrolled ? 'max-w-5xl px-3 py-2' : 'max-w-6xl px-4 py-2.5'}`}
        >
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="VASUDHA CO2 home">
            <Logo />
          </Link>
          <nav className="hidden lg:flex items-center gap-1" aria-label="Sections">
            <a href="#how" className="nav-link">
              {t('landing.stepsTitle')}
            </a>
            <a href="#demos" className="nav-link">
              {t('landing.demosTitle')}
            </a>
            <Link to="/guide" viewTransition className="nav-link">
              {t('nav.guide')}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <Link to="/select" viewTransition data-magnetic className="btn" style={{ minHeight: '2.4rem', padding: '0.45rem 1rem', fontSize: '0.88rem' }}>
              <span className="hidden sm:inline">{t('landing.start')}</span>
              <span className="sm:hidden">{t('app.chooseVillage')}</span> <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* ================================================= HERO
            Three depths: pastel blobs (follow the pointer, rise fast), copy (rises + fades),
            countryside drawing (sinks slowly + grows). Copy never sits on the drawing. */}
        <section className="hero relative overflow-hidden" onPointerMove={onHeroMove}>
          <div className="hero-blobs absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="blob" style={{ width: 440, height: 440, left: '-8%', top: '4%', background: '#ffe95c' }} />
            <div className="blob" style={{ width: 400, height: 400, right: '-6%', top: '10%', background: '#f6d0ff' }} />
            <div className="blob" style={{ width: 340, height: 340, left: '34%', top: '38%', background: '#a8e5e5', opacity: 0.5 }} />
            <div className="blob" style={{ width: 260, height: 260, right: '20%', top: '46%', background: '#ffdcc2', opacity: 0.7 }} />
          </div>

          <div className="hero-copy relative max-w-6xl mx-auto px-4 sm:px-6 pt-36 sm:pt-44 text-center">
            {/* Margin atmospheric sketchbook doodles */}
            <div className="hidden xl:block absolute left-4 2xl:left-8 top-52 opacity-30 doodle-float-1 pointer-events-none" aria-hidden="true">
              <Sketch kind="sprout" className="w-16 h-16" />
            </div>
            <div className="hidden xl:block absolute right-4 2xl:right-8 top-56 opacity-30 doodle-float-2 pointer-events-none" aria-hidden="true">
              <Sketch kind="loop" className="w-20 h-20" />
            </div>

            <div data-reveal>
              <span className="badge mb-8 inline-flex items-center gap-1.5">
                <span aria-hidden="true">✦</span> {t('landing.kicker')}
                <Sketch kind="sparkle" className="w-4 h-4 ml-1 opacity-50 doodle-pulse inline-block" />
              </span>
            </div>
            <h1 className="display display-xl mx-auto max-w-5xl mb-8" data-reveal style={{ transform: 'none' }}>
              <SplitWords text={h1} mark={[lastWord]} />
            </h1>
            <p className="lede mx-auto mb-10 text-center" data-reveal style={d(450)}>
              {t('app.tagline')}
            </p>
            <div className="flex flex-wrap justify-center gap-3" data-reveal style={d(600)}>
              <Link to="/select" viewTransition data-magnetic className="btn btn-lg">
                <span className="arr">→</span> {t('landing.start')}
              </Link>
              <button type="button" data-magnetic className="btn btn-ghost btn-lg" onClick={() => open('medium')}>
                {t('landing.demo')}
              </button>
            </div>
            <div className="hidden md:flex justify-center mt-12" data-reveal style={d(800)}>
              <a href="#statement" className="scroll-cue kicker" style={{ textDecoration: 'none' }}>
                Scroll
                <i aria-hidden="true" />
              </a>
            </div>
          </div>

          <div id="statement" className="relative mt-12 md:-mt-[6vw] scroll-mt-24">
            {/* Inline 2 KB blurred sketch shows instantly; the real drawing fades over it once decoded. */}
            <div className="hero-land pointer-events-none" style={{ '--lqip': `url(${HERO_LQIP})` } as CSSProperties}>
              <img
                ref={heroImg}
                onLoad={markHeroLoaded}
                src={artUrl('hero-landscape')}
                srcSet={`${import.meta.env.BASE_URL}img/hero-landscape-sm.webp 800w, ${artUrl('hero-landscape')} 1600w`}
                sizes="100vw"
                width={1600}
                height={800}
                alt=""
                className="hero-art"
                decoding="async"
                fetchPriority="high"
              />
            </div>

            {/* Text centered inside the box area of the landscape illustration */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-10 pointer-events-auto">
              <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 text-center -translate-y-3 sm:-translate-y-6 md:-translate-y-10 relative" data-reveal>
                {/* Whimsical doodles floating organically in the open sky of the countryside sketch */}
                <div className="hidden sm:block absolute -left-16 sm:-left-24 -top-6 sm:-top-8 doodle-float-1 opacity-45 pointer-events-none" aria-hidden="true">
                  <Sketch kind="wind" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                <div className="hidden sm:block absolute -right-14 sm:-right-24 -top-8 sm:-top-10 doodle-float-2 opacity-50 pointer-events-none" aria-hidden="true">
                  <Sketch kind="butterfly" className="w-14 h-14 sm:w-16 sm:h-16" />
                </div>
                <div className="hidden md:block absolute -left-14 -bottom-6 doodle-float-3 opacity-40 pointer-events-none" aria-hidden="true">
                  <Sketch kind="sprout" className="w-14 h-14" />
                </div>
                <div className="hidden md:block absolute -right-14 -bottom-4 doodle-pulse opacity-45 pointer-events-none" aria-hidden="true">
                  <Sketch kind="sparkle" className="w-12 h-12" />
                </div>

                <ScrollText
                  text={t('landing.lede')}
                  className="font-semibold text-ink text-center mx-auto text-[clamp(1rem,2.1vw,2.05rem)] leading-[1.35] tracking-[-0.015em]"
                />

                {/* Hand-drawn scroll-progressive connecting doodle line and arrow */}
                <div className="flex flex-col items-center justify-center mt-2 sm:mt-4 pointer-events-none">
                  <ScrollDoodle preset="swoop-down" className="w-36 sm:w-48 h-12 sm:h-16 opacity-50 -my-1" strokeWidth={1.8} />
                  <Sketch kind="arrow" className="w-12 sm:w-16 hidden md:block doodle-float-1" style={{ opacity: 0.45 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden 2xl:block absolute right-8 top-40" aria-hidden="true">
            <SpinBadge text="Screen ✦ Check ✦ Decide ✦ Sign wisely ✦ ">🌱</SpinBadge>
          </div>
        </section>

        {/* ================================================= CROSSING TAPES */}
        <div className="relative overflow-hidden py-12" aria-hidden="true">
          <Tape items={MARQUEE} tone="bg-yellow" tilt="-2deg" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <Tape items={[...MARQUEE].reverse()} tone="bg-teal" tilt="2deg" reverse />
          </div>
        </div>

        {/* Hand-drawn scroll line leading into Section 01 */}
        <div className="max-w-4xl mx-auto flex justify-center -my-6 sm:-my-10 relative z-10 pointer-events-none">
          <ScrollDoodle preset="connector-s" className="w-12 h-24 sm:h-32 opacity-40" strokeWidth={1.8} />
        </div>

        {/* ================================================= SPECIMEN */}
        {specimen && (
          <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
            <div data-reveal="left" className="relative">
              <div className="hidden xl:block absolute -left-20 top-2 opacity-35 pointer-events-none doodle-float-2">
                <Sketch kind="leaf" className="w-16 h-16" />
              </div>
              <p className="kicker mb-4 flex items-center gap-2">
                <span>01 — {t('landing.specimenTitle')}</span>
                <Sketch kind="flower" className="w-5 h-5 opacity-40 doodle-pulse inline-block" />
              </p>
              <h2 className="display display-lg mb-6">
                {does3.slice(0, -2).join(' ')} <span className="hl hl-draw">{does3.slice(-2).join(' ')}</span>
              </h2>
              <p className="lede mb-6">{t('landing.specimenNote')}</p>
              <ul className="space-y-3">
                {(['landing.does1', 'landing.does2', 'landing.does4'] as TKey[]).map((k, i) => (
                  <li key={k} className="flex gap-3 items-start" data-reveal style={d(120 * i)}>
                    <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 w-6 h-6 rounded-full border border-ink bg-mint items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-ink-2">{t(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative" data-reveal="scale">
              <div className="absolute -inset-4 rounded-[22px] bg-teal border border-ink" style={{ transform: 'rotate(2.4deg)' }} aria-hidden="true" />
              <div className="hidden lg:block absolute -right-10 -top-8 opacity-40 pointer-events-none doodle-float-1">
                <Sketch kind="sparkle" className="w-12 h-12" />
              </div>
              <div className="hidden lg:block absolute -left-10 -bottom-8 opacity-40 pointer-events-none doodle-float-3">
                <Sketch kind="sprout" className="w-14 h-14" />
              </div>
              <Tilt max={5}>
                <figure className="sheet relative" style={{ borderColor: '#1a3300', boxShadow: '8px 8px 0 #1a3300' }}>
                  <div className="flex items-center justify-between mb-3">
                    <figcaption className="kicker">{t('landing.specimenTitle')}</figcaption>
                    <span className="chip">● live</span>
                  </div>
                  <Ledger r={specimen.scenarios.mid} input={specimen.finance} caption="Jamgaon, Mandla" />
                </figure>
              </Tilt>
            </div>
          </section>
        )}

        <Divider kind="wave" emblem="✺" />

        {/* ================================================= HOW IT WORKS (pinned, scrolls sideways) */}
        <section id="how" ref={pinRef} className="hscroll">
          <div className="hscroll-sticky">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 flex flex-wrap items-end justify-between gap-4">
              <div className="relative">
                <p className="kicker mb-3">02 — {t('landing.stepsTitle')}</p>
                <h2 className="display display-lg flex items-center gap-3">
                  <span className="hl hl-mint">{t('landing.stepsTitle')}</span>
                  <ScrollDoodle preset="loop-line" className="w-28 sm:w-36 h-8 hidden sm:block opacity-45" strokeWidth={1.8} />
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <p className="kicker hidden md:block">← scroll →</p>
                <Sketch kind="wind" className="w-8 h-8 opacity-40 hidden md:block doodle-float-2" />
              </div>
            </div>
            <ol ref={trackRef} className="hscroll-track">
              {STEPS.map((s, i) => (
                <li key={s.k} className={`hscroll-panel ${s.tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="display text-6xl sm:text-7xl" style={{ letterSpacing: '0.04em' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="chip">
                      {i + 1} / {STEPS.length}
                    </span>
                  </div>
                  <p className="mt-5 text-[1.3rem] sm:text-[1.45rem] leading-snug font-semibold tracking-[-0.01em]">{t(s.k)}</p>
                  <Art name={s.art} className={s.art === 'gram-sabha' ? 'gs-crop' : ''} />
                </li>
              ))}
              <li className="hscroll-panel bg-ink justify-between" style={{ color: '#fcfaf5' }}>
                <p className="kicker" style={{ color: '#ffe95c' }}>
                  ✦ {t('landing.kicker')}
                </p>
                <p className="display text-4xl sm:text-5xl" style={{ color: '#fcfaf5', letterSpacing: '0.03em', lineHeight: 1.05 }}>
                  {t('landing.start')}
                </p>
                <Link to="/select" viewTransition data-magnetic className="btn btn-lg self-start" style={{ background: '#ffe95c', color: '#1a3300', borderColor: '#ffe95c' }}>
                  <span className="arr">→</span> {t('app.chooseVillage')}
                </Link>
              </li>
            </ol>
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
              <div className="hscroll-bar">
                <i />
              </div>
            </div>
          </div>
        </section>

        <Divider kind="loop" emblem="🌱" tone="#d5f5c2" />

        {/* ================================================= DEMOS */}
        <section id="demos" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12" data-reveal>
            <div>
              <p className="kicker mb-4">03 — {t('landing.demosNote')}</p>
              <h2 className="display display-lg">
                <span className="hl hl-draw">{t('landing.demosTitle')}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <ScrollDoodle preset="swoop-down" className="w-28 sm:w-36 h-14 hidden md:block opacity-50" strokeWidth={1.8} />
              <Sketch kind="spiral" className="w-10 h-10 hidden md:block opacity-35 doodle-float-1" />
            </div>
          </div>
          <ol className="grid md:grid-cols-3 gap-8">
            {DEMO_ORDER.map((id, i) => (
              <li key={id} data-reveal style={d(i * 120)}>
                <Tilt className="h-full">
                  <div className={`note-card relative ${DEMO_TONE[i]} h-full flex flex-col`} style={{ rotate: DEMO_TILT[i] }}>
                    <span className="display text-5xl mb-6" style={{ letterSpacing: '0.04em' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl mb-2">{t(`landing.demo.${id}.title` as TKey)}</h3>
                    <p className="text-ink-2 mb-6 flex-1">{t(`landing.demo.${id}.desc` as TKey)}</p>
                    <button type="button" className="btn self-start" onClick={() => open(id)}>
                      {t('landing.open')} <span className="arr">→</span>
                    </button>
                  </div>
                </Tilt>
              </li>
            ))}
          </ol>
        </section>

        {/* ================================================= POOLING */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-14 items-center">
          <div data-reveal="left" className="order-2 md:order-1 relative">
            <div className="absolute -top-8 -right-4 sm:-right-8 doodle-float-2 opacity-45 pointer-events-none" aria-hidden="true">
              <Sketch kind="butterfly" className="w-16 h-16" />
            </div>
            <Art name="pooling" className="w-full" />
          </div>
          <div data-reveal className="order-1 md:order-2 relative">
            <div className="hidden lg:block absolute -left-14 -top-6 opacity-35 pointer-events-none">
              <ScrollDoodle preset="vine" className="w-10 h-36" strokeWidth={1.5} />
            </div>
            <p className="kicker mb-4">04 — {t('nav.pooling')}</p>
            <h2 className="display display-md mb-5">
              <span className="hl hl-blush">{t('landing.demo.pool.title')}</span>
            </h2>
            <p className="lede mb-8">{t('landing.demo.pool.desc')}</p>
            <button type="button" data-magnetic className="btn btn-lg" onClick={() => open('pool')}>
              <span className="arr">→</span> {t('landing.open')}
            </button>
          </div>
        </section>

        <Divider kind="wave" emblem="✦" tone="#f6d0ff" />

        {/* ================================================= DOES / DOES NOT */}
        <section className="relative py-24 overflow-hidden">
          <div className="hidden lg:block absolute right-12 top-10 opacity-30 pointer-events-none doodle-float-1">
            <Sketch kind="cloud" className="w-24 h-24" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8">
            <div className="sheet relative" data-reveal style={{ borderColor: '#1a3300' }}>
              <div className="absolute -top-4 -right-4 opacity-40 pointer-events-none doodle-pulse">
                <Sketch kind="sparkle" className="w-10 h-10" />
              </div>
              <span className="badge mb-5" style={{ background: '#d5f5c2' }}>
                ✓ {t('landing.doesTitle')}
              </span>
              <ul className="space-y-4">
                {(['landing.does1', 'landing.does2', 'landing.does3', 'landing.does4', 'landing.does5'] as TKey[]).map((k) => (
                  <li key={k} className="flex gap-3 text-[1.05rem]">
                    <span aria-hidden="true" className="figure pos">
                      ✓
                    </span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sheet relative" data-reveal style={{ ...d(150), borderColor: '#1a3300' }}>
              <div className="absolute -top-4 -right-4 opacity-40 pointer-events-none doodle-float-2">
                <Sketch kind="flower" className="w-10 h-10" />
              </div>
              <span className="badge mb-5" style={{ background: '#ffd6e3' }}>
                ✕ {t('landing.doesNotTitle')}
              </span>
              <ul className="space-y-4">
                {(['landing.doesNot1', 'landing.doesNot2', 'landing.doesNot3', 'landing.doesNot4'] as TKey[]).map((k) => (
                  <li key={k} className="flex gap-3 text-[1.05rem]">
                    <span aria-hidden="true" className="figure neg">
                      ✕
                    </span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================= FOOTER */}
      <Art name="footer-strip" className="w-full max-w-6xl mx-auto px-4 -mb-[3px]" />
      <footer className="relative overflow-hidden bg-ink rounded-t-[36px] mx-2 sm:mx-4" style={{ color: '#fcfaf5' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-8">
          <p className="kicker mb-6" style={{ color: '#ffe95c' }}>
            ✦ {t('landing.kicker')}
          </p>
          <Link to="/select" viewTransition className="mega-cta display" style={{ fontSize: 'clamp(2.3rem, 7vw, 6rem)', letterSpacing: '0.03em', lineHeight: 1 }}>
            <span className="mega-text">{t('landing.start')}</span>
            <span className="mega-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-10 mt-16 pt-10 border-t" style={{ borderColor: '#3a4a28' }}>
            <div>
              <p className="text-xl font-semibold mb-3" style={{ color: '#fcfaf5' }}>
                {t('app.tagline')}
              </p>
              <p className="small" style={{ color: '#b9c6aa' }}>
                {t('app.disclaimer')}
              </p>
            </div>
            <nav aria-label={t('landing.demosTitle')}>
              <p className="foot-col-title">{t('landing.demosTitle')}</p>
              <ul className="space-y-2.5">
                {DEMO_ORDER.map((id) => (
                  <li key={id}>
                    <button type="button" className="foot-link" onClick={() => open(id)}>
                      {t(`landing.demo.${id}.title` as TKey)}
                    </button>
                  </li>
                ))}
                <li>
                  <Link to="/select" viewTransition className="foot-link">
                    {t('app.chooseVillage')}
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label={t('nav.groupRef')}>
              <p className="foot-col-title">{t('nav.groupRef')}</p>
              <ul className="space-y-2.5">
                {(
                  [
                    ['/guide', 'nav.guide'],
                    ['/assumptions', 'nav.assumptions'],
                    ['/data', 'nav.data'],
                    ['/about', 'nav.about'],
                  ] as [string, TKey][]
                ).map(([to, k]) => (
                  <li key={to}>
                    <Link to={to} viewTransition className="foot-link">
                      {t(k)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex lg:justify-end items-start">
              <SpinBadge text="Back to top ✦ Back to top ✦ " label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                ↑
              </SpinBadge>
            </div>
          </div>

          <p
            ref={wordRef}
            className="display fill-word select-none text-center whitespace-nowrap mt-16"
            aria-hidden="true"
            style={{ fontSize: 'clamp(3.5rem, 16.5vw, 15rem)', lineHeight: 0.85, letterSpacing: '0.04em' }}
          >
            VASUDHA
          </p>

          <div className="mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-4" style={{ borderColor: '#3a4a28' }}>
            <p className="small" style={{ color: '#b9c6aa' }}>
              © {new Date().getFullYear()} VASUDHA CO₂ · {t('app.footer')}
            </p>
            <LangSwitch />
          </div>
        </div>
      </footer>
    </div>
  )
}
