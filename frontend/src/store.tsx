import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import {
  DEMO_MEETINGS,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_REPORTS,
  DEMO_REQUESTS,
  DEMO_USERS,
  VENUES,
} from "./data/demo";
import { activityById, cityByName } from "./data/catalog";
import type {
  AppNotification,
  Filters,
  JoinRequest,
  Meeting,
  Message,
  NotificationType,
  Report,
  ReportKind,
  TravelMode,
  User,
  UserLocation,
  Venue,
} from "./data/types";
import { computeEta, straightDistance } from "./lib/eta";

export interface State {
  now: number;
  currentUserId: string | null;
  users: User[];
  meetings: Meeting[];
  requests: JoinRequest[];
  messages: Message[];
  notifications: AppNotification[];
  reports: Report[];
  dismissed: Record<string, string[]>;
  /** przywrócone z „Pominiętych” – pokazywane na początku talii (najnowsze pierwsze) */
  restored: Record<string, string[]>;
  blocked: Record<string, string[]>;
  filters: Record<string, Filters>;
  offline: boolean;
  mapError: boolean;
}

const STORAGE_KEY = "vibrent-demo-v3";

export const initialState = (): State => ({
  now: 0,
  currentUserId: "u_ola",
  users: structuredClone(DEMO_USERS),
  meetings: structuredClone(DEMO_MEETINGS),
  requests: structuredClone(DEMO_REQUESTS),
  messages: structuredClone(DEMO_MESSAGES),
  notifications: structuredClone(DEMO_NOTIFICATIONS),
  reports: structuredClone(DEMO_REPORTS),
  dismissed: {},
  restored: {},
  blocked: {},
  filters: {},
  offline: false,
  mapError: false,
});

export const defaultFilters = (city: string): Filters => ({
  categories: [],
  interests: [],
  radiusKm: cityByName(city).recommended,
  maxEta: 0,
});

export type Action =
  | { type: "switch_user"; userId: string | null }
  | { type: "advance_time"; minutes: number }
  | { type: "set_offline"; value: boolean }
  | { type: "set_map_error"; value: boolean }
  | { type: "reset" }
  | { type: "register"; user: User }
  | { type: "update_profile"; patch: Partial<User> }
  | { type: "set_location"; location: UserLocation }
  /** odświeżenie pozycji – nie resetuje filtrów użytkownika */
  | { type: "update_position"; location: UserLocation }
  | { type: "set_travel_mode"; mode: TravelMode }
  | { type: "set_filters"; filters: Filters }
  | { type: "dismiss"; meetingId: string }
  | { type: "restore_dismissed" }
  | { type: "restore_one"; meetingId: string }
  | { type: "send_request"; meetingId: string; id: string }
  | { type: "cancel_request"; requestId: string }
  | { type: "publish"; meeting: Meeting }
  | { type: "accept"; requestId: string }
  | { type: "reject"; requestId: string }
  | { type: "cancel_meeting"; meetingId: string; reason: string }
  | { type: "match_seen"; meetingId: string }
  | { type: "send_message"; meetingId: string; text: string; id: string }
  | { type: "retry_message"; messageId: string }
  | { type: "start_meeting"; meetingId: string }
  | { type: "finish_meeting"; meetingId: string }
  | { type: "arrival_issue"; meetingId: string; issue: string; delay: number }
  | { type: "simulate_delay"; meetingId: string; userId: string; minutes: number }
  | {
      type: "report";
      kind: ReportKind;
      meetingId?: string;
      targetId?: string;
      reason: string;
      id: string;
    }
  | { type: "block"; targetId: string }
  | { type: "read_notification"; id: string }
  | { type: "read_all" }
  | { type: "simulate_request"; meetingId: string; id: string };

let counter = 0;
export const uid = (p: string) => `${p}_${Date.now().toString(36)}${(counter++).toString(36)}`;

function notify(
  s: State,
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link: string,
): AppNotification[] {
  return [
    { id: uid("n"), userId, type, title, body, at: s.now, read: false, link },
    ...s.notifications,
  ];
}

const userName = (s: State, id?: string) => s.users.find((u) => u.id === id)?.name ?? "Ktoś";

export const otherPartyId = (m: Meeting, me: string) =>
  m.organizerId === me ? m.participantId : m.organizerId;

