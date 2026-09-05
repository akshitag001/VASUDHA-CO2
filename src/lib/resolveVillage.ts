// Turn an LGD code into a normalised village profile the engine can use.
// Pilot villages come from bundled open-data snapshots; others are built from
// regional defaults scaled by an assumed area and population.

import { findGP } from '../data/engine/lgd'
import {
  panchayatProfiles,
  regionalDefaults,
  regionForState,
  type PanchayatProfile,
} from '../data/engine/panchayatProfiles'
import type { MethodologyProfile } from '../data/engine/methodologies'

export interface ResolvedVillage {
  lgdCode: string
  name: string
  nameHi: string
  place: string
  placeHi: string
  lat?: number
  lon?: number

  isPilot: boolean
  dataQuality: 'measured' | 'regional-estimate'

  households: number
  population: number

  landUseHa: {
    total: number
    agricultural: number
    commonAndForest: number
    degradedRestorable: number
    existingPlantation: number
  }
  livestock: {
    dairy_cattle: number
    indigenous_cattle: number
    buffalo: number
    goat: number
    sheep: number
  }
  soilOrganicCarbon: number
  soilBasis: string
  vegetationIndex: number

  profile?: PanchayatProfile // full sourced snapshot for pilot villages
  sourceLines: { label: string; value: string; source: string; vintage: string }[]
}

function fromProfile(p: PanchayatProfile): ResolvedVillage {
  return {
    lgdCode: p.lgdCode,
    name: p.name,
    nameHi: p.nameHi,
    place: `${p.district}, ${p.state}`,
    placeHi: `${p.district}, ${p.state}`,
    lat: p.lat,
    lon: p.lon,
    isPilot: true,
    dataQuality: 'measured',
    households: p.households.value,
    population: p.population.value,
    landUseHa: {
      total: p.landUseHa.total.value,
      agricultural: p.landUseHa.agricultural.value,
      commonAndForest: p.landUseHa.commonAndForest.value,
      degradedRestorable: p.landUseHa.degradedRestorable.value,
      existingPlantation: p.landUseHa.existingPlantation.value,
    },
    livestock: p.livestock.value,
    soilOrganicCarbon: p.soilOrganicCarbon.value,
    soilBasis: `${p.soilOrganicCarbon.source} (${p.soilOrganicCarbon.vintage})`,
    vegetationIndex: p.vegetationIndex.value,
    profile: p,
    sourceLines: [
      { label: 'Population', value: String(p.population.value), source: p.population.source, vintage: p.population.vintage },
      { label: 'Households', value: String(p.households.value), source: p.households.source, vintage: p.households.vintage },
      { label: 'Total area (ha)', value: String(p.landUseHa.total.value), source: p.landUseHa.total.source, vintage: p.landUseHa.total.vintage },
      { label: 'Cropland (ha)', value: String(p.landUseHa.agricultural.value), source: p.landUseHa.agricultural.source, vintage: p.landUseHa.agricultural.vintage },
      { label: 'Common + forest (ha)', value: String(p.landUseHa.commonAndForest.value), source: p.landUseHa.commonAndForest.source, vintage: p.landUseHa.commonAndForest.vintage },
      { label: 'Degraded / restorable (ha)', value: String(p.landUseHa.degradedRestorable.value), source: p.landUseHa.degradedRestorable.source, vintage: p.landUseHa.degradedRestorable.vintage },
      { label: 'Existing plantation (ha)', value: String(p.landUseHa.existingPlantation.value), source: p.landUseHa.existingPlantation.source, vintage: p.landUseHa.existingPlantation.vintage },
      { label: 'Livestock (cattle+buffalo+small)', value: String(p.livestock.value.dairy_cattle + p.livestock.value.indigenous_cattle + p.livestock.value.buffalo + p.livestock.value.goat + p.livestock.value.sheep), source: p.livestock.source, vintage: p.livestock.vintage },
      { label: 'Soil organic carbon (t C/ha)', value: String(p.soilOrganicCarbon.value), source: p.soilOrganicCarbon.source, vintage: p.soilOrganicCarbon.vintage },
    ],
  }
}

function fromRegionalDefault(lgdCode: string): ResolvedVillage {
  const ref = findGP(lgdCode)!
  const region = regionForState(ref.state.name)
  const d = regionalDefaults[region]

  // Assume a mid-size village where we have no measured area/population.
  const population = 1800
  const households = 380
  const totalHa = 720

  const livestock = {
    dairy_cattle: Math.round((d.livestockPer1000People.dairy_cattle * population) / 1000),
    indigenous_cattle: Math.round((d.livestockPer1000People.indigenous_cattle * population) / 1000),
    buffalo: Math.round((d.livestockPer1000People.buffalo * population) / 1000),
    goat: Math.round((d.livestockPer1000People.goat * population) / 1000),
    sheep: Math.round((d.livestockPer1000People.sheep * population) / 1000),
  }

  return {
    lgdCode,
    name: ref.gp.name,
    nameHi: ref.gp.nameHi ?? ref.gp.name,
    place: `${ref.block.name}, ${ref.district.name}, ${ref.state.name}`,
    placeHi: `${ref.block.nameHi ?? ref.block.name}, ${ref.district.nameHi ?? ref.district.name}, ${ref.state.nameHi ?? ref.state.name}`,
    lat: ref.gp.lat,
    lon: ref.gp.lon,
    isPilot: false,
    dataQuality: 'regional-estimate',
    households,
    population,
    landUseHa: {
      total: totalHa,
      agricultural: Math.round(totalHa * d.agriShareOfArea),
      commonAndForest: Math.round(totalHa * d.commonShareOfArea),
      degradedRestorable: Math.round(totalHa * d.degradedShareOfArea),
      existingPlantation: Math.round(totalHa * d.plantationShareOfArea),
    },
    livestock,
    soilOrganicCarbon: d.soilOrganicCarbon,
    soilBasis: d.basis,
    vegetationIndex: d.vegetationIndex,
    sourceLines: [
      { label: 'All figures', value: 'regional estimate', source: d.basis, vintage: 'various' },
    ],
  }
}

export function resolveVillage(lgdCode: string): ResolvedVillage | null {
  const ref = findGP(lgdCode)
  if (!ref) return null
  if (ref.gp.profileId && panchayatProfiles[ref.gp.profileId]) {
    return fromProfile(panchayatProfiles[ref.gp.profileId])
  }
  return fromRegionalDefault(lgdCode)
}

export function toMethodologyProfile(v: ResolvedVillage): MethodologyProfile {
  const totalLivestock =
    v.livestock.dairy_cattle +
    v.livestock.indigenous_cattle +
    v.livestock.buffalo +
    v.livestock.goat +
    v.livestock.sheep
  return {
    households: v.households,
    agriculturalHa: v.landUseHa.agricultural,
    commonAndForestHa: v.landUseHa.commonAndForest,
    degradedRestorableHa: v.landUseHa.degradedRestorable,
    existingPlantationHa: v.landUseHa.existingPlantation,
    totalLivestock,
    cattleBuffalo: v.livestock.dairy_cattle + v.livestock.indigenous_cattle + v.livestock.buffalo,
    soilOrganicCarbon: v.soilOrganicCarbon,
    hasPasture: v.landUseHa.commonAndForest >= 20,
  }
}
