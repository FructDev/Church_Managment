import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookUser, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

const modulos = [
  {
    titulo: "Estadísticas de Membresía",
    descripcion: "Gráficas de crecimiento, demografía y cumpleaños.",
    href: "/reportes/administrativos/membresia",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  {
    titulo: "Directorio General",
    descripcion: "Listado completo para imprimir (PDF).",
    href: "/reportes/administrativos/directorio", // Lo haremos luego
    icon: BookUser,
    color: "text-purple-600 bg-purple-50",
  },
  {
    titulo: "Estadísticas de Asistencia",
    descripcion: "Análisis de tendencias y participación en cultos.",
    href: "/reportes/administrativos/asistencia", // <-- Ya funciona
    icon: Users,
    color: "text-green-600 bg-green-50",
  },
  {
    titulo: "Reporte Anual de Actividades",
    descripcion: "Resumen de eventos realizados y cancelados.",
    href: "/reportes/administrativos/actividades", // <-- Ya funciona
    icon: Calendar, // Importar Calendar
    color: "text-orange-600 bg-orange-50",
  },
];

export default function ReportesAdministrativosHub() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes Administrativos</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((m) => (
          <Link key={m.titulo} href={m.href} className="group block">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${m.color}`}
                >
                  <m.icon className="h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {m.titulo}
                </CardTitle>
                <CardDescription>{m.descripcion}</CardDescription>
                <div className="pt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver Reporte <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
