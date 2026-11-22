import { Flag, MapPin, Search, ShieldCheck, UserX } from "lucide-react";
import { useState } from "react";
import { activityById } from "../data/catalog";
import { ReportSheet } from "../components/ReportSheet";
import { TopBar } from "../components/Shell";
import {
  ActivityChip,
  Avatar,
  Button,
  EmptyState,
  MeetingStatusPill,
  Notice,
  photoUrl,
} from "../components/ui";
import { navigate, Redirect } from "../lib/router";
import { clock } from "../lib/time";
import { findUser, otherPartyId, useMe, useStore, venueOf } from "../store";

export function Finished({ id }: { id: string }) {
  const { state } = useStore();
  const me = useMe()!;
  const [report, setReport] = useState<null | "no_show" | "abuse">(null);
  const m = state.meetings.find((x) => x.id === id);
  if (!m || (m.organizerId !== me.id && m.participantId !== me.id)) {
    return (
      <>
        <TopBar title="Spotkanie" />
        <EmptyState
          icon={<Search className="size-9" />}
          title="Nie znaleziono spotkania"
          actions={<Button onClick={() => navigate("/app")}>Znajdź spotkanie</Button>}
        />
      </>
    );
  }
  if (m.status === "matched" || m.status === "in_progress") {
    return <Redirect to={`/app/map/${m.id}`} />;
  }
  const other = findUser(state, otherPartyId(m, me.id));
  const venue = venueOf(m);
  const act = activityById(m.activity);
  const myReport = state.reports.find((r) => r.meetingId === m.id && r.reporterId === me.id);
  const titles: Record<string, string> = {
    finished: "Spotkanie zakończone",
    cancelled: "Spotkanie anulowane",
    not_realized: "Spotkanie niezrealizowane",
    active: "Spotkanie aktywne",
  };

  return (
    <div className="pb-12">
      <TopBar title={titles[m.status]} onBack={() => navigate("/app/meetings/historia")} />
      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="overflow-hidden rounded-[1.875rem] bg-white shadow-card ring-1 ring-ink-200 animate-fade-up">
          <div className="relative h-44">
            <img src={photoUrl(act.photo, 800, 400)} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <ActivityChip id={m.activity} onDark size="sm" />
              <MeetingStatusPill status={m.status} />
            </div>
          </div>
          <div className="p-5">
            <h1 className="text-2xl font-extrabold leading-tight">{m.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
              <MapPin className="size-4" aria-hidden /> {venue.name}, {venue.address}
            </p>
            {other && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-paper p-3">
                <Avatar src={other.photo} alt="" size={44} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-ink-600">
                    {m.organizerId === me.id ? "Uczestnik" : "Organizator"}
                  </p>
                  <p className="font-bold">{other.name}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/app/user/${other.id}`)}>
                  Profil
                </Button>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {m.startedAt !== undefined && (
                <div className="rounded-2xl bg-paper p-3">
                  <dt className="text-xs font-bold text-ink-600">Start</dt>
                  <dd className="font-bold">{clock(m.startedAt)}</dd>
                </div>
              )}
              {m.endedAt !== undefined && (
                <div className="rounded-2xl bg-paper p-3">
                  <dt className="text-xs font-bold text-ink-600">
                    {m.status === "finished" ? "Koniec" : "Zamknięte"}
                  </dt>
                  <dd className="font-bold">{clock(m.endedAt)}</dd>
                </div>
              )}
            </dl>
            {m.cancelReason && <p className="mt-3 text-sm text-ink-700">{m.cancelReason}.</p>}
          </div>
        </div>

        {myReport && (
          <Notice
            tone="info"
            className="mt-4"
            title="Zgłoszenie w weryfikacji"
            icon={<ShieldCheck className="size-[1.125rem]" />}
          >
            {myReport.reason}. Zgłoszenie przyjęte i wymaga weryfikacji. Nie naliczono żadnych
            automatycznych konsekwencji.
          </Notice>
        )}

        <Button
          block
          size="lg"
          className="mt-6"
          icon={<Search className="size-5" />}
          onClick={() => navigate("/app")}
        >
          Znajdź kolejne spotkanie
        </Button>

        {other && !myReport && m.status !== "cancelled" && (
          <div className="mt-6 rounded-3xl bg-white p-4 ring-1 ring-ink-200">
            <p className="text-sm font-bold">Coś poszło nie tak? (opcjonalnie)</p>
            <div className="mt-2 flex flex-col">
              {m.status !== "not_realized" && (
                <button
                  type="button"
                  onClick={() => setReport("no_show")}
                  className="flex min-h-11 items-center gap-2 text-left text-sm font-semibold text-ink-800 underline underline-offset-4"
                >
                  <UserX className="size-4" aria-hidden /> Zgłoś nieobecność drugiej osoby
                </button>
              )}
              <button
                type="button"
                onClick={() => setReport("abuse")}
                className="flex min-h-11 items-center gap-2 text-left text-sm font-semibold text-ink-800 underline underline-offset-4"
              >
                <Flag className="size-4" aria-hidden /> Zgłoś problem z zachowaniem
              </button>
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-xs text-ink-600">
          Vibrent nie ocenia osób. Zgłoszenia są weryfikowane ręcznie.
        </p>
      </div>
      {report && (
        <ReportSheet
          open
          onClose={() => setReport(null)}
          kind={report}
          meetingId={m.id}
          targetId={other?.id}
        />
      )}
    </div>
  );
}