export function reducer(s: State, a: Action): State {
  const me = s.currentUserId;
  switch (a.type) {
    case "switch_user":
      return { ...s, currentUserId: a.userId };
    case "advance_time":
      return { ...s, now: s.now + a.minutes };
    case "set_offline":
      return { ...s, offline: a.value };
    case "set_map_error":
      return { ...s, mapError: a.value };
    case "reset":
      return initialState();
    case "register":
      return { ...s, users: [...s.users, a.user], currentUserId: a.user.id };
    case "update_profile":
      return { ...s, users: s.users.map((u) => (u.id === me ? { ...u, ...a.patch } : u)) };
    case "set_location": {
      const users = s.users.map((u) => (u.id === me ? { ...u, location: a.location } : u));
      const filters = { ...s.filters };
      if (me)
        filters[me] = {
          ...(filters[me] ?? defaultFilters(a.location.city)),
          radiusKm: cityByName(a.location.city).recommended,
        };
      return { ...s, users, filters };
    }
    case "update_position":
      return {
        ...s,
        users: s.users.map((u) => (u.id === me ? { ...u, location: a.location } : u)),
      };
    case "set_travel_mode":
      return { ...s, users: s.users.map((u) => (u.id === me ? { ...u, travelMode: a.mode } : u)) };
    case "set_filters":
      return me ? { ...s, filters: { ...s.filters, [me]: a.filters } } : s;
    case "dismiss":
      return me
        ? {
            ...s,
            dismissed: {
              ...s.dismissed,
              [me]: [...(s.dismissed[me] ?? []).filter((id) => id !== a.meetingId), a.meetingId],
            },
            restored: {
              ...s.restored,
              [me]: (s.restored[me] ?? []).filter((id) => id !== a.meetingId),
            },
          }
        : s;
    case "restore_dismissed": {
      if (!me) return s;
      const all = [...(s.dismissed[me] ?? [])].reverse();
      const rest = (s.restored[me] ?? []).filter((id) => !all.includes(id));
      return {
        ...s,
        dismissed: { ...s.dismissed, [me]: [] },
        restored: { ...s.restored, [me]: [...all, ...rest] },
      };
    }
    case "restore_one": {
      if (!me) return s;
      return {
        ...s,
        dismissed: {
          ...s.dismissed,
          [me]: (s.dismissed[me] ?? []).filter((id) => id !== a.meetingId),
        },
        restored: {
          ...s.restored,
          [me]: [a.meetingId, ...(s.restored[me] ?? []).filter((id) => id !== a.meetingId)],
        },
      };
    }
    case "send_request": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!me || !m || m.status !== "active") return s;
      const req: JoinRequest = {
        id: a.id,
        meetingId: m.id,
        userId: me,
        status: "pending",
        createdAt: s.now,
      };
      return {
        ...s,
        requests: [...s.requests, req],
        notifications: notify(
          s,
          m.organizerId,
          "request_new",
          "Nowe zgłoszenie",
          `${userName(s, me)} chce dołączyć do „${m.title}”`,
          `/app/organize/${m.id}`,
        ),
      };
    }
    case "simulate_request": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!m || m.status !== "active") return s;
      const taken = new Set(s.requests.filter((r) => r.meetingId === m.id).map((r) => r.userId));
      const candidate = s.users.find(
        (u) =>
          u.id !== m.organizerId &&
          !taken.has(u.id) &&
          u.location.city === "Kraków" &&
          !u.id.startsWith("u_new"),
      );
      if (!candidate) return s;
      const req: JoinRequest = {
        id: a.id,
        meetingId: m.id,
        userId: candidate.id,
        status: "pending",
        createdAt: s.now,
      };
      return {
        ...s,
        requests: [...s.requests, req],
        notifications: notify(
          s,
          m.organizerId,
          "request_new",
          "Nowe zgłoszenie (symulacja)",
          `${candidate.name} chce dołączyć do „${m.title}”`,
          `/app/organize/${m.id}`,
        ),
      };
    }
    case "cancel_request":
      return {
        ...s,
        requests: s.requests.map((r) => (r.id === a.requestId ? { ...r, status: "cancelled" } : r)),
      };
    case "publish":
      return { ...s, meetings: [a.meeting, ...s.meetings] };
    case "accept": {
      const req = s.requests.find((r) => r.id === a.requestId);
      const m = req && s.meetings.find((x) => x.id === req.meetingId);
      if (!req || !m || m.status !== "active") return s;
      let next: State = {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === m.id
            ? {
                ...x,
                status: "matched",
                participantId: req.userId,
                matchedAt: s.now,
                matchSeenBy: [m.organizerId],
              }
            : x,
        ),
        requests: s.requests.map((r) =>
          r.id === req.id
            ? { ...r, status: "accepted" }
            : r.meetingId === m.id && r.status === "pending"
              ? { ...r, status: "closed" }
              : r,
        ),
      };
      next = {
        ...next,
        notifications: notify(
          next,
          req.userId,
          "match",
          "Widzicie się!",
          `${userName(s, m.organizerId)} zaakceptował(a) Twoje zgłoszenie do „${m.title}”. Mapa i czat są już dostępne.`,
          `/app/match/${m.id}`,
        ),
      };
      for (const r of s.requests.filter(
        (r) => r.meetingId === m.id && r.status === "pending" && r.id !== req.id,
      )) {
        next = {
          ...next,
          notifications: notify(
            next,
            r.userId,
            "request_rejected",
            "Spotkanie zarezerwowane",
            `„${m.title}” ma już parę. Twoje zgłoszenie zostało zamknięte – zobacz inne propozycje w okolicy.`,
            "/app",
          ),
        };
      }
      return next;
    }
    case "reject": {
      const req = s.requests.find((r) => r.id === a.requestId);
      const m = req && s.meetings.find((x) => x.id === req.meetingId);
      if (!req || !m) return s;
      return {
        ...s,
        requests: s.requests.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r)),
        notifications: notify(
          s,
          req.userId,
          "request_rejected",
          "Zgłoszenie odrzucone",
          `Organizator „${m.title}” wybrał inną opcję. Nie przejmuj się – w okolicy są kolejne propozycje.`,
          "/app/meetings/historia",
        ),
      };
    }
    case "cancel_meeting": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!m || !me) return s;
      let next: State = {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === m.id ? { ...x, status: "cancelled", cancelReason: a.reason, endedAt: s.now } : x,
        ),
        requests: s.requests.map((r) =>
          r.meetingId === m.id && r.status === "pending" ? { ...r, status: "closed" } : r,
        ),
      };
      const affected = new Set<string>();
      const other = otherPartyId(m, me);
      if (other) affected.add(other);
      s.requests
        .filter((r) => r.meetingId === m.id && r.status === "pending")
        .forEach((r) => affected.add(r.userId));
      affected.delete(me);
      for (const uidv of affected) {
        next = {
          ...next,
          notifications: notify(
            next,
            uidv,
            "cancelled",
            "Spotkanie anulowane",
            `„${m.title}” zostało anulowane. ${a.reason}.`,
            "/app/meetings/historia",
          ),
        };
      }
      return next;
    }
    case "match_seen":
      return {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === a.meetingId && me && !x.matchSeenBy.includes(me)
            ? { ...x, matchSeenBy: [...x.matchSeenBy, me] }
            : x,
        ),
      };
    case "send_message": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!me || !m || m.status !== "matched") return s;
      const msg: Message = {
        id: a.id,
        meetingId: m.id,
        fromId: me,
        text: a.text,
        at: s.now,
        failed: s.offline,
      };
      const other = otherPartyId(m, me);
      return {
        ...s,
        messages: [...s.messages, msg],
        notifications:
          s.offline || !other
            ? s.notifications
            : notify(
                s,
                other,
                "message",
                `Nowa wiadomość od: ${userName(s, me)}`,
                `„${a.text.slice(0, 60)}${a.text.length > 60 ? "…" : ""}”`,
                `/app/chat/${m.id}`,
              ),
      };
    }
    case "retry_message": {
      const msg = s.messages.find((x) => x.id === a.messageId);
      const m = msg && s.meetings.find((x) => x.id === msg.meetingId);
      if (!msg || !m || s.offline || m.status !== "matched" || !me) return s;
      const other = otherPartyId(m, me);
      return {
        ...s,
        messages: s.messages.map((x) => (x.id === msg.id ? { ...x, failed: false, at: s.now } : x)),
        notifications: other
          ? notify(
              s,
              other,
              "message",
              `Nowa wiadomość od: ${userName(s, me)}`,
              `„${msg.text.slice(0, 60)}”`,
              `/app/chat/${m.id}`,
            )
          : s.notifications,
      };
    }
    case "start_meeting":
      return {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === a.meetingId && x.status === "matched"
            ? { ...x, status: "in_progress", startedAt: s.now }
            : x,
        ),
      };
    case "finish_meeting":
      return {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === a.meetingId && (x.status === "in_progress" || x.status === "matched")
            ? { ...x, status: "finished", endedAt: s.now, startedAt: x.startedAt ?? s.now }
            : x,
        ),
      };
    case "arrival_issue": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!m || !me) return s;
      const other = otherPartyId(m, me);
      const next: State = {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === m.id
            ? {
                ...x,
                arrivalIssues: { ...x.arrivalIssues, [me]: a.issue },
                delays: { ...x.delays, [me]: (x.delays[me] ?? 0) + a.delay },
              }
            : x,
        ),
      };
      return other
        ? {
            ...next,
            notifications: notify(
              next,
              other,
              "arrival_issue",
              "Problem z dotarciem",
              `${userName(s, me)}: ${a.issue.toLowerCase()}. Druga osoba prawdopodobnie się spóźni.`,
              `/app/map/${m.id}`,
            ),
          }
        : next;
    }
    case "simulate_delay": {
      const m = s.meetings.find((x) => x.id === a.meetingId);
      if (!m) return s;
      const next: State = {
        ...s,
        meetings: s.meetings.map((x) =>
          x.id === m.id
            ? { ...x, delays: { ...x.delays, [a.userId]: (x.delays[a.userId] ?? 0) + a.minutes } }
            : x,
        ),
      };
      const other = otherPartyId(m, a.userId);
      return other
        ? {
            ...next,
            notifications: notify(
              next,
              other,
              "late",
              "Możliwe spóźnienie",
              `Szacowany czas przybycia osoby ${userName(s, a.userId)} wydłużył się (symulacja demonstracyjna).`,
              `/app/map/${m.id}`,
            ),
          }
        : next;
    }
    case "report": {
      if (!me) return s;
      const rep: Report = {
        id: a.id,
        kind: a.kind,
        meetingId: a.meetingId,
        reporterId: me,
        targetId: a.targetId,
        reason: a.reason,
        at: s.now,
        status: "under_review",
      };
      let next: State = { ...s, reports: [...s.reports, rep] };
      const m = a.meetingId ? s.meetings.find((x) => x.id === a.meetingId) : undefined;
      if (a.kind === "no_show" && m) {
        next = {
          ...next,
          meetings: next.meetings.map((x) =>
            x.id === m.id && (x.status === "matched" || x.status === "in_progress")
              ? { ...x, status: "not_realized", endedAt: s.now }
              : x,
          ),
        };
      }
      const label =
        a.kind === "no_show"
          ? "Zgłoszenie nieobecności"
          : a.kind === "abuse"
            ? "Zgłoszenie nadużycia"
            : "Zgłoszenie";
      return {
        ...next,
        notifications: notify(
          next,
          me,
          "report",
          "Zgłoszenie przyjęte",
          `${label}${m ? ` dla „${m.title}”` : ""} wymaga weryfikacji. Nie naliczono żadnych automatycznych konsekwencji.`,
          m
            ? a.kind === "no_show"
              ? `/app/finished/${m.id}`
              : `/app/meeting/${m.id}`
            : "/app/notifications",
        ),
      };
    }
    case "block": {
      if (!me) return s;
      let next: State = {
        ...s,
        blocked: { ...s.blocked, [me]: [...new Set([...(s.blocked[me] ?? []), a.targetId])] },
      };
      const shared = s.meetings.filter(
        (m) =>
          (m.status === "matched" || m.status === "active") &&
          ((m.organizerId === me && m.participantId === a.targetId) ||
            (m.organizerId === a.targetId && m.participantId === me)),
      );
      next = {
        ...next,
        meetings: next.meetings.map((m) =>
          shared.some((x) => x.id === m.id)
            ? {
                ...m,
                status: "cancelled",
                cancelReason: "Spotkanie przerwane – użytkownik zablokowany",
                endedAt: s.now,
              }
            : m,
        ),
        requests: next.requests.map((r) => {
          const m = s.meetings.find((x) => x.id === r.meetingId);
          return r.status === "pending" &&
            m &&
            ((m.organizerId === me && r.userId === a.targetId) ||
              (m.organizerId === a.targetId && r.userId === me))
            ? { ...r, status: "cancelled" }
            : r;
        }),
      };
      for (const m of shared) {
        next = {
          ...next,
          notifications: notify(
            next,
            a.targetId,
            "cancelled",
            "Spotkanie anulowane",
            `„${m.title}” zostało anulowane przez drugą osobę.`,
            "/app/meetings/historia",
          ),
        };
      }
      return next;
    }
    case "read_notification":
      return {
        ...s,
        notifications: s.notifications.map((n) => (n.id === a.id ? { ...n, read: true } : n)),
      };
    case "read_all":
      return {
        ...s,
        notifications: s.notifications.map((n) => (n.userId === me ? { ...n, read: true } : n)),
      };
  }
}

