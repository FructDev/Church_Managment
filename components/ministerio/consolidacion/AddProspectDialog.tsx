"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProspect } from "@/actions/ministerio/consolidationActions";
import { prospectSchema } from "@/lib/validations/consolidation.schema";
import { Plus } from "lucide-react";

export function AddProspectDialog() {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof prospectSchema>>({
        resolver: zodResolver(prospectSchema) as any,
        defaultValues: {
            full_name: "",
            phone: "",
            address: "",
            status: "nuevo",
            notes: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof prospectSchema>) => {
        setIsSaving(true);
        try {
            const result = await createProspect(values);
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                form.reset();
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error al crear prospecto");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Prospecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Prospecto</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input id="full_name" {...form.register("full_name")} placeholder="Ej. Juan Pérez" />
                        {form.formState.errors.full_name && (
                            <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                        <Input id="phone" {...form.register("phone")} placeholder="+1 829..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" {...form.register("address")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas Iniciales</Label>
                        <Textarea id="notes" {...form.register("notes")} placeholder="Observaciones sobre la primera visita..." />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
