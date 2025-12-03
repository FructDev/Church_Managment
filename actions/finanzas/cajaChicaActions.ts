
/* eslint-disable @typescript-eslint/no-unused-vars */
// actions/finanzas/cajaChicaActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  cajaChicaSchema,
  FondoTransferFormValues,
  fondoTransferSchema,
  movimientoCajaChicaSchema,
  type CajaChicaFormValues,
  type MovimientoCajaChicaFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import { getSessionInfo } from "@/lib/auth/utils";

// Tipo para la tabla de Cajas Chicas
export type CajaChicaConResponsable = {
  id: string;
  nombre: string | null;
  monto_asignado: number;
  monto_disponible: number;
  estado: string;
  periodo_inicio: string;
  responsable: {
    id: string;
    nombre_completo: string;
  } | null;
};

// Tipo para la tabla de Movimientos
export type MovimientoCajaChicaConDetalle =
  Database["public"]["Tables"]["movimientos_caja_chica"]["Row"] & {
    registrado_por: {
      nombre_completo: string;
    } | null;
  };

/**
 * Obtiene todas las cajas chicas.
 */
export async function getCajasChicas(): Promise<CajaChicaConResponsable[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("caja_chica")
    .select(
      `
        id,
        nombre,
        monto_asignado,
        monto_disponible,
        estado,
        periodo_inicio,
        responsable: miembros(id, nombre_completo)
      `
    )
    .order("estado", { ascending: true })
    .order("periodo_inicio", { ascending: false });

  if (error) {
    console.error("Error al obtener cajas chicas:", error.message);
    return [];
  }

  // Depuración: Ver si llegan datos en la consola del servidor
  console.log("Cajas encontradas:", data?.length);

  return data as unknown as CajaChicaConResponsable[];
}

/**
 * Obtiene los detalles de UNA caja chica.
 */
