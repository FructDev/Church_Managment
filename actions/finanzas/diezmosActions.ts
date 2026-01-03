// actions/finanzas/diezmosActions.ts
"use server";

import { getSessionInfo } from "@/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";
import {
  diezmoLoteSchema,
  type DiezmoLoteFormValues,
} from "@/lib/validations/finanzas.schema";
import { revalidatePath } from "next/cache";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { type Database } from "@/lib/database.types";
import { checkPermission } from "@/lib/auth/guards";

type TransaccionInsert =
  Database["public"]["Tables"]["transacciones"]["Insert"];
type DiezmoInsert = Database["public"]["Tables"]["diezmos"]["Insert"];

// 1. Definimos el tipo que esperamos de la función SQL
type DesgloseDiezmo = {
  diezmo_de_diezmo: number;
  comite_finanzas: number;
  diezmo_pastoral: number;
  sustento_pastoral: number;
};

type GetDiezmosParams = {
  year?: string;
  month?: string;
  fortnight?: "primera_quincena" | "segunda_quincena";
};

/**
 * Registra un lote completo de diezmos y crea el resumen de distribución.
 */
export async function registrarLoteDeDiezmos(data: DiezmoLoteFormValues) {
  // 1. Permisos y Validación
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    !ROLES_FINANCIEROS.includes(profile.rol as any)
  ) {
    return { success: false, message: "No tiene permisos para esta acción." };
  }

  const validatedFields = diezmoLoteSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Datos inválidos.",
      errors: validatedFields.error.flatten(),
    };
  }

  const { fecha, tipo_periodo, entradas } = validatedFields.data;
  const supabase = await createClient();

  // 2. Obtener la Categoría de Ingreso "Diezmo"
  const { data: catDiezmo, error: catError } = await supabase
    .from("categorias_ingresos")
    .select("id")
    .eq("tipo", "diezmo")
    .limit(1)
    .single();

  if (catError || !catDiezmo) {
    return {
      success: false,
      message:
        "Error: No se encontró la categoría de ingreso 'diezmo'. Verifique la configuración.",
    };
  }

  // 3. Calcular el total
  const totalRecibido = entradas.reduce((acc, entry) => acc + entry.monto, 0);

  // 4. Llamar a la función SQL para obtener el desglose
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "calcular_distribucion_diezmos",
    { monto_total: totalRecibido }
  );

  // 2. Casteamos 'rpcData' (la respuesta) a 'desglose'
  const desglose = rpcData as DesgloseDiezmo | null;
  // --- FIN DE CORRECCIÓN 2 ---

  if (rpcError) {
    return {
      success: false,
      message: `Error al calcular distribución: ${rpcError.message}`,
    };
  }

  if (!desglose) {
    return {
      success: false,
      message:
        "Error: La función de cálculo de distribución no devolvió resultados.",
    };
  }

  // 5. Crear el "Resumen de Diezmos" (Ahora esto es seguro)
  const diezmoResumen: Omit<DiezmoInsert, "id"> = {
    periodo: fecha,
    tipo_periodo: tipo_periodo,
    total_recibido: totalRecibido,
    diezmo_de_diezmo: desglose.diezmo_de_diezmo, // <-- Seguro
    comite_finanzas: desglose.comite_finanzas, // <-- Seguro
    diezmo_pastoral: desglose.diezmo_pastoral, // <-- Seguro
    sustento_pastoral: desglose.sustento_pastoral, // <-- Seguro
    distribuido: false,
    registrado_por: user.id,
  };

  // ... (El resto de la función: pasos 5, 6, 7 y 8 no cambian) ...
  const { data: diezmoRow, error: diezmoError } = await supabase
    .from("diezmos")
    .insert(diezmoResumen)
    .select("id")
    .single();

  if (diezmoError || !diezmoRow) {
    return {
      success: false,
      message: `Error al crear el resumen de diezmos: ${diezmoError?.message}`,
    };
  }

  const diezmoResumenId = diezmoRow.id;

  const transaccionesParaInsertar: Omit<TransaccionInsert, "id">[] =
    entradas.map((entry) => ({
      fecha: fecha,
      tipo: "ingreso",
      categoria_ingreso_id: catDiezmo.id,
      monto: entry.monto,
      metodo_pago: entry.metodo_pago,
      descripcion: "Registro de diezmo",

      // --- CAMBIO AQUÍ ---
      // 1. Si hay miembro_id, úsalo. Si es string vacío, manda null.
      miembro_id: entry.miembro_id || null,

      // 2. AGREGAR ESTA LÍNEA (Si no es miembro, guarda el nombre externo)
      // Usamos (entry as any) por si TypeScript se queja de que el tipo viejo no tiene el campo
      nombre_externo: entry.miembro_id ? null : ((entry as any).nombre_externo || "Anónimo"),

      registrado_por: user.id,
    }));

  const { data: transaccionesRows, error: transError } = await supabase
    .from("transacciones")
    .insert(transaccionesParaInsertar)
    .select("id");

  if (transError || !transaccionesRows) {
    await supabase.from("diezmos").delete().eq("id", diezmoResumenId);
    return {
      success: false,
      message: `Error al registrar las transacciones: ${transError?.message}`,
    };
  }

  const vinculosParaInsertar = transaccionesRows.map((tr) => ({
    diezmo_id: diezmoResumenId,
    transaccion_id: tr.id,
  }));

  const { error: vinculoError } = await supabase
    .from("transacciones_diezmos")
    .insert(vinculosParaInsertar);

  if (vinculoError) {
    await supabase
      .from("transacciones")
      .delete()
      .in(
        "id",
        transaccionesRows.map((t) => t.id)
      );
    await supabase.from("diezmos").delete().eq("id", diezmoResumenId);
    return {
      success: false,
      message: `Error al vincular transacciones: ${vinculoError.message}`,
    };
  }

  revalidatePath("/finanzas/diezmos");
  return {
    success: true,
    message: "Lote de diezmos registrado y listo para distribuir.",
  };
}

