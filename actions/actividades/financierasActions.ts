/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS, ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export type ActividadFinancieraResumen = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  estado: string;
  total_ingresos: number;
  total_egresos: number;
  balance: number;
};

/**
 * Obtiene las actividades marcadas como 'actividad_financiera'
 * y calcula sus balances en tiempo real.
 */
export async function getActividadesFinancieras(): Promise<
  ActividadFinancieraResumen[]
> {
  await checkPermission([...ROLES_FINANCIEROS, ...ROLES_ADMINISTRATIVOS]);
  const supabase = await createClient();

  // 1. Obtener actividades que son de tipo 'actividad_financiera'
  // (Asumimos que en tu tabla 'tipos_actividades', la columna 'categoria' es 'actividad_financiera')
  const { data: actividades, error } = await supabase
    .from("actividades")
    .select(
      `
      id, 
      titulo, 
      fecha_inicio, 
      estado,
      tipo: tipos_actividades!inner ( categoria )
    `
    )
    .eq("tipo.categoria", "actividad_financiera")
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error fetching actividades financieras:", error.message);
    return [];
  }

  // 2. Para cada actividad, sumar sus transacciones
  // (Esto podría optimizarse con una vista SQL, pero lo haremos en código por ahora)
  const resumenes = await Promise.all(
    actividades.map(async (act) => {
      const { data: transacciones } = await supabase
        .from("transacciones")
        .select("tipo, monto")
        .eq("actividad_id", act.id);

      let ingresos = 0;
      let egresos = 0;

      transacciones?.forEach((t) => {
        if (t.tipo === "ingreso") ingresos += t.monto;
        if (t.tipo === "egreso") egresos += t.monto;
      });

      return {
        id: act.id,
        titulo: act.titulo,
        fecha_inicio: act.fecha_inicio,
        estado: act.estado,
        total_ingresos: ingresos,
        total_egresos: egresos,
        balance: ingresos - egresos,
      };
    })
  );

  return resumenes;
}

export type TransaccionActividad = {
  id: string;
  fecha: string;
  tipo: "ingreso" | "egreso";
  monto: number;
  descripcion: string | null;
  categoria: string; // Nombre de la categoría (ingreso o egreso)
  metodo_pago: string;
};

export type DetalleActividadFinanciera = ActividadFinancieraResumen & {
  transacciones: TransaccionActividad[];
};

/**
 * Obtiene el detalle completo de una actividad financiera
 */
export async function getActividadFinancieraDetalle(
  id: string
): Promise<DetalleActividadFinanciera | null> {
  await checkPermission([...ROLES_FINANCIEROS, ...ROLES_ADMINISTRATIVOS]);
  const supabase = await createClient();

  // 1. Obtener la actividad
  const { data: actividad, error: actError } = await supabase
    .from("actividades")
    .select("id, titulo, fecha_inicio, estado")
    .eq("id", id)
    .single();

  if (actError || !actividad) return null;

  // 2. Obtener transacciones vinculadas
  const { data: transacciones, error: transError } = await supabase
    .from("transacciones")
    .select(
      `
      id, fecha, tipo, monto, descripcion, metodo_pago,
      cat_ingreso: categorias_ingresos(nombre),
      cat_egreso: categorias_egresos(nombre)
    `
    )
    .eq("actividad_id", id)
    .order("fecha", { ascending: false });

  if (transError) return null;

  // 3. Calcular totales y formatear lista
  let total_ingresos = 0;
  let total_egresos = 0;

  const listaTransacciones: TransaccionActividad[] = transacciones.map(
    (t: any) => {
      if (t.tipo === "ingreso") total_ingresos += t.monto;
      if (t.tipo === "egreso") total_egresos += t.monto;

      return {
        id: t.id,
        fecha: t.fecha,
        tipo: t.tipo,
        monto: t.monto,
        descripcion: t.descripcion,
        metodo_pago: t.metodo_pago,
        categoria:
          t.cat_ingreso?.nombre || t.cat_egreso?.nombre || "Sin categoría",
      };
    }
  );

  return {
    id: actividad.id,
    titulo: actividad.titulo,
    fecha_inicio: actividad.fecha_inicio,
    estado: actividad.estado,
    total_ingresos,
    total_egresos,
    balance: total_ingresos - total_egresos,
    transacciones: listaTransacciones,
  };
}
