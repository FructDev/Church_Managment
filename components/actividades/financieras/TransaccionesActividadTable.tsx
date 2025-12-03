"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { type TransaccionActividad } from "@/actions/actividades/financierasActions";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

export function TransaccionesActividadTable({
  data,
}: {
  data: TransaccionActividad[];
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No hay movimientos registrados para esta actividad.
              </TableCell>
            </TableRow>
          ) : (
            data.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.fecha).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={t.tipo === "ingreso" ? "default" : "destructive"}
                    className="gap-1"
                  >
                    {t.tipo === "ingreso" ? (
                      <ArrowUpCircle className="h-3 w-3" />
                    ) : (
                      <ArrowDownCircle className="h-3 w-3" />
                    )}
                    <span className="capitalize">{t.tipo}</span>
                  </Badge>
                </TableCell>
                <TableCell>{t.categoria}</TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={t.descripcion || ""}
                >
                  {t.descripcion || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    t.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.tipo === "egreso" ? "-" : "+"}
                  {formatCurrency(t.monto)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
