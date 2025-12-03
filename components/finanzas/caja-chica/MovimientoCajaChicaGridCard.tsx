/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    type MovimientoCajaChicaConDetalle,
    deleteMovimientoCajaChica,
} from "@/actions/finanzas/cajaChicaActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    User,
} from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";

export function MovimientoCajaChicaGridCard({
    movimiento,
    cajaChicaId,
    canManage,
}: {
    movimiento: MovimientoCajaChicaConDetalle;
    cajaChicaId: string;
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
            const result = await deleteMovimientoCajaChica(
                movimiento.id,
                cajaChicaId
            );
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    const esGasto = movimiento.tipo === "gasto";
    const colorClass = esGasto ? "text-destructive" : "text-green-600";
    const Icon = esGasto ? ArrowDownCircle : ArrowUpCircle;

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Monto y Fecha */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className={`text-2xl font-bold ${colorClass}`}>
                            {esGasto ? "-" : "+"}
                            {formatCurrency(movimiento.monto)}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {new Date(movimiento.fecha).toLocaleDateString("es-ES", {
                                    timeZone: "UTC",
                                    dateStyle: "long",
                                })}
                            </span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium capitalize">
                            {movimiento.tipo}
                        </span>
                    </div>
                </div>

                {/* Concepto */}
                <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-2">
                        {movimiento.concepto}
                    </p>
                </div>

                {/* Footer Info: Usuario */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 mt-auto border-t border-dashed">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">
                        {movimiento.registrado_por?.nombre_completo || "N/A"}
                    </span>
                </div>
            </CardContent>

            {/* Acciones */}
            {canManage && (
                <CardFooter className="p-2 bg-muted/5 border-t">
                    <ConfirmAlertDialog
                        title="¿Eliminar Movimiento?"
                        description={`¿Está seguro que desea eliminar este movimiento de "${movimiento.concepto}"? Esta acción revertirá el saldo.`}
                        onConfirm={handleDelete}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar
                        </Button>
                    </ConfirmAlertDialog>
                </CardFooter>
            )}
        </Card>
    );
}
