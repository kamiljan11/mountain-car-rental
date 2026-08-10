# RentHelp → aplikacja — rekoncyliacja danych (2026-07-04)

## Cel
Odpowiedzieć z pewnością na pytanie: **czy przy migracji z RentHelp pominięto jakikolwiek wynajem lub blokadę?**

## Metoda (deterministyczna, nie „na oko")
- **Źródło:** `renthelp_kalendarz.csv` — eksport kalendarza RentHelp (82 wiersze danych), ten sam plik, z którego budowano seed.
- **Cel:** żywa baza produkcyjna Supabase (`rental.bookings`), odpytana bezpośrednio przez PostgREST kluczem `service_role` — 52 wpisy. Stan pobrany 2026-07-04.
- **Klucz dopasowania:** `typ | data_start | data_koniec`, z uwzględnieniem krotności (multiset). Odporny na to, że flotę ręcznie rozdzielono (jeden „Mitsubishi Pajero" z CSV → dwa fizyczne auta w bazie) i na przywrócone polskie znaki w nazwiskach. Skrypt: `scratchpad/recon.cjs`.
- **Kontrola spójności:** 82 (źródło) = 50 dopasowanych + 32 brakujące; 52 (baza) = 50 dopasowanych + 2 nadmiarowe. Bilans się zgadza.

## Wynik zbiorczy
| | RentHelp CSV | Żywa baza |
|---|---|---|
| Rezerwacje | 55 | 34 |
| Blokady | 25 | 15 |
| Serwis | 2 | 3 |
| **Razem** | **82** | **52** |

- **32 wpisy RentHelp nie mają odpowiednika w bazie** (22 rezerwacje + 10 blokad).
- **2 wpisy w bazie nie mają odpowiednika w RentHelp** (1 duplikat serwisu z migracji, 1 wpis testowy).

---

## ⚠️ NAJWAŻNIEJSZE: 5 brakujących blokad, które są PRZYSZŁE/AKTYWNE (dziś 2026-07-04)
To realne ryzyko operacyjne — te auta w aplikacji wyglądają na WOLNE w terminach, w których w RentHelp są zablokowane. Grozi podwójną rezerwacją.

| Typ | Od | Do | Pojazd | Opis |
|---|---|---|---|---|
| blokada | 2026-07-16 | 2026-07-26 | Renault Master (UNZ27) | [klient 305] [klient 808] 28000 isk doba |
| blokada | 2026-08-16 | 2026-08-30 | Dacia Duster Namiot II (BPS82) | [klient 528] 12000 messenger |
| blokada | 2026-08-22 | 2026-08-30 | Renault Master (UNZ27) | 25000 [klient 908] messenger |
| blokada | 2026-09-18 | 2026-09-28 | VW Caddy California (PYL41) | [klient 771] [e-mail klienta usuniety] [tel. usuniety] |
| blokada | 2026-09-19 | 2026-09-27 | Renault Trafic (ROB64) | [klient 766] 20000 isk doba - Arek |

---

## 27 brakujących wpisów HISTORYCZNYCH (już zakończone przed 2026-07-04)
Niższy priorytet — zakończone. Ale jeśli aplikacja ma być pełnym archiwum, też ich brakuje.

### Rezerwacje (22)
| Od | Do | Pojazd | Klient |
|---|---|---|---|
| 2024-07-13 | 2024-07-27 | Mitsubishi Pajero | [klient 939] |
| 2024-07-24 | 2024-07-26 | Mitsubishi Pajero | [klient 284] [klient 379] |
| 2025-06-01 | 2025-06-07 | Volkswagen Caddy | [klient 754]-[klient 260] |
| 2025-06-11 | 2025-06-22 | Mitsubishi Pajero | [klient 202] |
| 2025-06-15 | 2025-06-24 | Mitsubishi Pajero | [klient 859] |
| 2025-06-26 | 2025-07-05 | Volkswagen Caddy | [klient 128] |
| 2025-06-29 | 2025-07-13 | Mitsubishi Pajero | [klient 967] |
| 2025-07-02 | 2025-07-09 | Volkswagen Caddy | [klient 046] |
| 2025-07-04 | 2025-07-12 | Mitsubishi Pajero | [klient 268] |
| 2025-07-22 | 2025-07-31 | Mitsubishi Pajero | [klient 631] / [klient 570] |
| 2025-08-15 | 2025-08-24 | Mitsubishi Pajero | [klient 063] |
| 2025-08-23 | 2025-08-31 | Mitsubishi Pajero | [klient 854] |
| 2025-12-04 | 2025-12-07 | Mitsubishi Pajero | [klient 197] |
| 2025-12-24 | 2025-12-28 | Mercedes-Benz Vito | [klient 441] |
| 2026-01-21 | 2026-01-27 | Volkswagen Caddy | [klient 978] |
| 2026-02-14 | 2026-02-17 | Volkswagen Caddy | [klient 506] |
| 2026-03-05 | 2026-03-08 | Volkswagen Caddy | [klient 581] |
| 2026-03-05 | 2026-03-08 | Volkswagen Caddy | [klient 828] |
| 2026-03-14 | 2026-03-21 | Volkswagen Caddy | [klient 584] |
| 2026-03-15 | 2026-03-22 | Volkswagen Caddy | Rebel Travel |
| 2026-03-15 | 2026-03-22 | Volkswagen Caddy | Rebel Travel (duplikat w samym CSV) |
| 2026-06-18 | 2026-06-30 | Mitsubishi Pajero | [klient 430] |

> Uwaga: rezerwacja [klient 018] [klient 660] (2026-06-18) wypada w okresie, z którego inne wpisy przeszły — to nie jest czysty „odcięcie po dacie", tylko realnie zgubiony wpis (zakończył się tuż przed dziś).

### Blokady historyczne (5)
| Od | Do | Pojazd | Opis |
|---|---|---|---|
| 2026-03-31 | 2026-04-07 | Renault Master (UNZ27) | [klient 157] 20000 isk doba |
| 2026-04-23 | 2026-04-27 | VW Caddy Beach Biały (ZLH03) | Fotelik, [klient 401] messenger rental 14000 |
| 2026-04-30 | 2026-05-04 | VW Caddy Beach (JKF73) | (bez opisu) |
| 2026-05-25 | 2026-05-28 | VW Caddy Beach Biały (ZLH03) | (bez opisu) |
| 2026-05-25 | 2026-05-30 | Vito (PKP90) | [klient 691] biuro podrozy 35000 doba [tel. usuniety] |

---

## 2 wpisy w bazie, których NIE ma w CSV RentHelp
1. **Serwis 2026-04-28 → 2026-06-01 na Pajero Silver (SV183)** — migracja rozbiła jeden wiersz „Serwis Pajero" z CSV na oba fizyczne Pajero (Blue + Silver). To celowe zdublowanie, nie błąd.
2. **Rezerwacja 2026-10-12 → 2026-10-18, Vito, klient „Random", `source=Panel`, utworzona 2026-07-02** — wpis testowy dodany przez aplikację, nie z RentHelp. **Do usunięcia przed oddaniem klientowi.**

---

## Granica pewności (uczciwie)
- Krok **CSV → aplikacja jest zweryfikowany w 100%**: dokładnie te 32 wpisy nie zostały przeniesione.
- Czego ten audyt **nie** gwarantuje: że sam `renthelp_kalendarz.csv` złapał 100% RentHelp. CSV powstał w sesji Cowork (task „2 przebiegi"). Żeby domknąć ostatni procent, trzeba porównać liczbę wpisów w samym RentHelp z 82 z CSV — do tego potrzebny dostęp do RentHelp albo jego natywny eksport.

## Dodatkowa uwaga jakościowa
Blokada [klient 361] [klient 243], która JEST w bazie (2026-08-16→08-25), siedzi prawdopodobnie na złym fizycznym Dusterze względem dat CSV (dopasowana do „gorki", zapisana na „Namiot II"). Do sprawdzenia przy imporcie brakujących.
