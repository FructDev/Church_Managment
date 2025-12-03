// lib/validations/estructura.schema.ts
import { z } from "zod";

export const diaconoSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición
  miembro_id: z.string().uuid({ message: "Debe seleccionar un miembro." }),
  fecha_nombramiento: z.string().min(1, { message: "La fecha es requerida." }),
  areas_servicio: z.string().optional(), // Lo manejaremos como texto simple por ahora
  activo: z.boolean().default(true),
});

export type DiaconoFormValues = z.infer<typeof diaconoSchema>;

// Esquema para el formulario de la directiva de sociedad
export const directivaSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición
  sociedad_id: z
    .string()
    .uuid({ message: "Se requiere el ID de la sociedad." }),
  miembro_id: z.string().uuid({ message: "Debe seleccionar un miembro." }),
  cargo: z.enum([
    "presidente",
    "vicepresidente",
    "secretario",
    "subsecretario",
    "tesorero",
    "subtesorero",
  ]),
  fecha_inicio: z.string().min(1, { message: "La fecha es requerida." }),
  activo: z.boolean().default(true),
});

export type DirectivaFormValues = z.infer<typeof directivaSchema>;

// Esquema para el formulario de Comités (crear/editar el comité en sí)
export const comiteSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  descripcion: z.string().optional(),
  tipo: z.enum([
    // Basado en tu ENUM de la BD
    "finanzas",
    "funerales",
    "visitas",
    "cultos_hogares",
    "otro",
  ]),
  activo: z.boolean().default(true),
});

export type ComiteFormValues = z.infer<typeof comiteSchema>;

// Esquema para el formulario de Miembros de Comité
export const comiteMiembroSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición (si la hubiera)
  comite_id: z.string().uuid({ message: "Se requiere el ID del comité." }),
  miembro_id: z.string().uuid({ message: "Debe seleccionar un miembro." }),
  responsabilidad: z.string().optional(),
  fecha_ingreso: z.string().min(1, { message: "La fecha es requerida." }),
  activo: z.boolean().default(true),
});

export type ComiteMiembroFormValues = z.infer<typeof comiteMiembroSchema>;

// Esquema para el formulario de Sociedades
export const sociedadSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición
  nombre: z.enum(
    [
      // El nombre es un ENUM, no un texto libre
      "damas",
      "caballeros",
      "jovenes",
      "juveniles",
      "ninos",
    ],
    { message: "Debe seleccionar un tipo de sociedad." }
  ),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});

export type SociedadFormValues = z.infer<typeof sociedadSchema>;
