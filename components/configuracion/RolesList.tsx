import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

// Definición estática de los roles y sus capacidades según nuestro código
const rolesDefinidos = [
  {
    id: "admin",
    label: "Administrador Principal",
    color: "bg-red-100 text-red-800",
    descripcion:
      "Acceso total a todos los módulos y configuración del sistema.",
    permisos: [
      "Gestión de Usuarios y Roles",
      "Configuración de la Iglesia",
      "Finanzas (Ingresos, Egresos, Presupuestos)",
      "Gestión de Miembros (Crear/Borrar)",
      "Estructura Organizacional Completa",
    ],
  },
  {
    id: "tesorero",
    label: "Tesorero",
    color: "bg-green-100 text-green-800",
    descripcion: "Encargado de la gestión financiera y contable.",
    permisos: [
      "Registrar Ingresos y Egresos",
      "Gestionar Cajas Chicas y Bancos",
      "Ejecutar Distribución de Diezmos",
      "Ver Reportes Financieros",
      "NO puede cambiar roles de usuario",
    ],
  },
  {
    id: "secretario_sociedad",
    label: "Secretario de Sociedad",
    color: "bg-blue-100 text-blue-800",
    descripcion:
      "Gestión limitada a su sociedad específica (Damas, Jóvenes, etc.).",
    permisos: [
      "Ver solo su Sociedad asignada",
      "Registrar Asistencia de sus cultos",
      "Gestionar Programa de sus cultos",
      "NO tiene acceso a Finanzas Generales",
      "NO puede ver otras sociedades",
    ],
  },
  {
    id: "miembro_comite",
    label: "Miembro de Comité",
    color: "bg-orange-100 text-orange-800",
    descripcion: "Acceso de lectura para consulta de datos específicos.",
    permisos: [
      "Ver Calendario de Actividades",
      "Ver Directorio (Lectura)",
      "NO puede editar ni borrar nada",
    ],
  },
  {
    id: "consulta",
    label: "Solo Lectura",
    color: "bg-gray-100 text-gray-800",
    descripcion: "Para auditores o visitas que necesitan ver pero no tocar.",
    permisos: [
      "Ver Dashboards",
      "Ver Calendario",
      "Acceso de solo lectura estricto",
    ],
  },
];

export function RolesList() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {rolesDefinidos.map((rol) => (
        <Card key={rol.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{rol.label}</CardTitle>
                <CardDescription className="mt-2">
                  {rol.descripcion}
                </CardDescription>
              </div>
              <Badge variant="outline" className={rol.color}>
                {rol.id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grow">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
              Permisos Clave:
            </h4>
            <ul className="space-y-2">
              {rol.permisos.map((p, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  {p.includes("NO") ? (
                    <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  )}
                  <span
                    className={p.includes("NO") ? "text-muted-foreground" : ""}
                  >
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
