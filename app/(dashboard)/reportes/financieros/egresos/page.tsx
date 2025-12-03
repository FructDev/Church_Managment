import { getReporteTransacciones } from "@/actions/reportes/reportesActions";
import { ExportToolbar } from "@/components/reportes/ExportToolbar";
import {
  GraficaBarras,
  GraficaPastel,
} from "@/components/reportes/GraficasFinancieras";
import { ReporteDateFilter } from "@/components/reportes/ReporteDateFilter";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ReporteEgresosPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const start =
    typeof searchParams.start === "string"
      ? searchParams.start
      : `${new Date().getFullYear()}-01-01`;
  const end =
    typeof searchParams.end === "string"
      ? searchParams.end
      : new Date().toISOString().split("T")[0];

  // Llamada con 'egreso'
  const data = await getReporteTransacciones("egreso", start, end);

  // Aplanamos la data para el Excel
  const dataParaExcel = data.porCategoria.map((d) => ({
    Categoria: d.name,
    Monto: d.value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-red-700">Análisis de Egresos</h1>
        <ReporteDateFilter />
      </div>

      <div className="flex justify-end">
        <ExportToolbar data={dataParaExcel} filename="Reporte_Ingresos" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GraficaBarras title="Egresos por Tiempo" data={data.porTiempo} />
        <GraficaPastel title="Gastos por Categoría" data={data.porCategoria} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.porCategoria.map((cat) => (
                <TableRow key={cat.name}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right text-red-600">
                    -$
                    {cat.value.toLocaleString("es-DO", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {((cat.value / data.total) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right text-red-600">
                  -$
                  {data.total.toLocaleString("es-DO", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
