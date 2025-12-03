"use server";

import { createClient } from "@/lib/supabase/server";
import { ROLES_ADMINISTRATIVOS, ROLES_ACCESO_TOTAL } from "@/lib/auth/roles";
import {
  actividadSchema,
  RegistroAsistenciaFormValues,
  registroAsistenciaSchema,
  TipoActividadFormValues,
  tipoActividadSchema,
  type ActividadFormValues,
} from "@/lib/validations/actividades.schema";
import { checkPermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

// Tipo optimizado para el calendario (lectura ligera)
export type ActividadCalendario = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  todo_el_dia: boolean;
  tipo: {
    nombre: string;
    color: string;
  } | null;
  ubicacion: string | null;
};

export type MiembroParaAsistencia = {
  id: string;
  nombre_completo: string;
  foto_url: string | null;
  presente: boolean; // Estado actual (para la UI)
};

// Tipo simple para selectores
export type TipoActividadSimple = {
  id: string;
  nombre: string;
  color: string; // TypeScript espera string, no null
};

/**
 * Obtiene los tipos de actividad disponibles.
 */
export async function getTiposActividades(): Promise<TipoActividadSimple[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tipos_actividades")
    .select("id, nombre, color")
    .order("nombre");

  if (error) {
    console.error("Error al obtener tipos:", error.message);
    return [];
  }
  return (data || []).map((tipo) => ({
    id: tipo.id,
    nombre: tipo.nombre,
    color: tipo.color || "#3b82f6",
  }));
}

/**
 * Obtiene actividades en un rango de fechas.
 * @param start Fecha inicio (ISO string)
 * @param end Fecha fin (ISO string)
 */
export async function getActividadesPorRango(
  start: string,
  end: string
): Promise<ActividadCalendario[]> {
  const supabase = await createClient();

  // Nota: Permitimos lectura pública para usuarios autenticados (sin checkPermission estricto)
  // para que todos puedan ver el calendario.

  const { data, error } = await supabase
    .from("actividades")
    .select(
      `
      id,
      titulo,
      fecha_inicio,
      fecha_fin,
      todo_el_dia,
      ubicacion,
      tipo: tipos_actividades ( nombre, color )
    `
    )
    .gte("fecha_inicio", start) // Mayor o igual al inicio del mes
    .lte("fecha_inicio", end) // Menor o igual al fin del mes
    .neq("estado", "cancelada"); // No traemos las canceladas al calendario principal

  if (error) {
    console.error("Error fetching activities:", error.message);
    return [];
  }

  return data as unknown as ActividadCalendario[];
}

/**
 * Crea o Actualiza una actividad.
 */
export async function upsertActividad(data: ActividadFormValues) {
  // Solo admin y secretarios pueden gestionar actividades
  await checkPermission(ROLES_ADMINISTRATIVOS);

  const validated = actividadSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: validated.error.issues[0].message };
  }

  const { id, fecha_inicio, hora_inicio, fecha_fin, hora_fin, ...rest } =
    validated.data;

  // Combinamos fecha y hora para crear el timestamp completo de PostgreSQL
  const startTimestamp = new Date(
    `${fecha_inicio}T${hora_inicio}`
  ).toISOString();
  const endTimestamp = new Date(`${fecha_fin}T${hora_fin}`).toISOString();

  const supabase = await createClient();

  const dataToUpsert = {
    ...rest,
    fecha_inicio: startTimestamp,
    fecha_fin: endTimestamp,
  };

  let error;
  if (id) {
    ({ error } = await supabase
      .from("actividades")
      .update(dataToUpsert)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("actividades").insert(dataToUpsert));
  }

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/actividades/calendario");
  return { success: true, message: "Actividad guardada correctamente." };
}

/**
 * Elimina una actividad.
 */
export async function deleteActividad(id: string) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { error } = await supabase.from("actividades").delete().eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/actividades/calendario");
  return { success: true, message: "Actividad eliminada." };
}

