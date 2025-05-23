"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CalendarIcon, Plus, ClipboardList } from "lucide-react"
import { format } from "date-fns"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Event {
  id?: number
  data: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  local?: string
}

import { API_URL } from "../config";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function isoCombine(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)

  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [pickerDate, setPickerDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    descricao: "",
    local: "",
    horaInicio: "08:00",
    horaFim: "09:00",
  })
  const [canCreateEvent, setCanCreateEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("user_role")
    setCanCreateEvent(role !== "membro" && role !== "conselheiro")

    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/eventos`, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        })
        if (!res.ok) throw new Error("Erro ao buscar eventos")
        const data = await res.json()
        const parsed: Event[] = data.map((ev: any) => ({
          id: ev.id,
          data: ev.data,
          hora_inicio: ev.hora_inicio,
          hora_fim: ev.hora_fim,
          descricao: ev.descricao ?? undefined,
          local: ev.local ?? undefined,
        }))
        setEvents(parsed)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [selectedDate])

  const eventsOnSelectedDay = events.filter(
    (ev) => new Date(ev.data).toDateString() === selectedDate.toDateString(),
  )

  const handleCalendarSelect = (d?: Date) => {
    if (d) {
      setSelectedDate(d)
      setPickerDate(d)
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    const user_id = localStorage.getItem("user_id")
    const token = localStorage.getItem("token")
    if (!user_id || !token) {
      alert("Usuário não autenticado")
      return
    }

    const body = {
      data: isoCombine(pickerDate, "00:00"),
      hora_inicio: isoCombine(pickerDate, formData.horaInicio),
      hora_fim: isoCombine(pickerDate, formData.horaFim),
      descricao: formData.descricao || null,
      local: formData.local || null,
      user_id: Number(user_id),
    }

    try {
      const url = editingEventId ? `${API_URL}/eventos/${editingEventId}` : `${API_URL}/eventos`
      const method = editingEventId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Falha ao salvar evento")

      const returned = await res.json()

      if (editingEventId) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editingEventId ? { ...ev, ...returned } : ev))
        )
      } else {
        setEvents((prev) => [...prev, returned])
      }

      setFormData({ descricao: "", local: "", horaInicio: "08:00", horaFim: "09:00" })
      setEditingEventId(null)
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar evento. Veja o console.")
    }
  }

  const handleDeleteEvent = async (id?: number) => {
    if (!id) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/eventos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erro ao excluir evento")
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir evento. Veja o console.")
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id || null)
    setPickerDate(new Date(event.data))
    setFormData({
      descricao: event.descricao || "",
      local: event.local || "",
      horaInicio: format(new Date(event.hora_inicio), "HH:mm"),
      horaFim: format(new Date(event.hora_fim), "HH:mm"),
    })
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4 md:px-8 flex flex-col items-center gap-8">
      <Card className={`w-full ${canCreateEvent ? "max-w-7xl" : "max-w-4xl"} shadow-lg border-slate-200`}>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4">
          <div>
            <CardTitle className="text-3xl font-extrabold text-slate-800">Calendário de Eventos</CardTitle>
            <CardDescription className="text-slate-600">
              Gerencie e visualize os eventos cadastrados por data
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className={canCreateEvent ? "lg:col-span-3" : "lg:col-span-4"}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvent: (date) =>
                    events.some(
                      (ev) => new Date(ev.data).toDateString() === date.toDateString(),
                    ),
                }}
                modifiersClassNames={{ hasEvent: "bg-slate-800 text-white" }}
              />
            </div>

            <div className={canCreateEvent ? "lg:col-span-5" : "lg:col-span-8 h-[28rem] overflow-auto"}>
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <ClipboardList size={18} /> Eventos em {format(selectedDate, "dd/MM/yyyy")}
              </h2>
              {eventsOnSelectedDay.length ? (
                <ul className="space-y-3">
                  {eventsOnSelectedDay.map((ev) => (
                    <li
                      key={ev.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-800">
                            {format(new Date(ev.hora_inicio), "HH:mm")} – {format(new Date(ev.hora_fim), "HH:mm")}
                          </p>
                          {ev.descricao && <p className="text-sm text-slate-600 whitespace-pre-line">{ev.descricao}</p>}
                          {ev.local && <p className="text-xs text-slate-500 italic">Local: {ev.local}</p>}
                        </div>
                        {canCreateEvent && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditEvent(ev)} className="text-sm">
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(ev.id)} className="text-sm">
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic">Nenhum evento para esta data.</p>
              )}
            </div>

            {canCreateEvent && (
              <div className="lg:col-span-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-800 mb-4">
                  <Plus size={20} /> Adicionar Evento
                </h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickerDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickerDate ? format(pickerDate, "PPP") : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickerDate}
                          onSelect={(date) => date && setPickerDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Início</label>
                      <input
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => setFormData((f) => ({ ...f, horaInicio: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Fim</label>
                      <input
                        type="time"
                        value={formData.horaFim}
                        onChange={(e) => setFormData((f) => ({ ...f, horaFim: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData((f) => ({ ...f, descricao: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none h-20 resize-none"
                      placeholder="Descrição do evento (opcional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Local</label>
                    <input
                      type="text"
                      value={formData.local}
                      onChange={(e) => setFormData((f) => ({ ...f, local: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                      placeholder="Local do evento (opcional)"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-slate-800 text-white hover:bg-slate-900">
                    {editingEventId ? "Salvar" : "Adicionar Evento"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-end pt-6">
          <p className="text-sm text-slate-600">Total de eventos cadastrados: {events.length}</p>
        </CardFooter>
      </Card>
    </div>
  )
}