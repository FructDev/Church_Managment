/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
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
import { alumnosColumns } from "./alumnos-columns";
import { type AlumnoInscrito } from "@/actions/actividades/escuelaBiblicaActions";
import { AlumnoGridCard } from "./AlumnoGridCard";

interface Props {
  data: AlumnoInscrito[];
  claseId: string;
  canManage: boolean;
}

export function AlumnosDataTable({ data, claseId, canManage }: Props) {
  const table = useReactTable({
    data,
    columns: alumnosColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      claseId,
      canManage,
    },
  });

  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
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
                  colSpan={alumnosColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay alumnos inscritos en esta clase.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (Tarjetas) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <AlumnoGridCard
              key={row.id}
              alumno={row.original}
              claseId={claseId}
              canManage={canManage}
            />
          ))
        ) : (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            No hay alumnos inscritos en esta clase.
          </div>
        )}
      </div>

      {/* Paginación Simple */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
