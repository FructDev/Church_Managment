"use client";

import { Prospect } from "@/actions/ministerio/consolidationActions";
import { ProspectCard } from "./ProspectCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
    initialData: Prospect[];
}

const COLUMNS = [
    { id: "nuevo", label: "Nuevo Visitante", color: "bg-blue-500" },
    { id: "contactado", label: "Contactado", color: "bg-yellow-500" },
    { id: "visita", label: "Visita Realizada", color: "bg-purple-500" },
    { id: "doctrina", label: "En Doctrina", color: "bg-indigo-500" },
    { id: "finalizado", label: "Bautizado / Miembro", color: "bg-green-500" },
];

export function KanbanBoard({ initialData }: Props) {
    const getColumnData = (status: string) => {
        return initialData.filter((p) => p.status === status);
    };

    return (
        <div className="w-full h-full">
            {/* MOBILE VIEW (Tabs) */}
            <div className="md:hidden">
                <Tabs defaultValue="nuevo" className="w-full">
                    {/* Wrappers to force containment */}
                    <div className="w-full max-w-full overflow-x-auto pb-2 no-scrollbar">
                        <TabsList className="w-max flex justify-start p-1 bg-muted/50 mb-0">
                            {COLUMNS.map((col) => (
                                <TabsTrigger key={col.id} value={col.id} className="flex-shrink-0 text-xs px-3 py-1.5 h-auto">
                                    {col.label}
                                    <span className="ml-2 bg-slate-200 px-1.5 rounded-full text-[10px] text-slate-800">
                                        {getColumnData(col.id).length}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {COLUMNS.map((col) => {
                        const items = getColumnData(col.id);
                        return (
                            <TabsContent key={col.id} value={col.id} className="space-y-4 min-h-[50vh]">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                        <h3 className="font-semibold text-slate-800">{col.label}</h3>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {items.length} prospectos
                                    </Badge>
                                </div>

                                {items.length === 0 ? (
                                    <div className="h-32 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-sm text-center p-4">
                                        <span>Sin prospectos en esta etapa</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-20">
                                        {items.map((prospect) => (
                                            <ProspectCard key={prospect.id} prospect={prospect} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </div>

            {/* DESKTOP VIEW (Horizontal Scroll) */}
            <ScrollArea className="hidden md:block w-full max-w-full whitespace-nowrap rounded-md border bg-slate-50/50 p-4 min-h-[calc(100vh-200px)]">
                <div className="flex w-max space-x-4 pb-4">
                    {COLUMNS.map((col) => {
                        const items = getColumnData(col.id);
                        return (
                            <div key={col.id} className="w-[300px] sm:w-[350px] flex-shrink-0 flex flex-col gap-3">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-2 bg-white p-3 rounded-lg border shadow-sm sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                        <h3 className="font-semibold text-sm text-slate-700">{col.label}</h3>
                                    </div>
                                    <Badge variant="secondary" className="text-xs font-mono">
                                        {items.length}
                                    </Badge>
                                </div>

                                {/* Column Content */}
                                <div className="space-y-3 min-h-[100px]">
                                    {items.length === 0 ? (
                                        <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                                            Sin prospectos
                                        </div>
                                    ) : (
                                        items.map((prospect) => (
                                            <ProspectCard key={prospect.id} prospect={prospect} />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
