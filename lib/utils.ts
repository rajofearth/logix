import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates initials from a user's name
 * @param name - The user's full name
 * @returns Initials (e.g., "John Doe" -> "JD", "John" -> "JO")
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return "U"
  }

  const trimmedName = name.trim()
  const parts = trimmedName.split(/\s+/)

  if (parts.length === 1) {
    // Single name: take first two characters
    return trimmedName.substring(0, 2).toUpperCase()
  }

  // Multiple names: take first character of first and last name
  const firstInitial = parts[0]?.[0] ?? ""
  const lastInitial = parts[parts.length - 1]?.[0] ?? ""
  
  return (firstInitial + lastInitial).toUpperCase()
}
