// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const authRoutes = ["/login", "/recuperar-password", "/cambiar-password"];
  const publicRoutes = ["/"];

  // Si NO hay sesión y la ruta NO es pública/auth, redirigir a /login.
  if (
    !session &&
    !publicRoutes.includes(pathname) &&
    !authRoutes.includes(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si hay sesión, dejamos que el layout.tsx maneje la lógica de roles.
  // Si no hay sesión, dejamos que el usuario vea /login.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
