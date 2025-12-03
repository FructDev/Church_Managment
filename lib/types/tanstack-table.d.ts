// lib/types/tanstack-table.d.ts
import { type RowData } from "@tanstack/react-table";

// Definimos el tipo MiembroSimple aquí para que sea consistente
type MiembroSimple = { id: string; nombre_completo: string };

// Le decimos a TypeScript que vamos a modificar el módulo
declare module "@tanstack/react-table" {
  // Ignoramos la advertencia de 'TData' no usada, es necesaria
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    // Definimos TODAS las propiedades que CUALQUIER tabla
    // pueda necesitar, como opcionales (?)

    miembros?: MiembroSimple[];
    sociedadId?: string;
    cargosEnum?: string[];
    canManage?: boolean;
    comiteId?: string;
    sociedades?: SociedadSimple[];
    categorias?: CategoriaIngreso[];
    diezmoId?: string;
    isDistribuido?: boolean;
    cajas?: SelectorOption[]; // <-- AÑADIDO: Prop para lista completa de cajas
    cuentas?: SelectorOption[];
    cajasDisponibles?: CajaSimple[];
    claseId?: string;
  }
}