// Define el tipo de lo que devolverá la lista
export type DiezmoResumenParaTabla = {
  id: string;
  periodo: string;
  tipo_periodo: string;
  total_recibido: number;
  distribuido: boolean;
  fecha_distribucion: string | null;
  registrado_por: {
    // Quién creó el lote
    nombre_completo: string;
  } | null;
  distribuido_por: {
    // Quién presionó "Distribuir"
    nombre_completo: string;
  } | null; // <-- ¡NUEVO!
  // Incluimos los montos calculados
  diezmo_de_diezmo: number;
  comite_finanzas: number;
  diezmo_pastoral: number;
  sustento_pastoral: number;
};

/**
 * ¡VERSIÓN ACTUALIZADA!
 * Obtiene la lista de resúmenes de diezmos, AHORA CON FILTROS.
 */
export async function getDiezmosResumenList(
  params: GetDiezmosParams
): Promise<DiezmoResumenParaTabla[]> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();
  const { year, month, fortnight } = params;

  let queryBuilder = supabase.from("diezmos").select(`
      id,
      periodo,
      tipo_periodo,
      total_recibido,
      distribuido,
      fecha_distribucion,
      diezmo_de_diezmo,
      comite_finanzas,
      diezmo_pastoral,
      sustento_pastoral,
      registrado_por: profiles!registrado_por ( nombre_completo ),
      distribuido_por: profiles!distribuido_por ( nombre_completo )
    `);

  if (year) {
    const yearNum = parseInt(year);
    let startDate: string, endDate: string;

    if (month) {
      // Filtro por Mes Específico
      const monthNum = parseInt(month);
      startDate = new Date(yearNum, monthNum - 1, 1).toISOString(); // Día 1 del mes
      endDate = new Date(yearNum, monthNum, 0).toISOString(); // Último día del mes
    } else {
      // Filtro por Año Completo
      startDate = new Date(yearNum, 0, 1).toISOString(); // Enero 1
      endDate = new Date(yearNum, 11, 31).toISOString(); // Diciembre 31
    }

    queryBuilder = queryBuilder
      .gte("periodo", startDate)
      .lte("periodo", endDate);
  }

  if (
    fortnight &&
    (fortnight === "primera_quincena" || fortnight === "segunda_quincena")
  ) {
    queryBuilder = queryBuilder.eq("tipo_periodo", fortnight);
  }

  const { data, error } = await queryBuilder.order("periodo", {
    ascending: false,
  });

  if (error) {
    console.error("Error al obtener lista de diezmos:", error.message);
    return [];
  }
  return data as unknown as DiezmoResumenParaTabla[];
}

