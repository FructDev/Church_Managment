import { z } from "zod";

const categoriaActividadEnum = z.enum([
  "culto_regular",
  "culto_sociedad",
  "evento_especial",
  "actividad_financiera",
  "retiro",
  "reunion",
]);

// Esquema para crear/editar una actividad
export const actividadSchema = z
  .object({
    id: z.string().uuid().optional().nullable(),
    titulo: z.string().min(3, { message: "El título es requerido." }),
    descripcion: z.string().optional(),

    tipo_actividad_id: z
      .string()
      .uuid({ message: "Seleccione un tipo de actividad." }),

    // Manejo de fechas como strings ISO
    fecha_inicio: z.string().min(1, { message: "Fecha de inicio requerida." }),
    hora_inicio: z.string().min(1, { message: "Hora de inicio requerida." }),

    fecha_fin: z.string().min(1, { message: "Fecha de fin requerida." }),
    hora_fin: z.string().min(1, { message: "Hora de fin requerida." }),

    todo_el_dia: z.boolean().default(false),
    ubicacion: z.string().optional(),

    // Responsable (Miembro)
    responsable_id: z.string().uuid().optional().nullable(),

    // Recurrencia (Básico por ahora)
    es_recurrente: z.boolean().default(false),
    // Aquí guardaremos la regla RRule en texto si aplica
    regla_recurrencia: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validación: Fecha fin no puede ser antes de fecha inicio
      const inicio = new Date(`${data.fecha_inicio}T${data.hora_inicio}`);
      const fin = new Date(`${data.fecha_fin}T${data.hora_fin}`);
      return fin >= inicio;
    },
    {
      message: "La fecha/hora de fin no puede ser anterior al inicio.",
      path: ["hora_fin"], // El error aparecerá en el campo de hora fin
    }
  );

export type ActividadFormValues = z.infer<typeof actividadSchema>;

export const tipoActividadSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(3, { message: "El nombre es requerido." }),
  categoria: categoriaActividadEnum,
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, {
    message: "Debe ser un color hexadecimal válido (ej. #FF0000).",
  }),
  // 'periodicidad' es opcional en el formulario, podemos poner 'eventual' por defecto
  periodicidad: z
    .enum(["semanal", "quincenal", "mensual", "eventual"])
    .default("eventual"),
});

export type TipoActividadFormValues = z.infer<typeof tipoActividadSchema>;

export const asistenciaRecordSchema = z.object({
  miembro_id: z.string().uuid(),
  presente: z.boolean(),
});

export const registroAsistenciaSchema = z.object({
  actividad_id: z.string().uuid(),
  asistencias: z.array(asistenciaRecordSchema),
  visitantes: z.array(z.string()).optional().default([]), // [NEW] Lista de nombres de visitantes
});

export type RegistroAsistenciaFormValues = z.infer<
  typeof registroAsistenciaSchema
>;

export const hogarSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre_familia: z
    .string()
    .min(3, { message: "Nombre requerido (Ej: Familia Pérez)" }),
  direccion: z.string().min(5, { message: "Dirección requerida" }),
  sector: z.string().optional(),
  anfitrion_id: z.string().uuid().optional().nullable(),
  lider_id: z.string().uuid().optional().nullable(),
  dia_reunion: z.string().optional(), // Ej: "Lunes"
  hora_reunion: z.string().optional(), // Ej: "19:30"
  activo: z.boolean().default(true),
});

export type HogarFormValues = z.infer<typeof hogarSchema>;

export const claseEbSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(2, { message: "Nombre requerido" }),
  aula: z.string().optional(),
  maestro_id: z.string().uuid().optional().nullable(),
  activo: z.boolean().default(true),
});

export type ClaseEbFormValues = z.infer<typeof claseEbSchema>;

export const inscripcionEbSchema = z.object({
  clase_id: z.string().uuid(),
  miembro_id: z.string().uuid({ message: "Seleccione un miembro" }),
});

export type InscripcionEbFormValues = z.infer<typeof inscripcionEbSchema>;

export const retiroSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  titulo: z.string().min(3, { message: "Título requerido" }),
  lugar: z.string().optional(),
  fecha_inicio: z.string().min(1, { message: "Fecha inicio requerida" }),
  fecha_fin: z.string().min(1, { message: "Fecha fin requerida" }),

  costo_por_persona: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0, { message: "El costo debe ser 0 o mayor" })
  ),

  descripcion: z.string().optional(),
  estado: z.enum(["abierto", "cerrado", "finalizado"]).default("abierto"),
});

export type RetiroFormValues = z.infer<typeof retiroSchema>;

// --- RETIROS: INSCRIPCIÓN Y ABONO ---
export const inscripcionRetiroSchema = z.object({
  retiro_id: z.string().uuid(),
  miembro_id: z.string().uuid({ message: "Seleccione un miembro" }),
  monto_abonado: z
    .preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number().min(0)
    )
    .default(0),
});

export type InscripcionRetiroFormValues = z.infer<
  typeof inscripcionRetiroSchema
>;
