/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { unparse } from "papaparse";
import { toast } from "sonner";

interface Props {
  data: any[];
  filename?: string;
}

export function ExportToolbar({ data, filename = "reporte" }: Props) {
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    try {
      // Convertir JSON a CSV
      const csv = unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Archivo descargado");
    } catch (e) {
      toast.error("Error al exportar");
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 no-print">
      {" "}
      {/* 'no-print' oculta los botones al imprimir */}
      <Button variant="outline" size="sm" onClick={handleExportExcel}>
        <FileDown className="mr-2 h-4 w-4" /> Exportar Excel (CSV)
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrintPDF}>
        <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
      </Button>
    </div>
  );
}
