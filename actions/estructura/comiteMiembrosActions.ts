// actions/estructura/comiteMiembrosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  comiteMiembroSchema,
  type ComiteMiembroFormValues,
} from "@/lib/validations/estructura.schema";
import { revalidatePath } from "next/cache";

// Tipo para la lista de miembros del comité
export type ComiteMiembroConDetalle = {
  id: string; // ID de la *relación* (miembros_comites)
  responsabilidad: string | null;
  fecha_ingreso: string;
  activo: boolean;
  miembro: {
    id: string; // ID del *miembro*
    nombre_completo: string;
    foto_url: string | null;
    telefono: string | null;
  } | null;
};

/**
 * Obtiene los detalles de un comité específico.
 */
export async function getComiteDetalle(id: string) {
  await checkPermission("admin");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comites")
    .select("id, nombre, descripcion")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener detalle de comité:", error.message);
    return null;
  }
  return data;
}

/**
 * Obtiene la lista de miembros de un comité.
 */
export async function getComiteMiembros(
  comiteId: string
): Promise<ComiteMiembroConDetalle[]> {
  await checkPermission("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("miembros_comites")
    .select(
      `
      id,
      responsabilidad,
      fecha_ingreso,
      activo,
      miembro: miembros (
        id,
        nombre_completo,
        foto_url,
        telefono
      )
    `
    )
    .eq("comite_id", comiteId)
    .order("activo", { ascending: false })
    .order("fecha_ingreso", { ascending: false });

  if (error) {
    console.error("Error al obtener miembros de comité:", error.message);
    return [];
  }
  return data as ComiteMiembroConDetalle[];
}

/**
 * Acción para añadir un miembro a un comité.
 */
export async function addComiteMiembro(data: ComiteMiembroFormValues) {
  await checkPermission("admin");

  const validatedFields = comiteMiembroSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  // Quitamos 'id' porque solo estamos creando
  const { id, ...comiteMiembroData } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("miembros_comites")
    .insert(comiteMiembroData);

  if (error) {
    if (error.code === "23505") {
      // Error de unique constraint
      return {
        success: false,
        message: "Este miembro ya pertenece a este comité.",
      };
    }
    return { success: false, message: `Error al añadir: ${error.message}` };
  }

  revalidatePath(`/estructura/comites/${comiteMiembroData.comite_id}`);
  return { success: true, message: "Miembro añadido con éxito." };
}

/**
 * Elimina un miembro de un comité.
 */
export async function removeComiteMiembro(id: string, comiteId: string) {
  await checkPermission("admin");

  const supabase = await createClient();
  const { error } = await supabase
    .from("miembros_comites")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath(`/estructura/comites/${comiteId}`);
  return { success: true, message: "Miembro eliminado del comité." };
}
