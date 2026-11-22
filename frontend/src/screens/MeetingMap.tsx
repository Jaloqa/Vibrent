import {
  Bike,
  Bus,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Flag,
  Footprints,
  MessageCircle,
  Navigation,
  Play,
  Route,
  Square,
  TriangleAlert,
  UserX,
  CircleCheck,
} from "lucide-react";
import { useState } from "react";
import { activityById } from "../data/catalog";
import type { TravelMode } from "../data/types";
import { MapView } from "../components/MapView";
import { ReportSheet } from "../components/ReportSheet";
import { TopBar } from "../components/Shell";
import {
  Avatar,
  Button,
  cx,
  DemoBadge,
  EmptyState,
  MeetingStatusPill,
  Modal,
  Notice,
  Sheet,
  useToast,
} from "../components/ui";
import {
  arrivalPlan,
  computeEta,
  ETA_CONFIG,
  fmtDistance,
  remainingMin,
  shareBand,
} from "../lib/eta";
import { navigate, Redirect } from "../lib/router";
import { clock } from "../lib/time";
import { findUser, otherPartyId, useMe, useStore, venueOf } from "../store";

const MODES: { id: TravelMode; label: string; icon: typeof Footprints }[] = [
  { id: "walk", label: "Pieszo", icon: Footprints },
  { id: "transit", label: "Komunikacja", icon: Bus },
  { id: "bike", label: "Rower", icon: Bike },
];

const ISSUES = [
  { text: "Spóźnię się kilka minut", delay: 5 },
  { text: "Utknąłem/am w korku lub komunikacji", delay: 10 },
  { text: "Nie mogę znaleźć miejsca", delay: 3 },
];

