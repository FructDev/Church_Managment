/* eslint-disable @typescript-eslint/no-explicit-any */
// components/finanzas/presupuestos/PresupuestoFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  presupuestoSchema,
  type PresupuestoFormValues,
} from "@/lib/validations/finanzas.schema";
// --- ¡INICIO DE CORRECCIÓN! ---
// Importamos el TIPO desde la Server Action, no desde 'columns'
import {
  upsertPresupuesto,
  type PresupuestoParaTabla,
} from "@/actions/finanzas/presupuestosActions";
// --- FIN DE CORRECCIÓN ---
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PresupuestoFormDialogProps {
  mode: "add" | "edit";
  presupuesto?: PresupuestoParaTabla;
  children: React.ReactNode;
}

export function PresupuestoFormDialog({
  mode,
  presupuesto,
  children,
}: PresupuestoFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: {
      id: presupuesto?.id || null,
      nombre: presupuesto?.nombre || "",
      anio: presupuesto?.anio || new Date().getFullYear(),
      // 'descripcion' no está en 'PresupuestoParaTabla', usamos 'any' o lo añadimos
      descripcion: (presupuesto as any)?.descripcion || "",
      tipo: "anual",
    },
  });

  const onSubmit = async (data: PresupuestoFormValues) => {
    startTransition(async () => {
      const result = await upsertPresupuesto(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        if (mode === "add") form.reset();
      } else {
        toast.error("Error al guardar", { description: result.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Crear Nuevo Presupuesto" : "Editar Presupuesto"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Cree un nuevo presupuesto anual."
              : `Editando ${presupuesto?.nombre}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Presupuesto Anual 2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año</FormLabel>
                  <FormControl>
                    {/* --- ¡INICIO DE CORRECCIÓN! --- */}
                    {/* Aplicamos el mismo fix que a 'monto' */}
                    <Input
                      type="number"
                      placeholder="2025"
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={mode === "edit"}
                    />
                    {/* --- FIN DE CORRECCIÓN --- */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción breve..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
