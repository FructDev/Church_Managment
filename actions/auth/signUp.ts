// actions/auth/signUp.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth.schema";

type FormState = { success: boolean; message: string };

export async function signUp(data: RegisterFormValues): Promise<FormState> {
  // 1. Proteger la acción: Solo 'admin' puede ejecutar esto.
  try {
    await checkPermission("admin");
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }

  // 2. Validar los datos
  const validatedFields = registerSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues[0]?.message || "Datos inválidos.",
    };
  }

  const { nombre_completo, email, password, rol } = validatedFields.data;

  // 3. Usar el cliente Admin de Supabase para crear el usuario
  // (Usamos el Service Role Key para bypassear RLS y crear usuarios confirmados)
  const supabaseAdmin = await createClient(true); // ¡Necesitaremos actualizar server.ts!

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Creamos el usuario ya confirmado
      user_metadata: {
        nombre_completo: nombre_completo,
      },
    });

  if (authError) {
    return { success: false, message: authError.message };
  }

  if (!authData.user) {
    return { success: false, message: "No se pudo crear el usuario." };
  }

  // 4. Insertar en 'profiles' con el rol correcto
  // (El trigger se ejecuta, pero lo actualizamos para que ponga el rol correcto)
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ rol: rol }) // Actualizamos el rol que el trigger 'handle_new_user' acaba de crear
    .eq("id", authData.user.id);

  if (profileError) {
    // El usuario auth existe, pero el perfil falló.
    return {
      success: false,
      message: `Usuario creado, pero error al asignar rol: ${profileError.message}`,
    };
  }

  return {
    success: true,
    message: `Usuario ${nombre_completo} creado con éxito.`,
  };
}