export async function upsertTipoActividad(data: TipoActividadFormValues) {
  await checkPermission(ROLES_ADMINISTRATIVOS);

  const validated = tipoActividadSchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: validated.error.issues[0].message };

  const { id, ...tipoData } = validated.data;
  const supabase = await createClient();

  let error;
  if (id) {
    ({ error } = await supabase
      .from("tipos_actividades")
      .update(tipoData)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("tipos_actividades").insert(tipoData));
  }

  if (error) return { success: false, message: error.message };

  revalidatePath("/actividades/tipos"); // Revalida la lista de gestión
  revalidatePath("/actividades/calendario"); // Revalida el calendario para que aparezca en el select
  return { success: true, message: "Tipo de actividad guardado." };
}

// --- NUEVA ACCIÓN: ELIMINAR TIPO ---
export async function deleteTipoActividad(id: string) {
  await checkPermission(ROLES_ACCESO_TOTAL); // Solo admin borra tipos
  const supabase = await createClient();
  const { error } = await supabase
    .from("tipos_actividades")
    .delete()
    .eq("id", id);

  if (error)
    return {
      success: false,
      message: "No se puede eliminar porque hay actividades usando este tipo.",
    };

  revalidatePath("/actividades/tipos");
  revalidatePath("/actividades/calendario");
  return { success: true, message: "Tipo eliminado." };
}

// --- ACTUALIZAR: getTiposActividades (Para traer más datos) ---
export async function getTiposActividadesCompletos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tipos_actividades")
    .select("*")
    .order("nombre");

  if (error) return [];
  return data;
}

/**
 * Obtiene la lista de miembros y su estado de asistencia para una actividad.
 * Si ya se tomó lista, devuelve los estados guardados. Si no, todos en false.
 */
export async function getListaAsistencia(
  actividadId: string
): Promise<MiembroParaAsistencia[]> {
  const supabase = await createClient();

  // 1. Obtener todos los miembros activos
  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id, nombre_completo, foto_url")
    .eq("estado_membresia", "activo")
    .order("nombre_completo");

  if (miembrosError) {
    console.error("Error fetching miembros:", miembrosError);
    return [];
  }

  // 2. Obtener registros de asistencia existentes para esta actividad
  const { data: asistenciaExistente, error: asisError } = await supabase
    .from("asistencia_actividades")
    .select("miembro_id, presente")
    .eq("actividad_id", actividadId);

  if (asisError) {
    console.error("Error fetching asistencia:", asisError);
    return [];
  }

  // 3. Mapear y combinar (Merge)
  // Creamos un Map para búsqueda rápida
  const asistenciaMap = new Map(
    asistenciaExistente?.map((a) => [a.miembro_id, a.presente])
  );

  return miembros.map((m) => ({
    id: m.id,
    nombre_completo: m.nombre_completo,
    foto_url: m.foto_url,
    // Si existe en el mapa, usar ese valor. Si no, false.
    presente: asistenciaMap.get(m.id) || false,
  }));
}

/**
 * Guarda la asistencia en lote.
 * Usa 'upsert' para manejar inserciones y actualizaciones a la vez.
 */
export async function guardarAsistencia(data: RegistroAsistenciaFormValues) {
  const { user } = await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const validated = registroAsistenciaSchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: "Datos inválidos." };

  const { actividad_id, asistencias } = validated.data;

  // Preparamos los datos para UPSERT
  // Solo necesitamos enviar los que están 'presente = true' o los que cambiaron,
  // pero para simplificar y limpiar, enviaremos el estado explícito.

  // NOTA: La estrategia más limpia es borrar lo anterior e insertar lo nuevo,
  // O hacer un upsert masivo. Haremos Upsert.

  const recordsToUpsert = asistencias.map((a) => ({
    actividad_id,
    miembro_id: a.miembro_id,
    presente: a.presente,
    registrado_por: user.id,
    fecha_registro: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("asistencia_actividades")
    .upsert(recordsToUpsert, { onConflict: "actividad_id, miembro_id" });

  if (error) {
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath(`/actividades/${actividad_id}/asistencia`);
  return { success: true, message: "Asistencia registrada correctamente." };
}

export async function getActividadInfo(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actividades")
    .select("id, titulo, fecha_inicio")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching actividad info:", error);
    return null;
  }
  return data;
}
