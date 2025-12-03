// lib/validations/finanzas.schema.ts
import { z } from "zod";

const metodoPagoEnum = z.enum([
  "efectivo",
  "transferencia",
  "cheque",
  "tarjeta",
  "otro",
]);

export const ingresoSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  fecha: z.string().min(1, { message: "La fecha es requerida." }),

  categoria_ingreso_id: z
    .string()
    .uuid({ message: "Debe seleccionar una categoría." }),

  monto: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .min(0.01, { message: "El monto debe ser mayor a 0." })
      .refine((val) => val !== undefined && val !== null, {
        message: "El monto es requerido.",
      })
  ),

  metodo_pago: metodoPagoEnum,
  descripcion: z.string().optional(),
  comprobante_file: z.any().optional(),

  // REGLA DE NEGOCIO: Siempre entra a una caja. Es obligatorio.
  caja_destino_id: z
    .string()
    .uuid({ message: "Debe seleccionar una Caja Chica de destino." }),
  actividad_id: z.string().uuid().optional().nullable(),
});

export type IngresoFormValues = z.infer<typeof ingresoSchema>;

export const egresoSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  fecha: z.string().min(1, { message: "La fecha es requerida." }),

  categoria_egreso_id: z
    .string()
    .uuid({ message: "Debe seleccionar una categoría." }),

  monto: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .min(0.01, { message: "El monto debe ser mayor a 0." })
      .refine((val) => val !== undefined && val !== null, {
        message: "El monto es requerido.",
      })
  ),

  metodo_pago: metodoPagoEnum,
  descripcion: z.string().min(1, { message: "Descripción requerida." }),
  beneficiario_proveedor: z.string().optional(),
  comprobante_file: z.any().optional(),

  // REGLA DE NEGOCIO: Debe salir de algún lado
  fondo_origen_tipo: z
    .enum(["banco", "caja_chica", "ninguno"])
    .default("ninguno"),
  fondo_origen_id: z
    .string()
    .uuid({ message: "Debe seleccionar el fondo de origen." }),
  actividad_id: z.string().uuid().optional().nullable(),
});

export type EgresoFormValues = z.infer<typeof egresoSchema>;

// Este es el schema para CADA LÍNEA (fila) en el formulario
export const diezmoLoteEntrySchema = z.object({
  miembro_id: z.string().uuid({ message: "Debe seleccionar un miembro." }),
  monto: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .min(0.01, { message: "El monto debe ser mayor a 0." })
      .refine((val) => val !== undefined && val !== null, {
        message: "El monto es requerido.",
      })
  ),
  metodo_pago: z.enum([
    "efectivo",
    "transferencia",
    "cheque",
    "tarjeta",
    "otro",
  ]),
});

// Este es el schema para el formulario COMPLETO (un array de entradas)
export const diezmoLoteSchema = z.object({
  fecha: z.string().min(1, { message: "La fecha es requerida." }),
  tipo_periodo: z.enum(["primera_quincena", "segunda_quincena"]),
  entradas: z
    .array(diezmoLoteEntrySchema)
    .min(1, { message: "Debe añadir al menos un registro de diezmo." }),
});

export type DiezmoLoteFormValues = z.infer<typeof diezmoLoteSchema>;
export type DiezmoLoteEntryValues = z.infer<typeof diezmoLoteEntrySchema>;

export const diezmoEntryEditSchema = z.object({
  // No necesitamos validar 'miembro_id' o 'fecha', solo el monto.
  monto: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .min(0.01, { message: "El monto debe ser mayor a 0." })
      .refine((val) => val !== undefined && val !== null, {
        message: "El monto es requerido.",
      })
  ),
});

export type DiezmoEntryEditFormValues = z.infer<typeof diezmoEntryEditSchema>;

export const presupuestoSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Para la edición
  nombre: z.string().min(3, { message: "El nombre es requerido." }),
  descripcion: z.string().optional().nullable(),

  anio: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .int()
      .gte(2020, { message: "El año debe ser 2020 o posterior." })
      .refine((v) => v !== undefined && v !== null, {
        message: "El año es requerido.",
      })
  ),

  // 'tipo' lo definiremos como 'anual' por ahora
  tipo: z.enum(["anual", "mensual", "actividad"]).default("anual"),
});

export type PresupuestoFormValues = z.infer<typeof presupuestoSchema>;

export const lineaPresupuestoSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  presupuesto_id: z
    .string()
    .uuid({ message: "Se requiere el ID del presupuesto." }),

  categoria_egreso_id: z
    .string()
    .uuid({ message: "Debe seleccionar una categoría." }),

  monto_presupuestado: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z
      .number()
      .min(0.01, { message: "El monto debe ser mayor a 0." })
      .refine((v) => v !== undefined && v !== null, {
        message: "El monto es requerido.",
      })
  ),
});

