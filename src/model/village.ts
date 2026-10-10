// Village profiles with per-field provenance. No React.
//
// Every number shown for a village is one of:
//   'dataset'    – loaded from an open dataset (e.g. a live SoilGrids query)
//   'assumption' – an illustrative profile or the placeholder profile
//   'input'      – typed in by the user

import illustrative from '../data/illustrativeVillages.json'
import { states, findGP, type GP } from '../data/lgd'
import { REGIONAL_DEFAULTS } from '../config/assumptions'
import type { Provenance, VillageField, VillageInputs } from '../engine/types'
import { VILLAGE_FIELDS } from '../engine/types'

export interface Field {
  value: number
  provenance: Provenance
  source: string
  year: string
}

export type VillageKind = 'illustrative' | 'placeholder' | 'custom'

export interface VillageProfile {
  id: string // LGD code, or 'custom'
  name: string
  nameHi: string
  block: string
  district: string
  state: string
  lat?: number
  lon?: number
  kind: VillageKind
  fields: Record<VillageField, Field>
}

export type Overrides = Partial<Record<VillageField, number>>

type IllustrativeProfile = {
  statedBasis: Record<string, [string, string]>
  values: Record<VillageField, number>
}

const PROFILES = illustrative.profiles as unknown as Record<string, IllustrativeProfile>

const LIVESTOCK_FIELDS: VillageField[] = ['dairyCattle', 'indigenousCattle', 'buffalo', 'goats', 'sheep']

function illustrativeFields(p: IllustrativeProfile): Record<VillageField, Field> {
  const out = {} as Record<VillageField, Field>
  for (const f of VILLAGE_FIELDS) {
    const basis = p.statedBasis[LIVESTOCK_FIELDS.includes(f) ? 'livestock' : f] ?? ['—', '—']
    out[f] = {
      value: p.values[f],
      provenance: 'assumption',
      source: `Illustrative profile. Stated basis: ${basis[0]} — not traceable to a specific table.`,
      year: basis[1],
    }
  }
  return out
}

function regionFor(state: string) {
  for (const r of Object.values(REGIONAL_DEFAULTS.regions)) {
    if ((r.states as readonly string[]).includes(state)) return r
  }
  return REGIONAL_DEFAULTS.regions.central
}

export function placeholderFields(state: string): Record<VillageField, Field> {
  const r = regionFor(state)
  const d = REGIONAL_DEFAULTS
  const pop = d.population
  const values: VillageInputs = {
    households: d.households,
    population: pop,
    croplandHa: Math.round(d.totalHa * r.cropShare),
    commonLandHa: Math.round(d.totalHa * r.commonShare),
    degradedHa: Math.round(d.totalHa * r.degradedShare),
    plantationHa: Math.round(d.totalHa * r.plantationShare),
    dairyCattle: Math.round((r.livestockPer1000.dairyCattle * pop) / 1000),
    indigenousCattle: Math.round((r.livestockPer1000.indigenousCattle * pop) / 1000),
    buffalo: Math.round((r.livestockPer1000.buffalo * pop) / 1000),
    goats: Math.round((r.livestockPer1000.goats * pop) / 1000),
    sheep: Math.round((r.livestockPer1000.sheep * pop) / 1000),
    socTCHa: r.socTCHa,
  }
  const out = {} as Record<VillageField, Field>
  for (const f of VILLAGE_FIELDS) {
    out[f] = { value: values[f], provenance: 'assumption', source: `Placeholder profile (${r.label}). ${d.source}`, year: d.year }
  }
  return out
}

export function resolveVillage(lgdCode: string): VillageProfile | null {
  const ref = findGP(lgdCode)
  if (!ref) return null
  const profile = ref.gp.profileId ? PROFILES[ref.gp.profileId] : undefined
  return {
    id: lgdCode,
    name: ref.gp.name,
    nameHi: ref.gp.nameHi ?? ref.gp.name,
    block: ref.block.name,
    district: ref.district.name,
    state: ref.state.name,
    lat: ref.gp.lat,
    lon: ref.gp.lon,
    kind: profile ? 'illustrative' : 'placeholder',
    fields: profile ? illustrativeFields(profile) : placeholderFields(ref.state.name),
  }
}

export function customVillage(name: string, district: string, state: string): VillageProfile {
  return {
    id: 'custom',
    name: name.trim() || 'My village',
    nameHi: name.trim() || 'मेरा गाँव',
    block: '',
    district: district.trim(),
    state: state.trim(),
    kind: 'custom',
    fields: placeholderFields(state),
  }
}

const today = () => new Date().toISOString().slice(0, 10)

export function applyOverrides(v: VillageProfile, o: Overrides, dataset: Partial<Record<VillageField, Field>> = {}): VillageProfile {
  const fields = { ...v.fields }
  for (const f of VILLAGE_FIELDS) {
    if (dataset[f]) fields[f] = dataset[f]!
    const val = o[f]
    if (typeof val === 'number' && Number.isFinite(val)) {
      fields[f] = { value: val, provenance: 'input', source: 'Entered by the user', year: today() }
    }
  }
  return { ...v, fields }
}

export function toInputs(v: VillageProfile): VillageInputs {
  return Object.fromEntries(VILLAGE_FIELDS.map((f) => [f, v.fields[f].value])) as unknown as VillageInputs
}

export function provenanceOf(v: VillageProfile): Record<VillageField, Provenance> {
  return Object.fromEntries(VILLAGE_FIELDS.map((f) => [f, v.fields[f].provenance])) as Record<VillageField, Provenance>
}

// ---- geography ----

export interface FlatGP extends GP {
  block: string
  district: string
  state: string
}

let flat: FlatGP[] | null = null
export function allGPs(): FlatGP[] {
  if (flat) return flat
  flat = []
  for (const s of states)
    for (const d of s.districts)
      for (const b of d.blocks) for (const gp of b.gramPanchayats) flat.push({ ...gp, block: b.name, district: d.name, state: s.name })
  return flat
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface Neighbour {
  lgdCode: string
  name: string
  nameHi: string
  district: string
  distanceKm: number
  lat: number
  lon: number
  illustrative: boolean
}

export function neighboursOf(lgdCode: string, lat: number, lon: number, radiusKm: number, limit = 8): Neighbour[] {
  return allGPs()
    .filter((g) => g.lgdCode !== lgdCode && g.lat != null && g.lon != null)
    .map((g) => ({
      lgdCode: g.lgdCode,
      name: g.name,
      nameHi: g.nameHi ?? g.name,
      district: g.district,
      distanceKm: haversineKm(lat, lon, g.lat!, g.lon!),
      lat: g.lat!,
      lon: g.lon!,
      illustrative: Boolean(g.profileId),
    }))
    .filter((n) => n.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
