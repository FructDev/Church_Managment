/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    type MovimientoBancarioConDetalle,
    deleteMovimientoBancario,
} from "@/actions/finanzas/cuentasBancariasActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowRightCircle,
} from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";

export function MovimientoBancarioGridCard({
    movimiento,
    cuentaId,
    canManage,
}: {
    movimiento: MovimientoBancarioConDetalle;
    cuentaId: string;
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
            const result = await deleteMovimientoBancario(movimiento.id, cuentaId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    const tipo = movimiento.tipo;
    const Icon =
        tipo === "deposito"
            ? ArrowUpCircle
            : tipo === "retiro"
                ? ArrowDownCircle
                : ArrowRightCircle;
    const colorClass =
        tipo === "deposito"
            ? "text-green-600"
            : tipo === "retiro"
                ? "text-destructive"
                : "text-blue-600";

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Monto y Fecha */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className={`text-2xl font-bold ${colorClass}`}>
                            {tipo === "retiro" ? "-" : ""}
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
                        <span className="text-sm font-medium capitalize">{tipo}</span>
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-2">
                        {movimiento.descripcion}
                    </p>
                    {tipo === "transferencia" && (
                        <p className="text-xs text-muted-foreground">
                            A: {movimiento.cuenta_destino?.nombre || "N/A"}
                        </p>
                    )}
                </div>


            </CardContent>

            {/* Acciones */}
            {canManage && (
                <CardFooter className="p-2 bg-muted/5 border-t">
                    <ConfirmAlertDialog
                        title="¿Eliminar Movimiento?"
                        description={`¿Está seguro que desea eliminar este movimiento de "${movimiento.descripcion}"? Esta acción revertirá el saldo.`}
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
