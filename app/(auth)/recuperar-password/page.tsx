// app/(auth)/recuperar-password/page.tsx
import { PasswordRecoveryForm } from "@/components/forms/PasswordRecoveryForm";

export default function PasswordRecoveryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <PasswordRecoveryForm />
    </div>
  );
}
