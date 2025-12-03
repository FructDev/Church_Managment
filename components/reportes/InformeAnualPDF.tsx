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
import { type DatosInformeAnual } from "@/actions/reportes/financierosActions";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10, // Fuente compacta
    lineHeight: 1.4,
  },
  header: { alignItems: "center", marginBottom: 10 },
  logo: { width: 45, height: 45, marginBottom: 5, objectFit: "contain" },
  churchName: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  subHeader: { fontSize: 9, textAlign: "center" },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontStyle: "italic",
  },

  metaRow: { flexDirection: "row", marginBottom: 4, alignItems: "flex-end" },
  metaLabel: { fontStyle: "italic", marginRight: 5, fontSize: 10 },
  metaValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    fontSize: 10,
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },

  // Filas con línea punteada
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderStyle: "dotted",
    marginRight: 5,
  },
  labelText: {
    fontStyle: "italic",
    fontSize: 10,
    backgroundColor: "#fff",
    paddingRight: 5,
  },
  valueText: { fontSize: 10, width: 80, textAlign: "right" },

  totalLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 2,
    marginBottom: 10,
  },
  totalLabel: { fontWeight: "bold", marginRight: 10, fontSize: 10 },
  totalValue: {
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
    fontSize: 10,
  },

  // Resumen compacto a la izquierda (como la foto)
  summaryBox: { marginTop: 10, width: "50%" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  summaryLabel: { fontWeight: "bold", fontSize: 10 },
  summaryValue: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    width: 90,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },

  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  sigBlock: { width: "40%", alignItems: "center" },
  sigLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginBottom: 4,
  },
  sigLabel: { fontSize: 9, fontStyle: "italic" },
});

const money = (val: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val);

const Row = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.row}>
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value > 0 ? money(value) : "-"}</Text>
  </View>
);

export const InformeAnualPDF = ({ data }: { data: DatosInformeAnual }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        {data.configuracion.logo_url && (
          <Image src={data.configuracion.logo_url} style={styles.logo} />
        )}
        <Text style={styles.churchName}>
          {data.configuracion.nombre_iglesia}
        </Text>
        <Text style={styles.subHeader}>
          {data.configuracion.direccion || "República Dominicana"}
        </Text>
        <Text style={styles.reportTitle}>
          INFORME GENERAL DE TESORERÍA - {data.periodo}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Iglesia:</Text>
        <View style={styles.metaValue}>
          <Text>Central</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Pastor (a):</Text>
        <View style={styles.metaValue}>
          <Text> </Text>
        </View>
      </View>

      {/* INGRESOS */}
      <View>
        <Text style={styles.sectionHeader}>INGRESOS</Text>
        <Row label="Diezmos" value={data.ingresos.diezmos} />
        <Row
          label="Ofrendas regulares"
          value={data.ingresos.ofrendas_regulares}
        />
        <Row
          label="Ofrendas Esc. Bíblica"
          value={data.ingresos.ofrendas_esc_biblica}
        />
        <Row
          label="Ofrendas Pro Templo"
          value={data.ingresos.ofrendas_pro_templo}
        />
        <Row
          label="Ofrendas Especiales"
          value={data.ingresos.ofrendas_especiales}
        />
        <Row label="Otras Ofrendas" value={data.ingresos.otras_ofrendas} />

        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>
            {money(data.ingresos.total_ingresos)}
          </Text>
        </View>
      </View>

      {/* EGRESOS (Vertical, todos juntos) */}
      <View>
        <Text style={styles.sectionHeader}>EGRESOS</Text>
        <Row label="Pago alquiler" value={data.egresos.pago_alquiler} />
        <Row label="Pago Teléfono" value={data.egresos.pago_telefono} />
        <Row label="Pago Luz y agua" value={data.egresos.pago_luz_agua} />
        <Row label="Ayudas" value={data.egresos.ayudas} />
        <Row
          label="Ofrendas Filantrópicas"
          value={data.egresos.ofrendas_filantropicas}
        />
        <Row label="Material Gastable" value={data.egresos.material_gastable} />
        <Row label="Gastos Operativos" value={data.egresos.gastos_operativos} />
        <Row
          label="Diezmos Escuela B."
          value={data.egresos.diezmos_escuela_b}
        />
        <Row label="Construcción" value={data.egresos.construccion} />
        {/* Nuevos Campos */}
        <Row
          label="Diezmos de Diezmos"
          value={data.egresos.diezmos_de_diezmos}
        />
        <Row
          label="Ofrendas Misioneras"
          value={data.egresos.ofrendas_misioneras}
        />
        <Row label="Salario Pastor" value={data.egresos.salario_pastor} />
        <Row label="Comité de Finanzas" value={data.egresos.comite_finanzas} />
        <Row label="Diezmo Pastoral" value={data.egresos.diezmo_pastoral} />
        <Row label="Otros Gastos" value={data.egresos.otros_gastos} />

        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>
            {money(data.egresos.total_egresos)}
          </Text>
        </View>
      </View>

      {/* RESUMEN (Abajo izquierda) */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>INGRESOS</Text>
          <Text style={styles.summaryValue}>
            $ {money(data.resumen.total_ingresos)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>EGRESOS</Text>
          <Text style={styles.summaryValue}>
            $ {money(data.resumen.total_egresos)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 5 }]}>
          <Text style={styles.summaryLabel}>BALANCE</Text>
          <Text style={styles.summaryValue}>
            $ {money(data.resumen.balance)}
          </Text>
        </View>
      </View>

      {/* FIRMAS */}
      <View style={styles.signatures}>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Firma Pastor</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Firma Tesorero</Text>
        </View>
      </View>
    </Page>
  </Document>
);
