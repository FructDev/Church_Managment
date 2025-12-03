// actions/auth/updatePassword.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { passwordChangeSchema } from "@/lib/validations/auth.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type FormState = {
  success: boolean;
  message: string;
};

export async function updatePassword(data: {
  password: string;
}): Promise<FormState> {
  const supabase = await createClient();

  // 1. Verificar que el usuario esté autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  // 2. Validar la contraseña (aunque Zod ya lo hizo)
  const validatedFields = passwordChangeSchema.safeParse({
    password: data.password,
    confirmPassword: data.password, // Solo para pasar la validación
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "La contraseña no cumple los requisitos.",
    };
  }

  // 3. Actualizar la contraseña del usuario
  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      success: false,
      message: "Error al actualizar la contraseña. Intente de nuevo.",
    };
  }

  // 4. Desloguear al usuario para que inicie sesión con la nueva contraseña
  await supabase.auth.signOut();

  return {
    success: true,
    message:
      "¡Contraseña actualizada exitosamente! Serás redirigido para iniciar sesión.",
  };
}
