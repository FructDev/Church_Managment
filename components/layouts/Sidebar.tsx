/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Network,
  CalendarDays,
  Banknote,
  FileBarChart,
  Settings,
  Church,
  UserPlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Database } from "@/lib/database.types";

// 1. Importamos los grupos de roles centralizados
import {
  ROLES_CONSULTA,
  ROLES_ADMINISTRATIVOS,
  ROLES_FINANCIEROS,
  ROLES_ACCESO_TOTAL,
} from "@/lib/auth/roles";

type RolUsuario = Database["public"]["Enums"]["rol_usuario"];

// 2. Definimos los enlaces usando los grupos
const mainNavLinks = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: Home,
    roles: ROLES_CONSULTA, // Todos
  },
  {
    href: "/miembros",
    label: "Membresía",
    icon: Users,
    roles: ROLES_ADMINISTRATIVOS, // Pastor, Co-Pastor, Admin, Secretarios
  },
  {
    href: "/ministerio/consolidacion",
    label: "Consolidación",
    icon: UserPlus,
    roles: ROLES_ADMINISTRATIVOS,
  },
  {
    href: "/estructura",
    label: "Estructura",
    icon: Network,
    roles: ROLES_ADMINISTRATIVOS, // Pastor, Co-Pastor, Admin, Secretarios
  },
  {
    href: "/actividades",
    label: "Actividades",
    icon: CalendarDays,
    roles: ROLES_CONSULTA, // Casi todos
  },
  {
    href: "/finanzas",
    label: "Finanzas",
    icon: Banknote,
    roles: ROLES_FINANCIEROS, // Pastor, Admin, Tesoreros (EXCLUYE Co-Pastor y Secretarios Sociedad)
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: FileBarChart,
    roles: ROLES_CONSULTA, // Todos (la página interna filtra qué reportes ven)
  },
];

const NavLink = ({ href, label, icon: Icon, isActive }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${isActive
            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

interface SidebarProps {
  userRole: RolUsuario;
  logoUrl?: string | null;
  churchName?: string | null;
}

export function Sidebar({ userRole, logoUrl, churchName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex shadow-sm items-center">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {/* LOGO DE LA IGLESIA */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary/10 text-lg font-semibold text-primary shadow-sm hover:scale-105 transition-transform overflow-hidden border border-primary/20"
              >
                {logoUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <Church className="h-5 w-5" />
                )}
                <span className="sr-only">{churchName || "Inicio"}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold">
              {churchName || "Iglesia App"}
            </TooltipContent>
          </Tooltip>

          {/* SEPARADOR SUPERIOR */}
          <div className="w-8 h-px bg-border/50" />

          {/* ENLACES PRINCIPALES */}
          {mainNavLinks.map((link) => {
            // Verificamos si el rol del usuario está en la lista permitida
            if (!link.roles.includes(userRole)) return null;

            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive}
              />
            );
          })}
        </nav>

        {/* CONFIGURACIÓN (ABAJO) */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {/* Solo visible para la Cúpula (Admin, Pastor, Sec. General, Tesorero General) */}
          {ROLES_ACCESO_TOTAL.includes(userRole) && (
            <>
              <div className="w-8 h-px bg-border" />
              <NavLink
                href="/configuracion"
                label="Configuración"
                icon={Settings}
                isActive={pathname.startsWith("/configuracion")}
              />
            </>
          )}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
