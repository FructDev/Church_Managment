// components/finanzas/diezmos/DiezmoLoteForm.tsx
"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  diezmoLoteSchema,
  type DiezmoLoteFormValues,
  type DiezmoLoteEntryValues,
} from "@/lib/validations/finanzas.schema";
import { registrarLoteDeDiezmos } from "@/actions/finanzas/diezmosActions";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";

type MiembroSimple = { id: string; nombre_completo: string };

interface LoteFormProps {
  miembros: MiembroSimple[];
}

const metodosPago: DiezmoLoteEntryValues["metodo_pago"][] = [
  "efectivo",
  "transferencia",
  "cheque",
  "tarjeta",
  "otro",
];

export function DiezmoLoteForm({ miembros }: LoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(diezmoLoteSchema),
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      tipo_periodo: "primera_quincena",
      entradas: [{ miembro_id: "", monto: 0, metodo_pago: "efectivo" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entradas",
  });

  // Calcular total en vivo
  const total = form
    .watch("entradas")
    .reduce((acc, entry) => acc + (Number(entry.monto) || 0), 0);

  function onSubmit(data: DiezmoLoteFormValues) {
    startTransition(async () => {
      const result = await registrarLoteDeDiezmos(data);
      if (result.success) {
        toast.success(result.message);
        router.push("/finanzas/diezmos"); // Redirigir a la lista de resúmenes
      } else {
        toast.error("Error al guardar el lote", {
          description: result.message,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección 1: Datos del Lote */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Lote</CardTitle>
            <CardDescription>
              Define la fecha y el período de este conteo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Conteo</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo_periodo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4 pt-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="primera_quincena" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          1ra Quincena
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="segunda_quincena" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          2da Quincena
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sección 2: Entradas del Lote */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Diezmos</CardTitle>
            <CardDescription>
              Añade cada sobre (miembro y monto) a la lista.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-end p-2 border rounded-md"
              >
                <FormField
                  control={form.control}
                  name={`entradas.${index}.miembro_id`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Miembro</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {miembros.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.nombre_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`entradas.${index}.monto`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          // 1. Convertir undefined/null a ""
                          value={field.value ?? ""}
                          // 2. Usar el onChange estándar.
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`entradas.${index}.metodo_pago`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Método</FormLabel>
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
                          {metodosPago.map((m) => (
                            <SelectItem
                              key={m}
                              value={m}
                              className="capitalize"
                            >
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ miembro_id: "", monto: 0, metodo_pago: "efectivo" })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Fila
            </Button>
          </CardContent>
        </Card>

        {/* Sección 3: Total y Envío */}
        <div className="flex justify-between items-center p-4 border rounded-md">
          <div className="text-2xl font-bold">
            Total:{" "}
            {new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(total)}
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending
              ? "Registrando Lote..."
              : "Registrar Lote y Calcular Distribución"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
