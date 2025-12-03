"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2, Eye, BookOpen } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InformeAnualPDF } from "@/components/reportes/InformeAnualPDF";
import {
  getDatosInformeAnual,
  type DatosInformeAnual,
} from "@/actions/reportes/financierosActions";
import { toast } from "sonner";

// Helper de moneda
const fMoney = (val: number) =>
  `$${val.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

export default function InformeAnualPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState<DatosInformeAnual | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    try {
      const res = await getDatosInformeAnual(parseInt(year));
      setData(res);
      toast.success("Informe anual generado");
    } catch (e) {
      toast.error("Error al generar");
    }
    setLoading(false);
  };

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  return (
    <div className="space-y-8">
      {/* HEADER Y CONTROLES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Informe Anual</h1>
          <p className="text-muted-foreground">Resumen General de Tesorería.</p>
        </div>

        <Card className="p-4 flex items-center gap-4 bg-muted/30 border-orange-200">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Año:</span>
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
          <Button
            onClick={handleGenerar}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Generar Vista Previa
          </Button>
        </Card>
      </div>

      {/* VISTA PREVIA */}
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
                  {fMoney(data.resumen.total_ingresos)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Egresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {fMoney(data.resumen.total_egresos)}
                </div>
              </CardContent>
            </Card>
            <Card
              className={`border-l-4 ${
                data.resumen.balance >= 0
                  ? "border-l-blue-500 bg-blue-50/30"
                  : "border-l-red-500 bg-red-50/30"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Balance Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fMoney(data.resumen.balance)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. DETALLE VISUAL */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingresos */}
            <Card>
              <CardHeader>
                <CardTitle>Desglose Ingresos</CardTitle>
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
                  <span>Pro-Templo</span>
                  <span className="font-medium">
                    {fMoney(data.ingresos.ofrendas_pro_templo)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Egresos Destacados */}
            <Card>
              <CardHeader>
                <CardTitle>Egresos Principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Luz y Agua</span>
                  <span className="font-medium">
                    {fMoney(data.egresos.pago_luz_agua)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Salario Pastor</span>
                  <span className="font-medium">
                    {fMoney(data.egresos.salario_pastor)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Diezmos de Diezmos</span>
                  <span className="font-medium">
                    {fMoney(data.egresos.diezmos_de_diezmos)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. BOTÓN DE DESCARGA */}
          <div className="flex justify-center py-8">
            <PDFDownloadLink
              document={<InformeAnualPDF data={data} />}
              fileName={`Informe_Anual_${year}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button
                  size="lg"
                  className="gap-2 w-64 shadow-lg bg-orange-600 hover:bg-orange-700"
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
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Generar Reporte Anual</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Selecciona el año para calcular el resumen total y generar el PDF.
          </p>
        </div>
      )}
    </div>
  );
}
