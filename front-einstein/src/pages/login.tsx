"use client"

import type { JSX } from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import bgi from "../assets/backgroundlogin.jpeg"
import logoEinstein from "../assets/i.png"
import "../index.css"
import { API_URL } from "../config"

interface TokenResponse {
  access_token: string
  token_type: string
}

function Login(): JSX.Element {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/usuarios/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      })

      if (!res.ok) {
        const msg = (await res.json())?.detail ?? res.statusText
        throw new Error(msg)
      }

      const json = await res.json()
      const { access_token, user } = json as TokenResponse & { user: any }
      localStorage.setItem("token", access_token)
      localStorage.setItem("user_id", String(user.id))
      localStorage.setItem("user_nucleo", user.nucleo)
      localStorage.setItem("user_role", user.role)

      navigate("/avisos", { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bgi}
          alt="Background"
          className="w-full h-full object-cover filter blur-sm brightness-75"
        />
      </div>

      {/* Conteúdo acima do fundo */}
      <div className="relative z-10 flex items-center justify-center h-full w-full">
        {/* Animação de “saltada” */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white bg-opacity-95 rounded-xl shadow-md w-full max-w-sm px-8 py-6"
        >
          {/* Logo + Título */}
          <div className="flex flex-row items-center justify-center gap-4 mb-6">
            <img
              src={logoEinstein || "/placeholder.svg"}
              alt="Einstein Jr"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-2xl text-[#083D77]">
              <span className="poppins-bold">EINSTEIN</span>{" "}
              <span className="poppins-regular">JR</span>
            </h1>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de usuário
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#083D77] text-white py-2 rounded-md font-semibold hover:bg-[#416B98] transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <Link
              to="/esqueci-senha"
              className="text-sm text-[#083D77] text-center hover:underline"
            >
              Esqueci minha senha
            </Link>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
