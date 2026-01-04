"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Church, Menu, X } from "lucide-react";

interface LandingHeaderProps {
    logoUrl?: string | null;
}

export function LandingHeader({ logoUrl }: LandingHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* LOGO */}
                <div className="flex items-center gap-2">
                    {logoUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Image
                                src={logoUrl}
                                alt="Logo Iglesia"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
                            <Church className="h-6 w-6" />
                        </div>
                    )}
                    <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline-block">
                        Fuente de Salvación
                    </span>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link
                        href="#about"
                        className="text-slate-600 hover:text-blue-700 transition-colors"
                    >
                        Nosotros
                    </Link>
                    <Link
                        href="#schedule"
                        className="text-slate-600 hover:text-blue-700 transition-colors"
                    >
                        Horarios
                    </Link>
                    <Link
                        href="#location"
                        className="text-slate-600 hover:text-blue-700 transition-colors"
                    >
                        Ubicación
                    </Link>
                </nav>

                {/* DESKTOP CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login">
                        <Button
                            variant="default"
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                        >
                            Admin Access
                        </Button>
                    </Link>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={toggleMenu}>
                        {isMenuOpen ? (
                            <X className="h-6 w-6 text-slate-900" />
                        ) : (
                            <Menu className="h-6 w-6 text-slate-900" />
                        )}
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </div>
            </div>

            {/* MOBILE NAV DROPDOWN */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white px-4 py-6 shadow-lg">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href="#about"
                            className="text-base font-medium text-slate-600 hover:text-blue-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Nosotros
                        </Link>
                        <Link
                            href="#schedule"
                            className="text-base font-medium text-slate-600 hover:text-blue-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Horarios
                        </Link>
                        <Link
                            href="#location"
                            className="text-base font-medium text-slate-600 hover:text-blue-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Ubicación
                        </Link>
                        <div className="pt-4 border-t">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                                    Admin Access
                                </Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
