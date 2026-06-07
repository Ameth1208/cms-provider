import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Price Formatting Utilities ───

const DEFAULT_CURRENCY = 'COP'

interface FormatPriceOptions {
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showSymbol?: boolean
}

/**
 * Format a number as currency for display
 * Examples:
 *   formatPrice(129900) => "$129.900"
 *   formatPrice(129900.50) => "$129.900,50"
 */
export function formatPrice(
  value: number | null | undefined,
  options: FormatPriceOptions = {}
): string {
  if (value == null || isNaN(value)) return '$0'

  const {
    currency = DEFAULT_CURRENCY,
    locale = 'es-CO',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  })

  const formatted = formatter.format(value)

  if (!showSymbol) {
    return formatted.replace(/[^\d.,\s]/g, '').trim()
  }

  return formatted
}

/**
 * Format price for input fields (plain number with separators)
 * Example: formatPriceInput(129900) => "129.900"
 */
export function formatPriceInput(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return ''
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Parse a formatted price string back to number
 * Examples:
 *   parsePriceInput("129.900") => 129900
 *   parsePriceInput("$129,900.50") => 129900.50
 */
export function parsePriceInput(value: string): number {
  if (!value) return 0
  // Remove currency symbols and whitespace
  const clean = value.replace(/[$\s]/g, '')
  // Handle both dot (thousands) and comma (decimal) separators
  // Colombian format: 129.900,50
  // US format: 129,900.50
  if (clean.includes(',') && clean.includes('.')) {
    // Determine which is the decimal separator (last one)
    const lastDot = clean.lastIndexOf('.')
    const lastComma = clean.lastIndexOf(',')
    if (lastComma > lastDot) {
      // European format: 129.900,50
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'))
    } else {
      // US format: 129,900.50
      return parseFloat(clean.replace(/,/g, ''))
    }
  } else if (clean.includes(',')) {
    // Could be decimal separator or thousands separator
    // If only one comma and it's followed by 1-2 digits at the end, it's decimal
    const match = clean.match(/^\d+,\d{1,2}$/)
    if (match) {
      return parseFloat(clean.replace(',', '.'))
    }
    // Otherwise it's thousands separator
    return parseFloat(clean.replace(/,/g, ''))
  } else if (clean.includes('.')) {
    // Same logic for dots
    const match = clean.match(/^\d+\.\d{1,2}$/)
    if (match) {
      return parseFloat(clean)
    }
    return parseFloat(clean.replace(/\./g, ''))
  }
  return parseFloat(clean) || 0
}

/**
 * Hook-friendly price input handler
 * Returns formatted string and numeric value
 */
export function handlePriceInput(value: string): { formatted: string; numeric: number } {
  const numeric = parsePriceInput(value)
  const formatted = formatPriceInput(numeric)
  return { formatted, numeric }
}

// ─── Date Formatting Utilities ───

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}
