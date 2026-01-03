/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  type ComiteConteo,
  deleteComite,
} from "@/actions/estructura/comitesActions";
import { ComiteFormDialog } from "./ComiteFormDialog";
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
  MoreVertical,
  Trash2,
  Edit,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { type Database } from "@/lib/database.types";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { toast } from "sonner";

type ComiteTipo = Database["public"]["Enums"]["tipo_comite"];

interface ComiteCardProps {
  comite: ComiteConteo;
  tiposComite: ComiteTipo[];
  canManage: boolean;
}

export function ComiteCard({ comite, tiposComite, canManage }: ComiteCardProps) {
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const href = `/estructura/comites/${comite.id}`;

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteComite(comite.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="group relative">
      <Link href={href} className="absolute inset-0 z-10 block">
        <span className="sr-only">Ver detalles de {comite.nombre}</span>
      </Link>

      <Card className="h-full flex flex-col transition-all hover:shadow-md hover:border-green-500/50">
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-none">
                {comite.nombre}
              </h3>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {comite.tipo.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="relative z-20">
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mt-2 -mr-2 h-8 w-8 text-muted-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <ComiteFormDialog
                    mode="edit"
                    comite={comite}
                    tiposComite={tiposComite}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                  </ComiteFormDialog>
                  <ConfirmAlertDialog
                    title="¿Eliminar Comité?"
                    description={`Se eliminará "${comite.nombre}" y sus asignaciones.`}
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
            )}
          </div>
        </CardHeader>

        <CardContent className="grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {comite.descripcion || "Sin descripción."}
          </p>
        </CardContent>

        <CardFooter className="pt-0 border-t bg-muted/10 p-3 mt-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {comite.miembros_count}
            </span>
            <span className="text-xs">Integrantes</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </CardFooter>
      </Card>
    </div>
  );
}
