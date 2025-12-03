/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  MapPin,
  ArrowRight,
  Cake,
  UserPlus,
  Landmark,
  HandCoins,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`;

// 1. TARJETA DE MEMBRESÍA
export function MembresiaCard({ total, activos, bautizados, porcentaje }: any) {
  return (
    <Card className="border-none shadow-md bg-linear-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative h-full">
      <Users className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10" />
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-100 font-medium text-sm">
          Membresía Total
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">{total}</div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-blue-100 mb-1">
            <span>Bautizados ({bautizados})</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="h-2 w-full bg-blue-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/90 rounded-full"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className="text-xs text-blue-200 pt-2">
            {activos} miembros activos en comunión.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// 2. TARJETA FINANCIERA
export function FinanzasCard({ ingresos, egresos, diezmos }: any) {
  const totalEntradas = ingresos + diezmos;

  return (
    <Card className="border-none shadow-md bg-white dark:bg-zinc-900 h-full">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-500 text-sm font-medium">
            Flujo del Mes
          </CardTitle>
          <Wallet className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {fMoney(totalEntradas)}
          </span>
          <p className="text-xs text-muted-foreground">
            Entradas Totales (Inc. Diezmos)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">Operativo</span>
            </div>
            <p className="font-semibold text-sm">{fMoney(ingresos)}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
              <TrendingUp className="h-4 w-4 rotate-180" />
              <span className="text-xs font-bold">Gastos</span>
            </div>
            <p className="font-semibold text-sm">{fMoney(egresos)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 3. WIDGET DE AGENDA
export function AgendaWidget({ actividades }: { actividades: any[] }) {
  return (
    <Card className="h-full flex flex-col shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximos Eventos
          </CardTitle>
          <Link
            href="/actividades/calendario"
            className="text-xs text-blue-600 hover:underline"
          >
            Ver todo
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {actividades.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin actividades próximas.
          </p>
        ) : (
          <div className="space-y-4">
            {actividades.map((act) => (
              <div
                key={act.id}
                className="flex gap-4 items-start group cursor-default"
              >
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-xl text-primary shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {new Date(act.fecha_inicio).toLocaleDateString("es", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {new Date(act.fecha_inicio).getDate()}
                  </span>
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {act.titulo}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: act.tipo?.color || "gray" }}
                      />
                      {act.tipo?.nombre}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 4. GRÁFICA
export function MiniGraficaFinanciera({ data }: { data: any[] }) {
  return (
    <Card className="shadow-md border-none bg-white dark:bg-zinc-900 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Tendencia Semestral
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="Ingresos"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#gradIngresos)"
            />
            <Area
              type="monotone"
              dataKey="Egresos"
              stroke="#ef4444"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 5. CUENTAS Y FONDOS
export function AccountsWidget({ accounts }: { accounts: any[] }) {
  return (
    <Card className="h-full shadow-md border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" /> Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((acc, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm border-b border-dashed pb-2 last:border-0"
          >
            <div className="flex flex-col">
              <span className="font-medium">{acc.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {acc.type}
              </span>
            </div>
            <span className="font-bold font-mono text-green-700">
              {fMoney(acc.amount)}
            </span>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No hay cuentas activas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// 6. CUMPLEAÑOS
export function BirthdayWidget({ people }: { people: any[] }) {
  const monthName = new Date().toLocaleDateString("es-ES", { month: "long" });
  return (
    <Card className="h-full shadow-md border-l-4 border-l-pink-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 capitalize">
          <Cake className="h-5 w-5 text-pink-500" /> Cumpleaños de {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {people.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay cumpleaños próximos.
            </p>
          )}
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-10 h-10 bg-pink-50 text-pink-600 rounded-lg shrink-0">
                <span className="text-xs font-bold">{p.dia}</span>
              </div>
              <span className="text-sm font-medium truncate">
                {p.nombre_completo}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import {
  ROLES_FINANCIEROS,
  ROLES_ADMINISTRATIVOS,
} from "@/lib/auth/roles";
import { type Database } from "@/lib/database.types";

// ...

// 7. ACCIONES RÁPIDAS (Adaptativo)
export function QuickActionsGrid({ role }: { role: string }) {
  const actions = [];

  // Financiero
  if (ROLES_FINANCIEROS.includes(role as any)) {
    actions.push(
      {
        label: "Nuevo Ingreso",
        href: "/finanzas/ingresos",
        icon: TrendingUp,
        color: "bg-green-100 text-green-700",
      },
      {
        label: "Nuevo Egreso",
        href: "/finanzas/egresos",
        icon: TrendingDown,
        color: "bg-red-100 text-red-700",
      },
      {
        label: "Reg. Diezmos",
        href: "/finanzas/diezmos/nuevo-lote",
        icon: HandCoins,
        color: "bg-purple-100 text-purple-700",
      },
      {
        label: "Ver Bancos",
        href: "/finanzas/cuentas-bancarias",
        icon: Landmark,
        color: "bg-blue-100 text-blue-700",
      }
    );
  }

  // Administrativo
  if (ROLES_ADMINISTRATIVOS.includes(role as any)) {
    actions.push(
      {
        label: "Nuevo Miembro",
        href: "/miembros",
        icon: UserPlus,
        color: "bg-indigo-100 text-indigo-700",
      },
      {
        label: "Crear Evento",
        href: "/actividades/calendario",
        icon: Calendar,
        color: "bg-orange-100 text-orange-700",
      },
      {
        label: "Pasar Lista",
        href: "/actividades/calendario",
        icon: FileText,
        color: "bg-yellow-100 text-yellow-700",
      }
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
      {actions.map((action, i) => (
        <Link key={i} href={action.href} className="group">
          <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 border-none bg-muted/30">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div
                className={`p-2.5 rounded-full ${action.color} group-hover:scale-110 transition-transform`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">
                {action.label}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