export async function getCajaChicaDetalle(
  id: string
): Promise<CajaChicaConResponsable | null> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("caja_chica")
    .select(
      `
        id,
        nombre,
        monto_asignado,
        monto_disponible,
        estado,
        periodo_inicio,
        responsable: miembros(id, nombre_completo)
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener detalle de caja chica:", error.message);
    return null;
  }
  return data as CajaChicaConResponsable;
}

/**
 * Obtiene los movimientos de UNA caja chica.
 */
export async function getMovimientosCajaChica(
  cajaChicaId: string
): Promise<MovimientoCajaChicaConDetalle[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("movimientos_caja_chica")
    .select(
      `
        *,
        registrado_por: profiles(nombre_completo)
      `
    )
    .eq("caja_chica_id", cajaChicaId)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener movimientos:", error.message);
    return [];
  }
  return data as unknown as MovimientoCajaChicaConDetalle[];
}

/**
 * Crea una nueva Caja Chica.
 */
export async function createCajaChica(data: CajaChicaFormValues) {
  await checkPermission(ROLES_FINANCIEROS);

  const validatedFields = cajaChicaSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { id, ...cajaData } = validatedFields.data;
  const supabase = await createClient();

  // El monto disponible inicial es el monto asignado
  const dataToInsert: Database["public"]["Tables"]["caja_chica"]["Insert"] = {
    ...cajaData,
    monto_disponible: cajaData.monto_asignado,
  };

  const { error } = await supabase.from("caja_chica").insert(dataToInsert);

  if (error) {
    return { success: false, message: `Error al crear: ${error.message} ` };
  }

  revalidatePath("/finanzas/caja-chica");
  return { success: true, message: "Caja chica creada con éxito." };
}

/**
 * Añade un movimiento a una caja chica.
 * Maneja: Gasto, Reposición, Depósito a Banco y Transferencia entre Cajas.
 */
export async function addMovimientoCajaChica(
  data: MovimientoCajaChicaFormValues
) {
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    !ROLES_FINANCIEROS.includes(profile.rol as any)
  ) {
    return { success: false, message: "No tiene permisos." };
  }

  const validatedFields = movimientoCajaChicaSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    tipo,
    monto,
    caja_chica_id,
    concepto,
    fecha,
    cuenta_destino_id,
    caja_destino_id,
  } = validatedFields.data;

  // 1. VALIDACIÓN DE SALDO DE ORIGEN
  // Si el dinero SALE de la caja (gasto, deposito o transferencia), verificamos saldo.
  if (["gasto", "deposito_banco", "transferencia_caja"].includes(tipo)) {
    const { data: caja } = await supabase
      .from("caja_chica")
      .select("monto_disponible")
      .eq("id", caja_chica_id)
      .single();
    if (!caja || caja.monto_disponible < monto) {
      return {
        success: false,
        message: "Fondos insuficientes en la caja de origen.",
      };
    }
  }

  // --- LÓGICA SEGÚN EL TIPO ---

  // CASO A: Depósito a Banco (Sale de Caja -> Entra a Banco)
  if (tipo === "deposito_banco") {
    if (!cuenta_destino_id)
      return { success: false, message: "Falta cuenta destino." };

    // A1. Salida de Caja (Tipo BD: 'gasto')
    const { error: errCaja } = await supabase
      .from("movimientos_caja_chica")
      .insert({
        caja_chica_id,
        tipo: "gasto",
        monto,
        concepto: `Depósito a Banco: ${concepto} `,
        fecha,
        registrado_por: user.id,
      });
    if (errCaja)
      return { success: false, message: `Error en caja: ${errCaja.message} ` };

    // A2. Entrada a Banco (Tipo BD: 'deposito')
    const { error: errBanco } = await supabase
      .from("movimientos_bancarios")
      .insert({
        cuenta_id: cuenta_destino_id,
        tipo: "deposito",
        monto,
        descripcion: `Depósito desde Caja Chica: ${concepto} `,
        fecha,
      });
    if (errBanco)
      return {
        success: false,
        message: `Error crítico en banco: ${errBanco.message} `,
      };

    revalidatePath("/finanzas/cuentas-bancarias");
  }

  // CASO B: Transferencia entre Cajas (Sale de Caja A -> Entra a Caja B)
  else if (tipo === "transferencia_caja") {
    if (!caja_destino_id)
      return { success: false, message: "Falta caja destino." };
    if (caja_chica_id === caja_destino_id)
      return {
        success: false,
        message: "No puede transferir a la misma caja.",
      };

    // B1. Salida de Origen (Tipo BD: 'gasto')
    const { error: errSalida } = await supabase
      .from("movimientos_caja_chica")
      .insert({
        caja_chica_id,
        tipo: "gasto",
        monto,
        concepto: `Transferencia a otra caja: ${concepto} `,
        fecha,
        registrado_por: user.id,
      });
    if (errSalida)
      return {
        success: false,
        message: `Error en salida: ${errSalida.message} `,
      };

    // B2. Entrada a Destino (Tipo BD: 'reposicion')
    const { error: errEntrada } = await supabase
      .from("movimientos_caja_chica")
      .insert({
        caja_chica_id: caja_destino_id,
        tipo: "reposicion",
        monto,
        concepto: `Transferencia desde otra caja: ${concepto} `,
        fecha,
        registrado_por: user.id,
      });
    if (errEntrada)
      return {
        success: false,
        message: `Error crítico en entrada: ${errEntrada.message} `,
      };
  }

  // CASO C: Movimiento Normal (Gasto simple o Reposición simple)
  else {
    // Casteo seguro para TypeScript
    const tipoBD = tipo as "gasto" | "reposicion";

    const { error } = await supabase.from("movimientos_caja_chica").insert({
      caja_chica_id,
      tipo: tipoBD,
      monto,
      concepto,
      fecha,
      registrado_por: user.id,
    });
    if (error) return { success: false, message: `Error: ${error.message} ` };
  }

  revalidatePath(`/finanzas/caja-chica/${caja_chica_id}`);
  revalidatePath("/finanzas/caja-chica");
  return { success: true, message: "Movimiento registrado con éxito." };
}

/**
 * Elimina un movimiento de caja chica Y revierte el saldo.
 * NOTA: Esto requiere un trigger en la BD o lógica aquí.
 * Asumiremos que el trigger 'actualizar_saldo_caja_chica'
 * también maneja 'ON DELETE'.
 */
export async function deleteMovimientoCajaChica(
  movimientoId: string,
  cajaChicaId: string
) {
  // 1. Permisos
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  // 2. Antes de borrar, obtenemos el movimiento para saber el tipo y monto
  // (Esto es necesario si el trigger NO maneja ON DELETE)
  // Por ahora, asumimos que el trigger SÍ lo maneja.

  // 3. Eliminar el movimiento
  const { error } = await supabase
    .from("movimientos_caja_chica")
    .delete()
    .eq("id", movimientoId);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message} ` };
  }

  // 4. Revalidar
  revalidatePath(`/finanzas/caja-chica/${cajaChicaId}`);
  revalidatePath("/finanzas/caja-chica");
  return { success: true, message: "Movimiento eliminado." };
}

