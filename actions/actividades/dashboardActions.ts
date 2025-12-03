"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_CONSULTA } from "@/lib/auth/roles";

export async function getActividadesDashboard() {
  await checkPermission(ROLES_CONSULTA);
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Próxima Actividad (CON PROGRAMA)
  const { data: proxima } = await supabase
    .from("actividades")
    .select(
      `
      id, titulo, fecha_inicio, ubicacion, estado,
      tipo:tipos_actividades(nombre, color),
      responsable:miembros(nombre_completo),
      programa:programa_culto(
        orden, titulo_parte, responsable_nom, notas, 
        responsable:miembros(nombre_completo)
      )
    `
    )
    .gte("fecha_inicio", now)
    .neq("estado", "cancelada")
    .order("fecha_inicio", { ascending: true })
    .limit(1)
    .single();

  // Ordenar el programa si existe
  if (proxima && proxima.programa) {
    proxima.programa.sort((a, b) => a.orden - b.orden);
  }

  // 2. Resumen de la Semana
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: semana } = await supabase
    .from("actividades")
    .select("id, titulo, fecha_inicio, tipo:tipos_actividades(color)")
    .gte("fecha_inicio", now)
    .lte("fecha_inicio", nextWeek.toISOString())
    .neq("estado", "cancelada")
    .order("fecha_inicio", { ascending: true })
    .limit(4); // Solo 4 para no saturar

  return {
    proxima,
    semana: semana || [],
  };
}
