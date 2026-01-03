'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { type PartePrograma } from '@/actions/actividades/programaActions'
import { toast } from 'sonner'

interface Props {
    titulo: string
    fecha: string
    programa: PartePrograma[]
}

export function WhatsAppShareButton({ titulo, fecha, programa }: Props) {
    const handleShare = () => {
        if (!programa || programa.length === 0) {
            toast.error('El programa está vacío.')
            return
        }

        // Emojis compatibles 100% con WhatsApp
        const I_IGLESIA = '✝️'
        const I_CALENDARIO = '📅'
        const I_PIN = '📍'
        const I_PERSONA = '👤'
        const I_NOTA = '📝'
        const I_ORACION = '🙏'
        const LINEA = '--------------------------------'

        let mensaje = `*${I_IGLESIA} IGLESIA FUENTE DE SALVACIÓN MISIONERA*\n`
        mensaje += `*${I_CALENDARIO} PROGRAMA DE CULTO*\n\n`

        mensaje += `*${I_PIN} Evento:* ${titulo}\n`
        mensaje += `*Fecha:* ${fecha}\n`
        mensaje += `${LINEA}\n\n`

        programa.forEach((parte, i) => {
            const n = i + 1
            const responsable = parte.responsable_nom || parte.responsable?.nombre_completo || '---'

            mensaje += `*${n}. ${parte.titulo_parte}*\n`
            mensaje += `> ${I_PERSONA} ${responsable}\n`

            if (parte.notas) {
                mensaje += `> ${I_NOTA} _${parte.notas}_\n`
            }

            mensaje += `\n`
        })

        mensaje += `${LINEA}\n`
        mensaje += `${I_ORACION} _"Hágase todo decentemente y con orden."_`

        const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }

    console.log("IGLESIA:", "⛪️");
    console.log("CALENDARIO:", "📅");
    console.log("PIN:", "📍");
    console.log("PERSONA:", "👤");
    console.log("NOTA:", "📝");
    console.log("ORACION:", "🙏");
    console.log("LINEA:", "--------------------------------");

    return (
        <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 gap-2"
            onClick={handleShare}
            disabled={!programa || programa.length === 0}
            title="Enviar programa por WhatsApp"
        >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
        </Button>
    )
}
