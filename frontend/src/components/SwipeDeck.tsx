import { Heart, Info, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { activityById } from "../data/catalog";
import type { Meeting, User } from "../data/types";
import { computeEta, fmtDistance } from "../lib/eta";
import { age, activeFor } from "../lib/time";
import { commonInterests, distanceTo, findUser, useStore, venueOf } from "../store";
import { ActivityChip, Avatar, Chip, cx, NowBadge, photoUrl } from "./ui";

const THRESHOLD = 110;
const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function MeetingCardFace({
  meeting,
  me,
  preview,
}: {
  meeting: Meeting;
  me?: User;
  preview?: boolean;
}) {
  const { state } = useStore();
  const org = findUser(state, meeting.organizerId);
  const venue = venueOf(meeting);
  const act = activityById(meeting.activity);
  const dist = me ? distanceTo(me, venue) : null;
  const eta = me ? computeEta(me, venue) : null;
  const common = commonInterests(me, org);
  return (
    <div className="relative size-full overflow-hidden rounded-[1.875rem] bg-ink-900 text-white shadow-card select-none">
      <img
        src={photoUrl(act.photo, 900, 1200)}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-transparent to-ink-950" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
        <NowBadge />
        <ActivityChip id={meeting.activity} onDark size="sm" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-white/85">
          <span>{activeFor(meeting.createdAt, state.now)}</span>
          {eta?.available && (
            <>
              <span aria-hidden>·</span>
              <span>dojście ok. {eta.safeMin} min</span>
            </>
          )}
        </div>
        <h3 className="text-[1.75rem] font-extrabold leading-[1.05] text-balance">
          {meeting.title}
        </h3>
        <p className="flex items-center gap-1.5 text-[0.9375rem] font-semibold">
          <MapPin className="size-4 shrink-0 text-brand-300" aria-hidden />
          <span className="truncate">{venue.name}</span>
          {dist !== null && <span className="shrink-0 text-white/75">· {fmtDistance(dist)}</span>}
        </p>
        <p className="line-clamp-2 text-[0.9375rem] leading-snug text-white/85">
          {meeting.description}
        </p>
        {org && (
          <div className="flex items-center gap-3 border-t border-white/15 pt-3">
            <Avatar src={org.photo} alt="" size={40} className="ring-2 ring-white/80" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9375rem] font-bold">
                {org.name}
                {org.showAge && (
                  <span className="font-semibold text-white/75">, {age(org.birthYear)}</span>
                )}
              </p>
              <p className="truncate text-xs text-white/75">{org.styles.slice(0, 2).join(" · ")}</p>
            </div>
          </div>
        )}
        {!preview && common.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-white/75">Wspólne:</span>
            {common.slice(0, 3).map((i) => (
              <Chip key={i} size="sm" className="!bg-white/15 !text-white !ring-white/25">
                {i}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DeckProps {
  meetings: Meeting[];
  me: User;
  /** wywoływane po animacji wylotu karty */
  onSwipe: (dir: "left" | "right", m: Meeting) => void;
  /** sprawdzenie przed animacją – false zatrzymuje kartę (np. brak internetu) */
  canSwipe?: (dir: "left" | "right", m: Meeting) => boolean;
  onOpen: (m: Meeting) => void;
}

export function SwipeDeck({ meetings, me, onSwipe, canSwipe, onOpen }: DeckProps) {
  const [drag, setDrag] = useState({ dx: 0, dy: 0, active: false });
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const top = meetings[0];
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrag({ dx: 0, dy: 0, active: false });
    setLeaving(null);
  }, [top?.id]);

  const commit = (dir: "left" | "right") => {
    if (!top || leaving) return;
    if (canSwipe && !canSwipe(dir, top)) {
      setDrag({ dx: 0, dy: 0, active: false });
      return;
    }
    setLeaving(dir);
    const m = top;
    setTimeout(() => onSwipe(dir, m), reduceMotion() ? 0 : 340);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ dx: 0, dy: 0, active: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) start.current.moved = true;
    setDrag({ dx, dy: dy * 0.3, active: true });
  };
  const onPointerUp = () => {
    if (!start.current) return;
    const moved = start.current.moved;
    start.current = null;
    if (drag.dx > THRESHOLD) commit("right");
    else if (drag.dx < -THRESHOLD) commit("left");
    else {
      setDrag({ dx: 0, dy: 0, active: false });
      if (!moved && top) onOpen(top);
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      commit("right");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      commit("left");
    } else if (e.key === "Enter" && top && e.target === deckRef.current) {
      onOpen(top);
    }
  };

  const dx = leaving ? (leaving === "right" ? 700 : -700) : drag.dx;
  const rot = dx / 18;
  const progress = Math.min(1, Math.abs(dx) / THRESHOLD);
  const dir = dx > 20 ? "right" : dx < -20 ? "left" : null;

  return (
    <div className="flex h-full flex-col">
      <div
        ref={deckRef}
        tabIndex={0}
        onKeyDown={onKey}
        aria-roledescription="talia kart"
        aria-label={
          top
            ? `Propozycja: ${top.title}. Strzałka w prawo – chcę dołączyć, strzałka w lewo – pomiń, Enter – szczegóły.`
            : "Brak propozycji"
        }
        className="relative min-h-0 flex-1 rounded-[1.875rem]"
      >
        {meetings
          .slice(0, 3)
          .reverse()
          .map((m, i, arr) => {
            const depth = arr.length - 1 - i;
            const isTop = depth === 0;
            const behindScale = 1 - depth * 0.045 + (isTop ? 0 : progress * 0.045);
            return (
              <div
                key={m.id}
                className={cx(
                  "absolute inset-0",
                  isTop ? "z-10 touch-none" : "pointer-events-none",
                )}
                style={
                  isTop
                    ? {
                        transform: `translate(${dx}px, ${drag.dy}px) rotate(${rot}deg)`,
                        transition:
                          drag.active && !leaving
                            ? "none"
                            : "transform 0.42s cubic-bezier(.2,.8,.3,1)",
                        cursor: drag.active ? "grabbing" : "grab",
                      }
                    : {
                        transform: `translateY(${depth * 14 - progress * 14}px) scale(${behindScale})`,
                        transition: "transform 0.35s ease",
                        opacity: depth > 1 ? 0.6 : 1,
                      }
                }
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerUp : undefined}
                onPointerCancel={isTop ? onPointerUp : undefined}
                aria-hidden={!isTop}
              >
                <MeetingCardFace meeting={m} me={me} />
                {isTop && (
                  <>
                    <div
                      className="pointer-events-none absolute left-6 top-20 -rotate-12 rounded-2xl border-4 border-emerald-400 bg-emerald-500/20 px-4 py-1.5 font-display text-3xl font-extrabold tracking-wide text-emerald-300 backdrop-blur-sm"
                      style={{ opacity: dir === "right" ? progress : 0 }}
                      aria-hidden
                    >
                      DOŁĄCZAM
                    </div>
                    <div
                      className="pointer-events-none absolute right-6 top-20 rotate-12 rounded-2xl border-4 border-white bg-white/15 px-4 py-1.5 font-display text-3xl font-extrabold tracking-wide text-white backdrop-blur-sm"
                      style={{ opacity: dir === "left" ? progress : 0 }}
                      aria-hidden
                    >
                      POMIJAM
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpen(m)}
                      className="absolute right-4 top-14 flex size-11 items-center justify-center rounded-full bg-ink-950/45 text-white backdrop-blur hover:bg-ink-950/65"
                      aria-label="Szczegóły propozycji"
                    >
                      <Info className="size-5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <div className="flex items-center justify-center gap-5 pt-5">
        <button
          type="button"
          onClick={() => commit("left")}
          disabled={!top}
          className="flex size-16 items-center justify-center rounded-full bg-white text-ink-800 shadow-card ring-1 ring-ink-200 transition hover:scale-105 hover:text-red-700 active:scale-95 disabled:opacity-40"
          aria-label="Odrzuć – pomiń propozycję"
        >
          <X className="size-7" strokeWidth={2.6} />
        </button>
        <button
          type="button"
          onClick={() => commit("right")}
          disabled={!top}
          className="flex min-h-16 items-center gap-2.5 rounded-full bg-brand-600 px-7 text-[1.0625rem] font-extrabold text-white shadow-[0_14px_30px_-10px_rgb(210_62_23/0.8)] transition hover:scale-[1.03] hover:bg-brand-700 active:scale-95 disabled:opacity-40"
        >
          <Heart className="size-6" strokeWidth={2.6} aria-hidden />
          Chcę dołączyć
        </button>
      </div>
    </div>
  );
}
