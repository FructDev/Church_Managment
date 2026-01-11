import { getConsolidationBoard } from "@/actions/ministerio/consolidationActions";
import { KanbanBoard } from "@/components/ministerio/consolidacion/KanbanBoard";
import { AddProspectDialog } from "@/components/ministerio/consolidacion/AddProspectDialog";
import { getSessionInfo } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { Users2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Consolidación | Sistema de Gestión",
    description: "Tablero de seguimiento de nuevos visitantes",
};

export default async function ConsolidationPage() {
    const { user } = await getSessionInfo();
    if (!user) redirect("/login");

    const prospects = await getConsolidationBoard();

    return (
        <div className="flex flex-col h-full space-y-6 p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Volver al Dashboard
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <Users2 className="h-7 w-7 text-primary" />
                        Consolidación y Seguimiento
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona el proceso de integración de nuevos visitantes.
                    </p>
                </div>
                <AddProspectDialog />
            </div>

            {/* Board */}
            <div className="flex-1 min-w-0 overflow-hidden relative">
                <KanbanBoard initialData={prospects} />
            </div>
        </div>
    );
}
