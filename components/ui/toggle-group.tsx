"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
})

type ToggleGroupPropsBase = Omit<ToggleGroupPrimitive.Props, "value" | "onValueChange" | "defaultValue" | "multiple"> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }

type ToggleGroupPropsSingle = ToggleGroupPropsBase & {
  type?: "single"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type ToggleGroupPropsMultiple = ToggleGroupPropsBase & {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ToggleGroupProps = ToggleGroupPropsSingle | ToggleGroupPropsMultiple

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  ...props
}: ToggleGroupProps) {
  const isMultiple = type === "multiple"
  
  // Convert single mode value (string) to array format expected by Base UI
  const baseValue = React.useMemo(() => {
    if (value === undefined) return undefined
    if (isMultiple) {
      return Array.isArray(value) ? value : []
    } else {
      // Single mode: convert string to array or empty array
      return typeof value === "string" ? [value] : (Array.isArray(value) ? value : [])
    }
  }, [value, isMultiple])

  const baseDefaultValue = React.useMemo(() => {
    if (defaultValue === undefined) return undefined
    if (isMultiple) {
      return Array.isArray(defaultValue) ? defaultValue : []
    } else {
      // Single mode: convert string to array or empty array
      return typeof defaultValue === "string" ? [defaultValue] : (Array.isArray(defaultValue) ? defaultValue : [])
    }
  }, [defaultValue, isMultiple])

  const handleValueChange = React.useCallback((newValue: string[]) => {
    if (onValueChange) {
      if (isMultiple) {
        // TypeScript knows onValueChange expects string[] when isMultiple is true
        ;(onValueChange as (value: string[]) => void)(newValue)
      } else {
        // TypeScript knows onValueChange expects string when isMultiple is false
        ;(onValueChange as (value: string) => void)(newValue[0] || "")
      }
    }
  }, [onValueChange, isMultiple])

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "rounded-md data-[size=sm]:rounded-[min(var(--radius-md),8px)] group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className
      )}
      multiple={isMultiple}
      value={baseValue}
      defaultValue={baseDefaultValue}
      onValueChange={handleValueChange}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
