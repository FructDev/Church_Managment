// actions/finanzas/summaryActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

const getMonthBounds = () => {
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).toISOString();
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).toISOString();
  return { startDate, endDate };
};

export async function getFinanzasSummary() {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();
  const { startDate, endDate } = getMonthBounds();

  // 1. Obtener Transacciones con su Categoría
  const { data: transacciones, error: transError } = await supabase
    .from("transacciones")
    .select(
      `
      tipo, 
      monto, 
      categoria: categorias_ingresos ( nombre )
    `
    )
    .gte("fecha", startDate)
    .lte("fecha", endDate);

  // 2. Obtener Saldos
  const { data: saldosCuentas } = await supabase
    .from("cuentas_bancarias")
    .select("saldo_actual")
    .eq("activa", true);

  const { data: saldosCajas } = await supabase
    .from("caja_chica")
    .select("monto_disponible")
    .eq("estado", "activo");

  if (transError) console.error(transError);

  // --- 3. PROCESAMIENTO DE DATOS (La Corrección) ---

  let totalDiezmos = 0;
  let totalEscuelaBiblica = 0;
  let totalOfrendasGenerales = 0;
  let totalIngresosOperativos = 0; // Ingresos que SÍ se pueden gastar
  let totalEgresos = 0;

  transacciones?.forEach((t) => {
    const monto = t.monto;
    const catNombre = t.categoria?.nombre?.toLowerCase() || "";

    if (t.tipo === "ingreso") {
      // A. Clasificamos los Ingresos
      if (catNombre.includes("diezmo")) {
        totalDiezmos += monto;
        // ¡NO sumamos esto al operativo!
      } else if (
        catNombre.includes("escuela") ||
        catNombre.includes("biblica")
      ) {
        totalEscuelaBiblica += monto;
        totalIngresosOperativos += monto; // Esto sí es operativo
      } else {
        // Ofrendas generales, pro-templo, etc.
        totalOfrendasGenerales += monto;
        totalIngresosOperativos += monto; // Esto sí es operativo
      }
    } else if (t.tipo === "egreso") {
      totalEgresos += monto;
    }
  });

  // 4. Cálculo de Saldos
  const saldoBancos =
    saldosCuentas?.reduce((acc, c) => acc + c.saldo_actual, 0) || 0;
  const saldoCajaChica =
    saldosCajas?.reduce((acc, c) => acc + c.monto_disponible, 0) || 0;

  // 5. Retornamos el objeto detallado
  return {
    // Totales Específicos (Lo que pediste)
    totalDiezmos, // Para mostrar, pero no afecta el balance operativo
    totalEscuelaBiblica,
    totalOfrendasGenerales, // Incluye todo lo que no es diezmo ni escuela

    // Totales Operativos (Para el balance real)
    totalIngresosOperativos, // (Escuela + Ofrendas + Otros) - Diezmos
    totalEgresosMes: totalEgresos,

    // Balance: Solo comparamos Ingresos Operativos vs Egresos Operativos
    balanceOperativo: totalIngresosOperativos - totalEgresos,

    // Saldos Reales (Dinero en mano)
    saldoTotal: saldoBancos + saldoCajaChica,
  };
}
