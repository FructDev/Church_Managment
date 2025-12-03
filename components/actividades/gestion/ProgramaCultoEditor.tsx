"use client";

import { useState, useTransition, useEffect } from "react";
import {
  upsertPartePrograma,
  deletePartePrograma,
  getProgramaCulto,
  type PartePrograma,
} from "@/actions/actividades/programaActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Save, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ProgramaCultoEditor({ actividadId }: { actividadId: string }) {
  const [partes, setPartes] = useState<PartePrograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Cargar datos iniciales al montar
  useEffect(() => {
    getProgramaCulto(actividadId).then((data) => {
      setPartes(data);
      setLoading(false);
    });
  }, [actividadId]);

  // Estado para la nueva parte que se está escribiendo
  const [newParte, setNewParte] = useState({
    titulo_parte: "",
    responsable_nom: "",
    notas: "",
  });

  const handleAdd = () => {
    if (!newParte.titulo_parte)
      return toast.error("Escribe el título de la parte");

    startTransition(async () => {
      // Guardamos en BD
      const res = await upsertPartePrograma(newParte, actividadId);

      if (res.success) {
        // Recargamos la lista para tener los IDs y orden correctos
        const updated = await getProgramaCulto(actividadId);
        setPartes(updated);
        setNewParte({ titulo_parte: "", responsable_nom: "", notas: "" }); // Limpiar inputs
        toast.success("Parte agregada");
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar esta parte?")) return;

    startTransition(async () => {
      const res = await deletePartePrograma(id, actividadId);
      if (res.success) {
        setPartes((prev) => prev.filter((p) => p.id !== id));
        toast.success("Eliminado");
      } else {
        toast.error(res.message);
      }
    });
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">
        Cargando programa...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Parte / Actividad</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Notas / Detalles</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  El programa está vacío. ¡Empieza a añadir partes!
                </TableCell>
              </TableRow>
            )}

            {partes.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell className="text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{p.titulo_parte}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    {p.responsable_nom || p.responsable?.nombre_completo || (
                      <span className="text-muted-foreground italic">
                        Sin asignar
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.notas}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Fila de Inserción Rápida */}
            <TableRow className="bg-muted/30">
              <TableCell className="text-center text-muted-foreground">
                +
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Ej: Dirección, Himnos"
                  value={newParte.titulo_parte}
                  onChange={(e) =>
                    setNewParte({ ...newParte, titulo_parte: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={isPending}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Ej: Hna. María"
                  value={newParte.responsable_nom}
                  onChange={(e) =>
                    setNewParte({
                      ...newParte,
                      responsable_nom: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={isPending}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Ej: Himno #23"
                  value={newParte.notas}
                  onChange={(e) =>
                    setNewParte({ ...newParte, notas: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={isPending}
                />
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  onClick={handleAdd}
                  disabled={isPending || !newParte.titulo_parte}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* VISTA MÓVIL (TARJETAS) */}
      <div className="md:hidden space-y-4">
        {/* Formulario de Agregar (Móvil) */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> Agregar Parte
          </h4>
          <div className="space-y-2">
            <Input
              placeholder="Título (Ej: Dirección)"
              value={newParte.titulo_parte}
              onChange={(e) =>
                setNewParte({ ...newParte, titulo_parte: e.target.value })
              }
            />
            <Input
              placeholder="Responsable (Ej: Hna. María)"
              value={newParte.responsable_nom}
              onChange={(e) =>
                setNewParte({ ...newParte, responsable_nom: e.target.value })
              }
            />
            <Input
              placeholder="Notas (Ej: Himno #23)"
              value={newParte.notas}
              onChange={(e) =>
                setNewParte({ ...newParte, notas: e.target.value })
              }
            />
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={isPending || !newParte.titulo_parte}
            >
              {isPending ? "Guardando..." : "Agregar al Programa"}
            </Button>
          </div>
        </div>

        {/* Lista de Partes */}
        <div className="space-y-2">
          {partes.map((p, index) => (
            <div
              key={p.id}
              className="bg-card border rounded-lg p-3 flex gap-3 items-start shadow-sm"
            >
              <div className="bg-primary/10 text-primary font-bold h-6 w-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm">{p.titulo_parte}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3 w-3" />
                  {p.responsable_nom || p.responsable?.nombre_completo || (
                    <span className="italic">Sin asignar</span>
                  )}
                </div>
                {p.notas && (
                  <div className="text-xs bg-muted/50 p-1.5 rounded mt-1">
                    {p.notas}
                  </div>
                )}
              </div>
            </div>
          ))}
          {partes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay partes en el programa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
