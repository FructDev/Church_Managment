/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDirectorio } from "@/actions/reportes/administrativosActions";
import { DirectorioPDFDocument } from "@/components/reportes/administrativos/DirectorioPDFDocument";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, UserCheck } from "lucide-react";
// Necesitamos un componente cliente para el PDFDownloadLink
import { DownloadButton } from "./DownloadButton"; // Lo creamos abajo

export default async function DirectorioPage() {
  const miembros = await getDirectorio();
  const totalActivos = miembros.filter(
    (m: any) => m.estado_membresia === "activo"
  ).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Directorio de Miembros</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Listado</CardTitle>
          <CardDescription>
            Vista previa de los datos que se exportarán.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-8 border-b pb-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-3xl font-bold">{miembros.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros Activos</p>
              <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
                {totalActivos} <UserCheck className="h-5 w-5" />
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-8 bg-muted/10 rounded-lg border border-dashed">
            <p className="mb-4 text-muted-foreground">
              El directorio está listo para ser generado.
            </p>
            <DownloadButton data={miembros} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
