// components/miembros/ExportButton.tsx
"use client";

import * as React from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getMiembrosParaExportar } from "@/actions/miembros/miembrosActions";
import { unparse } from "papaparse"; // Importamos PapaParse

export function ExportButton() {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      // 1. Llamar a la Server Action
      const result = await getMiembrosParaExportar();

      if (!result.success || !result.data) {
        alert("Error al exportar los datos."); // (Mejorar con un Toast)
        return;
      }

      if (result.data.length === 0) {
        alert("No hay miembros para exportar.");
        return;
      }

      // 2. Convertir JSON a CSV
      const csv = unparse(result.data);

      // 3. Crear y descargar el archivo
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "directorio_miembros.csv");
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
    >
      <Download className="mr-2 h-4 w-4" />
      {isPending ? "Exportando..." : "Exportar a CSV"}
    </Button>
  );
}
