export type Rarity = 'częsty' | 'średni' | 'rzadki' | 'legendarny';

export interface RadarObject {
  id: string;
  name: string;
  hint: string;
  emoji: string;
  points: number;
  rarity: Rarity;
}

type Row = [id: string, name: string, hint: string, emoji: string];

const POINTS: Record<Rarity, number> = { częsty: 1, średni: 2, rzadki: 3, legendarny: 5 };

const group = (rarity: Rarity, rows: Row[]): RadarObject[] =>
  rows.map(([id, name, hint, emoji]) => ({ id, name, hint, emoji, rarity, points: POINTS[rarity] }));

/**
 * Things you actually see from a car window on Polish roads. Ids are permanent —
 * the no-repeat memory is keyed by them, so never rename an existing id.
 */
export const RADAR_OBJECTS: RadarObject[] = [
  ...group('częsty', [
    ['orlen', 'Stacja Orlen', 'Czerwono-biały orzeł nad dystrybutorami', '⛽'],
    ['krowa', 'Krowa na pastwisku', 'Łaciata się liczy podwójnie w sercu', '🐄'],
    ['tir-zagraniczny', 'TIR z obcą rejestracją', 'Każda litera kraju poza PL', '🚛'],
    ['rondo', 'Rondo z rzeźbą', 'Cokolwiek na środku ronda', '🗿'],
    ['kapliczka', 'Przydrożna kapliczka', 'Z kwiatami lub bez', '⛪'],
    ['biedronka', 'Biedronka', 'Sklep, nie owad', '🐞'],
    ['bocian-gniazdo', 'Gniazdo bociana', 'Na słupie albo kominie', '🪺'],
    ['wiatrak', 'Turbina wiatrowa', 'Musi się kręcić', '🌬️'],
    ['rower', 'Rowerzysta w kasku', 'Kask obowiązkowy', '🚴'],
    ['kombi-dach', 'Auto z boxem dachowym', 'Ktoś jedzie na wakacje', '🧳'],
    ['lidl', 'Lidl', 'Żółto-niebieskie logo', '🛒'],
    ['zabka', 'Żabka', 'Zielona, zawsze otwarta', '🐸'],
    ['autobus', 'Autobus', 'Miejski, szkolny albo turystyczny', '🚌'],
    ['bus-dostawczy', 'Bus kurierski', 'Z logo firmy kurierskiej', '📦'],
    ['ciagnik', 'Ciągnik rolniczy', 'Dowolny kolor, na polu albo drodze', '🚜'],
    ['kury', 'Kury na podwórku', 'Minimum dwie', '🐔'],
    ['bilbord', 'Bilbord z politykiem', 'Uśmiechnięta twarz nad drogą', '🪧'],
    ['znak-zwierzyna', 'Znak „dzikie zwierzęta”', 'Trójkąt z jeleniem', '🦌'],
    ['most', 'Most nad rzeką', 'Woda pod spodem się liczy', '🌉'],
    ['czerwone-auto', 'Czerwone auto', 'Cała karoseria czerwona', '🟥'],
    ['psy-spacer', 'Pies na spacerze', 'Ze smyczą i właścicielem', '🐕'],
    ['las', 'Las przy drodze', 'Ściana drzew po obu stronach', '🌲'],
    ['stog-siana', 'Bele siana', 'Owinięte w folię albo nie', '🌾'],
    ['przystanek', 'Przystanek z wiatą', 'Ktoś na nim czeka', '🚏'],
    ['mcdonalds', 'McDonald’s', 'Złote łuki przy trasie', '🍟'],
    ['stacja-shell', 'Stacja Shell', 'Żółta muszla', '🐚'],
    ['ekran-akustyczny', 'Ekran akustyczny', 'Ściana wzdłuż drogi', '🧱'],
    ['koparka', 'Koparka', 'Przy robotach drogowych', '🏗️'],
    ['pachołki', 'Pachołki drogowe', 'Pomarańczowo-białe, minimum pięć', '🚧'],
    ['motocykl', 'Motocyklista', 'W pełnym stroju', '🏍️'],
    ['pole-rzepaku', 'Pole rzepaku', 'Jaskrawożółte', '🟨'],
    ['pole-kukurydzy', 'Pole kukurydzy', 'Wyższe niż człowiek', '🌽'],
    ['staw', 'Staw albo jezioro', 'Woda widoczna z drogi', '💧'],
    ['kosciol-wieza', 'Wieża kościoła', 'Widoczna nad dachami', '🔔'],
    ['plot-ogrod', 'Ogródek z krasnalem', 'Krasnal ogrodowy obowiązkowy', '🧙'],
    ['sklep-wiejski', 'Wiejski sklep „Spożywczy”', 'Z ławką przed wejściem', '🏪'],
    ['znak-ograniczenie', 'Znak „70”', 'Ograniczenie prędkości do 70', '🔴'],
    ['srebrne-auto', 'Srebrne kombi', 'Srebrne i z bagażnikiem kombi', '🚗'],
    ['tir-chlodnia', 'TIR-chłodnia', 'Biała naczepa z agregatem', '❄️'],
    ['laweczka', 'Ławeczka przy drodze', 'Najlepiej pusta', '🪑'],
    ['owce', 'Owce albo kozy', 'Stado, nie pojedyncza sztuka', '🐑'],
    ['gesi', 'Gęsi lub kaczki', 'Na łące albo przy wodzie', '🪿'],
    ['myjnia', 'Myjnia samochodowa', 'Z napisem „bezdotykowa”', '🧽'],
    ['stacja-bp', 'Stacja BP', 'Zielono-żółty kwiat', '🌼'],
    ['tablica-miasto', 'Tablica z nazwą miasta', 'Biała tablica wjazdowa', '🏙️'],
    ['warzywniak', 'Stragan z owocami', 'Truskawki, czereśnie, jabłka', '🍓'],
    ['radio-maszt', 'Maszt telekomunikacyjny', 'Czerwono-biały albo szary', '📡'],
    ['cysterna', 'Cysterna', 'Okrągły zbiornik na naczepie', '🛢️'],
    ['hulajnoga', 'Hulajnoga elektryczna', 'W ruchu lub zaparkowana', '🛴'],
    ['flaga-pl', 'Biało-czerwona flaga', 'Na budynku albo maszcie', '🇵🇱'],
  ]),

  ...group('średni', [
    ['fotoradar', 'Fotoradar', 'Stacjonarny, żółta skrzynka', '📸'],
    ['radiowoz', 'Radiowóz', 'Oznakowany, niebiesko-srebrny', '🚓'],
    ['kosciol-2-wieze', 'Kościół z dwiema wieżami', 'Jedna wieża nie wystarczy', '🏰'],
    ['kon', 'Koń', 'Na łące, w przyczepie lub z jeźdźcem', '🐎'],
    ['autostop', 'Autostopowicz', 'Kciuk w górę, plecak obok', '👍'],
    ['karetka', 'Karetka', 'Z kogutem lub bez', '🚑'],
    ['kamper', 'Kamper', 'Dom na kółkach', '🚐'],
    ['zamek', 'Zamek lub ruiny', 'Widoczne z drogi', '🏯'],
    ['przejazd', 'Przejazd kolejowy z pociągiem', 'Szlaban w dół, pociąg w ruchu', '🚆'],
    ['kombajn', 'Kombajn', 'Na polu albo na drodze', '🌾'],
    ['motocykl-grupa', 'Grupa motocyklistów', 'Minimum trzy maszyny', '🏍️'],
    ['lotnisko', 'Samolot nisko nad drogą', 'Widać podwozie', '✈️'],
    ['straz', 'Wóz strażacki', 'Czerwony, z drabiną albo bez', '🚒'],
    ['przyczepa-kempingowa', 'Przyczepa kempingowa', 'Holowana przez auto', '🏕️'],
    ['auto-elektryczne-ladowanie', 'Auto przy ładowarce', 'Podpięte kablem', '🔌'],
    ['tesla', 'Tesla', 'Dowolny model', '⚡'],
    ['kabriolet', 'Kabriolet z otwartym dachem', 'Dach złożony, włosy na wietrze', '😎'],
    ['holowanie', 'Auto na holu', 'Holowane na lince', '🪢'],
    ['drogowcy', 'Ekipa drogowców', 'W kamizelkach, przy pracy', '👷'],
    ['bocian-na-polu', 'Bocian na polu', 'Stoi albo chodzi po łące', '🦢'],
    ['czapla', 'Czapla', 'Szara, na długich nogach', '🪶'],
    ['jastrzab', 'Ptak drapieżny na słupku', 'Myszołów czeka na obiad', '🦅'],
    ['dzik-znak', 'Pole ogrodzone pastuchem', 'Cienki drut z taśmą', '⚡'],
    ['wiadukt-pociag', 'Pociąg na wiadukcie', 'Jedzie nad drogą', '🚄'],
    ['tir-przewozi-auta', 'Laweta z kilkoma autami', 'Piętrowa naczepa z samochodami', '🚘'],
    ['drewno', 'TIR z drewnem', 'Pnie na naczepie', '🪵'],
    ['betoniarka', 'Betonomieszarka', 'Kręcący się bęben', '🌀'],
    ['wiata-fotowoltaika', 'Farma fotowoltaiczna', 'Rzędy paneli na polu', '☀️'],
    ['plac-zabaw', 'Plac zabaw', 'Zjeżdżalnia widoczna z drogi', '🛝'],
    ['boisko-mecz', 'Mecz na boisku', 'Ktoś kopie piłkę', '⚽'],
    ['wesole-miasteczko', 'Karuzela lub diabelski młyn', 'Wesołe miasteczko przy trasie', '🎡'],
    ['kajaki', 'Kajaki na dachu auta', 'Albo rowery na bagażniku', '🛶'],
    ['koniczyna', 'Węzeł autostradowy „koniczyna”', 'Zjazdy w kształcie pętli', '🍀'],
    ['bramki', 'Bramki na autostradzie', 'Punkt poboru opłat', '🎫'],
    ['mop', 'Miejsce Obsługi Podróżnych', 'Znak MOP przy autostradzie', '🅿️'],
    ['auto-z-reklama', 'Auto z reklamą pizzerii', 'Dostawa jedzenia', '🍕'],
    ['taksowka', 'Taksówka', 'Z kogutem „TAXI”', '🚕'],
    ['dzwig', 'Dźwig budowlany', 'Wysoki żuraw nad budową', '🏗️'],
    ['silos', 'Silos zbożowy', 'Wysoki metalowy walec', '🏭'],
    ['komin-fabryczny', 'Dymiący komin', 'Z fabryki albo elektrociepłowni', '💨'],
    ['wiatrak-drewniany', 'Stary drewniany wiatrak', 'Koźlak albo holender', '🎑'],
    ['traktor-z-przyczepa', 'Traktor z przyczepą', 'Pełna przyczepa na drodze', '🚜'],
    ['auto-zabytkowe', 'Klasyczne auto z żółtą tablicą', 'Tablica rejestracyjna pojazdu zabytkowego', '🟡'],
    ['nauka-jazdy-moto', 'Motocykl nauki jazdy', 'Kursant w kamizelce', '🦺'],
    ['policja-motor', 'Policjant na motocyklu', 'Drogówka na dwóch kółkach', '👮'],
    ['cmentarz', 'Cmentarz przy drodze', 'Z lampkami', '🕯️'],
    ['pomnik', 'Pomnik na placu', 'Postać na cokole', '🗽'],
    ['latarnia-morska', 'Wieża widokowa', 'Albo latarnia na horyzoncie', '🗼'],
    ['konie-bryczka', 'Bryczka', 'Wóz ciągnięty przez konia', '🐴'],
    ['znak-krzyz', 'Znak „Krzyż św. Andrzeja”', 'Przejazd kolejowy bez zapór', '❌'],
  ]),

  ...group('rzadki', [
    ['zolty-traktor', 'Żółty traktor', 'Żółty. Nie zielony, nie czerwony', '🚜'],
    ['bocian', 'Bocian w locie', 'Skrzydła rozłożone, nie w gnieździe', '🦩'],
    ['sarna', 'Sarna na polu', 'Albo jeleń, dzik się nie liczy', '🦌'],
    ['rozowe-auto', 'Różowe auto', 'Cała karoseria, nie naklejka', '🩷'],
    ['laweta', 'Laweta z autem', 'Auto na pace', '🛻'],
    ['wesele', 'Auto weselne', 'Wstążki na masce', '💐'],
    ['nauka-jazdy', 'Nauka jazdy', 'Litera L na dachu', '🔰'],
    ['balon', 'Balon lub paralotnia', 'Coś w powietrzu, co nie jest ptakiem', '🎈'],
    ['zajac', 'Zając', 'Na polu, uszy do góry', '🐇'],
    ['dzik', 'Dzik', 'Żywy, na polu albo przy lesie', '🐗'],
    ['helikopter', 'Helikopter', 'W powietrzu, nie na lądowisku', '🚁'],
    ['limuzyna', 'Limuzyna', 'Wydłużona, z przyciemnianymi szybami', '🎩'],
    ['auto-na-dachu-auta', 'Auto na dachu samochodu', 'Albo łódka na przyczepie', '🚤'],
    ['zolte-auto', 'Żółte auto osobowe', 'Nie taksówka, nie dostawczak', '🟨'],
    ['fioletowe-auto', 'Fioletowe auto', 'Cała karoseria', '🟪'],
    ['pomaranczowe-auto', 'Pomarańczowe auto', 'Cała karoseria', '🟧'],
    ['wiatrak-zepsuty', 'Stojąca turbina wśród kręcących się', 'Jedna jedyna nie pracuje', '🛑'],
    ['pies-w-oknie', 'Pies z głową za oknem', 'W jadącym aucie', '🐶'],
    ['konwoj-wojskowy', 'Pojazd wojskowy', 'Zielony, z tablicą „U”', '🪖'],
    ['auto-rajdowe', 'Auto z naklejkami rajdowymi', 'Numery startowe na drzwiach', '🏁'],
    ['kolejka-waskotorowa', 'Kolejka wąskotorowa', 'Albo parowóz', '🚂'],
    ['prom', 'Prom lub przeprawa', 'Auta na wodzie', '⛴️'],
    ['traktor-zabytkowy', 'Zabytkowy traktor Ursus', 'Mały, stary, dymiący', '💨'],
    ['znak-drogi-bledny', 'Znak ze śmieszną nazwą miejscowości', 'Nazwa, która rozbawi całe auto', '😂'],
    ['alpaka', 'Alpaka albo lama', 'Na pastwisku, wbrew wszystkiemu', '🦙'],
    ['strus', 'Strusie na fermie', 'Ogromne ptaki za płotem', '🪿'],
    ['jelen-rogi', 'Jeleń z porożem', 'Poroże musi być widoczne', '🫎'],
    ['bocian-3', 'Trzy bociany naraz', 'W jednym kadrze', '3️⃣'],
    ['auto-z-choinka', 'Auto z czymś wielkim na dachu', 'Materac, choinka, szafa…', '🎄'],
    ['maszyna-drogowa', 'Walec drogowy', 'Przy świeżym asfalcie', '🛞'],
    ['samolot-rolniczy', 'Mały samolot śmigłowy', 'Awionetka na niebie', '🛩️'],
    ['zlot', 'Zlot klasycznych aut', 'Kilka oldtimerów razem', '🚙'],
  ]),

  ...group('legendarny', [
    ['maluch', 'Fiat 126p', 'Maluch w ruchu, nie na złomie', '🚗'],
    ['polonez', 'Polonez', 'Klasyk z FSO', '🚙'],
    ['lis', 'Lis', 'Rudy ogon przy lesie', '🦊'],
    ['tecza', 'Tęcza', 'Pełny łuk lub jego kawałek', '🌈'],
    ['tablica-imie', 'Tablica indywidualna', 'Np. „P0 MAREK”', '🪪'],
    ['syrenka', 'Syrenka', 'Legendarna FSO Syrena', '🧜'],
    ['nysa-zuk', 'Żuk albo Nysa', 'Dostawczak z PRL', '🚐'],
    ['trabant', 'Trabant albo Wartburg', 'Enerdowski klasyk', '🪅'],
    ['losie', 'Łoś', 'Król mokradeł', '🫎'],
    ['zubr', 'Żubr', 'Żywy, nie na etykiecie', '🦬'],
    ['podwojna-tecza', 'Podwójna tęcza', 'Dwa łuki naraz', '🌈'],
    ['tablica-twoje-imie', 'Tablica z imieniem kogoś z auta', 'Indywidualna z Waszym imieniem', '🎯'],
    ['tir-kraj-egzotyczny', 'TIR spoza Europy', 'Rejestracja np. z Kazachstanu czy Turcji', '🌍'],
    ['karawan-cyrku', 'Wozy cyrkowe', 'Kolorowe przyczepy cyrku', '🎪'],
    ['samochod-amfibia', 'Auto z przyczepą z łodzią i rowerami', 'Pełen zestaw wakacyjny naraz', '🎒'],
    ['dziecieca-kolejka', 'Ciuchcia turystyczna', 'Kolejka na kołach dla turystów', '🚃'],
    ['jez', 'Jeż', 'Żywy, na poboczu lub ścieżce', '🦔'],
    ['wiewiorka', 'Wiewiórka', 'Ruda kita na drzewie', '🐿️'],
  ]),
];

export const RADAR_BY_ID = Object.fromEntries(RADAR_OBJECTS.map((o) => [o.id, o])) as Record<string, RadarObject>;

export const RARITY_LABEL: Record<Rarity, string> = {
  częsty: 'Częsty',
  średni: 'Średni',
  rzadki: 'Rzadki',
  legendarny: 'Legendarny',
};

export const GOLDEN_MULTIPLIER = 2;
export const BINGO_BONUS = 5;
