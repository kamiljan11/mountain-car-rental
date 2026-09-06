// Kto prowadzi tę wypożyczalnię — jedyne miejsce z tożsamością firmy.
//
// Czyta z tego pliku wszystko, co widzi klient: umowy, faktury, maile, publiczna
// strona rezerwacji, nagłówek panelu i manifest PWA. Jeśli stawiasz tę aplikację
// u siebie, podmieniasz dane PONIŻEJ i nie szukasz ich nigdzie indziej.
//
// Kennitala i VSK-nr trafiają na umowę najmu i fakturę, czyli na dokumenty o skutkach
// prawnych. Pustej wartości nie zgadujemy — na dokumencie zostaje wtedy puste pole
// do uzupełnienia ręcznie, i tak ma być.

export interface Company {
  /** Klucz w bazie i w URL-ach — nie zmieniaj po wystawieniu pierwszego dokumentu. */
  key: string;
  /** Krótka nazwa w przełączniku wynajmującego. */
  label: string;
  /** Nazwa formalna podmiotu, tak jak w rejestrze. */
  legalName: string;
  /** Marka pokazywana klientowi. */
  brand: string;
  kennitala: string;
  vat: string;
  /** Pełny adres z krajem — na dokumenty. */
  address: string;
  /** Adres bez kraju — do ciasnych miejsc w UI. */
  addressShort: string;
  /** Adres e-mail podmiotu, na dokumenty. */
  email: string;
  /** Adres, który podajemy klientowi do kontaktu. */
  contactEmail: string;
  phone: string;
  web: string;
}

export const COMPANIES: Company[] = [
  {
    key: "mountain",
    label: "Mountain Car",
    legalName: "Mountain All Service ehf.",
    brand: "Mountain Car Rental",
    kennitala: "6907250450",
    vat: "158052",
    address: "Njarðarbraut 6i, 260 Njarðvík, Islandia",
    addressShort: "Njarðarbraut 6i, 260 Njarðvík",
    email: "mountainallservice@gmail.com",
    contactEmail: "rental@mountaincar.is",
    phone: "+354 888 8005",
    web: "https://mountaincar.is",
  },
  {
    key: "rebel",
    label: "Rebel Travel",
    legalName: "Rebel Travel ehf.",
    brand: "Rebel Travel",
    // Źródła (2026-07-13): umowa RentHelp (blok Wynajmującego) + fyrirtækjaskrá
    // Skatturinn (aktywna, zarej. 17.07.2023, ISAT 77.11.0 wynajem aut).
    kennitala: "6007230140",
    vat: "149557",
    address: "Skógarhlíð 10, 105 Reykjavík, Islandia",
    addressShort: "Skógarhlíð 10, 105 Reykjavík",
    email: "info@rebeltravel.is",
    contactEmail: "info@rebeltravel.is",
    phone: "",
    web: "https://rebeltravel.is",
  },
];

/** Wynajmujący domyślny: pierwszy na liście. */
export const COMPANY = COMPANIES[0];

/** Nazwa, którą podpisujemy panel, maile i stronę publiczną. */
export const BRAND = COMPANY.brand;

/** Adres strony bez protokołu — do wyświetlenia, nie do linkowania. */
export function webLabel(company: Company): string {
  return company.web.replace(/^https?:\/\//, "");
}

/** Kennitala w islandzkim zapisie DDMMYY-NNNN. Nie-dziesięciocyfrową zwracamy bez zmian. */
export function kennitalaLabel(company: Company): string {
  return /^\d{10}$/.test(company.kennitala)
    ? `${company.kennitala.slice(0, 6)}-${company.kennitala.slice(6)}`
    : company.kennitala;
}

/**
 * Miejsca odbioru i zwrotu pojazdu, w kolejności pokazywanej w kreatorze rezerwacji.
 * Operacyjne, nie prawne — zmieniasz je razem z resztą danych firmy.
 */
export const PICKUP_LOCATIONS: string[] = [
  "Biuro — Njarðvík, Njarðarbraut 6i",
  "Lotnisko Keflavik — Keflavikurflugvollur",
];
