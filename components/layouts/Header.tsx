"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Search, Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input"; // (Opcional: Barra de búsqueda global)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/actions/auth/signOut";
import { type Database } from "@/lib/database.types";
import Image from "next/image";

// Iconos para el menú móvil (mismos que Sidebar)
import {
  Home,
  Users,
  Network,
  CalendarDays,
  Banknote,
  FileBarChart,
  Settings,
  Church,
} from "lucide-react";

type RolUsuario = Database["public"]["Enums"]["rol_usuario"];

// Replicamos los enlaces para el menú móvil
import {
  ROLES_CONSULTA,
  ROLES_ADMINISTRATIVOS,
  ROLES_FINANCIEROS,
} from "@/lib/auth/roles";

// Replicamos los enlaces para el menú móvil
const mobileLinks = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: Home,
    roles: ROLES_CONSULTA,
  },
  {
    href: "/miembros",
    label: "Membresía",
    icon: Users,
    roles: ROLES_ADMINISTRATIVOS,
  },
  {
    href: "/estructura",
    label: "Estructura",
    icon: Network,
    roles: ROLES_ADMINISTRATIVOS,
  },
  {
    href: "/actividades",
    label: "Actividades",
    icon: CalendarDays,
    roles: ROLES_CONSULTA,
  },
  {
    href: "/finanzas",
    label: "Finanzas",
    icon: Banknote,
    roles: ROLES_FINANCIEROS,
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: FileBarChart,
    roles: ROLES_CONSULTA,
  },
];

interface HeaderProps {
  userName?: string | null;
  userRole: RolUsuario;
  userEmail?: string | null;
  userAvatar?: string | null;
  churchName?: string | null;
  churchLogo?: string | null;
}

export function Header({
  userName,
  userRole,
  userEmail,
  userAvatar,
  churchName,
  churchLogo,
}: HeaderProps) {
  const pathname = usePathname();

  // Generar Breadcrumbs basados en la ruta
  // Ej: /finanzas/ingresos -> Finanzas > Ingresos
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      const label =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

      return (
        <React.Fragment key={path}>
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={href}>{label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast && (
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
          )}
        </React.Fragment>
      );
    });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* --- MENÚ MÓVIL (Sheet) --- */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              {churchLogo ? (
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={churchLogo}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Church className="h-5 w-5 transition-all group-hover:scale-110" />
              )}
              <span className="sr-only">Inicio</span>
            </Link>

            {/* Nombre de la Iglesia en el menú móvil */}
            <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider px-2.5">
              {churchName || "Gestión Iglesia"}
            </div>

            {mobileLinks.map((link) => {
              if (!link.roles.includes(userRole)) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            {userRole === "admin" && (
              <Link
                href="/configuracion"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
                Configuración
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* --- BREADCRUMBS (Escritorio) --- */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== "/dashboard" && (
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
          )}
          {generateBreadcrumbs()}
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- BARRA DE BÚSQUEDA (Opcional - Placeholder) --- */}
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>

      {/* --- MENÚ DE USUARIO --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage
                src={userAvatar || undefined}
                alt={userName || "Usuario"}
              />
              <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName || "Usuario"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded-sm mb-1">
            Rol:{" "}
            <span className="capitalize text-primary">
              {userRole.replace("_", " ")}
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración de Cuenta</DropdownMenuItem>
          {/* <DropdownMenuItem>Soporte</DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

import React from "react"; // Necesario para React.Fragment
