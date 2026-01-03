/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/miembros/miembrosActions.ts
"use server";

import { checkPermission } from "@/lib/auth/guards";
import { getSessionInfo } from "@/lib/auth/utils";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import {
  miembroSchema,
  type MiembroFormValues,
} from "@/lib/validations/miembros.schema";
import { revalidatePath } from "next/cache";
import {
  ROLES_CONSULTA,
  ROLES_ADMINISTRATIVOS,
  ROLES_JERARQUIA_NO_FINANCIERA,
} from "@/lib/auth/roles";

type MiembroInsert = Database["public"]["Tables"]["miembros"]["Insert"];

export type MiembroDetalle = Database["public"]["Tables"]["miembros"]["Row"] & {
  sociedad: {
    nombre: string;
  } | null;
  historial_cargos: {
    cargo_nombre: string;
    fecha_inicio: string;
    fecha_fin: string | null;
  }[];
  cargos_activos: {
    tipo: string;
    nombre: string;
  }[];
  fecha_conversion?: string | null
  rango_ministerial?: string | null
};

// Tipo para la lista de miembros
// Tipo para la lista de miembros
export type MiembroConSociedad = Database["public"]["Tables"]["miembros"]["Row"] & {
  sociedad: {
    id: string;
    nombre: string;
  } | null;
  fecha_conversion?: string | null;
  rango_ministerial?: string | null;
};

// Tipo para los filtros
type GetMiembrosParams = {
  query?: string;
  sociedadId?: string;
  estado?: string;
  page?: number;
  pageSize?: number;
};

export type MiembroDirectorio = {
  nombre_completo: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
};

type EstadoMembresia = Database["public"]["Enums"]["estado_membresia"];

// 3. Crear un "Type Guard" para validar el string
const isEstadoMembresia = (value: string): value is EstadoMembresia => {
  return ["activo", "inactivo", "visitante"].includes(value);
};

/**
 * Obtiene una lista paginada y filtrada de miembros.
 * (CORREGIDO: Trae todas las columnas para permitir edición completa)
 */
export async function getMiembros(
  params: GetMiembrosParams
): Promise<{ data: MiembroConSociedad[]; count: number }> {
  // Solo roles autorizados pueden ver la lista
  await checkPermission(ROLES_ADMINISTRATIVOS);

  const supabase = await createClient();
  const { query, sociedadId, estado, page = 1, pageSize = 10 } = params;

  // --- CAMBIO CLAVE AQUÍ ---
  // Usamos '*' para traer todo el perfil del miembro.
  // Esto evita que al editar se borren datos que no habíamos traído antes.
  let queryBuilder = supabase.from("miembros").select(
    `
      *, 
      sociedad: sociedades (id, nombre)
    `,
    { count: "exact" }
  );
  // -------------------------

  // 1. Filtro por Búsqueda (query)
  if (query) {
    queryBuilder = queryBuilder.ilike("nombre_completo", `%${query}%`);
  }

  // 2. Filtro por Sociedad
  if (sociedadId) {
    queryBuilder = queryBuilder.eq("sociedad_id", sociedadId);
  }

  // 3. Filtro por Estado
  if (estado && isEstadoMembresia(estado)) {
    queryBuilder = queryBuilder.eq("estado_membresia", estado);
  }

  // 4. Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  queryBuilder = queryBuilder.range(from, to);

  // 5. Orden
  queryBuilder = queryBuilder.order("nombre_completo");

  const { data, error, count } = await queryBuilder;

  if (error) {
    console.error("Error al obtener miembros:", error.message);
    return { data: [], count: 0 };
  }

  // Casteamos a 'any' primero para que TypeScript no se queje de que 
  // estamos devolviendo más campos de los que tiene el tipo 'MiembroConSociedad' básico.
  return { data: data as any[], count: count || 0 };
}

/**
 * Obtiene una lista simple de sociedades para los filtros.
 */
export async function getSociedadesList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sociedades")
    .select("id, nombre")
    .eq("activo", true);

  if (error) return [];
  return data;
}

