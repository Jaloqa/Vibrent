export type CategoryId = "jedzenie" | "aktywnosc" | "rozrywka" | "ludzie" | "zainteresowania";

export type VenueType =
  | "kawiarnia"
  | "pub"
  | "restauracja"
  | "bar"
  | "fastfood"
  | "silownia"
  | "park"
  | "bulwar"
  | "blonia"
  | "kino"
  | "bilard"
  | "kregle"
  | "gaming"
  | "klub"
  | "ksiegarnia"
  | "muzyka"
  | "sztuka"
  | "rower"
  | "punkt";

export type ActivityId =
  | "kawa"
  | "pub"
  | "restauracja"
  | "drink"
  | "fastfood"
  | "silownia"
  | "bieganie"
  | "spacer"
  | "rower"
  | "inna-aktywnosc"
  | "kino"
  | "bilard"
  | "kregle"
  | "gaming"
  | "impreza"
  | "rozmowa"
  | "znajomi"
  | "miasto"
  | "wspolny-czas"
  | "fotografia"
  | "muzyka"
  | "ksiazki"
  | "sztuka"
  | "hobby";

export type TravelMode = "walk" | "transit" | "bike";

export interface UserLocation {
  /** gps = bieżąca pozycja (symulowana); manual = brak bieżącej pozycji (np. cofnięta zgoda
   *  albo dane sprzed wymogu lokalizacji) – wtedy aplikacja prosi o jej udostępnienie. */
  mode: "gps" | "manual";
  city: string;
  district: string;
  x: number;
  y: number;
  /** kiedy pozycja została ostatnio pobrana (ms) */
  updatedAt?: number;
}

export interface User {
  id: string;
  name: string;
  birthYear: number;
  showAge: boolean;
  photo: string;
  bio: string;
  styles: string[];
  interests: string[];
  hobbies: string[];
  favActivities: ActivityId[];
  location: UserLocation;
  travelMode: TravelMode;
  email?: string;
}

export interface Venue {
  id: string;
  name: string;
  typeLabel: string;
  types: VenueType[];
  address: string;
  city: string;
  x: number;
  y: number;
  photo: string;
  description: string;
  promoted?: boolean;
}

export type MeetingStatus =
  | "active"
  | "matched"
  | "in_progress"
  | "finished"
  | "cancelled"
  | "not_realized";

export interface Meeting {
  id: string;
  organizerId: string;
  participantId?: string;
  activity: ActivityId;
  title: string;
  description: string;
  extra?: string;
  venueId: string;
  /** Dowolna lokalizacja wskazana na mapie przez organizatora (wtedy venueId = "custom"). */
  customVenue?: Venue;
  createdAt: number;
  status: MeetingStatus;
  matchedAt?: number;
  startedAt?: number;
  endedAt?: number;
  cancelReason?: string;
  /** kto już zobaczył ekran dopasowania */
  matchSeenBy: string[];
  /** symulowane opóźnienie w minutach per użytkownik (zgłoszony problem / demo) */
  delays: Record<string, number>;
  arrivalIssues: Record<string, string>;
}

export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "closed";

export interface JoinRequest {
  id: string;
  meetingId: string;
  userId: string;
  status: RequestStatus;
  createdAt: number;
}

export interface Message {
  id: string;
  meetingId: string;
  fromId: string;
  text: string;
  at: number;
  failed?: boolean;
}

export type NotificationType =
  | "request_new"
  | "request_accepted"
  | "request_rejected"
  | "match"
  | "message"
  | "late"
  | "cancelled"
  | "arrival_issue"
  | "report";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  at: number;
  read: boolean;
  link: string;
}

export type ReportKind = "no_show" | "abuse" | "meeting" | "user";

export interface Report {
  id: string;
  kind: ReportKind;
  meetingId?: string;
  reporterId: string;
  targetId?: string;
  reason: string;
  at: number;
  status: "under_review";
}

export interface Filters {
  categories: CategoryId[];
  interests: string[];
  radiusKm: number;
  /** maks. czas dojścia w minutach, 0 = dowolny */
  maxEta: number;
}
