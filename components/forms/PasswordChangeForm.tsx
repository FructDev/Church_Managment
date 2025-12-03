// components/forms/PasswordChangeForm.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/lib/validations/auth.schema";
import { updatePassword } from "@/actions/auth/updatePassword";
import { useRouter } from "next/navigation";

// Componentes Shadcn
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PasswordChangeForm() {
  const [isPending, startTransition] = React.useTransition();
  const [formState, setFormState] = React.useState<{
    success: boolean;
    message: string | null;
  }>({
    success: false,
    message: null,
  });
  const router = useRouter();

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: PasswordChangeFormValues) {
    setFormState({ success: false, message: null });

    startTransition(async () => {
      // 1. CAMBIO: Enviamos el objeto 'data' completo,
      // que es lo que la nueva Server Action espera.
      const result = await updatePassword(data);
      setFormState(result);

      if (result.success) {
        form.reset();
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Establecer Nueva Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
        </CardDescription>
      </CardHeader>

      {/* 2. CAMBIO: Moví el <Form> para que envuelva toda la estructura */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Mensaje de éxito o error */}
            {formState.message && (
              <div
                className={`rounded-md border p-3 ${
                  formState.success
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-destructive bg-destructive/10 text-destructive"
                }`}
              >
                <p className="text-sm">{formState.message}</p>
              </div>
            )}

            {!formState.success && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          {/* Los CardFooter AHORA están DENTRO del <form> */}
          {!formState.success && (
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Contraseña"}
              </Button>
            </CardFooter>
          )}
          {formState.success && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Ir a Iniciar Sesión
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
