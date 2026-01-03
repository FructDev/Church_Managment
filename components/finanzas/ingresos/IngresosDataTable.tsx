/* eslint-disable @typescript-eslint/no-unused-vars */
// components/finanzas/ingresos/IngresosDataTable.tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { Button } from "@/components/ui/button";
import { IngresoGridCard } from "./IngresoGridCard";

type CategoriaIngreso = { id: string; nombre: string; tipo: string };
type CajaSimple = { id: string; nombre: string };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  categorias: CategoriaIngreso[];
  canManage: boolean;
  pageCount: number;
  cajas: CajaSimple[];
}

export function IngresosDataTable<TData, TValue>({
  columns,
  data,
  categorias,
  canManage,
  pageCount,
  cajas,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "fecha", desc: true }, // Ordenar por fecha descendente por defecto
  ]);

  const table: TanStackTable<TData> = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    pageCount: pageCount,
    manualPagination: true,
    state: {
      sorting,
    },
    meta: {
      categorias,
      canManage,
      cajas: cajas,
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
                  No se encontraron ingresos.
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
            <IngresoGridCard
              key={row.id}
              ingreso={row.original as any}
              categorias={categorias}
              canManage={canManage}
              cajas={cajas}
            />
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
            No se encontraron ingresos.
          </div>
        )}
      </div>
    </div>
  );
}
