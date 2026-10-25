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
  /** How to read day-to-day noise */
  noiseHelp: string;
  /** Practical non-prescriptive tips */
  tips: string[];
  /** Show dashed optimal trajectory on detail/dashboard charts */
  hasIdealOverlay?: boolean;
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
    shortHelp: "Celková tělesná hmotnost. Denní výkyvy o 0,5–2 kg jsou běžné (voda, jídlo, trénink).",
    longHelp: "Hmotnost na domácí váze není diagnostika. Sledujte trend přes týdny, ne jedno měření. Stejná denní doba a podobné podmínky (nalačno / po toaletě) dávají smysluplnější křivku.",
    noiseHelp: "Skok ±1 kg za den skoro nikdy neznamená tuk. Častěji jde o vodu, sůl, obsah žaludku nebo trénink. Hodnoťte týdenní průměr a směr křivky.",
    tips: [
      "Vážte se ideálně ráno, po toaletě, ve stejných podmínkách.",
      "U redukce cílete spíš na mírný, udržitelný úbytek než na rychlé diety.",
      "Síla a chůze pomáhají udržet svaly, zatímco klesá celková váha.",
      "Pokud váha stagnuje týdny, nejdřív zkontrolujte spánek, stres a pravidelnost jídel — ne hned drastický zásah.",
    ],
    hasIdealOverlay: true,
    section: "weight",
    color: "#0ea5e9",
    kind: "number",
  },
  {
    key: "bodyFatPct",
    title: "Tělesný tuk",
    unit: "%",
    shortHelp: "Odhad podílu tukové tkáně. BIA váhy mají odchylku — důležitý je směr v čase.",
    longHelp: "Bioelektrická impedance (BIA) odhaduje tuk z odporu tkání. Hydratace, jídlo a cvičení výsledek posunou. Jedno číslo není verdikt; sledujte týdenní průměr a kontext (trénink, strava).",
    noiseHelp: "Po soleném jídle, alkoholu nebo tvrdém tréninku může % tuku „vyskočit“, aniž by přibyl tuk. Porovnávejte měření ve stejné denní době.",
    tips: [
      "Dlouhodobě pomáhá mírný kalorický deficit a dostatek bílkovin — bez extrémních restrikcí.",
      "Kombinujte silový trénink s pohybem v zóně, kterou zvládnete udržet.",
      "Spánek 7+ hodin snižuje chuť na noční jídlo a usnadňuje držení režimu.",
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
    shortHelp: "Odhad svalové hmoty v procentech. Kolísá s vodou a glykogenem.",
    longHelp: "Procentuální svalová hmota na BIA váze je odhad. Po tréninku nebo při dehydrataci může klesnout, aniž byste „ztratili sval“. Sledujte trend společně s hmotností a tréninkovým plánem.",
    noiseHelp: "Glykogen a voda ve svalech mění % ze dne na den. Pokles po náročném týdnu nemusí být ztráta svalů — často je to regenerace a hydratace.",
    tips: [
      "2–3× týdně silový trénink velkých partií drží svaly při hubnutí.",
      "Zařaďte bílkovinný zdroj do většiny jídel (maso, luštěniny, mléčné, vejce…).",
      "Při silném deficitu energie svaly trpí dřív — raději pomalejší redukce.",
    ],
    hasIdealOverlay: true,
    section: "composition",
    color: "#1e40af",
    kind: "number",
  },
  {
    key: "waterPct",
    title: "Voda v těle",
    unit: "%",
    shortHelp: "Celková tělesná voda. Silně reaguje na pitný režim a sůl.",
    longHelp: "Voda tvoří velkou část hmotnosti. Ranní měření po toaletě bývá stabilnější. Výkyvy o několik procent mezi dny jsou běžné a často vysvětlují i skoky v tuku nebo svalech.",
    noiseHelp: "Vysoká sůl, alkohol nebo horký den posunou vodu o několik %. To pak „pohne“ i tukem a svaly na BIA — nejdřív čtěte vodu, pak ostatní.",
    tips: [
      "Pijte pravidelně přes den; extrémní dohánění litry najednou křivku spíš rozhoupe.",
      "Po slaných jídlech očekávejte dočasný nárůst hmotnosti i vody.",
      "Stabilní pitný režim = čitelnější všechny BIA metriky.",
    ],
    hasIdealOverlay: true,
    section: "composition",
    color: "#3b82f6",
    kind: "number",
  },
  {
    key: "proteinPct",
    title: "Bílkoviny",
    unit: "%",
    shortHelp: "Odhad bílkovinné hmoty — hrubý ukazatel, ne laboratorní výsledek.",
    longHelp: "BIA odhad bílkovin souvisí se svalovou hmotou a hydratací. Nepoužívejte ho jako přesný laboratorní marker; slouží spíš jako doplněk k celkovému obrazu.",
    noiseHelp: "Hodnota skáče s hydratací podobně jako svaly. Denní rozdíly berte s rezervou; zajímá vás spíš měsíční směr.",
    tips: [
      "Orientujte se spíš na jídelníček s pravidelným příjmem bílkovin než na toto jedno %.",
      "Při hubnutí bílkoviny pomáhají sytosti a udržení svalů.",
      "Silový trénink dává parametru praktický smysl — samotné číslo z váhy nestačí.",
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
    shortHelp: "Odhad kostní hmoty. Mění se pomalu; denní skoky jsou spíš šum měření.",
    longHelp: "Kostní hmota na spotřebitelské váze je hrubý odhad. Skutečné změny probíhají měsíce až roky. Denní výkyvy ignorujte.",
    noiseHelp: "Denní nebo týdenní skoky jsou téměř vždy chyba modelu BIA. Sledujte spíš roky a celkový životní styl.",
    tips: [
      "Pro kosti dlouhodobě pomáhá pohyb s vlastní vahou a silový trénink.",
      "Dostatečný příjem vápníku a vitaminu D řešte spíš stravou / s lékařem než tímto grafem.",
      "Nesrovnávejte denní body — u kostí nemají praktický význam.",
    ],
    section: "other",
    color: "#a8a29e",
    kind: "number",
  },
  {
    key: "bmi",
    title: "BMI",
    unit: "",
    shortHelp: "Index tělesné hmotnosti z výšky a váhy. Neříká nic o podílu tuku vs. svalu.",
    longHelp: "BMI je populační ukazatel, ne individuální diagnóza. U sportovců s vyšší svalovou hmotou může být „vysoké“ bez vysokého tuku. Sledujte spíš složení těla a obvod pasu.",
    noiseHelp: "BMI se hýbe jen s hmotností. Denní výkyvy váhy = výkyvy BMI. Trend týdnů je důležitější než jedno číslo.",
    tips: [
      "Ideál v aplikaci míří k BMI kolem 22 jako orientačnímu cíli hubnutí — ne jako jedinému měřítku zdraví.",
      "Když máte hodně svalů, doplňte pohled o % tuku a obvod pasu.",
      "Změny BMI berte spolu s tím, jak se cítíte a jak vám sedí oblečení.",
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
    shortHelp: "Odhad bazálního výdaje energie v klidu.",
    longHelp: "BMR je odhad kalorií, které tělo spálí v naprostém klidu. Na BIA váze jde o model z hmotnosti, věku a složení — ne o metabolický test. Používejte jako orientaci, ne přesný jídelníček.",
    noiseHelp: "BMR na váze se mění hlavně s hmotností a odhadovaným složením. Skoky po jednom dni jsou model, ne „rozbitý metabolismus“.",
    tips: [
      "Nepřepočítejte jídelníček podle každého skoku BMR — berte týdenní průměr.",
      "Extrémní restrikce energie BMR dlouhodobě nesvědčí; raději mírný deficit.",
      "Pohyb a svalová hmota podporují vyšší celkový výdaj (viz AMR).",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#b45309",
    kind: "number",
  },
  {
    key: "activeMassKg",
    title: "Aktivní tělesná hmota",
    unit: "kg",
    shortHelp: "Hmotnost bez tukové tkáně (odhad).",
    longHelp: "Aktivní (tukuprostá) hmota zahrnuje svaly, orgány, kosti a vodu. Roste při nárůstu svalů nebo hydratace; při redukci tuku může zůstat stabilní i když celková váha klesá.",
    noiseHelp: "Když klesá váha a aktivní hmota drží, často hubnete tuk. Když klesají obě, zkontrolujte příjem energie, bílkoviny a trénink.",
    tips: [
      "Cíl při hubnutí: držet aktivní hmotu, snižovat tuk — ne jen „co nejnižší váhu“.",
      "Síla + bílkoviny jsou praktický základ.",
      "Velký propad aktivní hmoty při rychlé dietě je varování zpomalit.",
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
    shortHelp: "Odhad celkového denního výdaje včetně aktivity.",
    longHelp: "AMR = BMR × faktor aktivity (podle nastavení váhy/profilu). Pokud se mění jen málo, zatímco váha kolísá, jde spíš o model než o reálný výdaj z tréninku.",
    noiseHelp: "AMR z váhy nereaguje na konkrétní trénink daného dne. Nesrovnávejte ho s hodinkami 1:1 — jde o hrubý model.",
    tips: [
      "Berte AMR jako strop orientace, ne jako přesný rozpočet kalorií.",
      "Reálný výdaj lépe odhadnete z aktivity a toho, jak se mění váha v týdnech.",
      "Při sedavé práci pomůže denní chůze víc než honba za číslem AMR.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#d97706",
    kind: "number",
  },
  {
    key: "subcutaneousFatKg",
    title: "Podkožní tuk",
    unit: "kg",
    shortHelp: "Odhad tuku pod kůží. Oddělený od viscerálního indexu.",
    longHelp: "Podkožní tuk je ten, který „vidíte“. BIA ho odděluje od vnitřního (viscerálního) — s nejistotou. Trend je užitečnější než absolutní kilogramy.",
    noiseHelp: "Stejně jako u % tuku hraje roli hydratace. Týdenní průměr > denní bod.",
    tips: [
      "Udržitelný deficit a pohyb mění podkožní tuk pomalu — to je v pořádku.",
      "Měřte pas / fotky jednou za měsíc jako doplněk k váze.",
      "Krátkodobé diety často „spálí“ vodu, ne podkožní tuk.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#ea580c",
    kind: "number",
  },
  {
    key: "skeletalMuscleKg",
    title: "Kosterní svalstvo",
    unit: "kg",
    shortHelp: "Odhad kosterních svalů v kg. V CSV TrueLife je ve sloupci „%“, hodnoty ale bývají v kg.",
    longHelp: "TrueLife FitScale exportuje sloupec „Kosterní svalstvo(%)“, ale hodnoty často obsahují jednotku kg. VahaDesk je ukládá jako kilogramy. Stejně jako u ostatních BIA metrik platí: trend > jedno měření.",
    noiseHelp: "Po nohách / těžkém tréninku může číslo dočasně klesnout kvůli vodě a glykogenu. Sledujte měsíce, ne dny.",
    tips: [
      "Progresivní silový trénink je nejlepší „intervence“ pro tuto křivku.",
      "Při hubnutí chraňte svaly bílkovinami a ne příliš hlubokým deficitem.",
      "Pokud kg svalů klesají spolu s váhou rychle, zvolněte tempo redukce.",
    ],
    hasIdealOverlay: true,
    section: "other",
    color: "#1e40af",
    kind: "number",
  },
  {
    key: "visceralFatIndex",
    title: "Index viscerálního tuku",
    unit: "",
    shortHelp: "Bezrozměrný index vnitřního tuku. Vyšší hodnoty zaslouží pozornost životního stylu.",
    longHelp: "Viscerální tuk obklopuje orgány. Domácí váha dává index, ne CT/MRI. Pokud je dlouhodobě vysoký, řešte pohyb, spánek a stravu — ideálně s lékařem při dalších rizicích.",
    noiseHelp: "Index může kolísat s celkovým BIA odhadem tuku. Důležitý je pokles v řádu týdnů až měsíců.",
    tips: [
      "Pravidelná chůze a omezení ultra-zpracovaných jídel často pomáhají nejdřív tady.",
      "Spánek a stres mají na břišní tuk překvapivě velký vliv.",
      "Při vysokém indexu a dalších rizicích (tlak, cukr v rodině) konzultujte lékaře — váha nenahrazuje vyšetření.",
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
    shortHelp: "Kategorie podle váhy (např. „Obezita“). Štítek, ne diagnóza.",
    longHelp: "Somatotyp z váhy je zjednodušená kategorie z naměřených hodnot. Nenahrazuje lékařské vyšetření. Používejte jako orientační popisek k číslům výše.",
    noiseHelp: "Štítek se mění skokově s kategoriemi váhy/BMI. Den co den ho neřešte — sledujte čísla nad ním.",
    tips: [
      "Berte somatotyp jako popisek k trendu hmotnosti, ne jako ortel.",
      "Směr křivky váhy a tuku řekne víc než samotný textový štítek.",
      "Při obavách o zdraví řešte stav s odborníkem, ne jen kategorii z váhy.",
    ],
    section: "other",
    color: "#57534e",
    kind: "text",
  },
];

export const PARAM_BY_KEY = Object.fromEntries(
  PARAM_META.map((p) => [p.key, p]),
) as Record<ParamKey, ParamMeta>;

export function isParamKey(value: string): value is ParamKey {
  return value in PARAM_BY_KEY;
}
