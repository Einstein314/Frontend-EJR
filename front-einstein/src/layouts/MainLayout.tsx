import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(false)

  const toggleSidebar = () => setShowSidebar(!showSidebar)

  return (
    <div className="flex h-screen">
      {/* Sidebar com posição fixa */}
      {showSidebar && (
        <div className="fixed top-0 left-0 z-50">
          <Sidebar onClose={toggleSidebar} />
        </div>
      )}

      {/* Conteúdo principal com margem lateral condicional */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showSidebar ? 'pl-64' : ''}`}>
        {/* Header só aparece quando o sidebar está fechado */}
        <div className="h-16">
          <AnimatePresence mode="wait">
            {!showSidebar && <Header toggleSidebar={toggleSidebar} key="header" />}
          </AnimatePresence>
        </div>

        {/* Área de conteúdo scrollável */}
        <main className="p-4 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
