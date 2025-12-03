// components/estructura/diaconos/DiaconoFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  diaconoSchema,
  type DiaconoFormValues,
} from "@/lib/validations/estructura.schema";
import {
  upsertDiacono,
  type DiaconoConMiembro,
} from "@/actions/estructura/diaconosActions";

// Componentes Shadcn
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MiembroSimple = { id: string; nombre_completo: string };

interface DiaconoFormDialogProps {
  mode: "add" | "edit";
  diacono?: DiaconoConMiembro;
  miembros: MiembroSimple[];
  children: React.ReactNode; // El botón que abre el dialog
}

export function DiaconoFormDialog({
  mode,
  diacono,
  miembros,
  children,
}: DiaconoFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(diaconoSchema),
    defaultValues: {
      id: diacono?.id || null,
      miembro_id: diacono?.miembro?.id || "",
      fecha_nombramiento: diacono?.fecha_nombramiento
        ? new Date(diacono.fecha_nombramiento).toISOString().split("T")[0]
        : "",
      areas_servicio: (diacono?.areas_servicio as string[])?.join(", ") || "",
      activo: diacono?.activo ?? true,
    },
  });

  function onSubmit(data: DiaconoFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await upsertDiacono(data);
      if (result.success) {
        setOpen(false);
        form.reset();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Añadir Diácono" : "Editar Diácono"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Complete los datos para añadir un nuevo diácono."
              : `Editando los datos de ${diacono?.miembro?.nombre_completo || ""
              }`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 overflow-y-auto max-h-[75vh] p-1 pr-3"
          >
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <FormField
              control={form.control}
              name="miembro_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miembro</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un miembro" />
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
              name="fecha_nombramiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nombramiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areas_servicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Áreas de Servicio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Visitas, Enseñanza, Limpieza"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
