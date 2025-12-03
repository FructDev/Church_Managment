import { getEstadisticasAsistencia } from "@/actions/reportes/administrativosActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
// Necesitamos un componente cliente para la gráfica de líneas
import { GraficaAsistencia } from "@/components/reportes/administrativos/GraficaAsistencia";

export default async function ReporteAsistenciaPage() {
  const data = await getEstadisticasAsistencia();

  // Calcular tendencia simple
  const ultima = data[data.length - 1]?.asistencia || 0;
  const anterior = data[data.length - 2]?.asistencia || 0;
  const tendencia = ultima - anterior;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Análisis de Asistencia</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Asistencia
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ultima} personas</div>
            <p className="text-xs text-muted-foreground">
              En el evento más reciente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendencia Inmediata
            </CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${
                tendencia >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                tendencia >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {tendencia > 0 ? "+" : ""}
              {tendencia}
            </div>
            <p className="text-xs text-muted-foreground">
              Comparado con el evento anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Tendencia de Asistencia (Últimos 12 Eventos)</CardTitle>
          <CardDescription>
            Visualización cronológica de la asistencia a cultos y actividades.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <GraficaAsistencia data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