interface Ctx {
  state: State;
  dispatch: (a: Action) => void;
}

const StoreContext = createContext<Ctx | null>(null);

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    /* uszkodzony zapis – start od nowa */
  }
  return initialState();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* brak miejsca */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}

/* ---------- Selektory ---------- */

export const venueById = (id: string): Venue => VENUES.find((v) => v.id === id) ?? VENUES[0];
/** Miejsce spotkania: własna lokalizacja z mapy albo lokal z katalogu. */
export const venueOf = (m: Pick<Meeting, "venueId" | "customVenue">): Venue =>
  m.customVenue ?? venueById(m.venueId);
export const findUser = (s: State, id?: string | null) => s.users.find((u) => u.id === id);

export function useMe(): User | undefined {
  const { state } = useStore();
  return findUser(state, state.currentUserId);
}

export const commonInterests = (a?: User, b?: User) =>
  a && b ? a.interests.filter((i) => b.interests.includes(i)) : [];

export function filtersFor(s: State, me: User): Filters {
  return s.filters[me.id] ?? defaultFilters(me.location.city);
}

export function distanceTo(me: User, venue: Venue): number | null {
  if (me.location.city !== venue.city) return null;
  return straightDistance(me.location, venue);
}

export interface DeckResult {
  deck: Meeting[];
  /** wszystkie aktywne w promieniu, bez filtrów kategorii/zainteresowań */
  inRadius: number;
  totalActiveInCity: number;
}

