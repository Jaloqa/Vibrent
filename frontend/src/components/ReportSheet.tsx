import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReportKind } from "../data/types";
import { uid, useStore } from "../store";
import { Button, cx, Field, Notice, Sheet, TextArea, useToast } from "./ui";

const REASONS: Record<ReportKind, string[]> = {
  no_show: [
    "Druga osoba nie pojawiła się na miejscu",
    "Druga osoba odwołała w ostatniej chwili poza aplikacją",
    "Nie udało nam się odnaleźć na miejscu",
  ],
  abuse: [
    "Obraźliwe lub nękające wiadomości",
    "Treści seksualne lub niechciane propozycje",
    "Spam, reklama lub wyłudzenie",
    "Prośba o dane kontaktowe lub pieniądze",
    "Inne",
  ],
  meeting: [
    "Propozycja wymaga wcześniejszej rezerwacji lub biletu",
    "To wydarzenie grupowe, a nie spotkanie 1:1",
    "Nieodpowiednie lub niebezpieczne miejsce",
    "Spam lub reklama",
    "Inne",
  ],
  user: [
    "Fałszywy profil",
    "Nieodpowiednie zdjęcie lub opis",
    "Podejrzenie, że osoba jest niepełnoletnia",
    "Inne",
  ],
};

const TITLES: Record<ReportKind, string> = {
  no_show: "Zgłoś nieobecność",
  abuse: "Zgłoś nadużycie",
  meeting: "Zgłoś propozycję",
  user: "Zgłoś profil",
};

export function ReportSheet({
  open,
  onClose,
  kind,
  meetingId,
  targetId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  kind: ReportKind;
  meetingId?: string;
  targetId?: string;
  onDone?: () => void;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setReason("");
      setNote("");
      setError("");
    }
  }, [open]);
  const already = state.reports.find(
    (r) =>
      r.reporterId === state.currentUserId &&
      r.kind === kind &&
      r.meetingId === meetingId &&
      r.targetId === targetId,
  );

  const submit = () => {
    if (!reason) return setError("Wybierz powód zgłoszenia");
    if (state.offline)
      return setError("Brak internetu – zgłoszenie nie zostało wysłane. Spróbuj ponownie.");
    dispatch({
      type: "report",
      kind,
      meetingId,
      targetId,
      reason: note ? `${reason} – ${note}` : reason,
      id: uid("rep"),
    });
    toast("Zgłoszenie przyjęte", {
      tone: "success",
      sub: "Wymaga weryfikacji. Nie naliczamy automatycznych konsekwencji.",
    });
    onClose();
    onDone?.();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={TITLES[kind]}
      footer={
        already ? (
          <Button block variant="secondary" onClick={onClose}>
            Zamknij
          </Button>
        ) : (
          <Button block variant={kind === "no_show" ? "dark" : "primary"} onClick={submit}>
            Wyślij zgłoszenie
          </Button>
        )
      }
    >
      {already ? (
        <Notice
          tone="success"
          title="Już to zgłoszono"
          icon={<ShieldCheck className="size-[1.125rem]" />}
        >
          Twoje zgłoszenie jest w weryfikacji. Aby ograniczyć nadużycia, w jednej sprawie można
          wysłać tylko jedno zgłoszenie.
        </Notice>
      ) : (
        <div className="flex flex-col gap-5">
          {kind === "no_show" ? (
            <Notice tone="info" title="Zgłoszenie nie oznacza automatycznej kary">
              Każde zgłoszenie trafia do weryfikacji. Bierzemy pod uwagę błędy GPS, awarie telefonu
              i sytuacje losowe. Sam brak danych lokalizacji nie jest dowodem nieobecności.
            </Notice>
          ) : (
            <p className="text-sm text-ink-600">
              Zgłoszenie jest poufne – druga osoba nie dowie się, kto je wysłał.
            </p>
          )}
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Powód</legend>
            <div className="flex flex-col gap-2" role="radiogroup">
              {REASONS[kind].map((r) => (
                <label
                  key={r}
                  className={cx(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 ring-1 transition",
                    reason === r
                      ? "bg-brand-50 ring-2 ring-brand-600"
                      : "bg-white ring-ink-200 hover:ring-ink-300",
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => (setReason(r), setError(""))}
                    className="size-5 accent-brand-600"
                  />
                  <span className="text-[0.9375rem] font-semibold">{r}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field
            id="report-note"
            label="Dodatkowe informacje (opcjonalnie)"
            counter={`${note.length}/300`}
            error={error}
          >
            <TextArea
              id="report-note"
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opisz krótko, co się stało"
            />
          </Field>
        </div>
      )}
    </Sheet>
  );
}
