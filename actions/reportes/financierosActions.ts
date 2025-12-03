"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/auth/guards";
import { ROLES_FINANCIEROS } from "@/lib/auth/roles";

export type DatosInformeMensual = {
  periodo: string;
  configuracion: {
    nombre_iglesia: string;
    direccion: string | null;
    logo_url: string | null;
  };
  ingresos: {
    diezmos: number;
    ofrendas_regulares: number;
    ofrendas_esc_biblica: number;
    ofrendas_pro_templo: number;
    ofrendas_especiales: number;
    otras_ofrendas: number;
    total_ingresos: number;
  };
  egresos: {
    pago_alquiler: number;
    pago_luz_agua: number;
    ayudas: number;
    construccion: number;
    otros_gastos: number;
    total_egresos_locales: number; // Sub-total
  };
  enviados_oficina: {
    diezmo_de_diezmo: number;
    ofrenda_misionera: number;
    diezmo_esc_biblica: number;
    ofrenda_voluntaria: number;
    cuota_convencion: number;
    total_enviado: number;
  };
  resumen: {
    diezmos_pastor: number;
    sustento_pastoral: number;
    // --- CAMBIO DE NOMBRE Y LÓGICA ---
    gran_total_enviado: number; // (Total Enviado + Diezmos Pastor)
    balance_final: number;
  };
};

