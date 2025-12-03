/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { TipoActividadFormDialog } from "./TipoActividadFormDialog";
import { deleteTipoActividad } from "@/actions/actividades/actividadesActions";
import { toast } from "sonner";
import { useTransition } from "react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

export function TiposList({ tipos }: { tipos: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTipoActividad(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tipos.map((tipo) => (
        <Card key={tipo.id}>
          <CardContent className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tipo.color }}
              />
              <div>
                <h3 className="font-medium">{tipo.nombre}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {tipo.categoria.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <TipoActividadFormDialog mode="edit" tipo={tipo}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </TipoActividadFormDialog>

              <ConfirmAlertDialog
                title="Eliminar Tipo"
                description="¿Seguro? Esto fallará si ya hay actividades creadas con este tipo."
                onConfirm={() => handleDelete(tipo.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ConfirmAlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
