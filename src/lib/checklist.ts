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

// Wyposażenie zależy od AUTA. Komplet do odhaczenia przy wydaniu i zwrocie; stan
// trzymany tak samo jak checklista (po kluczach `eq_*` w rental.customer_checklists —
// klucze stabilne, etykiety można zmieniać bez migracji). „per osoba" = ×liczba osób.
//
// Na razie zdefiniowany jest komplet dla DUŻEGO KAMPERA (Renault Master — 2 szt., żółte).
// Caddy i inne auta dostaną WŁASNE listy — dopisz kolejny wpis do EQUIPMENT_SETS z jego
// `match` (po nazwie pojazdu) i `items` (klucze eq_* muszą być UNIKALNE między autami).
export interface EquipmentSet extends ChecklistGroup {
  match: (vehicleName: string) => boolean;
}

export const EQUIPMENT_SETS: EquipmentSet[] = [
  {
    title: "Wyposażenie — Renault Master (duży żółty kamper)",
    match: (name) => /master/i.test(name),
    items: [
      { key: "eq_spiwor", label: "Czarny śpiwór — per osoba" },
      { key: "eq_poduszka", label: "Poduszka — per osoba" },
      { key: "eq_poszewka", label: "Poszewka na poduszkę — per osoba" },
      { key: "eq_recznik", label: "Ręcznik — per osoba" },
      { key: "eq_zbiornik", label: "Plastikowy zbiornik" },
      { key: "eq_talerze_duze", label: "Talerze duże — per osoba" },
      { key: "eq_talerze_male", label: "Talerze małe — per osoba" },
      { key: "eq_lyzki", label: "Łyżki — per osoba" },
      { key: "eq_widelce", label: "Widelce — per osoba" },
      { key: "eq_garnuszki", label: "Garnuszki" },
      { key: "eq_patelnia", label: "Patelnia" },
      { key: "eq_kawiarka", label: "Kawiarka" },
      { key: "eq_kubeczki", label: "Kubeczki" },
      { key: "eq_nabor_kuchenka", label: "Nabój w kuchence (założony)" },
      { key: "eq_nabor_zapas", label: "Dodatkowy nabój (zapas)" },
      { key: "eq_lodowka", label: "Lodówka" },
      { key: "eq_stol", label: "Stół" },
      { key: "eq_krzeselka", label: "Krzesełka" },
    ],
  },
  // TODO (od Kamila): VW Caddy — { title: "Wyposażenie — VW Caddy", match: (n) => /caddy/i.test(n), items: [ … ] }
  // TODO inne auta wg ustaleń — każde z własnym match + items.
];

// Zestaw wyposażenia dla danego auta. Bez nazwy (szybka checklista poglądowa, bez
// wybranego klienta) → pokazujemy główny komplet (Master) jako referencję.
export function equipmentForVehicle(vehicleName?: string): EquipmentSet | null {
  if (!vehicleName) return EQUIPMENT_SETS[0] ?? null;
  return EQUIPMENT_SETS.find((s) => s.match(vehicleName)) ?? null;
}

// Wszystkie pozycje wyposażenia (do „Odznacz wszystko").
export const CAMPER_EQUIPMENT_ITEMS = EQUIPMENT_SETS.flatMap((s) => s.items);