/**
 * Ejecuta la distribución de un resumen de diezmo.
 * ¡ACTUALIZADA con trazabilidad de 'distribuido_por'!
 */
export async function ejecutarDistribucion(
  diezmoResumen: DiezmoResumenParaTabla
) {
  // 1. Permisos y Obtener Usuario
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    (profile.rol !== "admin" && profile.rol !== "tesorero")
  ) {
    return { success: false, message: "No tiene permisos para esta acción." };
  }

  // 2. Validación
  if (diezmoResumen.distribuido) {
    return {
      success: false,
      message: "Este lote de diezmos ya ha sido distribuido.",
    };
  }

  const supabase = await createClient();

  // 3. Marcar el Resumen como "Distribuido" Y guardar QUIÉN lo hizo
  const { error: updateError } = await supabase
    .from("diezmos")
    .update({
      distribuido: true,
      fecha_distribucion: new Date().toISOString(),
      distribuido_por: user.id,
    })
    .eq("id", diezmoResumen.id);

  if (updateError) {
    return {
      success: false,
      message: `Error al marcar como distribuido: ${updateError.message}`,
    };
  }

  // 4. ¡Éxito!
  // Ya no revalidamos /finanzas/egresos
  revalidatePath("/finanzas/diezmos");
  return { success: true, message: "¡Distribución marcada como completada!" };
}

// Define la transacción individual (el miembro y su monto)
export type TransaccionDiezmoDetalle = {
  id: string; // id de la transacción
  monto: number;
  metodo_pago: string;
  nombre_externo: string | null;
  miembro: {
    nombre_completo: string;
  } | null;
};

// --- ¡NUEVO TIPO! ---
// Define la página de detalle completa
export type DiezmoDetalleCompleto = {
  resumen: DiezmoResumenParaTabla | null;
  transacciones: TransaccionDiezmoDetalle[];
};

// --- ¡NUEVA FUNCIÓN! ---
/**
 * Obtiene el resumen Y la lista detallada de transacciones
 * para un solo lote de diezmos.
 */
export async function getDiezmoDetalleById(
  id: string
): Promise<DiezmoDetalleCompleto> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  // 1. Obtener el resumen (similar a la lista, pero uno solo)
  const { data: resumen, error: resumenError } = await supabase
    .from("diezmos")
    .select(
      `
      id, periodo, tipo_periodo, total_recibido, distribuido, fecha_distribucion,
      diezmo_de_diezmo, comite_finanzas, diezmo_pastoral, sustento_pastoral,
      registrado_por: profiles!registrado_por ( nombre_completo ),
      distribuido_por: profiles!distribuido_por ( nombre_completo )
    `
    )
    .eq("id", id)
    .single();

  if (resumenError) {
    console.error("Error al obtener resumen de diezmo:", resumenError.message);
    return { resumen: null, transacciones: [] };
  }

  // 2. Obtener las transacciones individuales vinculadas
  const { data: transacciones, error: transError } = await supabase
    .from("transacciones_diezmos") // Empezamos desde la tabla de vínculo
    .select(
      `
      transaccion: transacciones (
        id,
        monto,
        metodo_pago,
        nombre_externo,
        miembro: miembros ( nombre_completo )
      )
    `
    )
    .eq("diezmo_id", id);

  if (transError) {
    console.error(
      "Error al obtener transacciones de diezmo:",
      transError.message
    );
    return {
      resumen: resumen as unknown as DiezmoResumenParaTabla,
      transacciones: [],
    };
  }

  // Mapeamos explícitamente para asegurar que 'nombre_externo' no se pierda
  const transaccionesLimpias = transacciones.map((t) => {
    // 1. Usamos 'any' para leer los datos crudos que vienen de la BD
    // (Esto ignora si los tipos viejos dicen que no existe)
    const raw = t.transaccion as any;

    // 2. Construimos el objeto final manualmente
    return {
      id: raw.id,
      monto: raw.monto,
      metodo_pago: raw.metodo_pago,

      // AQUÍ ESTÁ LA SOLUCIÓN:
      // Leemos explícitamente el campo y si no existe, ponemos null.
      nombre_externo: raw.nombre_externo || null,

      miembro: raw.miembro,
    };
  }) as TransaccionDiezmoDetalle[];

  return {
    resumen: resumen as unknown as DiezmoResumenParaTabla,
    transacciones: transaccionesLimpias,
  };
}

