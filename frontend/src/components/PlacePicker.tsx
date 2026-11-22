import { Check, LocateFixed, MapPinned, MousePointerClick, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { activityById } from "../data/catalog";
import type { ActivityId, User, Venue } from "../data/types";
import { computeEta, fmtDistance, type Point } from "../lib/eta";
import { distanceTo } from "../store";
import { MAP_BOUNDS, MapView, nearestDistrict } from "./MapView";
import { Button, cx, DemoBadge, Field, Sheet, TextArea, TextInput } from "./ui";

export interface CustomPlace extends Point {
  name: string;
  hint: string;
}

export const CUSTOM_VENUE_ID = "custom";

const placeAddress = (p: Point, city: string) =>
  city === "Kraków"
    ? `Punkt na mapie · okolice: ${nearestDistrict(p)}`
    : `Punkt na mapie · ${city}`;

/** Zamienia wskazany punkt na „miejsce” zgodne z resztą aplikacji (karty, mapa, ETA). */
export function buildCustomVenue(place: CustomPlace, me: User, activity: ActivityId): Venue {
  return {
    id: CUSTOM_VENUE_ID,
    name: place.name.trim(),
    typeLabel: "Własne miejsce",
    types: [],
    address: placeAddress(place, me.location.city),
    city: me.location.city,
    x: place.x,
    y: place.y,
    photo: activityById(activity).photo,
    description: place.hint.trim() || "Miejsce wskazane przez organizatora na mapie.",
  };
}

const clampToMap = (p: Point): Point => ({
  x: Math.min(MAP_BOUNDS.maxX, Math.max(MAP_BOUNDS.minX, p.x)),
  y: Math.min(MAP_BOUNDS.maxY, Math.max(MAP_BOUNDS.minY, p.y)),
});

export function PlacePickerSheet({
  open,
  onClose,
  onSave,
  me,
  activity,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (place: CustomPlace) => void;
  me: User;
  activity: ActivityId;
  initial: CustomPlace | null;
}) {
  const gps = me.location.mode === "gps" ? me.location : null;
  const [point, setPoint] = useState<Point | null>(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const [tried, setTried] = useState(false);
  // Kadr ustalany raz na otwarcie – mapa nie przeskakuje przy stawianiu pinezki.
  const [frame, setFrame] = useState<Point[]>([]);

  // Każde otwarcie zaczyna od ostatnio zapisanego miejsca.
  useEffect(() => {
    if (!open) return;
    setPoint(initial ? { x: initial.x, y: initial.y } : null);
    setName(initial?.name ?? "");
    setHint(initial?.hint ?? "");
    setTried(false);
    setFrame([initial ?? gps ?? { x: 0, y: -300 }]);
    // gps celowo pomijamy – zmiana pozycji nie powinna resetować formularza
  }, [open, initial]);

  const draftVenue = point
    ? buildCustomVenue({ ...point, name: name || "Wybrane miejsce", hint }, me, activity)
    : null;
  const eta = draftVenue ? computeEta(me, draftVenue) : null;
  const dist = draftVenue ? distanceTo(me, draftVenue) : null;

  const nameError =
    name.trim().length < 3
      ? "Nazwij miejsce, np. „Ławka przy fontannie” (min. 3 znaki)"
      : name.length > 40
        ? "Maksymalnie 40 znaków"
        : "";

  const save = () => {
    setTried(true);
    if (!point || nameError) return;
    onSave({ ...point, name: name.trim(), hint: hint.trim() });
  };

  return createPortal(
    <Sheet
      open={open}
      onClose={onClose}
      title="Wskaż miejsce na mapie"
      wide
      footer={
        <Button
          size="lg"
          block
          onClick={save}
          disabled={!point}
          icon={<Check className="size-5" strokeWidth={3} />}
        >
          {point ? "Zapisz to miejsce" : "Najpierw wskaż punkt na mapie"}
        </Button>
      }
    >
      <p className="-mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-600">
        <MousePointerClick className="size-4 shrink-0 text-brand-600" aria-hidden />
        Kliknij lub stuknij mapę, aby postawić pinezkę. Przeciągnij, by przesunąć widok.
      </p>

      <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-ink-200">
        <MapView
          me={gps}
          venue={draftVenue}
          activity={activity}
          showRoute
          frame={frame}
          onPick={(p) => setPoint(clampToMap(p))}
          className="h-[min(24rem,46dvh)]"
        />
        {!point && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="rounded-full bg-ink-950/85 px-3.5 py-1.5 text-xs font-bold text-white shadow-float">
              Wskaż punkt spotkania
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
          {gps && (
            <button
              type="button"
              onClick={() => setPoint(clampToMap({ x: gps.x, y: gps.y }))}
              className="flex min-h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-[0.8125rem] font-bold text-ink-900 shadow-card ring-1 ring-ink-200 hover:bg-paper"
            >
              <LocateFixed className="size-4 text-blue-600" aria-hidden />
              Moja lokalizacja
            </button>
          )}
          <DemoBadge className="pointer-events-none">Mapa poglądowa</DemoBadge>
        </div>
      </div>

      <div
        className={cx(
          "mt-3 flex items-start gap-3 rounded-2xl p-3",
          point ? "bg-brand-50 ring-1 ring-brand-100" : "bg-paper",
        )}
        aria-live="polite"
      >
        <span
          className={cx(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            point ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500",
          )}
        >
          <MapPinned className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 text-sm">
          {point && draftVenue ? (
            <>
              <p className="font-bold text-ink-950">{draftVenue.address}</p>
              <p className="mt-0.5 text-ink-700">
                {dist !== null
                  ? `${fmtDistance(dist)} od Ciebie w linii prostej`
                  : "Odległość nieznana"}
                {eta?.available ? ` · dotarcie ok. ${eta.safeMin} min` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-ink-950">Nie wskazano jeszcze punktu</p>
              <p className="mt-0.5 text-ink-600">
                Park, ławka, wejście do galerii – dowolne miejsce, które łatwo znaleźć.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Field
          id="place-name"
          label="Nazwa miejsca"
          counter={`${name.length}/40`}
          error={tried ? nameError : ""}
        >
          <TextInput
            id="place-name"
            value={name}
            maxLength={40}
            placeholder="np. Ławka przy fontannie na Plantach"
            onChange={(e) => setName(e.target.value)}
            invalid={tried && !!nameError}
          />
        </Field>
        <Field
          id="place-hint"
          label="Jak trafić? (opcjonalnie)"
          hint="Widoczne dla osoby, która dołączy. Nie podawaj adresu zamieszkania."
          counter={`${hint.length}/120`}
        >
          <TextArea
            id="place-hint"
            value={hint}
            maxLength={120}
            placeholder="np. Przy wejściu od strony Wisły, obok stojaków na rowery"
            onChange={(e) => setHint(e.target.value)}
            className="min-h-20"
          />
        </Field>
      </div>
    </Sheet>,
    document.body,
  );
}

/** Kafel „Dowolne miejsce” w kroku wyboru miejsca. */
export function CustomPlaceTile({
  venue,
  me,
  selected,
  onSelect,
  onEdit,
}: {
  venue: Venue | null;
  me: User;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  if (!venue)
    return (
      <button
        type="button"
        onClick={onEdit}
        aria-haspopup="dialog"
        className="group flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-ink-300 bg-white p-4 text-left transition hover:border-brand-400 hover:bg-brand-50/50"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
          <MapPinned className="size-7" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[1.0625rem] font-bold">
            Dowolne miejsce z mapy
          </span>
          <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-600">
            Park, ławka, plac albo wejście do galerii – wskaż punkt samodzielnie.
          </span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-ink-950 px-4 py-2 text-sm font-extrabold text-white sm:block">
          Wskaż na mapie
        </span>
      </button>
    );

  const dist = distanceTo(me, venue);
  return (
    <article
      className={cx(
        "rounded-3xl bg-white p-3 ring-1 transition",
        selected ? "ring-2 ring-brand-600 shadow-card" : "ring-ink-200 hover:ring-ink-300",
      )}
    >
      <div className="flex gap-3">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <MapPinned className="size-9" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 py-0.5">
          <span className="text-xs font-bold text-brand-700">Własne miejsce</span>
          <h4 className="mt-1 truncate font-display text-[1.0625rem] font-bold">{venue.name}</h4>
          <p className="mt-0.5 truncate text-[0.8125rem] text-ink-600">
            {venue.address}
            {dist !== null && (
              <span className="font-bold text-ink-900"> · {fmtDistance(dist)}</span>
            )}
          </p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-ink-700">
            {venue.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          aria-haspopup="dialog"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-ink-900 ring-1 ring-ink-200 transition hover:bg-ink-100 hover:ring-ink-300"
        >
          <Pencil className="size-4 text-brand-600" aria-hidden />
          Zmień na mapie
        </button>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
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
      </div>
    </article>
  );
}
