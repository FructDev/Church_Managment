"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  removerAlumnoEB,
  type AlumnoInscrito,
} from "@/actions/actividades/escuelaBiblicaActions";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";

// Celda de Acciones
const ActionsCell = ({
  row,
  table,
}: {
  row: Row<AlumnoInscrito>;
  table: Table<AlumnoInscrito>;
}) => {
  const [isPending, startTransition] = useTransition();
  const inscripcion = row.original;
  const meta = table.options.meta as { canManage: boolean; claseId: string };

  const handleDelete = () => {
    startTransition(async () => {
      // OJO: removerAlumnoEB espera (claseId, miembroId), no el ID de inscripción
      if (!inscripcion.miembro?.id) return;

      const result = await removerAlumnoEB(
        meta.claseId,
        inscripcion.miembro.id
      );
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  if (!meta.canManage) return null;

  return (
    <ConfirmAlertDialog
      title="Remover Alumno"
      description={`¿Sacar a ${inscripcion.miembro?.nombre_completo} de esta clase?`}
      onConfirm={handleDelete}
    >
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10"
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </ConfirmAlertDialog>
  );
};

export const alumnosColumns: ColumnDef<AlumnoInscrito>[] = [
  {
    accessorKey: "miembro.nombre_completo",
    header: "Alumno",
    cell: ({ row }) => {
      const m = row.original.miembro;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={m?.foto_url || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {m?.nombre_completo || "Desconocido"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "miembro.telefono",
    header: "Teléfono",
    cell: ({ row }) => row.original.miembro?.telefono || "-",
  },
  {
    accessorKey: "fecha_inscripcion",
    header: "Inscrito desde",
    cell: ({ row }) =>
      new Date(row.original.fecha_inscripcion).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
  },
];
