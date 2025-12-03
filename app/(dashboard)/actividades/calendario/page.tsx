// app/(dashboard)/actividades/calendario/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getActividadesPorRango,
  getTiposActividades,
} from "@/actions/actividades/actividadesActions";
import { getSociedades } from "@/actions/estructura/sociedadesActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions"; // Reutilizamos
import { CalendarioMensual } from "@/components/actividades/CalendarioMensual";
import { ActividadFormDialog } from "@/components/actividades/ActividadFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { GeneradorCalendarioButton } from "@/components/actividades/GeneradorCalendarioButton";

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function CalendarioPage() {
  const { profile } = await getSessionInfo();
  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth() - 2,
    1
  ).toISOString();
  const end = new Date(
    today.getFullYear(),
    today.getMonth() + 3,
    0
  ).toISOString();

  // Cargar datos en paralelo
  const [actividades, tipos, sociedadesData, miembros] = await Promise.all([
    getActividadesPorRango(start, end),
    getTiposActividades(),
    getSociedades(),
    getMiembrosActivos(),
  ]);

  // Simplificar sociedades
  const sociedades = sociedadesData.map((s) => ({
    id: s.id,
    nombre: s.nombre,
  }));

  return (
    <div className="w-full space-y-6 flex flex-col h-auto md:h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-2xl font-semibold">Calendario de Actividades</h1>

        {canManage && (
          // 2. Agrupamos los botones
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Botón de Generar Automático */}
            <GeneradorCalendarioButton />

            {/* Botón de Crear Manual */}
            <ActividadFormDialog
              mode="add"
              tipos={tipos}
              sociedades={sociedades}
              miembros={miembros}
            >
              <Button className="flex-1 sm:flex-none">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Actividad
              </Button>
            </ActividadFormDialog>
          </div>
        )}
      </div>

      <div className="grow md:overflow-hidden">
        <CalendarioMensual actividades={actividades} />
      </div>
    </div>
  );
}
