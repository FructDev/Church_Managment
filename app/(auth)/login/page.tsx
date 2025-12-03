// app/(auth)/login/page.tsx
import { LoginForm } from "@/components/forms/LoginForm";
// Importamos un icono de Lucide para el logo
import { Church } from "lucide-react";

export default function LoginPage() {
  return (
    // Usamos un fondo con un gradiente sutil
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      {/* Contenedor para centrar el logo y el formulario */}
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {/* 1. Branding / Logo */}
        <div className="flex items-center gap-2 text-primary">
          <Church className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">
            Gestión Congregación
          </span>
        </div>

        {/* 2. El Formulario */}
        <LoginForm />
      </div>
    </div>
  );
}
