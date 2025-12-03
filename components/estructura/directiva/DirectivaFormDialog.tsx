// components/estructura/directiva/DirectivaFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  directivaSchema,
  type DirectivaFormValues,
} from "@/lib/validations/estructura.schema";
import {
  upsertDirectiva,
  type DirectivaConMiembro,
} from "@/actions/estructura/directivasActions";

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

interface DirectivaFormDialogProps {
  mode: "add" | "edit";
  sociedadId: string; // Siempre requerido
  cargosEnum: string[];
  miembros: MiembroSimple[];
  directiva?: DirectivaConMiembro; // Opcional, solo para 'edit'
  children: React.ReactNode;
}

export function DirectivaFormDialog({
  mode,
  sociedadId,
  cargosEnum,
  miembros,
  directiva,
  children,
}: DirectivaFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(directivaSchema),
    defaultValues: {
      id: directiva?.id || null,
      sociedad_id: sociedadId, // ID de la sociedad actual
      miembro_id: directiva?.miembro?.id || "",
      cargo: (directiva?.cargo as DirectivaFormValues["cargo"]) || undefined,
      fecha_inicio: directiva?.fecha_inicio
        ? new Date(directiva.fecha_inicio).toISOString().split("T")[0]
        : "",
      activo: directiva?.activo ?? true,
    },
  });

  function onSubmit(data: DirectivaFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await upsertDirectiva(data);
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
            {mode === "add" ? "Añadir Miembro a Directiva" : "Editar Miembro"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Seleccione el miembro y asigne un cargo."
              : `Editando a ${directiva?.miembro?.nombre_completo || ""}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cargosEnum.map((cargo) => (
                        <SelectItem
                          key={cargo}
                          value={cargo}
                          className="capitalize"
                        >
                          {cargo.replace("_", " ")}
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
              name="fecha_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
