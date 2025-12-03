// components/ui/ConfirmAlertDialog.tsx
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { Button, type ButtonProps } from "@/components/ui/button";

interface ConfirmAlertDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode; // El botón que abre el diálogo
}

export function ConfirmAlertDialog({
  title,
  description,
  onConfirm,
  confirmText = "Continuar",
  cancelText = "Cancelar",
  children,
}: ConfirmAlertDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleAction = () => {
    startTransition(() => {
      onConfirm();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isPending}>
            {isPending ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
