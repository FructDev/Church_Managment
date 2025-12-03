
// actions/finanzas/lineasPresupuestoActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS, ROLES_ACCESO_TOTAL } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  lineaPresupuestoSchema,
  type LineaPresupuestoFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";

// Tipo para la tabla de líneas
export type LineaPresupuestoConCategoria = {
  id: string;
  monto_presupuestado: number;
  monto_ejecutado: number;
  categoria_egreso: {
    id: string;
    nombre: string;
  } | null;
};

/**
 * Obtiene los detalles de un presupuesto específico (el 'contenedor').
 */
export async function getPresupuestoDetalle(id: string) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("presupuestos")
    .select("id, nombre, anio, estado")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener detalle de presupuesto:", error.message);
    return null;
  }
  return data;
}

/**
 * Obtiene todas las líneas de un presupuesto.
 */
export async function getLineasPresupuesto(
  presupuestoId: string
): Promise<LineaPresupuestoConCategoria[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lineas_presupuesto")
    .select(
      `
        id,
        monto_presupuestado,
        monto_ejecutado,
        categoria_egreso: categorias_egresos(id, nombre)
      `
    )
    .eq("presupuesto_id", presupuestoId)
    .order("monto_presupuestado", { ascending: false });

  if (error) {
    console.error("Error al obtener líneas de presupuesto:", error.message);
    return [];
  }
  return data as unknown as LineaPresupuestoConCategoria[];
}

/**
 * Obtiene las categorías de egreso que AÚN NO están
 * añadidas a este presupuesto (para el <select>).
 */
export async function getCategoriasDisponibles(presupuestoId: string) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  // 1. Obtener IDs de categorías ya usadas en este presupuesto
  const { data: lineas, error: lineasError } = await supabase
    .from("lineas_presupuesto")
    .select("categoria_egreso_id")
    .eq("presupuesto_id", presupuestoId);

  if (lineasError) return [];
  const idsUsados = lineas.map((l) => l.categoria_egreso_id);

  // 2. Obtener todas las categorías activas
  const { data: categorias, error: catError } = await supabase
    .from("categorias_egresos")
    .select("id, nombre")
    .eq("activo", true);

  if (catError) return [];

  // 3. Devolver solo las que no están en la lista de 'idsUsados'
  return categorias.filter((c) => !idsUsados.includes(c.id));
}

/**
 * Añade una nueva línea a un presupuesto.
 */
export async function createLineaPresupuesto(data: LineaPresupuestoFormValues) {
  await checkPermission(ROLES_FINANCIEROS);

  const validatedFields = lineaPresupuestoSchema.safeParse(data);
  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0].message;
    return { success: false, message: firstError };
  }

  const { id, ...lineaData } = validatedFields.data;
  const supabase = await createClient();

  // Verificación extra de duplicados
  const { data: existing } = await supabase
    .from("lineas_presupuesto")
    .select("id")
    .eq("presupuesto_id", lineaData.presupuesto_id)
    .eq("categoria_egreso_id", lineaData.categoria_egreso_id)
    .limit(1)
    .single();

  if (existing) {
    return {
      success: false,
      message: "Esta categoría ya existe en el presupuesto.",
    };
  }

  // Insertar la nueva línea
  const { error } = await supabase.from("lineas_presupuesto").insert(lineaData);

  if (error) {
    return {
      success: false,
      message: `Error al añadir línea: ${error.message} `,
    };
  }

  revalidatePath(`/finanzas/presupuestos/${lineaData.presupuesto_id}`);
  return { success: true, message: "Línea añadida con éxito." };
}

/**
 * Elimina una línea de un presupuesto.
 */
export async function deleteLineaPresupuesto(
  id: string,
  presupuestoId: string
) {
  await checkPermission(ROLES_ACCESO_TOTAL);

  const supabase = await createClient();
  const { error } = await supabase
    .from("lineas_presupuesto")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: `Error al eliminar línea: ${error.message} `,
    };
  }

  revalidatePath(`/finanzas/presupuestos/${presupuestoId}`);
  return { success: true, message: "Línea eliminada." };
}
