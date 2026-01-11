"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prospectSchema, ProspectFormValues } from "@/lib/validations/consolidation.schema";
import { getSessionInfo } from "@/lib/auth/utils";

// Definición de tipos para el tablero
export type Prospect = {
    id: string;
    full_name: string;
    phone: string | null;
    address: string | null;
    status: 'nuevo' | 'contactado' | 'visita' | 'doctrina' | 'finalizado';
    assigned_leader_id: string | null;
    notes: string | null;
    created_at: string;
    leader?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

export async function getConsolidationBoard(): Promise<Prospect[]> {
    const supabase = await createClient();

    // Aggressive cast to avoid TS recursion
    const { data, error } = await (supabase as any)
        .from("consolidation_prospects")
        .select(`
      *,
      leader:profiles!assigned_leader_id (
        full_name,
        avatar_url
      )
    `)
        .order("created_at", { ascending: false });

    if (error) {
        // console.error("Error fetching prospects:", error);
        return [];
    }

    // Mapeamos para aplanar la estructura si es necesario, 
    // aunque Supabase devuelve leader como objeto anidado que nos sirve muy bien.
    return data as unknown as Prospect[];
}

export async function createProspect(data: ProspectFormValues) {
    const { user } = await getSessionInfo();
    if (!user) return { success: false, message: "No autorizado" };

    const supabase = await createClient();
    const validated = prospectSchema.safeParse(data);

    if (!validated.success) {
        return { success: false, message: "Datos inválidos" };
    }

    const { error } = await (supabase as any)
        .from("consolidation_prospects")
        .insert(validated.data);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath("/ministerio/consolidacion");
    return { success: true, message: "Prospecto creado correctamente" };
}

export async function updateProspectStatus(id: string, newStatus: string) {
    const { user } = await getSessionInfo();
    if (!user) return { success: false, message: "No autorizado" };

    const supabase = await createClient();

    const { error } = await (supabase as any)
        .from("consolidation_prospects")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath("/ministerio/consolidacion");
    return { success: true, message: "Estado actualizado" };
}

export async function updateProspect(data: ProspectFormValues) {
    const { user } = await getSessionInfo();
    if (!user) return { success: false, message: "No autorizado" };

    const supabase = await createClient();
    const validated = prospectSchema.safeParse(data);

    if (!validated.success) {
        return { success: false, message: "Datos inválidos" };
    }

    if (!data.id) return { success: false, message: "ID requerido para actualizar" };

    const { id, ...updateData } = validated.data;

    const { error } = await (supabase as any)
        .from("consolidation_prospects")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath("/ministerio/consolidacion");
    return { success: true, message: "Prospecto actualizado correctamente" };
}

export async function deleteProspect(id: string) {
    const { user } = await getSessionInfo();
    if (!user) return { success: false, message: "No autorizado" };

    const supabase = await createClient();

    const { error } = await (supabase as any)
        .from("consolidation_prospects")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath("/ministerio/consolidacion");
    return { success: true, message: "Prospecto eliminado" };
}
