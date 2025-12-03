/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type MiembroConSociedad } from "@/actions/miembros/miembrosActions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MoreHorizontal, User, Edit } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MiembroFormDialog } from "./MiembroFormDialog";

export function MiembroGridCard({
  miembro,
  sociedades,
  canManage,
}: {
  miembro: MiembroConSociedad;
  sociedades: any[];
  canManage: boolean;
}) {
  const initials = miembro.nombre_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden border-muted/40 hover:border-primary/20">
      {/* Indicador de estado (borde superior de color) */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${miembro.estado_membresia === "activo"
            ? "bg-green-500"
            : miembro.estado_membresia === "visitante"
              ? "bg-orange-500"
              : "bg-muted"
          }`}
      />

      {/* Link invisible para ir al detalle */}
      <Link
        href={`/miembros/${miembro.id}`}
        className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-lg"
      />

      <CardContent className="flex flex-col items-center p-6 pt-8 relative z-10 pointer-events-none">
        <div className="relative mb-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
            <AvatarImage
              src={miembro.foto_url || undefined}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Badge de estado flotante */}
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
            <span
              className={`flex h-4 w-4 rounded-full border-2 border-background ${miembro.estado_membresia === "activo"
                  ? "bg-green-500"
                  : miembro.estado_membresia === "visitante"
                    ? "bg-orange-500"
                    : "bg-gray-400"
                }`}
            />
          </div>
        </div>

        <h3 className="font-bold text-lg text-center line-clamp-1 group-hover:text-primary transition-colors">
          {miembro.nombre_completo}
        </h3>

        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {miembro.sociedad && (
            <Badge
              variant="secondary"
              className="capitalize truncate max-w-[140px] bg-secondary/50"
            >
              {miembro.sociedad.nombre}
            </Badge>
          )}
        </div>

        <div className="mt-6 w-full space-y-2.5">
          {miembro.telefono ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">{miembro.telefono}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground/40 text-center italic flex items-center justify-center gap-2">
              <Phone className="h-3.5 w-3.5" /> Sin teléfono
            </div>
          )}

          {miembro.email ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground truncate">
              <Mail className="h-3.5 w-3.5 text-primary/70" />
              <span className="truncate max-w-[180px]">{miembro.email}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground/40 text-center italic flex items-center justify-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Sin email
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer con acciones reales (pointer-events-auto) */}
      <CardFooter className="border-t bg-muted/5 p-2 flex justify-between items-center relative z-20 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href={`/miembros/${miembro.id}`}>
            <User className="h-3.5 w-3.5 mr-1.5" /> Perfil
          </Link>
        </Button>

        {canManage && (
          <MiembroFormDialog
            mode="edit"
            miembro={miembro as any}
            sociedades={sociedades}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
            </Button>
          </MiembroFormDialog>
        )}
      </CardFooter>
    </Card>
  );
}
