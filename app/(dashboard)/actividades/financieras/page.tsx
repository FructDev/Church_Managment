import { getSessionInfo } from "@/lib/auth/utils";
import { getActividadesFinancieras } from "@/actions/actividades/financierasActions";
import { ActividadFinancieraCard } from "@/components/actividades/financieras/ActividadFinancieraCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
// Reutilizamos el formulario de actividades genérico, pero deberíamos pre-seleccionar el tipo
import { ActividadFormDialog } from "@/components/actividades/ActividadFormDialog";
import { getTiposActividades } from "@/actions/actividades/actividadesActions";
import { getSociedades } from "@/actions/estructura/sociedadesActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function ActividadesFinancierasPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage) return <div>Acceso Denegado</div>;

  const [actividades, tipos, sociedadesData, miembros] = await Promise.all([
    getActividadesFinancieras(),
    getTiposActividades(),
    getSociedades(),
    getMiembrosActivos(),
  ]);

  // Filtramos los tipos para pasar solo los financieros al crear desde aquí
  // (Opcional, pero mejora la UX)
  // const tiposFinancieros = tipos.filter(...)

  const sociedades = sociedadesData.map((s) => ({
    id: s.id,
    nombre: s.nombre,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Actividades Pro-Fondos</h1>
        <ActividadFormDialog
          mode="add"
          tipos={tipos}
          sociedades={sociedades}
          miembros={miembros}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Actividad
          </Button>
        </ActividadFormDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actividades.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No hay actividades financieras registradas.
          </p>
        )}
        {actividades.map((act) => (
          <ActividadFinancieraCard key={act.id} actividad={act} />
        ))}
      </div>
    </div>
  );
}
