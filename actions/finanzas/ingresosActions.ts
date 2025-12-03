
// actions/finanzas/ingresosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { ingresoSchema } from "@/lib/validations/finanzas.schema"; // No importamos el 'type'
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import { getSessionInfo } from "@/lib/auth/utils"; // <-- 1. IMPORTAR HELPER

type IngresoData = Database["public"]["Tables"]["transacciones"]["Insert"];

// Este es el tipo que usará nuestra tabla
export type IngresoParaTabla = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string | null;
  metodo_pago: string;
  comprobante_url: string | null;
  categoria_ingreso: {
    nombre: string;
  } | null;
  registrado_por: {
    nombre_completo: string;
  } | null;
};

/**
 * Obtiene la lista paginada de Ingresos.
 */
export async function getIngresos(): Promise<IngresoParaTabla[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transacciones")
    .select(
      `
        id,
        fecha,
        monto,
        descripcion,
        metodo_pago,
        comprobante_url,
        categoria_ingreso: categorias_ingresos(nombre),
        registrado_por: profiles!registrado_por(nombre_completo)
      `
    )
    .eq("tipo", "ingreso")
    .order("fecha", { ascending: false })
    .limit(20); // (Añadiremos paginación completa después)

  if (error) {
    console.error("Error al obtener ingresos:", error.message);
    return [];
  }

  return data as unknown as IngresoParaTabla[];
}

/**
 * Obtiene la lista de categorías de ingresos activas.
 */
export async function getCategoriasIngreso() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_ingresos")
    .select("id, nombre, tipo")
    .eq("activo", true)
    .order("orden");

  if (error) {
    console.error("Error al obtener categorías de ingreso:", error.message);
    return [];
  }
  return data;
}

/**
 * Acción para crear o actualizar un Ingreso.
 */
export async function upsertIngreso(formData: FormData) {
  const { user } = await getSessionInfo();
  if (!user) return { success: false, message: "No autorizado." };

  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const comprobanteFile = formData.get("comprobante_file") as File | null;

  // Validación Zod
  const validatedFields = ingresoSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { id, caja_destino_id, ...ingresoData } = validatedFields.data;

  let comprobanteUrl: string | null = null;
  if (id) {
    const { data: current } = await supabase
      .from("transacciones")
      .select("comprobante_url")
      .eq("id", id)
      .single();
    comprobanteUrl = current?.comprobante_url || null;
  }

  if (comprobanteFile && comprobanteFile.size > 0) {
    const fileExt = comprobanteFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${new Date().getFullYear()}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, comprobanteFile, { upsert: true });

    if (uploadError) {
      return {
        success: false,
        message: `Error al subir comprobante: ${uploadError.message}`,
      };
    }

    comprobanteUrl = supabase.storage
      .from("comprobantes")
      .getPublicUrl(filePath).data.publicUrl;
  }

  const dataToUpsert: Omit<IngresoData, "id"> = {
    monto: ingresoData.monto, // Esto ya es un 'number'
    fecha: ingresoData.fecha,
    categoria_ingreso_id: ingresoData.categoria_ingreso_id,
    metodo_pago: ingresoData.metodo_pago,
    actividad_id: ingresoData.actividad_id || null,
    tipo: "ingreso",
    comprobante_url: comprobanteUrl,
    descripcion: ingresoData.descripcion || null,
    registrado_por: user.id,
  };

  // 1. Insertar Transacción (Histórico)
  let transaccionResult;
  if (id) {
    transaccionResult = await supabase
      .from("transacciones")
      .update(dataToUpsert)
      .eq("id", id)
      .select()
      .single();
  } else {
    transaccionResult = await supabase
      .from("transacciones")
      .insert(dataToUpsert)
      .select()
      .single();
  }

  if (transaccionResult.error) {
    return {
      success: false,
      message: `Error base de datos: ${transaccionResult.error.message}`,
    };
  }

  if (ingresoData.actividad_id) {
    revalidatePath(`/actividades/financieras/${ingresoData.actividad_id}`);
  }

  // 2. Insertar en Caja Chica (Obligatorio)
  // Solo si es NUEVO registro. Si es edición, no duplicamos el movimiento de caja por seguridad contable.
  if (!id) {
    const { error: cajaError } = await supabase
      .from("movimientos_caja_chica")
      .insert({
        caja_chica_id: caja_destino_id, // ID garantizado por Zod
        tipo: "reposicion",
        monto: ingresoData.monto,
        concepto: `Ingreso #${transaccionResult.data.id.slice(0, 6)}: ${ingresoData.descripcion || "Ofrenda/Ingreso"
          }`,
        fecha: ingresoData.fecha,
        registrado_por: user.id,
      });

    if (cajaError) {
      console.error(
        "Error crítico: Se guardó el ingreso pero falló la caja chica.",
        cajaError
      );
      // En un sistema real, aquí haríamos un rollback manual (borrar la transacción)
      return {
        success: true,
        message:
          "Ingreso guardado, pero hubo un error actualizando el saldo de la caja.",
      };
    }
  }

  revalidatePath("/finanzas/ingresos");
  revalidatePath("/finanzas/caja-chica");
  return { success: true, message: "Ingreso registrado y sumado a la caja." };
}

/**
 * Elimina una transacción de ingreso.
 */
export async function deleteIngreso(id: string) {
  await checkPermission(ROLES_FINANCIEROS);

  const supabase = await createClient();
  const { error } = await supabase.from("transacciones").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar ingreso:", error.message);
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/finanzas/ingresos");
  return { success: true, message: "Ingreso eliminado con éxito." };
}
