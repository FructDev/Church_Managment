/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getMiembros,
  getSociedadesList,
} from "@/actions/miembros/miembrosActions";
import { getMiembrosStats } from "@/actions/miembros/miembrosStatsActions"; // <-- Nueva acción
import { getSessionInfo } from "@/lib/auth/utils";
import { MiembrosDataTable } from "@/components/miembros/MiembrosDataTable";
import { MiembroGridCard } from "@/components/miembros/MiembroGridCard"; // <-- Nuevo componente
import { MiembrosStatsCards } from "@/components/miembros/MiembrosStatsCards"; // <-- Nuevo componente
import { columns } from "@/components/miembros/columns";
import { MiembroFormDialog } from "@/components/miembros/MiembroFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, List, FileDown } from "lucide-react";
import { Suspense } from "react";
import { MiembrosFilters } from "@/components/miembros/MiembrosFilters";
import { PaginationComponent } from "@/components/miembros/PaginationComponent";
import Link from "next/link";
import { ExportButton } from "@/components/miembros/ExportButton";
import { DirectoryPDFButton } from "@/components/miembros/DirectoryPDFButton";
import {
  ROLES_ADMINISTRATIVOS,
  ROLES_CONSULTA,
  ROLES_JERARQUIA_NO_FINANCIERA,
} from "@/lib/auth/roles";

export default async function MiembrosPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { profile } = await getSessionInfo();
  const canView = ROLES_CONSULTA.includes(profile?.rol as any);
  if (!canView) {
    return <div className="p-10 text-center">Acceso Denegado.</div>;
  }

  // 2. Verificar si puede EDITAR/CREAR (Administrativos)
  const canManage = ROLES_JERARQUIA_NO_FINANCIERA.includes(profile?.rol as any);
  const params = await props.searchParams;

  // Params
  const query = typeof params.q === "string" ? params.q : undefined;
  const sociedadId =
    typeof params.sociedadId === "string" ? params.sociedadId : undefined;
  const estado = typeof params.estado === "string" ? params.estado : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = 12; // Usamos 12 para que cuadre bien en grid (3x4 o 4x3)
  const view = typeof params.view === "string" ? params.view : "grid"; // 'grid' por defecto es más bonito

  // Carga de datos
  const [miembrosResult, sociedades, stats] = await Promise.all([
    getMiembros({ query, sociedadId, estado, page, pageSize }),
    getSociedadesList(),
    getMiembrosStats(), // Estadísticas
  ]);

  const { data: miembros, count } = miembrosResult;
  const pageCount = Math.ceil(count / pageSize);

  return (
    <div className="w-full space-y-6">
      {/* Header y Stats */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Membresía</h1>
          <div className="flex flex-wrap gap-2">
            {/* Botones de Acción Principal */}
            {canManage && (
              <>
                <ExportButton />
                <DirectoryPDFButton />
                <MiembroFormDialog mode="add" sociedades={sociedades}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Miembro
                  </Button>
                </MiembroFormDialog>
              </>
            )}
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <MiembrosStatsCards stats={stats} />
      </div>

      {/* Barra de Herramientas */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <div className="flex-1 w-full md:w-auto">
          <MiembrosFilters sociedades={sociedades} />
        </div>

        {/* Selector de Vista (Oculto en móvil) */}
        <div className="hidden md:flex items-center bg-background border rounded-md p-1 shrink-0">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="px-3 h-8"
            asChild
          >
            <Link href={{ query: { ...params, view: "list" } }} replace>
              <List className="h-4 w-4 mr-2" /> Lista
            </Link>
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="px-3 h-8"
            asChild
          >
            <Link href={{ query: { ...params, view: "grid" } }} replace>
              <LayoutGrid className="h-4 w-4 mr-2" /> Tarjetas
            </Link>
          </Button>
        </div>
      </div>

      {/* Contenido Principal: Grid o Tabla */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {miembros.map((miembro) => (
            <MiembroGridCard
              key={miembro.id}
              miembro={miembro}
              sociedades={sociedades}
              canManage={canManage}
            />
          ))}
          {miembros.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No se encontraron miembros con los filtros actuales.
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <MiembrosDataTable
            columns={columns}
            data={miembros}
            sociedades={sociedades}
            canManage={canManage}
            pageCount={pageCount}
            page={page}
            pageSize={pageSize}
          />
        </div>
      )}

      <PaginationComponent pageCount={pageCount} />
    </div>
  );
}
