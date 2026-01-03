"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  movimientoCajaChicaSchema,
  type MovimientoCajaChicaFormValues,
} from "@/lib/validations/finanzas.schema";
import { addMovimientoCajaChica } from "@/actions/finanzas/cajaChicaActions";
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
import { PlusCircle, ArrowRightLeft, Landmark } from "lucide-react";

// Tipos simples
type SelectorSimple = { id: string; nombre: string | null };

interface MovimientoFormProps {
  cajaChicaId: string;
  cuentasBancarias: { id: string; nombre: string }[];
  otrasCajas: SelectorSimple[];
}

export function MovimientoForm({
  cajaChicaId,
  cuentasBancarias,
  otrasCajas,
}: MovimientoFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(movimientoCajaChicaSchema),
    defaultValues: {
      caja_chica_id: cajaChicaId,
      tipo: "gasto",
      monto: 0,
      concepto: "",
      fecha: new Date().toISOString().split("T")[0],
      cuenta_destino_id: undefined,
      caja_destino_id: undefined,
    },
  });

  const tipoSeleccionado = form.watch("tipo");

  const onSubmit = async (data: MovimientoCajaChicaFormValues) => {
    startTransition(async () => {
      const result = await addMovimientoCajaChica(data);
      if (result.success) {
        toast.success(result.message);
        form.reset({
          ...form.getValues(),
          monto: 0,
          concepto: "",
          tipo: "gasto",
          cuenta_destino_id: undefined,
          caja_destino_id: undefined,
        });
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Movimiento</CardTitle>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Operación</FormLabel>
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
                        <SelectItem value="gasto">Gasto Vario (-)</SelectItem>
                        <SelectItem value="reposicion">
                          Ingresar Dinero (+)
                        </SelectItem>
                        <SelectItem value="deposito_banco">
                          Depositar a Banco (-)
                        </SelectItem>
                        <SelectItem value="transferencia_caja">
                          Transferir a otra Caja (-)
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

            {/* --- SELECTORES CONDICIONALES --- */}

            {/* Caso: Depósito a Banco */}
            {tipoSeleccionado === "deposito_banco" && (
              <div className="p-3 border rounded-md bg-muted/30 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <Landmark className="h-5 w-5 text-primary" />
                <FormField
                  control={form.control}
                  name="cuenta_destino_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-primary font-semibold">
                        Banco de Destino
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione Cuenta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cuentasBancarias.map((c) => (
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
              </div>
            )}

            {/* Caso: Transferencia a otra Caja */}
            {tipoSeleccionado === "transferencia_caja" && (
              <div className="p-3 border rounded-md bg-muted/30 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <FormField
                  control={form.control}
                  name="caja_destino_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-primary font-semibold">
                        Caja Chica de Destino
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione Caja..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {otrasCajas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nombre || "Caja sin nombre"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="concepto"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input placeholder="Detalle del movimiento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isPending ? "Procesando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
