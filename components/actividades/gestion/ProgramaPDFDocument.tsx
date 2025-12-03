"use client";

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PdfImage,
} from "@react-pdf/renderer";
import { type PartePrograma } from "@/actions/actividades/programaActions";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
    alignItems: "center",
  },
  churchName: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb", // Azul primario
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    alignItems: "center",
  },
  colOrder: {
    width: "10%",
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  colTitle: {
    width: "40%",
    fontSize: 14,
    fontWeight: "bold",
  },
  colResponsable: {
    width: "50%",
    fontSize: 14,
    textAlign: "right",
    color: "#333",
  },
  note: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
    marginLeft: "10%", // Indentado
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
    color: "#999",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

interface Props {
  titulo: string;
  fecha: string;
  programa: PartePrograma[];
}

export const ProgramaPDFDocument: React.FC<Props> = ({
  titulo,
  fecha,
  programa,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.churchName}>Iglesia Cristiana</Text>{" "}
        {/* Puedes poner el nombre real aquí */}
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.date}>{fecha}</Text>
      </View>

      {/* Cuerpo del Programa */}
      <View style={styles.section}>
        {programa.map((parte, index) => (
          <View key={parte.id}>
            <View style={styles.row}>
              <Text style={styles.colOrder}>{index + 1}.</Text>
              <Text style={styles.colTitle}>{parte.titulo_parte}</Text>
              <Text style={styles.colResponsable}>
                {parte.responsable_nom ||
                  parte.responsable?.nombre_completo ||
                  "---"}
              </Text>
            </View>
            {/* Si hay notas (ej. lista de coros), las mostramos debajo */}
            {parte.notas && (
              <Text style={styles.note}>Nota: {parte.notas}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Pie de Página */}
      <View style={styles.footer}>
        <Text>
          &quot;Hágase todo decentemente y con orden.&quot; - 1 Corintios 14:40
        </Text>
      </View>
    </Page>
  </Document>
);