export function buildDeck(s: State, me: User, f: Filters): DeckResult {
  const blocked = new Set([
    ...(s.blocked[me.id] ?? []),
    ...Object.entries(s.blocked)
      .filter(([, l]) => l.includes(me.id))
      .map(([k]) => k),
  ]);
  const dismissed = new Set(s.dismissed[me.id] ?? []);
  const restored = s.restored?.[me.id] ?? [];
  const requested = new Set(s.requests.filter((r) => r.userId === me.id).map((r) => r.meetingId));
  const base = s.meetings.filter((m) => {
    const v = venueOf(m);
    return (
      m.status === "active" &&
      v.city === me.location.city &&
      m.organizerId !== me.id &&
      !blocked.has(m.organizerId)
    );
  });
  const withinRadius = base.filter((m) => {
    const d = distanceTo(me, venueOf(m));
    return d !== null && d <= f.radiusKm * 1000;
  });
  const deck = withinRadius
    .filter((m) => !dismissed.has(m.id) && !requested.has(m.id))
    .filter((m) => !f.categories.length || f.categories.includes(activityById(m.activity).category))
    .filter((m) => {
      if (!f.interests.length) return true;
      const org = findUser(s, m.organizerId);
      return !!org && f.interests.some((i) => org.interests.includes(i));
    })
    .filter((m) => {
      if (!f.maxEta) return true;
      const eta = computeEta(me, venueOf(m));
      return eta.available ? eta.safeMin <= f.maxEta : true;
    })
    .sort((a, b) => {
      // przywrócone z „Pominiętych” wracają na górę talii
      const ra = restored.indexOf(a.id);
      const rb = restored.indexOf(b.id);
      if (ra !== rb) return (ra === -1 ? Infinity : ra) - (rb === -1 ? Infinity : rb);
      return b.createdAt - a.createdAt;
    });
  return { deck, inRadius: withinRadius.length, totalActiveInCity: base.length };
}

