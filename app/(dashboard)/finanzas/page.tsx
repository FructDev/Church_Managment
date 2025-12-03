// app/(dashboard)/finanzas/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";
import { getFinanzasSummary } from "@/actions/finanzas/summaryActions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Banknote,
  Landmark,
  Scale,
  BookOpen,
  Coins,
  Wallet, // Icono para Presupuestos
} from "lucide-react";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtext,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  variant?: "default" | "positive" | "negative";
  subtext?: string;
}) {
  const color =
    variant === "positive"
      ? "text-green-600"
      : variant === "negative"
        ? "text-destructive"
        : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

const financeModules = [
  {
    title: "Ingresos",
    description: "Registrar ofrendas y entradas.",
    href: "/finanzas/ingresos",
    icon: TrendingUp,
  },
  {
    title: "Egresos",
    description: "Registrar gastos operativos.",
    href: "/finanzas/egresos",
    icon: TrendingDown,
  },
  {
    title: "Gestión de Diezmos",
    description: "Registrar y distribuir diezmos.",
    href: "/finanzas/diezmos",
    icon: Percent,
  },
  {
    title: "Presupuestos",
    description: "Control de gastos anuales.",
    href: "/finanzas/presupuestos",
    icon: Wallet,
  },
  {
    title: "Caja Chica",
    description: "Efectivo para gastos menores.",
    href: "/finanzas/caja-chica",
    icon: Banknote,
  },
  {
    title: "Cuentas Bancarias",
    description: "Saldos bancarios.",
    href: "/finanzas/cuentas-bancarias",
    icon: Landmark,
  },
];

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function FinanzasHubPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage) {
    return <div className="w-full text-center p-10">Acceso Denegado.</div>;
  }

  const summary = await getFinanzasSummary();

  return (
    <div className="w-full space-y-8">
      {/* SECCIÓN 1: BALANCE OPERATIVO (Real) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Balance Operativo (Mes Actual)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Saldo Total (Bancos + Caja)"
            value={formatCurrency(summary.saldoTotal)}
            icon={Wallet}
            subtext="Liquidez actual disponible"
          />
          <StatsCard
            title="Ingresos Operativos"
            value={formatCurrency(summary.totalIngresosOperativos)}
            icon={TrendingUp}
            variant="positive"
            subtext="Excluye diezmos"
          />
          <StatsCard
            title="Egresos Operativos"
            value={formatCurrency(summary.totalEgresosMes)}
            icon={TrendingDown}
            variant="negative"
          />
          <StatsCard
            title="Balance Neto del Mes"
            value={formatCurrency(summary.balanceOperativo)}
            icon={Scale}
            variant={summary.balanceOperativo >= 0 ? "positive" : "negative"}
            subtext="Ingresos Op. - Egresos"
          />
        </div>
      </div>

      {/* SECCIÓN 2: DETALLE DE RECAUDACIÓN */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Desglose de Recaudación (Mes Actual)
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Diezmos Recibidos"
            value={formatCurrency(summary.totalDiezmos)}
            icon={Percent}
            subtext="Entra y sale (No operativo)"
          />
          <StatsCard
            title="Ofrendas Generales"
            value={formatCurrency(summary.totalOfrendasGenerales)}
            icon={Coins}
            subtext="Fondo general"
          />
          <StatsCard
            title="Escuela Bíblica"
            value={formatCurrency(summary.totalEscuelaBiblica)}
            icon={BookOpen}
            subtext="Ofrendas específicas"
          />
        </div>
      </div>

      {/* SECCIÓN 3: MÓDULOS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gestión</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {financeModules.map((modulo) => (
            <Card
              key={modulo.title}
              // --- ¡CORRECCIÓN AQUÍ! ---
              // Añadimos 'relative' para contener el Link absoluto
              className="flex flex-col hover:bg-muted/50 transition-colors relative group"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <modulo.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle>{modulo.title}</CardTitle>
                  <CardDescription>{modulo.description}</CardDescription>
                </div>
              </CardHeader>

              {/* El enlace llena todo el espacio 'relative' de la tarjeta */}
              <Link href={modulo.href} className="absolute inset-0 z-10">
                <span className="sr-only">Ir a {modulo.title}</span>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