export function MeetingMap({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const [expanded, setExpanded] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [resignOpen, setResignOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const m = state.meetings.find((x) => x.id === id);

  if (!m || !m.participantId || (m.organizerId !== me.id && m.participantId !== me.id)) {
    return (
      <>
        <TopBar title="Mapa spotkania" />
        <EmptyState
          icon={<EyeOff className="size-9" />}
          title="Mapa niedostępna"
          actions={<Button onClick={() => navigate("/app")}>Wróć do odkrywania</Button>}
        >
          Mapa spotkania odblokowuje się dopiero po zaakceptowaniu zgłoszenia i jest dostępna tylko
          dla dwóch uczestników.
        </EmptyState>
      </>
    );
  }
  if (m.status !== "matched" && m.status !== "in_progress") {
    return <Redirect to={`/app/finished/${m.id}`} />;
  }

  const otherId = otherPartyId(m, me.id)!;
  const other = findUser(state, otherId)!;
  const venue = venueOf(m);
  const act = activityById(m.activity);
  const myEta = computeEta(me, venue);
  const otherEta = computeEta(other, venue);
  const plan = arrivalPlan(m, { [me.id]: myEta, [otherId]: otherEta });
  const myRem = remainingMin(myEta, m, me.id, state.now);
  const otherRem = remainingMin(otherEta, m, otherId, state.now);
  const noShowFrom = (plan.plannedAt ?? (m.matchedAt ?? 0) + 15) + ETA_CONFIG.lateThresholdMinutes;
  const canReportNoShow = state.now >= noShowFrom;
  const inProgress = m.status === "in_progress";

  const otherLine = (() => {
    if (otherRem === null)
      return { text: "Czas przybycia nie jest obecnie dostępny", tone: "muted" as const };
    if (plan.late[otherId])
      return {
        text: "Druga osoba prawdopodobnie się spóźni",
        tone: "warn" as const,
        sub: `Szacunkowo ${shareBand(otherRem)}`,
      };
    if (otherRem === 0)
      return { text: "Druga osoba powinna być już na miejscu", tone: "ok" as const };
    return {
      text: `Druga osoba powinna dotrzeć za około ${shareBand(otherRem)}`,
      tone: "ok" as const,
    };
  })();

  const sheet = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <MeetingStatusPill status={m.status} />
            {plan.plannedAt !== null && !inProgress && (
              <span className="text-xs font-bold text-ink-600">
                spotkanie ok. {clock(plan.plannedAt)}
              </span>
            )}
          </div>
          <h2 className="mt-2 truncate text-2xl font-extrabold">{venue.name}</h2>
          <p className="truncate text-sm text-ink-600">
            {venue.address} · {act.label}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink-100 lg:hidden"
          aria-label={expanded ? "Zwiń panel" : "Rozwiń panel"}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-brand-50 p-3.5 ring-1 ring-brand-200">
          <p className="text-xs font-bold text-brand-800">Twoje ETA</p>
          {inProgress ? (
            <p className="mt-1 font-display text-xl font-extrabold">Na miejscu</p>
          ) : myRem !== null ? (
            <>
              <p className="mt-0.5 font-display text-[1.75rem] font-extrabold leading-tight">
                {myRem === 0 ? "Na miejscu" : `${myRem} min`}
              </p>
              <p className="text-xs text-brand-800">
                {myRem === 0 ? "wg szacunku" : `Dotrzesz za około ${myRem} min`}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm font-bold">Niedostępne</p>
          )}
        </div>
        <div
          className={cx(
            "rounded-2xl p-3.5 ring-1",
            otherLine.tone === "warn" ? "bg-amber-50 ring-amber-200" : "bg-paper ring-ink-200",
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
            <Avatar src={other.photo} alt="" size={18} /> {other.name}
          </p>
          {inProgress ? (
            <p className="mt-1 font-display text-xl font-extrabold">Na miejscu</p>
          ) : (
            <>
              <p
                className={cx(
                  "mt-1 text-sm font-extrabold leading-snug",
                  otherLine.tone === "warn" && "text-amber-900",
                )}
              >
                {otherLine.tone === "warn" && (
                  <TriangleAlert className="mr-1 inline size-4 align-[-3px]" aria-hidden />
                )}
                {otherLine.text}
              </p>
              {"sub" in otherLine && otherLine.sub && (
                <p className="text-xs text-amber-900">{otherLine.sub}</p>
              )}
            </>
          )}
        </div>
      </div>

      {expanded && (
        <>
          {!inProgress && myEta.available && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-ink-600">Sposób dotarcia</p>
                <p className="flex items-center gap-1 text-xs text-ink-600">
                  <Route className="size-3.5" aria-hidden /> trasa {fmtDistance(myEta.routeM)} ·
                  bazowo {myEta.baseMin} min + zapas
                </p>
              </div>
              <div
                className="mt-1.5 grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1"
                role="radiogroup"
                aria-label="Sposób dotarcia"
              >
                {MODES.map((mo) => {
                  const I = mo.icon;
                  const on = me.travelMode === mo.id;
                  return (
                    <button
                      key={mo.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => dispatch({ type: "set_travel_mode", mode: mo.id })}
                      className={cx(
                        "flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-[0.8125rem] font-bold transition",
                        on ? "bg-white shadow-sm" : "text-ink-700 hover:bg-white/60",
                      )}
                    >
                      <I className="size-4" aria-hidden /> {mo.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {!myEta.available && (
            <Notice tone="warn" title="Czas dotarcia niedostępny">
              {myEta.reason}. Nie generujemy szacunku bez danych.
            </Notice>
          )}
          {m.arrivalIssues[me.id] && (
            <Notice tone="warn" title="Zgłosiłeś(-aś) problem z dotarciem">
              {m.arrivalIssues[me.id]}. Druga osoba została poinformowana.
            </Notice>
          )}
          {m.arrivalIssues[otherId] && (
            <Notice tone="warn" title={`${other.name} zgłasza problem z dotarciem`}>
              {m.arrivalIssues[otherId]}.
            </Notice>
          )}

          <p className="flex items-start gap-2 rounded-2xl bg-paper p-3 text-xs leading-relaxed text-ink-700">
            <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden /> Widzisz tylko swoją pozycję i
            trasę. {other.name} widzi wyłącznie przybliżony przedział Twojego czasu przybycia – bez
            lokalizacji, kierunku i historii.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              icon={<Navigation className="size-4" />}
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.city}`)}`,
                  "_blank",
                  "noopener",
                )
              }
            >
              Nawiguj
            </Button>
            <Button
              variant="secondary"
              icon={<MessageCircle className="size-4" />}
              onClick={() => navigate(`/app/chat/${m.id}`)}
            >
              {inProgress ? "Czat (odczyt)" : "Napisz wiadomość"}
            </Button>
          </div>
          {!inProgress ? (
            <>
              <Button
                variant="dark"
                block
                icon={<Play className="size-4" />}
                onClick={() => setStartOpen(true)}
              >
                Jesteśmy na miejscu – rozpocznij spotkanie
              </Button>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => setIssueOpen(true)}
                  className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-ink-800 underline underline-offset-4"
                >
                  <TriangleAlert className="size-4" aria-hidden /> Zgłoś problem z dotarciem
                </button>
                <button
                  type="button"
                  onClick={() =>
                    canReportNoShow
                      ? setNoShowOpen(true)
                      : toast(
                          `Zgłoszenie nieobecności będzie możliwe od ok. ${clock(noShowFrom)}`,
                          { sub: "Dajemy drugiej osobie czas na dotarcie." },
                        )
                  }
                  aria-disabled={!canReportNoShow}
                  className={cx(
                    "flex min-h-11 items-center gap-1.5 text-sm font-bold underline underline-offset-4",
                    canReportNoShow ? "text-ink-800" : "text-ink-500",
                  )}
                >
                  <UserX className="size-4" aria-hidden /> Druga osoba nie przyszła
                </button>
                <button
                  type="button"
                  onClick={() => setResignOpen(true)}
                  className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-red-700 underline underline-offset-4"
                >
                  Zrezygnuj
                </button>
              </div>
              {!canReportNoShow && (
                <p className="-mt-2 text-xs text-ink-600">
                  Zgłoszenie nieobecności dostępne od ok. {clock(noShowFrom)}.
                </p>
              )}
            </>
          ) : (
            <>
              <Notice tone="info">
                Spotkanie trwa – czat jest już tylko do odczytu. Miłego czasu!
              </Notice>
              <Button
                block
                variant="dark"
                icon={<Square className="size-4" />}
                onClick={() => {
                  dispatch({ type: "finish_meeting", meetingId: m.id });
                  navigate(`/app/finished/${m.id}`, { replace: true });
                }}
              >
                Zakończ spotkanie
              </Button>
              <button
                type="button"
                onClick={() => setNoShowOpen(true)}
                className="flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-ink-800 underline underline-offset-4"
              >
                <Flag className="size-4" aria-hidden /> Zgłoś problem
              </button>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="relative flex h-dvh flex-col lg:flex-row">
      <div className="relative min-h-0 flex-1">
        <MapView
          me={me.location.mode === "gps" && !inProgress ? me.location : null}
          venue={venue}
          activity={m.activity}
          showRoute={!inProgress}
          className="absolute inset-0"
        />
        <div className="absolute inset-x-0 top-0">
          <TopBar
            transparent
            onBack={() => navigate("/app/meetings/potwierdzone")}
            right={<span className="mr-14" />}
          />
        </div>
        <div className="pointer-events-none absolute bottom-4 left-3 flex flex-col items-start gap-1.5 lg:bottom-6 lg:left-6">
          <DemoBadge>Mapa poglądowa · pozycja i ETA symulowane</DemoBadge>
          {state.offline && <DemoBadge>Brak internetu – dane mogą być nieaktualne</DemoBadge>}
        </div>
      </div>
      <section
        aria-label="Szczegóły spotkania"
        className="relative z-10 -mt-6 max-h-[62dvh] overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-float lg:mt-0 lg:max-h-none lg:w-[24rem] xl:w-[27.5rem] lg:rounded-none lg:border-l lg:border-ink-200 lg:pt-8"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-200 lg:hidden" aria-hidden />
        {sheet}
      </section>

      <Sheet open={issueOpen} onClose={() => setIssueOpen(false)} title="Problem z dotarciem">
        <p className="text-sm text-ink-600">
          Damy znać drugiej osobie. Czasu przyjazdu nie wpisujesz ręcznie – system przeliczy
          szacunek.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {ISSUES.map((i) => (
            <button
              key={i.text}
              type="button"
              onClick={() => {
                dispatch({ type: "arrival_issue", meetingId: m.id, issue: i.text, delay: i.delay });
                setIssueOpen(false);
                toast("Wysłano informację do drugiej osoby", {
                  tone: "success",
                  sub: "Status: możliwe spóźnienie",
                });
              }}
              className="flex min-h-13 items-center rounded-2xl bg-white px-4 py-3 text-left text-[0.9375rem] font-bold ring-1 ring-ink-200 hover:ring-ink-300"
            >
              {i.text}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIssueOpen(false);
              setResignOpen(true);
            }}
            className="flex min-h-13 items-center rounded-2xl bg-red-50 px-4 py-3 text-left text-[0.9375rem] font-bold text-red-800 ring-1 ring-red-200"
          >
            Nie dam rady dotrzeć – rezygnuję
          </button>
        </div>
      </Sheet>

      <Modal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title="Rozpocząć spotkanie?"
        icon={<CircleCheck className="size-7" />}
        actions={
          <>
            <Button
              block
              onClick={() => {
                dispatch({ type: "start_meeting", meetingId: m.id });
                setStartOpen(false);
                toast("Spotkanie rozpoczęte", {
                  tone: "success",
                  sub: "Czat jest teraz tylko do odczytu.",
                });
              }}
            >
              Tak, jesteśmy razem
            </Button>
            <Button block variant="ghost" onClick={() => setStartOpen(false)}>
              Jeszcze nie
            </Button>
          </>
        }
      >
        Po rozpoczęciu wysyłanie wiadomości zostanie wyłączone. W prototypie start potwierdzasz
        ręcznie – automatyczne rozpoznawanie wymaga osobnego ustalenia.
      </Modal>

      <Modal
        open={resignOpen}
        onClose={() => setResignOpen(false)}
        title="Zrezygnować ze spotkania?"
        actions={
          <>
            <Button
              block
              variant="dark"
              onClick={() => {
                dispatch({
                  type: "cancel_meeting",
                  meetingId: m.id,
                  reason: `${me.name} zrezygnował(a) ze spotkania`,
                });
                setResignOpen(false);
                toast("Zrezygnowano ze spotkania", { sub: `${other.name} otrzyma powiadomienie.` });
                navigate("/app/meetings/historia", { replace: true });
              }}
            >
              Tak, rezygnuję
            </Button>
            <Button block variant="ghost" onClick={() => setResignOpen(false)}>
              Wróć
            </Button>
          </>
        }
      >
        {other.name} dostanie powiadomienie. Uprzedzenie z wyprzedzeniem to w porządku – szanujemy
        czas obu osób.
      </Modal>

      <ReportSheet
        open={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        kind="no_show"
        meetingId={m.id}
        targetId={otherId}
        onDone={() => navigate(`/app/finished/${m.id}`, { replace: true })}
      />
    </div>
  );
}
