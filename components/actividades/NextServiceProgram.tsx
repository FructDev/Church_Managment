/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  ArrowRight,
  ListOrdered,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export function NextServiceProgram({ actividad }: { actividad: any }) {
  if (!actividad) {
    return (
      <Card className="bg-muted/10 border-dashed h-full flex flex-col justify-center items-center p-6 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
        <h3 className="font-medium text-lg">Sin actividades próximas</h3>
        <p className="text-muted-foreground text-sm">
          El calendario está libre por ahora.
        </p>
      </Card>
    );
  }

  const fecha = new Date(actividad.fecha_inicio);
  const tienePrograma = actividad.programa && actividad.programa.length > 0;

  return (
    <Card className="h-full flex flex-col border-t-4 border-t-primary shadow-lg overflow-hidden">
      {/* Cabecera Visual */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge className="bg-primary text-white hover:bg-primary/90">
            Próximo Evento
          </Badge>
          <Badge variant="outline" className="bg-background/50 backdrop-blur">
            {actividad.tipo?.nombre}
          </Badge>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-100 mb-2">
          {actividad.titulo}
        </h2>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {fecha.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {fecha.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{actividad.ubicacion || "Templo Principal"}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo: El Programa */}
      <CardContent className="p-0 grow">
        <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <ListOrdered className="h-4 w-4" /> Orden del Culto
          </h3>
          <Link
            href={`/actividades/${actividad.id}/gestion`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Editar Programa
          </Link>
        </div>

        <div className="p-0">
          {tienePrograma ? (
            <ul className="divide-y divide-border">
              {actividad.programa.map((parte: any) => (
                <li
                  key={parte.order}
                  className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {parte.orden}
                  </span>
                  <div className="grow min-w-0">
                    <p className="text-sm font-medium truncate">
                      {parte.titulo_parte}
                    </p>
                    {parte.notas && (
                      <p className="text-xs text-muted-foreground truncate">
                        {parte.notas}
                      </p>
                    )}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-full">
                    {parte.responsable_nom ||
                      parte.responsable?.nombre_completo ||
                      "---"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="font-medium text-foreground">
                Programa no definido
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Aún no se han asignado las partes para este culto.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/actividades/${actividad.id}/gestion`}>
                  Crear Programa Ahora
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/10 p-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/actividades/${actividad.id}/asistencia`}>
            Pasar Lista
          </Link>
        </Button>
        <Button className="w-full" asChild>
          <Link href={`/actividades/${actividad.id}/gestion`}>
            Gestionar Todo
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
