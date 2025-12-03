// components/finanzas/presupuestos/LineaPresupuestoForm.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  lineaPresupuestoSchema,
  type LineaPresupuestoFormValues,
} from "@/lib/validations/finanzas.schema";
import { createLineaPresupuesto } from "@/actions/finanzas/lineasPresupuestoActions";
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

type CategoriaSimple = { id: string; nombre: string };

interface LineaPresupuestoFormProps {
  presupuestoId: string;
  categoriasDisponibles: CategoriaSimple[];
}

export function LineaPresupuestoForm({
  presupuestoId,
  categoriasDisponibles,
}: LineaPresupuestoFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(lineaPresupuestoSchema),
    defaultValues: {
      presupuesto_id: presupuestoId,
      categoria_egreso_id: undefined,
      monto_presupuestado: 0,
    },
  });

  const onSubmit = async (data: LineaPresupuestoFormValues) => {
    startTransition(async () => {
      const result = await createLineaPresupuesto(data);
      if (result.success) {
        toast.success(result.message);
        form.reset({
          ...form.getValues(),
          categoria_egreso_id: undefined,
          monto_presupuestado: 0,
        });
      } else {
        toast.error("Error al añadir", { description: result.message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir Línea de Gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <FormField
              control={form.control}
              name="categoria_egreso_id"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Categoría de Gasto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasDisponibles.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="capitalize"
                        >
                          {c.nombre}
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
              name="monto_presupuestado"
              render={({ field }) => (
                <FormItem className="w-full md:w-48">
                  <FormLabel>Monto Presupuestado</FormLabel>
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

            <Button type="submit" disabled={isPending}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isPending ? "Añadiendo..." : "Añadir"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
