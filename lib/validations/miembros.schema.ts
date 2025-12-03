// lib/validations/miembros.schema.ts
import { z } from "zod";

// Definimos los tipos ENUM para usarlos en Zod
const estadoCivilEnum = z
  .enum(["soltero", "casado", "viudo", "divorciado"])
  .nullable();
const estadoMembresiaEnum = z.enum(["activo", "inactivo", "visitante"]);
const phoneRegex = new RegExp(
  /^(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4,}(?:[- ]?\d+)*$/
);

const rangoMinisterialEnum = z.enum([
  'ninguno', 'obrero', 'aspirante_obrero', 'evangelista', 'aspirante_evangelista', 'misionero', 'aspirante_misionero', 'pastor'
]);

export const miembroSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre_completo: z.string().min(3, { message: "El nombre es requerido." }),

  // Información de Contacto
  email: z
    .string()
    .email({ message: "Email inválido." })
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .regex(phoneRegex, { message: "Número de teléfono inválido." })
    .optional()
    .or(z.literal("")), // Permite que esté vacío
  telefono_secundario: z
    .string()
    .regex(phoneRegex, { message: "Número de teléfono inválido." })
    .optional()
    .or(z.literal("")), // Permite que esté vacío
  direccion: z.string().optional(),

  // Información Personal
  fecha_nacimiento: z.string().optional().nullable(),
  estado_civil: estadoCivilEnum,
  profesion: z.string().optional(),

  // Información de Iglesia
  fecha_ingreso_congregacion: z.string().optional().nullable(),
  sociedad_id: z.string().uuid().nullable().or(z.literal("null")), // Acepta UUID o el string "null"
  estado_membresia: estadoMembresiaEnum.default("activo"),

  // Otros
  notas: z.string().optional(),
  es_bautizado: z.boolean().default(false),
  fecha_conversion: z.string().optional().nullable(),
  rango_ministerial: rangoMinisterialEnum.default('ninguno'),
});

export type MiembroFormValues = z.infer<typeof miembroSchema>;
