/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getComiteDetalle,
  getComiteMiembros,
} from "@/actions/estructura/comiteMiembrosActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";
import { columns } from "@/components/estructura/comites/miembros-columns";
import { MiembrosDataTable } from "@/components/estructura/comites/MiembrosDataTable";
import { MiembroComiteFormDialog } from "@/components/estructura/comites/MiembroComiteFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles";

export default async function ComiteDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // 1. Permisos UI
  const { profile } = await getSessionInfo();
  const canManage = ROLES_JERARQUIA_NO_FINANCIERA.includes(profile?.rol as any);

  // 2. Datos
  const [comite, miembrosComite, miembrosActivos] = await Promise.all([
    getComiteDetalle(id),
    getComiteMiembros(id),
    getMiembrosActivos(),
  ]);

  if (!comite) {
    notFound();
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize">
          Comité: {comite.nombre}
        </h1>

        {canManage && (
          <MiembroComiteFormDialog
            comiteId={comite.id}
            miembros={miembrosActivos}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Miembro
            </Button>
          </MiembroComiteFormDialog>
        )}
      </div>

      <p className="text-muted-foreground">
        {comite.descripcion || "Gestión de los miembros del comité."}
      </p>

      <MiembrosDataTable
        columns={columns}
        data={miembrosComite}
        comiteId={comite.id}
        canManage={canManage} // Pasamos permiso a la tabla
      />
    </div>
  );
}
