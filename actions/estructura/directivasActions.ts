// actions/estructura/directivasActions.ts
"use server";

import { checkSociedadPermission } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  directivaSchema,
  type DirectivaFormValues,
} from "@/lib/validations/estructura.schema";
import { revalidatePath } from "next/cache";

// Tipo para la lista de la directiva
export type DirectivaConMiembro = {
  id: string;
  cargo: string;
  fecha_inicio: string;
  activo: boolean;
  miembro: {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
    telefono: string | null;
  } | null;
};

/**
 * Obtiene los detalles de una sociedad específica.
 */
export async function getSociedadDetalle(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sociedades")
    .select("id, nombre, descripcion")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener detalle de sociedad:", error.message);
    return null;
  }
  return data;
}

/**
 * Obtiene la lista de la directiva para una sociedad.
 */
export async function getDirectiva(
  sociedadId: string
): Promise<DirectivaConMiembro[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("directivas_sociedades")
    .select(
      `
      id,
      cargo,
      fecha_inicio,
      activo,
      miembro: miembros (
        id,
        nombre_completo,
        foto_url,
        telefono
      )
    `
    )
    .eq("sociedad_id", sociedadId)
    .order("activo", { ascending: false })
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error al obtener directiva:", error.message);
    return [];
  }
  return data as DirectivaConMiembro[];
}

/**
 * Acción para crear o actualizar un miembro de la directiva.
 */
export async function upsertDirectiva(data: DirectivaFormValues) {
  // 1. Validar permisos
  await checkSociedadPermission(data.sociedad_id);

  // 2. Validar datos
  const validatedFields = directivaSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  const { id, sociedad_id, miembro_id, cargo, fecha_inicio, activo } =
    validatedFields.data;
  const supabase = await createClient();

  const directivaData = {
    sociedad_id,
    miembro_id,
    cargo,
    fecha_inicio,
    activo,
  };

  let error;
  if (id) {
    // Actualizar
    ({ error } = await supabase
      .from("directivas_sociedades")
      .update(directivaData)
      .eq("id", id));
  } else {
    // Crear
    ({ error } = await supabase
      .from("directivas_sociedades")
      .insert(directivaData));
  }

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath(`/estructura/sociedades/${sociedad_id}`);
  return { success: true, message: `Directiva actualizada.` };
}

/**
 * Elimina un miembro de la directiva.
 */
export async function deleteDirectiva(id: string, sociedadId: string) {
  // 1. Validar permisos
  await checkSociedadPermission(sociedadId);

  // 2. Eliminar
  const supabase = await createClient();
  const { error } = await supabase
    .from("directivas_sociedades")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath(`/estructura/sociedades/${sociedadId}`);
  return { success: true, message: "Miembro de directiva eliminado." };
}
