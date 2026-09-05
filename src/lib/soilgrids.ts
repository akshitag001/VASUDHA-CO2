// Live SoilGrids 2.0 lookup for soil organic carbon, with a regional fallback.
// SoilGrids REST: https://rest.isric.org/soilgrids/v2.0/properties/query
// We ask for `soc` (soil organic carbon content, dg/kg) at 0-5, 5-15, 15-30 cm,
// convert to an approximate 0-30 cm stock in t C/ha, and fall back on any failure.

export interface SocResult {
  tCPerHa: number
  live: boolean
  source: string
}

// Rough conversion: SOC content (g/kg) × bulk density (~1.3 g/cm³) × depth (cm) → t C/ha
// t C/ha for a layer = SOC_gkg * 1.3 * depth_cm * 0.1
function layerStock(socGkg: number, depthCm: number): number {
  return socGkg * 1.3 * depthCm * 0.1
}

export async function fetchSoc(
  lat: number,
  lon: number,
  fallbackTCPerHa: number,
  fallbackBasis: string,
  timeoutMs = 6000,
): Promise<SocResult> {
  const url =
    `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}` +
    `&property=soc&depth=0-5cm&depth=5-15cm&depth=15-30cm&value=mean`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`SoilGrids ${res.status}`)
    const json = await res.json()
    const layers = json?.properties?.layers ?? []
    const soc = layers.find((l: { name: string }) => l.name === 'soc')
    if (!soc) throw new Error('no soc layer')

    // depths come back as dg/kg (deci-grams per kg) → divide by 10 for g/kg
    let total = 0
    for (const d of soc.depths ?? []) {
      const meanDgKg = d?.values?.mean
      if (typeof meanDgKg !== 'number') throw new Error('bad value')
      const gKg = meanDgKg / 10
      const range = String(d.label || d.range?.top_depth + '-' + d.range?.bottom_depth)
      const depthCm = range.includes('0-5') ? 5 : range.includes('5-15') ? 10 : 15
      total += layerStock(gKg, depthCm)
    }
    if (!(total > 0) || total > 400) throw new Error('implausible total')

    return {
      tCPerHa: Math.round(total * 10) / 10,
      live: true,
      source: 'ISRIC SoilGrids 2.0 — live query, SOC 0–30 cm at village centroid',
    }
  } catch {
    return {
      tCPerHa: fallbackTCPerHa,
      live: false,
      source: `Regional default (SoilGrids live query unavailable): ${fallbackBasis}`,
    }
  }
}
