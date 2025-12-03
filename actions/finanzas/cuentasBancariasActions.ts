
// actions/finanzas/cuentasBancariasActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  cuentaBancariaSchema,
  movimientoBancarioSchema,
  type CuentaBancariaFormValues,
  type MovimientoBancarioFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import { getSessionInfo } from "@/lib/auth/utils";

type CuentaBancariaInsert =
  Database["public"]["Tables"]["cuentas_bancarias"]["Insert"];

// Tipo para la lista de Cuentas
export type CuentaBancariaParaTabla =
  Database["public"]["Tables"]["cuentas_bancarias"]["Row"];

// Tipo para la lista de Movimientos
export type MovimientoBancarioConDetalle =
  Database["public"]["Tables"]["movimientos_bancarios"]["Row"] & {
    cuenta_destino?: {
      nombre: string;
    } | null;
  };

/**
 * Obtiene todas las cuentas bancarias.
 */
export async function getCuentasBancarias(): Promise<
  CuentaBancariaParaTabla[]
> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cuentas_bancarias")
    .select("*")
    .order("activa", { ascending: false })
    .order("nombre");

  if (error) {
    console.error("Error al obtener cuentas bancarias:", error.message);
    return [];
  }
  return data;
}

/**
 * Obtiene los detalles de UNA cuenta bancaria.
 */
export async function getCuentaBancariaDetalle(
  id: string
): Promise<CuentaBancariaParaTabla | null> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cuentas_bancarias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener detalle de cuenta:", error.message);
    return null;
  }
  return data;
}

/**
 * Obtiene los movimientos de UNA cuenta bancaria.
 */
export async function getMovimientosBancarios(
  cuentaId: string
): Promise<MovimientoBancarioConDetalle[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("movimientos_bancarios")
    .select(
      `
        *,
        cuenta_destino: cuentas_bancarias!cuenta_destino_id(nombre)
      `
    )
    .eq("cuenta_id", cuentaId)
    .order("fecha", { ascending: false })
    .limit(50); // Limitamos a los últimos 50

  if (error) {
    console.error("Error al obtener movimientos:", error.message);
    return [];
  }
  return data as unknown as MovimientoBancarioConDetalle[];
}

/**
 * Crea una nueva Cuenta Bancaria.
 */
export async function createCuentaBancaria(data: CuentaBancariaFormValues) {
  await checkPermission(ROLES_FINANCIEROS);

  const validatedFields = cuentaBancariaSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { id, ...cuentaData } = validatedFields.data;
  const supabase = await createClient();

  const dataToInsert: Omit<CuentaBancariaInsert, "id"> = {
    ...cuentaData,
    notas: cuentaData.notas || null,
    // ¡IMPORTANTE! Tu script de BD encripta el 'numero_cuenta'.
    // Para que funcione, el trigger o función de encriptación debe
    // estar activo en la base de datos.
  };

  const { error } = await supabase
    .from("cuentas_bancarias")
    .insert(dataToInsert);

  if (error) {
    return { success: false, message: `Error al crear: ${error.message} ` };
  }

  revalidatePath("/finanzas/cuentas-bancarias");
  return { success: true, message: "Cuenta bancaria creada con éxito." };
}

/**
 * Añade un movimiento (depósito, retiro, transferencia) a una cuenta.
 * Esta acción llama a un TRIGGER en la BD que actualiza el saldo.
 */
export async function addMovimientoBancario(
  data: MovimientoBancarioFormValues
) {
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    !ROLES_FINANCIEROS.includes(profile.rol as any)
  ) {
    return { success: false, message: "No tiene permisos." };
  }

  const validatedFields = movimientoBancarioSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const supabase = await createClient();
  const { cuenta_destino_id, ...movimientoData } = validatedFields.data;

  // --- Validación de Saldo (si es retiro o transferencia) ---
  if (
    movimientoData.tipo === "retiro" ||
    movimientoData.tipo === "transferencia"
  ) {
    const { data: cuenta, error } = await supabase
      .from("cuentas_bancarias")
      .select("saldo_actual")
      .eq("id", movimientoData.cuenta_id)
      .single();

    if (error || !cuenta) {
      return { success: false, message: "No se encontró la cuenta de origen." };
    }
    if (cuenta.saldo_actual < movimientoData.monto) {
      return { success: false, message: "Fondos insuficientes en la cuenta." };
    }
  }

  // Validar transferencia
  if (movimientoData.tipo === "transferencia") {
    if (!cuenta_destino_id) {
      return {
        success: false,
        message:
          "Debe seleccionar una cuenta de destino para la transferencia.",
      };
    }
    if (cuenta_destino_id === movimientoData.cuenta_id) {
      return {
        success: false,
        message: "La cuenta de destino no puede ser la misma que la de origen.",
      };
    }
  }

  // Insertar el movimiento
  const { error } = await supabase.from("movimientos_bancarios").insert({
    ...movimientoData,
    cuenta_destino_id:
      movimientoData.tipo === "transferencia" ? cuenta_destino_id : null,
    // (Faltaba 'transaccion_id' y 'conciliado', la BD los pondrá por defecto)
  });

  if (error) {
    return {
      success: false,
      message: `Error al registrar movimiento: ${error.message} `,
    };
  }

  revalidatePath(`/finanzas/cuentas-bancarias/${movimientoData.cuenta_id}`);
  revalidatePath("/finanzas/cuentas-bancarias");
  return {
    success: true,
    message: `Movimiento de ${movimientoData.tipo} registrado.`,
  };
}

/**
 * Elimina un movimiento bancario Y revierte el saldo.
 * NOTA: Esto requiere que el trigger 'actualizar_saldo_cuenta_bancaria'
 * maneje 'ON DELETE'.
 */
export async function deleteMovimientoBancario(
  movimientoId: string,
  cuentaId: string
) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  // Eliminar el movimiento
  const { error } = await supabase
    .from("movimientos_bancarios")
    .delete()
    .eq("id", movimientoId);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message} ` };
  }

  revalidatePath(`/finanzas/cuentas-bancarias/${cuentaId}`);
  revalidatePath("/finanzas/cuentas-bancarias");
  return { success: true, message: "Movimiento eliminado." };
}
