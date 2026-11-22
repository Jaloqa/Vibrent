import {
  Beer,
  Bike,
  BookOpen,
  Camera,
  CircleDot,
  Clapperboard,
  Coffee,
  Compass,
  Dumbbell,
  Footprints,
  Gamepad2,
  Martini,
  MessageCircle,
  Music,
  Palette,
  PartyPopper,
  Sandwich,
  Smile,
  Sparkles,
  Target,
  Trees,
  Users,
  UtensilsCrossed,
  X,
  Zap,
  type LucideIcon,
  CircleCheck,
  Info,
  TriangleAlert,
  CircleX,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { activityById, categoryById, img } from "../data/catalog";
import type { ActivityId, MeetingStatus, RequestStatus } from "../data/types";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const ICONS: Record<string, LucideIcon> = {
  Coffee,
  Beer,
  UtensilsCrossed,
  Martini,
  Sandwich,
  Dumbbell,
  Footprints,
  Trees,
  Bike,
  Zap,
  Clapperboard,
  CircleDot,
  Target,
  Gamepad2,
  PartyPopper,
  MessageCircle,
  Users,
  Compass,
  Smile,
  Camera,
  Music,
  BookOpen,
  Palette,
  Sparkles,
};

export function ActivityIcon({
  id,
  className = "size-5",
  strokeWidth = 2,
}: {
  id: ActivityId;
  className?: string;
  strokeWidth?: number;
}) {
  const I = ICONS[activityById(id).icon] ?? Sparkles;
  return <I className={className} strokeWidth={strokeWidth} aria-hidden />;
}

/* ---------- Logo ---------- */

export function LogoMark({ className = "size-9" }: { className?: string }) {
  // Dwie postacie blisko siebie – głowy i ramiona zachodzą na siebie.
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" className="fill-brand-600" />
      <circle cx="15" cy="14" r="5" fill="#fff" />
      <circle cx="25.5" cy="15.5" r="4.4" fill="#fff" fillOpacity="0.85" />
      <path d="M6.5 32c0-5.4 3.9-9.4 8.5-9.4s8.5 4 8.5 9.4" fill="#fff" />
      <path d="M17.6 32c0-4.9 3.5-8.4 7.9-8.4S33.5 27.1 33.5 32" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

export function Logo({
  className,
  light = false,
  compact = false,
}: {
  className?: string;
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)} aria-label="Vibrent.pl">
      <LogoMark className={compact ? "size-8" : "size-9"} />
      <span
        className={cx(
          "font-display text-[1.375rem] font-extrabold leading-none tracking-tight",
          light ? "text-white" : "text-ink-950",
        )}
        aria-hidden
      >
        Vibrent
        <span
          className={cx(
            "ml-0.5 text-[0.8125rem] font-semibold",
            light ? "text-white/70" : "text-ink-600",
          )}
        >
          .pl
        </span>
      </span>
    </span>
  );
}

/* ---------- Przyciski ---------- */

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "dark" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_8px_20px_-8px_rgb(210_62_23/0.7)]",
  secondary: "bg-white text-ink-950 ring-1 ring-ink-200 hover:ring-ink-300 hover:bg-paper",
  ghost: "bg-transparent text-ink-800 hover:bg-ink-100",
  destructive: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  success: "bg-emerald-700 text-white hover:bg-emerald-800",
};
const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm gap-1.5",
  md: "min-h-12 px-5 text-[0.9375rem] gap-2",
  lg: "min-h-14 px-6 text-base gap-2.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-full font-bold transition-all duration-150 select-none",
        "disabled:opacity-50 disabled:shadow-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  badge,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; badge?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cx(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-900 transition hover:bg-ink-100",
        className,
      )}
    >
      {children}
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[0.6875rem] font-bold leading-5 text-white ring-2 ring-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

/* ---------- Chipsy ---------- */

export function Chip({
  selected,
  onClick,
  children,
  icon,
  tone = "default",
  size = "md",
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "common";
  size?: "sm" | "md";
  className?: string;
}) {
  const base = cx(
    "inline-flex items-center gap-1.5 rounded-full font-semibold transition",
    size === "md" ? "min-h-10 px-3.5 text-sm" : "px-2.5 py-1 text-[0.8125rem]",
  );
  const look =
    tone === "common"
      ? "bg-brand-100 text-brand-800 ring-1 ring-brand-200"
      : selected
        ? "bg-ink-950 text-white ring-1 ring-ink-950"
        : "bg-white text-ink-800 ring-1 ring-ink-200 hover:ring-ink-300";
  if (!onClick)
    return (
      <span className={cx(base, look, className)}>
        {icon}
        {children}
      </span>
    );
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={cx(base, look, size === "md" && "min-h-11", className)}
    >
      {icon}
      {children}
    </button>
  );
}

