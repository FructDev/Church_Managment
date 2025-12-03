// components/estructura/directiva/columns.tsx
"use client";

import * as React from "react";
import {
  deleteDirectiva,
  type DirectivaConMiembro,
} from "@/actions/estructura/directivasActions";
import { DirectivaFormDialog } from "./DirectivaFormDialog"; // <-- ¡Importamos el formulario!
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ColumnDef,
  type Row,
  type Column,
  type Table,
} from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

type MiembroSimple = { id: string; nombre_completo: string };

// Celda de Avatar (sin cambios)
const AvatarCell = ({ row }: { row: Row<DirectivaConMiembro> }) => {
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

// Celda de Acciones (¡ACTUALIZADA!)
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<DirectivaConMiembro>;
  table: Table<DirectivaConMiembro>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const directiva = row.original;
  const meta = table.options.meta as {
    miembros: MiembroSimple[];
    sociedadId: string;
    cargosEnum: string[];
    canManage: boolean;
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteDirectiva(directiva.id, meta.sociedadId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Error al eliminar", { description: result.message });
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
        <DirectivaFormDialog
          mode="edit"
          directiva={directiva}
          miembros={meta.miembros}
          sociedadId={meta.sociedadId}
          cargosEnum={meta.cargosEnum}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </DirectivaFormDialog>

        <ConfirmAlertDialog
          title="¿Remover Miembro?"
          description={`¿Está seguro que desea remover a ${directiva.miembro?.nombre_completo} de este cargo?`}
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
        {/* --- FIN DE CORRECCIÓN --- */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Definición de Columnas (sin cambios, excepto 'actions')
export const columns: ColumnDef<DirectivaConMiembro>[] = [
  { accessorKey: "miembro.foto_url", header: "", cell: AvatarCell },
  {
    accessorKey: "miembro.nombre_completo",
    header: "Nombre",
    cell: ({ row }: { row: Row<DirectivaConMiembro> }) =>
      row.original.miembro?.nombre_completo || "Miembro no encontrado",
  },
  {
    accessorKey: "cargo",
    header: ({ column }: { column: Column<DirectivaConMiembro, unknown> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cargo <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<DirectivaConMiembro> }) => (
      <span className="capitalize">{row.original.cargo.replace("_", " ")}</span>
    ),
  },
  {
    accessorKey: "fecha_inicio",
    header: "Fecha Inicio",
    cell: ({ row }: { row: Row<DirectivaConMiembro> }) =>
      new Date(row.original.fecha_inicio).toLocaleDateString(),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<DirectivaConMiembro> }) =>
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
      row: Row<DirectivaConMiembro>;
      table: Table<DirectivaConMiembro>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
