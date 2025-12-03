/* eslint-disable @typescript-eslint/no-unused-vars */
// components/finanzas/caja-chica/movimientos-columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type MovimientoCajaChicaConDetalle,
  deleteMovimientoCajaChica,
} from "@/actions/finanzas/cajaChicaActions";
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
  row: Row<MovimientoCajaChicaConDetalle>;
  table: Table<MovimientoCajaChicaConDetalle>;
}) => {
  const movimiento = row.original;
  const meta = table.options.meta as {
    canManage: boolean;
    cajaChicaId: string;
  };

  const handleDelete = async () => {
    const result = await deleteMovimientoCajaChica(
      movimiento.id,
      meta.cajaChicaId
    );
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Error al eliminar", { description: result.message });
    }
  };

  if (!meta.canManage) return null;

  return (
    <ConfirmAlertDialog
      title="¿Eliminar Movimiento?"
      description={`¿Está seguro que desea eliminar este movimiento de "${movimiento.concepto}"? Esta acción revertirá el saldo.`}
      onConfirm={handleDelete}
    >
      <Button variant="ghost" size="icon" className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </ConfirmAlertDialog>
  );
};

// Definición de Columnas
export const movimientosColumns: ColumnDef<MovimientoCajaChicaConDetalle>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) =>
      new Date(row.original.fecha).toLocaleDateString("es-ES", {
        timeZone: "UTC",
      }),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const esGasto = row.original.tipo === "gasto";
      return (
        <span
          className={`flex items-center gap-2 ${
            esGasto ? "text-destructive" : "text-green-600"
          }`}
        >
          {esGasto ? (
            <ArrowDownCircle className="h-4 w-4" />
          ) : (
            <ArrowUpCircle className="h-4 w-4" />
          )}
          <span className="capitalize">{row.original.tipo}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "concepto",
    header: "Concepto",
  },
  {
    accessorKey: "monto",
    header: () => <div className="text-right">Monto</div>,
    cell: ({ row }) => (
      <div
        className={`text-right font-medium pr-4 ${
          row.original.tipo === "gasto" ? "text-destructive" : "text-green-600"
        }`}
      >
        {row.original.tipo === "gasto" ? "-" : "+"}
        {formatCurrency(row.original.monto)}
      </div>
    ),
  },
  {
    accessorKey: "registrado_por.nombre_completo",
    header: "Registrado Por",
    cell: ({ row }) => row.original.registrado_por?.nombre_completo || "N/A",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acción</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <ActionsCell row={row} table={table} />
      </div>
    ),
  },
];
