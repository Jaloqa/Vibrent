// Zegar symulacji: minuta 0 = moment uruchomienia prototypu.
const BASE = (() => {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.getTime();
})();

export const clock = (min: number) =>
  new Date(BASE + min * 60_000).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

export function ago(at: number, now: number) {
  const d = Math.max(0, Math.round(now - at));
  if (d < 1) return "teraz";
  if (d < 60) return `${d} min temu`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h} godz. temu`;
  const days = Math.floor(h / 24);
  return days === 1 ? "wczoraj" : `${days} dni temu`;
}

export function activeFor(createdAt: number, now: number) {
  const d = Math.max(0, Math.round(now - createdAt));
  if (d < 1) return "Aktywne od teraz";
  return `Aktywne od ${d} min`;
}

export const age = (birthYear: number) => new Date().getFullYear() - birthYear;
