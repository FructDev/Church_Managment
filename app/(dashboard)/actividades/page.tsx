import { getSessionInfo } from "@/lib/auth/utils";
import { getActividadesDashboard } from "@/actions/actividades/dashboardActions";
import { NextServiceProgram } from "@/components/actividades/NextServiceProgram";
import {
  CalendarDays,
  Home,
  Users,
  DollarSign,
  Settings2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function ActividadesHubPage() {
  const { profile } = await getSessionInfo();
  const data = await getActividadesDashboard();

  const mainModules = [
    {
      title: "Calendario General",
      description: "Ver y gestionar todos los eventos.",
      href: "/actividades/calendario",
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
      borderColor:
        "group-hover:border-blue-200 dark:group-hover:border-blue-800",
    },
    {
      title: "Cultos en Hogares",
      description: "Gestión de células y direcciones.",
      href: "/actividades/cultos-hogares",
      icon: Home,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
      borderColor:
        "group-hover:border-orange-200 dark:group-hover:border-orange-800",
    },
    {
      title: "Escuela Bíblica",
      description: "Clases, maestros y alumnos.",
      href: "/actividades/escuela-biblica",
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20",
      borderColor:
        "group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
    },
    {
      title: "Eventos Pro-Fondos",
      description: "Actividades financieras (Almuerzos, etc).",
      href: "/actividades/financieras",
      icon: DollarSign,
      color: "text-green-600 bg-green-50 dark:bg-green-950/20",
      borderColor:
        "group-hover:border-green-200 dark:group-hover:border-green-800",
    },
    {
      title: "Tipos de Actividad",
      description: "Configurar colores y categorías.",
      href: "/actividades/tipos",
      icon: Settings2,
      color: "text-gray-600 bg-gray-50 dark:bg-gray-950/20",
      borderColor:
        "group-hover:border-gray-200 dark:group-hover:border-gray-800",
    },
  ];

  return (
    <div className="w-full space-y-8 px-1">
      {/* Header mejorado */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 bg-primary rounded-full" />
          <h1 className="text-3xl font-bold tracking-tight">
            Panel de Actividades
          </h1>
        </div>
        <p className="text-muted-foreground pl-5">
          Administre eventos, cultos y actividades de la iglesia desde un solo
          lugar.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: NAVEGACIÓN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {mainModules.map((mod, idx) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group block h-full"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Card
                  className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 ${mod.borderColor}`}
                >
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                    <div
                      className={`p-3.5 rounded-xl ${mod.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                    >
                      <mod.icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg mb-0 group-hover:text-primary transition-colors">
                          {mod.title}
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {mod.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: PRÓXIMO EVENTO */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Próximo en Agenda
              </h3>
            </div>
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <NextServiceProgram actividad={data.proxima} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
