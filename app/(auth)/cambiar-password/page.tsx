// app/(auth)/cambiar-password/page.tsx
import { createClient } from "@/lib/supabase/server";
import { PasswordChangeForm } from "@/components/forms/PasswordChangeForm";
import { redirect } from "next/navigation";

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Esta página es SÓLO para usuarios que acaban de usar el enlace de reseteo.
  // La ruta de callback les dio una sesión temporal.
  // Si no hay sesión, significa que no vinieron del callback.
  if (!session) {
    redirect("/login?error=Acceso no autorizado");
  }

  // Si hay sesión, mostramos el formulario
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <PasswordChangeForm />
    </div>
  );
}
