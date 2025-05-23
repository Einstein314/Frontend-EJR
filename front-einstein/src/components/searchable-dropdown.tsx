"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"

interface SearchableDropdownProps {
  options?: string[]                // agora opcional
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}

export function SearchableDropdown({
  options = [],                     // valor padrão
  value,
  onChange,
  placeholder = "Selecione uma opção",
  id,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value || "")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sincroniza searchTerm quando value muda
  useEffect(() => {
    setSearchTerm(value || "")
  }, [value])

  // Faz o filtro de forma segura
  const filteredOptions = options
    .filter((opt): opt is string => typeof opt === "string")
    .filter((opt) =>
      opt.toLowerCase().includes((searchTerm || "").toLowerCase())
    )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleOptionClick = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange("")
    setSearchTerm("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 mr-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <div
                key={idx}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">Nenhum resultado encontrado</div>
          )}
        </div>
      )}
    </div>
  )
}
