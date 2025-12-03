"use client";

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Settings2,
  ClipboardCheck,
} from "lucide-react"; // <-- Nuevos iconos
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ActividadCalendario } from "@/actions/actividades/actividadesActions";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link"; // <-- Importar Link

interface CalendarioProps {
  actividades: ActividadCalendario[];
}

export function CalendarioMensual({ actividades }: CalendarioProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const getActivitiesForDay = (day: Date) => {
    return actividades.filter((act) =>
      isSameDay(new Date(act.fecha_inicio), day)
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold capitalize text-primary">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={today}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* VISTA DE ESCRITORIO (GRILLA) */}
      <div className="hidden md:block overflow-x-auto pb-2">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-px bg-muted rounded-t-md border border-b-0">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-semibold bg-background"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr bg-muted border rounded-b-md overflow-hidden flex-grow min-h-[600px]">
            {days.map((day) => {
              const dayActivities = getActivitiesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "min-h-[100px] p-2 bg-background border-r border-b relative transition-colors hover:bg-muted/5",
                    !isCurrentMonth && "bg-muted/10 text-muted-foreground"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                    {dayActivities.map((act) => (
                      <HoverCard key={act.id}>
                        <HoverCardTrigger asChild>
                          {/* Hacemos que el evento en sí sea un enlace directo a la gestión */}
                          <Link
                            href={`/actividades/${act.id}/gestion`}
                            className="block text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer opacity-90 hover:opacity-100 text-white font-medium shadow-sm hover:ring-2 ring-offset-1 ring-primary/20 transition-all"
                            style={{
                              backgroundColor: act.tipo?.color || "#3b82f6",
                            }}
                          >
                            {act.titulo}
                          </Link>
                        </HoverCardTrigger>

                        <HoverCardContent className="w-80 z-50" align="start">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-semibold leading-tight">
                                {act.titulo}
                              </h4>
                              <Badge
                                style={{
                                  backgroundColor: act.tipo?.color || "#3b82f6",
                                }}
                                className="shrink-0"
                              >
                                {act.tipo?.nombre}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(act.fecha_inicio), "h:mm a", {
                                    locale: es,
                                  })}{" "}
                                  -
                                  {format(new Date(act.fecha_fin), "h:mm a", {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                              {act.ubicacion && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{act.ubicacion}</span>
                                </div>
                              )}
                            </div>

                            {/* --- BOTONES DE ACCIÓN --- */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="h-8 text-xs"
                              >
                                <Link href={`/actividades/${act.id}/asistencia`}>
                                  <ClipboardCheck className="mr-2 h-3 w-3" />
                                  Asistencia
                                </Link>
                              </Button>
                              <Button size="sm" asChild className="h-8 text-xs">
                                <Link href={`/actividades/${act.id}/gestion`}>
                                  <Settings2 className="mr-2 h-3 w-3" />
                                  Gestionar
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* VISTA MÓVIL (LISTA) */}
      <div className="md:hidden space-y-4">
        {days
          .filter((day) => isSameMonth(day, currentMonth)) // Solo mostrar días del mes actual
          .map((day) => {
            const dayActivities = getActivitiesForDay(day);
            if (dayActivities.length === 0) return null; // No mostrar días vacíos

            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toString()} className="space-y-2">
                <div
                  className={cn(
                    "sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 px-1 border-b flex items-center gap-2 font-medium",
                    isToday && "text-primary"
                  )}
                >
                  <span className="text-lg font-bold">{format(day, "d")}</span>
                  <span className="text-sm uppercase text-muted-foreground">
                    {format(day, "EEEE", { locale: es })}
                  </span>
                  {isToday && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Hoy
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 pl-2">
                  {dayActivities.map((act) => (
                    <Link
                      key={act.id}
                      href={`/actividades/${act.id}/gestion`}
                      className="block"
                    >
                      <div className="flex gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
                        <div
                          className="w-1.5 rounded-full self-stretch shrink-0"
                          style={{
                            backgroundColor: act.tipo?.color || "#3b82f6",
                          }}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold leading-tight line-clamp-2">
                              {act.titulo}
                            </h4>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] h-5"
                            >
                              {act.tipo?.nombre}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(act.fecha_inicio), "h:mm a", {
                                  locale: es,
                                })}{" "}
                                -{" "}
                                {format(new Date(act.fecha_fin), "h:mm a", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                            {act.ubicacion && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="line-clamp-1">
                                  {act.ubicacion}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        {/* Mensaje si no hay actividades en el mes */}
        {days.filter(
          (day) =>
            isSameMonth(day, currentMonth) && getActivitiesForDay(day).length > 0
        ).length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No hay actividades programadas para este mes.
            </div>
          )}
      </div>
    </div>
  );
}
