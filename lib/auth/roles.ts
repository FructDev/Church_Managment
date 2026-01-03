import { type Database } from "@/lib/database.types";

type Rol = Database["public"]["Enums"]["rol_usuario"];

// 1. NIVEL DIOS (Sin cambios)
export const ROLES_ACCESO_TOTAL: Rol[] = [
  "admin",
  "pastor",
  "secretario_general",
  "tesorero_general",
];

// 2. NIVEL EJECUTIVO (Sin cambios - ESTE ES EL GRUPO CLAVE PARA EDITAR MIEMBROS)
// Incluye Co-Pastor, excluye Sociedades.
export const ROLES_JERARQUIA_NO_FINANCIERA: Rol[] = [
  ...ROLES_ACCESO_TOTAL,
  "co_pastor",
];

// 3. PERMISOS FINANCIEROS (Sin cambios)
// Excluye Co-Pastor y Sociedades.
export const ROLES_FINANCIEROS: Rol[] = [...ROLES_ACCESO_TOTAL, "tesorero"];

// 4. PERMISOS ADMINISTRATIVOS (Ajuste: Añadir tesorero de sociedad)
export const ROLES_ADMINISTRATIVOS: Rol[] = [
  ...ROLES_JERARQUIA_NO_FINANCIERA,
  "secretario_sociedad",
  "presidente_sociedad",
  "tesorero_sociedad", // <-- AGREGADO (Faltaba este)
];

// 5. PERMISOS DE LECTURA (Sin cambios)
export const ROLES_CONSULTA: Rol[] = [
  ...ROLES_ADMINISTRATIVOS,
  ...ROLES_FINANCIEROS,
  "miembro_comite",
  "consulta",
];

// 6. LIDERAZGO DE SOCIEDAD (Nuevo grupo para finanzas descentralizadas)
export const ROLES_LIDERAZGO_SOCIEDAD: Rol[] = [
  "presidente_sociedad",
  "secretario_sociedad",
  "tesorero_sociedad",
];
