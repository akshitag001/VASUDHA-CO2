// Small hand-built SVG charts. Text uses ink colours; marks carry the colour.
// Every chart has a text equivalent (aria-label or a table) so colour is never the only cue.

import { useState } from 'react'
import type { Range } from '../engine/types'


// A horizontal strip showing low → high with a tick at the central value and,
// when the range crosses zero, a zero line. Used for every uncertain figure.
export function RangeStrip({
  range,
  domain,
  label,
  format,
}: {
  range: Range
  domain: [number, number]
  label: string
  format: (n: number) => string
}) {
  const [d0, d1] = domain[0] === domain[1] ? [domain[0] - 1, domain[1] + 1] : domain
  const x = (v: number) => ((v - d0) / (d1 - d0)) * 100
  const lo = Math.min(range.low, range.high)
  const hi = Math.max(range.low, range.high)
  const crossesZero = d0 < 0 && d1 > 0
  return (
    <svg
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      className="w-full h-4 block"
      role="img"
      aria-label={`${label}: ${format(lo)} – ${format(hi)}, ${format(range.mid)}`}
    >
      <rect x="0" y="6" width="100" height="2" fill="#ece5d3" />
      {crossesZero && <rect x={x(0) - 0.2} y="0" width="0.4" height="14" fill="#1a3300" />}
      {lo < 0 && <rect x={x(lo)} y="3" width={Math.max(0.8, x(Math.min(0, hi)) - x(lo))} height="8" fill="#cb5521" />}
      {hi > 0 && <rect x={x(Math.max(0, lo))} y="3" width={Math.max(0.8, x(hi) - x(Math.max(0, lo)))} height="8" fill="#1d5c58" />}
      {crossesZero && <rect x={x(0) - 0.3} y="0" width="0.6" height="14" fill="#fffefa" />}
      <rect x={x(range.mid) - 0.5} y="1" width="1" height="12" fill="#1a3300" />
    </svg>
  )
}

export interface TornadoBar {
  label: string
  netAtLow: number
  netAtHigh: number
  lowLabel: string
  highLabel: string
}

// Tornado chart: each bar spans net income at the factor's low and high value,
// around the central result. Diverging colours: below base = terracotta, above = indigo.
export function Tornado({
  bars,
  base,
  format,
  lowEnd,
  highEnd,
  legend,
}: {
  bars: TornadoBar[]
  base: number
  format: (n: number) => string
  lowEnd: string
  highEnd: string
  legend: [string, string]
}) {
  const [hover, setHover] = useState<number | null>(null)
  const vals = bars.flatMap((b) => [b.netAtLow, b.netAtHigh]).concat(base, 0)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = (max - min) * 0.04 || 1
  const d0 = min - pad
  const d1 = max + pad
  const x = (v: number) => ((v - d0) / (d1 - d0)) * 100

  return (
    <div>
      <p className="sr-only">
        {bars.map((b) => `${b.label}: ${format(Math.min(b.netAtLow, b.netAtHigh))} – ${format(Math.max(b.netAtLow, b.netAtHigh))}`).join('; ')}
      </p>
      <ul aria-hidden="true">
        {bars.map((b, i) => {
          const leftEnd = Math.min(b.netAtLow, b.netAtHigh, base)
          const rightEnd = Math.max(b.netAtLow, b.netAtHigh, base)
          return (
            <li
              key={b.label}
              className="grid grid-cols-[minmax(7rem,38%)_1fr] gap-3 items-center py-1.5 cursor-default"
              style={{ opacity: hover == null || hover === i ? 1 : 0.55 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
            >
              <span className="text-right small font-semibold leading-tight">{b.label}</span>
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-6 block">
                {d0 < 0 && d1 > 0 && <rect x={x(0) - 0.1} y="0" width="0.2" height="10" fill="#c9c1ab" />}
                {leftEnd < base && <rect x={x(leftEnd)} y="1" width={Math.max(0.3, x(base) - x(leftEnd) - 0.3)} height="8" fill="#cb5521" />}
                {rightEnd > base && <rect x={x(base) + 0.3} y="1" width={Math.max(0.3, x(rightEnd) - x(base) - 0.3)} height="8" fill="#1d5c58" />}
                <rect x={x(base) - 0.15} y="0" width="0.3" height="10" fill="#1a3300" />
              </svg>
            </li>
          )
        })}
      </ul>
      <div className="grid grid-cols-[minmax(7rem,38%)_1fr] gap-3 small muted" aria-hidden="true">
        <span />
        <span className="flex justify-between">
          <span>{format(d0)}</span>
          <span>{format(d1)}</span>
        </span>
      </div>
      <p className="small mt-1 min-h-[2.6em]" role="status">
        {hover != null && (
          <>
            <strong>{bars[hover].label}.</strong> {lowEnd}: {bars[hover].lowLabel} → {format(bars[hover].netAtLow)}. {highEnd}: {bars[hover].highLabel} →{' '}
            {format(bars[hover].netAtHigh)}.
          </>
        )}
      </p>
      <p className="small muted flex flex-wrap gap-4" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 14, height: 10, background: '#cb5521', display: 'inline-block', borderRadius: 2 }} /> {legend[0]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 14, height: 10, background: '#1d5c58', display: 'inline-block', borderRadius: 2 }} /> {legend[1]}
        </span>
      </p>
    </div>
  )
}
