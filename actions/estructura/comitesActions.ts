// actions/estructura/comitesActions.ts
"use server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  comiteSchema,
  type ComiteFormValues,
} from "@/lib/validations/estructura.schema";
import { revalidatePath } from "next/cache";

export type ComiteConteo = {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  // Usaremos un 'conteo' para saber cuántos miembros hay
  miembros_count: number;
};

/**
 * Obtiene todos los comités con un conteo de sus miembros.
 */
export async function getComites(): Promise<ComiteConteo[]> {
  // Solo los admins pueden ver esta sección (según el sidebar)
  // pero añadimos un guard por si acaso.
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comites")
    .select(
      `
      id,
      nombre,
      descripcion,
      tipo,
      miembros_comites(count)
    `
    )
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error("Error al obtener comités:", error.message);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    tipo: c.tipo,
    miembros_count:
      (c.miembros_comites as unknown as [{ count: number }])[0]?.count || 0,
  }));
}

/**
 * Acción para crear o actualizar un Comité.
 */
export async function upsertComite(data: ComiteFormValues) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const validatedFields = comiteSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  const { id, ...comiteData } = validatedFields.data;
  const supabase = await createClient();

  let error;
  if (id) {
    // Actualizar
    ({ error } = await supabase
      .from("comites")
      .update(comiteData)
      .eq("id", id));
  } else {
    // Crear
    ({ error } = await supabase.from("comites").insert(comiteData));
  }

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/estructura/comites");
  return { success: true, message: `Comité ${id ? "actualizado" : "creado"}.` };
}

/**
 * Elimina un comité.
 */
export async function deleteComite(id: string) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const supabase = await createClient();
  const { error } = await supabase.from("comites").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/estructura/comites");
  return { success: true, message: "Comité eliminado." };
}
