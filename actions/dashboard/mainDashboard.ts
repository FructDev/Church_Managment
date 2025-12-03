"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
// Importamos la lista amplia que incluye a TODOS los que pueden ver el dashboard
import { ROLES_CONSULTA } from "@/lib/auth/roles";

export async function getExecutiveDashboardData() {
  // 1. Seguridad: Usamos el grupo global de consulta
  // Esto incluye: Admin, Pastor, Tesorero, Secretarios, Comités, etc.
  await checkPermission(ROLES_CONSULTA);

  const supabase = await createClient();
  const now = new Date();

  // Fechas para el mes actual
  const startMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const endMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  // Fechas para tendencias (6 meses atrás)
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1
  ).toISOString();

  // 2. EJECUCIÓN PARALELA
  const [
    miembrosResult,
    transaccionesMes,
    diezmosMes,
    proximasActividades,
    transaccionesHistoricas,
    cumpleaneros,
    saldosCuentas,
    saldosCajas,
  ] = await Promise.all([
    // A. Miembros
    supabase.from("miembros").select("estado_membresia, es_bautizado"),

    // B. Finanzas Mes
    supabase
      .from("transacciones")
      .select("tipo, monto")
      .gte("fecha", startMonth)
      .lte("fecha", endMonth),

    // C. Diezmos Mes
    supabase
      .from("diezmos")
      .select("total_recibido")
      .gte("fecha_distribucion", startMonth)
      .lte("fecha_distribucion", endMonth)
      .eq("distribuido", true),

    // D. Agenda (Próximos 3)
    supabase
      .from("actividades")
      .select(
        "id, titulo, fecha_inicio, ubicacion, tipo:tipos_actividades(color, nombre)"
      )
      .gte("fecha_inicio", now.toISOString())
      .neq("estado", "cancelada")
      .order("fecha_inicio", { ascending: true })
      .limit(3),

    // E. Gráfica Histórica
    supabase
      .from("transacciones")
      .select("fecha, tipo, monto")
      .gte("fecha", sixMonthsAgo)
      .order("fecha", { ascending: true }),

    // F. Cumpleañeros
    supabase
      .from("miembros")
      .select("id, nombre_completo, fecha_nacimiento")
      .eq("estado_membresia", "activo"),

    // G. Saldos Bancos
    supabase
      .from("cuentas_bancarias")
      .select("nombre, saldo_actual")
      .eq("activa", true),

    // H. Saldos Cajas
    supabase
      .from("caja_chica")
      .select("nombre, monto_disponible")
      .eq("estado", "activo"),
  ]);

  // --- 3. PROCESAMIENTO ---

  // Membresía
  const totalMiembros = miembrosResult.data?.length || 0;
  const activos =
    miembrosResult.data?.filter((m) => m.estado_membresia === "activo")
      .length || 0;
  const bautizados =
    miembrosResult.data?.filter((m) => m.es_bautizado).length || 0;
  const porcentajeBautizados =
    activos > 0 ? Math.round((bautizados / activos) * 100) : 0;

  // Finanzas del Mes
  let ingresosOperativos = 0;
  let egresosOperativos = 0;
  transaccionesMes.data?.forEach((t) => {
    if (t.tipo === "ingreso") ingresosOperativos += t.monto;
    if (t.tipo === "egreso") egresosOperativos += t.monto;
  });
  const totalDiezmosMes =
    diezmosMes.data?.reduce((acc, d) => acc + d.total_recibido, 0) || 0;

  // Gráfica de Tendencia
  const historyMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-ES", { month: "short" });
    historyMap.set(key, {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      Ingresos: 0,
      Egresos: 0,
    });
  }

  transaccionesHistoricas.data?.forEach((t) => {
    const key = new Date(t.fecha).toLocaleDateString("es-ES", {
      month: "short",
    });
    if (historyMap.has(key)) {
      const entry = historyMap.get(key);
      if (t.tipo === "ingreso") entry.Ingresos += t.monto;
      if (t.tipo === "egreso") entry.Egresos += t.monto;
    }
  });

  // Cumpleañeros
  const currentMonthIndex = now.getMonth();
  const birthdays =
    cumpleaneros.data
      ?.filter((m) => {
        if (!m.fecha_nacimiento) return false;
        // Usamos UTC Date para evitar problemas de zona horaria en la fecha de nacimiento
        const d = new Date(m.fecha_nacimiento);
        // getUTCMonth es lo más seguro si la fecha viene como YYYY-MM-DD puro
        return d.getUTCMonth() === currentMonthIndex;
      })
      .map((m) => ({
        id: m.id,
        nombre_completo: m.nombre_completo,
        dia: new Date(m.fecha_nacimiento!).getUTCDate(),
      }))
      .sort((a, b) => a.dia - b.dia)
      .slice(0, 5) || [];

  // Saldos Consolidados
  const accounts = [
    ...(saldosCajas.data?.map((c) => ({
      name: c.nombre,
      amount: c.monto_disponible,
      type: "Caja",
    })) || []),
    ...(saldosCuentas.data?.map((c) => ({
      name: c.nombre,
      amount: c.saldo_actual,
      type: "Banco",
    })) || []),
  ];

  return {
    membresia: {
      total: totalMiembros,
      activos,
      bautizados,
      porcentajeBautizados,
    },
    finanzas: {
      ingresosOperativos,
      egresosOperativos,
      diezmos: totalDiezmosMes,
      balanceOperativo: ingresosOperativos - egresosOperativos,
    },
    agenda: proximasActividades.data || [],
    grafica: Array.from(historyMap.values()),
    birthdays,
    accounts,
  };
}
