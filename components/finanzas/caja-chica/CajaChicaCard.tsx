/* eslint-disable @typescript-eslint/no-unused-vars */
// components/finanzas/caja-chica/CajaChicaCard.tsx
"use client";

import { type CajaChicaConResponsable } from "@/actions/finanzas/cajaChicaActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User } from "lucide-react";
import Link from "next/link";

// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

export function CajaChicaCard({ caja }: { caja: CajaChicaConResponsable }) {
  // Calcular progreso
  let progress = 0;
  if (caja.monto_asignado > 0) {
    progress = (caja.monto_disponible / caja.monto_asignado) * 100;
  }

  let progressColor = "bg-primary"; // Verde/Azul (Normal)
  if (progress < 25) progressColor = "bg-yellow-500"; // Advertencia
  if (progress < 10) progressColor = "bg-destructive"; // Peligro

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl capitalize truncate pr-2">
            {caja.nombre || "Caja Sin Nombre"}
          </CardTitle>
          <Badge variant={caja.estado === "activo" ? "default" : "destructive"}>
            {caja.estado === "activo" ? "Activa" : "Cerrada"}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Responsable: {caja.responsable?.nombre_completo || "N/A"}
        </CardDescription>
        <CardDescription className="text-xs">
          Iniciada el:{" "}
          {new Date(caja.periodo_inicio).toLocaleDateString("es-ES", {
            timeZone: "UTC",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="text-3xl font-bold">
            {formatCurrency(caja.monto_disponible)}
          </p>
          <p className="text-sm text-muted-foreground">
            Disponible de {formatCurrency(caja.monto_asignado)}
          </p>
        </div>
        <Progress value={progress} className="h-2 [&>div]:bg-primary" />
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/finanzas/caja-chica/${caja.id}`}>
            Ver Movimientos <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
