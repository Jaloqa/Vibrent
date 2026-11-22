import { FlaskConical, LocateFixed, LogOut, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_USERS } from "../data/demo";
import type { UserLocation } from "../data/types";
import { navigate } from "../lib/router";
import { useMe, useStore } from "../store";
import { DemoPanel } from "./DemoPanel";
import { Button, cx, Logo, Notice, Sheet, useToast } from "./ui";

const DEFAULT_GPS: Omit<UserLocation, "mode"> = {
  city: "Kraków",
  district: "Stare Miasto",
  x: 260,
  y: 220,
};

/** Symulowany odczyt GPS: pozycja „domowa” konta demo z niewielkim rozrzutem pomiaru. */
export function simulatedPosition(userId?: string, jitter = true): UserLocation {
  const base = DEMO_USERS.find((u) => u.id === userId)?.location ?? DEFAULT_GPS;
  const j = () => (jitter ? Math.round((Math.random() - 0.5) * 80) : 0);
  return {
    city: base.city,
    district: base.district,
    x: base.x + j(),
    y: base.y + j(),
    mode: "gps",
    updatedAt: Date.now(),
  };
}

const LOCATE_MS = 900;

/** Udostępnienie / odświeżenie bieżącej lokalizacji z symulowanym czasem pobierania. */
export function useLocationActions() {
  const { state, dispatch } = useStore();
  const me = useMe();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const locate = (onDone?: () => void) => {
    if (!me || busy) return;
    if (state.offline) {
      toast("Brak internetu – nie udało się pobrać lokalizacji", {
        tone: "error",
        sub: "Spróbuj ponownie po odzyskaniu połączenia.",
      });
      return;
    }
    const first = me.location.mode !== "gps";
    setBusy(true);
    timer.current = setTimeout(() => {
      const location = simulatedPosition(me.id);
      // Pierwsze udostępnienie ustawia też zalecany promień dla miasta; odświeżenie – nie.
      dispatch(first ? { type: "set_location", location } : { type: "update_position", location });
      setBusy(false);
      toast(first ? "Lokalizacja udostępniona" : "Lokalizacja odświeżona", {
        tone: "success",
        sub: `${location.city}, ${location.district} · symulacja demonstracyjna`,
      });
      onDone?.();
    }, LOCATE_MS);
  };
  return { locate, busy };
}

