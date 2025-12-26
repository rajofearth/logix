"use client"

import * as React from "react"
import { Laptop, Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThemeValue = "light" | "dark" | "system"

function ThemeIcon({ value }: { value: ThemeValue }) {
  if (value === "light") return <Sun className="size-4" />
  if (value === "dark") return <Moon className="size-4" />
  return <Laptop className="size-4" />
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const current = (mounted ? theme : undefined) as ThemeValue | undefined
  const label = mounted ? (current ?? "system") : "system"
  const iconValue = mounted
    ? (((theme === "system" ? resolvedTheme : theme) ?? "system") as ThemeValue)
    : "system"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
          aria-label="Toggle theme"
        >
          {mounted ? <ThemeIcon value={iconValue} /> : <SunMoon className="size-4" />}
          <span className="sr-only">Theme: {label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


