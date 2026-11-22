import {
  Ban,
  Bell,
  CalendarX2,
  CheckCheck,
  CircleCheck,
  Flag,
  Handshake,
  MessageCircle,
  Timer,
  TriangleAlert,
  UserPlus,
  XCircle,
} from "lucide-react";
import type { NotificationType } from "../data/types";
import { Page } from "../components/Shell";
import { Button, cx, EmptyState, SectionLabel } from "../components/ui";
import { navigate } from "../lib/router";
import { ago } from "../lib/time";
import { useStore } from "../store";

const META: Record<NotificationType, { icon: typeof Bell; cls: string; label: string }> = {
  request_new: { icon: UserPlus, cls: "bg-brand-100 text-brand-800", label: "Nowe zgłoszenie" },
  request_accepted: {
    icon: CircleCheck,
    cls: "bg-emerald-100 text-emerald-900",
    label: "Akceptacja",
  },
  request_rejected: { icon: XCircle, cls: "bg-ink-100 text-ink-800", label: "Odrzucenie" },
  match: { icon: Handshake, cls: "bg-brand-600 text-white", label: "Match" },
  message: { icon: MessageCircle, cls: "bg-sky-100 text-sky-900", label: "Wiadomość" },
  late: { icon: Timer, cls: "bg-amber-100 text-amber-900", label: "Możliwe spóźnienie" },
  cancelled: { icon: CalendarX2, cls: "bg-red-100 text-red-800", label: "Anulowanie" },
  arrival_issue: {
    icon: TriangleAlert,
    cls: "bg-amber-100 text-amber-900",
    label: "Problem z dotarciem",
  },
  report: { icon: Flag, cls: "bg-ink-950 text-white", label: "Zgłoszenie" },
};

export function Notifications() {
  const { state, dispatch } = useStore();
  const list = state.notifications
    .filter((n) => n.userId === state.currentUserId)
    .sort((a, b) => b.at - a.at);
  const unread = list.filter((n) => !n.read);
  const read = list.filter((n) => n.read);

  const Item = ({ n }: { n: (typeof list)[number] }) => {
    const meta = META[n.type] ?? { icon: Ban, cls: "bg-ink-100", label: "" };
    const I = meta.icon;
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "read_notification", id: n.id });
            navigate(n.link);
          }}
          className={cx(
            "flex w-full items-start gap-3.5 rounded-3xl p-4 text-left transition",
            n.read
              ? "bg-transparent hover:bg-white"
              : "bg-white shadow-sm ring-1 ring-ink-200 hover:ring-ink-300",
          )}
        >
          <span
            className={cx(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              meta.cls,
            )}
          >
            <I className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span
                className={cx(
                  "text-[0.9375rem]",
                  n.read ? "font-semibold text-ink-800" : "font-extrabold",
                )}
              >
                {n.title}
              </span>
              <span className="shrink-0 text-xs text-ink-600">{ago(n.at, state.now)}</span>
            </span>
            <span className="mt-0.5 block text-sm leading-snug text-ink-700">{n.body}</span>
            <span className="sr-only">{n.read ? "Przeczytane" : "Nieprzeczytane"}</span>
          </span>
          {!n.read && (
            <span className="mt-2 size-2.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
          )}
        </button>
      </li>
    );
  };

  return (
    <Page className="pt-5 lg:pt-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold lg:text-4xl">Powiadomienia</h1>
        {unread.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            icon={<CheckCheck className="size-4" />}
            onClick={() => dispatch({ type: "read_all" })}
          >
            Oznacz wszystkie
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-600">
        W prototypie powiadomienia są generowane przez symulację – nie są to prawdziwe wiadomości
        push.
      </p>
      {list.length === 0 ? (
        <EmptyState icon={<Bell className="size-9" />} title="Cisza i spokój">
          Tu pojawią się zgłoszenia, matche i wiadomości dotyczące Twoich spotkań.
        </EmptyState>
      ) : (
        <>
          {unread.length > 0 && (
            <>
              <SectionLabel className="mt-6">Nowe · {unread.length}</SectionLabel>
              <ul className="mt-2 flex flex-col gap-2">
                {unread.map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </ul>
            </>
          )}
          {read.length > 0 && (
            <>
              <SectionLabel className="mt-6">Wcześniej</SectionLabel>
              <ul className="mt-2 flex flex-col gap-1">
                {read.map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Page>
  );
}
