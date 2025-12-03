import { getConfiguracion } from "@/actions/configuracion/configuracionActions";
import { PreferenciasForm } from "@/components/configuracion/PreferenciasForm";

export default async function PreferenciasPage() {
  const config = await getConfiguracion();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Preferencias del Sistema</h1>
      <PreferenciasForm config={config} />
    </div>
  );
}
