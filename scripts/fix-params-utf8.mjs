import fs from "fs";

// Build params.ts with proper UTF-8 via Unicode escapes (safe on Windows shells).
const u = (codes) => String.fromCodePoint(...codes);

const text = [
  'export type ParamKey =',
  '  | "weightKg"',
  '  | "bodyFatPct"',
  '  | "musclePct"',
  '  | "waterPct"',
  '  | "proteinPct"',
  '  | "bonePct"',
  '  | "bmi"',
  '  | "bmrKcal"',
  '  | "activeMassKg"',
  '  | "amrKcal"',
  '  | "subcutaneousFatKg"',
  '  | "skeletalMuscleKg"',
  '  | "visceralFatIndex"',
  '  | "somatotype";',
  "",
  "export type ParamMeta = {",
  "  key: ParamKey;",
  "  title: string;",
  "  unit: string;",
  "  shortHelp: string;",
  "  longHelp: string;",
  "  /** How to read day-to-day noise */",
  "  noiseHelp: string;",
  "  /** Practical non-prescriptive tips */",
  "  tips: string[];",
  "  /** Show dashed optimal trajectory on detail/dashboard charts */",
  "  hasIdealOverlay?: boolean;",
  '  /** Dashboard section: primary weight, composition trio, or other */',
  '  section: "weight" | "composition" | "other";',
  "  /** Chart color */",
  "  color: string;",
  "  /** Numeric series only — somatotype is text */",
  '  kind: "number" | "text";',
  "};",
  "",
  "export const PARAM_META: ParamMeta[] = [",
].join("\n");

