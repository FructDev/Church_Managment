/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { deleteCategoria } from "@/actions/configuracion/configuracionActions";
import { CategoriaFormDialog } from "./CategoriaFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

export function CategoriasList({
  data,
  tipo,
}: {
  data: any[];
  tipo: "ingreso" | "egreso";
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoria(tipo, id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="grid gap-4">
      {data.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-card"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{cat.nombre}</span>
              {!cat.activo && (
                <Badge variant="secondary" className="text-[10px]">
                  Inactivo
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {cat.descripcion || "Sin descripción"}
            </p>
          </div>
          <div className="flex gap-2">
            <CategoriaFormDialog tipo={tipo} mode="edit" categoria={cat}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </CategoriaFormDialog>
            <ConfirmAlertDialog
              title="¿Eliminar Categoría?"
              description="Si esta categoría tiene transacciones, no se podrá eliminar (deberá desactivarla)."
              onConfirm={() => handleDelete(cat.id)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmAlertDialog>
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-center text-muted-foreground">
          No hay categorías registradas.
        </p>
      )}
    </div>
  );
}
