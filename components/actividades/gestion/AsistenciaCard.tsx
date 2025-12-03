// components/actividades/gestion/AsistenciaCard.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";
import { getListaAsistencia } from "@/actions/actividades/actividadesActions";

export async function AsistenciaCard({
  actividadId,
  titulo,
}: {
  actividadId: string;
  titulo: string;
}) {
  // Obtenemos un conteo rápido
  const lista = await getListaAsistencia(actividadId);
  const presentes = lista.filter((m) => m.presente).length;
  const total = lista.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" /> {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {presentes}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            / {total}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Hermanos presentes</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/actividades/${actividadId}/asistencia`}>
            Pasar Lista
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
