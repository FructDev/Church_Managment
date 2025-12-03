import { getSessionInfo } from "@/lib/auth/utils";
import { getActividadFinancieraDetalle } from "@/actions/actividades/financierasActions";
import { TransaccionesActividadTable } from "@/components/actividades/financieras/TransaccionesActividadTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Imports para los formularios y datos auxiliares
import { IngresoFormDialog } from "@/components/finanzas/ingresos/IngresoFormDialog";
import { EgresoFormDialog } from "@/components/finanzas/egresos/EgresoFormDialog";
import { getCategoriasIngreso } from "@/actions/finanzas/ingresosActions";
import { getCategoriasEgreso } from "@/actions/finanzas/egresosActions";
import { getCajasChicas } from "@/actions/finanzas/cajaChicaActions";
import { getCuentasBancarias } from "@/actions/finanzas/cuentasBancariasActions";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

// --- Compatible con Next.js 16 ---
export default async function ActividadFinancieraDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  // 1. Desempaquetar params
  const { id } = await props.params;

  const { profile } = await getSessionInfo();
  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  // 2. Cargar todos los datos necesarios en paralelo
  const [detalle, catIngreso, catEgreso, cajasRaw, cuentasRaw] =
    await Promise.all([
      getActividadFinancieraDetalle(id),
      getCategoriasIngreso(),
      getCategoriasEgreso(),
      getCajasChicas(), // Necesario para el selector de caja en Ingresos/Egresos
      getCuentasBancarias(), // Necesario para Egresos (pagar con banco)
    ]);

  if (!detalle) notFound();

  // 3. Mapear datos para los selectores
  const cajas = cajasRaw.map((c) => ({
    id: c.id,
    nombre: c.nombre || "Caja Sin Nombre",
  }));
  const cuentas = cuentasRaw.map((c) => ({ id: c.id, nombre: c.nombre }));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/actividades/financieras"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{detalle.titulo}</h1>
            <p className="text-muted-foreground capitalize">
              {new Date(detalle.fecha_inicio).toLocaleDateString("es-ES", {
                dateStyle: "long",
              })}
              {" • "} {detalle.estado}
            </p>
          </div>

          {/* Botones de Acción */}
          {canManage && (
            <div className="flex gap-2">
              {/* Botón REGISTRAR INGRESO (Venta/Ticket) */}
              <IngresoFormDialog
                mode="add"
                categorias={catIngreso}
                cajas={cajas} // <-- ¡CORRECCIÓN: Pasamos las cajas aquí!
                actividadId={id} // <-- Pasamos el ID del evento
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  <TrendingUp className="mr-2 h-4 w-4" /> Registrar Ingreso
                </Button>
              </IngresoFormDialog>

              {/* Botón REGISTRAR GASTO (Compra materiales) */}
              <EgresoFormDialog
                mode="add"
                categorias={catEgreso}
                cajas={cajas}
                cuentas={cuentas}
                actividadId={id} // <-- Pasamos el ID del evento
              >
                <Button variant="destructive">
                  <TrendingDown className="mr-2 h-4 w-4" /> Registrar Gasto
                </Button>
              </EgresoFormDialog>
            </div>
          )}
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(detalle.total_ingresos)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(detalle.total_egresos)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            detalle.balance >= 0
              ? "bg-green-50/50 border-green-200"
              : "bg-red-50/50 border-red-200"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(detalle.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Transacciones del Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <TransaccionesActividadTable data={detalle.transacciones} />
        </CardContent>
      </Card>
    </div>
  );
}
