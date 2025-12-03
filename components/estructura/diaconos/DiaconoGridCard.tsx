/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type DiaconoConMiembro } from "@/actions/estructura/diaconosActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Edit, Trash2 } from "lucide-react";
import { DiaconoFormDialog } from "./DiaconoFormDialog";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { deleteDiacono } from "@/actions/estructura/diaconosActions";
import { toast } from "sonner";
import { useTransition } from "react";

export function DiaconoGridCard({
    diacono,
    miembros,
    canManage,
}: {
    diacono: DiaconoConMiembro;
    miembros: any[];
    canManage: boolean;
}) {
    const [isDeleting, startDeleteTransition] = useTransition();

    const initials = diacono.miembro?.nombre_completo
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteDiacono(diacono.id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    const areas = (diacono.areas_servicio as string[]) || [];

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden border-muted/40 hover:border-primary/20">
            {/* Indicador de estado */}
            <div
                className={`absolute top-0 left-0 right-0 h-1 ${diacono.activo ? "bg-green-500" : "bg-red-500"
                    }`}
            />

            <CardContent className="flex flex-col items-center p-6 pt-8 relative z-10">
                <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <AvatarImage
                            src={diacono.miembro?.foto_url || undefined}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Badge de estado flotante */}
                    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                        <span
                            className={`flex h-4 w-4 rounded-full border-2 border-background ${diacono.activo ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                    </div>
                </div>

                <h3 className="font-bold text-lg text-center line-clamp-1 group-hover:text-primary transition-colors">
                    {diacono.miembro?.nombre_completo}
                </h3>

                <div className="flex flex-wrap justify-center gap-1 mt-3">
                    {areas.length > 0 ? (
                        areas.map((area) => (
                            <Badge
                                key={area}
                                variant="secondary"
                                className="capitalize text-xs bg-secondary/50"
                            >
                                {area}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground italic">
                            Sin áreas asignadas
                        </span>
                    )}
                </div>

                <div className="mt-6 w-full space-y-2.5">
                    {diacono.miembro?.telefono ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary/70" />
                            <span className="font-medium">{diacono.miembro.telefono}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground/40 text-center italic flex items-center justify-center gap-2">
                            <Phone className="h-3.5 w-3.5" /> Sin teléfono
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <span>
                            Desde:{" "}
                            {new Date(diacono.fecha_nombramiento).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </CardContent>

            {/* Footer con acciones */}
            {canManage && (
                <CardFooter className="border-t bg-muted/5 p-2 flex justify-end items-center gap-2 mt-auto">
                    <DiaconoFormDialog
                        mode="edit"
                        diacono={diacono}
                        miembros={miembros}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs hover:bg-primary/10 hover:text-primary"
                        >
                            <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                        </Button>
                    </DiaconoFormDialog>

                    <ConfirmAlertDialog
                        title="¿Eliminar Diácono?"
                        description={`¿Está seguro que desea eliminar a ${diacono.miembro?.nombre_completo}?`}
                        onConfirm={handleDelete}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs hover:bg-destructive/10 hover:text-destructive text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar
                        </Button>
                    </ConfirmAlertDialog>
                </CardFooter>
            )}
        </Card>
    );
}