export type LineaPresupuestoFormValues = z.infer<typeof lineaPresupuestoSchema>;

// --- NUEVO ESQUEMA PARA CAJA CHICA (EL CONTENEDOR) ---
export const cajaChicaSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z
    .string()
    .min(3, { message: "El nombre es requerido (Ej: Caja Secretaría)." }),
  responsable_id: z
    .string()
    .uuid({ message: "Debe seleccionar un responsable." }),

  monto_asignado: z.coerce
    .number()
    .positive({ message: "El monto debe ser positivo." }),

  periodo_inicio: z
    .string()
    .min(1, { message: "La fecha de inicio es requerida." }),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export type CajaChicaFormValues = z.infer<typeof cajaChicaSchema>;

export const movimientoCajaChicaSchema = z
  .object({
    caja_chica_id: z.string().uuid(),

    // 1. Ampliamos los tipos de operación permitidos en el FORMULARIO
    tipo: z.enum([
      "gasto",
      "reposicion",
      "deposito_banco",
      "transferencia_caja",
    ]),

    monto: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }
        return val;
      },
      z
        .number()
        .min(0.01, { message: "El monto debe ser mayor a 0." })
        .refine((val) => val !== undefined && val !== null, {
          message: "El monto es requerido.",
        })
    ),

    concepto: z.string().min(3, { message: "El concepto es requerido." }),
    fecha: z.string().min(1, { message: "La fecha es requerida." }),

    // Campos opcionales dependiendo del tipo
    cuenta_destino_id: z.string().uuid().optional().nullable(),
    caja_destino_id: z.string().uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 2. Validaciones Condicionales estrictas
    if (data.tipo === "deposito_banco" && !data.cuenta_destino_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar una cuenta bancaria de destino.",
        path: ["cuenta_destino_id"],
      });
    }
    if (data.tipo === "transferencia_caja" && !data.caja_destino_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar una caja chica de destino.",
        path: ["caja_destino_id"],
      });
    }
  });

export type MovimientoCajaChicaFormValues = z.infer<
  typeof movimientoCajaChicaSchema
>;

// -----------------------------
//   CUENTA BANCARIA
// -----------------------------
export const cuentaBancariaSchema = z.object({
  id: z.string().uuid().optional().nullable(),

  nombre: z.string().min(3, {
    message: "El nombre es requerido (Ej: Banreservas Corriente).",
  }),

  banco: z.string().min(2, {
    message: "El nombre del banco es requerido.",
  }),

  numero_cuenta: z.string().min(5, {
    message: "El número de cuenta es requerido.",
  }),

  tipo_cuenta: z.enum(["corriente", "ahorro"]),

  saldo_actual: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0, { message: "El saldo no puede ser negativo." })
  ),

  activa: z.boolean().default(true),

  notas: z.string().optional().nullable(),
});

export type CuentaBancariaFormValues = z.infer<typeof cuentaBancariaSchema>;

// -----------------------------
//   MOVIMIENTO BANCARIO
// -----------------------------
export const movimientoBancarioSchema = z.object({
  cuenta_id: z.string().uuid(),

  tipo: z.enum(["deposito", "retiro", "transferencia"]),

  monto: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().positive({ message: "El monto debe ser positivo." })
  ),

  referencia: z.string().optional().nullable(),

  descripcion: z.string().min(3, {
    message: "La descripción es requerida.",
  }),

  fecha: z.string().min(1, {
    message: "La fecha es requerida.",
  }),

  // Solo aplica para transferencias
  cuenta_destino_id: z.string().uuid().optional().nullable(),
});

export type MovimientoBancarioFormValues = z.infer<
  typeof movimientoBancarioSchema
>;

// --- NUEVO: ESQUEMA DE TRANSFERENCIAS ---
export const fondoTransferSchema = z
  .object({
    origen_id: z.string().uuid(),
    origen_tipo: z.enum(["caja_chica", "banco"]),

    destino_id: z.string().uuid({ message: "Debe seleccionar un destino." }),
    destino_tipo: z.enum(["caja_chica", "banco"]),

    monto: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }
        return val;
      },
      z
        .number()
        .min(0.01, { message: "El monto debe ser mayor a 0." })
        .refine((val) => val !== undefined && val !== null, {
          message: "El monto es requerido.",
        })
    ),

    fecha: z.string().min(1, { message: "Fecha requerida." }),
    concepto: z.string().min(3, { message: "Concepto requerido." }),
  })
  .refine((data) => data.origen_id !== data.destino_id, {
    message: "El origen y el destino no pueden ser el mismo.",
    path: ["destino_id"],
  });

export type FondoTransferFormValues = z.infer<typeof fondoTransferSchema>;
