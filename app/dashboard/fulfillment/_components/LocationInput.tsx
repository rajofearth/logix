"use client"

import * as React from "react"
import { suggestLocation, retrieveLocation } from "../_server/mapboxSearchBox"
import type { LngLat } from "@/app/dashboard/jobs/_types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Suggestion = {
  mapboxId: string
  name: string
  address: string
  coordinates?: LngLat // Optional - we'll retrieve if not available
}

type LocationInputProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  onChange: (address: string, coordinates: LngLat) => void
  proximity?: LngLat
  disabled?: boolean
}

export function LocationInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  proximity,
  disabled,
}: LocationInputProps) {
  const [query, setQuery] = React.useState(value)
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Generate UUIDv4 for session token
  const generateSessionToken = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
  
  const sessionTokenRef = React.useRef<string>(generateSessionToken())

  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync external value changes
  React.useEffect(() => {
    setQuery(value)
  }, [value])

  // Debounced search
  React.useEffect(() => {
    if (!query.trim() || query === value) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(() => {
      void (async () => {
        setIsLoading(true)
        try {
          const results = await suggestLocation(query, sessionTokenRef.current, proximity)
          setSuggestions(results)
          setIsOpen(results.length > 0)
        } catch (error) {
          console.error("Failed to fetch suggestions:", error)
          setSuggestions([])
          setIsOpen(false)
        } finally {
          setIsLoading(false)
        }
      })()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, proximity, value])

  const handleSelect = React.useCallback(
    async (suggestion: Suggestion) => {
      setIsOpen(false)
      setQuery(suggestion.address)

      try {
        let coordinates = suggestion.coordinates
        let finalAddress = suggestion.address

        // If coordinates not in suggestion, retrieve full details using the correct endpoint
        if (!coordinates) {
          try {
            const retrieved = await retrieveLocation(suggestion.mapboxId, sessionTokenRef.current)
            coordinates = retrieved.coordinates
            finalAddress = retrieved.address || suggestion.address
            setQuery(finalAddress)
          } catch (retrieveError) {
            console.error("Failed to retrieve location details:", retrieveError)
            throw new Error("Unable to get location coordinates. Please try selecting a different location or clicking on the map.")
          }
        }

        if (coordinates) {
          onChange(finalAddress, coordinates)
        } else {
          throw new Error("No coordinates available for selected location")
        }
      } catch (error) {
        console.error("Failed to process location selection:", error)
        // Reset to original value on error
        setQuery(value)
        // Re-throw to show error to user if needed
        throw error
      }
    },
    [onChange, value]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay closing to allow click on suggestion
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget?.closest('[data-suggestion-item]')) {
      return
    }
    setTimeout(() => setIsOpen(false), 200)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    void handleSelect(suggestion)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-60 overflow-auto p-1">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.mapboxId}
                  data-suggestion-item
                  onClick={() => void handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{suggestion.name}</div>
                    {suggestion.address !== suggestion.name && (
                      <div className="text-xs text-muted-foreground">{suggestion.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {isOpen && suggestions.length === 0 && !isLoading && query.trim() && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2 text-sm text-muted-foreground text-center">
              No locations found.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
