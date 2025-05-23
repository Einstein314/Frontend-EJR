import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import { toast, Toaster } from "sonner";
import { API_URL } from "../config";


interface ApiUser {
  id: number;
  username: string;
}

interface Feedback {
  id: number;
  sender: ApiUser;
  forcas: string;
  sugestoes: string;
  potencial: string;
  comunicacao: number;
  profissionalismo: number;
  criatividade: number;
  responsabilidade: number;
  presenca: number;
  produtividade: number;
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar autenticado para ver os feedbacks");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/feedbacks/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data: Feedback[]) => {
        setFeedbacks(data);
      })
      .catch((err) => {
        console.error("Falha ao carregar feedbacks:", err);
        toast.error("Não foi possível carregar seus feedbacks");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleConcluir = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token não encontrado. Faça login novamente.");
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/feedbacks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao concluir feedback ${id}: ${errorText}`);
      }
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
      toast.success("Feedback concluído com sucesso.");
    } catch (error: any) {
      console.error(error);
      toast.error("Falha ao concluir feedback.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 md:px-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <Toaster position="bottom-right" />
      <Card className="w-full max-w-6xl rounded-2xl border-none bg-white/80 shadow-xl backdrop-blur-md dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold text-[#0e2a47] dark:text-slate-100">
            <MessageSquareText size={26} /> Meus Feedbacks
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Visualize aqui todos os feedbacks recebidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-center">Carregando...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center">Nenhum feedback encontrado.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:ring-slate-700"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <p>
                      <strong>Observações:</strong> {fb.forcas}
                    </p>
                    <p>
                      <strong>Sugestões:</strong> {fb.sugestoes}
                    </p>
                    <p>
                      <strong>Comentários Finais:</strong> {fb.potencial}
                    </p>
                    <p>
                      <strong>Comunicação:</strong> {fb.comunicacao}/4
                    </p>
                    <p>
                      <strong>Profissionalismo:</strong> {fb.profissionalismo}/4
                    </p>
                    <p>
                      <strong>Criatividade:</strong> {fb.criatividade}/4
                    </p>
                    <p>
                      <strong>Responsabilidade:</strong> {fb.responsabilidade}/4
                    </p>
                    <p>
                      <strong>Presença:</strong> {fb.presenca}/4
                    </p>
                    <p>
                      <strong>Produtividade:</strong> {fb.produtividade}/4
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      disabled={deletingId === fb.id}
                      onClick={() => handleConcluir(fb.id)}
                    >
                      {deletingId === fb.id ? 'Concluindo...' : 'Concluir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
