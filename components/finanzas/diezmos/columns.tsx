// components/finanzas/diezmos/columns.tsx
"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle2, XCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type DiezmoResumenParaTabla,
  ejecutarDistribucion,
} from "@/actions/finanzas/diezmosActions";
import { toast } from "sonner";
import { useTransition } from "react";
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
import Link from "next/link";

// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

// Formateador de fecha
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Componente de Botón de Acción (sin cambios)
const DistributeButton = ({ row }: { row: Row<DiezmoResumenParaTabla> }) => {
  const [isPending, startTransition] = useTransition();
  const resumen = row.original;

  if (resumen.distribuido) {
    return (
      <Badge variant="default" className="gap-1 whitespace-nowrap">
        <CheckCircle2 className="h-4 w-4" />
        Distribuido
      </Badge>
    );
  }

  const handleDistribute = () => {
    startTransition(async () => {
      const result = await ejecutarDistribucion(resumen);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Error al distribuir", { description: result.message });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="whitespace-nowrap"
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? "Procesando..." : "Distribuir"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Distribución</AlertDialogTitle>
          <AlertDialogDescription>
            Está a punto de ejecutar la distribución para el período:
            <strong className="capitalize">
              {` ${resumen.tipo_periodo.replace("_", " ")} ${new Date(
                resumen.periodo
              ).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}`}
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 my-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Recibido:</span>
            <span>{formatCurrency(resumen.total_recibido)}</span>
          </div>
          <div className="p-4 border rounded-md space-y-2 bg-muted/50">
            <h4 className="font-semibold mb-2">Desglose de Egresos:</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diezmo de Diezmo:</span>
              <span>{formatCurrency(resumen.diezmo_de_diezmo)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Comité de Finanzas:</span>
              <span>{formatCurrency(resumen.comite_finanzas)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diezmo Pastoral:</span>
              <span>{formatCurrency(resumen.diezmo_pastoral)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sustento Pastoral:</span>
              <span>{formatCurrency(resumen.sustento_pastoral)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t">
              <span>Total a Distribuir:</span>
              <span>
                {formatCurrency(
                  resumen.diezmo_de_diezmo +
                    resumen.comite_finanzas +
                    resumen.diezmo_pastoral +
                    resumen.sustento_pastoral
                )}
              </span>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDistribute} disabled={isPending}>
            {isPending ? "Procesando..." : "Sí, ejecutar distribución"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// --- Definición de Columnas (¡ACTUALIZADA!) ---
export const columns: ColumnDef<DiezmoResumenParaTabla>[] = [
  {
    accessorKey: "periodo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Período <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) => {
      const fecha = new Date(row.original.periodo);
      const tipo = row.original.tipo_periodo.replace("_", " ");
      return (
        <Link
          href={`/finanzas/diezmos/${row.original.id}`}
          className="group capitalize"
        >
          <div className="font-medium group-hover:text-primary group-hover:underline">
            {fecha.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </div>
          <div className="text-xs text-muted-foreground">{tipo}</div>
        </Link>
      );
    },
  },
  {
    accessorKey: "total_recibido",
    header: ({ column }) => (
      <div className="text-right pr-4">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Recibido <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) => (
      <div className="text-right font-medium pr-4">
        {formatCurrency(row.original.total_recibido)}
      </div>
    ),
  },
  {
    accessorKey: "distribuido",
    header: "Estado",
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) =>
      row.original.distribuido ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-4 w-4" /> Distribuido
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-4 w-4" /> Pendiente
        </Badge>
      ),
  },

  {
    accessorKey: "registrado_por.nombre_completo",
    header: "Registrado Por",
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) =>
      row.original.registrado_por?.nombre_completo || "N/A",
  },
  {
    accessorKey: "distribuido_por.nombre_completo",
    header: "Distribuido Por",
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) =>
      row.original.distribuido_por?.nombre_completo || "N/A",
  },
  {
    accessorKey: "fecha_distribucion",
    header: "Fecha Distribución",
    cell: ({ row }: { row: Row<DiezmoResumenParaTabla> }) =>
      formatDate(row.original.fecha_distribucion),
  },

  {
    id: "actions",
    header: "Acción",
    cell: ({
      row,
      table,
    }: {
      row: Row<DiezmoResumenParaTabla>;
      table: Table<DiezmoResumenParaTabla>;
    }) => {
      const meta = table.options.meta as { canManage: boolean };
      if (!meta.canManage) return null;
      return <DistributeButton row={row} />;
    },
  },
];
