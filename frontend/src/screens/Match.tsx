import { Clock3, EyeOff, Map, MapPin, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { activityById } from "../data/catalog";
import { ActivityIcon, Avatar, Button, Logo } from "../components/ui";
import { computeEta, remainingMin, shareBand } from "../lib/eta";
import { navigate, Redirect } from "../lib/router";
import { findUser, otherPartyId, useMe, useStore, venueOf } from "../store";

export function Match({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const m = state.meetings.find((x) => x.id === id);
  useEffect(() => {
    if (m && !m.matchSeenBy.includes(me.id)) dispatch({ type: "match_seen", meetingId: m.id });
  }, [m, me.id, dispatch]);
  if (!m || !m.participantId || (m.organizerId !== me.id && m.participantId !== me.id)) {
    return <Redirect to={"/app"} />;
  }
  const other = findUser(state, otherPartyId(m, me.id))!;
  const venue = venueOf(m);
  const act = activityById(m.activity);
  const myEta = computeEta(me, venue);
  const otherEta = computeEta(other, venue);
  const myRem = remainingMin(myEta, m, me.id, state.now);
  const otherRem = remainingMin(otherEta, m, other.id, state.now);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-brand-600 text-white">
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand-400/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 size-[28rem] rounded-full bg-brand-800/60 blur-3xl"
        aria-hidden
      />
      <header className="relative flex items-center justify-between px-5 py-4">
        <Logo light compact />
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="min-h-11 rounded-full px-3 text-sm font-bold text-white/90 hover:bg-white/10"
        >
          Zamknij
        </button>
      </header>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <div className="relative flex items-center justify-center">
          <span
            className="absolute size-56 rounded-full border-2 border-white/30 animate-pulse-ring"
            aria-hidden
          />
          <span
            className="absolute size-56 rounded-full border-2 border-white/20 animate-pulse-ring [animation-delay:1.2s]"
            aria-hidden
          />
          <div className="relative flex items-center">
            <div className="-rotate-6 rounded-full animate-pop">
              <Avatar
                src={me.photo}
                alt={`Ty: ${me.name}`}
                size={124}
                className="ring-4 ring-white"
              />
            </div>
            <span className="z-10 -mx-5 flex size-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-float animate-pop [animation-delay:0.25s]">
              <ActivityIcon id={m.activity} className="size-7" strokeWidth={2.4} />
            </span>
            <div className="rotate-6 rounded-full animate-pop [animation-delay:0.12s]">
              <Avatar src={other.photo} alt={other.name} size={124} className="ring-4 ring-white" />
            </div>
          </div>
        </div>
        <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.2em] text-white/80 animate-fade-up">
          {act.label} · teraz
        </p>
        <h1 className="mt-2 text-6xl font-extrabold leading-none animate-fade-up [animation-delay:0.15s]">
          Widzicie się!
        </h1>
        <p className="mt-4 text-lg font-semibold text-white/90 animate-fade-up [animation-delay:0.25s]">
          Ty i {other.name} · „{m.title}”
        </p>
        <div className="mt-6 w-full rounded-3xl bg-white/12 p-4 text-left ring-1 ring-white/25 backdrop-blur animate-fade-up [animation-delay:0.35s]">
          <p className="flex items-center gap-2 font-bold">
            <MapPin className="size-4 shrink-0" aria-hidden /> {venue.name}
            <span className="truncate font-medium text-white/80">· {venue.address}</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-[0.9375rem]">
            <Clock3 className="size-4 shrink-0" aria-hidden />
            {myRem !== null
              ? `Dotrzesz za około ${myRem} min`
              : "Twój czas dotarcia nie jest dostępny"}
          </p>
          <p className="mt-1 pl-6 text-[0.9375rem] text-white/85">
            {otherRem !== null
              ? `Druga osoba powinna dotrzeć w ciągu ${shareBand(otherRem)}`
              : "Czas przybycia drugiej osoby nie jest obecnie dostępny"}
          </p>
          <p className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3 text-xs text-white/80">
            <EyeOff className="size-3.5 shrink-0" aria-hidden /> Nie widzicie nawzajem swoich
            lokalizacji ani tras. ETA symulowane w prototypie.
          </p>
        </div>
        <div className="mt-8 flex w-full flex-col gap-2.5 animate-fade-up [animation-delay:0.45s]">
          <Button
            block
            size="lg"
            variant="secondary"
            className="!bg-white !text-ink-950 !ring-0"
            icon={<Map className="size-5" />}
            onClick={() => navigate(`/app/map/${m.id}`, { replace: true })}
          >
            Zobacz mapę
          </Button>
          <Button
            block
            size="lg"
            variant="ghost"
            className="!text-white ring-1 ring-white/40 hover:!bg-white/10"
            icon={<MessageCircle className="size-5" />}
            onClick={() => navigate(`/app/chat/${m.id}`, { replace: true })}
          >
            Napisz wiadomość
          </Button>
        </div>
      </div>
    </div>
  );
}
