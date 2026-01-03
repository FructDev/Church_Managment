'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/auth/guards'
import { ROLES_CONSULTA } from '@/lib/auth/roles'

export async function getReportesHubData() {
    await checkPermission(ROLES_CONSULTA)
    const supabase = await createClient()

    const today = new Date()
    const currentYear = today.getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    // 1. EJECUCIÓN PARALELA DE DATOS MACRO
    const [miembros, transacciones, actividades, cuentas, cajas] = await Promise.all([
        // Miembros (Total y Activos)
        supabase.from('miembros').select('fecha_ingreso_congregacion, estado_membresia'),

        // Transacciones (Todo el año para gráfica)
        supabase.from('transacciones')
            .select('tipo, monto, fecha')
            .gte('fecha', startOfYear)
            .order('fecha', { ascending: true }),

        // Asistencia (Promedio año)
        supabase.from('actividades')
            .select('asistencia:asistencia_actividades(count)')
            .gte('fecha_inicio', startOfYear)
            .eq('estado', 'completada'),

        // Saldos Actuales
        supabase.from('cuentas_bancarias').select('saldo_actual').eq('activa', true),
        supabase.from('caja_chica').select('monto_disponible').eq('estado', 'activo')
    ])

    // --- PROCESAMIENTO DE KPIs ---

    // A. Membresía
    const totalMiembros = miembros.data?.length || 0
    const nuevosMes = miembros.data?.filter(m => m.fecha_ingreso_congregacion && m.fecha_ingreso_congregacion >= startOfMonth).length || 0
    const activos = miembros.data?.filter(m => m.estado_membresia === 'activo').length || 0

    // B. Finanzas (Acumulado Año)
    let ingresosAnuales = 0
    let egresosAnuales = 0

    // Datos para la gráfica (Agrupado por mes 0-11)
    const mesesData = Array(12).fill(0).map((_, i) => ({
        name: new Date(currentYear, i, 1).toLocaleDateString('es-ES', { month: 'short' }),
        Ingresos: 0,
        Egresos: 0
    }))

    transacciones.data?.forEach(t => {
        if (t.tipo === 'ingreso') ingresosAnuales += t.monto
        if (t.tipo === 'egreso') egresosAnuales += t.monto

        // Llenar gráfica
        const mesIndex = new Date(t.fecha).getMonth()
        if (t.tipo === 'ingreso') mesesData[mesIndex].Ingresos += t.monto
        if (t.tipo === 'egreso') mesesData[mesIndex].Egresos += t.monto
    })

    // Saldo Actual Real
    const liquidezTotal = (cuentas.data?.reduce((acc, c) => acc + c.saldo_actual, 0) || 0) +
        (cajas.data?.reduce((acc, c) => acc + c.monto_disponible, 0) || 0)

    // C. Asistencia Promedio Anual
    let sumaAsistencia = 0
    let conteoEventos = 0
    actividades.data?.forEach(a => {
        // @ts-ignore
        const count = a.asistencia[0]?.count || 0
        if (count > 0) {
            sumaAsistencia += count
            conteoEventos++
        }
    })
    const asistenciaPromedio = conteoEventos > 0 ? Math.round(sumaAsistencia / conteoEventos) : 0

    return {
        year: currentYear,
        kpis: {
            totalMiembros,
            nuevosMes,
            activos,
            ingresosAnuales,
            egresosAnuales,
            liquidezTotal,
            asistenciaPromedio
        },
        chartData: mesesData
    }
}