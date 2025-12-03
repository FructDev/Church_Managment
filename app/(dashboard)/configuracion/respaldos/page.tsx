import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackupButton } from "@/components/configuracion/BackupButton";
import { ShieldCheck } from "lucide-react";

export default function RespaldosPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Respaldos y Seguridad</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle>Exportación de Datos</CardTitle>
              <CardDescription>
                Descargue una copia completa de la base de datos en formato
                JSON.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 gap-4">
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Este archivo contiene toda la información de miembros,
            transacciones, diezmos y configuraciones. Guárdelo en un lugar
            seguro.
          </p>
          <BackupButton />
        </CardContent>
      </Card>
    </div>
  );
}
