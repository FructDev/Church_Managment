// components/estructura/comites/ComiteFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  comiteSchema,
  type ComiteFormValues,
} from "@/lib/validations/estructura.schema";
import { upsertComite } from "@/actions/estructura/comitesActions";

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
import { type Database } from "@/lib/database.types";

type ComiteTipo = Database["public"]["Enums"]["tipo_comite"];
type Comite = {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
};

interface ComiteFormDialogProps {
  mode: "add" | "edit";
  comite?: Comite;
  tiposComite: ComiteTipo[];
  children: React.ReactNode;
}

export function ComiteFormDialog({
  mode,
  comite,
  tiposComite,
  children,
}: ComiteFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(comiteSchema),
    defaultValues: {
      id: comite?.id || null,
      nombre: comite?.nombre || "",
      descripcion: comite?.descripcion || "",
      tipo: (comite?.tipo as ComiteTipo) || undefined,
      activo: true, // Asumimos que al editar/crear está activo
    },
  });

  function onSubmit(data: ComiteFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await upsertComite(data);
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
            {mode === "add" ? "Crear Nuevo Comité" : "Editar Comité"}
          </DialogTitle>
          <DialogDescription>
            Defina el nombre y el tipo del comité.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Comité</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Comité de Finanzas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposComite.map((tipo) => (
                        <SelectItem
                          key={tipo}
                          value={tipo}
                          className="capitalize"
                        >
                          {tipo.replace("_", " ")}
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descripción..." {...field} />
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
