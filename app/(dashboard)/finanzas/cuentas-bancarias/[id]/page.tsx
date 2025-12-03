// app/(dashboard)/finanzas/cuentas-bancarias/[id]/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getCuentaBancariaDetalle,
  getMovimientosBancarios,
  getCuentasBancarias,
} from "@/actions/finanzas/cuentasBancariasActions";
import { MovimientoBancarioForm } from "@/components/finanzas/cuentas-bancarias/MovimientoBancarioForm";
import { MovimientosBancariosDataTable } from "@/components/finanzas/cuentas-bancarias/MovimientosBancariosDataTable";
import { movimientosBancariosColumns } from "@/components/finanzas/cuentas-bancarias/movimientos-bancarios-columns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { notFound } from "next/navigation";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function CuentaBancariaDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  // ✅ FIX Next.js 15
  const { id } = await props.params;

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

  const [cuenta, movimientos, todasLasCuentas] = await Promise.all([
    getCuentaBancariaDetalle(id),
    getMovimientosBancarios(id),
    getCuentasBancarias(),
  ]);

  if (!cuenta) {
    notFound();
  }

  const otrasCuentas = todasLasCuentas.filter((c) => c.id !== cuenta.id);

  return (
    <div className="w-full space-y-6">
      {/* 1. Tarjeta de Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl capitalize">{cuenta.nombre}</CardTitle>
          <CardDescription className="capitalize">
            {cuenta.banco} - {cuenta.tipo_cuenta}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {formatCurrency(cuenta.saldo_actual)}
          </p>
          <p className="text-lg text-muted-foreground">Saldo Actual</p>
        </CardContent>
      </Card>

      {/* 2. Formulario */}
      {cuenta.activa && (
        <MovimientoBancarioForm
          cuentaActual={cuenta}
          otrasCuentas={otrasCuentas}
        />
      )}

      {/* 3. Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <MovimientosBancariosDataTable
            columns={movimientosBancariosColumns}
            data={movimientos}
            canManage={canManage}
            cuentaId={cuenta.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
