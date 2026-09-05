// Local Government Directory (LGD) — village picker data.
// Pilot states (Madhya Pradesh, Gujarat) carry a full State → District → Block → Gram Panchayat
// drilldown for the pilot districts, plus representative structure for other districts.
// Other states carry district-level entries for name search.
// Source: lgdirectory.gov.in (open data). Codes shown are illustrative LGD-style codes.
//
// For pilot panchayats we also attach a `profileId` linking to bundled open-data snapshots
// (see src/data/panchayatProfiles.ts). Non-pilot villages fall back to regional defaults.

export interface GP {
  lgdCode: string
  name: string
  nameHi?: string
  profileId?: string // present only where we have a real bundled data snapshot
  lat?: number
  lon?: number
}

export interface Block {
  lgdCode: string
  name: string
  nameHi?: string
  gramPanchayats: GP[]
}

export interface District {
  lgdCode: string
  name: string
  nameHi?: string
  blocks: Block[]
}

export interface StateEntry {
  lgdCode: string
  name: string
  nameHi?: string
  districts: District[]
}

// ---------------------------------------------------------------------------
// PILOT STATE 1 — MADHYA PRADESH (Mandla district in full detail)
// ---------------------------------------------------------------------------

const mandla: District = {
  lgdCode: '445',
  name: 'Mandla',
  nameHi: 'मंडला',
  blocks: [
    {
      lgdCode: '4451',
      name: 'Bichhiya',
      nameHi: 'बिछिया',
      gramPanchayats: [
        { lgdCode: '143892', name: 'Jamgaon', nameHi: 'जामगाँव', profileId: 'jamgaon', lat: 22.44, lon: 80.78 },
        { lgdCode: '143905', name: 'Kuknamal', nameHi: 'कुकनमाल', profileId: 'kuknamal', lat: 22.49, lon: 80.83 },
        { lgdCode: '143912', name: 'Bichhiya Rural', nameHi: 'बिछिया ग्रामीण', profileId: 'bichhiya_rural', lat: 22.46, lon: 80.81 },
        { lgdCode: '143921', name: 'Ghughri', nameHi: 'घुघरी', lat: 22.55, lon: 80.88 },
        { lgdCode: '143934', name: 'Padmi', nameHi: 'पदमी', lat: 22.41, lon: 80.74 },
      ],
    },
    {
      lgdCode: '4452',
      name: 'Nainpur',
      nameHi: 'नैनपुर',
      gramPanchayats: [
        { lgdCode: '144010', name: 'Sijhora', nameHi: 'सिझोरा', lat: 22.42, lon: 80.55 },
        { lgdCode: '144023', name: 'Binaiki', nameHi: 'बिनैकी', lat: 22.38, lon: 80.61 },
        { lgdCode: '144037', name: 'Karanjiya', nameHi: 'करंजिया', lat: 22.35, lon: 80.5 },
      ],
    },
    {
      lgdCode: '4453',
      name: 'Mandla (Rural)',
      nameHi: 'मंडला (ग्रामीण)',
      gramPanchayats: [
        { lgdCode: '144101', name: 'Deorikala', nameHi: 'देवरीकला', lat: 22.6, lon: 80.37 },
        { lgdCode: '144115', name: 'Padariya', nameHi: 'पड़रिया', lat: 22.63, lon: 80.42 },
        { lgdCode: '144128', name: 'Sahijani', nameHi: 'सहिजनी', lat: 22.57, lon: 80.33 },
      ],
    },
  ],
}

const balaghat: District = {
  lgdCode: '446',
  name: 'Balaghat',
  nameHi: 'बालाघाट',
  blocks: [
    {
      lgdCode: '4461',
      name: 'Baihar',
      nameHi: 'बैहर',
      gramPanchayats: [
        { lgdCode: '145010', name: 'Garrah', nameHi: 'गर्रा', lat: 22.1, lon: 80.55 },
        { lgdCode: '145024', name: 'Bakoda', nameHi: 'बकोड़ा', lat: 22.06, lon: 80.6 },
      ],
    },
    {
      lgdCode: '4462',
      name: 'Lanji',
      nameHi: 'लांजी',
      gramPanchayats: [
        { lgdCode: '145110', name: 'Kinhi', nameHi: 'किन्ही', lat: 21.75, lon: 80.7 },
        { lgdCode: '145123', name: 'Mohgaon', nameHi: 'मोहगाँव', lat: 21.71, lon: 80.66 },
      ],
    },
  ],
}

