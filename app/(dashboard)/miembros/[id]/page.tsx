import { getMiembroById, getSociedadesList } from "@/actions/miembros/miembrosActions";
import { getMemberStats } from "@/actions/miembros/memberStatsActions"; // <-- NUEVA ACCIÓN
import { getSessionInfo } from "@/lib/auth/utils";
import { MiembroProfileCard } from "@/components/miembros/MiembroProfileCard";
// Importamos los nuevos widgets
import { AsistenciaStatsCard, FinanceStatsCard } from "@/components/miembros/MemberStatsWidgets";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GrantAccessDialog } from "@/components/miembros/GrantAccessDialog";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROLES_ACCESO_TOTAL, ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

// --- HELPER PARA VERIFICAR USUARIO ---
async function checkHasUser(miembroId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("miembro_id", miembroId)
    .single();
  return !!data;
}

export default async function MiembroDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { profile } = await getSessionInfo();

  // 1. Obtener datos en paralelo
  const [miembro, sociedades, hasUser, stats] = await Promise.all([
    getMiembroById(id),
    getSociedadesList(),
    checkHasUser(id),
    getMemberStats(id), // <-- OBTENER ESTADÍSTICAS
  ]);

  if (!miembro) {
    notFound();
  }

  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);
  const canGrantAccess = ROLES_ACCESO_TOTAL.includes(profile?.rol as any);

  return (
    <div className="w-full space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/miembros" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit">
            <ArrowLeft className="h-4 w-4" /> Volver a la lista
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Perfil de Miembro</h1>
        </div>

        <div className="flex gap-2">
          {canGrantAccess && !hasUser && (
            <GrantAccessDialog miembro={miembro}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <KeyRound className="mr-2 h-4 w-4" />
                Dar Acceso al Sistema
              </Button>
            </GrantAccessDialog>
          )}

          {hasUser && (
            <Button variant="outline" disabled className="text-green-600 border-green-200 bg-green-50 opacity-100">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Usuario Activo
            </Button>
          )}
        </div>
      </div>

      {/* Tarjeta Principal */}
      <MiembroProfileCard
        miembro={miembro}
        sociedades={sociedades}
        canManage={canManage}
      />

      {/* --- SECCIÓN DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Asistencia (2/3 del ancho en pantallas grandes) */}
        <div className="lg:col-span-2">
          <AsistenciaStatsCard data={stats.asistencia} />
        </div>

        {/* Finanzas (1/3 del ancho, solo visible si hay datos/permisos) */}
        {/* Si stats.finanzas es null (por permisos), renderizamos un placeholder o nada */}
        <div>
          {stats.finanzas ? (
            <FinanceStatsCard data={stats.finanzas} />
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/10 text-muted-foreground text-sm p-6 text-center">
              Información financiera restringida.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}