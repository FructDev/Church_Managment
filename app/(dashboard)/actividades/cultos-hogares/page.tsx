import { getSessionInfo } from "@/lib/auth/utils";
import {
  getHogaresCulto,
  deleteHogarCulto,
} from "@/actions/actividades/cultosHogaresActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";
// 1. IMPORTAR TIPOS
import { getTiposActividades } from "@/actions/actividades/actividadesActions";

import { HogarFormDialog } from "@/components/actividades/cultos/HogarFormDialog";
import { HogarList } from "@/components/actividades/cultos/HogarList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map } from "lucide-react";

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function CultosHogaresPage() {
  const { profile } = await getSessionInfo();
  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  // 2. OBTENER TODOS LOS DATOS
  const [hogares, miembros, tipos] = await Promise.all([
    getHogaresCulto(),
    getMiembrosActivos(),
    getTiposActividades(),
  ]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          Gestión de Cultos en Hogares
        </h1>

        {canManage && (
          <HogarFormDialog miembros={miembros}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Hogar
            </Button>
          </HogarFormDialog>
        )}
      </div>

      <p className="text-muted-foreground">
        Aquí administras las ubicaciones (células). Usa el botón
        &quot;Programar&quot; en cada tarjeta para crear el evento en el
        calendario.
      </p>

      <HogarList
        hogares={hogares}
        miembros={miembros}
        canManage={canManage}
        tipos={tipos} // 3. PASAR TIPOS A LA LISTA
      />
    </div>
  );
}