export async function getDatosInformeMensual(
  month: number,
  year: number
): Promise<DatosInformeMensual> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();

  const { data: transacciones } = await supabase
    .from("transacciones")
    .select(
      `tipo, monto, categoria:categorias_ingresos(nombre), categoria_egreso:categorias_egresos(nombre)`
    )
    .gte("fecha", startDate)
    .lte("fecha", endDate);

  const { data: diezmos } = await supabase
    .from("diezmos")
    .select("*")
    .gte("fecha_distribucion", startDate)
    .lte("fecha_distribucion", endDate)
    .eq("distribuido", true);

  const nombreMes = new Date(year, month, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const { data: config } = await supabase
    .from("configuracion")
    .select("nombre_iglesia, direccion, logo_url")
    .single();

  const datos: DatosInformeMensual = {
    periodo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
    configuracion: {
      nombre_iglesia: config?.nombre_iglesia || "Iglesia Local",
      direccion: config?.direccion || "",
      logo_url: config?.logo_url || null,
    },
    ingresos: {
      diezmos: 0,
      ofrendas_regulares: 0,
      ofrendas_esc_biblica: 0,
      ofrendas_pro_templo: 0,
      ofrendas_especiales: 0,
      otras_ofrendas: 0,
      total_ingresos: 0,
    },
    egresos: {
      pago_alquiler: 0,
      pago_luz_agua: 0,
      ayudas: 0,
      construccion: 0,
      otros_gastos: 0,
      total_egresos_locales: 0,
    },
    enviados_oficina: {
      diezmo_de_diezmo: 0,
      ofrenda_misionera: 0,
      diezmo_esc_biblica: 0,
      ofrenda_voluntaria: 0,
      cuota_convencion: 0,
      total_enviado: 0,
    },
    resumen: {
      diezmos_pastor: 0,
      sustento_pastoral: 0,
      gran_total_enviado: 0,
      balance_final: 0,
    },
  };

  diezmos?.forEach((d) => {
    datos.ingresos.diezmos += d.total_recibido;
    datos.enviados_oficina.diezmo_de_diezmo += d.diezmo_de_diezmo;
    datos.resumen.diezmos_pastor += d.diezmo_pastoral;
    datos.resumen.sustento_pastoral += d.sustento_pastoral;
  });

  transacciones?.forEach((t) => {
    const monto = t.monto;
    const catNombre =
      (t.tipo === "ingreso"
        ? t.categoria?.nombre
        : t.categoria_egreso?.nombre
      )?.toLowerCase() || "";

    if (t.tipo === "ingreso") {
      if (catNombre.includes("regular") || catNombre.includes("general"))
        datos.ingresos.ofrendas_regulares += monto;
      else if (catNombre.includes("escuela") || catNombre.includes("biblica"))
        datos.ingresos.ofrendas_esc_biblica += monto;
      else if (
        catNombre.includes("templo") ||
        catNombre.includes("construccion")
      )
        datos.ingresos.ofrendas_pro_templo += monto;
      else if (catNombre.includes("especial"))
        datos.ingresos.ofrendas_especiales += monto;
      else datos.ingresos.otras_ofrendas += monto;
    } else if (t.tipo === "egreso") {
      if (catNombre.includes("alquiler")) datos.egresos.pago_alquiler += monto;
      else if (catNombre.includes("luz") || catNombre.includes("agua"))
        datos.egresos.pago_luz_agua += monto;
      else if (catNombre.includes("ayuda")) datos.egresos.ayudas += monto;
      else if (catNombre.includes("construccion"))
        datos.egresos.construccion += monto;
      else if (catNombre.includes("misionera"))
        datos.enviados_oficina.ofrenda_misionera += monto;
      else if (catNombre.includes("diezmo esc"))
        datos.enviados_oficina.diezmo_esc_biblica += monto;
      else if (catNombre.includes("convencion"))
        datos.enviados_oficina.cuota_convencion += monto;
      else datos.egresos.otros_gastos += monto;
    }
  });

  // Totales
  datos.ingresos.total_ingresos =
    datos.ingresos.diezmos +
    datos.ingresos.ofrendas_regulares +
    datos.ingresos.ofrendas_esc_biblica +
    datos.ingresos.ofrendas_pro_templo +
    datos.ingresos.ofrendas_especiales +
    datos.ingresos.otras_ofrendas;

  datos.egresos.total_egresos_locales =
    datos.egresos.pago_alquiler +
    datos.egresos.pago_luz_agua +
    datos.egresos.ayudas +
    datos.egresos.construccion +
    datos.egresos.otros_gastos;

  datos.enviados_oficina.total_enviado =
    datos.enviados_oficina.diezmo_de_diezmo +
    datos.enviados_oficina.ofrenda_misionera +
    datos.enviados_oficina.diezmo_esc_biblica +
    datos.enviados_oficina.ofrenda_voluntaria +
    datos.enviados_oficina.cuota_convencion;

  // --- ¡LÓGICA CORREGIDA! ---
  // Gran Total Enviado = Total Enviado + Diezmos Pastor
  datos.resumen.gran_total_enviado =
    datos.enviados_oficina.total_enviado + datos.resumen.diezmos_pastor;
  // --------------------------

  // Balance: Total Ingresos - (Total Egresos Locales + Sustento + Gran Total Enviado)
  const totalSalidasReales =
    datos.egresos.total_egresos_locales +
    datos.resumen.sustento_pastoral +
    datos.resumen.gran_total_enviado;

  datos.resumen.balance_final =
    datos.ingresos.total_ingresos - totalSalidasReales;

  return datos;
}

// Nota: Como aún no tenemos módulo de Deudas, los Pasivos serán 0 por ahora.
export async function getBalanceGeneral() {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  // Obtener Activos (Cajas y Bancos)
  const [cajas, cuentas] = await Promise.all([
    supabase
      .from("caja_chica")
      .select("nombre, monto_disponible")
      .eq("estado", "activo"),
    supabase
      .from("cuentas_bancarias")
      .select("nombre, saldo_actual")
      .eq("activa", true),
  ]);

  const activosCorrientes = [
    ...(cajas.data || []).map((c) => ({
      nombre: c.nombre || "Caja",
      monto: c.monto_disponible,
      tipo: "Caja Chica",
    })),
    ...(cuentas.data || []).map((c) => ({
      nombre: c.nombre,
      monto: c.saldo_actual,
      tipo: "Banco",
    })),
  ];

  const totalActivos = activosCorrientes.reduce(
    (sum, item) => sum + item.monto,
    0
  );

  // Pasivos (Placeholder para futuro módulo de Cuentas por Pagar)
  const totalPasivos = 0;
  const patrimonio = totalActivos - totalPasivos;

  return {
    activos: activosCorrientes,
    totalActivos,
    totalPasivos,
    patrimonio,
  };
}

