"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

export function FinanzasFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentMonth = new Date().getMonth().toString();
    const currentYear = new Date().getFullYear().toString();

    const monthParam = searchParams.get("month") || currentMonth;
    const yearParam = searchParams.get("year") || currentYear;

    const months = [
        { value: "0", label: "Enero" },
        { value: "1", label: "Febrero" },
        { value: "2", label: "Marzo" },
        { value: "3", label: "Abril" },
        { value: "4", label: "Mayo" },
        { value: "5", label: "Junio" },
        { value: "6", label: "Julio" },
        { value: "7", label: "Agosto" },
        { value: "8", label: "Septiembre" },
        { value: "9", label: "Octubre" },
        { value: "10", label: "Noviembre" },
        { value: "11", label: "Diciembre" },
    ];

    const years = Array.from({ length: 11 }, (_, i) => {
        const year = new Date().getFullYear() - 5 + i;
        return { value: year.toString(), label: year.toString() };
    });

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/finanzas");
    };

    return (
        <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border shadow-sm mb-6">
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none">Mes</label>
                <Select
                    value={monthParam}
                    onValueChange={(val) => updateFilters("month", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none">Año</label>
                <Select
                    value={yearParam}
                    onValueChange={(val) => updateFilters("year", val)}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                                {y.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end pt-5">
                {(searchParams.get("month") || searchParams.get("year")) && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpiar filtros">
                        <FilterX className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