/**
 * Recalcula el resumen de un lote de diezmos después de una edición.
 * @param diezmoId El ID del resumen ('diezmos') a recalcular.
 * @param supabase El cliente de Supabase *RESUELTO* (no la promesa).
 */
async function recalculateDiezmoResumen(
  diezmoId: string,
  // CORRECCIÓN: Usamos Awaited<> para obtener el tipo resuelto
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  // Ahora 'supabase.from' y 'supabase.rpc' funcionarán

  // 1. Sumar los montos
  const { data: transacciones, error: sumError } = await supabase
    .from("transacciones_diezmos")
    .select("transacciones ( monto )")
    .eq("diezmo_id", diezmoId);

  if (sumError)
    throw new Error(`Error al sumar transacciones: ${sumError.message}`);

  // CORRECCIÓN: Tipado explícito para 'reduce'
  const totalRecibido = transacciones.reduce(
    (acc: number, t: { transacciones: { monto: number } | null }) => {
      return acc + (t.transacciones?.monto || 0);
    },
    0
  );

  // 2. Llamar a la función SQL
  const { data, error: rpcError } = await supabase.rpc(
    "calcular_distribucion_diezmos",
    { monto_total: totalRecibido }
  );
  const desglose = data as DesgloseDiezmo | null;

  if (rpcError)
    throw new Error(`Error al recalcular distribución: ${rpcError.message}`);
  if (!desglose)
    throw new Error("La función de cálculo no devolvió resultados.");

  // 3. Actualizar la fila principal
  const { error: updateError } = await supabase
    .from("diezmos")
    .update({
      total_recibido: totalRecibido,
      diezmo_de_diezmo: desglose.diezmo_de_diezmo,
      comite_finanzas: desglose.comite_finanzas,
      diezmo_pastoral: desglose.diezmo_pastoral,
      sustento_pastoral: desglose.sustento_pastoral,
    })
    .eq("id", diezmoId);

  if (updateError)
    throw new Error(`Error al actualizar resumen: ${updateError.message}`);
}

/**
 * Actualiza el monto de una sola entrada de diezmo.
 */
export async function updateDiezmoEntry(
  transaccionId: string,
  diezmoId: string,
  nuevoMonto: number
) {
  await checkPermission(ROLES_FINANCIEROS);

  if (nuevoMonto <= 0) {
    return { success: false, message: "El monto debe ser mayor a 0." };
  }

  // 'supabase' aquí es el cliente resuelto
  const supabase = await createClient();

  // 1. Actualizar el monto
  const { error: updateError } = await supabase
    .from("transacciones")
    .update({ monto: nuevoMonto })
    .eq("id", transaccionId);

  if (updateError) {
    return {
      success: false,
      message: `Error al actualizar monto: ${updateError.message}`,
    };
  }

  // 2. Recalcular (ahora pasamos el cliente resuelto y funciona)
  try {
    await recalculateDiezmoResumen(diezmoId, supabase);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }

  revalidatePath(`/finanzas/diezmos/${diezmoId}`);
  return { success: true, message: "Monto actualizado con éxito." };
}

/**
 * Elimina una sola entrada de diezmo de un lote.
 */
export async function deleteDiezmoEntry(
  transaccionId: string,
  diezmoId: string
) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient(); // Cliente resuelto

  // 1. Eliminar el VÍNCULO
  const { error: vinculoError } = await supabase
    .from("transacciones_diezmos")
    .delete()
    .eq("transaccion_id", transaccionId);

  if (vinculoError) {
    return {
      success: false,
      message: `Error al eliminar vínculo: ${vinculoError.message}`,
    };
  }

  // 2. Eliminar la TRANSACCIÓN
  const { error: transError } = await supabase
    .from("transacciones")
    .delete()
    .eq("id", transaccionId);

  if (transError) {
    return {
      success: false,
      message: `Error al eliminar transacción: ${transError.message}`,
    };
  }

  // 3. Recalcular (pasamos el cliente resuelto)
  try {
    await recalculateDiezmoResumen(diezmoId, supabase);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }

  revalidatePath(`/finanzas/diezmos/${diezmoId}`);
  return { success: true, message: "Entrada eliminada del lote." };
}
