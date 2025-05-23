// src/app/formativa/FormativaPage.tsx
"use client"

import React, { useState, useEffect } from "react"
import { SearchableDropdown } from "@/components/searchable-dropdown"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { FormativaForm } from "@/components/formativa-form"

import { API_URL } from "../config";


function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface ApiUser {
  id: number
  username: string
  full_name: string
}

export default function FormativaPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token.trim() === "") {
    toast.error("Você precisa estar autenticado");
    return;
  }

  setLoading(true);

  fetch(`${API_URL}/usuarios`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    })
    .then((data: ApiUser[]) => setUsers(data))
    .catch((err) => {
      console.error(err);
      toast.error("Não foi possível carregar usuários");
    })
    .finally(() => setLoading(false));
}, []);

  const handleStartAssessment = () => {
    if (!selectedUser) {
      toast.error("Selecione um usuário", {
        description:
          "É necessário selecionar um usuário antes de começar a avaliação",
        action: { label: "Ok", onClick: () => {} },
      })
      return
    }
    setShowForm(true)
  }

  if (showForm && selectedUser) {
    return (
      <FormativaForm
        userId={selectedUser.id}
        userName={selectedUser.full_name}
        onBack={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Toaster position="bottom-right" />
      <div className="max-w-md mx-auto pt-20 px-4 pb-20">
        <h1 className="text-3xl font-bold text-[#1a2e4c] mb-10 text-center">
          Avaliação Formativa
        </h1>

        <div className="mb-6">
          <label htmlFor="user-select" className="block mb-2 text-[#1a2e4c]">
            Selecione o usuário:
          </label>
          {loading ? (
            <p className="text-center text-gray-500">Carregando usuários...</p>
          ) : (
            <SearchableDropdown
              id="user-select"
              options={users.map((u) => u.full_name)}
              value={selectedUser?.full_name || ""}
              onChange={(val) => {
                const usr = users.find((u) => u.full_name === val) || null
                setSelectedUser(usr)
              }}
              placeholder="Selecione ou digite..."
            />
          )}
        </div>

        <div className="text-center">
          <Button
            onClick={handleStartAssessment}
            disabled={loading}
            className="bg-[#1a2e4c] hover:bg-[#2a3e5c] text-white"
          >
            Iniciar Avaliação
          </Button>
        </div>
      </div>
    </div>
  )
}
