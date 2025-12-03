// components/miembros/MiembrosFilters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SociedadSimple = { id: string; nombre: string };

export function MiembrosFilters({
  sociedades,
}: {
  sociedades: SociedadSimple[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    // --- ¡CORRECCIÓN! ---
    // Si el valor es 'all', borramos el parámetro.
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // --- FIN CORRECCIÓN ---

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <Input
        placeholder="Buscar por nombre..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
        className="flex-1 w-full"
      />
      {/* --- CORRECCIÓN en defaultValue y SelectItem --- */}
      <Select
        onValueChange={(value) => handleFilter("sociedadId", value)}
        defaultValue={searchParams.get("sociedadId") || "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todas las sociedades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las sociedades</SelectItem>
          {sociedades.map((s) => (
            <SelectItem key={s.id} value={s.id} className="capitalize">
              {s.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* --- CORRECCIÓN en defaultValue y SelectItem --- */}
      <Select
        onValueChange={(value) => handleFilter("estado", value)}
        defaultValue={searchParams.get("estado") || "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="inactivo">Inactivo</SelectItem>
          <SelectItem value="visitante">Visitante</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
