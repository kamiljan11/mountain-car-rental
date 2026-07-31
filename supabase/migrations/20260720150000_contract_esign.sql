-- E-podpis umowy (wzorzec ContractGate z Reykjawwwik/maskalkulator, doręczenie
-- tokenowym linkiem jak booking_links). Podpis wiąże się z KONKRETNYM rekordem
-- umowy, którego `content` jest niezmiennym snapshotem — "wersjonowanie" =
-- zmiana umowy wymaga nowego rekordu i nowego linku (aneks), stary podpis
-- zostaje w historii.
alter table rental.contracts
  add column if not exists sign_token      text,
  add column if not exists sign_expires_at timestamptz,
  add column if not exists signed_at       timestamptz,
  add column if not exists signer_name     text,
  add column if not exists signer_meta     text; -- IP + user-agent podpisującego (dowód)

create unique index if not exists contracts_sign_token_unique
  on rental.contracts (sign_token) where sign_token is not null;
