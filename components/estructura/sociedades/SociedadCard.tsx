/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  deleteSociedad,
  type SociedadConteo,
} from "@/actions/estructura/sociedadesActions";
import { SociedadFormDialog } from "./SociedadFormDialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  MoreHorizontal,
  Trash2,
  Edit,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";

interface SociedadCardProps {
  sociedad: SociedadConteo;
  canManage: boolean;
}

export function SociedadCard({ sociedad, canManage }: SociedadCardProps) {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const href = `/estructura/sociedades/${sociedad.id}`;

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteSociedad(sociedad.id);
      if (result.success) toast.success(result.message);
      else toast.error("Error al eliminar", { description: result.message });
    });
  };

  return (
    <div className="group relative">
      {/* Hacemos que toda la tarjeta sea el enlace */}
      <Link href={href} className="absolute inset-0 z-10 block">
        <span className="sr-only">Ver detalles de {sociedad.nombre}</span>
      </Link>

      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
        {/* Barra de color superior */}
        <div className="h-2 w-full bg-linear-to-r from-purple-500 to-indigo-500" />

        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold capitalize tracking-tight">
                {sociedad.nombre}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {sociedad.descripcion || "Sociedad oficial de la congregación."}
              </p>
            </div>

            {/* El menú de acciones debe estar ENCIMA del Link (z-20) */}
            {canManage && (
              <div className="relative z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mt-1 -mr-2 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <SociedadFormDialog mode="edit" sociedad={sociedad}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Descripción
                      </DropdownMenuItem>
                    </SociedadFormDialog>
                    <ConfirmAlertDialog
                      title="¿Eliminar Sociedad?"
                      description={`¿Está seguro? Esto podría fallar si tiene miembros asignados.`}
                      onConfirm={handleDelete}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </ConfirmAlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto pt-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="p-2 bg-background rounded-full shadow-sm">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {sociedad.miembros_count}
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Miembros Activos
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 flex justify-end">
          <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:underline">
            Ir al Panel <ArrowUpRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