export async function transferirACuentaBancaria(data: FondoTransferFormValues) {
  const { user } = await getSessionInfo();
  // Verificación de permisos simplificada
  if (!user) return { success: false, message: "No autorizado." };

  const validated = fondoTransferSchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: "Datos inválidos." };

  const { origen_id, destino_id, monto, fecha, concepto } = validated.data;
  const supabase = await createClient();

  // 1. Validar Saldo en Caja
  const { data: caja } = await supabase
    .from("caja_chica")
    .select("monto_disponible")
    .eq("id", origen_id)
    .single();
  if (!caja || caja.monto_disponible < monto) {
    return { success: false, message: "Fondos insuficientes en la caja." };
  }

  // 2. Registrar SALIDA de Caja (Gasto)
  const { error: errCaja } = await supabase
    .from("movimientos_caja_chica")
    .insert({
      caja_chica_id: origen_id,
      tipo: "gasto",
      monto,
      concepto: `Transferencia a Banco: ${concepto} `,
      fecha,
      registrado_por: user.id,
    });
  if (errCaja)
    return { success: false, message: `Error en caja: ${errCaja.message} ` };

  // 3. Registrar ENTRADA a Banco (Depósito)
  const { error: errBanco } = await supabase
    .from("movimientos_bancarios")
    .insert({
      cuenta_id: destino_id,
      tipo: "deposito",
      monto,
      descripcion: `Transferencia desde Caja: ${concepto} `,
      fecha,
    });

  if (errBanco)
    return {
      success: false,
      message: `Dinero salió de caja pero falló en banco: ${errBanco.message} `,
    };

  revalidatePath("/finanzas/caja-chica");
  revalidatePath("/finanzas/cuentas-bancarias");
  return { success: true, message: "Transferencia a banco exitosa." };
}

// --- ACCIÓN 2: CAJA CHICA -> OTRA CAJA CHICA ---
export async function transferirEntreCajas(data: FondoTransferFormValues) {
  const { user } = await getSessionInfo();
  if (!user) return { success: false, message: "No autorizado." };

  const validated = fondoTransferSchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: "Datos inválidos." };

  const { origen_id, destino_id, monto, fecha, concepto } = validated.data;
  const supabase = await createClient();

  // 1. Validar Saldo en Origen
  const { data: cajaOrigen } = await supabase
    .from("caja_chica")
    .select("monto_disponible")
    .eq("id", origen_id)
    .single();
  if (!cajaOrigen || cajaOrigen.monto_disponible < monto) {
    return {
      success: false,
      message: "Fondos insuficientes en la caja de origen.",
    };
  }

  // 2. Registrar SALIDA (Gasto en Origen)
  const { error: errSalida } = await supabase
    .from("movimientos_caja_chica")
    .insert({
      caja_chica_id: origen_id,
      tipo: "gasto",
      monto,
      concepto: `Transferencia enviada: ${concepto} `,
      fecha,
      registrado_por: user.id,
    });
  if (errSalida)
    return {
      success: false,
      message: `Error al sacar fondos: ${errSalida.message} `,
    };

  // 3. Registrar ENTRADA (Reposición en Destino)
  const { error: errEntrada } = await supabase
    .from("movimientos_caja_chica")
    .insert({
      caja_chica_id: destino_id,
      tipo: "reposicion",
      monto,
      concepto: `Transferencia recibida: ${concepto} `,
      fecha,
      registrado_por: user.id,
    });

  if (errEntrada)
    return {
      success: false,
      message: `Fondos salieron pero falló el destino: ${errEntrada.message} `,
    };

  revalidatePath("/finanzas/caja-chica");
  return { success: true, message: "Transferencia entre cajas exitosa." };
}
