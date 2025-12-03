"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ProgramaPDFDocument } from "./ProgramaPDFDocument";
import { type PartePrograma } from "@/actions/actividades/programaActions";

interface Props {
  titulo: string;
  fecha: string;
  programa: PartePrograma[];
}

export function ProgramaExportButton({ titulo, fecha, programa }: Props) {
  // Si no hay programa, deshabilitamos
  if (!programa || programa.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Printer className="mr-2 h-4 w-4" /> Programa Vacío
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <ProgramaPDFDocument
          titulo={titulo}
          fecha={fecha}
          programa={programa}
        />
      }
      fileName={`programa-${titulo.toLowerCase().replace(/\s/g, "-")}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <Printer className="mr-2 h-4 w-4" />
          {loading ? "Generando..." : "Imprimir / Exportar"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
