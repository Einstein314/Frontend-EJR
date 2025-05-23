import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Bell,
  Layers,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  LogOut,
  MessageSquare,
} from 'lucide-react'

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // 1. Pega o cargo do usuário (ou 'default' se não existir)
  const role = localStorage.getItem('user_role') || 'default'
  console.log('Cargo do usuário:', role)

  // 2. Declara todas as possíveis rotas
  const navItems: {
    to: string
    label: string
    Icon: React.ElementType
  }[] = [
    { to: '/ponto-digital',      label: 'Ponto Digital',       Icon: LayoutDashboard },
    { to: '/avisos',             label: 'Avisos',              Icon: Bell            },
    { to: '/organizacao',        label: 'Organização',         Icon: Layers          },
    { to: '/desempenho',         label: 'Desempenho',          Icon: TrendingUp      },
    { to: '/usuarios',           label: 'Usuários',            Icon: Users           },
    { to: '/documentos',         label: 'Documentos',          Icon: FileText        },
    { to: '/calendar',           label: 'Calendário',          Icon: Calendar        },
    { to: '/avaliacao-formativa',label: 'Feedback', Icon: FileText        },
    { to: '/feedback',           label: 'Meus Feedbacks',            Icon: MessageSquare   },
    { to: '/documentos-membro',  label: 'Documentos',   Icon: FileText        },
  ]

  // 3. Filtra conforme o cargo
  let filteredItems = navItems
  if (role === 'membro') {
    filteredItems = navItems.filter(item =>
      ['/avisos','/ponto-digital','/organizacao','/desempenho','/calendar', '/documentos-membro', '/avaliacao-formativa', '/feedback']
        .includes(item.to)
    )
  } else if (role === 'diretor') {
    filteredItems = navItems.filter(item =>
      ['/avisos','/organizacao','/usuarios','/documentos','/calendar','/avaliacao-formativa', "/feedback"]
        .includes(item.to)
    )
  }
  else if (role === 'presidente' || role === 'conselheiro') {
    filteredItems = navItems.filter(item =>
      ['/avisos','/usuarios','/calendar', '/organizacao']
        .includes(item.to)
    )
  }
  // else 'default' ou outros cargos: mantém todas as abas

  // 4. Componente genérico de item
  const Item = ({
    to,
    label,
    Icon,
  }: {
    to: string
    label: string
    Icon: React.ElementType
  }) => (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center gap-3 px-2 py-1 rounded-md transition-colors hover:bg-white/10 ${
        pathname === to ? 'font-semibold bg-white/10' : ''
      }`}
    >
      <Icon size={20} />
      {label}
    </Link>
  )

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 w-64 h-full bg-[#15304F] text-white shadow-lg z-50"
    >
      <div className="p-4 flex flex-col h-full">
        <button
          onClick={onClose}
          className="text-white text-2xl mb-6 ml-auto cursor-pointer focus:outline-none"
          aria-label="Fechar menu lateral"
        >
          &#10005;
        </button>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 text-[17px]">
          {filteredItems.map(item => (
            <Item key={item.to} to={item.to} label={item.label} Icon={item.Icon} />
          ))}

          <hr className="border-white/20 my-2" />

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem('token')
              onClose()
              navigate('/login', { replace: true })
            }}
            className="flex items-center gap-3 px-2 py-1 rounded-md transition-colors hover:bg-white/10"
          >
            <LogOut size={20} />
            Sair
          </button>
        </nav>

        <div className="mt-auto text-xs opacity-70">
          © {new Date().getFullYear()} Einstein Jr
        </div>
      </div>
    </motion.div>
  )
}
