/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { updateConfiguracion } from "@/actions/configuracion/configuracionActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function CongregacionForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      nombre_iglesia: initialData?.nombre_iglesia || "",
      direccion: initialData?.direccion || "",
      telefono: initialData?.telefono || "",
      email_contacto: initialData?.email_contacto || "",
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    // Manejo manual del file input si fuera necesario, o usar un input controlado
    // Por simplicidad aquí, asumimos que el input file tiene name="logo_file"
    const fileInput = document.querySelector(
      'input[name="logo_file"]'
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("logo_file", fileInput.files[0]);
    }

    startTransition(async () => {
      const res = await updateConfiguracion(formData);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Logo Preview */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={initialData?.logo_url} />
              <AvatarFallback>LOGO</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label>Logo de la Iglesia</Label>
              <Input type="file" name="logo_file" accept="image/*" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre de la Iglesia</Label>
            <Input {...register("nombre_iglesia")} />
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input {...register("direccion")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input {...register("telefono")} />
            </div>
            <div className="space-y-2">
              <Label>Email de Contacto</Label>
              <Input {...register("email_contacto")} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
