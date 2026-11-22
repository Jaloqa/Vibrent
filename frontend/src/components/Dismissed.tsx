import { ChevronRight, RotateCcw, Undo2 } from "lucide-react";
import { activityById } from "../data/catalog";
import type { Meeting, User } from "../data/types";
import { fmtDistance } from "../lib/eta";
import { navigate } from "../lib/router";
import { activeFor } from "../lib/time";
import { distanceTo, findUser, useStore, venueOf } from "../store";
import { ActivityIcon, Avatar, Button, photoUrl, SectionLabel, Sheet, useToast } from "./ui";

/** Przywrócenie z informacją zwrotną – karta wraca na górę talii. */
export function useRestore() {
  const { dispatch } = useStore();
  const toast = useToast();
  return {
    restoreOne: (m: Meeting) => {
      dispatch({ type: "restore_one", meetingId: m.id });
      toast("Przywrócono na górę talii", { tone: "success", sub: m.title });
    },
    restoreAll: (count: number) => {
      dispatch({ type: "restore_dismissed" });
      toast(`Przywrócono ${count} ${count === 1 ? "spotkanie" : "spotkania"}`, { tone: "success" });
    },
  };
}

function DismissedRow({ meeting, me }: { meeting: Meeting; me: User }) {
  const { state } = useStore();
  const { restoreOne } = useRestore();
  const org = findUser(state, meeting.organizerId);
  const act = activityById(meeting.activity);
  const d = distanceTo(me, venueOf(meeting));
  return (
    <li className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-paper">
      <button
        type="button"
        onClick={() => navigate(`/app/meeting/${meeting.id}`)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
        aria-label={`${meeting.title} – ${org?.name ?? ""}. Otwórz szczegóły`}
      >
        <span className="relative shrink-0">
          <img
            src={photoUrl(act.photo, 160, 160)}
            alt=""
            className="size-14 rounded-2xl object-cover"
          />
          {org && (
            <Avatar
              src={org.photo}
              alt=""
              size={26}
              ring
              className="absolute -bottom-1.5 -right-1.5"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-xs font-bold text-ink-600">
            <ActivityIcon id={act.id} className="size-3.5" strokeWidth={2.5} />
            {act.label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-bold text-ink-950">
            {meeting.title}
          </span>
          <span className="block truncate text-xs text-ink-600">
            {org?.name}
            {d !== null && ` · ${fmtDistance(d)}`} ·{" "}
            {activeFor(meeting.createdAt, state.now).toLowerCase()}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => restoreOne(meeting)}
        aria-label={`Przywróć: ${meeting.title}`}
        title="Przywróć do talii"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink-900 ring-1 ring-ink-200 transition hover:bg-brand-600 hover:text-white hover:ring-brand-600"
      >
        <Undo2 className="size-[1.125rem]" aria-hidden />
      </button>
    </li>
  );
}

export function DismissedList({ items, me }: { items: Meeting[]; me: User }) {
  return (
    <ul className="-mx-2 flex flex-col">
      {items.map((m) => (
        <DismissedRow key={m.id} meeting={m} me={me} />
      ))}
    </ul>
  );
}

const PANEL_LIMIT = 3;

/** Desktop: karta w panelu bocznym z ostatnio pominiętymi spotkaniami. */
export function DismissedPanel({
  items,
  me,
  onShowAll,
}: {
  items: Meeting[];
  me: User;
  onShowAll: () => void;
}) {
  const { restoreAll } = useRestore();
  return (
    <section
      className="rounded-3xl bg-white p-5 ring-1 ring-ink-200"
      aria-labelledby="dismissed-title"
    >
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>
          <span id="dismissed-title">Ostatnio pominięte</span>
        </SectionLabel>
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => restoreAll(items.length)}
            className="flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[0.8125rem] font-bold text-brand-700 hover:bg-brand-50"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Przywróć wszystkie
          </button>
        )}
      </div>
      {items.length ? (
        <>
          <div className="mt-2">
            <DismissedList items={items.slice(0, PANEL_LIMIT)} me={me} />
          </div>
          {items.length > PANEL_LIMIT && (
            <button
              type="button"
              onClick={onShowAll}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-2xl bg-paper text-sm font-bold text-ink-900 hover:bg-paper-2"
            >
              Pokaż wszystkie ({items.length}) <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-ink-200 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper text-ink-500">
            <Undo2 className="size-5" aria-hidden />
          </span>
          <p className="text-[0.8125rem] leading-snug text-ink-600">
            Odrzuciłeś kartę przez przypadek? Pojawi się tutaj – jednym kliknięciem wrócisz do niej.
          </p>
        </div>
      )}
    </section>
  );
}

/** Pełna lista pominiętych (mobile i „Pokaż wszystkie” na desktopie). */
export function DismissedSheet({
  open,
  onClose,
  items,
  me,
}: {
  open: boolean;
  onClose: () => void;
  items: Meeting[];
  me: User;
}) {
  const { restoreAll } = useRestore();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Pominięte spotkania"
      footer={
        items.length > 1 ? (
          <Button
            block
            size="lg"
            variant="secondary"
            icon={<RotateCcw className="size-5" />}
            onClick={() => {
              restoreAll(items.length);
              onClose();
            }}
          >
            Przywróć wszystkie ({items.length})
          </Button>
        ) : undefined
      }
    >
      <p className="-mt-1 text-[0.8125rem] text-ink-600">
        Przywrócone spotkanie wraca na górę talii. Spotkania, które się zakończyły albo znalazły już
        parę, znikają z tej listy.
      </p>
      {items.length ? (
        <div className="mt-3">
          <DismissedList items={items} me={me} />
        </div>
      ) : (
        <p className="mt-6 pb-4 text-center text-sm font-semibold text-ink-600">
          Nie masz pominiętych spotkań.
        </p>
      )}
    </Sheet>
  );
}
