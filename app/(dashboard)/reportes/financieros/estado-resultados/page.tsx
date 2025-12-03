import { getEstadoResultados } from "@/actions/reportes/reportesActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportToolbar } from "@/components/reportes/ExportToolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSessionInfo } from "@/lib/auth/utils";

// --- ¡IMPORTAMOS EL COMPONENTE CLIENTE! ---
import { GraficaEstadoResultados } from "@/components/reportes/GraficaEstadoResultados";
// -----------------------------------------

export default async function EstadoResultadosPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await props.searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  const { profile } = await getSessionInfo();

  const data = await getEstadoResultados(year);

  // Totales anuales
  const totalIngresos = data.reduce((acc, curr) => acc + curr.Ingresos, 0);
  const totalEgresos = data.reduce((acc, curr) => acc + curr.Egresos, 0);
  const balanceNeto = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Estado de Resultados {year}</h1>
        <ExportToolbar data={data} filename={`Estado_Resultados_${year}`} />
      </div>

      {/* KPIs Anuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Ingresos Anuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIngresos.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Egresos Anuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalEgresos.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className={balanceNeto >= 0 ? "bg-green-50/50" : "bg-red-50/50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Balance Neto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceNeto.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica (Ahora es un componente cliente separado) */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativa Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficaEstadoResultados data={data} />
        </CardContent>
      </Card>

      {/* Tabla Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Egresos</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((mes) => (
                  <TableRow key={mes.name}>
                    <TableCell className="font-medium">{mes.name}</TableCell>
                    <TableCell className="text-right text-green-600">
                      ${mes.Ingresos.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ${mes.Egresos.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${mes.Neto >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                    >
                      ${mes.Neto.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
