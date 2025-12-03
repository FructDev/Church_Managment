"use client";

import { downloadBackupJSON } from "@/actions/configuracion/configuracionActions";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BackupButton() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const data = await downloadBackupJSON();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-iglesia-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Respaldo descargado");
    } catch (e) {
      toast.error("Error al generar respaldo");
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleBackup}
      disabled={loading}
      size="lg"
      className="gap-2"
    >
      {loading ? <Loader2 className="animate-spin" /> : <Download />}
      Descargar Copia de Seguridad Completa
    </Button>
  );
}
