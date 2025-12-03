// components/finanzas/ingresos/columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Trash2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- ¡CONECTADO CORRECTAMENTE! ---
import {
  // Importamos el TIPO REAL desde la Server Action
  type IngresoParaTabla,
  deleteIngreso,
} from "@/actions/finanzas/ingresosActions";
import { IngresoFormDialog } from "./IngresoFormDialog";
import { toast } from "sonner";
// --- Fin Conexiones ---

type CategoriaIngreso = { id: string; nombre: string; tipo: string };

// Formateador de moneda
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
  row: Row<IngresoParaTabla>;
  table: Table<IngresoParaTabla>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const ingreso = row.original;

  const meta = table.options.meta as {
    categorias: CategoriaIngreso[];
    canManage: boolean;
  };

  const handleDelete = () => {
    if (
      confirm(
        `¿Está seguro que desea eliminar este ingreso de ${formatCurrency(
          ingreso.monto
        )}?`
      )
    ) {
      startDeleteTransition(async () => {
        const result = await deleteIngreso(ingreso.id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Error al eliminar", { description: result.message });
        }
      });
    }
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
        <IngresoFormDialog
          mode="edit"
          ingreso={ingreso}
          categorias={meta.categorias}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        </IngresoFormDialog>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Definición de Columnas
export const columns: ColumnDef<IngresoParaTabla>[] = [
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<IngresoParaTabla> }) =>
      new Date(row.original.fecha).toLocaleDateString("es-ES", {
        timeZone: "UTC",
      }),
  },
  {
    accessorKey: "monto",
    header: ({ column }) => (
      <div className="text-right pr-4">
        {/* 1. Alinea el contenedor del Header */}
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Monto <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }: { row: Row<IngresoParaTabla> }) => (
      <div className="font-medium text-right pr-4">
        {/* 2. Mantiene la celda alineada */}
        {formatCurrency(row.original.monto)}
      </div>
    ),
  },
  {
    accessorKey: "categoria_ingreso.nombre",
    header: "Categoría",
    cell: ({ row }: { row: Row<IngresoParaTabla> }) =>
      row.original.categoria_ingreso?.nombre || "N/A",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "metodo_pago",
    header: "Método",
    cell: ({ row }: { row: Row<IngresoParaTabla> }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.metodo_pago}
      </Badge>
    ),
  },
  {
    accessorKey: "registrado_por.nombre_completo",
    header: "Registrado Por",
    cell: ({ row }: { row: Row<IngresoParaTabla> }) =>
      row.original.registrado_por?.nombre_completo || "N/A",
  },
  {
    accessorKey: "comprobante_url",
    header: "Comp.",
    cell: ({ row }: { row: Row<IngresoParaTabla> }) => {
      if (!row.original.comprobante_url) return null;
      return (
        <Button variant="ghost" size="icon" asChild>
          <a
            href={row.original.comprobante_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="h-4 w-4 text-primary" />{" "}
          </a>
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({
      row,
      table,
    }: {
      row: Row<IngresoParaTabla>;
      table: Table<IngresoParaTabla>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
