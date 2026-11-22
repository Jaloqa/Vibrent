import {
  ArrowRight,
  Ban,
  Check,
  EyeOff,
  Flag,
  Heart,
  Lock,
  MessageCircleOff,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { activityById, img } from "../data/catalog";
import type { ActivityId } from "../data/types";
import { MeetingCardFace } from "../components/SwipeDeck";
import { ActivityIcon, Avatar, Button, cx, Logo } from "../components/ui";
import { navigate } from "../lib/router";
import { findUser, useStore } from "../store";

const QUOTES = [
  "Mam teraz godzinę wolnego. Może ktoś pójdzie na kawę?",
  "Nie mam z kim wyjść na piwo. Ktoś chętny?",
  "Chciałbym pójść na siłownię, ale nie sam.",
  "Jestem nowy w mieście, chętnie poznam kogoś na spacerze.",
  "Nudzi mi się – może ktoś wyskoczy do centrum?",
];

const SHOWCASE: { id: ActivityId; label: string }[] = [
  { id: "kawa", label: "Kawa" },
  { id: "pub", label: "Piwo" },
  { id: "spacer", label: "Spacer" },
  { id: "silownia", label: "Siłownia" },
  { id: "bilard", label: "Bilard" },
  { id: "restauracja", label: "Jedzenie" },
  { id: "bieganie", label: "Bieganie" },
  { id: "miasto", label: "Odkrywanie miasta" },
];

export function Landing() {
  const { state, dispatch } = useStore();
  const m = (id: string) => state.meetings.find((x) => x.id === id) ?? state.meetings[0];
  const enter = () => {
    if (!state.currentUserId) dispatch({ type: "switch_user", userId: "u_ola" });
    navigate("/app");
  };
  const ola = findUser(state, "u_ola");
  const tomek = findUser(state, "u_tomek");

  return (
    <div className="overflow-x-hidden bg-paper">
      <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-5 py-3 lg:px-10">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Sekcje strony">
            {[
              ["#jak", "Jak to działa"],
              ["#aktywnosci", "Aktywności"],
              ["#bezpieczenstwo", "Bezpieczeństwo"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={(e) => (
                  e.preventDefault(),
                  document.querySelector(h)?.scrollIntoView({ behavior: "smooth" })
                )}
                className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-800 hover:bg-ink-100"
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={enter} className="hidden sm:inline-flex">
              Zaloguj się
            </Button>
            <Button size="sm" onClick={() => navigate("/start")}>
              Załóż konto
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -right-40 -top-24 size-[42rem] rounded-full bg-brand-200/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-40 top-80 size-[28rem] rounded-full bg-amber-100 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pb-28 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[0.8125rem] font-bold text-ink-800 ring-1 ring-ink-200">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-brand-600" />
              </span>
              Spontaniczne spotkania 1:1 – teraz, nie kiedyś
            </p>
            <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-balance sm:text-6xl lg:text-[5rem]">
              Masz wolną chwilę? Znajdź kogoś,{" "}
              <span className="relative whitespace-nowrap text-brand-600">
                kto też
                <svg
                  viewBox="0 0 220 18"
                  className="absolute -bottom-2 left-0 w-full"
                  aria-hidden
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 13 C 50 3, 120 3, 217 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-700 lg:text-xl">
              Spontaniczne spotkania z ludźmi w Twojej okolicy. Kawa, spacer, trening albo piwo – z
              jedną osobą, która właśnie też ma czas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={enter} icon={<Sparkles className="size-5" />}>
                Znajdź spotkanie
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/start")}>
                Załóż konto
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-700">
              {[
                "Bez planowania na później",
                "Zawsze tylko dwie osoby",
                "Twoja lokalizacja jest prywatna",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-700" strokeWidth={3} aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative mx-auto h-[31.25rem] w-full max-w-[25rem] lg:h-[37.5rem]"
            aria-label="Przykładowe karty spotkań"
            role="img"
          >
            <div
              className="absolute inset-x-6 top-6 bottom-20 animate-float-b opacity-90"
              aria-hidden
            >
              <MeetingCardFace meeting={m("m3")} preview />
            </div>
            <div className="absolute inset-x-2 top-2 bottom-24 animate-float-a" aria-hidden>
              <MeetingCardFace meeting={m("m2")} preview />
            </div>
            <div className="absolute inset-0 bottom-16 shadow-float rounded-[1.875rem]" aria-hidden>
              <MeetingCardFace meeting={m("m5")} preview />
              <div className="absolute left-6 top-24 -rotate-12 rounded-2xl border-4 border-emerald-400 bg-emerald-500/20 px-4 py-1 font-display text-3xl font-extrabold text-emerald-300 backdrop-blur-sm">
                DOŁĄCZAM
              </div>
            </div>
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4"
              aria-hidden
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-ink-800 shadow-card ring-1 ring-ink-200">
                <X className="size-6" strokeWidth={2.6} />
              </span>
              <span className="flex h-14 items-center gap-2 rounded-full bg-brand-600 px-6 font-extrabold text-white shadow-float">
                <Heart className="size-5" strokeWidth={2.6} /> Chcę dołączyć
              </span>
            </div>
            {ola && tomek && (
              <div
                className="absolute -left-4 top-1/3 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-float ring-1 ring-ink-200 animate-fade-up [animation-delay:0.6s] sm:flex lg:-left-16"
                aria-hidden
              >
                <span className="flex -space-x-3">
                  <Avatar src={ola.photo} alt="" size={36} ring />
                  <Avatar src={tomek.photo} alt="" size={36} ring />
                </span>
                <span>
                  <span className="block text-sm font-extrabold">Widzicie się!</span>
                  <span className="block text-xs text-ink-600">Dotrzesz za ok. 9 min</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cytaty */}
      <section aria-label="Przykładowe sytuacje" className="border-y border-ink-200 bg-white py-8">
        <ul className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-5">
          {QUOTES.map((q, i) => (
            <li
              key={q}
              className={cx(
                "rounded-[1.375rem] px-5 py-3 text-[0.9375rem] font-semibold",
                i % 2
                  ? "rounded-bl-md bg-paper ring-1 ring-ink-200"
                  : "rounded-br-md bg-brand-600 text-white",
              )}
            >
              „{q}”
            </li>
          ))}
        </ul>
      </section>

      {/* Jak to działa */}
      <section id="jak" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-10 lg:py-28">
        <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-brand-700">
          Jak to działa?
        </p>
        <h2 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight lg:text-5xl">
          Od „chciałbym gdzieś wyjść” do spotkania w kilka minut.
        </h2>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: UserRound,
              t: "Zobacz, kto chce się spotkać",
              d: "Przeglądaj propozycje osób w promieniu kilku kilometrów. Każda karta to konkretny plan na teraz.",
            },
            {
              icon: Heart,
              t: "Przesuń w prawo i poczekaj na akceptację",
              d: "Organizator widzi Twój profil i wspólne zainteresowania. Wybiera jedną osobę.",
            },
            {
              icon: Zap,
              t: "Złap match i spotkajcie się",
              d: "Odblokowujemy mapę, Twój czas dotarcia i krótki czat do ustalenia szczegółów.",
            },
          ].map((s, i) => {
            const I = s.icon;
            return (
              <li key={s.t} className="relative rounded-[1.75rem] bg-white p-7 ring-1 ring-ink-200">
                <span
                  className="absolute right-6 top-5 font-display text-6xl font-extrabold text-ink-100"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="relative flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <I className="size-7" aria-hidden />
                </span>
                <h3 className="relative mt-6 text-2xl font-bold leading-tight">{s.t}</h3>
                <p className="relative mt-2 text-[0.9375rem] leading-relaxed text-ink-700">{s.d}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Aktywności */}
      <section id="aktywnosci" className="scroll-mt-20 bg-paper-2 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-brand-700">
                Przykładowe aktywności
              </p>
              <h2 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight lg:text-5xl">
                Wszystko, na co nie trzeba rezerwować stolika tydzień wcześniej.
              </h2>
            </div>
            <p className="max-w-sm text-[0.9375rem] text-ink-700">
              25 rodzajów aktywności w 5 kategoriach – od kawy po fotospacer. Do każdej podpowiadamy
              dopasowane miejsca w pobliżu.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {SHOWCASE.map((a, i) => (
              <li
                key={a.id}
                className={cx(
                  "group relative overflow-hidden rounded-[1.625rem]",
                  i === 0 || i === 7
                    ? "md:row-span-2 aspect-[3/4] md:aspect-auto"
                    : "aspect-[3/4] md:aspect-[4/3]",
                )}
              >
                <img
                  src={img(activityById(a.id).photo, 700, 700)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 text-white">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <ActivityIcon id={a.id} className="size-5" />
                  </span>
                  <span className="text-lg font-extrabold">{a.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bezpieczeństwo */}
      <section id="bezpieczenstwo" className="scroll-mt-20 bg-ink-950 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[1fr_26.25rem] lg:px-10">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-brand-300">
              Prywatność i bezpieczeństwo
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight lg:text-5xl">
              Spotykasz się z nieznajomym. Dlatego zaprojektowaliśmy to ostrożnie.
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                {
                  i: EyeOff,
                  t: "Lokalizacja tylko dla Ciebie",
                  d: "Nikt nie widzi Twojej pozycji, trasy, kierunku ani historii.",
                },
                {
                  i: Timer,
                  t: "ETA w przedziałach",
                  d: "Druga osoba widzi tylko przybliżony czas – np. „10–15 min”.",
                },
                {
                  i: MessageCircleOff,
                  t: "Czat tylko przed spotkaniem",
                  d: "Krótki, tymczasowy i przypisany do jednego spotkania.",
                },
                {
                  i: Ban,
                  t: "Blokowanie i zgłoszenia",
                  d: "Jednym dotknięciem zablokujesz lub zgłosisz nadużycie.",
                },
                {
                  i: Flag,
                  t: "Zgłoszenia nieobecności",
                  d: "Weryfikowane ręcznie. Bez automatycznych kar za błąd GPS.",
                },
                {
                  i: Lock,
                  t: "Dane kontaktowe chronione",
                  d: "E-mail i numer telefonu nigdy nie trafiają do innych.",
                },
              ].map((f) => {
                const I = f.i;
                return (
                  <li key={f.t} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
                      <I className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-lg font-bold">{f.t}</span>
                      <span className="mt-1 block text-[0.9375rem] leading-relaxed text-white/75">
                        {f.d}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="self-center rounded-[1.875rem] bg-white p-6 text-ink-950 shadow-float"
            aria-label="Przykład informacji o przybyciu"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink-600">
              Tak wygląda ETA po matchu
            </p>
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200">
              <p className="text-xs font-bold text-brand-800">Ty</p>
              <p className="font-display text-3xl font-extrabold">12 min</p>
              <p className="text-sm text-brand-800">Dotrzesz za około 12 minut</p>
            </div>
            <div className="mt-3 rounded-2xl bg-paper p-4 ring-1 ring-ink-200">
              <p className="text-xs font-bold text-ink-700">Druga osoba</p>
              <p className="mt-1 font-bold">Druga osoba powinna dotrzeć za około 15–20 min</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-600">
                <EyeOff className="size-3.5" aria-hidden /> Lokalizacja i trasa: ukryte
              </p>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-600">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden /> Czas
              liczony automatycznie z zapasem. Nie da się wpisać go ręcznie.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 lg:px-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] bg-brand-600 px-6 py-14 text-center text-white lg:py-20">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-400/60 blur-3xl"
            aria-hidden
          />
          <h2 className="relative text-4xl font-extrabold leading-tight text-balance lg:text-6xl">
            Ktoś w pobliżu też ma teraz czas.
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">
            Załóż konto w minutę i zobacz propozycje w swojej okolicy.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="!bg-white !text-ink-950 !ring-0"
              onClick={() => navigate("/start")}
            >
              Załóż konto <ArrowRight className="size-5" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="!text-white ring-1 ring-white/50 hover:!bg-white/10"
              onClick={enter}
            >
              Znajdź spotkanie
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              Spontaniczne spotkania 1:1 z ludźmi w Twojej okolicy.
            </p>
          </div>
          {[
            ["Produkt", ["Jak to działa", "Aktywności", "Bezpieczeństwo"]],
            ["Dla lokali", ["Promowanie miejsca", "Kontakt dla partnerów"]],
            ["Informacje", ["Regulamin", "Polityka prywatności", "Zasady społeczności"]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <p className="text-sm font-extrabold">{h}</p>
              <ul className="mt-3 flex flex-col gap-1">
                {(items as string[]).map((i) => (
                  <li key={i}>
                    <span className="inline-block py-1.5 text-sm text-ink-700">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-ink-600 lg:px-10">
            <span>© 2025 Vibrent.pl · Prototyp MVP – dane demonstracyjne</span>
            <button
              type="button"
              onClick={() => navigate("/ds")}
              className="min-h-11 font-bold underline underline-offset-4"
            >
              Design system
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
