/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    type LineaPresupuestoConCategoria,
    deleteLineaPresupuesto,
} from "@/actions/finanzas/lineasPresupuestoActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Tag, TrendingUp } from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { Progress } from "@/components/ui/progress";

export function LineaPresupuestoGridCard({
    linea,
    presupuestoId,
    canManage,
}: {
    linea: LineaPresupuestoConCategoria;
    presupuestoId: string;
    canManage: boolean;
}) {
    const [isDeleting, startDeleteTransition] = useTransition();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
        }).format(amount);
    };

    const handleDelete = async () => {
        startDeleteTransition(async () => {
            const result = await deleteLineaPresupuesto(linea.id, presupuestoId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    const diff = linea.monto_presupuestado - linea.monto_ejecutado;
    const diffColor = diff >= 0 ? "text-green-600" : "text-destructive";

    const percent =
        linea.monto_presupuestado > 0
            ? (linea.monto_ejecutado / linea.monto_presupuestado) * 100
            : 0;

    const progressColor =
        percent > 90
            ? "bg-destructive"
            : percent > 75
                ? "bg-yellow-500"
                : "bg-primary";

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Categoría */}
                <div className="flex items-center gap-2 text-base font-semibold">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>{linea.categoria_egreso?.nombre || "Sin Categoría"}</span>
                </div>

                {/* Barra de Progreso */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso</span>
                        <span>{Math.min(percent, 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Detalles Financieros */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">
                            Presupuestado
                        </span>
                        <span className="text-sm font-semibold block">
                            {formatCurrency(linea.monto_presupuestado)}
                        </span>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-xs text-muted-foreground block">
                            Ejecutado
                        </span>
                        <span className="text-sm font-semibold block">
                            {formatCurrency(linea.monto_ejecutado)}
                        </span>
                    </div>
                    <div className="col-span-2 flex justify-between items-center pt-2 border-t border-dashed">
                        <span className="text-xs font-medium">Disponible:</span>
                        <span className={`text-sm font-bold ${diffColor}`}>
                            {formatCurrency(diff)}
                        </span>
                    </div>
                </div>
            </CardContent>

            {/* Acciones */}
            {canManage && (
                <CardFooter className="p-2 bg-muted/5 border-t">
                    <ConfirmAlertDialog
                        title="¿Eliminar Línea?"
                        description={`¿Está seguro que desea eliminar la línea "${linea.categoria_egreso?.nombre}"?`}
                        onConfirm={handleDelete}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar Línea
                        </Button>
                    </ConfirmAlertDialog>
                </CardFooter>
            )}
        </Card>
    );
}
