import { getFlujoEfectivo } from "@/actions/reportes/financierosActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraficaEstadoResultados } from "@/components/reportes/GraficaEstadoResultados"; // Reutilizamos la gráfica de barras
import { ExportToolbar } from "@/components/reportes/ExportToolbar";

const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

export default async function FlujoEfectivoPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await props.searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const data = await getFlujoEfectivo(year);

  // Adaptamos datos para la gráfica (necesita keys 'Ingresos' y 'Egresos')
  const chartData = data.map((d) => ({
    name: d.name,
    Ingresos: d.entradas,
    Egresos: d.salidas,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flujo de Efectivo {year}</h1>
        <ExportToolbar data={data} filename={`Flujo_Efectivo_${year}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimiento Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficaEstadoResultados data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right text-green-600">
                  Entradas
                </TableHead>
                <TableHead className="text-right text-red-600">
                  Salidas
                </TableHead>
                <TableHead className="text-right">Flujo Neto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right text-green-600">
                    +{fMoney(row.entradas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{fMoney(row.salidas)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      row.neto >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {fMoney(row.neto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
