"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inscripcionEbSchema,
  type InscripcionEbFormValues,
} from "@/lib/validations/actividades.schema";
import { inscribirAlumnoEB } from "@/actions/actividades/escuelaBiblicaActions";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  claseId: string;
  miembros: { id: string; nombre_completo: string }[];
  children: React.ReactNode;
}

export function InscripcionDialog({ claseId, miembros, children }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InscripcionEbFormValues>({
    resolver: zodResolver(inscripcionEbSchema),
    defaultValues: {
      clase_id: claseId,
      miembro_id: "",
    },
  });

  const onSubmit = (data: InscripcionEbFormValues) => {
    startTransition(async () => {
      const res = await inscribirAlumnoEB(data.clase_id, data.miembro_id);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        form.reset({ ...form.getValues(), miembro_id: "" }); // Reseteamos solo el miembro
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscribir Alumno</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ID Oculto */}
            <input
              type="hidden"
              {...form.register("clase_id")}
              value={claseId}
            />

            <FormField
              control={form.control}
              name="miembro_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleccionar Miembro</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar miembro..." />
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

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Inscribiendo..." : "Inscribir"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