/** Pominięte spotkania, które wciąż można przywrócić (aktywne), od ostatnio pominiętego. */
export function dismissedMeetings(s: State, me: User): Meeting[] {
  const blocked = new Set(s.blocked[me.id] ?? []);
  return [...(s.dismissed[me.id] ?? [])]
    .reverse()
    .map((id) => s.meetings.find((m) => m.id === id))
    .filter(
      (m): m is Meeting =>
        !!m && m.status === "active" && m.organizerId !== me.id && !blocked.has(m.organizerId),
    );
}

/** Sugerowany promień: rekomendacja dla wielkości miasta, powiększana gdy w okolicy jest mało propozycji. */
export function suggestRadius(s: State, me: User): number {
  const c = cityByName(me.location.city);
  const active = s.meetings.filter(
    (m) => m.status === "active" && m.organizerId !== me.id && venueOf(m).city === me.location.city,
  );
  for (let r = c.recommended; r <= c.max; r++) {
    if (active.filter((m) => (distanceTo(me, venueOf(m)) ?? Infinity) <= r * 1000).length >= 3)
      return r;
  }
  return c.recommended;
}

export function myConfirmed(s: State, meId: string) {
  return s.meetings.filter(
    (m) =>
      (m.status === "matched" || m.status === "in_progress") &&
      (m.organizerId === meId || m.participantId === meId),
  );
}

export function isBusy(s: State, userId: string) {
  return myConfirmed(s, userId).length > 0;
}
