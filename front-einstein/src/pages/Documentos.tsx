"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

interface PontoRaw {
  id: number;
  user_id: number;
  data: string;
  hora_entrada: string;
  hora_saida: string;
  comentario?: string;
  documento: string;
  aprovado: boolean | null;
}

interface UsuarioMini {
  id: number;
  [key: string]: any;
}

interface PontoDoc extends PontoRaw {
  nome: string;
  curso?: string | null;
}

import { API_URL } from "../config";


function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchPontos(): Promise<PontoRaw[]> {
  const res = await fetch(`${API_URL}/pontos`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Falha ao buscar pontos");
  return res.json();
}

async function fetchUsuarios(): Promise<UsuarioMini[]> {
  const res = await fetch(`${API_URL}/usuarios`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Falha ao buscar usuários");
  return res.json();
}

function extrairNome(u: UsuarioMini): string | undefined {
  if (u.nome) return u.nome;
  if (u.username) return u.username;
  if (u.full_name) return u.full_name;
  if (u.first_name || u.last_name)
    return `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return undefined;
}

export default function DocumentosPage() {
  const [pontos, setPontos] = useState<PontoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPonto, setSelectedPonto] = useState<PontoDoc | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const userRole = localStorage.getItem("user_role") ?? ""

  // bloqueia acesso caso seja membro
  if (userRole === "membro") {
    return <Navigate to="/login" replace />
  }


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usuarios, pontosRaw] = await Promise.all([
        fetchUsuarios(),
        fetchPontos(),
      ]);
      const map = Object.fromEntries(usuarios.map((u) => [u.id, u]));
      const merged: PontoDoc[] = pontosRaw
        .filter((p) => p.aprovado === null)
        .map((p) => ({
          ...p,
          nome: extrairNome(map[p.user_id] ?? {}) ?? "—",
          curso: map[p.user_id]?.curso ?? map[p.user_id]?.course ?? "—",
        }));
      setPontos(merged);
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(pontos.length / itemsPerPage);
  const pageSlice = useMemo(
    () =>
      pontos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [pontos, currentPage]
  );

  const handleAnalisar = (ponto: PontoDoc) => {
    setSelectedPonto(ponto);
    setIsFormOpen(true);
  };

  if (loading) return <p className="p-8">Carregando…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <div className="bg-white rounded-md shadow-sm p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0e2a47] mb-2">Documentos</h1>
        <p className="text-sm text-gray-500 mb-6">
          Lista de comprovantes enviados em pontos digitais para análise
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left">Nome</th>
                <th className="px-4 py-2 border-b text-left">Curso</th>
                <th className="px-4 py-2 border-b text-left">Data</th>

                <th className="px-4 py-2 border-b text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{p.nome}</td>
                  <td className="px-4 py-3 border-b">{p.curso}</td>
                  <td className="px-4 py-3 border-b">
                    {format(new Date(p.data), "dd/MM/yyyy")}
                  </td>

                  <td className="px-4 py-3 border-b">
                    <div className="flex justify-center">
                      <Button
                        className="bg-[#0e2a47] hover:bg-[#1a3c5e] text-white text-xs px-4 py-1 h-8"
                        onClick={() => handleAnalisar(p)}
                      >
                        Analisar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((pg) => Math.min(totalPages, pg + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages || 1}
          </span>
        </div>
      </div>

      {isFormOpen && selectedPonto && (
        <FeedbackForm
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPonto(null);
              loadData();
            }
            setIsFormOpen(open);
          }}
          ponto={selectedPonto}
          userId={selectedPonto.user_id}    // <-- novo
        />
      )}
    </div>
  );
}
