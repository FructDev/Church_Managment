/* eslint-disable @typescript-eslint/no-unused-vars */
// components/miembros/MiembroFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  miembroSchema,
  type MiembroFormValues,
} from "@/lib/validations/miembros.schema";
import { upsertMiembro } from "@/actions/miembros/miembrosActions";
import { type MiembroDetalle, type MiembroConSociedad } from "@/actions/miembros/miembrosActions";
import Image from "next/image";

// Componentes Shadcn
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

type SociedadSimple = { id: string; nombre: string };
type EstadoMembresia = "activo" | "inactivo" | "visitante";
type EstadoCivil = "soltero" | "casado" | "viudo" | "divorciado";

interface MiembroFormDialogProps {
  mode: "add" | "edit";
  miembro?: MiembroDetalle | MiembroConSociedad;
  sociedades: SociedadSimple[];
  children: React.ReactNode;
}

const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export function MiembroFormDialog({
  mode,
  miembro,
  sociedades,
  children,
}: MiembroFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    miembro?.foto_url || null
  );

  const formRef = React.useRef<HTMLFormElement>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split("T")[0]
  }

  const form = useForm({
    resolver: zodResolver(miembroSchema),
    defaultValues: {
      id: miembro?.id || null,
      nombre_completo: miembro?.nombre_completo || "",
      email: miembro?.email || "",
      telefono: miembro?.telefono || "",
      telefono_secundario: miembro?.telefono_secundario || "",
      direccion: miembro?.direccion || "",

      // Fechas: Usamos el helper o formateo directo para asegurar YYYY-MM-DD
      fecha_nacimiento: formatDate(miembro?.fecha_nacimiento),
      fecha_ingreso_congregacion: formatDate(miembro?.fecha_ingreso_congregacion),
      // --- ¡NUEVO CAMPO! ---
      fecha_conversion: formatDate(miembro?.fecha_conversion),

      estado_civil: (miembro?.estado_civil as any) || null,
      profesion: miembro?.profesion || "",

      // Lógica robusta: Intenta leer del objeto 'sociedad' primero, luego del ID plano
      sociedad_id: miembro?.sociedad_id || "null",

      estado_membresia: (miembro?.estado_membresia as any) || "activo",

      // --- ¡NUEVO CAMPO! ---
      rango_ministerial: (miembro?.rango_ministerial as any) || "ninguno",

      notas: miembro?.notas || "",

      // Booleanos: Usar ?? es vital para que no tome 'false' como 'vacío'
      es_bautizado: miembro?.es_bautizado ?? false,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(miembro?.foto_url || null);
    }
  };

  const handleFormAction = (formData: FormData) => {
    setError(null);

    form.trigger().then((isValid) => {
      if (!isValid) {
        setError("Por favor revise los campos marcados en rojo.");
        return;
      }

      startTransition(async () => {
        const result = await upsertMiembro(formData);
        if (result.success) {
          setOpen(false);
        } else {
          setError(result.message);
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Añadir Miembro" : "Editar Miembro"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Complete los datos del nuevo miembro."
              : `Editando a ${miembro?.nombre_completo}`}
          </DialogDescription>
        </DialogHeader>

        {/* Usamos <Form> de RHF para el 'control' y 'trigger' */}
        <Form {...form}>
          <form
            ref={formRef}
            action={handleFormAction}
            className="space-y-4 overflow-y-auto max-h-[75vh] p-1 pr-3"
          >
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            {miembro?.id && (
              <input type="hidden" name="id" value={miembro.id} />
            )}

            {/* --- ¡INICIO DE CORRECCIÓN! --- */}
            {/* Este bloque ya no es un <FormField> */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-medium">Cambiar</span>
                </div>
                <Input
                  id="avatar_file"
                  type="file"
                  name="avatar_file" // Nombre para FormData
                  accept="image/png, image/jpeg"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <Label
                  htmlFor="avatar_file"
                  className="text-base font-semibold"
                >
                  Foto de Perfil
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sube una foto clara del miembro. Se recomienda formato cuadrado
                  (PNG o JPG).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 relative overflow-hidden"
                  type="button"
                >
                  <Input
                    id="avatar_file_btn"
                    type="file"
                    name="avatar_file_dummy"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  Seleccionar Archivo
                </Button>
              </div>
            </div>
            {/* --- FIN DE CORRECCIÓN! --- */}

            {/* --- SECCIÓN 1: PRINCIPAL --- */}
            <h4 className="text-sm font-semibold text-primary">
              Información Principal
            </h4>
            <FormField
              control={form.control}
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    {/* Añadimos 'name' para FormData */}
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                      name="nombre_completo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estado_membresia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    {/* Añadimos 'name' para FormData */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name="estado_membresia"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sociedad_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sociedad</FormLabel>
                    {/* Añadimos 'name' para FormData */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "null"}
                      name="sociedad_id"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ninguna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">-- Ninguna --</SelectItem>
                        {sociedades.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="capitalize"
                          >
                            {s.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- SECCIÓN 2: CONTACTO --- */}
            <h4 className="text-sm font-semibold text-primary pt-4">
              Información de Contacto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@ejemplo.com"
                        {...field}
                        name="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="809-555-1234"
                        {...field}
                        name="telefono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono_secundario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (Secundario)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="809-555-5678"
                        {...field}
                        name="telefono_secundario"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle Ficticia #123..."
                      {...field}
                      name="direccion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- SECCIÓN 3: PERSONAL --- */}
            <h4 className="text-sm font-semibold text-primary pt-4">
              Información Personal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha_nacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                        name="fecha_nacimiento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado_civil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                      name="estado_civil"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="soltero">Soltero(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="viudo">Viudo(a)</SelectItem>
                        <SelectItem value="divorciado">
                          Divorciado(a)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profesion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesión</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Doctor, Maestro..."
                        {...field}
                        name="profesion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_ingreso_congregacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                        name="fecha_ingreso_congregacion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="es_bautizado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/20 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Miembro Bautizado</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marcar si esta persona ya ha tomado el bautismo en aguas.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* --- SECCIÓN 4: NOTAS --- */}
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Privado)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas confidenciales sobre el miembro..."
                      className="resize-none"
                      {...field}
                      name="notas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              {/*
                Este botón ya no es 'type="submit"'. 
                Usamos 'onClick' para disparar RHF primero.
              */}
              <Button
                type="button"
                onClick={() => formRef.current?.requestSubmit()} // Dispara el 'action' del formulario
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
