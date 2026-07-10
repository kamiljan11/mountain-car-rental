// Katalog checklisty wydania auta (kamper / Caddy). Klucze są stabilne — po nich
// trzymamy stan w bazie (rental.customer_checklists); etykiety można zmieniać bez
// migracji. Kolejność i grupy = kolejność wykonywania przy wydaniu i zwrocie.

export interface ChecklistItem {
  key: string;
  label: string;
}
export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistGroup[] = [
  {
    title: "Przed wydaniem",
    items: [
      { key: "umowa", label: "Umowę przygotować do podpisania" },
      { key: "km_przed", label: "Zdjęcie licznika PRZED (stan początkowy)" },
    ],
  },
  {
    title: "Pokaz i obsługa auta",
    items: [
      { key: "kuchenka", label: "Kuchenka — przyciśnij i odciśnij blokadę" },
      { key: "lodowka", label: "Pokazać, jak obsługiwać lodówkę" },
      { key: "lozko", label: "Pokazać, jak rozkłada się łóżko" },
      { key: "zaslonki", label: "Zasłonki w Caddy" },
      { key: "mapa", label: "Mapa (dodatek) — dać klientowi" },
    ],
  },
  {
    title: "Instrukcje dla klienta",
    items: [
      { key: "kawa_kluczyki", label: "Dać im kawy i wytłumaczyć kluczyki" },
      { key: "parkowanie", label: "Uważać, gdzie parkują — grunt bywa grząski" },
      { key: "arek", label: "Jeśli ktoś zatrzyma — mówić, że to auto kolegi Arka" },
      {
        key: "zapali",
        label: "Zapali się kontrolka — bez stresu, mechanik zagląda po tripie",
      },
    ],
  },
  {
    title: "Po zwrocie",
    items: [{ key: "km_po", label: "Zdjęcie licznika PO (stan końcowy)" }],
  },
];

export const CHECKLIST_ITEMS = CHECKLIST.flatMap((g) => g.items);
export const CHECKLIST_COUNT = CHECKLIST_ITEMS.length;
