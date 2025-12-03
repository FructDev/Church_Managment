// components/miembros/MiembroProfileCard.tsx
import { type MiembroDetalle } from "@/actions/miembros/miembrosActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Home,
  Gift,
  Briefcase,
  Church,
  CalendarDays,
  Edit,
  StickyNote,
  Users,
} from "lucide-react";
import { MiembroFormDialog } from "./MiembroFormDialog"; // Reutilizamos el formulario

type SociedadSimple = { id: string; nombre: string };

// Componente para un campo de información (reutilizado)
function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

// Función para formatear la fecha (reutilizada)
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "No registrada";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function MiembroProfileCard({
  miembro,
  sociedades,
  canManage,
}: {
  miembro: MiembroDetalle;
  sociedades: SociedadSimple[];
  canManage: boolean;
}) {
  // ¡Tu segunda pregunta! ¿Por qué no se ve el cargo?
  // 'historial_cargos' solo muestra cargos INACTIVOS (según tu trigger SQL).
  // Necesitamos buscar los cargos ACTIVOS en las otras tablas.
  // Esto lo haremos en el siguiente paso. Por ahora, mostramos el historial.

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {miembro.foto_url && (
              <AvatarImage
                src={miembro.foto_url}
                alt={miembro.nombre_completo}
              />
            )}
            <AvatarFallback className="text-3xl">
              {miembro.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("") || <User />}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {miembro.nombre_completo}
            </CardTitle>
            <CardDescription>
              {miembro.profesion || "Profesión no registrada"}
            </CardDescription>
            <div className="mt-2 flex gap-2">
              <Badge variant="default" className="capitalize">
                {miembro.estado_membresia}
              </Badge>
              {miembro.sociedad && (
                <Badge variant="secondary" className="capitalize">
                  {miembro.sociedad.nombre}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {canManage && (
          // Usamos el tipo 'miembro' completo, que es compatible con el formulario
          <MiembroFormDialog
            mode="edit"
            miembro={miembro}
            sociedades={sociedades}
          >
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </MiembroFormDialog>
        )}
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
        {/* COLUMNA 1: Contacto */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">
            Información de Contacto
          </h3>
          <InfoField icon={Mail} label="Email" value={miembro.email} />
          <InfoField icon={Phone} label="Teléfono" value={miembro.telefono} />
          <InfoField
            icon={Phone}
            label="Teléfono Secundario"
            value={miembro.telefono_secundario}
          />
          <InfoField icon={Home} label="Dirección" value={miembro.direccion} />
        </div>

        {/* COLUMNA 2: Personal y Ministerial */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">
            Información Personal
          </h3>
          <InfoField
            icon={Gift}
            label="Fecha de Nacimiento"
            value={formatDate(miembro.fecha_nacimiento)}
          />
          <InfoField
            icon={Users}
            label="Estado Civil"
            value={miembro.estado_civil}
          />
          <InfoField
            icon={Church}
            label="Miembro Desde"
            value={formatDate(miembro.fecha_ingreso_congregacion)}
          />
          <InfoField icon={StickyNote} label="Notas" value={miembro.notas} />
        </div>

        {/* COLUMNA 3: Cargos */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Cargos</h3>
          <h4 className="text-sm font-semibold">Cargos Actuales</h4>
          <div className="space-y-2">
            {miembro.cargos_activos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin cargos activos.
              </p>
            )}
            {miembro.cargos_activos.map((cargo, index) => (
              <div key={index}>
                <p className="font-medium text-sm capitalize">
                  {cargo.nombre.replace("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {cargo.tipo.replace("_", " ")}
                </p>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold pt-4">
            Historial de Cargos (Inactivos)
          </h4>
          <div className="space-y-2">
            {miembro.historial_cargos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin cargos pasados.
              </p>
            )}
            {miembro.historial_cargos.slice(0, 5).map((cargo, index) => (
              <div key={index}>
                <p className="font-medium text-sm">{cargo.cargo_nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(cargo.fecha_inicio)} -{" "}
                  {cargo.fecha_fin ? formatDate(cargo.fecha_fin) : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
