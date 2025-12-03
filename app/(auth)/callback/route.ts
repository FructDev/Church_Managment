// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// Esta ruta maneja los callbacks de todos los flujos de Supabase Auth
// (Confirmación de email, Magic Link, Reseteo de contraseña, etc.)
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // 'next' es el parámetro que definimos en la Server Action
  // 'requestPasswordReset'
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Si el callback es exitoso y 'next' está definido
      // (ej. '/cambiar-password'), redirigir allí.
      if (next) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      // Fallback por si 'next' no está (ej. confirmación de email)
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    }
  }

  // Si hay un error o no hay código, redirigir a una página de error
  const redirectUrl = new URL("/login", requestUrl.origin);
  redirectUrl.searchParams.set(
    "error",
    "Enlace de recuperación inválido o expirado. Por favor, intente de nuevo."
  );
  return NextResponse.redirect(redirectUrl);
}
