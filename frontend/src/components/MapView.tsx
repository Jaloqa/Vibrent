import { Crosshair, MapPinOff, Minus, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityId, Venue } from "../data/types";
import { routeFor, type Point } from "../lib/eta";
import { useStore } from "../store";
import { ActivityIcon, Button, cx, Skeleton } from "./ui";

const RIVER =
  "M-3200 620 C -2000 760 -1300 900 -800 1140 S -350 1500 0 1700 S 600 1900 1000 1780 S 1700 1520 2200 1580 S 3000 1760 3400 1700";

const STREETS: [number, number, number, number][] = [
  [-3200, -950, 3400, -950],
  [-3200, -320, 3400, -320],
  [-3200, 360, 3400, 300],
  [-1200, 1060, 2600, 1150],
  [-1250, -2000, -1250, 1100],
  [-720, -2000, -720, 1200],
  [760, -2000, 760, 1700],
  [1350, -2000, 1350, 1500],
  [-2600, -1600, -400, 200],
  [300, 300, 2500, -1400],
  [-300, 1000, 900, 1700],
];

const MINOR: [number, number, number, number][] = [
  [-3200, -620, 3400, -620],
  [-3200, 40, 3400, 40],
  [-1800, 700, 2800, 720],
  [-2000, -2000, -2000, 900],
  [-300, -2000, -300, 900],
  [300, -2000, 300, 1500],
  [1050, -2000, 1050, 1700],
  [1800, -2000, 1800, 1500],
  [400, 1350, 1300, 1350],
];

const LABELS: { x: number; y: number; t: string }[] = [
  { x: 0, y: -420, t: "STARE MIASTO" },
  { x: 650, y: 1450, t: "KAZIMIERZ" },
  { x: -350, y: -1150, t: "KLEPARZ" },
  { x: 1400, y: 380, t: "GRZEGÓRZKI" },
  { x: -2300, y: -520, t: "BŁONIA" },
  { x: -1200, y: 1260, t: "Wisła" },
];

const DISTRICTS = [
  { x: 0, y: -420, name: "Stare Miasto" },
  { x: 650, y: 1450, name: "Kazimierz" },
  { x: -350, y: -1150, name: "Kleparz" },
  { x: 1400, y: 380, name: "Grzegórzki" },
  { x: -2300, y: -520, name: "Błonia" },
];

