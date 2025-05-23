"use client"

import type React from "react"

import { useContext, createContext } from "react"

interface ChartContextProps {
  config: any
}

const ChartContext = createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

interface ChartContainerProps {
  config: any
  children: React.ReactNode
}

export const ChartContainer = ({ config, children }: ChartContainerProps) => {
  return <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>
}

interface ChartTooltipProps {
  content: React.ReactNode
}

export const ChartTooltip = ({ content }: ChartTooltipProps) => {
  return <>{content}</>
}

interface ChartTooltipContentProps {
  payload?: any[]
  active?: boolean
}

export const ChartTooltipContent = ({ payload, active }: ChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div>
      {payload.map((item, index) => (
        <div key={index}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  )
}
