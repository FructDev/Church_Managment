// components/estructura/sociedades/SociedadFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  sociedadSchema,
  type SociedadFormValues,
} from "@/lib/validations/estructura.schema";
import {
  upsertSociedad,
  type SociedadConteo,
} from "@/actions/estructura/sociedadesActions";

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
import { Textarea } from "@/components/ui/textarea";

interface SociedadFormDialogProps {
  mode: "edit";
  sociedad: SociedadConteo;
  children: React.ReactNode;
}

export function SociedadFormDialog({
  mode,
  sociedad,
  children,
}: SociedadFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(sociedadSchema),
    defaultValues: {
      id: sociedad?.id || null,
      nombre: sociedad?.nombre as SociedadFormValues["nombre"],
      descripcion: sociedad?.descripcion || "",
      activo: true,
    },
  });

  function onSubmit(data: SociedadFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await upsertSociedad(data);
      if (result.success) {
        setOpen(false);
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
          <DialogTitle className="capitalize">
            Editar Sociedad: {sociedad.nombre}
          </DialogTitle>
          <DialogDescription>
            Actualice la descripción de la sociedad.
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
                  <FormLabel>Nombre (Bloqueado)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="capitalize" />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añada una descripción..."
                      className="resize-none"
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