/** Najbliższa dzielnica na mapie poglądowej (do opisu własnej lokalizacji). */
export const nearestDistrict = (p: Point) =>
  DISTRICTS.reduce((best, d) =>
    Math.hypot(d.x - p.x, d.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? d : best,
  ).name;

/** Zasięg narysowanej mapy – poza nim nie pozwalamy wskazać punktu. */
export const MAP_BOUNDS = { minX: -3000, maxX: 3200, minY: -1900, maxY: 1900 };

interface Props {
  me?: Point | null;
  /** Brak miejsca = mapa bez pinezki (np. zanim użytkownik wskaże punkt). */
  venue?: Venue | null;
  activity?: ActivityId;
  showRoute?: boolean;
  mini?: boolean;
  className?: string;
  label?: string;
  /** Punkty, do których dopasowujemy kadr (domyślnie: miejsce i własna pozycja). */
  frame?: Point[];
  /** Tryb wskazywania: kliknięcie (bez przeciągania) zwraca współrzędne mapy. */
  onPick?: (p: Point) => void;
}

export function MapView({
  me,
  venue,
  activity,
  showRoute,
  mini,
  className,
  label,
  frame,
  onPick,
}: Props) {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(!mini);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (mini) return;
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [mini]);

  const route = useMemo(
    () => (me && venue && showRoute ? routeFor(me, venue) : null),
    [me, venue, showRoute],
  );

  const frameKey = frame?.map((p) => `${p.x},${p.y}`).join("|");
  const base = useMemo(() => {
    const pts: Point[] = frame?.length ? frame : [...(venue ? [venue] : []), ...(me ? [me] : [])];
    if (!pts.length) pts.push({ x: 0, y: -300 });
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = mini ? 420 : 520;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
  }, [frameKey ?? venue, me, mini]); // przy `frame` kadr nie skacze po każdej zmianie pinezki

  const span = Math.max(base.w, base.h * 0.8) / zoom;
  const vb = {
    x: base.cx + pan.x - span / 2,
    y: base.cy + pan.y - (span * 1.1) / 2,
    w: span,
    h: span * 1.1,
  };
  const unit = span / 400; // stała grubość linii niezależnie od zoomu

  if (state.mapError && !mini) {
    return (
      <div
        className={cx(
          "flex flex-col items-center justify-center gap-3 bg-paper-2 p-6 text-center",
          className,
        )}
        role="alert"
      >
        <MapPinOff className="size-10 text-ink-500" aria-hidden />
        <p className="text-base font-bold">Nie udało się pobrać mapy</p>
        <p className="max-w-xs text-sm text-ink-600">
          Sprawdź połączenie. Adres i ETA nadal znajdziesz w panelu poniżej.
        </p>
        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw className="size-4" />}
          onClick={() => dispatch({ type: "set_map_error", value: false })}
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (loading) return <Skeleton className={cx("rounded-none", className)} />;

  const onPointerDown = (e: React.PointerEvent) => {
    if (mini) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const k = vb.w / rect.width;
    if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 6)
      drag.current.moved = true;
    if (!drag.current.moved) return;
    setPan({
      x: drag.current.px - (e.clientX - drag.current.x) * k,
      y: drag.current.py - (e.clientY - drag.current.y) * k,
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || !onPick || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    onPick({ x: Math.round(pt.x), y: Math.round(pt.y) });
  };

  return (
    <div className={cx("relative overflow-hidden bg-[#eef0e6]", className)}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid slice"
        className={cx(
          "size-full",
          !mini &&
            (onPick
              ? "cursor-crosshair touch-none"
              : "cursor-grab touch-none active:cursor-grabbing"),
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        role="img"
        aria-label={
          label ??
          `Mapa${venue ? `: ${venue.name}, ${venue.address}` : ""}${me ? ". Zaznaczona Twoja pozycja" : ""}${route ? " i Twoja trasa" : ""}.${onPick ? " Kliknij, aby wskazać miejsce." : ""}`
        }
      >
        <rect x={-6000} y={-6000} width={12000} height={12000} fill="#eef0e6" />
        {/* tereny zielone */}
        <path d="M-3000 -700 L-1900 -650 L-1850 300 L-3000 260 Z" fill="#cfe6c0" />
        <path d="M-1900 -520 L-1500 -520 L-1500 -120 L-1900 -140 Z" fill="#cfe6c0" />
        <ellipse cx={-120} cy={960} rx={190} ry={150} fill="#d6e8c8" />
        <ellipse cx={0} cy={60} rx={520} ry={760} fill="none" stroke="#cfe6c0" strokeWidth={70} />
        {/* rzeka */}
        <path d={RIVER} fill="none" stroke="#bcd8ee" strokeWidth={180} strokeLinecap="round" />
        {/* ulice */}
        {MINOR.map(([a, b, c, d], i) => (
          <line key={`m${i}`} x1={a} y1={b} x2={c} y2={d} stroke="#ffffff" strokeWidth={unit * 3} />
        ))}
        {STREETS.map(([a, b, c, d], i) => (
          <line
            key={`s${i}`}
            x1={a}
            y1={b}
            x2={c}
            y2={d}
            stroke="#ffffff"
            strokeWidth={unit * 6}
            strokeLinecap="round"
          />
        ))}
        <rect
          x={-110}
          y={-110}
          width={220}
          height={220}
          fill="#f6efe2"
          stroke="#fff"
          strokeWidth={unit * 3}
        />
        {!mini &&
          LABELS.map((l) => (
            <text
              key={l.t}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              fontSize={unit * 10}
              fontWeight={700}
              letterSpacing={unit * 1.5}
              fill={l.t === "Wisła" ? "#4f7fa3" : "#8a8d7c"}
              fontStyle={l.t === "Wisła" ? "italic" : "normal"}
            >
              {l.t}
            </text>
          ))}
        {/* trasa (tylko własna) */}
        {route && (
          <>
            <polyline
              points={route.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#fff"
              strokeWidth={unit * 11}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={route.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#d23e17"
              strokeWidth={unit * 6}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${unit * 10} ${unit * 6}`}
              className="animate-dash"
              style={{ strokeDashoffset: 0 }}
            />
          </>
        )}
        {/* własna pozycja */}
        {me && (
          <g transform={`translate(${me.x} ${me.y})`}>
            <circle
              r={unit * 18}
              fill="#2563eb"
              opacity={0.15}
              className="origin-center animate-pulse-ring [transform-box:fill-box]"
            />
            <circle r={unit * 10} fill="#2563eb" stroke="#fff" strokeWidth={unit * 3.5} />
            {!mini && (
              <g transform={`translate(0 ${-unit * 22})`}>
                <rect
                  x={-unit * 14}
                  y={-unit * 10}
                  width={unit * 28}
                  height={unit * 15}
                  rx={unit * 7}
                  fill="#1e3a8a"
                />
                <text
                  y={unit * 1.2}
                  textAnchor="middle"
                  fontSize={unit * 9}
                  fontWeight={800}
                  fill="#fff"
                >
                  Ty
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
      {/* pinezka miejsca w HTML, by miała ostre ikony */}
      {venue && <VenuePin vb={vb} venue={venue} activity={activity} mini={mini} />}
      {!mini && (
        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-200">
          <button
            type="button"
            aria-label="Przybliż mapę"
            className="flex size-11 items-center justify-center hover:bg-ink-100"
            onClick={() => setZoom((z) => Math.min(3, z * 1.35))}
          >
            <Plus className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Oddal mapę"
            className="flex size-11 items-center justify-center border-t border-ink-100 hover:bg-ink-100"
            onClick={() => setZoom((z) => Math.max(0.6, z / 1.35))}
          >
            <Minus className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Wyśrodkuj mapę"
            className="flex size-11 items-center justify-center border-t border-ink-100 hover:bg-ink-100"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <Crosshair className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

function VenuePin({
  vb,
  venue,
  activity,
  mini,
}: {
  vb: { x: number; y: number; w: number; h: number };
  venue: Venue;
  activity?: ActivityId;
  mini?: boolean;
}) {
  // preserveAspectRatio slice: przeliczamy pozycję względem kontenera
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 1, h: 1 });
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(box.w / vb.w, box.h / vb.h);
  const offX = (box.w - vb.w * scale) / 2;
  const offY = (box.h - vb.h * scale) / 2;
  const left = offX + (venue.x - vb.x) * scale;
  const top = offY + (venue.y - vb.y) * scale;
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left, top }}>
        <div
          className={cx(
            "flex items-center gap-1.5 rounded-full bg-ink-950 text-white shadow-float",
            mini ? "p-1.5" : "py-1.5 pl-1.5 pr-3",
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-600">
            {activity ? (
              <ActivityIcon id={activity} className="size-4" strokeWidth={2.4} />
            ) : (
              <span className="size-2 rounded-full bg-white" />
            )}
          </span>
          {!mini && <span className="max-w-40 truncate text-xs font-bold">{venue.name}</span>}
        </div>
        <div className="mx-auto h-2.5 w-0.5 bg-ink-950" />
      </div>
    </div>
  );
}
