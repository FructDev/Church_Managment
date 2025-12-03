// components/finanzas/caja-chica/MovimientosDataTable.tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type HeaderGroup,
  type Header,
  type Row,
  type Cell,
  type Table as TanStackTable,
  type RowData,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovimientoCajaChicaGridCard } from "./MovimientoCajaChicaGridCard";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  canManage: boolean;
  cajaChicaId: string;
}

// Actualizamos 'meta'

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    canManage?: boolean;
    cajaChicaId?: string; // <-- ¡NUEVO!
  }
}

export function MovimientosDataTable<TData, TValue>({
  columns,
  data,
  canManage,
  cajaChicaId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "fecha", desc: true }, // Ordenar por fecha por defecto
  ]);

  const table: TanStackTable<TData> = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      canManage,
      cajaChicaId,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<TData, unknown>) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<TData>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay movimientos en esta caja.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* VISTA MÓVIL (GRID DE TARJETAS) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <MovimientoCajaChicaGridCard
              key={row.id}
              movimiento={row.original as any}
              cajaChicaId={cajaChicaId}
              canManage={canManage}
            />
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
            No hay movimientos en esta caja.
          </div>
        )}
      </div>
    </div>
  );
}
