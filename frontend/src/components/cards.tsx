import {
  Bike,
  Check,
  ChevronRight,
  Footprints,
  LocateFixed,
  MapPin,
  Sparkles,
  TramFront,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useState, type ReactNode } from "react";
import { activityById } from "../data/catalog";
import type { Meeting, User, Venue } from "../data/types";
import { computeEta, fmtDistance, TRAVEL_LABEL } from "../lib/eta";
import { age } from "../lib/time";
import { commonInterests, distanceTo, findUser, useStore, venueOf } from "../store";
import { MapView } from "./MapView";
import {
  ActivityChip,
  ActivityIcon,
  Avatar,
  Button,
  Chip,
  cx,
  DemoBadge,
  MeetingStatusPill,
  Notice,
  photoUrl,
  PromotedBadge,
  Sheet,
} from "./ui";

export function VenueCard({
  venue,
  me,
  selected,
  onSelect,
  activity,
  mapOnDemand,
}: {
  venue: Venue;
  me?: User;
  selected?: boolean;
  onSelect?: () => void;
  activity?: Meeting["activity"];
  /** Zamiast mini-mapy: przycisk lokalizacji otwierający mapę z trasą. */
  mapOnDemand?: boolean;
}) {
  const d = me ? distanceTo(me, venue) : null;
  const [mapOpen, setMapOpen] = useState(false);
  return (
    <article
      className={cx(
        "overflow-hidden rounded-3xl bg-white ring-1 transition",
        selected ? "ring-2 ring-brand-600 shadow-card" : "ring-ink-200 hover:ring-ink-300",
      )}
    >
      <div className="flex gap-3 p-3">
        <img
          src={photoUrl(venue.photo, 300, 300)}
          alt=""
          className="size-24 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {venue.promoted && <PromotedBadge />}
            <span className="text-xs font-bold text-ink-600">{venue.typeLabel}</span>
          </div>
          <h4 className="mt-1 truncate font-display text-[1.0625rem] font-bold">{venue.name}</h4>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[0.8125rem] text-ink-600">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {venue.address}
            {d !== null && <span className="font-bold text-ink-900">· {fmtDistance(d)}</span>}
          </p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-ink-700">
            {venue.description}
          </p>
        </div>
      </div>
      <div className="flex items-stretch gap-3 px-3 pb-3">
        {mapOnDemand ? (
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            aria-haspopup="dialog"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-ink-900 ring-1 ring-ink-200 transition hover:bg-ink-100 hover:ring-ink-300"
          >
            <LocateFixed className="size-5 text-brand-600" aria-hidden />
            Mapa i trasa
          </button>
        ) : (
          <MapView
            mini
            venue={venue}
            me={me?.location.mode === "gps" ? me.location : null}
            activity={activity}
            className="h-20 flex-1 rounded-2xl"
          />
        )}
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={!!selected}
            className={cx(
              "flex min-w-28 items-center justify-center gap-1.5 rounded-2xl px-4 text-sm font-extrabold transition",
              selected ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-950 hover:bg-ink-200",
            )}
          >
            {selected ? (
              <>
                <Check className="size-4" strokeWidth={3} aria-hidden /> Wybrane
              </>
            ) : (
              "Wybierz"
            )}
          </button>
        )}
      </div>
      {mapOnDemand && (
        <VenueMapSheet
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          venue={venue}
          me={me}
          activity={activity}
          selected={selected}
          onSelect={onSelect}
        />
      )}
    </article>
  );
}

const MODE_ICON = { walk: Footprints, transit: TramFront, bike: Bike };

/** Mapa miejsca z własną pozycją i trasą – otwierana na żądanie (np. w kreatorze). */
function VenueMapSheet({
  open,
  onClose,
  venue,
  me,
  activity,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  venue: Venue;
  me?: User;
  activity?: Meeting["activity"];
  selected?: boolean;
  onSelect?: () => void;
}) {
  const gps = me?.location.mode === "gps" ? me.location : null;
  const eta = computeEta(me, venue);
  const ModeIcon = eta.available ? MODE_ICON[eta.mode] : Footprints;
  // Portal: karta może leżeć w animowanym (transform) kontenerze, co psułoby position: fixed.
  return createPortal(
    <Sheet
      open={open}
      onClose={onClose}
      title={venue.name}
      wide
      footer={
        onSelect && (
          <Button
            size="lg"
            block
            variant={selected ? "secondary" : "primary"}
            icon={selected ? <Check className="size-5" strokeWidth={3} /> : undefined}
            onClick={() => {
              if (!selected) onSelect();
              onClose();
            }}
          >
            {selected ? "Wybrane – wróć do listy" : "Wybierz to miejsce"}
          </Button>
        )
      }
    >
      <p className="-mt-1 flex items-center gap-1 text-[0.8125rem] text-ink-600">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        {venue.address}
      </p>
      <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-ink-200">
        <MapView
          me={gps}
          venue={venue}
          activity={activity}
          showRoute
          className="h-[min(22rem,48dvh)]"
        />
        <DemoBadge className="pointer-events-none absolute bottom-3 left-3">
          Mapa poglądowa · pozycja symulowana
        </DemoBadge>
      </div>

      {eta.available ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-paper p-3">
            <p className="text-xs font-bold text-ink-600">Dystans trasy</p>
            <p className="mt-0.5 font-display text-xl font-extrabold">{fmtDistance(eta.routeM)}</p>
          </div>
          <div className="rounded-2xl bg-paper p-3">
            <p className="text-xs font-bold text-ink-600">Czas dotarcia</p>
            <p className="mt-0.5 font-display text-xl font-extrabold">ok. {eta.safeMin} min</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-ink-600">
              <ModeIcon className="size-3.5 shrink-0" aria-hidden />
              {TRAVEL_LABEL[eta.mode]} · z zapasem
            </p>
          </div>
        </div>
      ) : (
        <Notice tone="warn" className="mt-4" title="Trasa niedostępna">
          {eta.reason}. Na mapie widać tylko lokalizację miejsca.
        </Notice>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] font-semibold text-ink-700">
        {gps && (
          <li className="flex items-center gap-2">
            <span
              className="size-3 rounded-full bg-blue-600 ring-2 ring-white shadow"
              aria-hidden
            />
            Twoja lokalizacja
          </li>
        )}
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-brand-600" aria-hidden />
          {venue.name}
        </li>
        {eta.available && (
          <li className="flex items-center gap-2">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-brand-600" aria-hidden />
            Proponowana trasa
          </li>
        )}
      </ul>
    </Sheet>,
    document.body,
  );
}

