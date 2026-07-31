-- Miejsce wydania/odbioru auta (biuro Njarðvík vs lotnisko Keflavik) na rezerwacji.
-- Wybierane w kreatorze i pokazywane w podsumowaniu — dotąd było gubione przy zapisie.
-- Nullable (wsteczna zgodność: stare wpisy go nie mają).
alter table rental.bookings
  add column if not exists location text;
