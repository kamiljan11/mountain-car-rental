-- Stawka VAT (VSK) na rezerwacji. Cena za dobę (daily_rate) = NETTO;
-- total_price = brutto (netto * dni + VAT). vat_rate: 24 (standard) albo 0 (zw./eksport).
-- NULL = wpisy sprzed pola (traktowane jak bez VAT: brutto = netto). Dodatek nienaruszający
-- istniejących danych — nie przelicza żadnej zapisanej kwoty.
alter table rental.bookings add column if not exists vat_rate integer;
comment on column rental.bookings.vat_rate is
  'Stawka VAT/VSK (%) rezerwacji: 24 lub 0. daily_rate=netto, total_price=brutto. NULL=wpisy sprzed pola.';
