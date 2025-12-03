// components/finanzas/diezmos/DiezmosFilters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generamos los últimos 5 años
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export function DiezmosFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Sincroniza un filtro con la URL
  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
      // Si quitamos el mes, no tiene sentido dejar la quincena
      if (key === "month") {
        params.delete("fortnight");
      }
      // Si quitamos el año, quitamos todo lo demás
      if (key === "year") {
        params.delete("month");
        params.delete("fortnight");
      }
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const yearValue = searchParams.get("year") || "all";
  const monthValue = searchParams.get("month") || "all";
  const fortnightValue = searchParams.get("fortnight") || "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtro de Año */}
      <Select
        onValueChange={(value) => handleFilter("year", value)}
        defaultValue={yearValue}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por Año" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Años</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Mes (solo si hay año) */}
      <Select
        onValueChange={(value) => handleFilter("month", value)}
        defaultValue={monthValue}
        disabled={yearValue === "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Meses</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Quincena (solo si hay mes) */}
      <Select
        onValueChange={(value) => handleFilter("fortnight", value)}
        defaultValue={fortnightValue}
        disabled={monthValue === "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por Quincena" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Ambas Quincenas</SelectItem>
          <SelectItem value="primera_quincena">1ra Quincena</SelectItem>
          <SelectItem value="segunda_quincena">2da Quincena</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
