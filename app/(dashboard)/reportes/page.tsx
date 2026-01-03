import { getReportesHubData } from '@/actions/reportes/reportesMainActions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FinancialTrendChart } from '@/components/reportes/FinancialTrendChart' // Reusamos tu gráfica
import { Button } from '@/components/ui/button'
import {
  TrendingUp, TrendingDown, Users, Wallet,
  FileText, ArrowRight, BarChart3, PieChart
} from 'lucide-react'
import Link from 'next/link'

const fMoney = (val: number) => `$${val.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`

export default async function ReportesMonitoreoPage() {
  const { kpis, chartData, year } = await getReportesHubData()

  // Calculamos salud financiera simple
  const margen = kpis.ingresosAnuales - kpis.egresosAnuales
  const esSuperavit = margen >= 0

  return (
    <div className="space-y-6 pb-10">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Monitoreo</h1>
          <p className="text-muted-foreground">Análisis de rendimiento y generación de informes {year}.</p>
        </div>
      </div>

      {/* 1. FILA DE KPIs ESTRATÉGICOS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidez Actual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{fMoney(kpis.liquidezTotal)}</div>
            <p className="text-xs text-muted-foreground">Disponible en Bancos y Cajas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Anual</CardTitle>
            {esSuperavit ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${esSuperavit ? 'text-green-600' : 'text-red-600'}`}>
              {esSuperavit ? '+' : ''}{fMoney(margen)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos vs Egresos ({year})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{kpis.asistenciaPromedio}</div>
            <p className="text-xs text-muted-foreground">Personas por evento ({year})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membresía Activa</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{kpis.activos}</div>
            <p className="text-xs text-muted-foreground">+{kpis.nuevosMes} nuevos este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. GRÁFICA CENTRAL DE MONITOREO */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Comportamiento Financiero {year}</CardTitle>
            <CardDescription>Comparativa de Ingresos vs Gastos mes a mes.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <FinancialTrendChart data={chartData} />
          </CardContent>
        </Card>

        {/* 3. ACCESOS A REPORTES (Sidebar derecho) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Generar Documentos</h3>

          {/* Reporte Mensual */}
          <Link href="/reportes/financieros/informe-mensual" className="block group">
            <Card className="transition-all hover:border-purple-500 hover:shadow-md cursor-pointer">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-purple-700">Informe Mensual</h4>
                  <p className="text-xs text-muted-foreground">Formato oficial Concilio</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>

          {/* Reporte Anual */}
          <Link href="/reportes/financieros/informe-anual" className="block group">
            <Card className="transition-all hover:border-orange-500 hover:shadow-md cursor-pointer">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-orange-700">Informe Anual</h4>
                  <p className="text-xs text-muted-foreground">Resumen General Tesorería</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>

          {/* Hub Administrativo */}
          <Link href="/reportes/administrativos" className="block group">
            <Card className="transition-all hover:border-blue-500 hover:shadow-md cursor-pointer">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <PieChart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-blue-700">Reportes Admins.</h4>
                  <p className="text-xs text-muted-foreground">Membresía y Asistencia</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>

          {/* Hub Financiero Detallado */}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/reportes/financieros">Ver todos los reportes financieros</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}