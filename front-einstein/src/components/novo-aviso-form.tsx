"use client"

import * as React from "react"
import { ArrowLeft, Calendar, FileText, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { API_URL } from "../config";

interface NovoAvisoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NovoAvisoForm({ open, onOpenChange }: NovoAvisoFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const FormContent = ({ className }: React.ComponentProps<"div">) => {
    const [formData, setFormData] = React.useState({
      titulo: "",
      data: "",
      texto: "",
      detalhes: "",
    })

    const [loading, setLoading] = React.useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/avisos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(formData),
        })

        if (!res.ok) {
          const error = await res.json()
          console.error("Erro ao criar aviso:", error)
          alert("Erro ao criar aviso")
          return
        }

        alert("Aviso criado com sucesso")
        setFormData({ titulo: "", data: "", texto: "", detalhes: "" })
        onOpenChange(false)
      } catch (error) {
        console.error("Erro na requisição:", error)
        alert("Erro ao conectar ao servidor")
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className={cn("", className)}>
        <form onSubmit={handleSubmit} className="bg-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-[#1e2b50] mb-1 font-medium text-sm">
                Título <FileText className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Input
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="bg-white border-none"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-[#1e2b50] mb-1 font-medium text-sm">
                Data <Calendar className="inline-block h-4 w-4 text-gray-500" />
              </label>
              <Input
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                className="bg-white border-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#1e2b50] mb-1 font-medium text-sm">
              Texto <FileText className="inline-block h-4 w-4 text-gray-500" />
            </label>
            <Input
              name="texto"
              value={formData.texto}
              onChange={handleChange}
              className="bg-white border-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[#1e2b50] mb-1 font-medium text-sm">
              Detalhes <Info className="inline-block h-4 w-4 text-gray-500" />
            </label>
            <Textarea
              name="detalhes"
              value={formData.detalhes}
              onChange={handleChange}
              className="bg-white border-none min-h-[80px]"
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-[#1e2b50] hover:bg-[#253767] text-white font-medium px-8"
              disabled={loading}
            >
              {loading ? "Enviando..." : "CRIAR"}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-gray-200 border-none shadow-xl">
          <DialogHeader className="p-4 flex flex-row items-center space-y-0">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-[#1e2b50] font-bold">NOVO AVISO</DialogTitle>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center border-b pb-2">
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </DrawerClose>
          <DrawerTitle className="text-[#1e2b50] font-bold">NOVO AVISO</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2">
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
