// components/miembros/PaginationComponent.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationComponent({ pageCount }: { pageCount: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => replace(createPageURL(currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => replace(createPageURL(currentPage + 1))}
        disabled={currentPage >= pageCount}
      >
        Siguiente
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
