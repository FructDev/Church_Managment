'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/auth/guards'
import { ROLES_CONSULTA, ROLES_FINANCIEROS } from '@/lib/auth/roles'
import { getSessionInfo } from '@/lib/auth/utils'

export async function getMemberStats(miembroId: string) {
    // Permiso básico de lectura
    await checkPermission(ROLES_CONSULTA)

    const supabase = await createClient()
    const { profile } = await getSessionInfo()

    // --- 1. ESTADÍSTICAS DE ASISTENCIA ---
    // Obtenemos las últimas 5 asistencias y el conteo total del año
    const currentYear = new Date().getFullYear()
    const startYear = `${currentYear}-01-01`

    const { data: asistencias, count: totalAnual } = await supabase
        .from('asistencia_actividades')
        .select('fecha_registro, actividad:actividades(titulo, fecha_inicio)', { count: 'exact' })
        .eq('miembro_id', miembroId)
        .eq('presente', true)
        .gte('fecha_registro', startYear)
        .order('fecha_registro', { ascending: false })

    const ultimasAsistencias = asistencias?.slice(0, 5).map(a => ({
        titulo: a.actividad?.titulo,
        fecha: a.actividad?.fecha_inicio
    })) || []

    // --- 2. ESTADÍSTICAS FINANCIERAS ---
    // Solo si el usuario tiene rol financiero
    let finanzas = null

    // Verificar si el usuario actual puede ver finanzas
    const canViewFinance = ROLES_FINANCIEROS.includes(profile?.rol as any)

    if (canViewFinance) {
        const { data: transacciones } = await supabase
            .from('transacciones')
            .select('monto, tipo, categoria:categorias_ingresos(nombre)')
            .eq('miembro_id', miembroId) // Buscamos transacciones vinculadas a este miembro
            .eq('tipo', 'ingreso')
            .gte('fecha', startYear)

        let totalDiezmos = 0
        let totalOfrendas = 0

        transacciones?.forEach(t => {
            const cat = t.categoria?.nombre.toLowerCase() || ''
            if (cat.includes('diezmo')) {
                totalDiezmos += t.monto
            } else {
                totalOfrendas += t.monto
            }
        })

        finanzas = {
            totalDiezmos,
            totalOfrendas,
            totalGeneral: totalDiezmos + totalOfrendas
        }
    }

    return {
        asistencia: {
            totalAnual: totalAnual || 0,
            ultimas: ultimasAsistencias
        },
        finanzas
    }
}