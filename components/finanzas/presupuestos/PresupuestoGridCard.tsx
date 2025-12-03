/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    type PresupuestoParaTabla,
    deletePresupuesto,
    updatePresupuestoEstado,
} from "@/actions/finanzas/presupuestosActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Trash2,
    Edit,
    Eye,
    Check,
    Lock,
    Edit2,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";
import Link from "next/link";
import { PresupuestoFormDialog } from "./PresupuestoFormDialog";

export function PresupuestoGridCard({
    presupuesto,
    canManage,
}: {
    presupuesto: PresupuestoParaTabla;
    canManage: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
        }).format(amount);
    };

    const handleDelete = async () => {
        const result = await deletePresupuesto(presupuesto.id);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error("Error al eliminar", { description: result.message });
        }
    };

    const handleUpdateEstado = (newState: "activo" | "cerrado" | "borrador") => {
        startTransition(async () => {
            const result = await updatePresupuestoEstado(presupuesto.id, newState);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al cambiar estado", { description: result.message });
            }
        });
    };

    const diff =
        presupuesto.monto_presupuestado_total - presupuesto.monto_ejecutado_total;
    const diffColor = diff >= 0 ? "text-green-600" : "text-destructive";

    let statusVariant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
    if (presupuesto.estado === "aprobado" || presupuesto.estado === "activo")
        statusVariant = "default";
    if (presupuesto.estado === "cerrado") statusVariant = "secondary";
    if (presupuesto.estado === "borrador") statusVariant = "destructive";

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-4">
                {/* Header: Nombre y Estado */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                        <Link
                            href={`/finanzas/presupuestos/${presupuesto.id}`}
                            className="text-lg font-bold hover:underline hover:text-primary transition-colors line-clamp-1"
                        >
                            {presupuesto.nombre}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Año {presupuesto.anio}</span>
                        </div>
                    </div>
                    <Badge variant={statusVariant} className="capitalize shrink-0">
                        {presupuesto.estado}
                    </Badge>
                </div>

                {/* Resumen Financiero */}
                <div className="grid grid-cols-2 gap-3 py-2 border-y border-dashed">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">
                            Presupuestado
                        </span>
                        <span className="text-sm font-semibold block">
                            {formatCurrency(presupuesto.monto_presupuestado_total)}
                        </span>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-xs text-muted-foreground block">
                            Ejecutado
                        </span>
                        <span className="text-sm font-semibold block">
                            {formatCurrency(presupuesto.monto_ejecutado_total)}
                        </span>
                    </div>
                    <div className="col-span-2 flex justify-between items-center pt-1 border-t border-dashed/50">
                        <span className="text-xs font-medium">Diferencia:</span>
                        <span className={`text-sm font-bold ${diffColor}`}>
                            {formatCurrency(diff)}
                        </span>
                    </div>
                </div>
            </CardContent>

            {/* Acciones */}
            {canManage && (
                <CardFooter className="flex flex-col gap-2 p-2 bg-muted/5 border-t">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                        <Link href={`/finanzas/presupuestos/${presupuesto.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver Detalles
                        </Link>
                    </Button>

                    <div className="grid grid-cols-2 gap-2 w-full">
                        {presupuesto.estado === "borrador" && (
                            <>
                                <PresupuestoFormDialog mode="edit" presupuesto={presupuesto}>
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                        <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                                    </Button>
                                </PresupuestoFormDialog>

                                <ConfirmAlertDialog
                                    title="¿Aprobar Presupuesto?"
                                    description={`Al aprobar, este presupuesto se volverá "Activo".`}
                                    onConfirm={() => handleUpdateEstado("activo")}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                        disabled={isPending}
                                    >
                                        <Check className="h-3.5 w-3.5 mr-1.5" /> Aprobar
                                    </Button>
                                </ConfirmAlertDialog>

                                <ConfirmAlertDialog
                                    title="¿Eliminar Presupuesto?"
                                    description={`¿Está seguro que desea eliminar "${presupuesto.nombre}"?`}
                                    onConfirm={handleDelete}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 col-span-2"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar
                                    </Button>
                                </ConfirmAlertDialog>
                            </>
                        )}

                        {presupuesto.estado === "activo" && (
                            <ConfirmAlertDialog
                                title="¿Cerrar Presupuesto?"
                                description={`El presupuesto se marcará como "Cerrado".`}
                                onConfirm={() => handleUpdateEstado("cerrado")}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-8 text-xs col-span-2"
                                    disabled={isPending}
                                >
                                    <Lock className="h-3.5 w-3.5 mr-1.5" /> Cerrar Presupuesto
                                </Button>
                            </ConfirmAlertDialog>
                        )}

                        {presupuesto.estado === "cerrado" && (
                            <ConfirmAlertDialog
                                title="¿Reabrir Presupuesto?"
                                description={`El presupuesto volverá al estado "Borrador".`}
                                onConfirm={() => handleUpdateEstado("borrador")}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-8 text-xs col-span-2"
                                    disabled={isPending}
                                >
                                    <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Reabrir
                                </Button>
                            </ConfirmAlertDialog>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
