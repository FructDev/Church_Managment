/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth/guards.ts
import { getSessionInfo } from "./utils";
import { type Database } from "../database.types";
import { ROLES_JERARQUIA_NO_FINANCIERA } from "./roles";

type RolUsuario = Database["public"]["Enums"]["rol_usuario"];

/**
 * Verifica si el usuario actual tiene uno de los roles requeridos.
 * Si no está autenticado o no tiene el rol, lanza un error.
 */
export const checkPermission = async (
  requiredRole: RolUsuario | RolUsuario[]
) => {
  const { user, profile, error } = await getSessionInfo();

  if (error || !user || !profile) {
    throw new Error("Acceso denegado: No estás autenticado.");
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(profile.rol)) {
    throw new Error(`Acceso denegado: Se requiere rol ${roles.join(" o ")}.`);
  }

  return { user, profile };
};

/**
 * Verifica si el usuario actual tiene permiso para
 * editar un recurso de una sociedad específica.
 *
 * @param {string} sociedadIdRequerida - El ID de la sociedad que se intenta editar.
 */
export async function checkSociedadPermission(sociedadId: string) {
  const { user, profile } = await getSessionInfo();

  if (!user || !profile) throw new Error("No autorizado");

  // 1. Si es parte de la Jerarquía (Pastor, Co-Pastor, Admin, etc.) -> PASE VIP
  if (ROLES_JERARQUIA_NO_FINANCIERA.includes(profile.rol as any)) {
    return { user, profile };
  }

  // 2. Si es Secretario/Líder DE ESTA SOCIEDAD ESPECÍFICA -> Pase
  if (
    [
      "secretario_sociedad",
      "presidente_sociedad",
      "tesorero_sociedad",
    ].includes(profile.rol) &&
    profile.sociedad_id === sociedadId
  ) {
    return { user, profile };
  }

  throw new Error("No tiene permisos para gestionar esta sociedad.");
}
