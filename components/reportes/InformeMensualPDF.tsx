"use client";

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { type DatosInformeMensual } from "@/actions/reportes/financierosActions";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.3,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  // Estilo para el logo
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
    objectFit: "contain",
  },
  churchName: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 9,
    textAlign: "center",
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 15,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  metaLabel: {
    fontWeight: "bold",
    marginRight: 5,
    fontStyle: "italic",
    fontSize: 10,
  },
  metaValue: {
    flex: 1,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  metaValueText: {
    marginBottom: 1,
  },
  mainSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    marginTop: 10,
  },
  column: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    textDecoration: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    borderStyle: "dotted",
    alignItems: "flex-end",
    paddingBottom: 1,
  },
  label: {
    fontStyle: "italic",
    fontSize: 9,
  },
  value: {
    fontSize: 9,
  },
  sentSection: {
    marginTop: 10,
  },
  sentTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  totalSection: {
    marginTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 10,
  },
  totalBox: {
    borderWidth: 2,
    borderColor: "#000",
    padding: 4,
    marginLeft: 10,
    width: 150,
    height: 28,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 11,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  commentsSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  commentLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 15,
    marginTop: 2,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  sigBlock: {
    width: "30%",
    alignItems: "center",
  },
  sigLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 20,
    marginBottom: 2,
  },
  sigLabel: {
    fontStyle: "italic",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 8,
  },
  footerNote: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 7,
    fontStyle: "italic",
    textAlign: "center",
    color: "#666",
  },
});

const money = (val: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val);

const LineItem = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold ? { fontWeight: "bold" } : {}]}>
      {label}
    </Text>
    <Text style={[styles.value, bold ? { fontWeight: "bold" } : {}]}>
      ${value > 0 ? money(value) : ""}
    </Text>
  </View>
);

export const InformeMensualPDF = ({ data }: { data: DatosInformeMensual }) => {
  const totalEgresosReal =
    data.egresos.total_egresos_locales + data.resumen.sustento_pastoral;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO DINÁMICO */}
        <View style={styles.header}>
          {/* Logo (Si existe en la configuración) */}
          {data.configuracion?.logo_url && (
            <Image src={data.configuracion.logo_url} style={styles.logo} />
          )}

          {/* Nombre de la Iglesia (Dinámico) */}
          <Text style={styles.churchName}>
            {data.configuracion?.nombre_iglesia ||
              "IGLESIA FUENTE DE SALVACIÓN MISIONERA, INC."}
          </Text>

          {/* Dirección (Dinámica) */}
          <Text style={styles.subHeader}>
            {data.configuracion?.direccion ||
              "Santo Domingo, República Dominicana"}
          </Text>

          <Text style={styles.reportTitle}>INFORME FINANCIERO MENSUAL</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={[styles.metaRow, { width: "65%" }]}>
            <Text style={styles.metaLabel}>Iglesia:</Text>
            {/* Usamos el nombre corto o 'Central' si no está definido */}
            <View style={styles.metaValue}>
              <Text style={styles.metaValueText}>Central</Text>
            </View>
          </View>
          <View style={[styles.metaRow, { width: "30%" }]}>
            <Text style={styles.metaLabel}>Mes:</Text>
            <View style={styles.metaValue}>
              <Text style={styles.metaValueText}> {data.periodo} </Text>
            </View>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Pastor:</Text>
          <View style={styles.metaValue}>
            <Text style={styles.metaValueText}> </Text>
          </View>
        </View>

        {/* RESTO DEL CONTENIDO (IGUAL QUE ANTES) */}
        <View style={styles.mainSection}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>INGRESOS</Text>
            <LineItem label="Diezmos" value={data.ingresos.diezmos} />
            <LineItem
              label="Ofrendas regulares"
              value={data.ingresos.ofrendas_regulares}
            />
            <LineItem
              label="Ofrendas Esc. Bib."
              value={data.ingresos.ofrendas_esc_biblica}
            />
            <LineItem
              label="Ofrendas Pro-templo"
              value={data.ingresos.ofrendas_pro_templo}
            />
            <LineItem
              label="Ofrendas especiales"
              value={data.ingresos.ofrendas_especiales}
            />
            <LineItem
              label="Otras Ofrendas"
              value={data.ingresos.otras_ofrendas}
            />
            <View style={{ marginTop: 15 }}>
              <LineItem
                label="Sustento del pastor"
                value={data.resumen.sustento_pastoral || 0}
              />
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>EGRESOS</Text>
            <LineItem
              label="Pago alquiler"
              value={data.egresos.pago_alquiler}
            />
            <LineItem
              label="Pago luz y agua"
              value={data.egresos.pago_luz_agua}
            />
            <LineItem label="Ayudas" value={data.egresos.ayudas} />
            <LineItem label="Construcción" value={data.egresos.construccion} />
            <LineItem label="Otros gastos" value={data.egresos.otros_gastos} />
            <View style={{ marginTop: 15 }}>
              <LineItem
                label="Sub-total egresos"
                value={data.egresos.total_egresos_locales}
              />
              <LineItem
                label="Total de egresos"
                value={totalEgresosReal}
                bold
              />
            </View>
          </View>
        </View>

        <View style={styles.sentSection}>
          <Text style={styles.sentTitle}>ENVIADOS A LA OFICINA</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.column}>
              <LineItem
                label="Diezmos de Diezmo"
                value={data.enviados_oficina.diezmo_de_diezmo}
              />
              <LineItem
                label="Ofrenda Misionera"
                value={data.enviados_oficina.ofrenda_misionera}
              />
              <LineItem
                label="Diezmos Esc. Bib."
                value={data.enviados_oficina.diezmo_esc_biblica}
              />
            </View>
            <View style={styles.column}>
              <LineItem
                label="Ofrenda Voluntaria"
                value={data.enviados_oficina.ofrenda_voluntaria}
              />
              <LineItem
                label="Cuota convención"
                value={data.enviados_oficina.cuota_convencion}
              />
            </View>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "48%" }}>
              <LineItem
                label="TOTAL ENVIADO DE LA IGLESIA"
                value={data.enviados_oficina.total_enviado}
                bold
              />
            </View>
            <View style={{ width: "48%" }}>
              <LineItem
                label="DIEZMOS DEL PASTOR"
                value={data.resumen.diezmos_pastor}
                bold
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontStyle: "italic", fontSize: 10 }}
            >
              GRAN TOTAL ENVIADO:
            </Text>
            <View style={styles.totalBox}>
              <Text>${money(data.resumen.gran_total_enviado)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 2,
              fontStyle: "italic",
              fontSize: 9,
            }}
          >
            Comentarios:
          </Text>
          <View style={styles.commentLine} />
          <View style={styles.commentLine} />
        </View>

        <View style={styles.signatures}>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma del Pastor</Text>
          </View>
          <View style={styles.sigBlock}>
            <View style={[styles.sigLine, { marginTop: 40 }]} />
            <Text style={styles.sigLabel}>Recibido por</Text>
          </View>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Firma del Tesorero</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Nota: este informe debe ser llenado con duplicado para el archivo de
          la iglesia, y entregado al presbítero antes del día 10 de cada mes.
        </Text>
      </Page>
    </Document>
  );
};
