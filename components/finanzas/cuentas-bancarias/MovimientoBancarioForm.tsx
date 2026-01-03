// components/finanzas/cuentas-bancarias/MovimientoBancarioForm.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  movimientoBancarioSchema,
  type MovimientoBancarioFormValues,
} from "@/lib/validations/finanzas.schema";
import {
  addMovimientoBancario,
  type CuentaBancariaParaTabla,
} from "@/actions/finanzas/cuentasBancariasActions";
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
import { PlusCircle } from "lucide-react";

interface MovimientoBancarioFormProps {
  cuentaActual: CuentaBancariaParaTabla;
  otrasCuentas: CuentaBancariaParaTabla[];
}

export function MovimientoBancarioForm({
  cuentaActual,
  otrasCuentas,
}: MovimientoBancarioFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(movimientoBancarioSchema),
    defaultValues: {
      cuenta_id: cuentaActual.id,
      tipo: "retiro",
      monto: 0,
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
      referencia: "",
      cuenta_destino_id: null,
    },
  });

  // Observamos el valor del campo 'tipo'
  const tipoMovimiento = form.watch("tipo");

  const onSubmit = async (data: MovimientoBancarioFormValues) => {
    startTransition(async () => {
      const result = await addMovimientoBancario(data);
      if (result.success) {
        toast.success(result.message);
        form.reset({
          ...form.getValues(),
          monto: 0,
          descripcion: "",
          referencia: "",
          cuenta_destino_id: null,
        });
      } else {
        toast.error("Error al registrar", { description: result.message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Movimiento en {cuentaActual.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
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
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimiento</FormLabel>
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
                        <SelectItem value="deposito">Depósito (+)</SelectItem>
                        <SelectItem value="retiro">Retiro (-)</SelectItem>
                        <SelectItem value="transferencia">
                          Transferencia (-)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={(field.value as any) ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción / Concepto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Depósito de ofrenda, Pago de luz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- LÓGICA CONDICIONAL --- */}
              {tipoMovimiento === "transferencia" ? (
                <FormField
                  control={form.control}
                  name="cuenta_destino_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta de Destino</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione cuenta destino..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {otrasCuentas.map((cuenta) => (
                            <SelectItem key={cuenta.id} value={cuenta.id}>
                              {cuenta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="referencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencia (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: No. de Cheque, Ref. bancaria"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isPending ? "Guardando..." : "Añadir Movimiento"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
