// Reference information shown on the Data sources and About pages.
// Technical names are kept in English. Anything not yet checked is marked verified: false.

export interface DatasetEntry {
  id: string
  name: string
  use: string
  status: 'live' | 'planned' | 'reference'
  year: string
  licence: string
  licenceVerified: boolean
  url: string
}

export const DATASETS: DatasetEntry[] = [
  {
    id: 'soilgrids',
    name: 'ISRIC SoilGrids 2.0',
    use: 'Soil organic carbon (0–30 cm) at the village location, on request from the "Village & carbon" page.',
    status: 'live',
    year: '2020',
    licence: 'CC BY 4.0',
    licenceVerified: true,
    url: 'https://soilgrids.org',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    use: 'Background map on the Neighbouring Panchayats page.',
    status: 'live',
    year: 'current',
    licence: 'ODbL 1.0',
    licenceVerified: true,
    url: 'https://www.openstreetmap.org/copyright',
  },
  {
    id: 'census',
    name: 'Census of India 2011 (Primary Census Abstract)',
    use: 'Households and population per village.',
    status: 'planned',
    year: '2011',
    licence: 'Government Open Data Licence – India (via data.gov.in)',
    licenceVerified: false,
    url: 'https://censusindia.gov.in',
  },
  {
    id: 'livestock',
    name: '20th Livestock Census',
    use: 'Cattle, buffalo, goat and sheep numbers.',
    status: 'planned',
    year: '2019',
    licence: 'Government Open Data Licence – India (via data.gov.in)',
    licenceVerified: false,
    url: 'https://dahd.gov.in',
  },
  {
    id: 'lgd',
    name: 'Local Government Directory (LGD)',
    use: 'Official Gram Panchayat codes and hierarchy. The list in the app today is illustrative.',
    status: 'planned',
    year: 'current',
    licence: 'Government Open Data Licence – India',
    licenceVerified: false,
    url: 'https://lgdirectory.gov.in',
  },
  {
    id: 'bhuvan',
    name: 'Bhuvan land use / Wastelands Atlas (NRSC)',
    use: 'Cropland, common land and degraded land areas.',
    status: 'planned',
    year: '2019',
    licence: 'NRSC / Bhuvan terms of use',
    licenceVerified: false,
    url: 'https://bhuvan.nrsc.gov.in',
  },
  {
    id: 'mgnrega',
    name: 'MGNREGA MIS',
    use: 'Existing plantation and soil-conservation works (to judge what is additional).',
    status: 'planned',
    year: 'ongoing',
    licence: 'Public portal; licence not stated',
    licenceVerified: false,
    url: 'https://nrega.nic.in',
  },
  {
    id: 'egramswaraj',
    name: 'eGramSwaraj / GPDP',
    use: 'Panchayat development plans, to link carbon activities with planned works.',
    status: 'planned',
    year: 'ongoing',
    licence: 'Public portal; licence not stated',
    licenceVerified: false,
    url: 'https://egramswaraj.gov.in',
  },
  {
    id: 'sentinel',
    name: 'Copernicus Sentinel-2',
    use: 'Vegetation and land-cover checks.',
    status: 'planned',
    year: 'ongoing',
    licence: 'Copernicus free, full and open data policy',
    licenceVerified: true,
    url: 'https://dataspace.copernicus.eu',
  },
  {
    id: 'ipcc',
    name: 'IPCC 2006 Guidelines, Vol. 4 (AFOLU)',
    use: 'Default emission and growth factors used in the Assumptions file.',
    status: 'reference',
    year: '2006',
    licence: 'IPCC publication',
    licenceVerified: true,
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol4.html',
  },
  {
    id: 'bee',
    name: 'BEE — CCTS offset methodologies',
    use: 'Methodology statuses. Statuses in the app are marked VERIFY until checked.',
    status: 'reference',
    year: 'current',
    licence: 'Government publication',
    licenceVerified: true,
    url: 'https://beeindia.gov.in',
  },
]

// Institutions in the CCTS offset mechanism (summary; verify before relying on it).
export const ROLES: { role: string; entity: string; verified: boolean }[] = [
  { role: 'Legal basis', entity: 'Energy Conservation (Amendment) Act, 2022 — Carbon Credit Trading Scheme, 2023', verified: true },
  { role: 'Scheme administrator, methodologies, accreditation', entity: 'Bureau of Energy Efficiency (BEE)', verified: true },
  { role: 'Policy oversight', entity: 'National Steering Committee for the Indian Carbon Market (NSCICM)', verified: false },
  { role: 'Registry', entity: 'Grid Controller of India', verified: false },
  { role: 'Validation and verification', entity: 'Accredited Carbon Verification Agencies (ACVAs)', verified: true },
  { role: 'Trading regulation', entity: 'Central Electricity Regulatory Commission (CERC)', verified: true },
]

// Agencies listed by the previous version of this tool as accredited verifiers.
// Accreditation status and validity were NOT verified, so no dates are shown.
export const ACVA_LISTED = ['SGS India Pvt. Ltd.', 'Bureau Veritas India', 'DNV India Pvt. Ltd.', 'TÜV SÜD South Asia']
