export type ParamKey =
  | "weightKg"
  | "bodyFatPct"
  | "musclePct"
  | "waterPct"
  | "proteinPct"
  | "bonePct"
  | "bmi"
  | "bmrKcal"
  | "activeMassKg"
  | "amrKcal"
  | "subcutaneousFatKg"
  | "skeletalMuscleKg"
  | "visceralFatIndex"
  | "somatotype";

export type ParamMeta = {
  key: ParamKey;
  title: string;
  unit: string;
  shortHelp: string;
  longHelp: string;
  /** Dashboard section: primary weight, composition trio, or other */
  section: "weight" | "composition" | "other";
  /** Chart color */
  color: string;
  /** Numeric series only — somatotype is text */
  kind: "number" | "text";
};

export const PARAM_META: ParamMeta[] = [
  {
    key: "weightKg",
    title: "Hmotnost",
    unit: "kg",
    shortHelp:
      "Celková tělesná hmotnost. Denní výkyvy o 0,5–2 kg jsou běžné (voda, jídlo, trénink).",
    longHelp:
      "Hmotnost na domácí váze není diagnostika. Sledujte trend přes týdny, ne jedno měření. Stejná denní doba a podobné podmínky (nalačno / po toaletě) dávají smysluplnější křivku.",
    section: "weight",
    color: "#0f766e",
    kind: "number",
  },
  {
    key: "bodyFatPct",
    title: "Tělesný tuk",
    unit: "%",
    shortHelp:
      "Odhad podílu tukové tkáně. BIA váhy mají odchylku — důležitý je směr v čase.",
    longHelp:
      "Bioelektrická impedance (BIA) odhaduje tuk z odporu tkání. Hydratace, jídlo a cvičení výsledek posunou. Jedno číslo není verdikt; sledujte týdenní průměr a kontext (trénink, strava).",
    section: "composition",
    color: "#c2410c",
    kind: "number",
  },
  {
    key: "musclePct",
    title: "Svaly",
    unit: "%",
    shortHelp:
      "Odhad svalové hmoty v procentech. Kolísá s vodou a glykogenem.",
    longHelp:
      "Procentuální svalová hmota na BIA váze je odhad. Po tréninku nebo při dehydrataci může klesnout, aniž byste „ztratili sval“. Sledujte trend společně s hmotností a tréninkovým plánem.",
    section: "composition",
    color: "#1d4ed8",
    kind: "number",
  },
  {
    key: "waterPct",
    title: "Voda v těle",
    unit: "%",
    shortHelp:
      "Celková tělesná voda. Silně reaguje na pitný režim a sůl.",
    longHelp:
      "Voda tvoří velkou část hmotnosti. Ranní měření po toaletě bývá stabilnější. Výkyvy o několik procent mezi dny jsou běžné a často vysvětlují i skoky v tuku nebo svalech.",
    section: "composition",
    color: "#0284c7",
    kind: "number",
  },
  {
    key: "proteinPct",
    title: "Bílkoviny",
    unit: "%",
    shortHelp: "Odhad bílkovinné hmoty — hrubý ukazatel, ne laboratorní výsledek.",
    longHelp:
      "BIA odhad bílkovin souvisí se svalovou hmotou a hydratací. Nepoužívejte ho jako přesný laboratorní marker; slouží spíš jako doplněk k celkovému obrazu.",
    section: "other",
    color: "#0e7490",
    kind: "number",
  },
  {
    key: "bonePct",
    title: "Kosti",
    unit: "%",
    shortHelp: "Odhad kostní hmoty. Mění se pomalu; denní skoky jsou spíš šum měření.",
    longHelp:
      "Kostní hmota na spotřebitelské váze je hrubý odhad. Skutečné změny probíhají měsíce až roky. Denní výkyvy ignorujte.",
    section: "other",
    color: "#78716c",
    kind: "number",
  },
  {
    key: "bmi",
    title: "BMI",
    unit: "",
    shortHelp:
      "Index tělesné hmotnosti z výšky a váhy. Neříká nic o podílu tuku vs. svalu.",
    longHelp:
      "BMI je populační ukazatel, ne individuální diagnóza. U sportovců s vyšší svalovou hmotou může být „vysoké“ bez vysokého tuku. Sledujte spíš složení těla a obvod pasu.",
    section: "other",
    color: "#57534e",
    kind: "number",
  },
  {
    key: "bmrKcal",
    title: "BMR",
    unit: "kcal",
    shortHelp: "Odhad bazálního výdeje energie v klidu.",
    longHelp:
      "BMR je odhad kalorií, které tělo spálí v naprostém klidu. Na BIA váze jde o model z hmotnosti, věku a složení — ne o metabolický test. Používejte jako orientaci, ne přesný jídelníček.",
    section: "other",
    color: "#b45309",
    kind: "number",
  },
  {
    key: "activeMassKg",
    title: "Aktivní tělesná hmota",
    unit: "kg",
    shortHelp: "Hmotnost bez tukové tkáně (odhad).",
    longHelp:
      "Aktivní (tukuprostá) hmota zahrnuje svaly, orgány, kosti a vodu. Roste při nárůstu svalů nebo hydratace; při redukci tuku může zůstat stabilní i když celková váha klesá.",
    section: "other",
    color: "#0d9488",
    kind: "number",
  },
  {
    key: "amrKcal",
    title: "AMR",
    unit: "kcal",
    shortHelp: "Odhad celkového denního výdeje včetně aktivity.",
    longHelp:
      "AMR = BMR × faktor aktivity (podle nastavení váhy/profilu). Pokud se mění jen málo, zatímco váha kolísá, jde spíš o model než o reálný výdej z tréninku.",
    section: "other",
    color: "#ca8a04",
    kind: "number",
  },
  {
    key: "subcutaneousFatKg",
    title: "Podkožní tuk",
    unit: "kg",
    shortHelp: "Odhad tuku pod kůží. Oddělený od viscerálního indexu.",
    longHelp:
      "Podkožní tuk je ten, který „vidíte“. BIA ho odděluje od vnitřního (viscerálního) — s nejistotou. Trend je užitečnější než absolutní kilogramy.",
    section: "other",
    color: "#ea580c",
    kind: "number",
  },
  {
    key: "skeletalMuscleKg",
    title: "Kosterní svalstvo",
    unit: "kg",
    shortHelp:
      "Odhad kosterních svalů v kg. V CSV TrueLife je ve sloupci „%“, hodnoty ale bývají v kg.",
    longHelp:
      "TrueLife FitScale exportuje sloupec „Kosterní svalstvo(%)“, ale hodnoty často obsahují jednotku kg. VahaDesk je ukládá jako kilogramy. Stejně jako u ostatních BIA metrik platí: trend > jedno měření.",
    section: "other",
    color: "#2563eb",
    kind: "number",
  },
  {
    key: "visceralFatIndex",
    title: "Index viscerálního tuku",
    unit: "",
    shortHelp:
      "Bezrozměrný index vnitřního tuku. Vyšší hodnoty zaslouží pozornost životního stylu.",
    longHelp:
      "Viscerální tuk obklopuje orgány. Domácí váha dává index, ne CT/MRI. Pokud je dlouhodobě vysoký, řešte pohyb, spánek a stravu — ideálně s lékařem při dalších rizicích.",
    section: "other",
    color: "#dc2626",
    kind: "number",
  },
  {
    key: "somatotype",
    title: "Somatotyp",
    unit: "",
    shortHelp: "Kategorie podle váhy (např. „Obezita“). Štítek, ne diagnóza.",
    longHelp:
      "Somatotyp z váhy je zjednodušená kategorie z naměřených hodnot. Nenahrazuje lékařské vyšetření. Používejte jako orientační popisek k číslům výše.",
    section: "other",
    color: "#44403c",
    kind: "text",
  },
];

export const PARAM_BY_KEY = Object.fromEntries(
  PARAM_META.map((p) => [p.key, p]),
) as Record<ParamKey, ParamMeta>;

export function isParamKey(value: string): value is ParamKey {
  return value in PARAM_BY_KEY;
}
