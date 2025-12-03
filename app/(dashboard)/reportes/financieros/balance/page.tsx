import { getBalanceGeneral } from "@/actions/reportes/financierosActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportToolbar } from "@/components/reportes/ExportToolbar";
import { Landmark, Wallet, Scale } from "lucide-react";

const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

export default async function BalanceGeneralPage() {
  const data = await getBalanceGeneral();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Balance General (Situación Financiera)
        </h1>
        <ExportToolbar data={data.activos} filename="Balance_General" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Activos
            </CardTitle>
            <Landmark className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {fMoney(data.totalActivos)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pasivos
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {fMoney(data.totalPasivos)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-green-700">
              Patrimonio Neto
            </CardTitle>
            <Scale className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {fMoney(data.patrimonio)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Activos (Disponibilidad)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuenta / Caja</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.activos.map((activo, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{activo.nombre}</TableCell>
                  <TableCell>{activo.tipo}</TableCell>
                  <TableCell className="text-right font-bold">
                    {fMoney(activo.monto)}
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
