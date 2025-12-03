// lib/auth/utils.ts
import { createClient } from "@/lib/supabase/server";
import { type Session, type User } from "@supabase/supabase-js";
import { type Database } from "../database.types";

type RolUsuario = Database["public"]["Enums"]["rol_usuario"];

// Definición de tipo para nuestro perfil de usuario interno
type UserProfile = {
  rol: RolUsuario;
  nombre_completo: string;
  miembro_id: string | null; // El ID de la tabla 'miembros'
  foto_url?: string | null;
  sociedad_id: string | null; // El ID de la sociedad a la que pertenece
};

type UserSession = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
};

/**
 * Obtiene la sesión, el usuario y el perfil completo del usuario.
 * Este perfil se construye combinando datos de 'profiles' (para el rol)
 * y 'miembros' (para la sociedad_id), vinculados a través del
 * usuario de 'auth'.
 */
export const getSessionInfo = async (): Promise<UserSession> => {
  const supabase = await createClient();

  // 1. Obtener el usuario seguro de auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      session: null,
      user: null,
      profile: null,
      error: userError.message,
    };
  }
  if (!user) {
    return { session: null, user: null, profile: null, error: "No user found" };
  }

  // 2. Obtener el perfil (Rol y Nombre) de 'profiles' usando el user.id
  const { data: profileInfo, error: profileInfoError } = await supabase
    .from("profiles")
    .select("rol, nombre_completo")
    .eq("id", user.id) // La FK de profiles es el user.id
    .single();

  if (profileInfoError) {
    return {
      session: null,
      user,
      profile: null,
      error: "Profile record not found.",
    };
  }

  if (!user.email) {
    return {
      session: null,
      user,
      profile: null,
      error: "El usuario no tiene un email asociado.",
    };
  }

  // 3. Obtener los datos de 'miembros' (ID y Sociedad) usando el user.email
  const { data: miembroData, error: miembroError } = await supabase
    .from("miembros")
    .select("id, sociedad_id")
    .eq("email", user.email) // El email es el único enlace a 'miembros'
    .single();

  if (miembroError) {
    // Es posible que un admin no sea un 'miembro' (ej. Super Admin)
    // Manejamos esto permitiendo que 'miembro_id' sea nulo
    console.warn(`No matching member record found for user: ${user.email}`);
  }

  // 4. Construir el objeto de perfil final
  const profile: UserProfile = {
    rol: profileInfo.rol,
    nombre_completo: profileInfo.nombre_completo,
    miembro_id: miembroData?.id || null,
    sociedad_id: miembroData?.sociedad_id || null,
  };

  return {
    session: null, // Ya no es necesario pasarlo
    user,
    profile,
    error: null,
  };
};
