/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  tipoActividadSchema,
  type TipoActividadFormValues,
} from "@/lib/validations/actividades.schema";
import { upsertTipoActividad } from "@/actions/actividades/actividadesActions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Opciones de colores predefinidos para facilitar
const predefinedColors = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Verde", value: "#22c55e" },
  { name: "Naranja", value: "#f97316" },
  { name: "Morado", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cian", value: "#06b6d4" },
  { name: "Amarillo", value: "#eab308" },
];

interface Props {
  mode: "add" | "edit";
  tipo?: any; // Tipo completo de la BD
  children: React.ReactNode;
}

export function TipoActividadFormDialog({ mode, tipo, children }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(tipoActividadSchema),
    defaultValues: {
      id: tipo?.id || null,
      nombre: tipo?.nombre || "",
      categoria: tipo?.categoria || "culto_regular",
      color: tipo?.color || "#3b82f6",
      periodicidad: tipo?.periodicidad || "eventual",
    },
  });

  const onSubmit = async (data: TipoActividadFormValues) => {
    startTransition(async () => {
      const result = await upsertTipoActividad(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        if (mode === "add") form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Nuevo Tipo de Actividad" : "Editar Tipo"}
          </DialogTitle>
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
                    <Input placeholder="Ej: Almuerzo Pro-Fondos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
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
                        <SelectItem value="culto_regular">
                          Culto Regular
                        </SelectItem>
                        <SelectItem value="culto_sociedad">
                          Culto Sociedad
                        </SelectItem>
                        <SelectItem value="actividad_financiera">
                          Actividad Financiera
                        </SelectItem>
                        <SelectItem value="evento_especial">
                          Evento Especial
                        </SelectItem>
                        <SelectItem value="retiro">Retiro</SelectItem>
                        <SelectItem value="reunion">Reunión</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex gap-2 items-center">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-12 p-1 h-9"
                          {...field}
                        />
                      </FormControl>
                      <span className="text-xs text-muted-foreground">
                        Selecciona o usa presets:
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {predefinedColors.map((c) => (
                        <div
                          key={c.value}
                          className="w-6 h-6 rounded-full cursor-pointer border border-gray-200"
                          style={{ backgroundColor: c.value }}
                          onClick={() => form.setValue("color", c.value)}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full mt-4">
              {isPending ? "Guardando..." : "Guardar Tipo"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
