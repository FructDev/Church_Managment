"use client";

import * as React from "react";
import {
  type MiembroParaAsistencia,
  guardarAsistencia,
  type DatosAsistencia,
} from "@/actions/actividades/actividadesActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, Search, Plus, Trash, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  actividadId: string;
  initialData: DatosAsistencia; // [NEW] Usamos el nuevo tipo
}

export function AsistenciaForm({ actividadId, initialData }: Props) {
  const [miembros, setMiembros] = React.useState(initialData.miembros);
  const [visitantes, setVisitantes] = React.useState<string[]>(
    initialData.visitantes
  );
  const [newVisitor, setNewVisitor] = React.useState("");

  const [filter, setFilter] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const router = useRouter();

  // Filtrado local rápido
  const filteredMiembros = React.useMemo(() => {
    if (!filter) return miembros;
    const lower = filter.toLowerCase();
    return miembros.filter((m) =>
      m.nombre_completo.toLowerCase().includes(lower)
    );
  }, [miembros, filter]);

  // Manejador de cambio de checkbox
  const toggleAsistencia = (id: string) => {
    setMiembros((prev) =>
      prev.map((m) => (m.id === id ? { ...m, presente: !m.presente } : m))
    );
  };

  // Estadísticas en vivo
  const totalPresentes =
    miembros.filter((m) => m.presente).length + visitantes.length;
  const totalMiembros = miembros.length;

  const handleAddVisitor = () => {
    if (!newVisitor.trim()) return;
    setVisitantes((prev) => [...prev, newVisitor.trim()]);
    setNewVisitor("");
  };

  const removeVisitor = (index: number) => {
    setVisitantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Preparamos el payload
      const payload = {
        actividad_id: actividadId,
        asistencias: miembros.map((m) => ({
          miembro_id: m.id,
          presente: m.presente,
        })),
        visitantes, // [NEW] Enviamos nombres de visitantes
      };

      const result = await guardarAsistencia(payload);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error inesperado al guardar.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar miembro..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-sm font-medium text-muted-foreground">
            Presentes:{" "}
            <span className="text-foreground font-bold">{totalPresentes}</span>{" "}
            (Miembros: {miembros.filter((m) => m.presente).length}, Visitantes:{" "}
            {visitantes.length}) / {totalMiembros} totales
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar Lista"}
          </Button>
        </div>
      </div>

      {/* Lista de Miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pb-10">
        {filteredMiembros.map((miembro) => (
          <div
            key={miembro.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${miembro.presente
              ? "bg-primary/5 border-primary/50"
              : "bg-card hover:bg-accent/50"
              }`}
            onClick={() => toggleAsistencia(miembro.id)}
          >
            <Checkbox
              checked={miembro.presente}
              onCheckedChange={() => toggleAsistencia(miembro.id)}
              // Evitamos doble toggle por el click del div
              onClick={(e) => e.stopPropagation()}
            />

            <Avatar className="h-9 w-9">
              {miembro.foto_url && <AvatarImage src={miembro.foto_url} />}
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <span
              className={`text-sm font-medium ${miembro.presente ? "text-primary" : ""
                }`}
            >
              {miembro.nombre_completo}
            </span>
          </div>
        ))}

        {filteredMiembros.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No se encontraron miembros.
          </div>
        )}
      </div>


      {/* --- SECCIÓN VISITANTES --- */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Registro de Visitantes
        </h3>
        <p className="text-sm text-muted-foreground">
          Agrega aquí a las personas que nos visitan y no están en la lista de
          miembros.
        </p>

        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Nombre del visitante..."
            value={newVisitor}
            onChange={(e) => setNewVisitor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddVisitor();
              }
            }}
          />
          <Button onClick={handleAddVisitor} variant="secondary">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {visitantes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visitantes.map((v, index) => (
              <div
                key={`${v}-${index}`}
                className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-sm font-medium text-indigo-800"
              >
                <User className="h-3 w-3" />
                {v}
                <button
                  onClick={() => removeVisitor(index)}
                  className="ml-1 text-indigo-400 hover:text-red-500 transition-colors"
                >
                  <Trash className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
