"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Importamos el Schema y la Acción
import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/lib/validations/configuracion.schema";
import { createUserForMember } from "@/actions/configuracion/userManagementActions";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { KeyRound } from "lucide-react";

interface Props {
  miembro: { id: string; nombre_completo: string; email: string | null };
  children: React.ReactNode;
}

// --- LISTA DE ROLES ACTUALIZADA ---
const roles = [
  {
    group: "Alta Dirección",
    items: [
      { val: "pastor", label: "Pastor" },
      { val: "co_pastor", label: "Co-Pastor" },
      { val: "secretario_general", label: "Secretario General" },
      { val: "admin", label: "Administrador del Sistema" },
    ],
  },
  {
    group: "Finanzas",
    items: [
      { val: "tesorero_general", label: "Tesorero General" },
      { val: "tesorero", label: "Tesorero (Auxiliar)" },
    ],
  },
  {
    group: "Liderazgo de Sociedad",
    items: [
      { val: "presidente_sociedad", label: "Presidente de Sociedad" },
      { val: "secretario_sociedad", label: "Secretario de Sociedad" },
      { val: "tesorero_sociedad", label: "Tesorero de Sociedad" },
    ],
  },
  {
    group: "Operativo",
    items: [
      { val: "miembro_comite", label: "Líder / Comité" },
      { val: "consulta", label: "Solo Lectura" },
    ],
  },
];

export function GrantAccessDialog({ miembro, children }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      miembro_id: miembro.id,
      nombre_completo: miembro.nombre_completo,
      email: miembro.email || "",
      password: "",
      rol: "consulta",
    },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    startTransition(async () => {
      const res = await createUserForMember(data);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dar Acceso al Sistema</DialogTitle>
          <DialogDescription>
            Crear credenciales para <strong>{miembro.nombre_completo}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico (Usuario)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Temporal</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: iglesia2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol de Acceso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Renderizamos por Grupos para mayor orden */}
                      {roles.map((group) => (
                        <SelectGroup key={group.group}>
                          <SelectLabel>{group.group}</SelectLabel>
                          {group.items.map((r) => (
                            <SelectItem key={r.val} value={r.val}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              <KeyRound className="mr-2 h-4 w-4" />
              {isPending ? "Creando Usuario..." : "Crear Acceso"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
