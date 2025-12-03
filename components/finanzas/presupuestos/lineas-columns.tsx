// components/finanzas/presupuestos/lineas-columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type LineaPresupuestoConCategoria,
  deleteLineaPresupuesto,
} from "@/actions/finanzas/lineasPresupuestoActions";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

// Celda de Acciones
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<LineaPresupuestoConCategoria>;
  table: Table<LineaPresupuestoConCategoria>;
}) => {
  const linea = row.original;
  const meta = table.options.meta as { presupuestoId: string };

  const handleDelete = async () => {
    const result = await deleteLineaPresupuesto(linea.id, meta.presupuestoId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Error al eliminar", { description: result.message });
    }
  };

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
        {/* Futuro: <DropdownMenuItem>Editar Monto</DropdownMenuItem> */}
        <ConfirmAlertDialog
          title="¿Eliminar Línea?"
          description={`¿Está seguro que desea eliminar la línea "${linea.categoria_egreso?.nombre}"?`}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Definición de Columnas
export const lineasColumns: ColumnDef<LineaPresupuestoConCategoria>[] = [
  {
    accessorKey: "categoria_egreso.nombre",
    header: "Categoría de Gasto",
    cell: ({ row }) => row.original.categoria_egreso?.nombre || "N/A",
  },
  {
    accessorKey: "monto_presupuestado",
    header: () => <div className="text-right">Presupuestado</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.monto_presupuestado)}
      </div>
    ),
  },
  {
    accessorKey: "monto_ejecutado",
    header: () => <div className="text-right">Ejecutado (Gastado)</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.monto_ejecutado)}
      </div>
    ),
    // Diferencia
  },
  {
    id: "diferencia",
    header: () => <div className="text-right">Diferencia</div>,
    cell: ({ row }) => {
      const diff =
        row.original.monto_presupuestado - row.original.monto_ejecutado;
      const color = diff >= 0 ? "text-green-600" : "text-destructive";
      return (
        <div className={`text-right font-medium ${color}`}>
          {formatCurrency(diff)}
        </div>
      );
    },
  },
  {
    accessorKey: "progreso",
    header: "Progreso de Gasto",
    cell: ({ row }) => {
      const { monto_presupuestado, monto_ejecutado } = row.original;
      const percent =
        monto_presupuestado > 0
          ? (monto_ejecutado / monto_presupuestado) * 100
          : 0;
      const color =
        percent > 90
          ? "bg-destructive"
          : percent > 75
          ? "bg-yellow-500"
          : "bg-primary";
      return (
        <div className="h-2 w-full bg-muted rounded-full">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
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
