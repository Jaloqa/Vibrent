import { ArrowRight, CircleCheck, LayoutGrid, Pencil, Rocket, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { ACTIVITIES, CATEGORIES, QUICK_ACTIVITIES, activityById } from "../data/catalog";
import { VENUES } from "../data/demo";
import type { ActivityId, Meeting } from "../data/types";
import { VenueCard } from "../components/cards";
import {
  buildCustomVenue,
  CUSTOM_VENUE_ID,
  CustomPlaceTile,
  PlacePickerSheet,
  type CustomPlace,
} from "../components/PlacePicker";
import { MeetingCardFace } from "../components/SwipeDeck";
import { TopBar } from "../components/Shell";
import {
  ActivityIcon,
  Button,
  cx,
  EmptyState,
  Field,
  Notice,
  SectionLabel,
  TextArea,
  TextInput,
  useToast,
} from "../components/ui";
import { goBack, navigate } from "../lib/router";
import { distanceTo, filtersFor, uid, useMe, useStore } from "../store";

const STEPS = ["Co chcesz robić?", "Opisz spotkanie", "Wybierz miejsce", "Podsumowanie"];

export function Create() {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [extra, setExtra] = useState("");
  const [venueId, setVenueId] = useState<string | null>(null);
  const [customPlace, setCustomPlace] = useState<CustomPlace | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [published, setPublished] = useState<string | null>(null);
  const existing = state.meetings.find(
    (m) => m.organizerId === me.id && (m.status === "active" || m.status === "matched"),
  );

  const act = activity ? activityById(activity) : null;
  const pickActivity = (id: ActivityId) => {
    // Własny punkt pasuje do każdej aktywności; lokale z listy – nie.
    if (id !== activity && venueId !== CUSTOM_VENUE_ID) setVenueId(null);
    setActivity(id);
  };
  const errors = {
    title:
      title.trim().length < 5
        ? "Tytuł powinien mieć co najmniej 5 znaków"
        : title.length > 60
          ? "Maksymalnie 60 znaków"
          : "",
    description: description.trim().length < 10 ? "Dodaj krótki opis – co najmniej 10 znaków" : "",
  };

  const venues = useMemo(() => {
    if (!act) return { promoted: [], regular: [] };
    const radius = filtersFor(state, me).radiusKm * 1000;
    const matching = VENUES.filter(
      (v) => v.city === me.location.city && v.types.some((t) => act.venueTypes.includes(t)),
    )
      .map((v) => ({ v, d: distanceTo(me, v) ?? Infinity }))
      .sort((a, b) => a.d - b.d);
    // Promowane: tylko pasujące do aktywności i w promieniu; maks. 2, nie wypierają zwykłych rekomendacji
    const promoted = matching.filter((x) => x.v.promoted && x.d <= radius * 1.2).slice(0, 2);
    const regular = matching.filter((x) => !promoted.includes(x));
    return { promoted: promoted.map((x) => x.v), regular: regular.map((x) => x.v) };
  }, [act, me, state]);

  const customVenue = useMemo(
    () => (customPlace && activity ? buildCustomVenue(customPlace, me, activity) : null),
    [customPlace, activity, me],
  );
  const isCustom = venueId === CUSTOM_VENUE_ID && !!customVenue;

  const next = () => {
    if (step === 1) {
      setTouched(true);
      if (errors.title || errors.description) return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  };

  const publish = () => {
    if (!activity || !venueId) return;
    if (state.offline)
      return toast("Brak internetu – nie udało się opublikować", {
        tone: "error",
        sub: "Twoje dane zostały zachowane. Spróbuj ponownie.",
      });
    const meeting: Meeting = {
      id: uid("m"),
      organizerId: me.id,
      activity,
      title: title.trim(),
      description: description.trim(),
      extra: extra.trim() || undefined,
      venueId,
      customVenue: isCustom ? customVenue : undefined,
      createdAt: state.now,
      status: "active",
      matchSeenBy: [],
      delays: {},
      arrivalIssues: {},
    };
    dispatch({ type: "publish", meeting });
    setPublished(meeting.id);
  };

  if (published) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative mb-8">
          <span
            className="absolute inset-0 rounded-full bg-brand-400 animate-pulse-ring"
            aria-hidden
          />
          <span className="relative flex size-24 items-center justify-center rounded-full bg-brand-600 text-white animate-pop">
            <Rocket className="size-11" />
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-balance">
          Twoje spotkanie jest aktywne. Czekamy na chętnych!
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
          Pokazujemy je osobom w promieniu {filtersFor(state, me).radiusKm} km od miejsca spotkania.
          Damy znać, gdy ktoś się zgłosi.
        </p>
        <Notice tone="info" className="mt-6 text-left" title="Wskazówka do demo">
          Przełącz konto w panelu Demo (np. na Olę), znajdź swoje spotkanie w Odkrywaj i przesuń w
          prawo. Możesz też użyć „Symuluj zgłoszenie”.
        </Notice>
        <div className="mt-8 flex w-full flex-col gap-2.5">
          <Button
            block
            size="lg"
            onClick={() => navigate(`/app/organize/${published}`, { replace: true })}
          >
            Przejdź do panelu organizatora
          </Button>
          <Button block variant="ghost" onClick={() => navigate("/app", { replace: true })}>
            Wróć do odkrywania
          </Button>
        </div>
      </div>
    );
  }

  const draft: Meeting | null =
    activity && venueId
      ? {
          id: "preview",
          organizerId: me.id,
          activity,
          title: title || act!.titleHint,
          description,
          venueId,
          customVenue: isCustom ? customVenue : undefined,
          createdAt: state.now,
          status: "active",
          matchSeenBy: [],
          delays: {},
          arrivalIssues: {},
        }
      : null;

  return (
    <div className="pb-32 lg:pb-12">
      <TopBar
        title="Nowe spotkanie"
        sub={`Krok ${step + 1} z 4 · ${STEPS[step]}`}
        onBack={() => (step === 0 ? goBack("/app") : setStep(step - 1))}
      />
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <div
          className="mt-3 flex gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step + 1}
          aria-label="Postęp kreatora"
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cx(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-brand-600" : "bg-ink-200",
              )}
            />
          ))}
        </div>

        {existing && step === 0 && (
          <Notice tone="warn" className="mt-4" title="Masz już aktywne spotkanie">
            „{existing.title}” wciąż czeka na uczestnika.{" "}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => navigate(`/app/organize/${existing.id}`)}
            >
              Przejdź do panelu
            </button>
          </Notice>
        )}

        {step === 0 && (
          <section className="mt-6">
            <h2 className="text-[1.75rem] font-extrabold">Co chcesz teraz robić?</h2>
            <p className="mt-1 text-[0.9375rem] text-ink-600">
              Spotkanie startuje od razu – bez wybierania dnia i godziny.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIVITIES.map((q) => (
                <ActivityTile
                  key={q.id}
                  id={q.id}
                  label={q.label}
                  selected={activity === q.id}
                  onClick={() => pickActivity(q.id)}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                aria-expanded={showAll}
                className={cx(
                  "flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl p-3 text-center ring-1 transition",
                  showAll || (activity && !QUICK_ACTIVITIES.some((q) => q.id === activity))
                    ? "bg-ink-950 text-white ring-ink-950"
                    : "bg-white ring-ink-200 hover:ring-ink-300",
                )}
              >
                <LayoutGrid className="size-7" aria-hidden />
                <span className="text-[0.9375rem] font-extrabold">Inna aktywność</span>
              </button>
            </div>
            {showAll && (
              <div className="mt-6 flex flex-col gap-5 animate-fade-up">
                {CATEGORIES.map((c) => (
                  <div key={c.id}>
                    <SectionLabel>{c.label}</SectionLabel>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ACTIVITIES.filter((a) => a.category === c.id).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          aria-pressed={activity === a.id}
                          onClick={() => pickActivity(a.id)}
                          className={cx(
                            "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition",
                            activity === a.id
                              ? "bg-ink-950 text-white ring-ink-950"
                              : cx("bg-white ring-ink-200 hover:ring-ink-300"),
                          )}
                        >
                          <span
                            className={cx(
                              "flex size-6 items-center justify-center rounded-full",
                              activity === a.id ? "bg-white/15" : cx(c.tint, c.text),
                            )}
                          >
                            <ActivityIcon id={a.id} className="size-3.5" />
                          </span>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 1 && act && (
          <section className="mt-6 flex flex-col gap-5">
            <div>
              <h2 className="text-[1.75rem] font-extrabold">Opisz spotkanie</h2>
              <p className="mt-1 text-[0.9375rem] text-ink-600">
                Krótko i konkretnie – ludzie decydują w kilka sekund.
              </p>
            </div>
            <Field
              id="t"
              label="Tytuł"
              counter={`${title.length}/60`}
              error={touched ? errors.title : ""}
              hint={`Np. „${act.titleHint}”`}
            >
              <TextInput
                id="t"
                value={title}
                maxLength={60}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={act.titleHint}
                invalid={touched && !!errors.title}
                aria-describedby={touched && errors.title ? "t-err" : "t-hint"}
              />
            </Field>
            {!title && (
              <button
                type="button"
                onClick={() => setTitle(act.titleHint)}
                className="-mt-2 self-start rounded-full bg-brand-50 px-3 py-2 text-[0.8125rem] font-bold text-brand-800 ring-1 ring-brand-200"
              >
                Użyj podpowiedzi: „{act.titleHint}”
              </button>
            )}
            <Field
              id="d"
              label="Krótki opis"
              counter={`${description.length}/200`}
              error={touched ? errors.description : ""}
            >
              <TextArea
                id="d"
                value={description}
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mam godzinę wolnego, chętnie pogadam o wszystkim…"
                invalid={touched && !!errors.description}
              />
            </Field>
            <Field
              id="e"
              label="Dodatkowe informacje (opcjonalnie)"
              counter={`${extra.length}/120`}
              hint="Np. jak Cię rozpoznać albo ile kosztuje wejście."
            >
              <TextInput
                id="e"
                value={extra}
                maxLength={120}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Będę przy wejściu"
              />
            </Field>
            <Notice tone="info">
              Nie podawaj numeru telefonu ani adresu – szczegóły ustalicie na czacie po akceptacji.
            </Notice>
          </section>
        )}

        {step === 2 && act && (
          <section className="mt-6">
            <h2 className="text-[1.75rem] font-extrabold">Wybierz miejsce</h2>
            <p className="mt-1 text-[0.9375rem] text-ink-600">
              Proponujemy miejsca dopasowane do aktywności „{act.label}”, najbliżej Ciebie.
            </p>
            <div className="mt-5">
              <CustomPlaceTile
                venue={customVenue}
                me={me}
                selected={isCustom}
                onSelect={() => setVenueId(CUSTOM_VENUE_ID)}
                onEdit={() => setPickerOpen(true)}
              />
            </div>
            <PlacePickerSheet
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              me={me}
              activity={act.id}
              initial={customPlace}
              onSave={(place) => {
                setCustomPlace(place);
                setVenueId(CUSTOM_VENUE_ID);
                setPickerOpen(false);
              }}
            />
            {venues.promoted.length + venues.regular.length === 0 ? (
              <EmptyState icon={<Zap className="size-9" />} title="Brak miejsc w tej okolicy">
                W prototypie lokale są dostępne tylko dla Krakowa. Wskaż dowolne miejsce na mapie
                powyżej, zmień lokalizację w profilu lub wybierz inną aktywność.
              </EmptyState>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                {venues.promoted.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <SectionLabel>Promowane w okolicy</SectionLabel>
                      <span className="text-xs text-ink-600">Lokal zapłacił za wyróżnienie</span>
                    </div>
                    {venues.promoted.map((v) => (
                      <VenueCard
                        key={v.id}
                        venue={v}
                        me={me}
                        activity={act.id}
                        mapOnDemand
                        selected={venueId === v.id}
                        onSelect={() => setVenueId(v.id)}
                      />
                    ))}
                  </>
                )}
                <SectionLabel className="mt-3">Najbliżej Ciebie</SectionLabel>
                {venues.regular.map((v) => (
                  <VenueCard
                    key={v.id}
                    venue={v}
                    me={me}
                    activity={act.id}
                    mapOnDemand
                    selected={venueId === v.id}
                    onSelect={() => setVenueId(v.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {step === 3 && draft && (
          <section className="mt-6">
            <h2 className="text-[1.75rem] font-extrabold">Tak zobaczą Cię inni</h2>
            <p className="mt-1 text-[0.9375rem] text-ink-600">Sprawdź podgląd karty i opublikuj.</p>
            <div className="mx-auto mt-5 h-[32.5rem] max-w-sm">
              <MeetingCardFace meeting={draft} preview />
            </div>
            <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-sm text-ink-800">
              <li className="flex gap-2">
                <CircleCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Startuje
                teraz, bez daty i godziny
              </li>
              <li className="flex gap-2">
                <CircleCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Dla Ciebie
                i jednej osoby, którą zaakceptujesz
              </li>
              <li className="flex gap-2">
                <CircleCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Widoczne w
                promieniu {filtersFor(state, me).radiusKm} km
              </li>
            </ul>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:left-[17rem]">
        <div className="mx-auto flex max-w-2xl gap-2">
          {step === 3 ? (
            <>
              <Button
                size="lg"
                variant="secondary"
                icon={<Pencil className="size-4" />}
                onClick={() => setStep(1)}
              >
                Edytuj
              </Button>
              <Button size="lg" block onClick={publish} icon={<Rocket className="size-5" />}>
                Opublikuj teraz
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              block
              onClick={next}
              disabled={(step === 0 && !activity) || (step === 2 && !venueId)}
            >
              {step === 0 && !activity
                ? "Wybierz aktywność"
                : step === 2 && !venueId
                  ? "Wybierz miejsce"
                  : "Dalej"}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityTile({
  id,
  label,
  selected,
  onClick,
}: {
  id: ActivityId;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const a = activityById(id);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "group relative flex aspect-square flex-col items-start justify-end overflow-hidden rounded-3xl p-3.5 text-left text-white ring-1 transition",
        selected
          ? "ring-[3px] ring-brand-600 ring-offset-2"
          : "ring-transparent hover:scale-[1.02]",
      )}
    >
      <img
        src={`https://images.unsplash.com/${a.photo}?auto=format&fit=crop&w=400&h=400&q=70`}
        alt=""
        className="absolute inset-0 size-full object-cover transition group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
      <span
        className={cx(
          "relative mb-2 flex size-9 items-center justify-center rounded-full",
          selected ? "bg-brand-600" : "bg-white/20 backdrop-blur",
        )}
      >
        <ActivityIcon id={id} className="size-5" />
      </span>
      <span className="relative text-[1.0625rem] font-extrabold">{label}</span>
      {selected && (
        <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-brand-600">
          <CircleCheck className="size-4" aria-hidden />
        </span>
      )}
    </button>
  );
}
