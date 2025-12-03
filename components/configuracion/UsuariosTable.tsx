/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUsuarioRol } from "@/actions/configuracion/configuracionActions";
import { toast } from "sonner";
import { UsuarioGridCard } from "./UsuarioGridCard";

const roles = [
  { val: "admin", label: "Administrador" },
  { val: "tesorero", label: "Tesorero" },
  { val: "secretario_sociedad", label: "Secretario" },
  { val: "miembro_comite", label: "Miembro Comité" },
  { val: "consulta", label: "Solo Lectura" },
  { val: "usuario", label: "Sin Acceso" },
];

export function UsuariosTable({ usuarios }: { usuarios: any[] }) {
  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUsuarioRol(userId, newRole);
    if (res.success) toast.success(`Rol actualizado a ${newRole}`);
    else toast.error("Error al actualizar");
  };

  return (
    <div className="w-full space-y-4">
      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.nombre_completo}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="w-[200px]">
                  <Select
                    defaultValue={user.rol}
                    onValueChange={(val) => handleRoleChange(user.id, val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.val} value={r.val}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* VISTA MÓVIL (GRID DE TARJETAS) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {usuarios.map((user) => (
          <UsuarioGridCard key={user.id} user={user} />
        ))}
        {usuarios.length === 0 && (
          <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
            No se encontraron usuarios.
          </div>
        )}
      </div>
    </div>
  );
}
