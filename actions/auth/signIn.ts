// actions/auth/signIn.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type FormState = { success: boolean; message: string | null };

export async function signIn(data: LoginFormValues): Promise<FormState> {
  const validatedFields = loginSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Datos inválidos." };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
