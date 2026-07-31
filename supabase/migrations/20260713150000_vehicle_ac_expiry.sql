-- Ważność AC (kasko) na pojeździe. Formularz pojazdu miał już pole „Ważność AC",
-- ale kolumny brakowało w prod → data była cicho gubiona przy zapisie.
alter table rental.vehicles
  add column if not exists insurance_ac_expiry date;
