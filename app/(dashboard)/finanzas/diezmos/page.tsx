// app/(dashboard)/finanzas/diezmos/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import { getDiezmosResumenList } from "@/actions/finanzas/diezmosActions";
import { DiezmosDataTable } from "@/components/finanzas/diezmos/DiezmosDataTable";
import { columns } from "@/components/finanzas/diezmos/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react"; // Importamos Suspense
import { DiezmosFilters } from "@/components/finanzas/diezmos/DiezmosFilters"; // Importamos los filtros

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function DiezmosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

  // "Desenvolvemos" los searchParams
  const params = await searchParams;

  // 1. Extraemos los parámetros de filtro
  const year = typeof params.year === "string" ? params.year : undefined;
  const month = typeof params.month === "string" ? params.month : undefined;

  const rawFortnight =
    typeof params.fortnight === "string" ? params.fortnight : undefined;

  const fortnight =
    rawFortnight === "primera_quincena" || rawFortnight === "segunda_quincena"
      ? rawFortnight
      : undefined;

  // 2. Pasamos los filtros a la Server Action
  const data = await getDiezmosResumenList({ year, month, fortnight });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Diezmos</h1>
        {canManage && (
          <Button asChild>
            <Link href="/finanzas/diezmos/nuevo-lote">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Nuevo Lote
            </Link>
          </Button>
        )}
      </div>

      {/* 3. Añadimos la barra de filtros */}
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <DiezmosFilters />
      </Suspense>

      <DiezmosDataTable columns={columns} data={data} canManage={canManage} />
    </div>
  );
}
