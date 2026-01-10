"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: SelectPrimitive.Value.Props & {
  placeholder?: string
}) {
  const content = React.useMemo(() => {
    if (!placeholder) return children

    const childFn =
      typeof children === "function"
        ? (children as (value: unknown) => React.ReactNode)
        : undefined

    const childNode = typeof children === "function" ? undefined : children

    return (value: unknown) => {
      const rendered = childFn ? childFn(value) : childNode
      if (rendered != null) return rendered

      if (value == null) return placeholder

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "bigint"
      ) {
        return String(value)
      }

      return placeholder
    }
  }, [children, placeholder])

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left text-[#222]", className)}
      {...props}
    >
      {content}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Windows 7 theme: gradient background, classic border, proper hover states
        "bg-gradient-to-b from-[#f2f2f2] via-[#ebebeb] to-[#cfcfcf]",
        "border border-[#8e8f8f] rounded-[3px]",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]",
        "hover:border-[#3c7fb1] hover:bg-gradient-to-b hover:from-[#eaf6fd] hover:via-[#bee6fd] hover:to-[#a7d9f5]",
        "focus-visible:shadow-[inset_0_0_0_2px_#98d1ef] focus-visible:outline focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-black focus-visible:-outline-offset-4",
        "active:border-[#6d91ab] active:shadow-[inset_1px_1px_0_rgba(0,0,0,0.2),inset_-1px_1px_0_rgba(0,0,0,0.07)]",
        "active:bg-gradient-to-b active:from-[#e5f4fc] active:via-[#98d1ef] active:to-[#68b3db]",
        "text-[#222] text-xs/relaxed gap-1.5 px-2 py-1.5",
        "data-[size=default]:h-7 data-[size=sm]:h-6",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5",
        "[&_svg:not([class*='size-'])]:size-3.5 flex w-fit items-center justify-between whitespace-nowrap outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f4f4f4] disabled:border-[#adb2b5] disabled:text-[#838383]",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "transition-all duration-100",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-[#555] size-3.5 pointer-events-none" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            // Windows 7 theme: white background, classic border, subtle shadow
            "bg-[#f0f0f0] text-[#222] border border-[#0006] shadow-[4px_4px_3px_-2px_rgba(0,0,0,0.5)]",
            "min-w-32 rounded-[0px] p-[2px]",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "duration-100 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto",
            // Override all child item hover/focus states with Windows 7 blue
            "[&_[data-slot=select-item]:hover]:!bg-[linear-gradient(rgba(255,255,255,0.6),rgba(230,236,245,0.8)_90%,rgba(255,255,255,0.8))]",
            "[&_[data-slot=select-item]:hover]:!border-[#aaddfa]",
            "[&_[data-slot=select-item]:hover]:!shadow-[0_0_0_1px_#b3d3f9]",
            "[&_[data-slot=select-item]:hover]:!text-[#222]",
            "[&_[data-slot=select-item]:focus]:!bg-[linear-gradient(rgba(255,255,255,0.6),rgba(230,236,245,0.8)_90%,rgba(255,255,255,0.8))]",
            "[&_[data-slot=select-item]:focus]:!border-[#aaddfa]",
            "[&_[data-slot=select-item][data-highlighted]]:!bg-[linear-gradient(rgba(255,255,255,0.6),rgba(230,236,245,0.8)_90%,rgba(255,255,255,0.8))]",
            "[&_[data-slot=select-item][data-highlighted]]:!border-[#aaddfa]",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-[#666] px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Base styles - using CSS variables from win7-dashboard.css
        "min-h-6 gap-2 rounded-[3px] px-2 py-[2px] text-xs/relaxed",
        "text-[var(--w7-el-c,#222)] border border-transparent",
        "[&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        "relative flex w-full cursor-default items-center select-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      style={{
        // Use CSS variables inline to override any global styles
        // These are from design-docs/gui/_variables.scss
        "--item-bg-hl": "linear-gradient(rgba(255,255,255,0.6), rgba(230,236,245,0.8) 90%, rgba(255,255,255,0.8))",
        "--item-bd-hl": "#aaddfa",
      } as React.CSSProperties}
      // Use onMouseEnter/onFocus to apply styles that override globals
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "var(--item-bg-hl)"
        el.style.borderColor = "var(--item-bd-hl)"
        el.style.boxShadow = "0 0 0 1px #b3d3f9"
        el.style.color = "#222"
        el.style.outline = "none"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = ""
        el.style.borderColor = "transparent"
        el.style.boxShadow = ""
      }}
      onFocus={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "var(--item-bg-hl)"
        el.style.borderColor = "var(--item-bd-hl)"
        el.style.boxShadow = "0 0 0 1px #b3d3f9"
        el.style.color = "#222"
        el.style.outline = "none"
      }}
      onBlur={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = ""
        el.style.borderColor = "transparent"
        el.style.boxShadow = ""
      }}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute right-2 flex items-center justify-center" />}
      >
        <CheckIcon className="pointer-events-none text-[#222]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-[#d0d0d0] -mx-1 my-1 h-px pointer-events-none shadow-[inset_0_-1px_#fff]", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn("bg-white z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5 top-0 w-full text-[#555] hover:bg-[#eaf6fd]", className)}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn("bg-white z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5 bottom-0 w-full text-[#555] hover:bg-[#eaf6fd]", className)}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
