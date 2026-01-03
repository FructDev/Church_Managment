'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Check } from 'lucide-react'
import { updateNotasActividad } from '@/actions/actividades/actividadesActions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function NotasActividadCard({ actividadId, notasIniciales }: { actividadId: string, notasIniciales: string | null }) {
    const [notas, setNotas] = useState(notasIniciales || '')
    const [isPending, startTransition] = useTransition()
    const [saved, setSaved] = useState(false)

    // Efecto visual para mostrar "Guardado" por 2 segundos
    useEffect(() => {
        if (saved) {
            const timer = setTimeout(() => setSaved(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [saved])

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateNotasActividad(actividadId, notas)
            if (res.success) {
                setSaved(true)
                toast.success('Minuta guardada')
            } else {
                toast.error('Error al guardar')
            }
        })
    }

    // Detectar cambios sin guardar (opcional: podrías habilitar el botón solo si cambió)
    const hasChanges = notas !== (notasIniciales || '')

    return (
        <Card className="flex flex-col shadow-sm border-l-4 border-l-slate-500 overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <FileText className="h-4 w-4 text-slate-600" />
                        Minuta / Notas
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Privado
                    </span>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Textarea
                    placeholder="Escribe aquí los puntos clave, acuerdos o incidentes de la reunión..."
                    className={cn(
                        "min-h-[120px] w-full resize-y border-0 focus-visible:ring-0 rounded-none p-4 text-sm leading-relaxed",
                        "bg-transparent"
                    )}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                />
            </CardContent>

            <CardFooter className="py-2 px-4 bg-muted/10 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground italic">
                    {saved ? <span className="flex items-center text-green-600"><Check className="h-3 w-3 mr-1" /> Guardado</span> : "No olvides guardar los cambios."}
                </p>
                <Button
                    size="sm"
                    variant={hasChanges ? "default" : "ghost"}
                    onClick={handleSave}
                    disabled={isPending || (!hasChanges && !saved)}
                    className="h-8 text-xs"
                >
                    {isPending ? (
                        <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Guardando...</>
                    ) : (
                        "Guardar Notas"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}