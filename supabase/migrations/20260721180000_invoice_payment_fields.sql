-- Faktura: metoda i termin płatności + informacyjny przelicznik waluty (kurs z dnia).
-- Faktura pozostaje w ISK; display_currency/fx_rate to tylko równowartość na dokumencie.
alter table rental.invoices
  add column if not exists payment_method   text,   -- revolut | bank_isk | bank_pl | cash
  add column if not exists payment_term     text,   -- pickup | return
  add column if not exists display_currency text,   -- EUR | PLN | USD | GBP | null
  add column if not exists fx_rate          numeric(18,8);
