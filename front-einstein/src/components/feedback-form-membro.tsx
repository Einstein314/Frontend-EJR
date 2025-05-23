"use client";

import * as React from "react";
import { differenceInMinutes } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";

export interface PontoDoc {
  id: number;
  data: string;
  hora_entrada: string;
  hora_saida: string;
  documento: string;
  aprovado: boolean | null;
}

interface EditPontoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ponto: PontoDoc;
  onPontoUpdate?: (updated: PontoDoc) => void;
}

import { API_URL } from "../config";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function EditPontoForm({
  open,
  onOpenChange,
  ponto,
  onPontoUpdate,
}: EditPontoFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [documento, setDocumento] = React.useState(ponto.documento);

  React.useEffect(() => {
    setDocumento(ponto.documento);
  }, [ponto.id, ponto.documento]);

  const minutos = Math.max(
    0,
    differenceInMinutes(new Date(ponto.hora_saida), new Date(ponto.hora_entrada))
  );
  const duracao = `${Math.floor(minutos / 60)}h${(minutos % 60)
    .toString()
    .padStart(2, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Inclui aprovado: null para resetar o status
    const payload = { 
      documento,
      aprovado: null,
    };

    try {
      const resp = await fetch(`${API_URL}/pontos/${ponto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        const updated: PontoDoc = await resp.json();
        toast.success("Dados atualizados com sucesso");
        onOpenChange(false);
        onPontoUpdate?.(updated);
      } else {
        const errData = await resp.json();
        let msg = "Erro ao atualizar dados";
        if (Array.isArray(errData.detail)) msg = errData.detail.map((e: any) => e.msg).join(', ');
        else if (typeof errData.detail === 'string') msg = errData.detail;
        else if (errData.message) msg = errData.message;
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro de rede");
    }
  };

  const formJSX = (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Data</h3>
          </div>
          <Input
            readOnly
            value={new Date(ponto.data).toLocaleDateString('pt-BR')}
            className="bg-white border-gray-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Hora Entrada</h3>
          </div>
          <Input
            readOnly
            value={new Date(ponto.hora_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            className="bg-white border-gray-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Hora Saída</h3>
          </div>
          <Input
            readOnly
            value={new Date(ponto.hora_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            className="bg-white border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Documento</h3>
          </div>
          <Input
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="border-gray-200"
          />
        </div>
        <div className="flex justify-end items-end">
          <Button type="submit" className="bg-[#0e2a47] hover:bg-[#1a3c5e] text-white">
            SALVAR
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <>
      <Toaster />
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-gray-100 border-none shadow-xl">
            <DialogHeader className="p-4 flex items-center border-b">
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-[#0e2a47] font-bold">Editar Ponto</DialogTitle>
            </DialogHeader>
            {formJSX}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="bg-gray-100">
            <DrawerHeader className="flex items-center border-b pb-2">
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </DrawerClose>
              <DrawerTitle className="text-[#0e2a47] font-bold">Editar Ponto</DrawerTitle>
            </DrawerHeader>
            {formJSX}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
