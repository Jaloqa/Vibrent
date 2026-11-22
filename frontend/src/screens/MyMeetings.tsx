import {
  CalendarCheck2,
  History,
  Hourglass,
  Map,
  MessageCircle,
  Megaphone,
  Plus,
  Timer,
} from "lucide-react";
import { MeetingRow } from "../components/cards";
import { Page } from "../components/Shell";
import { Button, cx, EmptyState, RequestStatusPill, StatusPill, useToast } from "../components/ui";
import { arrivalPlan, computeEta, remainingMin } from "../lib/eta";
import { navigate } from "../lib/router";
import { ago } from "../lib/time";
import { findUser, myConfirmed, otherPartyId, useMe, useStore, venueOf } from "../store";
import type { Meeting } from "../data/types";

const TABS = [
  { id: "oczekujace", label: "Oczekujące" },
  { id: "potwierdzone", label: "Potwierdzone" },
  { id: "organizowane", label: "Organizowane" },
  { id: "historia", label: "Historia" },
] as const;

export function MyMeetings({ tab }: { tab?: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const active = TABS.find((t) => t.id === tab)?.id ?? "oczekujace";

  const pending = state.requests.filter((r) => r.userId === me.id && r.status === "pending");
  const confirmed = myConfirmed(state, me.id);
  const organized = state.meetings.filter((m) => m.organizerId === me.id && m.status === "active");
  const histMeetings = state.meetings.filter(
    (m) =>
      (m.organizerId === me.id || m.participantId === me.id) &&
      ["finished", "cancelled", "not_realized"].includes(m.status),
  );
  const histRequests = state.requests.filter(
    (r) => r.userId === me.id && ["rejected", "closed", "cancelled"].includes(r.status),
  );
  const history = [
    ...histMeetings.map((m) => ({ kind: "m" as const, m, at: m.endedAt ?? m.createdAt })),
    ...histRequests.map((r) => ({
      kind: "r" as const,
      r,
      m: state.meetings.find((x) => x.id === r.meetingId)!,
      at: r.createdAt,
    })),
  ]
    .filter((x) => x.m)
    .sort((a, b) => b.at - a.at);

  const counts: Record<string, number> = {
    oczekujace: pending.length,
    potwierdzone: confirmed.length,
    organizowane: organized.length,
    historia: history.length,
  };

  return (
    <Page className="pt-5 lg:pt-10">
      <h1 className="text-3xl font-extrabold lg:text-4xl">Moje spotkania</h1>
      <div
        role="tablist"
        aria-label="Rodzaje spotkań"
        className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => navigate(`/app/meetings/${t.id}`, { replace: true })}
            className={cx(
              "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition",
              active === t.id
                ? "bg-ink-950 text-white"
                : "bg-white text-ink-800 ring-1 ring-ink-200 hover:ring-ink-300",
            )}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span
                className={cx(
                  "rounded-full px-1.5 text-xs",
                  active === t.id ? "bg-white/20" : "bg-ink-100",
                )}
              >
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-5 flex flex-col gap-3">
        {active === "oczekujace" &&
          (pending.length ? (
            pending.map((r) => {
              const m = state.meetings.find((x) => x.id === r.meetingId)!;
              return (
                <MeetingRow
                  key={r.id}
                  meeting={m}
                  me={me}
                  onClick={() => navigate(`/app/meeting/${m.id}`)}
                  status={<RequestStatusPill status="pending" />}
                  meta={
                    <span className="text-xs text-ink-600">
                      wysłane {ago(r.createdAt, state.now)}
                    </span>
                  }
                  footer={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        dispatch({ type: "cancel_request", requestId: r.id });
                        toast("Zgłoszenie wycofane");
                      }}
                    >
                      Wycofaj zgłoszenie
                    </Button>
                  }
                />
              );
            })
          ) : (
            <EmptyState
              icon={<Hourglass className="size-9" />}
              title="Brak oczekujących zgłoszeń"
              actions={<Button onClick={() => navigate("/app")}>Odkrywaj spotkania</Button>}
            >
              Przesuń kartę w prawo, aby wysłać zgłoszenie. Tutaj zobaczysz, na co czekasz.
            </EmptyState>
          ))}

        {active === "potwierdzone" &&
          (confirmed.length ? (
            confirmed.map((m) => <ConfirmedRow key={m.id} m={m} />)
          ) : (
            <EmptyState
              icon={<CalendarCheck2 className="size-9" />}
              title="Brak potwierdzonych spotkań"
              actions={<Button onClick={() => navigate("/app")}>Znajdź spotkanie</Button>}
            >
              Gdy organizator zaakceptuje Twoje zgłoszenie (lub Ty kogoś zaakceptujesz), spotkanie
              pojawi się tutaj.
            </EmptyState>
          ))}

        {active === "organizowane" &&
          (organized.length ? (
            organized.map((m) => {
              const n = state.requests.filter(
                (r) => r.meetingId === m.id && r.status === "pending",
              ).length;
              return (
                <MeetingRow
                  key={m.id}
                  meeting={m}
                  me={me}
                  onClick={() => navigate(`/app/organize/${m.id}`)}
                  meta={
                    <span
                      className={cx(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        n ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700",
                      )}
                    >
                      {n
                        ? `${n} ${n === 1 ? "zgłoszenie" : n < 5 ? "zgłoszenia" : "zgłoszeń"}`
                        : "Brak zgłoszeń"}
                    </span>
                  }
                  footer={
                    <Button size="sm" onClick={() => navigate(`/app/organize/${m.id}`)}>
                      Panel organizatora
                    </Button>
                  }
                />
              );
            })
          ) : (
            <EmptyState
              icon={<Megaphone className="size-9" />}
              title="Nie organizujesz teraz spotkania"
              actions={
                <Button icon={<Plus className="size-5" />} onClick={() => navigate("/app/create")}>
                  Utwórz spotkanie
                </Button>
              }
            >
              Masz wolną chwilę? Opublikuj propozycję – zajmie to mniej niż minutę.
            </EmptyState>
          ))}

        {active === "historia" &&
          (history.length ? (
            history.map((h) =>
              h.kind === "m" ? (
                <MeetingRow
                  key={`m-${h.m.id}`}
                  meeting={h.m}
                  me={me}
                  onClick={() => navigate(`/app/finished/${h.m.id}`)}
                  meta={<span className="text-xs text-ink-600">{ago(h.at, state.now)}</span>}
                />
              ) : (
                <MeetingRow
                  key={`r-${h.r.id}`}
                  meeting={h.m}
                  me={undefined}
                  status={<RequestStatusPill status={h.r.status} />}
                  meta={
                    <span className="text-xs text-ink-600">
                      Twoje zgłoszenie · {ago(h.at, state.now)}
                    </span>
                  }
                />
              ),
            )
          ) : (
            <EmptyState icon={<History className="size-9" />} title="Historia jest pusta">
              Zakończone, anulowane i niezrealizowane spotkania pojawią się tutaj.
            </EmptyState>
          ))}
      </div>
    </Page>
  );
}