export function fmtUpdated(ts?: number) {
  if (!ts) return "pozycja demonstracyjna";
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "zaktualizowano przed chwilą";
  if (min < 60) return `zaktualizowano ${min} min temu`;
  return `zaktualizowano o ${new Date(ts).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Przycisk-ikona do szybkiego odświeżenia pozycji (np. obok chipu lokalizacji). */
export function RefreshLocationButton({ className }: { className?: string }) {
  const { locate, busy } = useLocationActions();
  return (
    <button
      type="button"
      onClick={() => locate()}
      disabled={busy}
      aria-label={busy ? "Odświeżanie lokalizacji…" : "Odśwież lokalizację"}
      title="Odśwież lokalizację"
      className={cx(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink-800 ring-1 ring-ink-200 transition hover:text-brand-700 hover:ring-ink-300 disabled:cursor-wait",
        className,
      )}
    >
      <RefreshCw className={cx("size-4", busy && "animate-spin")} aria-hidden />
    </button>
  );
}

export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const me = useMe()!;
  const { locate, busy } = useLocationActions();
  const loc = me.location;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Twoja lokalizacja"
      footer={
        <Button
          block
          size="lg"
          onClick={() => locate()}
          disabled={busy}
          icon={<RefreshCw className={cx("size-5", busy && "animate-spin")} />}
        >
          {busy ? "Pobieranie lokalizacji…" : "Odśwież lokalizację"}
        </Button>
      }
    >
      <div className="flex items-center gap-4 rounded-3xl bg-paper p-4 ring-1 ring-ink-200">
        <span className="relative flex size-12 shrink-0 items-center justify-center">
          <span
            className={cx(
              "absolute inset-0 rounded-full bg-blue-500/25",
              busy && "animate-pulse-ring",
            )}
            aria-hidden
          />
          <span className="relative flex size-12 items-center justify-center rounded-full bg-blue-600 text-white">
            <LocateFixed className="size-6" aria-hidden />
          </span>
        </span>
        <div className="min-w-0" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Bieżąca pozycja</p>
          <p className="mt-0.5 truncate font-display text-xl font-bold">
            {loc.city}, {loc.district}
          </p>
          <p className="text-[0.8125rem] text-ink-600">
            {busy ? "Pobieranie nowej pozycji…" : fmtUpdated(loc.updatedAt)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-700">
        Lokalizacja jest wymagana – na jej podstawie pokazujemy spotkania w pobliżu i liczymy Twój
        czas dotarcia. Odśwież ją, jeśli zmieniłeś miejsce.
      </p>
      <Notice tone="info" className="mt-4" title="Prywatność">
        Inni nigdy nie zobaczą Twojej pozycji, trasy ani historii lokalizacji – tylko przybliżony
        czas przybycia na spotkanie.
      </Notice>
      <p className="mt-3 text-center text-xs text-ink-600">
        W prototypie pozycja jest symulowana (Kraków).
      </p>
    </Sheet>
  );
}

/** Ekran blokujący aplikację, dopóki użytkownik nie udostępni bieżącej lokalizacji. */
export function LocationGate() {
  const { dispatch } = useStore();
  const me = useMe();
  const { locate, busy } = useLocationActions();
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="mx-auto flex min-h-16 w-full max-w-lg items-center justify-between px-5">
        <Logo compact />
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="flex min-h-10 items-center gap-1.5 rounded-full bg-ink-950 px-3.5 text-[0.8125rem] font-bold text-white hover:bg-ink-800"
        >
          <FlaskConical className="size-4" aria-hidden /> Demo{me ? `: ${me.name}` : ""}
        </button>
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-10"
      >
        <div className="relative mx-auto mb-8 flex size-28 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-brand-400/40 animate-pulse-ring"
            aria-hidden
          />
          <span className="relative flex size-28 items-center justify-center rounded-full bg-brand-600 text-white shadow-float">
            <MapPin className="size-12" strokeWidth={2.2} aria-hidden />
          </span>
        </div>
        <h1 className="text-center text-[2rem] font-extrabold leading-tight text-balance">
          Udostępnij lokalizację, aby korzystać z Vibrent
        </h1>
        <p className="mt-3 text-center text-[0.9375rem] leading-relaxed text-ink-600">
          Spotkania odbywają się tu i teraz, dlatego potrzebujemy Twojej bieżącej pozycji – żeby
          pokazać osoby w pobliżu i policzyć realny czas dotarcia.
        </p>
        <ul className="mt-6 flex flex-col gap-2.5 rounded-3xl bg-white p-5 text-sm text-ink-800 ring-1 ring-ink-200">
          <li className="flex gap-2">
            <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Nikt nie
            zobaczy Twojej pozycji, trasy ani historii lokalizacji.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Używamy jej
            tylko podczas korzystania z aplikacji.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> W każdej chwili
            możesz ją odświeżyć.
          </li>
        </ul>
        <Button
          block
          size="lg"
          className="mt-6"
          onClick={() => locate()}
          disabled={busy}
          icon={
            busy ? (
              <RefreshCw className="size-5 animate-spin" />
            ) : (
              <LocateFixed className="size-5" />
            )
          }
        >
          {busy ? "Pobieranie lokalizacji…" : "Udostępnij lokalizację"}
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-ink-600">
          Jeśli przeglądarka zablokowała dostęp, zezwól na lokalizację w ustawieniach witryny i
          spróbuj ponownie. W prototypie pozycja jest symulowana.
        </p>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "switch_user", userId: null });
            navigate("/");
          }}
          className="mx-auto mt-6 flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-ink-700 hover:bg-ink-100"
        >
          <LogOut className="size-4" aria-hidden /> Wyloguj
        </button>
      </main>
      <DemoPanel open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
