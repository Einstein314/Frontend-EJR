"use client";

import { useState, useEffect, useRef } from "react";
import { differenceInMinutes } from "date-fns";
import { Clock, X, BarChart3, MessageSquareText } from "lucide-react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { API_URL } from "../config";



interface FeedbackItem {
  id: number;
  dia: string;
  horas: string;
  conteudo: string;
  comentarios: string;
}

interface WeekBar {
  name: string;
  totalMinutes: number;
}

interface CommentModalProps {
  open: boolean;
  comment: string;
  onClose: () => void;
}

function CommentModal({ open, comment, onClose }: CommentModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div ref={ref} className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <MessageSquareText size={18} /> Comentário
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="px-4 py-4">
          <p className="whitespace-pre-line rounded-md bg-slate-100 p-3 text-sm text-slate-700">
            {comment}
          </p>
        </div>
        <div className="flex justify-end border-t px-4 py-2">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

function formatHourMinute(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h${m > 0 ? `${m}m` : ""}`;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-1 text-center shadow-sm">
        {formatHourMinute(payload[0].value)}
      </div>
    );
  }
  return null;
};

function HoursRow({ label, minutes }: { label: string; minutes: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-800">{label}</span>
      <div className="mx-4 flex flex-1 items-center gap-2">
        <div className="flex-1 bg-blue-200 h-1" />
        <div className="h-1.5 w-1.5 rounded-full bg-blue-700" />
      </div>
      <span className="font-medium text-slate-800">
        {formatHourMinute(minutes)}
      </span>
    </div>
  );
}

export default function DesempenhoPage() {
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [weekData, setWeekData] = useState<WeekBar[]>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalComment, setModalComment] = useState("");

  const [minHoje, setMinHoje] = useState(0);
  const [minSemana, setMinSemana] = useState(0);
  const [minMes, setMinMes] = useState(0);
  const [minTotal, setMinTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = parseInt(localStorage.getItem("user_id") || "0", 10);

    const now = new Date();
    const hojeInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hojeFim = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const diaDaSemana = (hojeInicio.getDay() + 6) % 7; // 0=Seg...6=Dom
    const semanaInicio = new Date(hojeInicio);
    semanaInicio.setDate(hojeInicio.getDate() - diaDaSemana);
    semanaInicio.setHours(0, 0, 0, 0);

    const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1);
    mesInicio.setHours(0, 0, 0, 0);

    let total = 0,
      hojeM = 0,
      semM = 0,
      mesM = 0;
    const dias: number[] = Array(7).fill(0);

    // 1) Busca pontos
    fetch(`${API_URL}/pontos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((pontos: any[]) => {
        pontos.forEach((p) => {
          if (p.user_id !== userId) return;
          const ent = new Date(p.hora_entrada);
          const sai = new Date(p.hora_saida);
          const mins = differenceInMinutes(sai, ent);

          total += mins;

          if (ent >= hojeInicio && ent <= hojeFim) {
            hojeM += mins;
          }
          if (ent >= semanaInicio && ent <= hojeFim) {
            semM += mins;
            const idx = (ent.getDay() + 6) % 7;
            dias[idx] += mins;
          }
          if (ent >= mesInicio && ent <= hojeFim) {
            mesM += mins;
          }
        });

        const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
        setWeekData(
          labels.map((name, i) => ({ name, totalMinutes: dias[i] }))
        );

        setMinHoje(hojeM);
        setMinSemana(semM);
        setMinMes(mesM);
        setMinTotal(total);
      })
      .catch(console.error);

    // 2) Busca checks + feedbacks
    fetch(`${API_URL}/checks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((checks: any[]) =>
        Promise.all(
          checks.map(async (c) => {
            const resp = await fetch(
              `${API_URL}/pontos/${c.id_ponto}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const p = await resp.json();
            const mins = differenceInMinutes(
              new Date(p.hora_saida),
              new Date(p.hora_entrada)
            );
            return {
              id: c.id,
              dia: new Date(p.data).toLocaleDateString("pt-BR"),
              horas: formatHourMinute(mins),
              conteudo: p.aprovado ? "Aprovado" : "Reprovado",
              comentarios: c.comentario || "Sem comentários",
            } as FeedbackItem;
          })
        )
      )
      .then(setFeedbacks)
      .catch(console.error);
  }, []);

  const totalPages = Math.ceil(feedbacks.length / PER_PAGE);
  const slice = feedbacks.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4 md:px-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Desempenho</h1>

      {/* Cards de horas e gráfico */}
      <div className="grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center gap-2 pb-2">
            <Clock className="text-slate-800" />
            <div>
              <CardTitle className="text-lg">Horas Trabalhadas</CardTitle>
              <CardDescription>
                Sua produtividade em diferentes períodos
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <HoursRow label="Hoje" minutes={minHoje} />
            <HoursRow label="Semana" minutes={minSemana} />
            <HoursRow label="Mês" minutes={minMes} />
            <HoursRow label="Total" minutes={minTotal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
              <BarChart3 size={18} /> Horas na Semana
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={weekData} barCategoryGap={8}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(71,85,105,0.1)" }}
                />
                <Bar dataKey="totalMinutes" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Feedbacks */}
      <Card className="w-full max-w-7xl">
        <CardHeader>
          <CardTitle className="text-2xl">Feedback</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow>
                  <TableHead className="w-24 text-center text-white">Dia</TableHead>
                  <TableHead className="w-24 text-center text-white">Horas</TableHead>
                  <TableHead className="w-32 text-center text-white">Conteúdo</TableHead>
                  <TableHead className="w-36 text-center text-white">Ver comentário</TableHead>
                  <TableHead className="w-24 text-center text-white">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((row) => (
                  <TableRow key={row.id} className="even:bg-slate-50">
                    <TableCell className="text-center font-medium text-slate-700">
                      {row.dia}
                    </TableCell>
                    <TableCell className="text-center text-slate-700">
                      {row.horas}
                    </TableCell>
                    <TableCell className="w-32 text-center text-slate-700 truncate">
                      {row.conteudo}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="bg-slate-800 text-white hover:bg-slate-900"
                        onClick={() => {
                          setModalComment(row.comentarios);
                          setModalOpen(true);
                        }}
                      >
                        Ver comentário
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          await fetch(`${API_URL}/checks/${row.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setFeedbacks((prev) => prev.filter((f) => f.id !== row.id));
                        }}
                      >
                        Aceitar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-4">
          <span className="text-sm text-slate-600">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, feedbacks.length)} de {feedbacks.length}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <CommentModal
        open={modalOpen}
        comment={modalComment}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
