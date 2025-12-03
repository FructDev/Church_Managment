
// actions/finanzas/presupuestosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS, ROLES_ACCESO_TOTAL } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  presupuestoSchema,
  type PresupuestoFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import { getSessionInfo } from "@/lib/auth/utils";

type PresupuestoInsert = Database["public"]["Tables"]["presupuestos"]["Insert"];

// Tipo para la lista de presupuestos
export type PresupuestoParaTabla = {
  id: string;
  nombre: string;
  anio: number;
  tipo: string;
  estado: string;
  monto_presupuestado_total: number;
  monto_ejecutado_total: number;
};

/**
 * Obtiene la lista de todos los presupuestos.
 */
export async function getPresupuestos(): Promise<PresupuestoParaTabla[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("presupuestos")
    .select(
      `
        id,
        nombre,
        anio,
        tipo,
        estado,
        lineas_presupuesto(
          monto_presupuestado,
          monto_ejecutado
        )
      `
    )
    .order("anio", { ascending: false });

  if (error) {
    console.error("Error al obtener presupuestos:", error.message);
    return [];
  }

  return data.map((p) => {
    const lineas = p.lineas_presupuesto as {
      monto_presupuestado: number;
      monto_ejecutado: number;
    }[];
    const monto_presupuestado_total = lineas.reduce(
      (acc, l) => acc + l.monto_presupuestado,
      0
    );
    const monto_ejecutado_total = lineas.reduce(
      (acc, l) => acc + l.monto_ejecutado,
      0
    );

    return {
      id: p.id,
      nombre: p.nombre,
      anio: p.anio,
      tipo: p.tipo,
      estado: p.estado,
      monto_presupuestado_total,
      monto_ejecutado_total,
    };
  });
}

/**
 * Acción para crear o actualizar un Presupuesto (el contenedor).
 */
export async function upsertPresupuesto(data: PresupuestoFormValues) {
  await checkPermission(ROLES_FINANCIEROS);

  const validatedFields = presupuestoSchema.safeParse(data);
  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0].message;
    return { success: false, message: firstError };
  }

  const { id, ...presupuestoData } = validatedFields.data;
  const supabase = await createClient();

  const dataToUpsert: Omit<PresupuestoInsert, "id"> = {
    ...presupuestoData,
    descripcion: presupuestoData.descripcion || null,
    estado: "borrador",
    tipo: "anual",
  };

  let error;

  if (id) {
    // Excluir campos que NO deben actualizarse
    const { anio, tipo, ...updateData } = dataToUpsert;

    ({ error } = await supabase
      .from("presupuestos")
      .update(updateData)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("presupuestos").insert(dataToUpsert));
  }

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message} ` };
  }

  revalidatePath("/finanzas/presupuestos");
  return {
    success: true,
    message: `Presupuesto ${id ? "actualizado" : "creado"}.`,
  };
}

/**
 * Elimina un presupuesto y todas sus líneas (por el CASCADE de la BD).
 */
export async function deletePresupuesto(id: string) {
  await checkPermission(ROLES_ACCESO_TOTAL);

  const supabase = await createClient();
  const { error } = await supabase.from("presupuestos").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message} ` };
  }

  revalidatePath("/finanzas/presupuestos");
  return { success: true, message: "Presupuesto eliminado." };
}

/**
 * Actualiza el estado de un presupuesto
 * (Borrador -> Activo -> Cerrado)
 */
export async function updatePresupuestoEstado(
  id: string,
  newState: "activo" | "cerrado" | "borrador"
) {
  await checkPermission(ROLES_FINANCIEROS);

  const supabase = await createClient();

  // Opcional: Lógica de negocio avanzada
  // Si activamos un presupuesto, podríamos desactivar otros del mismo año.
  // Por ahora, lo mantenemos simple.

  const { error } = await supabase
    .from("presupuestos")
    .update({
      estado: newState,
      // Si se aprueba, guardamos quién y cuándo
      aprobado_por:
        newState === "activo" ? (await getSessionInfo()).user?.id : null,
      fecha_aprobacion: newState === "activo" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: `Error al actualizar estado: ${error.message} `,
    };
  }

  revalidatePath("/finanzas/presupuestos");
  revalidatePath(`/finanzas/presupuestos/${id}`);
  return { success: true, message: "Estado del presupuesto actualizado." };
}
