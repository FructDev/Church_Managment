// components/forms/LoginForm.tsx
"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";
import { signIn } from "@/actions/auth/signIn";
import Link from "next/link";
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

export function LoginForm() {
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await signIn(data);
      if (!result.success) {
        setFormError(result.message);
      }
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">¡Bienvenido!</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              </div>
            )}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel htmlFor="password">Contraseña</FormLabel>
                <Link
                  href="/recuperar-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                )}
              />
              <FormMessage className="pt-1">
                {form.formState.errors.password?.message}
              </FormMessage>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
