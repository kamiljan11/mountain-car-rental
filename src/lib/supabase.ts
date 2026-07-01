import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);

// Klient działa na schemacie `rental` (obok garage w `public`).
// Gdy brak env (np. lokalnie) → null, apka używa danych seed z data.ts.
export const supabase = supabaseEnabled
  ? createClient(url as string, key as string, { db: { schema: "rental" } })
  : null;
