"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Bell, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/custom-dropdown";

interface Aviso {
  id: number;
  titulo: string;
  descricao: string;
  data: string; // dd/mm
}

import { API_URL } from "../config";

type Ordenacao = "maisRecente" | "maisAntiga" | "az" | "za";

interface NovoAvisoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    data: string;
  }) => void;
  initialData?: {
    titulo: string;
    descricao: string;
    data: string;
  };
}

function NovoAvisoForm({ open, onOpenChange, onSubmit, initialData }: NovoAvisoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitulo(initialData.titulo);
        setDescricao(initialData.descricao);
        setData(initialData.data);
      } else {
        setTitulo("");
        setDescricao("");
        setData("");
      }
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ titulo, descricao, data });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? "Editar Aviso" : "Novo Aviso"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <Input placeholder="Data (dd/mm)" value={data} onChange={(e) => setData(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{initialData ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type AvisoCardProps = {
  aviso: Aviso;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
};

function AvisoCard({ aviso, onEdit, onDelete, canEdit }: AvisoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900/60 dark:ring-slate-700"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-400/10">
          <Bell className="h-5 w-5 text-text-blue-700 dark:text-indigo-300" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold leading-tight text-slate-800 dark:text-slate-100">{aviso.titulo}</span>
          {aviso.descricao && (
            <span className="text-sm text-slate-600 dark:text-slate-400">{aviso.descricao}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
        <span className="mt-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{aviso.data}</span>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
              <Edit3 className="mr-1 h-4 w-4" /> Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
              <Trash2 className="mr-1 h-4 w-4" /> Excluir
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("maisRecente");
  const [pesquisa, setPesquisa] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role"));
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${API_URL}/avisos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar avisos");
      const data = await res.json();
      const formatados = data.map((aviso: any) => {
        const dt = new Date(aviso.data);
        const dia = dt.getDate().toString().padStart(2, "0");
        const mes = (dt.getMonth() + 1).toString().padStart(2, "0");
        return {
          id: aviso.id,
          titulo: aviso.titulo ?? "",
          descricao: aviso.texto ?? "",
          data: `${dia}/${mes}`,
        };
      });
      setAvisos(formatados);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar os avisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const avisosOrdenados = useMemo(() => {
    const parseDate = (d: string) => {
      const [dd, mm] = d.split("/").map(Number);
      return new Date(2025, mm - 1, dd).getTime();
    };
    return avisos
      .filter((a) => a.titulo.toLowerCase().includes(pesquisa.toLowerCase()))
      .sort((a, b) => {
        switch (ordenacao) {
          case "maisRecente": return parseDate(b.data) - parseDate(a.data);
          case "maisAntiga": return parseDate(a.data) - parseDate(b.data);
          case "az": return a.titulo.localeCompare(b.titulo);
          case "za": return b.titulo.localeCompare(a.titulo);
          default: return 0;
        }
      });
  }, [avisos, pesquisa, ordenacao]);

  const handleNovoAviso = async (d: { titulo: string; descricao: string; data: string }) => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const [dd, mm] = d.data.split("/");
      const iso = `2025-${mm}-${dd}`;
      const res = await fetch(`${API_URL}/avisos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo: d.titulo, texto: d.descricao, data: iso }),
      });
      if (!res.ok) throw new Error();
      await fetchAvisos();
      setFormOpen(false);
    } catch {
      alert("Erro ao criar aviso");
    }
  };

  const handleEditClick = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setEditFormOpen(true);
  };

  const handleUpdateAviso = async (d: { titulo: string; descricao: string; data: string }) => {
    if (!editingAviso) return;
    try {
      const token = localStorage.getItem("token") ?? "";
      const [dd, mm] = d.data.split("/");
      const iso = `2025-${mm}-${dd}`;
      const res = await fetch(`${API_URL}/avisos/${editingAviso.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo: d.titulo, texto: d.descricao, data: iso }),
      });
      if (!res.ok) throw new Error();
      await fetchAvisos();
      setEditFormOpen(false);
      setEditingAviso(null);
    } catch {
      alert("Erro ao atualizar aviso");
    }
  };

  const handleDeleteAviso = async (id: number) => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${API_URL}/avisos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      await fetchAvisos();
    } catch {
      alert("Erro ao excluir aviso");
    }
  };

  if (loading) return <p className="p-8 text-center">Carregando avisos...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 md:px-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-6xl rounded-2xl border-none bg-white/80 shadow-xl backdrop-blur-md dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold text-[#0e2a47] dark:text-slate-100">
            <Bell size={26} /> Avisos
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Central de comunicados e atualizações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
              <Input placeholder="Pesquisar..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className="pl-10" />
            </div>
            <CustomDropdown options={[{ label: "Mais recente", value: "maisRecente" }, { label: "Mais antiga", value: "maisAntiga" }, { label: "A‒Z", value: "az" }, { label: "Z‒A", value: "za" }]} value={ordenacao} onChange={(v) => setOrdenacao(v as Ordenacao)} label="Ordenar por" width="w-56" />
          </div>
          <div className="flex max-h-[560px] flex-col gap-4 overflow-y-auto pr-1">
            {avisosOrdenados.map((aviso) => (
              <AvisoCard key={aviso.id} aviso={aviso} onEdit={() => handleEditClick(aviso)} onDelete={() => handleDeleteAviso(aviso.id)} canEdit={userRole !== "membro" && userRole !== "conselheiro"} />
            ))}
          </div>
        </CardContent>
        {userRole !== "membro" && userRole !== "conselheiro" && (
          <CardFooter className="justify-center">
            <Button className="group flex items-center gap-2 rounded-full bg-[#0e2a47] px-8 py-5 text-lg font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#3a5a77] hover:shadow-lg focus:ring-2 focus:ring-[#3a5a77] active:translate-y-0 dark:bg-[#0e2a47] dark:hover:bg-[#3a5a77]" onClick={() => setFormOpen(true)}>
              <PlusCircle className="h-5 w-5 text-white transition-transform group-hover:rotate-45" />
              Novo Aviso
            </Button>
          </CardFooter>
        )}
      </Card>
      <NovoAvisoForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleNovoAviso} />
      <NovoAvisoForm open={editFormOpen} onOpenChange={(open) => { setEditFormOpen(open); if (!open) setEditingAviso(null); }} initialData={editingAviso ? { titulo: editingAviso.titulo, descricao: editingAviso.descricao, data: editingAviso.data } : undefined} onSubmit={handleUpdateAviso} />
    </div>
  );
}
