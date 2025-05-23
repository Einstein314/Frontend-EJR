// src/components/formativa-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

import { API_URL } from "../config";

interface FormativaFormProps {
  userId: Number;
  userName: string;

  onBack: () => void;
}

export function FormativaForm({ userId, userName, onBack }: FormativaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    comunicacao: "",
    profissionalismo: "",
    criatividadeEInovacao: "",
    responsabilidade: "",
    presencaEAssiduidade: "",
    produtividade: "",
    perguntaAberta1: "",
    perguntaAberta2: "",
    perguntaAberta3: "",
  });

  // Injeta o recipientId do storage assim que o componente monta
  useEffect(() => {
    const stored = localStorage.getItem("user_id");  // ou "recipient_id", conforme seu login
    if (stored) setRecipientId(Number(stored));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientId === null) {
      toast.error("ID do destinatário não encontrado");
      return;
    }
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Usuário não autenticado");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      recipient_id: userId,
      forcas: formData.perguntaAberta1,
      sugestoes: formData.perguntaAberta2,
      potencial: formData.perguntaAberta3,
      produtividade: Number(formData.produtividade),
      presenca: Number(formData.presencaEAssiduidade),
      responsabilidade: Number(formData.responsabilidade),
      criatividade: Number(formData.criatividadeEInovacao),
      comunicacao: Number(formData.comunicacao),
      profissionalismo: Number(formData.profissionalismo),
    };

    console.log("Payload enviado:", payload);

    try {
      const res = await fetch(`${API_URL}/feedbacks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Status ${res.status}: ${err}`);
      }

      await res.json();
      toast.success("Feedback enviado com sucesso!");
      setTimeout(onBack, 1500);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Falha ao enviar feedback.");
      setIsSubmitting(false);
    }
  };

  const ratings = [1, 2, 3, 4, 5];
  const labelText = (v: number) =>
    v === 1
      ? "Não está de acordo com a expectativa"
      : v === 2
      ? "Está de acordo com algumas expectativas"
      : v === 3
      ? "Está de acordo com as expectativas"
      : v === 4
      ? "Excede às expectativas"
      : "Supera em muito às expectativas";

  return (
    <div className="bg-white">
      <Toaster position="bottom-right" />
      <Button variant="ghost" onClick={onBack} className="mr-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <div className="max-w-3xl mx-auto py-6 px-4">
        
        <div className="flex items-center mb-6">
          
          <h1 className="text-3xl font-bold text-[#1a2e4c]">
            Avaliação Formativa
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-bold text-[#1a2e4c] mb-2">
            Avaliando: {userName}
          </h2>
          <p className="text-gray-600 mb-4">
            Avalie o desempenho do colaborador em cada uma das competências
            abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 9. Comunicação */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              1. COMUNICAÇÃO
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>
                * Mantém uma comunicação efetiva com colegas, lideranças e
                clientes.
              </p>
              <p>
                * Busca sempre realizar discussões construtivas e é capaz de
                mediar conversas complexas para uma resolução.
              </p>
              <p>
                Avalie a qualidade "comunicação" da pessoa analisada. Selecione
                uma das opções abaixo que melhor representa sua avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`comunicacao-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`comunicacao-${v}`}
                    name="comunicacao"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label htmlFor={`comunicacao-${v}`} className="text-sm">
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Profissionalismo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              2. PROFISSIONALISMO
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>
                * Adapta-se de forma rápida a mudança de rotina sem que exista
                queda no desempenho.
              </p>
              <p>
                Avalie a qualidade "profissionalismo" da pessoa analisada.
                Selecione uma das opções abaixo que melhor representa sua
                avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`profissionalismo-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`profissionalismo-${v}`}
                    name="profissionalismo"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label htmlFor={`profissionalismo-${v}`} className="text-sm">
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 11. Criatividade e Inovação */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              3. CRIATIVIDADE E INOVAÇÃO
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>
                * Aplica uma visão criativa e inovadora no dia-a-dia para
                encontrar novas soluções.
              </p>
              <p>
                * Mostra iniciativa para com o desenvolvimento de novas formas
                de pensamento que auxiliam no desenvolvimento do negócio.
              </p>
              <p>
                Avalie as qualidades "criatividade e inovação" da pessoa
                analisada. Selecione uma das opções abaixo que melhor
                representa sua avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`criatividadeEInovacao-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`criatividadeEInovacao-${v}`}
                    name="criatividadeEInovacao"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label
                    htmlFor={`criatividadeEInovacao-${v}`}
                    className="text-sm"
                  >
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 12. Responsabilidade */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              4. RESPONSABILIDADE
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>* Estabelece metas bem pensadas e se esforça continuamente.</p>
              <p>
                Avalie a qualidade "responsabilidade" da pessoa analisada.
                Selecione uma das opções abaixo que melhor representa sua
                avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`responsabilidade-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`responsabilidade-${v}`}
                    name="responsabilidade"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label htmlFor={`responsabilidade-${v}`} className="text-sm">
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 13. Presença e Assiduidade */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              5. PRESENÇA E ASSIDUIDADE
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>
                * Começa cada dia totalmente revigorado e preparado para
                quaisquer desafios.
              </p>
              <p>
                Avalie as qualidades "presença e assiduidade" da pessoa
                analisada. Selecione uma das opções abaixo que melhor
                representa sua avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`presencaEAssiduidade-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`presencaEAssiduidade-${v}`}
                    name="presencaEAssiduidade"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label
                    htmlFor={`presencaEAssiduidade-${v}`}
                    className="text-sm"
                  >
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 14. Produtividade */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              6. PRODUTIVIDADE
            </h3>
            <div className="text-gray-700 mt-1 mb-3">
              <p>
                * Contribui positivamente para o desempenho geral da empresa
                através de um trabalho consistente e de alta qualidade.
              </p>
              <p>
                * Esforça-se continuamente para melhorar os resultados, a
                produtividade e as metas de desempenho.
              </p>
              <p>
                * Mostra forte habilidade de gerenciamento de tempo e
                organização.
              </p>
              <p>
                Avalie a qualidade "produtividade" da pessoa analisada.
                Selecione uma das opções abaixo que melhor representa sua
                avaliação:
              </p>
            </div>
            <div className="space-y-2">
              {ratings.map((v) => (
                <div
                  key={`produtividade-${v}`}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    id={`produtividade-${v}`}
                    name="produtividade"
                    value={v}
                    onChange={handleChange}
                    className="h-4 w-4"
                    required
                  />
                  <label htmlFor={`produtividade-${v}`} className="text-sm">
                    {`${v} - ${labelText(v)}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Perguntas abertas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              Observações Gerais
            </h3>
            <textarea
              name="perguntaAberta1"
              value={formData.perguntaAberta1}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-md"
              rows={4}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              Sugestões de Melhoria
            </h3>
            <textarea
              name="perguntaAberta2"
                    value={formData.perguntaAberta2}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-md"
              rows={4}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#1a2e4c]">
              Comentários Finais
            </h3>
            <textarea
              name="perguntaAberta3"
              value={formData.perguntaAberta3}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-md"
              rows={4}
            />
          </div>

          <div className="flex justify-end pb-10">
            <Button
              type="submit"
              className="bg-[#1a2e4c] hover:bg-[#2a3e5c] text-white px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
