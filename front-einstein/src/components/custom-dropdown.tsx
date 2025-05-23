"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DropdownOption {
  label: string
  value: string
  checked?: boolean
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  label: string
  width?: string
}

export function CustomDropdown({ options, value, onChange, label, width = "w-56" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="flex items-center justify-between gap-2 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 ${width} rounded-md border border-gray-200 bg-white shadow-lg z-50`}>
          <div className="p-2 font-medium text-sm border-b">{label}</div>
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer ${
                  option.value === value ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center justify-center h-4 w-4">
                  {option.value === value && (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </div>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
