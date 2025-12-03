// components/miembros/DirectorioPDFDocument.tsx
"use client";

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { type MiembroDirectorio } from "@/actions/miembros/miembrosActions";

// Registrar fuentes (opcional pero recomendado para consistencia)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: 'https/path/to/Inter-Regular.ttf' },
//     { src: 'https/path/to/Inter-Bold.ttf', fontWeight: 'bold' },
//   ]
// })

// Definimos los estilos
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica", // Usar 'Inter' si se registra arriba
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  tableHeaderRow: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
  },
  tableColHeader: {
    width: "25%", // 4 columnas
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
  },
  tableCellHeader: {
    margin: 5,
    fontWeight: "bold",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

interface DirectorioPDFProps {
  miembros: MiembroDirectorio[];
  fecha: string;
}

export const DirectorioPDFDocument: React.FC<DirectorioPDFProps> = ({
  miembros,
  fecha,
}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="portrait">
      {/* Encabezado */}
      <Text style={styles.header}>Directorio de Miembros Activos</Text>
      <Text
        style={{
          fontSize: 9,
          textAlign: "center",
          marginBottom: 20,
          color: "grey",
        }}
      >
        Generado el: {fecha}
      </Text>

      {/* Tabla */}
      <View style={styles.table}>
        {/* Fila de Encabezado */}
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableColHeader, { width: "30%" }]}>
            <Text style={styles.tableCellHeader}>Nombre Completo</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "15%" }]}>
            <Text style={styles.tableCellHeader}>Teléfono</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "25%" }]}>
            <Text style={styles.tableCellHeader}>Email</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "30%" }]}>
            <Text style={styles.tableCellHeader}>Dirección</Text>
          </View>
        </View>

        {/* Filas de Datos */}
        {miembros.map((miembro, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={styles.tableCell}>{miembro.nombre_completo}</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>{miembro.telefono || "N/A"}</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{miembro.email || "N/A"}</Text>
            </View>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={styles.tableCell}>{miembro.direccion || "N/A"}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Número de Página */}
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);
