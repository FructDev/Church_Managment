/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/estructura/diaconosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  diaconoSchema,
  type DiaconoFormValues,
} from "@/lib/validations/estructura.schema";
import { revalidatePath } from "next/cache";

export type DiaconoConMiembro = {
  id: string;
  fecha_nombramiento: string;
  areas_servicio: any;
  activo: boolean;
  miembro: {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
    telefono: string | null;
  } | null;
};

/**
 * Obtiene la lista de todos los diáconos.
 */
export async function getDiaconos(): Promise<DiaconoConMiembro[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaconos")
    .select(
      `
      id,
      fecha_nombramiento,
      areas_servicio,
      activo,
      miembro: miembros (
        id,
        nombre_completo,
        foto_url,
        telefono
      )
    `
    )
    .order("activo", { ascending: false })
    .order("fecha_nombramiento", { ascending: false });

  if (error) {
    console.error("Error al obtener diáconos:", error.message);
    return [];
  }
  return data as DiaconoConMiembro[];
}

/**
 * Acción para crear o actualizar un diácono.
 */
export async function upsertDiacono(data: DiaconoFormValues) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const validatedFields = diaconoSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  const { id, miembro_id, fecha_nombramiento, areas_servicio, activo } =
    validatedFields.data;
  const supabase = await createClient();

  // Preparamos los datos
  const diaconoData = {
    miembro_id,
    fecha_nombramiento,
    activo,
    // Convertimos el string de áreas en un JSON (ej. ["Visitas", "Enseñanza"])
    areas_servicio: areas_servicio
      ? areas_servicio.split(",").map((s) => s.trim())
      : null,
  };

  let error;
  if (id) {
    // Actualizar
    ({ error } = await supabase
      .from("diaconos")
      .update(diaconoData)
      .eq("id", id));
  } else {
    // Crear
    ({ error } = await supabase.from("diaconos").insert(diaconoData));
  }

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/estructura/diaconos");
  return {
    success: true,
    message: `Diácono ${id ? "actualizado" : "creado"} con éxito.`,
  };
}

/**
 * Elimina un diácono.
 */
export async function deleteDiacono(id: string) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const supabase = await createClient();
  const { error } = await supabase.from("diaconos").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/estructura/diaconos");
  return { success: true, message: "Diácono eliminado con éxito." };
}

/**
 * Obtiene una lista simple de todos los miembros activos
 * para usarla en el <select> del formulario.
 * (Esta es la misma función que usamos en Liderazgo)
 */
export async function getMiembrosActivos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("miembros")
    .select("id, nombre_completo")
    .eq("estado_membresia", "activo")
    .order("nombre_completo");

  if (error) {
    console.error("Error al obtener miembros:", error.message);
    return [];
  }
  return data;
}
