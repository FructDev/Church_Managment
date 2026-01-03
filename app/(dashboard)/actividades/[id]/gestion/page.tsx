import { getSessionInfo } from '@/lib/auth/utils'
import { getActividadInfo } from '@/actions/actividades/actividadesActions'
import { getProgramaCulto } from '@/actions/actividades/programaActions'
import { ProgramaCultoEditor } from '@/components/actividades/gestion/ProgramaCultoEditor'
import { RegistroFinancieroCulto } from '@/components/actividades/gestion/RegistroFinancieroCulto'
import { AsistenciaCard } from '@/components/actividades/gestion/AsistenciaCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, DollarSign, ListOrdered } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCajasChicas } from '@/actions/finanzas/cajaChicaActions'
import { getCategoriasIngreso } from '@/actions/finanzas/ingresosActions'
import { ProgramaExportButton } from "@/components/actividades/gestion/ProgramaExportButton"
import { getChurchConfig } from "@/actions/layoutActions" // <-- 1. Importar esto
import { WhatsAppShareButton } from '@/components/actividades/gestion/WhatsAppShareButton'
import { NotasActividadCard } from '@/components/actividades/gestion/NotasActividadCard'

export default async function GestionCultoPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const { profile } = await getSessionInfo()

  // 2. EL ORDEN AQUÍ ES CRÍTICO
  const [actividad, cajas, categorias, programaData, churchConfig] = await Promise.all([
    getActividadInfo(id),          // 1. actividad
    getCajasChicas(),              // 2. cajas
    getCategoriasIngreso(),        // 3. categorias
    getProgramaCulto(id),          // 4. programaData (PartePrograma[])
    getChurchConfig()              // 5. churchConfig (Configuración) <-- Faltaba o estaba en desorden
  ])

  if (!actividad) notFound()

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link href="/actividades/calendario" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver al Calendario
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {actividad.titulo}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(actividad.fecha_inicio).toLocaleDateString('es-ES', { dateStyle: 'full' })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA (2/3): EL PROGRAMA */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                Programa del Culto
              </CardTitle>

              {/* GRUPO DE BOTONES DE EXPORTACIÓN */}
              <div className="flex gap-2 w-full sm:w-auto">
                {/* 2. AÑADIR BOTÓN WHATSAPP AQUÍ */}
                <WhatsAppShareButton
                  titulo={actividad.titulo}
                  fecha={new Date(actividad.fecha_inicio).toLocaleDateString('es-ES', { dateStyle: 'full' })}
                  programa={programaData}
                />

                {/* Botón PDF existente */}
                <ProgramaExportButton
                  titulo={actividad.titulo}
                  fecha={new Date(actividad.fecha_inicio).toLocaleDateString('es-ES', { dateStyle: 'full' })}
                  programa={programaData}
                  configuracion={{
                    nombre_iglesia: churchConfig?.nombre_iglesia || 'Iglesia Local',
                    direccion: churchConfig?.direccion || '',
                    logo_url: churchConfig?.logo_url || null
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ProgramaCultoEditor actividadId={id} />
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA (1/3): GESTIÓN */}
        <div className="space-y-6">

          {/* 1. ASISTENCIA RÁPIDA */}
          <AsistenciaCard
            actividadId={id}
            titulo="Asistencia General"
          />

          {/* 2. FINANZAS DEL CULTO */}
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                Finanzas del Día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RegistroFinancieroCulto
                actividadId={id}
                actividadTitulo={actividad.titulo}
                cajas={cajas}
                categorias={categorias}
                // Pasamos sociedadId si existe (para la caja automática)
                // @ts-ignore: actividad podría no tener sociedad_id en el tipo inferido simple, pero la BD lo tiene
                sociedadId={actividad.sociedad_id}
              />
            </CardContent>
          </Card>

          <NotasActividadCard
            actividadId={id}
            notasIniciales={actividad.notas} // Asegúrate de que 'getActividadInfo' traiga el campo 'notas'
          />

        </div>
      </div>
    </div>
  )
}