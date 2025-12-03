/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionInfo } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { getChurchConfig } from "@/actions/layoutActions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificación de Sesión
  const { user, profile, error } = await getSessionInfo();

  // Si falla la sesión, redirigir a login
  if (error || !user || !profile) {
    redirect("/login?error=auth_failed");
  }

  // 2. Obtener Configuración de la Iglesia
  // (Usamos try/catch implícito o valores por defecto en la acción para que no rompa el layout)
  const churchConfig = await getChurchConfig();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* BARRA LATERAL */}
      <Sidebar
        userRole={profile.rol}
        // Pasamos la configuración visual
        logoUrl={churchConfig?.logo_url}
        churchName={churchConfig?.nombre_iglesia}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
        <Header
          // Usamos los datos del perfil que ya obtuvimos
          userName={profile.nombre_completo}
          userRole={profile.rol}
          userEmail={user.email}
          // Usamos la configuración de la iglesia
          churchName={churchConfig?.nombre_iglesia}
          churchLogo={churchConfig?.logo_url}
          // Asumimos que profile puede tener foto (si no, será undefined)
          userAvatar={(profile as any).foto_url}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
