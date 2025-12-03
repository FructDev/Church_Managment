// components/finanzas/diezmos/detalle-columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import {
  type TransaccionDiezmoDetalle,
  deleteDiezmoEntry,
} from "@/actions/finanzas/diezmosActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DiezmoEntryEditDialog } from "./DiezmoEntryEditDialog"; // Importamos el formulario
import { toast } from "sonner";
import { useTransition } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

// --- ¡NUEVA CELDA DE ACCIONES! ---
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<TransaccionDiezmoDetalle>;
  table: Table<TransaccionDiezmoDetalle>;
}) => {
  const [isDeleting, startDeleteTransition] = useTransition();
  const transaccion = row.original;

  const meta = table.options.meta as {
    diezmoId?: string;
    isDistribuido?: boolean;
  };

  // ¡LÓGICA DE NEGOCIO!
  // Si no hay 'meta', o si el lote ya fue distribuido,
  // no mostramos ningún botón de acción.
  if (!meta || meta.isDistribuido) {
    return null;
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      if (!meta.diezmoId) return; // Seguridad

      const result = await deleteDiezmoEntry(transaccion.id, meta.diezmoId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Error al eliminar", { description: result.message });
      }
    });
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

        {/* Botón de Editar (con Dialog) */}
        <DiezmoEntryEditDialog
          transaccion={transaccion}
          diezmoId={meta.diezmoId!}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> Editar Monto
          </DropdownMenuItem>
        </DiezmoEntryEditDialog>

        {/* Botón de Eliminar (con AlertDialog) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Entrada
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente la entrada de diezmo de{" "}
                <strong>{transaccion.miembro?.nombre_completo}</strong> por un
                monto de <strong>{formatCurrency(transaccion.monto)}</strong>.
                Esto recalculará el total del lote.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Continuar y Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
// --- FIN CELDA DE ACCIONES ---

// Definición de Columnas
export const detalleColumns: ColumnDef<TransaccionDiezmoDetalle>[] = [
  {
    accessorKey: "miembro.nombre_completo",
    header: () => <div className="w-[50%]">Miembro</div>,
    cell: ({ row }: { row: Row<TransaccionDiezmoDetalle> }) =>
      row.original.miembro?.nombre_completo || "Miembro no encontrado",
  },
  {
    accessorKey: "monto",
    header: () => <div className="text-right pr-4 w-[25%]">Monto</div>,
    cell: ({ row }: { row: Row<TransaccionDiezmoDetalle> }) => (
      <div className="font-medium text-right pr-4">
        {formatCurrency(row.original.monto)}
      </div>
    ),
  },
  {
    accessorKey: "metodo_pago",
    header: () => <div className="w-[25%]">Método</div>,
    cell: ({ row }: { row: Row<TransaccionDiezmoDetalle> }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.metodo_pago}
      </Badge>
    ),
  },
  // --- ¡NUEVA COLUMNA DE ACCIONES! ---
  {
    id: "actions",
    cell: ({
      row,
      table,
    }: {
      row: Row<TransaccionDiezmoDetalle>;
      table: Table<TransaccionDiezmoDetalle>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
