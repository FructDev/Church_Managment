"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export type EstadisticasMembresia = {
  total: number;
  porGenero: { name: string; value: number; fill: string }[];
  porEstadoCivil: { name: string; value: number; fill: string }[];
  porMembresia: { name: string; value: number; fill: string }[];
  cumpleanerosMes: {
    id: string;
    nombre: string;
    dia: number;
    fecha_nacimiento: string;
    edad: number;
  }[];
};

export async function getEstadisticasMembresia(): Promise<EstadisticasMembresia> {
  // Convertimos 'pastor' a string para evitar error de tipado si no está en el enum del guard
  await checkPermission(ROLES_ADMINISTRATIVOS);

  const supabase = await createClient();

  // 1. OBTENER MIEMBROS
  // --- CORRECCIÓN: Eliminamos 'genero' de la lista de select ---
  const { data: miembros, error } = await supabase
    .from("miembros")
    .select(
      "id, nombre_completo, estado_civil, estado_membresia, fecha_nacimiento"
    );

  if (error || !miembros) {
    console.error("Error fetching miembros stats:", error);
    return {
      total: 0,
      porGenero: [],
      porEstadoCivil: [],
      porMembresia: [],
      cumpleanerosMes: [],
    };
  }

  // 2. Procesar Estado Membresía
  const memMap = new Map<string, number>();
  miembros.forEach((m) => {
    const estado = m.estado_membresia || "Desconocido";
    memMap.set(estado, (memMap.get(estado) || 0) + 1);
  });
  const porMembresia = Array.from(memMap.entries()).map(([name, value], i) => ({
    name,
    value,
    fill: ["#22c55e", "#eab308", "#ef4444"][i % 3] || "#8884d8",
  }));

  // 3. Procesar Estado Civil
  const civMap = new Map<string, number>();
  miembros.forEach((m) => {
    // Normalizamos el texto para que se vea bien (capitalizar primera letra)
    const rawEstado = m.estado_civil || "No registrado";
    const estado = rawEstado.charAt(0).toUpperCase() + rawEstado.slice(1);

    civMap.set(estado, (civMap.get(estado) || 0) + 1);
  });

  const porEstadoCivil = Array.from(civMap.entries()).map(
    ([name, value], i) => ({
      name,
      value,
      fill:
        ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"][i % 5] ||
        "#8884d8",
    })
  );

  // 4. Procesar Cumpleaños del Mes Actual
  const currentMonth = new Date().getMonth(); // 0-11 (Enero es 0)

  const cumpleaneros = miembros
    .filter((m) => {
      if (!m.fecha_nacimiento) return false;
      // Creamos la fecha asegurando que se interprete correctamente
      const fecha = new Date(m.fecha_nacimiento);
      // getMonth() devuelve el mes local, asegúrate de que coincida con tu zona horaria
      // Si usas UTC en BD: fecha.getUTCMonth()
      return fecha.getUTCMonth() === currentMonth;
    })
    .map((m) => {
      const fecha = new Date(m.fecha_nacimiento!);
      const today = new Date();
      let edad = today.getFullYear() - fecha.getFullYear();
      // Ajuste de edad si aún no ha cumplido este año
      if (
        today <
        new Date(today.getFullYear(), fecha.getUTCMonth(), fecha.getUTCDate())
      ) {
        edad--;
      }
      return {
        id: m.id,
        nombre: m.nombre_completo,
        dia: fecha.getUTCDate(), // Usamos UTC para ser consistentes con la BD
        fecha_nacimiento: m.fecha_nacimiento!,
        edad: edad < 0 ? 0 : edad, // Evitar edades negativas por error
      };
    })
    .sort((a, b) => a.dia - b.dia); // Ordenar por día del mes (1, 2, 3...)

  return {
    total: miembros.length,
    porGenero: [], // Lo dejamos vacío porque no tenemos el dato
    porEstadoCivil,
    porMembresia,
    cumpleanerosMes: cumpleaneros,
  };
}

/**
 * Obtiene la lista simple de miembros para el directorio impreso.
 */
export async function getDirectorio() {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("miembros")
    .select("nombre_completo, telefono, email, direccion, estado_membresia")
    .eq("estado_membresia", "activo") // Opcional: Solo activos
    .order("nombre_completo");

  if (error) {
    console.error("Error obteniendo directorio:", error);
    return [];
  }

  return data || [];
}

// --- 3. ESTADÍSTICAS DE ASISTENCIA ---
export async function getEstadisticasAsistencia() {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  // Obtener los últimos 10 cultos/actividades con asistencia registrada
  // Usamos !inner para asegurar que solo traiga actividades con registros
  const { data, error } = await supabase
    .from("actividades")
    .select(
      `
      id, 
      titulo, 
      fecha_inicio,
      tipo:tipos_actividades(nombre, color),
      asistencia:asistencia_actividades(count)
    `
    )
    .order("fecha_inicio", { ascending: false }) // Los más recientes primero
    .limit(12); // Últimas 12 actividades

  if (error) {
    console.error("Error asistencia stats:", error);
    return [];
  }

  // Formatear para gráfica (invertimos el orden para que sea cronológico izq->der)
  return data.reverse().map((act) => ({
    fecha: new Date(act.fecha_inicio).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    }),
    titulo: act.titulo,
    asistencia: act.asistencia[0]?.count || 0,
    color: act.tipo?.color || "#8884d8",
  }));
}

// --- 4. REPORTE DE ACTIVIDADES ---
export async function getReporteActividades(year: number) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("actividades")
    .select(
      `
      id, titulo, fecha_inicio, estado,
      tipo:tipos_actividades(nombre),
      asistencia:asistencia_actividades(count)
    `
    )
    .gte("fecha_inicio", startDate)
    .lte("fecha_inicio", endDate)
    .order("fecha_inicio", { ascending: false });

  if (error || !data) {
    return {
      lista: [],
      grafica: [],
      resumen: {
        total: 0,
        realizadas: 0,
        canceladas: 0,
        promedioAsistencia: 0,
      },
    };
  }

  // 1. Procesar Lista Plana
  const lista = data.map((a) => ({
    ...a,
    asistencia: a.asistencia[0]?.count || 0,
  }));

  // 2. Procesar Datos para Gráfica (Agrupado por Mes)
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const grafica = meses.map((nombreMes, index) => {
    const actividadesDelMes = lista.filter(
      (a) => new Date(a.fecha_inicio).getMonth() === index
    );
    const totalActividades = actividadesDelMes.length;
    const totalAsistencia = actividadesDelMes.reduce(
      (sum, a) => sum + a.asistencia,
      0
    );

    return {
      name: nombreMes,
      Cantidad: totalActividades,
      AsistenciaPromedio:
        totalActividades > 0
          ? Math.round(totalAsistencia / totalActividades)
          : 0,
    };
  });

  // 3. Calcular Resumen General
  const resumen = {
    total: lista.length,
    realizadas: lista.filter(
      (a) => a.estado === "completada" || a.estado === "programada"
    ).length,
    canceladas: lista.filter((a) => a.estado === "cancelada").length,
    promedioAsistencia: 0,
  };
  const totalAsistenciaAnual = lista.reduce(
    (acc, curr) => acc + curr.asistencia,
    0
  );
  resumen.promedioAsistencia =
    resumen.total > 0 ? Math.round(totalAsistenciaAnual / resumen.total) : 0;

  return { lista, resumen, grafica };
}
