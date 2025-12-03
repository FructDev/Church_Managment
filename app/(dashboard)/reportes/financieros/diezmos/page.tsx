import { getReporteDiezmosAnual } from "@/actions/reportes/financierosActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportToolbar } from "@/components/reportes/ExportToolbar";
import { GraficaBarras } from "@/components/reportes/GraficasFinancieras";

export default async function ReporteDiezmosPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await props.searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const data = await getReporteDiezmosAnual(year);
  const totalAnual = data.reduce((acc, curr) => acc + curr.monto, 0);

  // Formatear para gráfica
  const chartData = data.map((d) => ({
    name: `${d.fecha} (${d.periodo === "primera_quincena" ? "1ra" : "2da"})`,
    value: d.monto,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Histórico de Diezmos {year}</h1>
        <ExportToolbar data={data} filename={`Reporte_Diezmos_${year}`} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Recaudado (Año)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              $
              {totalAnual.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <GraficaBarras
          title="Tendencia de Recaudación por Quincena"
          data={chartData}
        />
      </div>
    </div>
  );
}
