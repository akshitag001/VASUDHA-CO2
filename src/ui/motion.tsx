import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react'

// Presentation-only motion helpers. Nothing here touches app state or the engine.

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const finePointer = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches

/* ------------------------------------------------------------------ art */

// Line-art illustrations in public/img: forest-ink strokes on a transparent background (see IMAGE_PROMPTS.md for the pipeline).
const ART_SIZES = {
  'hero-landscape': [1600, 800],
  'select-corner': [560, 685],
  'soil-carbon': [560, 679],
  pooling: [1000, 568],
  'gram-sabha': [1400, 692],
  'footer-strip': [1500, 222],
  'empty-state': [480, 467],
  money: [560, 566],
} as const
export type ArtName = keyof typeof ART_SIZES
export const artUrl = (name: ArtName) => `${import.meta.env.BASE_URL}img/${name}.webp`

let preloadPromise: Promise<void> | null = null
/** Fetches + decodes every illustration once, so pages never wait on them. */
export function preloadArt(onProgress?: (frac: number) => void) {
  const names = Object.keys(ART_SIZES) as ArtName[]
  if (preloadPromise && !onProgress) return preloadPromise
  let done = 0
  const p = Promise.all(
    names.map(
      (n) =>
        new Promise<void>((res) => {
          const img = new Image()
          img.decoding = 'async'
          const fin = () => {
            done++
            onProgress?.(done / names.length)
            res()
          }
          img.onload = () => (img.decode ? img.decode().catch(() => undefined).then(fin) : fin())
          img.onerror = fin
          img.src = artUrl(n)
        }),
    ),
  ).then(() => undefined)
  preloadPromise = p
  return p
}

export function Art({ name, className = '', style, eager = true }: { name: ArtName; className?: string; style?: CSSProperties; eager?: boolean }) {
  const [w, h] = ART_SIZES[name]
  return (
    <img
      src={artUrl(name)}
      width={w}
      height={h}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`art no-print ${className}`}
      style={style}
    />
  )
}

/* --------------------------------------------------------------- scroll */

