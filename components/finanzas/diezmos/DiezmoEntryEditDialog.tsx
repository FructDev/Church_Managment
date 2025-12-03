// components/finanzas/diezmos/DiezmoEntryEditDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  diezmoEntryEditSchema,
  type DiezmoEntryEditFormValues,
} from "@/lib/validations/finanzas.schema";
import { updateDiezmoEntry } from "@/actions/finanzas/diezmosActions"; // La acción que ya creamos
import { type TransaccionDiezmoDetalle } from "@/actions/finanzas/diezmosActions";
import { toast } from "sonner";
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

interface DiezmoEntryEditDialogProps {
  transaccion: TransaccionDiezmoDetalle;
  diezmoId: string; // El ID del resumen (lote)
  children: React.ReactNode;
}

export function DiezmoEntryEditDialog({
  transaccion,
  diezmoId,
  children,
}: DiezmoEntryEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(diezmoEntryEditSchema),
    defaultValues: {
      monto: transaccion.monto || undefined,
    },
  });

  // Usamos 'handleSubmit' de RHF para llamar a la Server Action
  function onSubmit(data: DiezmoEntryEditFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await updateDiezmoEntry(
        transaccion.id,
        diezmoId,
        data.monto
      );
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        setError(result.message);
        toast.error("Error al actualizar", { description: result.message });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Monto</DialogTitle>
          <DialogDescription>
            Editando el monto para: <br />
            <strong className="font-medium text-foreground">
              {transaccion.miembro?.nombre_completo || "N/A"}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Monto</FormLabel>
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

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Actualizar Monto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
