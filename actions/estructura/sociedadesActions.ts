// actions/estructura/sociedadesActions.ts
"use server";
import { checkPermission } from "@/lib/auth/guards";
import {
  ROLES_ADMINISTRATIVOS,
  ROLES_JERARQUIA_NO_FINANCIERA,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  SociedadFormValues,
  sociedadSchema,
} from "@/lib/validations/estructura.schema";
import { revalidatePath } from "next/cache";

export type SociedadConteo = {
  id: string;
  nombre: string;
  descripcion: string | null; // <-- Corregido
  miembros_count: number;
};

/**
 * Obtiene todas las sociedades con un conteo de sus miembros.
 */
export async function getSociedades(): Promise<SociedadConteo[]> {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  // Usamos una vista o un RPC para el conteo.
  // Por simplicidad, aquí lo haremos con una consulta
  // que obtiene el conteo de una vista (si la tuviéramos).
  //
  // Vamos a hacerlo simple por ahora:
  const { data, error } = await supabase
    .from("sociedades")
    .select(
      `
      id,
      nombre,
      descripcion,
      miembros(count)
    `
    )
    .eq("activo", true);

  if (error) {
    console.error("Error al obtener sociedades:", error.message);
    return [];
  }

  // Mapeamos los datos para que coincidan con nuestro tipo
  return data.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    // 'miembros' será un array [ { count: 10 } ]
    miembros_count:
      (s.miembros as unknown as [{ count: number }])[0]?.count || 0,
  }));
}

/**
 * Acción para crear o actualizar una Sociedad.
 * NOTA: El 'nombre' (damas, caballeros) es único en la BD.
 * Esta acción principalmente actualiza la 'descripción'.
 */
export async function upsertSociedad(data: SociedadFormValues) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const validatedFields = sociedadSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  const { id, nombre, descripcion, activo } = validatedFields.data;
  const supabase = await createClient();

  const sociedadData = { nombre, descripcion, activo };

  let error;
  if (id) {
    // Actualizar
    ({ error } = await supabase
      .from("sociedades")
      .update(sociedadData)
      .eq("id", id));
  } else {
    // Crear (esto fallará si el 'nombre' ya existe)
    ({ error } = await supabase.from("sociedades").insert(sociedadData));
  }

  if (error) {
    if (error.code === "23505") {
      // Unique constraint error
      return { success: false, message: `La sociedad '${nombre}' ya existe.` };
    }
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/estructura/sociedades");
  return {
    success: true,
    message: `Sociedad ${id ? "actualizada" : "creada"}.`,
  };
}

/**
 * Elimina una sociedad.
 * (ADVERTENCIA: Esto puede causar errores si hay miembros
 * o directivas asignadas, debido a las FK constraints).
 */
export async function deleteSociedad(id: string) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const supabase = await createClient();
  const { error } = await supabase.from("sociedades").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/estructura/sociedades");
  return { success: true, message: "Sociedad eliminada." };
}

export type ResumenSociedad = {
  proximoCulto: {
    // <-- El nombre en el Tipo
    id: string;
    titulo: string;
    fecha_inicio: string;
  } | null;
  historial: {
    id: string;
    fecha: string;
    titulo: string;
    asistencia: number;
  }[];
  seguimiento: {
    miembro_id: string;
    nombre: string;
    foto_url: string | null;
    telefono: string | null;
    ultima_asistencia: string | null;
    estado_alerta: "verde" | "amarillo" | "rojo";
  }[];
};

export async function getSociedadDashboard(
  sociedadId: string
): Promise<ResumenSociedad> {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Buscar Próximo Culto
  const { data: proximo } = await supabase
    .from("actividades")
    .select("id, titulo, fecha_inicio")
    .eq("sociedad_id", sociedadId) // Filtrar por sociedad
    .gte("fecha_inicio", now)
    .order("fecha_inicio", { ascending: true })
    .limit(1)
    .single();

  // 2. Buscar Historial (Últimos 5)
  const { data: pasados } = await supabase
    .from("actividades")
    .select(
      `
      id, titulo, fecha_inicio,
      asistencia: asistencia_actividades(count)
    `
    )
    .eq("sociedad_id", sociedadId)
    .lt("fecha_inicio", now)
    .order("fecha_inicio", { ascending: false })
    .limit(5);

  const historial =
    pasados?.map((p) => ({
      id: p.id,
      fecha: p.fecha_inicio,
      titulo: p.titulo,
      asistencia: p.asistencia[0]?.count || 0,
    })) || [];

  // 3. Análisis de Seguimiento (La parte compleja)
  // A. Obtener todos los miembros de esta sociedad
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre_completo, foto_url, telefono")
    .eq("sociedad_id", sociedadId)
    .eq("estado_membresia", "activo");

  // B. Obtener la última asistencia de cada uno en actividades DE ESTA SOCIEDAD
  // Nota: Esto idealmente se hace con una vista SQL para rendimiento,
  // pero lo haremos en código por ahora.
  const seguimiento = await Promise.all(
    (miembros || []).map(async (m) => {
      const { data: lastAtt } = await supabase
        .from("asistencia_actividades")
        .select("fecha_registro, actividad:actividades(sociedad_id)")
        .eq("miembro_id", m.id)
        .eq("presente", true)
        .eq("actividad.sociedad_id", sociedadId) // Solo cuenta si vino a ESTA sociedad
        .order("fecha_registro", { ascending: false })
        .limit(1)
        .single();

      const lastDate = lastAtt?.fecha_registro
        ? new Date(lastAtt.fecha_registro)
        : null;
      let alerta: "verde" | "amarillo" | "rojo" = "rojo"; // Por defecto rojo (nunca vino)

      if (lastDate) {
        const diffDays = Math.floor(
          (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
        );
        if (diffDays <= 14) alerta = "verde";
        else if (diffDays <= 30) alerta = "amarillo";
        else alerta = "rojo";
      }

      return {
        miembro_id: m.id,
        nombre: m.nombre_completo,
        foto_url: m.foto_url,
        telefono: m.telefono,
        ultima_asistencia: lastDate?.toISOString() || null,
        estado_alerta: alerta,
      };
    })
  );

  // Ordenar: Rojos primero
  seguimiento.sort((a, b) => {
    const map = { rojo: 0, amarillo: 1, verde: 2 };
    return map[a.estado_alerta] - map[b.estado_alerta];
  });

  return {
    proximoCulto: proximo || null, // <-- Usamos la clave correcta
    historial,
    seguimiento,
  };
}
