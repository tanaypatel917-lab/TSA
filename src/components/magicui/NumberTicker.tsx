"use client"

import { useEffect, useState, type ComponentPropsWithoutRef } from "react"
import { useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const reduced = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)
  useEffect(() => {
    if (reduced) {
      setDisplayValue(value)
      return
    }

    const timer = window.setTimeout(() => setDisplayValue(value), delay * 1000 + 100)
    return () => {
      window.clearTimeout(timer)
    }
  }, [delay, direction, reduced, startValue, value])

  return (
    <span
      className={cn(
        "inline-block tracking-wider tabular-nums",
        className
      )}
      {...props}
    >
      {Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(displayValue.toFixed(decimalPlaces)))}
    </span>
  )
}
