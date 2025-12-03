/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { DirectorioPDFDocument } from "@/components/reportes/administrativos/DirectorioPDFDocument";

// 1. Importamos PDFDownloadLink de forma dinámica (solo cliente)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando PDF...
      </Button>
    ),
  }
);

export function DownloadButton({ data }: { data: any[] }) {
  return (
    <PDFDownloadLink
      document={<DirectorioPDFDocument miembros={data} />}
      fileName={`Directorio_Iglesia_${new Date().getFullYear()}.pdf`}
    >
      {({ loading }) => (
        <Button size="lg" className="gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {loading ? "Generando PDF..." : "Descargar Directorio PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
