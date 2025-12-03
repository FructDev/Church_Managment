// actions/auth/requestPasswordReset.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { passwordRecoverySchema } from "@/lib/validations/auth.schema";

type FormState = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(data: {
  email: string;
}): Promise<FormState> {
  // 1. Validar el email
  const validatedFields = passwordRecoverySchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Email inválido. Por favor verifique.",
    };
  }

  const { email } = validatedFields.data;
  const supabase = await createClient();

  // 2. Obtener la URL de redirección (donde el usuario creará la nueva contraseña)
  // ¡IMPORTANTE! Esta URL debe estar en tus "Redirect URLs" en Supabase Auth.
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/cambiar-password`;

  // 3. Llamar a Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    return {
      success: false,
      message: "Error al enviar el email. Intente de nuevo.",
    };
  }

  return {
    success: true,
    message: "Se ha enviado un enlace de recuperación a su email.",
  };
}
