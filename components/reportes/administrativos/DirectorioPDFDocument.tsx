/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  date: {
    fontSize: 10,
    color: "#666",
  },
  table: {
    width: "auto",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 6,
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
  },
  cellName: { width: "35%", paddingLeft: 4 },
  cellPhone: { width: "20%" },
  cellEmail: { width: "25%" },
  cellStatus: { width: "20%", textAlign: "right", paddingRight: 4 },

  statusActive: { color: "green" },
  statusInactive: { color: "red" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
});

export const DirectorioPDFDocument = ({ miembros }: { miembros: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Directorio General de Miembros</Text>
          <Text style={{ fontSize: 10, marginTop: 4 }}>
            Iglesia Fuente de Salvación Misionera
          </Text>
        </View>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.table}>
        {/* Encabezados */}
        <View style={styles.headerRow}>
          <Text style={styles.cellName}>Nombre Completo</Text>
          <Text style={styles.cellPhone}>Teléfono</Text>
          <Text style={styles.cellEmail}>Email</Text>
          <Text style={styles.cellStatus}>Estado</Text>
        </View>

        {/* Datos */}
        {miembros.map((m, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellName}>{m.nombre_completo}</Text>
            <Text style={styles.cellPhone}>{m.telefono || "-"}</Text>
            <Text style={styles.cellEmail}>{m.email || "-"}</Text>
            <Text
              style={[
                styles.cellStatus,
                m.estado_membresia === "activo" ? styles.statusActive : {},
              ]}
            >
              {m.estado_membresia ? m.estado_membresia.toUpperCase() : "N/A"}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
        fixed
      />
    </Page>
  </Document>
);
