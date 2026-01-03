/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  ingresoSchema,
  type IngresoFormValues,
} from "@/lib/validations/finanzas.schema";
import { upsertIngreso } from "@/actions/finanzas/ingresosActions";
import { toast } from "sonner";
import { type SelectorOption } from "@/actions/finanzas/globalSelects";

// UI Components
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

// Tipos para props
interface Props {
  mode: "add" | "edit";
  ingreso?: any; // (Usar tipo real IngresoParaTabla)
  categorias: SelectorOption[];
  cajas: SelectorOption[];
  actividadId?: string;
  children: React.ReactNode;
}

type MetodoPago = "efectivo" | "transferencia" | "cheque" | "tarjeta" | "otro";
const metodosPago: MetodoPago[] = [
  "efectivo",
  "transferencia",
  "cheque",
  "tarjeta",
  "otro",
];

export function IngresoFormDialog({
  mode,
  ingreso,
  categorias,
  cajas,
  actividadId,
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  // 1. Lógica para encontrar la "Caja General"
  const defaultCajaId = React.useMemo(() => {
    if (mode === "edit") return undefined;
    // Busca exactitud o coincidencia
    const general =
      cajas.find((c) => c.nombre.trim() === "Caja General") ||
      cajas.find((c) => c.nombre.toLowerCase().includes("general"));
    return general?.id;
  }, [cajas, mode]);

  const form = useForm({
    resolver: zodResolver(ingresoSchema),
    defaultValues: {
      id: ingreso?.id || null,
      fecha: new Date().toISOString().split("T")[0],
      monto: ingreso?.monto || undefined,
      categoria_ingreso_id: undefined,
      metodo_pago: "efectivo",
      descripcion: "",
      // Si encontramos la caja general, la ponemos. Si no, string vacío (que Zod rechazará, obligando a elegir)
      caja_destino_id: defaultCajaId || "",
    },
  });

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await upsertIngreso(formData);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Registrar Ingreso" : "Editar Ingreso"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form action={onSubmit} className="space-y-4 p-1">
            {/* Campos ocultos */}
            {ingreso?.id && (
              <input type="hidden" name="id" value={ingreso.id} />
            )}
            {actividadId && (
              <input type="hidden" name="actividad_id" value={actividadId} />
            )}
            {/* Fila 1: Fecha y Monto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} name="fecha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        name="monto"
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

            {/* Fila 2: Categoría */}
            <FormField
              control={form.control}
              name="categoria_ingreso_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name="categoria_ingreso_id"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fila 3: Caja Destino (Pre-seleccionada) */}
            <FormField
              control={form.control}
              name="caja_destino_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrar a Caja Chica</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name="caja_destino_id"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione Caja" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cajas.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {defaultCajaId && field.value === defaultCajaId && (
                    <p className="text-xs text-muted-foreground">
                      ✓ Caja General seleccionada por defecto
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodo_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name="metodo_pago"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {metodosPago.map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">
                          {m}
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
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Ofrenda general culto dominical"
                      className="resize-none"
                      {...field}
                      name="descripcion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Este campo está FUERA de RHF, pero DENTRO del <form> */}
            <FormItem>
              <FormLabel>Comprobante (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  name="comprobante_file"
                  accept="image/png, image/jpeg, application/pdf"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
