import {
  Bell,
  Compass,
  LocateFixed,
  MapPinned,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  X,
  CalendarCheck2,
  Hourglass,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, INTERESTS, cityByName } from "../data/catalog";
import type { Filters } from "../data/types";
import { DismissedPanel, DismissedSheet } from "../components/Dismissed";
import { LocationSheet, RefreshLocationButton } from "../components/Location";
import { SwipeDeck } from "../components/SwipeDeck";
import { useUnread } from "../components/Shell";
import {
  Avatar,
  Button,
  Chip,
  cx,
  EmptyState,
  IconButton,
  Logo,
  Notice,
  SectionLabel,
  Sheet,
  Skeleton,
  useToast,
} from "../components/ui";
import { computeEta, fmtDistance } from "../lib/eta";
import { navigate } from "../lib/router";
import { clock } from "../lib/time";
import {
  buildDeck,
  defaultFilters,
  dismissedMeetings,
  distanceTo,
  filtersFor,
  findUser,
  myConfirmed,
  otherPartyId,
  suggestRadius,
  uid,
  useMe,
  useStore,
  venueOf,
} from "../store";

export function Discover() {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const unread = useUnread();
  const filters = filtersFor(state, me);
  const { deck, inRadius } = useMemo(() => buildDeck(state, me, filters), [state, me, filters]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const confirmed = myConfirmed(state, me.id)[0];
  const pendingCount = state.requests.filter(
    (r) => r.userId === me.id && r.status === "pending",
  ).length;
  const activeFilterCount =
    filters.categories.length + filters.interests.length + (filters.maxEta ? 1 : 0);
  const dismissedList = useMemo(() => dismissedMeetings(state, me), [state, me]);
  const dismissedCount = dismissedList.length;
  const [dismissedOpen, setDismissedOpen] = useState(false);
  const city = cityByName(me.location.city);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const setFilters = (f: Filters) => dispatch({ type: "set_filters", filters: f });

  const header = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between lg:hidden">
        <Logo compact />
        <div className="flex items-center gap-1">
          <IconButton
            label={`Filtry${activeFilterCount ? ` (${activeFilterCount} aktywne)` : ""}`}
            onClick={() => setFiltersOpen(true)}
            badge={activeFilterCount}
          >
            <SlidersHorizontal className="size-[1.375rem]" />
          </IconButton>
          <IconButton
            label={`Powiadomienia${unread ? `, ${unread} nieprzeczytane` : ""}`}
            onClick={() => navigate("/app/notifications")}
            badge={unread}
          >
            <Bell className="size-[1.375rem]" />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setLocOpen(true)}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-bold ring-1 ring-ink-200 hover:ring-ink-300"
          aria-label={`Lokalizacja: ${me.location.city}, ${me.location.district}. Szczegóły`}
        >
          <LocateFixed className="size-4 text-brand-600" aria-hidden />
          {me.location.city}
          <span className="font-semibold text-ink-600">{me.location.district}</span>
        </button>
        <RefreshLocationButton className="-ml-1" />
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-bold ring-1 ring-ink-200 hover:ring-ink-300"
        >
          <MapPinned className="size-4 text-ink-700" aria-hidden />
          Promień {String(filters.radiusKm).replace(".", ",")} km
        </button>
        {dismissedCount > 0 && (
          <button
            type="button"
            onClick={() => setDismissedOpen(true)}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-bold ring-1 ring-ink-200 hover:ring-ink-300 lg:hidden"
            aria-label={`Pominięte spotkania: ${dismissedCount}. Przejrzyj i przywróć`}
          >
            <Undo2 className="size-4 text-brand-600" aria-hidden />
            Pominięte
            <span className="rounded-full bg-ink-950 px-1.5 text-xs leading-5 text-white">
              {dismissedCount}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-bold ring-1 ring-ink-200 hover:ring-ink-300 lg:flex"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtry{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
      </div>
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.categories.map((c) => (
            <ActiveChip
              key={c}
              label={CATEGORIES.find((x) => x.id === c)!.label}
              onRemove={() =>
                setFilters({ ...filters, categories: filters.categories.filter((x) => x !== c) })
              }
            />
          ))}
          {filters.interests.map((i) => (
            <ActiveChip
              key={i}
              label={i}
              onRemove={() =>
                setFilters({ ...filters, interests: filters.interests.filter((x) => x !== i) })
              }
            />
          ))}
          {filters.maxEta > 0 && (
            <ActiveChip
              label={`Dotrę w ${filters.maxEta} min`}
              onRemove={() => setFilters({ ...filters, maxEta: 0 })}
            />
          )}
          <button
            type="button"
            onClick={() =>
              setFilters({ ...defaultFilters(me.location.city), radiusKm: filters.radiusKm })
            }
            className="min-h-9 px-2 text-[0.8125rem] font-bold text-brand-700 underline underline-offset-2"
          >
            Wyczyść filtry
          </button>
        </div>
      )}
      <p className="text-sm text-ink-600" aria-live="polite">
        <span className="font-extrabold text-ink-950">{deck.length}</span>{" "}
        {plural(deck.length, "propozycja", "propozycje", "propozycji")} w promieniu{" "}
        {String(filters.radiusKm).replace(".", ",")} km
      </p>
    </div>
  );

  let body;
  if (loading) {
    body = (
      <div className="flex h-full flex-col">
        <Skeleton className="min-h-0 flex-1 rounded-[1.875rem]" />
        <div className="flex justify-center gap-5 pt-5">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-16 w-52 rounded-full" />
        </div>
      </div>
    );
  } else if (deck.length) {
    body = (
      <SwipeDeck
        meetings={deck}
        me={me}
        onOpen={(m) => navigate(`/app/meeting/${m.id}`)}
        canSwipe={(dir) => {
          if (dir === "right" && state.offline) {
            toast("Brak internetu – zgłoszenie nie zostało wysłane", {
              tone: "error",
              sub: "Spróbuj ponownie po odzyskaniu połączenia.",
            });
            return false;
          }
          return true;
        }}
        onSwipe={(dir, m) => {
          if (dir === "right") {
            dispatch({ type: "send_request", meetingId: m.id, id: uid("r") });
            toast("Zgłoszenie wysłane. Czekamy na decyzję organizatora.", {
              tone: "success",
              sub: "Status znajdziesz w zakładce Spotkania → Oczekujące.",
            });
          } else {
            dispatch({ type: "dismiss", meetingId: m.id });
            toast("Pominięto spotkanie", {
              sub: m.title,
              action: {
                label: "Cofnij",
                onClick: () => dispatch({ type: "restore_one", meetingId: m.id }),
              },
            });
          }
        }}
      />
    );
  } else if (inRadius === 0) {
    body = (
      <EmptyState
        icon={<Compass className="size-9" />}
        title="Brak spotkań w okolicy"
        actions={
          <>
            <Button
              block
              icon={<Plus className="size-5" />}
              onClick={() => navigate("/app/create")}
            >
              Utwórz własne spotkanie
            </Button>
            {filters.radiusKm < city.max && (
              <Button
                block
                variant="secondary"
                onClick={() => setFilters({ ...filters, radiusKm: city.max })}
              >
                Zwiększ promień do {city.max} km
              </Button>
            )}
            <Button
              block
              variant="ghost"
              icon={<RefreshCw className="size-4" />}
              onClick={() => setLocOpen(true)}
            >
              Odśwież lokalizację
            </Button>
          </>
        }
      >
        W promieniu {filters.radiusKm} km nikt teraz nie szuka towarzystwa
        {me.location.city !== "Kraków" && ` w miejscowości ${me.location.city}`}. Bądź pierwszą
        osobą – załóż spotkanie, a pokażemy je osobom w pobliżu.
      </EmptyState>
    );
  } else if (activeFilterCount > 0) {
    body = (
      <EmptyState
        icon={<SlidersHorizontal className="size-9" />}
        title="Brak wyników dla tych filtrów"
        actions={
          <>
            <Button
              block
              onClick={() =>
                setFilters({ ...defaultFilters(me.location.city), radiusKm: filters.radiusKm })
              }
              icon={<RotateCcw className="size-5" />}
            >
              Wyczyść filtry
            </Button>
            <Button block variant="secondary" onClick={() => navigate("/app/create")}>
              Utwórz własne spotkanie
            </Button>
          </>
        }
      >
        W okolicy {plural(inRadius, "jest", "są", "jest")} {inRadius}{" "}
        {plural(inRadius, "propozycja", "propozycje", "propozycji")}, ale żadna nie pasuje do
        wybranych filtrów.
      </EmptyState>
    );
  } else {
    body = (
      <EmptyState
        icon={<Sparkles className="size-9" />}
        title="To już wszystkie propozycje"
        actions={
          <>
            <Button
              block
              icon={<Plus className="size-5" />}
              onClick={() => navigate("/app/create")}
            >
              Utwórz własne spotkanie
            </Button>
            {dismissedCount > 0 && (
              <Button
                block
                variant="secondary"
                icon={<RotateCcw className="size-5" />}
                onClick={() => dispatch({ type: "restore_dismissed" })}
              >
                Pokaż pominięte ({dismissedCount})
              </Button>
            )}
          </>
        }
      >
        Wszystko w promieniu {filters.radiusKm} km już przejrzane. Nowe spotkania pojawiają się na
        bieżąco – albo załóż własne.
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 pt-3 lg:px-8 lg:pt-8">
      <section
        className="flex w-full flex-col lg:max-w-[26rem] xl:max-w-[28.75rem]"
        aria-labelledby="discover-title"
      >
        <h1 id="discover-title" className="sr-only">
          Odkrywaj spotkania w okolicy
        </h1>
        <div className="mb-3 hidden items-end justify-between lg:flex">
          <div>
            <p className="text-sm font-bold text-brand-700">Teraz w okolicy</p>
            <h2 className="text-3xl font-extrabold">Kto chce się spotkać?</h2>
          </div>
        </div>
        {header}
        {confirmed && <ConfirmedBanner meetingId={confirmed.id} className="mt-3 lg:hidden" />}
        <div className="mt-4 h-[clamp(440px,calc(100dvh-330px),620px)] md:h-[38.75rem] lg:h-[clamp(32rem,calc(100dvh-15rem),40rem)]">
          {body}
        </div>
        <p className="mt-3 hidden text-center text-xs text-ink-600 md:block">
          Przesuń kartę lub użyj strzałek ← → na klawiaturze. Enter otwiera szczegóły.
        </p>
      </section>

      {/* Desktop: panel boczny */}
      <aside
        className="hidden flex-1 flex-col gap-4 pt-[4.75rem] lg:flex"
        aria-label="Podsumowanie okolicy"
      >
        <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-200">
          <SectionLabel>W Twojej okolicy</SectionLabel>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Miasto" value={me.location.city} />
            <Stat label="Promień" value={`${filters.radiusKm} km`} />
            <Stat label="Propozycje" value={String(deck.length)} />
          </dl>
          <p className="mt-3 text-[0.8125rem] text-ink-600">
            Sugerowany promień dla{" "}
            {city.size === "duze" ? "dużego miasta" : "mniejszej miejscowości"}:{" "}
            {suggestRadius(state, me)} km (zakres {city.min}–{city.max} km).
          </p>
        </div>
        {confirmed && <ConfirmedBanner meetingId={confirmed.id} />}
        <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-200">
          <SectionLabel>Twoja aktywność</SectionLabel>
          <button
            type="button"
            onClick={() => navigate("/app/meetings/oczekujace")}
            className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-2xl bg-paper px-4 text-left hover:bg-paper-2"
          >
            <Hourglass className="size-5 text-amber-700" aria-hidden />
            <span className="flex-1 text-sm font-bold">Oczekujące zgłoszenia</span>
            <span className="text-lg font-extrabold">{pendingCount}</span>
          </button>
        </div>
        <DismissedPanel items={dismissedList} me={me} onShowAll={() => setDismissedOpen(true)} />
      </aside>

      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
      <DismissedSheet
        open={dismissedOpen}
        onClose={() => setDismissedOpen(false)}
        items={dismissedList}
        me={me}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper p-3">
      <dt className="text-xs font-bold text-ink-600">{label}</dt>
      <dd className="mt-0.5 truncate font-display text-lg font-extrabold">{value}</dd>
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 items-center gap-1 rounded-full bg-ink-950 py-1 pl-3 pr-2 text-[0.8125rem] font-bold text-white"
      aria-label={`Usuń filtr: ${label}`}
    >
      {label} <X className="size-3.5" aria-hidden />
    </button>
  );
}

