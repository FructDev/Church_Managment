// components/estructura/comites/MiembroComiteFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  comiteMiembroSchema,
  type ComiteMiembroFormValues,
} from "@/lib/validations/estructura.schema";
import { addComiteMiembro } from "@/actions/estructura/comiteMiembrosActions";

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

interface MiembroComiteFormDialogProps {
  comiteId: string;
  miembros: MiembroSimple[];
  children: React.ReactNode;
}

export function MiembroComiteFormDialog({
  comiteId,
  miembros,
  children,
}: MiembroComiteFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(comiteMiembroSchema),
    defaultValues: {
      comite_id: comiteId,
      miembro_id: "",
      responsabilidad: "",
      fecha_ingreso: new Date().toISOString().split("T")[0], // Hoy por defecto
      activo: true,
    },
  });

  function onSubmit(data: ComiteMiembroFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await addComiteMiembro(data);
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
          <DialogTitle>Añadir Miembro al Comité</DialogTitle>
          <DialogDescription>
            Seleccione el miembro y asigne una responsabilidad.
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
              name="responsabilidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsabilidad (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Presidente, Tesorero, Vocal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_ingreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Ingreso</FormLabel>
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
                {isPending ? "Añadiendo..." : "Añadir Miembro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
