import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import bgImage from "../assets/bg.png"
import logoEinstein from "../assets/logo-einstein.png"
import { toast, Toaster } from 'sonner'
import { API_URL } from "../config";

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: Token, 3: New Password

  const navigate = useNavigate()

  // Envia pedido de redefinição de senha
  const handleRequestToken = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/usuarios/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        toast.success('Token enviado! Verifique seu e-mail.')
        setStep(2)
      } else {
        toast.error('Falha ao enviar token.')
      }
    } catch (err) {
      toast.error('Erro de rede ao enviar token.')
    }
  }

  // Avança para definir nova senha (pode incluir verificação adicional)
  const handleVerifyToken = (e) => {
    e.preventDefault()
    setStep(3)
  }

  // Redefine a senha usando token
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem.')
      return
    }

    try {
      const res = await fetch(`${API_URL}/usuarios/reset-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      })
      if (res.ok) {
        toast.success('Senha redefinida com sucesso!')
        navigate('/login')
      } else {
        const data = await res.json()
        toast.error(data.detail || 'Falha ao redefinir senha.')
      }
    } catch (err) {
      toast.error('Erro de rede ao redefinir senha.')
    }
  }

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Toaster position="top-right" />
      <div className="bg-white bg-opacity-95 rounded-xl shadow-md w-full max-w-sm px-8 py-6">
        {/* Logo + Título */}
        <div className="flex flex-row items-center justify-center gap-4 mb-6">
          <div className="bg-[#002E6D] w-14 h-14 flex items-center justify-center rounded-full">
            <img src={logoEinstein} alt="Einstein Jr" className="w-8" />
          </div>
          <h1 className="text-2xl text-[#002E6D]">
            <span className="poppins-bold">EINSTEIN</span> <span className="poppins-regular">JR</span>
          </h1>
        </div>

        <h2 className="text-xl text-center text-[#002E6D] font-semibold mb-6">Recuperação de Senha</h2>

        {/* Step 1: Email Entry */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#004AAD] text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Enviar Token
            </button>
          </form>
        )}

        {/* Step 2: Token Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyToken} className="flex flex-col gap-4">
            <p className="text-sm text-green-600 mb-4">
              Token enviado para seu email.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token de Verificação</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#004AAD] text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Verificar Token
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#004AAD] py-2 rounded-md font-semibold hover:underline transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-green-600 mb-4">Token verificado. Defina sua nova senha.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#004AAD] text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Redefinir Senha
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[#004AAD] py-2 rounded-md font-semibold hover:underline transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;