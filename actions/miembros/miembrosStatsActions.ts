"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_CONSULTA } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function getMiembrosStats() {
  await checkPermission(ROLES_CONSULTA);
  const supabase = await createClient();
  const now = new Date();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  // 1. Consultas en paralelo para eficiencia
  const [totalResult, activosResult, nuevosResult, visitantesResult] =
    await Promise.all([
      // Total General
      supabase.from("miembros").select("*", { count: "exact", head: true }),

      // Activos
      supabase
        .from("miembros")
        .select("*", { count: "exact", head: true })
        .eq("estado_membresia", "activo"),

      // Nuevos este mes (Asumiendo que fecha_registro es created_at o fecha_ingreso_congregacion)
      supabase
        .from("miembros")
        .select("*", { count: "exact", head: true })
        .gte("fecha_ingreso_congregacion", firstDayOfMonth),

      // Visitantes
      supabase
        .from("miembros")
        .select("*", { count: "exact", head: true })
        .eq("estado_membresia", "visitante"),
    ]);

  return {
    total: totalResult.count || 0,
    activos: activosResult.count || 0,
    nuevos: nuevosResult.count || 0,
    visitantes: visitantesResult.count || 0,
  };
}
