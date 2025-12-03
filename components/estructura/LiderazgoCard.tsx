// components/estructura/LiderazgoCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShieldAlert, ShieldCheck, Edit, Icon } from "lucide-react";
import Image from "next/image";
import { LiderazgoFormSheet } from "./LiderazgoFormSheet";
import { type LiderazgoConMiembro } from "@/actions/estructura/liderazgoActions";
import { type Database } from "@/lib/database.types";

type MiembroSimple = { id: string; nombre_completo: string };
type CargoEnum = Database["public"]["Enums"]["cargo_liderazgo"];

interface LiderazgoCardProps {
  item: LiderazgoConMiembro;
  miembros: MiembroSimple[];
  cargosEnum: CargoEnum[];
  canManage: boolean;
}

export function LiderazgoCard({
  item,
  miembros,
  cargosEnum,
}: LiderazgoCardProps) {
  const Icono = item.activo ? ShieldCheck : ShieldAlert;
  const color = item.activo ? "text-green-500" : "text-yellow-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium capitalize">
          {item.cargo.replace("_", " ")}
        </CardTitle>
        <Icon className={`h-6 w-6 ${color}`} iconNode={[]} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
            {item.miembro?.foto_url ? (
              <Image
                src={item.miembro.foto_url}
                alt={item.miembro.nombre_completo}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {/* Info */}
          <div className="space-y-1">
            <p className="text-xl font-semibold">
              {item.miembro?.nombre_completo || "No asignado"}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.activo
                ? `Desde: ${new Date(item.fecha_inicio).toLocaleDateString()}`
                : "Cargo inactivo"}
            </p>
          </div>
        </div>

        {/* Botón de Editar */}
        <LiderazgoFormSheet
          item={item}
          miembros={miembros}
          cargosEnum={cargosEnum}
        >
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Editar Asignación
          </Button>
        </LiderazgoFormSheet>
      </CardContent>
    </Card>
  );
}