export function ConfirmedBanner({
  meetingId,
  className,
}: {
  meetingId: string;
  className?: string;
}) {
  const { state } = useStore();
  const me = useMe()!;
  const m = state.meetings.find((x) => x.id === meetingId)!;
  const other = findUser(state, otherPartyId(m, me.id));
  const venue = venueOf(m);
  const eta = computeEta(me, venue);
  return (
    <button
      type="button"
      onClick={() => navigate(`/app/map/${m.id}`)}
      className={cx(
        "flex w-full items-center gap-3 rounded-3xl bg-ink-950 p-3.5 text-left text-white shadow-card transition hover:bg-ink-900",
        className,
      )}
    >
      <span className="flex -space-x-3">
        <Avatar src={me.photo} alt="" size={40} className="ring-2 ring-ink-950" />
        {other && <Avatar src={other.photo} alt="" size={40} className="ring-2 ring-ink-950" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
          <CalendarCheck2 className="size-3.5" aria-hidden />{" "}
          {m.status === "in_progress" ? "Spotkanie w trakcie" : "Potwierdzone spotkanie"}
        </span>
        <span className="block truncate text-[0.9375rem] font-bold">
          {other?.name} · {venue.name}
        </span>
        <span className="block truncate text-xs text-white/75">
          {eta.available
            ? `Twoje ETA ok. ${eta.safeMin} min · od ${clock(m.matchedAt ?? 0)}`
            : "Czas przybycia niedostępny"}
        </span>
      </span>
      <span className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-ink-950">
        Mapa
      </span>
    </button>
  );
}

export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const d = n % 10;
  const t = n % 100;
  if (d >= 2 && d <= 4 && !(t >= 12 && t <= 14)) return few;
  return many;
}

function FiltersSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const current = filtersFor(state, me);
  const [draft, setDraft] = useState<Filters>(current);
  const city = cityByName(me.location.city);
  const suggested = suggestRadius(state, me);
  useEffect(() => {
    if (open) setDraft(filtersFor(state, me));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const count = useMemo(() => buildDeck(state, me, draft).deck.length, [state, me, draft]);
  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  const noGps = me.location.mode !== "gps";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtry spotkań"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setDraft({ ...defaultFilters(me.location.city) })}>
            Resetuj
          </Button>
          <Button
            block
            onClick={() => {
              dispatch({ type: "set_filters", filters: draft });
              onClose();
            }}
          >
            {count
              ? `Pokaż ${count} ${plural(count, "propozycję", "propozycje", "propozycji")}`
              : "Brak wyników – zastosuj mimo to"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-7 pt-2">
        <fieldset>
          <legend className="mb-3 text-base font-bold">Odległość</legend>
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink-200">
            <div className="flex items-baseline justify-between">
              <label htmlFor="radius" className="text-sm font-semibold text-ink-700">
                Promień wyszukiwania
              </label>
              <output htmlFor="radius" className="font-display text-2xl font-extrabold">
                {String(draft.radiusKm).replace(".", ",")} km
              </output>
            </div>
            <input
              id="radius"
              type="range"
              min={city.min}
              max={city.max}
              step={city.size === "duze" ? 0.5 : 1}
              value={draft.radiusKm}
              onChange={(e) => setDraft({ ...draft, radiusKm: Number(e.target.value) })}
              className="mt-3 h-11 w-full cursor-pointer accent-brand-600"
              aria-valuetext={`${draft.radiusKm} kilometrów`}
            />
            <div className="flex justify-between text-xs font-semibold text-ink-600">
              <span>{city.min} km</span>
              <span>{city.max} km</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-200 pt-3">
              <p className="text-[0.8125rem] text-ink-700">
                {city.size === "duze" ? "Duże miasto" : "Mniejsza miejscowość"} · sugerujemy{" "}
                <b>{suggested} km</b>
              </p>
              {draft.radiusKm !== suggested && (
                <button
                  type="button"
                  className="min-h-9 text-[0.8125rem] font-bold text-brand-700 underline underline-offset-2"
                  onClick={() => setDraft({ ...draft, radiusKm: suggested })}
                >
                  Użyj sugerowanego
                </button>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-base font-bold">Kategoria</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                selected={draft.categories.includes(c.id)}
                onClick={() => setDraft({ ...draft, categories: toggle(draft.categories, c.id) })}
                icon={<span className={cx("size-2.5 rounded-full", c.dot)} />}
              >
                {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-base font-bold">Dostępność w najbliższym czasie</legend>
          <p className="mb-3 text-[0.8125rem] text-ink-600">
            Pokaż spotkania, na które zdążysz dotrzeć w ciągu:
          </p>
          <div className="flex flex-wrap gap-2">
            {[0, 10, 20, 30].map((v) => (
              <Chip
                key={v}
                selected={draft.maxEta === v}
                onClick={() => setDraft({ ...draft, maxEta: v })}
              >
                {v === 0 ? "Dowolnie" : `do ${v} min`}
              </Chip>
            ))}
          </div>
          {noGps && draft.maxEta > 0 && (
            <Notice tone="warn" className="mt-3">
              Bez bieżącej lokalizacji nie obliczymy czasu dotarcia – ten filtr nie zawęzi wyników.
            </Notice>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-base font-bold">Zainteresowania organizatora</legend>
          <p className="mb-3 text-[0.8125rem] text-ink-600">
            Twoje zainteresowania oznaczyliśmy kropką.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <Chip
                key={i}
                selected={draft.interests.includes(i)}
                onClick={() => setDraft({ ...draft, interests: toggle(draft.interests, i) })}
              >
                {me.interests.includes(i) && (
                  <span
                    className="size-1.5 rounded-full bg-brand-500"
                    aria-label="Twoje zainteresowanie"
                  />
                )}
                {i}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
    </Sheet>
  );
}

export { fmtDistance, distanceTo };
