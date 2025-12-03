/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSessionInfo } from "@/lib/auth/utils";
import {
  getTiposActividadesCompletos,
  deleteTipoActividad,
} from "@/actions/actividades/actividadesActions";
import { TipoActividadFormDialog } from "@/components/actividades/TipoActividadFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Edit } from "lucide-react";
// Necesitamos un componente cliente para borrar, o podemos hacer un form simple
import { TiposList } from "@/components/actividades/TiposList"; // Lo creamos abajo

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function TiposActividadesPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  if (!canManage) return <div>Acceso Denegado</div>;

  const tipos = await getTiposActividadesCompletos();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tipos de Actividades</h1>
        <TipoActividadFormDialog mode="add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Tipo
          </Button>
        </TipoActividadFormDialog>
      </div>

      <TiposList tipos={tipos} />
    </div>
  );
}
