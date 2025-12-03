import { getSessionInfo } from "@/lib/auth/utils";
import { getDetalleClase } from "@/actions/actividades/escuelaBiblicaActions";
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";
import { AlumnosDataTable } from "@/components/actividades/escuela-biblica/AlumnosDataTable";
import { InscripcionDialog } from "@/components/actividades/escuela-biblica/InscripcionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

export default async function DetalleClasePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { profile } = await getSessionInfo();
  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  const [detalle, miembros] = await Promise.all([
    getDetalleClase(id),
    getMiembrosActivos(),
  ]);

  if (!detalle) notFound();
  const { clase, alumnos } = detalle;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/actividades/escuela-biblica"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Clases
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{clase.nombre}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded">
                Aula: {clase.aula || "N/A"}
              </span>
            </div>
          </div>

          {canManage && (
            <InscripcionDialog claseId={clase.id} miembros={miembros}>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Inscribir Alumno
              </Button>
            </InscripcionDialog>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Info Maestro */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Maestro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={clase.maestro?.foto_url || undefined} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {clase.maestro?.nombre_completo || "Vacante"}
                </p>
                <p className="text-sm text-muted-foreground">Responsable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel Derecho: Lista de Alumnos */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Alumnos Inscritos</CardTitle>
            <span className="text-2xl font-bold text-primary">
              {alumnos.length}
            </span>
          </CardHeader>
          <CardContent>
            <AlumnosDataTable
              data={alumnos}
              claseId={clase.id}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
