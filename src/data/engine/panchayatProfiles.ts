// Bundled open-data snapshots for the pilot Gram Panchayats.
// These stand in for what a production pipeline would pull from:
//   - MGNREGA MIS (nrega.nic.in)         : geotagged NRM assets, works history
//   - 20th Livestock Census (DAHD)        : district herd counts, apportioned to GP by population
//   - LGD + Census 2011                   : population, households, land use
//   - Bhuvan / Sentinel-2 LULC            : plantation / common / degraded land area
//   - ISRIC SoilGrids 2.0                 : soil organic carbon (0–30 cm)
//
// Every figure carries a `source` and `vintage` so the UI can show the basis (RULES.md §8).
// Values are researched approximations for the pilot districts (Mandla MP, Dahod GJ),
// not exact village records — the tool is a screening aid, not a survey.

export interface Sourced<T> {
  value: T
  source: string
  vintage: string
  note?: string
}

export interface MgnregaAsset {
  type: string
  typeHi: string
  count: number
  areaHa?: number
  relevance: string
}

export interface PanchayatProfile {
  id: string
  lgdCode: string
  name: string
  nameHi: string
  district: string
  state: string
  lat: number
  lon: number

  population: Sourced<number>
  households: Sourced<number>

  landUseHa: {
    total: Sourced<number>
    agricultural: Sourced<number>
    commonAndForest: Sourced<number>
    degradedRestorable: Sourced<number>
    existingPlantation: Sourced<number>
  }

  // livestock apportioned to GP level (head)
  livestock: Sourced<{
    dairy_cattle: number
    indigenous_cattle: number
    buffalo: number
    goat: number
    sheep: number
  }>

  soilOrganicCarbon: Sourced<number> // t C / ha, 0–30 cm mean

  mgnregaAssets: Sourced<MgnregaAsset[]>

  // rough NDVI-derived vegetation vigour 0–100, for display only
  vegetationIndex: Sourced<number>
}

const S = <T>(value: T, source: string, vintage: string, note?: string): Sourced<T> => ({
  value,
  source,
  vintage,
  note,
})

