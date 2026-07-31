-- Poprawka adresu firmy: "Njarðarbraut 3i" było błędne, prawidłowy adres to
-- "Njarðarbraut 6i" (Mountain All Service ehf.). Aktualizuje wiersz i domyślną
-- wartość ustawioną w 0001_init.sql.

update rental.settings
  set address = 'Njarðarbraut 6i, 260 Njarðvík'
  where id = 1;

alter table rental.settings
  alter column address set default 'Njarðarbraut 6i, 260 Njarðvík';
