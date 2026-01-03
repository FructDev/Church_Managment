"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UserPlus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface MemberSelectProps {
    // Lista de miembros reales de la base de datos
    miembros: { id: string; nombre_completo: string }[];

    // El ID seleccionado actualmente (si es miembro)
    value?: string | null;

    // El nombre escrito manualmente (si es externo)
    externalName?: string | null;

    // Función que devuelve la selección al formulario padre
    onChange: (val: { id: string | null; nombre: string }) => void;
}

export function DiezmoMemberSelect({
    miembros,
    value,
    externalName,
    onChange,
}: MemberSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Lógica para decidir qué texto mostrar en el botón
    const selectedMember = miembros.find((m) => m.id === value);

    let displayText = "Seleccionar miembro o escribir...";

    if (selectedMember) {
        displayText = selectedMember.nombre_completo;
    } else if (externalName) {
        displayText = `${externalName} (Externo)`;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between text-left font-normal",
                        !value && !externalName && "text-muted-foreground"
                    )}
                >
                    <span className="truncate flex items-center gap-2">
                        {/* Mostramos ícono diferente si es miembro o externo */}
                        {value ? <User className="h-4 w-4" /> : externalName ? <UserPlus className="h-4 w-4" /> : null}
                        {displayText}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Buscar miembro o escribir nombre..."
                        onValueChange={(val: React.SetStateAction<string>) => setSearchTerm(val)}
                    />
                    <CommandList>
                        {/* Si no encuentra miembros, ofrece crear externo */}
                        <CommandEmpty className="py-3 px-2">
                            <p className="text-sm text-muted-foreground mb-3 text-center">
                                No se encontró "{searchTerm}"
                            </p>

                            {searchTerm.length > 2 && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-xs h-auto py-2 whitespace-normal text-left flex items-center justify-start gap-2"
                                    onClick={() => {
                                        // AQUÍ ESTÁ LA MAGIA:
                                        // Enviamos ID null (no es miembro) y el texto como nombre
                                        onChange({ id: null, nombre: searchTerm });
                                        setOpen(false);
                                    }}
                                >
                                    <UserPlus className="h-4 w-4 shrink-0 text-blue-600" />
                                    <span>
                                        Registrar <strong>"{searchTerm}"</strong> como Donante Externo
                                    </span>
                                </Button>
                            )}
                        </CommandEmpty>

                        <CommandGroup heading="Miembros de la Iglesia">
                            {miembros.map((miembro) => (
                                <CommandItem
                                    key={miembro.id}
                                    value={miembro.nombre_completo}
                                    onSelect={() => {
                                        // Si selecciona uno de la lista, enviamos su ID
                                        onChange({ id: miembro.id, nombre: miembro.nombre_completo });
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === miembro.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {miembro.nombre_completo}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}