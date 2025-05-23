// src/components/feedback-form.tsx

"use client";

import * as React from "react";
import { differenceInMinutes } from "date-fns";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Check,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export interface PontoDoc {
  id: number;
  nome: string;
  curso?: string | null;
  data: string;
  hora_entrada: string;
  hora_saida: string;
  documento: string;
  aprovado: boolean;
  user_id: number;
  comentario?: string | null;
}

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ponto: PontoDoc;
  onPontoUpdate?: (updated: PontoDoc) => void;
  checkId: number;
  userId: number;
}

import { API_URL } from "../config";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function FeedbackForm({
  open,
  onOpenChange,
  ponto,
  onPontoUpdate,
  checkId,
  userId,
}: FeedbackFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Comentários: ponto e check
  const [pontoComentario, setPontoComentario] = React.useState(ponto.comentario ?? "");
  const [checkComentario, setCheckComentario] = React.useState("");
  const [aprovado, setAprovado] = React.useState(ponto.aprovado ? "sim" : "nao");

  React.useEffect(() => {
    setPontoComentario(ponto.comentario ?? "");
    setCheckComentario("");
    setAprovado(ponto.aprovado ? "sim" : "nao");
  }, [ponto.id, ponto.comentario, ponto.aprovado]);

  const minutos = Math.max(
    0,
    differenceInMinutes(
      new Date(ponto.hora_saida),
      new Date(ponto.hora_entrada)
    )
  );
  const duracao = `${Math.floor(minutos / 60)}h${(
    minutos % 60
  )
    .toString()
    .padStart(2, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aprov = aprovado === "sim";

    try {
      // Atualiza o ponto com comentário próprio
      const pontoResp = await fetch(`${API_URL}/pontos/${ponto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ aprovado: aprov, comentario: pontoComentario }),
      });
      if (!pontoResp.ok) {
        const err = await pontoResp.json();
        throw new Error(err.detail || "Falha ao atualizar ponto");
      }

      // Cria/atualiza o check com comentário de feedback
      const checkPayload = {
        id: checkId,
        id_ponto: ponto.id,
        status: aprov,
        comentario: checkComentario,
        user_id: userId,
      };
      const checkResp = await fetch(`${API_URL}/checks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(checkPayload),
      });
      if (!checkResp.ok) {
        const err = await checkResp.json();
        throw new Error(err.detail || "Falha ao criar check");
      }

      toast.success("Ponto e feedback atualizados com sucesso");
      onOpenChange(false);
      onPontoUpdate?.({ ...ponto, aprovado: aprov, comentario: pontoComentario });
    } catch (err: any) {
      toast.error(err.message || "Erro de rede");
    }
  };

  const FormContent = (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
    >
      {/* Coluna 1: dados do ponto + comentário do ponto */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Nome</h3>
          </div>
          <Input readOnly value={ponto.nome} className="bg-white border-gray-200" />
        </div>
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
            <h3 className="font-medium text-[#0e2a47]">Horas</h3>
          </div>
          <Input readOnly value={duracao} className="bg-white border-gray-200" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Documento</h3>
          </div>
          <Input readOnly value={ponto.documento} className="bg-white border-gray-200" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Comentário do Ponto</h3>
          </div>
          <Textarea
            value={pontoComentario}
            onChange={(e) => setPontoComentario(e.target.value)}
            className="bg-white border-gray-200 min-h-[120px]"
            placeholder="Insira comentário do ponto…"
          />
        </div>
      </div>

      {/* Coluna 2: feedback (check) */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Comentários do Check</h3>
          </div>
          <Textarea
            value={checkComentario}
            onChange={(e) => setCheckComentario(e.target.value)}
            className="bg-white border-gray-200 min-h-[120px]"
            placeholder="Insira comentário de feedback…"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-[#0e2a47]" />
            <h3 className="font-medium text-[#0e2a47]">Aprovar</h3>
          </div>
          <RadioGroup value={aprovado} onValueChange={setAprovado} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="sim" />
              <Label htmlFor="sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="nao" />
              <Label htmlFor="nao">Não</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end col-span-full">
          <Button type="submit" className="bg-[#0e2a47] hover:bg-[#1a3c5e] text-white">
            ENVIAR
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
            <DialogHeader className="p-4 flex items-center gap-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-[#0e2a47] font-bold">Feedback</DialogTitle>
            </DialogHeader>
            {FormContent}
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
              <DrawerTitle className="text-[#0e2a47] font-bold">Feedback</DrawerTitle>
            </DrawerHeader>
            {FormContent}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}