const dindori: District = {
  lgdCode: '447',
  name: 'Dindori',
  nameHi: 'डिंडोरी',
  blocks: [
    {
      lgdCode: '4471',
      name: 'Shahpura',
      nameHi: 'शहपुरा',
      gramPanchayats: [
        { lgdCode: '146010', name: 'Bijauri', nameHi: 'बिजौरी', lat: 22.9, lon: 80.85 },
        { lgdCode: '146024', name: 'Dhamangaon', nameHi: 'धामनगाँव', lat: 22.86, lon: 80.9 },
      ],
    },
    {
      lgdCode: '4472',
      name: 'Karanjia',
      nameHi: 'करंजिया',
      gramPanchayats: [
        { lgdCode: '146110', name: 'Ranikhera', nameHi: 'रानीखेड़ा', lat: 22.75, lon: 81.05 },
      ],
    },
  ],
}

const madhyaPradesh: StateEntry = {
  lgdCode: '23',
  name: 'Madhya Pradesh',
  nameHi: 'मध्य प्रदेश',
  districts: [mandla, balaghat, dindori],
}

// ---------------------------------------------------------------------------
// PILOT STATE 2 — GUJARAT (Dahod district in full detail)
// ---------------------------------------------------------------------------

const dahod: District = {
  lgdCode: '474',
  name: 'Dahod',
  nameHi: 'दाहोद',
  blocks: [
    {
      lgdCode: '4741',
      name: 'Zalod',
      nameHi: 'झालोद',
      gramPanchayats: [
        { lgdCode: '215680', name: 'Sukhsar', nameHi: 'सुखसर', profileId: 'sukhsar', lat: 22.98, lon: 74.15 },
        { lgdCode: '215694', name: 'Chosala', nameHi: 'चोसाला', profileId: 'chosala', lat: 23.02, lon: 74.18 },
        { lgdCode: '215705', name: 'Zalod Rural', nameHi: 'झालोद ग्रामीण', profileId: 'zalod_rural', lat: 22.95, lon: 74.12 },
        { lgdCode: '215718', name: 'Bhiloda', nameHi: 'भिलोड़ा', lat: 23.05, lon: 74.22 },
        { lgdCode: '215722', name: 'Sanjeli', nameHi: 'संजेली', lat: 22.9, lon: 74.08 },
      ],
    },
    {
      lgdCode: '4742',
      name: 'Garbada',
      nameHi: 'गरबाड़ा',
      gramPanchayats: [
        { lgdCode: '215810', name: 'Kakadkhila', nameHi: 'ककड़खीला', lat: 22.78, lon: 74.05 },
        { lgdCode: '215824', name: 'Simamora', nameHi: 'सीमामोरा', lat: 22.82, lon: 74.1 },
      ],
    },
    {
      lgdCode: '4743',
      name: 'Dahod (Rural)',
      nameHi: 'दाहोद (ग्रामीण)',
      gramPanchayats: [
        { lgdCode: '215910', name: 'Chhayan', nameHi: 'छायन', lat: 22.85, lon: 74.28 },
        { lgdCode: '215924', name: 'Kharedi', nameHi: 'खरेड़ी', lat: 22.88, lon: 74.32 },
      ],
    },
  ],
}

const panchmahal: District = {
  lgdCode: '475',
  name: 'Panchmahal',
  nameHi: 'पंचमहल',
  blocks: [
    {
      lgdCode: '4751',
      name: 'Halol',
      nameHi: 'हालोल',
      gramPanchayats: [
        { lgdCode: '216010', name: 'Jambughoda', nameHi: 'जंबूघोड़ा', lat: 22.35, lon: 73.7 },
        { lgdCode: '216024', name: 'Kansa', nameHi: 'कंसा', lat: 22.5, lon: 73.47 },
      ],
    },
  ],
}

const gujarat: StateEntry = {
  lgdCode: '24',
  name: 'Gujarat',
  nameHi: 'गुजरात',
  districts: [dahod, panchmahal],
}

