/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type AlumnoInscrito } from "@/actions/actividades/escuelaBiblicaActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, User } from "lucide-react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { removerAlumnoEB } from "@/actions/actividades/escuelaBiblicaActions";
import { toast } from "sonner";
import { useTransition } from "react";

export function AlumnoGridCard({
    alumno,
    claseId,
    canManage,
}: {
    alumno: AlumnoInscrito;
    claseId: string;
    canManage: boolean;
}) {
    const [isDeleting, startDeleteTransition] = useTransition();

    const initials = alumno.miembro?.nombre_completo
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const handleRemove = () => {
        startDeleteTransition(async () => {
            const result = await removerAlumnoEB(alumno.id, claseId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error("Error al remover", { description: result.message });
            }
        });
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <CardContent className="flex flex-col items-center p-6 pt-8">
                <Avatar className="h-20 w-20 border-2 border-muted mb-4">
                    <AvatarImage
                        src={alumno.miembro?.foto_url || undefined}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <h3 className="font-bold text-lg text-center line-clamp-1">
                    {alumno.miembro?.nombre_completo}
                </h3>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                        Inscrito: {new Date(alumno.fecha_inscripcion).toLocaleDateString()}
                    </span>
                </div>
            </CardContent>

            {canManage && (
                <CardFooter className="border-t bg-muted/5 p-2 flex justify-center mt-auto">
                    <ConfirmAlertDialog
                        title="¿Remover Alumno?"
                        description={`¿Está seguro que desea remover a ${alumno.miembro?.nombre_completo} de esta clase?`}
                        onConfirm={handleRemove}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Remover Alumno
                        </Button>
                    </ConfirmAlertDialog>
                </CardFooter>
            )}
        </Card>
    );
}