// --- 2. FLUJO DE EFECTIVO (Cash Flow) ---
export async function getFlujoEfectivo(year: number) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data } = await supabase
    .from("transacciones")
    .select("tipo, monto, fecha")
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha");

  if (!data) return [];

  // Agrupar por mes para ver el flujo neto
  const meses = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      index: i,
      name: date.toLocaleDateString("es-ES", { month: "short" }),
      entradas: 0,
      salidas: 0,
      neto: 0,
    };
  });

  data.forEach((t) => {
    const monthIndex = new Date(t.fecha).getMonth();
    if (t.tipo === "ingreso") meses[monthIndex].entradas += t.monto;
    if (t.tipo === "egreso") meses[monthIndex].salidas += t.monto;
  });

  // Calcular neto
  meses.forEach((m) => (m.neto = m.entradas - m.salidas));

  return meses;
}

// --- 3. REPORTE DE DIEZMOS (Tendencias) ---
export async function getReporteDiezmosAnual(year: number) {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data } = await supabase
    .from("diezmos")
    .select("periodo, tipo_periodo, total_recibido")
    .gte("fecha_distribucion", startDate) // Usamos fecha distribución para confirmar que fue procesado
    .lte("fecha_distribucion", endDate)
    .eq("distribuido", true)
    .order("periodo", { ascending: true });

  if (!data) return [];

  return data.map((d) => ({
    fecha: new Date(d.periodo).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
    periodo: d.tipo_periodo.replace("_", " "),
    monto: d.total_recibido,
  }));
}

// --- TIPO PARA INFORME ANUAL ---
export type DatosInformeAnual = {
  periodo: string;
  configuracion: {
    nombre_iglesia: string;
    direccion: string | null;
    logo_url: string | null;
  };
  ingresos: {
    diezmos: number;
    ofrendas_regulares: number;
    ofrendas_esc_biblica: number;
    ofrendas_pro_templo: number;
    ofrendas_especiales: number;
    otras_ofrendas: number;
    total_ingresos: number;
  };
  egresos: {
    pago_alquiler: number;
    pago_telefono: number;
    pago_luz_agua: number;
    ayudas: number;
    ofrendas_filantropicas: number;
    material_gastable: number;
    gastos_operativos: number;
    diezmos_escuela_b: number;
    construccion: number;
    // --- CAMPOS DE DISTRIBUCIÓN ---
    diezmos_de_diezmos: number;
    ofrendas_misioneras: number;
    salario_pastor: number;
    comite_finanzas: number; // <-- NUEVO
    diezmo_pastoral: number; // <-- NUEVO
    // ----------------------------
    otros_gastos: number;
    total_egresos: number;
  };
  resumen: {
    total_ingresos: number;
    total_egresos: number;
    balance: number;
  };
};

