/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import {
  congregacionSchema,
  categoriaFinancieraSchema,
} from "@/lib/validations/configuracion.schema";
import { revalidatePath } from "next/cache";

// --- 1. CONGREGACIÓN ---
export async function getConfiguracion() {
  const supabase = await createClient();
  const { data } = await supabase.from("configuracion").select("*").single();
  return data;
}

export async function updateConfiguracion(formData: FormData) {
  await checkPermission("admin");
  const supabase = await createClient();

  const rawData = Object.fromEntries(formData.entries());
  const logoFile = formData.get("logo_file") as File | null;

  const validated = congregacionSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: "Datos inválidos" };

  // 1. Subir Logo si existe
  let logo_url = undefined;
  if (logoFile && logoFile.size > 0) {
    const fileName = `logo-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("config")
      .upload(fileName, logoFile);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from("config")
        .getPublicUrl(fileName);
      logo_url = publicUrl.publicUrl;
    }
  }

  // 2. Actualizar Datos
  const updateData = {
    ...validated.data,
    logo_file: undefined, // No guardar esto en BD
    ...(logo_url && { logo_url }), // Solo actualizar si hay nuevo logo
  };

  // Usamos update sin WHERE porque solo hay 1 fila, pero por seguridad buscamos el ID si lo tuviéramos,
  // o actualizamos la única fila que existe.
  // Truco: Actualizar donde id no sea nulo (todas)
  const { error } = await supabase
    .from("configuracion")
    .update(updateData)
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return { success: false, message: error.message };

  revalidatePath("/configuracion");
  return { success: true, message: "Configuración actualizada" };
}

// --- 2. USUARIOS Y ROLES ---
export async function getUsuariosSistema() {
  await checkPermission("admin");
  const supabase = await createClient();
  // Obtenemos perfiles
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("nombre_completo");
  return data || [];
}

export async function updateUsuarioRol(userId: string, newRol: any) {
  await checkPermission("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ rol: newRol })
    .eq("id", userId);
  if (error) return { success: false, message: error.message };

  revalidatePath("/configuracion/usuarios");
  return { success: true, message: "Rol actualizado" };
}

// --- 3. CATEGORÍAS FINANCIERAS ---
export async function getTodasCategorias(tipo: "ingreso" | "egreso") {
  await checkPermission(["admin", "tesorero"]);
  const supabase = await createClient();
  const table =
    tipo === "ingreso" ? "categorias_ingresos" : "categorias_egresos";

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("nombre");

  if (error) return [];
  return data;
}

export async function upsertCategoria(tipo: "ingreso" | "egreso", data: any) {
  await checkPermission("admin");
  const supabase = await createClient();

  const table =
    tipo === "ingreso" ? "categorias_ingresos" : "categorias_egresos";
  const { id, ...fields } = data;

  let error;
  if (id) {
    ({ error } = await supabase.from(table).update(fields).eq("id", id));
  } else {
    ({ error } = await supabase.from(table).insert(fields));
  }

  if (error) return { success: false, message: error.message };

  revalidatePath("/configuracion/categorias");
  return { success: true, message: "Categoría guardada" };
}

// ¡NUEVA!
export async function deleteCategoria(tipo: "ingreso" | "egreso", id: string) {
  await checkPermission("admin");
  const supabase = await createClient();
  const table =
    tipo === "ingreso" ? "categorias_ingresos" : "categorias_egresos";

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    // Si falla por FK (está en uso), sugerimos desactivarla en lugar de borrarla
    if (error.code === "23503") {
      return {
        success: false,
        message:
          "No se puede eliminar porque ya se usó en transacciones. Intente desactivarla (Editar -> Activo: No).",
      };
    }
    return { success: false, message: error.message };
  }

  revalidatePath("/configuracion/categorias");
  return { success: true, message: "Categoría eliminada" };
}

// --- 4. RESPALDO (BACKUP LÓGICO JSON) ---
export async function downloadBackupJSON() {
  await checkPermission("admin");
  const supabase = await createClient();

  // Extraemos datos clave
  const [miembros, transacciones, diezmos] = await Promise.all([
    supabase.from("miembros").select("*"),
    supabase.from("transacciones").select("*"),
    supabase.from("diezmos").select("*"),
  ]);

  return {
    timestamp: new Date().toISOString(),
    miembros: miembros.data,
    transacciones: transacciones.data,
    diezmos: diezmos.data,
  };
}
