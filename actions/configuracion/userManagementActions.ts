/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { type Database } from "@/lib/database.types";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/lib/validations/configuracion.schema";

type RolUsuario = Database["public"]["Enums"]["rol_usuario"];

export async function createUserForMember(data: CreateUserFormValues) {
  // Solo los roles de alto nivel pueden crear usuarios
  await checkPermission(["admin", "secretario_general", "pastor"]);

  const supabaseAdmin = createAdminClient();

  const validated = createUserSchema.safeParse(data);
  if (!validated.success) return { success: false, message: "Datos inválidos" };

  const { email, password, rol, miembro_id, nombre_completo } = validated.data;

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre_completo, rol },
    });

  if (authError)
    return { success: false, message: `Error Auth: ${authError.message}` };
  if (!authUser.user)
    return { success: false, message: "No se pudo crear usuario." };

  const supabase = await createClient();
  const rolBD = rol as RolUsuario;

  // Upsert profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authUser.user.id,
    rol: rolBD,
    miembro_id: miembro_id,
    nombre_completo: nombre_completo,
  } as any);

  if (profileError) console.error("Error perfil:", profileError);

  revalidatePath(`/miembros/${miembro_id}`);
  return { success: true, message: "Acceso creado exitosamente." };
}
