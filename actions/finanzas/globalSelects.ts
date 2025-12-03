"use server";

import { createClient } from "@/lib/supabase/server";

export type SelectorOption = { id: string; nombre: string };

/**
 * Obtiene todas las listas necesarias para los formularios financieros
 * en una sola llamada eficiente, o individualmente.
 */
export async function getSelectoresFinancieros() {
  const supabase = await createClient();

  const [categoriasIngreso, categoriasEgreso, cajas, cuentas] =
    await Promise.all([
      // 1. Categorías Ingreso
      supabase
        .from("categorias_ingresos")
        .select("id, nombre")
        .eq("activo", true)
        .order("orden"),
      // 2. Categorías Egreso
      supabase
        .from("categorias_egresos")
        .select("id, nombre")
        .eq("activo", true)
        .order("orden"),
      // 3. Cajas Chicas (Solo activas)
      supabase
        .from("caja_chica")
        .select("id, nombre")
        .eq("estado", "activo")
        .order("nombre"),
      // 4. Cuentas Bancarias (Solo activas)
      supabase
        .from("cuentas_bancarias")
        .select("id, nombre")
        .eq("activa", true)
        .order("nombre"),
    ]);

  return {
    categoriasIngreso: (categoriasIngreso.data || []) as SelectorOption[],
    categoriasEgreso: (categoriasEgreso.data || []) as SelectorOption[],
    cajas: (cajas.data || []) as SelectorOption[],
    cuentas: (cuentas.data || []) as SelectorOption[],
  };
}
