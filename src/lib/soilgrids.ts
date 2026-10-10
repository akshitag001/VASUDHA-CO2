// Live ISRIC SoilGrids 2.0 query for soil organic carbon density (0–30 cm).
// REST docs: https://rest.isric.org/soilgrids/v2.0/docs
// Asks for `ocd` (organic carbon density, mapped unit hg/m³) at three depths
// and integrates to t C/ha. Returns null on any failure; the caller keeps its
// previous value.

export interface SocResult {
  tCPerHa: number
  url: string
}

const LAYERS: [string, number][] = [
  ['0-5cm', 5],
  ['5-15cm', 10],
  ['15-30cm', 15],
]

export async function fetchSoilCarbon(lat: number, lon: number, timeoutMs = 8000): Promise<SocResult | null> {
  const url =
    `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=ocd` +
    LAYERS.map(([d]) => `&depth=${d}`).join('') +
    '&value=mean'
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    const json = await res.json()
    const layer = json?.properties?.layers?.find((l: { name: string }) => l.name === 'ocd')
    if (!layer) return null
    let total = 0
    for (const [label, cm] of LAYERS) {
      const d = layer.depths?.find((x: { label: string }) => x.label === label)
      const mean = d?.values?.mean
      if (typeof mean !== 'number') return null
      // hg/m³ ÷ 10 = kg/m³; kg/m³ × depth (m) × 10 = t/ha
      total += (mean / 10) * (cm / 100) * 10
    }
    if (!(total > 0) || total > 400) return null
    return { tCPerHa: Math.round(total * 10) / 10, url }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
