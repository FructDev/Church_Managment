// components/finanzas/caja-chica/CajaChicaFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  cajaChicaSchema,
  type CajaChicaFormValues,
} from "@/lib/validations/finanzas.schema";
import { createCajaChica } from "@/actions/finanzas/cajaChicaActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface CajaChicaFormDialogProps {
  miembros: MiembroSimple[];
  children: React.ReactNode;
}

export function CajaChicaFormDialog({
  miembros,
  children,
}: CajaChicaFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(cajaChicaSchema),
    defaultValues: {
      nombre: "",
      responsable_id: undefined,
      monto_asignado: 0,
      periodo_inicio: new Date().toISOString().split("T")[0],
      estado: "activo",
    },
  });

  const onSubmit = async (data: CajaChicaFormValues) => {
    startTransition(async () => {
      const result = await createCajaChica(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
        router.refresh(); // Refresca la lista de cajas
      } else {
        toast.error("Error al crear", { description: result.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Caja Chica</DialogTitle>
          <DialogDescription>
            Asigne un monto inicial y un responsable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Caja</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Caja Secretaría, Caja Eventos"
                      {...field}
                    />
                  </FormControl>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto_asignado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Asignado (Inicial)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodo_inicio"
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
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear Caja"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
