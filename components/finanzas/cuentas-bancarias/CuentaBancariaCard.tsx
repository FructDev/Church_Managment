// components/finanzas/cuentas-bancarias/CuentaBancariaCard.tsx
"use client";

import { type CuentaBancariaParaTabla } from "@/actions/finanzas/cuentasBancariasActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Landmark } from "lucide-react";
import Link from "next/link";

// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

export function CuentaBancariaCard({
  cuenta,
}: {
  cuenta: CuentaBancariaParaTabla;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl capitalize">
              {cuenta.nombre}
            </CardTitle>
          </div>
          <Badge variant={cuenta.activa ? "default" : "destructive"}>
            {cuenta.activa ? "Activa" : "Inactiva"}
          </Badge>
        </div>
        <CardDescription className="capitalize">
          {cuenta.banco} - {cuenta.tipo_cuenta}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="text-3xl font-bold">
            {formatCurrency(cuenta.saldo_actual)}
          </p>
          <p className="text-sm text-muted-foreground">Saldo Actual</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Número: ...{cuenta.numero_cuenta.slice(-4)}
        </p>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/finanzas/cuentas-bancarias/${cuenta.id}`}>
            Ver Movimientos <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
