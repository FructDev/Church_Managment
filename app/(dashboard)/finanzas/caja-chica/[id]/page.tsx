/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(dashboard)/finanzas/caja-chica/[id]/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getCajaChicaDetalle,
  getMovimientosCajaChica,
  getCajasChicas,
} from "@/actions/finanzas/cajaChicaActions";
import { getCuentasBancarias } from "@/actions/finanzas/cuentasBancariasActions";
import { MovimientoForm } from "@/components/finanzas/caja-chica/MovimientoForm";
import { MovimientosDataTable } from "@/components/finanzas/caja-chica/MovimientosDataTable";
import { movimientosColumns } from "@/components/finanzas/caja-chica/movimientos-columns";
import { FondoTransferForm } from "@/components/finanzas/caja-chica/FondoTransferForm"; // <-- ¡No olvides importar el formulario de transferencia!
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { notFound } from "next/navigation";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

// --- CORRECCIÓN PARA NEXT.JS 15/16 ---
export default async function CajaChicaDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  // 1. Esperar a que los params se resuelvan
  const params = await props.params;
  const id = params.id;
  // -------------------------------------

  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage)
    return <div className="w-full text-center p-10">Acceso Denegado.</div>;

  // 2. Fetch de datos en paralelo
  const [caja, movimientos, todasLasCajas, cuentas] = await Promise.all([
    getCajaChicaDetalle(id),
    getMovimientosCajaChica(id),
    getCajasChicas(), // Para transferencias entre cajas
    getCuentasBancarias(), // Para depósitos al banco
  ]);

  if (!caja) notFound();

  // 3. Filtrar la caja actual de la lista de destino
  const otrasCajas = todasLasCajas
    .filter((c) => c.id !== caja.id)
    .map((c) => ({ id: c.id, nombre: c.nombre }));

  // 4. Simplificar cuentas
  const cuentasSimples = cuentas.map((c) => ({ id: c.id, nombre: c.nombre }));

  // 5. UI: Progreso
  let progress = 0;
  if (caja.monto_asignado > 0) {
    progress = (caja.monto_disponible / caja.monto_asignado) * 100;
  }
  let progressColor = "bg-primary";
  if (progress < 25) progressColor = "bg-yellow-500";
  if (progress < 10) progressColor = "bg-destructive";

  return (
    <div className="w-full space-y-6">
      {/* Tarjeta Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl capitalize">
            {caja.nombre || "Caja"} - {caja.responsable?.nombre_completo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-4xl font-bold">
                {formatCurrency(caja.monto_disponible)}
              </p>
              <p className="text-sm text-muted-foreground">Disponible</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-muted-foreground">
                {formatCurrency(caja.monto_asignado)}
              </p>
              <p className="text-xs text-muted-foreground">Monto Asignado</p>
            </div>
          </div>
          <Progress
            value={progress}
            className={`h-3 [&>div]:${progressColor}`}
          />
        </CardContent>
      </Card>

      {/* Formulario de Transferencia (NUEVO: Lo añadimos aquí para que esté disponible) */}
      {caja.estado === "activo" && (
        <FondoTransferForm
          cajaOrigen={{ id: caja.id, nombre: caja.nombre }}
          otrasCajas={otrasCajas}
          cuentasBancarias={cuentasSimples}
        />
      )}

      {/* Formulario de Movimientos Normales */}
      {caja.estado === "activo" && (
        <MovimientoForm
          cajaChicaId={caja.id}
          cuentasBancarias={cuentasSimples}
          otrasCajas={otrasCajas}
        />
      )}

      {/* Tabla Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <MovimientosDataTable
            columns={movimientosColumns}
            data={movimientos}
            canManage={canManage}
            cajaChicaId={caja.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
