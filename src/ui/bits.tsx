import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ASSUMPTIONS, type AssumptionId } from '../config/assumptions'
import type { OverallVerdict } from '../engine'
import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import { Prov } from './Prov'

export function PageHeader({ kicker, title, lede, step }: { kicker: string; title: string; lede?: ReactNode; step?: [number, number] }) {
  const { t } = useApp()
  return (
    <header className="mb-8">
      <p className="kicker mb-2">
        {step ? `${t('app.step', { n: step[0], total: step[1] })} · ` : ''}
        {kicker}
      </p>
      <h1 className="text-3xl sm:text-4xl mb-3">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </header>
  )
}

// Tag for a value that comes straight from the assumptions config.
export function AsmTag({ id, changed }: { id: AssumptionId; changed?: boolean }) {
  const a = ASSUMPTIONS[id]
  if (changed) return <Prov kind="input" source="Changed by you on this page" year={new Date().getFullYear().toString()} />
  return <Prov kind="assumption" source={a.source} year={a.year} verified={a.verified} url={a.url} />
}

export function Stat({ label, value, sub, tone, children }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'neg' | 'pos'; children?: ReactNode }) {
  return (
    <div className="sheet flex flex-col gap-1">
      <div className="small muted font-semibold">{label}</div>
      <div className={`figure-xl ${tone ?? ''}`}>{value}</div>
      {sub && <div className="small muted">{sub}</div>}
      {children}
    </div>
  )
}

const VERDICT_TONE: Record<OverallVerdict, string> = {
  no_pathway: 'is-loss',
  not_alone: 'is-loss',
  depends: 'is-mid',
  worth_exploring: 'is-gain',
}

export function VerdictStamp({ verdict, children }: { verdict: OverallVerdict; children?: ReactNode }) {
  const { t } = useApp()
  return (
    <section className={`stamp ${VERDICT_TONE[verdict]}`} aria-live="polite">
      <h2 className="stamp-title mb-1">{t(`verdict.${verdict}.title` as TKey)}</h2>
      <p className="text-ink-2">{t(`verdict.${verdict}.body` as TKey)}</p>
      {children}
    </section>
  )
}

export function Seg<V extends string>({
  legend,
  value,
  options,
  onChange,
  hint,
}: {
  legend: ReactNode
  value: V
  options: { value: V; label: string }[]
  onChange: (v: V) => void
  hint?: ReactNode
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="seg" role="radiogroup">
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
      {hint && <span className="hint">{hint}</span>}
    </fieldset>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  min = 0,
  max,
  step = 1,
  tag,
}: {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  unit?: string
  hint?: ReactNode
  min?: number
  max?: number
  step?: number
  tag?: ReactNode
}) {
  const id = useId()
  const { t } = useApp()
  const [draft, setDraft] = useState<string | null>(null)
  const parsed = draft == null ? value : Number(draft)
  const invalid = draft != null && (draft.trim() === '' || !Number.isFinite(parsed) || parsed < min || (max != null && parsed > max))
  return (
    <div>
      <label htmlFor={id} className="label flex flex-wrap items-center gap-2">
        {label} {tag}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className="input input-num"
          value={draft ?? (Number.isFinite(value) ? String(value) : '')}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setDraft(e.target.value)
            const v = Number(e.target.value)
            if (e.target.value.trim() !== '' && Number.isFinite(v) && v >= min && (max == null || v <= max)) onChange(v)
          }}
          onBlur={() => setDraft(null)}
          aria-describedby={`${id}-h`}
          data-step={step}
        />
        {unit && <span className="small muted whitespace-nowrap">{unit}</span>}
      </div>
      <span id={`${id}-h`} className={invalid ? 'hint neg' : 'hint'}>
        {invalid ? t('carbon.invalid') : hint}
      </span>
    </div>
  )
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  hint,
  tag,
}: {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format: (v: number) => string
  hint?: ReactNode
  tag?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2">
          {label} {tag}
        </span>
        <output htmlFor={id} className="figure">
          {format(value)}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between small muted" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export function PageNav({ prev, next }: { prev?: [string, TKey]; next?: [string, TKey] }) {
  const { t } = useApp()
  return (
    <nav className="section flex flex-wrap justify-between gap-3 no-print" aria-label="Page">
      {prev ? (
        <Link to={prev[0]} className="btn btn-ghost">
          ← {t(prev[1])}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={next[0]} className="btn">
          {t('app.next')}: {t(next[1])} →
        </Link>
      )}
    </nav>
  )
}

export function Callout({ kind = 'note', children, title }: { kind?: 'note' | 'warn' | 'alarm' | 'good'; children: ReactNode; title?: ReactNode }) {
  return (
    <div className={kind} role={kind === 'alarm' ? 'alert' : undefined}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  )
}
