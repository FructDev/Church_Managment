import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/database.types";

// Nota: Estas variables deben estar en tu .env.local
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY (¡Esta nunca debe exponerse al cliente!)

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
