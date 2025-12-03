// app/(dashboard)/finanzas/cuentas-bancarias/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import { getCuentasBancarias } from "@/actions/finanzas/cuentasBancariasActions";
import { CuentaBancariaCard } from "@/components/finanzas/cuentas-bancarias/CuentaBancariaCard";
import { CuentaBancariaFormDialog } from "@/components/finanzas/cuentas-bancarias/CuentaBancariaFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function CuentasBancariasPage() {
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

  const cuentas = await getCuentasBancarias();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Cuentas Bancarias</h1>
        {canManage && (
          <CuentaBancariaFormDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cuenta
            </Button>
          </CuentaBancariaFormDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cuentas.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No hay cuentas bancarias creadas.
          </p>
        )}
        {cuentas.map((cuenta) => (
          <CuentaBancariaCard key={cuenta.id} cuenta={cuenta} />
        ))}
      </div>
    </div>
  );
}
