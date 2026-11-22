import {
  Ban,
  Camera,
  Check,
  EyeOff,
  Flag,
  LocateFixed,
  LogOut,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  ACTIVITIES,
  AVATAR_PRESETS,
  INTERESTS,
  STYLE_GROUPS,
  STYLES,
  activityById,
  img,
} from "../data/catalog";
import type { ActivityId, User } from "../data/types";
import { ReportSheet } from "../components/ReportSheet";
import { Page, TopBar } from "../components/Shell";
import {
  ActivityIcon,
  Avatar,
  Button,
  Chip,
  cx,
  EmptyState,
  Field,
  Modal,
  Notice,
  SectionLabel,
  TextArea,
  TextInput,
  useToast,
} from "../components/ui";
import { goBack, navigate, Redirect } from "../lib/router";
import { age } from "../lib/time";
import { commonInterests, findUser, useMe, useStore } from "../store";
import { LocationSheet, fmtUpdated } from "../components/Location";

function ProfileBody({ user, viewer, own }: { user: User; viewer?: User; own?: boolean }) {
  const common = own ? [] : commonInterests(viewer, user);
  return (
    <>
      <div className="flex flex-col items-center text-center lg:flex-row lg:items-end lg:gap-6 lg:text-left">
        <Avatar
          src={user.photo}
          alt={`Zdjęcie profilowe: ${user.name}`}
          size={132}
          className="ring-4 ring-white shadow-card"
        />
        <div className="mt-4 lg:mb-2">
          <h1 className="text-4xl font-extrabold">
            {user.name}
            {user.showAge && (
              <span className="font-bold text-ink-600">, {age(user.birthYear)}</span>
            )}
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-[0.9375rem] font-semibold text-ink-700 lg:justify-start">
            <MapPin className="size-4" aria-hidden /> {user.location.city}
          </p>
        </div>
      </div>
      {!own && common.length > 0 && (
        <div className="mt-6 rounded-3xl bg-brand-50 p-4 ring-1 ring-brand-200">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-brand-800">
            <Sparkles className="size-4" aria-hidden /> Macie {common.length} wspólne
            zainteresowania
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {common.map((i) => (
              <Chip key={i} tone="common" size="sm">
                {i}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Section title="O mnie" className="lg:col-span-2">
          <p className="text-[1rem] leading-relaxed text-ink-900">{user.bio}</p>
        </Section>
        <Section title="Mój styl bycia">
          <div className="flex flex-wrap gap-1.5">
            {user.styles.map((s) => (
              <Chip key={s} size="sm">
                {s}
              </Chip>
            ))}
          </div>
        </Section>
        <Section title="Zainteresowania">
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((i) => (
              <Chip key={i} size="sm" tone={common.includes(i) ? "common" : "default"}>
                {i}
              </Chip>
            ))}
          </div>
        </Section>
        <Section title="Hobby">
          {user.hobbies.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {user.hobbies.map((h) => (
                <li key={h}>
                  <Chip size="sm">{h}</Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-600">Brak</p>
          )}
        </Section>
        <Section title="Ulubione aktywności">
          <div className="flex flex-wrap gap-2">
            {user.favActivities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[0.8125rem] font-bold ring-1 ring-ink-200"
              >
                <ActivityIcon id={a} className="size-4" /> {activityById(a).label}
              </span>
            ))}
          </div>
        </Section>
      </div>
      <p className="mt-5 flex items-start gap-2 text-[0.8125rem] text-ink-600">
        <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />{" "}
        {own
          ? "Inni widzą tylko informacje publiczne. Nigdy nie pokazujemy adresu ani bieżącej lokalizacji."
          : "Widzisz tylko informacje udostępnione publicznie. Adres i lokalizacja tej osoby są prywatne."}
      </p>
    </>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-3xl bg-white p-5 ring-1 ring-ink-200", className)}>
      <SectionLabel className="mb-3">{title}</SectionLabel>
      {children}
    </section>
  );
}

export function OwnProfile() {
  const me = useMe()!;
  const { dispatch } = useStore();
  const [locOpen, setLocOpen] = useState(false);
  return (
    <Page className="pt-5 lg:pt-10">
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={<Pencil className="size-4" />}
          onClick={() => navigate("/app/profile/edit")}
        >
          Edytuj profil
        </Button>
      </div>
      <ProfileBody user={me} own />
      <section className="mt-8">
        <SectionLabel>Ustawienia</SectionLabel>
        <div className="mt-2 divide-y divide-ink-100 overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200">
          <button
            type="button"
            onClick={() => setLocOpen(true)}
            className="flex min-h-16 w-full items-center gap-3 px-5 text-left hover:bg-paper"
          >
            <LocateFixed className="size-5 text-brand-600" aria-hidden />
            <span className="flex-1">
              <span className="block font-bold">Lokalizacja</span>
              <span className="block text-[0.8125rem] text-ink-600">
                {me.location.city}, {me.location.district} · {fmtUpdated(me.location.updatedAt)}
              </span>
            </span>
          </button>
          <div className="flex min-h-16 items-center gap-3 px-5 py-3">
            <ShieldCheck className="size-5 text-emerald-700" aria-hidden />
            <span className="flex-1">
              <span className="block font-bold">Prywatność</span>
              <span className="block text-[0.8125rem] text-ink-600">
                E-mail ({me.email ?? "ukryty"}) i dane kontaktowe nigdy nie są pokazywane innym.
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "switch_user", userId: null });
              navigate("/");
            }}
            className="flex min-h-16 w-full items-center gap-3 px-5 text-left text-red-700 hover:bg-red-50"
          >
            <LogOut className="size-5" aria-hidden /> <span className="font-bold">Wyloguj</span>
          </button>
        </div>
      </section>
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
    </Page>
  );
}

