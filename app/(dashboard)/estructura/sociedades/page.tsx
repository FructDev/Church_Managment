/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionInfo } from "@/lib/auth/utils";
import { getSociedades } from "@/actions/estructura/sociedadesActions";
import { SociedadCard } from "@/components/estructura/sociedades/SociedadCard";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles"; // <-- Importar roles

export default async function SociedadesPage() {
  const { profile } = await getSessionInfo();
  const sociedades = await getSociedades();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Sociedades</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sociedades.map((sociedad) => {
          // 1. Definir quién es "Jefe" (Pastor, Admin, Sec. General, etc.)
          const isJerarquia = ROLES_JERARQUIA_NO_FINANCIERA.includes(
            profile?.rol as any
          );

          // 2. Definir quién puede EDITAR (Solo la jerarquía)
          const canManage = isJerarquia;

          // 3. Definir quién puede VER
          // - La Jerarquía ve TODAS.
          // - El Secretario de Sociedad ve SOLO LA SUYA.
          const canView =
            isJerarquia ||
            (profile?.rol === "secretario_sociedad" &&
              profile.sociedad_id === sociedad.id) ||
            (profile?.rol === "presidente_sociedad" &&
              profile.sociedad_id === sociedad.id);

          // Si no puede ver esta tarjeta específica, no renderizamos nada
          if (!canView) return null;

          return (
            <SociedadCard
              key={sociedad.id}
              sociedad={sociedad}
              canManage={canManage}
            />
          );
        })}

        {sociedades.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No se encontraron sociedades activas.
          </p>
        )}
      </div>
    </div>
  );
}
