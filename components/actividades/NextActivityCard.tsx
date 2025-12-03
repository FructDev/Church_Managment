/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NextActivityCard({ actividad }: { actividad: any }) {
  if (!actividad) {
    return (
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Calendar className="h-10 w-10 mb-2 opacity-50" />
          <p>No hay actividades programadas próximamente.</p>
        </CardContent>
      </Card>
    );
  }

  const fecha = new Date(actividad.fecha_inicio);

  return (
    <Card className="border-l-4 border-l-primary shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Calendar className="h-32 w-32" />
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2">
            Próximo Evento
          </Badge>
          <Badge
            style={{
              backgroundColor: actividad.tipo?.color || "#333",
              color: "white",
            }}
          >
            {actividad.tipo?.nombre}
          </Badge>
        </div>
        <CardTitle className="text-3xl">{actividad.titulo}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center gap-3 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {fecha.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" • "}
            {fecha.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span>{actividad.ubicacion || "Templo Principal"}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/actividades/${actividad.id}/gestion`}>
            Gestionar Programa <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
