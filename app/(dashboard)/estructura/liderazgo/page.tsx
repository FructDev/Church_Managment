/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getLiderazgo,
  getMiembrosActivos,
} from "@/actions/estructura/liderazgoActions";
import { LiderazgoCard } from "@/components/estructura/LiderazgoCard";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/database.types";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "@/lib/auth/roles"; // Importar roles
import { getSessionInfo } from "@/lib/auth/utils";

type CargoEnum = Database["public"]["Enums"]["cargo_liderazgo"];

async function getCargosLiderazgoEnum(): Promise<CargoEnum[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_enum_values", {
    enum_type_name: "cargo_liderazgo",
  });
  if (error) return [];
  return data as CargoEnum[];
}

export default async function LiderazgoPage() {
  const { profile } = await getSessionInfo();

  // 1. Definir quién puede gestionar (Pastor, Co-Pastor, Admin...)
  const canManage = ROLES_JERARQUIA_NO_FINANCIERA.includes(profile?.rol as any);

  const [liderazgoData, miembrosData, cargosEnum] = await Promise.all([
    getLiderazgo(),
    getMiembrosActivos(),
    getCargosLiderazgoEnum(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {liderazgoData.length === 0 && (
        <p className="col-span-full text-muted-foreground">
          No se encontraron cargos de liderazgo.
        </p>
      )}

      {liderazgoData.map((item) => (
        <LiderazgoCard
          key={item.id}
          item={item}
          miembros={miembrosData}
          cargosEnum={cargosEnum}
          canManage={canManage} // <-- ¡IMPORTANTE! Pasar el permiso
        />
      ))}
    </div>
  );
}
