"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Bell } from "lucide-react";
import { format as formatDate } from "date-fns";
import { API_URL } from "../config";

const FlipDigit = memo(({ value }: { value: string }) => (
  <div className="
    relative w-12 h-16 flex items-center justify-center
    bg-[#0e2a47]
    rounded-xl
    shadow-lg
    text-white font-mono text-4xl
  ">
    {value}
  </div>
));

const FlipClock = ({ timeStr }: { timeStr: string }) => {
  const [hours, minutes] = timeStr.split(":");
  return (
    <div className="flex items-end gap-4">
      <div className="flex gap-2">
        {hours.split("").map((c, i) => (
          <FlipDigit key={i} value={c} />
        ))}
      </div>
      <div className="text-[#0e2a47] text-3xl font-bold">:</div>
      <div className="flex gap-2">
        {minutes.split("").map((c, i) => (
          <FlipDigit key={i} value={c} />
        ))}
      </div>
    </div>
  );
};

export default function PontoDigital() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState(new Date());
  const [comment, setComment] = useState("");
  const [documentLink, setDocumentLink] = useState("");

  // Atualiza relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Carrega estado do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clock_in_time");
    if (stored) {
      const parsed = new Date(stored);
      setClockInTime(parsed);
      setIsClockedIn(true);
      setElapsed(Date.now() - parsed.getTime());
    }
  }, []);

  // Atualiza elapsed time
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (isClockedIn && clockInTime) {
      iv = setInterval(() => {
        setElapsed(Date.now() - clockInTime.getTime());
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [isClockedIn, clockInTime]);

  // Formata horas e minutos
  const format = (d: Date | number) => {
    let h: number, m: number;
    if (d instanceof Date) {
      h = d.getHours();
      m = d.getMinutes();
    } else {
      const s = Math.floor(d / 1000);
      h = Math.floor(s / 3600);
      m = Math.floor((s % 3600) / 60);
    }
    return [h, m].map((u) => String(u).padStart(2, "0")).join(":");
  };

  // Registrar entrada
  const handleIn = () => {
    const now = new Date();
    setClockInTime(now);
    setIsClockedIn(true);
    setElapsed(0);
    localStorage.setItem("clock_in_time", now.toISOString());
  };

  // Registrar saída
  const handleOut = async () => {
    if (!clockInTime) {
      alert("Não há hora de entrada registrada");
      return;
    }
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      alert("Informações de autenticação não encontradas");
      return;
    }

    // Formata datas no horário local (sem deslocamento UTC)
    const entradaLocal = formatDate(clockInTime, "yyyy-MM-dd'T'HH:mm:ss");
    const saidaLocal = formatDate(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

    const payload = {
      data: entradaLocal,
      hora_entrada: entradaLocal,
      hora_saida: saidaLocal,
      comentario: comment,
      documento: documentLink,
      user_id: parseInt(userId, 10),
    };

    try {
      const res = await fetch(`${API_URL}/pontos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao registrar ponto");
      }
      alert("Ponto registrado com sucesso!");
      // Reset
      setIsClockedIn(false);
      setClockInTime(null);
      setComment("");
      setDocumentLink("");
      setElapsed(0);
      localStorage.removeItem("clock_in_time");
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="
        w-full max-w-3xl p-8
        bg-white/90 dark:bg-slate-900/80
        rounded-3xl
        shadow-2xl
        space-y-8
      ">
        <h1 className="text-2xl font-bold text-[#0e2a47] dark:text-slate-100 flex items-center gap-2">
          <Bell /> Ponto Digital
        </h1>

        {!isClockedIn ? (
          <div className="flex flex-col items-center gap-6">
            <FlipClock timeStr={format(now)} />
            <button
              onClick={handleIn}
              className="
                px-6 py-2 rounded-full
                bg-[#0e2a47] hover:bg-[#3a5a77]
                text-white font-semibold
                shadow-lg
                transition-colors
              "
            >
              Registrar Entrada
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <FlipClock timeStr={format(now)} />
              <span className="text-[#0e2a47] dark:text-slate-400">Hora Atual</span>
              <FlipClock timeStr={format(elapsed)} />
              <span className="text-[#0e2a47] dark:text-slate-400">Tempo Trabalhado</span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Link do documento (ex: Google Docs)"
                value={documentLink}
                onChange={(e) => setDocumentLink(e.target.value)}
                className="
                  w-full p-3
                  bg-slate-100 dark:bg-slate-800
                  rounded-xl border border-[#0e2a47]
                  text-gray-800 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-[#3a5a77]
                "
              />
              <textarea
                placeholder="Comentário (opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="
                  w-full h-24 p-3
                  bg-slate-100 dark:bg-slate-800
                  rounded-xl
                  border border-[#0e2a47]
                  text-gray-800 dark:text-gray-100
                  resize-none
                  focus:outline-none focus:ring-2 focus:ring-[#3a5a77]
                "
              />
              <button
                onClick={handleOut}
                className="
                  self-end px-6 py-2
                  bg-[#0e2a47] hover:bg-[#3a5a77]
                  text-white font-semibold
                  rounded-full
                  shadow-lg
                  transition-colors
                "
              >
                Registrar Saída
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
