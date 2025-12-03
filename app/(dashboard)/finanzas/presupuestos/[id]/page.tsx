// app/(dashboard)/finanzas/presupuestos/[id]/page.tsx
import {
  getPresupuestoDetalle,
  getLineasPresupuesto,
  getCategoriasDisponibles,
} from "@/actions/finanzas/lineasPresupuestoActions";
import { getSessionInfo } from "@/lib/auth/utils";
import { LineaPresupuestoForm } from "@/components/finanzas/presupuestos/LineaPresupuestoForm";
import { LineasDataTable } from "@/components/finanzas/presupuestos/LineasDataTable";
import { lineasColumns } from "@/components/finanzas/presupuestos/lineas-columns";
import { notFound } from "next/navigation";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function PresupuestoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🟢 Next 16: se debe resolver el Promise manualmente
  const { id } = await params;

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

  // Obtenemos todos los datos necesarios en paralelo
  const [presupuesto, lineas, categoriasDisponibles] = await Promise.all([
    getPresupuestoDetalle(id),
    getLineasPresupuesto(id),
    getCategoriasDisponibles(id),
  ]);

  if (!presupuesto) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Presupuesto: {presupuesto.nombre} ({presupuesto.anio})
        </h1>
        <p className="text-muted-foreground">
          Gestione las líneas de gasto para este presupuesto.
        </p>
      </div>

      {/* Formulario para añadir nuevas líneas */}
      <LineaPresupuestoForm
        presupuestoId={presupuesto.id}
        categoriasDisponibles={categoriasDisponibles}
      />

      {/* Tabla de líneas existentes */}
      <LineasDataTable
        columns={lineasColumns}
        data={lineas}
        presupuestoId={presupuesto.id}
      />
    </div>
  );
}
