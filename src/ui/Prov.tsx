import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Provenance } from '../engine/types'
import { useApp } from '../state/AppState'

// Accessible popover anchored to a small trigger. Opens on hover, focus or
// click/tap; closes on Escape, blur or outside click.
export function Pop({ trigger, children, className, label }: { trigger: ReactNode; children: ReactNode; className: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    setAlignRight(!!r && r.left > window.innerWidth / 2)
    setOpen(true)
  }

  return (
    <span ref={ref} className="relative inline-block" onMouseEnter={show} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={className}
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
      >
        {trigger}
      </button>
      {open && (
        <span role="tooltip" id={id} className="pop" style={{ top: 'calc(100% + 6px)', [alignRight ? 'right' : 'left']: 0 }}>
          {children}
        </span>
      )}
    </span>
  )
}

export interface ProvProps {
  kind: Provenance
  source: string
  year: string
  verified?: boolean
  url?: string
}

export function Prov({ kind, source, year, verified = true, url }: ProvProps) {
  const { t } = useApp()
  const label = t(`prov.${kind}`)
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <Pop className={`prov prov-${kind}`} trigger={label} label={`${label}. ${t('prov.source')}: ${source}. ${t('prov.year')}: ${year}`}>
        <strong className="block mb-1">{label}</strong>
        <span className="block">
          {t('prov.source')}: {source}
        </span>
        <span className="block mt-1">
          {t('prov.year')}: {year}
        </span>
        {url && (
          <span className="block mt-1 break-all">
            {url}
          </span>
        )}
        {!verified && <span className="block mt-1">{t('prov.verifyTip')}</span>}
      </Pop>
      {!verified && (
        <span className="verify" title={t('prov.verifyTip')}>
          {t('prov.verify')}
        </span>
      )}
    </span>
  )
}

export function ProvLegend() {
  const { t } = useApp()
  return (
    <p className="small muted flex flex-wrap items-center gap-x-3 gap-y-2">
      <span>{t('prov.legend')}</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="prov prov-dataset" aria-hidden="true">{t('prov.dataset')}</span> {t('prov.legendDataset')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="prov prov-assumption" aria-hidden="true">{t('prov.assumption')}</span> {t('prov.legendAssumption')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="prov prov-input" aria-hidden="true">{t('prov.input')}</span> {t('prov.legendInput')}
      </span>
    </p>
  )
}
