"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Prospect, updateProspect, deleteProspect } from "@/actions/ministerio/consolidationActions";
import { prospectSchema } from "@/lib/validations/consolidation.schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";

interface Props {
    prospect: Prospect;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProspectDialog({ prospect, open, onOpenChange }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof prospectSchema>>({
        resolver: zodResolver(prospectSchema) as any,
        defaultValues: {
            id: prospect.id,
            full_name: prospect.full_name,
            phone: prospect.phone || "",
            address: prospect.address || "",
            status: prospect.status,
            // assigned_leader_id: prospect.assigned_leader_id, // Necesitaríamos una lista de líderes para editar esto
            notes: prospect.notes || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof prospectSchema>) => {
        setIsSaving(true);
        try {
            const result = await updateProspect({ ...values, id: prospect.id });
            if (result.success) {
                toast.success(result.message);
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error al actualizar");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        try {
            const result = await deleteProspect(prospect.id);
            if (result.success) {
                toast.success("Prospecto eliminado");
                onOpenChange(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error al eliminar");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Prospecto</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input id="full_name" {...form.register("full_name")} />
                        {form.formState.errors.full_name && (
                            <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                        <Input id="phone" {...form.register("phone")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" {...form.register("address")} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Etapa Actual</Label>
                        <Select
                            defaultValue={prospect.status}
                            onValueChange={(val) => form.setValue("status", val as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una etapa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nuevo">Nuevo Visitante</SelectItem>
                                <SelectItem value="contactado">Contactado</SelectItem>
                                <SelectItem value="visita">Visita Realizada</SelectItem>
                                <SelectItem value="doctrina">En Doctrina</SelectItem>
                                <SelectItem value="finalizado">Finalizado / Bautizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas Pastorales</Label>
                        <Textarea id="notes" {...form.register("notes")} className="min-h-[100px]" />
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" disabled={isSaving}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente al prospecto de la base de datos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