export function PersonCard({
  user,
  me,
  actions,
  onViewProfile,
  status,
  muted,
}: {
  user: User;
  me?: User;
  actions?: ReactNode;
  onViewProfile?: () => void;
  status?: ReactNode;
  muted?: boolean;
}) {
  const common = commonInterests(me, user);
  return (
    <article className={cx("rounded-3xl bg-white p-4 ring-1 ring-ink-200", muted && "opacity-70")}>
      <div className="flex gap-3.5">
        <Avatar src={user.photo} alt={`Zdjęcie: ${user.name}`} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-lg font-bold">
              {user.name}
              {user.showAge && (
                <span className="font-semibold text-ink-600">, {age(user.birthYear)}</span>
              )}
            </h4>
            {status}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[0.8125rem] font-semibold text-ink-600">
            {user.styles.join(" · ")}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-800">{user.bio}</p>
        </div>
      </div>
      {common.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs font-extrabold text-brand-700">
            <Sparkles className="size-3.5" aria-hidden /> Wspólne:
          </span>
          {common.map((i) => (
            <Chip key={i} size="sm" tone="common">
              {i}
            </Chip>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {user.interests
          .filter((i) => !common.includes(i))
          .map((i) => (
            <Chip key={i} size="sm">
              {i}
            </Chip>
          ))}
      </div>
      {(actions || onViewProfile) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onViewProfile && (
            <button
              type="button"
              onClick={onViewProfile}
              className="min-h-11 rounded-full px-3 text-sm font-bold text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900"
            >
              Zobacz profil
            </button>
          )}
          <div className="ml-auto flex gap-2">{actions}</div>
        </div>
      )}
    </article>
  );
}

export function MeetingRow({
  meeting,
  me,
  onClick,
  status,
  footer,
  meta,
}: {
  meeting: Meeting;
  me?: User;
  onClick?: () => void;
  status?: ReactNode;
  footer?: ReactNode;
  meta?: ReactNode;
}) {
  const { state } = useStore();
  const venue = venueOf(meeting);
  const act = activityById(meeting.activity);
  const other =
    me &&
    (meeting.organizerId === me.id
      ? findUser(state, meeting.participantId)
      : findUser(state, meeting.organizerId));
  const d = me ? distanceTo(me, venue) : null;
  const Body = (
    <div className="flex gap-3.5">
      <div className="relative shrink-0">
        <img
          src={photoUrl(act.photo, 240, 240)}
          alt=""
          className="size-[4.75rem] rounded-2xl object-cover"
        />
        <span className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-full bg-white text-ink-950 shadow ring-1 ring-ink-200">
          <ActivityIcon id={meeting.activity} className="size-4" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 font-display text-[1.0625rem] font-bold leading-tight">
            {meeting.title}
          </h4>
          {onClick && <ChevronRight className="mt-0.5 size-5 shrink-0 text-ink-500" aria-hidden />}
        </div>
        <p className="mt-1 truncate text-[0.8125rem] text-ink-600">
          {venue.name}
          {d !== null && ` · ${fmtDistance(d)}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {status ?? <MeetingStatusPill status={meeting.status} />}
          {other && (
            <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-800">
              <Avatar src={other.photo} alt="" size={22} /> {other.name}
            </span>
          )}
          {meta}
        </div>
      </div>
    </div>
  );
  return (
    <article className="rounded-3xl bg-white p-3.5 ring-1 ring-ink-200 transition hover:ring-ink-300">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="w-full text-left"
          aria-label={`${meeting.title} – otwórz`}
        >
          {Body}
        </button>
      ) : (
        Body
      )}
      {footer && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">{footer}</div>
      )}
    </article>
  );
}

export { ActivityChip };
