/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  egresoSchema,
  type EgresoFormValues,
} from "@/lib/validations/finanzas.schema";
import {
  upsertEgreso,
  type EgresoParaTabla,
} from "@/actions/finanzas/egresosActions";
import { toast } from "sonner";

// Components
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

// Tipos para los selectores
type Categoria = { id: string; nombre: string };
type SelectorOption = { id: string; nombre: string }; // Para cajas y cuentas

interface Props {
  mode: "add" | "edit";
  egreso?: EgresoParaTabla;
  categorias: Categoria[];
  cajas: SelectorOption[];
  cuentas: SelectorOption[];
  actividadId?: string;
  children: React.ReactNode;
}

export function EgresoFormDialog({
  mode,
  egreso,
  categorias,
  cajas,
  cuentas,
  actividadId,
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm({
    resolver: zodResolver(egresoSchema),
    defaultValues: {
      id: egreso?.id || null,
      fecha: egreso?.fecha
        ? new Date(egreso.fecha).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      categoria_egreso_id: undefined,
      monto: egreso?.monto || undefined,
      metodo_pago: (egreso?.metodo_pago as any) || "efectivo",
      descripcion: egreso?.descripcion || "",
      beneficiario_proveedor: egreso?.beneficiario_proveedor || "",
      // Origen de fondos
      fondo_origen_tipo: "ninguno",
      fondo_origen_id: undefined,
    },
  });

  // Para observar qué tipo de fondo eligió el usuario
  const tipoFondo = form.watch("fondo_origen_tipo");

  // Efecto para setear categoría al editar
  React.useEffect(() => {
    if (mode === "edit" && egreso?.categoria_egreso?.nombre) {
      const catId = categorias.find(
        (c) => c.nombre === egreso.categoria_egreso?.nombre
      )?.id;
      if (catId) form.setValue("categoria_egreso_id", catId);
    }
  }, [egreso, categorias, form, mode]);

  const handleFormAction = async (formData: FormData) => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Revise los campos marcados.");
      return;
    }
    startTransition(async () => {
      const result = await upsertEgreso(formData);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Registrar Egreso" : "Editar Egreso"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            ref={formRef}
            action={handleFormAction}
            className="space-y-4 p-1 overflow-y-auto max-h-[75vh]"
          >
            {egreso?.id && <input type="hidden" name="id" value={egreso.id} />}
            {actividadId && (
              <input type="hidden" name="actividad_id" value={actividadId} />
            )}

            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="categoria_egreso_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name="categoria_egreso_id"
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

            {/* --- SECCIÓN DE ORIGEN DE FONDOS --- */}
            <div className="p-3 bg-muted/30 rounded-md space-y-3 border">
              <h4 className="text-sm font-semibold text-primary">
                ¿De dónde sale el dinero?
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fondo_origen_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Fondo</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("fondo_origen_id", "null"); // Resetear ID al cambiar tipo
                        }}
                        defaultValue={field.value}
                        name="fondo_origen_tipo"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ninguno">-- Ninguno --</SelectItem>
                          <SelectItem value="caja_chica">Caja Chica</SelectItem>
                          <SelectItem value="banco">Cuenta Bancaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Selector Dinámico: Caja o Banco */}
                {tipoFondo === "caja_chica" && (
                  <FormField
                    control={form.control}
                    name="fondo_origen_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar Caja</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                          name="fondo_origen_id"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Caja..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cajas.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nombre || "Caja sin nombre"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {tipoFondo === "banco" && (
                  <FormField
                    control={form.control}
                    name="fondo_origen_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar Banco</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                          name="fondo_origen_id"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Cuenta..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cuentas.map((c) => (
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
                )}
              </div>
              {tipoFondo !== "ninguno" && (
                <p className="text-xs text-muted-foreground">
                  Se verificará si hay saldo suficiente antes de guardar.
                </p>
              )}
            </div>
            {/* --- FIN SECCIÓN DE FONDOS --- */}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metodo_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método</FormLabel>
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
                        {[
                          "efectivo",
                          "transferencia",
                          "cheque",
                          "tarjeta",
                          "otro",
                        ].map((m) => (
                          <SelectItem key={m} value={m} className="capitalize">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beneficiario_proveedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: EDEESTE"
                        {...field}
                        name="beneficiario_proveedor"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      {...field}
                      name="descripcion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Registrar Gasto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
