"use client";

import { type ActividadFinancieraResumen } from "@/actions/actividades/financierasActions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

export function ActividadFinancieraCard({
  actividad,
}: {
  actividad: ActividadFinancieraResumen;
}) {
  const isPositive = actividad.balance >= 0;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">
              {actividad.titulo}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(actividad.fecha_inicio).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={
              actividad.estado === "completada" ? "secondary" : "default"
            }
          >
            {actividad.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Ingresos
            </span>
            <span className="font-bold text-green-700 dark:text-green-400">
              {formatCurrency(actividad.total_ingresos)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Gastos
            </span>
            <span className="font-bold text-red-700 dark:text-red-400">
              {formatCurrency(actividad.total_egresos)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t flex justify-between items-center">
          <span className="font-medium">Balance Neto:</span>
          <span
            className={`text-lg font-bold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(actividad.balance)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/actividades/financieras/${actividad.id}`}>
            Ver Detalle Financiero <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
