import {
  Ban,
  Clock3,
  Flag,
  Footprints,
  Hourglass,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { activityById, categoryById } from "../data/catalog";
import { PersonCard, VenueCard } from "../components/cards";
import { ReportSheet } from "../components/ReportSheet";
import {
  ActivityChip,
  Button,
  IconButton,
  Notice,
  NowBadge,
  photoUrl,
  SectionLabel,
  useToast,
  EmptyState,
} from "../components/ui";
import { TopBar } from "../components/Shell";
import { computeEta, fmtDistance, TRAVEL_LABEL } from "../lib/eta";
import { goBack, navigate } from "../lib/router";
import { activeFor } from "../lib/time";
import { commonInterests, distanceTo, findUser, uid, useMe, useStore, venueOf } from "../store";

export function MeetingDetails({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const m = state.meetings.find((x) => x.id === id);
  if (!m)
    return (
      <>
        <TopBar title="Spotkanie" />
        <EmptyState
          icon={<Ban className="size-9" />}
          title="Nie znaleziono spotkania"
          actions={<Button onClick={() => navigate("/app")}>Wróć do odkrywania</Button>}
        />
      </>
    );
  const org = findUser(state, m.organizerId)!;
  const venue = venueOf(m);
  const act = activityById(m.activity);
  const cat = categoryById(act.category);
  const dist = distanceTo(me, venue);
  const eta = computeEta(me, venue);
  const myReq = [...state.requests]
    .reverse()
    .find((r) => r.meetingId === m.id && r.userId === me.id);
  const isMine = m.organizerId === me.id;
  const amParticipant = m.participantId === me.id;
  const unavailable = !isMine && !amParticipant && m.status !== "active";
  const common = commonInterests(me, org);

  const join = () => {
    if (state.offline)
      return toast("Brak internetu – zgłoszenie nie zostało wysłane", { tone: "error" });
    dispatch({ type: "send_request", meetingId: m.id, id: uid("r") });
    toast("Zgłoszenie wysłane. Czekamy na decyzję organizatora.", { tone: "success" });
  };

  let cta;
  if (isMine) {
    cta = (
      <Button
        block
        size="lg"
        onClick={() =>
          navigate(
            m.status === "active"
              ? `/app/organize/${m.id}`
              : m.status === "matched" || m.status === "in_progress"
                ? `/app/map/${m.id}`
                : `/app/finished/${m.id}`,
          )
        }
      >
        {m.status === "active" ? "Przejdź do panelu organizatora" : "Zobacz spotkanie"}
      </Button>
    );
  } else if (amParticipant && (m.status === "matched" || m.status === "in_progress")) {
    cta = (
      <Button block size="lg" onClick={() => navigate(`/app/map/${m.id}`)}>
        Zobacz mapę spotkania
      </Button>
    );
  } else if (unavailable) {
    cta = (
      <div className="flex flex-col gap-2">
        <Notice tone="warn" title="Spotkanie już niedostępne">
          {m.status === "cancelled"
            ? "Organizator anulował to spotkanie."
            : "Organizator wybrał już osobę do spotkania. Zobacz inne propozycje w okolicy."}
        </Notice>
        <Button block size="lg" variant="secondary" onClick={() => navigate("/app")}>
          Wróć do odkrywania
        </Button>
      </div>
    );
  } else if (myReq?.status === "pending") {
    cta = (
      <div className="flex items-center gap-2">
        <Button
          block
          size="lg"
          variant="secondary"
          disabled
          icon={<Hourglass className="size-5" />}
          className="!opacity-100 !text-amber-900 !bg-amber-50 !ring-amber-200"
        >
          Oczekuje na akceptację
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => {
            dispatch({ type: "cancel_request", requestId: myReq.id });
            toast("Zgłoszenie wycofane");
          }}
        >
          Wycofaj
        </Button>
      </div>
    );
  } else if (myReq?.status === "rejected" || myReq?.status === "closed") {
    cta = (
      <Notice
        tone="warn"
        title={myReq.status === "rejected" ? "Zgłoszenie odrzucone" : "Spotkanie już zajęte"}
      >
        Nie przejmuj się – w okolicy czekają kolejne propozycje.
      </Notice>
    );
  } else {
    cta = (
      <Button block size="lg" onClick={join} icon={<Sparkles className="size-5" />}>
        Chcę dołączyć
      </Button>
    );
  }

  return (
    <div className="pb-40 lg:pb-12">
      <div className="relative h-[46vh] max-h-[28.75rem] min-h-[18.75rem] overflow-hidden bg-ink-900 lg:mx-8 lg:mt-6 lg:h-[23.75rem] lg:rounded-[2rem]">
        <img
          src={photoUrl(act.photo, 1400, 900)}
          alt={`Zdjęcie ilustracyjne: ${act.label}`}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/40" />
        <div className="absolute inset-x-0 top-0">
          <TopBar
            transparent
            onBack={() => goBack("/app")}
            right={
              !isMine && (
                <IconButton
                  label="Zgłoś propozycję"
                  onClick={() => setReportOpen(true)}
                  className="bg-white/90 shadow-card"
                >
                  <Flag className="size-5" />
                </IconButton>
              )
            }
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl p-5 text-white lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {m.status === "active" && <NowBadge />}
            <ActivityChip id={m.activity} onDark size="sm" />
          </div>
          <h1 className="mt-3 text-[2.125rem] font-extrabold leading-[1.02] text-balance lg:text-5xl">
            {m.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/85">
            <Clock3 className="size-4" aria-hidden />{" "}
            {m.status === "active" ? activeFor(m.createdAt, state.now) : "Nieaktywne"} · {cat.label}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-3.5 ring-1 ring-ink-200">
            <p className="flex items-center gap-1.5 text-xs font-bold text-ink-600">
              <MapPin className="size-3.5" aria-hidden /> Odległość
            </p>
            <p className="mt-1 font-display text-xl font-extrabold">
              {dist !== null ? `ok. ${fmtDistance(dist)}` : "—"}
            </p>
            <p className="text-xs text-ink-600">
              {me.location.mode === "gps" ? "w linii prostej" : "od centrum miasta"}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-3.5 ring-1 ring-ink-200">
            <p className="flex items-center gap-1.5 text-xs font-bold text-ink-600">
              <Footprints className="size-3.5" aria-hidden /> Twoje dotarcie
            </p>
            <p className="mt-1 font-display text-xl font-extrabold">
              {eta.available ? `ok. ${eta.safeMin} min` : "Niedostępne"}
            </p>
            <p className="text-xs text-ink-600">
              {eta.available ? `${TRAVEL_LABEL[eta.mode]} · symulacja` : eta.reason}
            </p>
          </div>
        </div>

        <Notice
          tone="brand"
          className="mt-4"
          icon={<Zap className="size-[1.125rem]" />}
          title="Spontanicznie, teraz"
        >
          Organizator jest gotowy wyjść od razu. Spotkanie jest tylko dla Was dwojga – bez
          planowania na później i bez grup.
        </Notice>

        <section className="mt-7">
          <SectionLabel>O spotkaniu</SectionLabel>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink-900">{m.description}</p>
          {m.extra && (
            <p className="mt-3 rounded-2xl bg-paper-2 p-3.5 text-[0.9375rem] text-ink-800">
              {m.extra}
            </p>
          )}
        </section>

        <section className="mt-7">
          <SectionLabel>Miejsce spotkania</SectionLabel>
          <div className="mt-2">
            <VenueCard venue={venue} me={me} activity={m.activity} mapOnDemand />
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <SectionLabel>Organizator</SectionLabel>
            {common.length > 0 && (
              <span className="text-xs font-bold text-brand-700">
                {common.length} wspólne zainteresowania
              </span>
            )}
          </div>
          <div className="mt-2">
            <PersonCard user={org} me={me} onViewProfile={() => navigate(`/app/user/${org.id}`)} />
          </div>
        </section>

        <ul className="mt-6 flex flex-col gap-2 text-[0.8125rem] text-ink-700">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden /> Nie
            udostępniamy lokalizacji ani adresu zamieszkania organizatora i uczestnika.
          </li>
          <li className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden /> Czat i mapa
            odblokują się dopiero po akceptacji zgłoszenia.
          </li>
        </ul>

        {!isMine && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="mt-5 flex min-h-11 items-center gap-2 text-sm font-bold text-ink-700 underline underline-offset-4"
          >
            <Flag className="size-4" aria-hidden /> Zgłoś propozycję
          </button>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-8 lg:rounded-3xl lg:border lg:p-5">
          <div className="mx-auto max-w-2xl">{cta}</div>
        </div>
      </div>
      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        kind="meeting"
        meetingId={m.id}
        targetId={org.id}
      />
    </div>
  );
}
