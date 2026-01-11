"use client";

import { Prospect, updateProspectStatus } from "@/actions/ministerio/consolidationActions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, User, MoreVertical, ArrowRight, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { EditProspectDialog } from "./EditProspectDialog";

interface Props {
    prospect: Prospect;
}

const statusColors: Record<string, string> = {
    nuevo: "bg-blue-100 text-blue-800 border-blue-200",
    contactado: "bg-yellow-100 text-yellow-800 border-yellow-200",
    visita: "bg-purple-100 text-purple-800 border-purple-200",
    doctrina: "bg-indigo-100 text-indigo-800 border-indigo-200",
    finalizado: "bg-green-100 text-green-800 border-green-200",
};

const statusLabels: Record<string, string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    visita: "Visita Realizada",
    doctrina: "En Doctrina",
    finalizado: "Finalizado",
};

export function ProspectCard({ prospect }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === prospect.status) return;
        setIsUpdating(true);
        try {
            const result = await updateProspectStatus(prospect.id, newStatus);
            if (result.success) {
                toast.success("Estado actualizado");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error al actualizar");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Card className="shadow-sm hover:shadow-md transition-shadow relative group">
                <CardContent className="p-3 space-y-3">
                    {/* Header: Name and Menu */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-sm line-clamp-2 leading-tight">
                            {prospect.full_name}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    Editar detalles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Mover a...</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={prospect.status} onValueChange={handleStatusChange}>
                                            {Object.entries(statusLabels).map(([key, label]) => (
                                                <DropdownMenuRadioItem key={key} value={key}>
                                                    {label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Contact Info */}
                    {prospect.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${prospect.phone}`} className="hover:underline">
                                {prospect.phone}
                            </a>
                        </div>
                    )}

                    {/* Leader Info */}
                    <div className="flex items-center gap-2 pt-1">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={prospect.leader?.avatar_url || undefined} />
                            <AvatarFallback className="text-[9px]">
                                {prospect.leader?.full_name?.substring(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {prospect.leader?.full_name || "Sin líder"}
                        </span>
                    </div>

                    {/* Notes Preview */}
                    {prospect.notes && (
                        <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground italic line-clamp-2">
                            <span className="mr-1">
                                <FileText className="inline h-3 w-3 align-text-bottom" />
                            </span>
                            {prospect.notes}
                        </div>
                    )}
                </CardContent>
                {/* Footer color strip based on status (optional visual cue) */}
                <div className={`h-1 w-full rounded-b ${statusColors[prospect.status].split(" ")[0].replace("bg-", "bg-opacity-50 bg-")}`} />
            </Card>

            <EditProspectDialog
                prospect={prospect}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
