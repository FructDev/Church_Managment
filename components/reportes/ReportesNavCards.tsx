import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, PieChart, Users, FileText, ShieldCheck } from 'lucide-react'

export function ReportCategoryCard({
    title,
    desc,
    href,
    icon: Icon,
    color,
    features
}: any) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4" style={{ borderTopColor: color }}>
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-6 w-6" style={{ color: color }} />
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </div>
                <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="space-y-2 mb-6">
                    {features.map((f: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {f}
                        </li>
                    ))}
                </ul>
                <Button asChild className="w-full" variant="outline">
                    <Link href={href} className="group">
                        Acceder <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}