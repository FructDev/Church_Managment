/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { updateConfiguracion } from "@/actions/configuracion/configuracionActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function PreferenciasForm({ config }: { config: any }) {
  const [isPending, startTransition] = useTransition();
  const [moneda, setMoneda] = useState(config?.moneda || "DOP");
  const [zona, setZona] = useState(
    config?.zona_horaria || "America/Santo_Domingo"
  );

  const handleSave = () => {
    const formData = new FormData();
    formData.append("moneda", moneda);
    formData.append("zona_horaria", zona);
    // Mantenemos el nombre de la iglesia para que pase la validación de Zod
    formData.append("nombre_iglesia", config?.nombre_iglesia || "Mi Iglesia");

    startTransition(async () => {
      const res = await updateConfiguracion(formData);
      if (res.success) toast.success("Preferencias actualizadas");
      else toast.error(res.message);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Regional</CardTitle>
        <CardDescription>
          Defina los formatos de moneda y fecha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select value={moneda} onValueChange={setMoneda}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOP">Peso Dominicano (DOP)</SelectItem>
                <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Zona Horaria</Label>
            <Input
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="America/Santo_Domingo"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Preferencias"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