export async function getDatosInformeAnual(
  year: number
): Promise<DatosInformeAnual> {
  await checkPermission(ROLES_FINANCIEROS);
  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data: config } = await supabase
    .from("configuracion")
    .select("nombre_iglesia, direccion, logo_url")
    .single();

  const { data: transacciones } = await supabase
    .from("transacciones")
    .select(
      `tipo, monto, categoria:categorias_ingresos(nombre), categoria_egreso:categorias_egresos(nombre)`
    )
    .gte("fecha", startDate)
    .lte("fecha", endDate);

  const { data: diezmos } = await supabase
    .from("diezmos")
    .select("*")
    .gte("fecha_distribucion", startDate)
    .lte("fecha_distribucion", endDate)
    .eq("distribuido", true);

  const datos: DatosInformeAnual = {
    periodo: `Año ${year}`,
    configuracion: {
      nombre_iglesia: config?.nombre_iglesia || "Iglesia Local",
      direccion: config?.direccion || "",
      logo_url: config?.logo_url || null,
    },
    ingresos: {
      diezmos: 0,
      ofrendas_regulares: 0,
      ofrendas_esc_biblica: 0,
      ofrendas_pro_templo: 0,
      ofrendas_especiales: 0,
      otras_ofrendas: 0,
      total_ingresos: 0,
    },
    egresos: {
      pago_alquiler: 0,
      pago_telefono: 0,
      pago_luz_agua: 0,
      ayudas: 0,
      ofrendas_filantropicas: 0,
      material_gastable: 0,
      gastos_operativos: 0,
      diezmos_escuela_b: 0,
      construccion: 0,
      diezmos_de_diezmos: 0,
      ofrendas_misioneras: 0,
      salario_pastor: 0,
      comite_finanzas: 0,
      diezmo_pastoral: 0, // Inicializar nuevos
      otros_gastos: 0,
      total_egresos: 0,
    },
    resumen: { total_ingresos: 0, total_egresos: 0, balance: 0 },
  };

  // A. Sumar Diezmos (Distribución Automática)
  diezmos?.forEach((d) => {
    datos.ingresos.diezmos += d.total_recibido;

    // Distribuciones que salen del diezmo (son Egresos para el informe)
    datos.egresos.diezmos_de_diezmos += d.diezmo_de_diezmo;
    datos.egresos.salario_pastor += d.sustento_pastoral;
    datos.egresos.comite_finanzas += d.comite_finanzas; // <-- Sumar
    datos.egresos.diezmo_pastoral += d.diezmo_pastoral; // <-- Sumar
  });

  // B. Sumar Transacciones Manuales
  transacciones?.forEach((t) => {
    const monto = t.monto;
    const catName =
      (t.tipo === "ingreso"
        ? t.categoria?.nombre
        : t.categoria_egreso?.nombre
      )?.toLowerCase() || "";

    if (t.tipo === "ingreso") {
      if (catName.includes("regular") || catName.includes("general"))
        datos.ingresos.ofrendas_regulares += monto;
      else if (catName.includes("escuela") || catName.includes("biblica"))
        datos.ingresos.ofrendas_esc_biblica += monto;
      else if (catName.includes("templo") || catName.includes("construccion"))
        datos.ingresos.ofrendas_pro_templo += monto;
      else if (catName.includes("especial"))
        datos.ingresos.ofrendas_especiales += monto;
      else datos.ingresos.otras_ofrendas += monto;
    } else if (t.tipo === "egreso") {
      if (catName.includes("alquiler")) datos.egresos.pago_alquiler += monto;
      else if (catName.includes("telefono"))
        datos.egresos.pago_telefono += monto;
      else if (catName.includes("luz") || catName.includes("agua"))
        datos.egresos.pago_luz_agua += monto;
      else if (catName.includes("ayuda")) datos.egresos.ayudas += monto;
      else if (catName.includes("filantropica"))
        datos.egresos.ofrendas_filantropicas += monto;
      else if (catName.includes("material"))
        datos.egresos.material_gastable += monto;
      else if (catName.includes("operativo"))
        datos.egresos.gastos_operativos += monto;
      else if (catName.includes("diezmo esc"))
        datos.egresos.diezmos_escuela_b += monto;
      else if (catName.includes("construccion"))
        datos.egresos.construccion += monto;
      else if (catName.includes("misionera"))
        datos.egresos.ofrendas_misioneras += monto;
      else datos.egresos.otros_gastos += monto;
    }
  });

  // C. Calcular Totales
  datos.ingresos.total_ingresos =
    Object.values(datos.ingresos).reduce((a, b) => a + b, 0) -
    datos.ingresos.total_ingresos;
  datos.egresos.total_egresos =
    Object.values(datos.egresos).reduce((a, b) => a + b, 0) -
    datos.egresos.total_egresos;

  datos.resumen.total_ingresos = datos.ingresos.total_ingresos;
  datos.resumen.total_egresos = datos.egresos.total_egresos;
  datos.resumen.balance =
    datos.resumen.total_ingresos - datos.resumen.total_egresos;

  return datos;
}
