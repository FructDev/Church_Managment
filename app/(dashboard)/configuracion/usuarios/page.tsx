import { getUsuariosSistema } from "@/actions/configuracion/configuracionActions";
import { UsuariosTable } from "@/components/configuracion/UsuariosTable"; // Lo creamos

export default async function UsuariosPage() {
  const usuarios = await getUsuariosSistema();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Usuarios y Roles</h1>
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}
