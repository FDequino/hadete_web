/* ============================================================
   HADETÉ — catalogue data
   ------------------------------------------------------------
   Kept apart from catalog.html so the nine sheets can be filled
   in without touching markup. Every row is [labelKey, en, es].
   labelKey looks up its header in LABELS below, or in i18n.js's
   shared l.* dictionary when the key already lives there — the
   homepage's product specs use the same l.* pool, so a label
   written once (Origin, Moisture, Bulk…) reads the same way on
   both pages.

   Three fields are the same across all nine products today and
   live here once so they can be completed in one place:
   ============================================================ */

window.CATALOG = {

  MOQ: { en: 'To arrange', es: 'A coordinar' },
  INCOTERM: { en: 'To arrange', es: 'A coordinar' },
  LEAD_TIME: { en: 'To arrange', es: 'A coordinar' },

  /* English text for every row label used below. The ones that already
     exist in the homepage's shared l.* dictionary (origin, acidity, bulk…)
     repeat the exact same English word, so the catalogue reads consistently
     with the rest of the site; Spanish comes from DICT.es's l.* at render
     time. The rest are new and get their Spanish added to DICT.es as l.<key>. */
  LABELS_EN: {
    origin: 'Origin',
    acidity: 'Free acidity',
    extraction: 'Extraction',
    bulk: 'Bulk',
    moisture: 'Moisture',
    germ: 'Germination',
    calibre: 'Calibre',
    grade: 'Grade',
    colour: 'Colour value',
    cut: 'Cut',
    form: 'Form',
    drying: 'Drying',
    grades: 'Grades',
    hscode: 'HS code',
    netweight: 'Net weight',
    drainedweight: 'Drained weight',
    unitspercase: 'Units per case',
    shelflife: 'Shelf life',
    storage: 'Storage',
    variety: 'Variety',
    brine: 'Brine',
    allergen: 'Allergen',
    purity: 'Purity',
    volatileoil: 'Volatile oil',
    process: 'Process',
    semolina: 'Semolina',
    case: 'Case',
    giftformat: 'Gift format',
    addedsugar: 'Added sugar',
    moq: 'MOQ',
    incoterm: 'Incoterm',
    leadtime: 'Lead time'
  },

  PRODUCTS: [
    {
      id: 'oil',
      line: 'oils',
      pdf: '/docs/olive-oil.pdf',
      spec: true,
      img: 'prod-aceite',
      alt: { en: 'Bottle of Hadeté extra virgin olive oil', es: 'Botella de aceite de oliva extra virgen Hadeté' },
      name: { en: 'Extra virgin olive oil', es: 'Aceite de oliva extra virgen' },
      sci: 'Olea europaea · Arauco, Arbequina',
      key: { en: 'Acidity ≤ 0.4 %', es: 'Acidez ≤ 0,4 %' },
      bulk: [
        ['origin', 'San Juan · La Rioja · Catamarca', 'San Juan · La Rioja · Catamarca'],
        ['acidity', '≤ 0.4 %', '≤ 0,4 %'],
        ['extraction', 'Cold, within 6 h of harvest', 'En frío, dentro de las 6 h de cosecha'],
        ['bulk', 'Flexitank · IBC', 'Flexitank · IBC'],
        ['hscode', '1509.20', '1509.20']
      ],
      retail: [
        ['origin', 'San Juan · La Rioja · Catamarca', 'San Juan · La Rioja · Catamarca'],
        ['acidity', '≤ 0.4 %', '≤ 0,4 %'],
        ['netweight', '500 ml tin · 500 ml glass', 'Lata de 500 ml · Vidrio de 500 ml'],
        ['giftformat', '250 ml cruet', 'Vinagrera de 250 ml'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', '24 months', '24 meses']
      ]
    },
    {
      id: 'greenolives',
      line: 'oils',
      pdf: '/docs/green-olives.pdf',
      spec: true,
      img: 'prod-aceitunas',
      alt: { en: 'Jar of Hadeté green olives in brine', es: 'Frasco de aceitunas verdes Hadeté en salmuera' },
      name: { en: 'Green olives in brine', es: 'Aceitunas verdes en salmuera' },
      sci: 'Olea europaea · Arauco',
      key: { en: 'Arauco variety', es: 'Variedad Arauco' },
      bulk: [
        ['origin', 'San Juan', 'San Juan'],
        ['variety', 'Arauco', 'Arauco'],
        ['calibre', 'To confirm', 'A confirmar'],
        ['brine', 'To confirm', 'A confirmar'],
        ['bulk', 'To confirm', 'A confirmar'],
        ['hscode', '2005.70', '2005.70']
      ],
      retail: [
        ['origin', 'San Juan', 'San Juan'],
        ['variety', 'Arauco', 'Arauco'],
        ['netweight', '350 g', '350 g'],
        ['drainedweight', 'To confirm', 'A confirmar'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', 'To confirm', 'A confirmar']
      ]
    },
    {
      id: 'raisins',
      line: 'nuts',
      pdf: '/docs/raisins.pdf',
      spec: true,
      img: 'prod-pasas',
      alt: { en: 'Pouch of Hadeté sun-dried raisins', es: 'Bolsa de pasas de uva Hadeté secadas al sol' },
      name: { en: 'Sun-dried raisins', es: 'Pasas de uva secadas al sol' },
      sci: 'Vitis vinifera · Flame seedless, Sultanina',
      /* "planta" is ambiguous in Spanish in a way this context doesn't
         disambiguate: a Spanish-speaking buyer reads "secado en planta" as
         an industrial dryer, the opposite of what actually happens.
         "Secado en la vid" (dried on the vine) doesn't carry that reading. */
      key: { en: 'Dried on the vine', es: 'Secado en la vid' },
      bulk: [
        ['origin', 'San Juan — Tulum and Zonda', 'San Juan — Tulum y Zonda'],
        ['drying', 'Plant-dried, no added sugar', 'Secado en la vid, sin azúcar agregada'],
        ['grades', 'Jumbo · Medium · Small', 'Jumbo · Medium · Small'],
        ['bulk', '10 kg cartons', 'Cajas de 10 kg'],
        ['hscode', '0806.20', '0806.20']
      ],
      retail: [
        ['origin', 'San Juan — Tulum and Zonda', 'San Juan — Tulum y Zonda'],
        ['addedsugar', 'None', 'Sin agregado'],
        ['netweight', '1 kg pouch', 'Bolsa de 1 kg'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', '12 months', '12 meses'],
        ['storage', 'Below 18 °C', 'Por debajo de 18 °C']
      ]
    },
    {
      id: 'pecan',
      line: 'nuts',
      pdf: '/docs/pecan-nuts.pdf',
      spec: true,
      img: 'prod-pecan',
      alt: { en: 'Pouch of Hadeté pecan nuts', es: 'Bolsa de nueces pecán Hadeté' },
      name: { en: 'Pecan nuts', es: 'Nueces pecán' },
      sci: 'Carya illinoinensis',
      key: { en: 'Moisture ≤ 5 %', es: 'Humedad ≤ 5 %' },
      bulk: [
        ['origin', 'La Rioja', 'La Rioja'],
        ['form', 'Shelled halves', 'Mitades peladas'],
        ['moisture', '≤ 5 %', '≤ 5 %'],
        ['allergen', 'Tree nut', 'Fruto de cáscara'],
        ['bulk', 'To confirm', 'A confirmar'],
        ['hscode', '0802.12', '0802.12']
      ],
      retail: [
        ['origin', 'La Rioja', 'La Rioja'],
        ['form', 'Shelled halves', 'Mitades peladas'],
        ['netweight', '500 g', '500 g'],
        ['allergen', 'Tree nut', 'Fruto de cáscara'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', '12 months', '12 meses']
      ]
    },
    {
      id: 'mung',
      line: 'pulses',
      pdf: '/docs/mung-beans.pdf',
      spec: true,
      img: 'prod-mung',
      alt: { en: 'Bag of Hadeté organic mung beans', es: 'Bolsa de poroto mung orgánico Hadeté' },
      name: { en: 'Mung beans', es: 'Poroto mung' },
      sci: 'Vigna radiata · Cristal, Satén II, Esmeralda',
      key: { en: 'Germination ≥ 92 %', es: 'Germinación ≥ 92 %' },
      bulk: [
        ['origin', 'Salta · Jujuy · Tucumán', 'Salta · Jujuy · Tucumán'],
        ['germ', '≥ 92 %', '≥ 92 %'],
        ['moisture', '≤ 8 %', '≤ 8 %'],
        ['purity', '≥ 99.5 %', '≥ 99,5 %'],
        ['bulk', '25 kg · 1,000 kg bags', '25 kg · 1.000 kg'],
        ['hscode', '0713.31', '0713.31']
      ],
      retail: [
        ['origin', 'Salta · Jujuy · Tucumán', 'Salta · Jujuy · Tucumán'],
        ['grade', 'Sprouting grade', 'Grado para brotes'],
        ['netweight', '500 g', '500 g'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', '24 months', '24 meses'],
        ['storage', 'Cool and dry', 'Fresco y seco']
      ]
    },
    {
      id: 'alubia',
      line: 'pulses',
      pdf: '/docs/alubia-beans.pdf',
      spec: true,
      img: 'prod-alubia',
      alt: { en: 'Pouch of Hadeté alubia beans', es: 'Bolsa de porotos alubia Hadeté' },
      name: { en: 'Alubia beans', es: 'Porotos alubia' },
      sci: 'Phaseolus vulgaris',
      key: { en: 'Food grade', es: 'Grado alimentario' },
      bulk: [
        ['origin', 'Salta · Jujuy · Tucumán', 'Salta · Jujuy · Tucumán'],
        ['grade', 'Food grade', 'Grado alimentario'],
        ['calibre', 'To confirm', 'A confirmar'],
        ['moisture', 'To confirm', 'A confirmar'],
        ['bulk', 'To confirm', 'A confirmar'],
        ['hscode', '0713.33', '0713.33']
      ],
      retail: [
        ['origin', 'Salta · Jujuy · Tucumán', 'Salta · Jujuy · Tucumán'],
        ['grade', 'Food grade', 'Grado alimentario'],
        ['netweight', '500 g', '500 g'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', 'To confirm', 'A confirmar'],
        ['storage', 'Cool and dry', 'Fresco y seco']
      ]
    },
    {
      id: 'paprika',
      line: 'spices',
      pdf: '/docs/smoked-paprika.pdf',
      spec: true,
      img: 'prod-pimenton',
      alt: { en: 'Jar of Hadeté smoked paprika', es: 'Frasco de pimentón ahumado Hadeté' },
      name: { en: 'Smoked paprika', es: 'Pimentón ahumado' },
      sci: 'Capsicum annuum',
      key: { en: 'Colour ≥ 120 ASTA', es: 'Color ≥ 120 ASTA' },
      bulk: [
        ['origin', 'Argentina', 'Argentina'],
        ['colour', '≥ 120 ASTA', '≥ 120 ASTA'],
        ['process', 'Oak-smoked, stone-ground', 'Ahumado en roble, molido a piedra'],
        ['moisture', 'To confirm', 'A confirmar'],
        ['bulk', 'To confirm', 'A confirmar'],
        ['hscode', '0904.22', '0904.22']
      ],
      retail: [
        ['origin', 'Argentina', 'Argentina'],
        ['colour', '≥ 120 ASTA', '≥ 120 ASTA'],
        ['netweight', '100 g', '100 g'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', '24 months', '24 meses'],
        ['storage', 'Away from light', 'Al resguardo de la luz']
      ]
    },
    {
      id: 'cumin',
      line: 'spices',
      pdf: '/docs/cumin-seeds.pdf',
      spec: false,
      img: 'prod-comino',
      alt: { en: 'Jar of Hadeté cumin seeds', es: 'Frasco de comino en grano Hadeté' },
      name: { en: 'Cumin seeds', es: 'Comino en grano' },
      sci: 'Cuminum cyminum',
      key: { en: 'Whole seed', es: 'Grano entero' },
      bulk: [
        ['origin', 'Argentina', 'Argentina'],
        ['purity', 'To confirm', 'A confirmar'],
        ['volatileoil', 'To confirm', 'A confirmar'],
        ['moisture', 'To confirm', 'A confirmar'],
        ['bulk', 'To confirm', 'A confirmar'],
        ['hscode', '0909.31', '0909.31']
      ],
      retail: [
        ['origin', 'Argentina', 'Argentina'],
        ['netweight', '100 g', '100 g'],
        ['purity', 'To confirm', 'A confirmar'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', 'To confirm', 'A confirmar'],
        ['storage', 'Cool and dry', 'Fresco y seco']
      ]
    },
    {
      id: 'pasta',
      line: 'industrial',
      pdf: '/docs/dried-pasta.pdf',
      spec: false,
      img: 'prod-fideos',
      alt: { en: 'Box of Hadeté dried pasta, Spaghetti N.5', es: 'Caja de fideos secos Hadeté, Spaghetti N.5' },
      name: { en: 'Dried pasta', es: 'Fideos secos' },
      sci: 'Spaghetti N.5',
      key: { en: 'Contains gluten', es: 'Contiene gluten' },
      bulk: [
        ['origin', 'Argentina', 'Argentina'],
        ['cut', 'Spaghetti N.5', 'Spaghetti N.5'],
        ['allergen', 'Gluten', 'Gluten'],
        ['semolina', 'To confirm', 'A confirmar'],
        ['case', 'To confirm', 'A confirmar'],
        ['hscode', '1902.19', '1902.19']
      ],
      retail: [
        ['origin', 'Argentina', 'Argentina'],
        ['cut', 'Spaghetti N.5', 'Spaghetti N.5'],
        ['allergen', 'Gluten', 'Gluten'],
        ['netweight', '500 g', '500 g'],
        ['unitspercase', 'To confirm', 'A confirmar'],
        ['shelflife', 'To confirm', 'A confirmar']
      ]
    }
  ]
};
