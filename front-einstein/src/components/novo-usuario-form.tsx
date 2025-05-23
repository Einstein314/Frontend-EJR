"use client"

import * as React from "react"
import {
  ArrowLeft,
  User,
  BookOpen,
  Users,
  Building,
  Briefcase,
  Mail,
  Lock,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Usuario {
  id: number
  nome: string
  curso: string
  turma: string
  nucleo: string
  role: string
  email: string
}

interface NovoUsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Usuario, "id"> & { password?: string }) => void
  initialData?: Omit<Usuario, "id">
}

export function NovoUsuarioForm({ open, onOpenChange, onSubmit, initialData }: NovoUsuarioFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const FormContent = ({ className }: React.ComponentProps<"div">) => {
    const userNucleo = React.useMemo(() => localStorage.getItem("user_nucleo") ?? "", [])

    const [formData, setFormData] = React.useState({
      nome: "",
      curso: "",
      turma: "",
      nucleo: userNucleo,
      role: "membro",
      email: "",
      password: "",
    })

    React.useEffect(() => {
      if (initialData) {
        setFormData({
          nome: initialData.nome,
          curso: initialData.curso,
          turma: initialData.turma,
          nucleo: userNucleo,
          role: initialData.role,
          email: initialData.email,
          password: "",
        })
      } else {
        setFormData(prev => ({
          ...prev,
          nucleo: userNucleo,
          password: "",
        }))
      }
    }, [initialData, userNucleo])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
      onOpenChange(false)
    }

    return (
      <div className={cn("", className)}>
        <form onSubmit={handleSubmit} className="rounded-lg p-4 space-y-4 bg-gray-100">
          <div className="relative">
            <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
              Nome <User className="inline-block h-4 w-4 text-gray-500" />
            </label>
            <Input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="bg-white border-gray-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
                Curso <BookOpen className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Input
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                className="bg-white border-gray-200"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
                Turma <Users className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Input
                name="turma"
                value={formData.turma}
                onChange={handleChange}
                className="bg-white border-gray-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
                Núcleo <Building className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Select
                value={formData.nucleo}
                onValueChange={value => handleSelectChange("nucleo", value)}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {localStorage.getItem("user_role") === "presidente" ? (
                      <>
                        <SelectItem value="Administração">Administração</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Projetos">Projetos</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </>
                    ) : (
                      <SelectItem value={userNucleo}>{userNucleo}</SelectItem>
                    )}
                  </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
                Role <Briefcase className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Select
                value={formData.role}
                onValueChange={value => handleSelectChange("role", value)}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Selecione o role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  {localStorage.getItem("user_role") === "presidente" && (
                    <>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="conselheiro">Conselheiro</SelectItem>
                      <SelectItem value="presidente">Presidente</SelectItem>
                    </>
                  )}
                </SelectContent>

              </Select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
              Email <Mail className="inline-block h-4 w-4 text-gray-500" />
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-white border-gray-200"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-[#0e2a47] mb-1 font-medium text-sm">
              Senha <Lock className="inline-block h-4 w-4 text-gray-500" />
            </label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="bg-white border-gray-200"
              required={!initialData}
            />
          </div>

          <div className="flex justify-center mt-6">
            <Button type="submit" className="bg-[#0e2a47] hover:bg-[#1a3c5e] text-white font-medium px-8">
              {initialData ? "SALVAR" : "CRIAR"}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-gray-100 border-none shadow-xl">
          <DialogHeader className="p-4 flex flex-row items-center space-y-0 border-b">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-[#0e2a47] font-bold">{initialData ? "EDITAR USUÁRIO" : "ADICIONAR USUÁRIO"}</DialogTitle>
          </DialogHeader>
          <FormContent className="bg-gray-100" />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gray-100">
        <DrawerHeader className="flex flex-row items-center border-b pb-2">
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </DrawerClose>
          <DrawerTitle className="text-[#0e2a47] font-bold">{initialData ? "EDITAR USUÁRIO" : "ADICIONAR USUÁRIO"}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2 bg-gray-100">
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
