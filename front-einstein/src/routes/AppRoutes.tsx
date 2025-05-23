// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom'

/* páginas públicas */
import Login from '../pages/login'

/* layout + guard */
import MainLayout  from '../layouts/MainLayout'
import RequireAuth from './RequireAuth.tsx'

/* páginas privadas */
import Calendar       from '../pages/Calendario'
import PontoDigital   from '../pages/PontoDigital'
import Avisos         from '../pages/Avisos'
import Organizacao    from '@/pages/Organizacao'
import Desempenho     from '@/pages/Desempenho'
import UsuariosPage   from '@/pages/Usuarios'
import DocumentosPage from '@/pages/Documentos'
import AvaliacaoFormativa from '@/pages/AvaliacaoFormativa'
import ForgotPassword from '@/pages/ForgotPassword'
import Feedback       from '@/pages/FeedbackPage'
import DocumentosMembroPage from '@/pages/DocumentosMembro.tsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* rota raiz → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />

      {/* pública */}
      <Route path="/login" element={<Login />} />

      {/* protegidas */}
      <Route element={<RequireAuth />}>
        {/* layout comum às rotas autenticadas */}
        <Route element={<MainLayout />}>
          <Route path="/calendar"              element={<Calendar />} />
          <Route path="/ponto-digital"         element={<PontoDigital />} />
          <Route path="/avisos"                element={<Avisos />} />
          <Route path="/organizacao"           element={<Organizacao />} />
          <Route path="/desempenho"            element={<Desempenho />} />
          <Route path="/usuarios"              element={<UsuariosPage />} />
          <Route path="/documentos"            element={<DocumentosPage />} />
          <Route path="/avaliacao-formativa"   element={<AvaliacaoFormativa />} />
          <Route path="/feedback"              element={<Feedback />} />
          <Route path="/documentos-membro"     element={<DocumentosMembroPage />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
