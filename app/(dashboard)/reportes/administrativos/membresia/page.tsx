import { getEstadisticasMembresia } from "@/actions/reportes/administrativosActions";
import { BirthdayList } from "@/components/reportes/administrativos/BirthdayList";
import { GraficaPastel } from "@/components/reportes/GraficasFinancieras"; // Reutilizamos
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function MembresiaStatsPage() {
  const stats = await getEstadisticasMembresia();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas de Membresía</h1>

      {/* KPI Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Miembros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Gráficas */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <GraficaPastel title="Por Estado Civil" data={stats.porEstadoCivil} />
          <GraficaPastel
            title="Por Estado Membresía"
            data={stats.porMembresia}
          />
        </div>

        {/* Columna Derecha: Cumpleaños */}
        <div className="lg:col-span-1">
          <BirthdayList list={stats.cumpleanerosMes} />
        </div>
      </div>
    </div>
  );
}
