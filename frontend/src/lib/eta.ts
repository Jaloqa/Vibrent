import type { Meeting, TravelMode, User, Venue } from "../data/types";

/**
 * Parametry szacowania czasu dotarcia.
 * UWAGA: wzór i wielkość marginesu NIE są zatwierdzone — to wartości robocze
 * prototypu, które wymagają osobnej decyzji produktowej.
 */
export const ETA_CONFIG = {
  approved: false,
  speedsKmh: { walk: 4.8, transit: 14, bike: 13 } as Record<TravelMode, number>,
  /** stały narzut: oczekiwanie na tramwaj, zapięcie roweru itp. */
  overheadMin: { walk: 0, transit: 6, bike: 2 } as Record<TravelMode, number>,
  /** dodatkowy zapas procentowy */
  marginPct: 0.2,
  /** minimalny zapas w minutach */
  marginMinMinutes: 2,
  /** szerokość przedziału ETA pokazywanego drugiej osobie */
  sharedBandMinutes: 5,
  /** po ilu minutach ponad wspólny czas uznajemy możliwe spóźnienie */
  lateThresholdMinutes: 5,
};

export const TRAVEL_LABEL: Record<TravelMode, string> = {
  walk: "Pieszo",
  transit: "Komunikacja",
  bike: "Rower",
};

export interface Point {
  x: number;
  y: number;
}

export const straightDistance = (a: Point, b: Point) =>
  Math.round(Math.hypot(a.x - b.x, a.y - b.y));

/** Uproszczona trasa „po ulicach” – łamana z dwoma zakrętami. */
export function routeFor(from: Point, to: Point): Point[] {
  const midX = from.x + (to.x - from.x) * 0.4;
  return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to];
}

export const routeLength = (pts: Point[]) =>
  pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

export type EtaResult =
  | {
      available: true;
      baseMin: number;
      safeMin: number;
      routeM: number;
      mode: TravelMode;
      source: "demo";
    }
  | { available: false; reason: string };

export function hasLivePosition(user: User) {
  return user.location.mode === "gps";
}

export function computeEta(user: User | undefined, venue: Venue, mode?: TravelMode): EtaResult {
  if (!user) return { available: false, reason: "Brak danych o uczestniku" };
  if (user.location.mode !== "gps")
    return { available: false, reason: "Brak bieżącej lokalizacji" };
  if (user.location.city !== venue.city)
    return { available: false, reason: "Jesteś poza miastem spotkania" };
  const m = mode ?? user.travelMode;
  const routeM = routeLength(routeFor(user.location, venue));
  const baseMin = Math.max(
    1,
    Math.round((routeM / 1000 / ETA_CONFIG.speedsKmh[m]) * 60 + ETA_CONFIG.overheadMin[m]),
  );
  const margin = Math.max(ETA_CONFIG.marginMinMinutes, Math.round(baseMin * ETA_CONFIG.marginPct));
  return {
    available: true,
    baseMin,
    safeMin: baseMin + margin,
    routeM: Math.round(routeM),
    mode: m,
    source: "demo",
  };
}

/** Pozostały czas dotarcia w symulacji (minuty od teraz). */
export function remainingMin(
  eta: EtaResult,
  meeting: Meeting,
  userId: string,
  now: number,
): number | null {
  if (!eta.available || meeting.matchedAt === undefined) return null;
  const delay = meeting.delays[userId] ?? 0;
  return Math.max(0, Math.round(eta.safeMin + delay - (now - meeting.matchedAt)));
}

/** Przedział ETA udostępniany drugiej osobie — ogranicza odtworzenie pozycji. */
export function shareBand(min: number): string {
  const b = ETA_CONFIG.sharedBandMinutes;
  if (min <= 0) return "powinna być już na miejscu";
  if (min <= b) return `do ${b} min`;
  const lower = Math.floor(min / b) * b;
  return `${lower}–${lower + b} min`;
}

export interface ArrivalPlan {
  /** wspólny szacowany moment spotkania (minuty symulacji) */
  plannedAt: number | null;
  late: Record<string, boolean>;
}

export function arrivalPlan(meeting: Meeting, etas: Record<string, EtaResult>): ArrivalPlan {
  const late: Record<string, boolean> = {};
  if (meeting.matchedAt === undefined) return { plannedAt: null, late };
  const ids = Object.keys(etas);
  const safeValues = ids
    .map((id) => etas[id])
    .filter((e): e is Extract<EtaResult, { available: true }> => e.available);
  if (!safeValues.length) return { plannedAt: null, late };
  const plannedAt = meeting.matchedAt + Math.max(...safeValues.map((e) => e.safeMin));
  for (const id of ids) {
    const e = etas[id];
    const delay = meeting.delays[id] ?? 0;
    if (meeting.arrivalIssues[id]) late[id] = true;
    else if (e.available)
      late[id] =
        meeting.matchedAt + e.safeMin + delay > plannedAt + ETA_CONFIG.lateThresholdMinutes;
  }
  return { plannedAt, late };
}

export function fmtDistance(m: number) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
}
