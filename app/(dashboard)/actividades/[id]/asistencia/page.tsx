import { getSessionInfo } from "@/lib/auth/utils";
// CORRECCIÓN: La ruta correcta es asistenciaActions, no actividadesActions
import { getListaAsistencia } from "@/actions/actividades/actividadesActions";
import { AsistenciaForm } from "@/components/actividades/AsistenciaForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

// Función auxiliar para obtener título de actividad
async function getActividadInfo(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("actividades")
    .select("titulo, fecha_inicio")
    .eq("id", id)
    .single();
  return data;
}

import { ROLES_ADMINISTRATIVOS } from "@/lib/auth/roles";

// --- CORRECCIÓN PARA NEXT.JS 15/16 ---
export default async function AsistenciaPage(props: {
  params: Promise<{ id: string }>;
}) {
  // 1. Desempaquetar la promesa de params
  const { id } = await props.params;
  // -------------------------------------

  const { profile } = await getSessionInfo();
  const canManage = ROLES_ADMINISTRATIVOS.includes(profile?.rol as any);

  if (!canManage)
    return <div className="p-10 text-center">Acceso Denegado</div>;

  const [actividad, asistenciaData] = await Promise.all([
    getActividadInfo(id),
    getListaAsistencia(id),
  ]);

  if (!actividad) notFound();

  return (
    <div className="w-full space-y-6">
      {/* Header Simple */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Link
            href="/actividades/calendario"
            className="hover:text-primary transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver al Calendario
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Asistencia: {actividad.titulo}
        </h1>
        <p className="text-muted-foreground">
          {new Date(actividad.fecha_inicio).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <AsistenciaForm actividadId={id} initialData={asistenciaData} />
    </div>
  );
}
