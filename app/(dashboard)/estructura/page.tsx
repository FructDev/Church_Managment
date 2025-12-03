/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Users,
  Building,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getSessionInfo } from "@/lib/auth/utils";
import {
  ROLES_JERARQUIA_NO_FINANCIERA,
  ROLES_ADMINISTRATIVOS,
} from "@/lib/auth/roles";

// Definimos los enlaces y qué grupo de roles puede verlos
const estructuraModulos = [
  {
    titulo: "Liderazgo",
    descripcion: "Pastor, Co-Pastor y Ejecutivos Generales.",
    href: "/estructura/liderazgo",
    icon: ShieldCheck,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    // Solo la Cúpula y Co-Pastor
    roles: ROLES_JERARQUIA_NO_FINANCIERA,
  },
  {
    titulo: "Cuerpo de Diáconos",
    descripcion: "Servidores oficiales de la congregación.",
    href: "/estructura/diaconos",
    icon: Users,
    color: "text-orange-600 bg-orange-50 border-orange-100",
    // Solo la Cúpula y Co-Pastor
    roles: ROLES_JERARQUIA_NO_FINANCIERA,
  },
  {
    titulo: "Sociedades",
    descripcion: "Damas, Caballeros, Jóvenes y Niños.",
    href: "/estructura/sociedades",
    icon: Building,
    color: "text-purple-600 bg-purple-50 border-purple-100",
    // Jerarquía + Líderes de Sociedad (para ver su propia sociedad)
    roles: ROLES_ADMINISTRATIVOS,
  },
  {
    titulo: "Comités de Trabajo",
    descripcion: "Finanzas, Visitas, Eventos y Junta Oficial.",
    href: "/estructura/comites",
    icon: ClipboardList,
    color: "text-green-600 bg-green-50 border-green-100",
    // Solo la Cúpula y Co-Pastor
    roles: ROLES_JERARQUIA_NO_FINANCIERA,
  },
];

export default async function EstructuraPage() {
  const { profile } = await getSessionInfo();
  const userRole = profile?.rol as any;

  const modulosVisibles = estructuraModulos.filter(
    (m) => userRole && m.roles.includes(userRole)
  );

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Estructura Organizacional
        </h1>
        <p className="text-muted-foreground text-lg">
          Gestión de los departamentos y liderazgo de la iglesia.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {modulosVisibles.map((modulo) => (
          <Link
            key={modulo.titulo}
            href={modulo.href}
            className="group block h-full"
          >
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col border-l-4 border-l-transparent hover:border-l-primary">
              <CardHeader className="flex-grow">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${modulo.color} transition-transform group-hover:scale-110`}
                >
                  <modulo.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {modulo.titulo}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {modulo.descripcion}
                </CardDescription>
              </CardHeader>

              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Gestionar <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {modulosVisibles.length === 0 && (
        <div className="p-10 text-center border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            No tiene permisos para ver los módulos de estructura.
          </p>
        </div>
      )}
    </div>
  );
}