function ConfirmedRow({ m }: { m: Meeting }) {
  const { state } = useStore();
  const me = useMe()!;
  const otherId = otherPartyId(m, me.id)!;
  const venue = venueOf(m);
  const myEta = computeEta(me, venue);
  const otherEta = computeEta(findUser(state, otherId), venue);
  const plan = arrivalPlan(m, { [me.id]: myEta, [otherId]: otherEta });
  const rem = remainingMin(myEta, m, me.id, state.now);
  return (
    <MeetingRow
      meeting={m}
      me={me}
      onClick={() => navigate(`/app/map/${m.id}`)}
      meta={
        <>
          {m.status === "matched" && rem !== null && (
            <span className="flex items-center gap-1 text-xs font-bold text-ink-800">
              <Timer className="size-3.5" aria-hidden /> Dotrzesz za ok. {rem} min
            </span>
          )}
          {plan.late[otherId] && (
            <StatusPill label="Możliwe spóźnienie" cls="bg-amber-100 text-amber-900" />
          )}
        </>
      }
      footer={
        <>
          <Button
            size="sm"
            icon={<Map className="size-4" />}
            onClick={() => navigate(`/app/map/${m.id}`)}
          >
            Mapa
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<MessageCircle className="size-4" />}
            onClick={() => navigate(`/app/chat/${m.id}`)}
          >
            {m.status === "matched" ? "Czat" : "Czat (tylko odczyt)"}
          </Button>
        </>
      }
    />
  );
}
