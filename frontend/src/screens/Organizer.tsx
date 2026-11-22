import { CircleCheck, Clock3, Inbox, UserPlus, X, Check, Lock } from "lucide-react";
import { useState } from "react";
import { activityById } from "../data/catalog";
import { PersonCard, VenueCard } from "../components/cards";
import { TopBar } from "../components/Shell";
import {
  ActivityChip,
  Avatar,
  Button,
  EmptyState,
  MeetingStatusPill,
  Modal,
  Notice,
  photoUrl,
  RequestStatusPill,
  SectionLabel,
  useToast,
} from "../components/ui";
import { navigate } from "../lib/router";
import { activeFor, ago } from "../lib/time";
import { findUser, isBusy, uid, useMe, useStore, venueOf } from "../store";
import type { JoinRequest } from "../data/types";

export function Organizer({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const [confirmReq, setConfirmReq] = useState<JoinRequest | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const m = state.meetings.find((x) => x.id === id);

  if (!m || m.organizerId !== me.id) {
    return (
      <>
        <TopBar title="Panel organizatora" />
        <EmptyState
          icon={<Lock className="size-9" />}
          title="Brak dostępu"
          actions={
            <Button onClick={() => navigate("/app/meetings/organizowane")}>Moje spotkania</Button>
          }
        >
          Panel organizatora jest dostępny tylko dla osoby, która utworzyła spotkanie.
        </EmptyState>
      </>
    );
  }

  const venue = venueOf(m);
  const act = activityById(m.activity);
  const reqs = state.requests.filter((r) => r.meetingId === m.id && r.status !== "cancelled");
  const pending = reqs.filter((r) => r.status === "pending");
  const decided = reqs.filter((r) => r.status !== "pending");
  const participant = findUser(state, m.participantId);

  const accept = (r: JoinRequest) => {
    if (state.offline)
      return toast("Brak internetu – nie udało się zaakceptować", { tone: "error" });
    dispatch({ type: "accept", requestId: r.id });
    setConfirmReq(null);
    navigate(`/app/match/${m.id}`);
  };

  return (
    <div className="pb-12">
      <TopBar title="Panel organizatora" sub={m.title} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-5 lg:grid-cols-[400px_1fr] lg:px-8 lg:pt-8">
        <section
          aria-labelledby="sum"
          className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200">
            <div className="relative h-40">
              <img src={photoUrl(act.photo, 800, 400)} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
              <div className="absolute bottom-3 left-4 flex gap-2">
                <ActivityChip id={m.activity} onDark size="sm" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 id="sum" className="text-xl font-extrabold leading-tight">
                  {m.title}
                </h2>
                <MeetingStatusPill status={m.status} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{m.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-600">
                <Clock3 className="size-4" aria-hidden />{" "}
                {m.status === "active"
                  ? activeFor(m.createdAt, state.now)
                  : `Utworzone ${ago(m.createdAt, state.now)}`}
              </p>
            </div>
          </div>
          <VenueCard venue={venue} me={me} activity={m.activity} />
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-ink-200">
              <dt className="text-xs font-bold text-ink-600">Oczekujące zgłoszenia</dt>
              <dd className="mt-1 font-display text-3xl font-extrabold">{pending.length}</dd>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-ink-200">
              <dt className="text-xs font-bold text-ink-600">Miejsca</dt>
              <dd className="mt-1 font-display text-3xl font-extrabold">
                {m.participantId ? "2/2" : "1/2"}
              </dd>
            </div>
          </dl>
          {m.status === "active" && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              Anuluj spotkanie
            </Button>
          )}
        </section>

        <section aria-labelledby="req-title">
          {participant && (m.status === "matched" || m.status === "in_progress") && (
            <div className="mb-6 rounded-3xl bg-ink-950 p-5 text-white">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-300">
                <CircleCheck className="size-4" aria-hidden /> Spotkanie zarezerwowane dla dwóch
                osób
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar src={participant.photo} alt="" size={52} />
                <div className="flex-1">
                  <p className="text-lg font-bold">Spotykasz się z: {participant.name}</p>
                  <p className="text-sm text-white/75">
                    Pozostałe zgłoszenia zostały zamknięte, a te osoby otrzymały informację.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigate(`/app/map/${m.id}`)}>Zobacz mapę</Button>
                <Button variant="secondary" onClick={() => navigate(`/app/chat/${m.id}`)}>
                  Napisz wiadomość
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="req-title" className="text-2xl font-extrabold">
                Zainteresowane osoby
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                {m.status === "active"
                  ? "Wybierz jedną osobę – spotkanie jest 1:1."
                  : "Wybór został dokonany."}
              </p>
            </div>
            {m.status === "active" && (
              <Button
                size="sm"
                variant="ghost"
                icon={<UserPlus className="size-4" />}
                onClick={() => {
                  dispatch({ type: "simulate_request", meetingId: m.id, id: uid("r") });
                  toast("Nadeszło nowe zgłoszenie (symulacja)");
                }}
              >
                Symuluj zgłoszenie
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {pending.length === 0 && m.status === "active" && (
              <EmptyState icon={<Inbox className="size-9" />} title="Brak zgłoszeń">
                Jeszcze nikt się nie zgłosił. Spotkanie jest widoczne dla osób w okolicy – zwykle
                pierwsze zgłoszenia przychodzą w ciągu kilku minut.
              </EmptyState>
            )}
            {pending.map((r) => {
              const u = findUser(state, r.userId)!;
              const busy = isBusy(state, u.id);
              return (
                <div key={r.id} className="animate-fade-up">
                  <PersonCard
                    user={u}
                    me={me}
                    status={
                      <span className="text-xs font-semibold text-ink-600">
                        {ago(r.createdAt, state.now)}
                      </span>
                    }
                    onViewProfile={() => navigate(`/app/user/${u.id}`)}
                    actions={
                      m.status === "active" ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            icon={<X className="size-4" />}
                            onClick={() => {
                              dispatch({ type: "reject", requestId: r.id });
                              toast(`Odrzucono zgłoszenie: ${u.name}`);
                            }}
                          >
                            Odrzuć
                          </Button>
                          <Button
                            size="sm"
                            variant="success"
                            icon={<Check className="size-4" />}
                            disabled={busy}
                            onClick={() => setConfirmReq(r)}
                          >
                            Akceptuj
                          </Button>
                        </>
                      ) : undefined
                    }
                  />
                  {busy && (
                    <p className="mt-1.5 px-2 text-xs font-semibold text-amber-900">
                      Ta osoba ma już inne potwierdzone spotkanie – nie można jej teraz
                      zaakceptować.
                    </p>
                  )}
                </div>
              );
            })}
            {decided.length > 0 && (
              <>
                <SectionLabel className="mt-4">Rozpatrzone</SectionLabel>
                {decided.map((r) => {
                  const u = findUser(state, r.userId)!;
                  return (
                    <PersonCard
                      key={r.id}
                      user={u}
                      me={me}
                      muted={r.status !== "accepted"}
                      status={<RequestStatusPill status={r.status} />}
                      onViewProfile={() => navigate(`/app/user/${u.id}`)}
                    />
                  );
                })}
              </>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={!!confirmReq}
        onClose={() => setConfirmReq(null)}
        title={`Akceptować: ${findUser(state, confirmReq?.userId)?.name}?`}
        icon={<CircleCheck className="size-7" />}
        actions={
          <>
            <Button block onClick={() => confirmReq && accept(confirmReq)}>
              Akceptuj i rezerwuj spotkanie
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmReq(null)}>
              Jeszcze nie
            </Button>
          </>
        }
      >
        Spotkanie zostanie zarezerwowane dla Was dwojga.{" "}
        {pending.length > 1 &&
          `Pozostałe zgłoszenia (${pending.length - 1}) zostaną zamknięte, a te osoby dostaną informację. `}
        Odblokujemy mapę i tymczasowy czat.
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Anulować spotkanie?"
        actions={
          <>
            <Button
              block
              variant="dark"
              onClick={() => {
                dispatch({
                  type: "cancel_meeting",
                  meetingId: m.id,
                  reason: "Organizator anulował propozycję",
                });
                setCancelOpen(false);
                toast("Spotkanie anulowane");
                navigate("/app/meetings/historia", { replace: true });
              }}
            >
              Tak, anuluj
            </Button>
            <Button block variant="ghost" onClick={() => setCancelOpen(false)}>
              Wróć
            </Button>
          </>
        }
      >
        Propozycja zniknie z Odkrywaj.{" "}
        {pending.length > 0 &&
          `Osoby, które się zgłosiły (${pending.length}), dostaną powiadomienie.`}
      </Modal>
      {m.status !== "active" && m.status !== "matched" && m.status !== "in_progress" && (
        <div className="mx-auto mt-6 max-w-6xl px-4 lg:px-8">
          <Notice tone="info">To spotkanie nie jest już aktywne.</Notice>
        </div>
      )}
    </div>
  );
}
