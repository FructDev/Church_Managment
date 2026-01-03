export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          descripcion: string | null
          es_recurrente: boolean | null
          estado: Database["public"]["Enums"]["estado_actividad"]
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          notas: string | null
          regla_recurrencia: string | null
          responsable_id: string | null
          sociedad_id: string | null
          tipo_actividad_id: string
          titulo: string
          todo_el_dia: boolean | null
          ubicacion: string | null
        }
        Insert: {
          descripcion?: string | null
          es_recurrente?: boolean | null
          estado?: Database["public"]["Enums"]["estado_actividad"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          notas?: string | null
          regla_recurrencia?: string | null
          responsable_id?: string | null
          sociedad_id?: string | null
          tipo_actividad_id: string
          titulo: string
          todo_el_dia?: boolean | null
          ubicacion?: string | null
        }
        Update: {
          descripcion?: string | null
          es_recurrente?: boolean | null
          estado?: Database["public"]["Enums"]["estado_actividad"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          notas?: string | null
          regla_recurrencia?: string | null
          responsable_id?: string | null
          sociedad_id?: string | null
          tipo_actividad_id?: string
          titulo?: string
          todo_el_dia?: boolean | null
          ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_sociedad_id_fkey"
            columns: ["sociedad_id"]
            isOneToOne: false
            referencedRelation: "sociedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_tipo_actividad_id_fkey"
            columns: ["tipo_actividad_id"]
            isOneToOne: false
            referencedRelation: "tipos_actividades"
            referencedColumns: ["id"]
          },
        ]
      }
      anuncios: {
        Row: {
          activo: boolean
          contenido: string
          creado_por: string
          fecha_creacion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          prioridad: Database["public"]["Enums"]["prioridad"]
          sociedad_id: string | null
          tipo: Database["public"]["Enums"]["tipo_anuncio"]
          titulo: string
        }
        Insert: {
          activo?: boolean
          contenido: string
          creado_por: string
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad"]
          sociedad_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_anuncio"]
          titulo: string
        }
        Update: {
          activo?: boolean
          contenido?: string
          creado_por?: string
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad"]
          sociedad_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_anuncio"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_sociedad_id_fkey"
            columns: ["sociedad_id"]
            isOneToOne: false
            referencedRelation: "sociedades"
            referencedColumns: ["id"]
          },
        ]
      }
      asistencia_actividades: {
        Row: {
          actividad_id: string
          fecha_registro: string | null
          id: string
          miembro_id: string
          presente: boolean
          registrado_por: string | null
        }
        Insert: {
          actividad_id: string
          fecha_registro?: string | null
          id?: string
          miembro_id: string
          presente?: boolean
          registrado_por?: string | null
        }
        Update: {
          actividad_id?: string
          fecha_registro?: string | null
          id?: string
          miembro_id?: string
          presente?: boolean
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_actividades_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_actividades_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "vista_calendario_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_actividades_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_actividades_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_actividades_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bienes_patrimonio: {
        Row: {
          activo: boolean
          categoria_id: string
          descripcion: string | null
          estado_condicion:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_adquisicion: string | null
          fecha_creacion: string | null
          foto_url: string | null
          id: string
          nombre: string
          notas: string | null
          numero_serie: string | null
          responsable_id: string | null
          ubicacion: string | null
          valor_actual: number | null
          valor_adquisicion: number | null
        }
        Insert: {
          activo?: boolean
          categoria_id: string
          descripcion?: string | null
          estado_condicion?:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_adquisicion?: string | null
          fecha_creacion?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          notas?: string | null
          numero_serie?: string | null
          responsable_id?: string | null
          ubicacion?: string | null
          valor_actual?: number | null
          valor_adquisicion?: number | null
        }
        Update: {
          activo?: boolean
          categoria_id?: string
          descripcion?: string | null
          estado_condicion?:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_adquisicion?: string | null
          fecha_creacion?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          numero_serie?: string | null
          responsable_id?: string | null
          ubicacion?: string | null
          valor_actual?: number | null
          valor_adquisicion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bienes_patrimonio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_patrimonio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bienes_patrimonio_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bienes_patrimonio_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      caja_chica: {
        Row: {
          estado: Database["public"]["Enums"]["estado_general"]
          fecha_cierre: string | null
          fecha_creacion: string | null
          id: string
          monto_asignado: number
          monto_disponible: number
          nombre: string
          periodo_fin: string | null
          periodo_inicio: string
          responsable_id: string
        }
        Insert: {
          estado?: Database["public"]["Enums"]["estado_general"]
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          monto_asignado: number
          monto_disponible: number
          nombre: string
          periodo_fin?: string | null
          periodo_inicio: string
          responsable_id: string
        }
        Update: {
          estado?: Database["public"]["Enums"]["estado_general"]
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          monto_asignado?: number
          monto_disponible?: number
          nombre?: string
          periodo_fin?: string | null
          periodo_inicio?: string
          responsable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caja_chica_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caja_chica_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_egresos: {
        Row: {
          activo: boolean
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          orden: number | null
          tipo: Database["public"]["Enums"]["tipo_categoria_egreso"]
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tipo: Database["public"]["Enums"]["tipo_categoria_egreso"]
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tipo?: Database["public"]["Enums"]["tipo_categoria_egreso"]
        }
        Relationships: []
      }
      categorias_ingresos: {
        Row: {
          activo: boolean
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          orden: number | null
          tipo: Database["public"]["Enums"]["tipo_categoria_ingreso"]
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tipo: Database["public"]["Enums"]["tipo_categoria_ingreso"]
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tipo?: Database["public"]["Enums"]["tipo_categoria_ingreso"]
        }
        Relationships: []
      }
      categorias_patrimonio: {
        Row: {
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      categorias_recursos: {
        Row: {
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_recurso"]
        }
        Insert: {
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_recurso"]
        }
        Update: {
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_recurso"]
        }
        Relationships: []
      }
      clases_eb: {
        Row: {
          activo: boolean | null
          aula: string | null
          id: string
          maestro_id: string | null
          nombre: string
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          aula?: string | null
          id?: string
          maestro_id?: string | null
          nombre: string
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          aula?: string | null
          id?: string
          maestro_id?: string | null
          nombre?: string
          orden?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clases_eb_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_eb_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      comites: {
        Row: {
          activo: boolean
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_comite"]
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_comite"]
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_comite"]
        }
        Relationships: []
      }
      configuracion: {
        Row: {
          direccion: string | null
          email_contacto: string | null
          id: string
          logo_url: string | null
          moneda: string | null
          nombre_iglesia: string | null
          telefono: string | null
          updated_at: string | null
          website: string | null
          zona_horaria: string | null
        }
        Insert: {
          direccion?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          moneda?: string | null
          nombre_iglesia?: string | null
          telefono?: string | null
          updated_at?: string | null
          website?: string | null
          zona_horaria?: string | null
        }
        Update: {
          direccion?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          moneda?: string | null
          nombre_iglesia?: string | null
          telefono?: string | null
          updated_at?: string | null
          website?: string | null
          zona_horaria?: string | null
        }
        Relationships: []
      }
      configuracion_congregacion: {
        Row: {
          denominacion: string | null
          direccion: string | null
          email: string | null
          fecha_actualizacion: string | null
          fecha_fundacion: string | null
          id: string
          idioma: string | null
          logo_url: string | null
          moneda: string | null
          nombre_congregacion: string
          pagina_web: string | null
          telefono: string | null
          zona_horaria: string | null
        }
        Insert: {
          denominacion?: string | null
          direccion?: string | null
          email?: string | null
          fecha_actualizacion?: string | null
          fecha_fundacion?: string | null
          id?: string
          idioma?: string | null
          logo_url?: string | null
          moneda?: string | null
          nombre_congregacion: string
          pagina_web?: string | null
          telefono?: string | null
          zona_horaria?: string | null
        }
        Update: {
          denominacion?: string | null
          direccion?: string | null
          email?: string | null
          fecha_actualizacion?: string | null
          fecha_fundacion?: string | null
          id?: string
          idioma?: string | null
          logo_url?: string | null
          moneda?: string | null
          nombre_congregacion?: string
          pagina_web?: string | null
          telefono?: string | null
          zona_horaria?: string | null
        }
        Relationships: []
      }
      configuracion_sistema: {
        Row: {
          clave: string
          descripcion: string | null
          fecha_actualizacion: string | null
          valor: Json
        }
        Insert: {
          clave: string
          descripcion?: string | null
          fecha_actualizacion?: string | null
          valor: Json
        }
        Update: {
          clave?: string
          descripcion?: string | null
          fecha_actualizacion?: string | null
          valor?: Json
        }
        Relationships: []
      }
      cuentas_bancarias: {
        Row: {
          activa: boolean
          banco: string
          fecha_creacion: string | null
          id: string
          nombre: string
          notas: string | null
          numero_cuenta: string
          saldo_actual: number
          tipo_cuenta: Database["public"]["Enums"]["tipo_cuenta_bancaria"]
        }
        Insert: {
          activa?: boolean
          banco: string
          fecha_creacion?: string | null
          id?: string
          nombre: string
          notas?: string | null
          numero_cuenta: string
          saldo_actual?: number
          tipo_cuenta: Database["public"]["Enums"]["tipo_cuenta_bancaria"]
        }
        Update: {
          activa?: boolean
          banco?: string
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          numero_cuenta?: string
          saldo_actual?: number
          tipo_cuenta?: Database["public"]["Enums"]["tipo_cuenta_bancaria"]
        }
        Relationships: []
      }
      diaconos: {
        Row: {
          activo: boolean
          areas_servicio: Json | null
          fecha_creacion: string | null
          fecha_nombramiento: string
          id: string
          miembro_id: string
        }
        Insert: {
          activo?: boolean
          areas_servicio?: Json | null
          fecha_creacion?: string | null
          fecha_nombramiento: string
          id?: string
          miembro_id: string
        }
        Update: {
          activo?: boolean
          areas_servicio?: Json | null
          fecha_creacion?: string | null
          fecha_nombramiento?: string
          id?: string
          miembro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diaconos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diaconos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      diezmos: {
        Row: {
          comite_finanzas: number
          comprobante_distribucion_url: string | null
          diezmo_de_diezmo: number
          diezmo_pastoral: number
          distribuido: boolean
          distribuido_por: string | null
          fecha_creacion: string | null
          fecha_distribucion: string | null
          id: string
          notas: string | null
          periodo: string
          registrado_por: string
          sustento_pastoral: number
          tipo_periodo: Database["public"]["Enums"]["tipo_periodo_diezmo"]
          total_recibido: number
        }
        Insert: {
          comite_finanzas: number
          comprobante_distribucion_url?: string | null
          diezmo_de_diezmo: number
          diezmo_pastoral: number
          distribuido?: boolean
          distribuido_por?: string | null
          fecha_creacion?: string | null
          fecha_distribucion?: string | null
          id?: string
          notas?: string | null
          periodo: string
          registrado_por: string
          sustento_pastoral: number
          tipo_periodo: Database["public"]["Enums"]["tipo_periodo_diezmo"]
          total_recibido: number
        }
        Update: {
          comite_finanzas?: number
          comprobante_distribucion_url?: string | null
          diezmo_de_diezmo?: number
          diezmo_pastoral?: number
          distribuido?: boolean
          distribuido_por?: string | null
          fecha_creacion?: string | null
          fecha_distribucion?: string | null
          id?: string
          notas?: string | null
          periodo?: string
          registrado_por?: string
          sustento_pastoral?: number
          tipo_periodo?: Database["public"]["Enums"]["tipo_periodo_diezmo"]
          total_recibido?: number
        }
        Relationships: [
          {
            foreignKeyName: "diezmos_distribuido_por_fkey"
            columns: ["distribuido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diezmos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      directivas_sociedades: {
        Row: {
          activo: boolean
          cargo: Database["public"]["Enums"]["cargo_directiva"]
          fecha_creacion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          miembro_id: string
          sociedad_id: string
        }
        Insert: {
          activo?: boolean
          cargo: Database["public"]["Enums"]["cargo_directiva"]
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          miembro_id: string
          sociedad_id: string
        }
        Update: {
          activo?: boolean
          cargo?: Database["public"]["Enums"]["cargo_directiva"]
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          miembro_id?: string
          sociedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "directivas_sociedades_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directivas_sociedades_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directivas_sociedades_sociedad_id_fkey"
            columns: ["sociedad_id"]
            isOneToOne: false
            referencedRelation: "sociedades"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_cargos: {
        Row: {
          cargo_id: string
          cargo_nombre: string
          fecha_creacion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          miembro_id: string
          tipo_cargo: Database["public"]["Enums"]["tipo_cargo"]
        }
        Insert: {
          cargo_id: string
          cargo_nombre: string
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          miembro_id: string
          tipo_cargo: Database["public"]["Enums"]["tipo_cargo"]
        }
        Update: {
          cargo_id?: string
          cargo_nombre?: string
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          miembro_id?: string
          tipo_cargo?: Database["public"]["Enums"]["tipo_cargo"]
        }
        Relationships: [
          {
            foreignKeyName: "historial_cargos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_cargos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_comunicaciones: {
        Row: {
          asunto: string | null
          destinatarios: Json
          enviado: boolean
          enviado_por: string
          errores: Json | null
          fecha_creacion: string | null
          fecha_envio: string | null
          id: string
          mensaje: string
          tipo: Database["public"]["Enums"]["tipo_comunicacion"]
        }
        Insert: {
          asunto?: string | null
          destinatarios: Json
          enviado?: boolean
          enviado_por: string
          errores?: Json | null
          fecha_creacion?: string | null
          fecha_envio?: string | null
          id?: string
          mensaje: string
          tipo: Database["public"]["Enums"]["tipo_comunicacion"]
        }
        Update: {
          asunto?: string | null
          destinatarios?: Json
          enviado?: boolean
          enviado_por?: string
          errores?: Json | null
          fecha_creacion?: string | null
          fecha_envio?: string | null
          id?: string
          mensaje?: string
          tipo?: Database["public"]["Enums"]["tipo_comunicacion"]
        }
        Relationships: [
          {
            foreignKeyName: "historial_comunicaciones_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hogares_culto: {
        Row: {
          activo: boolean | null
          anfitrion_id: string | null
          dia_reunion: string | null
          direccion: string
          fecha_registro: string | null
          hora_reunion: string | null
          id: string
          lider_id: string | null
          nombre_familia: string
          sector: string | null
        }
        Insert: {
          activo?: boolean | null
          anfitrion_id?: string | null
          dia_reunion?: string | null
          direccion: string
          fecha_registro?: string | null
          hora_reunion?: string | null
          id?: string
          lider_id?: string | null
          nombre_familia: string
          sector?: string | null
        }
        Update: {
          activo?: boolean | null
          anfitrion_id?: string | null
          dia_reunion?: string | null
          direccion?: string
          fecha_registro?: string | null
          hora_reunion?: string | null
          id?: string
          lider_id?: string | null
          nombre_familia?: string
          sector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hogares_culto_anfitrion_id_fkey"
            columns: ["anfitrion_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hogares_culto_anfitrion_id_fkey"
            columns: ["anfitrion_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hogares_culto_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hogares_culto_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones_eb: {
        Row: {
          clase_id: string | null
          fecha_inscripcion: string | null
          id: string
          miembro_id: string | null
        }
        Insert: {
          clase_id?: string | null
          fecha_inscripcion?: string | null
          id?: string
          miembro_id?: string | null
        }
        Update: {
          clase_id?: string | null
          fecha_inscripcion?: string | null
          id?: string
          miembro_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_eb_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases_eb"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_eb_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_eb_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones_retiro: {
        Row: {
          estado_pago: string | null
          fecha_inscripcion: string | null
          id: string
          miembro_id: string | null
          monto_abonado: number | null
          retiro_id: string | null
        }
        Insert: {
          estado_pago?: string | null
          fecha_inscripcion?: string | null
          id?: string
          miembro_id?: string | null
          monto_abonado?: number | null
          retiro_id?: string | null
        }
        Update: {
          estado_pago?: string | null
          fecha_inscripcion?: string | null
          id?: string
          miembro_id?: string | null
          monto_abonado?: number | null
          retiro_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_retiro_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_retiro_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_retiro_retiro_id_fkey"
            columns: ["retiro_id"]
            isOneToOne: false
            referencedRelation: "retiros"
            referencedColumns: ["id"]
          },
        ]
      }
      liderazgo: {
        Row: {
          activo: boolean
          cargo: Database["public"]["Enums"]["cargo_liderazgo"]
          fecha_creacion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          miembro_id: string | null
          notas: string | null
        }
        Insert: {
          activo?: boolean
          cargo: Database["public"]["Enums"]["cargo_liderazgo"]
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          miembro_id?: string | null
          notas?: string | null
        }
        Update: {
          activo?: boolean
          cargo?: Database["public"]["Enums"]["cargo_liderazgo"]
          fecha_creacion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          miembro_id?: string | null
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liderazgo_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liderazgo_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      lineas_presupuesto: {
        Row: {
          categoria_egreso_id: string
          fecha_creacion: string | null
          id: string
          monto_ejecutado: number
          monto_presupuestado: number
          notas: string | null
          presupuesto_id: string
        }
        Insert: {
          categoria_egreso_id: string
          fecha_creacion?: string | null
          id?: string
          monto_ejecutado?: number
          monto_presupuestado: number
          notas?: string | null
          presupuesto_id: string
        }
        Update: {
          categoria_egreso_id?: string
          fecha_creacion?: string | null
          id?: string
          monto_ejecutado?: number
          monto_presupuestado?: number
          notas?: string | null
          presupuesto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lineas_presupuesto_categoria_egreso_id_fkey"
            columns: ["categoria_egreso_id"]
            isOneToOne: false
            referencedRelation: "categorias_egresos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineas_presupuesto_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenimientos_patrimonio: {
        Row: {
          bien_id: string
          costo: number | null
          descripcion: string
          fecha: string
          fecha_creacion: string | null
          id: string
          realizado_por: string | null
          tipo: Database["public"]["Enums"]["tipo_mantenimiento"]
          transaccion_id: string | null
        }
        Insert: {
          bien_id: string
          costo?: number | null
          descripcion: string
          fecha: string
          fecha_creacion?: string | null
          id?: string
          realizado_por?: string | null
          tipo: Database["public"]["Enums"]["tipo_mantenimiento"]
          transaccion_id?: string | null
        }
        Update: {
          bien_id?: string
          costo?: number | null
          descripcion?: string
          fecha?: string
          fecha_creacion?: string | null
          id?: string
          realizado_por?: string | null
          tipo?: Database["public"]["Enums"]["tipo_mantenimiento"]
          transaccion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenimientos_patrimonio_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "bienes_patrimonio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mantenimientos_patrimonio_transaccion_id_fkey"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "transacciones"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros: {
        Row: {
          direccion: string | null
          email: string | null
          es_bautizado: boolean | null
          estado_civil: Database["public"]["Enums"]["estado_civil"] | null
          estado_membresia: Database["public"]["Enums"]["estado_membresia"]
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_ingreso_congregacion: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          id: string
          nombre_completo: string
          notas: string | null
          profesion: string | null
          sociedad_id: string | null
          telefono: string | null
          telefono_secundario: string | null
        }
        Insert: {
          direccion?: string | null
          email?: string | null
          es_bautizado?: boolean | null
          estado_civil?: Database["public"]["Enums"]["estado_civil"] | null
          estado_membresia?: Database["public"]["Enums"]["estado_membresia"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_ingreso_congregacion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          id?: string
          nombre_completo: string
          notas?: string | null
          profesion?: string | null
          sociedad_id?: string | null
          telefono?: string | null
          telefono_secundario?: string | null
        }
        Update: {
          direccion?: string | null
          email?: string | null
          es_bautizado?: boolean | null
          estado_civil?: Database["public"]["Enums"]["estado_civil"] | null
          estado_membresia?: Database["public"]["Enums"]["estado_membresia"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_ingreso_congregacion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          id?: string
          nombre_completo?: string
          notas?: string | null
          profesion?: string | null
          sociedad_id?: string | null
          telefono?: string | null
          telefono_secundario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_miembros_sociedad"
            columns: ["sociedad_id"]
            isOneToOne: false
            referencedRelation: "sociedades"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_comites: {
        Row: {
          activo: boolean
          comite_id: string
          fecha_creacion: string | null
          fecha_ingreso: string
          fecha_salida: string | null
          id: string
          miembro_id: string
          responsabilidad: string | null
        }
        Insert: {
          activo?: boolean
          comite_id: string
          fecha_creacion?: string | null
          fecha_ingreso: string
          fecha_salida?: string | null
          id?: string
          miembro_id: string
          responsabilidad?: string | null
        }
        Update: {
          activo?: boolean
          comite_id?: string
          fecha_creacion?: string | null
          fecha_ingreso?: string
          fecha_salida?: string | null
          id?: string
          miembro_id?: string
          responsabilidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "miembros_comites_comite_id_fkey"
            columns: ["comite_id"]
            isOneToOne: false
            referencedRelation: "comites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_comites_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_comites_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_bancarios: {
        Row: {
          conciliado: boolean
          cuenta_destino_id: string | null
          cuenta_id: string
          descripcion: string | null
          fecha: string
          fecha_conciliacion: string | null
          fecha_creacion: string | null
          id: string
          monto: number
          referencia: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_bancario"]
          transaccion_id: string | null
        }
        Insert: {
          conciliado?: boolean
          cuenta_destino_id?: string | null
          cuenta_id: string
          descripcion?: string | null
          fecha: string
          fecha_conciliacion?: string | null
          fecha_creacion?: string | null
          id?: string
          monto: number
          referencia?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_bancario"]
          transaccion_id?: string | null
        }
        Update: {
          conciliado?: boolean
          cuenta_destino_id?: string | null
          cuenta_id?: string
          descripcion?: string | null
          fecha?: string
          fecha_conciliacion?: string | null
          fecha_creacion?: string | null
          id?: string
          monto?: number
          referencia?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimiento_bancario"]
          transaccion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_bancarios_cuenta_destino_id_fkey"
            columns: ["cuenta_destino_id"]
            isOneToOne: false
            referencedRelation: "cuentas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_bancarios_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_bancarios_transaccion_id_fkey"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "transacciones"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_caja_chica: {
        Row: {
          caja_chica_id: string
          comprobante_url: string | null
          concepto: string
          fecha: string
          fecha_creacion: string | null
          id: string
          monto: number
          registrado_por: string
          tipo: Database["public"]["Enums"]["tipo_movimiento_caja"]
        }
        Insert: {
          caja_chica_id: string
          comprobante_url?: string | null
          concepto: string
          fecha: string
          fecha_creacion?: string | null
          id?: string
          monto: number
          registrado_por: string
          tipo: Database["public"]["Enums"]["tipo_movimiento_caja"]
        }
        Update: {
          caja_chica_id?: string
          comprobante_url?: string | null
          concepto?: string
          fecha?: string
          fecha_creacion?: string | null
          id?: string
          monto?: number
          registrado_por?: string
          tipo?: Database["public"]["Enums"]["tipo_movimiento_caja"]
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_caja_chica_caja_chica_id_fkey"
            columns: ["caja_chica_id"]
            isOneToOne: false
            referencedRelation: "caja_chica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_chica_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_prestamos: {
        Row: {
          capital: number | null
          fecha_creacion: string | null
          fecha_pago: string | null
          fecha_programada: string
          id: string
          interes: number | null
          monto_pagado: number | null
          monto_programado: number
          notas: string | null
          pagado: boolean
          prestamo_id: string
          transaccion_id: string | null
        }
        Insert: {
          capital?: number | null
          fecha_creacion?: string | null
          fecha_pago?: string | null
          fecha_programada: string
          id?: string
          interes?: number | null
          monto_pagado?: number | null
          monto_programado: number
          notas?: string | null
          pagado?: boolean
          prestamo_id: string
          transaccion_id?: string | null
        }
        Update: {
          capital?: number | null
          fecha_creacion?: string | null
          fecha_pago?: string | null
          fecha_programada?: string
          id?: string
          interes?: number | null
          monto_pagado?: number | null
          monto_programado?: number
          notas?: string | null
          pagado?: boolean
          prestamo_id?: string
          transaccion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_prestamos_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_prestamos_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "vista_prestamos_proximos_pagos"
            referencedColumns: ["prestamo_id"]
          },
          {
            foreignKeyName: "pagos_prestamos_transaccion_id_fkey"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "transacciones"
            referencedColumns: ["id"]
          },
        ]
      }
      peticiones_oracion: {
        Row: {
          activa: boolean
          categoria: Database["public"]["Enums"]["categoria_oracion"]
          descripcion: string
          fecha_creacion: string | null
          fecha_respuesta: string | null
          id: string
          miembro_id: string | null
          privada: boolean
          testimonio_respuesta: string | null
          titulo: string
        }
        Insert: {
          activa?: boolean
          categoria: Database["public"]["Enums"]["categoria_oracion"]
          descripcion: string
          fecha_creacion?: string | null
          fecha_respuesta?: string | null
          id?: string
          miembro_id?: string | null
          privada?: boolean
          testimonio_respuesta?: string | null
          titulo: string
        }
        Update: {
          activa?: boolean
          categoria?: Database["public"]["Enums"]["categoria_oracion"]
          descripcion?: string
          fecha_creacion?: string | null
          fecha_respuesta?: string | null
          id?: string
          miembro_id?: string | null
          privada?: boolean
          testimonio_respuesta?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "peticiones_oracion_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peticiones_oracion_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      predicadores_maestros: {
        Row: {
          actividad_id: string
          fecha_creacion: string | null
          id: string
          miembro_id: string
          rol: Database["public"]["Enums"]["rol_actividad"]
          tema: string | null
        }
        Insert: {
          actividad_id: string
          fecha_creacion?: string | null
          id?: string
          miembro_id: string
          rol: Database["public"]["Enums"]["rol_actividad"]
          tema?: string | null
        }
        Update: {
          actividad_id?: string
          fecha_creacion?: string | null
          id?: string
          miembro_id?: string
          rol?: Database["public"]["Enums"]["rol_actividad"]
          tema?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predicadores_maestros_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicadores_maestros_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "vista_calendario_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicadores_maestros_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicadores_maestros_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      prestamos: {
        Row: {
          aprobado_por: string | null
          beneficiario_prestamista: string
          estado: Database["public"]["Enums"]["estado_prestamo"]
          fecha_creacion: string | null
          fecha_prestamo: string
          fecha_vencimiento: string | null
          id: string
          monto_original: number
          monto_pendiente: number
          notas: string | null
          periodicidad_pago: Database["public"]["Enums"]["periodicidad"] | null
          tasa_interes: number | null
          tipo: Database["public"]["Enums"]["tipo_prestamo"]
        }
        Insert: {
          aprobado_por?: string | null
          beneficiario_prestamista: string
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_creacion?: string | null
          fecha_prestamo: string
          fecha_vencimiento?: string | null
          id?: string
          monto_original: number
          monto_pendiente: number
          notas?: string | null
          periodicidad_pago?: Database["public"]["Enums"]["periodicidad"] | null
          tasa_interes?: number | null
          tipo: Database["public"]["Enums"]["tipo_prestamo"]
        }
        Update: {
          aprobado_por?: string | null
          beneficiario_prestamista?: string
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_creacion?: string | null
          fecha_prestamo?: string
          fecha_vencimiento?: string | null
          id?: string
          monto_original?: number
          monto_pendiente?: number
          notas?: string | null
          periodicidad_pago?: Database["public"]["Enums"]["periodicidad"] | null
          tasa_interes?: number | null
          tipo?: Database["public"]["Enums"]["tipo_prestamo"]
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prestamos_recursos: {
        Row: {
          devuelto: boolean
          estado_devolucion:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_creacion: string | null
          fecha_devolucion_programada: string
          fecha_devolucion_real: string | null
          fecha_prestamo: string
          id: string
          miembro_id: string
          notas: string | null
          recurso_id: string
        }
        Insert: {
          devuelto?: boolean
          estado_devolucion?:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_creacion?: string | null
          fecha_devolucion_programada: string
          fecha_devolucion_real?: string | null
          fecha_prestamo: string
          id?: string
          miembro_id: string
          notas?: string | null
          recurso_id: string
        }
        Update: {
          devuelto?: boolean
          estado_devolucion?:
            | Database["public"]["Enums"]["estado_condicion"]
            | null
          fecha_creacion?: string | null
          fecha_devolucion_programada?: string
          fecha_devolucion_real?: string | null
          fecha_prestamo?: string
          id?: string
          miembro_id?: string
          notas?: string | null
          recurso_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_recursos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_recursos_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "vista_recursos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          actividad_id: string | null
          anio: number
          aprobado_por: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_actualizacion: string | null
          fecha_aprobacion: string | null
          fecha_creacion: string | null
          id: string
          mes: number | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_presupuesto"]
        }
        Insert: {
          actividad_id?: string | null
          anio: number
          aprobado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_actualizacion?: string | null
          fecha_aprobacion?: string | null
          fecha_creacion?: string | null
          id?: string
          mes?: number | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_presupuesto"]
        }
        Update: {
          actividad_id?: string | null
          anio?: number
          aprobado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_actualizacion?: string | null
          fecha_aprobacion?: string | null
          fecha_creacion?: string | null
          id?: string
          mes?: number | null
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_presupuesto"]
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "vista_calendario_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          estado: Database["public"]["Enums"]["estado_general"]
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: string
          miembro_id: string | null
          nombre_completo: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          telefono: string | null
        }
        Insert: {
          avatar_url?: string | null
          estado?: Database["public"]["Enums"]["estado_general"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id: string
          miembro_id?: string | null
          nombre_completo: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          telefono?: string | null
        }
        Update: {
          avatar_url?: string | null
          estado?: Database["public"]["Enums"]["estado_general"]
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          miembro_id?: string | null
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      programa_culto: {
        Row: {
          actividad_id: string
          fecha_creacion: string | null
          id: string
          notas: string | null
          orden: number
          responsable_id: string | null
          responsable_nom: string | null
          titulo_parte: string
        }
        Insert: {
          actividad_id: string
          fecha_creacion?: string | null
          id?: string
          notas?: string | null
          orden: number
          responsable_id?: string | null
          responsable_nom?: string | null
          titulo_parte: string
        }
        Update: {
          actividad_id?: string
          fecha_creacion?: string | null
          id?: string
          notas?: string | null
          orden?: number
          responsable_id?: string | null
          responsable_nom?: string | null
          titulo_parte?: string
        }
        Relationships: [
          {
            foreignKeyName: "programa_culto_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programa_culto_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "vista_calendario_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programa_culto_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programa_culto_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          anio_publicacion: number | null
          archivo_url: string | null
          autor: string | null
          cantidad_disponible: number
          cantidad_total: number
          categoria_id: string
          descripcion: string | null
          disponible: boolean
          editorial: string | null
          fecha_creacion: string | null
          id: string
          isbn: string | null
          portada_url: string | null
          tipo_medio: Database["public"]["Enums"]["tipo_medio"]
          titulo: string
          ubicacion: string | null
        }
        Insert: {
          anio_publicacion?: number | null
          archivo_url?: string | null
          autor?: string | null
          cantidad_disponible?: number
          cantidad_total?: number
          categoria_id: string
          descripcion?: string | null
          disponible?: boolean
          editorial?: string | null
          fecha_creacion?: string | null
          id?: string
          isbn?: string | null
          portada_url?: string | null
          tipo_medio: Database["public"]["Enums"]["tipo_medio"]
          titulo: string
          ubicacion?: string | null
        }
        Update: {
          anio_publicacion?: number | null
          archivo_url?: string | null
          autor?: string | null
          cantidad_disponible?: number
          cantidad_total?: number
          categoria_id?: string
          descripcion?: string | null
          disponible?: boolean
          editorial?: string | null
          fecha_creacion?: string | null
          id?: string
          isbn?: string | null
          portada_url?: string | null
          tipo_medio?: Database["public"]["Enums"]["tipo_medio"]
          titulo?: string
          ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      retiros: {
        Row: {
          costo_por_persona: number | null
          descripcion: string | null
          estado: string | null
          fecha_creacion: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          lugar: string | null
          titulo: string
        }
        Insert: {
          costo_por_persona?: number | null
          descripcion?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          lugar?: string | null
          titulo: string
        }
        Update: {
          costo_por_persona?: number | null
          descripcion?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          lugar?: string | null
          titulo?: string
        }
        Relationships: []
      }
      sociedades: {
        Row: {
          activo: boolean
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: Database["public"]["Enums"]["tipo_sociedad"]
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: Database["public"]["Enums"]["tipo_sociedad"]
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: Database["public"]["Enums"]["tipo_sociedad"]
        }
        Relationships: []
      }
      tipos_actividades: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_actividad"]
          color: string | null
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          periodicidad: Database["public"]["Enums"]["periodicidad"]
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_actividad"]
          color?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          periodicidad: Database["public"]["Enums"]["periodicidad"]
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_actividad"]
          color?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          periodicidad?: Database["public"]["Enums"]["periodicidad"]
        }
        Relationships: []
      }
      transacciones: {
        Row: {
          actividad_id: string | null
          autorizado_por: string | null
          beneficiario_proveedor: string | null
          categoria_egreso_id: string | null
          categoria_ingreso_id: string | null
          comprobante_url: string | null
          descripcion: string | null
          fecha: string
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          miembro_id: string | null
          monto: number
          nombre_externo: string | null
          referencia: string | null
          registrado_por: string
          tipo: Database["public"]["Enums"]["tipo_transaccion"]
        }
        Insert: {
          actividad_id?: string | null
          autorizado_por?: string | null
          beneficiario_proveedor?: string | null
          categoria_egreso_id?: string | null
          categoria_ingreso_id?: string | null
          comprobante_url?: string | null
          descripcion?: string | null
          fecha: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          miembro_id?: string | null
          monto: number
          nombre_externo?: string | null
          referencia?: string | null
          registrado_por: string
          tipo: Database["public"]["Enums"]["tipo_transaccion"]
        }
        Update: {
          actividad_id?: string | null
          autorizado_por?: string | null
          beneficiario_proveedor?: string | null
          categoria_egreso_id?: string | null
          categoria_ingreso_id?: string | null
          comprobante_url?: string | null
          descripcion?: string | null
          fecha?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"]
          miembro_id?: string | null
          monto?: number
          nombre_externo?: string | null
          referencia?: string | null
          registrado_por?: string
          tipo?: Database["public"]["Enums"]["tipo_transaccion"]
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "vista_calendario_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_autorizado_por_fkey"
            columns: ["autorizado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_categoria_egreso_id_fkey"
            columns: ["categoria_egreso_id"]
            isOneToOne: false
            referencedRelation: "categorias_egresos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_categoria_ingreso_id_fkey"
            columns: ["categoria_ingreso_id"]
            isOneToOne: false
            referencedRelation: "categorias_ingresos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "vista_directorio_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones_diezmos: {
        Row: {
          diezmo_id: string
          fecha_creacion: string | null
          id: string
          transaccion_id: string
        }
        Insert: {
          diezmo_id: string
          fecha_creacion?: string | null
          id?: string
          transaccion_id: string
        }
        Update: {
          diezmo_id?: string
          fecha_creacion?: string | null
          id?: string
          transaccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_diezmos_diezmo_id_fkey"
            columns: ["diezmo_id"]
            isOneToOne: false
            referencedRelation: "diezmos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_diezmos_transaccion_id_fkey"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "transacciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vista_calendario_actividades: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_actividad"] | null
          color: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_actividad"] | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string | null
          responsable: string | null
          sociedad: Database["public"]["Enums"]["tipo_sociedad"] | null
          tipo_actividad: string | null
          titulo: string | null
          todo_el_dia: boolean | null
          ubicacion: string | null
        }
        Relationships: []
      }
      vista_dashboard_financiero: {
        Row: {
          balance: number | null
          periodo: string | null
          total_egresos: number | null
          total_ingresos: number | null
        }
        Relationships: []
      }
      vista_directorio_completo: {
        Row: {
          cargos_comite: Json | null
          cargos_directiva: Json | null
          cargos_liderazgo: Json | null
          direccion: string | null
          email: string | null
          es_diacono: Json | null
          estado_civil: Database["public"]["Enums"]["estado_civil"] | null
          estado_membresia:
            | Database["public"]["Enums"]["estado_membresia"]
            | null
          fecha_ingreso_congregacion: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          id: string | null
          nombre_completo: string | null
          profesion: string | null
          sociedad: Database["public"]["Enums"]["tipo_sociedad"] | null
          telefono: string | null
          telefono_secundario: string | null
        }
        Relationships: []
      }
      vista_estadisticas_asistencia: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_actividad"] | null
          porcentaje_asistencia: number | null
          tipo_actividad: string | null
          total_actividades: number | null
          total_presentes: number | null
          total_registros_asistencia: number | null
        }
        Relationships: []
      }
      vista_prestamos_proximos_pagos: {
        Row: {
          beneficiario_prestamista: string | null
          fecha_programada: string | null
          monto_original: number | null
          monto_pendiente: number | null
          monto_programado: number | null
          pagado: boolean | null
          pago_id: string | null
          prestamo_id: string | null
          tipo: Database["public"]["Enums"]["tipo_prestamo"] | null
          vencido: boolean | null
        }
        Relationships: []
      }
      vista_recursos_disponibles: {
        Row: {
          autor: string | null
          cantidad_disponible: number | null
          cantidad_total: number | null
          categoria: string | null
          disponible: boolean | null
          id: string | null
          prestamos_activos: number | null
          tipo_medio: Database["public"]["Enums"]["tipo_medio"] | null
          titulo: string | null
        }
        Relationships: []
      }
      vista_resumen_diezmos_anual: {
        Row: {
          anio: number | null
          total_comite_finanzas: number | null
          total_diezmo_de_diezmo: number | null
          total_diezmo_pastoral: number | null
          total_diezmos_anio: number | null
          total_periodos: number | null
          total_sustento_pastoral: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_asistencia_promedio: {
        Args: {
          p_fecha_fin?: string
          p_fecha_inicio?: string
          p_miembro_id: string
        }
        Returns: number
      }
      calcular_distribucion_diezmos: {
        Args: { monto_total: number }
        Returns: Json
      }
      custom_access_token_hook: { Args: { input: Json }; Returns: Json }
      generar_calendario_pagos_prestamo: {
        Args: { p_prestamo_id: string }
        Returns: undefined
      }
      get_enum_values: { Args: { enum_type_name: string }; Returns: Json }
      get_user_rol: {
        Args: never
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      cargo_directiva:
        | "presidente"
        | "vicepresidente"
        | "secretario"
        | "subsecretario"
        | "tesorero"
        | "subtesorero"
      cargo_liderazgo:
        | "pastor"
        | "copastor"
        | "secretario_general"
        | "tesorero_general"
      categoria_actividad:
        | "culto_regular"
        | "culto_sociedad"
        | "evento_especial"
        | "actividad_financiera"
        | "retiro"
        | "reunion"
      categoria_oracion: "salud" | "familia" | "trabajo" | "ministerio" | "otro"
      estado_actividad: "programada" | "en_curso" | "completada" | "cancelada"
      estado_civil: "soltero" | "casado" | "viudo" | "divorciado"
      estado_condicion: "excelente" | "bueno" | "regular" | "malo"
      estado_general: "activo" | "inactivo"
      estado_membresia: "activo" | "inactivo" | "visitante"
      estado_prestamo: "activo" | "pagado" | "vencido" | "cancelado"
      estado_presupuesto: "borrador" | "aprobado" | "activo" | "cerrado"
      metodo_pago: "efectivo" | "transferencia" | "cheque" | "tarjeta" | "otro"
      periodicidad: "semanal" | "quincenal" | "mensual" | "eventual"
      prioridad: "baja" | "media" | "alta"
      rol_actividad: "predicador" | "maestro" | "director" | "musico"
      rol_usuario:
        | "admin"
        | "tesorero"
        | "secretario_sociedad"
        | "miembro_comite"
        | "consulta"
        | "pastor"
        | "co_pastor"
        | "secretario_general"
        | "tesorero_general"
        | "presidente_sociedad"
        | "tesorero_sociedad"
      tipo_anuncio: "general" | "sociedad" | "urgente"
      tipo_cargo: "liderazgo" | "diacono" | "directiva" | "comite"
      tipo_categoria_egreso:
        | "operativo"
        | "administrativo"
        | "distribucion"
        | "actividad"
        | "otro"
      tipo_categoria_ingreso: "ofrenda" | "diezmo" | "actividad" | "otro"
      tipo_comite:
        | "finanzas"
        | "funerales"
        | "visitas"
        | "cultos_hogares"
        | "otro"
        | "junta_oficial"
      tipo_comunicacion: "email" | "sms" | "whatsapp" | "llamada"
      tipo_cuenta_bancaria: "corriente" | "ahorro"
      tipo_mantenimiento: "preventivo" | "correctivo" | "mejora"
      tipo_medio: "fisico" | "digital"
      tipo_movimiento_bancario: "deposito" | "retiro" | "transferencia"
      tipo_movimiento_caja: "reposicion" | "gasto"
      tipo_periodo_diezmo: "primera_quincena" | "segunda_quincena"
      tipo_prestamo: "otorgado" | "recibido"
      tipo_presupuesto: "anual" | "mensual" | "actividad"
      tipo_recurso: "libro" | "digital" | "multimedia" | "estudio"
      tipo_sociedad: "damas" | "caballeros" | "jovenes" | "juveniles" | "ninos"
      tipo_transaccion: "ingreso" | "egreso"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cargo_directiva: [
        "presidente",
        "vicepresidente",
        "secretario",
        "subsecretario",
        "tesorero",
        "subtesorero",
      ],
      cargo_liderazgo: [
        "pastor",
        "copastor",
        "secretario_general",
        "tesorero_general",
      ],
      categoria_actividad: [
        "culto_regular",
        "culto_sociedad",
        "evento_especial",
        "actividad_financiera",
        "retiro",
        "reunion",
      ],
      categoria_oracion: ["salud", "familia", "trabajo", "ministerio", "otro"],
      estado_actividad: ["programada", "en_curso", "completada", "cancelada"],
      estado_civil: ["soltero", "casado", "viudo", "divorciado"],
      estado_condicion: ["excelente", "bueno", "regular", "malo"],
      estado_general: ["activo", "inactivo"],
      estado_membresia: ["activo", "inactivo", "visitante"],
      estado_prestamo: ["activo", "pagado", "vencido", "cancelado"],
      estado_presupuesto: ["borrador", "aprobado", "activo", "cerrado"],
      metodo_pago: ["efectivo", "transferencia", "cheque", "tarjeta", "otro"],
      periodicidad: ["semanal", "quincenal", "mensual", "eventual"],
      prioridad: ["baja", "media", "alta"],
      rol_actividad: ["predicador", "maestro", "director", "musico"],
      rol_usuario: [
        "admin",
        "tesorero",
        "secretario_sociedad",
        "miembro_comite",
        "consulta",
        "pastor",
        "co_pastor",
        "secretario_general",
        "tesorero_general",
        "presidente_sociedad",
        "tesorero_sociedad",
      ],
      tipo_anuncio: ["general", "sociedad", "urgente"],
      tipo_cargo: ["liderazgo", "diacono", "directiva", "comite"],
      tipo_categoria_egreso: [
        "operativo",
        "administrativo",
        "distribucion",
        "actividad",
        "otro",
      ],
      tipo_categoria_ingreso: ["ofrenda", "diezmo", "actividad", "otro"],
      tipo_comite: [
        "finanzas",
        "funerales",
        "visitas",
        "cultos_hogares",
        "otro",
        "junta_oficial",
      ],
      tipo_comunicacion: ["email", "sms", "whatsapp", "llamada"],
      tipo_cuenta_bancaria: ["corriente", "ahorro"],
      tipo_mantenimiento: ["preventivo", "correctivo", "mejora"],
      tipo_medio: ["fisico", "digital"],
      tipo_movimiento_bancario: ["deposito", "retiro", "transferencia"],
      tipo_movimiento_caja: ["reposicion", "gasto"],
      tipo_periodo_diezmo: ["primera_quincena", "segunda_quincena"],
      tipo_prestamo: ["otorgado", "recibido"],
      tipo_presupuesto: ["anual", "mensual", "actividad"],
      tipo_recurso: ["libro", "digital", "multimedia", "estudio"],
      tipo_sociedad: ["damas", "caballeros", "jovenes", "juveniles", "ninos"],
      tipo_transaccion: ["ingreso", "egreso"],
    },
  },
} as const
