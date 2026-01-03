'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Printer, Loader2 } from 'lucide-react'
import { ProgramaPDFDocument } from './ProgramaPDFDocument'
import { type PartePrograma } from '@/actions/actividades/programaActions'

// Carga dinámica para evitar errores de SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

interface Props {
  titulo: string
  fecha: string
  programa: PartePrograma[]
  configuracion: {
    nombre_iglesia: string
    direccion: string | null
    logo_url: string | null
  }
}

export function ProgramaExportButton({ titulo, fecha, programa, configuracion }: Props) {
  if (!programa || programa.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Printer className="mr-2 h-4 w-4" /> Programa Vacío
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <ProgramaPDFDocument
          titulo={titulo}
          fecha={fecha}
          programa={programa}
          configuracion={configuracion}
        />
      }
      fileName={`Programa_${titulo.replace(/\s/g, '_')}.pdf`}
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
          {loading ? 'Generando...' : 'Imprimir Programa'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}