import { z } from "zod";

export const congregacionSchema = z.object({
  nombre_iglesia: z.string().min(2, { message: "Nombre requerido" }),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email_contacto: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  logo_file: z.any().optional(), // Para el input file
});

export type CongregacionFormValues = z.infer<typeof congregacionSchema>;

export const categoriaFinancieraSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(2, "Nombre requerido"),
  descripcion: z.string().optional().nullable(),
  tipo: z.string().min(1, { message: "Debe seleccionar un tipo." }),
  activo: z.boolean().default(true),
});

export type CategoriaFinancieraFormValues = z.infer<
  typeof categoriaFinancieraSchema
>;

export const usuarioRolSchema = z.object({
  user_id: z.string().uuid(),
  rol: z.enum([
    "admin",
    "tesorero",
    "secretario_sociedad",
    "miembro_comite",
    "consulta",
    "usuario",
  ]),
});

// Schema actualizado con TODOS los roles nuevos
export const createUserSchema = z.object({
  miembro_id: z.string().uuid(),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),

  // --- LISTA DE ROLES ACTUALIZADA ---
  rol: z.enum([
    // Nivel Ejecutivo (Acceso Total o Casi Total)
    "admin",
    "pastor",
    "co_pastor",
    "secretario_general",

    // Nivel Financiero General
    "tesorero", // (Legacy)
    "tesorero_general",

    // Nivel Sociedad
    "presidente_sociedad",
    "secretario_sociedad",
    "tesorero_sociedad",

    // Nivel Operativo/Consulta
    "miembro_comite",
    "consulta",
  ]),

  nombre_completo: z.string().min(2),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
