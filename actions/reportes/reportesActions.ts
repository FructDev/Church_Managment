/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_CONSULTA, ROLES_FINANCIEROS } from "@/lib/auth/roles";

export type DataPunto = {
  name: string; // Eje X (Fecha o Categoría)
  value: number; // Eje Y (Monto)
  fill?: string; // Color opcional
};

export type ReporteData = {
  porCategoria: DataPunto[];
  porTiempo: DataPunto[];
  total: number;
};

/**
 * Obtiene datos agregados de Ingresos o Egresos para un rango de fechas.
 */
export async function getReporteTransacciones(
  tipo: "ingreso" | "egreso",
  fechaInicio: string,
  fechaFin: string
): Promise<ReporteData> {
  await checkPermission(ROLES_CONSULTA);
  const supabase = await createClient();

  // 1. Obtener transacciones planas
  // Nota: Usamos los nombres de las relaciones que definimos en la BD
  const { data, error } = await supabase
    .from("transacciones")
    .select(
      `
      monto, 
      fecha,
      categoria: categorias_ingresos(nombre),
      categoria_egreso: categorias_egresos(nombre)
    `
    )
    .eq("tipo", tipo)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin);

  if (error) {
    console.error("Error reporte:", error);
    return { porCategoria: [], porTiempo: [], total: 0 };
  }

  // 2. Procesar: Agrupar por Categoría
  const catMap = new Map<string, number>();
  let total = 0;

  data.forEach((t: any) => {
    const catName =
      tipo === "ingreso" ? t.categoria?.nombre : t.categoria_egreso?.nombre;
    const name = catName || "Sin Categoría";
    const current = catMap.get(name) || 0;
    catMap.set(name, current + t.monto);
    total += t.monto;
  });

  const porCategoria: DataPunto[] = Array.from(catMap.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value); // Ordenar mayor a menor

  // 3. Procesar: Agrupar por Mes (Tiempo)
  const timeMap = new Map<string, number>();
  data.forEach((t: any) => {
    // Formato: "Ene 2025"
    const date = new Date(t.fecha);
    const key = date.toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const current = timeMap.get(key) || 0;
    timeMap.set(key, current + t.monto);
  });

  // Ordenar cronológicamente es complejo con Map, por simplicidad lo dejamos como viene o invertimos
  // Para hacerlo bien, deberíamos llenar los meses vacíos, pero por ahora:
  const porTiempo: DataPunto[] = Array.from(timeMap.entries()).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return { porCategoria, porTiempo, total };
}

/**
 * Genera el Estado de Resultados (Ingresos vs Egresos).
 */
export async function getEstadoResultados(year: number) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data } = await supabase
    .from("transacciones")
    .select("tipo, monto, fecha")
    .gte("fecha", startDate)
    .lte("fecha", endDate);

  if (!data) return [];

  // Agrupar por mes
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    return d.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" });
  });

  const resultado = meses.map((mesNombre, index) => {
    const mesData = data.filter(
      (t) => new Date(t.fecha).getUTCMonth() === index
    );
    const ingresos = mesData
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0);
    const egresos = mesData
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + t.monto, 0);

    return {
      name: mesNombre,
      Ingresos: ingresos,
      Egresos: egresos,
      Neto: ingresos - egresos,
    };
  });

  return resultado;
}