export function UserProfile({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const me = useMe()!;
  const toast = useToast();
  const u = findUser(state, id);
  const [report, setReport] = useState(false);
  const [block, setBlock] = useState(false);
  if (!u) return <EmptyState icon={<Ban className="size-9" />} title="Profil niedostępny" />;
  if (u.id === me.id) {
    return <Redirect to={"/app/profile"} />;
  }
  const blocked = (state.blocked[me.id] ?? []).includes(u.id);
  return (
    <>
      <TopBar title={u.name} sub="Profil publiczny" />
      <Page className="pt-6">
        <ProfileBody user={u} viewer={me} />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={<Flag className="size-4" />}
            onClick={() => setReport(true)}
          >
            Zgłoś profil
          </Button>
          <Button
            size="sm"
            variant="destructive"
            icon={<Ban className="size-4" />}
            disabled={blocked}
            onClick={() => setBlock(true)}
          >
            {blocked ? "Zablokowano" : "Zablokuj"}
          </Button>
        </div>
      </Page>
      <ReportSheet open={report} onClose={() => setReport(false)} kind="user" targetId={u.id} />
      <Modal
        open={block}
        onClose={() => setBlock(false)}
        title={`Zablokować: ${u.name}?`}
        actions={
          <>
            <Button
              block
              variant="dark"
              onClick={() => {
                dispatch({ type: "block", targetId: u.id });
                setBlock(false);
                toast(`Zablokowano: ${u.name}`);
                goBack("/app");
              }}
            >
              Zablokuj
            </Button>
            <Button block variant="ghost" onClick={() => setBlock(false)}>
              Anuluj
            </Button>
          </>
        }
      >
        Nie zobaczycie nawzajem swoich propozycji. Wspólne aktywne spotkania zostaną anulowane.
      </Modal>
    </>
  );
}

/* ---------- Edycja profilu (współdzielone z onboardingiem) ---------- */

export function PhotoPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold">Zdjęcie profilowe</p>
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-full bg-white text-ink-700 ring-1 ring-dashed ring-ink-300 hover:ring-ink-500 focus-within:ring-2 focus-within:ring-brand-600">
          <Upload className="size-5" aria-hidden />
          <span className="text-[0.625rem] font-bold">Wgraj</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Wgraj własne zdjęcie"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => onChange(String(r.result));
              r.readAsDataURL(f);
            }}
          />
        </label>
        {AVATAR_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            aria-label="Wybierz przykładowe zdjęcie"
            onClick={() => onChange(p)}
            className={cx(
              "relative rounded-full",
              value === p && "ring-[3px] ring-brand-600 ring-offset-2",
            )}
          >
            <img
              src={img(p, 160, 160, true)}
              alt=""
              className="size-16 rounded-full object-cover"
            />
            {value === p && (
              <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-brand-600 text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
        {value && !AVATAR_PRESETS.includes(value) && (
          <span className="relative rounded-full ring-[3px] ring-brand-600 ring-offset-2">
            <Avatar src={value} alt="Wybrane zdjęcie" size={64} />
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-[0.8125rem] font-semibold text-red-700">{error}</p>}
      <p className="mt-1.5 flex items-center gap-1 text-[0.8125rem] text-ink-600">
        <Camera className="size-3.5" aria-hidden /> Wyraźna twarz zwiększa zaufanie i szansę na
        akceptację.
      </p>
    </div>
  );
}

export const toggle = <T,>(list: T[], v: T, max = 99) =>
  list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

export function ProfileEdit() {
  const me = useMe()!;
  const { dispatch } = useStore();
  const toast = useToast();
  const [f, setF] = useState({ ...me, hobbiesText: me.hobbies.join(", ") });
  const [tried, setTried] = useState(false);
  const errors = {
    name: f.name.trim().length < 2 ? "Podaj imię lub pseudonim (min. 2 znaki)" : "",
    bio: f.bio.trim().length < 20 ? "Opis powinien mieć co najmniej 20 znaków" : "",
    styles: f.styles.length < 1 ? "Wybierz przynajmniej jedną cechę" : "",
    interests: f.interests.length < 3 ? "Wybierz co najmniej 3 zainteresowania" : "",
  };
  const invalid = Object.values(errors).some(Boolean);
  const save = () => {
    setTried(true);
    if (invalid) return;
    const { hobbiesText, ...rest } = f;
    dispatch({
      type: "update_profile",
      patch: {
        name: rest.name.trim(),
        bio: rest.bio.trim(),
        photo: rest.photo,
        showAge: rest.showAge,
        styles: rest.styles,
        interests: rest.interests,
        favActivities: rest.favActivities,
        hobbies: hobbiesText
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean)
          .slice(0, 6),
      },
    });
    toast("Profil zapisany", { tone: "success" });
    goBack("/app/profile");
  };
  return (
    <div className="pb-32">
      <TopBar title="Edytuj profil" />
      <Page className="flex flex-col gap-7 pt-6">
        <PhotoPicker value={f.photo} onChange={(photo) => setF({ ...f, photo })} />
        <Field id="pe-name" label="Imię lub pseudonim" error={tried ? errors.name : ""}>
          <TextInput
            id="pe-name"
            value={f.name}
            maxLength={24}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            invalid={tried && !!errors.name}
          />
        </Field>
        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white px-4 ring-1 ring-ink-200">
          <span>
            <span className="block text-sm font-bold">Pokazuj mój wiek</span>
            <span className="block text-xs text-ink-600">
              Wiek: {age(f.birthYear)} – data urodzenia zawsze pozostaje prywatna
            </span>
          </span>
          <input
            type="checkbox"
            checked={f.showAge}
            onChange={(e) => setF({ ...f, showAge: e.target.checked })}
            className="size-6 accent-brand-600"
          />
        </label>
        <Field
          id="pe-bio"
          label="Krótki opis"
          counter={`${f.bio.length}/160`}
          error={tried ? errors.bio : ""}
        >
          <TextArea
            id="pe-bio"
            value={f.bio}
            maxLength={160}
            onChange={(e) => setF({ ...f, bio: e.target.value })}
            invalid={tried && !!errors.bio}
          />
        </Field>
        <ChipGroup
          label="Mój styl bycia"
          sub="Do 5 cech"
          options={STYLES}
          groups={STYLE_GROUPS}
          value={f.styles}
          onChange={(styles) => setF({ ...f, styles })}
          max={5}
          error={tried ? errors.styles : ""}
        />
        <ChipGroup
          label="Zainteresowania"
          sub="Min. 3, maks. 8"
          options={INTERESTS}
          value={f.interests}
          onChange={(interests) => setF({ ...f, interests })}
          max={8}
          error={tried ? errors.interests : ""}
        />
        <Field id="pe-hob" label="Hobby" hint="Oddziel przecinkami, np. Wspinaczka, Ceramika">
          <TextInput
            id="pe-hob"
            value={f.hobbiesText}
            onChange={(e) => setF({ ...f, hobbiesText: e.target.value })}
          />
        </Field>
        <fieldset>
          <legend className="text-sm font-bold">Ulubione aktywności</legend>
          <p className="text-[0.8125rem] text-ink-600">Do 5</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <Chip
                key={a.id}
                selected={f.favActivities.includes(a.id)}
                onClick={() =>
                  setF({ ...f, favActivities: toggle<ActivityId>(f.favActivities, a.id, 5) })
                }
                icon={<ActivityIcon id={a.id} className="size-4" />}
              >
                {a.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        {tried && invalid && (
          <Notice tone="danger">Popraw zaznaczone pola, aby zapisać profil.</Notice>
        )}
      </Page>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:left-[17rem]">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Button size="lg" variant="ghost" onClick={() => goBack("/app/profile")}>
            Anuluj
          </Button>
          <Button size="lg" block onClick={save}>
            Zapisz zmiany
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ChipGroup({
  label,
  sub,
  options,
  groups,
  value,
  onChange,
  max,
  error,
}: {
  label: string;
  sub?: string;
  options: string[];
  /** Opcjonalny podział opcji na podpisane grupy (zamiast jednej listy). */
  groups?: { label: string; options: string[] }[];
  value: string[];
  onChange: (v: string[]) => void;
  max: number;
  error?: string;
}) {
  const renderChips = (list: string[]) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {list.map((o) => (
        <Chip key={o} selected={value.includes(o)} onClick={() => onChange(toggle(value, o, max))}>
          {value.includes(o) && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
          {o}
        </Chip>
      ))}
    </div>
  );
  return (
    <fieldset>
      <legend className="text-sm font-bold">{label}</legend>
      <p className="text-[0.8125rem] text-ink-600">
        {sub ? `${sub} · ` : ""}wybrano {value.length}/{max}
      </p>
      {groups ? (
        <div className="mt-1 flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-500">
                {g.label}
              </p>
              {renderChips(g.options)}
            </div>
          ))}
        </div>
      ) : (
        renderChips(options)
      )}
      {error && (
        <p className="mt-1.5 text-[0.8125rem] font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
