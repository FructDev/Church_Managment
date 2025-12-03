// components/forms/PasswordRecoveryForm.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordRecoverySchema,
  type PasswordRecoveryFormValues,
} from "@/lib/validations/auth.schema";
import { requestPasswordReset } from "@/actions/auth/requestPasswordReset";
import Link from "next/link";

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

export function PasswordRecoveryForm() {
  const [isPending, startTransition] = React.useTransition();
  const [formMessage, setFormMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<PasswordRecoveryFormValues>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: PasswordRecoveryFormValues) {
    setFormMessage(null);
    setIsSuccess(false);

    startTransition(async () => {
      const result = await requestPasswordReset(data);
      setFormMessage(result.message);
      if (result.success) {
        setIsSuccess(true);
        form.reset();
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingrese su email y le enviaremos un enlace para restablecer su
          contraseña.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Mensaje de éxito o error */}
            {formMessage && (
              <div
                className={`rounded-md border p-3 ${
                  isSuccess
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-destructive bg-destructive/10 text-destructive"
                }`}
              >
                <p className="text-sm">{formMessage}</p>
              </div>
            )}

            {!isSuccess && (
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
                        disabled={isPending}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar Enlace"}
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/login">Volver a Iniciar Sesión</Link>
              </Button>
            </CardFooter>
          )}
          {isSuccess && (
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Volver a Iniciar Sesión</Link>
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
