"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_ADMINISTRATIVOS, ROLES_ACCESO_TOTAL } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";
// IMPORTANTE: Importamos el schema desde validaciones, NO lo definimos aquí
import {
  hogarSchema,
  type HogarFormValues,
} from "@/lib/validations/actividades.schema";

export async function getHogaresCulto() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hogares_culto")
    .select(
      `
      *,
      anfitrion: miembros!anfitrion_id(nombre_completo),
      lider: miembros!lider_id(nombre_completo)
    `
    )
    .order("nombre_familia");

  if (error) return [];
  return data;
}

export async function upsertHogarCulto(data: HogarFormValues) {
  await checkPermission(ROLES_ADMINISTRATIVOS);
  const supabase = await createClient();

  const validated = hogarSchema.safeParse(data);
  if (!validated.success) return { success: false, message: "Datos inválidos" };

  const { id, ...hogarData } = validated.data;

  // Limpiar IDs vacíos para que la BD los tome como NULL
  const dataToSave = {
    ...hogarData,
    anfitrion_id: hogarData.anfitrion_id || null,
    lider_id: hogarData.lider_id || null,
  };

  let error;
  if (id) {
    ({ error } = await supabase
      .from("hogares_culto")
      .update(dataToSave)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("hogares_culto").insert(dataToSave));
  }

  if (error) return { success: false, message: error.message };

  revalidatePath("/actividades/cultos-hogares");
  return { success: true, message: "Hogar registrado correctamente." };
}

export async function deleteHogarCulto(id: string) {
  await checkPermission(ROLES_ACCESO_TOTAL);
  const supabase = await createClient();
  const { error } = await supabase.from("hogares_culto").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/actividades/cultos-hogares");
  return { success: true, message: "Hogar eliminado." };
}
