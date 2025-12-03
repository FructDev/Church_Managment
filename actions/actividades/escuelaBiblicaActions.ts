/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";
import {
  claseEbSchema,
  inscripcionEbSchema,
  type ClaseEbFormValues,
} from "@/lib/validations/actividades.schema";
import { revalidatePath } from "next/cache";

export type AlumnoInscrito = {
  id: string; // ID de la inscripción (no del miembro)
  fecha_inscripcion: string;
  miembro: {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
    telefono: string | null;
  } | null;
};

// 1. Obtener Clases con conteo de alumnos
export async function getClasesEB() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clases_eb")
    .select(
      `
      *,
      maestro: miembros!maestro_id ( nombre_completo, foto_url ),
      inscripciones: inscripciones_eb ( count )
    `
    )
    .order("orden")
    .order("nombre");

  if (error) return [];

  // Formatear el conteo
  return data.map((c) => ({
    ...c,
    total_alumnos: c.inscripciones?.[0]?.count || 0,
  }));
}

// 2. Crear/Editar Clase
export async function upsertClaseEB(data: ClaseEbFormValues) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const validated = claseEbSchema.safeParse(data);
  if (!validated.success) return { success: false, message: "Datos inválidos" };

  const { id, ...claseData } = validated.data;
  // Limpiar maestro_id si es string vacío
  if (!claseData.maestro_id) claseData.maestro_id = null;

  let error;
  if (id) {
    ({ error } = await supabase
      .from("clases_eb")
      .update(claseData)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("clases_eb").insert(claseData));
  }

  if (error) return { success: false, message: error.message };

  revalidatePath("/actividades/escuela-biblica");
  return { success: true, message: "Clase guardada." };
}

// 3. Inscribir Alumno
export async function inscribirAlumnoEB(claseId: string, miembroId: string) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { error } = await supabase
    .from("inscripciones_eb")
    .insert({ clase_id: claseId, miembro_id: miembroId });

  if (error) {
    if (error.code === "23505")
      return { success: false, message: "El miembro ya está en esta clase." };
    return { success: false, message: error.message };
  }

  revalidatePath(`/actividades/escuela-biblica/${claseId}`);
  return { success: true, message: "Alumno inscrito." };
}

// 4. Eliminar Alumno de Clase
export async function removerAlumnoEB(claseId: string, miembroId: string) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { error } = await supabase
    .from("inscripciones_eb")
    .delete()
    .eq("clase_id", claseId)
    .eq("miembro_id", miembroId);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/actividades/escuela-biblica/${claseId}`);
  return { success: true, message: "Alumno removido." };
}

/**
 * Obtiene el detalle de una clase y sus alumnos.
 */
export async function getDetalleClase(claseId: string) {
  const supabase = await createClient();

  // 1. Obtener datos de la clase
  const { data: clase, error: claseError } = await supabase
    .from("clases_eb")
    .select(
      `
      *,
      maestro: miembros!maestro_id ( nombre_completo, foto_url )
    `
    )
    .eq("id", claseId)
    .single();

  if (claseError || !clase) return null;

  // 2. Obtener alumnos inscritos
  const { data: inscripciones, error: inscError } = await supabase
    .from("inscripciones_eb")
    .select(
      `
      id,
      fecha_inscripcion,
      miembro: miembros (
        id, nombre_completo, foto_url, telefono
      )
    `
    )
    .eq("clase_id", claseId)
    .order("fecha_inscripcion", { ascending: false });

  if (inscError) {
    console.error(inscError);
    return { clase, alumnos: [] };
  }

  return {
    clase,
    alumnos: inscripciones as unknown as AlumnoInscrito[],
  };
}
