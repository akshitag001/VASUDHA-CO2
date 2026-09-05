// "Ideas for your village" — per-activity guidance the Gram Sabha can discuss.
// For each activity: what to do, how much carbon it adds, what it earns, the
// non-carbon co-benefits, the effort/risk, and whether a CCTS methodology exists today.

export type ActivityKey = 'agroforestry' | 'manure' | 'soil' | 'pasture'

export interface ActivityGuide {
  key: ActivityKey
  name: string
  nameHi: string
  what: string
  whatHi: string
  // steps the village would actually take
  steps: string[]
  stepsHi: string[]
  // non-carbon co-benefits
  coBenefits: string[]
  coBenefitsHi: string[]
  effort: 'low' | 'medium' | 'high'
  effortNote: string
  effortNoteHi: string
  // who mainly does the work / gains — surfaces the gender lens
  labourNote: string
  labourNoteHi: string
  methodologyCode: string
}

export const activityGuides: Record<ActivityKey, ActivityGuide> = {
  agroforestry: {
    key: 'agroforestry',
    name: 'Trees on farm boundaries & common land',
    nameHi: 'खेत की मेड़ों और साझा भूमि पर पेड़',
    what: 'Plant hardy native and fruit/fodder trees along field bunds, on degraded common land, and in block plantations, and protect them for 15–20 years so they build up wood and soil carbon.',
    whatHi: 'खेत की मेड़ों पर, क्षरित साझा भूमि पर और खंड-वृक्षारोपण में मज़बूत देशी तथा फल/चारा वृक्ष लगाइए, और 15–20 वर्ष तक उनकी रक्षा कीजिए ताकि लकड़ी और मृदा कार्बन बढ़े।',
    steps: [
      'Gram Sabha marks the parcels and species with the community',
      'Raise or buy saplings (link with MGNREGA plantation works)',
      'Plant at the start of monsoon, fence or assign guardianship',
      'Replace dead saplings each year; keep a simple planting register',
      'Agree not to fell early — the carbon and the contract depend on it',
    ],
    stepsHi: [
      'ग्राम सभा समुदाय के साथ भूखंड और प्रजातियाँ तय करे',
      'पौध तैयार करें या खरीदें (मनरेगा वृक्षारोपण कार्यों से जोड़ें)',
      'मानसून की शुरुआत में रोपें, बाड़ लगाएँ या रखवाली सौंपें',
      'हर वर्ष मृत पौध बदलें; सरल रोपण रजिस्टर रखें',
      'जल्दी कटाई न करने पर सहमति दें — कार्बन और अनुबंध इसी पर निर्भर हैं',
    ],
    coBenefits: [
      'Fodder and fuelwood close to home (less time collecting)',
      'Fruit / minor produce income',
      'Windbreak and shade for crops and livestock',
      'Less soil erosion on bunds',
    ],
    coBenefitsHi: [
      'घर के पास चारा और ईंधन-लकड़ी (एकत्र करने में कम समय)',
      'फल / लघु उपज से आय',
      'फसलों और पशुओं के लिए हवा-रोक और छाया',
      'मेड़ों पर मिट्टी का कम कटाव',
    ],
    effort: 'medium',
    effortNote: 'Planting is one season; the real work is protection and replacement over many years.',
    effortNoteHi: 'रोपण एक मौसम का है; असली काम कई वर्षों तक रक्षा और प्रतिस्थापन है।',
    labourNote:
      'Fuelwood and fodder collection is mostly women’s labour — trees close to the village directly reduce that burden.',
    labourNoteHi:
      'ईंधन-लकड़ी और चारा एकत्र करना अधिकतर महिलाओं का श्रम है — गाँव के पास पेड़ इस बोझ को सीधे घटाते हैं।',
    methodologyCode: 'CCTS-AF-001',
  },

  manure: {
    key: 'manure',
    name: 'Community biogas & managed manure',
    nameHi: 'सामुदायिक बायोगैस एवं प्रबंधित गोबर',
    what: 'Instead of open dung heaps, feed cattle and buffalo dung into household or community biogas digesters. This captures methane, gives cooking gas, and returns a better organic fertiliser (slurry) to the fields.',
    whatHi: 'खुले गोबर के ढेर के बजाय, गाय-भैंस का गोबर घरेलू या सामुदायिक बायोगैस डाइजेस्टर में डालिए। इससे मीथेन पकड़ी जाती है, रसोई गैस मिलती है, और खेतों को बेहतर जैविक खाद (स्लरी) वापस मिलती है।',
    steps: [
      'Count the cattle and buffalo actually stall-kept',
      'Choose household units, a cluster digester, or both',
      'Link with existing subsidy schemes for the plant cost',
      'Train a few people to run and maintain the digesters',
      'Use the slurry on fields; keep records of gas produced',
    ],
    stepsHi: [
      'वास्तव में शेड में रखी गाय-भैंस गिनें',
      'घरेलू इकाइयाँ, क्लस्टर डाइजेस्टर, या दोनों चुनें',
      'संयंत्र लागत के लिए मौजूदा अनुदान योजनाओं से जोड़ें',
      'डाइजेस्टर चलाने-रखरखाव हेतु कुछ लोगों को प्रशिक्षित करें',
      'स्लरी खेतों में उपयोग करें; उत्पादित गैस का रिकॉर्ड रखें',
    ],
    coBenefits: [
      'Free / cheap cooking gas — less firewood and LPG spend',
      'Cleaner kitchen air — less smoke-related illness',
      'Better fertiliser (digested slurry) → lower input cost',
      'Less smell and fewer flies around homes',
    ],
    coBenefitsHi: [
      'मुफ़्त / सस्ती रसोई गैस — कम जलावन और एलपीजी खर्च',
      'साफ़ रसोई हवा — धुएँ से जुड़ी कम बीमारी',
      'बेहतर खाद (पचित स्लरी) → कम लागत',
      'घरों के आसपास कम बदबू और कम मक्खियाँ',
    ],
    effort: 'medium',
    effortNote: 'Digesters need daily feeding and occasional repair — reliable only if someone owns that job.',
    effortNoteHi: 'डाइजेस्टर को रोज़ भरना और कभी-कभी मरम्मत चाहिए — तभी भरोसेमंद जब कोई उस काम का ज़िम्मेदार हो।',
    labourNote:
      'Cooking and firewood collection fall mainly on women; biogas most directly frees their time and health.',
    labourNoteHi:
      'खाना पकाना और जलावन एकत्र करना मुख्यतः महिलाओं पर है; बायोगैस सबसे सीधे उनका समय और स्वास्थ्य बचाती है।',
    methodologyCode: 'CCTS-MM-002',
  },

  soil: {
    key: 'soil',
    name: 'Building soil carbon on cropland',
    nameHi: 'कृषि-भूमि पर मृदा कार्बन बढ़ाना',
    what: 'Adopt practices that put carbon back into the soil: contour and field bunding, cover crops in the off-season, compost and green manure, and less intensive tillage.',
    whatHi: 'ऐसी प्रथाएँ अपनाइए जो मिट्टी में कार्बन लौटाएँ: समोच्च और खेत मेड़बंदी, बिना-मौसम में आच्छादन फसल, कम्पोस्ट और हरी खाद, और कम गहन जुताई।',
    steps: [
      'Identify the most degraded / low-yield fields first',
      'Do bunding through MGNREGA before the monsoon',
      'Sow a cover crop (pulse / legume) after the main harvest',
      'Shift to compost / vermicompost and green manure',
      'Take a few soil samples now as a baseline (needed later for MRV)',
    ],
    stepsHi: [
      'पहले सबसे क्षरित / कम उपज वाले खेत पहचानें',
      'मानसून से पहले मनरेगा द्वारा मेड़बंदी कराएँ',
      'मुख्य फसल के बाद आच्छादन फसल (दलहन) बोएँ',
      'कम्पोस्ट / वर्मीकम्पोस्ट और हरी खाद की ओर बढ़ें',
      'अभी कुछ मृदा नमूने आधार-रेखा के रूप में लें (बाद में MRV हेतु आवश्यक)',
    ],
    coBenefits: [
      'Higher, more stable yields after 2–3 years',
      'Soil holds water longer — crops survive dry spells',
      'Lower fertiliser bills',
      'Less runoff and topsoil loss',
    ],
    coBenefitsHi: [
      '2–3 वर्ष बाद अधिक और स्थिर उपज',
      'मिट्टी पानी अधिक देर रोकती है — सूखे में फसल टिकती है',
      'कम उर्वरक खर्च',
      'कम बहाव और ऊपरी मिट्टी की कम हानि',
    ],
    effort: 'high',
    effortNote: 'Needs a change in farming habit across many farmers, sustained for years — the hardest to keep going.',
    effortNoteHi: 'कई किसानों की खेती की आदत में बदलाव चाहिए, वर्षों तक बनाए रखना — जारी रखना सबसे कठिन।',
    labourNote:
      'Benefits the whole farming household; extra weeding / cover-crop work often falls on women and hired labour.',
    labourNoteHi:
      'पूरे कृषक परिवार को लाभ; अतिरिक्त निराई / आच्छादन-फसल का काम प्रायः महिलाओं और मज़दूरों पर पड़ता है।',
    methodologyCode: 'CCTS-SC-003',
  },

  pasture: {
    key: 'pasture',
    name: 'Reviving common grazing land',
    nameHi: 'साझा चराई भूमि का पुनरुद्धार',
    what: 'Use the Gram Sabha’s authority to rest and rotate grazing on degraded commons, sow good grasses and fodder shrubs, and let the land and its soil recover.',
    whatHi: 'ग्राम सभा के अधिकार से क्षरित साझा भूमि पर चराई को विश्राम और चक्र दीजिए, अच्छी घास और चारा-झाड़ियाँ बोइए, और भूमि तथा उसकी मिट्टी को उबरने दीजिए।',
    steps: [
      'Gram Sabha resolution to divide the commons into grazing blocks',
      'Rest one block at a time; agree the rotation openly',
      'Reseed with local grasses and fodder species',
      'A small watch / fine system so the rules hold',
      'Record area protected and rough fodder cut each year',
    ],
    stepsHi: [
      'साझा भूमि को चराई खंडों में बाँटने का ग्राम सभा प्रस्ताव',
      'एक बार में एक खंड को विश्राम दें; चक्र पर खुलकर सहमति',
      'स्थानीय घास और चारा प्रजातियों से पुनः बुवाई',
      'नियम बनाए रखने हेतु छोटी निगरानी / जुर्माना व्यवस्था',
      'हर वर्ष संरक्षित क्षेत्र और मोटा चारा-कटान दर्ज करें',
    ],
    coBenefits: [
      'More fodder within the village — lower feed cost, healthier animals',
      'Grass cover slows erosion and recharges groundwater',
      'Reduces distress grazing in the forest',
      'Strengthens Gram Sabha control over the commons',
    ],
    coBenefitsHi: [
      'गाँव के भीतर अधिक चारा — कम चारा लागत, स्वस्थ पशु',
      'घास आवरण कटाव धीमा करता और भूजल भरता है',
      'वन में विवशता-चराई घटती है',
      'साझा भूमि पर ग्राम सभा नियंत्रण मज़बूत होता है',
    ],
    effort: 'medium',
    effortNote: 'The land recovers on its own if grazing is genuinely regulated — enforcement is the whole challenge.',
    effortNoteHi: 'चराई सचमुच विनियमित हो तो भूमि स्वयं उबरती है — पालन ही पूरी चुनौती है।',
    labourNote:
      'Grazing and fodder-cutting are shared work; women who tend small ruminants gain most from nearby fodder.',
    labourNoteHi:
      'चराई और चारा-कटाई साझा काम है; छोटे पशु पालने वाली महिलाओं को पास के चारे से सबसे अधिक लाभ।',
    methodologyCode: 'CCTS-PM-004',
  },
}
