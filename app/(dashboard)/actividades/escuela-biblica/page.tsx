/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionInfo } from "@/lib/auth/utils";
import { getClasesEB } from "@/actions/actividades/escuelaBiblicaActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";
import { ClaseEbFormDialog } from "@/components/actividades/escuela-biblica/ClaseEbFormDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PlusCircle, BookOpen, User, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function EscuelaBiblicaPage() {
  const { profile } = await getSessionInfo();
  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  const [clases, miembros] = await Promise.all([
    getClasesEB(),
    getMiembrosActivos(),
  ]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Escuela Bíblica
        </h1>

        {canManage && (
          <ClaseEbFormDialog maestros={miembros}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Clase
            </Button>
          </ClaseEbFormDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clases.length === 0 && (
          <p className="col-span-full text-muted-foreground">
            No hay clases registradas.
          </p>
        )}

        {clases.map((clase: any) => (
          <Card key={clase.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{clase.nombre}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {clase.aula || "Sin aula asignada"}
              </div>

              {/* Maestro */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={clase.maestro?.foto_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Maestro</p>
                  <p className="text-sm font-medium">
                    {clase.maestro?.nombre_completo || "Vacante"}
                  </p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-muted/20 p-2 rounded text-center">
                <span className="text-2xl font-bold text-primary">
                  {clase.total_alumnos}
                </span>
                <p className="text-xs text-muted-foreground">
                  Alumnos Inscritos
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                {/* Aquí irá la página de detalle de la clase (Paso siguiente) */}
                <Link href={`/actividades/escuela-biblica/${clase.id}`}>
                  Gestionar Clase <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
