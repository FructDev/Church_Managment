import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Cumpleanero = {
  id: string;
  nombre: string;
  dia: number;
  edad: number;
};

export function BirthdayList({ list }: { list: Cumpleanero[] }) {
  const currentMonthName = new Date().toLocaleDateString("es-ES", {
    month: "long",
  });

  return (
    <Card className="h-full border-l-4 border-l-pink-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-pink-600 capitalize">
          <Cake className="h-5 w-5" /> Cumpleaños de {currentMonthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay cumpleaños registrados este mes.
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {list.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-lg bg-pink-50/50 hover:bg-pink-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-pink-100">
                    <span className="text-xs font-bold text-pink-400">DÍA</span>
                    <span className="text-sm font-bold text-gray-700">
                      {c.dia}
                    </span>
                  </div>
                  <span className="font-medium text-sm">{c.nombre}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white text-pink-600 border-pink-100"
                >
                  {c.edad} años
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
