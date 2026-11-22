import { Heart, MapPinOff, Plus, RotateCw, WifiOff, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, INTERESTS } from "../data/catalog";
import { VENUES } from "../data/demo";
import { PersonCard, VenueCard } from "../components/cards";
import { MapView } from "../components/MapView";
import { MeetingCardFace } from "../components/SwipeDeck";
import { TopBar } from "../components/Shell";
import {
  ActivityChip,
  Button,
  Chip,
  cx,
  DemoBadge,
  EmptyState,
  Field,
  Logo,
  LogoMark,
  MEETING_STATUS,
  Modal,
  Notice,
  NowBadge,
  PromotedBadge,
  REQUEST_STATUS,
  SectionLabel,
  Sheet,
  Skeleton,
  StatusPill,
  TextArea,
  TextInput,
  useToast,
} from "../components/ui";
import { findUser, useStore } from "../store";

function Block({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-[1.75rem] bg-white p-6 ring-1 ring-ink-200", className)}>
      <SectionLabel className="mb-4">{title}</SectionLabel>
      {children}
    </section>
  );
}

export function DesignSystem() {
  const { state } = useStore();
  const toast = useToast();
  const [sheet, setSheet] = useState(false);
  const [modal, setModal] = useState(false);
  const [chip, setChip] = useState<string[]>(["Kino"]);
  const ola = findUser(state, "u_ola")!;
  const kuba = findUser(state, "u_kuba")!;
  const colors = [
    ["brand-600", "#d23e17", "Marka / CTA"],
    ["brand-700", "#ad3110", "Hover, tekst"],
    ["brand-100", "#ffe6db", "Tła akcentowe"],
    ["ink-950", "#121218", "Tekst główny"],
    ["ink-600", "#55556a", "Tekst drugorzędny"],
    ["paper", "#faf7f3", "Tło aplikacji"],
  ];
  return (
    <div className="pb-20">
      <TopBar title="Design system Vibrent" sub="Komponenty i stany prototypu MVP" />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-6 lg:grid-cols-2 lg:px-8">
        <Block title="Logo" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-8">
            <Logo />
            <div className="rounded-2xl bg-ink-950 p-4">
              <Logo light />
            </div>
            <LogoMark className="size-16" />
            <p className="max-w-sm text-sm text-ink-600">
              Dwie postacie blisko siebie – znajomość i spotkanie. Domena „.pl” jako element
              drugorzędny.
            </p>
          </div>
        </Block>
        <Block title="Kolory">
          <div className="grid grid-cols-3 gap-3">
            {colors.map(([n, hex, use]) => (
              <div key={n}>
                <div className="h-16 rounded-2xl ring-1 ring-ink-200" style={{ background: hex }} />
                <p className="mt-1.5 text-xs font-bold">{n}</p>
                <p className="text-[0.6875rem] text-ink-600">{use}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span
                key={c.id}
                className={cx("rounded-full px-3 py-1.5 text-xs font-bold", c.tint, c.text)}
              >
                {c.label}
              </span>
            ))}
          </div>
        </Block>
        <Block title="Typografia">
          <p className="font-display text-5xl font-extrabold leading-none">Widzicie się!</p>
          <p className="mt-2 font-display text-2xl font-bold">Bricolage Grotesque – nagłówki</p>
          <p className="mt-2 text-[0.9375rem]">
            Manrope – tekst. Zażółć gęślą jaźń. ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż
          </p>
        </Block>
        <Block title="Przyciski">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="success">Akceptuj</Button>
            <Button disabled>Disabled</Button>
            <Button size="lg" icon={<Plus className="size-5" />}>
              Duży z ikoną
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-card ring-1 ring-ink-200">
              <X className="size-7" />
            </span>
            <span className="flex h-16 items-center gap-2 rounded-full bg-brand-600 px-7 font-extrabold text-white">
              <Heart className="size-6" /> Chcę dołączyć
            </span>
          </div>
        </Block>
        <Block title="Chipsy, odznaki i statusy">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.slice(0, 5).map((i) => (
              <Chip
                key={i}
                selected={chip.includes(i)}
                onClick={() =>
                  setChip((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
                }
              >
                {i}
              </Chip>
            ))}
            <Chip tone="common">Wspólne</Chip>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActivityChip id="kawa" />
            <ActivityChip id="silownia" />
            <ActivityChip id="kino" />
            <ActivityChip id="rozmowa" />
            <ActivityChip id="fotografia" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <NowBadge />
            <PromotedBadge />
            <DemoBadge />
          </div>
          <p className="mt-4 text-xs font-bold text-ink-600">Stany spotkań</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {Object.values(MEETING_STATUS).map((s) => (
              <StatusPill key={s.label} {...s} />
            ))}
          </div>
          <p className="mt-3 text-xs font-bold text-ink-600">Stany zgłoszeń</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {Object.values(REQUEST_STATUS).map((s) => (
              <StatusPill key={s.label} {...s} />
            ))}
            <StatusPill label="Możliwe spóźnienie" cls="bg-amber-100 text-amber-900" />
          </div>
        </Block>
        <Block title="Formularze">
          <div className="flex flex-col gap-4">
            <Field id="ds1" label="Tytuł" counter="18/60" hint="Krótko i konkretnie">
              <TextInput id="ds1" defaultValue="Kawa w centrum?" />
            </Field>
            <Field id="ds2" label="Opis" error="Dodaj krótki opis – co najmniej 10 znaków">
              <TextArea id="ds2" invalid defaultValue="Kawa" />
            </Field>
            <div>
              <label htmlFor="ds3" className="text-sm font-bold">
                Suwak promienia
              </label>
              <input
                id="ds3"
                type="range"
                min={1}
                max={5}
                step={0.5}
                defaultValue={3}
                className="mt-2 h-11 w-full accent-brand-600"
              />
            </div>
          </div>
        </Block>
        <Block title="Komunikaty i toasty">
          <div className="flex flex-col gap-2">
            <Notice tone="info" title="Informacja">
              Lokalizacja używana tylko do ETA.
            </Notice>
            <Notice tone="warn" title="Możliwe spóźnienie">
              Druga osoba prawdopodobnie się spóźni.
            </Notice>
            <Notice tone="success" title="Zgłoszenie przyjęte">
              Wymaga weryfikacji.
            </Notice>
            <Notice tone="danger" title="Nie wysłano">
              Brak internetu.
            </Notice>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast("Zgłoszenie wysłane. Czekamy na decyzję organizatora.", { tone: "success" })
              }
            >
              Toast sukcesu
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast("Nie udało się wysłać wiadomości", { tone: "error" })}
            >
              Toast błędu
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSheet(true)}>
              Bottom sheet
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setModal(true)}>
              Modal
            </Button>
          </div>
        </Block>
        <Block title="Bąbelki wiadomości">
          <div className="flex flex-col gap-2">
            <div className="max-w-[80%] self-start rounded-[1.375rem] rounded-bl-md bg-white px-4 py-2.5 text-[0.9375rem] ring-1 ring-ink-200">
              Cześć! Będę w granatowej kurtce.
            </div>
            <div className="max-w-[80%] self-end rounded-[1.375rem] rounded-br-md bg-brand-600 px-4 py-2.5 text-[0.9375rem] text-white">
              Super, do zobaczenia!
            </div>
            <div className="flex flex-col items-end">
              <div className="max-w-[80%] rounded-[1.375rem] rounded-br-md bg-white px-4 py-2.5 text-[0.9375rem] ring-2 ring-red-400">
                Jestem już na miejscu
              </div>
              <span className="mt-1 flex items-center gap-1 text-xs font-bold text-red-700">
                <RotateCw className="size-3.5" /> Nie wysłano · Ponów
              </span>
            </div>
          </div>
        </Block>
        <Block title="Skeletony">
          <div className="flex gap-3">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-4 h-40 rounded-3xl" />
        </Block>
        <Block title="Karta swipe">
          <div className="mx-auto h-[28.75rem] max-w-xs">
            {state.meetings[0] && (
              <MeetingCardFace
                meeting={state.meetings.find((m) => m.id === "m6") ?? state.meetings[0]}
                me={ola}
              />
            )}
          </div>
        </Block>
        <Block title="Karta lokalu i profilu">
          <div className="flex flex-col gap-3">
            <VenueCard venue={VENUES[0]} me={ola} activity="kawa" selected onSelect={() => {}} />
            <PersonCard
              user={kuba}
              me={ola}
              onViewProfile={() => {}}
              actions={
                <Button size="sm" variant="success">
                  Akceptuj
                </Button>
              }
            />
          </div>
        </Block>
        <Block title="Elementy mapy">
          <MapView
            venue={VENUES[3]}
            me={ola.location}
            activity="pub"
            showRoute
            className="h-72 rounded-3xl"
          />
        </Block>
        <Block title="Stany puste i błędy" className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-paper">
              <EmptyState icon={<Plus className="size-9" />} title="Brak spotkań w okolicy">
                Zmień filtry albo utwórz własne.
              </EmptyState>
            </div>
            <div className="rounded-3xl bg-paper">
              <EmptyState icon={<WifiOff className="size-9" />} title="Brak internetu">
                Akcje zostaną wstrzymane do odzyskania połączenia.
              </EmptyState>
            </div>
            <div className="rounded-3xl bg-paper">
              <EmptyState icon={<MapPinOff className="size-9" />} title="Nie udało się pobrać mapy">
                Adres i ETA nadal są dostępne.
              </EmptyState>
            </div>
          </div>
        </Block>
      </div>
      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Bottom sheet"
        footer={
          <Button block onClick={() => setSheet(false)}>
            Zamknij
          </Button>
        }
      >
        <p className="text-[0.9375rem] text-ink-700">
          Na telefonie wysuwa się od dołu, na desktopie wyświetla jako okno dialogowe. Zamyka się
          klawiszem Esc.
        </p>
      </Sheet>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Akceptować Kubę?"
        actions={
          <Button block onClick={() => setModal(false)}>
            OK
          </Button>
        }
      >
        Pozostałe zgłoszenia zostaną zamknięte.
      </Modal>
    </div>
  );
}
