"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Wand2 } from "lucide-react";
import { generarCalendarioMensual } from "@/actions/actividades/generadorActions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GeneradorCalendarioButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Default al mes siguiente
  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1) % 12); // 0-11
  const [year, setYear] = useState(
    today.getFullYear() + (today.getMonth() === 11 ? 1 : 0)
  );

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generarCalendarioMensual(year, month);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Generar Mes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generador Automático de Actividades</DialogTitle>
          <DialogDescription>
            Esto creará los cultos regulares (Damas, Jóvenes, Domingos, etc.)
            para el mes seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={today.getFullYear().toString()}>
                {today.getFullYear()}
              </SelectItem>
              <SelectItem value={(today.getFullYear() + 1).toString()}>
                {today.getFullYear() + 1}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generando..." : "Generar Calendario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
