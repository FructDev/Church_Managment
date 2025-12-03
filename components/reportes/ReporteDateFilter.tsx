"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";

export function ReporteDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Defaults: Inicio de año y Hoy
  const defaultStart =
    searchParams.get("start") || `${new Date().getFullYear()}-01-01`;
  const defaultEnd =
    searchParams.get("end") || new Date().toISOString().split("T")[0];

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.set("start", start);
    params.set("end", end);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white p-2 rounded-md border">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-muted-foreground w-12 sm:w-auto">Desde:</span>
        <Input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full sm:w-auto h-8"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-muted-foreground w-12 sm:w-auto">Hasta:</span>
        <Input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full sm:w-auto h-8"
        />
      </div>
      <Button size="sm" onClick={handleFilter} className="w-full sm:w-auto mt-2 sm:mt-0">
        <Search className="h-4 w-4 mr-2" /> Filtrar
      </Button>
    </div>
  );
}
