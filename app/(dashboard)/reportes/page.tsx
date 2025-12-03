/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDashboardGeneralData } from "@/actions/reportes/dashboardReportesActions";
import { FinancialTrendChart } from "@/components/reportes/FinancialTrendChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarCheck,
  ArrowRight,
  FileText,
  PieChart,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { minimumFractionDigits: 0 })}`;

export default async function ReportesDashboardPage() {
  const { financialTrend, kpis } = await getDashboardGeneralData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Centro de Inteligencia
        </h1>
        <p className="text-muted-foreground">
          Visión general del estado de la congregación.
        </p>
      </div>

      {/* 1. KPIs SUPERIORES (Tarjetas de alto impacto) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos (Mes)"
          value={fMoney(kpis.ingresosMes)}
          icon={TrendingUp}
          color="text-green-600"
          bg="bg-green-100/50"
        />
        <KpiCard
          title="Egresos (Mes)"
          value={fMoney(kpis.egresosMes)}
          icon={TrendingDown}
          color="text-red-600"
          bg="bg-red-100/50"
        />
        <KpiCard
          title="Membresía Activa"
          value={kpis.totalMiembros.toString()}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-100/50"
        />
        <KpiCard
          title="Asistencia Prom."
          value={kpis.avgAsistencia.toString()}
          icon={CalendarCheck}
          color="text-purple-600"
          bg="bg-purple-100/50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 2. GRÁFICA PRINCIPAL (Ocupa 2 columnas) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Tendencia Financiera (6 Meses)</CardTitle>
            <CardDescription>
              Comportamiento de ingresos vs. gastos operativos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <FinancialTrendChart data={financialTrend} />
          </CardContent>
        </Card>

        {/* 3. MENÚ DE REPORTES (Ocupa 1 columna) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Generar Reportes</h3>

          <ReportLink
            href="/reportes/financieros/informe-mensual"
            title="Informe Mensual Oficial"
            desc="PDF para el Concilio"
            icon={FileText}
            color="bg-indigo-600"
          />
          <ReportLink
            href="/reportes/financieros/estado-resultados"
            title="Estado de Resultados"
            desc="Comparativa Anual"
            icon={BarChart3}
            color="bg-blue-600"
          />
          <ReportLink
            href="/reportes/administrativos/membresia"
            title="Demografía y Cumpleaños"
            desc="Estadísticas de miembros"
            icon={PieChart}
            color="bg-pink-600"
          />
          <ReportLink
            href="/reportes/administrativos/asistencia"
            title="Análisis de Asistencia"
            desc="Tendencias de crecimiento"
            icon={Users}
            color="bg-orange-600"
          />
        </div>
      </div>
    </div>
  );
}

// --- Componentes Pequeños ---

function KpiCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportLink({ href, title, desc, icon: Icon, color }: any) {
  return (
    <Link href={href} className="block group">
      <Card className="hover:border-primary transition-all hover:shadow-md">
        <div className="p-4 flex items-center gap-4">
          <div
            className={`p-2.5 rounded-lg ${color} text-white shadow-sm group-hover:scale-110 transition-transform`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
