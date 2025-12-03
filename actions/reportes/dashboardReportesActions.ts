/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_CONSULTA } from "@/lib/auth/roles";

export async function getDashboardGeneralData() {
  await checkPermission(ROLES_CONSULTA);
  const supabase = await createClient();

  // Fechas para tendencias (Últimos 6 meses)
  const today = new Date();
  const sixMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  ).toISOString();

  // 1. Datos Financieros (Tendencia)
  const { data: transacciones } = await supabase
    .from("transacciones")
    .select("tipo, monto, fecha")
    .gte("fecha", sixMonthsAgo)
    .order("fecha", { ascending: true });

  // 2. Datos de Membresía (Totales)
  const { count: totalMiembros } = await supabase
    .from("miembros")
    .select("*", { count: "exact", head: true })
    .eq("estado_membresia", "activo");

  // 3. Datos de Asistencia (Últimos 4 eventos)
  const { data: asistenciaReciente } = await supabase
    .from("actividades")
    .select("fecha_inicio, asistencia:asistencia_actividades(count)")
    .order("fecha_inicio", { ascending: false })
    .limit(4);

  // --- PROCESAMIENTO DE DATOS ---

  // A. Agrupar Finanzas por Mes
  const mesesMap = new Map();
  // Inicializar los últimos 6 meses con 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-ES", { month: "short" }); // "nov"
    mesesMap.set(key, { name: key, Ingresos: 0, Egresos: 0 });
  }

  transacciones?.forEach((t) => {
    const date = new Date(t.fecha);
    const key = date.toLocaleDateString("es-ES", { month: "short" });
    if (mesesMap.has(key)) {
      const entry = mesesMap.get(key);
      if (t.tipo === "ingreso") entry.Ingresos += t.monto;
      if (t.tipo === "egreso") entry.Egresos += t.monto;
    }
  });
  const financialTrend = Array.from(mesesMap.values());

  // B. Calcular KPI del Mes Actual
  const currentMonthName = today.toLocaleDateString("es-ES", {
    month: "short",
  });
  const currentStats = mesesMap.get(currentMonthName) || {
    Ingresos: 0,
    Egresos: 0,
  };

  // C. Promedio de Asistencia
  const totalAsist =
    asistenciaReciente?.reduce(
      (acc, curr: any) => acc + (curr.asistencia[0]?.count || 0),
      0
    ) || 0;
  const avgAsistencia = asistenciaReciente?.length
    ? Math.round(totalAsist / asistenciaReciente.length)
    : 0;

  return {
    financialTrend,
    kpis: {
      ingresosMes: currentStats.Ingresos,
      egresosMes: currentStats.Egresos,
      balanceMes: currentStats.Ingresos - currentStats.Egresos,
      totalMiembros: totalMiembros || 0,
      avgAsistencia,
    },
  };
}
