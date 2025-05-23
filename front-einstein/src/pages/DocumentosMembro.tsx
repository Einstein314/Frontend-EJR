"use client"

import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditPontoForm } from "@/components/feedback-form-membro";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

interface PontoRaw {
  id: number;
  user_id: number;
  data: string;
  hora_entrada: string;
  hora_saida: string;
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

export default function DocumentosMembroPage() {
  const [pontos, setPontos] = useState<PontoRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPonto, setSelectedPonto] = useState<PontoRaw | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const userRole = localStorage.getItem("user_role") ?? "";
  if (userRole !== "membro") {
    return <Navigate to="/login" replace />;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pontosRaw = await fetchPontos();
      setPontos(pontosRaw);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(pontos.length / itemsPerPage);
  const pageSlice = pontos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdatePonto = async (updated: PontoRaw) => {
    try {
      const res = await fetch(`${API_URL}/pontos/${updated.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Falha ao atualizar ponto");
      setIsFormOpen(false);
      setSelectedPonto(null);
      loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar");
    }
  };

  const handleEdit = (ponto: PontoRaw) => {
    setSelectedPonto(ponto);
    setIsFormOpen(true);
  };

  if (loading) return <p className="p-8">Carregando…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <div className="bg-white rounded-md shadow-sm p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0e2a47] mb-2">Meus Pontos</h1>
        <p className="text-sm text-gray-500 mb-6">Lista de registros de ponto</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left">Data</th>
                <th className="px-4 py-2 border-b text-left">Hora Entrada</th>
                <th className="px-4 py-2 border-b text-left">Hora Saída</th>
                <th className="px-4 py-2 border-b text-center">Editar</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{format(new Date(p.data), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3 border-b">{format(new Date(p.hora_entrada), "HH:mm")}</td>
                  <td className="px-4 py-3 border-b">{format(new Date(p.hora_saida), "HH:mm")}</td>
                  <td className="px-4 py-3 border-b text-center">
                    <Button
                      className="bg-[#0e2a47] hover:bg-[#1a3c5e] text-white text-xs px-4 py-1 h-8"
                      onClick={() => handleEdit(p)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage((pg) => Math.min(totalPages, pg + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-600">Página {currentPage} de {totalPages || 1}</span>
        </div>
      </div>

      {isFormOpen && selectedPonto && (
        <EditPontoForm
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPonto(null);
              loadData();
            }
            setIsFormOpen(open);
          }}
          ponto={selectedPonto}
          onSubmit={handleUpdatePonto}
        />
      )}
    </div>
  );
}
