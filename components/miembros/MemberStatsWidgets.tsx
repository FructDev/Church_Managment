import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount)
}

// --- WIDGET DE ASISTENCIA ---
export function AsistenciaStatsCard({ data }: { data: any }) {
    return (
        <Card className="h-full border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                        Actividad Reciente
                    </CardTitle>
                    <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                        {data.totalAnual} Asistencias (Año actual)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.ultimas.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No ha asistido a eventos recientes.</p>
                    ) : (
                        <ul className="space-y-3">
                            {data.ultimas.map((a: any, i: number) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-muted rounded-lg text-xs font-medium shrink-0">
                                        <span>{new Date(a.fecha).getDate()}</span>
                                        <span className="text-[9px] uppercase text-muted-foreground">
                                            {new Date(a.fecha).toLocaleDateString('es', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{a.titulo}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Asistió
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// --- WIDGET FINANCIERO (Solo visible para Tesoreros/Pastores) ---
export function FinanceStatsCard({ data }: { data: any }) {
    if (!data) return null // Si no tiene permiso, no renderiza nada (o un placeholder)

    return (
        <Card className="h-full border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Aportes del Año
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Total Grande */}
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Total Aportado</p>
                        <p className="text-2xl font-bold text-green-800">{formatCurrency(data.totalGeneral)}</p>
                    </div>

                    {/* Desglose */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Diezmos</span>
                            <span className="font-semibold flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                {formatCurrency(data.totalDiezmos)}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Ofrendas</span>
                            <span className="font-semibold flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                {formatCurrency(data.totalOfrendas)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}