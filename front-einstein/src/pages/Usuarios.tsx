"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Users,
  Building,
  Briefcase,
  Mail,
  Plus,
  Search,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NovoUsuarioForm } from "@/components/novo-usuario-form"
import { Input } from "@/components/ui/input"
import { CustomDropdown } from "@/components/custom-dropdown"

export interface Usuario {
  id: number
  nome: string
  curso: string
  turma: string
  nucleo: string
  role: string
  email: string
}

import { API_URL } from "../config";

type Ordenacao = "az" | "za"

function mapUsuario(u: any): Usuario {
  return {
    id: u.id,
    nome: u.full_name || u.nome || "—",
    curso: u.curso || "",
    turma: u.turma || "",
    nucleo: u.nucleo || "",
    role: u.role || "",
    email: u.email || "",
  }
}

export default function UsuariosPage() {
  // obtém role do usuário e define permissão de modificação
  const userRole = localStorage.getItem("user_role") ?? ""
  const canModify = userRole !== "conselheiro"

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [pesquisa, setPesquisa] = useState("")
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("az")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token") ?? ""
        const res = await fetch(`${API_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const msg = (await res.json())?.detail ?? res.statusText
          throw new Error(msg)
        }
        const data = await res.json()
        const listaRaw = Array.isArray(data) ? data : data.usuarios ?? []
        setUsuarios(listaRaw.map(mapUsuario))
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsuarios()
  }, [])

  const filteredUsuarios = useMemo(() => {
    const termo = pesquisa.toLowerCase()
    const userNucleo = localStorage.getItem("user_nucleo") ?? ""
    const isPrivileged = userRole === "presidente"

    return usuarios
      .filter((u) =>
        u.nome.toLowerCase().includes(termo) &&
        (isPrivileged || u.nucleo === userNucleo)
      )
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      )
  }, [usuarios, pesquisa, ordenacao, userRole])

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)

  // CREATE
  const handleAddUsuario = async (formData: Omit<Usuario, "id"> & { password?: string }) => {
    if (!canModify) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token") ?? ""
      const payload = {
        username: formData.nome,
        full_name: formData.nome,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nucleo: formData.nucleo,
        curso: formData.curso,
        turma: formData.turma,
      }
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.detail ?? res.statusText)
      }
      const created = await res.json()
      setUsuarios((prev) => [...prev, mapUsuario(created)])
      setIsFormOpen(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // UPDATE
  const handleUpdateUsuario = async (formData: Omit<Usuario, "id">) => {
    if (!canModify || !selectedUsuario) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token") ?? ""
      const payload = {
        username: formData.nome,
        full_name: formData.nome,
        email: formData.email,
        role: formData.role,
        nucleo: formData.nucleo,
        curso: formData.curso,
        turma: formData.turma,
      }
      const res = await fetch(
        `${API_URL}/usuarios/${selectedUsuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.detail ?? res.statusText)
      }
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === selectedUsuario.id ? { id: u.id, ...formData } : u
        )
      )
      setIsFormOpen(false)
      setSelectedUsuario(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // DELETE
  const handleDeleteUsuario = async (id: number) => {
    if (!canModify || !confirm("Tem certeza que deseja excluir este usuário?")) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token") ?? ""
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.detail ?? res.statusText)
      }
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const openEditForm = (u: Usuario) => {
    if (!canModify) return
    setSelectedUsuario(u)
    setIsFormOpen(true)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8">
        <div className="bg-white rounded-md shadow-sm p-6 max-w-5xl mx-auto">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0e2a47]">Usuários</h1>
              <p className="text-sm text-gray-500">
                Controle e administração de usuários do núcleo
              </p>
            </div>
            {canModify && (
              <Button
                onClick={() => {
                  setSelectedUsuario(null)
                  setIsFormOpen(true)
                }}
                className="group gap-2 bg-slate-800 text-white hover:bg-slate-900"
              >
                <Plus
                  size={18}
                  className="transition-transform group-hover:rotate-45"
                />
                Novo Usuário
              </Button>
            )}
          </div>

          {/* filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative w-full md:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <Input
                placeholder="Pesquisar..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="pl-10"
              />
            </div>
            <CustomDropdown
              options={[
                { label: "A–Z", value: "az" },
                { label: "Z–A", value: "za" },
              ]}
              value={ordenacao}
              onChange={(v) => setOrdenacao(v as Ordenacao)}
              label="Ordenar por"
              width="w-56"
            />
          </div>

          {/* loading / error */}
          {loading && <p className="text-center py-10">Carregando…</p>}
          {error && <p className="text-center py-10 text-red-600">{error}</p>}

          {/* tabela */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <Th Icon={User} text="Nome" />
                    <Th Icon={BookOpen} text="Curso" />
                    <Th Icon={Users} text="Turma" />
                    <Th Icon={Building} text="Núcleo" />
                    <Th Icon={Briefcase} text="Role" />
                    <Th Icon={Mail} text="Email" />
                    {canModify && <th className="px-4 py-2 text-left border-b">Ações</th>}
                    {canModify && <th className="px-4 py-2 text-left border-b">Excluir</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <Td>{u.nome}</Td>
                        <Td>{u.curso}</Td>
                        <Td>{u.turma}</Td>
                        <Td>{u.nucleo}</Td>
                        <Td>{u.role}</Td>
                        <Td>{u.email}</Td>
                        {canModify && (
                          <>
                            <Td>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditForm(u)}
                              >
                                Editar
                              </Button>
                            </Td>
                            <Td>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUsuario(u.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </Td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* paginação */}
          {!loading && !error && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                Itens por pág: {itemsPerPage} |{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredUsuarios.length
                )}
                -
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredUsuarios.length
                )}{" "}
                de {filteredUsuarios.length}
              </span>
              <div className="flex items-center gap-2">
                <PagerButton
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </PagerButton>
                <PagerButton
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </PagerButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* modal/form */}
      <NovoUsuarioForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setSelectedUsuario(null)
        }}
        onSubmit={selectedUsuario ? handleUpdateUsuario : handleAddUsuario}
        initialData={selectedUsuario ?? undefined}
      />
    </div>
  )
}

function Th({ Icon, text }: { Icon: any; text: string }) {
  return (
    <th className="px-4 py-2 text-left border-b">
      <div className="flex items-center gap-1">
        <Icon size={16} />
        {text}
      </div>
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 border-b">{children}</td>
}

function PagerButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <Button variant="outline" size="icon" className="h-8 w-8" {...props} />
  )
}
