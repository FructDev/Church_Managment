/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type DiezmoResumenParaTabla, ejecutarDistribucion } from "@/actions/finanzas/diezmosActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, XCircle, User, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DiezmoGridCard({
    resumen,
    canManage,
}: {
    resumen: DiezmoResumenParaTabla;
    canManage: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-ES", {
            timeZone: "UTC",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleDistribute = () => {
        startTransition(async () => {
            const result = await ejecutarDistribucion(resumen);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al distribuir", { description: result.message });
            }
        });
    };

    const fecha = new Date(resumen.periodo);
    const tipo = resumen.tipo_periodo.replace("_", " ");

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Periodo y Estado */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <Link
                            href={`/finanzas/diezmos/${resumen.id}`}
                            className="text-lg font-bold hover:underline hover:text-primary transition-colors capitalize"
                        >
                            {fecha.toLocaleDateString("es-ES", {
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                            })}
                        </Link>
                        <span className="text-xs text-muted-foreground capitalize">{tipo}</span>
                    </div>
                    {resumen.distribuido ? (
                        <Badge variant="default" className="gap-1 shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Distribuido</span>
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1 shrink-0">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Pendiente</span>
                        </Badge>
                    )}
                </div>

                {/* Monto Total */}
                <div className="py-2">
                    <span className="text-2xl font-bold text-primary">
                        {formatCurrency(resumen.total_recibido)}
                    </span>
                    <p className="text-xs text-muted-foreground">Total Recibido</p>
                </div>

                {/* Info Adicional */}
                <div className="space-y-2 text-sm text-muted-foreground border-t pt-2 border-dashed">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>Registrado:</span>
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                            {resumen.registrado_por?.nombre_completo || "N/A"}
                        </span>
                    </div>

                    {resumen.distribuido && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Distribuido:</span>
                                </div>
                                <span className="font-medium text-foreground truncate max-w-[120px]">
                                    {resumen.distribuido_por?.nombre_completo || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Fecha Dist.:</span>
                                </div>
                                <span className="font-medium text-foreground">
                                    {formatDate(resumen.fecha_distribucion)}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>

            {/* Acciones (Solo si no está distribuido y puede gestionar) */}
            {canManage && !resumen.distribuido && (
                <CardFooter className="p-2 bg-muted/5 border-t">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="default"
                                size="sm"
                                disabled={isPending}
                                className="w-full"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isPending ? "Procesando..." : "Distribuir Fondos"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Distribución</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de ejecutar la distribución para el período:
                                    <strong className="capitalize">
                                        {` ${resumen.tipo_periodo.replace("_", " ")} ${new Date(
                                            resumen.periodo
                                        ).toLocaleDateString("es-ES", {
                                            month: "long",
                                            year: "numeric",
                                            timeZone: "UTC",
                                        })}`}
                                    </strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 my-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total Recibido:</span>
                                    <span>{formatCurrency(resumen.total_recibido)}</span>
                                </div>
                                <div className="p-4 border rounded-md space-y-2 bg-muted/50">
                                    <h4 className="font-semibold mb-2">Desglose de Egresos:</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Diezmo de Diezmo:</span>
                                        <span>{formatCurrency(resumen.diezmo_de_diezmo)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Comité de Finanzas:</span>
                                        <span>{formatCurrency(resumen.comite_finanzas)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Diezmo Pastoral:</span>
                                        <span>{formatCurrency(resumen.diezmo_pastoral)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sustento Pastoral:</span>
                                        <span>{formatCurrency(resumen.sustento_pastoral)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                        <span>Total a Distribuir:</span>
                                        <span>
                                            {formatCurrency(
                                                resumen.diezmo_de_diezmo +
                                                resumen.comite_finanzas +
                                                resumen.diezmo_pastoral +
                                                resumen.sustento_pastoral
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDistribute} disabled={isPending}>
                                    {isPending ? "Procesando..." : "Sí, ejecutar distribución"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            )}
        </Card>
    );
}
