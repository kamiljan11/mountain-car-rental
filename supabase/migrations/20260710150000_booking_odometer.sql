-- Stan licznika przy wydaniu i zwrocie (km) na rezerwacji — potrzebny do
-- rozliczenia kilometrów z urzędem w Islandii (kílómetragjald): przy wydaniu
-- auta wpisujemy stan początkowy, przy zwrocie końcowy.
alter table rental.bookings
  add column if not exists odometer_start integer,
  add column if not exists odometer_end integer;
