"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2, Eye, CheckCircle2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InformeMensualPDF } from "@/components/reportes/InformeMensualPDF";
import {
  getDatosInformeMensual,
  type DatosInformeMensual,
} from "@/actions/reportes/financierosActions";
import { toast } from "sonner";

// Helper de moneda
const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

export default function GeneradorInformePage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth().toString());
  const [year, setYear] = useState(today.getFullYear().toString());
  const [data, setData] = useState<DatosInformeMensual | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    try {
      const res = await getDatosInformeMensual(parseInt(month), parseInt(year));
      setData(res);
      toast.success("Informe generado exitosamente");
    } catch (e) {
      toast.error("Error al generar datos");
    }
    setLoading(false);
  };

  const months = [
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
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  return (
    <div className="space-y-8">
      {/* HEADER Y CONTROLES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Informe Oficial</h1>
          <p className="text-muted-foreground">
            Generación del reporte para el Concilio.
          </p>
        </div>

        <Card className="p-4 flex items-center gap-4 bg-muted/30 border-primary/20">
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerar} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Generar Vista Previa
          </Button>
        </Card>
      </div>

      {/* VISTA PREVIA (Solo si hay datos) */}
      {data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          {/* 1. TARJETAS RESUMEN */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fMoney(data.ingresos.total_ingresos)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Enviado al Concilio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {fMoney(data.enviados_oficina.total_enviado)}
                </div>
                <p className="text-xs text-muted-foreground">
                  + {fMoney(data.resumen.diezmos_pastor)} (Pastor)
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Balance Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {fMoney(data.resumen.balance_final)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. DETALLE VISUAL */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tabla Resumida Ingresos */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Diezmos</span>
                  <span className="font-medium">
                    {fMoney(data.ingresos.diezmos)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Ofrendas Regulares</span>
                  <span className="font-medium">
                    {fMoney(data.ingresos.ofrendas_regulares)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Escuela Bíblica</span>
                  <span className="font-medium">
                    {fMoney(data.ingresos.ofrendas_esc_biblica)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Pro-Templo</span>
                  <span className="font-medium">
                    {fMoney(data.ingresos.ofrendas_pro_templo)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tabla Resumida Envíos */}
            <Card>
              <CardHeader>
                <CardTitle>Envíos a Oficina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Diezmo de Diezmo</span>
                  <span className="font-medium">
                    {fMoney(data.enviados_oficina.diezmo_de_diezmo)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Ofrenda Misionera</span>
                  <span className="font-medium">
                    {fMoney(data.enviados_oficina.ofrenda_misionera)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Diezmos Esc. Bib.</span>
                  <span className="font-medium">
                    {fMoney(data.enviados_oficina.diezmo_esc_biblica)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. BOTÓN DE DESCARGA FINAL */}
          <div className="flex justify-center py-8">
            <PDFDownloadLink
              document={<InformeMensualPDF data={data} />}
              fileName={`Informe_${months[parseInt(month)]}_${year}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button
                  size="lg"
                  className="gap-2 w-64 shadow-lg"
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileDown className="h-5 w-5" />
                  )}
                  {pdfLoading
                    ? "Generando PDF..."
                    : "Descargar Informe Oficial"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      ) : (
        // ESTADO VACÍO
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <FileDown className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Listo para generar</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Selecciona el mes y año arriba para calcular todos los balances y
            previsualizar el informe.
          </p>
        </div>
      )}
    </div>
  );
}
