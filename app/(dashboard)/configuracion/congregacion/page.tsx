// app/(dashboard)/configuracion/congregacion/page.tsx
import { getConfiguracion } from "@/actions/configuracion/configuracionActions";
import { CongregacionForm } from "@/components/configuracion/CongregacionForm"; // Lo creamos abajo

export default async function CongregacionPage() {
  const config = await getConfiguracion();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Datos de la Congregación</h1>
      <p className="text-muted-foreground">
        Esta información aparecerá en los reportes y encabezados.
      </p>

      <CongregacionForm initialData={config} />
    </div>
  );
}
