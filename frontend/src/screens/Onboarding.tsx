import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  LocateFixed,
  PartyPopper,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { INTERESTS, STYLE_GROUPS, STYLES } from "../data/catalog";
import type { User, UserLocation } from "../data/types";
import { Avatar, Button, cx, Field, IconButton, Logo, TextArea, TextInput } from "../components/ui";
import { navigate } from "../lib/router";
import { uid, useStore } from "../store";
import { ChipGroup, PhotoPicker } from "./Profile";
import { simulatedPosition } from "../components/Location";

const STEPS = [
  "Konto",
  "O Tobie",
  "Styl bycia",
  "Zainteresowania",
  "Opis",
  "Lokalizacja",
  "Gotowe",
];
const MIN_AGE = 18;

function yearsSince(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return NaN;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [locating, setLocating] = useState(false);
  const [f, setF] = useState({
    email: "",
    password: "",
    name: "",
    birth: "",
    photo: "",
    showAge: true,
    styles: [] as string[],
    interests: [] as string[],
    bio: "",
    location: null as UserLocation | null,
    consent: false,
  });

  const years = yearsSince(f.birth);
  const errs: Record<number, Record<string, string>> = {
    0: {
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? "Podaj poprawny adres e-mail" : "",
      password:
        f.password.length < 8 || !/\d/.test(f.password) ? "Hasło: min. 8 znaków, w tym cyfra" : "",
    },
    1: {
      name: f.name.trim().length < 2 ? "Podaj imię lub pseudonim (min. 2 znaki)" : "",
      birth: !f.birth
        ? "Podaj datę urodzenia"
        : Number.isNaN(years)
          ? "Nieprawidłowa data"
          : years < MIN_AGE
            ? `Vibrent jest dostępny od ${MIN_AGE}. roku życia`
            : years > 100
              ? "Sprawdź datę urodzenia"
              : "",
      photo: !f.photo ? "Dodaj zdjęcie profilowe" : "",
    },
    2: { styles: f.styles.length < 1 ? "Wybierz co najmniej jedną cechę" : "" },
    3: { interests: f.interests.length < 3 ? "Wybierz co najmniej 3 zainteresowania" : "" },
    4: { bio: f.bio.trim().length < 20 ? "Napisz co najmniej 20 znaków" : "" },
    5: {
      location: !f.location
        ? "Udostępnij lokalizację – bez niej nie można korzystać z aplikacji"
        : "",
    },
  };
  const e = tried ? (errs[step] ?? {}) : {};
  const stepValid = !Object.values(errs[step] ?? {}).some(Boolean);

  const next = () => {
    setTried(true);
    if (!stepValid) return;
    setTried(false);
    if (step === 5) {
      const user: User = {
        id: uid("u_new"),
        name: f.name.trim(),
        birthYear: new Date(f.birth).getFullYear(),
        showAge: f.showAge,
        photo: f.photo,
        bio: f.bio.trim(),
        styles: f.styles,
        interests: f.interests,
        hobbies: [],
        favActivities: [],
        location: f.location!,
        travelMode: "walk",
        email: f.email,
      };
      dispatch({ type: "register", user });
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  };

  const done = step === 6;

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-6">
        <header className="flex min-h-16 items-center gap-2">
          {step > 0 && !done ? (
            <IconButton
              label="Wstecz"
              onClick={() => (setTried(false), setStep(step - 1))}
              className="-ml-2"
            >
              <ChevronLeft className="size-6" />
            </IconButton>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl"
              aria-label="Wróć na stronę główną"
            >
              <Logo compact />
            </button>
          )}
          <span className="ml-auto text-sm font-bold text-ink-600">
            {done ? "Gotowe" : `Krok ${step + 1} z ${STEPS.length}`}
          </span>
        </header>
        <div
          className="flex gap-1"
          role="progressbar"
          aria-label="Postęp rejestracji"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cx(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-brand-600" : "bg-ink-200",
              )}
              title={s}
            />
          ))}
        </div>

        <main className="flex-1 pt-8 animate-fade-up" key={step}>
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Załóż konto</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Za chwilę znajdziesz kogoś na kawę, spacer albo trening.
                </p>
              </div>
              <Field id="ob-email" label="E-mail" error={e.email}>
                <TextInput
                  id="ob-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={f.email}
                  onChange={(x) => setF({ ...f, email: x.target.value })}
                  placeholder="ty@przyklad.pl"
                  invalid={!!e.email}
                />
              </Field>
              <Field id="ob-pw" label="Hasło" error={e.password} hint="Min. 8 znaków, w tym cyfra">
                <div className="relative">
                  <TextInput
                    id="ob-pw"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={f.password}
                    onChange={(x) => setF({ ...f, password: x.target.value })}
                    invalid={!!e.password}
                    className="pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
                    aria-label={showPw ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </Field>
              <p className="text-xs leading-relaxed text-ink-600">
                Zakładając konto, akceptujesz regulamin i politykę prywatności. Twój e-mail nigdy
                nie będzie widoczny dla innych.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Kim jesteś?</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Te informacje zobaczy organizator, gdy zgłosisz się do spotkania.
                </p>
              </div>
              <Field id="ob-name" label="Imię lub pseudonim" error={e.name}>
                <TextInput
                  id="ob-name"
                  autoComplete="given-name"
                  maxLength={24}
                  value={f.name}
                  onChange={(x) => setF({ ...f, name: x.target.value })}
                  invalid={!!e.name}
                />
              </Field>
              <Field
                id="ob-birth"
                label="Data urodzenia"
                error={e.birth}
                hint={`Musisz mieć ukończone ${MIN_AGE} lat. Data pozostaje prywatna.`}
              >
                <TextInput
                  id="ob-birth"
                  type="date"
                  value={f.birth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(x) => setF({ ...f, birth: x.target.value })}
                  invalid={!!e.birth}
                />
              </Field>
              <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white px-4 ring-1 ring-ink-200">
                <span className="text-sm font-bold">Pokazuj mój wiek w profilu</span>
                <input
                  type="checkbox"
                  checked={f.showAge}
                  onChange={(x) => setF({ ...f, showAge: x.target.checked })}
                  className="size-6 accent-brand-600"
                />
              </label>
              <PhotoPicker
                value={f.photo}
                onChange={(photo) => setF({ ...f, photo })}
                error={e.photo}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Jaki masz styl bycia?</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Pomoże to dobrać osoby, z którymi dobrze spędzisz czas.
                </p>
              </div>
              <ChipGroup
                label="Wybierz do 5 cech"
                options={STYLES}
                groups={STYLE_GROUPS}
                value={f.styles}
                onChange={(styles) => setF({ ...f, styles })}
                max={5}
                error={e.styles}
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Co Cię kręci?</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Pokażemy wspólne zainteresowania na kartach spotkań.
                </p>
              </div>
              <ChipGroup
                label="Zainteresowania"
                sub="Min. 3, maks. 8"
                options={INTERESTS}
                value={f.interests}
                onChange={(interests) => setF({ ...f, interests })}
                max={8}
                error={e.interests}
              />
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Napisz coś o sobie</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Jedno, dwa zdania wystarczą. Bez numeru telefonu i adresu.
                </p>
              </div>
              <Field id="ob-bio" label="Krótki opis" counter={`${f.bio.length}/160`} error={e.bio}>
                <TextArea
                  id="ob-bio"
                  maxLength={160}
                  value={f.bio}
                  onChange={(x) => setF({ ...f, bio: x.target.value })}
                  placeholder="Nowy w mieście, lubię kawę i spontaniczne wyjścia…"
                  invalid={!!e.bio}
                  className="min-h-32"
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-[2rem] font-extrabold leading-tight">Gdzie jesteś?</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  Lokalizacja jest sercem Vibrent – pokazujemy spotkania blisko Ciebie i liczymy
                  czas dotarcia.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-200">
                <ul className="flex flex-col gap-2.5 text-sm text-ink-800">
                  <li className="flex gap-2">
                    <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Nikt
                    nie zobaczy Twojej pozycji, trasy ani historii lokalizacji.
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Używamy
                    jej tylko do wyszukiwania i ETA, gdy korzystasz z aplikacji.
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden /> Druga
                    osoba widzi wyłącznie przybliżony przedział Twojego czasu przybycia.
                  </li>
                </ul>
                <Button
                  block
                  size="lg"
                  className="mt-5"
                  variant={f.location?.mode === "gps" ? "success" : "primary"}
                  disabled={locating}
                  icon={
                    locating ? (
                      <RefreshCw className="size-5 animate-spin" />
                    ) : (
                      <LocateFixed className="size-5" />
                    )
                  }
                  onClick={() => {
                    setLocating(true);
                    setTimeout(() => {
                      setF((cur) => ({ ...cur, location: simulatedPosition(undefined, false) }));
                      setLocating(false);
                    }, 900);
                  }}
                >
                  {locating
                    ? "Pobieranie lokalizacji…"
                    : f.location?.mode === "gps"
                      ? `Udostępniono · ${f.location.city}, ${f.location.district}`
                      : "Zezwól na lokalizację"}
                </Button>
                <p className="mt-2 text-center text-xs text-ink-600">
                  W prototypie pozycja jest symulowana: Kraków, Stare Miasto.
                </p>
              </div>
              <div>
                <p className="text-[0.8125rem] leading-relaxed text-ink-600">
                  Lokalizacja jest wymagana do korzystania z aplikacji – spotkania odbywają się tu i
                  teraz. W każdej chwili możesz ją odświeżyć w aplikacji.
                </p>
                {e.location && (
                  <p className="mt-2 text-[0.8125rem] font-semibold text-red-700" role="alert">
                    {e.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {done && (
            <div className="flex flex-col items-center pt-6 text-center">
              <div className="relative">
                <span
                  className="absolute inset-0 rounded-full bg-brand-400 animate-pulse-ring"
                  aria-hidden
                />
                <span className="relative block rounded-full animate-pop">
                  <Avatar
                    src={f.photo}
                    alt=""
                    size={120}
                    className="ring-4 ring-white shadow-card"
                  />
                </span>
                <span className="absolute -bottom-1 -right-1 flex size-11 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-paper">
                  <PartyPopper className="size-5" aria-hidden />
                </span>
              </div>
              <h1 className="mt-7 text-[2.125rem] font-extrabold leading-tight">
                Gotowe, {f.name}!
              </h1>
              <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink-600">
                Twój profil jest gotowy. Zobacz, kto w okolicy ma teraz wolną chwilę – albo załóż
                własne spotkanie.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {f.interests.slice(0, 5).map((i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white px-3 py-1.5 text-[0.8125rem] font-bold ring-1 ring-ink-200"
                  >
                    {i}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-[0.8125rem] text-ink-600">
                Wszystko możesz później zmienić w zakładce Profil.
              </p>
            </div>
          )}
        </main>

        <div className="sticky bottom-0 -mx-5 mt-8 bg-paper/95 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {done ? (
            <div className="flex flex-col gap-2">
              <Button block size="lg" onClick={() => navigate("/app", { replace: true })}>
                Zacznij odkrywać
              </Button>
              <Button
                block
                variant="ghost"
                onClick={() => navigate("/app/create", { replace: true })}
              >
                Utwórz pierwsze spotkanie
              </Button>
            </div>
          ) : (
            <Button block size="lg" onClick={next}>
              {step === 5 ? "Zakończ" : "Dalej"} <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
