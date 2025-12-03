// components/finanzas/egresos/columns.tsx
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
import {
  type EgresoParaTabla,
  deleteEgreso,
} from "@/actions/finanzas/egresosActions";
import { EgresoFormDialog } from "./EgresoFormDialog"; // Lo crearemos ahora
import { toast } from "sonner";

type CategoriaEgreso = { id: string; nombre: string; tipo: string };

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
  row: Row<EgresoParaTabla>;
  table: Table<EgresoParaTabla>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const egreso = row.original;

  const meta = table.options.meta as {
    categorias: CategoriaEgreso[];
    canManage: boolean;
  };

  const handleDelete = () => {
    if (
      confirm(
        `¿Está seguro que desea eliminar este egreso de ${formatCurrency(
          egreso.monto
        )}?`
      )
    ) {
      startDeleteTransition(async () => {
        const result = await deleteEgreso(egreso.id);
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
        <EgresoFormDialog
          mode="edit"
          egreso={egreso}
          categorias={meta.categorias}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        </EgresoFormDialog>
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
export const columns: ColumnDef<EgresoParaTabla>[] = [
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
    cell: ({ row }) =>
      new Date(row.original.fecha).toLocaleDateString("es-ES", {
        timeZone: "UTC",
      }),
  },
  {
    accessorKey: "monto",
    header: ({ column }) => (
      <div className="text-right pr-4">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Monto <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-right pr-4 text-red-600">
        -{formatCurrency(row.original.monto)}
      </div>
    ),
  },
  {
    accessorKey: "categoria_egreso.nombre",
    header: "Categoría",
    cell: ({ row }) => row.original.categoria_egreso?.nombre || "N/A",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "beneficiario_proveedor",
    header: "Beneficiario",
    // Añadimos la columna de Trazabilidad
    cell: ({ row }) => row.original.beneficiario_proveedor || "N/A",
  },
  {
    accessorKey: "registrado_por.nombre_completo",
    header: "Registrado Por",
    cell: ({ row }) => row.original.registrado_por?.nombre_completo || "N/A",
  },
  {
    accessorKey: "comprobante_url",
    header: "Comp.",
    cell: ({ row }) => {
      if (!row.original.comprobante_url) return null;
      return (
        <Button variant="ghost" size="icon" asChild>
          <a
            href={row.original.comprobante_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="h-4 w-4 text-primary" />
          </a>
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
  },
];
