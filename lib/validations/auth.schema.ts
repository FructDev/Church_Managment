// lib/validations/auth.schema.ts
import { z } from "zod";

// Esquema de Login
export const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// Esquema para solicitar reseteo
export const passwordRecoverySchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
});
export type PasswordRecoveryFormValues = z.infer<typeof passwordRecoverySchema>;

// Esquema para establecer nueva contraseña
export const passwordChangeSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

// Esquema para Registro de Admin
export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  rol: z.enum([
    "admin",
    "tesorero",
    "secretario_sociedad",
    "miembro_comite",
    "consulta",
  ]),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
