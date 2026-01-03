// components/finanzas/cuentas-bancarias/CuentaBancariaFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  cuentaBancariaSchema,
  type CuentaBancariaFormValues,
} from "@/lib/validations/finanzas.schema";
import { createCuentaBancaria } from "@/actions/finanzas/cuentasBancariasActions";
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
import { Textarea } from "@/components/ui/textarea";

interface CuentaBancariaFormDialogProps {
  children: React.ReactNode;
}

export function CuentaBancariaFormDialog({
  children,
}: CuentaBancariaFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(cuentaBancariaSchema),
    defaultValues: {
      nombre: "",
      banco: "",
      numero_cuenta: "",
      tipo_cuenta: "corriente",
      saldo_actual: 0,
      activa: true,
      notas: "",
    },
  });

  const onSubmit = async (data: CuentaBancariaFormValues) => {
    startTransition(async () => {
      const result = await createCuentaBancaria(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
        router.refresh(); // Refresca la lista de cuentas
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
          <DialogTitle>Crear Nueva Cuenta Bancaria</DialogTitle>
          <DialogDescription>
            Añada una nueva cuenta y su saldo inicial.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Cuenta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Banreservas Corriente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Banreservas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo_cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
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
                        <SelectItem value="corriente">Corriente</SelectItem>
                        <SelectItem value="ahorro">Ahorro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero_cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cuenta</FormLabel>
                    <FormControl>
                      <Input placeholder="960..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saldo_actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={(field.value as any) ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
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
                {isPending ? "Creando..." : "Crear Cuenta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
