import { getReporteActividades } from "@/actions/reportes/administrativosActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, XCircle, Users, FileText } from "lucide-react";
import { GraficaActividades } from "@/components/reportes/administrativos/GraficaActividades";
import { ExportToolbar } from "@/components/reportes/ExportToolbar";

export default async function ReporteActividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const { lista, resumen, grafica } = await getReporteActividades(year);

  // Preparar datos para Excel
  const dataExport = lista.map((a) => ({
    Fecha: new Date(a.fecha_inicio).toLocaleDateString(),
    Titulo: a.titulo,
    Tipo: a.tipo?.nombre,
    Estado: a.estado,
    Asistencia: a.asistencia,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Reporte Anual de Actividades {year}
        </h1>
        <ExportToolbar
          data={dataExport}
          filename={`Reporte_Actividades_${year}`}
        />
      </div>

      {/* 1. KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumen.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Asistencia
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumen.promedioAsistencia}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {resumen.canceladas}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Gráfica de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle>Relación Actividades vs. Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficaActividades data={grafica} />
        </CardContent>
      </Card>

      {/* 3. Tabla Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((act) => (
                <TableRow key={act.id}>
                  <TableCell>
                    {new Date(act.fecha_inicio).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{act.titulo}</TableCell>
                  <TableCell>{act.tipo?.nombre}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        act.estado === "cancelada" ? "destructive" : "outline"
                      }
                    >
                      {act.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {act.asistencia > 0 ? act.asistencia : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No hay actividades registradas este año.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