export async function upsertMiembro(formData: FormData) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const { user } = await getSessionInfo();
  if (!user) return { success: false, message: "No autorizado." };

  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const comprobanteFile = formData.get("avatar_file") as File | null;

  const validatedFields = miembroSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { id, ...miembroData } = validatedFields.data;

  // A. LIMPIEZA DE DATOS
  // Aseguramos que el email sea null si está vacío o indefinido
  const cleanEmail =
    miembroData.email && miembroData.email.trim() !== ""
      ? miembroData.email
      : null;

  // B. VALIDACIÓN DE EMAIL ÚNICO (ROBUSTA)
  if (cleanEmail) {
    // Construimos la consulta
    let query = supabase.from("miembros").select("id").eq("email", cleanEmail);

    // Si estamos editando, excluimos al propio miembro de la búsqueda
    if (id) {
      query = query.neq("id", id);
    }

    // Usamos .maybeSingle() -> Devuelve null si no existe (éxito), o datos si existe (error)
    const { data: existingEmail, error: queryError } =
      await query.maybeSingle();

    if (existingEmail) {
      return {
        success: false,
        message: "El correo electrónico ya está registrado por otro miembro.",
      };
    }
  }
  // --- FIN VALIDACIÓN ---

  // C. SUBIDA DE AVATAR
  let fotoUrl: string | null = null;
  if (id) {
    const { data: current } = await supabase
      .from("miembros")
      .select("foto_url")
      .eq("id", id)
      .single();
    fotoUrl = current?.foto_url || null;
  }

  if (comprobanteFile && comprobanteFile.size > 0) {
    const fileExt = comprobanteFile.name.split(".").pop();
    const fileName = `${id || crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`; // Nombre simple en la raíz o carpeta

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, comprobanteFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      fotoUrl = publicUrlData.publicUrl;
    }
  }

  // D. PREPARAR OBJETO
  const dataToUpsert: MiembroInsert = {
    nombre_completo: miembroData.nombre_completo,
    email: cleanEmail, // Usamos el email limpio
    telefono: miembroData.telefono || null,
    telefono_secundario: miembroData.telefono_secundario || null,
    direccion: miembroData.direccion || null,
    fecha_nacimiento: miembroData.fecha_nacimiento || null,
    estado_civil: miembroData.estado_civil || null,
    profesion: miembroData.profesion || null,
    fecha_ingreso_congregacion: miembroData.fecha_ingreso_congregacion || null,
    sociedad_id:
      miembroData.sociedad_id === "null" ? null : miembroData.sociedad_id,
    estado_membresia: miembroData.estado_membresia,
    notas: miembroData.notas || null,
    foto_url: fotoUrl,
    es_bautizado: miembroData.es_bautizado,
  };

  // E. GUARDAR
  let error;
  if (id) {
    ({ error } = await supabase
      .from("miembros")
      .update(dataToUpsert)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("miembros").insert(dataToUpsert));
  }

  if (error) {
    // Capturamos error de unique constraint por si acaso falla la validación manual
    if (error.code === "23505") {
      return {
        success: false,
        message: "El correo electrónico ya existe en la base de datos.",
      };
    }
    return { success: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/miembros");
  if (id) revalidatePath(`/miembros/${id}`);
  return {
    success: true,
    message: `Miembro ${id ? "actualizado" : "creado"} con éxito.`,
  };
}

/**
 * Elimina un miembro.
 */
export async function deleteMiembro(id: string) {
  await checkPermission(ROLES_JERARQUIA_NO_FINANCIERA);

  const supabase = await createClient();
  const { error } = await supabase.from("miembros").delete().eq("id", id);

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` };
  }

  revalidatePath("/miembros");
  return { success: true, message: "Miembro eliminado." };
}

/**
 * Obtiene los detalles completos de un solo miembro por su ID.
 * (Versión actualizada que busca cargos activos)
 */
export async function getMiembroById(
  id: string
): Promise<MiembroDetalle | null> {
  await checkPermission(ROLES_CONSULTA);

  const supabase = await createClient();

  // 1. Obtenemos el miembro y su historial (cargos inactivos)
  const { data, error } = await supabase
    .from("miembros")
    .select(
      `
      *,
      sociedad: sociedades ( nombre ),
      historial_cargos (
        cargo_nombre,
        fecha_inicio,
        fecha_fin
      )
    `
    )
    .eq("id", id)
    .order("fecha_inicio", {
      foreignTable: "historial_cargos",
      ascending: false,
    })
    .single();

  if (error) {
    console.error("Error al obtener detalle de miembro:", error.message);
    return null;
  }

  // 2. Buscamos cargos ACTIVOS en paralelo
  const [liderazgo, diacono, directivas, comites] = await Promise.all([
    // Liderazgo
    supabase
      .from("liderazgo")
      .select("cargo")
      .eq("miembro_id", id)
      .eq("activo", true),
    // Diáconos
    supabase
      .from("diaconos")
      .select("id")
      .eq("miembro_id", id)
      .eq("activo", true),
    // Directivas de Sociedad
    supabase
      .from("directivas_sociedades")
      .select("cargo, sociedad:sociedades(nombre)")
      .eq("miembro_id", id)
      .eq("activo", true),
    // Comités
    supabase
      .from("miembros_comites")
      .select("comite:comites(nombre)")
      .eq("miembro_id", id)
      .eq("activo", true),
  ]);

  // 3. Construimos el array de cargos activos
  const cargos_activos: { tipo: string; nombre: string }[] = [];

  liderazgo.data?.forEach((c) =>
    cargos_activos.push({ tipo: "Liderazgo", nombre: c.cargo })
  );
  diacono.data?.forEach(() =>
    cargos_activos.push({ tipo: "Servicio", nombre: "Diácono" })
  );

  directivas.data?.forEach((d: any) =>
    cargos_activos.push({
      tipo: `Directiva ${d.sociedad.nombre}`,
      nombre: d.cargo,
    })
  );

  comites.data?.forEach((c: any) =>
    cargos_activos.push({
      tipo: "Comité",
      nombre: c.comite.nombre,
    })
  );

  // 4. Devolvemos el objeto completo
  return { ...data, cargos_activos } as MiembroDetalle;
}

/**
 * Obtiene TODOS los miembros (sin paginar) para exportar.
 * Solo incluye los campos necesarios para el CSV.
 */
export async function getMiembrosParaExportar() {
  // Solo admin puede exportar
  await checkPermission(ROLES_ADMINISTRATIVOS);

  const supabase = await createClient();

  // Hacemos una consulta específica para la exportación
  const { data, error } = await supabase
    .from("miembros")
    .select(
      `
      nombre_completo,
      email,
      telefono,
      telefono_secundario,
      direccion,
      fecha_nacimiento,
      estado_civil,
      profesion,
      fecha_ingreso_congregacion,
      estado_membresia,
      sociedad: sociedades ( nombre )
    `
    )
    .order("nombre_completo");

  if (error) {
    console.error("Error al exportar miembros:", error.message);
    return { success: false, data: null, error: error.message };
  }

  // Transformamos los datos para que sean planos (flat)
  const flatData = data.map((m) => ({
    "Nombre Completo": m.nombre_completo,
    Email: m.email,
    Teléfono: m.telefono,
    "Tel. Secundario": m.telefono_secundario,
    Dirección: m.direccion,
    "Fecha de Nacimiento": m.fecha_nacimiento,
    "Estado Civil": m.estado_civil,
    Profesión: m.profesion,
    "Fecha de Ingreso": m.fecha_ingreso_congregacion,
    Estado: m.estado_membresia,
    Sociedad: m.sociedad?.nombre || "N/A", // Aplanamos la sociedad
  }));

  return { success: true, data: flatData, error: null };
}

/**
 * Obtiene TODOS los miembros ACTIVOS para el directorio PDF.
 * Ahora devuelve un objeto de respuesta estándar.
 */
export async function getMiembrosParaDirectorio(): Promise<{
  success: boolean;
  data: MiembroDirectorio[] | null;
  error: string | null;
}> {
  try {
    await checkPermission(ROLES_ADMINISTRATIVOS);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("miembros")
      .select(
        `
        nombre_completo,
        telefono,
        email,
        direccion
      `
      )
      .eq("estado_membresia", "activo")
      .order("nombre_completo");

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: data, error: null };
  } catch (error) {
    console.error(
      "Error al obtener datos para directorio:",
      (error as Error).message
    );
    return { success: false, data: null, error: (error as Error).message };
  }
}
