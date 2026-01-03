// components/finanzas/diezmos/DiezmoLoteForm.tsx
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
// 1. IMPORTAR EL NUEVO SELECTOR
import { DiezmoMemberSelect } from "./DiezmoMemberSelect";

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
      // 2. ACTUALIZAR DEFAULT VALUES (Agregar nombre_externo)
      entradas: [{ miembro_id: "", nombre_externo: "", monto: 0, metodo_pago: "efectivo" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entradas",
  });

  const total = form
    .watch("entradas")
    .reduce((acc, entry) => acc + (Number(entry.monto) || 0), 0);

  function onSubmit(data: any) { // Usamos any temporalmente para evitar conflictos de tipo si el schema no está 100% actualizado
    startTransition(async () => {
      const result = await registrarLoteDeDiezmos(data);
      if (result.success) {
        toast.success(result.message);
        router.push("/finanzas/diezmos");
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

        <Card>
          <CardHeader>
            <CardTitle>Registros de Diezmos</CardTitle>
            <CardDescription>
              Añade cada sobre (miembro o externo) a la lista.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col md:flex-row gap-4 items-end p-4 border rounded-md bg-muted/10"
              >
                {/* 3. REEMPLAZO DEL SELECT POR EL COMPONENTE HÍBRIDO */}
                <div className="flex-1 w-full min-w-[250px]">
                  <FormLabel className="text-sm font-medium mb-2 block">
                    Miembro / Donante Externo
                  </FormLabel>
                  <DiezmoMemberSelect
                    miembros={miembros}
                    // Observamos los valores actuales del formulario
                    value={form.watch(`entradas.${index}.miembro_id`)}
                    externalName={form.watch(`entradas.${index}.nombre_externo`)}
                    onChange={(seleccion) => {
                      // Lógica de actualización dual
                      if (seleccion.id) {
                        // Es un miembro: Guardamos ID, borramos externo
                        form.setValue(`entradas.${index}.miembro_id`, seleccion.id);
                        form.setValue(`entradas.${index}.nombre_externo`, "");
                      } else {
                        // Es externo: Borramos ID, guardamos nombre
                        form.setValue(`entradas.${index}.miembro_id`, "");
                        form.setValue(`entradas.${index}.nombre_externo`, seleccion.nombre);
                      }
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`entradas.${index}.monto`}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-32">
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

                <FormField
                  control={form.control}
                  name={`entradas.${index}.metodo_pago`}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-40">
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
                  variant="ghost"
                  size="icon"
                  className="mb-0.5 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                // 4. ACTUALIZAR APPEND PARA INCLUIR CAMPO EXTERNO
                append({ miembro_id: "", nombre_externo: "", monto: 0, metodo_pago: "efectivo" })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Fila
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center p-4 border rounded-md bg-background sticky bottom-4 shadow-lg">
          <div className="text-xl md:text-2xl font-bold">
            Total:{" "}
            <span className="text-green-600">
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(total)}
            </span>
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Procesando..." : "Registrar Lote"}
          </Button>
        </div>
      </form>
    </Form>
  );
}