/** Writes the scroll offset to `--sy` and page progress (0–1) to `--p` on <html>, once per frame. */
export function useScrollVar() {
  useEffect(() => {
    const root = document.documentElement
    let raf = 0
    const tick = () => {
      raf = 0
      const y = window.scrollY
      const max = Math.max(1, root.scrollHeight - window.innerHeight)
      root.style.setProperty('--sy', String(y))
      root.style.setProperty('--p', String(Math.min(1, y / max)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
}

/**
 * Adds `.is-in` to every [data-reveal] element as it scrolls into view.
 * A MutationObserver picks up elements from lazily-loaded pages, so nothing is ever left invisible.
 */
export function useReveal() {
  useEffect(() => {
    const mark = (el: Element) => el.classList.add('is-in')
    const io =
      reduced() || !('IntersectionObserver' in window)
        ? null
        : new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  mark(e.target)
                  io?.unobserve(e.target)
                }
              }),
            { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
          )
    let raf = 0
    const scan = () => {
      raf = 0
      document.querySelectorAll('[data-reveal]:not(.is-in):not([data-watched])').forEach((el) => {
        el.setAttribute('data-watched', '')
        if (io) io.observe(el)
        else mark(el)
      })
    }
    scan()
    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(scan)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      io?.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])
}

/** True once the page has scrolled past `px`. */
export function useScrolled(px = 24) {
  const [s, setS] = useState(false)
  useEffect(() => {
    const on = () => setS(window.scrollY > px)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [px])
  return s
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/**
 * Writes `--prog` (0–1) on the element as it moves through the viewport.
 *  - 'through': 0 when its top hits the viewport bottom, 1 when its bottom leaves the top
 *  - 'enter':   0 when its top hits the viewport bottom, 1 when its bottom reaches the viewport bottom
 *  - 'pin':     for a tall section with a sticky child; 0 at its top, 1 when its end reaches the viewport bottom
 */
export function useProgress<T extends HTMLElement>(mode: 'through' | 'enter' | 'pin' = 'through', onTick?: (p: number, el: T) => void) {
  const ref = useRef<T>(null)
  const cb = useRef(onTick)
  useEffect(() => {
    cb.current = onTick
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const tick = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = mode === 'pin' ? -r.top / Math.max(1, r.height - vh) : mode === 'enter' ? (vh - r.top) / Math.max(1, r.height) : (vh - r.top) / (vh + r.height)
      const c = Math.min(1, Math.max(0, p))
      el.style.setProperty('--prog', c.toFixed(4))
      cb.current?.(c, el)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [mode])
  return ref
}

export function ScrollProgress() {
  return <div className="scroll-progress no-print" aria-hidden="true" />
}

/** A layer that drifts at `speed` × scroll. Negative = moves up faster than the page. */
export function Parallax({ speed = -0.15, className = '', style, children }: { speed?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`parallax ${className}`} style={{ ...style, transform: `translate3d(0, calc(var(--sy) * ${speed}px), 0)` }} aria-hidden="true">
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- text */

/** Splits a headline into words that slide up one after another. `mark` words get the highlighter. */
export function SplitWords({ text, mark = [], step = 70 }: { text: string; mark?: number[]; step?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="split-word">
            <span style={{ '--d': `${i * step}ms` } as CSSProperties} className={mark.includes(i) ? 'hl hl-draw' : undefined}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

/** Big paragraph whose words ink in, one by one, as it scrolls past. */
export function ScrollText({ text, className = '', mark = [] }: { text: string; className?: string; mark?: number[] }) {
  const ref = useProgress<HTMLParagraphElement>('through')
  const words = text.split(' ')
  return (
    <p ref={ref} className={`scroll-text ${className}`} style={{ '--n': words.length } as CSSProperties}>
      {words.map((w, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties} className={mark.includes(i) ? 'hl' : undefined}>
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

/* ------------------------------------------------------------- dividers */

const DIVIDER_PATHS = {
  wave: 'M0 30 C 60 6, 120 54, 180 30 S 300 6, 360 30 S 480 54, 540 30 S 660 6, 720 30 S 840 54, 900 30 S 1020 6, 1080 30 S 1200 54, 1200 30',
  loop: 'M0 34 C 120 34, 200 20, 290 28 C 380 36, 420 52, 470 40 C 520 28, 500 6, 470 12 C 440 18, 450 46, 520 46 C 600 46, 660 26, 760 26 C 880 26, 980 40, 1080 34 L 1200 30',
  stitch: 'M0 30 L 1200 30',
} as const

/** Hand-drawn line that draws itself as you scroll, with a little emblem in the middle. */
export function Divider({ kind = 'wave', emblem = '✺', tone = '#ffe95c' }: { kind?: keyof typeof DIVIDER_PATHS; emblem?: ReactNode; tone?: string }) {
  const ref = useProgress<HTMLDivElement>('through')
  return (
    <div ref={ref} className="divider no-print" aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="divider-line">
        <path d={DIVIDER_PATHS[kind]} pathLength={1} className={kind === 'stitch' ? 'is-stitch' : undefined} />
      </svg>
      {emblem != null && (
        <span className="divider-emblem" style={{ background: tone }}>
          {emblem}
        </span>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- interaction */

/** Wrapper that tilts its child in 3D towards the pointer. */
export function Tilt({ children, className = '', max = 8, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const on = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  const off = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }
  return (
    <div className={`tilt ${className}`} style={style} onPointerMove={on} onPointerLeave={off}>
      {children}
    </div>
  )
}

/** Soft ink cursor ring + magnetic pull on [data-magnetic] elements. Desktop pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const [on] = useState(() => finePointer() && !reduced())
  useEffect(() => {
    if (!on || !ring.current) return
    const el = ring.current
    let x = innerWidth / 2
    let y = innerHeight / 2
    let tx = x
    let ty = y
    let raf = 0
    let mag: HTMLElement | null = null
    const loop = () => {
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      const t = e.target as Element | null
      const hot = !!t?.closest?.('a, button, label, summary, select, input, [data-cursor]')
      el.classList.toggle('is-hot', hot)
      el.style.opacity = '1'
      const m = (t?.closest?.('[data-magnetic]') as HTMLElement | null) ?? null
      if (mag && mag !== m) mag.style.translate = ''
      mag = m
      if (m) {
        const r = m.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        m.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`
      }
    }
    const leave = () => {
      el.style.opacity = '0'
    }
    raf = requestAnimationFrame(loop)
    document.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.classList.add('has-cursor')
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [on])
  if (!on) return null
  return <div ref={ring} className="cursor-ring no-print" aria-hidden="true" />
}

/* ------------------------------------------------------------ preloader */

/** Full-screen yellow counter tied to real image loading. Shown once per browser session. */
export function Preloader() {
  const [n, setN] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(() => {
    try {
      return reduced() || sessionStorage.getItem('vasudha.loaded') === '1'
    } catch {
      return reduced()
    }
  })

  useEffect(() => {
    if (gone) {
      preloadArt()
      return
    }
    // Hero animations wait for the curtain (see .preloading in index.css).
    const root = document.documentElement
    root.classList.add('preloading')
    document.body.style.overflow = 'hidden'
    let loaded = 0
    preloadArt((f) => {
      loaded = f
    })
    const start = performance.now()
    let shown = 0
    let raf = 0
    let t1 = 0
    let t2 = 0
    let finished = false
    const step = (now: number) => {
      if (finished) return
      const el = now - start
      // Never faster than 0.9s, never slower than 3s; otherwise follows the real image progress.
      const target = el > 3000 ? 1 : Math.min(Math.min(1, el / 900), loaded)
      shown += (target - shown) * 0.12
      if (target === 1 && shown > 0.99) shown = 1
      setN(Math.round(shown * 100))
      if (shown < 1) raf = requestAnimationFrame(step)
      else {
        finished = true
        setDone(true)
        document.body.style.overflow = ''
        try {
          sessionStorage.setItem('vasudha.loaded', '1')
        } catch {
          /* private mode — fine */
        }
        t1 = window.setTimeout(() => root.classList.remove('preloading'), 1600)
        t2 = window.setTimeout(() => setGone(true), 1000)
      }
    }
    raf = requestAnimationFrame(step)
    // rAF can be throttled (background tab, low-power mode): never let the curtain hang.
    const bail = window.setTimeout(() => {
      shown = 1
      step(performance.now())
    }, 3500)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(bail)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [gone])

  if (gone) return null
  return (
    <div className={`preloader no-print ${done ? 'is-done' : ''}`} role="status" aria-label="Loading">
      <div className="flex w-full items-start justify-between gap-4 mb-auto">
        <p className="kicker" style={{ color: '#1a3300' }}>
          VASUDHA CO₂
        </p>
        <p className="kicker text-right" style={{ color: '#1a3300' }}>
          Screen · Check · Decide
        </p>
      </div>
      <Sketch kind="leaf" className="preloader-leaf" />
      <div className="preloader-count">{String(n).padStart(3, '0')}</div>
      <div className="preloader-bar">
        <i style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- brand */

/** Monoline doodle used as atmospheric texture (forest ink, low opacity). */
export function Sketch({ kind, className = '', style }: { kind: 'leaf' | 'swirl' | 'sun' | 'arrow' | 'stars'; className?: string; style?: CSSProperties }) {
  const p = { fill: 'none', stroke: '#1a3300', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      {kind === 'leaf' && (
        <g {...p}>
          <path d="M20 100 C 25 50, 60 18, 104 16 C 102 62, 70 98, 20 100 Z" pathLength={1} />
          <path d="M20 100 C 48 72, 70 50, 96 24" pathLength={1} />
          <path d="M44 76 l -6 -16 M58 62 l -4 -18 M72 48 l -2 -16 M52 70 l 16 2 M66 56 l 16 0" />
        </g>
      )}
      {kind === 'swirl' && (
        <g {...p}>
          <path d="M10 70 C 20 30, 60 20, 70 50 C 78 74, 46 86, 42 64 C 39 48, 62 40, 76 56 C 92 74, 104 60, 112 40" />
        </g>
      )}
      {kind === 'sun' && (
        <g {...p}>
          <circle cx="60" cy="60" r="20" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6
            return <path key={i} d={`M${60 + 28 * Math.cos(a)} ${60 + 28 * Math.sin(a)} L ${60 + (i % 2 ? 40 : 48) * Math.cos(a)} ${60 + (i % 2 ? 40 : 48) * Math.sin(a)}`} />
          })}
        </g>
      )}
      {kind === 'arrow' && (
        <g {...p}>
          <path d="M12 30 C 40 20, 70 40, 66 70 C 63 92, 84 100, 104 92" />
          <path d="M92 84 L 105 92 L 94 103" />
        </g>
      )}
      {kind === 'stars' && (
        <g {...p}>
          <path d="M30 20 l 4 12 l 12 4 l -12 4 l -4 12 l -4 -12 l -12 -4 l 12 -4 z" />
          <path d="M82 60 l 3 9 l 9 3 l -9 3 l -3 9 l -3 -9 l -9 -3 l 9 -3 z" />
          <path d="M44 88 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" />
        </g>
      )}
    </svg>
  )
}

let badgeSeq = 0
/** Rotating circular text badge, e.g. a "back to top" sticker. */
export function SpinBadge({ text, children, size = 120, className = '', onClick, label }: { text: string; children?: ReactNode; size?: number; className?: string; onClick?: () => void; label?: string }) {
  const [id] = useState(() => `spin-badge-${++badgeSeq}`)
  const inner = (
    <>
      <svg viewBox="0 0 120 120" className="spin-slow" aria-hidden="true">
        <defs>
          <path id={id} d="M60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" />
        </defs>
        <text>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="spin-badge-core">{children}</span>
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} aria-label={label} className={`spin-badge ${className}`} style={{ width: size, height: size }} data-magnetic="">
      {inner}
    </button>
  ) : (
    <div className={`spin-badge ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {inner}
    </div>
  )
}

/** Brand lockup: yellow square with a hand-drawn leaf + wordmark. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo inline-flex items-center gap-2.5">
      <span className="logo-mark inline-flex items-center justify-center rounded-[9px] border border-ink" style={{ width: 38, height: 38, background: '#ffe95c' }} aria-hidden="true">
        <svg viewBox="0 0 40 40" width="26" height="26">
          <g fill="none" stroke="#1a3300" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 31 C 9 18, 19 9, 33 8 C 32 22, 23 31, 8 31 Z" />
            <path d="M8 31 C 16 24, 22 18, 29 12" />
          </g>
        </svg>
      </span>
      {!compact && (
        <span className="logo-word font-bold text-[1.15rem] tracking-tight text-ink" style={{ fontFamily: 'var(--font-sans)' }}>
          VASUDHA<span className="figure ml-1 text-[0.85em]">CO₂</span>
        </span>
      )}
    </span>
  )
}
