import { getSessionInfo } from "@/lib/auth/utils";
import { getExecutiveDashboardData } from "@/actions/dashboard/mainDashboard";
import {
  MembresiaCard,
  FinanzasCard,
  AgendaWidget,
  MiniGraficaFinanciera,
  QuickActionsGrid,
  BirthdayWidget,
  AccountsWidget,
} from "@/components/dashboard/DashboardWidgets";

export default async function DashboardPage() {
  const { profile } = await getSessionInfo();

  // --- CORRECCIÓN 1: Validación de Nulo ---
  // Aunque el layout protege, debemos decirle a TS que si no hay perfil, no seguimos.
  if (!profile) {
    return <div>Cargando sesión...</div>;
  }

  const data = await getExecutiveDashboardData();

  // --- CORRECCIÓN 2: Casting de Rol ---
  // Convertimos a string para poder comparar con 'pastor'
  // aunque no esté en el ENUM de la base de datos todavía.
  const role = profile.rol as string;

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  const showFinance = role === "admin" || role === "tesorero";
  // Ahora TS no se quejará de la comparación con 'pastor'
  const showPastoral =
    role === "admin" || role === "secretario_sociedad" || role === "pastor";

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {saludo}, {profile.nombre_completo.split(" ")[0]}.
        </h1>
        <p className="text-muted-foreground">
          Resumen ejecutivo de la congregación.
        </p>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <QuickActionsGrid role={role} />

      {/* GRID PRINCIPAL */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Columna 1: KPIs Vitales */}
        {showPastoral && (
          <MembresiaCard
            total={data.membresia.total}
            activos={data.membresia.activos}
            bautizados={data.membresia.bautizados}
            porcentaje={data.membresia.porcentajeBautizados}
          />
        )}

        {/* Columna 2: Finanzas Vitales */}
        {showFinance && (
          <FinanzasCard
            ingresos={data.finanzas.ingresosOperativos}
            egresos={data.finanzas.egresosOperativos}
            diezmos={data.finanzas.diezmos}
          />
        )}

        {/* Columna 3: Cuentas (Tesorero) o Cumpleaños (Pastor) */}
        {showFinance ? (
          <AccountsWidget accounts={data.accounts} />
        ) : (
          <BirthdayWidget people={data.birthdays} />
        )}
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfica Financiera (Si tiene permiso) */}
        {showFinance ? (
          <div className="lg:col-span-2 h-[300px]">
            <MiniGraficaFinanciera data={data.grafica} />
          </div>
        ) : (
          // Si no ve finanzas, la agenda ocupa más espacio
          <div className="lg:col-span-2 h-full">
            <AgendaWidget actividades={data.agenda} />
          </div>
        )}

        {/* Panel Lateral Derecho */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Si ve finanzas, la agenda va aquí */}
          {showFinance && <AgendaWidget actividades={data.agenda} />}

          {/* Si es Admin y ve todo, los cumpleaños van aquí abajo */}
          {showFinance && showPastoral && (
            <BirthdayWidget people={data.birthdays} />
          )}
        </div>
      </div>
    </div>
  );
}
