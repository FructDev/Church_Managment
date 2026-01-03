// app/(dashboard)/finanzas/ingresos/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getIngresos,
  getCategoriasIngreso,
} from "@/actions/finanzas/ingresosActions";
import { IngresosDataTable } from "@/components/finanzas/ingresos/IngresosDataTable";
import { columns } from "@/components/finanzas/ingresos/columns";
import { IngresoFormDialog } from "@/components/finanzas/ingresos/IngresoFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getSelectoresFinancieros } from "@/actions/finanzas/globalSelects";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function IngresosPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  // Verificamos permisos para la página completa
  if (!canManage) {
    return (
      <div className="w-full text-center">
        <p className="text-lg text-destructive">Acceso Denegado.</p>
        <p className="text-muted-foreground">
          No tienes permisos para ver este módulo.
        </p>
      </div>
    );
  }

  const [ingresos, categorias, selectores] = await Promise.all([
    getIngresos(),
    getCategoriasIngreso(),
    getSelectoresFinancieros(),
  ]);

  const cajas = selectores.cajas.map((c) => ({
    id: c.id,
    nombre: c.nombre || "Caja sin nombre",
  }));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registro de Ingresos</h1>
        {canManage && (
          <IngresoFormDialog
            mode="add"
            categorias={categorias}
            cajas={cajas}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Ingreso
            </Button>
          </IngresoFormDialog>
        )}
      </div>

      <IngresosDataTable
        columns={columns}
        data={ingresos}
        categorias={categorias}
        canManage={canManage}
        pageCount={1} // (Placeholder, la acción 'getIngresos' aún no pagina)
        cajas={cajas}
      />
    </div>
  );
}