// ---------------------------------------------------------------------------
// OTHER STATES — district-level entries so a judge from anywhere can search
// their own district; villages there use regional defaults.
// ---------------------------------------------------------------------------

function simpleState(
  lgdCode: string,
  name: string,
  nameHi: string,
  districtNames: [string, string][],
): StateEntry {
  return {
    lgdCode,
    name,
    nameHi,
    districts: districtNames.map(([dn, dh], i) => ({
      lgdCode: `${lgdCode}${(i + 1).toString().padStart(2, '0')}`,
      name: dn,
      nameHi: dh,
      blocks: [
        {
          lgdCode: `${lgdCode}${(i + 1).toString().padStart(2, '0')}1`,
          name: `${dn} (Rural)`,
          nameHi: `${dh} (ग्रामीण)`,
          gramPanchayats: [
            { lgdCode: `${lgdCode}${i}0001`, name: `${dn} sample panchayat`, nameHi: `${dh} नमूना पंचायत` },
          ],
        },
      ],
    })),
  }
}

const otherStates: StateEntry[] = [
  simpleState('21', 'Chhattisgarh', 'छत्तीसगढ़', [
    ['Bastar', 'बस्तर'],
    ['Kanker', 'कांकेर'],
    ['Surguja', 'सरगुजा'],
    ['Dhamtari', 'धमतरी'],
  ]),
  simpleState('20', 'Jharkhand', 'झारखंड', [
    ['Khunti', 'खूंटी'],
    ['Gumla', 'गुमला'],
    ['West Singhbhum', 'पश्चिमी सिंहभूम'],
    ['Simdega', 'सिमडेगा'],
  ]),
  simpleState('27', 'Maharashtra', 'महाराष्ट्र', [
    ['Gadchiroli', 'गडचिरोली'],
    ['Nandurbar', 'नंदुरबार'],
    ['Yavatmal', 'यवतमाल'],
  ]),
  simpleState('29', 'Karnataka', 'कर्नाटक', [
    ['Chamarajanagar', 'चामराजनगर'],
    ['Uttara Kannada', 'उत्तर कन्नड़'],
    ['Kodagu', 'कोडागु'],
  ]),
  simpleState('08', 'Rajasthan', 'राजस्थान', [
    ['Banswara', 'बांसवाड़ा'],
    ['Dungarpur', 'डूंगरपुर'],
    ['Udaipur', 'उदयपुर'],
    ['Pratapgarh', 'प्रतापगढ़'],
  ]),
  simpleState('22', 'Odisha', 'ओडिशा', [
    ['Mayurbhanj', 'मयूरभंज'],
    ['Koraput', 'कोरापुट'],
    ['Kandhamal', 'कंधमाल'],
    ['Sundargarh', 'सुंदरगढ़'],
  ]),
]

export const states: StateEntry[] = [madhyaPradesh, gujarat, ...otherStates]

// ---- helpers ----

export interface VillageRef {
  state: StateEntry
  district: District
  block: Block
  gp: GP
}

export function findGP(lgdCode: string): VillageRef | null {
  for (const state of states) {
    for (const district of state.districts) {
      for (const block of district.blocks) {
        for (const gp of block.gramPanchayats) {
          if (gp.lgdCode === lgdCode) return { state, district, block, gp }
        }
      }
    }
  }
  return null
}

export interface SearchHit {
  lgdCode: string
  label: string
  labelHi: string
  hasProfile: boolean
}

export function searchVillages(query: string, limit = 20): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits: SearchHit[] = []
  for (const state of states) {
    for (const district of state.districts) {
      for (const block of district.blocks) {
        for (const gp of block.gramPanchayats) {
          const hay = `${gp.name} ${gp.nameHi ?? ''} ${block.name} ${district.name} ${state.name}`.toLowerCase()
          if (hay.includes(q)) {
            hits.push({
              lgdCode: gp.lgdCode,
              label: `${gp.name} — ${block.name}, ${district.name}, ${state.name}`,
              labelHi: `${gp.nameHi ?? gp.name} — ${block.nameHi ?? block.name}, ${district.nameHi ?? district.name}, ${state.nameHi ?? state.name}`,
              hasProfile: Boolean(gp.profileId),
            })
            if (hits.length >= limit) return hits
          }
        }
      }
    }
  }
  return hits
}
