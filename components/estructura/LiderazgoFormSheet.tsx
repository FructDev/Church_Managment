// components/estructura/LiderazgoFormSheet.tsx
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStatus } from "react-dom";
import {
  updateLiderazgo,
  type LiderazgoConMiembro,
} from "@/actions/estructura/liderazgoActions";
import { Database } from "@/lib/database.types";

type MiembroSimple = { id: string; nombre_completo: string };
type CargoEnum = Database["public"]["Enums"]["cargo_liderazgo"];

interface LiderazgoFormProps {
  item: LiderazgoConMiembro;
  miembros: MiembroSimple[];
  cargosEnum: CargoEnum[];
  children: React.ReactNode;
}

// Botón de envío con estado 'pending'
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  );
}

export function LiderazgoFormSheet({
  item,
  miembros,
  children,
}: LiderazgoFormProps) {
  const [open, setOpen] = React.useState(false);

  // Usamos 'useRef' para el formulario
  const formRef = React.useRef<HTMLFormElement>(null);

  // Función 'action' del formulario
  const formAction = async (formData: FormData) => {
    const result = await updateLiderazgo(formData);
    if (result.success) {
      setOpen(false);
      // Aquí podrías añadir un 'Toast' de éxito
    } else {
      alert(result.message); // Alerta simple por ahora
    }
  };

  // Formatear la fecha para el input type="date"
  const formattedDate = new Date(item.fecha_inicio).toISOString().split("T")[0];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="capitalize">
            Editar Cargo: {item.cargo.replace("_", " ")}
          </SheetTitle>
          <SheetDescription>
            Asigne un miembro y la fecha de inicio para este cargo de liderazgo.
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} action={formAction} className="grid gap-6 py-6">
          {/* ID Oculto */}
          <input type="hidden" name="id" value={item.id} />

          {/* Selector de Miembro */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="miembro_id">
              Miembro
            </Label>
            <Select name="miembro_id" defaultValue={item.miembro_id || "null"}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un miembro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">-- No Asignado --</SelectItem>
                {miembros.map((miembro) => (
                  <SelectItem key={miembro.id} value={miembro.id}>
                    {miembro.nombre_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de Inicio */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="fecha_inicio">
              Fecha Inicio
            </Label>
            <Input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              defaultValue={formattedDate}
            />
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </SheetClose>
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
