import { motion } from 'framer-motion'
import logo from '../assets/logo2.png'

type Props = {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: Props) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-16 bg-[#15304F] text-white flex items-center justify-between px-4 shadow-md"
    >
      {/* Menu button with pointer cursor */}
      <button onClick={toggleSidebar} className="text-2xl cursor-pointer">
        &#9776;
      </button>

      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <span className="text-lg md:text-xl font-inter">Einstein Jr</span>
        <img src={logo} alt="Logo" className="h-16 w-auto" />
      </div>
    </motion.header>
  )
}