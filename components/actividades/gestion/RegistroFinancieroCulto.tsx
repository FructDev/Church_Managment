"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIngreso } from "@/actions/finanzas/ingresosActions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos para las props
type SimpleItem = { id: string; nombre: string | null };
type CategoriaItem = { id: string; nombre: string };

interface Props {
  actividadId: string;
  actividadTitulo: string;
  cajas: SimpleItem[];
  categorias: CategoriaItem[];
}

export function RegistroFinancieroCulto({
  actividadId,
  actividadTitulo,
  cajas,
  categorias,
}: Props) {
  const [isPending, startTransition] = useTransition();

  // --- CÁLCULO DE VALORES INICIALES (Optimizado) ---
  // Calculamos esto DIRECTAMENTE, sin useEffect

  // 1. ID de Categorías
  const catOfrendaId =
    categorias.find((c) => c.nombre.toLowerCase().includes("ofrenda"))?.id ||
    categorias[0]?.id;
  const catCuotaId =
    categorias.find((c) => c.nombre.toLowerCase().includes("actividad"))?.id ||
    categorias[0]?.id;

  // 2. ID de Caja General (Default)
  const defaultCajaGeneral =
    cajas.find((c) => c.nombre?.toLowerCase().includes("general"))?.id || "";

  // 3. ID de Caja de Sociedad (Basado en título)
  const tituloLower = actividadTitulo.toLowerCase();
  const defaultCajaSociedad =
    cajas.find(
      (c) =>
        c.nombre &&
        c.nombre.toLowerCase() !== "caja general" &&
        tituloLower.includes(c.nombre.replace("Caja ", "").toLowerCase())
    )?.id || "";

  // --- ESTADOS ---
  const [ofrendaMonto, setOfrendaMonto] = useState("");
  // Inicializamos el estado con el valor calculado (esto evita el error de useEffect)
  const [cajaGeneralId, setCajaGeneralId] =
    useState<string>(defaultCajaGeneral);

  const [cuotaMonto, setCuotaMonto] = useState("");
  // Inicializamos el estado con el valor calculado
  const [cajaSociedadId, setCajaSociedadId] =
    useState<string>(defaultCajaSociedad);

  // Handler genérico
  const handleRegistrar = (tipo: "ofrenda" | "cuota") => {
    const monto = tipo === "ofrenda" ? ofrendaMonto : cuotaMonto;
    const cajaId = tipo === "ofrenda" ? cajaGeneralId : cajaSociedadId;
    const categoriaId = tipo === "ofrenda" ? catOfrendaId : catCuotaId;
    const desc =
      tipo === "ofrenda"
        ? `Ofrenda: ${actividadTitulo}`
        : `Cuotas Sociedad: ${actividadTitulo}`;

    if (!monto || parseFloat(monto) <= 0)
      return toast.error("Ingrese un monto válido");
    if (!cajaId) return toast.error("Seleccione una caja de destino");

    const formData = new FormData();
    formData.append("fecha", new Date().toISOString().split("T")[0]);
    formData.append("monto", monto);
    formData.append("categoria_ingreso_id", categoriaId);
    formData.append("metodo_pago", "efectivo");
    formData.append("descripcion", desc);
    formData.append("actividad_id", actividadId);
    formData.append("caja_destino_id", cajaId);

    startTransition(async () => {
      const res = await upsertIngreso(formData);
      if (res.success) {
        toast.success(
          `${tipo === "ofrenda" ? "Ofrenda" : "Cuotas"
          } registradas correctamente`
        );
        if (tipo === "ofrenda") setOfrendaMonto("");
        else setCuotaMonto("");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. OFRENDA (Caja General) */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Ofrenda General</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                className="pl-7"
                placeholder="0.00"
                value={ofrendaMonto}
                onChange={(e) => setOfrendaMonto(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleRegistrar("ofrenda")}
              disabled={isPending}
            >
              Registrar
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Destino:</span>
            <Select value={cajaGeneralId} onValueChange={setCajaGeneralId}>
              <SelectTrigger className="h-10 sm:h-7 text-xs w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar Caja..." />
              </SelectTrigger>
              <SelectContent>
                {cajas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t my-2"></div>

      {/* 2. CUOTA SOCIEDAD (Caja Específica) */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Cuotas de Sociedad</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                className="pl-7"
                placeholder="0.00"
                value={cuotaMonto}
                onChange={(e) => setCuotaMonto(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => handleRegistrar("cuota")}
              disabled={isPending}
            >
              Registrar
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Destino:</span>
            <Select value={cajaSociedadId} onValueChange={setCajaSociedadId}>
              <SelectTrigger className="h-10 sm:h-7 text-xs w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar Caja..." />
              </SelectTrigger>
              <SelectContent>
                {cajas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
