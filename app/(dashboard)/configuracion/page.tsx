import { getSessionInfo } from "@/lib/auth/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Settings,
  Users,
  CreditCard,
  Calendar,
  Database,
  Building,
} from "lucide-react";
import Link from "next/link";

const configModules = [
  {
    title: "Datos de la Congregación",
    desc: "Nombre, logo, dirección y contacto.",
    href: "/configuracion/congregacion",
    icon: Building,
    color: "text-blue-600",
  },
  {
    title: "Usuarios y Roles",
    desc: "Gestionar accesos y permisos del sistema.",
    href: "/configuracion/usuarios",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "Categorías Financieras",
    desc: "Editar conceptos de Ingresos y Egresos.",
    href: "/configuracion/categorias",
    icon: CreditCard,
    color: "text-green-600",
  },
  {
    title: "Tipos de Actividad",
    desc: "Gestionar colores y tipos de eventos.",
    href: "/actividades/tipos", // Reutilizamos la página que ya hicimos
    icon: Calendar,
    color: "text-orange-600",
  },
  {
    title: "Respaldo de Datos",
    desc: "Descargar copia de seguridad.",
    href: "/configuracion/respaldos",
    icon: Database,
    color: "text-slate-600",
  },
];

export default async function ConfiguracionHub() {
  const { profile } = await getSessionInfo();

  if (profile?.rol !== "admin") {
    return (
      <div className="p-10 text-center">
        Acceso restringido a Administradores.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-8 w-8 text-gray-700" />
        Configuración del Sistema
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configModules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="block group h-full">
            <Card className="h-full hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`p-2 rounded-lg bg-muted ${mod.color}`}>
                    <mod.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {mod.title}
                  </CardTitle>
                </div>
                <CardDescription>{mod.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
