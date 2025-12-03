/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateUsuarioRol } from "@/actions/configuracion/configuracionActions";
import { toast } from "sonner";
import { User, Mail, Shield } from "lucide-react";

const roles = [
    { val: "admin", label: "Administrador" },
    { val: "tesorero", label: "Tesorero" },
    { val: "secretario_sociedad", label: "Secretario" },
    { val: "miembro_comite", label: "Miembro Comité" },
    { val: "consulta", label: "Solo Lectura" },
    { val: "usuario", label: "Sin Acceso" },
];

export function UsuarioGridCard({ user }: { user: any }) {
    const handleRoleChange = async (newRole: string) => {
        const res = await updateUsuarioRol(user.id, newRole);
        if (res.success) toast.success(`Rol actualizado a ${newRole}`);
        else toast.error("Error al actualizar");
    };

    const getRoleLabel = (roleVal: string) => {
        return roles.find((r) => r.val === roleVal)?.label || roleVal;
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300">
            <CardContent className="flex flex-col p-5 gap-3">
                {/* Header: Nombre y Email */}
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-lg truncate">
                            {user.nombre_completo}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Rol Selector */}
                <div className="mt-2 pt-3 border-t border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Rol Asignado</span>
                    </div>
                    <Select defaultValue={user.rol} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar Rol" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((r) => (
                                <SelectItem key={r.val} value={r.val}>
                                    {r.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Current Role Badge (Visual Indicator) */}
                <div className="mt-1">
                    <Badge variant="outline" className="w-full justify-center py-1">
                        Actual: {getRoleLabel(user.rol)}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
