/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/estructura/comites/page.tsx
import { checkPermission } from "@/lib/auth/guards";
import { getComites } from "@/actions/estructura/comitesActions";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/database.types";
import { ComiteCard } from "@/components/estructura/comites/ComiteCard";
import { ComiteFormDialog } from "@/components/estructura/comites/ComiteFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getSessionInfo } from "@/lib/auth/utils";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles";

type ComiteTipo = Database["public"]["Enums"]["tipo_comite"];

// Función RPC para obtener el ENUM (como en 'liderazgo')
async function getTiposComiteEnum(): Promise<ComiteTipo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_enum_values", {
    enum_type_name: "tipo_comite",
  });
  if (error) {
    console.error("Error al obtener ENUM de comité:", error.message);
    return [];
  }
  if (data && Array.isArray(data)) {
    return data as ComiteTipo[];
  }
  return [];
}

export default async function ComitesPage() {
  const { profile } = await getSessionInfo();
  const canManage = ROLES_JERARQUIA_NO_FINANCIERA.includes(profile?.rol as any);

  const [comites, tiposComite] = await Promise.all([
    getComites(),
    getTiposComiteEnum(),
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Comités</h1>

        {canManage && (
          <ComiteFormDialog mode="add" tiposComite={tiposComite}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Comité
            </Button>
          </ComiteFormDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {comites.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No hay comités creados.
          </p>
        )}
        {comites.map((comite) => (
          <ComiteCard
            key={comite.id}
            comite={comite}
            tiposComite={tiposComite}
          />
        ))}
      </div>
    </div>
  );
}
