import {
  Ban,
  Flag,
  Lock,
  Map,
  MoreVertical,
  RotateCw,
  SendHorizontal,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReportSheet } from "../components/ReportSheet";
import {
  Avatar,
  Button,
  cx,
  EmptyState,
  IconButton,
  Modal,
  Sheet,
  useToast,
} from "../components/ui";
import { goBack, navigate } from "../lib/router";
import { clock } from "../lib/time";
import { findUser, otherPartyId, uid, useMe, useStore } from "../store";

const QUICK = [
  "Cześć! Do zobaczenia za chwilę",
  "Jestem już na miejscu",
  "Usiądę przy stoliku obok wejścia",
  "Jak Cię rozpoznam?",
];
const PHONE = /(\+?\d[\d\s-]{7,}\d)/;

export function Chat({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const m = state.meetings.find((x) => x.id === id);
  const msgs = state.messages.filter((x) => x.meetingId === id);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  // oznacz powiadomienia z tego czatu jako przeczytane
  useEffect(() => {
    state.notifications
      .filter((n) => n.userId === me.id && !n.read && n.link === `/app/chat/${id}`)
      .forEach((n) => dispatch({ type: "read_notification", id: n.id }));
  }, [state.notifications, me.id, id, dispatch]);

  const member = m && m.participantId && (m.organizerId === me.id || m.participantId === me.id);
  if (!m || !member) {
    return (
      <EmptyState
        icon={<Lock className="size-9" />}
        title="Czat jeszcze zablokowany"
        actions={<Button onClick={() => goBack("/app")}>Wróć</Button>}
      >
        Tymczasowy czat odblokowuje się dopiero po zaakceptowaniu zgłoszenia przez organizatora.
      </EmptyState>
    );
  }
  const other = findUser(state, otherPartyId(m, me.id))!;
  const canWrite = m.status === "matched";
  const lockReason =
    m.status === "in_progress"
      ? "Spotkanie się rozpoczęło – czat jest tylko do odczytu."
      : m.status === "finished"
        ? "Spotkanie zakończone – czat został zamknięty."
        : m.status === "cancelled"
          ? "Spotkanie anulowane – czat został zamknięty."
          : m.status === "not_realized"
            ? "Spotkanie niezrealizowane – czat został zamknięty."
            : "";

  const send = (t: string) => {
    const v = t.trim();
    if (!v || !canWrite) return;
    dispatch({ type: "send_message", meetingId: m.id, text: v, id: uid("c") });
    if (state.offline)
      toast("Nie udało się wysłać wiadomości", {
        tone: "error",
        sub: "Brak internetu. Możesz ponowić wysyłkę.",
      });
    setText("");
  };

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="flex min-h-16 items-center gap-2 border-b border-ink-200 bg-white px-3 lg:px-8">
        <IconButton label="Wstecz" onClick={() => goBack(`/app/map/${m.id}`)}>
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </IconButton>
        <button
          type="button"
          onClick={() => navigate(`/app/user/${other.id}`)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
        >
          <Avatar src={other.photo} alt="" size={42} />
          <span className="min-w-0">
            <span className="block truncate text-base font-bold">{other.name}</span>
            <span className="block truncate text-[0.8125rem] text-ink-600">{m.title}</span>
          </span>
        </button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Map className="size-4" />}
          onClick={() => navigate(`/app/map/${m.id}`)}
          className="hidden sm:inline-flex"
        >
          Mapa spotkania
        </Button>
        <IconButton
          label="Mapa spotkania"
          onClick={() => navigate(`/app/map/${m.id}`)}
          className="sm:hidden"
        >
          <Map className="size-5" />
        </IconButton>
        <IconButton label="Więcej opcji: zablokuj lub zgłoś" onClick={() => setMenu(true)}>
          <MoreVertical className="size-5" />
        </IconButton>
      </header>

      <div className="flex items-center justify-center gap-2 bg-ink-950 px-4 py-2 text-center text-xs font-semibold text-white">
        <Timer className="size-3.5 shrink-0" aria-hidden /> Czat tymczasowy – działa tylko do
        rozpoczęcia spotkania
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-5"
        role="log"
        aria-live="polite"
        aria-label="Wiadomości"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <p className="mx-auto mb-3 max-w-xs rounded-2xl bg-white px-4 py-2.5 text-center text-xs leading-relaxed text-ink-600 ring-1 ring-ink-200">
            Dopasowanie {m.matchedAt !== undefined ? `o ${clock(m.matchedAt)}` : ""}. Ustalcie
            drobne szczegóły. Nie podawaj numeru telefonu ani adresu.
          </p>
          {msgs.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-600">
              Napisz pierwszą wiadomość – np. jak Cię rozpoznać.
            </p>
          )}
          {msgs.map((msg) => {
            const mine = msg.fromId === me.id;
            return (
              <div key={msg.id} className={cx("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cx(
                    "max-w-[80%] rounded-[1.375rem] px-4 py-2.5 text-[0.9375rem] leading-snug animate-fade-up",
                    mine
                      ? msg.failed
                        ? "rounded-br-md bg-white text-ink-950 ring-2 ring-red-400"
                        : "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md bg-white text-ink-950 ring-1 ring-ink-200",
                  )}
                >
                  {msg.text}
                </div>
                {msg.failed ? (
                  <button
                    type="button"
                    onClick={() =>
                      state.offline
                        ? toast("Nadal brak internetu", { tone: "error" })
                        : dispatch({ type: "retry_message", messageId: msg.id })
                    }
                    className="mt-1 flex min-h-8 items-center gap-1 text-xs font-bold text-red-700"
                  >
                    <RotateCw className="size-3.5" aria-hidden /> Nie wysłano · Ponów
                  </button>
                ) : (
                  <span className="mt-1 px-1 text-[0.6875rem] text-ink-600">{clock(msg.at)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-ink-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {canWrite ? (
            <>
              <div className="no-scrollbar -mx-3 mb-2 flex gap-2 overflow-x-auto px-3">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="min-h-10 shrink-0 rounded-full bg-paper px-3.5 text-[0.8125rem] font-bold text-ink-800 ring-1 ring-ink-200 hover:ring-ink-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
              {PHONE.test(text) && (
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <ShieldAlert className="size-3.5" aria-hidden /> Wygląda na numer telefonu. Dla
                  bezpieczeństwa nie udostępniaj danych kontaktowych przed spotkaniem.
                </p>
              )}
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(text);
                }}
              >
                <label htmlFor="msg" className="sr-only">
                  Wiadomość
                </label>
                <input
                  id="msg"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={300}
                  placeholder={`Napisz do: ${other.name}…`}
                  autoComplete="off"
                  className="min-h-12 flex-1 rounded-full bg-paper px-5 text-[0.9375rem] outline-none ring-1 ring-ink-200 focus:ring-2 focus:ring-brand-600"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  aria-label="Wyślij wiadomość"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-500"
                >
                  <SendHorizontal className="size-5" />
                </button>
              </form>
            </>
          ) : (
            <div
              className="flex items-center gap-3 rounded-2xl bg-ink-100 px-4 py-3.5 text-sm font-semibold text-ink-800"
              role="status"
            >
              <Lock className="size-5 shrink-0" aria-hidden /> {lockReason}
            </div>
          )}
        </div>
      </footer>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Bezpieczeństwo">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => (setMenu(false), setReportOpen(true))}
            className="flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left font-bold ring-1 ring-ink-200 hover:bg-paper"
          >
            <Flag className="size-5" aria-hidden /> Zgłoś nadużycie
          </button>
          <button
            type="button"
            onClick={() => (setMenu(false), setBlockOpen(true))}
            className="flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
          >
            <Ban className="size-5" aria-hidden /> Zablokuj: {other.name}
          </button>
        </div>
      </Sheet>
      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        kind="abuse"
        meetingId={m.id}
        targetId={other.id}
      />
      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={`Zablokować: ${other.name}?`}
        icon={<Ban className="size-7" />}
        actions={
          <>
            <Button
              block
              variant="dark"
              onClick={() => {
                dispatch({ type: "block", targetId: other.id });
                setBlockOpen(false);
                toast(`Zablokowano: ${other.name}`, {
                  sub: "Nie zobaczycie już swoich propozycji.",
                });
                navigate("/app/meetings/historia", { replace: true });
              }}
            >
              Zablokuj
            </Button>
            <Button block variant="ghost" onClick={() => setBlockOpen(false)}>
              Anuluj
            </Button>
          </>
        }
      >
        Spotkanie zostanie anulowane, a czat zamknięty. Ta osoba nie zobaczy Twoich propozycji, a Ty
        jej. Nie powiadomimy jej o blokadzie.
      </Modal>
    </div>
  );
}
