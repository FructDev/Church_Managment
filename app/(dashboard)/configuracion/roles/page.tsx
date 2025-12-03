import { getSessionInfo } from "@/lib/auth/utils";
import { RolesList } from "@/components/configuracion/RolesList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function RolesPage() {
  const { profile } = await getSessionInfo();

  if (profile?.rol !== "admin") {
    return <div className="p-10 text-center">Acceso Denegado</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Definición de Roles y Permisos</h1>
        <p className="text-muted-foreground">
          Referencia de los niveles de acceso disponibles en el sistema.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Información del Sistema</AlertTitle>
        <AlertDescription>
          Los roles son estructurales y no pueden ser modificados o eliminados.
          Para asignar un rol a una persona, vaya a la sección{" "}
          <strong>Usuarios</strong>.
        </AlertDescription>
      </Alert>

      <RolesList />
    </div>
  );
}
