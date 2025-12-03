// components/miembros/columns.tsx
"use client";

import * as React from "react";
import {
  deleteMiembro,
  type MiembroConSociedad,
} from "@/actions/miembros/miembrosActions";
import { MiembroFormDialog } from "./MiembroFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import { ConfirmAlertDialog } from "../ui/ConfirmAlertDialog";

type SociedadSimple = { id: string; nombre: string };

// Celda de Acciones (sin cambios)
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<MiembroConSociedad>;
  table: Table<MiembroConSociedad>;
}) => {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const miembro = row.original;

  const meta = table.options.meta as {
    sociedades: SociedadSimple[];
    canManage: boolean;
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      // Ya no necesitamos 'isDeleting', el ConfirmAlertDialog lo maneja
      const result = await deleteMiembro(miembro.id);
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
        <MiembroFormDialog
          mode="edit"
          miembro={miembro}
          sociedades={meta.sociedades}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> {/* Icono añadido */}
            Editar
          </DropdownMenuItem>
        </MiembroFormDialog>

        {/* Reemplazamos el onClick por el componente de confirmación */}
        <ConfirmAlertDialog
          title="¿Eliminar Miembro?"
          description={`¿Está seguro que desea eliminar a ${miembro.nombre_completo}? Esta acción no se puede deshacer.`}
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
export const columns: ColumnDef<MiembroConSociedad>[] = [
  {
    accessorKey: "nombre_completo",
    header: "Nombre",
    // Cambiamos la celda por un componente Link
    // que incluye el Avatar y el Nombre.
    cell: ({ row }: { row: Row<MiembroConSociedad> }) => {
      const miembro = row.original;
      return (
        <Link
          href={`/miembros/${miembro.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="h-9 w-9">
            {miembro.foto_url && (
              <AvatarImage
                src={miembro.foto_url}
                alt={miembro.nombre_completo}
              />
            )}
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium group-hover:underline group-hover:text-primary">
            {miembro.nombre_completo}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "sociedad.nombre",
    header: "Sociedad",
    cell: ({ row }: { row: Row<MiembroConSociedad> }) => (
      <span className="capitalize">
        {row.original.sociedad?.nombre || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "estado_membresia",
    header: "Estado",
    cell: ({ row }: { row: Row<MiembroConSociedad> }) => (
      <Badge
        variant={
          row.original.estado_membresia === "activo" ? "default" : "outline"
        }
        className="capitalize"
      >
        {row.original.estado_membresia}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({
      row,
      table,
    }: {
      row: Row<MiembroConSociedad>;
      table: Table<MiembroConSociedad>;
    }) => <ActionsCell row={row} table={table} />,
  },
];
