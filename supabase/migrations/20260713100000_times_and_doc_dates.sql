-- Godzina wydania/odbioru na rezerwacji (tekst "HH:MM" — osobno od dat, żeby nie
-- ruszać logiki kolizji i kalendarza opartej na datach) + daty wydania/ważności
-- dokumentów klienta w publicznym self-service (dowód i prawo jazdy).
alter table rental.bookings
  add column if not exists pickup_time text,
  add column if not exists return_time text;

alter table rental.booking_links
  add column if not exists client_id_issued date,
  add column if not exists client_id_expires date,
  add column if not exists client_license_issued date,
  add column if not exists client_license_expires date;
