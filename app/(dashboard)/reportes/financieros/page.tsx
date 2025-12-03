import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  Scale,
  ArrowRightLeft,
  Percent,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const reports = [
  {
    title: "Reporte de Ingresos",
    desc: "Análisis detallado de entradas por categoría.",
    href: "/reportes/financieros/ingresos",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Reporte de Egresos",
    desc: "Desglose de gastos y salidas.",
    href: "/reportes/financieros/egresos",
    icon: TrendingDown,
    color: "text-red-600",
  },
  {
    title: "Estado de Resultados",
    desc: "Comparativa anual mes a mes.",
    href: "/reportes/financieros/estado-resultados",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Informe Mensual (PDF)",
    desc: "Formato oficial para el concilio.",
    // Esta página ya la creamos antes, asegúrate de que la ruta coincida
    href: "/reportes/financieros/informe-mensual",
    icon: PieChart,
    color: "text-purple-600",
  },
  {
    title: "Informe Anual (PDF)",
    desc: "Resumen general de tesorería del año.",
    href: "/reportes/financieros/informe-anual",
    icon: BookOpen,
    color: "text-orange-600",
  },
  {
    title: "Balance General",
    desc: "Activos disponibles y situación actual.",
    href: "/reportes/financieros/balance",
    icon: Scale, // Importar
    color: "text-indigo-600",
  },
  {
    title: "Flujo de Efectivo",
    desc: "Análisis de entradas y salidas mensuales.",
    href: "/reportes/financieros/flujo-efectivo",
    icon: ArrowRightLeft, // Importar
    color: "text-orange-600",
  },
  {
    title: "Reporte de Diezmos",
    desc: "Histórico anual de recaudación.",
    href: "/reportes/financieros/diezmos",
    icon: Percent,
    color: "text-cyan-600",
  },
];

export default function ReportesFinancierosHub() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes Financieros</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {reports.map((r) => (
          <Link key={r.title} href={r.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full bg-muted ${r.color}`}>
                  <r.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{r.title}</CardTitle>
                  <CardDescription>{r.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
