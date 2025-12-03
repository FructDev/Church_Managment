// app/(dashboard)/finanzas/diezmos/nuevo-lote/page.tsx
import { getSessionInfo } from "@/lib/auth/utils";

// La importación correcta viene de 'diaconosActions'
import { getMiembrosActivos } from "@/actions/estructura/diaconosActions";

import { DiezmoLoteForm } from "@/components/finanzas/diezmos/DiezmoLoteForm";

import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export default async function NuevoLoteDiezmoPage() {
  const { profile } = await getSessionInfo();
  // ...

  const canManage = ROLES_FINANCIEROS.includes(profile?.rol as any);

  if (!canManage) {
    return (
      <div className="w-full text-center">
        <p className="text-lg text-destructive">Acceso Denegado.</p>
      </div>
    );
  }

  const miembros = await getMiembrosActivos();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <DiezmoLoteForm miembros={miembros} />
    </div>
  );
}
