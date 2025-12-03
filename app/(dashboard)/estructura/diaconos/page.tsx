/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getDiaconos,
  getMiembrosActivos,
} from "@/actions/estructura/diaconosActions";
import { DiaconosDataTable } from "@/components/estructura/diaconos/DiaconosDataTable";
import { columns } from "@/components/estructura/diaconos/columns";
import { Button } from "@/components/ui/button";
import { DiaconoFormDialog } from "@/components/estructura/diaconos/DiaconoFormDialog";
import { PlusCircle } from "lucide-react";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles"; // Importar roles

export default async function DiaconosPage() {
  // 1. Obtener sesión para definir permisos de UI
  const { profile } = await getSessionInfo();
  const canManage = ROLES_JERARQUIA_NO_FINANCIERA.includes(profile?.rol as any);

  // 2. Obtener datos (Las acciones ya validan lectura internamente)
  const [data, miembros] = await Promise.all([
    getDiaconos(),
    getMiembrosActivos(),
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Gestión de Diáconos</h1>

        {/* Botón condicional */}
        {canManage && (
          <DiaconoFormDialog mode="add" miembros={miembros}>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Diácono
            </Button>
          </DiaconoFormDialog>
        )}
      </div>

      <DiaconosDataTable
        columns={columns}
        data={data}
        miembros={miembros}
        canManage={canManage} // Pasamos el permiso a la tabla
      />
    </div>
  );
}
