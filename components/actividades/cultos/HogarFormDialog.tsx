"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hogarSchema,
  type HogarFormValues,
  // upsertHogarCulto,
} from "@/lib/validations/actividades.schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertHogarCulto } from "@/actions/actividades/cultosHogaresActions";
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

// Definimos un tipo más flexible para el hogar que viene de la BD
type HogarData = {
  id: string;
  nombre_familia: string;
  direccion: string;
  sector: string | null;
  anfitrion_id: string | null;
  lider_id: string | null;
  dia_reunion: string | null;
  hora_reunion: string | null;
  activo: boolean | null;
};

interface Props {
  hogar?: HogarData;
  miembros: { id: string; nombre_completo: string }[];
  children: React.ReactNode;
  mode?: "add" | "edit";
}

export function HogarFormDialog({
  hogar,
  miembros,
  children,
  mode = "add",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(hogarSchema),
    defaultValues: {
      id: hogar?.id || null,
      nombre_familia: hogar?.nombre_familia || "",
      direccion: hogar?.direccion || "",
      sector: hogar?.sector || "",
      // Convertimos null a undefined para el formulario
      anfitrion_id: hogar?.anfitrion_id || undefined,
      lider_id: hogar?.lider_id || undefined,
      dia_reunion: hogar?.dia_reunion || "Lunes",
      hora_reunion: hogar?.hora_reunion || "19:30",
      activo: hogar?.activo ?? true,
    },
  });

  const onSubmit = (data: HogarFormValues) => {
    startTransition(async () => {
      const res = await upsertHogarCulto(data);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        form.reset();
      } else {
        toast.error(res.message);
      }
    });
  };

  const dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Registrar Nuevo Hogar" : "Editar Hogar"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre_familia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Familia / Nombre del Lugar</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Familia Rodríguez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Calle 123..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Centro"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="anfitrion_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anfitrión (Dueño)</FormLabel>
                    {/* CORRECCIÓN: value={field.value || undefined} */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
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
                name="lider_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Líder (Quien dirige)</FormLabel>
                    {/* CORRECCIÓN: value={field.value || undefined} */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dia_reunion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día de Reunión</FormLabel>
                    {/* CORRECCIÓN: value={field.value || undefined} */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dias.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
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
                name="hora_reunion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Guardando..." : "Guardar Hogar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
