// components/finanzas/cuentas-bancarias/movimientos-bancarios-columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightCircle,
} from "lucide-react";
import {
  type MovimientoBancarioConDetalle,
  deleteMovimientoBancario,
} from "@/actions/finanzas/cuentasBancariasActions";
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
  row: Row<MovimientoBancarioConDetalle>;
  table: Table<MovimientoBancarioConDetalle>;
}) => {
  const movimiento = row.original;
  const meta = table.options.meta as { canManage: boolean; cuentaId: string };

  const handleDelete = async () => {
    const result = await deleteMovimientoBancario(movimiento.id, meta.cuentaId);
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
      description={`¿Está seguro que desea eliminar este movimiento de "${movimiento.descripcion}"? Esta acción revertirá el saldo.`}
      onConfirm={handleDelete}
    >
      <Button variant="ghost" size="icon" className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </ConfirmAlertDialog>
  );
};

// Definición de Columnas
export const movimientosBancariosColumns: ColumnDef<MovimientoBancarioConDetalle>[] =
  [
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
        const tipo = row.original.tipo;
        const Icon =
          tipo === "deposito"
            ? ArrowUpCircle
            : tipo === "retiro"
            ? ArrowDownCircle
            : ArrowRightCircle;
        const color =
          tipo === "deposito"
            ? "text-green-600"
            : tipo === "retiro"
            ? "text-destructive"
            : "text-blue-600";
        return (
          <span className={`flex items-center gap-2 ${color}`}>
            <Icon className="h-4 w-4" />
            <span className="capitalize">{tipo}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <div>
          <p>{row.original.descripcion}</p>
          {row.original.tipo === "transferencia" && (
            <p className="text-xs text-muted-foreground">
              A: {row.original.cuenta_destino?.nombre || "N/A"}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "monto",
      header: () => <div className="text-right">Monto</div>,
      cell: ({ row }) => (
        <div
          className={`text-right font-medium pr-4 ${
            row.original.tipo === "retiro" ? "text-destructive" : ""
          }`}
        >
          {row.original.tipo === "retiro" ? "-" : ""}
          {formatCurrency(row.original.monto)}
        </div>
      ),
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
