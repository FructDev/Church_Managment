/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, User } from "lucide-react";

export function MiembrosStatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Miembros
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Registrados en el sistema
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Membresía Activa
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-green-600">
            {stats.activos}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            En plena comunión
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nuevos (Este Mes)
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-blue-600">
            +{stats.nuevos}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Crecimiento reciente
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-500/10 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Visitantes
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-orange-600">
            {stats.visitantes}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Personas en seguimiento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
