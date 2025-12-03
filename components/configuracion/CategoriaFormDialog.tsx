/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categoriaFinancieraSchema,
  type CategoriaFinancieraFormValues,
} from "@/lib/validations/configuracion.schema";
import { upsertCategoria } from "@/actions/configuracion/configuracionActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  tipo: "ingreso" | "egreso";
  categoria?: any;
  children: React.ReactNode;
  mode?: "add" | "edit";
}

// Opciones según la lógica de negocio de tu BD
const TIPOS_INGRESO = [
  { value: "general", label: "General" },
  { value: "diezmo", label: "Diezmo" },
  { value: "ofrenda", label: "Ofrenda" },
  { value: "actividad", label: "Actividad" },
  { value: "otro", label: "Otro" },
];

const TIPOS_EGRESO = [
  { value: "operativo", label: "Gasto Operativo (Luz, Agua, etc.)" },
  { value: "distribucion", label: "Distribución / Ayudas" },
  { value: "administrativo", label: "Administrativo" },
  { value: "ministerial", label: "Ministerial" },
  { value: "otro", label: "Otro" },
];

export function CategoriaFormDialog({
  tipo,
  categoria,
  children,
  mode = "add",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Elegimos la lista de opciones correcta
  const opcionesTipo = tipo === "ingreso" ? TIPOS_INGRESO : TIPOS_EGRESO;
  // Valor por defecto si es nuevo
  const defaultTipo = tipo === "ingreso" ? "general" : "operativo";

  const form = useForm({
    resolver: zodResolver(categoriaFinancieraSchema),
    defaultValues: {
      id: categoria?.id ?? null,
      nombre: categoria?.nombre || "",
      descripcion: categoria?.descripcion || "",
      // --- CAMPO TIPO ---
      tipo: categoria?.tipo || defaultTipo,
      // ------------------
      activo: categoria?.activo ?? true,
    },
  });

  const onSubmit = (data: CategoriaFinancieraFormValues) => {
    startTransition(async () => {
      const res = await upsertCategoria(tipo, data);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        if (mode === "add") form.reset();
      } else {
        toast.error(res.message);
      }
    });
  };

  const onInvalid = (errors: any) => console.log("Errores:", errors);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Nueva Categoría" : "Editar Categoría"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
          >
            <input type="hidden" {...form.register("id")} />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Mantenimiento A/C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- NUEVO SELECTOR DE TIPO --- */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clasificación</FormLabel>
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
                      {opcionesTipo.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ----------------------------- */}

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Activo</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Disponible para nuevos registros.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
