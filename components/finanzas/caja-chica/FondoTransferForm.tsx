"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  fondoTransferSchema,
  type FondoTransferFormValues,
} from "@/lib/validations/finanzas.schema";
import {
  transferirACuentaBancaria,
  transferirEntreCajas,
} from "@/actions/finanzas/cajaChicaActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CornerDownRight,
  ArrowRightLeft,
  Landmark,
} from "lucide-react";

type CuentaSimple = { id: string; nombre: string };
type CajaSimple = { id: string; nombre: string | null };

interface TransferFormProps {
  cajaOrigen: CajaSimple; // La caja que estamos viendo
  otrasCajas: CajaSimple[];
  cuentasBancarias: CuentaSimple[];
}

export function FondoTransferForm({
  cajaOrigen,
  otrasCajas,
  cuentasBancarias,
}: TransferFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(fondoTransferSchema),
    defaultValues: {
      origen_id: cajaOrigen.id,
      origen_tipo: "caja_chica",
      destino_tipo: "caja_chica", // Default: Transferir a otra caja
      destino_id: "",
      monto: 0,
      fecha: new Date().toISOString().split("T")[0],
      concepto: "",
    },
  });

  // Observamos el destino para cambiar la lógica visual
  const tipoDestino = form.watch("destino_tipo");

  const onSubmit = async (data: FondoTransferFormValues) => {
    startTransition(async () => {
      let result: { success: boolean; message: string };

      if (data.destino_tipo === "banco") {
        result = await transferirACuentaBancaria(data);
      } else if (data.destino_tipo === "caja_chica") {
        result = await transferirEntreCajas(data);
      } else {
        return; // No debería pasar
      }

      if (result.success) {
        toast.success(result.message);
        form.reset({
          ...form.getValues(),
          monto: 0,
          concepto: "",
          destino_id: "", // Limpiar ID destino
        });
      } else {
        toast.error("Error en Transferencia", { description: result.message });
      }
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <ArrowRightLeft className="h-5 w-5" />
          Transferir Fondos desde: {cajaOrigen.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* 1. TIPO DE DESTINO (CAJA O BANCO) */}
              <FormField
                control={form.control}
                name="destino_tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="caja_chica">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Otra Caja
                          </div>
                        </SelectItem>
                        <SelectItem value="banco">
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4" /> Banco
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. SELECTOR DE DESTINO ESPECÍFICO */}
              <FormField
                control={form.control}
                name="destino_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Seleccionar {tipoDestino === "banco" ? "Cuenta" : "Caja"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Seleccionar ${tipoDestino}...`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tipoDestino === "caja_chica" &&
                          otrasCajas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nombre || "Sin nombre"}
                            </SelectItem>
                          ))}
                        {tipoDestino === "banco" &&
                          cuentasBancarias.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3. Monto */}
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto a Transferir</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 4. Fecha */}
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="concepto"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Motivo de la transferencia..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} variant="secondary">
                <CornerDownRight className="mr-2 h-4 w-4" />
                {isPending ? "Transfiriendo..." : "Confirmar Transferencia"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
