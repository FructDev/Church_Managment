'use client'

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer'
import { type PartePrograma } from '@/actions/actividades/programaActions'

// Diseño Elegante / Clásico
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  // Borde decorativo alrededor del contenido
  borderContainer: {
    border: '2px solid #2c3e50',
    padding: 20,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  // Encabezado
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 15,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    objectFit: 'contain',
  },
  churchName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  address: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },

  // Título del Evento
  eventInfo: {
    textAlign: 'center',
    marginBottom: 25,
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb', // Azul elegante
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic',
  },

  // Lista del Programa (Estilo Menú con puntos)
  programList: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  // Contenedor izquierdo (Orden + Título + Puntos)
  leftContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'flex-end',
    overflow: 'hidden', // Para cortar los puntos
  },
  order: {
    width: 20,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#999',
  },
  partTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    backgroundColor: '#fff', // Tapa los puntos detrás del texto
    paddingRight: 5,
  },
  // Los puntos suspensivos
  dots: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderBottomStyle: 'dotted',
    marginBottom: 3,
    marginLeft: 2,
  },
  // El responsable a la derecha
  responsable: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#333',
    textAlign: 'right',
    paddingLeft: 5,
    backgroundColor: '#fff',
  },

  // Notas debajo de la parte
  notes: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 20, // Indentado
    marginTop: -2,
    marginBottom: 5,
  },

  // Pie de página
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    alignItems: 'center',
  },
  verse: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#444',
    textAlign: 'center',
    marginBottom: 5,
  },
  pageNumber: {
    fontSize: 8,
    color: '#999',
  }
});

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

export const ProgramaPDFDocument: React.FC<Props> = ({ titulo, fecha, programa, configuracion }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.borderContainer}>

        {/* 1. Encabezado Institucional */}
        <View style={styles.header}>
          {configuracion.logo_url && (
            <Image src={configuracion.logo_url} style={styles.logo} />
          )}
          <Text style={styles.churchName}>
            {configuracion.nombre_iglesia || 'Iglesia Local'}
          </Text>
          {configuracion.direccion && (
            <Text style={styles.address}>{configuracion.direccion}</Text>
          )}
        </View>

        {/* 2. Título del Culto */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{titulo}</Text>
          <Text style={styles.eventDate}>{fecha}</Text>
        </View>

        {/* 3. Cuerpo del Programa */}
        <View style={styles.programList}>
          {programa.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
              -- Programa no definido --
            </Text>
          )}

          {programa.map((parte, index) => (
            <View key={parte.id} wrap={false}>
              <View style={styles.row}>
                <View style={styles.leftContainer}>
                  <Text style={styles.order}>{index + 1}.</Text>
                  <Text style={styles.partTitle}>{parte.titulo_parte}</Text>
                  <View style={styles.dots} />
                </View>
                <Text style={styles.responsable}>
                  {parte.responsable_nom || parte.responsable?.nombre_completo || '---'}
                </Text>
              </View>

              {/* Notas adicionales (Himnos, citas, etc) */}
              {parte.notas && (
                <Text style={styles.notes}>({parte.notas})</Text>
              )}
            </View>
          ))}
        </View>

        {/* 4. Pie de Página */}
        <View style={styles.footer}>
          <Text style={styles.verse}>
            "Pero hágase todo decentemente y con orden." — 1 Corintios 14:40
          </Text>
        </View>

      </View>
    </Page>
  </Document>
)