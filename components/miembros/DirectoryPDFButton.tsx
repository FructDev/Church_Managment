// components/miembros/DirectoryPDFButton.tsx
"use client";

import * as React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import {
  getMiembrosParaDirectorio,
  type MiembroDirectorio,
} from "@/actions/miembros/miembrosActions";
import { DirectorioPDFDocument } from "./DirectorioPDFDocument";
import { toast } from "sonner"; // <-- ¡NUEVA IMPORTACIÓN!

export function DirectoryPDFButton() {
  const [miembros, setMiembros] = React.useState<MiembroDirectorio[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const result = await getMiembrosParaDirectorio();

    // --- ¡CORRECCIÓN! ---
    // Ahora 'result.success' existe y la lógica funciona.
    if (result.success && result.data) {
      if (result.data.length === 0) {
        toast.warning("No hay miembros activos para generar el directorio.");
        setIsLoading(false);
        return;
      }
      setMiembros(result.data);
    } else {
      toast.error("Error al cargar los datos para el PDF.", {
        description: result.error,
      });
    }
    // --- FIN CORRECCIÓN ---

    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <Button variant="outline" size="sm" disabled>
          <FileDown className="mr-2 h-4 w-4 animate-pulse" />
          Generando PDF...
        </Button>
      ) : miembros.length > 0 ? (
        // 2. Si los datos están listos, muestra el enlace de descarga
        <PDFDownloadLink
          document={
            <DirectorioPDFDocument
              miembros={miembros}
              fecha={new Date().toLocaleDateString("es-ES")}
            />
          }
          fileName="directorio_miembros.pdf"
        >
          {({ blob, url, loading, error }) => (
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              {loading ? "Preparando..." : "Descargar PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      ) : (
        // 1. Botón inicial que carga los datos
        <Button variant="outline" size="sm" onClick={loadData}>
          <FileDown className="mr-2 h-4 w-4" />
          Generar Directorio PDF
        </Button>
      )}
    </div>
  );
}
