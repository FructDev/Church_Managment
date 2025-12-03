// components/miembros/MiembrosDataTable.tsx
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { MiembroGridCard } from "./MiembroGridCard";

type SociedadSimple = { id: string; nombre: string };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sociedades: SociedadSimple[];
  canManage: boolean;
  pageCount: number;
  page: number;
  pageSize: number;
}

// Extendemos 'meta' para incluir 'sociedades'

// declare module "@tanstack/react-table" {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   interface TableMeta<TData extends RowData> {
//     miembros?: SociedadSimple[]; // Reutilizamos el tipo de 'miembros' aquí
//     sociedadId?: string;
//     cargosEnum?: string[];
//     canManage?: boolean;
//     comiteId?: string;
//     sociedades?: SociedadSimple[]; // <-- ¡NUEVO!
//   }
// }

export function MiembrosDataTable<TData, TValue>({
  columns,
  data,
  sociedades,
  canManage,
  pageCount,
}: DataTableProps<TData, TValue>) {
  const table: TanStackTable<TData> = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: pageCount,
    manualPagination: true,
    state: {},
    meta: {
      sociedades,
      canManage,
    },
  });

  return (
    // ... (El JSX de la tabla es idéntico al de DiaconosDataTable, pero sin paginación 'next/prev' local)
    <div className="space-y-4">
      {/* Vista de Escritorio (Tabla) */}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron miembros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (Tarjetas) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row: Row<TData>) => (
            <MiembroGridCard
              key={row.id}
              miembro={row.original as any}
              sociedades={sociedades}
              canManage={canManage}
            />
          ))
        ) : (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            No se encontraron miembros.
          </div>
        )}
      </div>
    </div>
  );
}
