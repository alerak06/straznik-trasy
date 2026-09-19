export type Rarity = 'częsty' | 'średni' | 'rzadki' | 'legendarny';

export interface RadarObject {
  id: string;
  name: string;
  hint: string;
  emoji: string;
  points: number;
  rarity: Rarity;
}

/** Things you actually see from a car window on Polish roads. Points follow rarity. */
export const RADAR_OBJECTS: RadarObject[] = [
  // częste — 1 pkt
  { id: 'orlen', name: 'Stacja Orlen', hint: 'Czerwono-biały orzeł nad dystrybutorami', emoji: '⛽', points: 1, rarity: 'częsty' },
  { id: 'krowa', name: 'Krowa na pastwisku', hint: 'Łaciata się liczy podwójnie w sercu', emoji: '🐄', points: 1, rarity: 'częsty' },
  { id: 'tir-zagraniczny', name: 'TIR z obcą rejestracją', hint: 'Każda litera kraju poza PL', emoji: '🚛', points: 1, rarity: 'częsty' },
  { id: 'rondo', name: 'Rondo z rzeźbą', hint: 'Cokolwiek na środku ronda', emoji: '🗿', points: 1, rarity: 'częsty' },
  { id: 'kapliczka', name: 'Przydrożna kapliczka', hint: 'Z kwiatami lub bez', emoji: '⛪', points: 1, rarity: 'częsty' },
  { id: 'biedronka', name: 'Biedronka', hint: 'Sklep, nie owad', emoji: '🐞', points: 1, rarity: 'częsty' },
  { id: 'bocian-gniazdo', name: 'Gniazdo bociana', hint: 'Na słupie albo kominie', emoji: '🪺', points: 1, rarity: 'częsty' },
  { id: 'wiatrak', name: 'Turbina wiatrowa', hint: 'Musi się kręcić', emoji: '🌬️', points: 1, rarity: 'częsty' },
  { id: 'rower', name: 'Rowerzysta w kasku', hint: 'Kask obowiązkowy', emoji: '🚴', points: 1, rarity: 'częsty' },
  { id: 'kombi-dach', name: 'Auto z boxem dachowym', hint: 'Ktoś jedzie na wakacje', emoji: '🧳', points: 1, rarity: 'częsty' },

  // średnie — 2 pkt
  { id: 'fotoradar', name: 'Fotoradar', hint: 'Stacjonarny, żółta skrzynka', emoji: '📸', points: 2, rarity: 'średni' },
  { id: 'radiowoz', name: 'Radiowóz', hint: 'Oznakowany, niebiesko-srebrny', emoji: '🚓', points: 2, rarity: 'średni' },
  { id: 'kosciol-2-wieze', name: 'Kościół z dwiema wieżami', hint: 'Jedna wieża nie wystarczy', emoji: '🏰', points: 2, rarity: 'średni' },
  { id: 'kon', name: 'Koń', hint: 'Na łące, w przyczepie lub z jeźdźcem', emoji: '🐎', points: 2, rarity: 'średni' },
  { id: 'autostop', name: 'Autostopowicz', hint: 'Kciuk w górę, plecak obok', emoji: '👍', points: 2, rarity: 'średni' },
  { id: 'karetka', name: 'Karetka', hint: 'Z kogutem lub bez', emoji: '🚑', points: 2, rarity: 'średni' },
  { id: 'kamper', name: 'Kamper', hint: 'Dom na kółkach', emoji: '🚐', points: 2, rarity: 'średni' },
  { id: 'zamek', name: 'Zamek lub ruiny', hint: 'Widoczne z drogi', emoji: '🏯', points: 2, rarity: 'średni' },
  { id: 'przejazd', name: 'Przejazd kolejowy z pociągiem', hint: 'Szlaban w dół, pociąg w ruchu', emoji: '🚆', points: 2, rarity: 'średni' },
  { id: 'kombajn', name: 'Kombajn', hint: 'Na polu albo na drodze', emoji: '🌾', points: 2, rarity: 'średni' },
  { id: 'motocykl-grupa', name: 'Grupa motocyklistów', hint: 'Minimum trzy maszyny', emoji: '🏍️', points: 2, rarity: 'średni' },
  { id: 'lotnisko', name: 'Samolot nisko nad drogą', hint: 'Widać podwozie', emoji: '✈️', points: 2, rarity: 'średni' },

  // rzadkie — 3 pkt
  { id: 'zolty-traktor', name: 'Żółty traktor', hint: 'Żółty. Nie zielony, nie czerwony', emoji: '🚜', points: 3, rarity: 'rzadki' },
  { id: 'bocian', name: 'Bocian w locie', hint: 'Skrzydła rozłożone, nie w gnieździe', emoji: '🦩', points: 3, rarity: 'rzadki' },
  { id: 'sarna', name: 'Sarna na polu', hint: 'Albo jeleń, dzik się nie liczy', emoji: '🦌', points: 3, rarity: 'rzadki' },
  { id: 'rozowe-auto', name: 'Różowe auto', hint: 'Cała karoseria, nie naklejka', emoji: '🩷', points: 3, rarity: 'rzadki' },
  { id: 'laweta', name: 'Laweta z autem', hint: 'Auto na pace', emoji: '🛻', points: 3, rarity: 'rzadki' },
  { id: 'wesele', name: 'Auto weselne', hint: 'Wstążki na masce', emoji: '💐', points: 3, rarity: 'rzadki' },
  { id: 'nauka-jazdy', name: 'Nauka jazdy', hint: 'Litera L na dachu', emoji: '🔰', points: 3, rarity: 'rzadki' },
  { id: 'balon', name: 'Balon lub paralotnia', hint: 'Coś w powietrzu, co nie jest ptakiem', emoji: '🎈', points: 3, rarity: 'rzadki' },

  // legendarne — 5 pkt
  { id: 'maluch', name: 'Fiat 126p', hint: 'Maluch w ruchu, nie na złomie', emoji: '🚗', points: 5, rarity: 'legendarny' },
  { id: 'polonez', name: 'Polonez', hint: 'Klasyk z FSO', emoji: '🚙', points: 5, rarity: 'legendarny' },
  { id: 'lis', name: 'Lis', hint: 'Rudy ogon przy lesie', emoji: '🦊', points: 5, rarity: 'legendarny' },
  { id: 'tecza', name: 'Tęcza', hint: 'Pełny łuk lub jego kawałek', emoji: '🌈', points: 5, rarity: 'legendarny' },
  { id: 'tablica-imie', name: 'Tablica indywidualna', hint: 'Np. „P0 MAREK”', emoji: '🪪', points: 5, rarity: 'legendarny' },
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
