/* eslint-disable @typescript-eslint/no-unused-vars */
// components/finanzas/presupuestos/columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Edit2,
  Check,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Importamos el TIPO desde la Server Action
import {
  type PresupuestoParaTabla,
  deletePresupuesto,
  updatePresupuestoEstado,
} from "@/actions/finanzas/presupuestosActions";
// Importamos el Alert genérico
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { PresupuestoFormDialog } from "./PresupuestoFormDialog";
import { toast } from "sonner";
import Link from "next/link";

// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

// Celda de Acciones (¡ACTUALIZADA!)
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<PresupuestoParaTabla>;
  table: Table<PresupuestoParaTabla>;
}) => {
  const presupuesto = row.original;
  const meta = table.options.meta as { canManage: boolean };
  const [isPending, startTransition] = React.useTransition(); // <-- Hook de transición

  const handleDelete = async () => {
    const result = await deletePresupuesto(presupuesto.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Error al eliminar", { description: result.message });
    }
  };

  const handleUpdateEstado = (newState: "activo" | "cerrado" | "borrador") => {
    startTransition(async () => {
      const result = await updatePresupuestoEstado(presupuesto.id, newState);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Error al cambiar estado", { description: result.message });
      }
    });
  };

  if (!meta.canManage) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/finanzas/presupuestos/${presupuesto.id}`}>
            <Eye className="mr-2 h-4 w-4" /> Ver/Editar Líneas
          </Link>
        </DropdownMenuItem>
        {/* Solo se puede editar el nombre si está en borrador */}
        {presupuesto.estado === "borrador" && (
          <PresupuestoFormDialog mode="edit" presupuesto={presupuesto}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" /> Editar Nombre
            </DropdownMenuItem>
          </PresupuestoFormDialog>
        )}
        <DropdownMenuSeparator />
        {/* Si está en Borrador, mostrar "Aprobar" */}
        {presupuesto.estado === "borrador" && (
          <ConfirmAlertDialog
            title="¿Aprobar Presupuesto?"
            description={`Al aprobar, este presupuesto se volverá "Activo" y los gastos comenzarán a registrarse contra él.`}
            onConfirm={() => handleUpdateEstado("activo")}
          >
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Aprobar y Activar
            </DropdownMenuItem>
          </ConfirmAlertDialog>
        )}
        {/* Si está Activo, mostrar "Cerrar" */}
        {presupuesto.estado === "activo" && (
          <ConfirmAlertDialog
            title="¿Cerrar Presupuesto?"
            description={`El presupuesto se marcará como "Cerrado" y ya no aceptará nuevos gastos.`}
            onConfirm={() => handleUpdateEstado("cerrado")}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Lock className="mr-2 h-4 w-4" />
              Cerrar Presupuesto
            </DropdownMenuItem>
          </ConfirmAlertDialog>
        )}
        {/* Si está Cerrado, mostrar "Reabrir" */}
        {presupuesto.estado === "cerrado" && (
          <ConfirmAlertDialog
            title="¿Reabrir Presupuesto?"
            description={`El presupuesto volverá al estado "Borrador" para ajustes.`}
            onConfirm={() => handleUpdateEstado("borrador")}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit2 className="mr-2 h-4 w-4" />
              Reabrir (a Borrador)
            </DropdownMenuItem>
          </ConfirmAlertDialog>
        )}
        {/* Solo se puede eliminar si está en borrador */}
        {presupuesto.estado === "borrador" && (
          <>
            <DropdownMenuSeparator />
            <ConfirmAlertDialog
              title="¿Eliminar Presupuesto?"
              description={`¿Está seguro que desea eliminar "${presupuesto.nombre}"? Todas sus líneas también serán eliminadas.`}
              onConfirm={handleDelete}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </ConfirmAlertDialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Definición de Columnas
export const columns: ColumnDef<PresupuestoParaTabla>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }: { row: Row<PresupuestoParaTabla> }) => (
      <Link
        href={`/finanzas/presupuestos/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.nombre}
      </Link>
    ),
  },
  {
    accessorKey: "anio",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Año <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "monto_presupuestado_total",
    header: () => <div className="text-right">Presupuestado</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.monto_presupuestado_total)}
      </div>
    ),
  },
  {
    accessorKey: "monto_ejecutado_total",
    header: () => <div className="text-right">Ejecutado</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.monto_ejecutado_total)}
      </div>
    ),
  },
  {
    accessorKey: "diferencia",
    header: () => <div className="text-right">Diferencia</div>,
    cell: ({ row }) => {
      const diff =
        row.original.monto_presupuestado_total -
        row.original.monto_ejecutado_total;
      const color = diff >= 0 ? "text-green-600" : "text-destructive";
      return (
        <div className={`text-right font-medium ${color}`}>
          {formatCurrency(diff)}
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
      if (estado === "aprobado" || estado === "activo") variant = "default";
      if (estado === "cerrado") variant = "secondary";
      if (estado === "borrador") variant = "destructive";
      return (
        <Badge variant={variant} className="capitalize">
          {estado}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <ActionsCell row={row} table={table} />
      </div>
    ),
  },
];
