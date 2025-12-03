import { getSessionInfo } from "@/lib/auth/utils";
import { getEgresos } from "@/actions/finanzas/egresosActions";
// Usamos la función global optimizada
import { getSelectoresFinancieros } from "@/actions/finanzas/globalSelects";

import { EgresosDataTable } from "@/components/finanzas/egresos/EgresosDataTable";
import { columns } from "@/components/finanzas/egresos/columns";
import { EgresoFormDialog } from "@/components/finanzas/egresos/EgresoFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function EgresosPage() {
  const { profile } = await getSessionInfo();

  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage) return <div>Acceso Denegado</div>;

  const [egresos, selectores] = await Promise.all([
    getEgresos(),
    getSelectoresFinancieros(),
  ]);

  // Mapeamos cajas para asegurar que tengan nombre
  const cajas = selectores.cajas.map((c) => ({
    id: c.id,
    nombre: c.nombre || "Caja",
  }));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registro de Egresos</h1>
        {canManage && (
          <EgresoFormDialog
            mode="add"
            categorias={selectores.categoriasEgreso}
            cajas={cajas}
            cuentas={selectores.cuentas}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Egreso
            </Button>
          </EgresoFormDialog>
        )}
      </div>

      <EgresosDataTable
        columns={columns}
        data={egresos}
        categorias={selectores.categoriasEgreso}
        cajas={cajas}
        cuentas={selectores.cuentas}
        canManage={canManage}
        pageCount={1}
      />
    </div>
  );
}
