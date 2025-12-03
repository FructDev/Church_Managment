// components/estructura/diaconos/columns.tsx
"use client";

import * as React from "react";
// Importamos las Server Actions y Tipos
import {
  deleteDiacono,
  type DiaconoConMiembro,
} from "@/actions/estructura/diaconosActions";
import { DiaconoFormDialog } from "./DiaconoFormDialog";

// Importamos los Tipos de TanStack Table
import {
  type ColumnDef,
  type Row,
  type Column,
  type Table,
} from "@tanstack/react-table";

// Importamos Componentes de UI
import { Badge } from "@/components/ui/badge"; // ¡Importado!
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

type MiembroSimple = { id: string; nombre_completo: string };

// --- Celdas Personalizadas (Con Tipado Explícito) ---

const AvatarCell = ({ row }: { row: Row<DiaconoConMiembro> }) => {
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

const ActionsCell = ({
  row,
  table,
}: {
  row: Row<DiaconoConMiembro>;
  table: Table<DiaconoConMiembro>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const diacono = row.original;

  // Leemos la lista de miembros desde 'meta' (con tipado)
  const miembros = (table.options.meta as { miembros: MiembroSimple[] })
    ?.miembros;
  const meta = table.options.meta as {
    miembros: MiembroSimple[];
    canManage: boolean;
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      // Usamos la Server Action real
      const result = await deleteDiacono(diacono.id);
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

        <DiaconoFormDialog
          mode="edit"
          diacono={diacono}
          miembros={meta.miembros || []}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        </DiaconoFormDialog>

        <ConfirmAlertDialog
          title="¿Eliminar Diácono?"
          description={`¿Está seguro que desea eliminar a ${diacono.miembro?.nombre_completo}?`}
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

// --- Definición de Columnas (Con Tipado Explícito) ---

export const columns: ColumnDef<DiaconoConMiembro>[] = [
  {
    accessorKey: "miembro.foto_url",
    header: "",
    cell: AvatarCell,
  },
  {
    accessorKey: "miembro.nombre_completo",
    header: ({ column }: { column: Column<DiaconoConMiembro, unknown> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<DiaconoConMiembro> }) =>
      row.original.miembro?.nombre_completo || "Miembro no encontrado",
  },
  {
    accessorKey: "miembro.telefono",
    header: "Teléfono",
    cell: ({ row }: { row: Row<DiaconoConMiembro> }) =>
      row.original.miembro?.telefono || "N/A",
  },
  {
    accessorKey: "fecha_nombramiento",
    header: "Nombramiento",
    cell: ({ row }: { row: Row<DiaconoConMiembro> }) =>
      new Date(row.original.fecha_nombramiento).toLocaleDateString(),
  },
  {
    accessorKey: "areas_servicio",
    header: "Áreas de Servicio",
    cell: ({ row }: { row: Row<DiaconoConMiembro> }) => {
      const areas = row.original.areas_servicio as string[];
      if (!areas || areas.length === 0)
        return <span className="text-muted-foreground">N/A</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {areas.map((area) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<DiaconoConMiembro> }) =>
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
      row: Row<DiaconoConMiembro>;
      table: Table<DiaconoConMiembro>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
