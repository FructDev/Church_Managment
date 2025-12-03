/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type EgresoParaTabla, deleteEgreso } from "@/actions/finanzas/egresosActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Edit, FileText, User, Tag, Store } from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { EgresoFormDialog } from "./EgresoFormDialog";

type Categoria = { id: string; nombre: string };
type Selector = { id: string; nombre: string };

export function EgresoGridCard({
    egreso,
    categorias,
    cajas,
    cuentas,
    canManage,
}: {
    egreso: EgresoParaTabla;
    categorias: Categoria[];
    cajas: Selector[];
    cuentas: Selector[];
    canManage: boolean;
}) {
    const [isDeleting, startDeleteTransition] = useTransition();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
        }).format(amount);
    };

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteEgreso(egreso.id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Monto y Fecha */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-red-600">
                            -{formatCurrency(egreso.monto)}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {new Date(egreso.fecha).toLocaleDateString("es-ES", {
                                    timeZone: "UTC",
                                    dateStyle: "long",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Categoría, Beneficiario y Descripción */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4 text-primary" />
                        <span>{egreso.categoria_egreso?.nombre || "Sin Categoría"}</span>
                    </div>

                    {egreso.beneficiario_proveedor && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Store className="h-3.5 w-3.5" />
                            <span>{egreso.beneficiario_proveedor}</span>
                        </div>
                    )}

                    {egreso.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-2 pl-6 pt-1">
                            {egreso.descripcion}
                        </p>
                    )}
                </div>

                {/* Footer Info: Usuario y Comprobante */}
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-dashed">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">
                            {egreso.registrado_por?.nombre_completo || "N/A"}
                        </span>
                    </div>

                    {egreso.comprobante_url && (
                        <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                            <a
                                href={egreso.comprobante_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Ver Recibo
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>

            {/* Acciones */}
            {canManage && (
                <CardFooter className="grid grid-cols-2 gap-2 p-2 bg-muted/5 border-t">
                    <EgresoFormDialog
                        mode="edit"
                        egreso={egreso}
                        categorias={categorias}
                        cajas={cajas}
                        cuentas={cuentas}
                    >
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                            <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                        </Button>
                    </EgresoFormDialog>

                    <ConfirmAlertDialog
                        title="¿Eliminar Egreso?"
                        description={`¿Está seguro que desea eliminar este egreso de ${formatCurrency(
                            egreso.monto
                        )}?`}
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
