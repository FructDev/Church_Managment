/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  actividadSchema,
  type ActividadFormValues,
} from "@/lib/validations/actividades.schema";
import {
  upsertActividad,
  type ActividadCalendario,
} from "@/actions/actividades/actividadesActions";
import { toast } from "sonner";

// Componentes UI
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Tipos para los selectores
type TipoActividad = { id: string; nombre: string; color: string };
type Sociedad = { id: string; nombre: string };
type Miembro = { id: string; nombre_completo: string };

interface Props {
  mode: "add" | "edit";
  actividad?: ActividadCalendario;
  tipos: TipoActividad[];
  sociedades: Sociedad[];
  miembros: Miembro[]; // Para seleccionar responsable
  children: React.ReactNode;
}

export function ActividadFormDialog({
  mode,
  actividad,
  tipos,
  sociedades,
  miembros,
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  // Helpers para extraer fecha y hora de un ISO string
  const getDatePart = (iso?: string) =>
    iso
      ? new Date(iso).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
  const getTimePart = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "09:00";

  const form = useForm({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      id: actividad?.id || null,
      titulo: actividad?.titulo || "",
      descripcion: "", // La vista de calendario no suele traer descripción completa, se carga luego o se deja vacía
      tipo_actividad_id: actividad?.tipo?.nombre
        ? tipos.find((t) => t.nombre === actividad.tipo?.nombre)?.id
        : undefined,

      // Desglosamos Fecha y Hora
      fecha_inicio: getDatePart(actividad?.fecha_inicio),
      hora_inicio: getTimePart(actividad?.fecha_inicio),

      fecha_fin: getDatePart(actividad?.fecha_fin),
      hora_fin: getTimePart(actividad?.fecha_fin), // Default 1 hora después podría calcularse mejor

      todo_el_dia: actividad?.todo_el_dia || false,
      ubicacion: actividad?.ubicacion || "",
      responsable_id: undefined,
      es_recurrente: false,
    },
  });

  const onSubmit = async (data: ActividadFormValues) => {
    startTransition(async () => {
      const result = await upsertActividad(data);
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Nueva Actividad" : "Editar Actividad"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Culto de Oración" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_actividad_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
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
                        {tipos.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: t.color }}
                              />
                              {t.nombre}
                            </div>
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
                name="responsable_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional..." />
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
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border p-3 rounded-md bg-muted/20">
              <h4 className="text-sm font-medium">Horario</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hora_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hora_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="todo_el_dia"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Todo el día</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Templo Principal" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Actividad"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
