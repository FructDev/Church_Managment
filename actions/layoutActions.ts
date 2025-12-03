"use server";

import { createClient } from "@/lib/supabase/server";

export async function getChurchConfig() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracion")
    .select("nombre_iglesia, logo_url")
    .single();

  return data || { nombre_iglesia: "Gestión Iglesia", logo_url: null };
}
