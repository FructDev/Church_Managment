/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/actividades/programaActions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

export type PartePrograma = {
  id: string;
  orden: number;
  titulo_parte: string;
  responsable_nom: string | null;
  notas: string | null;
  responsable: {
    id: string;
    nombre_completo: string;
  } | null;
};

export async function getProgramaCulto(
  actividadId: string
): Promise<PartePrograma[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programa_culto")
    .select(
      `
      id, orden, titulo_parte, responsable_nom, notas,
      responsable: miembros ( id, nombre_completo )
    `
    )
    .eq("actividad_id", actividadId)
    .order("orden", { ascending: true });

  if (error) return [];
  return data as unknown as PartePrograma[];
}

export async function upsertPartePrograma(data: any, actividadId: string) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { id, ...parteData } = data;

  let error;
  if (id) {
    ({ error } = await supabase
      .from("programa_culto")
      .update(parteData)
      .eq("id", id));
  } else {
    // Calcular orden automático si es nuevo
    if (!parteData.orden) {
      const { count } = await supabase
        .from("programa_culto")
        .select("*", { count: "exact", head: true })
        .eq("actividad_id", actividadId);
      parteData.orden = (count || 0) + 1;
    }
    ({ error } = await supabase
      .from("programa_culto")
      .insert({ ...parteData, actividad_id: actividadId }));
  }

  if (error) return { success: false, message: error.message };

  revalidatePath(`/actividades/${actividadId}/gestion`);
  return { success: true, message: "Parte del programa guardada." };
}

export async function deletePartePrograma(id: string, actividadId: string) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();
  await supabase.from("programa_culto").delete().eq("id", id);
  revalidatePath(`/actividades/${actividadId}/gestion`);
  return { success: true, message: "Eliminado." };
}
