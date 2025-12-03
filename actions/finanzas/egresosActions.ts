
/* eslint-disable @typescript-eslint/no-unused-vars */
// actions/finanzas/egresosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  egresoSchema,
  type EgresoFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import { getSessionInfo } from "@/lib/auth/utils";

type EgresoData = Database["public"]["Tables"]["transacciones"]["Insert"];

// Tipo para la tabla de egresos, incluyendo trazabilidad
export type EgresoParaTabla = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string | null;
  metodo_pago: string;
  comprobante_url: string | null;
  beneficiario_proveedor: string | null;
  categoria_egreso: {
    nombre: string;
  } | null;
  registrado_por: {
    nombre_completo: string;
  } | null;
  autorizado_por: {
    nombre_completo: string;
  } | null;
};

/**
 * Obtiene la lista paginada de Egresos.
 */
export async function getEgresos(): Promise<EgresoParaTabla[]> {
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
        beneficiario_proveedor,
        categoria_egreso: categorias_egresos(nombre),
        registrado_por: profiles!registrado_por(nombre_completo),
        autorizado_por: profiles!autorizado_por(nombre_completo)
      `
    )
    .eq("tipo", "egreso")
    .order("fecha", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error al obtener egresos:", error.message);
    return [];
  }

  return data as unknown as EgresoParaTabla[];
}

/**
 * Obtiene la lista de categorías de egresos activas.
 */
export async function getCategoriasEgreso() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_egresos")
    .select("id, nombre, tipo")
    .eq("activo", true)
    .order("orden");

  if (error) {
    console.error("Error al obtener categorías de egreso:", error.message);
    return [];
  }
  return data;
}

/**
 * Acción para crear o actualizar un Egreso.
 */
export async function upsertEgreso(formData: FormData) {
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    !ROLES_FINANCIEROS.includes(profile.rol as any)
  ) {
    return { success: false, message: "No tiene permisos." };
  }

  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const comprobanteFile = formData.get("comprobante_file") as File | null;

  const validatedFields = egresoSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { id, fondo_origen_tipo, fondo_origen_id, ...egresoData } =
    validatedFields.data;

  // --- A. VALIDACIÓN DE FONDOS (CRÍTICO) ---
  if (!id && fondo_origen_tipo !== "ninguno" && fondo_origen_id) {
    if (fondo_origen_tipo === "caja_chica") {
      const { data: caja } = await supabase
        .from("caja_chica")
        .select("monto_disponible, nombre")
        .eq("id", fondo_origen_id)
        .single();
      if (caja && caja.monto_disponible < egresoData.monto) {
        return {
          success: false,
          message: `Fondos insuficientes en ${caja.nombre}.Disponible: ${caja.monto_disponible} `,
        };
      }
    } else if (fondo_origen_tipo === "banco") {
      const { data: cuenta } = await supabase
        .from("cuentas_bancarias")
        .select("saldo_actual, nombre")
        .eq("id", fondo_origen_id)
        .single();
      if (cuenta && cuenta.saldo_actual < egresoData.monto) {
        return {
          success: false,
          message: `Fondos insuficientes en ${cuenta.nombre}.Disponible: ${cuenta.saldo_actual} `,
        };
      }
    }
  }

  // Subida de archivo (Simplificada)
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
    const fileName = `${crypto.randomUUID()}.${fileExt} `;
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

  const dataToUpsert: Omit<EgresoData, "id"> = {
    monto: egresoData.monto,
    fecha: egresoData.fecha,
    categoria_egreso_id: egresoData.categoria_egreso_id,
    metodo_pago: egresoData.metodo_pago,
    actividad_id: egresoData.actividad_id || null,
    tipo: "egreso", // ¡Importante!
    descripcion: egresoData.descripcion || null,
    beneficiario_proveedor: egresoData.beneficiario_proveedor || null,
    comprobante_url: comprobanteUrl,
    registrado_por: user.id,
    autorizado_por: user.id, // Por ahora, quien registra autoriza.
  };

  // B. Guardar Transacción
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
      message: `Error al guardar: ${transaccionResult.error.message}`,
    };
  }
  const transaccionId = transaccionResult.data.id;

  // C. Descontar del Fondo (Solo si es nuevo registro)
  if (!id && fondo_origen_tipo !== "ninguno" && fondo_origen_id) {
    const concepto = `Egreso #${transaccionId.slice(0, 6)}: ${egresoData.descripcion
      }`;

    if (fondo_origen_tipo === "caja_chica") {
      await supabase.from("movimientos_caja_chica").insert({
        caja_chica_id: fondo_origen_id,
        tipo: "gasto",
        monto: egresoData.monto,
        concepto: concepto,
        fecha: egresoData.fecha,
        registrado_por: user.id,
      });
    } else if (fondo_origen_tipo === "banco") {
      await supabase.from("movimientos_bancarios").insert({
        cuenta_id: fondo_origen_id,
        tipo: "retiro",
        monto: egresoData.monto,
        descripcion: concepto,
        fecha: egresoData.fecha,
        transaccion_id: transaccionId,
      });
    }
  }

  if (egresoData.actividad_id) {
    revalidatePath(`/actividades/financieras/${egresoData.actividad_id}`);
  }

  revalidatePath("/finanzas/egresos");
  revalidatePath("/finanzas/caja-chica");
  revalidatePath("/finanzas/cuentas-bancarias");

  return { success: true, message: "Egreso registrado correctamente." };
}

/**
 * Elimina una transacción de egreso.
 */
export async function deleteEgreso(id: string) {
  await checkPermission(ROLES_FINANCIEROS);

  const supabase = await createClient();
  const { error } = await supabase.from("transacciones").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/finanzas/egresos");
  return { success: true, message: "Egreso eliminado con éxito." };
}
