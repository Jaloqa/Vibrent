import type { ActivityId, CategoryId, VenueType } from "./types";

export const img = (path: string, w = 800, h?: number, faces = false) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=75${faces ? "&crop=faces" : ""}`;

export interface CategoryDef {
  id: CategoryId;
  label: string;
  /** klasy tła/tekstu spełniające kontrast AA */
  tint: string;
  text: string;
  dot: string;
  solid: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "jedzenie",
    label: "Jedzenie i napoje",
    tint: "bg-amber-100",
    text: "text-amber-900",
    dot: "bg-amber-500",
    solid: "#f59e0b",
  },
  {
    id: "aktywnosc",
    label: "Aktywność fizyczna",
    tint: "bg-emerald-100",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
    solid: "#10b981",
  },
  {
    id: "rozrywka",
    label: "Rozrywka",
    tint: "bg-violet-100",
    text: "text-violet-900",
    dot: "bg-violet-500",
    solid: "#8b5cf6",
  },
  {
    id: "ludzie",
    label: "Poznawanie ludzi",
    tint: "bg-sky-100",
    text: "text-sky-900",
    dot: "bg-sky-500",
    solid: "#0ea5e9",
  },
  {
    id: "zainteresowania",
    label: "Zainteresowania",
    tint: "bg-rose-100",
    text: "text-rose-900",
    dot: "bg-rose-500",
    solid: "#f43f5e",
  },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export interface ActivityDef {
  id: ActivityId;
  label: string;
  category: CategoryId;
  icon: string;
  venueTypes: VenueType[];
  photo: string;
  titleHint: string;
}

export const ACTIVITIES: ActivityDef[] = [
  {
    id: "kawa",
    label: "Kawa",
    category: "jedzenie",
    icon: "Coffee",
    venueTypes: ["kawiarnia", "ksiegarnia"],
    photo: "photo-1634465474088-e82e29b64ecc",
    titleHint: "Kawa w centrum? Ktoś chętny na pogaduchy?",
  },
  {
    id: "pub",
    label: "Pub / piwo",
    category: "jedzenie",
    icon: "Beer",
    venueTypes: ["pub"],
    photo: "photo-1600788886242-5c96aabe3757",
    titleHint: "Ktoś na szybkie piwo?",
  },
  {
    id: "restauracja",
    label: "Restauracja",
    category: "jedzenie",
    icon: "UtensilsCrossed",
    venueTypes: ["restauracja", "fastfood"],
    photo: "photo-1651980979183-79425af50103",
    titleHint: "Wyskoczymy na jedzenie?",
  },
  {
    id: "drink",
    label: "Drink",
    category: "jedzenie",
    icon: "Martini",
    venueTypes: ["bar"],
    photo: "photo-1566417713940-fe7c737a9ef2",
    titleHint: "Szybki drink po pracy?",
  },
  {
    id: "fastfood",
    label: "Szybkie jedzenie",
    category: "jedzenie",
    icon: "Sandwich",
    venueTypes: ["fastfood"],
    photo: "photo-1683731509782-22668b4ba48d",
    titleHint: "Zapiekanka na Placu Nowym?",
  },
  {
    id: "silownia",
    label: "Siłownia",
    category: "aktywnosc",
    icon: "Dumbbell",
    venueTypes: ["silownia"],
    photo: "photo-1641337221253-fdc7237f6b61",
    titleHint: "Trening na siłowni – szukam towarzystwa",
  },
  {
    id: "bieganie",
    label: "Bieganie",
    category: "aktywnosc",
    icon: "Footprints",
    venueTypes: ["bulwar", "blonia", "park"],
    photo: "photo-1777662660545-83514f8d4ede",
    titleHint: "Chodźmy pobiegać",
  },
  {
    id: "spacer",
    label: "Spacer",
    category: "aktywnosc",
    icon: "Trees",
    venueTypes: ["park", "bulwar", "punkt"],
    photo: "photo-1761532293695-76cbc9d0c5c1",
    titleHint: "Spacer po parku?",
  },
  {
    id: "rower",
    label: "Rower",
    category: "aktywnosc",
    icon: "Bike",
    venueTypes: ["rower", "bulwar"],
    photo: "photo-1584278140365-2ab8bff2be82",
    titleHint: "Krótka przejażdżka bulwarami?",
  },
  {
    id: "inna-aktywnosc",
    label: "Inna aktywność",
    category: "aktywnosc",
    icon: "Zap",
    venueTypes: ["blonia", "park", "bulwar"],
    photo: "photo-1790337429778-48873ad14beb",
    titleHint: "Frisbee na Błoniach?",
  },
  {
    id: "kino",
    label: "Kino",
    category: "rozrywka",
    icon: "Clapperboard",
    venueTypes: ["kino"],
    photo: "photo-1635400138431-0bbde4d01484",
    titleHint: "Najbliższy seans – ktoś idzie?",
  },
  {
    id: "bilard",
    label: "Bilard",
    category: "rozrywka",
    icon: "CircleDot",
    venueTypes: ["bilard", "pub"],
    photo: "photo-1599685315659-bc876da49fe5",
    titleHint: "Bilard na spontanie?",
  },
  {
    id: "kregle",
    label: "Kręgle",
    category: "rozrywka",
    icon: "Target",
    venueTypes: ["kregle"],
    photo: "photo-1538511059256-46e76f13f071",
    titleHint: "Szybki wypad na kręgle",
  },
  {
    id: "gaming",
    label: "Gaming",
    category: "rozrywka",
    icon: "Gamepad2",
    venueTypes: ["gaming"],
    photo: "photo-1629760946220-5693ee4c46ac",
    titleHint: "Partia planszówki albo FIFA?",
  },
  {
    id: "impreza",
    label: "Impreza / klub",
    category: "rozrywka",
    icon: "PartyPopper",
    venueTypes: ["klub", "bar"],
    photo: "photo-1597075687490-8f673c6c17f6",
    titleHint: "Ktoś na koncert w piwnicy?",
  },
  {
    id: "rozmowa",
    label: "Luźna rozmowa",
    category: "ludzie",
    icon: "MessageCircle",
    venueTypes: ["kawiarnia", "pub", "park"],
    photo: "photo-1653762381632-2945469edb7b",
    titleHint: "Ktoś ma ochotę na pogaduchy?",
  },
  {
    id: "znajomi",
    label: "Nowi znajomi",
    category: "ludzie",
    icon: "Users",
    venueTypes: ["kawiarnia", "pub", "gaming"],
    photo: "photo-1521017432531-fbd92d768814",
    titleHint: "Kawa i poznawanie nowych ludzi",
  },
  {
    id: "miasto",
    label: "Odkrywanie miasta",
    category: "ludzie",
    icon: "Compass",
    venueTypes: ["punkt", "bulwar", "park"],
    photo: "photo-1650709224943-7187a0bb1412",
    titleHint: "Ktoś chce się przejść po Starym Mieście?",
  },
  {
    id: "wspolny-czas",
    label: "Wspólny czas",
    category: "ludzie",
    icon: "Smile",
    venueTypes: ["kawiarnia", "park", "gaming"],
    photo: "photo-1752650143267-57c2491f5ba2",
    titleHint: "Nudzi mi się – ktoś wyskoczy?",
  },
  {
    id: "fotografia",
    label: "Fotografia",
    category: "zainteresowania",
    icon: "Camera",
    venueTypes: ["punkt", "bulwar", "park"],
    photo: "photo-1554080353-a576cf803bda",
    titleHint: "Fotospacer o złotej godzinie?",
  },
  {
    id: "muzyka",
    label: "Muzyka",
    category: "zainteresowania",
    icon: "Music",
    venueTypes: ["muzyka", "klub"],
    photo: "photo-1582730147924-d92f4da00252",
    titleHint: "Przeglądanie winyli i kawa?",
  },
  {
    id: "ksiazki",
    label: "Książki",
    category: "zainteresowania",
    icon: "BookOpen",
    venueTypes: ["ksiegarnia", "kawiarnia"],
    photo: "photo-1700905976495-88e81c407775",
    titleHint: "Księgarnia i kawa – pogadamy o książkach?",
  },
  {
    id: "sztuka",
    label: "Sztuka",
    category: "zainteresowania",
    icon: "Palette",
    venueTypes: ["sztuka"],
    photo: "photo-1606992604324-00b5b2bf388c",
    titleHint: "Szybkie wyjście do galerii?",
  },
  {
    id: "hobby",
    label: "Inne hobby",
    category: "zainteresowania",
    icon: "Sparkles",
    venueTypes: ["kawiarnia", "park", "gaming"],
    photo: "photo-1611891487122-207579d67d98",
    titleHint: "Ktoś składa LEGO albo rysuje?",
  },
];

export const activityById = (id: ActivityId) => ACTIVITIES.find((a) => a.id === id)!;

/** Szybkie kafle w kreatorze (Krok 1). „Inna aktywność” rozwija pełną listę. */
export const QUICK_ACTIVITIES: { id: ActivityId; label: string }[] = [
  { id: "kawa", label: "Kawa" },
  { id: "pub", label: "Pub" },
  { id: "spacer", label: "Spacer" },
  { id: "silownia", label: "Siłownia" },
  { id: "kino", label: "Kino" },
  { id: "bilard", label: "Bilard" },
  { id: "restauracja", label: "Jedzenie" },
];

/** Cechy stylu bycia pogrupowane tematycznie — łatwiej przejrzeć dłuższą listę. */
export const STYLE_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Energia i rytm",
    options: [
      "Spokojny",
      "Energiczny",
      "Wyluzowany",
      "Aktywny ruchowo",
      "Ranny ptaszek",
      "Nocny marek",
    ],
  },
  {
    label: "W kontaktach",
    options: [
      "Towarzyski",
      "Otwarty na nowe znajomości",
      "Introwertyczny",
      "Ekstrawertyczny",
      "Dobry słuchacz",
      "Gaduła",
      "Empatyczny",
    ],
  },
  {
    label: "Podejście do życia",
    options: [
      "Spontaniczny",
      "Zorganizowany",
      "Ciekawy świata",
      "Kreatywny",
      "Ambitny",
      "Optymista",
      "Z poczuciem humoru",
    ],
  },
  {
    label: "Na spotkaniu",
    options: [
      "Punktualny",
      "Głębokie rozmowy",
      "Luźne pogaduszki",
      "Bezpośredni",
      "Chętnie poznaję nowe miejsca",
    ],
  },
];

export const STYLES = STYLE_GROUPS.flatMap((g) => g.options);

export const INTERESTS = [
  "Sport",
  "Kino",
  "Muzyka",
  "Technologia",
  "Podróże",
  "Fotografia",
  "Gry",
  "Książki",
  "Jedzenie",
  "Siłownia",
  "Spacerowanie",
  "Sztuka",
  "Kawa",
  "Bieganie",
  "Planszówki",
  "Rower",
];

export interface CityDef {
  name: string;
  size: "duze" | "male";
  min: number;
  max: number;
  recommended: number;
}

export const CITIES: CityDef[] = [
  { name: "Kraków", size: "duze", min: 1, max: 5, recommended: 3 },
  { name: "Warszawa", size: "duze", min: 1, max: 5, recommended: 3 },
  { name: "Wrocław", size: "duze", min: 1, max: 5, recommended: 3 },
  { name: "Gdańsk", size: "duze", min: 1, max: 5, recommended: 3 },
  { name: "Wadowice", size: "male", min: 3, max: 15, recommended: 8 },
  { name: "Nowy Targ", size: "male", min: 3, max: 15, recommended: 8 },
  { name: "Myślenice", size: "male", min: 3, max: 15, recommended: 8 },
];

export const cityByName = (name: string) => CITIES.find((c) => c.name === name) ?? CITIES[0];

export const AVATAR_PRESETS = [
  "photo-1604004215402-e0be233f39be",
  "photo-1600603406200-5b2a104684ac",
  "photo-1723189037170-eb482b4b86a9",
  "photo-1764532140242-9be85f61a417",
  "photo-1758598304384-1f678eabdd4f",
  "photo-1762708590808-c453c0e4fb0f",
];