export const panchayatProfiles: Record<string, PanchayatProfile> = {
  jamgaon: {
    id: 'jamgaon',
    lgdCode: '143892',
    name: 'Jamgaon',
    nameHi: 'जामगाँव',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    lat: 22.44,
    lon: 80.78,
    population: S(2410, 'Census of India 2011, apportioned to current GP boundary', '2011'),
    households: S(512, 'Census of India 2011 / SECC household frame', '2011'),
    landUseHa: {
      total: S(1180, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(540, 'Bhuvan LULC 2021 cropland class', '2021'),
      commonAndForest: S(430, 'GP common land register + Forest Dept working plan', '2019'),
      degradedRestorable: S(150, 'Bhuvan wasteland atlas — open scrub / degraded forest', '2019'),
      existingPlantation: S(62, 'MGNREGA plantation works + orchard blocks', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 180, indigenous_cattle: 640, buffalo: 210, goat: 380, sheep: 60 },
      '20th Livestock Census (DAHD) district totals, apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(
      14.8,
      'ISRIC SoilGrids 2.0 — SOC stock 0–30 cm, GP centroid',
      '2020',
      'Sub-humid tropical, moderate SOC; upside from bunding & pasture regeneration.',
    ),
    vegetationIndex: S(52, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 9, areaHa: 41, relevance: 'Agroforestry baseline & additionality' },
        { type: 'Farm ponds', typeHi: 'खेत तालाब', count: 14, relevance: 'Soil moisture → SOC, survival of plantings' },
        { type: 'Check dams / stop dams', typeHi: 'चेक डैम', count: 6, relevance: 'Watershed, restored-land eligibility' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 22, areaHa: 95, relevance: 'Soil organic carbon pathway' },
        { type: 'Wasteland development', typeHi: 'बंजर भूमि विकास', count: 5, areaHa: 30, relevance: 'Restorable / degraded area' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },

  kuknamal: {
    id: 'kuknamal',
    lgdCode: '143905',
    name: 'Kuknamal',
    nameHi: 'कुकनमाल',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    lat: 22.49,
    lon: 80.83,
    population: S(640, 'Census of India 2011', '2011'),
    households: S(138, 'Census of India 2011 / SECC', '2011'),
    landUseHa: {
      total: S(410, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(150, 'Bhuvan LULC 2021 cropland', '2021'),
      commonAndForest: S(190, 'GP common land register + Forest working plan', '2019'),
      degradedRestorable: S(58, 'Bhuvan wasteland atlas', '2019'),
      existingPlantation: S(12, 'MGNREGA plantation works', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 20, indigenous_cattle: 90, buffalo: 24, goat: 70, sheep: 12 },
      '20th Livestock Census (DAHD), apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(13.9, 'ISRIC SoilGrids 2.0 — SOC 0–30 cm', '2020'),
    vegetationIndex: S(58, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 3, areaHa: 9, relevance: 'Agroforestry baseline' },
        { type: 'Farm ponds', typeHi: 'खेत तालाब', count: 4, relevance: 'Soil moisture / SOC' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 7, areaHa: 26, relevance: 'Soil organic carbon pathway' },
        { type: 'Pasture / grazing land development', typeHi: 'चरागाह विकास', count: 2, areaHa: 18, relevance: 'Common pastureland regeneration' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },

  bichhiya_rural: {
    id: 'bichhiya_rural',
    lgdCode: '143912',
    name: 'Bichhiya Rural',
    nameHi: 'बिछिया ग्रामीण',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    lat: 22.46,
    lon: 80.81,
    population: S(1520, 'Census of India 2011', '2011'),
    households: S(324, 'Census of India 2011 / SECC', '2011'),
    landUseHa: {
      total: S(760, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(360, 'Bhuvan LULC 2021 cropland', '2021'),
      commonAndForest: S(250, 'GP common land register + Forest working plan', '2019'),
      degradedRestorable: S(92, 'Bhuvan wasteland atlas', '2019'),
      existingPlantation: S(34, 'MGNREGA plantation works', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 110, indigenous_cattle: 400, buffalo: 130, goat: 240, sheep: 36 },
      '20th Livestock Census (DAHD), apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(15.2, 'ISRIC SoilGrids 2.0 — SOC 0–30 cm', '2020'),
    vegetationIndex: S(49, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 6, areaHa: 24, relevance: 'Agroforestry baseline' },
        { type: 'Farm ponds', typeHi: 'खेत तालाब', count: 9, relevance: 'Soil moisture / SOC' },
        { type: 'Check dams', typeHi: 'चेक डैम', count: 4, relevance: 'Watershed / restored land' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 13, areaHa: 58, relevance: 'Soil organic carbon pathway' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },

  sukhsar: {
    id: 'sukhsar',
    lgdCode: '215680',
    name: 'Sukhsar',
    nameHi: 'सुखसर',
    district: 'Dahod',
    state: 'Gujarat',
    lat: 22.98,
    lon: 74.15,
    population: S(3120, 'Census of India 2011', '2011'),
    households: S(648, 'Census of India 2011 / SECC', '2011'),
    landUseHa: {
      total: S(1290, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(680, 'Bhuvan LULC 2021 cropland', '2021'),
      commonAndForest: S(360, 'GP common land register + Forest working plan', '2019'),
      degradedRestorable: S(140, 'Bhuvan wasteland atlas', '2019'),
      existingPlantation: S(71, 'MGNREGA plantation works + farm forestry', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 240, indigenous_cattle: 560, buffalo: 320, goat: 410, sheep: 40 },
      '20th Livestock Census (DAHD), apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(
      11.4,
      'ISRIC SoilGrids 2.0 — SOC 0–30 cm',
      '2020',
      'Semi-arid; lower baseline SOC means larger proportional gain from regenerative practice.',
    ),
    vegetationIndex: S(41, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 11, areaHa: 47, relevance: 'Agroforestry baseline & additionality' },
        { type: 'Farm ponds / dobha', typeHi: 'खेत तालाब', count: 18, relevance: 'Soil moisture / SOC' },
        { type: 'Check dams', typeHi: 'चेक डैम', count: 7, relevance: 'Watershed / restored land' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 25, areaHa: 110, relevance: 'Soil organic carbon pathway' },
        { type: 'Wasteland development', typeHi: 'बंजर भूमि विकास', count: 6, areaHa: 36, relevance: 'Restorable / degraded area' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },

  chosala: {
    id: 'chosala',
    lgdCode: '215694',
    name: 'Chosala',
    nameHi: 'चोसाला',
    district: 'Dahod',
    state: 'Gujarat',
    lat: 23.02,
    lon: 74.18,
    population: S(1490, 'Census of India 2011', '2011'),
    households: S(312, 'Census of India 2011 / SECC', '2011'),
    landUseHa: {
      total: S(640, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(330, 'Bhuvan LULC 2021 cropland', '2021'),
      commonAndForest: S(180, 'GP common land register', '2019'),
      degradedRestorable: S(74, 'Bhuvan wasteland atlas', '2019'),
      existingPlantation: S(40, 'MGNREGA plantation works', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 120, indigenous_cattle: 300, buffalo: 160, goat: 220, sheep: 24 },
      '20th Livestock Census (DAHD), apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(11.8, 'ISRIC SoilGrids 2.0 — SOC 0–30 cm', '2020'),
    vegetationIndex: S(43, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 8, areaHa: 30, relevance: 'Agroforestry baseline' },
        { type: 'Farm ponds', typeHi: 'खेत तालाब', count: 10, relevance: 'Soil moisture / SOC' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 15, areaHa: 62, relevance: 'Soil organic carbon pathway' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },

  zalod_rural: {
    id: 'zalod_rural',
    lgdCode: '215705',
    name: 'Zalod Rural',
    nameHi: 'झालोद ग्रामीण',
    district: 'Dahod',
    state: 'Gujarat',
    lat: 22.95,
    lon: 74.12,
    population: S(2560, 'Census of India 2011', '2011'),
    households: S(534, 'Census of India 2011 / SECC', '2011'),
    landUseHa: {
      total: S(1010, 'LGD area statement + Bhuvan LULC', '2021'),
      agricultural: S(560, 'Bhuvan LULC 2021 cropland', '2021'),
      commonAndForest: S(240, 'GP common land register', '2019'),
      degradedRestorable: S(105, 'Bhuvan wasteland atlas', '2019'),
      existingPlantation: S(58, 'MGNREGA plantation works', '2016–2024'),
    },
    livestock: S(
      { dairy_cattle: 200, indigenous_cattle: 470, buffalo: 260, goat: 340, sheep: 32 },
      '20th Livestock Census (DAHD), apportioned by GP population share',
      '2019',
    ),
    soilOrganicCarbon: S(11.1, 'ISRIC SoilGrids 2.0 — SOC 0–30 cm', '2020'),
    vegetationIndex: S(40, 'Sentinel-2 NDVI growing-season median', '2023'),
    mgnregaAssets: S(
      [
        { type: 'Tree plantation blocks', typeHi: 'वृक्षारोपण खंड', count: 10, areaHa: 40, relevance: 'Agroforestry baseline' },
        { type: 'Farm ponds', typeHi: 'खेत तालाब', count: 15, relevance: 'Soil moisture / SOC' },
        { type: 'Check dams', typeHi: 'चेक डैम', count: 5, relevance: 'Watershed / restored land' },
        { type: 'Contour / field bunding', typeHi: 'मेड़बंदी', count: 20, areaHa: 88, relevance: 'Soil organic carbon pathway' },
      ],
      'MGNREGA MIS geotagged NRM asset register',
      '2016–2024',
    ),
  },
}

// Regional defaults for any village outside the pilot districts.
export interface RegionalDefault {
  soilOrganicCarbon: number
  agriShareOfArea: number
  commonShareOfArea: number
  degradedShareOfArea: number
  plantationShareOfArea: number
  livestockPer1000People: { dairy_cattle: number; indigenous_cattle: number; buffalo: number; goat: number; sheep: number }
  vegetationIndex: number
  basis: string
}

export const regionalDefaults: Record<string, RegionalDefault> = {
  // central Indian tribal belt (MP / CG / Jharkhand / Odisha uplands)
  central_tribal: {
    soilOrganicCarbon: 14.5,
    agriShareOfArea: 0.46,
    commonShareOfArea: 0.34,
    degradedShareOfArea: 0.12,
    plantationShareOfArea: 0.05,
    livestockPer1000People: { dairy_cattle: 70, indigenous_cattle: 260, buffalo: 85, goat: 150, sheep: 22 },
    vegetationIndex: 50,
    basis: 'Regional mean for the central Indian tribal belt (SoilGrids + Livestock Census + LULC district aggregates).',
  },
  // semi-arid western belt (Gujarat / Rajasthan / western MP)
  semi_arid_west: {
    soilOrganicCarbon: 10.8,
    agriShareOfArea: 0.54,
    commonShareOfArea: 0.24,
    degradedShareOfArea: 0.13,
    plantationShareOfArea: 0.05,
    livestockPer1000People: { dairy_cattle: 78, indigenous_cattle: 180, buffalo: 105, goat: 135, sheep: 14 },
    vegetationIndex: 41,
    basis: 'Regional mean for the semi-arid western belt (SoilGrids + Livestock Census + LULC district aggregates).',
  },
  // moist deccan / western ghats fringe (Maharashtra / Karnataka uplands)
  moist_deccan: {
    soilOrganicCarbon: 16.0,
    agriShareOfArea: 0.42,
    commonShareOfArea: 0.36,
    degradedShareOfArea: 0.1,
    plantationShareOfArea: 0.06,
    livestockPer1000People: { dairy_cattle: 90, indigenous_cattle: 210, buffalo: 120, goat: 140, sheep: 30 },
    vegetationIndex: 55,
    basis: 'Regional mean for the moist Deccan / Western Ghats fringe.',
  },
}

export function regionForState(stateName: string): keyof typeof regionalDefaults {
  if (['Gujarat', 'Rajasthan'].includes(stateName)) return 'semi_arid_west'
  if (['Maharashtra', 'Karnataka'].includes(stateName)) return 'moist_deccan'
  return 'central_tribal'
}
