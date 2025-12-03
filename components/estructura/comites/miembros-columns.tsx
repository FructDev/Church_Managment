// components/estructura/comites/miembros-columns.tsx
"use client";

import * as React from "react";
import {
  removeComiteMiembro,
  type ComiteMiembroConDetalle,
} from "@/actions/estructura/comiteMiembrosActions";
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
  type ColumnDef,
  type Row,
  type Column,
  type Table,
} from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

// Celda de Avatar
const AvatarCell = ({ row }: { row: Row<ComiteMiembroConDetalle> }) => {
  const miembro = row.original.miembro;
  return (
    <div className="relative h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
      {miembro?.foto_url ? (
        <Image
          src={miembro.foto_url}
          alt={miembro.nombre_completo}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <span className="text-sm text-muted-foreground">
          {miembro?.nombre_completo?.charAt(0) || "?"}
        </span>
      )}
    </div>
  );
};

// Celda de Acciones
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<ComiteMiembroConDetalle>;
  table: Table<ComiteMiembroConDetalle>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const miembroComite = row.original;
  const meta = table.options.meta as { comiteId: string };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await removeComiteMiembro(miembroComite.id, meta.comiteId);
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

        <ConfirmAlertDialog
          title="¿Remover Miembro?"
          description={`¿Está seguro que desea remover a ${miembroComite.miembro?.nombre_completo} de este comité?`}
          onConfirm={handleDelete}
        >
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar del comité
          </DropdownMenuItem>
        </ConfirmAlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Definición de Columnas
export const columns: ColumnDef<ComiteMiembroConDetalle>[] = [
  { accessorKey: "miembro.foto_url", header: "", cell: AvatarCell },
  {
    accessorKey: "miembro.nombre_completo",
    header: ({
      column,
    }: {
      column: Column<ComiteMiembroConDetalle, unknown>;
    }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<ComiteMiembroConDetalle> }) =>
      row.original.miembro?.nombre_completo || "Miembro no encontrado",
  },
  {
    accessorKey: "responsabilidad",
    header: "Responsabilidad",
  },
  {
    accessorKey: "fecha_ingreso",
    header: "Fecha de Ingreso",
    cell: ({ row }: { row: Row<ComiteMiembroConDetalle> }) =>
      new Date(row.original.fecha_ingreso).toLocaleDateString(),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<ComiteMiembroConDetalle> }) =>
      row.original.activo ? (
        <Badge>Activo</Badge>
      ) : (
        <Badge variant="destructive">Inactivo</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({
      row,
      table,
    }: {
      row: Row<ComiteMiembroConDetalle>;
      table: Table<ComiteMiembroConDetalle>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
