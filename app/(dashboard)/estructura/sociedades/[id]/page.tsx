import { getSessionInfo } from "@/lib/auth/utils";
import {
  getSociedadDetalle,
  getDirectiva,
} from "@/actions/estructura/directivasActions";
import { getSociedadDashboard } from "@/actions/estructura/sociedadesActions"; // La nueva acción
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions"; // Para el form de directiva
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SociedadDashboardTabs } from "@/components/estructura/sociedades/SociedadDashboardTabs";
import { DirectivaDataTable } from "@/components/estructura/directiva/DirectivaDataTable";
import { columns } from "@/components/estructura/directiva/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DirectivaFormDialog } from "@/components/estructura/directiva/DirectivaFormDialog";

// RPC Enum (reutilizado)
async function getCargosDirectivaEnum(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_enum_values", {
    enum_type_name: "cargo_directiva",
  });
  return data && Array.isArray(data) ? (data as string[]) : [];
}

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function SociedadDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { profile } = await getSessionInfo();

  // Carga de datos masiva
  const [sociedad, directiva, dashboardData, miembros, cargosEnum] =
    await Promise.all([
      getSociedadDetalle(id),
      getDirectiva(id),
      getSociedadDashboard(id), // Datos para las nuevas pestañas
      getMiembrosActivos(),
      getCargosDirectivaEnum(),
    ]);

  if (!sociedad) notFound();

  const canManage =
    ROLES_ADMINISTRATIVOS.includes(profile?.rol as any) ||
    (profile?.rol === "secretario_sociedad" && profile.sociedad_id === id);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold capitalize">{sociedad.nombre}</h1>
        <p className="text-muted-foreground">
          {sociedad.descripcion || "Centro de Mando"}
        </p>
      </div>

      <SociedadDashboardTabs
        data={dashboardData}
        // Pasamos la tabla de directiva como "children" para la 3ra pestaña
        childrenDirectiva={
          <div className="space-y-4">
            <div className="flex justify-end">
              {canManage && (
                <DirectivaFormDialog
                  mode="add"
                  sociedadId={id}
                  cargosEnum={cargosEnum}
                  miembros={miembros}
                >
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Directivo
                  </Button>
                </DirectivaFormDialog>
              )}
            </div>
            <DirectivaDataTable
              columns={columns}
              data={directiva}
              miembros={miembros}
              sociedadId={id}
              cargosEnum={cargosEnum}
              canManage={canManage}
            />
          </div>
        }
      />
    </div>
  );
}