export function ActivityChip({
  id,
  size = "md",
  onDark,
}: {
  id: ActivityId;
  size?: "sm" | "md";
  onDark?: boolean;
}) {
  const a = activityById(id);
  const c = categoryById(a.category);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full font-bold",
        size === "md" ? "px-3 py-1.5 text-[0.8125rem]" : "px-2.5 py-1 text-xs",
        onDark ? "bg-white/95 text-ink-950" : cx(c.tint, c.text),
      )}
    >
      <span
        className={cx("flex items-center justify-center rounded-full", onDark && "text-ink-950")}
        style={onDark ? { color: c.solid } : undefined}
      >
        <ActivityIcon id={id} className="size-3.5" strokeWidth={2.5} />
      </span>
      {a.label}
    </span>
  );
}

export function NowBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
        <span className="relative size-2 rounded-full bg-white" />
      </span>
      Teraz · spontaniczne
    </span>
  );
}

export function PromotedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md bg-ink-950 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white",
        className,
      )}
    >
      Promowane
    </span>
  );
}

export function DemoBadge({
  children = "Symulacja demonstracyjna",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md border border-dashed border-amber-500 bg-amber-50 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-900",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Statusy ---------- */

export const MEETING_STATUS: Record<MeetingStatus, { label: string; cls: string }> = {
  active: { label: "Aktywne", cls: "bg-emerald-100 text-emerald-900" },
  matched: { label: "Dopasowane", cls: "bg-brand-100 text-brand-800" },
  in_progress: { label: "W trakcie", cls: "bg-sky-100 text-sky-900" },
  finished: { label: "Zakończone", cls: "bg-ink-100 text-ink-800" },
  cancelled: { label: "Anulowane", cls: "bg-red-100 text-red-800" },
  not_realized: { label: "Niezrealizowane", cls: "bg-amber-100 text-amber-900" },
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: "Oczekuje na akceptację", cls: "bg-amber-100 text-amber-900" },
  accepted: { label: "Zaakceptowane", cls: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Odrzucone", cls: "bg-red-100 text-red-800" },
  cancelled: { label: "Anulowane", cls: "bg-ink-100 text-ink-800" },
  closed: { label: "Spotkanie już zajęte", cls: "bg-ink-100 text-ink-800" },
};

export function StatusPill({
  label,
  cls,
  className,
}: {
  label: string;
  cls: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        cls,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export const MeetingStatusPill = ({ status }: { status: MeetingStatus }) => (
  <StatusPill {...MEETING_STATUS[status]} />
);
export const RequestStatusPill = ({ status }: { status: RequestStatus }) => (
  <StatusPill {...REQUEST_STATUS[status]} />
);

/* ---------- Avatar ---------- */

export function Avatar({
  src,
  alt,
  size = 44,
  ring,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const url =
    src.startsWith("blob:") || src.startsWith("data:") ? src : img(src, size * 3, size * 3, true);
  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
      className={cx(
        "shrink-0 rounded-full object-cover bg-ink-100",
        ring && "ring-[3px] ring-white",
        className,
      )}
    />
  );
}

export const photoUrl = (src: string, w = 800, h?: number) =>
  src.startsWith("blob:") || src.startsWith("data:") ? src : img(src, w, h);

/* ---------- Pola formularzy ---------- */

export function Field({
  label,
  error,
  hint,
  counter,
  children,
  id,
}: {
  label: string;
  error?: string;
  hint?: string;
  counter?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-ink-900">
          {label}
        </label>
        {counter && <span className="text-xs font-semibold text-ink-600">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-err`}
          className="flex items-center gap-1 text-[0.8125rem] font-semibold text-red-700"
          role="alert"
        >
          <CircleX className="size-3.5" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-ink-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  cx(
    "w-full rounded-2xl bg-white px-4 text-[0.9375rem] text-ink-950 ring-1 placeholder:text-ink-500 transition outline-none",
    "focus:ring-2 focus:ring-brand-600",
    err ? "ring-red-400" : "ring-ink-200 hover:ring-ink-300",
  );

export function TextInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx(inputCls(invalid), "min-h-12", className)}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx(inputCls(invalid), "min-h-24 resize-none py-3 leading-relaxed", className)}
    />
  );
}

/* ---------- Komunikaty ---------- */

export function Notice({
  tone = "info",
  title,
  children,
  icon,
  className,
}: {
  tone?: "info" | "warn" | "success" | "danger" | "brand";
  title?: string;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const t = {
    info: "bg-sky-50 text-sky-950 ring-sky-200",
    warn: "bg-amber-50 text-amber-950 ring-amber-200",
    success: "bg-emerald-50 text-emerald-950 ring-emerald-200",
    danger: "bg-red-50 text-red-950 ring-red-200",
    brand: "bg-brand-50 text-brand-800 ring-brand-200",
  }[tone];
  const I =
    tone === "success" ? CircleCheck : tone === "warn" || tone === "danger" ? TriangleAlert : Info;
  return (
    <div className={cx("flex gap-3 rounded-2xl p-3.5 text-sm ring-1", t, className)}>
      <span className="mt-0.5 shrink-0">
        {icon ?? <I className="size-[1.125rem]" aria-hidden />}
      </span>
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cx(title && "mt-0.5", "opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  actions,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center animate-fade-up">
      <div className="mb-5 flex size-20 items-center justify-center rounded-[1.75rem] bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-ink-950">{title}</h3>
      {children && (
        <div className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink-600">
          {children}
        </div>
      )}
      {actions && <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">{actions}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-xl", className)} aria-hidden />;
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={cx(
        "font-sans text-xs font-extrabold uppercase tracking-[0.12em] text-ink-600",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/* ---------- Bottom sheet / modal ---------- */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, onClose]);
}

function useFocusOnOpen(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => ref.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEscape(open, onClose);
  const ref = useFocusOnOpen(open);
  const id = useId();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink-950/45 backdrop-blur-[0.125rem] animate-fade-up [animation-duration:200ms]"
        onClick={onClose}
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cx(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-[1.75rem] bg-white shadow-float outline-none animate-sheet-up md:rounded-[1.75rem] md:animate-pop",
          wide ? "md:max-w-2xl" : "md:max-w-lg",
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink-200 md:hidden" aria-hidden />
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 md:pt-5">
          <h2 id={id} className="text-xl font-bold">
            {title}
          </h2>
          <IconButton label="Zamknij" onClick={onClose} className="-mr-2">
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-5 overscroll-contain">{children}</div>
        {footer && (
          <div className="border-t border-ink-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  useEscape(open, onClose);
  const ref = useFocusOnOpen(open);
  const id = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" role="presentation">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[0.125rem]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={id}
        className="relative w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-float outline-none animate-pop"
      >
        {icon && (
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <h2 id={id} className="text-xl font-bold">
          {title}
        </h2>
        {children && (
          <div className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{children}</div>
        )}
        {actions && <div className="mt-6 flex flex-col gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

/* ---------- Toasty ---------- */

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  text: string;
  tone: "default" | "success" | "error";
  sub?: string;
  action?: ToastAction;
}

type ToastOpts = { tone?: Toast["tone"]; sub?: string; action?: ToastAction };

const ToastCtx = createContext<(text: string, opts?: ToastOpts) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, opts?: ToastOpts) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [
      ...t.slice(-2),
      { id, text, tone: opts?.tone ?? "default", sub: opts?.sub, action: opts?.action },
    ]);
    // toast z akcją (np. „Cofnij”) zostaje dłużej, żeby zdążyć zareagować
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts?.action ? 6000 : 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:top-auto"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-float animate-fade-up",
              t.tone === "error"
                ? "bg-red-700 text-white"
                : t.tone === "success"
                  ? "bg-ink-950 text-white"
                  : "bg-ink-950 text-white",
            )}
          >
            {t.tone === "success" ? (
              <CircleCheck
                className="mt-0.5 size-[1.125rem] shrink-0 text-emerald-300"
                aria-hidden
              />
            ) : t.tone === "error" ? (
              <TriangleAlert className="mt-0.5 size-[1.125rem] shrink-0" aria-hidden />
            ) : (
              <Info className="mt-0.5 size-[1.125rem] shrink-0 text-brand-300" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p>{t.text}</p>
              {t.sub && <p className="mt-0.5 font-medium text-white/75">{t.sub}</p>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick();
                  setToasts((all) => all.filter((x) => x.id !== t.id));
                }}
                className="-my-1 -mr-1 shrink-0 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-extrabold text-white hover:bg-white/25"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
