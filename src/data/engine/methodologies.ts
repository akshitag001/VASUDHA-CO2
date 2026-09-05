// CCTS offset methodologies — maintained rule set (Module B).
//
// IMPORTANT: this list is a LIVING DOCUMENT. It must be reviewed against the official
// BEE-approved CCTS methodology list before each pilot cycle. The `status` field is the
// single most important thing this tool tells a Gram Sabha: an activity can be an
// "eligible sector" while its detailed methodology is still "pending" — meaning a project
// cannot be registered under it yet, whatever an aggregator says.
//
// Status meanings:
//   'approved' — a detailed methodology is notified; projects can register today
//   'pending'  — the sector is eligible but the detailed methodology is not yet notified
//   'draft'    — a draft methodology is in public consultation
//
// Dates and codes here are indicative and MUST be verified against beeindia.gov.in / carbonmarket.gov.in.

export const METHODOLOGY_LIST_UPDATED = '2026-08 (indicative — verify against BEE before use)'

export type MethStatus = 'approved' | 'pending' | 'draft'

export interface Condition {
  id: string
  label: string
  labelHi: string
  // check receives a normalised village profile summary
  check: (p: MethodologyProfile) => boolean
  // human-readable requirement, shown whether met or not
  requirement: string
  requirementHi: string
}

export interface MethodologyProfile {
  households: number
  agriculturalHa: number
  commonAndForestHa: number
  degradedRestorableHa: number
  existingPlantationHa: number
  totalLivestock: number
  cattleBuffalo: number
  soilOrganicCarbon: number
  hasPasture: boolean
}

export interface Methodology {
  code: string
  sector: string
  name: string
  nameHi: string
  status: MethStatus
  statusNote: string
  statusNoteHi: string
  lastUpdated: string
  sourceUrl: string
  activityKey: 'agroforestry' | 'manure' | 'soil' | 'pasture'
  conditions: Condition[]
}

const cond = (
  id: string,
  label: string,
  labelHi: string,
  requirement: string,
  requirementHi: string,
  check: (p: MethodologyProfile) => boolean,
): Condition => ({ id, label, labelHi, requirement, requirementHi, check })

