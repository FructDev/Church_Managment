/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  claseEbSchema,
  type ClaseEbFormValues,
} from "@/lib/validations/actividades.schema";
import { upsertClaseEB } from "@/actions/actividades/escuelaBiblicaActions";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  clase?: any;
  maestros: { id: string; nombre_completo: string }[];
  children: React.ReactNode;
}

export function ClaseEbFormDialog({ clase, maestros, children }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(claseEbSchema),
    defaultValues: {
      id: clase?.id || null,
      nombre: clase?.nombre || "",
      aula: clase?.aula || "",
      maestro_id: clase?.maestro_id || undefined,
      activo: clase?.activo ?? true,
    },
  });

  const onSubmit = (data: ClaseEbFormValues) => {
    startTransition(async () => {
      const res = await upsertClaseEB(data);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        form.reset();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{clase ? "Editar Clase" : "Nueva Clase"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Clase</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Adultos, Niños" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula / Lugar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Salón 2"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maestro_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maestro Principal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maestros.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nombre_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
