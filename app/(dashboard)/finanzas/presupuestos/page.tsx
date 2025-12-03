// app/(dashboard)/finanzas/presupuestos/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import { getPresupuestos } from "@/actions/finanzas/presupuestosActions";
import { PresupuestosDataTable } from "@/components/finanzas/presupuestos/PresupuestosDataTable";
import { columns } from "@/components/finanzas/presupuestos/columns";
import { PresupuestoFormDialog } from "@/components/finanzas/presupuestos/PresupuestoFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function PresupuestosPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage) {
    return (
      <div className="w-full text-center">
        <p className="text-lg text-destructive">Acceso Denegado.</p>
      </div>
    );
  }

  const data = await getPresupuestos();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Presupuestos</h1>
        {canManage && (
          <PresupuestoFormDialog mode="add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Presupuesto
            </Button>
          </PresupuestoFormDialog>
        )}
      </div>

      <PresupuestosDataTable
        columns={columns}
        data={data}
        canManage={canManage}
      />
    </div>
  );
}
