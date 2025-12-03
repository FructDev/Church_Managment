// components/finanzas/presupuestos/LineasDataTable.tsx
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
import { LineaPresupuestoGridCard } from "./LineaPresupuestoGridCard";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  presupuestoId: string;
}

// Actualizamos 'meta'

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    presupuestoId?: string; // <-- ¡NUEVO!
  }
}

export function LineasDataTable<TData, TValue>({
  columns,
  data,
  presupuestoId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
      presupuestoId,
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
                  Aún no hay líneas de gasto en este presupuesto.
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
            <LineaPresupuestoGridCard
              key={row.id}
              linea={row.original as any}
              presupuestoId={presupuestoId}
              canManage={true} // Asumimos true o lo pasamos como prop si es necesario
            />
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
            Aún no hay líneas de gasto en este presupuesto.
          </div>
        )}
      </div>
    </div>
  );
}