// Use JSON.stringify for Czech strings so file is pure UTF-8.
const meta = [
  {
    key: "weightKg",
    title: "Hmotnost",
    unit: "kg",
    shortHelp:
      "Celkov\u00e1 t\u011blesn\u00e1 hmotnost. Denn\u00ed v\u00fdkyvy o 0,5\u20132 kg jsou b\u011b\u017en\u00e9 (voda, j\u00eddlo, tr\u00e9nink).",
    longHelp:
      "Hmotnost na dom\u00e1c\u00ed v\u00e1ze nen\u00ed diagnostika. Sledujte trend p\u0159es t\u00fddny, ne jedno m\u011b\u0159en\u00ed. Stejn\u00e1 denn\u00ed doba a podobn\u00e9 podm\u00ednky (nala\u010dno / po toalet\u011b) d\u00e1vaj\u00ed smyslupln\u011bj\u0161\u00ed k\u0159ivku.",
    noiseHelp:
      "Skok \u00b11 kg za den skoro nikdy neznamen\u00e1 tuk. \u010cast\u011bji jde o vodu, s\u016fl, obsah \u017ealudku nebo tr\u00e9nink. Hodno\u0165te t\u00fddenn\u00ed pr\u016fm\u011br a sm\u011br k\u0159ivky.",
    tips: [
      "V\u00e1\u017ete se ide\u00e1ln\u011b r\u00e1no, po toalet\u011b, ve stejn\u00fdch podm\u00ednk\u00e1ch.",
      "U redukce c\u00edlete sp\u00ed\u0161 na m\u00edrn\u00fd, udr\u017eiteln\u00fd \u00fabytek ne\u017e na rychl\u00e9 diety.",
      "S\u00edla a ch\u016fze pom\u00e1haj\u00ed udr\u017eet svaly, zat\u00edmco kles\u00e1 celkov\u00e1 v\u00e1ha.",
      "Pokud v\u00e1ha stagnuje t\u00fddny, nejd\u0159\u00edv zkontrolujte sp\u00e1nek, stres a pravidelnost j\u00eddel \u2014 ne hned drastick\u00fd z\u00e1sah.",
    ],
    hasIdealOverlay: true,
    section: "weight",
    color: "#0ea5e9",
    kind: "number",
  },
  {
    key: "bodyFatPct",
    title: "T\u011blesn\u00fd tuk",
    unit: "%",
    shortHelp:
      "Odhad pod\u00edlu tukov\u00e9 tk\u00e1n\u011b. BIA v\u00e1hy maj\u00ed odchylku \u2014 d\u016fle\u017eit\u00fd je sm\u011br v \u010dase.",
    longHelp:
      "Bioelektrick\u00e1 impedance (BIA) odhaduje tuk z odporu tk\u00e1n\u00ed. Hydratace, j\u00eddlo a cvi\u010den\u00ed v\u00fdsledek posunou. Jedno \u010d\u00edslo nen\u00ed verdikt; sledujte t\u00fddenn\u00ed pr\u016fm\u011br a kontext (tr\u00e9nink, strava).",
    noiseHelp:
      "Po solen\u00e9m j\u00eddle, alkoholu nebo tvrd\u00e9m tr\u00e9ninku m\u016f\u017ee % tuku \u201evysko\u010dit\u201c, ani\u017e by p\u0159ibyl tuk. Porovn\u00e1vejte m\u011b\u0159en\u00ed ve stejn\u00e9 denn\u00ed dob\u011b.",
    tips: [
      "Dlouhodob\u011b pom\u00e1h\u00e1 m\u00edrn\u00fd kalorick\u00fd deficit a dostatek b\u00edlkovin \u2014 bez extr\u00e9mn\u00edch restrikc\u00ed.",
      "Kombinujte silov\u00fd tr\u00e9nink s pohybem v z\u00f3n\u011b, kterou zvl\u00e1dnete udr\u017eet.",
      "Sp\u00e1nek 7+ hodin sni\u017euje chu\u0165 na no\u010dn\u00ed j\u00eddlo a usnad\u0148uje dr\u017een\u00ed re\u017eimu.",
    ],
    hasIdealOverlay: true,
    section: "composition",
    color: "#c2410c",
    kind: "number",
  },
  {
    key: "musclePct",
    title: "Svaly",
    unit: "%",
    shortHelp:
      "Odhad svalov\u00e9 hmoty v procentech. Kol\u00eds\u00e1 s vodou a glykogenem.",
    longHelp:
      "Procentu\u00e1ln\u00ed svalov\u00e1 hmota na BIA v\u00e1ze je odhad. Po tr\u00e9ninku nebo p\u0159i dehydrataci m\u016f\u017ee klesnout, ani\u017e byste \u201eztratili sval\u201c. Sledujte trend spole\u010dn\u011b s hmotnost\u00ed a tr\u00e9ninkov\u00fdm pl\u00e1nem.",
    noiseHelp:
      "Glykogen a voda ve svalech m\u011bn\u00ed % ze dne na den. Pokles po n\u00e1ro\u010dn\u00e9m t\u00fddnu nemus\u00ed b\u00fdt ztr\u00e1ta sval\u016f \u2014 \u010dasto je to regenerace a hydratace.",
    tips: [
      "2\u20133\u00d7 t\u00fddn\u011b silov\u00fd tr\u00e9nink velk\u00fdch parti\u00ed dr\u017e\u00ed svaly p\u0159i hubnut\u00ed.",
      "Za\u0159a\u010fte b\u00edlkovinn\u00fd zdroj do v\u011bt\u0161iny j\u00eddel (maso, lu\u0161t\u011bniny, ml\u00e9\u010dn\u00e9, vejce\u2026).",
      "P\u0159i siln\u00e9m deficitu energie svaly trp\u00ed d\u0159\u00edv \u2014 rad\u011bji pomalej\u0161\u00ed redukce.",
    ],
    hasIdealOverlay: true,
    section: "composition",
    color: "#1e40af",
    kind: "number",
  },
  {
    key: "waterPct",
    title: "Voda v t\u011ble",
    unit: "%",
    shortHelp:
      "Celkov\u00e1 t\u011blesn\u00e1 voda. Siln\u011b reaguje na pitn\u00fd re\u017eim a s\u016fl.",
    longHelp:
      "Voda tvo\u0159\u00ed velkou \u010d\u00e1st hmotnosti. Rann\u00ed m\u011b\u0159en\u00ed po toalet\u011b b\u00fdv\u00e1 stabiln\u011bj\u0161\u00ed. V\u00fdkyvy o n\u011bkolik procent mezi dny jsou b\u011b\u017en\u00e9 a \u010dasto vysv\u011btluj\u00ed i skoky v tuku nebo svalech.",
    noiseHelp:
      "Vysok\u00e1 s\u016fl, alkohol nebo hork\u00fd den posunou vodu o n\u011bkolik %. To pak \u201epohne\u201c i tukem a svaly na BIA \u2014 nejd\u0159\u00edv \u010dt\u011bte vodu, pak ostatn\u00ed.",
    tips: [
      "Pijte pravideln\u011b p\u0159es den; extr\u00e9mn\u00ed doh\u00e1n\u011bn\u00ed litry najednou k\u0159ivku sp\u00ed\u0161 rozhoupe.",
      "Po slan\u00fdch j\u00eddlech o\u010dek\u00e1vejte do\u010dasn\u00fd n\u00e1r\u016fst hmotnosti i vody.",
      "Stabiln\u00ed pitn\u00fd re\u017eim = \u010diteln\u011bj\u0161\u00ed v\u0161echny BIA metriky.",
    ],
    hasIdealOverlay: true,
    section: "composition",
    color: "#3b82f6",
    kind: "number",
  },
  {
    key: "proteinPct",
    title: "B\u00edlkoviny",
    unit: "%",
    shortHelp:
      "Odhad b\u00edlkovinn\u00e9 hmoty \u2014 hrub\u00fd ukazatel, ne laboratorn\u00ed v\u00fdsledek.",
    longHelp:
      "BIA odhad b\u00edlkovin souvis\u00ed se svalovou hmotou a hydratac\u00ed. Nepou\u017e\u00edvejte ho jako p\u0159esn\u00fd laboratorn\u00ed marker; slou\u017e\u00ed sp\u00ed\u0161 jako dopln\u011bk k celkov\u00e9mu obrazu.",
    noiseHelp:
      "Hodnota sk\u00e1\u010de s hydratac\u00ed podobn\u011b jako svaly. Denn\u00ed rozd\u00edly berte s rezervou; zaj\u00edm\u00e1 v\u00e1s sp\u00ed\u0161 m\u011bs\u00ed\u010dn\u00ed sm\u011br.",
    tips: [
      "Orientujte se sp\u00ed\u0161 na j\u00eddeln\u00ed\u010dek s pravideln\u00fdm p\u0159\u00edjmem b\u00edlkovin ne\u017e na toto jedno %.",
      "P\u0159i hubnut\u00ed b\u00edlkoviny pom\u00e1haj\u00ed sytosti a udr\u017een\u00ed sval\u016f.",
      "Silov\u00fd tr\u00e9nink d\u00e1v\u00e1 parametru praktick\u00fd smysl \u2014 samotn\u00e9 \u010d\u00edslo z v\u00e1hy nesta\u010d\u00ed.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#1d4ed8",
    kind: "number",
  },
  {
    key: "bonePct",
    title: "Kosti",
    unit: "%",
    shortHelp:
      "Odhad kostn\u00ed hmoty. M\u011bn\u00ed se pomalu; denn\u00ed skoky jsou sp\u00ed\u0161 \u0161um m\u011b\u0159en\u00ed.",
    longHelp:
      "Kostn\u00ed hmota na spot\u0159ebitelsk\u00e9 v\u00e1ze je hrub\u00fd odhad. Skute\u010dn\u00e9 zm\u011bny prob\u00edhaj\u00ed m\u011bs\u00edce a\u017e roky. Denn\u00ed v\u00fdkyvy ignorujte.",
    noiseHelp:
      "Denn\u00ed nebo t\u00fddenn\u00ed skoky jsou t\u00e9m\u011b\u0159 v\u017edy chyba modelu BIA. Sledujte sp\u00ed\u0161 roky a celkov\u00fd \u017eivotn\u00ed styl.",
    tips: [
      "Pro kosti dlouhodob\u011b pom\u00e1h\u00e1 pohyb s vlastn\u00ed vahou a silov\u00fd tr\u00e9nink.",
      "Dostate\u010dn\u00fd p\u0159\u00edjem v\u00e1pn\u00edku a vitaminu D \u0159e\u0161te sp\u00ed\u0161 stravou / s l\u00e9ka\u0159em ne\u017e t\u00edmto grafem.",
      "Nesrovn\u00e1vejte denn\u00ed body \u2014 u kost\u00ed nemaj\u00ed praktick\u00fd v\u00fdznam.",
    ],
    section: "other",
    color: "#a8a29e",
    kind: "number",
  },
  {
    key: "bmi",
    title: "BMI",
    unit: "",
    shortHelp:
      "Index t\u011blesn\u00e9 hmotnosti z v\u00fd\u0161ky a v\u00e1hy. Ne\u0159\u00edk\u00e1 nic o pod\u00edlu tuku vs. svalu.",
    longHelp:
      "BMI je popula\u010dn\u00ed ukazatel, ne individu\u00e1ln\u00ed diagn\u00f3za. U sportovc\u016f s vy\u0161\u0161\u00ed svalovou hmotou m\u016f\u017ee b\u00fdt \u201evysok\u00e9\u201c bez vysok\u00e9ho tuku. Sledujte sp\u00ed\u0161 slo\u017een\u00ed t\u011bla a obvod pasu.",
    noiseHelp:
      "BMI se h\u00fdbe jen s hmotnost\u00ed. Denn\u00ed v\u00fdkyvy v\u00e1hy = v\u00fdkyvy BMI. Trend t\u00fddn\u016f je d\u016fle\u017eit\u011bj\u0161\u00ed ne\u017e jedno \u010d\u00edslo.",
    tips: [
      "Ide\u00e1l v aplikaci m\u00ed\u0159\u00ed k BMI kolem 22 jako orienta\u010dn\u00edmu c\u00edli hubnut\u00ed \u2014 ne jako jedin\u00e9mu m\u011b\u0159\u00edtku zdrav\u00ed.",
      "Kdy\u017e m\u00e1te hodn\u011b sval\u016f, dopl\u0148te pohled o % tuku a obvod pasu.",
      "Zm\u011bny BMI berte spolu s t\u00edm, jak se c\u00edt\u00edte a jak v\u00e1m sed\u00ed oble\u010den\u00ed.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#78716c",
    kind: "number",
  },
  {
    key: "bmrKcal",
    title: "BMR",
    unit: "kcal",
    shortHelp: "Odhad baz\u00e1ln\u00edho v\u00fddaje energie v klidu.",
    longHelp:
      "BMR je odhad kalori\u00ed, kter\u00e9 t\u011blo sp\u00e1l\u00ed v naprost\u00e9m klidu. Na BIA v\u00e1ze jde o model z hmotnosti, v\u011bku a slo\u017een\u00ed \u2014 ne o metabolick\u00fd test. Pou\u017e\u00edvejte jako orientaci, ne p\u0159esn\u00fd j\u00eddeln\u00ed\u010dek.",
    noiseHelp:
      "BMR na v\u00e1ze se m\u011bn\u00ed hlavn\u011b s hmotnost\u00ed a odhadovan\u00fdm slo\u017een\u00edm. Skoky po jednom dni jsou model, ne \u201erozbit\u00fd metabolismus\u201c.",
    tips: [
      "Nep\u0159epo\u010d\u00edtejte j\u00eddeln\u00ed\u010dek podle ka\u017ed\u00e9ho skoku BMR \u2014 berte t\u00fddenn\u00ed pr\u016fm\u011br.",
      "Extr\u00e9mn\u00ed restrikce energie BMR dlouhodob\u011b nesv\u011bd\u010d\u00ed; rad\u011bji m\u00edrn\u00fd deficit.",
      "Pohyb a svalov\u00e1 hmota podporuj\u00ed vy\u0161\u0161\u00ed celkov\u00fd v\u00fddaj (viz AMR).",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#b45309",
    kind: "number",
  },
  {
    key: "activeMassKg",
    title: "Aktivn\u00ed t\u011blesn\u00e1 hmota",
    unit: "kg",
    shortHelp: "Hmotnost bez tukov\u00e9 tk\u00e1n\u011b (odhad).",
    longHelp:
      "Aktivn\u00ed (tukuprost\u00e1) hmota zahrnuje svaly, org\u00e1ny, kosti a vodu. Roste p\u0159i n\u00e1r\u016fstu sval\u016f nebo hydratace; p\u0159i redukci tuku m\u016f\u017ee z\u016fstat stabiln\u00ed i kdy\u017e celkov\u00e1 v\u00e1ha kles\u00e1.",
    noiseHelp:
      "Kdy\u017e kles\u00e1 v\u00e1ha a aktivn\u00ed hmota dr\u017e\u00ed, \u010dasto hubnete tuk. Kdy\u017e klesaj\u00ed ob\u011b, zkontrolujte p\u0159\u00edjem energie, b\u00edlkoviny a tr\u00e9nink.",
    tips: [
      "C\u00edl p\u0159i hubnut\u00ed: dr\u017eet aktivn\u00ed hmotu, sni\u017eovat tuk \u2014 ne jen \u201eco nejni\u017e\u0161\u00ed v\u00e1hu\u201c.",
      "S\u00edla + b\u00edlkoviny jsou praktick\u00fd z\u00e1klad.",
      "Velk\u00fd propad aktivn\u00ed hmoty p\u0159i rychl\u00e9 diet\u011b je varov\u00e1n\u00ed zpomalit.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#3b82f6",
    kind: "number",
  },
  {
    key: "amrKcal",
    title: "AMR",
    unit: "kcal",
    shortHelp: "Odhad celkov\u00e9ho denn\u00edho v\u00fddaje v\u010detn\u011b aktivity.",
    longHelp:
      "AMR = BMR \u00d7 faktor aktivity (podle nastaven\u00ed v\u00e1hy/profilu). Pokud se m\u011bn\u00ed jen m\u00e1lo, zat\u00edmco v\u00e1ha kol\u00eds\u00e1, jde sp\u00ed\u0161 o model ne\u017e o re\u00e1ln\u00fd v\u00fddaj z tr\u00e9ninku.",
    noiseHelp:
      "AMR z v\u00e1hy nereaguje na konkr\u00e9tn\u00ed tr\u00e9nink dan\u00e9ho dne. Nesrovn\u00e1vejte ho s hodinkami 1:1 \u2014 jde o hrub\u00fd model.",
    tips: [
      "Berte AMR jako strop orientace, ne jako p\u0159esn\u00fd rozpo\u010det kalori\u00ed.",
      "Re\u00e1ln\u00fd v\u00fddaj l\u00e9pe odhadnete z aktivity a toho, jak se m\u011bn\u00ed v\u00e1ha v t\u00fddnech.",
      "P\u0159i sedav\u00e9 pr\u00e1ci pom\u016f\u017ee denn\u00ed ch\u016fze v\u00edc ne\u017e honba za \u010d\u00edslem AMR.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#d97706",
    kind: "number",
  },
  {
    key: "subcutaneousFatKg",
    title: "Podko\u017en\u00ed tuk",
    unit: "kg",
    shortHelp: "Odhad tuku pod k\u016f\u017e\u00ed. Odd\u011blen\u00fd od viscer\u00e1ln\u00edho indexu.",
    longHelp:
      "Podko\u017en\u00ed tuk je ten, kter\u00fd \u201evid\u00edte\u201c. BIA ho odd\u011bluje od vnit\u0159n\u00edho (viscer\u00e1ln\u00edho) \u2014 s nejistotou. Trend je u\u017eite\u010dn\u011bj\u0161\u00ed ne\u017e absolutn\u00ed kilogramy.",
    noiseHelp:
      "Stejn\u011b jako u % tuku hraje roli hydratace. T\u00fddenn\u00ed pr\u016fm\u011br > denn\u00ed bod.",
    tips: [
      "Udr\u017eiteln\u00fd deficit a pohyb m\u011bn\u00ed podko\u017en\u00ed tuk pomalu \u2014 to je v po\u0159\u00e1dku.",
      "M\u011b\u0159te pas / fotky jednou za m\u011bs\u00edc jako dopln\u011bk k v\u00e1ze.",
      "Kr\u00e1tkodob\u00e9 diety \u010dasto \u201esp\u00e1l\u00ed\u201c vodu, ne podko\u017en\u00ed tuk.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#ea580c",
    kind: "number",
  },
  {
    key: "skeletalMuscleKg",
    title: "Kostern\u00ed svalstvo",
    unit: "kg",
    shortHelp:
      "Odhad kostern\u00edch sval\u016f v kg. V CSV TrueLife je ve sloupci \u201e%\u201c, hodnoty ale b\u00fdvaj\u00ed v kg.",
    longHelp:
      "TrueLife FitScale exportuje sloupec \u201eKostern\u00ed svalstvo(%)\u201c, ale hodnoty \u010dasto obsahuj\u00ed jednotku kg. VahaDesk je ukl\u00e1d\u00e1 jako kilogramy. Stejn\u011b jako u ostatn\u00edch BIA metrik plat\u00ed: trend > jedno m\u011b\u0159en\u00ed.",
    noiseHelp:
      "Po noh\u00e1ch / t\u011b\u017ek\u00e9m tr\u00e9ninku m\u016f\u017ee \u010d\u00edslo do\u010dasn\u011b klesnout kv\u016fli vod\u011b a glykogenu. Sledujte m\u011bs\u00edce, ne dny.",
    tips: [
      "Progresivn\u00ed silov\u00fd tr\u00e9nink je nejlep\u0161\u00ed \u201eintervence\u201c pro tuto k\u0159ivku.",
      "P\u0159i hubnut\u00ed chra\u0148te svaly b\u00edlkovinami a ne p\u0159\u00edli\u0161 hlubok\u00fdm deficitem.",
      "Pokud kg sval\u016f klesaj\u00ed spolu s v\u00e1hou rychle, zvoln\u011bte tempo redukce.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#1e40af",
    kind: "number",
  },
  {
    key: "visceralFatIndex",
    title: "Index viscer\u00e1ln\u00edho tuku",
    unit: "",
    shortHelp:
      "Bezrozm\u011brn\u00fd index vnit\u0159n\u00edho tuku. Vy\u0161\u0161\u00ed hodnoty zaslou\u017e\u00ed pozornost \u017eivotn\u00edho stylu.",
    longHelp:
      "Viscer\u00e1ln\u00ed tuk obklopuje org\u00e1ny. Dom\u00e1c\u00ed v\u00e1ha d\u00e1v\u00e1 index, ne CT/MRI. Pokud je dlouhodob\u011b vysok\u00fd, \u0159e\u0161te pohyb, sp\u00e1nek a stravu \u2014 ide\u00e1ln\u011b s l\u00e9ka\u0159em p\u0159i dal\u0161\u00edch rizic\u00edch.",
    noiseHelp:
      "Index m\u016f\u017ee kol\u00edsat s celkov\u00fdm BIA odhadem tuku. D\u016fle\u017eit\u00fd je pokles v \u0159\u00e1du t\u00fddn\u016f a\u017e m\u011bs\u00edc\u016f.",
    tips: [
      "Pravideln\u00e1 ch\u016fze a omezen\u00ed ultra-zpracovan\u00fdch j\u00eddel \u010dasto pom\u00e1haj\u00ed nejd\u0159\u00edv tady.",
      "Sp\u00e1nek a stres maj\u00ed na b\u0159i\u0161n\u00ed tuk p\u0159ekvapiv\u011b velk\u00fd vliv.",
      "P\u0159i vysok\u00e9m indexu a dal\u0161\u00edch rizic\u00edch (tlak, cukr v rodin\u011b) konzultujte l\u00e9ka\u0159e \u2014 v\u00e1ha nenahrazuje vy\u0161et\u0159en\u00ed.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#b91c1c",
    kind: "number",
  },
  {
    key: "somatotype",
    title: "Somatotyp",
    unit: "",
    shortHelp:
      "Kategorie podle v\u00e1hy (nap\u0159. \u201eObezita\u201c). \u0160t\u00edtek, ne diagn\u00f3za.",
    longHelp:
      "Somatotyp z v\u00e1hy je zjednodu\u0161en\u00e1 kategorie z nam\u011b\u0159en\u00fdch hodnot. Nenahrazuje l\u00e9ka\u0159sk\u00e9 vy\u0161et\u0159en\u00ed. Pou\u017e\u00edvejte jako orienta\u010dn\u00ed popisek k \u010d\u00edsl\u016fm v\u00fd\u0161e.",
    noiseHelp:
      "\u0160t\u00edtek se m\u011bn\u00ed skokov\u011b s kategoriemi v\u00e1hy/BMI. Den co den ho ne\u0159e\u0161te \u2014 sledujte \u010d\u00edsla nad n\u00edm.",
    tips: [
      "Berte somatotyp jako popisek k trendu hmotnosti, ne jako ortel.",
      "Sm\u011br k\u0159ivky v\u00e1hy a tuku \u0159ekne v\u00edc ne\u017e samotn\u00fd textov\u00fd \u0161t\u00edtek.",
      "P\u0159i obav\u00e1ch o zdrav\u00ed \u0159e\u0161te stav s odborn\u00edkem, ne jen kategorii z v\u00e1hy.",
    ],
    section: "other",
    color: "#57534e",
    kind: "text",
  },
];

function emitObject(obj, indent) {
  const pad = " ".repeat(indent);
  const pad2 = " ".repeat(indent + 2);
  const lines = ["{"];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      lines.push(`${pad2}${k}: [`);
      for (const item of v) {
        lines.push(`${pad2}  ${JSON.stringify(item)},`);
      }
      lines.push(`${pad2}],`);
    } else if (typeof v === "string") {
      lines.push(`${pad2}${k}: ${JSON.stringify(v)},`);
    } else if (typeof v === "boolean") {
      lines.push(`${pad2}${k}: ${v},`);
    } else {
      lines.push(`${pad2}${k}: ${JSON.stringify(v)},`);
    }
  }
  lines.push(`${pad}}`);
  return lines.join("\n");
}

const parts = [text];
for (const item of meta) {
  parts.push(`  ${emitObject(item, 2)},`);
}
parts.push("];");
parts.push("");
parts.push("export const PARAM_BY_KEY = Object.fromEntries(");
parts.push("  PARAM_META.map((p) => [p.key, p]),");
parts.push(") as Record<ParamKey, ParamMeta>;");
parts.push("");
parts.push("export function isParamKey(value: string): value is ParamKey {");
parts.push("  return value in PARAM_BY_KEY;");
parts.push("}");
parts.push("");

const out = parts.join("\n");
fs.writeFileSync(new URL("../src/lib/params.ts", import.meta.url), out, "utf8");

const b = fs.readFileSync(new URL("../src/lib/params.ts", import.meta.url));
console.log("wrote", b.length, "bytes, sample:", b.slice(1000, 1060).toString("utf8"));
