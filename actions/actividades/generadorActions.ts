/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";

type ActividadInsert = Database["public"]["Tables"]["actividades"]["Insert"];

// Configuración de la semana (Reglas de Negocio)
const PLAN_SEMANAL = {
  1: {
    titulo: "Culto de Oración en Hogares",
    tipo: "reunion",
    hora: "19:30",
    duracion: 90,
  }, // Lunes
  2: {
    titulo: "Culto Sociedad de Damas",
    tipo: "culto_sociedad",
    sociedad: "damas",
    hora: "19:30",
    duracion: 120,
  }, // Martes
  3: {
    titulo: "Culto de Evangelización",
    tipo: "culto_regular",
    hora: "19:30",
    duracion: 120,
  }, // Miércoles
  4: {
    titulo: "Culto Sociedad de Niños",
    tipo: "culto_sociedad",
    sociedad: "ninos",
    hora: "19:30",
    duracion: 90,
  }, // Jueves
  5: {
    titulo: "Escuela Bíblica",
    tipo: "culto_regular",
    hora: "19:30",
    duracion: 90,
  }, // Viernes
  6: {
    titulo: "Culto Sociedad de Jóvenes",
    tipo: "culto_sociedad",
    sociedad: "jovenes",
    hora: "19:00",
    duracion: 120,
  }, // Sábado
  0: {
    titulo: "Culto Dominical",
    tipo: "culto_regular",
    hora: "09:00",
    duracion: 120,
  }, // Domingo
};

/**
 * Genera automáticamente las actividades para un mes específico.
 */
export async function generarCalendarioMensual(year: number, month: number) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { data: tiposDB } = await supabase
    .from("tipos_actividades")
    .select("id, nombre, categoria");
  const { data: sociedadesDB } = await supabase
    .from("sociedades")
    .select("id, nombre");

  if (!tiposDB)
    return {
      success: false,
      message: "Error: No hay tipos de actividad configurados.",
    };

  const getTipoId = (categoria: string, titulo: string) => {
    const match =
      tiposDB.find((t) =>
        titulo.toLowerCase().includes(t.nombre.toLowerCase())
      ) || tiposDB.find((t) => t.categoria === categoria);
    return match?.id;
  };

  const getSociedadId = (nombreSociedad?: string) => {
    if (!nombreSociedad) return null;
    return (
      sociedadesDB?.find((s) => s.nombre.toLowerCase() === nombreSociedad)
        ?.id || null
    );
  };

  // 2. Generar fechas (Usando el tipo correcto)
  const activitiesToInsert: ActividadInsert[] = []; // <-- Tipado explícito
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    const dayOfWeek = date.getDay();
    // @ts-ignore
    const config = PLAN_SEMANAL[dayOfWeek];

    if (config) {
      const fechaInicio = new Date(date);
      const [hours, mins] = config.hora.split(":");
      fechaInicio.setHours(parseInt(hours), parseInt(mins), 0, 0);
      const fechaFin = new Date(
        fechaInicio.getTime() + config.duracion * 60000
      );

      const tipoId = getTipoId(config.tipo, config.titulo);

      if (tipoId) {
        activitiesToInsert.push({
          titulo: config.titulo,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          tipo_actividad_id: tipoId,
          sociedad_id: getSociedadId(config.sociedad),
          estado: "programada", // <-- Ahora TypeScript sabe que esto es válido
          ubicacion: "Templo Principal",
        });
      }
    }
    date.setDate(date.getDate() + 1);
  }

  if (activitiesToInsert.length > 0) {
    const { error } = await supabase
      .from("actividades")
      .insert(activitiesToInsert);
    if (error) return { success: false, message: error.message };
  }

  revalidatePath("/actividades/calendario");
  return {
    success: true,
    message: `Se han generado ${activitiesToInsert.length} actividades.`,
  };
}
