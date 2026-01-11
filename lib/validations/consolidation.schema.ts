import { z } from "zod";

export const prospectSchema = z.object({
    id: z.string().uuid().optional(),
    full_name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['nuevo', 'contactado', 'visita', 'doctrina', 'finalizado']).default('nuevo'),
    assigned_leader_id: z.string().uuid().optional().nullable(),
    notes: z.string().optional(),
});

export type ProspectFormValues = z.infer<typeof prospectSchema>;

export const updateStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['nuevo', 'contactado', 'visita', 'doctrina', 'finalizado']),
});

export const addNoteSchema = z.object({
    id: z.string().uuid(),
    notes: z.string(),
});
