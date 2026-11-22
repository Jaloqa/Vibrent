import {
  Bell,
  ChevronLeft,
  CircleUserRound,
  Compass,
  FlaskConical,
  ListChecks,
  Plus,
  WifiOff,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { goBack, navigate } from "../lib/router";
import { useMe, useStore } from "../store";
import { DemoPanel } from "./DemoPanel";
import { Avatar, cx, IconButton, Logo } from "./ui";

const NAV = [
  {
    path: "/app",
    label: "Odkrywaj",
    icon: Compass,
    match: (p: string) => p === "/app" || p.startsWith("/app/meeting/"),
  },
  {
    path: "/app/meetings",
    label: "Spotkania",
    icon: ListChecks,
    match: (p: string) =>
      p.startsWith("/app/meetings") ||
      p.startsWith("/app/organize") ||
      p.startsWith("/app/finished"),
  },
  {
    path: "/app/create",
    label: "Utwórz",
    icon: Plus,
    match: (p: string) => p.startsWith("/app/create"),
  },
  {
    path: "/app/notifications",
    label: "Powiadomienia",
    icon: Bell,
    match: (p: string) => p.startsWith("/app/notifications"),
  },
  {
    path: "/app/profile",
    label: "Profil",
    icon: CircleUserRound,
    match: (p: string) => p.startsWith("/app/profile") || p.startsWith("/app/user"),
  },
];

export function useUnread() {
  const { state } = useStore();
  return state.notifications.filter((n) => n.userId === state.currentUserId && !n.read).length;
}

export function AppShell({
  path,
  children,
  hideNav,
}: {
  path: string;
  children: ReactNode;
  hideNav?: boolean;
}) {
  const { state } = useStore();
  const me = useMe();
  const unread = useUnread();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-[17rem]">
      {/* Desktop: boczna nawigacja */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-ink-200 bg-white px-5 py-6 lg:flex">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="self-start rounded-xl"
          aria-label="Vibrent.pl – strona główna"
        >
          <Logo />
        </button>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Główna nawigacja">
          {NAV.map((n) => {
            const active = n.match(path);
            const I = n.icon;
            if (n.path === "/app/create")
              return (
                <button
                  key={n.path}
                  type="button"
                  onClick={() => navigate(n.path)}
                  className="my-3 flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 font-extrabold text-white shadow-[0_10px_24px_-10px_rgb(210_62_23/0.8)] transition hover:bg-brand-700"
                >
                  <Plus className="size-5" strokeWidth={2.8} /> Utwórz spotkanie
                </button>
              );
            return (
              <button
                key={n.path}
                type="button"
                onClick={() => navigate(n.path)}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[0.9375rem] font-bold transition",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-ink-100",
                )}
              >
                <I className="size-5" strokeWidth={active ? 2.6 : 2} />
                {n.label}
                {n.path === "/app/notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-brand-600 px-2 py-0.5 text-xs font-extrabold text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {me && (
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="flex items-center gap-3 rounded-2xl bg-paper p-3 text-left ring-1 ring-ink-200 hover:ring-ink-300"
            >
              <Avatar src={me.photo} alt="" size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{me.name}</span>
                <span className="block truncate text-xs text-ink-600">Konto demo · zmień</span>
              </span>
              <FlaskConical className="size-4 text-ink-600" aria-hidden />
            </button>
          )}
          <p className="px-1 text-xs leading-relaxed text-ink-600">
            Prototyp MVP. Lokalizacje, czasy dotarcia i powiadomienia są symulowane.
          </p>
        </div>
      </aside>

      {state.offline && (
        <div
          className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-ink-950 px-4 py-2 text-sm font-semibold text-white"
          role="status"
        >
          <WifiOff className="size-4" aria-hidden /> Brak internetu – część akcji jest wstrzymana
        </div>
      )}

      <main id="main" className={cx("mx-auto w-full", !hideNav && "pb-28 lg:pb-10")}>
        {children}
      </main>

      {/* Mobile: dolna nawigacja */}
      {!hideNav && (
        <nav
          aria-label="Główna nawigacja"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5">
            {NAV.map((n) => {
              const active = n.match(path);
              const I = n.icon;
              const isCreate = n.path === "/app/create";
              return (
                <li key={n.path}>
                  <button
                    type="button"
                    onClick={() => navigate(n.path)}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-bold",
                      active ? "text-brand-700" : "text-ink-600",
                    )}
                  >
                    {isCreate ? (
                      <span className="-mt-5 flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_10px_20px_-6px_rgb(210_62_23/0.7)]">
                        <Plus className="size-6" strokeWidth={2.8} aria-hidden />
                      </span>
                    ) : (
                      <span className="relative">
                        <I className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                        {n.path === "/app/notifications" && unread > 0 && (
                          <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[0.625rem] leading-4 text-white ring-2 ring-white">
                            {unread}
                          </span>
                        )}
                      </span>
                    )}
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <button
        type="button"
        onClick={() => setDemoOpen(true)}
        className={cx(
          "fixed right-3 z-40 flex min-h-11 items-center gap-1.5 rounded-full bg-ink-950 px-3.5 text-[0.8125rem] font-bold text-white shadow-float ring-2 ring-white transition hover:bg-ink-800",
          hideNav ? "bottom-[6.5rem] lg:bottom-6" : "bottom-[5.5rem] lg:bottom-6",
          "lg:right-6",
        )}
        aria-label="Otwórz panel demo: przełącz konto i symulacje"
      >
        <FlaskConical className="size-4" aria-hidden />
        Demo{me ? `: ${me.name}` : ""}
      </button>
      <DemoPanel open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export function TopBar({
  title,
  sub,
  right,
  back = true,
  onBack,
  transparent,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  back?: boolean;
  onBack?: () => void;
  transparent?: boolean;
}) {
  return (
    <header
      className={cx(
        "sticky top-0 z-20 flex min-h-16 items-center gap-2 px-3 lg:px-8",
        transparent ? "" : "border-b border-ink-100 bg-paper/90 backdrop-blur",
      )}
    >
      {back && (
        <IconButton
          label="Wstecz"
          onClick={onBack ?? (() => goBack())}
          className={transparent ? "bg-white/90 shadow-card" : ""}
        >
          <ChevronLeft className="size-6" />
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-lg font-bold leading-tight lg:text-xl">{title}</h1>}
        {sub && <p className="truncate text-[0.8125rem] text-ink-600">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Page({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cx("mx-auto w-full px-4 lg:px-8", wide ? "max-w-6xl" : "max-w-2xl", className)}>
      {children}
    </div>
  );
}
