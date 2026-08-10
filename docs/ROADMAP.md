# Roadmapa ulepszeń — Mountain Car Rental (stan: 2026-07-14)

> **UPDATE 2026-07-14 — co się zamknęło od 2026-07-12** (szczegóły per zmiana: CHANGELOG wpisy 8–18):
> - ✅ **A1 Resend** — klucz w Vercelu, domena mountaincar.is zweryfikowana, maile realnie wychodzą (potwierdzenia z okienkiem-walidatorem przed wysyłką).
> - ✅ **A2 Dane Rebel Travel** — kennitala 600723-0140, VSK 149557 w umowach.
> - ✅ **A3 Domena** — panel działa na `app.rental.mountaincar.is` (+ Google login origins).
> - ✅ **A4 Duplikaty klientów** — scalone/wyczyszczone; baza zweryfikowana 1:1 z RentHelp.
> - ✅ **B1 Godziny wydania/odbioru**, ✅ **B2 twarda blokada kolizji** (kreator + serwerowy re-check + **constraint w bazie** `bookings_no_overlap`, half-open — zmiana auta tego samego dnia OK), ✅ **B3 wyszukiwarka w Rezerwacjach**, ✅ **B6 kafel wygasających OC/AC/przeglądów**.
> - ✅ **Ceny zsynchronizowane z RentHelp** (30 rezerwacji + 14 blokad; „PLN"=ISK) — przychód na dashboardzie realny (37/59 wycenione; 5 wpisanych jako 0 do poprawki).
> - ✅ **Flow statusów domknięty**: kreator z dropdownem Potwierdzona/Wstępna, przycisk „Potwierdź" na dashboardzie, wysłanie potwierdzenia auto-odznacza wstępną; sekcja „Zaległe zwroty" z „Oznacz jako zwrócone".
> - ✅ Dashboard: Dziś+Jutro, klikalne wpisy, ukryte Pajero/Vito; fix „flasha" starych danych (seed poza bundlem = też punkt prywatności).
> - ✅ Security: headers (HSTS/CSP/X-Frame-Options), fail-closed read-path, unikalne numery umów (UNIQUE + serwerowa numeracja), miejsce wydania/odbioru zapisywane do bazy i umowy.
> - **Nadal otwarte z tej listy:** B4/B5 (stawka km + raport dla urzędu), B7 (umowa realnie mailem — dziś „Wyślij" tylko zapisuje), cały moduł **C (płatności 30/70/kaucja)**, sekcja **D** i higiena techniczna poniżej.

Przegląd braków zrobiony z perspektywy codziennej pracy ekipy w szczycie sezonu.
Każdy punkt: co, po co, rozmiar (S = ~1-2h, M = ~pół dnia, L = duży moduł),
i czy coś jest potrzebne od Kamila.

## Stan obecny (co już działa)

Kalendarz z nieskończonym pasem czasu i szeroką wyszukiwarką · rezerwacje z licznikiem
i czasem islandzkim · klienci z profilami/dokumentami/wyszukiwarką · umowy z
auto-numeracją i wyborem firmy (Mountain Car / Rebel Travel) · protokoły z przebiegiem ·
self-service linki z kolejką Wniosków · checklista wydania per klient + poglądowa ·
płatność Revolut (QR + WhatsApp) · PWA na telefon · Google login · dashboard dnia.

---

## A. Domknięcia — odblokowują to, co już jest zbudowane

| # | Co | Po co | Rozmiar | Od Kamila |
|---|----|-------|---------|-----------|
| A1 | **Klucz Resend** (konto + weryfikacja domeny) | Wnioski dziś NIE wysyłają maili do klientów (potwierdzenie/odrzucenie/prośba o zmianę są pomijane po cichu) | S (po stronie kodu zero — tylko env) | ✅ konto Resend + klucz |
| A2 | **Kennitala + VSK-nr Rebel Travel** | Umowa jako Rebel Travel ma dziś puste linie zamiast numerów | S (1 linia) | ✅ dwa numery |
| A3 | **Domena app.mountaincar.is → Vercel** | Panel jest dziś dostępny tylko przez brzydki per-deploy URL Vercela; domena pokazuje błąd. Ekipa potrzebuje stałego adresu (i PWA na telefonie się do niego przypina) | S-M | ✅ dostęp do DNS mountaincar.is |
| A4 | **Duplikaty klientów** ([klient 380] ×2, [klient 221] ×2 — z importu RentHelp) | Rezerwacje/umowy rozjeżdżają się między dwoma profilami tej samej osoby | S (scalenie w bazie) | decyzja „scalaj" |

## B. Szybkie wygrane w sezonie (S każda)

| # | Co | Po co |
|---|----|-------|
| B1 | **Godzina wydania/odbioru na rezerwacji** | Realna potrzeba (np. [klient 292]: wydanie 01:00, zwrot do 18:00 — dziś siedzi w notatce). Pokazać na dashboardzie „Dziś" i w umowie. RentHelp to ma. |
| B2 | **Twarda blokada kolizji w kreatorze admina** | Dziś tylko dyskretne ostrzeżenie — da się przypadkiem zapisać dubel terminu. Zamiast tego: blokada + świadome „zapisz mimo to" (na serwisy/nadpisania). RentHelp twardo blokuje. |
| B3 | **Wyszukiwarka w Rezerwacjach** | Kalendarz i Klienci już ją mają; Rezerwacje nie — niespójność. Ten sam wspólny mechanizm (PL-fold). |
| B4 | **Rozliczenie kilometrów: stawka kr/km na rezerwacji** | Bierzecie np. 7 kr/km na koniec — dziś to tylko notatka. Pole stawki + auto-wyliczenie (licznik PO − PRZED) × stawka w protokole zwrotu. |
| B5 | **Raport km dla urzędu** | Skoro liczniki są w bazie: prosty widok/eksport per pojazd/okres (start, koniec, suma km) — do rozliczenia kilometrówki. |
| B6 | **Kafel „Kończą się OC/przeglądy" na dashboardzie** | Dane już są we Flocie, ale nikt tam codziennie nie zagląda. |
| B7 | **Umowa naprawdę wysyłana mailem** | Przycisk „Wyślij do klienta" dziś tylko zapisuje do bazy — po A1 (Resend) podpiąć realny mail z umową. Do tego czasu zmienić etykietę na „Zapisz umowę". |

## C. Moduł pieniędzy (L — największa luka operacyjna)

OWU definiuje harmonogram: **30% zaliczki przy rezerwacji → 70% na 7 dni przed →
kaucja zwracana 7 dni po zwrocie**. Apka tego w ogóle nie śledzi — nie widać, kto
nie zapłacił i komu oddać kaucję.

- C1. Płatności na rezerwacji: pozycje (zaliczka / dopłata / kaucja / km / inne),
  status wpłacona/oczekuje, termin wg OWU liczony automatycznie.
- C2. Dashboard: „Do zapłaty / zaległe" + „Kaucje do zwrotu w tym tygodniu".
- C3. Kaucja: status zwrócona / potrącona (+ ile) — spięte z protokołem zwrotu
  i checklistą „Po zwrocie".
- C4. Przy potwierdzaniu Wniosku auto-tworzenie planu płatności.

## D. Po sezonie / rozwój

- D1. **Umowa po angielsku** — w bazie są klienci zagraniczni ([klient 677] Ho, Kara
  [klient 978], [klient 994] [klient 536]…); OWU już jest dwujęzyczne, sama umowa nie.
- D2. **Statystyki** (przychód/mc, obłożenie per auto, źródła klientów) — parytet
  z RentHelp „Statystyki".
- D3. **Auto-dane pojazdu z islandzkiego rejestru** (Samgöngustofa; dostęp już
  opłacony, creds w vaulcie, 34 kr/lookup) — po rejestracji zaciągać VIN, daty
  przeglądów; koniec ręcznego pilnowania dat we Flocie.
- D4. **Powiadomienie o nowym Wniosku** (mail do ekipy przez Resend albo web push
  w PWA) — dziś trzeba samemu zaglądać w zakładkę.
- D5. **Ustawienia edytowalne z bazy** (tabela `rental.settings` już istnieje,
  strona jest statyczna): dane obu firm, handle Revolut, lista pracowników
  (podpowiadałaby się w „Pracownik wydający" i w checkliście).
- D6. **Historia zmian** (kto/co/kiedy zmienił) — jak w RentHelp; ważne, gdy
  panel obsługuje kilka osób.
- D7. **Multi-user** — dziś jedno wspólne hasło + jedno konto Google; docelowo
  konta per osoba (Gosia, Arek…), żeby „Pracownik wydający" wpisywał się sam.
- D8. **Drag&drop na kalendarzu** (przeciąganie/rozciąganie rezerwacji).
- D9. **Kopie zapasowe** — zweryfikować/włączyć PITR w Supabase (dziś polegamy
  na domyślnych backupach).

## Higiena techniczna

- ✅ 2026-07-12: ubity zapomniany serwer testowy (port 3021), usunięty token
  testowy `e2e-ui` z prod (tabela linków czysta).
- [ ] Wyczyścić wygasły PAT GitHub wbity w URL remote'a (`git remote set-url` na
  czysty https; push i tak idzie mostem Infisical).
- [ ] Usunąć martwy kod localStorage w `contract.ts` (getContracts/saveContract/
  contractsForCustomer — nieużywane od migracji umów do bazy).
- [ ] `public/revolut-qr.png` odchudzić z ~197 KB do ~30 KB.

## Rekomendowana kolejność

1. **A1-A4** (domknięcia — najwięcej wartości za najmniej pracy, ale A1-A3 czekają
   na wsad od Kamila).
2. **B1-B7** (da się zrobić od ręki, bez niczego od Kamila poza decyzjami).
3. **C** (moduł pieniędzy — jeden większy blok, planowo po szybkich wygranych).
4. **D** wg potrzeb po sezonie.
