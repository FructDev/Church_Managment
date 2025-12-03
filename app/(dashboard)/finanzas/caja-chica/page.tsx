// app/(dashboard)/finanzas/caja-chica/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import { getCajasChicas } from "@/actions/finanzas/cajaChicaActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions"; // Reutilizamos esta acción
import { CajaChicaCard } from "@/components/finanzas/caja-chica/CajaChicaCard";
import { CajaChicaFormDialog } from "@/components/finanzas/caja-chica/CajaChicaFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function CajaChicaPage() {
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

  const [cajas, miembros] = await Promise.all([
    getCajasChicas(),
    getMiembrosActivos(), // Para el <select> del formulario
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Cajas Chicas</h1>
        {canManage && (
          <CajaChicaFormDialog miembros={miembros}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Caja Chica
            </Button>
          </CajaChicaFormDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cajas.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No hay cajas chicas creadas.
          </p>
        )}
        {cajas.map((caja) => (
          <CajaChicaCard key={caja.id} caja={caja} />
        ))}
      </div>
    </div>
  );
}
