import "server-only";
import { createClient } from "@supabase/supabase-js";

// Klient service_role — omija RLS, więc wolno go używać WYŁĄCZNIE tutaj (server-only)
// i tylko za bramką sesji (patrz db.ts: requireSession() na starcie każdej funkcji).
// Nigdy nie eksponuj SUPABASE_SERVICE_ROLE_KEY jako NEXT_PUBLIC_*.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdminEnabled = Boolean(url && key);

export const supabaseAdmin = supabaseAdminEnabled
  ? createClient(url as string, key as string, {
      db: { schema: "rental" },
      auth: { persistSession: false },
    })
  : null;
