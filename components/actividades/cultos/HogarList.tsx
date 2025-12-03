/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Trash2, Edit, CalendarPlus } from "lucide-react";
import { HogarFormDialog } from "./HogarFormDialog";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { deleteHogarCulto } from "@/actions/actividades/cultosHogaresActions";
import { toast } from "sonner";
import { useTransition } from "react";
// 1. IMPORTAR EL FORMULARIO DE ACTIVIDAD
import { ActividadFormDialog } from "@/components/actividades/ActividadFormDialog";

export function HogarList({ hogares, miembros, canManage, tipos }: any) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteHogarCulto(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  // Helper para encontrar el ID del tipo "Culto Hogar"
  const tipoHogarId = tipos.find(
    (t: any) =>
      t.nombre.toLowerCase().includes("hogar") ||
      t.nombre.toLowerCase().includes("célula")
  )?.id;

  if (hogares.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No hay hogares registrados.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {hogares.map((h: any) => {
        // 2. PREPARAR DATOS PRE-LLENADOS PARA EL EVENTO
        const actividadPreLlenada = {
          titulo: `Célula: ${h.nombre_familia}`,
          ubicacion: `${h.direccion} ${h.sector ? `(${h.sector})` : ""}`,
          tipo: { nombre: "Culto en Hogar" }, // Solo referencial para el form
          // Buscamos el tipo ID correcto
          tipo_actividad_id: tipoHogarId,
          // Asignamos al líder como responsable
          responsable_id: h.lider_id || h.anfitrion_id,
          // Pre-seteamos la hora si la tiene el hogar
          fecha_inicio: h.hora_reunion
            ? `${new Date().toISOString().split("T")[0]}T${h.hora_reunion}`
            : undefined,
        };

        return (
          <Card key={h.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>{h.nombre_familia}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
              <div className="flex gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {h.direccion} {h.sector && `(${h.sector})`}
                </span>
              </div>
              <div className="flex gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {h.dia_reunion} - {h.hora_reunion || "Hora por definir"}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 space-y-2">
                <div className="flex gap-2 text-sm items-center">
                  <User className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Anfitrión:
                  </span>
                  <span className="font-medium">
                    {h.anfitrion?.nombre_completo || "N/A"}
                  </span>
                </div>
                <div className="flex gap-2 text-sm items-center">
                  <User className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">Líder:</span>
                  <span className="font-medium">
                    {h.lider?.nombre_completo || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>

            {canManage && (
              <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-muted/10">
                {/* 3. BOTÓN PRINCIPAL: PROGRAMAR CULTO */}
                <ActividadFormDialog
                  mode="add"
                  tipos={tipos}
                  sociedades={[]} // No aplica sociedad específica
                  miembros={miembros}
                  // Pasamos un objeto "fake" que simula una actividad existente para pre-llenar
                  // pero el modo es 'add' así que creará una nueva.
                  // TRUCO: Usamos el prop 'actividad' para defaults inteligentes
                  actividad={actividadPreLlenada as any}
                >
                  <Button className="w-full gap-2" variant="default">
                    <CalendarPlus className="h-4 w-4" />
                    Programar Culto
                  </Button>
                </ActividadFormDialog>

                <div className="flex justify-end gap-2 w-full">
                  <HogarFormDialog mode="edit" hogar={h} miembros={miembros}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </HogarFormDialog>
                  <ConfirmAlertDialog
                    title="Eliminar Hogar"
                    description="¿Seguro? Esto elimina la ubicación, no los cultos pasados."
                    onConfirm={() => handleDelete(h.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmAlertDialog>
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
