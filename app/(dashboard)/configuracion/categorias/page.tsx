import { getTodasCategorias } from "@/actions/configuracion/configuracionActions";
import { CategoriasList } from "@/components/configuracion/CategoriasList";
import { CategoriaFormDialog } from "@/components/configuracion/CategoriaFormDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

export default async function CategoriasPage() {
  const [ingresos, egresos] = await Promise.all([
    getTodasCategorias("ingreso"),
    getTodasCategorias("egreso"),
  ]);

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Categorías Financieras</h1>

      <Tabs defaultValue="ingresos" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Egresos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ingresos" className="space-y-4">
          <div className="flex justify-end">
            <CategoriaFormDialog tipo="ingreso" mode="add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Categoría
              </Button>
            </CategoriaFormDialog>
          </div>
          <CategoriasList data={ingresos} tipo="ingreso" />
        </TabsContent>

        <TabsContent value="egresos" className="space-y-4">
          <div className="flex justify-end">
            <CategoriaFormDialog tipo="egreso" mode="add">
              <Button variant="destructive">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Categoría
              </Button>
            </CategoriaFormDialog>
          </div>
          <CategoriasList data={egresos} tipo="egreso" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
