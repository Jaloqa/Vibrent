import {
  Clock,
  FlaskConical,
  Map,
  MapPinOff,
  Palette,
  RotateCcw,
  Timer,
  UserPlus,
  WifiOff,
  Home,
} from "lucide-react";
import { DEMO_ACCOUNTS } from "../data/demo";
import { ETA_CONFIG } from "../lib/eta";
import { clock } from "../lib/time";
import { navigate } from "../lib/router";
import { findUser, myConfirmed, otherPartyId, uid, useStore } from "../store";
import { Avatar, Button, cx, SectionLabel, Sheet, useToast } from "./ui";

export function DemoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const me = findUser(state, state.currentUserId);
  const myActive = me
    ? state.meetings.find((m) => m.organizerId === me.id && m.status === "active")
    : undefined;
  const confirmed = me ? myConfirmed(state, me.id)[0] : undefined;
  const otherId = confirmed && me ? otherPartyId(confirmed, me.id) : undefined;
  const other = findUser(state, otherId);

  const switchTo = (userId: string | null) => {
    onClose();
    if (!userId) {
      dispatch({ type: "switch_user", userId: null });
      navigate("/start");
      return;
    }
    dispatch({ type: "switch_user", userId });
    navigate("/app");
    toast(`Jesteś teraz: ${findUser(state, userId)?.name}`, { tone: "success" });
  };

  const extraAccounts = state.users.filter((u) => u.id.startsWith("u_new"));

  return (
    <Sheet open={open} onClose={onClose} title="Panel demonstracyjny" wide>
      <p className="text-sm leading-relaxed text-ink-600">
        Przełączaj konta, aby przetestować obie strony procesu. Stan jest wspólny dla wszystkich
        kont i zapisuje się w przeglądarce.
      </p>

      <SectionLabel className="mt-5">Konta i scenariusze</SectionLabel>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {[
          ...DEMO_ACCOUNTS,
          ...extraAccounts.map((u) => ({
            userId: u.id,
            label: u.name,
            scenario: "Konto utworzone w onboardingu",
          })),
        ].map((a) => {
          const u = findUser(state, a.userId);
          const active = a.userId === state.currentUserId;
          return (
            <li key={a.userId ?? "new"}>
              <button
                type="button"
                onClick={() => switchTo(a.userId)}
                aria-current={active || undefined}
                className={cx(
                  "flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition",
                  active
                    ? "bg-brand-50 ring-2 ring-brand-600"
                    : "bg-white ring-ink-200 hover:ring-ink-300",
                )}
              >
                {u ? (
                  <Avatar src={u.photo} alt="" size={40} />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-ink-100">
                    <UserPlus className="size-5" aria-hidden />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{a.label}</span>
                  <span className="block text-xs leading-snug text-ink-600">{a.scenario}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <SectionLabel className="mt-6">Symulacje</SectionLabel>
      <p className="mt-1 text-xs text-ink-600">Zegar symulacji: {clock(state.now)}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Clock className="size-4" />}
          onClick={() => dispatch({ type: "advance_time", minutes: 5 })}
        >
          Przesuń czas o 5 min
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<UserPlus className="size-4" />}
          disabled={!myActive}
          onClick={() => {
            if (!myActive) return;
            dispatch({ type: "simulate_request", meetingId: myActive.id, id: uid("r") });
            toast("Nadeszło nowe zgłoszenie (symulacja)");
          }}
        >
          Symuluj zgłoszenie do mojego spotkania
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Timer className="size-4" />}
          disabled={!confirmed || !other || confirmed.status !== "matched"}
          onClick={() => {
            if (!confirmed || !other) return;
            dispatch({
              type: "simulate_delay",
              meetingId: confirmed.id,
              userId: other.id,
              minutes: 10,
            });
            toast(`Opóźnienie: ${other.name} +10 min (symulacja)`);
          }}
        >
          {other ? `Symuluj spóźnienie: ${other.name}` : "Symuluj spóźnienie drugiej osoby"}
        </Button>
        <Button
          variant={state.offline ? "dark" : "secondary"}
          size="sm"
          aria-pressed={state.offline}
          icon={<WifiOff className="size-4" />}
          onClick={() => dispatch({ type: "set_offline", value: !state.offline })}
        >
          {state.offline ? "Przywróć internet" : "Symuluj brak internetu"}
        </Button>
        {me && me.location.mode === "gps" && (
          <Button
            variant="secondary"
            size="sm"
            icon={<MapPinOff className="size-4" />}
            onClick={() => {
              dispatch({
                type: "update_position",
                location: { ...me.location, mode: "manual", updatedAt: undefined },
              });
              onClose();
            }}
          >
            Symuluj utratę dostępu do lokalizacji
          </Button>
        )}
        <Button
          variant={state.mapError ? "dark" : "secondary"}
          size="sm"
          aria-pressed={state.mapError}
          icon={<Map className="size-4" />}
          onClick={() => dispatch({ type: "set_map_error", value: !state.mapError })}
        >
          {state.mapError ? "Przywróć mapę" : "Symuluj błąd mapy"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          icon={<RotateCcw className="size-4" />}
          onClick={() => {
            dispatch({ type: "reset" });
            onClose();
            navigate("/app");
            toast("Przywrócono dane demonstracyjne", { tone: "success" });
          }}
        >
          Resetuj dane demo
        </Button>
      </div>

      <SectionLabel className="mt-6">Parametry ETA (do zatwierdzenia)</SectionLabel>
      <div className="mt-2 rounded-2xl bg-paper p-3.5 text-[0.8125rem] leading-relaxed text-ink-800 ring-1 ring-ink-200">
        <p>
          Prędkości: pieszo {ETA_CONFIG.speedsKmh.walk} km/h, komunikacja{" "}
          {ETA_CONFIG.speedsKmh.transit} km/h (+{ETA_CONFIG.overheadMin.transit} min), rower{" "}
          {ETA_CONFIG.speedsKmh.bike} km/h. Zapas: {Math.round(ETA_CONFIG.marginPct * 100)}%, min.{" "}
          {ETA_CONFIG.marginMinMinutes} min. ETA dla drugiej osoby w przedziałach co{" "}
          {ETA_CONFIG.sharedBandMinutes} min.
        </p>
        <p className="mt-1.5 font-bold text-amber-900">
          Wartości robocze – wzór i margines wymagają osobnego potwierdzenia.
        </p>
      </div>

      <SectionLabel className="mt-6">Widoki</SectionLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<Home className="size-4" />}
          onClick={() => (onClose(), navigate("/"))}
        >
          Landing page
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Palette className="size-4" />}
          onClick={() => (onClose(), navigate("/ds"))}
        >
          Design system
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<FlaskConical className="size-4" />}
          onClick={() => (onClose(), navigate("/start"))}
        >
          Onboarding
        </Button>
      </div>
    </Sheet>
  );
}
