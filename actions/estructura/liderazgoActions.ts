/* eslint-disable @typescript-eslint/no-unused-vars */
// actions/estructura/liderazgoActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles";

// Tipo para los datos que leeremos
export type LiderazgoConMiembro = {
  id: string;
  cargo: string;
  miembro_id: string | null;
  fecha_inicio: string;
  activo: boolean;
  miembro: {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
  } | null;
};

/**
 * Obtiene la lista completa del liderazgo con la info del miembro.
 */
export async function getLiderazgo(): Promise<LiderazgoConMiembro[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("liderazgo")
    .select(
      `
      id,
      cargo,
      miembro_id,
      fecha_inicio,
      activo,
      miembro: miembros (
        id,
        nombre_completo,
        foto_url
      )
    `
    )
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error al obtener liderazgo:", error.message);
    return [];
  }

  return data as LiderazgoConMiembro[];
}

/**
 * Obtiene una lista simple de todos los miembros activos
 * para usarla en el <select> del formulario.
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

/**
 * Actualiza la asignación de un cargo de liderazgo.
 * ¡VERSIÓN ACTUALIZADA con validación de rol único!
 */
export async function updateLiderazgo(formData: FormData) {
  // 1. Proteger la acción
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  // 2. Extraer datos
  const cargoId = formData.get("id") as string;
  const miembroId = formData.get("miembro_id") as string | null;
  const fechaInicio = formData.get("fecha_inicio") as string;

  // 3. Validar datos
  if (!cargoId || !fechaInicio) {
    return { success: false, message: "Faltan datos requeridos." };
  }

  const supabase = await createClient();

  // --- ¡INICIO DE VALIDACIÓN! ---
  // Si estamos intentando asignar un miembro (no des-asignar)
  if (miembroId && miembroId !== "null") {
    // 4. Obtener el 'cargo' (ej. 'pastor') de la fila que estamos editando
    const { data: cargoData } = await supabase
      .from("liderazgo")
      .select("cargo")
      .eq("id", cargoId)
      .single();

    if (!cargoData) {
      return {
        success: false,
        message: "El cargo que intenta editar no existe.",
      };
    }

    // 5. Buscar si ESE cargo ya está activo y asignado a OTRA persona
    const { data: existing, error: existingError } = await supabase
      .from("liderazgo")
      .select("id, miembro:miembros(nombre_completo)")
      .eq("cargo", cargoData.cargo) // Mismo cargo (ej. 'pastor')
      .eq("activo", true) // Que esté activo
      .neq("id", cargoId) // Y que NO sea la fila que estamos editando
      .single(); // Buscamos solo uno

    if (existing) {
      // ¡Conflicto!
      return {
        success: false,
        message: `Error: El cargo de ${cargoData.cargo} ya está ocupado activamente por ${existing.miembro?.nombre_completo}.`,
      };
    }
  }

  // 6. Actualizar en Supabase
  const { error } = await supabase
    .from("liderazgo")
    .update({
      miembro_id: miembroId === "null" ? null : miembroId,
      fecha_inicio: fechaInicio,
      activo: miembroId !== "null",
    })
    .eq("id", cargoId);

  if (error) {
    return { success: false, message: `Error al actualizar: ${error.message}` };
  }

  // 7. Revalidar
  revalidatePath("/estructura/liderazgo");
  revalidatePath("/miembros"); // Revalidamos miembros por si el perfil cambió
  return { success: true, message: "Liderazgo actualizado con éxito." };
}
