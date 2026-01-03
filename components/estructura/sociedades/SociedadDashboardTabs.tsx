"use client";

import { type ResumenSociedad } from "@/actions/estructura/sociedadesActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  ArrowRight,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Sub-componente: Tarjeta de Próximo Culto
function ProximoCultoCard({
  evento,
}: {
  evento: ResumenSociedad["proximoCulto"];
}) {
  if (!evento) {
    return (
      <Card className="bg-muted/10 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Calendar className="h-8 w-8 mb-2 opacity-50" />
          <p>No hay cultos programados.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/actividades/calendario">Ir al Calendario</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>Próximo Culto</CardTitle>
        <CardDescription>
          Gestione el programa y prepare la asistencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{evento.titulo}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(evento.fecha_inicio).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="mx-1">•</span>
              <span>
                {new Date(evento.fecha_inicio).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* EL ENLACE QUE CONECTA LOS MÓDULOS */}
          <Button asChild size="lg">
            <Link href={`/actividades/${evento.id}/gestion`}>
              Gestionar Culto <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-componente: Tabla de Seguimiento
function SeguimientoTable({
  miembros,
}: {
  miembros: ResumenSociedad["seguimiento"];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {miembros.map((m) => (
          <div
            key={m.miembro_id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={m.foto_url || undefined} />
                <AvatarFallback>
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{m.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Última vez:{" "}
                  {m.ultima_asistencia
                    ? new Date(m.ultima_asistencia).toLocaleDateString()
                    : "Nunca"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {m.telefono && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {m.telefono}
                </span>
              )}

              {/* SEMÁFORO DE ASISTENCIA */}
              {m.estado_alerta === "verde" && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                </Badge>
              )}
              {m.estado_alerta === "amarillo" && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-200 bg-yellow-50"
                >
                  <Clock className="w-3 h-3 mr-1" /> Ausente
                </Badge>
              )}
              {m.estado_alerta === "rojo" && (
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" /> Visitar
                </Badge>
              )}
            </div>
          </div>
        ))}
        {miembros.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No hay miembros asignados a esta sociedad.
          </p>
        )}
      </div>
    </div>
  );
}

import { MovimientoForm } from "@/components/finanzas/caja-chica/MovimientoForm";
import { MovimientosDataTable } from "@/components/finanzas/caja-chica/MovimientosDataTable";
import { movimientosColumns as columns } from "@/components/finanzas/caja-chica/movimientos-columns";
import { type CajaChicaConResponsable, type MovimientoCajaChicaConDetalle } from "@/actions/finanzas/cajaChicaActions";

// ... (existing imports)

export function SociedadDashboardTabs({
  data,
  childrenDirectiva,
  cajaChica,
  movimientos,
  cuentasBancarias,
  otrasCajas,
  canManageFinanzas,
}: {
  data: ResumenSociedad;
  childrenDirectiva: React.ReactNode;
  cajaChica?: CajaChicaConResponsable | null;
  movimientos?: MovimientoCajaChicaConDetalle[];
  cuentasBancarias?: { id: string; nombre: string }[];
  otrasCajas?: { id: string; nombre: string | null }[];
  canManageFinanzas?: boolean;
}) {
  return (
    <Tabs defaultValue="resumen" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="seguimiento">Pastoral</TabsTrigger>
        <TabsTrigger value="directiva">Directiva</TabsTrigger>
        <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
      </TabsList>

      {/* TAB 1: RESUMEN */}
      <TabsContent value="resumen" className="space-y-6 mt-4">
        <ProximoCultoCard evento={data.proximoCulto} />

        <Card>
          <CardHeader>
            <CardTitle>Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.historial.map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{h.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{h.asistencia} Asistentes</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/actividades/${h.id}/gestion`}>Ver</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {data.historial.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Sin historial reciente.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: SEGUIMIENTO PASTORAL */}
      <TabsContent value="seguimiento" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Seguimiento de Miembros</CardTitle>
            <CardDescription>
              Lista priorizada por inasistencia. Los marcados en rojo requieren
              visita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeguimientoTable miembros={data.seguimiento} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 3: DIRECTIVA */}
      <TabsContent value="directiva" className="mt-4">
        {childrenDirectiva}
      </TabsContent>

      {/* TAB 4: FINANZAS */}
      <TabsContent value="finanzas" className="space-y-6 mt-4">
        {!cajaChica ? (
          <div className="p-8 text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Esta sociedad no tiene una Caja Chica asignada.</p>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-700">Fondos Disponibles</CardTitle>
                <CardDescription>Saldo actual en caja chica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-800">
                  RD$ {cajaChica.monto_disponible.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            {/* Register Expense Form */}
            {canManageFinanzas && (
              <MovimientoForm
                cajaChicaId={cajaChica.id}
                cuentasBancarias={cuentasBancarias || []}
                otrasCajas={otrasCajas || []}
              />
            )}

            {/* History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <MovimientosDataTable
                  columns={columns}
                  data={movimientos || []}
                  canManage={canManageFinanzas || false}
                  cajaChicaId={cajaChica.id}
                />
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
