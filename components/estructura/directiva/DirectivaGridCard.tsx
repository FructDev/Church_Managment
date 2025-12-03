/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type DirectivaConMiembro } from "@/actions/estructura/directivasActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, User } from "lucide-react";
import { DirectivaFormDialog } from "./DirectivaFormDialog";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { deleteDirectiva } from "@/actions/estructura/directivasActions";
import { toast } from "sonner";
import { useTransition } from "react";

type MiembroSimple = { id: string; nombre_completo: string };

export function DirectivaGridCard({
    directiva,
    miembros,
    sociedadId,
    cargosEnum,
    canManage,
}: {
    directiva: DirectivaConMiembro;
    miembros: MiembroSimple[];
    sociedadId: string;
    cargosEnum: string[];
    canManage: boolean;
}) {
    const [isDeleting, startDeleteTransition] = useTransition();

    const initials = directiva.miembro?.nombre_completo
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteDirectiva(directiva.id, sociedadId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al eliminar", { description: result.message });
            }
        });
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden border-muted/40 hover:border-primary/20">
            {/* Indicador de estado */}
            <div
                className={`absolute top-0 left-0 right-0 h-1 ${directiva.activo ? "bg-green-500" : "bg-red-500"
                    }`}
            />

            <CardContent className="flex flex-col items-center p-6 pt-8 relative z-10">
                <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <AvatarImage
                            src={directiva.miembro?.foto_url || undefined}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Badge de estado flotante */}
                    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                        <span
                            className={`flex h-4 w-4 rounded-full border-2 border-background ${directiva.activo ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                    </div>
                </div>

                <h3 className="font-bold text-lg text-center line-clamp-1 group-hover:text-primary transition-colors">
                    {directiva.miembro?.nombre_completo}
                </h3>

                <Badge variant="outline" className="mt-2 capitalize bg-secondary/30">
                    {directiva.cargo.replace("_", " ")}
                </Badge>

                <div className="mt-6 w-full space-y-2.5">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <span>
                            Desde: {new Date(directiva.fecha_inicio).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </CardContent>

            {/* Footer con acciones */}
            {canManage && (
                <CardFooter className="border-t bg-muted/5 p-2 flex justify-end items-center gap-2 mt-auto">
                    <DirectivaFormDialog
                        mode="edit"
                        directiva={directiva}
                        miembros={miembros}
                        sociedadId={sociedadId}
                        cargosEnum={cargosEnum}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs hover:bg-primary/10 hover:text-primary"
                        >
                            <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                        </Button>
                    </DirectivaFormDialog>

                    <ConfirmAlertDialog
                        title="¿Remover Miembro?"
                        description={`¿Está seguro que desea remover a ${directiva.miembro?.nombre_completo} de este cargo?`}
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
