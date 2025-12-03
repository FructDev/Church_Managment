// app/(dashboard)/finanzas/diezmos/[id]/page.tsx
import { getDiezmoDetalleById } from "@/actions/finanzas/diezmosActions";
import { DetalleDataTable } from "@/components/finanzas/diezmos/DetalleDataTable";
import { detalleColumns } from "@/components/finanzas/diezmos/detalle-columns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

// Helper para formatear
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", { timeZone: "UTC" });
};

export default async function DiezmoDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const { resumen, transacciones } = await getDiezmoDetalleById(id);

  if (!resumen) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold capitalize">
            Detalle de Diezmo: {resumen.tipo_periodo.replace("_", " ")}
          </h1>
          <p className="text-muted-foreground">
            Período:{" "}
            {new Date(resumen.periodo).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </div>
        {resumen.distribuido ? (
          <Badge variant="default" className="gap-1 text-lg">
            <CheckCircle2 className="h-5 w-5" /> Distribuido
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1 text-lg">
            <XCircle className="h-5 w-5" /> Pendiente
          </Badge>
        )}
      </div>

      {/* 2. Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Recibido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(resumen.total_recibido)}
            </p>
            <p className="text-sm text-muted-foreground">
              Registrado por: {resumen.registrado_por?.nombre_completo || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de Distribución</CardTitle>
            <CardDescription>
              Distribuido por:{" "}
              {resumen.distribuido_por?.nombre_completo || "N/A"}
              {" el "} {formatDate(resumen.fecha_distribucion)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Diezmo de Diezmo"
              value={formatCurrency(resumen.diezmo_de_diezmo)}
            />
            <InfoItem
              label="Comité de Finanzas"
              value={formatCurrency(resumen.comite_finanzas)}
            />
            <InfoItem
              label="Diezmo Pastoral"
              value={formatCurrency(resumen.diezmo_pastoral)}
            />
            <InfoItem
              label="Sustento Pastoral"
              value={formatCurrency(resumen.sustento_pastoral)}
            />
          </CardContent>
        </Card>
      </div>

      {/* 3. Tabla de Transacciones Individuales */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transacciones Individuales ({transacciones.length})
          </CardTitle>
          {!resumen.distribuido && (
            <CardDescription>
              El lote está pendiente. Aún puede editar o eliminar entradas.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* ¡PROPS ACTUALIZADOS! */}
          <DetalleDataTable
            columns={detalleColumns}
            data={transacciones}
            diezmoId={resumen.id}
            isDistribuido={resumen.distribuido}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente helper
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