export const methodologies: Methodology[] = [
  {
    code: 'CCTS-AF-001',
    sector: 'Forestry',
    name: 'Agroforestry & farm forestry on community and private land',
    nameHi: 'सामुदायिक एवं निजी भूमि पर कृषि-वानिकी और खेत-वानिकी',
    status: 'pending',
    statusNote:
      'Afforestation / agroforestry is an eligible CCTS offset sector, but the detailed BEE methodology is not yet notified. Projects cannot register under it today — treat aggregator claims of "agroforestry credits available now" with caution.',
    statusNoteHi:
      'वनरोपण / कृषि-वानिकी एक पात्र CCTS ऑफ़सेट क्षेत्र है, लेकिन BEE की विस्तृत पद्धति अभी अधिसूचित नहीं है। आज इसके तहत परियोजना पंजीकृत नहीं हो सकती — "अभी कृषि-वानिकी क्रेडिट उपलब्ध हैं" जैसे एग्रीगेटर दावों को सावधानी से लें।',
    lastUpdated: '2026-06',
    sourceUrl: 'https://carbonmarket.gov.in',
    activityKey: 'agroforestry',
    conditions: [
      cond(
        'area',
        'Plantable area available',
        'रोपण-योग्य क्षेत्र उपलब्ध',
        'At least 5 ha of community, degraded or farm-boundary land available for tree planting',
        'वृक्षारोपण हेतु कम से कम 5 हेक्टेयर सामुदायिक, क्षरित या खेत-मेड़ भूमि उपलब्ध',
        (p) => p.commonAndForestHa + p.degradedRestorableHa >= 5,
      ),
      cond(
        'landtype',
        'Eligible land type',
        'पात्र भूमि प्रकार',
        'Land is wasteland, common property resource, panchayat land or private farm boundary (not existing dense forest)',
        'भूमि बंजर, साझा सम्पदा, पंचायत भूमि या निजी खेत-मेड़ हो (मौजूदा घना वन नहीं)',
        (p) => p.degradedRestorableHa > 0 || p.commonAndForestHa > 5,
      ),
      cond(
        'additionality',
        'Additional to business-as-usual',
        'सामान्य से अतिरिक्त',
        'Planting would not happen anyway without carbon finance (new blocks beyond existing MGNREGA plantation)',
        'कार्बन वित्त के बिना यह रोपण वैसे भी न होता (मौजूदा मनरेगा वृक्षारोपण से अधिक नए खंड)',
        (p) => p.degradedRestorableHa >= 20,
      ),
    ],
  },
  {
    code: 'CCTS-MM-002',
    sector: 'Agriculture',
    name: 'Smallholder livestock manure management & community biogas',
    nameHi: 'लघु-किसान पशुधन गोबर प्रबंधन एवं सामुदायिक बायोगैस',
    status: 'approved',
    statusNote:
      'A detailed methodology for manure management / biogas methane avoidance is among the earlier-notified CCTS offset methods. Projects with sufficient herd size can register today.',
    statusNoteHi:
      'गोबर प्रबंधन / बायोगैस मीथेन-निवारण की विस्तृत पद्धति पहले अधिसूचित CCTS ऑफ़सेट विधियों में है। पर्याप्त पशु-संख्या वाली परियोजनाएँ आज पंजीकरण करा सकती हैं।',
    lastUpdated: '2026-03',
    sourceUrl: 'https://carbonmarket.gov.in',
    activityKey: 'manure',
    conditions: [
      cond(
        'herd',
        'Sufficient herd size',
        'पर्याप्त पशु-संख्या',
        'At least 500 head of cattle and buffalo combined, to make a community digester / managed-manure project viable',
        'सामुदायिक डाइजेस्टर / प्रबंधित-गोबर परियोजना व्यवहार्य बनाने हेतु कम से कम 500 गाय-भैंस संयुक्त',
        (p) => p.cattleBuffalo >= 500,
      ),
      cond(
        'collection',
        'Manure is collectable',
        'गोबर संग्रहणीय',
        'Households keep animals in sheds / defined areas so manure can be collected (not free-range only)',
        'परिवार पशुओं को शेड / निर्धारित स्थान पर रखते हैं ताकि गोबर संग्रह हो सके (केवल खुली चराई नहीं)',
        (p) => p.households >= 100,
      ),
      cond(
        'baseline',
        'Baseline practice is open storage',
        'आधार-रेखा: खुला भंडारण',
        'Current practice is open dung storage / heaps (the emissions being avoided)',
        'वर्तमान प्रथा खुला गोबर भंडारण / ढेर है (जिनका उत्सर्जन टाला जाएगा)',
        () => true,
      ),
    ],
  },
  {
    code: 'CCTS-SC-003',
    sector: 'Agriculture',
    name: 'Soil organic carbon on degraded croplands',
    nameHi: 'क्षरित कृषि-भूमि पर मृदा जैविक कार्बन',
    status: 'draft',
    statusNote:
      'A soil carbon methodology is in draft / consultation stage under CCTS. Registration is not yet open; monitoring requirements (soil sampling protocol, permanence) are still being finalised.',
    statusNoteHi:
      'CCTS के तहत मृदा कार्बन पद्धति मसौदा / परामर्श चरण में है। पंजीकरण अभी नहीं खुला; निगरानी आवश्यकताएँ (मृदा नमूना प्रोटोकॉल, स्थायित्व) अभी तय हो रही हैं।',
    lastUpdated: '2026-07',
    sourceUrl: 'https://carbonmarket.gov.in',
    activityKey: 'soil',
    conditions: [
      cond(
        'cropland',
        'Cropland area',
        'कृषि-भूमि क्षेत्र',
        'At least 50 ha of cropland where regenerative practices (bunding, cover crops, reduced tillage) can be applied',
        'कम से कम 50 हेक्टेयर कृषि-भूमि जहाँ पुनर्योजी प्रथाएँ (मेड़बंदी, आच्छादन फसल, कम जुताई) लागू हों',
        (p) => p.agriculturalHa >= 50,
      ),
      cond(
        'lowsoc',
        'Low baseline soil carbon (headroom to gain)',
        'निम्न आधार मृदा कार्बन (बढ़त की गुंजाइश)',
        'Baseline soil organic carbon is low enough that measurable gains are plausible (roughly under 20 t C/ha)',
        'आधार मृदा जैविक कार्बन इतना कम कि मापनीय बढ़त सम्भव हो (लगभग 20 टन C/हेक्टेयर से कम)',
        (p) => p.soilOrganicCarbon < 20,
      ),
    ],
  },
  {
    code: 'CCTS-PM-004',
    sector: 'Forestry',
    name: 'Community pastureland & common grazing land regeneration',
    nameHi: 'सामुदायिक चरागाह एवं साझा चराई भूमि पुनरुद्धार',
    status: 'pending',
    statusNote:
      'Grassland / pasture regeneration is recognised as an eligible activity area but a stand-alone CCTS methodology is not yet notified. Often folded into the agroforestry / land-management track.',
    statusNoteHi:
      'घास-भूमि / चरागाह पुनरुद्धार एक पात्र गतिविधि क्षेत्र के रूप में मान्य है परंतु स्वतंत्र CCTS पद्धति अभी अधिसूचित नहीं। प्रायः कृषि-वानिकी / भूमि-प्रबंधन ट्रैक में सम्मिलित।',
    lastUpdated: '2026-06',
    sourceUrl: 'https://carbonmarket.gov.in',
    activityKey: 'pasture',
    conditions: [
      cond(
        'commons',
        'Common grazing land present',
        'साझा चराई भूमि मौजूद',
        'At least 20 ha of degraded common / pasture land under Gram Sabha control',
        'ग्राम सभा नियंत्रण में कम से कम 20 हेक्टेयर क्षरित साझा / चरागाह भूमि',
        (p) => p.commonAndForestHa >= 20,
      ),
      cond(
        'protection',
        'Grazing can be regulated',
        'चराई विनियमित हो सके',
        'Gram Sabha can enforce rotational grazing / protection on the parcel (PESA / FRA authority)',
        'ग्राम सभा उस भूखंड पर चक्रीय चराई / संरक्षण लागू कर सके (पेसा / वन अधिकार प्राधिकार)',
        () => true,
      ),
    ],
  },
]

export type MatchVerdict = 'qualified' | 'partial' | 'not_matched'

export interface MethodologyMatch {
  methodology: Methodology
  verdict: MatchVerdict
  conditions: { condition: Condition; met: boolean }[]
  metCount: number
  totalCount: number
  // registrable = qualified AND status approved
  registrableToday: boolean
}

export function matchMethodologies(p: MethodologyProfile): MethodologyMatch[] {
  return methodologies.map((m) => {
    const conditions = m.conditions.map((c) => ({ condition: c, met: c.check(p) }))
    const metCount = conditions.filter((c) => c.met).length
    const totalCount = conditions.length
    const verdict: MatchVerdict =
      metCount === totalCount ? 'qualified' : metCount > 0 ? 'partial' : 'not_matched'
    return {
      methodology: m,
      verdict,
      conditions,
      metCount,
      totalCount,
      registrableToday: verdict === 'qualified' && m.status === 'approved',
    }
  })
}
